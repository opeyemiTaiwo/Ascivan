// src/utils/foundationsContent.js
// The Foundations curriculum: short, gated checklists per track that funnel a
// newcomer from "no skills" to "ready to join a project".
//
// Each item links to a free (or free-to-audit) external course. The learner opens
// it, then returns and marks it complete. Items are deliberately SHORT/beginner —
// Foundations is a GATE, not a place to spend 300 hours. Bigger certifications are
// noted as optional "go deeper", never as the gate.
//
// HOW TO EDIT: each item = { id, title, provider, duration, url, optional? }.
// Keep ~4-5 required items per track. Set optional:true for "go deeper" extras
// that do NOT block completion.
//
// Keys match the track ids from roleTaxonomy.js (plus 'universal' and 'notsure').

export const FOUNDATIONS = {
  universal: {
    label: 'Start Here',
    intro: 'A few essentials everyone on Ascivan should know before joining a project.',
    items: [
      { id: 'u1', title: 'Introduction to GitHub', provider: 'GitHub Skills', duration: '1-2 hrs', url: 'https://skills.github.com/#first-day-on-github' },
      { id: 'u2', title: 'Make your first open-source contribution', provider: 'First Contributions', duration: '~1 hr', url: 'https://firstcontributions.github.io/' },
      { id: 'u3', title: 'Git & GitHub: getting started', provider: 'GitHub Docs', duration: 'Reference', url: 'https://docs.github.com/en/get-started' },
    ],
  },

  TechDev: {
    label: 'Coding Developer Foundations',
    intro: 'The basics of writing and shipping software, enough to join your first dev project.',
    items: [
      { id: 'dev1', title: 'Foundations: programming basics', provider: 'The Odin Project', duration: 'Self-paced', url: 'https://www.theodinproject.com/paths/foundations/courses/foundations' },
      { id: 'dev2', title: 'Responsive Web Design (HTML & CSS)', provider: 'freeCodeCamp', duration: 'Self-paced', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { id: 'dev3', title: 'Learn React', provider: 'Scrimba', duration: '~12 hrs', url: 'https://scrimba.com/learn-react-c0e' },
      { id: 'dev4', title: 'Back End Development & APIs', provider: 'freeCodeCamp', duration: 'Self-paced', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/' },
      { id: 'dev5', title: 'JavaScript30 (practice)', provider: 'Wes Bos', duration: '30 days', url: 'https://javascript30.com/', optional: true },
    ],
  },

  TechArchs: {
    label: 'Low/No-Code Developer Foundations',
    intro: 'Build working products without writing code, enough to join your first no-code project.',
    items: [
      { id: 'arch1', title: 'Bubble Academy (no-code fundamentals)', provider: 'Bubble', duration: 'Self-paced', url: 'https://bubble.io/academy' },
      { id: 'arch2', title: 'Webflow 101 Crash Course', provider: 'Webflow University', duration: '~5 hrs', url: 'https://university.webflow.com/course/webflow-101' },
      { id: 'arch3', title: 'Workflow automation', provider: 'Zapier Learn', duration: 'Self-paced', url: 'https://zapier.com/learn' },
      { id: 'arch4', title: 'Databases with Airtable', provider: 'Airtable Academy', duration: 'Self-paced', url: 'https://www.airtable.com/academy' },
      { id: 'arch5', title: 'Build mobile apps: Glide quick start', provider: 'Glide', duration: 'Self-paced', url: 'https://www.glideapps.com/docs', optional: true },
    ],
  },

  TechQA: {
    label: 'Quality Tester Foundations',
    intro: 'How to ensure software quality, enough to join your first QA project.',
    items: [
      { id: 'qa1', title: 'Software Testing Tutorial', provider: 'Guru99', duration: 'Self-paced', url: 'https://www.guru99.com/software-testing.html' },
      { id: 'qa2', title: 'Writing test cases', provider: 'Guru99', duration: 'Self-paced', url: 'https://www.guru99.com/test-case.html' },
      { id: 'qa3', title: 'Bug reporting & testing guides', provider: 'BrowserStack', duration: 'Self-paced', url: 'https://www.browserstack.com/guide' },
      { id: 'qa4', title: 'Beginner test automation', provider: 'Test Automation University', duration: 'Self-paced', url: 'https://testautomationu.applitools.com/learningpaths.html' },
    ],
  },

  TechGuard: {
    label: 'Network & Cybersecurity Foundations',
    intro: 'Security, networking, cloud and DevOps basics, enough to join your first security project.',
    items: [
      { id: 'guard1', title: 'Introduction to Cybersecurity', provider: 'Cisco Skills for All', duration: '~6 hrs', url: 'https://www.netacad.com/courses/introduction-to-cybersecurity' },
      { id: 'guard2', title: 'Networking Basics', provider: 'Cisco Skills for All', duration: '~20 hrs', url: 'https://www.netacad.com/courses/networking-basics' },
      { id: 'guard3', title: 'Azure Fundamentals (cloud)', provider: 'Microsoft Learn', duration: 'Self-paced', url: 'https://learn.microsoft.com/training/paths/azure-fundamentals-describe-cloud-concepts/' },
      { id: 'guard4', title: 'Introduction to DevOps', provider: 'Microsoft Learn', duration: 'Self-paced', url: 'https://learn.microsoft.com/training/modules/describe-devops/' },
      { id: 'guard5', title: 'Google Cybersecurity Certificate (audit, go deeper)', provider: 'Coursera', duration: 'Audit free', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', optional: true },
    ],
  },

  TechPO: {
    label: 'Product / Project Owner Foundations',
    intro: 'Own a product and steer a project, enough to lead your first one.',
    items: [
      { id: 'po1', title: 'Agile Coach (product/agile basics)', provider: 'Atlassian', duration: 'Self-paced', url: 'https://www.atlassian.com/agile' },
      { id: 'po2', title: 'Writing user stories', provider: 'Atlassian', duration: '~30 mins', url: 'https://www.atlassian.com/agile/project-management/user-stories' },
      { id: 'po3', title: 'Agile project management', provider: 'Atlassian', duration: 'Self-paced', url: 'https://www.atlassian.com/agile/project-management' },
      { id: 'po4', title: 'Product analytics basics', provider: 'Google Analytics Academy', duration: 'Self-paced', url: 'https://analytics.google.com/analytics/academy/' },
      { id: 'po5', title: 'Google Project Management Certificate (audit, go deeper)', provider: 'Coursera', duration: 'Audit free', url: 'https://www.coursera.org/professional-certificates/google-project-management', optional: true },
    ],
  },

  TechLeads: {
    label: 'Non-Technical Roles Foundations',
    intro: 'Contribute to tech teams without coding, enough to join your first project.',
    items: [
      { id: 'lead1', title: 'Technical Writing One', provider: 'Google', duration: '~2 hrs', url: 'https://developers.google.com/tech-writing/one' },
      { id: 'lead2', title: 'Markdown & documentation basics', provider: 'Markdown Guide', duration: '~2 hrs', url: 'https://www.markdownguide.org/basic-syntax/' },
      { id: 'lead3', title: 'Agile fundamentals', provider: 'Atlassian', duration: 'Self-paced', url: 'https://www.atlassian.com/agile' },
      { id: 'lead4', title: 'Team collaboration playbook', provider: 'Atlassian', duration: 'Self-paced', url: 'https://www.atlassian.com/team-playbook' },
      { id: 'lead5', title: 'Make your first open-source contribution', provider: 'First Contributions', duration: '~1 hr', url: 'https://firstcontributions.github.io/' },
    ],
  },

  notsure: {
    label: 'Discover Your Track',
    intro: 'Not sure where you fit? Build some basics and get oriented, then pick a track.',
    items: [
      { id: 'ns1', title: 'Computer & digital basics', provider: 'GCFGlobal', duration: 'Self-paced', url: 'https://edu.gcfglobal.org/en/topics/computers/' },
      { id: 'ns2', title: 'AI for Everyone (audit)', provider: 'DeepLearning.AI', duration: 'Audit free', url: 'https://www.coursera.org/learn/ai-for-everyone' },
      { id: 'ns3', title: 'Learning How to Learn (audit)', provider: 'Coursera', duration: 'Audit free', url: 'https://www.coursera.org/learn/learning-how-to-learn' },
    ],
  },
};

// Resolve the right checklist for a user's track (falls back to 'notsure').
export const foundationsForTrack = (trackId) => {
  if (!trackId) return FOUNDATIONS.notsure;
  return FOUNDATIONS[trackId] || FOUNDATIONS.notsure;
};
