# HARVIS frontend — Lovable UI merged for the real project

This folder is a cleaned Vite + React + TypeScript adaptation of the Lovable-generated UI.

Important:
- Backend is NOT included or modified.
- The real HARVIS FastAPI backend remains at `http://localhost:8000`.
- Vite frontend runs at `http://localhost:5173`.
- No Supabase, auth, PostgreSQL, LLM, RAG, or mock backend is included.
- The UI uses the existing Phase 1 API contract: `/branches`, `/branches/{id}/sections`, and `/query`.
- Time display is protected against converting already-formatted `AM/PM` values twice.
- The unsupported "Where is my next class?" example has been removed.
- Interaction history, system status, and state-flow components are wired into the assistant screen.
