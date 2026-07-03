# AI Infrastructure Engineer — Hands-On Project Tutorials

This document turns every project in the **AI Infrastructure Engineer Foundations Course** into a step-by-step, hands-on tutorial. Instead of learning a term and then doing a project, you learn each term *at the moment you need it* — while building the thing. Every step explains what you're doing, what the term means, how to actually do it, and why it matters.

Follow the projects in order. Each one hands off a skill or artifact to the next, ending in the Final Capstone.

---

## Project 1 (Module 1): Map the Infrastructure Stack for an AI System

**Goal:** Before deploying anything, learn to see an AI system as a stack of layers — so every later project has a place to plug into.

### Why This Project Matters

Every project after this one builds one piece of real infrastructure. If you don't first understand the layers those pieces belong to, you'll be memorizing disconnected commands instead of building a system. This project is entirely planning and vocabulary — no code — because engineers who skip planning end up building the wrong thing well.

**Step 1 — Set up a project folder for your planning docs.**
```bash
mkdir infra_stack_project
cd infra_stack_project
```
*Why:* Even planning artifacts (notes, diagrams) deserve a home — this folder is where Steps 1–8 will live, and it's the first entry in your portfolio for this course.

**Step 2 — Define what the system needs to do.**
Write one sentence in a file `requirements.txt` (or `requirements.md`): what model are you serving, and who's using it? Example: "Serve an image-classification model to a mobile app, expecting 50 requests per second."
*Why:* Infrastructure decisions (how much compute, how fast it must respond) all flow from this. Skipping this step is the #1 reason infrastructure gets over- or under-built.

**Step 3 — Learn the two infrastructure modes: training vs. inference.**
*Training* is the (usually one-time or periodic) process of teaching a model from data — heavy, GPU-hungry, can take hours. *Inference* is running the trained model to get predictions — lighter per-request, but needs to happen fast and often.
*Why:* These two modes need completely different infrastructure. This course focuses on inference infrastructure, since that's what most AI Infrastructure Engineers manage day to day.

**Step 4 — List the six core layers of an AI infrastructure stack.**
- **Compute** — the machines (CPU/GPU) that run your code.
- **Storage** — where your model files and data live.
- **Networking** — how requests reach your service.
- **Containerization/Orchestration** — how your app is packaged and kept running.
- **Serving** — the layer that turns "a model file" into "an API you can call."
- **Monitoring/Observability** — how you know it's working.
*Why:* Every project in this course builds exactly one of these layers. Naming them now means every later project has a labeled box to go in.

**Step 5 — Choose compute type for your example system.**
Learn the difference: **CPU** (general-purpose, cheap, fine for small/light models), **GPU** (parallel processing, needed for large deep learning models), **hardware accelerator** (any specialized chip — GPU, TPU — built for ML math).
*Why:* Picking the wrong compute type is the most common cost mistake in AI infrastructure — GPUs are 5-10x more expensive than CPUs and are wasted on models that don't need them.

**Step 6 — Choose a storage approach.**
Learn: **object storage** (e.g., a bucket-style store for large files like model weights), **model registry** (a versioned catalog of trained models, so you always know which version is live).
*Why:* Without a registry, "which model is actually running in production" becomes a guessing game.

**Step 7 — Choose a networking approach.**
Learn: **API gateway** (a front door that routes external requests to the right internal service), **load balancer** (spreads incoming traffic across multiple copies of your service so no single machine gets overwhelmed).
*Why:* These two concepts show up in almost every later project — you're pre-loading vocabulary you'll use hands-on soon.

**Step 8 — Choose an orchestration approach.**
Learn: **container** (a lightweight, self-contained package of your app plus everything it needs to run), **orchestrator** (a system, like Kubernetes, that starts, stops, and scales containers automatically).
*Why:* This is the layer Projects 4 and 6 will actually build.

**Step 9 — Draw the stack as a simple diagram.**
Sketch six labeled boxes (Compute, Storage, Networking, Orchestration, Serving, Monitoring) stacked vertically, with arrows showing a request flowing in from the top and a prediction flowing back out. Save it as `stack_diagram.png` (or `.txt` if hand-drawn as ASCII) in your project folder.
*Why:* This diagram is your map for the rest of the course — each project fills in one box with something real.

### Final Project Structure
```text
infra_stack_project/
│
├── requirements.md
├── stack_diagram.png
```

### What You Learned
✅ Training vs. inference infrastructure
✅ The six core layers of an AI infrastructure stack
✅ Compute type tradeoffs (CPU vs. GPU vs. accelerator)
✅ Storage concepts (object storage, model registry)
✅ Networking concepts (API gateway, load balancer)
✅ Orchestration concepts (container, orchestrator)
✅ Turning requirements into an architecture diagram

