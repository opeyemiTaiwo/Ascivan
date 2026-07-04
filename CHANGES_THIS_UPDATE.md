# Changes in this update

## 1. Vendor branding hidden from all error messages
- New `src/utils/sanitizeError.js` strips the word "Firebase", raw codes like
  `(auth/...)`, and rewords "Firestore" before anything is shown to users.
- `getAuthErrorMessage` (src/firebase/config.js) now has a dedicated, friendly
  message for the password-policy error:
  "Your password doesn't meet the requirements: Password must contain a
  non-alphanumeric character." - and its default fallback is sanitized.
- New `src/utils/toastSanitizer.js` (imported once in src/index.jsx) wraps
  react-toastify app-wide, so ANY toast on ANY page is scrubbed of vendor
  branding as a safety net - no per-page changes needed, nothing breaks.
- Admin setup pages and the Privacy Policy were reworded ("Google Cloud"
  instead of naming the vendor).
- Note: some auto-generated project templates list "Firebase" as a required
  SKILL for member-built projects (a technology members might use). Those were
  left as-is since they describe member project stacks, not the platform.

## 2. Projects page - Free / Paid filter
- "All Projects" listing now has a dropdown: All Projects / Paid Projects /
  Free (Collaborative) Projects, included in the Clear All logic.

## 3. Editors see all Foundations courses
- Accounts with role `editor` now see every track with courses, same as admins.

## 4. Proof Wall & Workspace - desktop layout
- Both pages are now capped at `max-w-3xl` and centered on large screens.
  Mobile/handheld layout is unchanged.

## 5. Images show in full at a glance
- Proof Wall updates and Workspace discussion attachments now use
  `object-contain` (letterboxed on a light background) so the whole image -
  top and bottom - is visible in the feed. Click-to-open full size (lightbox)
  is kept exactly as before.

## 6. Proof Wall - "All Activity" tab
- Individuals: new default "All Activity" tab showing every update type
  (project updates, needs-a-lead, badges, ships, milestones) PLUS a compact
  "Open projects" strip at the top (with a View all link to the Open tab).
- Companies: new default "All Activity" tab showing all updates PLUS a compact
  "Top talent" strip at the top (with a View all link to the Top Talent tab).

## 7. Proof Wall - Top Talent empty state
- Removed "or get top ratings for teaching"; it now reads
  "Members who earn badges will appear here."

## 8. Applications - third "Request Info" button
- Project owners now see Approve / Reject / Request Info on every pending
  application. Request Info opens a small composer (pre-filled with
  "Send me your portfolio.") and sends the message to the applicant
  (in-app notification + push).
- The applicant sees the owner's message on My Projects → Applied and can
  reply with a LINK ONLY (validated URL; a brief note tells them so). The
  owner is notified and sees the link right on the application card.

## 9. Profile picture upload + profile editing for all accounts
- Settings → Edit Profile now starts with a profile-picture section: current
  photo (or initial), with "Upload a photo" / "Change photo". Works for
  email/password accounts (which have no Google picture) and for Google/Gmail
  accounts that want to change theirs. The photo is saved to the user document
  and synced to the auth profile so it shows everywhere.
- Every member (including Gmail sign-ins) already gets the "Edit Profile"
  button on their own profile page, which opens this Settings tab.
