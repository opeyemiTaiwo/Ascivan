# AI Data Engineer — Hands-On Project Tutorials

This document turns every project in the **AI Data Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Map a Data Pipeline for an AI Use Case

**Goal:** Before writing any code, learn to see data movement as a pipeline of stages — so every later project has a place to plug into.

### Why This Project Matters

It's tempting to jump straight into writing a script that "just works." But every real AI data pipeline has the same underlying shape — ingest, clean, store, transform, serve — and understanding that shape now means every later project builds toward something coherent instead of a pile of disconnected scripts.

**Step 1 — Set up a project folder.**
```bash
mkdir data_pipeline_map_project
cd data_pipeline_map_project
```
*Why:* Even planning documents deserve a home — this becomes the first entry in your portfolio for this course.

**Step 2 — Define the AI use case.**
```bash
nano use_case.md
```
Write one sentence: what AI application will consume this data, and what does it need to work? Example: "A customer support chatbot needs cleaned, labeled support tickets to fine-tune on."
*Why:* Every pipeline decision — what to clean, how to store it, how fresh it needs to be — depends entirely on what the data is for.

**Step 3 — Identify the data source.**
Learn: a **data source** is where raw data originates — a database, an API, uploaded files, or a stream of events.
*Why:* The source determines whether you'll need batch processing (Project 4) or something closer to real-time — get this wrong and the whole pipeline design is wrong.

**Step 4 — List the five pipeline stages.**
- **Ingestion** — pulling raw data from the source.
- **Cleaning** — fixing or removing bad data.
- **Storage** — where cleaned data lives.
- **Transformation** — turning raw data into a form a model can use (labels, embeddings).
- **Serving** — how the AI application actually accesses the final data.
*Why:* Every project in this course builds exactly one of these stages. Naming them now means every later project has a labeled box to go in.

**Step 5 — Sketch data volume and frequency.**
Estimate: how much data, and how often does new data arrive (once, daily, continuously)?
*Why:* A one-time 10MB file and a continuous stream of 10GB/day need completely different pipeline architectures — this estimate shapes every later technical choice.

**Step 6 — Note data quality risks.**
List: what could be wrong with this data? (duplicates, missing fields, inconsistent formats, mislabeled examples)
*Why:* This list becomes your checklist for Project 2's cleaning script — write it now while you're thinking about the data, not later when you're staring at code.

**Step 7 — Draw the pipeline diagram.**
Sketch five labeled boxes (Ingestion → Cleaning → Storage → Transformation → Serving) in a row, with arrows showing data flowing left to right.
*Why:* This diagram is your map for the rest of the course — each project fills in one box with something real.

### Final Project Structure
```text
data_pipeline_map_project/
│
├── use_case.md
├── pipeline_diagram.png
```

### What You Learned
✅ Defining an AI use case's data requirements
✅ Identifying data sources
✅ The five stages of a data pipeline
✅ Estimating data volume and frequency
✅ Anticipating data quality risks
✅ Turning a use case into a pipeline diagram

### Portfolio Project
**AI Data Pipeline Architecture Map** — Translated an AI application's data requirements into a five-stage pipeline diagram covering ingestion, cleaning, storage, transformation, and serving.
**Skills:** Data Architecture, Systems Thinking, Technical Documentation, AI Data Engineering.

**Deliverable:** A one-page data pipeline map for your example AI use case, covering source, stages, volume, and quality risks.

---

## Project 2 (Module 2): Build a Data Cleaning Script

**Goal:** Get hands-on with real, messy data — the unavoidable first technical task in almost every AI data role.

### Why This Project Matters

Raw data is never ready to use. This project builds the specific, repeatable habits (checking nulls, duplicates, formats) that every later project in this course assumes you already know how to do.

**Step 1 — Set up a project folder.**
```bash
mkdir data_cleaning_project
cd data_cleaning_project
pip install --break-system-packages pandas
```
*Why:* Pandas is the standard tool for tabular data cleaning in Python — almost every step below uses it.

**Step 2 — Get a messy dataset.**
Download a real-world CSV with known issues (missing values, inconsistent casing, duplicate rows) — or intentionally mess up a clean one for practice.
*Why:* Practicing on artificially clean data doesn't build the muscle you need — real messiness is what the job actually looks like.