### Portfolio Project
**AI System Infrastructure Stack Map** — Translated a business requirement into a labeled, six-layer infrastructure architecture diagram covering compute, storage, networking, orchestration, serving, and monitoring.
**Skills:** Systems Thinking, Cloud Architecture Fundamentals, Technical Documentation, AI Infrastructure.

**Deliverable:** A one-page infrastructure stack map for your example AI system, labeled with your choices from Steps 5–8.

---

## Project 2 (Module 2): Write Shell Scripts to Monitor System Resources

**Goal:** Learn to see what a machine is doing under the hood — the skill every later deployment and monitoring project depends on.

### Why This Project Matters

As an AI Infrastructure Engineer, you'll constantly need to answer questions like: *Is the server healthy? Is memory about to run out? Is the GPU overloaded? Why did the model server crash last night?* Instead of guessing, you build tools that tell you. That's what this project does — you'll build a real monitoring toolkit similar to what engineers use to keep production AI servers running.

Terminal, commands, and scripts — the tools this project is built on — matter because most production AI servers have no screen, no mouse, and no icons. Everything — starting a model server, deploying an app, checking GPU load, restarting a crashed process — happens through typed commands. Learning to work this way isn't optional for this role; it's the default working environment.

**Step 1 — Open a terminal and confirm you're in a shell.**
Learn: a **shell** is a program that takes typed commands and runs them on the machine (e.g., `bash`). A **command** is a single instruction to the operating system (e.g., "show me my files," "tell me where I am"). A **script** is a saved file of commands the computer runs automatically, instead of you typing them one by one every time.
*Why:* Cloud servers almost never have a screen — the terminal is the only way in, and scripts are what turn a five-minute manual routine into a two-second automated one.

**Step 2 — Set up a project folder.**
```bash
pwd
mkdir monitoring_project
cd monitoring_project
pwd
```
Learn: `pwd` (print working directory) shows where you are; `mkdir` creates a folder; `cd` moves into it.
*Why:* Keeping every script for this project in one folder mirrors how real projects are organized — and makes the folder easy to hand off, back up, or deploy later.

**Step 3 — Write and run your first script.**
```bash
nano hello.sh
```
Paste:
```bash
#!/bin/bash
echo "Hello AI Infrastructure Engineer!"
```
Save, then make it runnable and run it:
```bash
chmod +x hello.sh
./hello.sh
```
Learn: `#!/bin/bash` is a **shebang** — it tells Linux which program should execute this file. `chmod +x` grants the file **execute permission**, without which Linux refuses to run it as a program.
*Why:* Getting one trivial script to run end-to-end (write → permission → execute) before building anything complex means any later errors are about your monitoring logic, not this basic mechanics.

**Step 4 — Build a standalone CPU monitor.**
```bash
nano cpu_monitor.sh
```
```bash
#!/bin/bash
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
echo "CPU Usage: $CPU%"
```
```bash
chmod +x cpu_monitor.sh
./cpu_monitor.sh
```
Learn: **CPU utilization** is the percentage of processing capacity currently in use; `top -bn1` takes a single, non-interactive snapshot instead of the live-updating view.
*Why:* High, sustained CPU usage is often the first sign a service needs more resources or has a bug (e.g., an infinite loop).

**Step 5 — Build a standalone memory monitor.**
```bash
nano memory_monitor.sh
```
```bash
#!/bin/bash
MEMORY=$(free | awk '/Mem:/ {printf("%.2f"), $3/$2 * 100}')
echo "Memory Usage: $MEMORY%"
```
```bash
chmod +x memory_monitor.sh
./memory_monitor.sh
```
Learn: **RAM** is short-term working memory; when it fills up, the system slows dramatically or crashes the process (an **out-of-memory / OOM error**).
*Why:* Model-serving processes fail from running out of memory more often than from CPU limits alone — one of the most common production incidents in ML infrastructure.

**Step 6 — Build a standalone disk monitor.**
```bash
nano disk_monitor.sh
```
```bash
#!/bin/bash
DISK=$(df / | tail -1 | awk '{print $5}')
echo "Disk Usage: $DISK"
```
```bash
chmod +x disk_monitor.sh
./disk_monitor.sh
```
Learn: this reads how much space is used vs. free on the root partition.
*Why:* Full disks silently break logging, model downloads, and temp file writes — a classic "it worked yesterday" bug.

