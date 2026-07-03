<!-- order: 1 -->
# No-Code Web App Builder (Bubble): Hands-On Project Tutorials

This document turns every project in the No-Code Web App Builder Foundations Course into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term at the moment you need it, while building the thing. Every step explains what you are doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone: a working web app you can show anyone.

---

## Project 1 (Module 1): Set Up Your First Bubble App and Page

**Goal:** Get a real Bubble app running with a page you designed, so every later project has a home.

### Why This Project Matters

No-code still has a workspace, a layout system, and a way of thinking about pages. Getting comfortable with the editor now means every later project is about building features, not fighting the tool.

**Step 1: Create a free Bubble account and a new app.**
Go to bubble.io, sign up, and click Create an app. Give it a clear name like `task-tracker`.
*Why:* One app per real project keeps your work organised and gives you a live URL you can share from day one.

**Step 2: Learn what the editor is.**
Learn: the **Bubble editor** is where you build. It has a visual canvas in the middle, an elements panel on the left, and tabs across the top (Design, Workflow, Data).
*Why:* Every no-code tool separates what a page looks like (Design) from what it does (Workflow) and what it stores (Data). Knowing which tab does what saves hours of hunting.

**Step 3: Learn what a page is.**
Learn: a **page** is one screen of your app, reached by a URL. Your app starts with an `index` page, which is the home screen.
*Why:* Apps are just a set of pages plus the logic that moves users between them. Naming and organising pages early keeps a growing app understandable.

**Step 4: Place your first elements.**
From the left panel, drag a Text element and a Button onto the canvas. Double-click the Text to edit it to `My Task Tracker`.
*Why:* Elements are the visible building blocks of every screen. Practising drag, drop, and edit now makes real layouts fast later.

**Step 5: Learn what a responsive layout is.**
Learn: a **responsive layout** rearranges elements to fit any screen size, from phone to desktop. In Bubble you build inside containers that use row or column layout.
*Why:* Users open apps on every device. A layout that only looks right on your laptop will break for most people who see it.

**Step 6: Group elements into a container.**
Select your Text and Button, right-click, and choose Group elements in a Container. Set the container to Column layout.
*Why:* Containers are how you control spacing and responsiveness. Loose elements pinned to fixed positions are the number one cause of broken mobile layouts.

**Step 7: Preview your app live.**
Click Preview (top right). Your page opens in a new tab at a real bubbleapps.io URL.
*Why:* Preview is your reality check. Building and previewing in a tight loop catches layout problems while they are small.

**Step 8: Document your app structure.**
In a notes doc, write your app name, its URL, and the pages you plan to build. Keep this doc as you go.
*Why:* A one-page map of your app is what keeps a growing project from turning into a maze of unnamed pages.

### Final Project Structure
```text
task-tracker (Bubble app)
│
├── index (page)  ->  Text + Button in a Column container
└── app_notes.md  ->  app name, URL, planned pages
```

### What You Learned
✅ Creating a Bubble app and understanding the editor tabs
✅ What pages, elements, and containers are
✅ Building inside a responsive layout instead of fixed positions
✅ Previewing an app on a live URL
✅ Keeping a simple map of your app's structure

### Portfolio Project
**Bubble App Foundation**: Set up a live no-code web app with a responsive, container-based home page and a documented page structure.
**Skills:** Bubble, Responsive Layout, No-Code App Design, UI Structure.

**Deliverable:** A live Bubble app with a designed home page and a written structure map.

---

## Project 2 (Module 2): Design a Real Data Structure

**Goal:** Define the data your app stores, the single most important decision in any app.

### Why This Project Matters

Every feature you build later reads or writes data. A clear data structure now makes those features simple; a messy one makes every feature painful. This is where no-code apps quietly succeed or fail.

**Step 1: Open the Data tab.**
In the editor, click the Data tab. This is where you define what your app remembers.
*Why:* Separating data from screens is the core mental model of app building. The screen shows data; the Data tab defines it.

**Step 2: Learn what a data type is.**
Learn: a **data type** is a kind of thing your app stores, like a Task or a User. It is the template for records of that kind.
*Why:* Naming your data types is naming the nouns of your app. Get the nouns right and the features almost design themselves.

