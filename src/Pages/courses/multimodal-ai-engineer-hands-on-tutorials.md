# Multimodal AI Engineer — Hands-On Project Tutorials

This document turns every project in the **Multimodal AI Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Survey and Compare Multimodal Models

**Goal:** Understand what tools exist before building anything — the landscape you'll be pulling from for every later project.

### Why This Project Matters

Multimodal AI moves fast, and there's no single "the multimodal model" — there are different models for different modality combinations, each with different strengths. This project builds an accurate mental map before you commit to building on any of them.

**Step 1 — Set up a project folder.**
```bash
mkdir multimodal_survey_project
cd multimodal_survey_project
```
*Why:* This survey becomes a reference document you'll return to across the whole course.

**Step 2 — Learn the four modalities this course covers.**
Learn: **text** (words), **image** (still pictures), **audio** (speech/sound), **video** (moving images, often with audio) — a **multimodal model** processes and/or generates more than one of these.
*Why:* Naming the modalities precisely now avoids vague thinking later — "multimodal" without specifics is meaningless.

**Step 3 — Identify model categories by capability.**
```bash
nano model_survey.md
```
Learn: **vision-language models (VLMs)** understand images and text together; **speech-to-text (STT)** and **text-to-speech (TTS)** models convert between audio and text; **image generation models** create images from text prompts.
*Why:* These categories map directly onto Projects 4 and 5 — knowing them now means later steps aren't introducing brand-new vocabulary mid-project.

**Step 4 — Research 2–3 models per category.**
For vision-language, speech, and image generation, note at least two available model options and one key differentiator each (cost, quality, latency, or licensing).
*Why:* A survey with only one option per category isn't really a comparison — you need alternatives to make an informed choice later.

**Step 5 — Note input/output formats for each.**
For each model, write down what format it expects as input (e.g., base64-encoded image, raw audio file) and what it returns.
*Why:* Mismatched format expectations are one of the most common early bugs in multimodal projects — knowing this upfront saves debugging time later.

**Step 6 — Note context window and size limits.**
Learn: multimodal models often have limits on image resolution, audio length, or combined token count that differ from pure text models.
*Why:* Hitting an undocumented size limit mid-project (Project 4 or 5) is a frustrating surprise if you didn't know the constraint existed.

**Step 7 — Write a comparison summary.**
```bash
nano comparison_summary.md
```
For each modality combination (text+image, speech+text, text+image-generation), note your top pick and why.
*Why:* This becomes your default toolkit for the rest of the course — you'll refer back to it instead of re-researching for every project.

### Final Project Structure
```text
multimodal_survey_project/
│
├── model_survey.md
├── comparison_summary.md
```

### What You Learned
✅ The four core modalities and what "multimodal" precisely means
✅ Model categories: VLMs, STT, TTS, image generation
✅ Comparing models within each category
✅ Input/output format requirements per model
✅ Context window and size limits for multimodal models
✅ Producing a reference comparison for future projects

### Portfolio Project
**Multimodal Model Landscape Survey** — Researched and compared vision-language, speech, and image-generation models across cost, quality, format requirements, and size limits.
**Skills:** Technical Research, Model Evaluation, Multimodal AI, Technical Writing.

**Deliverable:** A model survey and comparison summary covering at least three multimodal model categories.

---

## Project 2 (Module 2): Build a Script That Processes Image and Text Inputs

**Goal:** Handle two modalities at once for the first time — the foundational mechanic behind every later project.

### Why This Project Matters

Before building anything sophisticated, you need to prove you can get an image and a piece of text into the same request and get a sensible response back. This project is that proof, kept deliberately simple.

**Step 1 — Set up a project folder.**
```bash
mkdir image_text_project
cd image_text_project
pip install --break-system-packages requests pillow
```
*Why:* Pillow (`PIL`) is the standard Python library for basic image handling — you'll need it to prepare images for API calls.

**Step 2 — Load and inspect an image.**
```bash
nano process.py
```
```python
from PIL import Image
img = Image.open("test_image.jpg")
print(img.size, img.format)
```
Learn: `.size` gives width and height in pixels; `.format` gives the file type (JPEG, PNG).
*Why:* Multimodal APIs often have resolution or format requirements — checking this first avoids failed requests later.