**Step 3 — Load and inspect the data.**
```bash
nano clean_data.py
```
```python
import pandas as pd
df = pd.read_csv("raw_data.csv")
print(df.shape)
print(df.isnull().sum())
print(df.duplicated().sum())
```
Learn: `.isnull().sum()` counts missing values per column; `.duplicated().sum()` counts exact duplicate rows.
*Why:* You can't clean what you haven't measured — this is the diagnostic step before any fix.

**Step 4 — Handle missing values.**
```python
df = df.dropna(subset=["critical_column"])
df["optional_column"] = df["optional_column"].fillna("unknown")
```
Learn: **dropping** removes rows with missing data in columns you can't work without; **filling** replaces gaps in columns where a placeholder is acceptable.
*Why:* Treating every missing value the same way (all dropped, or all filled) usually loses too much data or introduces bad assumptions — the right choice depends on the column.

**Step 5 — Remove duplicates.**
```python
df = df.drop_duplicates()
```
Learn: duplicate rows silently bias any model or statistic trained on this data toward whatever's overrepresented.
*Why:* Duplicates are one of the most common, and most overlooked, sources of misleading results in AI training data.

**Step 6 — Standardize formats.**
```python
df["email"] = df["email"].str.lower().str.strip()
df["date_column"] = pd.to_datetime(df["date_column"], errors="coerce")
```
Learn: **standardizing** means forcing values into one consistent format (lowercase text, a single date format) so "Yes", "yes", and "YES" aren't treated as three different values.
*Why:* Inconsistent formatting is invisible in a spreadsheet view but breaks grouping, joining, and model training silently.

**Step 7 — Validate the cleaned result.**
```python
assert df.isnull().sum()["critical_column"] == 0
assert df.duplicated().sum() == 0
print("Cleaning validated.")
```
Learn: an **assertion** halts the script if a condition isn't met — a cheap, automatic sanity check.
*Why:* This turns "I think it's clean" into "the script proves it's clean" — the same discipline Project 7's validation checks will formalize further.

**Step 8 — Save the cleaned dataset.**
```python
df.to_csv("cleaned_data.csv", index=False)
```
*Why:* This cleaned file is what Projects 3–6 will build on — a script that prints results but doesn't save them isn't actually useful to the pipeline.

### Final Project Structure
```text
data_cleaning_project/
│
├── raw_data.csv
├── clean_data.py
├── cleaned_data.csv
```

### What You Learned
✅ Diagnosing missing values and duplicates
✅ Deciding when to drop vs. fill missing data
✅ Removing duplicate rows
✅ Standardizing inconsistent formats
✅ Validating cleaning results with assertions
✅ Saving a cleaned dataset for downstream use

### Portfolio Project
**Data Cleaning Pipeline Script** — Built a reusable Python script that diagnoses, cleans, standardizes, and validates a messy real-world dataset, producing a verified clean output file.
**Skills:** Python, Pandas, Data Cleaning, Data Quality, AI Data Engineering.

**Deliverable:** A data cleaning script and a validated, cleaned CSV file.

---

## Project 3 (Module 3): Design a Schema for a Training Dataset Store

**Goal:** Decide how cleaned data should be structured and stored — the step between "I have clean data" and "a model can reliably use this data."

### Why This Project Matters

A pile of cleaned CSVs isn't a data store — it's just files. This project teaches you to design structure that scales: consistent fields, clear relationships, and a place to track versions, all of which Project 4's pipeline will write into.

**Step 1 — Set up a project folder.**
```bash
mkdir schema_design_project
cd schema_design_project
```
*Why:* Schema design artifacts (diagrams, SQL definitions) are reference documents your team would return to repeatedly — worth keeping clean and separate.

**Step 2 — Identify your entities.**
Learn: an **entity** is a distinct "thing" your data describes — e.g., for a support-ticket dataset: `tickets`, `customers`, `labels`.
*Why:* Naming entities before writing any table definitions prevents one giant, unwieldy table that mixes unrelated concepts.

**Step 3 — Define fields for each entity.**
```bash
nano schema.md
```
For each entity, list its fields and types: `ticket_id (string), text (string), created_at (datetime), label (string)`.
*Why:* Explicit types catch problems early — a `created_at` field typed as text instead of datetime causes silent bugs in every later query.