**Step 7 — Check running processes.**
```bash
ps aux
ps -eo pid,comm,%cpu --sort=-%cpu | head
```
Learn: `ps aux` lists every running **process**; sorting by `%cpu` shows which specific program is responsible for high usage.
*Why:* Project 4's step tells you *that* CPU is high — this tells you *which process* is causing it, which is what you actually need to fix the problem.

**Step 8 — Build a standalone network monitor.**
```bash
nano network_monitor.sh
```
```bash
#!/bin/bash
NETWORK=$(ss -tulwn | wc -l)
echo "Network Connections: $NETWORK"
```
```bash
chmod +x network_monitor.sh
./network_monitor.sh
```
Learn: `ss -tulwn` lists which **ports** (numbered network doors) are open and listening for traffic.
*Why:* You'll use this exact idea later to confirm your API is actually listening where you expect it to.

**Step 9 — Build a standalone GPU monitor (if available).**
```bash
nano gpu_monitor.sh
```
```bash
#!/bin/bash
nvidia-smi
```
```bash
chmod +x gpu_monitor.sh
./gpu_monitor.sh
```
Learn: `nvidia-smi` reports GPU utilization, memory, temperature, and which processes are using the GPU.
*Why:* GPUs are the most expensive part of most AI infrastructure — an idle or overloaded GPU is one of the fastest ways to waste money or slow down inference, so it deserves its own check.

**Step 10 — Combine everything into one dashboard script.**
```bash
nano monitor.sh
```
```bash
#!/bin/bash
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
MEMORY=$(free | awk '/Mem:/ {printf("%.2f"), $3/$2 * 100}')
DISK=$(df / | tail -1 | awk '{print $5}')
NETWORK=$(ss -tulwn | wc -l)

echo "=========================="
echo "AI SERVER MONITOR"
echo "=========================="
echo "CPU Usage: $CPU%"
echo "Memory Usage: $MEMORY%"
echo "Disk Usage: $DISK"
echo "Network Connections: $NETWORK"
echo "=========================="
```
```bash
chmod +x monitor.sh
./monitor.sh
```
Learn: bundling checks into one script turns five separate manual routines into a single reusable tool.
*Why:* This is exactly the pattern real monitoring dashboards use — many individual checks, one combined view.

**Step 11 — Add a threshold alert.**
```bash
CPU_VALUE=$(echo $CPU | cut -d'%' -f1)
if (( $(echo "$CPU_VALUE > 80" | bc -l) )); then
  echo "WARNING: CPU usage above 80%"
fi
```
Learn: a **threshold alert** fires when a metric crosses a defined line — the simplest form of monitoring.
*Why:* This is a hand-built preview of what Project 7's real alerting system will do automatically.

**Step 12 — Add a live, auto-refreshing dashboard.**
```bash
watch -n 1 ./monitor.sh
```
Learn: `watch -n 1` re-runs a command every 1 second and redraws the terminal.
*Why:* A one-time snapshot can miss a spike — watching it live is how engineers catch problems as they happen.

**Step 13 — Add logging.**
```bash
./monitor.sh >> monitor.log
cat monitor.log
```
Learn: `>>` **appends** command output to a file instead of just printing it to the screen.
*Why:* Live output disappears the moment you close the terminal — a log file is what lets you look back at what happened an hour (or a week) ago.

**Step 14 — Schedule it to run automatically.**
```bash
crontab -e
```
Add:
```bash
*/5 * * * * /path/monitoring_project/monitor.sh >> /path/monitoring_project/monitor.log
```
Learn: **cron** is Linux's built-in scheduler; this line runs `monitor.sh` every 5 minutes and appends the result to your log.
*Why:* Monitoring only matters if it happens continuously, not just when you remember to check.

### Final Project Structure
```text
monitoring_project/
│
├── hello.sh
├── cpu_monitor.sh
├── memory_monitor.sh
├── disk_monitor.sh
├── network_monitor.sh
├── gpu_monitor.sh
├── monitor.sh
├── monitor.log
```

### What You Learned
✅ Terminal and shell fundamentals
✅ Linux commands (`pwd`, `ls`, `mkdir`, `cd`, `ps`, `top`, `free`, `df`, `ss`)
✅ Bash scripting and permissions (`chmod +x`)
✅ CPU, memory, disk, process, network, and GPU monitoring
✅ Threshold alerting
✅ Live dashboards (`watch`)
✅ Logging (`>>`)
✅ Scheduling with cron