**Step 3 — Encode the image for API use.**
```python
import base64

with open("test_image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")
```
Learn: **base64 encoding** converts binary image data into a text string that can be safely included in a JSON API request.
*Why:* Most vision-language APIs expect images this way — this is the standard mechanic behind nearly every image-input API call.

**Step 4 — Send an image + text request.**
```python
import requests

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={"x-api-key": "YOUR_KEY", "content-type": "application/json"},
    json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 300,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data}},
                {"type": "text", "text": "Describe what's in this image."}
            ]
        }]
    }
)
print(response.json())
```
Learn: the **content array** lets a single message mix multiple content types (image and text blocks) instead of just plain text.
*Why:* This structure — an array of typed content blocks — is the pattern nearly every multimodal API uses; once you understand it here, it transfers directly.

**Step 5 — Test with different images and questions.**
Run the script against 3–4 different images, asking different questions each time (description, counting objects, reading text in the image).
*Why:* Varying both the image and the question reveals the model's actual range of capability, not just one lucky result.

**Step 6 — Handle image size limits.**
```python
img.thumbnail((1024, 1024))
img.save("resized_image.jpg")
```
Learn: **thumbnailing** resizes an image down while preserving aspect ratio.
*Why:* Sending an unnecessarily huge image wastes bandwidth and can hit API size limits — resizing before sending is standard practice.

**Step 7 — Wrap the logic in a reusable function.**
```python
def describe_image(image_path, question):
    # encode, build request, call API, return response text
    ...
```
*Why:* Every later project in this course builds features on top of this exact mechanic — wrapping it now makes it reusable instead of rewritten each time.

### Final Project Structure
```text
image_text_project/
│
├── process.py
├── test_image.jpg
```

### What You Learned
✅ Loading and inspecting images with Pillow
✅ Base64 encoding images for API requests
✅ Building multimodal content arrays (image + text)
✅ Testing across varied images and questions
✅ Resizing images to respect size limits
✅ Wrapping multimodal calls in a reusable function

### Portfolio Project
**Image + Text Processing Script** — Built a reusable Python function that sends images alongside text prompts to a vision-language model API, tested across varied images and questions.
**Skills:** Python, Multimodal APIs, Image Processing, Vision-Language Models.

**Deliverable:** A working script that processes image + text input and returns model responses, tested on multiple images.

---

## Project 3 (Module 3): Extract Features from an Image and an Audio Clip

**Goal:** Go one level deeper into each modality — understanding what's actually being represented under the hood before combining them.

### Why This Project Matters

Project 2 treated the image as a black box you sent to an API. This project opens that box slightly — extracting concrete features from both image and audio — building the intuition needed for Project 4's more advanced architecture concepts.

**Step 1 — Set up a project folder.**
```bash
mkdir feature_extraction_project
cd feature_extraction_project
pip install --break-system-packages pillow numpy librosa
```
*Why:* `librosa` is the standard Python library for audio analysis — you'll need it for the audio half of this project.

**Step 2 — Extract basic image features.**
```bash
nano extract_features.py
```
```python
from PIL import Image
import numpy as np

img = Image.open("test_image.jpg").convert("RGB")
img_array = np.array(img)
print("Shape:", img_array.shape)
print("Mean color:", img_array.mean(axis=(0,1)))
```
Learn: an image is really just a **numpy array** of pixel values — `shape` gives (height, width, color channels); mean color gives the average red/green/blue intensity.
*Why:* Seeing an image as numbers, not just a picture, is what makes it possible to understand how models process images mathematically.

**Step 3 — Extract a basic image histogram.**
```python
import matplotlib.pyplot as plt
plt.hist(img_array.flatten(), bins=50)
plt.savefig("brightness_histogram.png")
```
Learn: a **histogram** here shows the distribution of pixel brightness values across the image.
*Why:* This is a simple, human-inspectable "feature" of an image — a preview of the far more abstract features a real vision model extracts internally.

