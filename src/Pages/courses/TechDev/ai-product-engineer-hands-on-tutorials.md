# AI Product Engineer — Hands-On Project Tutorials

This document turns every project in the **AI Product Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Write an AI Product Brief

**Goal:** Learn to frame a real problem in product terms before touching any code — the habit that separates a useful AI feature from a novelty.

### Why This Project Matters

Most failed AI features fail before a single line of code is written — because no one clearly defined the problem, the user, or what success looks like. This project builds that muscle first, so every later project in this course has a real target to build toward.

**Step 1 — Set up a project folder.**
```bash
mkdir ai_product_brief_project
cd ai_product_brief_project
```
*Why:* Every project in this course produces a document or prototype — keeping them in one folder builds the portfolio you'll show later.

**Step 2 — Identify a real problem worth solving.**
Learn: an **AI-suited problem** is one with a pattern to learn from data, ambiguity that rules-based code can't handle, and enough volume to be worth automating (e.g., "summarize long support tickets," not "add two numbers").
*Why:* Not every problem needs AI — picking the wrong problem is the most common beginner mistake in AI product work.

**Step 3 — Define the user.**
```bash
nano brief.md
```
Write one sentence: who experiences this problem, and how often?
*Why:* A feature built for "everyone" usually helps no one — a specific user makes every later design decision easier.

**Step 4 — State the problem in one sentence.**
Learn: a good problem statement follows the pattern "[user] struggles to [task] because [reason], which causes [consequence]."
*Why:* This format forces you to name the *cause*, not just the symptom — which is what an AI feature actually needs to address.

**Step 5 — Propose the AI-powered solution.**
Write 2-3 sentences describing what the feature would do, in plain language (no implementation details yet).
*Why:* Describing the solution before the technology keeps you anchored to the user problem instead of "what's the coolest thing I could build."

**Step 6 — Define what success looks like.**
Learn: a **success metric** is a measurable signal that the feature is working (e.g., "support ticket resolution time drops by 20%"), different from a **vanity metric** (e.g., "users saw the feature").
*Why:* Without this, you can't tell the difference between a feature that works and one that just exists.

**Step 7 — Note constraints and risks.**
List: cost limits, data availability, privacy concerns, and what happens if the AI gets it wrong.
*Why:* Naming risks early is cheaper than discovering them after the feature ships.

**Step 8 — Assemble the final brief.**
Combine Steps 3–7 into one page: Problem → User → Solution → Success Metric → Constraints/Risks.
*Why:* This one-pager is what you'd actually hand to an engineering team — the deliverable, not just your notes.

### Final Project Structure
```text
ai_product_brief_project/
│
├── brief.md
```

### What You Learned
✅ Identifying AI-suited problems
✅ Defining a specific target user
✅ Writing a clear problem statement
✅ Separating success metrics from vanity metrics
✅ Naming constraints and risks upfront
✅ Assembling a one-page product brief

### Portfolio Project
**AI Feature Product Brief** — Identified a real user problem, defined a target user and success metric, and wrote a one-page product brief proposing an AI-powered solution.
**Skills:** Product Thinking, Problem Framing, Technical Writing, AI Product Strategy.

**Deliverable:** A one-page AI product brief covering problem, user, proposed solution, success metric, and risks.

---

## Project 2 (Module 2): Build an AI-Powered Feature Prototype

**Goal:** Turn your Project 1 brief into a working piece of software for the first time.

### Why This Project Matters

A brief is a hypothesis. This project is where you test whether the idea can actually be built — even in rough form — which is the fastest way to find out if your Project 1 assumptions were right.

**Step 1 — Set up a project folder.**
```bash
mkdir ai_feature_prototype_project
cd ai_feature_prototype_project
```
Copy `brief.md` from Project 1 into this folder for reference.
*Why:* Keeping the brief next to the code keeps the prototype honest — it's easy to drift from the original problem once you start coding.

