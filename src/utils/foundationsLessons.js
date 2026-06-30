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
    intro: 'Go from zero to writing real code and contributing to a project. Each lesson explains the idea simply, shows real code, and gives you something to try yourself.',
    topics: [
      {
        id: 'dev-what-is-programming',
        title: 'What programming actually is',
        summary: 'How code works, and the mindset that makes it click.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'After this lesson you will understand how a program runs, what "syntax" means, and the input-process-output shape that every program shares. This is the mental model everything else builds on.' },
          { heading: 'A computer only follows instructions', body: 'A computer is not clever on its own. It does exactly what it is told, in the exact order, and nothing more. Programming is writing those instructions in a language the computer understands. Think of a recipe: skip a step or reorder it and you get the wrong dish. Code is the same - precise, ordered instructions.' },
          { heading: 'Code is text with strict rules (syntax)', body: 'A program is plain text that follows strict grammar called syntax. A missing bracket or a misspelled word stops everything, because the computer will not guess what you meant. This feels harsh at first, but it is also predictable: the same code always does the same thing. Most early frustration is just learning to be precise.', code: 'print("Hello")     # correct\nprint("Hello"      # ERROR: missing closing bracket' },
          { heading: 'Every program: input, process, output', body: 'Almost all software follows one shape: take something in, do work on it, give something back. A calculator takes numbers, adds them, shows a total. A login form takes an email and password, checks them, lets you in or shows an error. Hold this shape in your head and any program gets easier to read.', diagram: D.flow('Input', 'Process', 'Output') },
          { heading: 'The real skill: breaking problems down', body: 'Good programming is less about memorising and more about breaking a big task into tiny clear steps. "Build a to-do app" is overwhelming; "show a text box, save what the user types, display the saved list" is doable. The whole job is turning vague goals into small, ordered, precise steps.', exercise: 'In plain English, write the step-by-step instructions a computer would need to find the largest number in a list of five numbers. No code yet - just clear ordered steps. This is the thinking that coding requires.' },
        ],
      },
      {
        id: 'dev-core-building-blocks',
        title: 'The core building blocks of all code',
        summary: 'Variables, types, conditions, loops, and functions, with real examples.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will recognise and write the five building blocks that appear in every programming language. Learn these once and you can read code in almost any language, because they all share these ideas.' },
          { heading: 'Variables: named boxes for data', body: 'A variable is a labelled box that stores a value so you can use it later. You put something in, read it back, or change it. The name lets you refer to the value without repeating it.', code: 'age = 10          # store 10 in a box called age\nname = "Sam"      # store text\nage = age + 1     # now age holds 11' },
          { heading: 'Data types: kinds of values', body: 'Values come in types: numbers, text (called strings), true/false (booleans), and lists. The type decides what you can do - you can add two numbers, but adding text just joins it. Mixing types wrongly is a very common bug.', code: 'count = 5            # number\ntitle = "Project"    # string (text)\nis_done = False      # boolean (true/false)\ntasks = ["a", "b"]   # list of values' },
          { heading: 'Conditions: making decisions', body: 'Programs choose paths with if/else. The computer checks whether something is true, then runs the matching block. This is how software reacts differently to different situations.', code: 'temperature = 30\nif temperature > 25:\n    print("Wear shorts")\nelse:\n    print("Bring a jacket")' },
          { heading: 'Loops: repeating without rewriting', body: 'A loop repeats steps for each item, or until a condition changes. Instead of writing the same line 100 times, you write it once inside a loop. This is how programs handle lists of any size with the same few lines.', code: 'tasks = ["design", "build", "test"]\nfor task in tasks:\n    print("Working on: " + task)\n# prints a line for each task' },
          { heading: 'Functions: reusable named steps', body: 'A function is a named set of steps you define once and run whenever you want, optionally passing in values and getting a result back. Functions keep code short, organised, and easy to fix - change it in one place, every use updates.', code: 'def greet(name):\n    return "Hello " + name\n\nprint(greet("Sam"))   # Hello Sam\nprint(greet("Ada"))   # Hello Ada', exercise: 'Write a function called "double" that takes a number and returns it multiplied by two. Then call it with 7 and print the result. You should see 14.' },
        ],
      },
      {
        id: 'dev-python',
        title: 'Python: your first real language',
        summary: 'Write and run actual Python, the friendliest language for beginners.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will read and write basic Python: variables, input/output, conditions, loops, lists, and functions combined into small working programs. Python is used for web back-ends, data, automation, and AI, so this opens many doors.' },
          { heading: 'Why Python first', body: 'Python reads almost like English and needs little ceremony to get going. You write less to do more, and the error messages are relatively friendly. That is why it is the most common first language and still used by experts daily.' },
          { heading: 'Output and input', body: 'print() shows something on screen; input() asks the user to type something. Note input always gives back text, so to do maths you convert it to a number with int().', code: 'name = input("Your name? ")\nprint("Welcome, " + name)\n\nage = int(input("Your age? "))\nprint("Next year you will be", age + 1)' },
          { heading: 'Putting blocks together', body: 'Real programs combine the building blocks. Here is a tiny program that checks a list of tasks and counts how many are done - using a list, a loop, a condition, and a variable together.', code: 'tasks = [\n    {"name": "design", "done": True},\n    {"name": "build", "done": False},\n    {"name": "test", "done": True},\n]\n\ndone_count = 0\nfor task in tasks:\n    if task["done"]:\n        done_count = done_count + 1\n\nprint("Finished", done_count, "of", len(tasks), "tasks")' },
          { heading: 'How to actually run it', body: 'You do not need to install anything to start. Search "Python online editor" (such as replit or the official Python site) and you get a box to type code and a Run button. Later you can install Python on your computer, but an online editor is the fastest way to begin today.', tip: 'Type the examples by hand rather than copying. The small mistakes you make and fix are where real learning happens.' },
          { heading: 'Practice', body: '', exercise: 'Write a Python program that asks the user for two numbers, adds them, and prints the total. Remember input() gives text, so wrap each in int() before adding. Test it with 3 and 4 to get 7.' },
        ],
      },
      {
        id: 'dev-web-basics',
        title: 'How websites are built: HTML, CSS, JavaScript',
        summary: 'The three web languages, what each does, and real snippets.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand and write basic HTML structure, style it with CSS, and add behaviour with JavaScript - the three languages every website uses together.' },
          { heading: 'HTML: the structure', body: 'HTML is the skeleton. Tags label parts of the page: headings, paragraphs, buttons, images, links. It says what things ARE, not how they look.', code: '<h1>My Project</h1>\n<p>A short description here.</p>\n<button>Join project</button>' },
          { heading: 'CSS: the style', body: 'CSS decorates the HTML: colours, fonts, spacing, layout, responsiveness. The same HTML with different CSS looks completely different. You select an element, then set properties.', code: 'button {\n  background: #2563eb;\n  color: white;\n  padding: 10px 16px;\n  border-radius: 8px;\n}' },
          { heading: 'JavaScript: the behaviour', body: 'JavaScript makes pages interactive: respond to clicks, change content, validate forms, load data. If HTML is structure and CSS is paint, JS is the action.', code: 'const button = document.querySelector("button");\nbutton.addEventListener("click", function() {\n  alert("You joined the project!");\n});', diagram: D.flow('HTML', 'CSS', 'JavaScript') },
          { heading: 'How they work together', body: 'A web page loads HTML (structure), applies CSS (looks), and runs JavaScript (behaviour). On a real project you will often work mostly in one of these but need to read all three. Frameworks like React (used by many teams, including this platform) build on exactly these basics.', exercise: 'Using an online editor (search "HTML CSS JS playground", e.g. CodePen), make a page with a heading and a button. Style the button with CSS, and use JavaScript so clicking it shows an alert. This is a complete tiny web app.' },
        ],
      },
      {
        id: 'dev-version-control',
        title: 'Git and GitHub: how teams work on code',
        summary: 'Save versions, collaborate without chaos - the daily workflow.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand the core Git workflow (clone, branch, commit, push, pull request) that nearly every software team uses - including how you will contribute to projects here. This is non-negotiable for real collaboration.' },
          { heading: 'Why Git exists', body: 'When building software you change files constantly. Git saves snapshots over time so you can always go back, and it lets many people work on the same project without overwriting each other. Think of it as an unlimited, shareable undo history.' },
          { heading: 'The everyday commands', body: 'Most days use a handful of commands: get the project, make a branch for your change, save snapshots (commits), and send them up.', code: 'git clone <url>          # copy the project to your computer\ngit checkout -b my-fix   # make your own branch to work on\n# ...edit files...\ngit add .                # stage your changes\ngit commit -m "Fix login bug"   # save a snapshot with a message\ngit push                 # send your branch to GitHub' },
          { heading: 'Branches and pull requests', body: 'You never edit the main version directly. You make a branch (your own copy of the work), make changes there, then open a pull request - a request for teammates to review and merge your work into the main project. This is exactly how you will contribute on real projects.', diagram: D.flow('Branch', 'Commit & push', 'Pull request') },
          { heading: 'Good commits', body: 'A commit message should say what changed and why, briefly. "Fix" tells no one anything; "Fix crash when email field is empty" helps the whole team. Small, focused commits with clear messages make you a contributor people trust.', tip: 'Commit often in small pieces. One giant commit at the end is hard to review and hard to undo if something breaks.' },
          { heading: 'Practice', body: '', exercise: 'Create a free GitHub account. Make a new repository, add a README file through the website, and edit it. You have just made your first commit. Next, explore any public project and read its recent commit messages to see how real teams describe changes.' },
        ],
      },
      {
        id: 'dev-apis-data',
        title: 'APIs and data: how programs talk',
        summary: 'Requests, responses, and JSON - how apps get and send information.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand how apps fetch and send data through APIs, read JSON data, and grasp the request/response cycle behind almost every modern app.' },
          { heading: 'What an API is', body: 'An API is a messenger that lets two programs talk. A weather app does not own weather data - it asks a weather service through its API and gets an answer. Like a waiter: you order, it goes to the kitchen, it brings food back. You ask the API for data, it returns it.', diagram: D.flow('Your app', 'API request', 'Data back') },
          { heading: 'JSON: the common data format', body: 'When programs exchange data they need an agreed format. JSON is the most common - structured text with labelled values. It is human-readable and every language understands it.', code: '{\n  "name": "Sam",\n  "track": "TechDev",\n  "badges": 3,\n  "active": true\n}' },
          { heading: 'Requests and responses', body: 'Talking to an API is a request and a response. You send a request ("give me this user\'s profile") and get a response (the data, or an error code if something went wrong). Status codes tell you what happened: 200 means OK, 404 means not found, 500 means the server broke.', code: '// JavaScript: ask an API for data\nfetch("https://api.example.com/users/1")\n  .then(response => response.json())\n  .then(data => console.log(data.name));' },
          { heading: 'Why this matters on a project', body: 'Most apps are a front end (what users see) talking to a back end (data and logic) through APIs. Knowing this split helps you understand where your work fits and how your piece connects to everyone else\'s.', exercise: 'In a browser, visit a free public API like https://api.github.com/users/octocat and look at the JSON that comes back. Find the "name" and "public_repos" fields. You just read a real API response.' },
        ],
      },
      {
        id: 'dev-data-science',
        title: 'Data science basics',
        summary: 'Turning raw data into insight, with the real workflow and tools.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand what data scientists actually do day to day, the standard workflow, and the Python tools involved - enough to contribute to or understand a data project.' },
          { heading: 'What data science is', body: 'Data science finds useful patterns in information to help people decide. A shop learns which products sell together; a team learns which feature keeps users coming back. It blends a little coding, a little statistics, and a lot of curiosity.' },
          { heading: 'The real workflow', body: 'Most data work follows a path: collect data, clean it (real data is messy and full of gaps), explore it for patterns, then communicate findings clearly. Cleaning is usually the biggest part - often 70 to 80 percent of the work.', diagram: D.flow('Collect & clean', 'Explore & analyse', 'Communicate') },
          { heading: 'The tools, with a taste', body: 'Python is the common language. pandas handles tables of data (like a programmable spreadsheet); matplotlib draws charts. You do not need to master them now, but seeing the shape helps.', code: 'import pandas as pd\n\n# load a spreadsheet of sales\ndata = pd.read_csv("sales.csv")\n\n# average sale amount\nprint(data["amount"].mean())\n\n# how many sales per region\nprint(data["region"].value_counts())' },
          { heading: 'Practice', body: '', exercise: 'Find any free CSV dataset online (search "sample CSV dataset"). Open it in a spreadsheet first and just look: what are the columns, what is messy, what question could you answer with it? Thinking this way is the core of data work, before any code.' },
        ],
      },
      {
        id: 'dev-ai-ml',
        title: 'AI and machine learning basics',
        summary: 'How machines learn from examples, with the core concepts that matter.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand how machine learning differs from normal programming, the train-then-predict cycle, and key terms (model, training data, features, bias) - enough to contribute sensibly to an AI project conversation.' },
          { heading: 'Rules vs learning', body: 'Normally you write exact rules. Machine learning flips this: instead of writing every rule, you show the computer thousands of examples and it figures out the pattern. To recognise cats you do not describe a cat - you show many cat photos until it learns what cats look like.' },
          { heading: 'Train, then predict', body: 'Machine learning has two phases. Training: the model studies many labelled examples and adjusts itself to get better. Predicting: you give it something new and it makes its best guess. Like teaching a child with flashcards, then testing on a new card.', diagram: D.flow('Training data', 'Model learns', 'Predicts on new data') },
          { heading: 'The words you will hear', body: 'A model is the thing that learned the pattern. Training data is the examples it learned from. Features are the inputs it looks at (for a house price model: size, location, rooms). A label is the answer during training (the actual price). Bias means the model learned something skewed because its examples were skewed.' },
          { heading: 'What this looks like in code', body: 'You rarely write the maths yourself - libraries do it. At a high level, training is often just a few lines: give the model your examples and answers, and call fit.', code: '# high-level idea (using a library like scikit-learn)\nmodel = SomeModel()\nmodel.fit(features, answers)   # train on examples\nprediction = model.predict(new_data)   # guess on new input' },
          { heading: 'The honest limits', body: 'AI is powerful but not magic. It is only as good as its examples - biased or thin data gives biased or wrong results. It can be confidently wrong. Knowing this makes you a more careful, valuable contributor than someone who treats it as a magic box.', exercise: 'Think of a simple prediction task (e.g. will an email be spam). List 4 features you would feed a model and where biased training data could make it unfair. This is exactly the thinking real ML work needs.' },
        ],
      },
      {
        id: 'dev-computer-vision',
        title: 'Computer vision basics',
        summary: 'Teaching computers to understand images, and how it is used.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand how computers represent and interpret images, what tasks computer vision solves, and how it connects to machine learning.' },
          { heading: 'An image is just numbers', body: 'To a computer a photo is a grid of tiny dots (pixels), each a set of numbers for its colour (how much red, green, blue). A 1000x1000 photo is a million pixels of numbers. Computer vision is making sense of those numbers - finding edges, shapes, faces, objects.' },
          { heading: 'The common tasks', body: 'Classification: what is in this image (cat or dog)? Detection: where are the objects (box around each face)? Segmentation: which exact pixels belong to the road versus the sky? Different real problems map to these task types.', diagram: D.flow('Image (pixels)', 'Model analyses', 'Labels / boxes') },
          { heading: 'How it learns to see', body: 'Modern computer vision uses machine learning: show a model many labelled images ("this is a dog", "this is a car") and it learns visual patterns - edges, then shapes, then whole objects. Then it can look at a new image and say what is likely there. Same train-then-predict idea, applied to pictures.' },
          { heading: 'Where it shows up', body: 'Face unlock on phones, self-driving cars spotting pedestrians, medical scans flagging issues, apps identifying a plant from a photo, quality checks on factory lines. Anywhere a computer needs to "see", this is the field.', exercise: 'Pick an app you use that "sees" (camera filters, photo search, document scanning). Describe in plain words what it takes in (the image), what it outputs (a label, a box, text), and which task type it is (classification, detection, segmentation).' },
        ],
      },
      {
        id: 'dev-contributing',
        title: 'Contributing to a real project',
        summary: 'How to take your skills into a team project and actually help.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will know how to join a project, pick up a task, do the work without breaking things, and hand it over so the team can use it. This is where your skills turn into proof.' },
          { heading: 'Start small and read first', body: 'On any new project, read before you write: the README, the existing code, how files are organised. Pick a small, clear first task (fix a typo, a small bug, one tiny feature). Small wins build trust and teach you the codebase.' },
          { heading: 'The contribution loop', body: 'The cycle is: take a task, make a branch, write the change, test that it works, commit with a clear message, push, open a pull request, respond to review feedback, and merge. You learned the Git half already - this is putting it to use on a team.', diagram: D.flow('Pick a task', 'Build & test', 'Pull request') },
          { heading: 'Communicate like a teammate', body: 'Say what you are working on, ask when stuck (after trying first), and keep updates short and honest. "Done with the login form, starting the validation next" keeps everyone aligned. A clear communicator who ships small things reliably is worth more than a silent genius.' },
          { heading: 'Test before you hand over', body: 'Before opening a pull request, actually run your change and try to break it. Does it work with empty input? Weird input? Did you accidentally break something nearby? Catching your own bugs is the mark of a contributor people want on their team.', tip: 'It is completely normal to feel lost on a new codebase. Everyone does. Ask specific questions, read the surrounding code, and it gets familiar faster than you expect.' },
          { heading: 'Your path from here', body: 'You now have the foundations: how code works, Python, the web, Git, APIs, and the contribution loop, plus a map of data, AI, and vision. The real growth happens by doing - join a project, pick a small task, and build. That is how you turn this knowledge into proof.', exercise: 'On this platform, browse open TechDev projects and find one with a small, beginner-friendly task. Read what it needs. Even before joining, write down how you would approach the first step. That is the contributor mindset in action.' },
        ],
      },
    ],
  },
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
