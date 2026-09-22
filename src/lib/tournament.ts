// EDITABLE TOURNAMENT DETAILS
// Replace any [PLACEHOLDER] values with the real tournament information.
export const tournament = {
  name: "[Tournament Name] Charity Golf Classic",
  tagline: "A day of golf, good company, and giving back.",
  // ISO local date/time (no timezone offset) + IANA time zone
  date: "2026-06-12",
  startTime: "08:00",
  endTime: "16:00",
  timeZone: "America/Toronto",
  timeZoneLabel: "Eastern Time (ET)",
  courseName: "[Golf Course Name]",
  address: "[123 Fairway Drive, City, Province/State, Postal Code]",
  websiteUrl: "https://[your-tournament-site].example.com",
  overview:
    "Join us for a full day of championship golf in support of [Cause / Charity]. The scramble-format tournament welcomes players of every skill level, with contests on the course, a catered lunch, and an awards reception to close the day.",
  schedule: [
    { time: "7:00 AM", label: "Registration, breakfast & driving range" },
    { time: "8:00 AM", label: "Shotgun start — 18 holes, scramble format" },
    { time: "12:30 PM", label: "Lunch at the turn" },
    { time: "2:30 PM", label: "Course closes & cocktail reception" },
    { time: "3:15 PM", label: "Awards, prize draw & closing remarks" },
  ],
  fees: [
    { label: "Individual golfer", price: "$[000]" },
    { label: "Foursome (4 golfers)", price: "$[000]" },
    { label: "Hole sponsorship", price: "$[000]" },
    { label: "Reception only", price: "$[00]" },
  ],
  included: [
    "18 holes with shared power cart",
    "Breakfast, lunch at the turn & evening reception",
    "Range balls and practice green access",
    "Tournament gift bag",
    "On-course contests and prize draw entry",
  ],
  foursomes:
    "A foursome is a group of four golfers playing together. Register as a full foursome and we will keep your group on the same tee. Individual golfers are welcome — we will place you with other players.",
  prizeDonations:
    "Donated prizes fuel our raffle and awards table. Gift cards, experiences, golf equipment, and branded items are all welcome, and every donor is recognised at the awards reception.",
  holeSponsorships:
    "Hole sponsors receive branded signage at a tee box, recognition in the program and on the website, and an optional activation table at their hole.",
  organizer: {
    name: "[Organizer Name]",
    email: "[organizer@example.com]",
    phone: "[(555) 555-5555]",
  },
};

export function formatEventDate() {
  const d = new Date(`${tournament.date}T${tournament.startTime}:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeRange() {
  const fmt = (t: string) => {
    const parts = t.split(":");
    const h = Number(parts[0] ?? 0);
    const m = Number(parts[1] ?? 0);
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "AM" : "PM";
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
  };
  return `${fmt(tournament.startTime)} – ${fmt(tournament.endTime)} ${tournament.timeZoneLabel}`;
}
