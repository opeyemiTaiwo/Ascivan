<!-- order: 4 -->
# Internal Tools Builder (Retool and Airtable): Hands-On Project Tutorials

This document turns every project in the Internal Tools Builder Foundations Course into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term at the moment you need it, while building the thing. Every step explains what you are doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone: a real internal tool a team could use to run part of their work.

---

## Project 1 (Module 1): Build a Database in Airtable

**Goal:** Create a structured, relational database that will power the tools you build later.

### Why This Project Matters

Internal tools are only as good as the data behind them. Airtable gives you a real, relational database with a friendly interface, and getting the data right first makes every tool afterwards straightforward.

**Step 1: Create a free Airtable account and a base.**
Go to airtable.com, sign up, and create a new base named `operations`.
*Why:* A base is a single database for a project. Starting one now gives every later tool a real place to read and write data.

**Step 2: Learn what a table is.**
Learn: a **table** holds one kind of record, like Customers or Orders. A base can have several tables.
*Why:* Splitting data into clear tables is the foundation of a database that stays organised as it grows.

**Step 3: Create your first table and fields.**
Create a `Customers` table with fields: name (text), email (email), status (single select), and created (date).
*Why:* Choosing correct field types (email, select, date) lets Airtable validate and filter data automatically later.

**Step 4: Learn what a linked record is.**
Learn: a **linked record** connects a row in one table to a row in another, like an Order linked to a Customer.
*Why:* Links are what make a database relational. They stop you from copying the same customer details into every order.

**Step 5: Create a linked `Orders` table.**
Create an `Orders` table with fields: order number, amount (currency), status, and a link to `Customers`.
*Why:* Modelling orders that reference customers is the classic relational pattern behind almost every internal tool.

**Step 6: Learn what a view is.**
Learn: a **view** is a saved way of looking at a table: filtered, sorted, or grouped, without changing the data.
*Why:* Views let one table serve many needs (all orders, open orders, orders this week) without duplicating anything.

**Step 7: Create useful views.**
Create views: "Open orders" (filtered by status), "This month" (filtered by date), grouped by customer.
*Why:* Well-designed views are often half the value of an internal tool, giving each team member exactly the slice they need.

**Step 8: Add sample data.**
Add several customers and orders with realistic, varied values.
*Why:* Realistic sample data lets you build and test tools against something that behaves like production.

### Final Project Structure
```text
operations (Airtable base)
│
├── Customers (name, email, status, created)
├── Orders (order#, amount, status, link -> Customers)
└── Views: Open orders, This month, Grouped by customer
```

### What You Learned
✅ What bases, tables, and fields are
✅ Choosing correct field types for validation
✅ Linking records for a relational database
✅ Creating filtered and grouped views
✅ Building a realistic sample dataset

### Portfolio Project
**Relational Airtable Database**: Designed a clean, relational database with linked tables, correct field types, and useful views.
**Skills:** Airtable, Data Modeling, Relational Databases, Views.

**Deliverable:** A relational Airtable base with linked tables and purpose-built views.

---

## Project 2 (Module 2): Automate and Compute Inside Airtable

**Goal:** Make your database do work for you with formulas, rollups, and automations.

### Why This Project Matters

A database that only stores data makes people do the math. Formulas and automations turn Airtable from a spreadsheet into a system that calculates, updates, and reacts on its own.

**Step 1: Learn what a formula field is.**
Learn: a **formula field** calculates its value from other fields, like combining first and last name, or flagging overdue orders.
*Why:* Formulas remove manual calculation and keep derived values always correct and up to date.

**Step 2: Add a formula field.**
In `Orders`, add a formula field `is_overdue` that is true when the status is open and the date is old.
*Why:* Computed flags like this power the filters and alerts your tools will rely on.

**Step 3: Learn what a rollup is.**
Learn: a **rollup** summarises linked records, like totalling all orders for a customer.
*Why:* Rollups turn relationships into insight (lifetime value, order counts) without any manual tallying.

**Step 4: Add a rollup to Customers.**
In `Customers`, add a rollup `total_spent` that sums the amount of all linked orders.
*Why:* A per-customer total is exactly the kind of at-a-glance metric an internal tool should surface.

**Step 5: Learn what an Airtable automation is.**
Learn: an **automation** runs actions when something happens in the base, like sending an email when status changes.
*Why:* In-base automation handles routine reactions so team members do not have to remember to do them.

**Step 6: Build a status-change automation.**
Create an automation: when an order's status becomes `shipped`, send the customer an email.
*Why:* Automatic customer updates are a common, high-value feature that would otherwise be manual and easily forgotten.

**Step 7: Learn about data integrity.**
Learn: **data integrity** means keeping data accurate and consistent, using required fields and validation.
*Why:* Tools built on inconsistent data produce wrong answers. Protecting integrity at the source prevents that.