**Step 4 — Define relationships between entities.**
Learn: a **foreign key** is a field in one table that references the identifier of another (e.g., `tickets.customer_id` points to `customers.id`).
*Why:* Relationships are what let you join related data later (e.g., "show me all tickets from customers in region X") without duplicating customer info into every ticket row.

**Step 5 — Add versioning fields.**
Add `dataset_version` and `created_at` fields to your core table.
Learn: **dataset versioning** means every row (or dataset snapshot) can be traced to exactly when and how it was produced.
*Why:* Without this, "which version of the data was this model trained on" becomes unanswerable months later — a common, expensive mistake.

**Step 6 — Write the schema as SQL.**
```sql
CREATE TABLE tickets (
    ticket_id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP,
    label TEXT,
    dataset_version TEXT
);
```
Learn: `PRIMARY KEY` uniquely identifies each row; `NOT NULL` enforces that a field can't be left empty.
*Why:* Writing the schema as executable SQL (not just a description) means Project 4 can create this table directly from what you designed here.

**Step 7 — Diagram the schema.**
Sketch your tables as boxes with fields listed inside, and draw lines showing foreign key relationships.
*Why:* A diagram communicates structure faster than reading raw SQL — useful for explaining the design to teammates who aren't reading code.

### Final Project Structure
```text
schema_design_project/
│
├── schema.md
├── schema.sql
├── schema_diagram.png
```

### What You Learned
✅ Identifying entities in a dataset
✅ Defining fields and types
✅ Modeling relationships with foreign keys
✅ Adding dataset versioning for traceability
✅ Writing schema as executable SQL
✅ Diagramming a data model

### Portfolio Project
**Training Dataset Schema Design** — Designed a versioned, relational schema for a training dataset store, including entity relationships and executable SQL table definitions.
**Skills:** Database Design, SQL, Data Modeling, AI Data Engineering.

**Deliverable:** A schema document, SQL table definitions, and a diagram for your training dataset store.

---

## Project 4 (Module 4): Build a Batch ETL Pipeline

**Goal:** Automate the move from raw data to stored data — connecting Project 2's cleaning and Project 3's schema into a repeatable process.

### Why This Project Matters

Running your Project 2 cleaning script by hand once was fine for learning. But real pipelines run repeatedly, on new data, without you manually babysitting each run — this project is where cleaning becomes automated infrastructure.

**Step 1 — Set up a project folder.**
```bash
mkdir etl_pipeline_project
cd etl_pipeline_project
pip install --break-system-packages pandas sqlalchemy
```
*Why:* SQLAlchemy lets Python talk to a real database, connecting your pipeline to the schema you designed in Project 3.

**Step 2 — Understand ETL.**
Learn: **ETL** stands for **Extract** (pull raw data from a source), **Transform** (clean and reshape it), **Load** (write it into storage). **ELT** does the same steps in a different order, transforming after loading.
*Why:* This three-stage structure is the backbone of almost every data pipeline in the industry — once you see it, you'll recognize it everywhere.

**Step 3 — Write the Extract step.**
```bash
nano etl.py
```
```python
import pandas as pd

def extract(path):
    return pd.read_csv(path)
```
*Why:* Isolating extraction into its own function means you can swap the source (a different file, an API, a database) later without touching the rest of the pipeline.

**Step 4 — Write the Transform step.**
```python
def transform(df):
    df = df.dropna(subset=["text"])
    df = df.drop_duplicates()
    df["text"] = df["text"].str.strip()
    return df
```
*Why:* This reuses the exact cleaning logic from Project 2 — ETL pipelines aren't new logic, they're existing logic made repeatable.

**Step 5 — Write the Load step.**
```python
from sqlalchemy import create_engine

def load(df, table_name, engine):
    df.to_sql(table_name, engine, if_exists="append", index=False)
```
Learn: `if_exists="append"` adds new rows without erasing existing ones — critical for a pipeline that runs repeatedly on new data.
*Why:* Using `"replace"` by mistake here is a classic beginner bug that silently destroys previously loaded data.