### Portfolio Project
**Linux Resource Monitoring Toolkit** — Built a Linux monitoring toolkit using Bash scripting to monitor CPU, memory, disk, network, process, and GPU utilization, with live dashboard viewing, logging, and scheduled execution via cron.
**Skills:** Linux, Bash, System Administration, Automation, Monitoring, AI Infrastructure.

**Deliverable:** A full `monitoring_project/` folder with individual and combined monitoring scripts, a threshold alert, a live dashboard mode, logging, and a cron schedule.

---

## Project 3 (Module 3): Deploy a Service to a Cloud Compute Instance

**Goal:** Move from your local machine to a real cloud server — the foundation every later deployment builds on.

### Why This Project Matters

Everything you built in Project 2 ran on your own machine. Real AI infrastructure runs on servers you don't physically own — this project is where you make that leap for the first time, and every later project (containers, autoscaling, monitoring) builds on this exact cloud instance.

**Step 1 — Set up a local project folder for your service code.**
```bash
mkdir cloud_deploy_project
cd cloud_deploy_project
```
*Why:* Keeping the app code separate from your Project 2 scripts keeps each project's deliverables clean and easy to hand off.

**Step 2 — Understand what a cloud provider gives you.**
Learn: **IaaS (Infrastructure as a Service)** means renting raw compute (a virtual machine) by the hour/second instead of buying physical hardware.
*Why:* This is the layer under everything else in cloud-based AI infrastructure.

**Step 3 — Create a compute instance.**
Learn: an **instance** is a virtual machine (VM) — an emulated computer running on shared physical hardware. **Instance type** describes its specs (e.g., how much CPU/RAM/GPU it has).
*Why:* Choosing an instance type is a direct cost/performance tradeoff you'll make on every project from here on.

**Step 4 — Configure network access.**
Learn: a **security group** (or firewall rule) controls which **ports** are allowed to receive traffic from the outside world.
*Why:* Left wide open, an instance is a security risk; left fully closed, no one (including you) can reach your service. This step is where most beginners get stuck the first time.

**Step 5 — Connect to the instance.**
Learn: **SSH (Secure Shell)** is an encrypted remote-login protocol; a **key pair** (public/private key) proves your identity instead of a password.
*Why:* This is how you'll operate every cloud machine for the rest of the course — there's no GUI to click around in.
```bash
ssh -i your-key.pem user@<public-ip>
```

**Step 6 — Write a minimal "hello world" service first.**
```bash
nano main.py
```
```python
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello from the cloud!"}
```
*Why:* Confirming the smallest possible service works end-to-end before adding real logic isolates deployment problems from application problems — the same habit from Project 2's `hello.sh`.

**Step 7 — Install what your service needs.**
```bash
sudo apt update && sudo apt install -y python3-pip
pip3 install fastapi uvicorn
```
Learn: a **package manager** (`apt`, `pip`) installs and tracks software so you don't do it by hand.
*Why:* Every real deployment starts with "does this machine have what my code needs?"

**Step 8 — Run your service.**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
Learn: binding to `0.0.0.0` (not `127.0.0.1`) means "accept traffic from any address," which is required for external access.
*Why:* This single flag is the difference between "works on my machine" and "works for everyone."

**Step 9 — Expose the service publicly.**
Confirm the security group allows port 8000, and note the instance's public IP.
*Why:* Infrastructure isn't done until someone outside the machine can actually use it.

**Step 10 — Test it from your own laptop.**
```bash
curl http://<public-ip>:8000
```
Learn: **curl** is a command-line tool for sending HTTP requests — the same kind of request a browser or app would send.
*Why:* Testing from *outside* the server is the only way to confirm it's really reachable, not just running.

### Final Project Structure
```text
cloud_deploy_project/
│
├── main.py           # runs on the cloud instance
```

### What You Learned
✅ IaaS and virtual machine fundamentals
✅ Instance types and cost/performance tradeoffs
✅ Security groups and firewall rules
✅ SSH and key-pair authentication
✅ Installing dependencies on a remote server
✅ Running a service bound to all network interfaces
✅ Verifying a deployment from outside the server

### Portfolio Project
**Cloud-Deployed Web Service** — Provisioned a cloud compute instance, configured network access and SSH authentication, and deployed a live FastAPI service reachable from the public internet.
**Skills:** Cloud Computing, Linux Server Administration, Networking, SSH, Python, AI Infrastructure.

**Deliverable:** A live, publicly reachable service running on a cloud compute instance, confirmed with `curl` from your own machine.

---

## Project 4 (Module 4): Containerize and Deploy an Application

**Goal:** Package your service so it runs identically anywhere — the single most important habit in modern infrastructure.

### Why This Project Matters

