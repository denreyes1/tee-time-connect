/**
 * Delivery of the organizer email, the registrant acknowledgement, and the
 * calendar meeting invitation (RSVP).
 *
 * These require a verified sender domain for the project. Until one is
 * configured, every send reports "not_configured" and is recorded against the
 * registration so the organizer can see and retry it later. Registrations are
 * always saved regardless of delivery outcome.
 */

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

function emailConfigured() {
  return Boolean(process.env["EMAIL_SENDER_DOMAIN"] && process.env["LOVABLE_API_KEY"]);
}

export async function deliverRegistrationNotifications(
  _registration: RegistrationPayload,
): Promise<DeliveryResult> {
  if (!emailConfigured()) {
    return {
      organizer: "not_configured",
      registrant: "not_configured",
      calendar: "not_configured",
      error: "Email sender domain is not configured yet.",
    };
  }

  // Sending is wired up once the sender domain is verified.
  return {
    organizer: "not_configured",
    registrant: "not_configured",
    calendar: "not_configured",
    error: "Email sender domain is not configured yet.",
  };
}
