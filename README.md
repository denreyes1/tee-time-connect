# Tee Time Connect

Build a polished, mobile-friendly golf tournament website that I can share through a single link. Visitors should be able to view tournament information, register their interest, and receive a calendar invitation by email. Payments will be handled separately by the organizer.

Use an elegant golf aesthetic with deep green, white, subtle gold accents, attractive golf photography, and clean typography.

Tournament landing page

Include:

A prominent tournament flyer or hero image.

Tournament name, date, start and end times, time zone, golf course, and address.

An overview, schedule, participation fees, and what is included.

Information about foursomes, prize donations, and hole sponsorships.

Organizer contact information.

A clear “Register to Participate” button that opens a dedicated registration page.

Use editable placeholders for tournament details that have not been provided.

Registration form

Collect:

First name.

Last name.

Email address.

Company or organization.

Number of participants, with clear guidance that a foursome is a group of four.

Optional names of other players in the group.

Optional comments or questions.

Include participation options:

Attend the tournament.

Donate prizes.

Sponsor a hole.

Allow visitors to select multiple options, such as attending and donating prizes or attending and sponsoring a hole. Show an optional prize-description field when prize donation is selected and an optional sponsorship-notes field when hole sponsorship is selected.

Clearly explain before submission: “Payment is handled separately. The organizer will email you a secure payment form. Submitting this form does not confirm payment or guarantee your spot.”

No attendee account should be required.

Submission and organizer notifications

When the form is successfully submitted:

Securely save the registration.

Email the organizer all submitted information so they can follow up and send the secure payment form manually.

Email the registrant an acknowledgment summarizing their submission and explaining the next steps.

Show a success page explaining that their registration request has been received and a calendar invitation will be sent.

Provide a simple, password-protected organizer dashboard to view registrations and export them as CSV. Registration information must never be publicly visible.

Automatic calendar invitations

After a successful registration, automatically send a genuine calendar meeting invitation to the email address entered, with Yes, Maybe, and No RSVP options in supported calendar apps, including Google Calendar.

The invitation should contain:

Tournament name.

Correct date, start and end times, and time zone.

Golf course name and address.

Organizer contact information.

A link back to the tournament website.

A clear note that payment and participation confirmation are handled separately.

Send the invitation immediately after registration, even if payment has not been received. Attendees should be able to accept or decline it themselves. No automatic calendar updates based on payment status are needed.

Protect attendee privacy: registrants must not see other registrants’ email addresses. Invite only the person submitting the form unless additional guest invitations are explicitly supported.

A downloadable calendar file or “Add to Calendar” button may be offered as a fallback, but it must not replace the emailed RSVP invitation.

Scope and implementation

Do not build checkout, collect card details, or integrate payment processing.

Use a real backend for registration storage, email notifications, and calendar invitations. Keep credentials on the server. If email or calendar connections require setup, clearly identify the configuration needed rather than simulating successful delivery.

Include form validation, basic spam protection, duplicate-submission prevention, and clear loading, success, and error states. Save registrations even if an email or calendar service fails, and make failed deliveries visible to the organizer for retry.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Configuration

Registration always saves to Supabase even if outbound delivery fails. Set these server-side environment variables for email and calendar invites:

| Variable | Purpose |
| --- | --- |
| `EMAIL_SENDER_DOMAIN` | Verified sender domain for notification email (e.g. `notify.example.com`) |
| `LOVABLE_API_KEY` | Messaging API key — organizer notification + registrant acknowledgement |
| `RESEND_API_KEY` | Resend API key — calendar ICS invite with RSVP (Yes / Maybe / No) |
| `RESEND_FROM` | From address for calendar invites (e.g. `Tournament <noreply@notify.example.com>`) |
| `ORGANIZER_PASSWORD` | Password gate for the `/organizer` dashboard |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for secure registration writes |

Also ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set for the client.

Missing email or calendar config is recorded as `not_configured` on each registration. Use **Retry delivery** on the organizer dashboard after credentials are configured.

Edit tournament copy and placeholders in `src/lib/tournament.ts`.
