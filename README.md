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

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7d7d20eb-373e-4256-a52b-a0c8b7f3edf6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
