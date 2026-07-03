# AI Automation Engineer — Hands-On Project Tutorials

This document turns every project in the **AI Automation Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Map an Automation Opportunity in a Workflow

**Goal:** Learn to identify what's actually worth automating — before writing a single line of automation code.

### Why This Project Matters

Not everything that's repetitive is worth automating, and not everything worth automating is repetitive in an obvious way. This project builds the judgment to tell the difference, so every later project in this course is aimed at something that actually matters.

**Step 1 — Set up a project folder.**
```bash
mkdir automation_opportunity_project
cd automation_opportunity_project
```
*Why:* Every project in this course produces a document or script — one folder per project builds your portfolio as you go.

**Step 2 — Pick a real, repetitive workflow.**
Example: "Every morning, someone manually checks a shared inbox, copies new leads into a spreadsheet, and emails a summary to the sales team."
*Why:* A concrete, specific example (not a vague "automate customer service") is what makes the rest of this course buildable.

**Step 3 — Map the workflow step by step.**
```bash
nano workflow_map.md
```
Write out every single step currently performed, including the small ones people usually skip mentioning (e.g., "checks for duplicates by eye").
*Why:* Automations fail most often because a small, unstated step got missed — mapping everything up front catches this early.

**Step 4 — Score the workflow on automation fit.**
Learn: good automation candidates are **repetitive** (done often), **rule-based or pattern-based** (not requiring deep human judgment every time), and **time-costly** (worth the effort to automate).
*Why:* A task done once a year, or one requiring constant human judgment, isn't a good automation target even if it's annoying.

**Step 5 — Identify the manual triggers and outputs.**
Note: what starts this workflow (a new email, a scheduled time, a form submission), and what does it produce at the end?
*Why:* Every later automation project needs a defined trigger and output — this is where you first name them.

**Step 6 — Estimate time saved.**
Estimate how long the manual process takes and how often it happens (e.g., "15 minutes, 5 days a week = ~65 hours/year").
*Why:* A concrete time estimate is what turns "this feels tedious" into a business case someone can approve.

**Step 7 — Note edge cases.**
List situations where the manual process currently requires judgment or handles something unusual (e.g., "if the email looks spammy, they don't add it").
*Why:* These edge cases become the hardest and most important part of your later automation design — better to know about them now.

**Step 8 — Write the opportunity summary.**
```bash
nano opportunity_summary.md
```
Structure: Workflow description → Automation fit score → Trigger/output → Time savings estimate → Known edge cases.
*Why:* This summary is what you'd use to justify spending time building the automation — the deliverable, not just your notes.

### Final Project Structure
```text
automation_opportunity_project/
│
├── workflow_map.md
├── opportunity_summary.md
```

### What You Learned
✅ Evaluating workflows for automation fit
✅ Mapping a workflow step by step, including small manual steps
✅ Identifying triggers and outputs
✅ Estimating time saved by automating
✅ Identifying edge cases that require special handling
✅ Writing an automation opportunity summary

### Portfolio Project
**Automation Opportunity Assessment** — Mapped a real repetitive workflow step by step, scored it for automation fit, and produced a time-savings estimate with documented edge cases.
**Skills:** Process Analysis, Business Case Development, Technical Writing, AI Automation Engineering.

**Deliverable:** A workflow map and opportunity summary identifying a concrete automation target with estimated time savings.

---

## Project 2 (Module 2): Build a Scheduled Automation Script

**Goal:** Build the smallest possible working automation — a script that runs on its own, on a schedule, without you triggering it manually.

### Why This Project Matters

Every automation in this course, no matter how sophisticated, is built from this same core idea: code that runs without a human clicking "go" each time. Getting this working end-to-end first means later complexity builds on something solid.

**Step 1 — Set up a project folder.**
```bash
mkdir scheduled_automation_project
cd scheduled_automation_project
```
*Why:* Keeping scripts in one place makes scheduling (Step 6) simpler — you'll point the scheduler at this exact folder.

**Step 2 — Write the smallest useful script.**
```bash
nano check_task.py
```
```python
import datetime

with open("log.txt", "a") as f:
    f.write(f"Ran at {datetime.datetime.now()}\n")
```
*Why:* Confirming the smallest possible script runs and logs correctly, before adding real logic, isolates scheduling problems from logic problems.

