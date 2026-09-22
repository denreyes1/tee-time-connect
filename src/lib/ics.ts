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

function utcStampFromMs(ms: number) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Convert a wall-clock date/time in `timeZone` to a UTC Date. */
function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  const desiredUtcMs = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
    0,
  );

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  let utcMs = desiredUtcMs;
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(
      dtf
        .formatToParts(new Date(utcMs))
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, p.value]),
    ) as Record<string, string>;
    const hour = parts["hour"] === "24" ? 0 : Number(parts["hour"]);
    const asLocalMs = Date.UTC(
      Number(parts["year"]),
      Number(parts["month"]) - 1,
      Number(parts["day"]),
      hour,
      Number(parts["minute"]),
      Number(parts["second"]),
    );
    utcMs += desiredUtcMs - asLocalMs;
  }
  return new Date(utcMs);
}

/** Minimal VTIMEZONE for America/Toronto (EST/EDT). */
function americaTorontoVTimezone(): string[] {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:America/Toronto",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

export interface IcsOptions {
  attendeeEmail?: string;
  attendeeName?: string;
  method?: "REQUEST" | "PUBLISH";
  uid?: string;
}

export function buildIcs(opts: IcsOptions = {}) {
  const now = new Date();
  const dtstamp = utcStampFromMs(now.getTime());
  const uid = opts.uid ?? `tournament-${tournament.date}@golf-tournament`;
  const method = opts.method ?? "PUBLISH";
  const useTorontoTz = tournament.timeZone === "America/Toronto";

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
  ];

  if (useTorontoTz) {
    lines.push(...americaTorontoVTimezone());
  }

  lines.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtstamp}`);

  if (useTorontoTz) {
    lines.push(
      `DTSTART;TZID=${tournament.timeZone}:${localStamp(tournament.date, tournament.startTime)}`,
      `DTEND;TZID=${tournament.timeZone}:${localStamp(tournament.date, tournament.endTime)}`,
    );
  } else {
    const startUtc = zonedLocalToUtc(tournament.date, tournament.startTime, tournament.timeZone);
    const endUtc = zonedLocalToUtc(tournament.date, tournament.endTime, tournament.timeZone);
    lines.push(`DTSTART:${utcStampFromMs(startUtc.getTime())}`, `DTEND:${utcStampFromMs(endUtc.getTime())}`);
  }

  lines.push(
    `SUMMARY:${escapeText(tournament.name)}`,
    `LOCATION:${escapeText(`${tournament.courseName}, ${tournament.address}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${tournament.websiteUrl}`,
    `ORGANIZER;CN=${escapeText(tournament.organizer.name)}:mailto:${tournament.organizer.email}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
  );

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