**Step 3: Create a `Task` data type.**
Under Data types, click New type and name it `Task`.
*Why:* This one type will power the entire task tracker, and later the capstone. Real apps are usually a handful of well-chosen types.

**Step 4: Learn what a field is.**
Learn: a **field** is one piece of information on a data type, like a Task's title or due date. Each field has its own type (text, number, date, yes/no).
*Why:* Choosing the right field type (a date field, not text, for a due date) is what lets you sort, filter, and validate later.

**Step 5: Add fields to `Task`.**
Add: `title` (text), `is_done` (yes/no), `due_date` (date), `priority` (text).
*Why:* These four fields cover displaying, completing, scheduling, and sorting tasks, which are the features you will build next.

**Step 6: Learn what a record (thing) is.**
Learn: a **record**, called a Thing in Bubble, is one actual entry of a data type, like the specific task "Email the client".
*Why:* Types are templates; records are the real data users create. Every create, edit, and delete action works on records.

**Step 7: Add a few records by hand.**
In the Data tab under App data, click New entry and add 3 sample tasks with different priorities and due dates.
*Why:* Real sample data lets you build and test screens without waiting for users. Empty apps are impossible to design against.

**Step 8: Document your data model.**
In your notes, list each data type and its fields with their types.
*Why:* A written data model is the reference you will check constantly while building features, and the thing a teammate needs to understand your app.

### Final Project Structure
```text
Data model
│
├── Task (data type)
│   ├── title       : text
│   ├── is_done     : yes/no
│   ├── due_date    : date
│   └── priority    : text
│
└── data_model.md  ->  types + fields documented
    + 3 sample Task records created in App data
```

### What You Learned
✅ What data types, fields, and records are
✅ Choosing correct field types (date, yes/no, text)
✅ Designing a data model before building screens
✅ Creating sample records to build and test against
✅ Documenting a data model for yourself and others

### Portfolio Project
**App Data Model**: Designed and documented a real data structure with correctly typed fields, plus sample records to build against.
**Skills:** Data Modeling, Bubble Database, App Architecture, No-Code Development.

**Deliverable:** A documented data model with a Task type, correctly typed fields, and sample records.

---

## Project 3 (Module 3): Display Data on the Page

**Goal:** Show your stored records on screen in a list that updates itself.

### Why This Project Matters

Storing data is invisible until you display it. This project connects your Project 2 data to the screen, the moment an app starts to feel real.

**Step 1: Learn what a repeating group is.**
Learn: a **repeating group** is an element that shows one row per record, automatically, however many there are. It is how every list in a no-code app is built.
*Why:* Without it you would place each item by hand. With it, one design shows one task or ten thousand, with no extra work.

**Step 2: Add a repeating group to your page.**
On the index page, drag a Repeating Group onto the canvas. Set its Type of content to `Task` and Data source to `Search for Tasks`.
*Why:* Type of content tells the group what kind of record each row is; Data source tells it which records to pull. Together they connect screen to database.

**Step 3: Learn what a data source is.**
Learn: a **data source** is the query that decides which records appear, such as "all Tasks" or "Tasks that are not done".
*Why:* Most of an app's behaviour is really just choosing the right data source for each list. This is a skill you will reuse constantly.

**Step 4: Design one row (the cell).**
Inside the first cell of the repeating group, add a Text element. Set its text dynamically to the current cell's Task's `title`.
*Why:* You design one cell and the repeating group applies it to every record. Learning to reference "current cell's Task" is the key no-code data-binding move.

**Step 5: Show more fields.**
Add another Text for `due_date` and a Text for `priority`, each bound to the current cell's Task.
*Why:* A useful list shows enough to act on. Binding several fields in one cell is the everyday work of building app screens.

**Step 6: Learn what sorting is.**
Learn: **sorting** orders a list by a field, ascending or descending. On the Data source, add "sorted by due_date, ascending".
*Why:* An unsorted task list is noise. Sorting by due date turns raw records into something a person can actually use.

**Step 7: Preview and confirm live data.**
Preview the app. Your 3 sample tasks should appear, in due-date order. Add a record in the Data tab and refresh; it appears automatically.
*Why:* Seeing new data appear without touching the design proves your list is truly data-driven, not hardcoded.

**Step 8: Document the display logic.**
Note which page shows which data type, the data source used, and the sort order.
*Why:* When a list later shows the wrong items, this note is the first place you will look to fix it.