**Step 2 — Get access to an LLM API.**
Learn: an **API key** is a secret credential that authenticates your requests to a service — treat it like a password.
*Why:* Almost every AI feature today is built on top of an existing model API, not a model you train yourself.

**Step 3 — Make your first API call.**
```bash
nano prototype.py
```
```python
import requests

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={"x-api-key": "YOUR_KEY", "content-type": "application/json"},
    json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 200,
        "messages": [{"role": "user", "content": "Summarize this in one sentence: ..."}]
    }
)
print(response.json())
```
Learn: **JSON** is the text format most APIs use to send and receive structured data — it's how your Python code and the AI service "speak" to each other.
*Why:* This one call is the core building block of almost every AI product feature you'll ever build.

**Step 4 — Wire the API call to your Project 1 problem.**
Replace the placeholder prompt with real input related to your brief's problem (e.g., an actual support ticket if your feature summarizes tickets).
*Why:* A generic API call proves nothing — testing against your real use case is what tells you if the idea works.

**Step 5 — Add basic input handling.**
```python
def run_feature(user_input):
    # build the prompt using user_input, call the API, return the result
    ...
```
Learn: wrapping your API call in a function makes it reusable instead of a one-off script.
*Why:* Every later project in this course builds on top of reusable code, not throwaway scripts.

**Step 6 — Test with 3–5 realistic examples.**
Run your function against several different real-world inputs, not just one.
*Why:* One good result can be luck — several results across varied inputs tell you if the feature is actually reliable.

**Step 7 — Note what worked and what didn't.**
```bash
nano prototype_notes.md
```
Write down cases where the output was wrong, confusing, or unhelpful.
*Why:* These notes become the raw material for Project 6's evaluation plan — don't lose them.

### Final Project Structure
```text
ai_feature_prototype_project/
│
├── brief.md
├── prototype.py
├── prototype_notes.md
```

### What You Learned
✅ Authenticating with an API key
✅ Making a real LLM API call
✅ Working with JSON requests and responses
✅ Wrapping API calls in reusable functions
✅ Testing across multiple realistic inputs
✅ Documenting early failure patterns

### Portfolio Project
**AI Feature Prototype** — Built a working prototype calling a production LLM API, tested against realistic inputs from a real user problem, and documented initial failure patterns.
**Skills:** API Integration, Python, LLM APIs, Prototyping, AI Product Development.

**Deliverable:** A working AI-powered feature prototype, tested against 3–5 realistic inputs.

---

## Project 3 (Module 3): Prototype a Chatbot Feature Using an LLM API

**Goal:** Extend your prototype into a conversational feature — the most common AI product pattern.

### Why This Project Matters

Many AI products are conversational, not single-shot. This project teaches the specific mechanics of multi-turn conversation — memory, context, and prompting — that a one-off API call (Project 2) doesn't need.

**Step 1 — Set up a project folder.**
```bash
mkdir chatbot_prototype_project
cd chatbot_prototype_project
```
*Why:* A chatbot has more moving pieces (history, prompts) than Project 2's single call — worth its own clean space.

**Step 2 — Understand conversation history.**
Learn: LLM APIs are **stateless** — each call has no memory of previous ones. To simulate a "conversation," you resend the full **message history** with every request.
*Why:* Beginners often expect the API to "remember" — understanding statelessness upfront avoids a common early bug.

**Step 3 — Build a message history list.**
```bash
nano chatbot.py
```
```python
history = [{"role": "system", "content": "You are a helpful assistant for [your use case]."}]

def chat(user_message):
    history.append({"role": "user", "content": user_message})
    # call the API with the full `history` list
    # append the assistant's reply back into `history`
    return reply
```
Learn: a **system prompt** sets the AI's role and behavior before the conversation starts.
*Why:* A good system prompt does more to control quality than almost any other single change you can make.

**Step 4 — Write a first version of your system prompt.**
Base it on your Project 1 brief: what should this assistant do, and what should it avoid?
*Why:* Vague prompts produce vague, inconsistent behavior — specificity here pays off across every later test.

