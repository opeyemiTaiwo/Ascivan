// src/utils/foundationsLessons.js
// On-platform Foundations lessons. Each track has topics; each topic has a few
// subtopics explained in plain, simple language, with optional inline SVG diagrams.
// No external links, no videos required - learners read and learn without leaving.
//
// SHAPE:
//   LESSONS[trackId] = {
//     label, intro,
//     topics: [
//       { id, title, summary, subtopics: [ { heading, body, diagram? } ], optional? }
//     ]
//   }
//
// `body` is plain text (kept simple but accurate). `diagram` is an inline SVG string.
// Keep it concise; important points covered, no contradictions. Refine over time.

// A few reusable tiny diagrams (inline SVG, theme-neutral).
const D = {
  flow: (a, b, c) => `<svg viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg" role="img" style="max-width:100%">
    <rect x="6" y="20" width="96" height="30" rx="6" fill="#eff6ff" stroke="#2563eb"/>
    <text x="54" y="39" font-size="11" text-anchor="middle" fill="#1e3a8a">${a}</text>
    <line x1="106" y1="35" x2="128" y2="35" stroke="#9ca3af" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="132" y="20" width="96" height="30" rx="6" fill="#fff7ed" stroke="#ea580c"/>
    <text x="180" y="39" font-size="11" text-anchor="middle" fill="#9a3412">${b}</text>
    <line x1="232" y1="35" x2="254" y2="35" stroke="#9ca3af" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="258" y="20" width="96" height="30" rx="6" fill="#ecfdf5" stroke="#059669"/>
    <text x="306" y="39" font-size="11" text-anchor="middle" fill="#065f46">${c}</text>
    <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#9ca3af"/></marker></defs>
  </svg>`,
};