### Final Project Structure
```text
index (page)
│
└── Repeating Group (Type: Task, Source: Search for Tasks sorted by due_date)
    └── Cell
        ├── Text -> current cell's Task's title
        ├── Text -> current cell's Task's due_date
        └── Text -> current cell's Task's priority
```

### What You Learned
✅ What repeating groups and data sources are
✅ Binding screen elements to record fields (current cell)
✅ Displaying multiple fields per row
✅ Sorting a list by a field
✅ Confirming a list is data-driven, not hardcoded

### Portfolio Project
**Data-Driven List Screen**: Built a self-updating list that displays real records with multiple fields and a meaningful sort order.
**Skills:** Repeating Groups, Data Binding, Bubble, No-Code UI.

**Deliverable:** A page that displays live, sorted records from your data type in a repeating group.

---

## Project 4 (Module 4): Let Users Create and Change Data

**Goal:** Add the input form and actions that let users create, complete, and delete records.

### Why This Project Matters

So far only you can add data, by hand. Real apps let users change data themselves. This project introduces workflows, the logic layer that makes an app interactive.

**Step 1: Learn what a workflow is.**
Learn: a **workflow** is a sequence of actions that runs when something happens, like a button click. Each workflow is an event followed by one or more actions.
*Why:* Workflows are where a no-code app stops being a picture and starts doing things. Every interactive feature is a workflow.

**Step 2: Build an input form.**
Add an Input element for the task title, a DatePicker for the due date, a Dropdown for priority, and a Button labelled `Add task`.
*Why:* Inputs are how users hand data to your app. Matching each input to a field you defined in Project 2 keeps the form clean.

**Step 3: Create a "Create a new Task" workflow.**
Click the Add task button, choose Start/Edit workflow, then add the action Create a new thing, type `Task`.
*Why:* This is the action that turns what the user typed into a real record in your database. It is the single most common action in app building.

**Step 4: Map inputs to fields.**
In the Create action, set `title` to the Input's value, `due_date` to the DatePicker's value, `priority` to the Dropdown's value, and `is_done` to no.
*Why:* Mapping is where the form's contents actually land in the record. A missed mapping is why "the app saved a blank task".

**Step 5: Learn about validation.**
Learn: **validation** is checking input before you save it, such as requiring a title. Add a condition on the button so it is only clickable when the title input is not empty.
*Why:* Without validation, users create broken records that pollute your data. Preventing bad input is cheaper than cleaning it up later.

**Step 6: Add a complete action.**
In the repeating group cell, add a Checkbox. Create a workflow: when its value changes, Make changes to the current cell's Task and set `is_done` to the checkbox's value.
*Why:* Make changes to a thing is how users edit existing records. This one pattern powers every edit feature you will ever build.

**Step 7: Add a delete action.**
Add a small Delete icon to the cell. Workflow: on click, Delete the current cell's Task. Add a confirmation condition first.
*Why:* Delete is powerful and irreversible. Building it with a confirmation from the start is a habit that prevents painful accidents.

**Step 8: Reset inputs after creating.**
Add a final action to the Add task workflow: Reset the inputs.
*Why:* Leaving old text in the form after saving leads users to submit duplicates. Small touches like this are what make an app feel finished.

### Final Project Structure
```text
Workflows
│
├── When "Add task" clicked (only when title is not empty)
│     -> Create a new Task (map title, due_date, priority, is_done=no)
│     -> Reset inputs
├── When cell checkbox changes -> Make changes to Task (is_done)
└── When cell delete clicked (confirm) -> Delete Task
```

### What You Learned
✅ What workflows, events, and actions are
✅ Creating records from user input and mapping inputs to fields
✅ Validating input before saving
✅ Editing records with Make changes to a thing
✅ Deleting records safely with confirmation

### Portfolio Project
**Interactive CRUD App**: Added create, complete, and delete features driven by user input, with validation and safe deletes.
**Skills:** Bubble Workflows, CRUD, Form Validation, No-Code Logic.

**Deliverable:** A working app where users can create, complete, and delete records themselves.

---

## Project 5 (Module 5): Add User Accounts and Private Data

**Goal:** Let people sign up, log in, and see only their own data.

