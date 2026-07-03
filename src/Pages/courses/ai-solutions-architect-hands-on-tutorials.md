# AI Solutions Architect — Hands-On Project Tutorials

This document turns every project in the **AI Solutions Architect Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Write a Solutions Brief for a Business Problem

**Goal:** Learn to translate a business problem into a technical direction — the first move a solutions architect makes, before any diagram or code.

### Why This Project Matters

Solutions architects are hired to bridge business and engineering. If you can't state a business problem clearly and connect it to a technical direction, every diagram you draw afterward is guesswork dressed up as design.

**Step 1 — Set up a project folder.**
```bash
mkdir solutions_brief_project
cd solutions_brief_project
```
*Why:* Every project in this course produces a document or diagram — one folder per project builds your portfolio as you go.

**Step 2 — Pick a realistic business problem.**
Example: "Our support team is overwhelmed by repetitive questions and response times are hurting customer satisfaction scores."
*Why:* A vague or purely technical starting point ("build a chatbot") skips the actual architect's job — starting from the business pain is what makes this a solutions brief, not a spec sheet.

**Step 3 — Identify stakeholders.**
```bash
nano brief.md
```
Learn: a **stakeholder** is anyone with a say in whether the solution succeeds — here, likely support leadership, IT/security, and end customers.
*Why:* A technically perfect solution that ignores a key stakeholder's constraints (budget, compliance, timeline) gets rejected regardless of quality.

**Step 4 — State business goals, not technical ones.**
Write 2–3 measurable business goals (e.g., "reduce average response time by 30%"), not technical goals ("deploy an LLM").
*Why:* Technical goals are your job to invent later — the business goal is what you're actually accountable for delivering against.

**Step 5 — Note constraints.**
List budget range, timeline, existing systems that must be integrated with, and any compliance requirements (e.g., data residency, industry regulations).
*Why:* Constraints eliminate options before you waste time designing something that was never going to be approved.

**Step 6 — Propose a technical direction (not a full design yet).**
Write 2–3 sentences: broadly, is this a good fit for AI, and roughly what kind of solution (e.g., "a retrieval-augmented chatbot integrated with the existing ticketing system")?
*Why:* This is a direction, not a commitment — Project 3 will test whether it holds up against real model options.

**Step 7 — Assemble the final brief.**
Combine Steps 3–6 into one page: Business Problem → Stakeholders → Goals → Constraints → Proposed Direction.
*Why:* This is the document you'd actually walk into a stakeholder meeting with — the deliverable, not just your notes.

### Final Project Structure
```text
solutions_brief_project/
│
├── brief.md
```

### What You Learned
✅ Translating a business problem into a written brief
✅ Identifying stakeholders and their constraints
✅ Separating business goals from technical goals
✅ Documenting budget, timeline, and compliance constraints
✅ Proposing an initial technical direction
✅ Assembling a one-page solutions brief

### Portfolio Project
**AI Solutions Brief** — Translated a business problem into a structured solutions brief covering stakeholders, measurable goals, constraints, and a proposed technical direction.
**Skills:** Business Analysis, Stakeholder Management, Technical Writing, AI Solutions Architecture.

**Deliverable:** A one-page solutions brief covering the business problem, stakeholders, goals, constraints, and proposed direction.

---

## Project 2 (Module 2): Design a System Diagram for an AI Service

**Goal:** Visualize the service you're proposing — the first technical artifact that turns your Project 1 brief into something engineers can react to.

### Why This Project Matters

A brief describes intent; a diagram describes structure. This project builds the specific skill of showing how components connect — the shared language architects use to communicate with both engineers and stakeholders.

**Step 1 — Set up a project folder.**
```bash
mkdir system_diagram_project
cd system_diagram_project
```
*Why:* Diagrams get revised repeatedly across a project's life — keeping versions in one folder tracks how the design evolved.

**Step 2 — List the major components.**
Based on your Project 1 brief, list the pieces the system will need: user-facing app, API layer, AI model, data store, integration with existing systems.
*Why:* Naming components before drawing anything keeps the diagram from becoming a stream-of-consciousness sketch.

**Step 3 — Learn standard architecture diagram conventions.**
Learn: boxes typically represent **components** (services, databases); arrows represent **data flow** or **requests**, usually labeled with direction and what's being sent.
*Why:* Following conventions means any engineer can read your diagram without you in the room to explain it.

