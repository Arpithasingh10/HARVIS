# HARVIS — Scope Definition

This file is the single source of truth for what HARVIS currently is, what it is being
built toward, and what is explicitly out of scope. Every doc, README section, and demo
script should stay consistent with this file. If something here changes, update it first,
then update anything that references it.

## Current Prototype (what exists in code right now)

- Dummy, HITAM-style data only (departments, faculty, timetable, classrooms).
  No real HITAM institutional data is integrated.
- Structured query path: FastAPI → PostgreSQL, for fixed-schema lookups
  (timetable, faculty, rooms, exam dates).
- No RAG, no LLM, no NLP intent model yet at Milestone 0 / v0.1.
- Web interface only. No WhatsApp, mobile app, or voice interface.
- Firebase Email/Password authentication gates the student dashboard. College
  accounts use the `@hitam.org` domain and their academic profile is stored
  separately in Firestore. The current academic-data prototype remains dummy data.

## Proposed System (target for this academic project, v0.2 → v1.0)

- RAG pipeline (custom implementation) over unstructured HITAM-style documents
  (notices, circulars, FAQs) using sentence-transformer embeddings + ChromaDB.
- Hybrid routing: queries that need both a structured fact and explanatory text
  (e.g. "what notice was released about placements?") query both paths and merge context.
- LLM-based response generation grounded in retrieved context, with a lightweight
  hybrid NLP layer (rule-based entity extraction + embedding-similarity intent
  classification, LLM fallback for low-confidence cases).
- Response validation / groundedness check before returning an answer to the user.
- Conversation/session context carried across turns within a chat session.
- Deployment as a working prototype on free/student-tier hosting, not production
  infrastructure.

## Future Scope (explicitly NOT part of this project's implementation)

- WhatsApp or any messaging-platform integration.
- Native mobile application.
- Voice interface.
- Multilingual support.
- Integration with a live HITAM ERP/LMS or centralized institutional API/website
  (no such centralized system is assumed to exist).
- Real HITAM institutional data. Dummy data is used throughout; the pipeline is
  designed so real data can later be substituted without re-architecting the system,
  but sourcing/cleaning real data is not part of this project's deliverable.
- Multi-tenant / multi-institution support.

## Rule for anyone writing docs, README updates, or the final report

Before writing a claim like "HARVIS supports X" or "HARVIS was evaluated on X",
check this file. If X is not in "Current Prototype" and has not been implemented yet,
say "planned" or "proposed", not "supports". Evaluation results may only be reported
once Phase 7 testing has actually been run — do not pre-populate `docs/testing/` with
expected or assumed results.