### Why This Project Matters

A task tracker where everyone sees everyone's tasks is a demo, not a product. Accounts and privacy are what make a no-code app safe to put in front of real users.

**Step 1: Learn what the User type is.**
Learn: Bubble gives every app a built-in **User** data type for accounts. You can add your own fields to it, like `name`.
*Why:* Because accounts are so common, the tool provides them. Knowing the User type exists saves you from rebuilding login from scratch.

**Step 2: Build sign-up and log-in forms.**
Add inputs for email and password and two buttons: Sign up and Log in.
*Why:* These two flows are the front door of almost every app. Getting them working is a reusable skill across every project you build.

**Step 3: Create the sign-up workflow.**
On Sign up, add the action Sign the user up, using the email and password inputs.
*Why:* This action both creates the account and logs the person in, the standard onboarding step users expect.

**Step 4: Create the log-in workflow.**
On Log in, add the action Log the user in with the email and password inputs.
*Why:* Returning users need a way back in. Pairing sign-up and log-in completes the account basics.

**Step 5: Learn what "Current User" is.**
Learn: **Current User** is whoever is logged in right now. You can attach data to them and reference them in workflows.
*Why:* Current User is how an app personalises itself. Almost every private feature is built by referencing Current User somewhere.

**Step 6: Link tasks to their owner.**
Add a `creator` field of type User to the Task type. In the Create a new Task action, set `creator` to Current User.
*Why:* Tying each record to its owner is what makes "only my data" possible. Without an owner field, you cannot filter by owner.

**Step 7: Filter the list to the current user.**
Change the repeating group's data source to Search for Tasks where creator = Current User.
*Why:* This single change is what makes the app private. Each person now sees only the tasks they created.

**Step 8: Learn about privacy rules.**
Learn: **privacy rules** control which records a user is even allowed to load, enforced by the database, not just hidden on screen. Add a rule: a Task is only visible when its creator is the Current User.
*Why:* Hiding data on the screen is not the same as protecting it. Privacy rules are what actually keep one user from reaching another's data.

### Final Project Structure
```text
Accounts + privacy
│
├── User (built-in) + field: name
├── Task.creator : User  (set to Current User on create)
├── Repeating group source: Search for Tasks where creator = Current User
└── Privacy rule: Task visible only when creator is Current User
```

### What You Learned
✅ Using Bubble's built-in User type
✅ Building sign-up and log-in workflows
✅ What Current User is and how to reference it
✅ Linking records to their owner
✅ Enforcing real privacy with database privacy rules

### Portfolio Project
**Multi-User App with Private Data**: Added accounts and per-user data isolation enforced by privacy rules, not just screen logic.
**Skills:** Authentication, User Accounts, Data Privacy, Bubble, No-Code Development.

**Deliverable:** An app where users sign up, log in, and can only see and change their own records.

---

## Project 6 (Module 6): Polish, Test, and Publish

**Goal:** Take your app from "works on my screen" to a shareable, tested, published product.

### Why This Project Matters

The gap between a rough build and something you can put on your portfolio is polish, testing, and publishing. This project closes that gap and makes your app real.

**Step 1: Learn what responsive testing is.**
Learn: **responsive testing** is checking your app on different screen widths. Use Bubble's responsive preview to view phone, tablet, and desktop widths.
*Why:* Most of your users will be on phones. An app that only looks right on desktop will feel broken to most people who open it.

**Step 2: Fix layout issues per breakpoint.**
Adjust container widths, min-widths, and hidden elements so each width looks intentional.
*Why:* Responsive fixes are where an app goes from amateur to professional in a viewer's first three seconds.

**Step 3: Add loading and empty states.**
Show a friendly message when the task list is empty (for example, "No tasks yet, add your first one").
*Why:* An empty screen looks like a bug. An empty state tells the user what to do next, which is the mark of a considered app.

**Step 4: Test every workflow deliberately.**
Sign up as a new user, create tasks, complete them, delete one, log out, log back in. Confirm your data persists and stays private.
*Why:* Clicking through as a real user, in order, is how you catch the workflow gaps that never appear when you test pieces in isolation.

**Step 5: Learn what versions and deployment are.**
Learn: Bubble has a **development** version where you build and a **live** version your users see. Deploying pushes your work from development to live.
*Why:* Keeping a stable live version separate from your in-progress work means you can build safely without breaking what users are already using.