**Step 5 — Test a multi-turn conversation.**
Run 3–4 exchanges in a row, checking that the assistant's later replies make sense given earlier turns.
*Why:* This is the test that actually proves the conversation "remembers" — a single message can't show that.

**Step 6 — Add basic guardrails.**
Learn: a **guardrail** is a rule that keeps the AI within intended bounds (e.g., "refuse to answer off-topic questions").
*Why:* Products that don't gently redirect off-topic use quickly become expensive or embarrassing.

**Step 7 — Test edge cases.**
Try: an off-topic question, an ambiguous question, and an empty message.
*Why:* Real users will do all three — testing now is cheaper than discovering it after launch.

### Final Project Structure
```text
chatbot_prototype_project/
│
├── chatbot.py
├── system_prompt.md
├── test_conversations.md
```

### What You Learned
✅ Why LLM APIs are stateless
✅ Building and maintaining message history
✅ Writing an effective system prompt
✅ Testing multi-turn conversations
✅ Adding basic guardrails
✅ Testing edge cases (off-topic, ambiguous, empty input)

### Portfolio Project
**AI Chatbot Feature Prototype** — Built a multi-turn conversational prototype using an LLM API, with a tailored system prompt, guardrails, and tested edge-case handling.
**Skills:** Conversational AI, Prompt Engineering, Python, LLM APIs, AI Product Development.

**Deliverable:** A working chatbot prototype tested across multi-turn conversations and edge cases.

---

## Project 4 (Module 4): Create a Feature Discovery Doc

**Goal:** Step back from building and validate the feature against real user needs before going further.

### Why This Project Matters

It's easy to keep building on a fun prototype without checking whether it actually solves the Project 1 problem for real users. This project forces that check — the same discipline real product teams use before committing more engineering time.

**Step 1 — Set up a project folder.**
```bash
mkdir discovery_doc_project
cd discovery_doc_project
```
*Why:* Discovery is a distinct deliverable from the prototype — it should be reviewable on its own.

**Step 2 — Write 5 user interview questions.**
Learn: good discovery questions ask about *past behavior* ("tell me about the last time you..."), not hypotheticals ("would you use a feature that...").
*Why:* People are unreliable predictors of their own future behavior but accurate reporters of what they've already done.

**Step 3 — Conduct (or simulate) 3–5 short interviews.**
```bash
nano interview_notes.md
```
If you don't have real users available, simulate this by asking peers who fit your Project 1 target user, or by researching how people currently solve this problem.
*Why:* Talking to even a handful of real people surfaces assumptions no amount of solo thinking will catch.

**Step 4 — Show your Project 3 prototype and get reactions.**
Ask: does this solve the problem? What's missing? What's confusing?
*Why:* Reactions to something concrete are far more useful than reactions to a description.

**Step 5 — Identify patterns across interviews.**
Learn: a **discovery insight** is a pattern repeated across multiple people, not a single person's opinion.
*Why:* One person's complaint might be a fluke; three people saying the same thing is a signal.

**Step 6 — Revisit your Project 1 problem statement.**
Update it if discovery revealed the real problem is different from what you assumed.
*Why:* Discovery's whole purpose is to correct wrong assumptions before more work is built on top of them.

**Step 7 — Write the discovery summary.**
```bash
nano discovery_doc.md
```
Structure: Who you talked to → What you asked → Key insights → What changes for the feature.
*Why:* This doc is what justifies (or redirects) all the engineering work that follows.

### Final Project Structure
```text
discovery_doc_project/
│
├── interview_notes.md
├── discovery_doc.md
```

### What You Learned
✅ Writing behavior-based interview questions
✅ Conducting lightweight user discovery
✅ Getting reactions to a working prototype
✅ Identifying patterns across multiple data points
✅ Revising a problem statement based on evidence
✅ Writing a discovery summary doc

