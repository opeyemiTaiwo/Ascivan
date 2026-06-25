// src/utils/projectTemplates.js
// A free, built-in library of software/AI starter projects — no API, no cost.
// Each template matches the shape returned by generateProject() so the admin
// "Generate" flow can publish either an AI-generated project OR a template.
//
// Rules followed by every template (same as the AI prompt):
//  - Any-tech or AI-based, buildable as SOFTWARE or a SIMULATION only.
//  - No physical prototypes/hardware. Hardware ideas are framed as software/simulation.
//  - Roles are contributor roles only (NO Project Lead — leadership is separate).
//  - experienceLevel is one of: any-level | beginner | intermediate | advanced.

const R = (role, skills, count, experienceLevel, description = '') => ({
  role, skills, count, experienceLevel, description, detailsLink: '',
});

export const PROJECT_TEMPLATES = [
  {
    projectTitle: 'Community Skill-Swap Web App',
    industryTrack: 'education',
    projectDescription: 'A web app where people offer a skill they can teach and request one they want to learn, then get matched into pairs or small groups. Includes profiles, a matching feed, and in-app scheduling. Software only.',
    projectGoals: 'Ship a working match-and-schedule flow that connects at least two complementary users end to end.',
    proposedRoles: [
      R('Developer', 'React, Firebase, REST APIs', 2, 'any-level', 'Build the matching feed, profiles, and scheduling UI.'),
      R('Designer', 'UI/UX, Figma, responsive design', 1, 'beginner', 'Design the onboarding and match screens.'),
      R('QA Tester', 'Test cases, bug reporting', 1, 'any-level', 'Verify the match-and-schedule flow across devices.'),
    ],
  },
  {
    projectTitle: 'AI Study-Notes Summarizer',
    industryTrack: 'education',
    projectDescription: 'A tool that takes long lecture notes or articles and produces concise summaries, flashcards, and quiz questions using an AI text model. Web-based; no hardware.',
    projectGoals: 'Turn a pasted document into a summary plus 5 auto-generated flashcards reliably.',
    proposedRoles: [
      R('Developer', 'JavaScript, LLM/API integration', 2, 'intermediate', 'Wire the summarization and flashcard generation.'),
      R('Data Analyst', 'Prompt design, evaluation', 1, 'any-level', 'Tune prompts and measure summary quality.'),
      R('Designer', 'Clean reading UI', 1, 'beginner', 'Design the notes-in, cards-out experience.'),
    ],
  },
  {
    projectTitle: 'Personal Finance Budget Tracker',
    industryTrack: 'finance',
    projectDescription: 'A budgeting web app where users log income and expenses, set category budgets, and see monthly trends in charts. Pure software with local or cloud data.',
    projectGoals: 'Let a user add transactions and see an accurate monthly breakdown by category.',
    proposedRoles: [
      R('Developer', 'React, charts, state management', 2, 'any-level', 'Build transaction entry and the dashboard charts.'),
      R('Designer', 'Data visualization, UI', 1, 'beginner', 'Design clear charts and the budget setup flow.'),
      R('QA Tester', 'Edge cases, validation', 1, 'beginner', 'Test calculations and input validation.'),
    ],
  },
  {
    projectTitle: 'AI Resume & Cover Letter Assistant',
    industryTrack: 'technology',
    projectDescription: 'A web tool that reviews a pasted resume against a job description and suggests improvements, plus drafts a tailored cover letter with an AI model. Software only.',
    projectGoals: 'Produce specific, actionable resume feedback and a draft cover letter from two text inputs.',
    proposedRoles: [
      R('Developer', 'Frontend, API integration', 2, 'intermediate', 'Build the input flow and AI integration.'),
      R('Data Analyst', 'Prompt engineering', 1, 'any-level', 'Design prompts for useful, honest feedback.'),
      R('Designer', 'Form and results UI', 1, 'beginner', 'Design the review and output screens.'),
    ],
  },
  {
    projectTitle: 'Telemedicine Appointment Simulator',
    industryTrack: 'healthcare',
    projectDescription: 'A simulated telehealth booking and virtual-waiting-room app: patients pick a provider, book a slot, and join a mock video room. A software simulation — no real medical devices or data.',
    projectGoals: 'Complete a simulated booking from provider selection to a mock consult room.',
    proposedRoles: [
      R('Developer', 'React, scheduling logic', 2, 'intermediate', 'Build booking and the simulated waiting room.'),
      R('Designer', 'Accessible healthcare UI', 1, 'any-level', 'Design clear, accessible booking screens.'),
      R('QA Tester', 'Flow and accessibility testing', 1, 'beginner', 'Test the booking flow and accessibility.'),
    ],
  },
  {
    projectTitle: 'Smart Habit-Tracker with Streaks',
    industryTrack: 'technology',
    projectDescription: 'A habit-tracking app with daily check-ins, streaks, reminders, and progress charts. Optional AI nudges that suggest the best time to do a habit. Software only.',
    projectGoals: 'Track a habit daily, maintain a streak, and visualize a week of progress.',
    proposedRoles: [
      R('Developer', 'Mobile-first web, notifications', 2, 'any-level', 'Build check-ins, streaks, and charts.'),
      R('Designer', 'Motivational UI', 1, 'beginner', 'Design the streak and progress visuals.'),
    ],
  },
  {
    projectTitle: 'E-commerce Product Recommendation Engine',
    industryTrack: 'ecommerce',
    projectDescription: 'A recommendation module that suggests related products based on browsing and cart behavior, with a small demo storefront to showcase it. Software only.',
    projectGoals: 'Show relevant "you may also like" suggestions driven by user behavior in a demo store.',
    proposedRoles: [
      R('Developer', 'JavaScript, recommendation logic', 2, 'intermediate', 'Build the demo store and recommendation module.'),
      R('Data Analyst', 'Behavioral data, basic ML', 1, 'intermediate', 'Design the recommendation approach.'),
      R('QA Tester', 'Scenario testing', 1, 'beginner', 'Validate recommendations across scenarios.'),
    ],
  },
  {
    projectTitle: 'AI Customer-Support Chatbot',
    industryTrack: 'technology',
    projectDescription: 'A website chatbot that answers FAQs from a knowledge base and hands off to a human when unsure, using an AI text model. Web widget; software only.',
    projectGoals: 'Answer common questions from a small knowledge base and escalate gracefully.',
    proposedRoles: [
      R('Developer', 'Chat UI, API integration', 2, 'intermediate', 'Build the widget and AI integration.'),
      R('Data Analyst', 'Knowledge base, prompts', 1, 'any-level', 'Curate the knowledge base and test answers.'),
      R('Designer', 'Conversational UI', 1, 'beginner', 'Design the chat widget.'),
    ],
  },
  {
    projectTitle: 'Open-Source Event Management Platform',
    industryTrack: 'nonprofit',
    projectDescription: 'A platform for community organizers to create events, sell or issue free tickets, and check in attendees with a QR scan (camera-based, no special hardware). Software only.',
    projectGoals: 'Create an event, register attendees, and check them in with a QR scan.',
    proposedRoles: [
      R('Developer', 'Full-stack, QR scanning', 2, 'intermediate', 'Build event creation, tickets, and check-in.'),
      R('Designer', 'Event and ticket UI', 1, 'beginner', 'Design event pages and tickets.'),
      R('QA Tester', 'End-to-end testing', 1, 'any-level', 'Test the full event lifecycle.'),
    ],
  },
  {
    projectTitle: 'Cybersecurity Phishing-Awareness Trainer',
    industryTrack: 'cybersecurity',
    projectDescription: 'An interactive training app that shows simulated phishing emails and teaches users to spot red flags, tracking their score over time. A safe simulation — no real attacks.',
    projectGoals: 'Run a user through simulated phishing examples and report what they missed.',
    proposedRoles: [
      R('Developer', 'Frontend, scoring logic', 2, 'any-level', 'Build the simulation and scoring.'),
      R('Security Specialist', 'Phishing patterns, content', 1, 'intermediate', 'Design realistic, educational examples.'),
      R('Designer', 'Learning UI', 1, 'beginner', 'Design the training and results screens.'),
    ],
  },
  {
    projectTitle: 'AI Image Caption & Alt-Text Generator',
    industryTrack: 'technology',
    projectDescription: 'A tool that generates descriptive captions and accessibility alt-text for uploaded images using an AI vision model, to help creators make content accessible. Software only.',
    projectGoals: 'Generate accurate, useful alt-text for an uploaded image.',
    proposedRoles: [
      R('Developer', 'Image upload, vision API', 2, 'intermediate', 'Build upload and caption generation.'),
      R('Data Analyst', 'Quality evaluation', 1, 'any-level', 'Assess and improve caption accuracy.'),
      R('Designer', 'Accessible UI', 1, 'beginner', 'Design an accessible interface.'),
    ],
  },
  {
    projectTitle: 'Local Farmers-Market Marketplace',
    industryTrack: 'agriculture',
    projectDescription: 'A marketplace connecting local growers with buyers: vendor listings, search by produce, and order requests with pickup scheduling. Software only.',
    projectGoals: 'Let a buyer find a local vendor and place a pickup order request.',
    proposedRoles: [
      R('Developer', 'Marketplace, search', 2, 'any-level', 'Build listings, search, and ordering.'),
      R('Designer', 'Marketplace UI', 1, 'beginner', 'Design vendor and product pages.'),
      R('QA Tester', 'Order flow testing', 1, 'beginner', 'Test search and ordering.'),
    ],
  },
  {
    projectTitle: 'Mental-Wellness Mood Journal',
    industryTrack: 'healthcare',
    projectDescription: 'A private journaling app where users log daily mood, add notes, and see gentle trends over time, with optional AI-written reflective prompts. Software only; not a medical device.',
    projectGoals: 'Log moods over a week and surface a simple, supportive trend view.',
    proposedRoles: [
      R('Developer', 'React, privacy-first storage', 2, 'any-level', 'Build journaling and trend views.'),
      R('Designer', 'Calm, supportive UI', 1, 'beginner', 'Design a warm, private experience.'),
    ],
  },
  {
    projectTitle: 'Smart-City Traffic Flow Simulation',
    industryTrack: 'transportation',
    projectDescription: 'A browser-based simulation of traffic at an intersection where users adjust signal timing and watch the effect on congestion. A pure software simulation — no sensors or hardware.',
    projectGoals: 'Simulate an intersection and show how signal timing changes congestion.',
    proposedRoles: [
      R('Developer', 'Canvas/animation, simulation logic', 2, 'intermediate', 'Build the simulation engine and controls.'),
      R('Data Analyst', 'Traffic modeling', 1, 'intermediate', 'Design the congestion model.'),
      R('Designer', 'Controls and visualization', 1, 'beginner', 'Design the simulation UI.'),
    ],
  },
  {
    projectTitle: 'Real Estate Listings Aggregator',
    industryTrack: 'realestate',
    projectDescription: 'A web app that aggregates property listings into one searchable interface with filters, map view, and saved searches. Uses sample or public data. Software only.',
    projectGoals: 'Search listings by filters and save a search to revisit.',
    proposedRoles: [
      R('Developer', 'Search, maps integration', 2, 'intermediate', 'Build search, filters, and map view.'),
      R('Designer', 'Listings UI', 1, 'beginner', 'Design search results and detail pages.'),
      R('QA Tester', 'Filter testing', 1, 'beginner', 'Validate filters and saved searches.'),
    ],
  },
  {
    projectTitle: 'AI Code-Review Helper',
    industryTrack: 'technology',
    projectDescription: 'A tool where developers paste a code snippet and get AI feedback on bugs, style, and improvements, with explanations. Web-based; software only.',
    projectGoals: 'Return useful, specific review comments on a pasted snippet.',
    proposedRoles: [
      R('Developer', 'Frontend, AI integration', 2, 'intermediate', 'Build the paste-and-review flow.'),
      R('Data Analyst', 'Prompt design, evaluation', 1, 'any-level', 'Tune prompts for accurate reviews.'),
    ],
  },
  {
    projectTitle: 'Volunteer Matching Platform',
    industryTrack: 'nonprofit',
    projectDescription: 'A platform matching volunteers with nonprofit opportunities by skills, availability, and location, with application tracking. Software only.',
    projectGoals: 'Match a volunteer to a relevant opportunity and track the application.',
    proposedRoles: [
      R('Developer', 'Matching, full-stack', 2, 'any-level', 'Build matching and application tracking.'),
      R('Designer', 'Onboarding UI', 1, 'beginner', 'Design volunteer and org flows.'),
      R('QA Tester', 'Matching tests', 1, 'beginner', 'Test matching and applications.'),
    ],
  },
  {
    projectTitle: 'Inventory Management Dashboard',
    industryTrack: 'manufacturing',
    projectDescription: 'A dashboard for small businesses to track stock levels, set low-stock alerts, and view turnover reports. Pure software with sample or cloud data.',
    projectGoals: 'Track stock, trigger a low-stock alert, and show a turnover report.',
    proposedRoles: [
      R('Developer', 'Dashboards, data tables', 2, 'any-level', 'Build inventory tracking and reports.'),
      R('Data Analyst', 'Reporting, metrics', 1, 'beginner', 'Design turnover reports.'),
      R('Designer', 'Dashboard UI', 1, 'beginner', 'Design the dashboard.'),
    ],
  },
  {
    projectTitle: 'AI Language-Learning Conversation Partner',
    industryTrack: 'education',
    projectDescription: 'A chat app where learners practice a new language with an AI partner that adapts to their level and corrects mistakes gently. Software only.',
    projectGoals: 'Hold a short adaptive conversation and give helpful corrections.',
    proposedRoles: [
      R('Developer', 'Chat UI, AI integration', 2, 'intermediate', 'Build the conversation experience.'),
      R('Data Analyst', 'Prompt and level design', 1, 'any-level', 'Design level-appropriate prompts.'),
      R('Designer', 'Learning UI', 1, 'beginner', 'Design the chat and feedback UI.'),
    ],
  },
  {
    projectTitle: 'Carbon Footprint Calculator',
    industryTrack: 'energy',
    projectDescription: 'A web app where users answer questions about travel, diet, and energy use to estimate their carbon footprint, with tips to reduce it. Software only.',
    projectGoals: 'Estimate a footprint from user answers and suggest reductions.',
    proposedRoles: [
      R('Developer', 'Forms, calculation logic', 2, 'any-level', 'Build the questionnaire and results.'),
      R('Data Analyst', 'Emissions modeling', 1, 'beginner', 'Design the calculation model.'),
      R('Designer', 'Results visualization', 1, 'beginner', 'Design results and tips.'),
    ],
  },
  {
    projectTitle: 'Freelancer Invoice & Time Tracker',
    industryTrack: 'finance',
    projectDescription: 'A tool for freelancers to track billable hours per client and generate professional invoices as PDFs. Software only.',
    projectGoals: 'Track time for a client and export a clean invoice.',
    proposedRoles: [
      R('Developer', 'Time tracking, PDF export', 2, 'any-level', 'Build tracking and invoice generation.'),
      R('Designer', 'Invoice templates, UI', 1, 'beginner', 'Design invoices and the tracker UI.'),
      R('QA Tester', 'Calculation testing', 1, 'beginner', 'Verify totals and exports.'),
    ],
  },
  {
    projectTitle: 'AI Meeting-Notes Summarizer',
    industryTrack: 'technology',
    projectDescription: 'A tool that takes a meeting transcript and produces a summary, action items, and decisions using an AI model. Software only.',
    projectGoals: 'Turn a transcript into a summary with clear action items.',
    proposedRoles: [
      R('Developer', 'Frontend, AI integration', 2, 'intermediate', 'Build transcript-in, summary-out.'),
      R('Data Analyst', 'Prompt design', 1, 'any-level', 'Tune prompts for accurate action items.'),
    ],
  },
  {
    projectTitle: 'Accessibility Audit Browser Tool',
    industryTrack: 'technology',
    projectDescription: 'A tool that scans a web page and reports accessibility issues (contrast, alt-text, headings) with fixes. Software only.',
    projectGoals: 'Scan a page and produce a prioritized accessibility report.',
    proposedRoles: [
      R('Developer', 'DOM analysis, reporting', 2, 'intermediate', 'Build the scanner and report.'),
      R('QA Tester', 'Accessibility standards', 1, 'any-level', 'Validate against WCAG basics.'),
      R('Designer', 'Report UI', 1, 'beginner', 'Design the audit report.'),
    ],
  },
  {
    projectTitle: 'Recipe Planner with Grocery Lists',
    industryTrack: 'food',
    projectDescription: 'A meal-planning app where users pick recipes for the week and get an auto-generated, de-duplicated grocery list. Software only.',
    projectGoals: 'Plan a week of meals and generate a combined grocery list.',
    proposedRoles: [
      R('Developer', 'Planning, list logic', 2, 'any-level', 'Build planning and list generation.'),
      R('Designer', 'Planner UI', 1, 'beginner', 'Design the weekly planner.'),
    ],
  },
  {
    projectTitle: 'Job Application Tracker (Kanban)',
    industryTrack: 'technology',
    projectDescription: 'A Kanban board for job seekers to track applications across stages (applied, interview, offer), with notes and reminders. Software only.',
    projectGoals: 'Move an application across stages and set a reminder.',
    proposedRoles: [
      R('Developer', 'Drag-and-drop, state', 2, 'any-level', 'Build the board and reminders.'),
      R('Designer', 'Kanban UI', 1, 'beginner', 'Design the board and cards.'),
      R('QA Tester', 'Board testing', 1, 'beginner', 'Test stage moves and reminders.'),
    ],
  },
  {
    projectTitle: 'Fitness Workout Planner & Logger',
    industryTrack: 'healthcare',
    projectDescription: 'An app to build workout routines, log sessions, and track progress over time with charts. Software only; not a medical device.',
    projectGoals: 'Create a routine, log a session, and view progress.',
    proposedRoles: [
      R('Developer', 'Logging, charts', 2, 'any-level', 'Build routines, logging, and charts.'),
      R('Designer', 'Fitness UI', 1, 'beginner', 'Design the planner and logs.'),
    ],
  },
  {
    projectTitle: 'Digital Twin: Warehouse Robot Simulation',
    industryTrack: 'manufacturing',
    projectDescription: 'A browser simulation of robots moving items through a warehouse, where users tweak routes and see efficiency. A software digital twin — no physical robots.',
    projectGoals: 'Simulate item-picking routes and report efficiency changes.',
    proposedRoles: [
      R('Developer', 'Simulation, animation', 2, 'intermediate', 'Build the warehouse simulation.'),
      R('Data Analyst', 'Routing/optimization', 1, 'intermediate', 'Design the routing logic.'),
      R('Designer', 'Simulation UI', 1, 'beginner', 'Design controls and visuals.'),
    ],
  },
  {
    projectTitle: 'Peer Code-Mentorship Matching',
    industryTrack: 'education',
    projectDescription: 'A platform matching junior developers with mentors by tech stack and goals, with session scheduling and feedback. Software only.',
    projectGoals: 'Match a mentee to a mentor and schedule a first session.',
    proposedRoles: [
      R('Developer', 'Matching, scheduling', 2, 'any-level', 'Build matching and scheduling.'),
      R('Mentor', 'Program design', 1, 'any-level', 'Shape the mentorship flow and norms.'),
      R('Designer', 'Onboarding UI', 1, 'beginner', 'Design mentor/mentee flows.'),
    ],
  },
  {
    projectTitle: 'AI Sentiment Dashboard for Reviews',
    industryTrack: 'marketing',
    projectDescription: 'A dashboard that ingests product reviews and shows sentiment trends and common themes using AI text analysis. Software only.',
    projectGoals: 'Analyze a batch of reviews and visualize sentiment and themes.',
    proposedRoles: [
      R('Developer', 'Dashboards, AI integration', 2, 'intermediate', 'Build ingestion and the dashboard.'),
      R('Data Analyst', 'NLP, evaluation', 1, 'intermediate', 'Design the sentiment analysis.'),
      R('Designer', 'Data viz UI', 1, 'beginner', 'Design the dashboard.'),
    ],
  },
];

// Return a random template in the same shape as generateProject().
export const getRandomTemplate = () => {
  const t = PROJECT_TEMPLATES[Math.floor(Math.random() * PROJECT_TEMPLATES.length)];
  // Deep-ish copy so the caller can edit roles without mutating the library.
  return {
    projectTitle: t.projectTitle,
    projectDescription: t.projectDescription,
    projectGoals: t.projectGoals,
    industryTrack: t.industryTrack,
    proposedRoles: t.proposedRoles.map(r => ({ ...r })),
  };
};

export const TEMPLATE_COUNT = PROJECT_TEMPLATES.length;