**Step 8: Add integrity safeguards.**
Make key fields required and use single-select options to prevent typos in status values.
*Why:* Constraining input at entry is far cheaper than cleaning bad data after it spreads through your tools.

### Final Project Structure
```text
Automated base
│
├── Orders.is_overdue (formula)
├── Customers.total_spent (rollup)
├── Automation: status = shipped -> email customer
└── Integrity: required fields + single-select statuses
```

### What You Learned
✅ Calculating values with formula fields
✅ Summarising linked data with rollups
✅ Building automations inside Airtable
✅ Protecting data integrity with constraints
✅ Turning a database into a reactive system

### Portfolio Project
**Smart, Automated Database**: Added formulas, rollups, automations, and integrity safeguards that make a database compute and react on its own.
**Skills:** Airtable Formulas, Rollups, Automations, Data Integrity.

**Deliverable:** An Airtable base that computes metrics, reacts to changes, and protects its own data quality.

---

## Project 3 (Module 3): Build Your First Retool App

**Goal:** Build a custom interface in Retool that reads from and writes to your Airtable data.

### Why This Project Matters

Airtable is great for the team that owns the data, but a purpose-built app is clearer and safer for everyone else. Retool lets you build that app fast, connected to real data.

**Step 1: Create a free Retool account.**
Go to retool.com and sign up. Retool builds internal apps by dragging components onto a canvas.
*Why:* Retool is the leading internal-tools platform, so these skills map directly to real jobs.

**Step 2: Learn what a resource is.**
Learn: a **resource** is a connection to a data source, like your Airtable base or a database.
*Why:* Every Retool app reads and writes through resources. Connecting one is the first real step of any tool.

**Step 3: Connect Airtable as a resource.**
Add an Airtable resource using your API key and base, so Retool can reach your data.
*Why:* This link is what makes the tool live. Without it, you are only designing an empty shell.

**Step 4: Learn what a query is.**
Learn: a **query** fetches or changes data through a resource, like "get all open orders".
*Why:* Queries are how a Retool app talks to your data. Most of building a tool is writing the right queries.

**Step 5: Build a query and a table.**
Create a query that reads `Orders`, then drag a Table component and bind it to that query.
*Why:* A live table of real orders is the backbone of most internal tools and an immediate, visible result.

**Step 6: Learn what a component is.**
Learn: a **component** is a UI element like a table, button, form, or text, arranged on the canvas.
*Why:* Components are how you assemble an interface. Knowing the main ones lets you build almost any tool layout.

**Step 7: Add a detail panel.**
Add text and image components that show details of the row selected in the table.
*Why:* A master-detail layout (list plus selected details) is the most common and useful internal-tool pattern.

**Step 8: Learn about binding data with references.**
Learn: **binding** connects a component to data using a reference like `{{ table1.selectedRow }}`.
*Why:* Binding is the core Retool skill. It is how every component shows the right, live data.

### Final Project Structure
```text
Retool app 1
│
├── Resource: Airtable (operations base)
├── Query: get Orders
├── Table (bound to query)
└── Detail panel ({{ table.selectedRow }} fields)
```

### What You Learned
✅ What resources, queries, and components are
✅ Connecting Retool to a real data source
✅ Displaying live data in a table
✅ Building a master-detail layout
✅ Binding components to data with references

### Portfolio Project
**Live Internal Dashboard**: Built a Retool app connected to real data with a table and a master-detail view.
**Skills:** Retool, Data Binding, Internal Tools, Master-Detail UI.

**Deliverable:** A Retool app that displays live records with a working detail panel.

---

## Project 4 (Module 4): Add Actions That Write Data

**Goal:** Let users create, edit, and update records from your Retool app, safely.

### Why This Project Matters

A read-only tool only shows problems; it cannot fix them. Write actions let a team actually do their work in the tool, which is the whole point of building it.

**Step 1: Learn what a mutating query is.**
Learn: a **mutating query** changes data (create, update, delete), unlike a read query that only fetches.
*Why:* Knowing the difference matters because mutating queries need more care: they change real records.

**Step 2: Build a form to edit a record.**
Add a Form with inputs bound to the selected order's fields (status, amount, notes).
*Why:* An edit form is the most common write feature, letting users correct and update records in place.

**Step 3: Create an update query.**
Create a query that updates the selected order with the form's values, triggered by a Save button.
*Why:* This connects the form to the database, turning user input into a real change in your Airtable data.

**Step 4: Learn about triggering queries on events.**
Learn: queries can run on **events**, like a button click or a successful save.
*Why:* Event-driven queries are how tools respond to users. Wiring the Save button to the update query is the pattern.