**Step 3 — Test it manually first.**
```bash
python3 check_task.py
cat log.txt
```
*Why:* If it doesn't work manually, it definitely won't work scheduled — always confirm the baseline before automating the trigger.

**Step 4 — Add real logic based on your Project 1 workflow.**
Replace the placeholder logic with something that actually checks or does something relevant (e.g., checking a file for new entries).
*Why:* This connects the smallest-possible-script pattern to the real opportunity you identified in Project 1.

**Step 5 — Add error handling.**
```python
try:
    # your automation logic
    pass
except Exception as e:
    with open("log.txt", "a") as f:
        f.write(f"ERROR at {datetime.datetime.now()}: {e}\n")
```
Learn: wrapping logic in a **try/except** block means the script logs a failure instead of crashing silently.
*Why:* A scheduled script runs unattended — if it fails silently, you won't know until someone notices the automation stopped working days later.

**Step 6 — Schedule the script.**
```bash
crontab -e
```
Add:
```bash
0 8 * * * /usr/bin/python3 /path/scheduled_automation_project/check_task.py
```
Learn: this cron syntax runs the script every day at 8:00 AM.
*Why:* This is the actual moment your script becomes "automation" instead of just "a script you run" — no human involvement required going forward.

**Step 7 — Verify it ran without you.**
Check `log.txt` the next day (or set a shorter test interval, e.g., every 5 minutes) to confirm it executed on schedule.
*Why:* Scheduling something and confirming it actually worked are two different steps — many beginners skip the second one.

**Step 8 — Document how to modify the schedule.**
```bash
nano README.md
```
Note the cron syntax used and how someone else could change the timing.
*Why:* Automations often outlive the person who built them — documentation is what keeps them maintainable.

### Final Project Structure
```text
scheduled_automation_project/
│
├── check_task.py
├── log.txt
├── README.md
```

### What You Learned
✅ Writing a minimal, testable automation script
✅ Testing manually before scheduling
✅ Adding error handling that logs failures
✅ Scheduling a script with cron
✅ Verifying scheduled execution without manual triggering
✅ Documenting an automation for future maintainers

### Portfolio Project
**Scheduled Automation Script** — Built and scheduled a Python automation script with error handling and logging, verified to run reliably without manual intervention.
**Skills:** Python, Cron Scheduling, Error Handling, Automation Engineering.

**Deliverable:** A scheduled script, verified to run automatically, with logging and error handling.

---

## Project 3 (Module 3): Build a Multi-Step Automated Workflow

**Goal:** Chain multiple steps and integrations together — moving from a single script to a real workflow.

### Why This Project Matters

Project 2's automation did one thing. Real workflows (like your Project 1 mapped example) involve multiple steps, often touching multiple systems. This project builds the chaining and integration skills that make that possible.

**Step 1 — Set up a project folder.**
```bash
mkdir multistep_workflow_project
cd multistep_workflow_project
```
*Why:* A multi-step workflow benefits from clear file organization — each step's logic should be easy to find and modify independently.

**Step 2 — Break your Project 1 workflow into discrete steps.**
```bash
nano workflow_steps.md
```
List each step as its own numbered item (e.g., "1. Check inbox for new emails, 2. Extract lead info, 3. Add to spreadsheet, 4. Send summary email").
*Why:* Building one function per step, rather than one giant script, makes each piece independently testable and reusable.

**Step 3 — Learn what a webhook is.**
Learn: a **webhook** is a way for one system to notify another automatically when something happens, by sending an HTTP request to a specified URL — instead of the receiving system having to constantly check.
*Why:* Webhooks are how many real integrations trigger automations (e.g., "when a new form is submitted, notify my automation") instead of relying only on scheduled checks.

**Step 4 — Write each step as a function.**
```bash
nano workflow.py
```
```python
def check_for_new_items(source):
    ...
    return new_items

def extract_data(item):
    ...
    return extracted

def save_to_destination(data):
    ...

def send_notification(summary):
    ...
```
*Why:* Isolating each step means a failure in one place doesn't hide inside a wall of tangled logic — you can test and debug them individually.

**Step 5 — Chain the steps together.**
```python
def run_workflow():
    items = check_for_new_items(source)
    for item in items:
        data = extract_data(item)
        save_to_destination(data)
    send_notification(f"Processed {len(items)} items")
```
*Why:* This is the actual "workflow" — a defined sequence where each step's output feeds the next, matching your Project 1 map.

