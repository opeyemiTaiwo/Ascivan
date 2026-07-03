# AI Research Engineer — Hands-On Project Tutorials

This document turns every project in the **AI Research Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Summarize and Reproduce Results from a Short Paper

**Goal:** Learn to read a research paper the way a researcher does — for what to rebuild, not just what to remember.

### Why This Project Matters

Research engineering isn't about reading papers passively; it's about being able to take a paper's claim and check it yourself. This project builds that muscle on a small, low-stakes result before the capstone asks you to do it on something bigger.

**Step 1 — Set up a project folder.**
```bash
mkdir paper_reproduction_project
cd paper_reproduction_project
```
*Why:* Every project in this course produces code and notes worth keeping — one folder per project builds your portfolio as you go.

**Step 2 — Choose a short, well-known paper with a simple result.**
Learn: look for a paper with a result you can reproduce with a small dataset and a few hours of compute (e.g., a simple classification benchmark), not a paper requiring a GPU cluster.
*Why:* The goal here is learning the *process* of reproduction — an overly ambitious paper turns this into a compute problem, not a research-skills problem.

**Step 3 — Read for structure, not detail, on the first pass.**
Learn: most papers follow **Abstract → Introduction → Method → Results → Discussion**. Skim all five sections once before rereading anything closely.
*Why:* Trying to understand every sentence on a first read wastes time — you need the shape of the argument before the details make sense.

**Step 4 — Identify the one core claim you'll reproduce.**
```bash
nano paper_summary.md
```
Write one sentence: "This paper claims that [method] achieves [result] on [dataset/task]."
*Why:* Papers make many claims — picking exactly one to reproduce keeps this project scoped and finishable.

**Step 5 — Extract the method in your own words.**
Learn: **paraphrasing a method** means describing what the paper's approach does algorithmically, without quoting the paper's exact text.
*Why:* If you can't explain the method in your own words, you don't understand it well enough to reproduce it.

**Step 6 — Identify the dataset and evaluation metric.**
Note what data the paper used and how it measured success (accuracy, F1, etc.).
*Why:* Reproducing a result requires matching not just the method, but the exact yardstick used to judge it.

