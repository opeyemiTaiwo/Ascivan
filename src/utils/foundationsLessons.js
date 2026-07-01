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
        id: 'dev-ds-intro',
        title: 'Data science: what it is and how it works',
        summary: 'The real job, the standard workflow, and the tools that do the heavy lifting.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand what data scientists actually do, the step-by-step workflow nearly every data project follows, and which Python tools you will meet along the way. This is the map for the lessons that follow, which take you from raw data all the way to a trained model.' },
          { heading: 'What data science really is', body: 'Data science is using data to answer questions and make better decisions. A shop wants to know which products sell together; a team wants to know which users are about to leave; a clinic wants to predict who is at risk. In each case you take messy, real-world data and turn it into a clear answer or a working prediction. It blends a little coding, a little statistics, and a lot of careful thinking about what the data really says.' },
          { heading: 'The standard workflow', body: 'Almost every data project follows the same path: start with a clear QUESTION, COLLECT the relevant data, CLEAN it (real data is always messy), EXPLORE it to understand what is there, BUILD a model if you need to predict something, then COMMUNICATE the result so others can act on it. Cleaning and exploring usually take the most time - often 70 to 80 percent of the whole project. Beginners expect the modelling to be the hard part; in practice, getting the data into good shape is.', diagram: D.flow('Question & collect', 'Clean & explore', 'Model & communicate') },
          { heading: 'The tools you will use', body: 'Python is the common language for data work. You will lean on a few libraries: pandas for handling tables of data (think of it as a programmable spreadsheet), matplotlib for drawing charts, and scikit-learn for building and training models. Most people write this code in a notebook (such as Jupyter or Google Colab) where you run small chunks and see results immediately. You do not need to master these now - the next lessons introduce them one piece at a time.' },
          { heading: 'A word that trips people up: "variable"', body: 'In data science, a "variable" usually means a column in your data - a single thing you measured about each record, like age, price, or region. (This is slightly different from a variable in normal programming, which is just a named box for any value.) When a data scientist says "the age variable," they mean the age column across all the rows. Keep that in mind and a lot of data talk gets clearer.' },
        ],
      },
      {
        id: 'dev-ds-data',
        title: 'Working with data: tables, variables, and types',
        summary: 'How data is shaped, the kinds of values it holds, and loading it with pandas.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand how a dataset is structured, recognise the main types of data, and load a real file into Python with pandas so you can look at it, select parts of it, and filter it. This is the foundation every later step stands on.' },
          { heading: 'A dataset is a table: rows and columns', body: 'Most data you will meet is a table, just like a spreadsheet. Each ROW is one record - one customer, one sale, one patient. Each COLUMN is one variable - one thing measured about every record, like name, age, or amount. So a sales table might have one row per sale and columns for date, product, amount, and region. Holding this rows-are-records, columns-are-variables picture in your head makes everything else click.' },
          { heading: 'Types of data', body: 'Columns come in types, and the type decides what you can do with it. NUMERIC values are numbers you can do maths on (age, price, count). CATEGORICAL values are labels from a fixed set (region: north/south/east/west, or status: active/inactive). DATES and TIMES are their own type so you can sort and group by time. BOOLEAN is true/false (did the customer return: yes/no). TEXT is free-form words (a review). Knowing a column\'s type tells you how to analyse it - you average numbers, but you count categories.' },
          { heading: 'Loading a file with pandas', body: 'pandas reads a data file (commonly a CSV - a plain-text spreadsheet) into a table called a DataFrame. Once loaded, a few commands let you look before you leap: head() shows the first rows, shape tells you how big it is, and info() lists the columns and their types. Always look at your data before doing anything else.', code: 'import pandas as pd\n\ndata = pd.read_csv("sales.csv")\n\nprint(data.head())     # first 5 rows - eyeball the data\nprint(data.shape)      # (number of rows, number of columns)\nprint(data.info())     # column names and their data types' },
          { heading: 'Selecting and filtering', body: 'You rarely want the whole table at once. You can pick a single column, or keep only the rows that match a condition. This is how you zoom in on the part of the data that answers your question.', code: 'data["amount"]                 # just the amount column\n\ndata[data["amount"] > 100]     # only rows where amount is over 100\n\ndata[data["region"] == "north"]   # only the northern sales' },
          { heading: 'Practice', body: '', exercise: 'Find any free CSV dataset online (search "sample CSV dataset"). Load it with pandas, then run head(), shape, and info(). Write down, in plain words: how many rows and columns are there, and what type is each column? Identifying the variables and their types is the real first step of every data project.' },
        ],
      },
      {
        id: 'dev-ds-cleaning',
        title: 'Cleaning data: the real bulk of the job',
        summary: 'Missing values, duplicates, wrong types, and messy categories - and how to fix them.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will spot the common problems in real-world data and fix them with pandas: filling or removing missing values, dropping duplicates, correcting wrong types, and tidying inconsistent categories. This is where most of a data scientist\'s time actually goes, and doing it well is what separates a trustworthy result from a misleading one.' },
          { heading: 'Why real data is messy', body: 'Data collected by real people and systems is never tidy. Fields get left blank, the same record gets entered twice, numbers arrive as text, and the same thing gets spelled three different ways ("NY", "New York", "new york"). If you feed messy data straight into analysis or a model, you get a confident but wrong answer. Cleaning is not busywork - it is what makes everything after it believable.' },
          { heading: 'Missing values', body: 'Gaps are the most common problem. First, find them by counting empty cells per column. Then decide: REMOVE the affected rows if you have plenty of data and only a few gaps, or FILL them with a sensible stand-in (often the average for a numeric column, or the most common value for a category). Which you choose depends on how much data you would lose and whether the gap itself means something.', code: 'data.isnull().sum()          # count missing values in each column\n\ndata = data.dropna()         # option 1: drop rows that have any gap\n\n# option 2: fill gaps in the age column with the average age\ndata["age"] = data["age"].fillna(data["age"].mean())' },
          { heading: 'Duplicates', body: 'The same record entered twice quietly distorts everything - counts, averages, totals. pandas can find and remove exact duplicate rows in one line. Do this early, before you start counting or summarising.', code: 'print(data.duplicated().sum())   # how many duplicate rows exist\n\ndata = data.drop_duplicates()    # keep only the first of each duplicate' },
          { heading: 'Wrong types and formats', body: 'A column of prices might load as text because one value had a stray symbol, which means you cannot do maths on it. Dates often arrive as plain text too. Converting columns to the right type unlocks proper analysis - sorting dates, averaging numbers, and so on.', code: 'data["price"] = data["price"].astype(float)        # text -> number\n\ndata["signup_date"] = pd.to_datetime(data["signup_date"])  # text -> date' },
          { heading: 'Messy categories', body: 'Categorical columns often hold the same idea written several ways. "North", "north", and " North " are one region to a human but three different values to the computer, which will split your counts. Standardising them - trimming spaces and unifying the casing - merges them back into one.', code: 'data["region"] = data["region"].str.strip().str.lower()\n# now "North", "north ", and " NORTH" all become "north"', tip: 'Clean a COPY or re-load from the original file if an experiment goes wrong. You want to be able to start over without losing the raw data.' },
          { heading: 'Practice', body: '', exercise: 'Take the dataset you loaded earlier. Run isnull().sum() to find gaps and duplicated().sum() to find repeats. Pick one column with missing values and decide whether to drop or fill it, then do it. Write one sentence explaining why you made that choice - that reasoning is exactly what a data team would expect from you.' },
        ],
      },
      {
        id: 'dev-ds-explore',
        title: 'Exploring and visualising data',
        summary: 'Summaries, groupings, and charts that reveal what the data is actually saying.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will summarise a dataset in numbers, group it to compare segments, and draw simple charts that make patterns obvious. This step - often called exploratory data analysis, or EDA - is how you understand your data before trusting any model built on it.' },
          { heading: 'Summarise the numbers', body: 'Start by getting a feel for the shape of each column. describe() gives the min, max, average, and spread of every numeric column at once, instantly flagging anything strange (an age of 200, a negative price). For categorical columns, value_counts() shows how many of each label there are.', code: 'data.describe()                  # stats for every numeric column\n\ndata["region"].value_counts()    # how many records in each region' },
          { heading: 'Group to compare', body: 'Real insight usually comes from comparing groups: average sales PER region, sign-ups PER month, pass rate PER class. groupby splits the data into segments and summarises each one, turning a flat table into an answer.', code: '# average sale amount for each region\ndata.groupby("region")["amount"].mean()\n\n# how many customers signed up in each month\ndata.groupby("signup_month")["customer_id"].count()' },
          { heading: 'Pictures beat tables', body: 'A chart can show in one glance what a table of numbers hides. A HISTOGRAM shows how a single number is distributed (are most prices low with a few very high?). A BAR chart compares categories. A SCATTER plot shows whether two numbers move together (do more study hours go with higher scores?).', code: 'import matplotlib.pyplot as plt\n\ndata["age"].hist()                       # distribution of ages\nplt.show()\n\nplt.scatter(data["hours_studied"], data["score"])\nplt.xlabel("Hours studied")\nplt.ylabel("Score")\nplt.show()                               # do they move together?', diagram: D.flow('Summarise', 'Group & compare', 'Visualise') },
          { heading: 'Let the question lead', body: 'Do not just make every chart possible. Hold your original question in mind - "which region performs best?", "what predicts a returning customer?" - and explore toward it. Good EDA is curious but focused: each summary and chart should move you closer to an answer or a surprise worth chasing.' },
          { heading: 'Practice', body: '', exercise: 'Using your dataset, pick a question you could answer (e.g. "which category has the highest average value?"). Use groupby to answer it in numbers, then draw one chart that makes the answer visible. Describe the finding in a single plain sentence - that sentence is what you would actually report to a team.' },
        ],
      },
      {
        id: 'dev-ds-model',
        title: 'Building and training your first model',
        summary: 'Features and targets, train/test split, and using scikit-learn to fit and predict.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will understand how a prediction model is set up and actually train one with scikit-learn: separating inputs from the answer, splitting the data so you can test honestly, then fitting the model and using it to predict. By the end you will have run the full train-then-predict cycle on real data.' },
          { heading: 'Features and the target', body: 'To predict something, you split your columns into two parts. The FEATURES (often called X) are the inputs the model looks at - for predicting whether a student passes, that might be hours studied and attendance. The TARGET (often called y) is the single answer you want to predict - here, passed: yes or no. The model\'s whole job is to learn the relationship between the features and the target.', code: '# X = the inputs the model learns from\nX = data[["hours_studied", "attendance"]]\n\n# y = the answer we want to predict\ny = data["passed"]     # True / False' },
          { heading: 'Why you split the data', body: 'Here is the most important idea in the whole lesson. If you train a model on all your data and then test it on that same data, of course it looks great - it has already seen the answers. The real question is whether it works on data it has NEVER seen. So you split: train on most of it (say 80 percent), then test on the held-back part (the other 20 percent) as a fair, unseen exam.', diagram: D.flow('All data', 'Split 80/20', 'Train + test') },
          { heading: 'Choosing a kind of model', body: 'Match the model to the answer you want. If the target is a CATEGORY (pass/fail, spam/not-spam), that is CLASSIFICATION. If the target is a NUMBER (a price, a temperature), that is REGRESSION. scikit-learn offers ready-made models for both; a decision tree is a friendly first classifier because it mirrors how a person makes decisions through a series of yes/no questions.' },
          { heading: 'Train, then predict', body: 'With the pieces in place, training is just a few lines. Split the data, create a model, call fit() to train it on the training set, then call predict() to get its guesses on the unseen test set. That is the same train-then-predict cycle behind almost every machine learning system, big or small.', code: 'from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\n# hold back 20% as an unseen test set\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\nmodel = DecisionTreeClassifier()\nmodel.fit(X_train, y_train)          # learn from the training data\n\npredictions = model.predict(X_test)  # guess on data it never saw\nprint(predictions)', tip: 'You almost never write the maths yourself. Libraries like scikit-learn handle it, so your job is preparing good data and choosing sensibly - which is exactly where the value is.' },
          { heading: 'Practice', body: '', exercise: 'Find a simple labelled dataset (search "beginner classification dataset CSV" - the classic iris flower dataset is perfect). Pick two or three numeric columns as your features and one column as the target. Split, fit a DecisionTreeClassifier, and predict on the test set. You will have trained a real model end to end.' },
        ],
      },
      {
        id: 'dev-ds-evaluate',
        title: 'Is your model any good? Evaluation and overfitting',
        summary: 'Measuring performance honestly, spotting overfitting, and knowing what to improve.',
        subtopics: [
          { heading: 'What you will be able to do', body: 'You will measure how well a model actually performs, understand the single most common trap (overfitting), and know the practical levers for making a weak model better. This is what turns "I ran some code" into "I built something I can trust and explain."' },
          { heading: 'Measure on unseen data', body: 'A model is only as good as its performance on data it did not train on - which is exactly why you held back a test set. For classification, the simplest measure is ACCURACY: out of all the test cases, how many did it get right? An accuracy of 0.85 means it was correct 85 percent of the time on data it had never seen.', code: 'from sklearn.metrics import accuracy_score\n\npredictions = model.predict(X_test)\nprint(accuracy_score(y_test, predictions))   # e.g. 0.85 = right 85% of the time' },
          { heading: 'Accuracy is not the whole story', body: 'A single number can mislead. If 99 percent of emails are not spam, a lazy model that always guesses "not spam" scores 99 percent accuracy while catching zero spam. So you also care about the kinds of mistakes: how many real spam emails it missed, and how many normal emails it wrongly flagged. Knowing which mistake is worse for your problem matters as much as the headline score.' },
          { heading: 'Overfitting: the classic trap', body: 'Overfitting is when a model memorises the training data instead of learning the general pattern - like a student who memorises past exam answers but cannot handle a new question. The tell-tale sign: it scores very high on the training data but much lower on the unseen test data. The gap between those two scores is your warning light. UNDERFITTING is the opposite - the model is too simple and does poorly on both.', diagram: D.flow('High train score', 'Low test score', 'Overfitting!') },
          { heading: 'How to make a model better', body: 'When a model underperforms, a few practical levers usually help, in roughly this order: get MORE or cleaner data (almost always the biggest win), add or improve FEATURES that carry real signal, or adjust the model (a simpler model fights overfitting; a slightly richer one fights underfitting). Change one thing at a time and re-check the test score, so you know what actually helped.' },
          { heading: 'The honest mindset', body: 'No model is ever perfect, and a model is only as fair as its data - skewed examples produce skewed predictions that can quietly harm real people. The most valuable data person is not the one who claims a perfect score, but the one who reports honestly what the model does well, where it fails, and who might be affected. That care is what makes your work trustworthy on a team.', exercise: 'Take the model you trained. Print its accuracy on the test set, then also predict on the TRAINING set and print that accuracy too. Compare the two numbers. Is there a big gap (a sign of overfitting)? Write down one specific thing you would try next to improve it, and why. That reflection is the core of real data science.' },
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
    title: 'What no-code and low-code really are',
    summary: 'Building real software visually - and knowing the honest trade-offs.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand what no-code and low-code building actually is, when it is the right choice, and which family of tools fits which job. This is the map for everything else in the track.' },
      { heading: 'No-code: build by configuring, not coding', body: 'No-code tools let you build working software by dragging elements onto a screen, filling in settings, and connecting pieces visually. The tool writes the real code behind the scenes. You can build a booking site, an internal tool, or a mobile app without writing a single line - the skill is design and logical thinking, not syntax.' },
      { heading: 'Low-code: visual, with a little code where it counts', body: 'Low-code is the middle ground: you build mostly visually, but you can drop in small snippets of code for the tricky 10 percent that pure no-code cannot reach. It gives more power and flexibility while staying far faster than building everything by hand.' },
      { heading: 'When to use it - and the honest limits', body: 'No-code shines when speed matters more than total control: testing a business idea, an internal tool, a first version of a product. The trade-off is flexibility - very unusual or very large-scale needs can outgrow a no-code tool. Knowing when to reach for it (and when not to) is itself a valuable skill.' },
      { heading: 'The four tool families', body: 'Most no-code work uses one of four kinds of tool: APP BUILDERS (Bubble, Glide) for full apps with logic; SITE BUILDERS (Webflow) for polished websites; DATABASES (Airtable) for storing information; and AUTOMATION tools (Zapier, Make) for connecting apps together. Real projects usually combine a couple of these.', diagram: D.flow('Build pages', 'Store data', 'Automate') },
      { heading: 'Practice', body: '', exercise: 'Think of a simple app idea (a club sign-up, a small shop, an event tracker). Write down which tool family each part would need: where do users interact, where is the data stored, and what should happen automatically? This planning is the real first step of every no-code build.' },
    ],
  },
  {
    id: 'arch-anatomy',
    title: 'The anatomy of any app: pages, data, logic',
    summary: 'Every app, coded or not, is built from these three parts.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to break any app into its three core parts - what users see, what it remembers, and what it does - which is the mental model behind building anything in a no-code tool.' },
      { heading: 'Pages: what the user sees', body: 'Pages (or screens) are the visual layout - the buttons, text, images, and forms a user looks at and taps. In no-code tools you build these by dragging elements onto a canvas, much like designing a poster, then arranging them so they work on any screen size.' },
      { heading: 'Data: what the app remembers', body: 'Apps need to remember things - users, orders, messages, bookings. This lives in a database, which at the beginner level is just a smart set of tables (like spreadsheets). You define what you want to store, and the tool handles saving and fetching it.' },
      { heading: 'Logic: what happens when users act', body: 'Logic is the behaviour: "when someone submits this form, save it and send a confirmation email." You set these rules visually by connecting a trigger (the action that starts it) to one or more actions (what happens next). No coding - just clear if-this-then-that thinking.', diagram: D.flow('Pages (see)', 'Data (remember)', 'Logic (do)') },
      { heading: 'Practice', body: '', exercise: 'Take your app idea from the last lesson. On paper, list its pages (what screens does a user move through?), its data (what tables would it need?), and two pieces of logic (what should happen automatically?). You have just designed an app architecture.' },
    ],
  },
  {
    id: 'arch-design-pages',
    title: 'Designing pages and screens',
    summary: 'Laying out interfaces that look right and work on every device.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to build a clean, responsive page in a visual builder - arranging elements, making them work on phone and desktop, and connecting them to real data.' },
      { heading: 'The canvas and elements', body: 'A visual builder gives you a blank canvas and a palette of elements: text, images, buttons, inputs, containers. You drag them on and arrange them. Containers (boxes that hold other elements) are the secret to tidy layouts - they group things so you can move and align them together.' },
      { heading: 'Responsive design', body: 'People visit on phones, tablets, and laptops, so your layout must adapt. Good builders let you preview each screen size and adjust. The common rule is to design for mobile first (the smallest screen forces you to keep it simple), then let it expand on larger screens.', tip: 'If it works and looks clean on a narrow phone screen, it almost always works on bigger screens too. The reverse is not true.' },
      { heading: 'Reuse and consistency', body: 'Reusable components (a header, a card, a button style defined once and used everywhere) keep an app consistent and fast to change - edit it in one place and every copy updates. Consistency in colours, spacing, and fonts is what makes a no-code app look professional rather than thrown together.' },
      { heading: 'Connecting pages to data', body: 'A page becomes powerful when it shows real, dynamic data instead of fixed text. You bind an element to a data source - "show the name from the logged-in user," "list every product from the products table." This link between pages and data is the heart of building an actual app rather than a static mock-up.' },
      { heading: 'Practice', body: '', exercise: 'In a free builder (Webflow or Bubble both have free tiers), build a simple landing page: a heading, an image, a short paragraph, and a button. Preview it at phone and desktop sizes and adjust until both look clean. That is a real, shippable page.' },
    ],
  },
  {
    id: 'arch-data',
    title: 'Data and databases the no-code way',
    summary: 'Storing information in tables, and linking it so your app can use it.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to design a simple database in a tool like Airtable - tables, fields, and the links between them - which is what lets an app remember and relate real information.' },
      { heading: 'Tables, records, and fields', body: 'A no-code database is a friendly set of tables. Each TABLE holds one kind of thing (customers, orders). Each ROW (record) is one of them (one customer). Each COLUMN (field) is a detail about it (name, email, sign-up date). If you can use a spreadsheet, you already understand the shape.' },
      { heading: 'Field types matter', body: 'Each field has a type that decides what it holds and how it behaves: text, number, date, checkbox (yes/no), single-select (a fixed list of options), attachment (files), and link (a connection to another table). Choosing the right type keeps your data clean and your app reliable.' },
      { heading: 'Relationships: linking tables', body: 'Real data connects. A customer has many orders; an order belongs to one customer. Instead of repeating the customer details on every order, you LINK the orders table to the customers table. This avoids duplication and keeps everything in sync - change the customer once and every order reflects it.', diagram: D.flow('Customers table', 'linked to', 'Orders table') },
      { heading: 'Reading and writing from your app', body: 'Your pages read from and write to these tables. A list screen reads all rows from a table; a form writes a new row into it; an edit screen updates a row. Wiring pages to data this way - read, create, update - is what turns a pretty layout into a working app.' },
      { heading: 'Practice', body: '', exercise: 'In Airtable (free tier), create two tables - say "Members" and "Events" - and link them so each event can list which members are attending. Add a few rows. You have just built a relational database with no code.' },
    ],
  },
  {
    id: 'arch-logic-automation',
    title: 'Logic, workflows, and automation',
    summary: 'Making your app act on its own - inside the builder and across apps.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to set up logic inside an app and connect separate apps with automation, so work happens automatically instead of by hand.' },
      { heading: 'Triggers and actions', body: 'Every piece of automation is a TRIGGER (the thing that starts it) plus one or more ACTIONS (what happens next). "When a form is submitted (trigger), save the record and send a welcome email (actions)." Once you see this pattern, all automation becomes the same simple shape.' },
      { heading: 'Conditions: only when it matters', body: 'Conditions add intelligence: "only send the discount email IF the order is over 50." This is the same if/else idea from coding, set up visually. Conditions let one workflow handle many situations sensibly instead of firing blindly every time.' },
      { heading: 'Automating across apps', body: 'Tools like Zapier and Make connect apps that were not built to talk to each other. "When a new row is added in Airtable (trigger in one app), post a message in Slack (action in another)." You are plugging apps together like Lego, with no code, to remove repetitive manual work.', diagram: D.flow('Trigger', 'Condition', 'Action') },
      { heading: 'A real example', body: 'Picture a simple flow for a small business: a customer fills in a contact form, which saves their details to a database, adds them to a mailing list, and sends them a confirmation - all automatically, every time, without anyone lifting a finger. That is several apps working together through one automation.' },
      { heading: 'Practice', body: '', exercise: 'Create a free Zapier or Make account and build one automation (a "Zap"): for example, when a new response lands in a Google Form, add a row to a Google Sheet. Test it by submitting the form. You have automated a real task end to end.' },
    ],
  },
  {
    id: 'arch-publish-collaborate',
    title: 'Publishing, testing, and collaborating',
    summary: 'Getting your build in front of real users - and working on a team.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will know how to publish a no-code app, test it properly before sharing, and work on it as part of a team - turning a build into something real people use.' },
      { heading: 'Going live', body: 'When your app works, you publish it - most no-code tools do this with one button, putting it online at a web address you can share. You can usually connect a custom domain (your-name.com) so it looks fully professional rather than living on the tool\'s default address.' },
      { heading: 'Test like a real user', body: 'Before sharing widely, click through your own app exactly as a stranger would. Try the wrong things on purpose: submit an empty form, tap buttons twice, enter odd input. Fixing a confusing flow early is far cheaper than after a hundred people hit it.' },
      { heading: 'Working on a team', body: 'On a real project, more than one person touches the build, so agree who owns what, and use the tool\'s preview or staging mode to try changes before they go live. Clear communication - "I\'m editing the checkout page, don\'t publish yet" - prevents people overwriting each other\'s work.' },
      { heading: 'Your path from here', body: 'You now understand the whole no-code stack: tool families, pages, data, logic, automation, and publishing. The real growth comes from building. Join a no-code project, take a small piece - one page, one automation - and ship it. That is how this knowledge becomes proof.', exercise: 'On this platform, browse open TechArchs projects and find one with a small, beginner-friendly task. Read what it needs and write down how you would build the first piece. That is the no-code contributor mindset in action.' },
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
    title: 'What software testing really is',
    summary: 'The safety net that catches problems before real users do.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand what testing is for, the mindset that makes a great tester, and the difference between the cases everyone checks and the ones where bugs actually hide.' },
      { heading: 'Why testing exists', body: 'Software is built by people, and people make mistakes. Testing is the deliberate effort to find those mistakes before customers do. A bug caught in testing costs minutes; the same bug reaching real users can cost trust, money, and a frantic emergency fix. Good testers save teams from exactly that.' },
      { heading: 'The tester mindset', body: 'Developers naturally check that their work DOES work; testers ask how it could FAIL. You think like a careful user and a bit like a troublemaker: what if I leave this blank, paste a huge value, click twice, lose my connection halfway? This constructive suspicion is the core skill, and it can be learned.' },
      { heading: 'Happy paths and edge cases', body: 'The HAPPY PATH is everything going as intended - a user types a valid email and it works. EDGE CASES are the unusual situations: empty fields, special characters, enormous numbers, the back button at the wrong moment. Most bugs live in the edge cases, which is exactly why great testing goes looking for them.', diagram: D.flow('Happy path', 'Edge cases', 'Bugs found') },
      { heading: 'Practice', body: '', exercise: 'Take a simple login form (email and password). Write down the one happy path, then list five edge cases that might break it (e.g. email with no @, a 500-character password, leading spaces). Thinking up edge cases is the daily work of a tester.' },
    ],
  },
  {
    id: 'qa-types',
    title: 'The main types of testing',
    summary: 'Different checks for different risks - and where each one fits.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will recognise the common types of testing and know which one answers which question, so you can test the right things in the right way.' },
      { heading: 'Functional testing', body: 'Functional testing asks the basic question: does this feature do what it is supposed to? You give it inputs and check the outputs match what was expected. It is the bread and butter of QA - most test cases you write are functional.' },
      { heading: 'Regression testing', body: 'Every change to software risks breaking something that already worked. Regression testing re-checks existing features after a change to confirm nothing was accidentally damaged. It is why teams re-run a core set of tests before every release - new code can quietly break old code.' },
      { heading: 'Usability and accessibility', body: 'Software can work perfectly and still be confusing or unusable. Usability testing asks: can a real person figure this out easily? Accessibility checks whether people using screen readers, keyboards only, or with low vision can use it too. Both judge the human experience, not just whether the code runs.' },
      { heading: 'Performance and security (awareness)', body: 'Performance testing checks the software stays fast and stable under load (what happens with a thousand users at once?). Security testing looks for ways it could be misused or broken into. As a beginner you mostly need to know these exist and flag concerns - specialists go deep on them.' },
      { heading: 'Practice', body: '', exercise: 'Pick an app you use daily. Name one thing you would check for each type: a functional check, a regression risk (something that might break after an update), and a usability concern. Matching risks to test types is how QA planning starts.' },
    ],
  },
  {
    id: 'qa-test-cases',
    title: 'Writing clear test cases',
    summary: 'Turning "does it work?" into precise, repeatable checks.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to write a test case anyone on the team could follow and get the same result - the unit of trustworthy testing.' },
      { heading: 'The anatomy of a test case', body: 'A good test case has four parts: a clear TITLE (what it checks), any PRECONDITIONS (what must be true first, e.g. "user is logged in"), the STEPS to perform, and the EXPECTED RESULT. With these four, the test is repeatable by anyone, not just you.', diagram: D.flow('Steps', 'Expected result', 'Pass / Fail') },
      { heading: 'Be specific and repeatable', body: 'Vague test cases are useless. Not "check login works," but: "Enter a registered email and the wrong password, click Log in, expect the message \'Incorrect password\' and no access." Exact input, exact action, exact expected outcome. Precision is what makes a result mean something.' },
      { heading: 'Positive and negative cases', body: 'For every feature, test that it works with good input (positive) AND that it fails gracefully with bad input (negative). A sign-up form should accept a valid email and clearly reject a malformed one. Negative cases - the "it should NOT allow this" checks - are where many real bugs are caught.' },
      { heading: 'A worked example', body: 'Title: Reject sign-up with an existing email. Precondition: an account with sam@email.com already exists. Steps: open sign-up, enter sam@email.com and a password, submit. Expected: a clear "email already in use" message, no second account created. Notice how nobody has to guess what to do or what counts as a pass.' },
      { heading: 'Practice', body: '', exercise: 'Write three full test cases for a sign-up form - one positive and two negative - each with a title, preconditions, steps, and expected result. Hand them to a friend and see if they can run them without asking you a single question. If they can, your cases are good.' },
    ],
  },
  {
    id: 'qa-bug-reporting',
    title: 'Finding and reporting bugs',
    summary: 'Describing problems so they can actually be fixed.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to write a bug report a developer can act on immediately - and judge how urgent each bug really is.' },
      { heading: 'Reproduce it first', body: 'Before reporting, make sure you can make the bug happen again on purpose. The exact STEPS TO REPRODUCE are the most valuable thing in any report - a developer who can recreate a bug can fix it, while a bug nobody can reproduce often gets closed unsolved.' },
      { heading: 'Anatomy of a good bug report', body: 'A useful report states: what you DID (the steps), what you EXPECTED to happen, what ACTUALLY happened, and the ENVIRONMENT (which browser, device, or app version). Add evidence - a screenshot or short recording - and you have given the team everything they need.', tip: 'A bug a developer can reproduce is a bug a developer can fix. Spend your effort making it reproducible, not on dramatic descriptions.' },
      { heading: 'Severity and priority', body: 'Not all bugs are equal, and two scales help. SEVERITY is how bad the effect is (a crash that loses data is high; a slightly misaligned button is low). PRIORITY is how soon it should be fixed given everything else. A typo on the homepage can be low severity but high priority because everyone sees it.' },
      { heading: 'Report without blame', body: 'A bug report is about the software, not the person who wrote it. Stick to neutral facts - "expected X, got Y" - rather than "this is broken, who did this?" Testers and developers are on the same team, and a calm, factual report keeps that relationship strong and the bugs flowing in.' },
      { heading: 'Practice', body: '', exercise: 'Find a small glitch in any app or website you use (a button that does nothing, a layout that breaks on mobile). Write a full bug report for it: steps to reproduce, expected, actual, and environment. That is exactly what you would file on a real project.' },
    ],
  },
  {
    id: 'qa-automation',
    title: 'Intro to test automation',
    summary: 'Letting the computer run your repetitive checks, tirelessly.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand the difference between manual and automated testing, what is worth automating, and what an automated test actually looks like.' },
      { heading: 'Manual vs automated', body: 'Manual testing means a person clicks through the app. Automated testing means writing a small program that clicks through it for you - instantly, identically, every time. Automation never gets bored or skips a step, which is exactly why it suits checks you must repeat over and over.' },
      { heading: 'What to automate (and what not to)', body: 'Automate the boring, repeated, stable checks - the ones you run after every change, like "does login still work?" Keep humans for exploring brand-new features and judging how something feels, which a script cannot do. The two work best together, not one instead of the other.' },
      { heading: 'What a test script looks like', body: 'An automated test reads almost like the manual steps: open the page, type into a field, click a button, then ASSERT (check) that the expected thing appears. The assert is the heart of it - the test passes only if reality matches what you expected.', code: '// idea of an automated UI test (Cypress-style)\ncy.visit("/login")\ncy.get("#email").type("sam@email.com")\ncy.get("#password").type("wrongpass")\ncy.get("button").click()\ncy.contains("Incorrect password")   // ASSERT the error shows' },
      { heading: 'Tools you will hear of', body: 'Common automation tools include Selenium, Cypress, and Playwright for web apps. You do not need to master them as a beginner - knowing the concept (steps plus an assertion) and the names is enough to start, and tools like Test Automation University teach them free when you are ready.' },
      { heading: 'Practice', body: '', exercise: 'Take one of the test cases you wrote earlier and rewrite its steps as if instructing a robot: visit, type, click, and the exact text it should then see. You do not need to run real code yet - turning a manual case into clear automatable steps is the first automation skill.' },
    ],
  },
  {
    id: 'qa-on-a-team',
    title: 'QA on a real project',
    summary: 'Where testing fits, and how to be the tester teams want.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will know how QA fits into a real project workflow and how to work with developers so quality is built in, not bolted on at the end.' },
      { heading: 'Where QA fits in the flow', body: 'Testing is not just a final gate before release - the best teams test throughout. QA reviews requirements early (catching unclear ones), checks features as they are built, and runs a final pass before release. The earlier a problem is found, the cheaper it is to fix.', diagram: D.flow('Review specs', 'Test features', 'Release check') },
      { heading: 'Working with developers', body: 'You will get the most done by being involved early and reporting clearly. Ask questions about how a feature should behave before it is built, and when you find bugs, give clean reproducible reports. A tester who makes a developer\'s life easier becomes a trusted, wanted teammate.' },
      { heading: 'Test plans and checklists', body: 'For anything beyond a tiny change, a simple test plan keeps you organised: what features to cover, the key cases for each, and what counts as "good enough to ship." A shared checklist also means anyone can see what has been tested and what is still risky.' },
      { heading: 'Your path from here', body: 'You now have the QA foundations: the mindset, types of testing, writing cases, reporting bugs, and a taste of automation. Growth comes from doing - join a project, test a real feature, and file your first real bug report. That is how you turn this into proof.', exercise: 'On this platform, find an open project that needs testing. Pick one feature and draft a mini test plan: three to five key test cases and what would make you confident it is ready. That is real QA contribution.' },
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
    summary: 'What we protect, what threatens it, and how defence works.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand the core goals of security, the words used to describe threats, and the layered way real protection works - the foundation for everything else in this track.' },
      { heading: 'The three goals: confidentiality, integrity, availability', body: 'Almost all of security serves three goals, often called the CIA triad. CONFIDENTIALITY: only the right people can see the data. INTEGRITY: no one can secretly change it. AVAILABILITY: the system stays up and usable when needed. Every security measure you meet protects one or more of these three.' },
      { heading: 'Threats, vulnerabilities, and risk', body: 'These three words get mixed up. A VULNERABILITY is a weakness (a weak password). A THREAT is something that could exploit it (an attacker guessing passwords). RISK is the chance and impact of that actually happening. Security work is about reducing risk by closing vulnerabilities before threats reach them.' },
      { heading: 'Who attacks, and why', body: 'Attackers range from opportunists running automated scans, to criminals after money or data, to insiders making mistakes. Most attacks are not glamorous hacking - they are automated and target the easiest, weakest door. That is good news: closing the easy doors stops a huge share of attacks.' },
      { heading: 'Defence in depth', body: 'No single wall is enough, so security uses layers - strong passwords AND two-step login AND updated software AND careful habits. If one layer fails, another still stands. This "defence in depth" is why you never rely on a single protection for anything that matters.', diagram: D.flow('Confidential', 'Integrity', 'Available') },
      { heading: 'Practice', body: '', exercise: 'Pick a service you use (email, a bank app). For each of the three goals - confidentiality, integrity, availability - write one sentence on why it matters there and one thing that protects it. This is exactly how a security review begins.' },
    ],
  },
  {
    id: 'guard-networking',
    title: 'Networking basics',
    summary: 'How computers find each other and move data across the world.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand how devices connect, how data travels between them, and the key terms (IP, packet, port, DNS) that every networking and security conversation uses.' },
      { heading: 'What a network is, and IP addresses', body: 'A network is computers connected so they can share information. Your home wifi is a small one; the internet is a giant network of networks. Each device has an IP ADDRESS - a unique number like a postal address - so data knows where to go and where it came from.' },
      { heading: 'How data travels: packets', body: 'Information is not sent in one lump. It is broken into small PACKETS, each labelled with its destination, sent across the network, and reassembled at the other end - like mailing a book one page at a time in separate envelopes. If one page goes missing, only that page is resent, which makes the internet resilient.', diagram: D.flow('Sender', 'Packets travel', 'Receiver') },
      { heading: 'Ports and protocols', body: 'A single computer runs many services at once, so PORTS act like numbered doors directing traffic to the right one. PROTOCOLS are the agreed languages: HTTP and HTTPS for web pages, DNS for looking up names. HTTPS is the secure, encrypted version of HTTP - the padlock in your browser.' },
      { heading: 'Clients, servers, and DNS', body: 'Most of the internet is clients (your browser) asking servers (computers that hold websites) for things. But you type names, not numbers, so DNS - the internet\'s phone book - translates a name like example.com into the server\'s IP address. Understanding this request flow is key to both building and securing systems.' },
      { heading: 'Practice', body: '', exercise: 'In plain words, write out what happens from the moment you type a website name and press enter: the DNS lookup, the request to a server, packets coming back, and the page appearing. Being able to explain this flow is a genuine networking milestone.' },
    ],
  },
  {
    id: 'guard-threats-defenses',
    title: 'Common attacks and how to stop them',
    summary: 'The handful of attacks behind most breaches - and the defences that work.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will recognise the most common real-world attacks and the practical defences that stop the large majority of them - knowledge that protects both you and any project you join.' },
      { heading: 'Phishing and social engineering', body: 'Many attacks target people, not machines. PHISHING tricks someone into giving up a password or clicking a harmful link, often by pretending to be a trusted source. The defence is awareness: be suspicious of unexpected urgent messages, check who really sent them, and never enter credentials from a link you did not expect.' },
      { heading: 'Malware', body: 'Malware is harmful software - viruses, ransomware, spyware - that sneaks onto a device to steal, lock, or spy. It usually arrives through a dodgy download or attachment. Keeping software updated, avoiding untrusted downloads, and running protection blocks most of it.' },
      { heading: 'Weak passwords - and the fix', body: 'Guessing or reusing passwords is one of the most common ways in. The defences are simple and powerful: long UNIQUE passwords for every account, a PASSWORD MANAGER to remember them, and MULTI-FACTOR AUTHENTICATION (a second step like a code on your phone) so a stolen password alone is not enough.', tip: 'Multi-factor authentication is the single highest-value habit in security. Turn it on everywhere that offers it.' },
      { heading: 'Encryption, briefly', body: 'Encryption scrambles data so only the right person can read it. Data is protected IN TRANSIT (HTTPS, as it travels) and AT REST (stored encrypted). Passwords should never be stored as plain text - they are HASHED (turned into an irreversible scramble) so even a stolen database does not reveal them.' },
      { heading: 'Practice', body: '', exercise: 'Audit your own habits honestly: do you reuse any passwords, and is multi-factor authentication on for your email and main accounts? Fix one weakness today. Securing yourself is the first step to being trusted with securing a project.' },
    ],
  },
  {
    id: 'guard-cloud',
    title: 'Cloud fundamentals',
    summary: 'Running software on rented computers - and who secures what.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand what "the cloud" really is, the main service models, and the crucial idea of shared responsibility for security.' },
      { heading: 'What the cloud actually is', body: 'The cloud is just powerful computers in large data centres that you rent over the internet instead of buying and maintaining your own. Need more power? Rent more, instantly. Done? Stop paying. It lets a tiny team run worldwide services without owning a single machine.' },
      { heading: 'IaaS, PaaS, SaaS', body: 'Cloud comes in layers of how much is managed for you. IaaS (rent raw computers, you manage the rest - e.g. a virtual server). PaaS (rent a ready platform to run your code, the provider handles the machinery). SaaS (use finished software over the web - e.g. Gmail). More managed means less control but less to maintain.' },
      { heading: 'The major providers', body: 'Three providers dominate: Amazon Web Services (AWS), Microsoft Azure, and Google Cloud (GCP). They offer the same core ideas - rented computers, storage, databases, and hundreds of tools - with different names. Learning the concepts here transfers across all of them.' },
      { heading: 'The shared responsibility model', body: 'Security in the cloud is split. The PROVIDER secures the cloud itself - the buildings, hardware, and core network. YOU secure what you put IN it - your data, your access settings, your passwords. Many breaches happen not because the provider failed, but because a customer left a door open. Knowing where your responsibility starts is essential.', diagram: D.flow('Provider secures cloud', 'You secure your data', 'Shared') },
      { heading: 'Practice', body: '', exercise: 'Sort these into IaaS, PaaS, or SaaS: a rented virtual server, Google Docs, a managed app-hosting platform. Then write one sentence on what YOU would still be responsible for securing in each. That distinction is the heart of cloud security.' },
    ],
  },
  {
    id: 'guard-devops',
    title: 'Intro to DevOps',
    summary: 'Getting software from a laptop to real users smoothly and safely.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand what DevOps is, how the build-test-deploy pipeline works, and why automating it makes releases faster and more reliable.' },
      { heading: 'What DevOps is', body: 'DevOps is a way of working that joins building software (Dev) and running it (Ops) into one smooth flow. The goal is to release small improvements often, with less drama and fewer surprises, instead of rare, risky, giant releases.' },
      { heading: 'The pipeline: build, test, deploy', body: 'DevOps automates the path from code to users, often called CI/CD (continuous integration and delivery). When someone changes the code, it is automatically built, tested, and - if all is well - deployed. A change can go live safely in minutes rather than weeks, with machines catching mistakes along the way.', diagram: D.flow('Code', 'Test & build', 'Deploy') },
      { heading: 'Infrastructure as code', body: 'Rather than setting up servers by hand, DevOps teams describe their infrastructure in text files - "infrastructure as code." This means the whole setup can be recreated identically, reviewed like any code, and rolled back if something breaks. Consistency replaces fragile manual steps.' },
      { heading: 'Why it matters for reliability and security', body: 'Automated pipelines do not just move fast - they move safely. Tests catch broken code before users see it, security checks can run automatically, and every change is recorded. Slow, manual, ad-hoc releases are where outages and security gaps creep in; a good pipeline closes them.' },
      { heading: 'Practice', body: '', exercise: 'Describe, in plain steps, what an automated pipeline should do between a developer saving a change and that change reaching users. Include at least one test step and one security check. You have just outlined a CI/CD pipeline.' },
    ],
  },
  {
    id: 'guard-secure-practice',
    title: 'Security on a real project',
    summary: 'The everyday habits that keep a real codebase and team safe.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will know the practical security habits that matter on a live project, the common app weaknesses to watch for, and how to contribute safely to a team.' },
      { heading: 'Least privilege and updates', body: 'Two habits prevent a surprising share of incidents. LEAST PRIVILEGE: give every person and system only the access they actually need, nothing more, so a single compromised account cannot reach everything. And keep software UPDATED - most breaches exploit known weaknesses that a patch had already fixed.' },
      { heading: 'Never commit secrets', body: 'Passwords, API keys, and tokens must never be written into the code or committed to a repository - once pushed, they are very hard to fully erase and easy for others to find. Keep them in environment variables or a secrets manager instead. This is one of the most common real-world mistakes, and avoiding it marks you as a careful contributor.', tip: 'If a secret ever does get committed, treat it as exposed: rotate (replace) it immediately rather than just deleting the line.' },
      { heading: 'Common app weaknesses', body: 'A few weaknesses appear again and again, catalogued in the well-known OWASP Top 10. The themes to recognise early: never trust user input (it can carry attacks like injection), protect logins and sessions properly, and do not expose more data or error detail than necessary. You do not need to master these now - just learn to spot and raise them.' },
      { heading: 'Logging and monitoring', body: 'You cannot defend what you cannot see. Recording important events (logins, errors, changes) and watching for unusual patterns lets a team notice an attack or failure early. Good monitoring turns a silent disaster into an alert someone can act on.' },
      { heading: 'Your path from here', body: 'You now have the security foundations: the goals, networking, attacks and defences, cloud, DevOps, and safe project habits. Growth comes from applying it - join a project and be the person who asks "is this input safe?" and "where are the secrets stored?" That care is what teams value.', exercise: 'On this platform, find an open project and review it through a security lens: where does it handle user input, where might secrets live, and what is one improvement you would suggest? Raising a thoughtful security point is real contribution.' },
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
    title: 'What a product or project owner does',
    summary: 'Owning the why, and turning it into a clear plan for the team.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand the owner\'s real job, why it does not require coding, and the single most underrated part of the role - deciding what NOT to build.' },
      { heading: 'The owner\'s job', body: 'A product or project owner decides what the team should build and why it matters. They are the bridge between users (who have needs) and the team (who build solutions). Their value is not writing code - it is clarity, good decisions, and keeping everyone pointed at the right goal.' },
      { heading: 'You do not need to code', body: 'Owners need to UNDERSTAND what is being built well enough to make smart trade-offs, but they do not write it. Your strengths are listening to users, thinking clearly about priorities, communicating decisions, and saying no gracefully. Plenty of excellent owners have never written a line of code.' },
      { heading: 'The power of saying no', body: 'There are always more ideas than time. A huge part of the role is choosing what NOT to do right now, so the team can focus and actually finish what matters most. A good owner protects the team from trying to do everything at once and achieving none of it well.' },
      { heading: 'Practice', body: '', exercise: 'Pick any product you like. Write its mission in one sentence: who it is for and the main problem it solves. Then name one popular feature you would deliberately leave out of a first version, and why. That is an owner making a focus decision.' },
    ],
  },
  {
    id: 'po-users',
    title: 'Understanding users and problems',
    summary: 'Starting with the real problem, not a feature you assumed.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to dig past surface requests to the real user problem, and validate it before the team spends weeks building the wrong thing.' },
      { heading: 'Problem first, feature second', body: 'Beginners jump to "let\'s build a chat feature." Owners ask "what problem would that solve, and for whom?" Features are guesses at solutions; the problem is the truth. Anchoring on the problem keeps the team from building something clever that nobody needed.' },
      { heading: 'Simple user research', body: 'You do not need a research department - you need to talk to and watch real users. Ask open questions about their goals and frustrations, and notice where they struggle rather than what they claim. A handful of honest conversations beats a room full of assumptions.' },
      { heading: 'Capturing who and why', body: 'Light tools keep the user in focus: a short PERSONA (a sketch of a typical user and their goal) and the "job to be done" (what the user is really trying to achieve - "I want to look organised to my boss," not "I want a calendar"). These keep decisions grounded in real needs.' },
      { heading: 'Validate before you build', body: 'Before committing the team, sanity-check the problem is real: do several users actually have it, and badly enough to want a fix? A quick mock-up or conversation can save weeks. Building first and hoping is the most expensive way to learn you were wrong.' },
      { heading: 'Practice', body: '', exercise: 'Write a problem statement for something you would improve, in this shape: "[type of user] struggles to [do something] because [reason], which leads to [bad outcome]." A sharp problem statement is the foundation everything else builds on.' },
    ],
  },
  {
    id: 'po-user-stories',
    title: 'Requirements and user stories',
    summary: 'Describing what to build from the user\'s point of view, with a clear "done".',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to write clear user stories with acceptance criteria, so the team knows exactly what to build and when it is finished.' },
      { heading: 'The user story format', body: 'A user story is a short need written from the user\'s view: "As a [type of user], I want [something], so that [benefit]." For example: "As a shopper, I want to save items to a wishlist, so I can buy them later." It keeps the team focused on a real human goal, not just a feature.' },
      { heading: 'Acceptance criteria: a clear "done"', body: 'Each story needs conditions that define finished - the ACCEPTANCE CRITERIA. Without them, the team and owner can argue over whether something is actually done. "The wishlist saves items, shows them on a wishlist page, and survives logging out and back in" leaves no doubt.', diagram: D.flow('User story', 'Acceptance criteria', 'Done = clear') },
      { heading: 'Keep stories small and valuable', body: 'A good story is small enough to build in a short time, yet delivers something a user would actually value. "Build the entire account system" is too big; "let a user reset a forgotten password" is a real, finishable slice. Slicing big needs into small valuable stories is a core owner skill.' },
      { heading: 'A worked example', body: 'Story: "As a returning customer, I want to reset my forgotten password, so I can get back into my account." Acceptance criteria: a "forgot password" link exists; entering a registered email sends a reset link; the link lets them set a new password; the old password no longer works. Now the team knows exactly what to build and test.' },
      { heading: 'Practice', body: '', exercise: 'Write one user story in the "As a... I want... so that..." format, then add three or four acceptance criteria that clearly define "done." Test it by asking: could a developer build this and a tester verify it, with no further questions?' },
    ],
  },
  {
    id: 'po-backlog',
    title: 'Backlog and prioritisation',
    summary: 'Keeping a sorted list of everything, and choosing what comes next.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to keep an ordered backlog and make defensible decisions about what the team should build next.' },
      { heading: 'What a backlog is', body: 'The backlog is the master list of everything the product could need - stories, fixes, ideas - kept in priority order. The most important, ready work sits at the top; vague future ideas sit lower. The team always pulls from the top, so the order IS the plan.', diagram: D.flow('Ideas in', 'Prioritise', 'Top = build next') },
      { heading: 'Value versus effort', body: 'The simplest prioritisation weighs two things: how much VALUE something delivers to users or the business, and how much EFFORT it takes to build. High value and low effort goes first; low value and high effort waits or dies. This single trade-off prevents the team from polishing trivia while important work sits idle.' },
      { heading: 'A framework: MoSCoW', body: 'For a release, MoSCoW sorts work into Must-have (it fails without these), Should-have (important but not vital), Could-have (nice if time allows), and Won\'t-have-this-time (explicitly out). Naming what you are NOT doing is as useful as naming what you are - it sets honest expectations.' },
      { heading: 'Keep it groomed', body: 'A backlog rots if ignored. Regularly re-order it as you learn, remove ideas that no longer matter, and make sure the top items are clear and ready to build. A tidy, current backlog means the team never wonders what to do next.' },
      { heading: 'Practice', body: '', exercise: 'Invent five features for a simple app. Score each as high/low value and high/low effort, then put them in the order you would build them. Write one sentence defending your top choice. That reasoning is exactly what an owner is asked for.' },
    ],
  },
  {
    id: 'po-agile',
    title: 'Agile ways of working',
    summary: 'Building in small steps and adjusting as you learn.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand how agile teams work in short cycles, the common rhythms that keep them aligned, and your role in them as an owner.' },
      { heading: 'Small steps over big plans', body: 'Agile means building in short cycles - deliver a small working piece, get feedback, improve - rather than spending months on a giant plan that might be wrong. You learn by shipping real things and seeing how people respond, not just by thinking harder up front.' },
      { heading: 'Sprints and the common ceremonies', body: 'Many teams work in SPRINTS - short fixed periods (often one or two weeks) that each deliver something usable. A few light rituals keep it on track: planning (what will we do this sprint?), a quick daily check-in (what\'s done, next, blocked?), a review (show the work), and a retrospective (how do we improve?).' },
      { heading: 'Who does what', body: 'In a common setup, the OWNER decides what matters and keeps the priorities clear, the TEAM decides how to build it and does the work, and a FACILITATOR keeps the process smooth and removes blockers. The owner protects focus; the team owns the how. Respecting that split keeps a team healthy.' },
      { heading: 'Adapt from feedback', body: 'The whole point of short cycles is to learn and adjust. After each one, real results and user feedback should shape what comes next - dropping ideas that did not land and doubling down on what did. An owner who updates the plan based on evidence is doing the job exactly right.' },
      { heading: 'Practice', body: '', exercise: 'Plan a one-week sprint for a small project: pick two or three stories from a backlog you could realistically finish, and write what "done" looks like for the week. Keeping a sprint small and clearly finished is a skill teams prize.' },
    ],
  },
  {
    id: 'po-data',
    title: 'Measuring success with data',
    summary: 'Letting real numbers - not just opinions - guide what to build next.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to choose simple, meaningful metrics and read basic data to make better product decisions.' },
      { heading: 'Decisions from evidence', body: 'Good owners check what users actually DO, not just what people say in meetings. If almost no one uses a feature everyone was sure they wanted, that is a signal worth more than any opinion. Letting evidence settle debates keeps a team honest and focused.' },
      { heading: 'Simple, meaningful metrics', body: 'Start with a few clear numbers: how many people use the product (active users), how many complete a key action (conversion), and where they give up (drop-off). You do not need fancy analytics - just the habit of asking "what does the data say?" before deciding. Avoid vanity metrics that look nice but change no decision.' },
      { heading: 'Reading a funnel', body: 'A FUNNEL tracks users through steps toward a goal - visited, signed up, completed purchase - and shows where most drop out. The biggest drop-off is usually the most valuable thing to fix, because improving it lifts everything downstream. Funnels turn a vague "users aren\'t converting" into a precise place to act.', diagram: D.flow('Visit', 'Sign up', 'Convert') },
      { heading: 'Tools, briefly', body: 'Analytics tools (such as Google Analytics) record this behaviour for you - which pages people see, what they click, where they leave. As an owner you mostly need to read and interpret these, asking the right questions, rather than set up the tracking yourself.' },
      { heading: 'Practice', body: '', exercise: 'For a feature you care about, pick two metrics that would tell you if it is succeeding, and one funnel of three or four steps a user takes toward its goal. Predict where users most likely drop off. Choosing the right things to measure is half of good product judgement.' },
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
    title: 'How non-technical roles power tech teams',
    summary: 'You do not need to code to be essential to building software.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand the real, valuable non-technical roles on a software team and where your own strengths fit in.' },
      { heading: 'Teams need far more than coders', body: 'Software teams need people to organise the work, write clear documents, talk to users, analyse results, and keep everyone aligned. These roles are the glue that turns a group of individual coders into a team that actually ships. Without them, even great developers drift and stall.' },
      { heading: 'The roles you can grow into', body: 'If you are organised, clear, and good with people or numbers, several paths open: project or delivery management, business analysis, technical writing, data analysis, user research, and coordination. Each is a real, respected contribution to building software - no code required.' },
      { heading: 'Where you add value', body: 'Your value is making the team more effective: turning fuzzy ideas into clear plans, writing the doc that stops ten repeated questions, spotting the insight in the numbers, or keeping a stuck teammate unblocked. Done well, this work is just as real as the code, and just as provable.' },
      { heading: 'Practice', body: '', exercise: 'List your three strongest skills (e.g. writing, organising, explaining, analysing). For each, name a non-technical tech-team role it suits. This honest self-map is how you choose where to grow first.' },
    ],
  },
  {
    id: 'lead-pm',
    title: 'Project management and agile fundamentals',
    summary: 'Keeping the right work organised, visible, and moving.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will understand what project management really is and be able to set up a simple board and rhythm that keeps a team\'s work visible and flowing.' },
      { heading: 'What project management is', body: 'Project management is making sure the right work happens, in the right order, by the right time. A project manager removes blockers, tracks progress, and keeps everyone pointed at the same goal. It is less about bossing and more about clearing the path so the team can do their best work.' },
      { heading: 'Boards and tasks', body: 'Teams track work on simple boards with columns like To Do, In Progress, and Done. Each task is a card that moves across as it progresses. This gives everyone a shared, honest picture of where things stand at a glance - no status meeting required to see what is happening.', diagram: D.flow('To Do', 'In Progress', 'Done') },
      { heading: 'Agile rhythms', body: 'Many teams work in short cycles (sprints) with light rituals: a planning session to choose the cycle\'s work, a quick daily check-in on progress and blockers, and a review at the end. The aim is steady, visible progress and fast course-correction rather than one big risky plan.' },
      { heading: 'Removing blockers', body: 'A core part of the job is noticing when someone is stuck - waiting on a decision, an access, an answer - and clearing it fast. A team where blockers are spotted and removed quickly simply moves faster. Being the person who unblocks others makes you quietly indispensable.' },
      { heading: 'Practice', body: '', exercise: 'For any small project (even a personal one), set up a board with To Do, In Progress, and Done columns and add five real tasks. Move them as you work for a few days. Managing visible flow is the heart of the role.' },
    ],
  },
  {
    id: 'lead-writing',
    title: 'Technical writing and documentation',
    summary: 'Explaining things so clearly that others can just act.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to write clear documentation - including basic Markdown - that saves your team time and answers questions before they are asked.' },
      { heading: 'Why writing matters', body: 'Clear documents save teams enormous amounts of time. A good "how to use this" guide means people stop asking the same question, and a clear decision record stops old arguments restarting. Writing well is a genuine technical skill, valued even when no code is involved.' },
      { heading: 'Keep it simple and audience-first', body: 'Good technical writing uses short sentences, plain words, and clear steps. Picture your reader as busy and new to the topic, and write for them. If a sentence can be shorter, shorten it. Clarity, not cleverness, is the whole goal.' },
      { heading: 'A reliable structure', body: 'Most useful docs follow a simple shape: what this is and who it is for, how to use it (clear steps), and an example. Headings and short lists let a reader scan to the part they need instead of reading every word. Structure is what makes a document usable rather than just present.' },
      { heading: 'Markdown basics', body: 'Markdown is a simple way to format text that is used everywhere in tech - READMEs, docs, wikis. A few symbols do most of the work: # for headings, - for bullet points, **bold**, and backticks for code. It is easy to learn and instantly makes your writing clean and structured.', code: '# Project Title\n\nA one-line description of what this does.\n\n## How to use\n\n- Step one\n- Step two\n\nRun it with `npm start`.' },
      { heading: 'Practice', body: '', exercise: 'Write a short README in Markdown for anything - a recipe, a tool, a process you know. Include a title, a one-line summary, a "how to use" section with steps, and one example. Clear docs are an instantly shareable proof of skill.' },
    ],
  },
  {
    id: 'lead-data-analysis',
    title: 'Data analysis for decisions',
    summary: 'Turning a messy pile of numbers into one clear, useful answer.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to take a question, work through real data, and report a clear finding that helps a team decide - no heavy maths required.' },
      { heading: 'Start with a clear question', body: 'Good analysis begins with a sharp question: "Which product sells best?", "When are users most active?", "Where do people give up signing up?" A vague question gives a vague answer. The clearer the question, the more useful and findable the answer.' },
      { heading: 'Gather and clean', body: 'Real data is messy - gaps, duplicates, inconsistent labels. Before you can trust any conclusion you have to clean it: fix or remove the bad rows, unify the labels, check it makes sense. This is usually the biggest and least glamorous part, and skipping it produces confident but wrong answers.' },
      { heading: 'Find the pattern', body: 'With clean data, look for the answer: compare groups, spot trends over time, find the biggest or smallest. Often a simple grouping ("average per category") or a count reveals the insight. You are hunting for the one thing the data is clearly saying.', diagram: D.flow('Question', 'Analyse data', 'Clear answer') },
      { heading: 'Communicate with one clear sentence', body: 'The hardest and most valuable step is turning the analysis into a single plain sentence a decision-maker can act on - "Most sign-ups drop off at the payment step." Back it with one simple chart and you have done real analysis. A finding nobody understands changes nothing.' },
      { heading: 'Practice', body: '', exercise: 'Find a small free dataset (search "sample CSV dataset"). Open it in a spreadsheet, pick one clear question, and answer it - even just by sorting or a quick chart. Then write your finding as one sentence. That sentence is what a team would actually use.' },
    ],
  },
  {
    id: 'lead-communication',
    title: 'Communication and coordinating a team',
    summary: 'Keeping everyone informed, aligned, and unblocked.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will be able to keep a team aligned with clear updates, well-run meetings, and the kind of communication that prevents problems instead of reacting to them.' },
      { heading: 'Clear, regular updates', body: 'Good coordination means everyone knows what is happening without chasing. A simple, repeatable update - what is done, what is next, what is blocked - keeps a team moving smoothly. Short and frequent beats long and rare; people read three lines, not three paragraphs.' },
      { heading: 'Running a good meeting', body: 'Meetings are expensive, so make them count: a clear purpose and agenda sent ahead, only the people who need to be there, and notes capturing decisions and action items (who does what by when). A meeting with no recorded actions was usually a meeting that did not need to happen.' },
      { heading: 'Listening and unblocking', body: 'Much of coordination is noticing when someone is stuck and helping them get unstuck - connecting them to the right person, getting a decision made, removing an obstacle. This means listening more than talking, and following up. A team that feels heard and unblocked simply gets more done.' },
      { heading: 'Writing clearly for async work', body: 'Modern teams are often spread across times and places, so much communication is written - messages, docs, comments. Clear written communication (state the context, the ask, and the deadline) lets work continue without everyone online at once. Sloppy messages create confusion that costs hours.' },
      { heading: 'Practice', body: '', exercise: 'Write a three-line status update for a project (real or imagined): one line each for done, next, and blocked. Then list the agenda and intended decisions for a 15-minute meeting about it. Clear, brief communication is a skill teams notice immediately.' },
    ],
  },
  {
    id: 'lead-contributing',
    title: 'Contributing to a real project',
    summary: 'How a non-technical person plugs into a team and genuinely helps.',
    subtopics: [
      { heading: 'What you will be able to do', body: 'You will know how to join a project in a non-technical role, pick up real work, and contribute in a way that turns your skills into proof.' },
      { heading: 'Find where you fit', body: 'Every project needs more than code: someone to organise tasks, write the docs, analyse results, coordinate people, or test the experience. On joining, read what the project needs and find the gap your strengths fill. You rarely have to invent a role - teams are usually missing exactly this help.' },
      { heading: 'Pick a clear first task', body: 'Start small and concrete: write the README, set up the task board, summarise a round of user feedback, or analyse one simple question. A small, clearly finished contribution builds trust and teaches you the project far faster than waiting for the "perfect" big task.' },
      { heading: 'Communicate like a teammate', body: 'Say what you are working on, ask when genuinely stuck (after trying first), and keep updates short and honest. A reliable communicator who delivers small useful things steadily is worth more to a team than a brilliant person who goes silent for weeks.', diagram: D.flow('Pick a task', 'Do it well', 'Share clearly') },
      { heading: 'Make your work usable', body: 'Hand over work the team can actually use: a doc that is clear, a finding stated in one sentence, a board that is up to date. The test is whether someone else can pick it up without asking you to explain. Usable output is what makes a contribution real rather than just effort.' },
      { heading: 'Your path from here', body: 'You now have the foundations: how non-technical roles fit, project management, writing, analysis, communication, and contributing. The real growth comes from doing - join a project, take one clear task, and deliver it well. That is how this knowledge becomes proof others can see.', exercise: 'On this platform, browse open projects and find one needing a non-technical hand - coordination, writing, analysis, or testing. Write down the first task you would take and how you would deliver it. That is the contributor mindset in action.' },
    ],
  },
    ],
  },

  // ============================ UNIVERSAL / NOT SURE ============================
  company: {
    label: 'Understanding Badges & Ratings',
    intro: 'A short guide for companies: how Ascivan members prove their skills, so you can read profiles and hire with confidence.',
    topics: [
      {
        id: 'co-why-badges',
        title: 'How members prove their skills',
        summary: 'Why a badge on Ascivan means more than a line on a CV.',
        subtopics: [
          { heading: 'What you will learn', body: 'How to read a member\'s badges and ratings so you can quickly judge who is a strong fit for your team or job, and what each signal actually means.' },
          { heading: 'Proof over pedigree', body: 'Ascivan is built on a simple idea: people prove their skills by doing real, collaborative project work, not just by listing credentials. Every badge a member holds was earned by completing an actual project in a team and having that work reviewed. So a badge is evidence of demonstrated ability, not a certificate from a course they watched.' },
          { heading: 'The six skill tracks', body: 'Members specialise in one or more of six tracks: TechDev (coding developers), TechArchs (low/no-code builders), TechQA (quality testers), TechGuard (security, cloud, DevOps), TechPO (product/project owners), and TechLeads (non-technical roles like coordination, writing, analysis). A member\'s badges tell you which kinds of work they have actually done.' },
        ],
      },
      {
        id: 'co-badge-levels',
        title: 'Badge levels and what they mean',
        summary: 'Novice to Expert, with the exact counts and colour tags.',
        subtopics: [
          { heading: 'Levels are earned by doing', body: 'Within each track, a member\'s level rises as they complete more projects in that track. The level is always live - it reflects how many badges they currently hold, not a one-time award. So a higher level means more proven, completed work.' },
          { heading: 'The four levels, with counts and colours', body: 'Novice: 1 badge in the track, shown with a steel/grey ring. Associate: 2 to 5 badges, bronze ring. Advanced: 6 to 10 badges, silver ring. Expert: 11 or more badges, gold ring. So when you see a gold ring on a member\'s badge, they have completed 11+ real projects in that track - a strong, proven specialist.' },
          { heading: 'Reading the colour at a glance', body: 'The ring colour is your fastest signal: grey (just starting), bronze (solid, a few projects in), silver (experienced), gold (expert, heavily proven). The same colours mean the same thing across every track, so a gold TechDev and a gold TechLeads are both top-tier in their area.' },
          { heading: 'How to use this when hiring', body: 'Match the track to your need (coding role - look for TechDev; QA role - TechQA; project leadership - TechPO or TechLeads), then use the level to gauge depth. An Associate is a capable contributor; an Advanced or Expert has a substantial track record you can trust for more senior work.' },
        ],
      },
      {
        id: 'co-ratings',
        title: 'The community rating system',
        summary: 'How teaching ratings and Top Talent surface strong members.',
        subtopics: [
          { heading: 'Members can teach, and get rated', body: 'Once a member reaches Associate level (2+ badges) in a track, they can contribute original lessons to the community Foundations courses. Learners rate those lessons with stars (1 to 5), and the member\'s average teaching rating appears on their profile. A high teaching rating signals someone who not only does the work but can explain and lead - valuable for senior and mentoring roles.' },
          { heading: 'Top Talent on your Proof Wall', body: 'On your Proof Wall you have a Top Talent view that surfaces members who recently earned badges or hold high community teaching ratings, each linking straight to their profile. It is a fast way to discover people who are actively proving themselves right now.' },
          { heading: 'Verified members and companies', body: 'A Premium (verified) badge - the orange PRO mark - means a member or company has been verified by Ascivan. As a company, holding a verified badge tells applicants you are a trustworthy, accountable organisation, which helps you attract better talent. Likewise, you can give extra trust to verified members.' },
          { heading: 'Putting it together', body: 'A strong candidate profile usually shows: badges in the track you need, a level that matches the seniority you want, and ideally a good teaching rating for roles needing communication or leadership. Use the Talent Board to search by track and badges, and Top Talent to spot rising members. Badges show what they have done; ratings show how well they share it.' },
        ],
      },
    ],
  },

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