**Step 6 — Wire the three stages together.**
```python
def run_pipeline(path, table_name, engine):
    df = extract(path)
    df = transform(df)
    load(df, table_name, engine)
    print(f"Loaded {len(df)} rows into {table_name}")

engine = create_engine("sqlite:///data_store.db")
run_pipeline("raw_data.csv", "tickets", engine)
```
*Why:* This is your actual working pipeline — running Extract → Transform → Load as one repeatable function instead of three separate manual scripts.

**Step 7 — Test with a second batch of data.**
Run the pipeline again with a new file representing "tomorrow's data."
*Why:* A pipeline that only works once isn't a pipeline — testing a second run proves it's actually repeatable.

**Step 8 — Add basic logging.**
```python
import logging
logging.basicConfig(level=logging.INFO)
logging.info(f"Pipeline run completed: {len(df)} rows loaded.")
```
*Why:* Once this runs unattended (Project 7 will schedule it), logs are the only way to know what happened without watching it live.

### Final Project Structure
```text
etl_pipeline_project/
│
├── etl.py
├── raw_data.csv
├── data_store.db
├── pipeline.log
```

### What You Learned
✅ The Extract, Transform, Load pattern
✅ Isolating pipeline stages into reusable functions
✅ Writing to a database with SQLAlchemy
✅ Appending vs. replacing data safely
✅ Testing pipeline repeatability across multiple runs
✅ Adding basic pipeline logging

### Portfolio Project
**Batch ETL Pipeline** — Built a reusable Extract-Transform-Load pipeline that ingests raw CSV data, applies cleaning logic, and loads it into a structured database, tested across multiple repeated runs.
**Skills:** Python, SQL, ETL/ELT, SQLAlchemy, Data Pipelines, AI Data Engineering.

**Deliverable:** A working ETL pipeline script that repeatably processes new data into a structured store.

---

## Project 5 (Module 5): Prepare a Labeled Dataset for Training