**Step 6 — Add error handling per step.**
Wrap each function call in `run_workflow()` with try/except, logging which step failed if something breaks.
*Why:* When one step in a multi-step chain fails, you need to know exactly which one — not just "the workflow broke somewhere."

**Step 7 — Test with realistic multi-item input.**
Run the workflow against a batch of at least 5 test items, including at least one that should trigger an edge case from Project 1.
*Why:* Single-item tests hide bugs that only appear with volume (e.g., handling duplicates, rate limits).

**Step 8 — Document the workflow.**
```bash
nano README.md
```
Diagram or describe the step sequence, referencing your Project 1 workflow map.
*Why:* Anyone maintaining this later (including future you) needs to see how it maps back to the original manual process it replaced.

### Final Project Structure
```text
multistep_workflow_project/
│
├── workflow_steps.md
├── workflow.py
├── README.md
```

### What You Learned
✅ Breaking a workflow into discrete, testable steps
✅ What webhooks are and why they matter for automation
✅ Writing each step as an isolated function
✅ Chaining steps into a sequential workflow
✅ Adding per-step error handling
✅ Testing with realistic multi-item and edge-case input

### Portfolio Project
**Multi-Step Automated Workflow** — Built a chained, multi-step automation with isolated, testable functions and per-step error handling, tested against realistic and edge-case inputs.
**Skills:** Python, Workflow Design, Error Handling, Systems Integration, AI Automation Engineering.

**Deliverable:** A working multi-step workflow script, tested against realistic input including edge cases.

---

## Project 4 (Module 4): Add an AI Decision Step to an Existing Workflow

**Goal:** Add an LLM-driven decision into your Project 3 workflow — the point where automation stops being purely rule-based.

### Why This Project Matters

Some decisions in your Project 1 edge cases ("if the email looks spammy...") are hard to write as clean if/else rules. This project introduces AI exactly where it's needed — as one step in a larger, mostly deterministic workflow — rather than as the whole system.

**Step 1 — Set up a project folder.**
```bash
mkdir ai_decision_step_project
cd ai_decision_step_project
```
Copy in `workflow.py` from Project 3.
*Why:* This project modifies, not replaces, your Project 3 workflow — keep it accessible.

**Step 2 — Identify where a rule-based check falls short.**
Revisit your Project 1 edge cases: which ones require judgment a simple rule can't capture (e.g., "does this message sound urgent")?
*Why:* This is exactly the kind of ambiguous, pattern-based judgment LLMs are well-suited for — and rule-based code isn't.

**Step 3 — Design the AI decision as a single, narrow question.**
Write the exact question you want the AI to answer for this one step (e.g., "Is this customer message urgent? Answer only 'yes' or 'no'.").
*Why:* A narrow, single-purpose prompt is far more reliable than asking the AI to make a broad, open-ended judgment.

**Step 4 — Implement the AI decision step.**
```bash
nano ai_decision.py
```
```python
import requests

def is_urgent(message_text):
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": "YOUR_KEY", "content-type": "application/json"},
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 5,
            "messages": [{"role": "user", "content": f"Is this message urgent? Answer only yes or no.\n\n{message_text}"}]
        }
    )
    answer = response.json()["content"][0]["text"].strip().lower()
    return answer == "yes"
```
Learn: keeping `max_tokens` small forces a short, structured answer that's easy to parse programmatically.
*Why:* Automations need predictable, parseable output — an open-ended AI response is hard to act on reliably in code.

**Step 5 — Wire the decision into your Project 3 workflow.**
```python
def run_workflow():
    items = check_for_new_items(source)
    for item in items:
        data = extract_data(item)
        if is_urgent(data["message"]):
            send_notification(f"URGENT: {data['message']}")
        save_to_destination(data)
```
*Why:* This is the actual integration — AI handling exactly one ambiguous decision inside an otherwise deterministic, testable workflow.

**Step 6 — Add a fallback for AI failures.**
```python
try:
    urgent = is_urgent(data["message"])
except Exception:
    urgent = False  # safe default
```
Learn: a **fallback** is a safe default behavior used when a step can't be completed normally.
*Why:* AI API calls can fail or time out — a workflow that crashes entirely because of one AI call is worse than one that degrades gracefully.