**Step 4 — Draw the request flow.**
Sketch: User → App → API → AI Model → Response back to User, in that order, left to right or top to bottom.
*Why:* Showing the "happy path" first gives you a skeleton before layering in the more complex pieces.

**Step 5 — Add the data layer.**
Add a box for where data is stored (database, vector store) and draw arrows showing which components read from or write to it.
*Why:* Most real system failures happen at data boundaries — showing this explicitly forces you to think through who owns what data.

**Step 6 — Add integration points.**
Draw connections to any existing systems named in your Project 1 constraints (e.g., "existing ticketing system").
*Why:* A diagram that ignores existing infrastructure looks clean but is unbuildable — real architecture always has to connect to what's already there.

**Step 7 — Label everything.**
Add labels to every arrow (what data/request is flowing) and every box (what the component does in one phrase).
*Why:* An unlabeled diagram looks impressive but communicates almost nothing — labels are what make it useful, not just decorative.

**Step 8 — Get a "can you read this cold" check.**
Show the diagram to someone unfamiliar with the project and ask them to explain back what they think it shows.
*Why:* If they can't follow it without your narration, the diagram isn't doing its job yet — this is the fastest way to catch that early.

### Final Project Structure
```text
system_diagram_project/
│
├── system_diagram_v1.png
├── diagram_notes.md
```

### What You Learned
✅ Identifying major system components from a business brief
✅ Standard architecture diagram conventions
✅ Diagramming the request/response flow
✅ Representing the data layer visually
✅ Showing integration with existing systems
✅ Labeling for clarity and getting outside feedback

### Portfolio Project
**AI Service System Diagram** — Translated a solutions brief into a labeled system architecture diagram showing request flow, data layer, and integration points with existing infrastructure.
**Skills:** System Design, Architecture Diagramming, Technical Communication, AI Solutions Architecture.

**Deliverable:** A labeled system diagram for your proposed AI service, validated by an outside reader.

---

## Project 3 (Module 3): Compare Model Options for a Given Use Case

**Goal:** Decide which AI approach actually fits the problem — replacing assumption with a documented comparison.

### Why This Project Matters

"Use an LLM" isn't a decision — it's a starting point. This project forces the real comparison (which model, which approach, what tradeoffs) that justifies your architecture instead of just defaulting to whatever's popular.

**Step 1 — Set up a project folder.**
```bash
mkdir model_comparison_project
cd model_comparison_project
```
*Why:* Comparison research is easy to lose in scattered notes — keeping it in one place makes it reusable for later stakeholder conversations.

**Step 2 — Define your evaluation criteria.**
```bash
nano criteria.md
```
Learn: typical criteria include **accuracy/quality** for the task, **latency** (response speed), **cost per request**, **data privacy** (does data leave your infrastructure), and **ease of integration**.
*Why:* Without agreed criteria upfront, model comparisons turn into arguing about whichever factor favors your preferred answer.

