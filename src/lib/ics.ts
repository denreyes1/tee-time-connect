import { tournament } from "./tournament";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Local date-time stamp for the event's own time zone (used with TZID)
function localStamp(date: string, time: string) {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export interface IcsOptions {
  attendeeEmail?: string;
  attendeeName?: string;
  method?: "REQUEST" | "PUBLISH";
  uid?: string;
}

export function buildIcs(opts: IcsOptions = {}) {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours(),
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const uid = opts.uid ?? `tournament-${tournament.date}@golf-tournament`;
  const method = opts.method ?? "PUBLISH";

  const description = [
    tournament.overview,
    "",
    `Course: ${tournament.courseName}, ${tournament.address}`,
    `Organizer: ${tournament.organizer.name} — ${tournament.organizer.email} — ${tournament.organizer.phone}`,
    `Details: ${tournament.websiteUrl}`,
    "",
    "Please note: payment and confirmation of participation are handled separately by the organizer. This invitation does not confirm payment or guarantee your spot.",
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Golf Tournament//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${tournament.timeZone}:${localStamp(tournament.date, tournament.startTime)}`,
    `DTEND;TZID=${tournament.timeZone}:${localStamp(tournament.date, tournament.endTime)}`,
    `SUMMARY:${escapeText(tournament.name)}`,
    `LOCATION:${escapeText(`${tournament.courseName}, ${tournament.address}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${tournament.websiteUrl}`,
    `ORGANIZER;CN=${escapeText(tournament.organizer.name)}:mailto:${tournament.organizer.email}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
  ];

  if (opts.attendeeEmail) {
    lines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeText(
        opts.attendeeName ?? opts.attendeeEmail,
      )}:mailto:${opts.attendeeEmail}`,
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
