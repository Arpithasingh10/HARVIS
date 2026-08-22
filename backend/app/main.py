from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import context, query

app = FastAPI(title="HARVIS", description="Phase 1 structured data engine (SQLite only, no LLM/RAG).", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(context.router, tags=["context"])
app.include_router(query.router, tags=["query"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HARVIS Phase 1"}