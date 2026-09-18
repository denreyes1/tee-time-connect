import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().min(1, "Last name is required").max(80),
    email: z.string().trim().email("Enter a valid email address").max(255),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    participants: z.coerce.number().int().min(1, "At least 1 participant").max(40),
    playerNames: z.string().trim().max(1000).optional().or(z.literal("")),
    comments: z.string().trim().max(2000).optional().or(z.literal("")),
    attend: z.boolean(),
    donatePrizes: z.boolean(),
    sponsorHole: z.boolean(),
    prizeDescription: z.string().trim().max(1000).optional().or(z.literal("")),
    sponsorshipNotes: z.string().trim().max(1000).optional().or(z.literal("")),
    // honeypot spam trap — must stay empty
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((v) => v.attend || v.donatePrizes || v.sponsorHole, {
    message: "Select at least one participation option",
    path: ["attend"],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) {
      // Spam bot filled the hidden field — pretend success, save nothing.
      return { ok: true as const, duplicate: false, delivery: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const row = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      company: data.company || null,
      participants: data.participants,
      player_names: data.playerNames || null,
      comments: data.comments || null,
      attend: data.attend,
      donate_prizes: data.donatePrizes,
      sponsor_hole: data.sponsorHole,
      prize_description: data.donatePrizes ? data.prizeDescription || null : null,
      sponsorship_notes: data.sponsorHole ? data.sponsorshipNotes || null : null,
    };

    const { data: inserted, error } = await supabaseAdmin
      .from("registrations")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: true as const, duplicate: true, delivery: null };
      }
      throw new Error("We couldn't save your registration. Please try again.");
    }

    const { deliverRegistrationNotifications } = await import("./notifications.server");
    const delivery = await deliverRegistrationNotifications({
      id: inserted.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      company: data.company || undefined,
      participants: data.participants,
      playerNames: data.playerNames || undefined,
      comments: data.comments || undefined,
      attend: data.attend,
      donatePrizes: data.donatePrizes,
      sponsorHole: data.sponsorHole,
      prizeDescription: data.prizeDescription || undefined,
      sponsorshipNotes: data.sponsorshipNotes || undefined,
    });

    await supabaseAdmin
      .from("registrations")
      .update({
        organizer_email_status: delivery.organizer,
        registrant_email_status: delivery.registrant,
        calendar_invite_status: delivery.calendar,
        delivery_error: delivery.error ?? null,
      })
      .eq("id", inserted.id);

    return { ok: true as const, duplicate: false, delivery };
  });

export interface RegistrationRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  participants: number;
  player_names: string | null;
  comments: string | null;
  attend: boolean;
  donate_prizes: boolean;
  sponsor_hole: boolean;
  prize_description: string | null;
  sponsorship_notes: string | null;
  organizer_email_status: string;
  registrant_email_status: string;
  calendar_invite_status: string;
  delivery_error: string | null;
}

export const listRegistrations = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({ password: String(data.password ?? "") }))
  .handler(async ({ data }) => {
    const expected = process.env["ORGANIZER_PASSWORD"];
    if (!expected) {
      throw new Error("Organizer password is not configured yet.");
    }
    if (data.password !== expected) {
      throw new Error("Incorrect password.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Could not load registrations.");
    return { registrations: (rows ?? []) as unknown as RegistrationRow[] };
  });