**Step 7 — Test with ambiguous cases.**
Run the workflow against messages that are clearly urgent, clearly not, and genuinely ambiguous, and review the AI's decisions.
*Why:* The ambiguous cases are exactly where you'll learn whether your Step 3 prompt needs refinement.

**Step 8 — Document the AI decision's role and limitations.**
```bash
nano ai_decision_notes.md
```
Note: what the AI decides, how confident you are in it, and what happens if it's wrong.
*Why:* Anyone maintaining this workflow needs to know this step isn't purely deterministic — it's a documented, bounded use of AI judgment.

### Final Project Structure
```text
ai_decision_step_project/
│
├── workflow.py
├── ai_decision.py
├── ai_decision_notes.md
```

### What You Learned
✅ Identifying where rule-based logic falls short
✅ Designing narrow, single-purpose AI prompts
✅ Implementing an LLM-based decision step
✅ Producing structured, parseable AI output
✅ Adding a safe fallback for AI call failures
✅ Testing and documenting AI decision behavior

### Portfolio Project
**AI-Augmented Workflow Decision Step** — Added a narrowly-scoped LLM decision step into an existing rule-based workflow, with structured output parsing and a safe fallback for failures.
**Skills:** LLM APIs, Prompt Engineering, Python, Workflow Design, AI Automation Engineering.

**Deliverable:** A workflow with an integrated AI decision step, tested against ambiguous cases and documented with its limitations.

---

## Project 5 (Module 5): Build a Simple Task-Automation Agent

**Goal:** Replace fixed logic with agent-style tool calling — letting the AI decide *which* action to take, not just answer one narrow question.

### Why This Project Matters

Project 4's AI made one bounded decision inside a workflow you controlled. This project goes a step further: the AI chooses which of several available actions to take, based on the situation — the foundation of agentic automation.

**Step 1 — Set up a project folder.**
```bash
mkdir task_agent_project
cd task_agent_project
```
*Why:* Agent code tends to grow (tools, logic, prompts) — starting organized pays off quickly.

**Step 2 — Learn what tool calling is.**
Learn: **tool calling** lets an LLM choose to invoke a specific function you've defined, with arguments it decides based on the input — instead of just returning text.
*Why:* This is the mechanism that turns an LLM from "answers questions" into "takes actions," which is the core of agentic automation.

**Step 3 — Define 2–3 simple tools.**
```bash
nano tools.py
```
```python
def send_email(to, subject, body):
    print(f"Sending email to {to}: {subject}")

def create_task(title, priority):
    print(f"Creating task: {title} (priority: {priority})")

def log_note(text):
    print(f"Logging note: {text}")
```
*Why:* Starting with simple, observable actions (print statements) lets you verify the agent picks the *right* tool before worrying about real integrations.

**Step 4 — Describe the tools to the model.**
```python
tool_definitions = [
    {"name": "send_email", "description": "Send an email to someone.", "parameters": {"to": "string", "subject": "string", "body": "string"}},
    {"name": "create_task", "description": "Create a to-do task.", "parameters": {"title": "string", "priority": "string"}},
    {"name": "log_note", "description": "Log a note for later reference.", "parameters": {"text": "string"}},
]
```
Learn: the model uses each tool's **description** to decide which one fits a given situation — accurate, specific descriptions directly affect how well it chooses.
*Why:* A vague tool description ("does stuff") makes the agent's choices unreliable — this is the agent equivalent of a bad prompt.

**Step 5 — Send a request with tool definitions and let the model choose.**
```python
response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={"x-api-key": "YOUR_KEY", "content-type": "application/json"},
    json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 300,
        "tools": tool_definitions,
        "messages": [{"role": "user", "content": "A customer emailed asking for a refund on order #4521."}]
    }
)
```
*Why:* This single call is the essence of agentic automation — the model reads the situation and decides which action (if any) applies.

**Step 6 — Parse and execute the chosen tool call.**
```python
for block in response.json()["content"]:
    if block["type"] == "tool_use":
        tool_name = block["name"]
        tool_args = block["input"]
        globals()[tool_name](**tool_args)
```
*Why:* This is where the agent's decision becomes a real action — connecting the model's choice back to your actual Step 3 functions.

