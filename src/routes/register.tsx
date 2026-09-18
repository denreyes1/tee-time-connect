import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import teeImage from "@/assets/tee.jpg";
import { tournament, formatEventDate, formatTimeRange } from "@/lib/tournament";
import { submitRegistration, registrationSchema } from "@/lib/registration.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: `Register | ${tournament.name}` },
      {
        name: "description",
        content: `Register to play, donate prizes, or sponsor a hole at the ${tournament.name} on ${formatEventDate()}.`,
      },
      { property: "og:title", content: `Register | ${tournament.name}` },
      {
        property: "og:description",
        content: "Register to play, donate prizes, or sponsor a hole. Payment is handled separately.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  participants: "1",
  playerNames: "",
  comments: "",
  attend: true,
  donatePrizes: false,
  sponsorHole: false,
  prizeDescription: "",
  sponsorshipNotes: "",
  website: "",
};

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitRegistration);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const set = (key: keyof typeof emptyForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setServerError("");

    const parsed = registrationSchema.safeParse({
      ...form,
      participants: Number(form.participants),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("loading");
    try {
      await submit({ data: parsed.data });
      navigate({ to: "/success" });
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden">
        <img
          src={teeImage}
          alt="Golf ball on a tee"
          width={1280}
          height={800}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center">
          <Link to="/" className="eyebrow">
            ← {tournament.name}
          </Link>
          <h1 className="mt-4 text-3xl text-primary-foreground sm:text-4xl">
            Register to Participate
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/80">
            {formatEventDate()} · {formatTimeRange()} · {tournament.courseName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-5 py-12">
        <div className="card-elevated space-y-7 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name *</Label>
              <input
                id="firstName"
                className="field"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              {errors["firstName"] && (
                <p className="mt-1 text-xs text-destructive">{errors["firstName"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last name *</Label>
              <input
                id="lastName"
                className="field"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
              {errors["lastName"] && (
                <p className="mt-1 text-xs text-destructive">{errors["lastName"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email address *</Label>
              <input
                id="email"
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              {errors["email"] && (
                <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company">Company or organization</Label>
              <input
                id="company"
                className="field"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="participants">Number of participants *</Label>
            <input
              id="participants"
              type="number"
              min={1}
              max={40}
              className="field sm:max-w-40"
              value={form.participants}
              onChange={(e) => set("participants", e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              A foursome is a group of four golfers. Enter 4 to register a full foursome, or 1 if
              you're playing on your own — we'll place you with other golfers.
            </p>
            {errors["participants"] && (
              <p className="mt-1 text-xs text-destructive">{errors["participants"]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="playerNames">Names of other players in your group (optional)</Label>
            <textarea
              id="playerNames"
              rows={3}
              className="field"
              placeholder="One name per line"
              value={form.playerNames}
              onChange={(e) => set("playerNames", e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-foreground">
              How would you like to take part? * (select all that apply)
            </legend>
            <div className="space-y-3">
              {[
                ["attend", "Attend the tournament"],
                ["donatePrizes", "Donate prizes"],
                ["sponsorHole", "Sponsor a hole"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={Boolean(form[key as keyof typeof emptyForm])}
                    onChange={(e) => set(key as keyof typeof emptyForm, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors["attend"] && <p className="mt-2 text-xs text-destructive">{errors["attend"]}</p>}
          </fieldset>

          {form.donatePrizes && (
            <div>
              <Label htmlFor="prizeDescription">Prize description (optional)</Label>
              <textarea
                id="prizeDescription"
                rows={3}
                className="field"
                value={form.prizeDescription}
                onChange={(e) => set("prizeDescription", e.target.value)}
              />
            </div>
          )}

          {form.sponsorHole && (
            <div>
              <Label htmlFor="sponsorshipNotes">Sponsorship notes (optional)</Label>
              <textarea
                id="sponsorshipNotes"
                rows={3}
                className="field"
                value={form.sponsorshipNotes}
                onChange={(e) => set("sponsorshipNotes", e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="comments">Comments or questions (optional)</Label>
            <textarea
              id="comments"
              rows={3}
              className="field"
              value={form.comments}
              onChange={(e) => set("comments", e.target.value)}
            />
          </div>

          {/* honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />

          <div className="rounded-md border border-gold bg-gold-soft/40 p-4 text-sm text-foreground">
            Payment is handled separately. The organizer will email you a secure payment form.
            Submitting this form does not confirm payment or guarantee your spot.
          </div>

          {serverError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
            {status === "loading" ? "Submitting…" : "Submit registration"}
          </button>
        </div>
      </form>
    </main>
  );
}