export const LESSONS = {
  // ============================ TECH DEV ============================
  TechDev: {
    label: 'Coding Developer Foundations',
    intro: 'Learn the basics of writing software, step by step, in plain language. Read each topic, then mark it complete.',
    topics: [
      {
        id: 'dev-what-is-programming',
        title: 'What programming actually is',
        summary: 'Telling a computer exactly what to do, one clear step at a time.',
        subtopics: [
          { heading: 'A computer only follows instructions', body: 'A computer is not smart on its own. It does exactly what it is told, in the exact order it is told, and nothing more. Programming is the act of writing those instructions in a language the computer understands. Think of it like writing a very precise recipe: if you skip a step or put steps in the wrong order, you get the wrong result.' },
          { heading: 'Code is just text with rules', body: 'A program is plain text that follows strict grammar rules (called syntax). If you break the rules - a missing bracket, a misspelled word - the computer cannot guess what you meant and stops with an error. Learning to code is partly learning to be precise and patient with these rules.' },
          { heading: 'Programs take input, do work, give output', body: 'Almost every program follows the same shape: it takes something in (input), does something with it (processing), and gives something back (output). A calculator takes numbers, adds them, and shows the total. Keep this shape in mind and any program becomes easier to understand.', diagram: D.flow('Input', 'Process', 'Output') },
        ],
      },
      {
        id: 'dev-core-building-blocks',
        title: 'The core building blocks',
        summary: 'Variables, conditions, loops, and functions - the four ideas behind almost all code.',
        subtopics: [
          { heading: 'Variables: labelled boxes', body: 'A variable is a named box where you store a piece of information so you can use it later. If you write age = 10, the box called "age" now holds 10. Later you can change it, read it, or do maths with it. Variables let a program remember things.' },
          { heading: 'Conditions: making decisions', body: 'Code often needs to choose between paths. That is what an "if" statement does: IF it is raining, take an umbrella, ELSE wear sunglasses. The computer checks whether something is true, then runs the matching block. This is how programs react differently to different situations.' },
          { heading: 'Loops: repeating work', body: 'A loop repeats the same steps many times without you writing them out again. "For each item in the shopping list, buy it" is a loop. Loops let a few lines of code handle one item or ten thousand items with no extra effort.' },
          { heading: 'Functions: reusable mini-machines', body: 'A function is a named set of steps you can run whenever you want. You build it once - say, a function that makes a cup of tea - then call it by name any time instead of rewriting all the steps. Functions keep code short, organised, and easy to fix.' },
        ],
      },
      {
        id: 'dev-web-basics',
        title: 'How websites are built (HTML, CSS, JavaScript)',
        summary: 'The three languages of the web and what each one does.',
        subtopics: [
          { heading: 'HTML is the structure', body: 'HTML is the skeleton of a web page. It says "this is a heading, this is a paragraph, this is a button, this is an image." It does not care how things look - only what they are. Without HTML there is no page.' },
          { heading: 'CSS is the style', body: 'CSS decorates the HTML skeleton: colours, fonts, spacing, layout, what looks good on a phone versus a laptop. Same HTML, different CSS, completely different look. HTML is the house frame; CSS is the paint, furniture, and decoration.' },
          { heading: 'JavaScript is the behaviour', body: 'JavaScript makes pages do things: respond to clicks, show pop-ups, load new content without refreshing, validate a form. If HTML is structure and CSS is style, JavaScript is the action and interactivity.', diagram: D.flow('HTML', 'CSS', 'JavaScript') },
        ],
      },
      {
        id: 'dev-python',
        title: 'Python, explained simply',
        summary: 'A beginner-friendly language used for web apps, data, and AI.',
        subtopics: [
          { heading: 'Why people love Python', body: 'Python reads almost like plain English, which makes it one of the friendliest first languages. You write less to do more, and the rules are forgiving compared to many other languages. That is why it is hugely popular for beginners and experts alike.' },
          { heading: 'What Python is used for', body: 'Python is everywhere: building websites (the back end), automating boring tasks, analysing data, and powering most modern AI and machine learning. Learning Python opens doors into many different tech tracks, not just one.' },
          { heading: 'A taste of Python', body: 'A tiny program might be: name = "Sam" then print("Hello " + name). The first line stores text in a box called name; the second line shows "Hello Sam" on the screen. That readable simplicity is Python in a nutshell.' },
        ],
      },
      {
        id: 'dev-apis-data',
        title: 'APIs and working with data',
        summary: 'How programs talk to each other and pass information around.',
        subtopics: [
          { heading: 'What an API is', body: 'An API is a messenger that lets two programs talk. When a weather app shows the forecast, it does not own that data - it asks a weather service through its API: "what is the weather in Lagos?" and gets an answer back. An API is like a waiter: you ask for something, it goes to the kitchen, and brings back what you ordered.', diagram: D.flow('Your app', 'API request', 'Data back') },
          { heading: 'Data formats (JSON)', body: 'When programs exchange data, they need an agreed format. The most common one is JSON - a simple way of writing information as labelled pairs, like name: "Sam", age: 10. It is just structured text that both sides understand.' },
          { heading: 'Requests and responses', body: 'Talking to an API is a request and a response. You send a request ("give me this user\'s profile"), and the API sends a response (the profile data, or an error if something went wrong). Almost all apps are built on this back-and-forth.' },
        ],
      },
      {
        id: 'dev-data-science',
        title: 'Data science basics',
        summary: 'Turning raw data into useful insight.',
        subtopics: [
          { heading: 'What data science is', body: 'Data science is the craft of looking at large amounts of information and finding patterns that help people make decisions. A shop might use it to learn which products sell together, or a hospital to spot which patients need follow-up. It blends a bit of coding, a bit of statistics, and a lot of curiosity.' },
          { heading: 'The typical workflow', body: 'Most data work follows a path: collect the data, clean it (real data is messy), explore it to spot patterns, then communicate what you found with charts or a summary. Cleaning is usually the biggest part - real-world data is full of gaps and mistakes.', diagram: D.flow('Collect', 'Clean & explore', 'Insight') },
          { heading: 'Tools you will hear about', body: 'Python is the common language, with helpers like pandas (for handling tables of data) and matplotlib (for drawing charts). You do not need them yet - just know the names so they are not scary when you meet them.' },
        ],
      },
      {
        id: 'dev-ai-ml',
        title: 'AI and machine learning basics',
        summary: 'How computers can learn from examples instead of fixed rules.',
        subtopics: [
          { heading: 'Rules vs learning', body: 'Normally you tell a computer exact rules. Machine learning flips this: instead of writing every rule, you show the computer thousands of examples and let it figure out the pattern itself. To recognise cats, you do not describe a cat - you show it many cat photos until it learns what cats tend to look like.' },
          { heading: 'Training, then predicting', body: 'Machine learning has two phases. First, training: the model studies lots of examples and adjusts itself to get better. Then, predicting: you give it something new and it makes its best guess based on what it learned. It is like teaching a child with flashcards, then testing them on a card they have not seen.', diagram: D.flow('Examples', 'Train model', 'Predict') },
          { heading: 'What "AI" really means here', body: 'Most "AI" today is machine learning that has learned from enormous amounts of data. It is powerful but not magic - it is only as good as the examples it learned from. Bad or biased examples lead to bad or biased results, which is why careful data matters so much.' },
        ],
      },
      {
        id: 'dev-computer-vision',
        title: 'Computer vision basics',
        summary: 'Teaching computers to understand images.',
        subtopics: [
          { heading: 'An image is just numbers', body: 'To a computer, a photo is a grid of tiny dots (pixels), each stored as numbers for its colour. Computer vision is the field of making sense of those numbers - finding edges, shapes, faces, or objects inside the grid.' },
          { heading: 'What it is used for', body: 'Computer vision powers face unlock on phones, self-driving cars spotting pedestrians, medical scans flagging problems, and apps that identify a plant from a photo. Anywhere a computer needs to "see," this is the field behind it.' },
          { heading: 'How it learns to see', body: 'Modern computer vision uses machine learning: show a model many labelled images ("this is a dog, this is a car") and it learns the visual patterns. Then it can look at a new image and say what is likely in it. It is the same train-then-predict idea, applied to pictures.' },
        ],
      },
      {
        id: 'dev-version-control',
        title: 'Version control with Git',
        summary: 'Saving your work safely and collaborating without chaos.',
        subtopics: [
          { heading: 'Why Git exists', body: 'When you build software, you change files constantly. Git is a tool that saves snapshots of your work over time, so you can always go back if something breaks. It is like an unlimited undo history for your whole project.' },
          { heading: 'Working with others', body: 'Git lets many people work on the same project without overwriting each other. Each person works on their own copy, then merges their changes together. This is how teams of developers build big things without stepping on each other.' },
          { heading: 'GitHub', body: 'GitHub is a website where Git projects live online. It stores your code, shows your history, and is where teams review and combine each other\'s work. On Ascivan projects, this is often where the real collaboration happens.' },
        ],
      },
    ],
  },

  // ============================ TECH ARCHS (Low/No-Code) ============================
  TechArchs: {
    label: 'Low/No-Code Developer Foundations',
    intro: 'Build real, working products using visual tools - little or no coding required.',
    topics: [
      {
        id: 'arch-what-is-nocode',
        title: 'What no-code and low-code mean',
        summary: 'Building apps by dragging and connecting instead of writing code.',
        subtopics: [
          { heading: 'No-code', body: 'No-code tools let you build software by dragging blocks, filling forms, and connecting pieces visually - no programming language needed. You design what you want on a screen and the tool builds the working app behind the scenes.' },
          { heading: 'Low-code', body: 'Low-code is the middle ground: mostly visual building, but with the option to drop in small bits of code for the tricky parts. It gives more power than pure no-code while still being much faster than writing everything by hand.' },
          { heading: 'When to use it', body: 'No-code and low-code are perfect for getting an idea working fast - a booking site, an internal tool, an app to test a business idea. They trade some flexibility for huge speed, which is often exactly the right trade.' },
        ],
      },
      {
        id: 'arch-building-blocks',
        title: 'The building blocks of a no-code app',
        summary: 'Pages, data, and logic - the three things every app needs.',
        subtopics: [
          { heading: 'Pages and screens', body: 'These are what the user sees - the visual layout of buttons, text, images, and forms. In no-code tools you design these by dragging elements onto a canvas, like building a poster.' },
          { heading: 'Data', body: 'Apps remember information - users, orders, messages. No-code tools store this in simple tables (like a spreadsheet). You define what you want to remember, and the tool handles saving and fetching it.' },
          { heading: 'Logic and workflows', body: 'This is what happens when a user acts: "when someone submits this form, save it and send an email." You set these rules visually by connecting triggers to actions.', diagram: D.flow('User action', 'Workflow rule', 'Result') },
        ],
      },
      {
        id: 'arch-automation',
        title: 'Workflow automation',
        summary: 'Making tools talk to each other so work happens by itself.',
        subtopics: [
          { heading: 'What automation is', body: 'Automation means setting up a rule once so a task happens automatically forever after. "When a new customer signs up, add them to the mailing list and send a welcome message" - done without anyone lifting a finger each time.' },
          { heading: 'Triggers and actions', body: 'Every automation is a trigger (the thing that starts it) plus one or more actions (what happens next). Tools like Zapier or Make let you connect apps this way without code, like plugging Lego pieces together.' },
        ],
      },
      {
        id: 'arch-databases',
        title: 'Data and databases (the simple version)',
        summary: 'Where your app keeps its information.',
        subtopics: [
          { heading: 'Think spreadsheets', body: 'A database, at the beginner level, is just a smart spreadsheet: rows are records (each customer), columns are details (name, email). Tools like Airtable make this friendly and visual.' },
          { heading: 'Connecting data to your app', body: 'Your pages show and edit this data. A "customers" screen reads from the customers table; a form writes new rows into it. Linking screens to data is the heart of building any app.' },
        ],
      },
      {
        id: 'arch-publish',
        title: 'Publishing and sharing your app',
        summary: 'Getting your creation in front of real users.',
        subtopics: [
          { heading: 'Going live', body: 'When your app works, you publish it - the tool puts it online at a web address you can share. Most no-code tools do this with one button.' },
          { heading: 'Test, then share', body: 'Always click through your own app as if you were a user before sharing it widely. Fixing a confusing button early is far easier than after a hundred people hit it.' },
        ],
      },
    ],
  },

  // ============================ TECH QA ============================
  TechQA: {
    label: 'Quality Tester Foundations',
    intro: 'Learn how to make sure software actually works before real users find the problems.',
    topics: [
      {
        id: 'qa-what-is-testing',
        title: 'What software testing is',
        summary: 'Checking that software does what it should - and handles what it should not.',
        subtopics: [
          { heading: 'Why testing matters', body: 'Software is built by people, and people make mistakes. Testing is the safety net: deliberately trying software to catch problems before customers do. A good tester saves a team from embarrassing, costly bugs reaching real users.' },
          { heading: 'Happy paths and edge cases', body: 'The "happy path" is when everything goes as expected (a user types a valid email). "Edge cases" are the unusual situations (empty fields, huge numbers, weird characters). Great testing means checking both - bugs love to hide in the edge cases.' },
        ],
      },
      {
        id: 'qa-test-cases',
        title: 'Writing test cases',
        summary: 'Turning "does it work?" into clear, repeatable checks.',
        subtopics: [
          { heading: 'What a test case is', body: 'A test case is a small script in plain words: the steps to do, and what should happen. For example: "Type a wrong password, click login, expect an error message." Anyone should be able to follow it and get the same result.', diagram: D.flow('Steps', 'Expected result', 'Pass / Fail') },
          { heading: 'Being specific', body: 'Good test cases leave no guessing. Instead of "check login works," write the exact input, the exact button, and the exact expected outcome. Precision is what makes testing trustworthy.' },
        ],
      },
      {
        id: 'qa-bug-reporting',
        title: 'Finding and reporting bugs',
        summary: 'Describing problems so they can actually be fixed.',
        subtopics: [
          { heading: 'A good bug report', body: 'A useful bug report says: what you did, what you expected, and what actually happened. Add the steps to reproduce it. A developer who can recreate a bug can fix it; a vague report ("it\'s broken") helps no one.' },
          { heading: 'Severity', body: 'Not all bugs are equal. A crash that loses data is serious; a slightly misaligned button is minor. Part of a tester\'s job is flagging how badly each bug matters so the team fixes the important ones first.' },
        ],
      },
      {
        id: 'qa-automation',
        title: 'Intro to test automation',
        summary: 'Letting the computer run repetitive checks for you.',
        subtopics: [
          { heading: 'Manual vs automated', body: 'Manual testing means a person clicks through the app. Automated testing means writing a small program that clicks through it for you, instantly and tirelessly. Automation shines for checks you must repeat often.' },
          { heading: 'When to automate', body: 'Automate the boring, repeated tests (does login still work after every change?). Keep humans for exploring new features and judging how something feels. The two work best together.' },
        ],
      },
    ],
  },

  // ============================ TECH GUARD ============================
  TechGuard: {
    label: 'Network & Cybersecurity Foundations',
    intro: 'Learn the basics of keeping systems safe, connected, and reliable.',
    topics: [
      {
        id: 'guard-cyber-basics',
        title: 'Cybersecurity fundamentals',
        summary: 'Protecting information and systems from harm.',
        subtopics: [
          { heading: 'What we protect', body: 'Cybersecurity protects three things: keeping data secret (only the right people see it), keeping it correct (no one tampers with it), and keeping it available (systems stay up when needed). Almost every security idea serves one of these three goals.' },
          { heading: 'Common threats', body: 'Threats include tricking people into giving away passwords (phishing), guessing weak passwords, and sneaking in harmful software (malware). Many attacks target people, not machines - which is why awareness matters as much as technology.' },
          { heading: 'Basic defences', body: 'Strong unique passwords, two-step login, keeping software updated, and being suspicious of unexpected links stop a huge share of attacks. Security is mostly good habits done consistently.' },
        ],
      },
      {
        id: 'guard-networking',
        title: 'Networking basics',
        summary: 'How computers find and talk to each other.',
        subtopics: [
          { heading: 'What a network is', body: 'A network is computers connected so they can share information. Your home wifi is a small network; the internet is a giant network of networks. Devices find each other using addresses (IP addresses), like houses on a street.' },
          { heading: 'How data travels', body: 'Information is broken into small packets, sent across the network, and reassembled at the other end - like sending a book one page at a time in separate envelopes. If a page goes missing, just that page is resent.', diagram: D.flow('Sender', 'Packets travel', 'Receiver') },
        ],
      },
      {
        id: 'guard-cloud',
        title: 'Cloud fundamentals',
        summary: 'Running software on someone else\'s computers, on demand.',
        subtopics: [
          { heading: 'What "the cloud" is', body: 'The cloud is just powerful computers in big data centres that you rent over the internet instead of owning. Need more power? Rent more. Done? Stop paying. It saves buying and maintaining your own machines.' },
          { heading: 'Why teams use it', body: 'Cloud lets a tiny team run worldwide services, scale up instantly when busy, and only pay for what they use. Providers like AWS, Azure, and Google Cloud offer these rented computers and tools.' },
        ],
      },
      {
        id: 'guard-devops',
        title: 'Intro to DevOps',
        summary: 'Getting software from a developer\'s laptop to real users smoothly.',
        subtopics: [
          { heading: 'What DevOps is', body: 'DevOps is a way of working that joins building software and running it, so updates ship quickly and reliably. The goal is to release small improvements often, with less drama and fewer surprises.' },
          { heading: 'Automating the pipeline', body: 'DevOps automates the path from code to users: test it automatically, package it, and deploy it. This "pipeline" means a change can go live safely in minutes, not weeks.', diagram: D.flow('Code', 'Test & build', 'Deploy') },
        ],
      },
    ],
  },

  // ============================ TECH PO ============================
  TechPO: {
    label: 'Product / Project Owner Foundations',
    intro: 'Learn to decide what gets built, why, and in what order - and guide it to done.',
    topics: [
      {
        id: 'po-role',
        title: 'What a product/project owner does',
        summary: 'Owning the vision and turning it into a clear plan for the team.',
        subtopics: [
          { heading: 'The owner\'s job', body: 'A product owner decides what the team should build and why it matters. They are the bridge between users (who have needs) and the team (who build solutions). They do not have to code - their value is clarity and good decisions.' },
          { heading: 'Saying no', body: 'There are always more ideas than time. A big part of the role is choosing what NOT to do right now, so the team focuses on what matters most. A good owner protects the team from doing everything at once.' },
        ],
      },
      {
        id: 'po-user-stories',
        title: 'Requirements and user stories',
        summary: 'Describing what to build from the user\'s point of view.',
        subtopics: [
          { heading: 'What a user story is', body: 'A user story is a short, simple description of a need: "As a shopper, I want to save items to a wishlist, so I can buy them later." It keeps the team focused on the real human goal, not just a feature.' },
          { heading: 'Clear "done"', body: 'Each story needs to say what "finished" means - the conditions that must be true. Without this, the team and the owner can disagree on whether something is actually done. Clear acceptance criteria prevent that.' },
        ],
      },
      {
        id: 'po-backlog',
        title: 'Managing a backlog and prioritising',
        summary: 'Keeping a sorted to-do list of everything the product needs.',
        subtopics: [
          { heading: 'The backlog', body: 'The backlog is the master list of everything that could be built, kept in priority order. The most important, ready work sits at the top; vague future ideas sit lower. The team always pulls from the top.', diagram: D.flow('Ideas in', 'Prioritise', 'Top = build next') },
          { heading: 'How to prioritise', body: 'Weigh two things: how much value something delivers, and how much effort it takes. High value, low effort goes first. This simple balance keeps the team working on what helps users most for the least cost.' },
        ],
      },
      {
        id: 'po-agile',
        title: 'Working with a team (agile basics)',
        summary: 'Building in small steps and adjusting as you learn.',
        subtopics: [
          { heading: 'Small steps over big plans', body: 'Agile means building in short cycles - deliver a small working piece, get feedback, improve. This beats spending months on a giant plan that might be wrong. You learn by shipping, not just thinking.' },
          { heading: 'Common rhythms', body: 'Teams often work in short cycles (sprints) with quick check-ins. The owner keeps the priorities clear so each cycle delivers the most useful next thing. The point is steady, visible progress.' },
        ],
      },
      {
        id: 'po-data',
        title: 'Reading data to make decisions',
        summary: 'Letting real numbers guide what to build next.',
        subtopics: [
          { heading: 'Decisions from evidence', body: 'Good owners check what users actually do, not just opinions. If almost no one uses a feature, that is a signal. Looking at simple numbers (how many people did X) leads to better choices than guessing.' },
          { heading: 'Simple metrics', body: 'Start with basic questions: how many users, how many complete a task, where do they drop off. You do not need fancy analytics - just the habit of asking "what does the data say?" before deciding.' },
        ],
      },
    ],
  },

  // ============================ TECH LEADS ============================
  TechLeads: {
    label: 'Non-Technical Roles Foundations',
    intro: 'Learn the skills that make tech teams work: writing, analysis, coordination, and communication.',
    topics: [
      {
        id: 'lead-roles',
        title: 'How non-technical roles fit in tech teams',
        summary: 'You do not need to code to be essential to a software team.',
        subtopics: [
          { heading: 'Teams need more than coders', body: 'Software teams need people to organise the work, write clear documents, talk to users, analyse results, and keep everyone aligned. These non-technical roles are the glue that turns a group of coders into a working team.' },
          { heading: 'Where you add value', body: 'If you are organised, clear, and good with people or numbers, you can lead projects, manage delivery, write documentation, do research, or analyse data. Your contribution is just as real as the code.' },
        ],
      },
      {
        id: 'lead-pm',
        title: 'Project management and agile fundamentals',
        summary: 'Keeping work organised, visible, and moving.',
        subtopics: [
          { heading: 'What project management is', body: 'It is making sure the right work happens, in the right order, by the right time. A project manager removes blockers, tracks progress, and keeps everyone pointed at the same goal.' },
          { heading: 'Boards and tasks', body: 'Teams track work on simple boards: To Do, In Progress, Done. Moving cards across gives everyone a shared, honest picture of where things stand.', diagram: D.flow('To Do', 'In Progress', 'Done') },
        ],
      },
      {
        id: 'lead-writing',
        title: 'Technical writing and documentation',
        summary: 'Explaining things clearly so others can act.',
        subtopics: [
          { heading: 'Why writing matters', body: 'Clear documents save teams huge amounts of time. A good "how to use this" guide means people stop asking the same questions. Writing well is a genuine technical skill, even with no code involved.' },
          { heading: 'Keep it simple', body: 'Good technical writing uses short sentences, plain words, and clear steps. Assume the reader is busy and new. If a sentence can be shorter, make it shorter.' },
        ],
      },
      {
        id: 'lead-data-analysis',
        title: 'Data analysis',
        summary: 'Turning numbers into clear answers people can use.',
        subtopics: [
          { heading: 'What data analysis is', body: 'Data analysis is looking at information to answer a question: "Which product sells best? When are users most active?" You gather the relevant numbers, look for patterns, and explain what they mean in plain words.' },
          { heading: 'The simple workflow', body: 'Ask a clear question, gather the data, clean it (fix gaps and errors), find the pattern, then communicate it simply. The hardest and most valuable step is usually turning a messy pile of numbers into one clear sentence.', diagram: D.flow('Question', 'Analyse data', 'Clear answer') },
          { heading: 'Charts tell the story', body: 'A good chart shows in seconds what a table of numbers hides. A simple bar or line chart often communicates a finding far better than paragraphs. Pick the chart that makes the answer obvious.' },
        ],
      },
      {
        id: 'lead-communication',
        title: 'Communication and coordinating a team',
        summary: 'Keeping everyone informed, aligned, and unblocked.',
        subtopics: [
          { heading: 'Clear updates', body: 'Good coordination means everyone knows what is happening without having to chase. Short, regular updates - what is done, what is next, what is stuck - keep a team moving smoothly.' },
          { heading: 'Listening and unblocking', body: 'Much of coordination is noticing when someone is stuck and helping them get unstuck - connecting them to the right person or removing an obstacle. A team that communicates well simply gets more done.' },
        ],
      },
    ],
  },

  // ============================ UNIVERSAL / NOT SURE ============================
  notsure: {
    label: 'Discover Your Track',
    intro: 'New to tech? Get oriented with the basics, then explore which track fits you.',
    topics: [
      {
        id: 'ns-how-tech-works',
        title: 'How software gets built',
        summary: 'The big picture of how an idea becomes an app people use.',
        subtopics: [
          { heading: 'From idea to product', body: 'Someone spots a need, decides what to build (product/project owners), people build it (developers and no-code builders), others check it works (testers), and others keep it safe and running (security and infrastructure). Non-technical roles tie it all together. Every track is a piece of this picture.' },
          { heading: 'Everyone starts somewhere', body: 'Nobody is born knowing this. Every expert began confused by the same words you might find strange now. Curiosity and steady practice matter far more than where you started.' },
        ],
      },
      {
        id: 'ns-the-tracks',
        title: 'The six tracks at a glance',
        summary: 'A quick tour so you can find where you fit.',
        subtopics: [
          { heading: 'Building tracks', body: 'TechDev (writing code), TechArchs (building with no-code/low-code tools), and TechGuard (security, networks, cloud, DevOps) are about making and protecting software.' },
          { heading: 'Guiding tracks', body: 'TechQA (testing quality), TechPO (deciding what to build), and TechLeads (managing, writing, analysing, coordinating) are about quality, direction, and teamwork. You do not need to code for these.' },
          { heading: 'Pick by what excites you', body: 'Like making things work? Try TechDev or TechArchs. Like finding problems? TechQA. Like leading and organising? TechPO or TechLeads. Like protecting systems? TechGuard. You can always change as you grow.' },
        ],
      },
    ],
  },
};


// Resolve lessons for a track id, with a sensible fallback to the discover content.
export const lessonsForTrack = (trackId) => {
  if (trackId && LESSONS[trackId]) return LESSONS[trackId];
  return LESSONS.notsure;
};