**Step 4 — Load and inspect an audio clip.**
```python
import librosa
audio, sample_rate = librosa.load("test_audio.wav")
print("Duration:", len(audio) / sample_rate, "seconds")
print("Sample rate:", sample_rate)
```
Learn: **sample rate** is how many times per second the audio signal was measured; audio is fundamentally a sequence of numbers over time, just like an image is a grid of numbers over space.
*Why:* Understanding audio as numeric data (not a mysterious waveform) demystifies what speech models are actually processing.

**Step 5 — Generate a spectrogram.**
```python
spectrogram = librosa.feature.melspectrogram(y=audio, sr=sample_rate)
librosa.display.specshow(librosa.power_to_db(spectrogram))
plt.savefig("spectrogram.png")
```
Learn: a **spectrogram** converts audio from a waveform (amplitude over time) into a visual representation of frequency content over time.
*Why:* Most audio AI models don't actually process raw waveforms directly — they process something much closer to a spectrogram, so seeing this conversion matters.

**Step 6 — Extract a simple audio feature.**
```python
tempo, _ = librosa.beat.beat_track(y=audio, sr=sample_rate)
print("Estimated tempo:", tempo)
```
*Why:* This is a second concrete, human-interpretable "feature" extracted from raw audio — reinforcing that audio, like images, decomposes into measurable properties.

**Step 7 — Document what you extracted and why it matters.**
```bash
nano feature_notes.md
```
Write 3–4 sentences connecting these hand-extracted features to what a real multimodal model does automatically and at much greater scale.
*Why:* This reflection is what turns a mechanical exercise into actual understanding you'll carry into Project 4's architecture discussion.

### Final Project Structure
```text
feature_extraction_project/
│
├── extract_features.py
├── test_image.jpg
├── test_audio.wav
├── brightness_histogram.png
├── spectrogram.png
├── feature_notes.md
```

### What You Learned
✅ Representing images as numpy arrays
✅ Extracting basic image features (color, brightness distribution)
✅ Representing audio as a numeric time series
✅ Generating and interpreting spectrograms
✅ Extracting basic audio features (tempo)
✅ Connecting hand-extracted features to model-internal processing

### Portfolio Project
**Image & Audio Feature Extraction** — Extracted and visualized basic features from both image (color, brightness) and audio (spectrogram, tempo) data using Python, connecting the exercise to how multimodal models process raw input.
**Skills:** Python, NumPy, Librosa, Signal Processing Fundamentals, Multimodal AI.

**Deliverable:** Feature extraction script with visualized outputs (histogram, spectrogram) and written notes on both modalities.

---

## Project 4 (Module 4): Build a Simple Image Captioning Demo

**Goal:** Combine vision and language in one model output — your first true multimodal *generation* task, not just multimodal *input*.

### Why This Project Matters

Projects 2 and 3 handled modalities as inputs. This project produces multimodal-informed output — text generated specifically because of what's in an image — which is the core pattern behind vision-language applications.

**Step 1 — Set up a project folder.**
```bash
mkdir image_captioning_project
cd image_captioning_project
```
Copy in `process.py` from Project 2.
*Why:* This project directly extends Project 2's image+text mechanic — reuse it rather than rebuilding.

**Step 2 — Learn how vision-language models connect the two modalities.**
Learn: a **vision transformer** encodes an image into a numeric representation; **text-image embedding alignment** means the model has learned to relate that image representation to relevant words and concepts.
*Why:* Understanding that the model has learned a shared representation space for both modalities explains why it can generate coherent language *about* an image, not just describe pixels mechanically.

**Step 3 — Write a basic captioning function.**
```bash
nano caption.py
```
```python
def generate_caption(image_path):
    # reuse Project 2's describe_image logic with a captioning-specific prompt
    return describe_image(image_path, "Write a single, concise caption for this image.")
```
*Why:* A focused prompt ("single, concise caption") produces more consistent output than a generic "describe this image" request.

**Step 4 — Test captioning across varied images.**
Run captioning on 5 different images: a simple object, a complex scene, a photo with text in it, an abstract image, and one with people.
*Why:* Testing variety reveals where captioning is strong (simple objects) and where it struggles (dense scenes, ambiguous images) — useful for setting expectations later.

