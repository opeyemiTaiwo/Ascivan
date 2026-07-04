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

## 10. AI recommendations (projects + Foundations courses)
- New `src/utils/aiRecommendations.js`: gathers the member's profile (academic
  background, primary track, experience level, skills, interests), badges
  earned (`member_badges`), and roles they've held/applied for; gathers up to
  20 open active projects (excluding their own and ones they already applied
  to) and the Foundations course catalog (excluding courses they've finished);
  sends ONE compact prompt to Claude (`claude-haiku-4-5-20251001`) through the
  existing `/api/claude-proxy` (the API key stays server-side) and asks for
  strict JSON: up to 4 projects (with a match % and a one-line personalized
  reason) and up to 4 courses (with a reason).
- Every id the model returns is validated against the real candidate lists -
  anything invented is dropped - and hydrated with real titles.
- Results are cached on the user document (`users/{uid}.aiRecs`) for 24 hours
  or until the profile / candidate pool changes, so a dashboard visit doesn't
  cost an API call. A Refresh button forces regeneration.
- New `src/components/AIRecommendations.jsx`: "Recommended for you" card on the
  member dashboard (individuals only) with two columns - Projects to join
  (title, Paid/industry chips, match %, reason, View & apply) and Foundations
  courses (title, track chip, reason, Start learning). Skeleton loading state;
  fails quietly (renders nothing) if the AI is unavailable, so the dashboard
  never breaks.

## 11. Interests: editable in Settings (bug fix + AI signal)
- Interests were only collected in onboarding step 4 ("What are you looking
  for?"), that step is optional, and the promised "editable later" editor never
  existed. Worse: Settings required interests for profileComplete but gave no
  way to set them - members who skipped the step could never complete their
  profile.
- Settings → Edit Profile now has an "What are you interested in?" picker
  (same options as onboarding, individual + company variants). Saved to
  users/{uid}.interests, and profileComplete now uses the edited form value.
- These interests also feed the AI recommendations prompt; when empty, the AI
  falls back to education, track, level, skills, badges, and roles held.

## 12. Industry interests (topical signal for recommendations)
- New shared list `src/utils/industryTracks.js` - the exact same 21 industries
  projects are tagged with, so member interests line up 1:1 with project tags.
- Onboarding step 4 now also asks "Which industries interest you?" (optional
  chip multi-select, individuals).
- Settings → Edit Profile has the same "Industries you're interested in"
  picker (individuals), saved to users/{uid}.industryInterests.
- The AI recommendation prompt now includes their industry interests (as
  human-readable labels) and is instructed to strongly prefer projects in
  those industries. Changing industries invalidates the 24h cache
  automatically, so fresh picks generate on the next dashboard visit.

## 13. Email verification: branded page with a Sign in button
- Problem: verification emails linked to Firebase's default hosted page
  (ascivan-5b4f4.firebaseapp.com) which says "you can now sign in" with NO
  link - and exposes the vendor domain.
- New `api/auth/send-verification.js` (mirrors the existing send-reset.js):
  generates the verification code with the Admin SDK and emails a branded
  Ascivan message whose button links to ascivan.com/auth/action - the app's
  existing branded page that confirms the email and shows a "Sign in now"
  button.
- AuthContext now sends signup + resend verification through this endpoint
  (with the default sender kept only as a fallback if the endpoint fails).
- Uses the SAME env vars already configured for send-reset: EMAIL_USER,
  EMAIL_PASSWORD, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL - nothing new to set up.
- RECOMMENDED (console, optional): Firebase Console → Authentication →
  Templates → pencil icon → "Customize action URL" →
  https://ascivan.com/auth/action - this also reroutes any OTHER default
  emails (e.g. email-change notices) to the branded page.

## 14. Recommendations v2: best matches (bug fix + refinements)
- BUG FIX: the candidate query only fetched status=='active' projects, but
  most of the pool sits in 'lead_recruitment' (needs a lead) - so the AI often
  had zero projects to pick from and only recommended courses. The query now
  matches the Projects page pool: ['active', 'lead_recruitment'].
- The card is now "Your best matches": exactly ONE best project + ONE best
  course, side by side. Needs-a-lead projects get an orange chip and an
  "apply to lead" CTA; smaller AI response budget (400 tokens).
- Added a brief profile nudge under the heading: "Keep your profile fresh for
  sharper matches" linking to Settings.
- Cache fingerprint versioned (v:2) so members' old 4-item cached
  recommendations regenerate automatically on next visit.
- Foundations page: one-line intro added under the heading: "Practical,
  beginner-friendly courses that take you from zero to your first real
  project."

## 15. Foundations: AI course spotlight (no shuffling)
- Decision: the track library stays in its normal, predictable order (courses
  are sequential learning paths - reshuffling them by AI between visits would
  be disorienting and add API cost/latency).
- Instead, a "Recommended for you" spotlight now appears at the top of the
  Foundations library (individuals only) showing the member's AI-picked best
  course with its personalized reason and an "Open course" button that jumps
  straight into it (switching track if needed).
- Zero extra cost: it reads the cached pick straight off the user document the
  page already loads. Hidden if there's no cached pick, if the course was
  completed, or while reading a course.

## 16. Proof Wall polish (mobile tabs, tip moved to FAQ)
- The filter chips (All Activity / Updates / Needs a lead / Open projects) now
  sit on a single horizontally-scrollable line instead of wrapping into an
  uneven stack on phones - the standard mobile chip pattern (scrollbar hidden).
- The blue "Tip" banner was removed from the Proof Wall header.
- The tip now lives in the Support page FAQ as "How do I get the most out of
  the Proof Wall?", reworded to say "hiring companies" instead of
  "recruiters", with added guidance (attach an image, post consistently).

## 17. Sidebar + owner dashboard tweaks
- Sidebar Projects group now has three sub-items: All Projects, My Projects
  (the manage-your-posted-projects page, /projects/owner-dashboard), and
  Project Vault.
- Removed the "Pending Apps" stat card from the My Projects page (jargon that
  could read as worrying); the stats grid is now three cards - Total Projects,
  Team Members, Completed. Pending applications are still fully visible per
  project via the "Applications (N)" button on each project card.

## 18. Foundations: every track open to every individual
- Previously an individual only saw tabs for tracks they held a badge in plus
  their primary track - so a TechDev exploring TechGuard couldn't reach the
  TechGuard courses (despite the FAQ promising free Foundations in every
  track, and beginner Guard roles being open to them on projects).
- Now every individual sees every track that has courses. Their own tracks
  (badge tracks, then primary track) are listed first, the rest follow. The
  company badges guide stays company-only; company and admin/editor behavior
  unchanged. Progress is still tracked per track as before.

## 19. Profile picture viewer
- On any member's profile page, the profile picture is now clickable: tapping
  it opens a full-size lightbox (dark overlay, close button, tap-anywhere to
  dismiss). Avatars elsewhere in the app (Proof Wall, Discussion, directory)
  keep their existing behavior of navigating to the person's profile - from
  which the picture can then be viewed full size.

## 20. Sidebar: fixed double-highlight + spacing
- Clicking "My Projects" no longer also highlights "All Projects" (the active
  check matched any /projects/* path; it now excludes the sibling sub-pages,
  while still highlighting All Projects on the listing and project detail
  pages).
- Slightly increased spacing between the Projects sub-menu items for clearer
  separation.

## 21. "Find your first project": one best match
- The dashboard cold-start section now shows only the single best-matched
  project instead of three (the "Browse all projects" link covers the rest).
  Intro copy adjusted to match ("Here's a project that fits your profile").

## 22. Proof Wall All Activity strips: two items
- The "Open projects" strip (individuals) and "Top talent" strip (companies)
  on the All Activity tab now show two items instead of three - the View all
  link covers the rest.

## 23. Applicant messaging: Request Info now opens a real conversation
- Problem: the "request portfolio" notification routed applicants to the wrong
  page, and the link-only reply flow was clunky.
- Now the owner's Request Info message creates (or reuses) a Messages
  conversation between owner and applicant, drops the request in as a chat
  message with project context ('About your application for "X" (Role): ...'),
  and increments the applicant's unread count.
- The applicant's notification now routes straight to that conversation
  (/messages?with=owner); the push notification links to /messages too.
- My Projects (applied tab) shows the owner's message with an "Open
  conversation" button instead of the old link-only reply form (removed).
- The owner's application card shows "You asked ..." with an "Open
  conversation" link.
- Deliberate: owner->applicant conversations are created directly, bypassing
  the Premium "contact talent" gate - the applicant applied to the owner's
  project, so this contact is legitimate; and per existing rules, replies in
  an existing conversation are always unlimited for both sides.

## 24. Request Info: message only, no notification entry
- The owner's Request Info message no longer creates an entry on the
  Notifications page. It goes straight to the applicant's Messages inbox as a
  chat message, lighting up the Messages unread badge in the sidebar like any
  other message. The push (device) notification is kept - same as normal
  messages - and links to the inbox. The Notifications-page routing for the
  old notification type is kept so previously-sent notifications still open
  the right conversation.