### Portfolio Project
**AI Feature Discovery Research** — Conducted user interviews and prototype testing sessions, synthesized findings into key insights, and used them to validate or redirect an AI feature's direction.
**Skills:** User Research, Product Discovery, Qualitative Analysis, Technical Writing.

**Deliverable:** A discovery doc summarizing interview insights and any resulting changes to the feature direction.

---

## Project 5 (Module 5): Design and Prototype an AI Feature Flow

**Goal:** Design the full user-facing interaction — not just the AI logic, but what the person actually sees and does.

### Why This Project Matters

Projects 2 and 3 proved the AI logic works. But users don't interact with an API — they interact with a screen. This project designs that screen, including the parts that matter most in AI products: what happens when the AI is uncertain, wrong, or slow.

**Step 1 — Set up a project folder.**
```bash
mkdir feature_flow_project
cd feature_flow_project
```
*Why:* Design artifacts (flows, mockups) belong separately from your backend prototype code.

**Step 2 — Map the happy path.**
Learn: the **happy path** is the ideal sequence of steps when everything goes right — user opens the feature, provides input, gets a good result.
*Why:* Designing the ideal case first gives you a baseline before handling what goes wrong.

**Step 3 — Design the input step.**
Sketch (on paper or in a simple tool) how the user provides input to your Project 3 chatbot or Project 2 feature.
*Why:* How input is collected shapes what kind of answers the AI can realistically give — a cramped input box produces vague prompts.

**Step 4 — Design the loading/waiting state.**
Learn: **latency masking** is showing the user something (a message, an animation) while the AI processes, instead of a frozen screen.
*Why:* LLM calls take seconds, not milliseconds — an unhandled wait feels broken even when it isn't.

**Step 5 — Design the error state.**
Sketch what the user sees when the API fails, times out, or returns something unusable.
*Why:* AI features fail more often than typical software features — an undesigned error state is one of the most common gaps in first-time AI products.

**Step 6 — Design the "AI might be wrong" state.**
Learn: **uncertainty UX** communicates confidence level or invites correction (e.g., "Was this helpful? [Yes/No]") instead of presenting AI output as unquestionable fact.
*Why:* Users trust AI features more, not less, when the product is honest about the possibility of error.

**Step 7 — Build a clickable or written walkthrough of the full flow.**
Combine Steps 2–6 into one sequence, either as simple mockup screens or a written step-by-step description.
*Why:* Seeing the whole flow together reveals gaps that reviewing each screen in isolation misses.

### Final Project Structure
```text
feature_flow_project/
│
├── flow_diagram.png (or flow_diagram.md)
├── screens/ (if using mockups)
```

### What You Learned
✅ Mapping a feature's happy path
✅ Designing input collection for AI features
✅ Masking latency during AI processing
✅ Designing error states for AI failures
✅ Designing for AI uncertainty (not presenting output as infallible)
✅ Assembling a full end-to-end interaction flow

### Portfolio Project
**AI Feature UX Flow** — Designed a complete user interaction flow for an AI-powered feature, including input design, latency handling, error states, and uncertainty communication.
**Skills:** UX Design, AI Product Design, Prototyping, User-Centered Design.

**Deliverable:** A designed and prototyped end-to-end flow for the AI feature, covering the happy path, loading, error, and uncertainty states.

---

## Project 6 (Module 6): Define an Evaluation Plan for the AI Feature

**Goal:** Decide, in advance, how you'll know if the feature is actually good — before it ships, not after complaints arrive.

### Why This Project Matters

Your Project 2 notes already showed the AI gets things wrong sometimes. Every AI product does. The difference between a good and bad AI product team isn't zero errors — it's knowing the error rate and having a plan to catch it.

**Step 1 — Set up a project folder.**
```bash
mkdir evaluation_plan_project
cd evaluation_plan_project
```
*Why:* Evaluation artifacts (test sets, scoring rubrics) get reused every time the feature changes — worth a stable home.

**Step 2 — Build a test set from your Project 2 notes.**
```bash
nano test_cases.md
```
Turn your documented failures and successes into a list of 10–15 concrete input/expected-output pairs.
*Why:* A test set turns "it seemed to work" into something you can actually re-check after every change.