Project 3 proved your service works on one specific cloud instance. But what happens when you need to run it on a second server, or hand it to a teammate, or move to a different cloud provider entirely? Containers solve that — this project turns your service into something that runs the same way, everywhere, forever.

**Step 1 — Set up a project folder.**
```bash
mkdir container_project
cd container_project
```
Copy in your `main.py` and dependencies from Project 3.
*Why:* Docker builds from whatever's in this folder — keeping it clean and minimal keeps your images small and fast to build.

**Step 2 — Understand why containers exist.**
Learn: a **container** bundles your app, its dependencies, and a minimal OS layer into one portable unit. Unlike a VM, it shares the host's kernel, so it's much lighter and faster to start.
*Why:* "It works on my machine" is the classic infrastructure failure — containers eliminate that excuse.

**Step 3 — List your dependencies.**
```bash
echo "fastapi
uvicorn" > requirements.txt
```
*Why:* Docker needs an explicit, written list of what to install — it can't "guess" what your code needs the way your own machine might already have installed.

**Step 4 — Write a Dockerfile.**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Learn: a **base image** (`python:3.11-slim`) is a pre-built starting environment; each instruction (`RUN`, `COPY`) adds a **layer**, cached for faster rebuilds.
*Why:* The Dockerfile *is* the infrastructure recipe — anyone who runs it gets an identical environment to yours.

**Step 5 — Build the image.**
```bash
docker build -t my-ai-service:v1 .
```
Learn: **building** turns the Dockerfile into a runnable **image** (a snapshot); the `:v1` is a **tag**, used for versioning.
*Why:* Tagging matters the moment you have more than one version running — you need to know which is which.

**Step 6 — Run the container locally.**
```bash
docker run -p 8000:8000 my-ai-service:v1
```
Learn: `-p 8000:8000` **maps** a port on your machine to a port inside the container.
*Why:* Containers are isolated by default — port mapping is the deliberate hole you punch to reach them.

