import { createFileRoute } from "@tanstack/react-router";
import { buildIcs } from "@/lib/ics";

export const Route = createFileRoute("/tournament.ics")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildIcs(), {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="tournament.ics"',
          },
        }),
    },
  },
});