**Step 3 — Define a quality rubric.**
Learn: a **rubric** is a scoring guide (e.g., 1–5) for judging subjective AI output on specific dimensions like accuracy, tone, and helpfulness.
*Why:* "Good" is subjective until you write down what "good" means — a rubric makes evaluation repeatable across people and time.

**Step 4 — Score your Project 2/3 prototype against the test set.**
Run each test case through your prototype and score it using your rubric.
*Why:* This is your baseline — every future change to the feature gets compared against this number, not vibes.

**Step 5 — Distinguish quality metrics from business metrics.**
Learn: **quality metrics** measure whether the AI's output is good (accuracy, relevance); **business metrics** measure whether the feature achieves your Project 1 goal (ticket resolution time, user retention).
*Why:* A feature can score well on quality and still fail the business, or vice versa — you need both lenses.

**Step 6 — Design a feedback loop.**
Learn: a **feedback loop** is a mechanism (like a thumbs up/down button from Project 5) that captures real user signal after launch.
*Why:* Your test set is a snapshot; real usage after launch is where you find failure modes you didn't think to test.

**Step 7 — Write the evaluation plan.**
```bash
nano evaluation_plan.md
```
Structure: Test set → Rubric → Baseline scores → Quality vs. business metrics → Feedback loop plan.
*Why:* This plan is what turns "I hope it works" into "here's how we'll know."

### Final Project Structure
```text
evaluation_plan_project/
│
├── test_cases.md
├── rubric.md
├── baseline_scores.md
├── evaluation_plan.md
```

### What You Learned
✅ Building a test set from real observed failures
✅ Writing a scoring rubric for subjective AI output
✅ Establishing a baseline quality score
✅ Distinguishing quality metrics from business metrics
✅ Designing a post-launch feedback loop
✅ Assembling a full evaluation plan

### Portfolio Project
**AI Feature Evaluation Plan** — Built a test set and scoring rubric from observed prototype failures, established a baseline quality score, and designed a post-launch feedback loop.
**Skills:** AI Evaluation, Quality Assurance, Metrics Design, Analytical Thinking, AI Product Development.

**Deliverable:** A written evaluation plan with a test set, rubric, baseline scores, and feedback loop design.

---

## Project 7 (Module 7): Build a Launch Plan for the AI Feature

**Goal:** Package everything you've built into a plan for actually shipping the feature.

### Why This Project Matters

A brief, a prototype, discovery insights, a designed flow, and an evaluation plan are all useless to a team if they're scattered across separate documents nobody reads together. This project is where you become the person who can actually get an AI feature out the door.

**Step 1 — Set up a project folder.**
```bash
mkdir launch_plan_project
cd launch_plan_project
```
*Why:* The launch plan references every previous project — keep those docs accessible from here.