**Step 7 — Push the image to a registry.**
```bash
docker tag my-ai-service:v1 <registry>/my-ai-service:v1
docker push <registry>/my-ai-service:v1
```
Learn: a **container registry** (like Docker Hub or a cloud provider's registry) stores images so other machines can pull and run them.
*Why:* This is how the exact same image gets from your laptop to a production server.

**Step 8 — Pull and run the image on your cloud instance from Project 3.**
```bash
docker pull <registry>/my-ai-service:v1
docker run -d -p 8000:8000 <registry>/my-ai-service:v1
```
Learn: `-d` runs the container **detached** (in the background), so it keeps running after you disconnect.
*Why:* This is the moment your local build becomes a real, containerized cloud deployment.

**Step 9 — Verify it's running.**
Run `docker ps` to confirm the container is up, then `curl` the public IP and port again.
*Why:* Same discipline as Project 3 — always confirm from the outside, not just "it started."

### Final Project Structure
```text
container_project/
│
├── main.py
├── requirements.txt
├── Dockerfile
```

### What You Learned
✅ Why containers exist vs. VMs
✅ Writing a Dockerfile (base images, layers, instructions)
✅ Building and tagging images
✅ Running containers with port mapping
✅ Pushing images to a container registry
✅ Pulling and running images on a remote server

### Portfolio Project
**Containerized Service Deployment** — Packaged a Python API into a Docker container, published it to a container registry, and deployed the exact same image to a cloud server.
**Skills:** Docker, Containerization, Container Registries, DevOps Fundamentals, AI Infrastructure.

**Deliverable:** A containerized version of your service, pushed to a registry and running on your cloud instance via Docker.

---

## Project 5 (Module 5): Benchmark Inference Performance Across Hardware Configurations

**Goal:** Learn to measure — not guess — whether your infrastructure choices are actually good ones.

### Why This Project Matters

Every hardware decision so far (Project 1's compute choice, Project 3's instance type) was a guess based on concepts, not data. This project replaces the guess with a number — the same discipline real infrastructure teams use before committing to expensive GPU spend.

**Step 1 — Set up a project folder.**
```bash
mkdir benchmark_project
cd benchmark_project
```
*Why:* Benchmark scripts and results get reused across many future decisions — worth keeping in their own place.

**Step 2 — Define what "fast" and "efficient" mean.**
Learn: **latency** is how long one request takes; **throughput** is how many requests can be handled per second; **P50/P95/P99** are percentiles — P95 latency means 95% of requests were faster than this number.
*Why:* A single "average" number hides the worst-case experience. P95/P99 are what real infrastructure teams report, because outliers are what users actually notice.

**Step 3 — Set up two (or more) hardware configurations to compare.**
Example: run the same containerized service (Project 4) on a CPU-only instance and a GPU-enabled instance.
*Why:* You can't judge "is a GPU worth the cost" without a like-for-like comparison.

**Step 4 — Write a simple benchmarking script.**
```bash
nano benchmark.py
```
```python
import time, requests

latencies = []
for _ in range(100):
    start = time.time()
    requests.post("http://<ip>:8000/predict", json={"input": "test"})
    latencies.append(time.time() - start)

latencies.sort()
print("P50:", latencies[49])
print("P95:", latencies[94])
```
Learn: this is a minimal **load-testing** script — repeatedly hitting your service and recording response times.
*Why:* Writing this once means you'll always have a way to sanity-check performance before assuming it's "fast enough."

**Step 5 — Run the benchmark against each hardware configuration.**
```bash
python3 benchmark.py
```
Record P50, P95, and total time for 100 requests on each setup — save each run's output to a file (`cpu_results.txt`, `gpu_results.txt`).
*Why:* This turns "the GPU feels faster" into a defensible number, and saved files mean you're not re-running tests to remember results.

**Step 6 — Compare cost against performance.**
Divide each instance's hourly cost by its throughput to get a rough cost-per-1000-requests figure.
*Why:* The fastest hardware isn't always the right choice — infrastructure engineers are judged on cost-efficiency, not just speed.

**Step 7 — Write up your findings.**
```bash
nano benchmark_report.md
```
One paragraph: which configuration wins, under what conditions, and why.
*Why:* Benchmarks that aren't documented get re-argued from scratch every few months — write it down once.

### Final Project Structure
```text
benchmark_project/
│
├── benchmark.py
├── cpu_results.txt
├── gpu_results.txt
├── benchmark_report.md
```

### What You Learned
✅ Latency, throughput, and percentile metrics (P50/P95/P99)
✅ Designing a fair, like-for-like hardware comparison
✅ Writing a load-testing script
✅ Calculating cost-per-request across configurations
✅ Documenting benchmark results for future decisions

### Portfolio Project
**Inference Hardware Benchmark Report** — Designed and ran a load-testing script comparing latency, throughput, and cost-efficiency across CPU and GPU hardware configurations for a deployed model API.
**Skills:** Performance Benchmarking, Python, Load Testing, Cost Analysis, AI Infrastructure.

**Deliverable:** A short benchmark report comparing latency, throughput, and cost across at least two hardware configurations.

---

## Project 6 (Module 6): Deploy a Model Behind a Serving API with Autoscaling

**Goal:** The centerpiece project — turn a model into a production API that grows and shrinks with demand automatically.

### Why This Project Matters

Everything so far has run on a fixed number of servers. Real traffic isn't fixed — it spikes and drops. This project is where your infrastructure stops being static and starts responding to demand on its own, the way production AI systems actually behave.

**Step 1 — Set up a project folder.**
```bash
mkdir autoscaling_api_project
cd autoscaling_api_project
```
*Why:* This becomes the base for your Final Capstone, so keeping it organized now saves rework later.

**Step 2 — Wrap your model in an API.**
```bash
nano main.py
```
```python
from fastapi import FastAPI
app = FastAPI()

@app.post("/predict")
def predict(input: dict):
    # load model once at startup, run inference here
    return {"prediction": "result"}
```
Learn: a **serving framework** (FastAPI, Flask) turns raw Python code into an **HTTP endpoint** — a URL other programs can call. **Request/response** is the pattern: caller sends input, service sends back a prediction.
*Why:* A model sitting in a file is useless to anyone else — the API is what makes it a product.

**Step 3 — Containerize the API.**
Reuse the Dockerfile pattern from Project 4, but load the model file inside the container.
*Why:* Autoscaling only works on something that can be copied and started identically, many times — that's exactly what a container gives you.

**Step 4 — Push the image and deploy it via an orchestrator.**
Learn: an **orchestrator** (e.g., Kubernetes, or a managed container service) runs multiple copies (**replicas**) of your container and restarts them if they crash.
*Why:* A single container is a single point of failure — orchestration is what makes the service resilient.

**Step 5 — Put a load balancer in front of it.**
Learn: a **load balancer** distributes incoming requests evenly across all running replicas, so no single one is overwhelmed while others sit idle.
*Why:* Without this, autoscaling would add more replicas but traffic would keep hitting only the first one.

**Step 6 — Configure autoscaling.**
Learn: **autoscaling** automatically adds or removes replicas based on a metric — commonly **CPU utilization** or **request count**. A typical rule: "if average CPU across replicas exceeds 70%, add a replica; if it drops below 30%, remove one."
*Why:* This is the entire point of the project — capacity that matches demand automatically, instead of you manually starting more servers at 2am.

**Step 7 — Load test the deployment to trigger scaling.**
Reuse (and scale up) your benchmarking script from Project 5 — send a high volume of concurrent requests.
*Why:* Autoscaling rules are meaningless until you've proven they actually fire under real load.

**Step 8 — Watch it scale in real time.**
Check replica count before, during, and after the load test (e.g., `kubectl get pods` if using Kubernetes, or your platform's equivalent).
*Why:* Seeing the replica count go from 2 → 6 → 2 is the proof the system works — don't just trust the config file.

**Step 9 — Review cost and clean up.**
Scale back down (or delete test resources) and note what the load test cost you in compute time.
*Why:* Autoscaling infrastructure that's forgotten and left scaled-up is one of the most common sources of cloud bill surprises.

### Final Project Structure
```text
autoscaling_api_project/
│
├── main.py
├── requirements.txt
├── Dockerfile
├── autoscaling_config.yaml   # or your platform's equivalent
```

### What You Learned
✅ Wrapping a model in a serving API
✅ Orchestration, replicas, and resilience
✅ Load balancing across replicas
✅ Configuring autoscaling rules
✅ Load testing to trigger and verify scaling
✅ Watching scaling behavior in real time
✅ Cost cleanup after testing

### Portfolio Project
**Autoscaling Model-Serving API** — Deployed a containerized model API behind a load balancer with autoscaling, and verified scale-up and scale-down behavior under simulated load.
**Skills:** API Development, Container Orchestration, Load Balancing, Autoscaling, Load Testing, AI Infrastructure.

**Deliverable:** A model-serving API, containerized, deployed behind a load balancer, with autoscaling verified under real load — plus a note on cost.

---

## Project 7 (Module 7): Set Up Monitoring and Alerting for a Deployed Model

**Goal:** Give your Project 6 deployment eyes — know it's healthy without having to check manually.

### Why This Project Matters

Project 6 gave you a system that scales itself. But a system that fails silently is just as dangerous as one that doesn't scale — this project makes sure you find out about problems before your users do.

**Step 1 — Set up a project folder.**
```bash
mkdir monitoring_alerting_project
cd monitoring_alerting_project
```
*Why:* Monitoring configuration (dashboards, alert rules) is its own deliverable, separate from the API code it watches.

**Step 2 — Decide what's worth monitoring.**
Learn the four categories: **latency** (is it fast?), **error rate** (is it failing?), **resource usage** (is it about to run out of CPU/memory?), and **traffic volume** (is demand normal?).
*Why:* Monitoring everything is as useless as monitoring nothing — engineers pick a small set of signals that actually predict problems.

**Step 3 — Instrument your API to expose metrics.**
Add a metrics endpoint, e.g. using `prometheus_client` in Python:
```python
from prometheus_client import Counter, make_asgi_app
REQUEST_COUNT = Counter("predict_requests_total", "Total prediction requests")

@app.post("/predict")
def predict(input: dict):
    REQUEST_COUNT.inc()
    ...
```
Learn: **instrumentation** means adding code whose only job is to record what's happening, so it can be measured later.
*Why:* You can't monitor what your app never reports.

**Step 4 — Set up a metrics collector.**
Learn: **Prometheus** is a common open-source tool that periodically pulls (**scrapes**) metrics from your service and stores them as a time series.
*Why:* Raw numbers in your code are useless until something collects and stores them over time.

**Step 5 — Build a dashboard.**
Learn: **Grafana** (often paired with Prometheus) turns stored metrics into visual charts.
*Why:* A graph of "error rate over the last hour" tells you in one glance what would take minutes to find in raw logs.

**Step 6 — Define alert rules.**
```bash
nano alert_rules.yaml
```
Example rule: "if error rate > 5% over 5 minutes, fire an alert."
Learn: an **alert rule** is a threshold plus a time window — this avoids false alarms from single, momentary blips.
*Why:* Alerts that fire on every tiny fluctuation get ignored; good rules balance sensitivity against noise.

**Step 7 — Configure where alerts go.**
Learn: an **alertmanager** (or equivalent) routes firing alerts to a **notification channel** — email, Slack, SMS, etc.
*Why:* An alert no one sees is the same as no monitoring at all.

**Step 8 — Test the alert by simulating a failure.**
Temporarily make the service return errors (or artificially spike load) and confirm the alert actually fires and arrives.
*Why:* Untested alerting is a common false sense of security — teams find out it's broken only during a real incident.

**Step 9 — Review the dashboard after a day of normal traffic.**
Adjust thresholds if they're too sensitive or too loose.
*Why:* Good monitoring is tuned, not set-and-forgotten.

### Final Project Structure
```text
monitoring_alerting_project/
│
├── prometheus.yml
├── alert_rules.yaml
├── grafana_dashboard.json
```

### What You Learned
✅ Choosing meaningful metrics (latency, error rate, resource usage, traffic)
✅ Instrumenting an API to expose metrics
✅ Collecting metrics with Prometheus
✅ Visualizing metrics with Grafana
✅ Writing alert rules with thresholds and time windows
✅ Routing alerts to a notification channel
✅ Testing alerts against a simulated failure

### Portfolio Project
**Model Deployment Monitoring & Alerting System** — Instrumented a production API, built a Prometheus/Grafana monitoring dashboard, and configured and tested a working alert rule for error-rate spikes.
**Skills:** Observability, Prometheus, Grafana, Alerting, Site Reliability Fundamentals, AI Infrastructure.

**Deliverable:** A monitoring dashboard and at least one tested, working alert for your Project 6 deployment.

---

## Final Capstone: Deploy a Scalable, Monitored Model-Serving Infrastructure on a Containerized Cloud Environment

**Goal:** Combine every project above into one system — this is an integration exercise, not a new build.

### Why This Project Matters

This is the project that goes on your resume and in interviews. It's not new material — it's proof that you can take seven separate skills and make them work together as one real system, which is the actual day-to-day job of an AI Infrastructure Engineer.

**Step 1 — Set up your capstone project folder.**
```bash
mkdir capstone_project
cd capstone_project
```
Copy in the final versions of your code from Projects 4, 6, and 7.
*Why:* The capstone isn't written from scratch — it's assembled from work you've already validated.

**Step 2 — Start from your Project 1 stack map.**
Confirm each layer (compute, storage, networking, orchestration, serving, monitoring) has a concrete answer from the projects you've already built.
*Why:* The capstone is the moment the "map" stops being theoretical.

**Step 3 — Containerize the final version of your model API (Projects 4 & 6).**
Rebuild and push a clean, versioned image.
*Why:* Start from a known-good, tagged artifact — not whatever's left over from testing.

**Step 4 — Deploy to your cloud instance/orchestrator with autoscaling configured (Projects 3 & 6).**
Re-verify the autoscaling rule from Project 6 is active.

**Step 5 — Put your load balancer in front of it (Project 6).**
Confirm traffic is distributed, not hitting one replica.

**Step 6 — Attach monitoring and alerting (Project 7).**
Confirm the dashboard shows live traffic and at least one alert is configured and tested.

**Step 7 — Run your benchmark suite against the full system (Project 5).**
Record final latency/throughput/cost numbers for the complete, assembled infrastructure — not just the raw model.

**Step 8 — Load test the whole system end-to-end.**
Send sustained traffic and confirm: autoscaling triggers, the load balancer distributes load, and the dashboard reflects it in real time.

**Step 9 — Write the final infrastructure document.**
Combine your Project 1 map, benchmark results, and monitoring dashboard screenshots into one short write-up: what you built, how it scales, how you'd know if it broke.
*Why:* This document is what you'd hand to a teammate (or a future employer) to prove the system is real, tested, and understood — not just "it's running somewhere."

### Final Project Structure
```text
capstone_project/
│
├── main.py
├── requirements.txt
├── Dockerfile
├── autoscaling_config.yaml
├── prometheus.yml
├── alert_rules.yaml
├── grafana_dashboard.json
├── benchmark_results.md
├── stack_diagram.png
├── infrastructure_writeup.md
```

### What You Learned
✅ Integrating seven separate infrastructure projects into one system
✅ Verifying an architecture map against a real, running deployment
✅ End-to-end load testing across autoscaling, load balancing, and monitoring together
✅ Writing infrastructure documentation for a non-technical or future audience

### Portfolio Project
**End-to-End AI Infrastructure Platform** — Designed, built, and documented a complete AI infrastructure system: a containerized, autoscaling model-serving API behind a load balancer, with full monitoring and alerting, benchmarked under real load on cloud infrastructure.
**Skills:** Cloud Computing, Docker, Container Orchestration, Autoscaling, Load Balancing, Observability (Prometheus/Grafana), Performance Benchmarking, Technical Documentation, AI Infrastructure Engineering.

**Deliverable:** A live, containerized, autoscaling, monitored model-serving system — plus a written summary connecting it back to every project that built it.