**Step 5 — Add caption style control.**
```python
def generate_caption(image_path, style="concise"):
    prompts = {
        "concise": "Write a single, concise caption for this image.",
        "detailed": "Write a detailed, descriptive caption for this image.",
        "alt_text": "Write accessible alt-text for this image, suitable for a screen reader.",
    }
    return describe_image(image_path, prompts[style])
```
Learn: **alt-text** is a specific caption style written for accessibility — describing an image for someone who can't see it.
*Why:* Real captioning use cases vary widely — a product needing accessible alt-text has different requirements than one needing a punchy social media caption.

**Step 6 — Evaluate caption quality manually.**
```bash
nano caption_evaluation.md
```
For each test image, rate the caption 1–5 on accuracy and usefulness, noting any errors (misidentified objects, hallucinated details).
*Why:* Vision-language models can hallucinate details that aren't actually in the image — manual review is how you catch this before trusting the output.

**Step 7 — Build a simple batch captioning script.**
```python
import os

for filename in os.listdir("images/"):
    caption = generate_caption(f"images/{filename}")
    print(f"{filename}: {caption}")
```
*Why:* Captioning one image at a time doesn't scale — a batch script is what a real captioning feature would actually need.

### Final Project Structure
```text
image_captioning_project/
│
├── caption.py
├── images/
├── caption_evaluation.md
```

### What You Learned
✅ How vision transformers and text-image alignment enable captioning
✅ Writing focused prompts for consistent caption generation
✅ Testing across varied and challenging image types
✅ Supporting multiple caption styles (concise, detailed, alt-text)
✅ Manually evaluating caption accuracy and catching hallucinations
✅ Batch-processing captions across multiple images

### Portfolio Project
**Image Captioning Demo** — Built a multi-style image captioning tool (concise, detailed, alt-text) using a vision-language model, with manual quality evaluation across varied test images.
**Skills:** Vision-Language Models, Prompt Engineering, Python, Multimodal AI, Accessibility.

**Deliverable:** A batch image captioning script supporting multiple caption styles, with an evaluation of caption quality.

---

## Project 5 (Module 5): Build an App That Takes an Image and Answers Questions About It

**Goal:** Build a full interactive app around a vision-language model — moving from a script to something a real user could actually use.

### Why This Project Matters

Project 4 generated one caption per image. Real products let users ask their own questions. This project builds that interactivity, plus the practical concerns (speech input/output, image generation) that round out a full multimodal application.

**Step 1 — Set up a project folder.**
```bash
mkdir image_qa_app_project
cd image_qa_app_project
pip install --break-system-packages fastapi uvicorn python-multipart
```
*Why:* FastAPI with `python-multipart` lets you build an API that accepts file uploads (images), not just JSON text.

**Step 2 — Build an image upload endpoint.**
```bash
nano app.py
```
```python
from fastapi import FastAPI, UploadFile, Form
app = FastAPI()

@app.post("/ask")
async def ask_about_image(image: UploadFile, question: str = Form(...)):
    image_bytes = await image.read()
    # encode image_bytes to base64, send with `question` to the vision-language model
    return {"answer": answer}
```
Learn: `UploadFile` handles binary file uploads; `Form` handles accompanying text fields in the same request.
*Why:* Real apps need to accept both an image file and a text question in one request — this is the standard FastAPI pattern for that.

**Step 3 — Wire in your Project 2/4 vision-language logic.**
Connect the endpoint to your existing `describe_image`-style function, passing the uploaded image and the user's specific question.
*Why:* Reusing validated logic from earlier projects means this app is an integration, not a rebuild.

**Step 4 — Test with curl.**
```bash
curl -X POST http://localhost:8000/ask -F "image=@test_image.jpg" -F "question=What color is the car?"
```
*Why:* Testing the actual HTTP interface (not just calling your Python function directly) confirms the app works the way a real client would use it.

**Step 5 — Add speech-to-text for voice questions.**
```python
@app.post("/ask_voice")
async def ask_with_voice(image: UploadFile, audio: UploadFile):
    audio_bytes = await audio.read()
    question = transcribe_audio(audio_bytes)  # call an STT model
    # then proceed as in /ask
```
Learn: **speech-to-text (STT)** converts spoken audio into text the rest of your pipeline can use.
*Why:* Combining three modalities (image + spoken question + generated text answer) in one flow is a realistic multimodal product pattern, not just a toy exercise.