**Step 2 — Define the launch scope.**
Learn: a **limited launch** (or beta) releases a feature to a small subset of users first, instead of everyone at once.
*Why:* AI features carry more uncertainty than typical software — a limited launch catches problems (Project 6's job) before they affect everyone.

**Step 3 — Set launch criteria.**
Using your Project 6 baseline scores, define the minimum quality bar the feature must hit before it launches even to a limited audience.
*Why:* Without a written bar, "is it ready?" becomes a subjective argument instead of a checkable fact.

**Step 4 — Plan the rollout stages.**
Sketch three stages: internal testing → limited beta → full launch, with rough criteria for moving between them.
*Why:* Staged rollout is how real AI products manage risk — nothing launches to everyone on day one.

**Step 5 — Identify who needs to be involved.**
List roles: engineering (to build it), your Project 6 evaluation reviewer, and anyone who needs to sign off before wider release.
*Why:* AI features often fail at launch not because the tech was wrong, but because a needed reviewer or team was skipped.

**Step 6 — Plan post-launch monitoring.**
Reference your Project 6 feedback loop: what will you watch in the first week, and what would trigger a rollback?
*Why:* "Ship and forget" is how small AI quality issues become large, public ones.

**Step 7 — Write the launch plan.**
```bash
nano launch_plan.md
```
Structure: Launch scope → Criteria to launch → Rollout stages → Stakeholders → Post-launch monitoring plan.
*Why:* This is the document that turns a finished prototype into something a real team can actually execute.

### Final Project Structure
```text
launch_plan_project/
│
├── launch_plan.md
```

### What You Learned
✅ Scoping a limited (beta) launch
✅ Setting measurable launch criteria
✅ Planning staged rollout
✅ Identifying required stakeholders
✅ Planning post-launch monitoring and rollback triggers
✅ Assembling a complete launch plan

### Portfolio Project
**AI Feature Launch Plan** — Defined launch criteria based on evaluation benchmarks, planned a staged rollout with stakeholder sign-offs, and designed post-launch monitoring with rollback triggers.
**Skills:** Product Launch Planning, Risk Management, Cross-Functional Coordination, AI Product Development.

**Deliverable:** A launch plan covering scope, criteria, rollout stages, stakeholders, and post-launch monitoring.

---

## Final Capstone: Take an AI Feature from Idea to Working Prototype

**Goal:** Combine every project above into one complete, presentable body of work — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes in your portfolio and in interviews. It's not new material — it's proof you can carry an AI feature through the full real-world lifecycle: problem, prototype, validation, design, evaluation, and launch readiness.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your deliverables from Projects 1–7.
*Why:* The capstone isn't written from scratch — it's assembled and polished from work you've already validated.

**Step 2 — Revisit and finalize your Project 1 brief.**
Update it with anything learned in Project 4's discovery.
*Why:* The brief is the front door to your whole capstone — it should reflect what you actually learned, not just your original guess.

**Step 3 — Finalize your working prototype (Projects 2 & 3).**
Clean up the code, fix any obvious bugs found during testing.
*Why:* A capstone prototype should run reliably in front of someone else, not just on your machine mid-development.

**Step 4 — Attach your discovery insights (Project 4).**
Include a short summary of what you learned from real users and how it shaped the feature.
*Why:* This is the evidence that your feature is grounded in a real problem, not just a cool demo.

**Step 5 — Attach your designed flow (Project 5).**
Include the happy path, error states, and uncertainty handling design.
*Why:* This shows you designed a full product experience, not just a backend script.

**Step 6 — Attach your evaluation plan and baseline scores (Project 6).**
*Why:* This proves you know how to measure quality, not just build something that "seems to work."

**Step 7 — Attach your launch plan (Project 7).**
*Why:* This proves you can think past the prototype to how a real feature actually ships.

**Step 8 — Write the capstone summary.**
```bash
nano capstone_summary.md
```
One page: the problem, the solution, what you learned, how you'd know it's working, and how you'd launch it.
*Why:* This summary is what a hiring manager or teammate reads first — it should tell the whole story without them opening every other file.

### Final Project Structure
```text
capstone_project/
│
├── brief.md
├── prototype.py
├── chatbot.py
├── discovery_doc.md
├── flow_diagram.png
├── evaluation_plan.md
├── launch_plan.md
├── capstone_summary.md
```

### What You Learned
✅ Carrying one feature idea through the full product lifecycle
✅ Integrating research, design, code, and evaluation into one story
✅ Writing a summary that communicates the whole project at a glance
✅ Presenting AI product work the way a real team would review it

### Portfolio Project
**AI Feature: Idea to Prototype (Capstone)** — Took an AI-powered feature from initial problem framing through user discovery, working prototype, UX design, evaluation planning, and launch readiness.
**Skills:** AI Product Management, Prompt Engineering, UX Design, Evaluation Design, Technical Writing, Cross-Functional Planning.

**Deliverable:** A complete, presentable capstone folder combining every artifact from Projects 1–7, with a one-page summary tying it all together.