**Goal:** Take cleaned, stored data (Project 4's output) and turn it into something a model can actually be trained on.

### Why This Project Matters

Clean data isn't the same as trainable data. This project adds the missing piece — labels — and handles the two problems that quietly wreck model training if ignored: imbalance and leakage.

**Step 1 — Set up a project folder.**
```bash
mkdir labeled_dataset_project
cd labeled_dataset_project
```
*Why:* Labeling decisions (what a label means, how conflicts were resolved) need to be documented somewhere permanent — future you, or a teammate, will need this record.

**Step 2 — Load your Project 4 pipeline's output.**
```python
import pandas as pd
df = pd.read_csv("cleaned_data.csv")  # or read from your Project 4 database
```
*Why:* Reusing your already-cleaned data means you're not repeating cleaning work — this project focuses purely on labeling and preparation.

**Step 3 — Define labeling criteria.**
```bash
nano labeling_guide.md
```
Write clear rules for what each label means, with 2–3 examples per label.
*Why:* Without written criteria, labels applied by different people (or by you on different days) drift apart — inconsistent labels directly hurt model quality.

**Step 4 — Apply labels.**
For a small dataset, label manually using your guide; for a larger one, use an existing labeled column or a simple rule-based heuristic as a starting point.
```python
df["label"] = df["category"].map({"billing": "billing_issue", "bug": "technical_issue"})
```
*Why:* Even simple, imperfect starting labels are more useful than none — you can refine them later with the fairness/bias evaluation covered in other roles.

**Step 5 — Check label distribution.**
```python
df["label"].value_counts()
```
Learn: **class imbalance** here means some labels have far fewer examples than others.
*Why:* A model trained on heavily imbalanced labels tends to just predict the majority label — the same issue evaluated in Project 4 of the AI Research Engineer course, but now it's your job to catch it at the source.

**Step 6 — Split into train, validation, and test sets.**
```python
from sklearn.model_selection import train_test_split
train, temp = train_test_split(df, test_size=0.3, random_state=42, stratify=df["label"])
val, test = train_test_split(temp, test_size=0.5, random_state=42, stratify=temp["label"])
```
Learn: `stratify` ensures each split has roughly the same label distribution as the full dataset. A **validation set** is used during model development; a **test set** is held back until final evaluation only.
*Why:* Without stratification, a rare label could end up entirely in one split — making it untestable or unlearnable.

**Step 7 — Check for data leakage.**
Learn: **data leakage** happens when information from the test set (or future data) accidentally influences training — e.g., duplicate rows across splits, or a feature that encodes the label indirectly.
```python
overlap = set(train["ticket_id"]) & set(test["ticket_id"])
assert len(overlap) == 0, "Leakage detected between train and test sets!"
```
*Why:* Leakage makes a model look artificially good during evaluation, then fail in the real world — one of the most damaging and hardest-to-notice mistakes in ML data prep.

**Step 8 — Save the final labeled splits.**
```python
train.to_csv("train.csv", index=False)
val.to_csv("val.csv", index=False)
test.to_csv("test.csv", index=False)
```
*Why:* These three files are the actual deliverable a model-training project would consume directly.

### Final Project Structure
```text
labeled_dataset_project/
│
├── labeling_guide.md
├── prepare_labels.py
├── train.csv
├── val.csv
├── test.csv
```

### What You Learned
✅ Writing clear labeling criteria
✅ Applying labels consistently
✅ Detecting class imbalance in labeled data
✅ Splitting data into train/validation/test with stratification
✅ Detecting and preventing data leakage
✅ Producing model-ready labeled datasets

### Portfolio Project
**Labeled Training Dataset Preparation** — Defined labeling criteria, applied labels to a cleaned dataset, checked for class imbalance and data leakage, and produced stratified train/validation/test splits.
**Skills:** Data Labeling, Scikit-learn, Data Quality, ML Data Preparation, AI Data Engineering.

**Deliverable:** A labeling guide plus stratified, leakage-checked train/validation/test CSV files.

---

## Project 6 (Module 6): Build a Vector Store from a Document Set

**Goal:** Extend your data engineering skills to unstructured text and the retrieval systems behind modern AI applications like RAG chatbots.

### Why This Project Matters

So far you've worked with structured, tabular data. Most real-world documents — support articles, PDFs, contracts — aren't tables. This project builds the pipeline that makes unstructured text searchable by meaning, which is the backbone of retrieval-augmented generation (RAG) systems.

**Step 1 — Set up a project folder.**
```bash
mkdir vector_store_project
cd vector_store_project
pip install --break-system-packages sentence-transformers chromadb
```
*Why:* `sentence-transformers` creates embeddings; `chromadb` is a simple vector database to store and search them.

**Step 2 — Gather a document set.**
Collect 10–20 text documents (articles, FAQs, or paragraphs) into a folder.
*Why:* You need real, varied text to see how chunking and retrieval behave — a single document won't reveal how the system handles diversity.

**Step 3 — Chunk the documents.**
```bash
nano build_vector_store.py
```
```python
def chunk_text(text, chunk_size=200, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunks.append(" ".join(words[i:i + chunk_size]))
    return chunks
```
Learn: **chunking** splits long documents into smaller pieces; **overlap** repeats a few words between chunks so context isn't lost at the boundary.
*Why:* Embedding an entire long document as one vector loses detail — chunking lets retrieval find the specific relevant section, not just the whole document.

**Step 4 — Generate embeddings for each chunk.**
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunks)
```
Learn: an **embedding** is a list of numbers representing a chunk's meaning — texts with similar meaning end up with mathematically similar embeddings.
*Why:* This is what makes "search by meaning" possible instead of just keyword matching — two chunks can be relevant even if they don't share any exact words.

**Step 5 — Store embeddings in a vector database.**
```python
import chromadb
client = chromadb.Client()
collection = client.create_collection("documents")