**Step 7 — Test with varied inputs.**
Run the agent against 5 different situations that should trigger different tools (or no tool at all).
*Why:* This proves the agent is genuinely discriminating between situations, not just always picking the same tool.

**Step 8 — Add a human-in-the-loop check for risky actions.**
```python
if tool_name == "send_email":
    confirm = input(f"Confirm sending email to {tool_args['to']}? (y/n): ")
    if confirm.lower() == "y":
        send_email(**tool_args)
```
Learn: **human-in-the-loop** means a person confirms an action before it's actually executed, for higher-risk steps.
*Why:* Letting an agent autonomously send emails or take irreversible actions without any check is a common and costly mistake in early agentic automation.

### Final Project Structure
```text
task_agent_project/
│
├── tools.py
├── agent.py
├── test_scenarios.md
```

### What You Learned
✅ What tool calling is and how it differs from plain text generation
✅ Defining tools with clear, model-readable descriptions
✅ Letting an LLM choose which tool to invoke
✅ Parsing and executing a model's tool call
✅ Testing an agent across varied scenarios
✅ Adding human-in-the-loop confirmation for risky actions

### Portfolio Project
**Task-Automation Agent** — Built an LLM-based agent that chooses and executes actions from a defined toolset based on situational input, with human-in-the-loop confirmation for high-risk actions.
**Skills:** Agentic AI, Tool Calling, LLM APIs, Python, AI Automation Engineering.

**Deliverable:** A working tool-calling agent, tested across varied scenarios, with human confirmation for risky actions.

---

## Project 6 (Module 6): Add Monitoring and Error Handling

**Goal:** Make your Project 5 agent (and earlier workflows) production-safe — reliable enough to trust running unattended.

### Why This Project Matters

An agent that occasionally fails silently, or an automation that quietly stops working, is worse than no automation at all — because everyone assumes it's still working. This project closes that gap.

**Step 1 — Set up a project folder.**
```bash
mkdir monitoring_project
cd monitoring_project
```
Copy in `agent.py` and `workflow.py` from earlier projects.
*Why:* This project adds monitoring on top of existing automations rather than building new logic from scratch.

**Step 2 — Add structured logging.**
```bash
nano monitored_automation.py
```
```python
import logging
logging.basicConfig(filename="automation.log", level=logging.INFO,
                     format="%(asctime)s %(levelname)s %(message)s")

logging.info("Workflow started")
```
Learn: **structured logging** records what happened, when, and at what severity level (INFO, WARNING, ERROR), instead of scattered print statements.
*Why:* Six months from now, print statements are gone the moment the terminal closes — logs persist and are searchable.

**Step 3 — Log every key decision point.**
Add a log line every time your Project 4 AI decision or Project 5 agent chooses an action.
```python
logging.info(f"AI decided: urgent={is_urgent_result}")
logging.info(f"Agent selected tool: {tool_name}")
```
*Why:* When something goes wrong, these logs are what let you reconstruct exactly what the AI decided and why, without guessing.

**Step 4 — Add health check monitoring.**
```python
def health_check():
    try:
        # ping the AI API or database with a minimal request
        return True
    except Exception:
        return False
```
Learn: a **health check** is a lightweight test that confirms a dependency (API, database) is reachable before running the real workflow.
*Why:* Failing fast with a clear "the AI API is down" message is far more useful than a workflow that fails halfway through with a confusing error.

**Step 5 — Add retry logic for transient failures.**
```python
import time

def call_with_retry(func, *args, retries=3, delay=2):
    for attempt in range(retries):
        try:
            return func(*args)
        except Exception as e:
            logging.warning(f"Attempt {attempt+1} failed: {e}")
            time.sleep(delay)
    raise Exception("All retries failed")
```
Learn: a **transient failure** is a temporary issue (network blip, rate limit) that often succeeds if retried, unlike a permanent failure (bad input) that won't.
*Why:* Without retries, automations fail unnecessarily often on issues that would have resolved themselves a few seconds later.

**Step 6 — Add alerting for repeated failures.**
```python
failure_count = 0

def record_failure():
    global failure_count
    failure_count += 1
    if failure_count >= 3:
        logging.error("ALERT: 3+ consecutive failures — needs attention")
```
*Why:* One failure might be noise; three in a row is a signal something is actually broken and needs a human to look.

