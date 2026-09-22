/**
 * Delivery of the organizer email, the registrant acknowledgement, and the
 * calendar meeting invitation (RSVP).
 *
 * Configuration (server env):
 * - EMAIL_SENDER_DOMAIN — verified sender domain (e.g. notify.example.com)
 * - LOVABLE_API_KEY — messaging API key (organizer + registrant emails)
 * - RESEND_API_KEY — Resend API key (calendar ICS invite with RSVP)
 * - RESEND_FROM — From address for calendar invites (e.g. Tournament <noreply@notify.example.com>)
 * - ORGANIZER_PASSWORD — password gate for /organizer (used elsewhere)
 *
 * Registrations are always saved regardless of delivery outcome. Failed or
 * not_configured channels are recorded so the organizer can retry later.
 */

import { sendLovableEmail, EmailAPIError } from "@lovable.dev/email-js";
import { Resend } from "resend";
import { buildIcs } from "./ics";
import { tournament, formatEventDate, formatTimeRange } from "./tournament";

export type DeliveryStatus = "sent" | "failed" | "not_configured";

export interface DeliveryResult {
  organizer: DeliveryStatus;
  registrant: DeliveryStatus;
  calendar: DeliveryStatus;
  error?: string;
}

export interface RegistrationPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string | undefined;
  participants: number;
  playerNames?: string | undefined;
  comments?: string | undefined;
  attend: boolean;
  donatePrizes: boolean;
  sponsorHole: boolean;
  prizeDescription?: string | undefined;
  sponsorshipNotes?: string | undefined;
}

export interface DeliverOptions {
  /** Skip channels already marked sent (used by organizer retry). */
  skipAlreadySent?: {
    organizer?: string;
    registrant?: string;
    calendar?: string;
  };
}

function emailConfigured() {
  return Boolean(process.env["EMAIL_SENDER_DOMAIN"] && process.env["LOVABLE_API_KEY"]);
}

function calendarConfigured() {
  return Boolean(process.env["RESEND_API_KEY"] && process.env["RESEND_FROM"]);
}