collection.add(
    documents=chunks,
    embeddings=embeddings.tolist(),
    ids=[f"chunk_{i}" for i in range(len(chunks))]
)
```
Learn: a **vector database** stores embeddings and is optimized to quickly find the closest matches to a new query embedding.
*Why:* A regular database can't efficiently answer "which of these 10,000 chunks is most similar in meaning to this new text" — that's exactly what vector databases are built for.

**Step 6 — Query the vector store.**
```python
query = "How do I reset my password?"
query_embedding = model.encode([query])
results = collection.query(query_embeddings=query_embedding.tolist(), n_results=3)
print(results["documents"])
```
*Why:* This is the retrieval step that a RAG chatbot would call at runtime — proving your store returns genuinely relevant chunks is the actual test of whether this project worked.

**Step 7 — Evaluate retrieval quality.**
Try 5 different queries and manually judge whether the top results are actually relevant.
*Why:* Embeddings and vector search feel like magic until you check — bad chunking or a mismatched embedding model can quietly produce irrelevant results.

**Step 8 — Document your chunking and embedding choices.**
```bash
nano vector_store_notes.md
```
Record chunk size, overlap, embedding model used, and your retrieval evaluation results.
*Why:* These choices significantly affect retrieval quality — documenting them means future tuning starts from a known baseline, not guesswork.

### Final Project Structure
```text
vector_store_project/
│
├── documents/
├── build_vector_store.py
├── vector_store_notes.md
```

### What You Learned
✅ Chunking long text into retrievable pieces
✅ Generating embeddings for semantic meaning
✅ Storing and querying a vector database
✅ Retrieving results by meaning, not just keywords
✅ Evaluating retrieval quality manually
✅ Documenting chunking and embedding decisions

### Portfolio Project
**Document Vector Store for Semantic Search** — Built a chunking and embedding pipeline over a real document set, stored it in a vector database, and evaluated retrieval quality across multiple queries.
**Skills:** Embeddings, Vector Databases, RAG Foundations, Python, AI Data Engineering.

**Deliverable:** A working vector store built from a real document set, with a retrieval evaluation.

---

## Project 7 (Module 7): Build a Data Validation and Monitoring Check

**Goal:** Add quality control on top of your pipeline — so bad data gets caught automatically instead of silently poisoning downstream models.

### Why This Project Matters

Every project so far assumed the data was reasonably well-behaved. Real pipelines run for months, feeding on data sources that change without warning. This project builds the safety net that catches those changes before they reach a model.

**Step 1 — Set up a project folder.**
```bash
mkdir data_validation_project
cd data_validation_project
```
*Why:* Validation logic should live independently of the pipeline it checks, so it can be run against any new dataset without modification.

**Step 2 — Define validation rules from what you already know.**
```bash
nano validation_rules.md
```
Using your Project 3 schema and Project 2's cleaning checks, list rules: required fields, expected types, acceptable value ranges.
*Why:* You already did the thinking for this in earlier projects — validation rules are just those assumptions made explicit and automatic.

**Step 3 — Implement schema validation.**
```bash
nano validate.py
```
```python
import pandas as pd

def validate_schema(df, required_columns):
    missing = set(required_columns) - set(df.columns)
    assert not missing, f"Missing columns: {missing}"
```
*Why:* If a data source silently drops or renames a column, this catches it immediately instead of causing a confusing failure three steps later in the pipeline.

**Step 4 — Implement value range checks.**
```python
def validate_ranges(df):
    assert df["created_at"].notnull().all(), "Nulls found in created_at"
    assert (df["label"].isin(["billing_issue", "technical_issue"])).all(), "Unexpected label values"
```
*Why:* An unexpected label value (a typo, a new category no one told you about) can silently corrupt every downstream training run until someone notices the model behaving oddly.

**Step 5 — Learn about data drift.**
Learn: **data drift** is when the statistical properties of incoming data change over time (e.g., average text length doubles, or a new label category starts appearing) even though the schema still technically validates.
*Why:* Drift is invisible to strict schema checks — data can be perfectly well-formed and still be meaningfully different from what a model was trained on.

**Step 6 — Implement a simple drift check.**
```python
def check_drift(df, baseline_mean, baseline_std, column, threshold=3):
    current_mean = df[column].mean()
    z_score = abs(current_mean - baseline_mean) / baseline_std
    if z_score > threshold:
        print(f"WARNING: Possible drift detected in {column}")
```
Learn: this compares today's average against a saved baseline — a large deviation (measured in standard deviations) flags a possible shift.
*Why:* This is a hand-built preview of the kind of monitoring real production data pipelines run continuously.

**Step 7 — Wire validation into your Project 4 pipeline.**
```python
def run_pipeline_with_validation(path, table_name, engine):
    df = extract(path)
    validate_schema(df, ["ticket_id", "text", "created_at", "label"])
    df = transform(df)
    validate_ranges(df)
    load(df, table_name, engine)