**Step 6 — Add text-to-speech for spoken answers.**
```python
def speak_answer(answer_text):
    audio_response = call_tts_model(answer_text)
    return audio_response
```
Learn: **text-to-speech (TTS)** converts generated text back into audio.
*Why:* A fully voice-driven experience (ask by voice, hear the answer) is common in accessibility and hands-free product contexts.

**Step 7 — Add basic error handling for bad uploads.**
```python
if image.content_type not in ["image/jpeg", "image/png"]:
    return {"error": "Unsupported image format"}
```
*Why:* Real users will upload the wrong file type eventually — handling it gracefully instead of crashing is a baseline expectation.

**Step 8 — Test the full multimodal flow end-to-end.**
Upload an image, ask a question by voice, and confirm you get back a sensible spoken (or text) answer.
*Why:* This end-to-end test is the real proof the app works as a connected system, not just as isolated working pieces.

### Final Project Structure
```text
image_qa_app_project/
│
├── app.py
├── test_image.jpg
├── test_audio.wav
```

### What You Learned
✅ Building a FastAPI endpoint that accepts image uploads
✅ Combining image and text question input in one request
✅ Adding speech-to-text for voice-based questions
✅ Adding text-to-speech for spoken answers
✅ Handling unsupported upload formats gracefully
✅ Testing a full, multi-modality flow end-to-end

### Portfolio Project
**Visual Q&A Application** — Built a FastAPI application that answers user questions about uploaded images, extended with speech-to-text and text-to-speech for a fully voice-driven interaction.
**Skills:** FastAPI, Vision-Language Models, Speech AI, Python, Multimodal Application Development.

**Deliverable:** A working image Q&A app supporting both text and voice input/output, tested end-to-end.

---

## Project 6 (Module 6): Build a Multimodal Document Search Tool

**Goal:** Extend retrieval to work across modalities — finding relevant content by meaning, whether it's stored as text or images.

### Why This Project Matters

Most retrieval systems (like standard RAG) only handle text. Real document collections often mix text and images (scanned pages, diagrams, screenshots) — this project builds the retrieval pipeline that handles both.

**Step 1 — Set up a project folder.**
```bash
mkdir multimodal_search_project
cd multimodal_search_project
pip install --break-system-packages chromadb sentence-transformers pillow
```
*Why:* Same vector database tooling as text-only RAG, but you'll be embedding both text and images into a shared search space.

**Step 2 — Gather a mixed document set.**
Collect 10–15 items: some plain text documents, some images (diagrams, screenshots, photos with visible text).
*Why:* A mixed set is what actually tests whether your retrieval handles both modalities, not just one.

**Step 3 — Learn multimodal embeddings.**
Learn: a **multimodal embedding model** maps both text and images into the *same* numeric embedding space, so a text query can be compared directly against image embeddings.
*Why:* Without this shared space, you couldn't compare "a query about cats" against "a photo of a cat" — they'd be different, incompatible representations.

**Step 4 — Generate embeddings for text documents.**
```bash
nano build_search.py
```
```python
from sentence_transformers import SentenceTransformer
text_model = SentenceTransformer("all-MiniLM-L6-v2")
text_embeddings = text_model.encode(text_documents)
```
*Why:* This reuses the same text embedding approach from a standard RAG pipeline — the multimodal part comes next.

**Step 5 — Generate embeddings for images using a captioning bridge.**
```python
def embed_image_via_caption(image_path):
    caption = generate_caption(image_path)  # reuse Project 4's captioning
    return text_model.encode([caption])[0]
```
Learn: a simpler alternative to a true multimodal embedding model is **caption-then-embed** — describe the image in text, then embed that description using your existing text embedding model.
*Why:* This bridge approach is a practical, accessible technique when a full multimodal embedding model isn't available — and it directly reuses Project 4's work.

**Step 6 — Store both types in the same vector database.**
```python
import chromadb
client = chromadb.Client()
collection = client.create_collection("mixed_documents")

collection.add(
    documents=text_documents + image_captions,
    embeddings=(text_embeddings.tolist() + image_embeddings.tolist()),
    ids=[f"item_{i}" for i in range(len(text_documents) + len(image_captions))],
    metadatas=[{"type": "text"} for _ in text_documents] + [{"type": "image"} for _ in image_captions]
)
```
Learn: **metadata** tags let you track which items are text vs. image, so results can be handled differently (e.g., displaying the actual image, not just its caption).
*Why:* Without metadata, a search result that's "really" an image would just look like more plain text — you'd lose the ability to show the original image to a user.

