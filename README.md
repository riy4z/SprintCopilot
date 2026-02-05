# SprintCopilot

An AI-powered sprint planning and retrospective insights platform designed to help agile teams plan better, deliver faster, and continuously improve using data-driven intelligence.

> ⚠️ This project is currently in early development. The frontend prototype is complete, and the Go backend is under active development.

---

## 🧠 Vision

Modern agile teams generate large volumes of sprint data — tickets, blockers, dependencies, velocity metrics — but retrospectives are still manual and subjective.

This platform aims to augment sprint workflows with AI by:

* Analyzing sprint performance
* Detecting delivery risks
* Identifying bottlenecks
* Generating retrospective summaries
* Providing actionable improvement insights

---

## 🏗️ Current Project Status

| Layer                   | Status                        |
| ----------------------- | ----------------------------- |
| Frontend (React)        | ✅ Prototype complete          |
| Backend (Go APIs)       | 🚧 In progress                |
| AI Retrospective Engine | 🚧 Planned                    |
| Jira Integration        | 🚧 Planned (demo environment) |

---

## ⚛️ Frontend Features

* Sprint dashboard UI
* Backlog & ticket views
* Retrospective summary interface
* Dependency visualization (planned UI hooks)
* Velocity & delivery insights widgets
* Modern responsive design

---

## 🧱 Planned Architecture

```
React Frontend  →  Go Backend APIs  →  AI Services
                         ↓
                    Jira Integration
```

### Tech Stack

**Frontend**

* React
* TypeScript
* Tailwind CSS

**Backend (WIP)**

* Go (Golang)
* REST APIs

**AI Layer (Planned)**

* LLM-powered sprint insights
* Retrospective summarization
* Risk detection models

---

## 📂 Repository Structure

```
project-root/

apps/
 ├── web/        # React frontend
 └── api/        # Go backend (planned)

services/
 └── ai/         # AI processing (planned)

packages/
 └── shared/     # Shared types & utilities (planned)
```

---

## 🔌 Integrations (Planned)

* Jira Cloud (demo workspace)
* OAuth authentication
* Ticket & sprint ingestion
* Dependency graph generation

> All integrations will use self-hosted or demo environments.

---

## 🔐 Data & Compliance Disclaimer

This project was originally inspired by a hackathon use case and is now being developed as a standalone open-source platform.

* No proprietary or enterprise data is included
* No internal company systems are connected
* All integrations use demo or self-created environments

---

## 🛠️ Local Development

### 1️⃣ Clone the repo

```bash
git clone https://github.com/riy4z/SprintCopilot.git
cd SprintCopilot
```

### 2️⃣ Run frontend

```bash
cd apps/web
npm install
npm run dev
```

App will run on:

```
http://localhost:5173
```

*(port may vary based on your setup)*

---

## 🚧 Roadmap

* [ ] Initialize Go backend service
* [ ] Sprint & ticket APIs
* [ ] Jira OAuth integration
* [ ] AI retrospective generator
* [ ] Dependency graph engine
* [ ] Sprint risk scoring
* [ ] Slack/notification integrations
* [ ] Production deployment

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

If you’d like to collaborate:

1. Fork the repo
2. Create a feature branch
3. Submit a PR

---

## 📜 License

MIT License — free to use and modify.

---

## 👨‍💻 Author

Built as part of a hackathon prototype and now evolving into a full-stack AI developer productivity platform.

---

## ⭐ Support

If you like the idea, consider starring the repo — it helps visibility and future development 🚀
