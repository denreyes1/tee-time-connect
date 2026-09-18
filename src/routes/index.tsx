import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-course.jpg";
import { tournament, formatEventDate, formatTimeRange } from "@/lib/tournament";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${tournament.name} | Charity Golf Tournament` },
      {
        name: "description",
        content: `Join the ${tournament.name} at ${tournament.courseName} on ${formatEventDate()}. Register to play, donate prizes, or sponsor a hole.`,
      },
      { property: "og:title", content: `${tournament.name}` },
      {
        property: "og:description",
        content: `A day of golf at ${tournament.courseName}. Register to play, donate prizes, or sponsor a hole.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Section({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>}
      {title && <div className="rule-gold mt-4" />}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Golf course at sunrise"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-24 text-center sm:py-36">
          <p className="eyebrow">{formatEventDate()}</p>
          <h1 className="mt-5 text-4xl leading-tight text-primary-foreground sm:text-6xl">
            {tournament.name}
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/85">{tournament.tagline}</p>
          <div className="mt-8 flex flex-col items-center gap-2 text-sm text-primary-foreground/90">
            <span>{formatTimeRange()}</span>
            <span className="text-gold">{tournament.courseName}</span>
            <span className="text-primary-foreground/70">{tournament.address}</span>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary bg-gold text-ink border-gold">
              Register to Participate
            </Link>
            <a href="/tournament.ics" className="btn-outline text-primary-foreground">
              Add to Calendar
            </a>
          </div>
        </div>
      </header>

      {/* Overview */}
      <Section eyebrow="The Event" title="Overview">
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {tournament.overview}
        </p>
        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            ["Date", formatEventDate()],
            ["Time", formatTimeRange()],
            ["Course", tournament.courseName],
            ["Address", tournament.address],
          ].map(([label, value]) => (
            <div key={label} className="card-elevated p-5">
              <dt className="eyebrow">{label}</dt>
              <dd className="mt-2 text-base text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Schedule */}
      <div className="bg-secondary/60">
        <Section eyebrow="Day Of" title="Schedule">
          <ol className="space-y-4">
            {tournament.schedule.map((item) => (
              <li
                key={item.time}
                className="flex flex-col gap-1 border-l-2 border-gold pl-5 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="w-28 shrink-0 font-medium text-primary">{item.time}</span>
                <span className="text-muted-foreground">{item.label}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Fees & inclusions */}
      <Section eyebrow="Participation" title="Fees & What's Included">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="card-elevated p-6">
            <h3 className="text-xl">Fees</h3>
            <ul className="mt-4 space-y-3">
              {tournament.fees.map((fee) => (
                <li
                  key={fee.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border pb-2 text-sm"
                >
                  <span className="text-muted-foreground">{fee.label}</span>
                  <span className="font-medium text-primary">{fee.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-6">
            <h3 className="text-xl">Included</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {tournament.included.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Payment is handled separately — the organizer will email you a secure payment form after
          you register.
        </p>
      </Section>

      {/* Ways to take part */}
      <div className="bg-secondary/60">
        <Section eyebrow="Get Involved" title="Foursomes, Prizes & Sponsorships">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["Foursomes", tournament.foursomes],
              ["Prize Donations", tournament.prizeDonations],
              ["Hole Sponsorships", tournament.holeSponsorships],
            ].map(([title, body]) => (
              <div key={title} className="card-elevated p-6">
                <h3 className="text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Contact + CTA */}
      <Section eyebrow="Questions" title="Organizer Contact">
        <div className="card-elevated flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <p className="text-base text-foreground">{tournament.organizer.name}</p>
            <p className="mt-1">{tournament.organizer.email}</p>
            <p>{tournament.organizer.phone}</p>
          </div>
          <Link to="/register" className="btn-primary">
            Register to Participate
          </Link>
        </div>
      </Section>

      <footer className="border-t border-border bg-primary py-8 text-center text-xs text-primary-foreground/70">
        <p>
          {tournament.name} · {tournament.courseName}
        </p>
        <Link to="/organizer" className="mt-2 inline-block text-primary-foreground/50 underline">
          Organizer access
        </Link>
      </footer>
    </main>
  );
}
