import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { tournament } from "@/lib/tournament";
import {
  listRegistrations,
  retryDelivery,
  type RegistrationRow,
} from "@/lib/registration.functions";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: [
      { title: `Organizer dashboard | ${tournament.name}` },
      { name: "description", content: "Private organizer access to tournament registrations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Organizer dashboard | ${tournament.name}` },
      { property: "og:description", content: "Private organizer access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Organizer,
});

function options(r: RegistrationRow) {
  return [r.attend && "Attend", r.donate_prizes && "Prizes", r.sponsor_hole && "Hole sponsor"]
    .filter(Boolean)
    .join(", ");
}

function needsRetry(r: RegistrationRow) {
  return [r.organizer_email_status, r.registrant_email_status, r.calendar_invite_status].some(
    (s) => s !== "sent",
  );
}

function toCsv(rows: RegistrationRow[]) {
  const headers = [
    "Submitted",
    "First name",
    "Last name",
    "Email",
    "Company",
    "Participants",
    "Other players",
    "Options",
    "Prize description",
    "Sponsorship notes",
    "Comments",
    "Organizer email",
    "Registrant email",
    "Calendar invite",
    "Delivery error",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      new Date(r.created_at).toISOString(),
      r.first_name,
      r.last_name,
      r.email,
      r.company,
      r.participants,
      r.player_names,
      options(r),
      r.prize_description,
      r.sponsorship_notes,
      r.comments,
      r.organizer_email_status,
      r.registrant_email_status,
      r.calendar_invite_status,
      r.delivery_error,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...lines].join("\n");
}

function Organizer() {
  const load = useServerFn(listRegistrations);
  const retry = useServerFn(retryDelivery);
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<RegistrationRow[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await load({ data: { password } });
      setRows(res.registrations);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  function downloadCsv() {
    if (!rows) return;
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRetry(id: string) {
    setRetryingId(id);
    setRetryError("");
    try {
      const res = await retry({ data: { password, registrationId: id } });
      setRows((prev) =>
        prev ? prev.map((r) => (r.id === id ? res.registration : r)) : prev,
      );
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Retry failed.");
    } finally {
      setRetryingId(null);
    }
  }

  if (!rows) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <form onSubmit={signIn} className="card-elevated w-full max-w-sm p-7">
          <p className="eyebrow">Private</p>
          <h1 className="mt-2 text-2xl">Organizer dashboard</h1>
          <div className="rule-gold mt-3" />
          <label htmlFor="pw" className="mt-6 mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="pw"
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={status === "loading"}>
            {status === "loading" ? "Checking…" : "View registrations"}
          </button>
        </form>
      </main>
    );
  }

  const totalPlayers = rows.reduce((sum, r) => sum + (r.attend ? r.participants : 0), 0);
  const failed = rows.filter(needsRetry);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Organizer</p>
            <h1 className="mt-2 text-3xl">Registrations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {rows.length} submissions · {totalPlayers} golfers expected
            </p>
          </div>
          <button onClick={downloadCsv} className="btn-outline">
            Export CSV
          </button>
        </div>

        {failed.length > 0 && (
          <div className="mt-6 rounded-md border border-gold bg-gold-soft/40 p-4 text-sm">
            {failed.length} registration{failed.length === 1 ? "" : "s"} have an email or calendar
            invitation that hasn't been delivered yet. Use Retry delivery on each row after
            configuring email services.
          </div>
        )}

        {retryError && <p className="mt-4 text-sm text-destructive">{retryError}</p>}

        <div className="card-elevated mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-secondary/70 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {[
                  "Submitted",
                  "Name",
                  "Email",
                  "Company",
                  "Players",
                  "Options",
                  "Notes",
                  "Delivery",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.company ?? "—"}</td>
                  <td className="px-4 py-3">{r.participants}</td>
                  <td className="px-4 py-3 text-muted-foreground">{options(r)}</td>
                  <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                    {[r.player_names, r.prize_description, r.sponsorship_notes, r.comments]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>Organizer: {r.organizer_email_status}</div>
                    <div>Registrant: {r.registrant_email_status}</div>
                    <div>Calendar: {r.calendar_invite_status}</div>
                    {needsRetry(r) && (
                      <button
                        type="button"
                        className="btn-outline mt-2 px-2 py-1 text-xs"
                        disabled={retryingId === r.id}
                        onClick={() => handleRetry(r.id)}
                      >
                        {retryingId === r.id ? "Retrying…" : "Retry delivery"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
