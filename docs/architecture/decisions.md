# Architecture Decisions (locked after Review-1 architecture validation)

## Stack

| Layer | Decision | Fallback |
|---|---|---|
| Frontend | React (Vite) | Streamlit if timeline is tight |
| Backend | FastAPI | Flask |
| Structured DB | PostgreSQL | SQLite for early local dev |
| Vector store | ChromaDB, local persistence (no separate container/server) | FAISS |
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` | OpenAI `text-embedding-3-small` |
| RAG | Custom implementation (direct SDK calls, no framework) | LlamaIndex if time-boxed |
| NLP | Hybrid: rule-based entity extraction + embedding-similarity intent classification, LLM fallback for low confidence | — |
| LLM | To be finalized at Phase 4 | — |
| Testing | pytest | — |
| Deployment (prototype) | Free/student-tier hosting (backend + frontend) or local Docker Compose demo | — |

Rationale for not training a custom transformer intent classifier: no labeled
HITAM query dataset exists, and training one wouldn't be defensible without it.
The hybrid approach reuses the same embedding model as RAG rather than adding a
second ML system.

Rationale for not containerizing the vector store separately: ChromaDB's embedded/
local-persistence mode has zero operational overhead for a project this size. A
containerized vector DB can be introduced later if the project genuinely needs it —
introducing it now would be premature infrastructure.

## Query routing

| Query type | Route |
|---|---|
| Fixed-schema lookup (timetable, faculty, rooms, exam dates) | Structured DB |
| Free-text / policy / explanation (attendance rules, notices content) | RAG |
| Filtered fact + explanation (e.g. "what notice about placements?") | Hybrid — structured metadata filter narrows candidates, RAG retrieves/summarizes |

## Development milestones

- **Milestone 0** — repo foundation, environment config, dummy data seed.
- **v0.1 — Database Assistant**: Web → FastAPI → simple keyword router → PostgreSQL → answer. No LLM, no RAG.
- **v0.2 — RAG Assistant**: adds document retrieval over notices/FAQs via ChromaDB.
- **v0.3 — LLM Assistant**: adds LLM generation over DB/RAG context, still single-turn.
- **v1.0 — HARVIS**: hybrid routing, conversation/session context, response validation, polished web UI.

First concrete implementation target (walking skeleton, built inside v0.1):
a single query, "What class do I have at 11?", working through every layer
(React input → POST /query → FastAPI → keyword-based router → PostgreSQL
timetable lookup → formatted response → displayed in the UI).