**Step 3 — Identify 2–4 candidate approaches.**
Examples: a general-purpose LLM API, a smaller open-weight model self-hosted, a fine-tuned specialized model, or a non-AI rules-based approach as a baseline.
*Why:* Including a non-AI baseline (Project 1's proposed direction assumed AI — verify that assumption) is a check most beginners skip, and sometimes the "boring" answer is the right one.

**Step 4 — Research each option against your criteria.**
```bash
nano comparison_matrix.md
```
Build a table: rows are your candidates, columns are your Step 2 criteria.
*Why:* A matrix format forces you to actually fill in every cell — narrative-only comparisons let you skip inconvenient tradeoffs.

**Step 5 — Learn the fine-tuning vs. prompting tradeoff.**
Learn: **prompting** (including RAG) adapts a general model's behavior at request time without changing its weights; **fine-tuning** further trains a model's weights on your specific data.
*Why:* Fine-tuning costs more (data, compute, expertise) but can outperform prompting for narrow, specialized tasks — this tradeoff shows up in nearly every real architecture decision.

**Step 6 — Estimate rough costs.**
For each candidate, estimate cost per 1,000 requests (API pricing) or infrastructure cost (self-hosted compute).
*Why:* A model that performs 5% better but costs 10x more is rarely the right choice — cost has to sit next to quality, not be an afterthought.

**Step 7 — Make and justify a recommendation.**
```bash
nano recommendation.md
```
State which option you'd recommend and why, referencing your matrix directly.
*Why:* This is the actual deliverable a stakeholder reads — the matrix is your evidence, but the recommendation is your judgment call.

### Final Project Structure
```text
model_comparison_project/
│
├── criteria.md
├── comparison_matrix.md
├── recommendation.md
```

### What You Learned
✅ Defining evaluation criteria before comparing options
✅ Including a non-AI baseline in comparisons
✅ Building a structured comparison matrix
✅ The fine-tuning vs. prompting/RAG tradeoff
✅ Estimating rough cost per option
✅ Writing a justified recommendation

### Portfolio Project
**AI Model Selection Comparison** — Evaluated multiple AI approaches (including a non-AI baseline) against defined criteria — quality, latency, cost, privacy, integration — and produced a justified recommendation.
**Skills:** Technical Evaluation, Cost Analysis, Decision Documentation, AI Solutions Architecture.

**Deliverable:** A comparison matrix and written recommendation for the AI approach best suited to your use case.

---

## Project 4 (Module 4): Design an End-to-End AI System Architecture

**Goal:** Expand your Project 2 diagram into a full system design — the central architecture document for the whole solution.

### Why This Project Matters

Project 2 sketched a flow; this project makes it a real architecture, with the specific model choice from Project 3 built in, and reference patterns that keep your design grounded in how these systems are actually built in practice.

**Step 1 — Set up a project folder.**
```bash
mkdir full_architecture_project
cd full_architecture_project
```
Copy in `system_diagram_v1.png` and `recommendation.md` from Projects 2 and 3.
*Why:* This project directly extends both prior deliverables — keeping them accessible avoids redesigning from memory.

**Step 2 — Learn common reference architectures.**
Learn: a **RAG architecture** retrieves relevant data before generating a response; an **agentic architecture** lets the AI call tools/APIs to take actions; a **simple API-call architecture** just sends a prompt and returns a response.
*Why:* Recognizing which pattern fits your use case means you're adapting a proven shape instead of inventing one from scratch.

**Step 3 — Choose your architecture pattern.**
Based on Project 3's recommendation, decide which pattern (or combination) fits.
*Why:* This choice determines nearly every component you'll add in the next steps — get this right before adding detail.

**Step 4 — Expand the diagram with your chosen model.**
Update your Project 2 diagram to show your Project 3-selected model/approach specifically, not a generic "AI Model" box.
*Why:* A specific architecture is buildable; a generic one still requires someone else to make all the real decisions.

**Step 5 — Add integration patterns.**
Learn: an **API gateway** manages external access to your service; a **message queue** handles asynchronous processing (useful if requests can take a while).
*Why:* These patterns solve specific, common problems (traffic management, handling slow AI responses) — naming them shows you're designing for how the system will actually behave under load, not just the ideal case.

**Step 6 — Address scalability.**
Note: what happens if traffic doubles? Where would this design bottleneck first?
*Why:* Every architecture has a breaking point — identifying it now is far cheaper than discovering it in production.

**Step 7 — Estimate rough costs for the full system.**
Combine your Project 3 model costs with rough infrastructure costs (hosting, storage, networking).
*Why:* Stakeholders will ask "what does this cost to run," not just "what does the model cost" — the full picture matters.

**Step 8 — Write the architecture document.**
```bash
nano architecture.md
```
Structure: Pattern chosen and why → Full diagram → Components and their roles → Scalability notes → Rough cost estimate.
*Why:* This document is the technical core of your eventual Project 7 presentation — write it now so nothing is missing later.

### Final Project Structure
```text
full_architecture_project/
│
├── architecture_diagram_v2.png
├── architecture.md
```

### What You Learned
✅ Common AI reference architecture patterns (RAG, agentic, simple API)
✅ Choosing a pattern based on a documented model comparison
✅ Adding integration patterns (API gateways, message queues)
✅ Identifying likely scalability bottlenecks
✅ Estimating full-system cost, not just model cost
✅ Writing a complete architecture document

### Portfolio Project
**End-to-End AI System Architecture** — Designed a complete AI system architecture using a chosen reference pattern (RAG/agentic/API), including integration design, scalability analysis, and full-system cost estimates.
**Skills:** System Architecture, Reference Architecture Patterns, Scalability Planning, Cost Estimation, AI Solutions Architecture.

**Deliverable:** A full architecture document and diagram, covering pattern choice, components, scalability, and cost.

---

## Project 5 (Module 5): Design the Data and Infrastructure Layer for an AI System

**Goal:** Fill in how data will move and be secured — the layer underneath the architecture you designed in Project 4.

### Why This Project Matters

Project 4's diagram probably has a box labeled "data store" and another labeled "networking." This project is where those boxes stop being placeholders and become real, defensible design decisions.

**Step 1 — Set up a project folder.**
```bash
mkdir data_infra_layer_project
cd data_infra_layer_project
```
*Why:* This becomes a dedicated deep-dive document referenced by, but separate from, your main Project 4 architecture doc.

**Step 2 — Design the data flow.**
Sketch: where does data enter the system, where is it stored, and where does it get deleted or archived?
*Why:* "Where does data go when we're done with it" is a question stakeholders (especially compliance/legal) will always ask — designing this now avoids scrambling later.

**Step 3 — Choose storage types.**
Match storage to data type: structured records → relational database; documents for retrieval → vector database; large files → object storage.
*Why:* Using the wrong storage type for a job (e.g., trying to do semantic search in a relational database) creates expensive rework later.

**Step 4 — Design network security.**
Learn: **network segmentation** isolates different parts of a system so a breach in one area doesn't automatically expose everything; **encryption in transit** protects data moving between components, **encryption at rest** protects stored data.
*Why:* These three concepts are the baseline expectation in almost any real enterprise architecture review — skipping them is the fastest way to get a design rejected.

**Step 5 — Design access control.**
Learn: **least privilege** means each component or user only has the access it strictly needs, nothing more.
*Why:* Overly broad access is one of the most common root causes of data breaches — designing tight access boundaries from the start is far easier than retrofitting them later.

**Step 6 — Address compliance requirements from Project 1.**
Revisit your Project 1 brief's constraints (e.g., data residency, industry regulations) and confirm your data layer design satisfies them.
*Why:* This is the moment where your Project 1 business constraints either get honored or silently dropped — check explicitly.

**Step 7 — Diagram the data and infrastructure layer.**
Draw storage components, network boundaries, and access control points as their own focused diagram.
*Why:* This diagram zooms into detail that your Project 4 high-level architecture diagram intentionally left abstract.

**Step 8 — Write the data and infrastructure design doc.**
```bash
nano data_infra_design.md
```
Structure: Data flow → Storage choices → Network security → Access control → Compliance mapping.
*Why:* This becomes the technical appendix to your architecture — the detail a security or compliance reviewer will actually read closely.

### Final Project Structure
```text
data_infra_layer_project/
│
├── data_flow_diagram.png
├── data_infra_design.md
```

### What You Learned
✅ Designing end-to-end data flow, including deletion/archival
✅ Matching storage types to data types
✅ Network segmentation and encryption fundamentals
✅ Designing access control with least privilege
✅ Mapping design decisions to compliance requirements
✅ Producing a focused data and infrastructure design document

### Portfolio Project
**AI System Data & Infrastructure Design** — Designed the data flow, storage architecture, network security, and access control layer for an AI system, explicitly mapped to business compliance requirements.
**Skills:** Data Architecture, Cloud Security, Access Control, Compliance, AI Solutions Architecture.

**Deliverable:** A data and infrastructure design document and diagram, mapped to your Project 1 compliance constraints.

---

## Project 6 (Module 6): Write a Governance and Risk Plan

**Goal:** Address compliance and responsible-use concerns directly — the part of architecture that protects the organization, not just the system.

### Why This Project Matters

A technically excellent architecture that introduces unmanaged legal, ethical, or operational risk isn't actually a good architecture. This project makes those risks visible and gives stakeholders a plan for managing them, rather than discovering them after launch.

**Step 1 — Set up a project folder.**
```bash
mkdir governance_risk_project
cd governance_risk_project
```
*Why:* Governance documents are frequently revisited and audited — keep this as a standalone, easy-to-find deliverable.

**Step 2 — Identify risk categories.**
Learn: common categories include **data privacy risk** (mishandled personal data), **model risk** (biased or incorrect outputs), **operational risk** (system downtime affecting the business), and **reputational risk** (public-facing AI mistakes).
*Why:* Naming categories upfront ensures you're not only thinking about the risk that happens to be top of mind.

**Step 3 — Assess each risk for your specific system.**
```bash
nano risk_assessment.md
```
For each category, note: how likely is this risk here, and how severe would it be if it happened?
*Why:* Not every system faces every risk equally — a purely internal tool has different risk exposure than a customer-facing chatbot.

**Step 4 — Design mitigations for the highest risks.**
For your top 2–3 risks, write a specific mitigation (e.g., "add a human review step for high-stakes outputs," "log and audit all model responses for 90 days").
*Why:* An unmitigated known risk in a document you wrote yourself is far worse, from a liability standpoint, than one you never identified.

**Step 5 — Define an incident response plan.**
Learn: an **incident response plan** describes what happens when something goes wrong — who's notified, how fast, and what the rollback process is.
*Why:* Systems fail eventually — having a plan before an incident happens is the difference between a contained problem and a chaotic scramble.

**Step 6 — Address responsible AI principles.**
Note how your design considers fairness (does the system perform differently across user groups), transparency (do users know they're interacting with AI), and accountability (who's responsible if it goes wrong).
*Why:* These questions are increasingly required by regulation and customer expectation, not just good practice — skipping them creates real business risk.

**Step 7 — Write the governance and risk plan.**
```bash
nano governance_risk_plan.md
```
Structure: Risk categories and assessment → Mitigations for top risks → Incident response plan → Responsible AI considerations.
*Why:* This document is often what actually gets an architecture approved (or rejected) in a real enterprise review — treat it with the same care as the technical design.

### Final Project Structure
```text
governance_risk_project/
│
├── risk_assessment.md
├── governance_risk_plan.md
```

### What You Learned
✅ Identifying risk categories relevant to AI systems
✅ Assessing likelihood and severity for a specific system
✅ Designing mitigations for high-priority risks
✅ Writing an incident response plan
✅ Addressing fairness, transparency, and accountability
✅ Producing a complete governance and risk plan

### Portfolio Project
**AI System Governance & Risk Plan** — Assessed data, model, operational, and reputational risks for a proposed AI system, designed mitigations, and wrote an incident response plan addressing responsible AI principles.
**Skills:** Risk Management, AI Governance, Responsible AI, Compliance, AI Solutions Architecture.

**Deliverable:** A governance and risk plan covering risk assessment, mitigations, incident response, and responsible AI considerations.

---

## Project 7 (Module 7): Present a Full Architecture Proposal

**Goal:** Package everything into a presentation for stakeholders — the skill that actually gets an architecture approved and built.

### Why This Project Matters

An architecture that never gets approved never gets built. This project is where all your prior documents get compressed into something a room full of busy stakeholders — some technical, some not — can understand and say yes to.

**Step 1 — Set up a project folder.**
```bash
mkdir architecture_proposal_project
cd architecture_proposal_project
```
Copy in your final deliverables from Projects 1–6.
*Why:* This presentation draws directly from every prior project — nothing here should be newly invented.

**Step 2 — Identify your audience.**
Learn: presenting to a mixed audience (some technical, some business) means leading with business impact, then offering technical depth for those who want it.
*Why:* A presentation that opens with architecture diagrams loses non-technical stakeholders in the first two minutes — the opposite order works far better.

**Step 3 — Structure the presentation.**
```bash
nano presentation_outline.md
```
Draft outline: Problem & Goals (Project 1) → Proposed Solution Overview → Architecture (Project 4) → Data & Security (Project 5) → Risks & Governance (Project 6) → Cost & Timeline → Ask/Next Steps.
*Why:* This order moves from "why should you care" to "here's the plan" to "here's what I need from you" — the standard shape of a proposal that gets approved.

**Step 4 — Build slides or a written proposal document.**
For each outline section, create one slide (or one section if written) with your key diagram or point from the matching earlier project.
*Why:* Reusing your existing diagrams and documents means you're not creating new content — you're packaging validated work.

**Step 5 — Prepare for objections.**
```bash
nano anticipated_questions.md
```
List 5 likely tough questions (e.g., "why not just use approach X," "what if the model gets it wrong") and write your answers.
*Why:* Being caught flat-footed on an obvious question undermines confidence in the whole proposal — most tough questions are predictable if you think it through beforehand.

**Step 6 — Define a clear ask.**
State exactly what you need from this audience (budget approval, engineering resources, a pilot green light).
*Why:* A presentation that ends without a clear ask often results in polite interest and no actual decision.

**Step 7 — Practice presenting it out loud.**
Run through the full presentation once, timed, ideally to another person.
*Why:* Sentences that read fine on a slide often reveal awkward gaps or missing context the moment you try to say them out loud.

**Step 8 — Deliver (or record) the presentation.**
Present live or record yourself presenting the full proposal, including handling at least one of your anticipated tough questions.
*Why:* This final step is the actual skill being tested — everything else in this project was preparation for this moment.

### Final Project Structure
```text
architecture_proposal_project/
│
├── presentation_outline.md
├── proposal_slides.pdf (or proposal_doc.md)
├── anticipated_questions.md
```

### What You Learned
✅ Structuring a proposal for a mixed technical/business audience
✅ Leading with business impact before technical detail
✅ Reusing validated prior work instead of creating from scratch
✅ Anticipating and preparing for tough questions
✅ Defining a clear, actionable ask
✅ Practicing and delivering a live technical proposal

### Portfolio Project
**AI Architecture Proposal Presentation** — Synthesized a full solutions architecture (business case, technical design, data/security, governance, and cost) into a stakeholder-ready presentation with a clear ask and prepared Q&A.
**Skills:** Executive Communication, Technical Presentation, Stakeholder Management, AI Solutions Architecture.

**Deliverable:** A complete architecture proposal presentation, delivered or recorded, including a prepared response to at least one tough question.

---

## Final Capstone: Design and Document a Complete AI Solution Architecture

**Goal:** Combine every project above into one complete, presentable body of work — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes in your portfolio and in interviews. It's not new material — it's proof you can carry a real business problem through the full architect's lifecycle: brief, design, model selection, data/security, risk, and stakeholder presentation.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your deliverables from Projects 1–7.
*Why:* The capstone isn't written from scratch — it's assembled and polished from work you've already validated.

**Step 2 — Finalize your business problem and brief (Project 1).**
Revisit and tighten the language based on everything you've learned since.
*Why:* Your understanding of the problem has deepened through the whole process — the final brief should reflect that.

**Step 3 — Finalize your architecture diagram and document (Projects 2 & 4).**
Confirm the diagram accurately reflects your final model choice (Project 3) and all components.

**Step 4 — Attach your data and infrastructure design (Project 5).**
Include storage, security, and access control decisions.

**Step 5 — Attach your governance and risk plan (Project 6).**
Include risk assessment, mitigations, and incident response.

**Step 6 — Compile final cost estimates.**
Combine model costs (Project 3), infrastructure costs (Project 4), and any additional governance/monitoring costs into one summary table.
*Why:* Stakeholders evaluating a real proposal want one number they can reference, not costs scattered across five documents.

**Step 7 — Assemble the final proposal (Project 7 format).**
Package everything using your Project 7 presentation structure.
*Why:* Reusing a structure you already validated as effective for stakeholders is exactly what a real architect would do — no need to reinvent format at the finish line.

**Step 8 — Write the capstone summary.**
```bash
nano capstone_summary.md
```
One page: the business problem, the solution, the architecture, the key risks and how they're managed, and the total cost estimate.
*Why:* This summary is what a hiring manager or teammate reads first — it should tell the whole story without them opening every other file.

### Final Project Structure
```text
capstone_project/
│
├── brief.md
├── architecture_diagram_v2.png
├── architecture.md
├── comparison_matrix.md
├── data_infra_design.md
├── governance_risk_plan.md
├── proposal_slides.pdf
├── capstone_summary.md
```

### What You Learned
✅ Carrying one business problem through the full architecture lifecycle
✅ Integrating business, technical, data/security, and governance work into one story
✅ Compiling a full cost estimate across every layer of a system
✅ Writing a summary that communicates the whole project at a glance
✅ Presenting architecture work the way a real stakeholder review would

### Portfolio Project
**Complete AI Solution Architecture (Capstone)** — Designed and documented an end-to-end AI solution architecture for a real business problem, including model selection, system design, data/security architecture, governance and risk planning, cost estimation, and a stakeholder-ready proposal.
**Skills:** AI Solutions Architecture, System Design, Data & Cloud Security, Risk Management, Cost Estimation, Executive Communication.

**Deliverable:** A complete, presentable capstone folder combining every artifact from Projects 1–7, with a one-page summary tying it all together.