**Step 7 — Query across both modalities.**
```python
query = "diagram showing system architecture"
query_embedding = text_model.encode([query])
results = collection.query(query_embeddings=query_embedding.tolist(), n_results=5)
print(results["documents"], results["metadatas"])
```
*Why:* A single text query returning a mix of relevant text passages and relevant images is the actual proof this system works across modalities.

**Step 8 — Evaluate retrieval quality across both types.**
Try 5 queries designed to match text content and 5 designed to match image content, and manually judge relevance.
*Why:* It's common for one modality to retrieve well while the other underperforms — testing both separately catches this imbalance.

### Final Project Structure
```text
multimodal_search_project/
│
├── documents/
├── images/
├── build_search.py
├── retrieval_evaluation.md
```

### What You Learned
✅ How multimodal embeddings enable cross-modality comparison
✅ The caption-then-embed bridging technique
✅ Storing mixed text/image content in one vector database
✅ Using metadata to track content type for downstream display
✅ Querying across both modalities with a single text query
✅ Evaluating retrieval quality separately per modality

### Portfolio Project
**Multimodal Document Search Tool** — Built a retrieval system combining text and image content in a single vector database using a caption-based embedding bridge, with retrieval quality evaluated across both modalities.
**Skills:** Vector Databases, Multimodal Embeddings, RAG, Python, Multimodal AI.

**Deliverable:** A working multimodal search tool, tested with queries targeting both text and image content.

---

## Project 7 (Module 7): Evaluate a Multimodal System on a Test Set

**Goal:** Test what you've built for quality and bias — the discipline that separates a demo from something you'd trust in production.

### Why This Project Matters

Every prior project produced something that "seemed to work" on a handful of manual tests. This project replaces that impression with a structured, repeatable evaluation — including checking for failure patterns you might not think to look for casually.

**Step 1 — Set up a project folder.**
```bash
mkdir multimodal_evaluation_project
cd multimodal_evaluation_project
```
*Why:* Evaluation artifacts (test sets, scoring results) should be reusable every time you improve the underlying system.

**Step 2 — Choose which system to evaluate.**
Pick your Project 4 captioning tool, Project 5 Q&A app, or Project 6 search tool.
*Why:* A focused evaluation on one system is more useful than a shallow pass across all three — depth matters more than breadth here.

**Step 3 — Build a test set.**
```bash
nano test_set.md
```
Collect 15–20 diverse test cases: varied image types (simple, complex, text-containing, low-quality), varied questions or queries.
*Why:* A test set skewed toward "easy" cases will make your system look better than it actually performs in the real world.