**Step 7 — Test failure scenarios deliberately.**
Temporarily break something (wrong API key, unreachable file path) and confirm your logs, retries, and alerts all behave as expected.
*Why:* Untested error handling is unproven error handling — the same discipline as testing alerts in a monitoring system.

**Step 8 — Review the log file after a full test run.**
```bash
cat automation.log
```
Confirm it tells a clear, readable story of what happened.
*Why:* If you can't understand your own logs the day after writing them, no one else will be able to either during an actual incident.

### Final Project Structure
```text
monitoring_project/
│
├── monitored_automation.py
├── automation.log
├── failure_test_notes.md
```

### What You Learned
✅ Structured logging vs. print statements
✅ Logging key decision points for later reconstruction
✅ Health checks for external dependencies
✅ Retry logic for transient failures
✅ Alerting after repeated failures
✅ Testing error handling deliberately with induced failures

### Portfolio Project
**Automation Monitoring & Error Handling** — Added structured logging, health checks, retry logic, and failure alerting to an existing AI-driven automation, validated through deliberate failure testing.
**Skills:** Observability, Error Handling, Reliability Engineering, Python, AI Automation Engineering.

**Deliverable:** A monitored, retry-capable automation with tested error handling and a readable log trail.

---

## Final Capstone: Build an End-to-End Automated Workflow

**Goal:** Combine every project above into one complete, reliable automation — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes on your resume and in interviews. It's not new material — it's proof you can carry an automation from a mapped opportunity all the way to a monitored, AI-augmented, production-safe system.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your code from Projects 2–6.
*Why:* The capstone isn't written from scratch — it's assembled and connected from work you've already validated.

**Step 2 — Start from your Project 1 opportunity map.**
Confirm the workflow you're automating in the capstone matches (or reasonably extends) your originally identified opportunity.
*Why:* The capstone is the moment the opportunity assessment stops being theoretical and becomes a real, working system.

**Step 3 — Build the multi-step workflow (Project 3).**
Chain the discrete steps from your workflow map into working functions.

**Step 4 — Add the AI decision step (Project 4).**
Wire in the narrow, well-scoped AI judgment for whichever step needs it.

**Step 5 — Add agentic tool selection where appropriate (Project 5).**
If your workflow benefits from the AI choosing between multiple possible actions, integrate your Project 5 agent pattern.

**Step 6 — Add monitoring and error handling (Project 6).**
Wire in structured logging, retries, health checks, and failure alerting across the whole workflow.

**Step 7 — Schedule the complete workflow (Project 2 skills).**
```bash
crontab -e
```
Add a cron entry running the full, integrated workflow on the schedule appropriate to your Project 1 use case.

**Step 8 — Run an end-to-end test and review the logs.**
Trigger a full run (or wait for the schedule) and confirm the workflow completes, the AI steps behave as expected, and the log file tells a clear story.
*Why:* This is the real proof — each piece worked individually, but only an end-to-end run confirms they work together.

**Step 9 — Write the final automation document.**
```bash
nano capstone_summary.md
```
Combine your Project 1 opportunity summary, time savings estimate, architecture of the final workflow, and a log excerpt showing a successful run.
*Why:* This document is what you'd hand to a teammate or future employer to prove the automation is real, tested, and understood — not just "it's running somewhere."

### Final Project Structure
```text
capstone_project/
│
├── opportunity_summary.md
├── workflow.py
├── ai_decision.py
├── agent.py
├── monitored_automation.py
├── automation.log
├── capstone_summary.md
```

### What You Learned
✅ Connecting opportunity assessment, workflow design, AI decisions, and monitoring into one system
✅ Scheduling a fully integrated, AI-augmented workflow
✅ Verifying end-to-end behavior through a real test run
✅ Reading and validating a complete log trail
✅ Documenting an automation for a real audience

### Portfolio Project
**End-to-End AI-Augmented Automation (Capstone)** — Built a complete automated workflow: identified from a real opportunity assessment, chaining multiple steps, incorporating an AI decision/agent step, and running reliably on a schedule with full monitoring and error handling.
**Skills:** Python, LLM APIs, Tool Calling, Workflow Automation, Reliability Engineering, AI Automation Engineering.

**Deliverable:** A live, scheduled, monitored, AI-augmented automation, plus a written summary connecting it back to every project that built it.