function participationOptions(r: RegistrationPayload) {
  return [
    r.attend && "Attend the tournament",
    r.donatePrizes && "Donate prizes",
    r.sponsorHole && "Sponsor a hole",
  ]
    .filter(Boolean)
    .join(", ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function organizerBodies(r: RegistrationPayload) {
  const site = tournament.websiteUrl.replace(/\/$/, "");
  const lines = [
    `New registration for ${tournament.name}`,
    "",
    `Name: ${r.firstName} ${r.lastName}`,
    `Email: ${r.email}`,
    `Company: ${r.company || "—"}`,
    `Participants: ${r.participants}`,
    `Other players: ${r.playerNames || "—"}`,
    `Options: ${participationOptions(r)}`,
    `Prize description: ${r.prizeDescription || "—"}`,
    `Sponsorship notes: ${r.sponsorshipNotes || "—"}`,
    `Comments: ${r.comments || "—"}`,
    "",
    `Dashboard: ${site}/organizer`,
    "",
    "Payment is handled separately — follow up with a secure payment form.",
  ];
  const text = lines.join("\n");
  const fullName = `${r.firstName} ${r.lastName}`;
  const html = `<p><strong>New registration for ${escapeHtml(tournament.name)}</strong></p>
<ul>
<li><strong>Name:</strong> ${escapeHtml(fullName)}</li>
<li><strong>Email:</strong> ${escapeHtml(r.email)}</li>
<li><strong>Company:</strong> ${escapeHtml(r.company || "—")}</li>
<li><strong>Participants:</strong> ${r.participants}</li>
<li><strong>Other players:</strong> ${escapeHtml(r.playerNames || "—")}</li>
<li><strong>Options:</strong> ${escapeHtml(participationOptions(r))}</li>
<li><strong>Prize description:</strong> ${escapeHtml(r.prizeDescription || "—")}</li>
<li><strong>Sponsorship notes:</strong> ${escapeHtml(r.sponsorshipNotes || "—")}</li>
<li><strong>Comments:</strong> ${escapeHtml(r.comments || "—")}</li>
</ul>
<p><a href="${escapeHtml(site)}/organizer">Open organizer dashboard</a></p>
<p>Payment is handled separately — follow up with a secure payment form.</p>`;
  return { text, html };
}

function registrantBodies(r: RegistrationPayload) {
  const site = tournament.websiteUrl.replace(/\/$/, "");
  const lines = [
    `Hi ${r.firstName},`,
    "",
    `We received your registration request for ${tournament.name}.`,
    "",
    `Date: ${formatEventDate()}`,
    `Time: ${formatTimeRange()}`,
    `Course: ${tournament.courseName}`,
    `Address: ${tournament.address}`,
    `Your options: ${participationOptions(r)}`,
    `Participants: ${r.participants}`,
    "",
    "What happens next:",
    "- A calendar invitation is being sent to this email (Yes / Maybe / No in supported apps).",
    "- The organizer will email you a secure payment form separately.",
    "- Submitting this form does not confirm payment or guarantee your spot.",
    "",
    `Tournament details: ${site}`,
    `Add to calendar (fallback): ${site}/tournament.ics`,
    "",
    `Questions? Contact ${tournament.organizer.name} at ${tournament.organizer.email}`,
  ];
  const text = lines.join("\n");
  const html = `<p>Hi ${escapeHtml(r.firstName)},</p>
<p>We received your registration request for <strong>${escapeHtml(tournament.name)}</strong>.</p>
<ul>
<li><strong>Date:</strong> ${escapeHtml(formatEventDate())}</li>
<li><strong>Time:</strong> ${escapeHtml(formatTimeRange())}</li>
<li><strong>Course:</strong> ${escapeHtml(tournament.courseName)}</li>
<li><strong>Address:</strong> ${escapeHtml(tournament.address)}</li>
<li><strong>Your options:</strong> ${escapeHtml(participationOptions(r))}</li>
<li><strong>Participants:</strong> ${r.participants}</li>
</ul>
<p><strong>What happens next</strong></p>
<ul>
<li>A calendar invitation is being sent to this email (Yes / Maybe / No in supported apps).</li>
<li>The organizer will email you a secure payment form separately.</li>
<li>Submitting this form does not confirm payment or guarantee your spot.</li>
</ul>
<p><a href="${escapeHtml(site)}">Tournament website</a> · <a href="${escapeHtml(site)}/tournament.ics">Add to calendar (fallback)</a></p>
<p>Questions? Contact ${escapeHtml(tournament.organizer.name)} at
<a href="mailto:${escapeHtml(tournament.organizer.email)}">${escapeHtml(tournament.organizer.email)}</a></p>`;
  return { text, html };
}

async function sendOrganizerEmail(r: RegistrationPayload): Promise<DeliveryStatus> {
  if (!emailConfigured()) return "not_configured";
  const domain = process.env["EMAIL_SENDER_DOMAIN"]!;
  const apiKey = process.env["LOVABLE_API_KEY"]!;
  const { text, html } = organizerBodies(r);
  try {
    await sendLovableEmail(
      {
        to: tournament.organizer.email,
        from: { name: tournament.name, address: `noreply@${domain}` },
        sender_domain: domain,
        subject: `New registration: ${r.firstName} ${r.lastName} — ${tournament.name}`,
        html,
        text,
        purpose: "transactional",
        reply_to: r.email,
        idempotency_key: `org-${r.id}`,
      },
      { apiKey },
    );
    return "sent";
  } catch (err) {
    console.error("[notifications] organizer email failed", err);
    return "failed";
  }
}

async function sendRegistrantEmail(r: RegistrationPayload): Promise<DeliveryStatus> {
  if (!emailConfigured()) return "not_configured";
  const domain = process.env["EMAIL_SENDER_DOMAIN"]!;
  const apiKey = process.env["LOVABLE_API_KEY"]!;
  const { text, html } = registrantBodies(r);
  try {
    await sendLovableEmail(
      {
        to: r.email,
        from: { name: tournament.name, address: `noreply@${domain}` },
        sender_domain: domain,
        subject: `Registration received — ${tournament.name}`,
        html,
        text,
        purpose: "transactional",
        reply_to: tournament.organizer.email,
        idempotency_key: `ack-${r.id}`,
      },
      { apiKey },
    );
    return "sent";
  } catch (err) {
    console.error("[notifications] registrant email failed", err);
    if (err instanceof EmailAPIError) {
      console.error("[notifications] EmailAPIError", err.status, err.code);
    }
    return "failed";
  }
}

async function sendCalendarInvite(r: RegistrationPayload): Promise<DeliveryStatus> {
  if (!calendarConfigured()) return "not_configured";
  const apiKey = process.env["RESEND_API_KEY"]!;
  const from = process.env["RESEND_FROM"]!;
  const attendeeName = `${r.firstName} ${r.lastName}`;
  const ics = buildIcs({
    method: "REQUEST",
    uid: `reg-${r.id}@golf-tournament`,
    attendeeEmail: r.email,
    attendeeName,
  });

  const site = tournament.websiteUrl.replace(/\/$/, "");
  const text = [
    `You're invited to ${tournament.name}.`,
    "",
    `${formatEventDate()} · ${formatTimeRange()}`,
    `${tournament.courseName}, ${tournament.address}`,
    "",
    "Open this email in a supported calendar app (including Google Calendar) to respond Yes, Maybe, or No.",
    "",
    "Payment and participation confirmation are handled separately by the organizer. This invitation does not confirm payment or guarantee your spot.",
    "",
    `Details: ${site}`,
    `Organizer: ${tournament.organizer.name} — ${tournament.organizer.email}`,
  ].join("\n");

  const html = `<p>You're invited to <strong>${escapeHtml(tournament.name)}</strong>.</p>
<p>${escapeHtml(formatEventDate())} · ${escapeHtml(formatTimeRange())}<br/>
${escapeHtml(tournament.courseName)}, ${escapeHtml(tournament.address)}</p>
<p>Open this email in a supported calendar app (including Google Calendar) to respond <strong>Yes</strong>, <strong>Maybe</strong>, or <strong>No</strong>.</p>
<p>Payment and participation confirmation are handled separately by the organizer. This invitation does not confirm payment or guarantee your spot.</p>
<p><a href="${escapeHtml(site)}">Tournament website</a><br/>
Organizer: ${escapeHtml(tournament.organizer.name)} —
<a href="mailto:${escapeHtml(tournament.organizer.email)}">${escapeHtml(tournament.organizer.email)}</a></p>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send(
      {
        from,
        to: r.email,
        replyTo: tournament.organizer.email,
        subject: `Calendar invitation: ${tournament.name}`,
        text,
        html,
        attachments: [
          {
            filename: "invite.ics",
            content: Buffer.from(ics, "utf8"),
            contentType: 'text/calendar; method=REQUEST; charset="UTF-8"',
          },
        ],
      },
      { idempotencyKey: `cal-${r.id}` },
    );
    if (error) {
      console.error("[notifications] calendar invite failed", error);
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[notifications] calendar invite failed", err);
    return "failed";
  }
}

function collectErrors(
  organizer: DeliveryStatus,
  registrant: DeliveryStatus,
  calendar: DeliveryStatus,
): string | undefined {
  const parts: string[] = [];
  if (organizer === "not_configured" || registrant === "not_configured") {
    parts.push("Notification email is not configured (EMAIL_SENDER_DOMAIN + LOVABLE_API_KEY).");
  }
  if (calendar === "not_configured") {
    parts.push("Calendar invites require RESEND_API_KEY + RESEND_FROM.");
  }
  if (organizer === "failed") parts.push("Organizer email failed.");
  if (registrant === "failed") parts.push("Registrant email failed.");
  if (calendar === "failed") parts.push("Calendar invite failed.");
  return parts.length ? parts.join(" ") : undefined;
}

export async function deliverRegistrationNotifications(
  registration: RegistrationPayload,
  options: DeliverOptions = {},
): Promise<DeliveryResult> {
  const prior = options.skipAlreadySent;

  const organizer =
    prior?.organizer === "sent" ? "sent" : await sendOrganizerEmail(registration);
  const registrant =
    prior?.registrant === "sent" ? "sent" : await sendRegistrantEmail(registration);
  const calendar =
    prior?.calendar === "sent" ? "sent" : await sendCalendarInvite(registration);

  const error = collectErrors(organizer, registrant, calendar);
  return {
    organizer,
    registrant,
    calendar,
    ...(error ? { error } : {}),
  };
}
