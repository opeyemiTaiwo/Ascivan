# Loomiqe — Complete Platform Update

Everything from this session, in one place. Apply by copying these files into your
project at the same paths (overwriting existing ones), creating the 4 new files, and
deleting the 10 listed files.

Pronounced "loomie" (the q is silent) — a subtle pronunciation cue is now shown on
the landing hero and the About page.

================================================================
## HOW TO APPLY
================================================================

1. COPY these 24 files into your project at the exact paths shown (20 overwrite
   existing files; 4 are new — see NEW list).
2. CREATE the 4 new files (they're included here at their paths).
3. DELETE the 10 files listed under "DELETE" below.
4. Your `/api/claude-proxy` endpoint must be live for project auto-generation
   (it's the same proxy your career tools already use). Everything else works without it.

================================================================
## NEW FILES (4)
================================================================
- src/utils/roleEligibility.js        — enforced role-difficulty matching
- src/utils/profileCompletion.js      — shared "profile complete" check (incl. country)
- src/utils/projectGenerator.js       — AI generation of software/AI projects
- src/Pages/admin/GenerateProject.jsx — admin page to generate auto-projects
- src/Pages/projects/ProjectSetup.jsx — confirmed lead refines + opens a project

(That's 5 — roleEligibility, profileCompletion, projectGenerator, GenerateProject,
ProjectSetup are all new.)

================================================================
## DELETE THESE FILES (10)
================================================================
- src/utils/paidProjectLimits.js
- src/Pages/Finance.jsx
- src/Pages/Banking.jsx
- src/Pages/Housing.jsx
- src/Pages/PostFinance.jsx
- src/Pages/PostBanking.jsx
- src/Pages/PostHousing.jsx
- src/Pages/MyFinancePosts.jsx
- src/Pages/MyFinanceApplications.jsx
- src/Pages/MyHousingPosts.jsx

================================================================
## WHAT CHANGED, BY FEATURE
================================================================

### 1. Enforced role-difficulty matching (badge-gated roles)
Roles carry an experience level; applying is gated by the badge level you've earned
in that track. Beginner / any-level = open to everyone; Intermediate needs Associate+;
Advanced needs Advanced+. Locked roles are disabled in the apply dropdown with a reason.
- NEW src/utils/roleEligibility.js
- src/Pages/projects/ProjectDetail.jsx (enforcement at apply time + dropdown)
- src/Pages/projects/ProjectSubmission.jsx (owner guidance; levels aligned)

### 2. Contribution-aware credentials
Badges now record contribution level (excellent/good/fair), role, and project, and the
profile displays them — so recruiters can tell "Advanced / excellent on Project X" from
a first-week contributor. Keeps the Talent Board signal honest.
- src/Pages/projects/ProjectCompletion.jsx
- src/Pages/user/UserProfile.jsx

### 3. Paid projects removed (free / collaborative only)
All paid-project machinery removed platform-wide (pricing, payments, budgets, limits,
payment-confirmation). Projects are collaborative and free — a visa-safe, experience-only
model. Membership reframed: Basic = unlimited collaborative projects; Premium = recruiter
visibility (priority Talent Board, direct outreach, verified badge).
- src/Pages/projects/ProjectSubmission.jsx, ProjectDetail.jsx, ProjectCompletion.jsx,
  ProjectOwnerDashboard.jsx, ProjectsListing.jsx, MyProjects.jsx
- src/Pages/Settings.jsx, Account.jsx (Account repurposed to a project/credential overview),
  user/dashboard.jsx (earnings card -> Talent Board status)
- DELETE src/utils/paidProjectLimits.js

### 4. Require a complete profile before create/join (no "skip")
Onboarding "Complete Later" removed. Creating or joining a project requires a complete
profile (name, country, interests; individuals also need experience level + LinkedIn;
companies need company name + business email). Banners name exactly what's missing.
- NEW src/utils/profileCompletion.js
- src/Pages/Onboarding.jsx, Settings.jsx, projects/ProjectSubmission.jsx, projects/ProjectDetail.jsx

### 5. Current country — required everywhere
Added as a required field in onboarding + settings, enforced in the completeness check,
shown on profiles.
- src/Pages/Onboarding.jsx, Settings.jsx, user/UserProfile.jsx, utils/profileCompletion.js

### 6. Positioning aligned to the concept (international students at mission level only)
Copy across landing, About, dashboard, brand tagline, and digital FAQ now embodies:
build real experience -> verified proof -> get discovered by recruiters, wherever you are.
International students are named explicitly only in the About mission. No visa/F-1/OPT/CPT/SSN
language anywhere. Pronunciation cue "(loomie)" added to landing + About.
- src/Pages/LandingPage.jsx, About.jsx, user/dashboard.jsx, auth/Logout.jsx,
  digital/DigitalSolutionsHome.jsx, components/PWAInstallPrompt.jsx

### 7. Everyone treated as international talent; Jobs filter by location only
Removed visa/sponsorship filters and badges from the jobs board and post-job form.
- src/Pages/Jobs.jsx, PostJobs.jsx

### 8. Finance / Banking / Housing discontinued
All 9 module files deleted (they were already unrouted). /finance, /banking, /housing
redirects to dashboard remain in App.jsx.

### 9. Auto-generated projects with lead recruitment
Admin generates software/AI projects (no physical prototypes; hardware ideas reframed
as software/simulation). They publish in `lead_recruitment` — visible to all, only
"Apply to Lead" available (anyone, no badge gate). First applicant auto-confirms as lead
and owner, then refines everything (title, description, goals, roles) and opens the team.
The lead's role is Project Lead only; on completion they earn a Leadership badge while
contributors earn badges in their own tracks.
Lifecycle: lead_recruitment -> setup -> active -> completed.
- NEW src/utils/projectGenerator.js, Pages/admin/GenerateProject.jsx, Pages/projects/ProjectSetup.jsx
- src/Pages/projects/ProjectDetail.jsx, ProjectsListing.jsx
- src/App.jsx (routes: /projects/generate [admin], /projects/:projectId/setup)
- src/Pages/About.jsx (#how-it-works anchor for the "learn about roles" link)

================================================================
## NOTES
================================================================
- "Admin" = users/{uid}.role === 'admin' (Firestore).
- Existing accounts aren't locked out; if required fields are missing they're prompted
  to complete the profile the first time they create or join.
- LEGAL: have an immigration attorney vet any "build experience safely" framing before
  it becomes a headline promise to students.
- COMPETITOR: a live platform, Talenvo (talenvo.co), targets nearly this exact concept
  (African tech talent + real projects + portfolios + jobs). Worth studying for
  differentiation — your enforced badge gating, lead-recruitment auto-projects, and
  free/visa-safe model are your distinct angles.
