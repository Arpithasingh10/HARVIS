# HARVIS — HITAM AI Virtual Smart Assistant

A modular, web-based conversational assistant for HITAM students, combining
NLP-based intent detection, Retrieval-Augmented Generation (RAG), and an LLM to
answer institution-specific queries. Inspired conceptually by JARVIS.

> **Status: early prototype.** HARVIS currently runs on dummy, HITAM-style data.
> No real institutional data is integrated yet. See [`docs/scope.md`](docs/scope.md)
> for exactly what is implemented vs. proposed vs. future scope — please read that
> before writing any doc, report, or demo claim about what HARVIS "does".

## Problem Statement

HITAM students currently access institutional information (timetables, notices,
circulars, faculty/department communication, exam schedules) through fragmented
traditional and semi-digital sources. There is no single conversational interface
that lets a student ask a natural-language question and get a grounded answer
across both structured (timetable, faculty, rooms) and unstructured
(notices, policies, FAQs) institutional information.

## Architecture (target — see scope.md for what's live today)

```
                    ┌── Structured DB (PostgreSQL)
                    │
Student → Web → NLP → Router ──┼── RAG (ChromaDB + custom retrieval)
                    │           │
                    │           └── Hybrid (both, merged into context)
                    │
                    ▼
             Context Manager (conversation/session state)
                    ↓
                   LLM
                    ↓
              Response Validation (groundedness / fallback)
                    ↓
                 Web Response
```

Full architecture notes: [`docs/architecture/`](docs/architecture/).

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI |
| Structured DB | PostgreSQL (SQLite acceptable for early local dev) |
| Vector store | ChromaDB (local persistence, no separate server for now) |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| RAG | Custom implementation (no framework) |
| NLP | Hybrid: rule-based entity extraction + embedding-similarity intent classification |
| LLM | To be finalized at Phase 4 |

## Repository Structure

```
HARVIS/
├── docs/            requirements, architecture, data, api, testing, review docs, scope.md
├── data/            dummy/ (active) and real/ (reserved, empty for now)
├── notebooks/        exploration, cleaning, RAG experiments
├── backend/          FastAPI app (api, core, models, schemas, services, utils) + tests
├── frontend/         React web application
├── rag/              ingestion, retrieval, prompting, evaluation
├── scripts/          one-off / setup scripts
└── assets/           diagrams, screenshots, logo
```

## Local Setup

```bash
# clone
git clone <repo-url> && cd HARVIS

# backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
cp ../.env.example ../.env   # fill in local DB credentials
uvicorn app.main:app --reload

# frontend (once scaffolded)
cd ../frontend
npm install
npm run dev
```

## Development Roadmap

- **Milestone 0** — repo foundation, environment, dummy data seed *(this commit)*
- **v0.1 — Database Assistant**: web → FastAPI → simple router → PostgreSQL → answer. No LLM.
- **v0.2 — RAG Assistant**: adds document retrieval over notices/FAQs via ChromaDB.
- **v0.3 — LLM Assistant**: adds LLM response generation over DB/RAG context.
- **v1.0 — HARVIS**: hybrid routing, conversation context, response validation, full web UI.

See [`docs/project-reviews/`](docs/project-reviews/) for review-cycle documentation.

## Team

_Add team member names / roles here._

## License

See [`LICENSE`](LICENSE).