**Step 4 — Define evaluation metrics.**
Learn: for generative multimodal output, common metrics include **accuracy** (is the answer factually correct), **relevance** (does it address the actual question), and **hallucination rate** (does it describe things that aren't actually present).
*Why:* Multimodal systems hallucinate in a specific way — describing objects, text, or details that simply aren't in the image — which is worth measuring separately from general accuracy.

**Step 5 — Score each test case.**
```bash
nano evaluation_results.md
```
Run each test case through the system and score it 1–5 on each metric from Step 4.
*Why:* Systematic scoring across a full test set is what turns "it felt pretty good" into an actual, defensible quality number.

**Step 6 — Check for failure modes by category.**
Learn: common multimodal failure modes include struggling with **low-quality or low-resolution images**, **dense text within images** (OCR-like tasks), and **unusual or out-of-distribution content**.
*Why:* Understanding *categories* of failure (not just a raw score) tells you what to warn users about or improve next.

**Step 7 — Check for bias across image content.**
Test with images depicting a range of people, settings, and contexts, and note any systematic differences in caption quality, tone, or accuracy.
*Why:* Multimodal models can carry biases from training data (misdescribing certain demographics or contexts more often) — checking for this is a basic responsible-AI practice, not an optional extra.

**Step 8 — Write the evaluation report.**
```bash
nano evaluation_report.md
```
Structure: Test set description → Metrics → Scores → Failure mode analysis → Bias check findings → Recommendations for improvement.
*Why:* This report is what makes the evaluation actionable — a list of scores without a "what to do next" section doesn't actually improve the system.

### Final Project Structure
```text
multimodal_evaluation_project/
│
├── test_set.md
├── evaluation_results.md
├── evaluation_report.md
```

### What You Learned
✅ Building a diverse, realistic test set
✅ Defining accuracy, relevance, and hallucination-rate metrics
✅ Systematically scoring a multimodal system
✅ Identifying categorized failure modes
✅ Checking for bias across varied image content
✅ Writing an actionable evaluation report

### Portfolio Project
**Multimodal System Evaluation** — Built a diverse test set and evaluation rubric for a multimodal system, measuring accuracy, relevance, and hallucination rate, with a dedicated bias check across varied content.
**Skills:** AI Evaluation, Bias Testing, Quality Assurance, Multimodal AI, Responsible AI.

**Deliverable:** A structured evaluation report with scores, failure mode analysis, and bias findings for a multimodal system.

---

## Final Capstone: Build a Multimodal Assistant

**Goal:** Combine every project above into one complete assistant that accepts text, image, and audio input and returns a relevant response — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes on your resume and in interviews. It's not new material — it's proof you can combine every modality-specific skill from this course into one coherent, evaluated system.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your code from Projects 2–7.
*Why:* The capstone isn't written from scratch — it's assembled from work you've already validated.

**Step 2 — Start from your Project 1 model survey.**
Confirm your final model choices for vision-language, speech, and (if used) image generation.
*Why:* The capstone is the moment your survey stops being reference material and becomes an actual, committed architecture.

**Step 3 — Build the core assistant endpoint.**
```bash
nano assistant.py
```
```python
from fastapi import FastAPI, UploadFile, Form
app = FastAPI()

@app.post("/chat")
async def multimodal_chat(text: str = Form(None), image: UploadFile = None, audio: UploadFile = None):
    # route to the right combination of Project 2/4/5/6 logic depending on what was provided
    ...
```
*Why:* A single flexible endpoint that accepts any combination of modalities is what makes this a true multimodal assistant, not three separate disconnected tools.

**Step 4 — Wire in image understanding (Projects 2 & 4).**
If an image is provided, run it through your captioning/Q&A logic.

**Step 5 — Wire in speech input and output (Project 5).**
If audio is provided, transcribe it; if the client requests spoken responses, synthesize the answer.

**Step 6 — Wire in document retrieval (Project 6).**
If the user's question could be answered from your indexed document set, retrieve relevant context before generating the final response.

**Step 7 — Run your Project 7 evaluation against the full assistant.**
Reuse your test set and metrics, but now test the complete, integrated system rather than one isolated piece.
*Why:* Integration often introduces new failure modes that didn't exist when each piece was tested separately — this is the real test.

**Step 8 — Write the final capstone report.**
```bash
nano capstone_report.md
```
Combine your Project 1 model choices, system architecture, evaluation results, and known limitations into one document.
*Why:* This document is what you'd hand to a teammate or future employer to prove the assistant is real, tested, and understood — not just a folder of separate scripts.

### Final Project Structure
```text
capstone_project/
│
├── model_survey.md
├── assistant.py
├── test_set.md
├── evaluation_results.md
├── capstone_report.md
```

### What You Learned
✅ Combining image, audio, and text handling into one flexible endpoint
✅ Wiring in retrieval-augmented responses across modalities
✅ Re-running evaluation against a fully integrated system
✅ Identifying integration-specific failure modes
✅ Documenting a complete multimodal assistant for a real audience

### Portfolio Project
**Multimodal AI Assistant (Capstone)** — Built a complete assistant accepting text, image, and audio input, combining vision-language understanding, speech processing, and multimodal document retrieval, with a full evaluation report.
**Skills:** Multimodal AI, FastAPI, Vision-Language Models, Speech AI, RAG, AI Evaluation.

**Deliverable:** A complete, integrated multimodal assistant, plus a written capstone report connecting it back to every project that built it.