```
*Why:* Validation that isn't actually run as part of the pipeline is just documentation — wiring it in is what makes it real protection.

**Step 8 — Test it against intentionally broken data.**
Create a deliberately bad CSV (missing column, invalid label) and confirm your pipeline stops with a clear error instead of silently loading bad data.
*Why:* A validation check that's never been tested against bad data is unproven — this is the equivalent of Project 7's alert-testing step in the Infrastructure course.

### Final Project Structure
```text
data_validation_project/
│
├── validation_rules.md
├── validate.py
├── broken_test_data.csv
```

### What You Learned
✅ Turning implicit assumptions into explicit validation rules
✅ Schema validation (required columns, types)
✅ Value range and category validation
✅ Understanding data drift vs. schema violations
✅ Implementing a simple statistical drift check
✅ Wiring validation into a real pipeline and testing it against bad data

### Portfolio Project
**Data Pipeline Validation & Monitoring** — Built and tested schema validation, value range checks, and a statistical drift detector, integrated directly into a working ETL pipeline.
**Skills:** Data Quality Engineering, Data Validation, Statistical Monitoring, Python, AI Data Engineering.

**Deliverable:** A validation module wired into your pipeline, tested against intentionally broken data.

---

## Final Capstone: Build an End-to-End Data Pipeline for an AI Application

**Goal:** Combine every project above into one working system — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes on your resume and in interviews. It proves you can take a real AI application's data needs and build the entire pipeline behind it — not just one isolated piece, but the whole thing working together.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your code from Projects 2–7.
*Why:* The capstone isn't written from scratch — it's assembled and connected from work you've already validated individually.

**Step 2 — Start from your Project 1 pipeline map.**
Confirm each stage (ingestion, cleaning, storage, transformation, serving) has a concrete implementation from the projects you've already built.
*Why:* The capstone is the moment the map stops being theoretical.

**Step 3 — Wire ingestion and cleaning together (Projects 2 & 4).**
Confirm your ETL pipeline's Extract and Transform steps run cleanly on a fresh batch of data.

**Step 4 — Load into your schema-designed store (Projects 3 & 4).**
Confirm the Load step writes into the structure you designed in Project 3.

**Step 5 — Add validation (Project 7).**
Wire your validation and drift checks into the pipeline so bad data is caught automatically.

**Step 6 — Produce labeled training data (Project 5).**
Run your labeling and splitting logic against the stored, validated data to produce final train/val/test files.

**Step 7 — Index a document set for retrieval (Project 6).**
If your use case includes unstructured text, build the vector store as the pipeline's final "serving" stage.

**Step 8 — Test the full pipeline end-to-end.**
Run it against a completely fresh batch of raw data and confirm it produces validated, labeled, and (if applicable) indexed output without manual intervention.
*Why:* This single end-to-end run is the real proof — it's easy for each piece to work in isolation but break when actually chained together.

**Step 9 — Write the final pipeline document.**
```bash
nano capstone_summary.md
```
Combine your Project 1 map, schema, validation rules, and final pipeline results into one write-up: what you built, how it handles new data, and how you'd know if it broke.
*Why:* This document is what you'd hand to a teammate or future employer to prove the system is real, tested, and understood — not just a folder of scripts.

### Final Project Structure
```text
capstone_project/
│
├── use_case.md
├── pipeline_diagram.png
├── schema.sql
├── etl.py
├── validate.py
├── prepare_labels.py
├── build_vector_store.py
├── train.csv / val.csv / test.csv
├── capstone_summary.md
```

### What You Learned
✅ Connecting ingestion, cleaning, storage, and transformation into one pipeline
✅ Running validation and drift checks as part of a live pipeline
✅ Producing labeled, split, model-ready data from raw input
✅ Indexing unstructured data for retrieval
✅ Testing a full pipeline end-to-end on fresh data
✅ Documenting a complete data pipeline for a real audience

### Portfolio Project
**End-to-End AI Data Pipeline (Capstone)** — Designed and built a complete data pipeline for an AI application: automated ingestion and cleaning, a versioned schema-backed store, validation and drift monitoring, labeled training data preparation, and a document vector store for retrieval.
**Skills:** ETL, SQL, Data Validation, Data Labeling, Vector Databases, Python, AI Data Engineering.

**Deliverable:** A complete, tested, end-to-end data pipeline plus a written summary connecting it back to every project that built it.