**Step 5: Add success and failure handling.**
Set the query to show a success message and refresh the table on success, and an error message on failure.
*Why:* Clear feedback tells users their change worked, and a refresh keeps the tool showing current data.

**Step 6: Build a create-record form.**
Add a second form and query to create a brand new order.
*Why:* Creating records rounds out the tool so a team can run the whole workflow, not just edit existing data.

**Step 7: Learn about confirmation on destructive actions.**
Learn: a **confirmation** step asks the user to confirm before an irreversible action like delete.
*Why:* Deletes and bulk changes are dangerous. Confirmation prevents costly mistakes and is expected in professional tools.

**Step 8: Add a guarded delete.**
Add a delete button with a confirmation dialog before the delete query runs.
*Why:* Guarding destructive actions is a habit that protects real business data from a single misclick.

### Final Project Structure
```text
Write actions
│
├── Edit form -> update query (Save button)
├── Create form -> insert query
├── Success/failure messages + table refresh
└── Delete button -> confirmation -> delete query
```

### What You Learned
✅ The difference between read and mutating queries
✅ Building edit and create forms bound to data
✅ Triggering queries on events like button clicks
✅ Handling success and failure with feedback
✅ Guarding destructive actions with confirmation

### Portfolio Project
**Full CRUD Internal Tool**: Added safe create, edit, and delete actions so a team can run its workflow inside the tool.
**Skills:** Retool, CRUD, Event Handling, Safe Actions.

**Deliverable:** A Retool app where users can create, edit, and safely delete real records.

---

## Project 5 (Module 5): Add Access Control and Roles

**Goal:** Control who can see and do what, so the tool is safe to share across a team.

### Why This Project Matters

Not everyone should be able to delete records or see sensitive data. Access control is what makes an internal tool safe to hand to a whole team instead of just its builder.

**Step 1: Learn what roles and permissions are.**
Learn: a **role** is a group of users (like admin or viewer); **permissions** decide what each role can do.
*Why:* Roles let you set access once per group instead of per person, which scales as a team grows.

**Step 2: Learn about user identity in Retool.**
Learn: Retool knows the **current user** and their role, which you can reference in the app.
*Why:* Referencing the current user is how a single app can behave differently for admins and everyone else.

**Step 3: Hide admin controls from non-admins.**
Set the delete button and sensitive fields to be visible only when the current user is an admin.
*Why:* Hiding dangerous controls from most users prevents accidents and keeps the interface simple for them.

**Step 4: Learn the difference between hiding and enforcing.**
Learn: hiding a control in the UI is not the same as blocking the action at the data layer.
*Why:* A truly safe tool restricts what each role can do at the source, not just what they can see.

**Step 5: Restrict queries by role.**
Configure permissions so only admins can run destructive or sensitive queries.
*Why:* Enforcing limits on the queries themselves is what actually protects data, beyond just a hidden button.

**Step 6: Build a role-aware view.**
Show a manager summary to admins and a simpler task list to regular users, in the same app.
*Why:* One app that adapts to each role is cleaner and cheaper to maintain than separate tools per group.

**Step 7: Learn about audit trails.**
Learn: an **audit trail** records who changed what and when.
*Why:* When something goes wrong in a shared tool, an audit trail is how you find out what happened and by whom.

**Step 8: Add basic logging of changes.**
Log key actions (who updated or deleted an order, and when) to an Airtable log table.
*Why:* A simple change log gives you accountability and makes the tool trustworthy for a whole team.

### Final Project Structure
```text
Access control
│
├── Roles: admin, member
├── Admin-only controls (delete, sensitive fields) hidden + enforced
├── Role-restricted queries
├── Role-aware views (admin summary vs member tasks)
└── Change log table (who/what/when)
```

### What You Learned
✅ What roles and permissions are
✅ Referencing the current user and role
✅ The difference between hiding and enforcing access
✅ Restricting sensitive queries by role
✅ Adding audit logging for accountability

### Portfolio Project
**Role-Based Team Tool**: Added roles, enforced permissions, role-aware views, and audit logging so a tool is safe for a whole team.
**Skills:** Access Control, Roles and Permissions, Retool, Auditing.

**Deliverable:** An internal tool with real role-based access control and a change log.

---

## Project 6 (Module 6): Polish, Deploy, and Onboard the Team

**Goal:** Turn a working tool into a polished, deployed product the team actually adopts.

### Why This Project Matters

A tool nobody understands or trusts goes unused. Polish, deployment, and onboarding are what turn a build into something a team relies on every day.

**Step 1: Learn about layout and usability.**
Learn: good **layout** groups related controls, guides the eye, and reduces clicks to complete a task.
*Why:* A cluttered tool slows people down and gets abandoned. Clear layout is what makes a tool feel effortless.

**Step 2: Organise the interface.**
Group the app into clear sections or tabs (for example, Orders, Customers, Reports).
*Why:* Sectioning matches how people think about their work and keeps a growing tool navigable.