**Step 6: Deploy to live.**
Click Deploy current version to Live. Visit your live URL and run through the app once more.
*Why:* Deployment is the moment your app exists for other people. Testing on the live version confirms it behaves the same as in development.

**Step 7: Write a short product README.**
Create a doc: what the app does, who it is for, how to use it, and the live URL.
*Why:* A README turns a link into a portfolio piece. It is what a reviewer or employer reads before they even click.

**Step 8: Share it and gather one round of feedback.**
Send the live link to two people and ask them to complete one task in the app. Note what confused them.
*Why:* Real users find issues you cannot see because you built it. One feedback round is the fastest quality improvement available.

### Final Project Structure
```text
Published app
│
├── Responsive across phone / tablet / desktop
├── Empty + loading states
├── Live deployment (separate from development)
├── product_readme.md
└── feedback_notes.md
```

### What You Learned
✅ Responsive testing and fixing layouts per width
✅ Designing empty and loading states
✅ Testing full user journeys in order
✅ The difference between development and live versions
✅ Deploying, documenting, and gathering feedback

### Portfolio Project
**Published, Tested Web App**: Polished an app for all screen sizes, tested full user journeys, deployed it live, and documented it for a real audience.
**Skills:** Responsive Design, QA Testing, Deployment, Technical Writing, No-Code Development.

**Deliverable:** A live, published, responsive app with documentation and a round of user feedback.

---

## Final Capstone: Build and Ship a Complete No-Code Web App

**Goal:** Combine every project above into one original, published app. This is an integration exercise, not a new tool to learn.

### Why This Project Matters

This is the project that goes on your resume and in interviews. It proves you can carry an app from an idea to a designed data model, interactive features, real accounts, and a live deployment, all without writing code.

**Step 1: Choose your own app idea.**
Pick something small and real: a habit tracker, a simple booking tool, a reading list, a community directory.
*Why:* An original idea is far more compelling to an employer than a repeat of the tutorial. Small and finished beats big and broken.

**Step 2: Design the data model (Project 2 skills).**
List your data types and fields before building anything. Add sample records.
*Why:* Starting from data keeps the build focused. Every screen you make will simply be a view onto this model.

**Step 3: Build the display screens (Project 3 skills).**
Create the repeating groups and detail views that show your data, sorted sensibly.
*Why:* Getting data on screen early gives you something real to build actions around.

**Step 4: Add interactivity (Project 4 skills).**
Build the create, edit, and delete workflows your app needs, with validation.
*Why:* This is the point your app becomes usable rather than just viewable.

**Step 5: Add accounts and privacy (Project 5 skills).**
Add sign-up and log-in, link records to their owner, and set privacy rules.
*Why:* Accounts and privacy are what make the app safe to share with real users.

**Step 6: Polish, test, and deploy (Project 6 skills).**
Make it responsive, add empty states, test full journeys, and deploy to live.
*Why:* Polish and a live URL are what turn a build into a portfolio piece someone can actually try.

**Step 7: Write the capstone document.**
Combine your app idea, data model, a list of features, the live URL, and two screenshots.
*Why:* This document is what you hand a reviewer or employer to prove the app is real, understood, and yours.

### Final Project Structure
```text
capstone_app (Bubble)
│
├── Data model (your types + fields)
├── Display screens (repeating groups, detail views)
├── Workflows (create / edit / delete + validation)
├── Accounts + privacy rules
├── Live deployment
└── capstone_summary.md  ->  idea, model, features, URL, screenshots
```

### What You Learned
✅ Turning an original idea into a designed data model
✅ Building display, interactivity, accounts, and privacy end to end
✅ Deploying a complete app to a live URL
✅ Documenting an app for a real audience
✅ Shipping a finished, original no-code product

### Portfolio Project
**Complete No-Code Web App (Capstone)**: Designed, built, secured, and published an original multi-user web app with a real data model, full CRUD, accounts, privacy rules, and a live deployment.
**Skills:** Bubble, Data Modeling, Workflows, Authentication, Privacy, Responsive Design, Deployment, No-Code Development.

**Deliverable:** A live, original, multi-user no-code web app, plus a written summary connecting it back to every project that built it.
