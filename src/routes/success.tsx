import { createFileRoute, Link } from "@tanstack/react-router";
import { tournament, formatEventDate, formatTimeRange } from "@/lib/tournament";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: `Registration received | ${tournament.name}` },
      {
        name: "description",
        content: `Your registration request for the ${tournament.name} has been received. A calendar invitation is on its way.`,
      },
      { property: "og:title", content: `Registration received | ${tournament.name}` },
      {
        property: "og:description",
        content: "Your registration request has been received. Next steps are on the way by email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Success,
});

function Success() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="card-elevated w-full max-w-xl p-8 text-center">
        <p className="eyebrow">Thank you</p>
        <h1 className="mt-3 text-3xl">Registration request received</h1>
        <div className="rule-gold mx-auto mt-4" />
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          We've saved your details and sent you an acknowledgement by email. A calendar invitation
          for {formatEventDate()} will arrive in the same inbox — you can respond Yes, Maybe, or No
          directly from your calendar.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Payment is handled separately. The organizer will email you a secure payment form.
          Submitting the form does not confirm payment or guarantee your spot.
        </p>

        <div className="mt-8 rounded-md bg-secondary/70 p-5 text-left text-sm">
          <p className="font-medium text-primary">{tournament.name}</p>
          <p className="mt-1 text-muted-foreground">{formatEventDate()}</p>
          <p className="text-muted-foreground">{formatTimeRange()}</p>
          <p className="mt-2 text-muted-foreground">
            {tournament.courseName}, {tournament.address}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/tournament.ics" className="btn-primary">
            Add to Calendar
          </a>
          <Link to="/" className="btn-outline">
            Back to tournament
          </Link>
        </div>
      </div>
    </main>
  );
}