**Step 7 — Write a minimal reproduction script.**
```bash
nano reproduce.py
```
Implement the simplest possible version of the method against a small version of the dataset (or a substitute if the original isn't available).
*Why:* A "minimal" version that runs is more valuable than a "complete" version that doesn't — you can always add fidelity later.

**Step 8 — Compare your result to the paper's claim.**
Run your script and record the metric. Note how close (or far) you are from the paper's reported number.
*Why:* An exact match isn't the goal — understanding *why* your number differs (data size, hyperparameters, randomness) is the actual skill being tested.

### Final Project Structure
```text
paper_reproduction_project/
│
├── paper_summary.md
├── reproduce.py
├── results.md
```

### What You Learned
✅ Reading a paper for structure before detail
✅ Identifying one reproducible core claim
✅ Paraphrasing a method in your own words
✅ Identifying datasets and evaluation metrics
✅ Writing a minimal reproduction script
✅ Comparing your results against a paper's claims

### Portfolio Project
**Research Paper Reproduction** — Selected a published result, extracted its core method and evaluation approach, and reproduced it with a minimal working implementation.
**Skills:** Research Literacy, Python, Experimental Reproduction, Technical Writing, AI Research.

**Deliverable:** A summary of the paper's core claim plus a working script that reproduces (or attempts to reproduce) its central result.

---

## Project 2 (Module 2): Build a Data Exploration Notebook

**Goal:** Build the habit of understanding data before modeling it — the step most beginners skip and most experienced researchers insist on.

### Why This Project Matters

Every later project in this course depends on data — training a model, running an ablation, benchmarking a hypothesis. If you don't understand your data's shape, gaps, and quirks first, every result built on top of it is suspect.

**Step 1 — Set up a project folder and environment.**
```bash
mkdir data_exploration_project
cd data_exploration_project
pip install --break-system-packages jupyter pandas numpy matplotlib
```
*Why:* Jupyter notebooks let you explore data interactively — running one cell at a time — which is faster for exploration than writing a full script upfront.

**Step 2 — Load a dataset.**
```python
import pandas as pd
df = pd.read_csv("your_dataset.csv")
df.head()
```
Learn: a **DataFrame** is pandas' table-like structure — rows and columns, similar to a spreadsheet.
*Why:* Almost all tabular research data work in Python happens through this one structure.

**Step 3 — Check the shape and types.**
```python
df.shape
df.dtypes
```
Learn: `.shape` tells you rows × columns; `.dtypes` tells you whether each column is numeric, text, or something else.
*Why:* You can't reason about "is this dataset big enough" or "does this column need cleaning" without first knowing its shape and types.

**Step 4 — Check for missing values.**
```python
df.isnull().sum()
```
Learn: **missing values** are gaps in the data — a column with 30% missing values needs a decision (drop, fill, or investigate) before you model it.
*Why:* Silently ignoring missing data is one of the most common causes of misleading results in research.

**Step 5 — Visualize key distributions.**
```python
import matplotlib.pyplot as plt
df["target_column"].hist()
plt.show()
```
Learn: a **distribution** shows how values are spread — evenly, skewed, or clustered.
*Why:* A skewed or imbalanced target variable changes how you should evaluate a model later (Project 4) — you need to see this now.

**Step 6 — Check for class imbalance (if classification data).**
```python
df["target_column"].value_counts()
```
Learn: **class imbalance** is when one category vastly outnumbers another (e.g., 95% "no," 5% "yes").
*Why:* A model can look 95% accurate by always predicting "no" — imbalance silently inflates simple accuracy metrics.

**Step 7 — Note observations in markdown cells.**
Write 3–5 sentences summarizing what you found: is the data clean, imbalanced, complete?
*Why:* These notes become the justification for every modeling decision in Projects 3–5 — write them down while they're fresh.

### Final Project Structure
```text
data_exploration_project/
│
├── exploration.ipynb
├── your_dataset.csv
```

### What You Learned
✅ Loading and inspecting data with pandas
✅ Checking dataset shape and column types
✅ Identifying and handling missing values
✅ Visualizing distributions
✅ Detecting class imbalance
✅ Documenting exploratory findings

### Portfolio Project
**Exploratory Data Analysis Notebook** — Loaded, inspected, and visualized a dataset, identifying missing values, distribution shape, and class imbalance ahead of model development.
**Skills:** Python, Pandas, Data Visualization, Exploratory Data Analysis, AI Research.

**Deliverable:** A Jupyter notebook documenting the dataset's shape, missing values, distributions, and key observations.

---

## Project 3 (Module 3): Implement Gradient Descent from Scratch

**Goal:** Build the optimization algorithm underneath nearly every model you'll ever train — by hand, once, so it's never a mystery again.

### Why This Project Matters

Every model in Projects 4 and 5 is trained by some variant of this algorithm. Using it as a black box is fine for applied work, but a research engineer needs to understand what's actually happening when a model "learns" — this project removes that mystery permanently.

**Step 1 — Set up a project folder.**
```bash
mkdir gradient_descent_project
cd gradient_descent_project
```
*Why:* This is a focused, math-heavy project — keeping it separate from data exploration keeps each deliverable clean.

**Step 2 — Understand the goal: minimizing a loss function.**
Learn: a **loss function** measures how wrong a model's predictions are; **minimizing** it means adjusting the model until predictions get as close to correct as possible.
*Why:* Every model "training" you'll ever do is really just this one idea, applied to different loss functions and models.

**Step 3 — Understand the gradient.**
Learn: a **gradient** is the direction of steepest increase of the loss function with respect to the model's parameters; moving in the *opposite* direction decreases loss.
*Why:* "Gradient descent" is literally named after this — walking downhill on the loss surface, one step at a time.

**Step 4 — Implement a simple loss function.**
```bash
nano gradient_descent.py
```
```python
def loss(w, x, y):
    prediction = w * x
    return (prediction - y) ** 2
```
Learn: this is **mean squared error** for a single-parameter linear model — squaring the error penalizes big mistakes more than small ones.
*Why:* Starting with the simplest possible model (one parameter) keeps the math visible instead of buried in matrix operations.

**Step 5 — Implement the gradient manually.**
```python
def gradient(w, x, y):
    prediction = w * x
    return 2 * (prediction - y) * x
```
Learn: this is the **derivative** of the loss function with respect to `w` — the calculus that tells you which direction reduces error.
*Why:* Deriving this by hand once is what makes "backpropagation" (Project 5) feel like an extension of something familiar, not a new mystery.

**Step 6 — Write the descent loop.**
```python
w = 0.0
learning_rate = 0.01
x, y = 2.0, 8.0  # example: true relationship is w=4

for step in range(100):
    g = gradient(w, x, y)
    w = w - learning_rate * g
    if step % 10 == 0:
        print(f"Step {step}: w={w:.4f}, loss={loss(w, x, y):.4f}")
```
Learn: the **learning rate** controls how big each step is — too large and it overshoots, too small and it takes forever.
*Why:* This loop, in slightly more complex form, is exactly what's running under the hood when any ML library "fits" a model.

**Step 7 — Experiment with the learning rate.**
Run the loop with `learning_rate = 0.5` and `learning_rate = 0.001`, and observe the difference.
*Why:* Seeing divergence (too high) and slow convergence (too low) firsthand makes hyperparameter tuning intuitive instead of trial-and-error guessing.

**Step 8 — Extend to two parameters.**
Modify the loss and gradient functions to fit `w * x + b` instead of just `w * x`.
*Why:* Real models have many parameters — this is the first step from "toy example" toward something resembling real model training.

### Final Project Structure
```text
gradient_descent_project/
│
├── gradient_descent.py
├── experiment_notes.md
```

### What You Learned
✅ Loss functions and what "minimizing" means
✅ Gradients and the direction of steepest descent
✅ Implementing mean squared error and its derivative by hand
✅ Writing a gradient descent training loop
✅ The effect of learning rate on convergence
✅ Extending a single-parameter model to two parameters

### Portfolio Project
**Gradient Descent from Scratch** — Implemented a loss function, its derivative, and a full gradient descent training loop from first principles, including a learning-rate sensitivity experiment.
**Skills:** Optimization, Calculus for ML, Python, Mathematical Foundations of Machine Learning.

**Deliverable:** A working from-scratch gradient descent implementation, with notes on learning-rate experiments.

---

## Project 4 (Module 4): Train and Evaluate a Baseline Model

**Goal:** Establish a reference point — the number every future improvement (including Project 6's ablation study) gets measured against.

### Why This Project Matters

You can't know if a fancy model (Project 5) is actually better without something simple to compare it to. Skilled researchers always build the "dumbest reasonable model" first — this project is that habit.

**Step 1 — Set up a project folder.**
```bash
mkdir baseline_model_project
cd baseline_model_project
pip install --break-system-packages scikit-learn
```
*Why:* Scikit-learn provides ready-made baseline models, so you can focus on the evaluation discipline rather than reimplementing basics.

**Step 2 — Load your Project 2 dataset.**
```python
import pandas as pd
df = pd.read_csv("your_dataset.csv")
```
*Why:* Reusing the same dataset you already explored means you already know its shape, gaps, and imbalance — no surprises.

**Step 3 — Split into train and test sets.**
```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```
Learn: **train/test split** holds back some data the model never sees during training, so you can check if it generalizes instead of just memorizing.
*Why:* Evaluating a model on data it was trained on always looks better than reality — this is the single most important habit in ML evaluation.

**Step 4 — Train the simplest reasonable baseline.**
```python
from sklearn.dummy import DummyClassifier
baseline = DummyClassifier(strategy="most_frequent")
baseline.fit(X_train, y_train)
```
Learn: a **dummy classifier** always predicts the most common class — it's intentionally "dumb," and that's the point.
*Why:* If your real model can't beat this, it isn't learning anything useful from the data.

**Step 5 — Train a slightly smarter baseline.**
```python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train)
```
Learn: **logistic regression** is a simple, interpretable model for classification — often surprisingly hard to beat.
*Why:* This is your real baseline — the bar a more complex model (Project 5) actually needs to clear to justify its added complexity.

**Step 6 — Evaluate both models.**
```python
from sklearn.metrics import accuracy_score, f1_score
preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))
print("F1:", f1_score(y_test, preds))
```
Learn: **accuracy** is percent correct; **F1 score** balances precision and recall — critical if Project 2 revealed class imbalance, where accuracy alone is misleading.
*Why:* Picking the right metric, based on what you learned in Project 2, is what separates a meaningful evaluation from a misleading one.

**Step 7 — Document the baseline numbers.**
```bash
nano baseline_results.md
```
Record both models' scores.
*Why:* This is the number Project 6's ablation study measures every future change against.

### Final Project Structure
```text
baseline_model_project/
│
├── baseline.py
├── baseline_results.md
```

### What You Learned
✅ Splitting data into train and test sets
✅ Training a trivial baseline (dummy classifier)
✅ Training a simple, real baseline (logistic regression)
✅ Choosing evaluation metrics based on data characteristics
✅ Understanding accuracy vs. F1 score
✅ Documenting baseline results for future comparison

### Portfolio Project
**Baseline Model Evaluation** — Trained and evaluated dummy and logistic regression baselines with a proper train/test split, selecting evaluation metrics appropriate to the dataset's class balance.
**Skills:** Scikit-learn, Model Evaluation, Python, Statistical Reasoning, AI Research.

**Deliverable:** Trained baseline models with documented accuracy and F1 scores on a held-out test set.

---

## Project 5 (Module 5): Build a Small Neural Network from Scratch

**Goal:** Move from classical ML (Project 4) to deep learning fundamentals — by building the smallest possible neural network without a framework doing the work for you.

### Why This Project Matters

Frameworks like PyTorch make neural networks feel like magic. Building one from scratch — using Project 3's gradient descent — turns that magic into mechanics you actually understand, which is what lets you debug and improve real models later.

**Step 1 — Set up a project folder.**
```bash
mkdir neural_network_project
cd neural_network_project
pip install --break-system-packages numpy
```
*Why:* NumPy alone (no deep learning framework) forces you to implement the actual math — that's the point of this project.

**Step 2 — Understand a neuron.**
Learn: a **neuron** computes a weighted sum of its inputs, adds a bias, and passes the result through an **activation function** (a nonlinearity, like sigmoid).
*Why:* Without a nonlinearity, stacking layers would collapse into a single linear function — the activation function is what gives neural networks their power.

**Step 3 — Implement the sigmoid activation function.**
```bash
nano neural_network.py
```
```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return sigmoid(x) * (1 - sigmoid(x))
```
Learn: **sigmoid** squashes any input into a range between 0 and 1 — useful for binary classification outputs.
*Why:* You'll need both the function and its derivative — the derivative is what backpropagation (Step 6) uses to compute gradients through this layer.

**Step 4 — Initialize a simple network.**
```python
input_size, hidden_size, output_size = 2, 4, 1
W1 = np.random.randn(input_size, hidden_size) * 0.1
W2 = np.random.randn(hidden_size, output_size) * 0.1
```
Learn: **weights** are the learnable parameters connecting layers; small random initialization avoids starting the network stuck at a bad symmetric point.
*Why:* This is the "architecture" of your network — two layers, four hidden neurons — the smallest structure that can still learn a nonlinear pattern.

**Step 5 — Implement the forward pass.**
```python
def forward(X):
    hidden = sigmoid(X @ W1)
    output = sigmoid(hidden @ W2)
    return hidden, output
```
Learn: the **forward pass** is how input data flows through the network to produce a prediction.
*Why:* This is the "inference" half of the network — the same computation that would run in production once training is done.

**Step 6 — Implement backpropagation using the chain rule.**
```python
def backward(X, y, hidden, output, learning_rate=0.1):
    global W1, W2
    output_error = (output - y) * sigmoid_derivative(output)
    hidden_error = (output_error @ W2.T) * sigmoid_derivative(hidden)

    W2 -= learning_rate * (hidden.T @ output_error)
    W1 -= learning_rate * (X.T @ hidden_error)
```
Learn: **backpropagation** applies the chain rule from calculus to compute how much each weight contributed to the final error, layer by layer, working backward from the output.
*Why:* This is Project 3's single-parameter gradient descent, generalized to many parameters across multiple layers — the exact algorithm every deep learning framework runs internally.

**Step 7 — Train on a small toy dataset.**
```python
X = np.array([[0,0],[0,1],[1,0],[1,1]])
y = np.array([[0],[1],[1],[0]])  # XOR problem

for epoch in range(5000):
    hidden, output = forward(X)
    backward(X, y, hidden, output)

print(forward(X)[1])
```
Learn: **XOR** is a classic toy problem that a single-layer model *cannot* solve, but a network with a hidden layer can — proving your implementation actually works.
*Why:* If your from-scratch network solves XOR, you've proven every piece — forward pass, backprop, weight updates — is implemented correctly.

**Step 8 — Compare against a framework implementation.**
If time allows, implement the same tiny network in PyTorch or TensorFlow and confirm it also solves XOR.
*Why:* Seeing your from-scratch version match a framework's result is the strongest possible confirmation that you understand what the framework is doing underneath.

### Final Project Structure
```text
neural_network_project/
│
├── neural_network.py
├── xor_results.md
```

### What You Learned
✅ Neurons, weights, and activation functions
✅ Implementing sigmoid and its derivative
✅ The forward pass through a network
✅ Backpropagation via the chain rule
✅ Training a from-scratch network on a nonlinear problem (XOR)
✅ Comparing a from-scratch implementation against a framework

### Portfolio Project
**Neural Network from Scratch** — Implemented a two-layer neural network's forward pass and backpropagation using only NumPy, and trained it to solve the XOR problem without a deep learning framework.
**Skills:** Deep Learning Fundamentals, Backpropagation, NumPy, Mathematical Foundations of AI, AI Research.

**Deliverable:** A working from-scratch neural network that solves a nonlinear classification problem.

---

## Project 6 (Module 6): Run an Ablation Study

**Goal:** Learn to isolate what actually matters in a model design — the core skill of empirical AI research.

### Why This Project Matters

It's tempting to build a complex model and assume every part is pulling its weight. An ablation study replaces that assumption with evidence — it's how researchers actually justify design choices in published papers, and it's directly testing the discipline behind Project 1's reproduction.

**Step 1 — Set up a project folder.**
```bash
mkdir ablation_study_project
cd ablation_study_project
```
*Why:* An ablation study produces multiple result files (one per variant) — worth its own organized space.

**Step 2 — Choose a model with multiple components.**
Use your Project 5 neural network (or a slightly extended version) — something with at least 2–3 design choices you could remove or change.
*Why:* You need a model complex enough to have parts worth testing, but simple enough to modify quickly.

**Step 3 — Define your ablation variants.**
Learn: an **ablation** is a controlled removal or change of one component while holding everything else fixed (e.g., "same network, but no hidden layer" or "same network, but with a different activation function").
*Why:* Changing only one thing at a time is what lets you attribute a performance difference to that specific change, not some confound.

**Step 4 — Write down your hypothesis for each variant.**
```bash
nano hypotheses.md
```
Before running anything, predict: will removing this component help, hurt, or not matter?
*Why:* Writing predictions before results forces honest interpretation later — it's easy to unconsciously rationalize any result after the fact if you didn't commit to a hypothesis first.

**Step 5 — Run the baseline (full model) and each variant.**
```bash
nano ablation.py
```
```python
variants = {
    "full_model": run_full_model,
    "no_hidden_layer": run_without_hidden_layer,
    "different_activation": run_with_relu_instead,
}

results = {}
for name, run_fn in variants.items():
    results[name] = run_fn(X, y)
```
Learn: keep the dataset, training steps, and random seed identical across all variants except the one change being tested.
*Why:* Any difference other than your intended change becomes a confound that invalidates the comparison.

**Step 6 — Repeat each variant multiple times.**
Run each configuration 3–5 times with different random seeds and record the spread of results, not just one number.
*Why:* A single run can be lucky or unlucky — without repetition, you can't tell a real effect from random noise.

**Step 7 — Compare results against your hypotheses.**
```bash
nano ablation_results.md
```
For each variant: what you predicted, what happened, and by how much.
*Why:* This comparison is the actual research finding — "removing X hurt performance by Y%" is a claim you can defend, unlike "I think X matters."

**Step 8 — Write the conclusion.**
State which components matter most, based on the evidence, and note any surprises.
*Why:* This is the exact skill Project 1 asked you to evaluate in someone else's paper — now you're generating that kind of evidence yourself.

### Final Project Structure
```text
ablation_study_project/
│
├── ablation.py
├── hypotheses.md
├── ablation_results.md
```

### What You Learned
✅ Designing controlled ablation variants
✅ Writing pre-registered hypotheses before running experiments
✅ Holding all variables fixed except the one being tested
✅ Repeating runs to distinguish signal from noise
✅ Comparing results against predictions
✅ Drawing evidence-based conclusions about model components

### Portfolio Project
**Model Ablation Study** — Designed and ran a controlled ablation study on a neural network's components, testing hypotheses about hidden layers and activation functions with repeated trials.
**Skills:** Experimental Design, Statistical Reasoning, Python, Empirical AI Research.

**Deliverable:** An ablation study report comparing a full model against several variants, with pre-stated hypotheses and evidence-based conclusions.

---

## Project 7 (Module 7): Write a Short Research Report

**Goal:** Practice communicating results clearly — the skill that turns good research into research anyone else can use.

### Why This Project Matters

An experiment that isn't written up clearly might as well not have happened, from anyone else's perspective. This project turns your Project 6 ablation study (or any prior project's results) into something a stranger could read and trust.

**Step 1 — Set up a project folder.**
```bash
mkdir research_report_project
cd research_report_project
```
*Why:* A report is a standalone deliverable — it should be readable without anyone opening your code.

**Step 2 — Choose which project's results to report on.**
Use your Project 6 ablation study, or combine it with Project 4's baseline.
*Why:* A report needs real, already-generated results to communicate — this isn't the place to run new experiments.

**Step 3 — Write the abstract last, but plan it first.**
Learn: an **abstract** is a 3–5 sentence summary of the entire report — question, method, result, takeaway — written so someone can decide whether to read further.
*Why:* Planning the abstract's shape first keeps the rest of the report focused on supporting those exact claims.

**Step 4 — Write the introduction.**
```bash
nano report.md
```
State the question you investigated and why it matters, in your own words.
*Why:* A reader needs to know *why* to care about your results before you show them any numbers.

**Step 5 — Write the method section.**
Describe what you built and how you tested it, in enough detail that someone else could repeat it.
*Why:* Reproducibility is the standard for real research — if your method section is too vague to follow, the results aren't independently verifiable.

**Step 6 — Present results with a visualization.**
```python
import matplotlib.pyplot as plt
plt.bar(results.keys(), [r["accuracy"] for r in results.values()])
plt.savefig("results_chart.png")
```
Learn: a well-labeled chart communicates a comparison faster than a table of numbers.
*Why:* Most readers will look at your chart before reading your text — make sure it can stand on its own.

**Step 7 — Write the discussion.**
Explain what the results mean, note limitations (small dataset, few repetitions, etc.), and suggest what you'd test next.
*Why:* Acknowledging limitations honestly is what separates credible research writing from overclaiming — reviewers and readers trust reports that are upfront about their limits.

**Step 8 — Write the final abstract.**
Now that the rest is written, distill it into your 3–5 sentence summary.
*Why:* Writing the abstract last, once you know exactly what you found, keeps it accurate instead of an aspirational guess from before you had results.

### Final Project Structure
```text
research_report_project/
│
├── report.md
├── results_chart.png
```

### What You Learned
✅ Structuring a research report (abstract, intro, method, results, discussion)
✅ Writing a method section detailed enough to reproduce
✅ Visualizing results for clarity
✅ Discussing limitations honestly
✅ Writing an accurate abstract after the fact, not before

### Portfolio Project
**AI Research Report** — Wrote a structured research report on an ablation study, including a reproducible method section, a results visualization, and an honest discussion of limitations.
**Skills:** Technical Writing, Data Visualization, Research Communication, AI Research.

**Deliverable:** A short, structured research report with abstract, method, visualized results, and discussion.

---

## Final Capstone: Reproduce a Published Paper's Core Result and Write Up Findings

**Goal:** Combine every project above into one complete research effort — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that proves you can do the actual job: take a real published claim, rebuild it yourself using the exact skills from Projects 1–7, and write it up so someone else could trust and reproduce your work in turn.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
*Why:* This capstone reuses skills, not necessarily code, from every prior project — keep it as its own clean effort.

**Step 2 — Choose a paper, applying Project 1's approach.**
Pick a paper with a result ambitious enough to be meaningful, but still reproducible with the compute and time you have.
*Why:* This is the same judgment call from Project 1, now applied at capstone scale.

**Step 3 — Explore and understand the dataset (Project 2 skills).**
Load, inspect, and visualize the data the paper uses (or a substitute if unavailable).
*Why:* Skipping this step means building on data you don't actually understand — the exact mistake Project 2 was designed to prevent.

**Step 4 — Implement the core method.**
Use Project 3 and 5's skills as needed — you may be implementing an optimization approach, a small model, or both, depending on the paper.
*Why:* This is where your from-scratch understanding pays off — you can actually build what the paper describes instead of only using a pre-built library.

**Step 5 — Establish a baseline (Project 4 skills).**
Before matching the paper's full method, confirm a simple baseline behaves sensibly on your data.
*Why:* A baseline catches basic implementation bugs before you spend time chasing the more complex result.

**Step 6 — Reproduce the core result and run a small ablation (Project 6 skills).**
Try to match the paper's reported number, and test at least one component the paper claims matters.
*Why:* This is where you move from "reproducing" to "verifying" — testing not just that the result holds, but why.

**Step 7 — Write the full research report (Project 7 skills).**
```bash
nano capstone_report.md
```
Abstract, introduction, method, results (with your number vs. the paper's number), ablation findings, discussion, and limitations.
*Why:* This report is the artifact that represents your entire research process — it should stand alone.

**Step 8 — Reflect on what matched and what didn't.**
Write a short, honest section: where your results matched the paper, where they diverged, and your best explanation why.
*Why:* Perfect reproduction is rare even for professional researchers — an honest account of the gap is more valuable, and more credible, than pretending it matched perfectly.

### Final Project Structure
```text
capstone_project/
│
├── paper_summary.md
├── data_exploration.ipynb
├── method_implementation.py
├── baseline_results.md
├── ablation_results.md
├── capstone_report.md
```

### What You Learned
✅ Selecting and scoping a real published result to reproduce
✅ Applying data exploration, baseline modeling, and from-scratch implementation together
✅ Running a small-scale ablation on a real reproduction
✅ Writing a full, honest research report on the effort
✅ Reflecting critically on gaps between your results and the original

### Portfolio Project
**Published Paper Reproduction (Capstone)** — Reproduced the core result of a published research paper from scratch, including data exploration, method implementation, baseline comparison, a small ablation study, and a full research report with an honest discussion of reproduction gaps.
**Skills:** Research Reproduction, Python, Deep Learning Fundamentals, Experimental Design, Technical Writing, AI Research.

**Deliverable:** A complete capstone folder with your paper summary, implementation, results, and a full research report comparing your findings to the original paper.