**Step 3: Add helpful states.**
Add empty states, loading indicators, and clear labels throughout.
*Why:* These small touches remove confusion and make the tool feel finished and trustworthy.

**Step 4: Learn about environments.**
Learn: many teams keep a **staging** environment for testing and a **production** one for real use.
*Why:* Separating test from live means you can improve the tool without risking the data the team depends on.

**Step 5: Deploy and share the app.**
Publish the app and share it with the intended users, respecting their roles.
*Why:* Deployment is the moment the tool becomes real for the team. Sharing by role keeps access correct from day one.

**Step 6: Write user documentation.**
Create a short guide: what the tool does, how to do each common task, and who to ask for help.
*Why:* Documentation lowers the barrier to adoption and cuts the support questions you would otherwise field yourself.

**Step 7: Run an onboarding walkthrough.**
Walk the team through the tool with a real task each person will do.
*Why:* People adopt a tool far faster when they have done a real task in it once, with guidance.

**Step 8: Gather feedback and iterate once.**
Collect the team's first reactions and make one round of improvements.
*Why:* The first week of real use reveals the highest-value fixes. Acting on them is what turns a tool into a habit.

### Final Project Structure
```text
Deployed tool
│
├── Clear layout (sections / tabs)
├── Empty, loading, and labelled states
├── Staging vs production
├── Deployed and shared by role
├── user_guide.md
└── Onboarding walkthrough + one iteration
```

### What You Learned
✅ Designing clear, usable layouts
✅ Adding empty, loading, and labelled states
✅ Using staging and production environments
✅ Deploying and sharing a tool by role
✅ Documenting, onboarding, and iterating for adoption

### Portfolio Project
**Deployed, Adopted Internal Tool**: Polished, deployed, documented, and onboarded a team onto a tool they can use daily.
**Skills:** UX, Deployment, Technical Writing, Onboarding, Retool.

**Deliverable:** A polished, deployed internal tool with user documentation and a completed onboarding.

---

## Final Capstone: Build a Complete Internal Tool for a Real Team Process

**Goal:** Combine every project into one internal tool that runs a real team process. This is an integration exercise, not new material.

### Why This Project Matters

This is the tool you show employers, and the kind of build companies hire internal-tools specialists for. It proves you can take a messy process and give a team a safe, custom system to run it.

**Step 1: Choose a real team process.**
Pick one: order management, applicant tracking, inventory, support ticket handling, or content approvals.
*Why:* A recognisable process makes your capstone instantly understandable and clearly valuable to an employer.

**Step 2: Design the database (Projects 1 and 2 skills).**
Model the tables, links, formulas, and automations the process needs.
*Why:* A clean, computed database is the foundation the whole tool stands on.

**Step 3: Build the core app (Projects 3 and 4 skills).**
Build the Retool interface with live data, master-detail views, and full create, edit, and delete.
*Why:* This is the working tool the team will use to run the process day to day.

**Step 4: Add access control (Project 5 skills).**
Add roles, enforced permissions, role-aware views, and audit logging.
*Why:* Access control is what makes the tool safe to give to a whole team rather than one person.

**Step 5: Polish and deploy (Project 6 skills).**
Organise the layout, add helpful states, deploy, and document it.
*Why:* Polish and deployment are what turn a build into a tool the team actually adopts.

**Step 6: Onboard and gather results.**
Onboard the intended users and note the time or errors the tool saves.
*Why:* Real adoption and a concrete result are the most convincing proof of your work.

**Step 7: Write the capstone summary.**
Summarise the process, the data model, the features, the roles, and the impact, with screenshots.
*Why:* This summary is what you hand an employer to prove the tool is real, complete, and yours.

### Final Project Structure
```text
capstone_tool
│
├── Airtable database (tables, links, formulas, automations)
├── Retool app (live data, master-detail, full CRUD)
├── Access control (roles, permissions, audit log)
├── Polished layout + deployed + documented
├── Onboarding + measured impact
└── capstone_summary.md (process, model, features, roles, impact)
```

### What You Learned
✅ Turning a real team process into a custom internal tool
✅ Combining a smart database with a full-featured app
✅ Securing a tool with roles, permissions, and auditing
✅ Deploying, documenting, and driving adoption
✅ Shipping a complete, impactful internal tool

### Portfolio Project
**Complete Internal Tool (Capstone)**: Designed the database, built the app, secured it with roles, deployed it, and onboarded a team onto a custom tool that runs a real process.
**Skills:** Airtable, Retool, Data Modeling, CRUD, Access Control, Auditing, Deployment, No-Code Development.

**Deliverable:** A complete, deployed, role-secured internal tool that runs a real team process, plus a summary of its impact.
