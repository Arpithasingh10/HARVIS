# Review 1 — Summary

Review-1 established the project concept, motivation, research gap, and a 20-slide
prototype presentation (built with PptxGenJS). Key decisions locked at Review-1:

- Interface: web-based conversational UI (not WhatsApp-native).
- JARVIS referenced as explicit conceptual inspiration (title, intro, motivation, abstract).
- Problem statement: fragmented multi-channel information access at HITAM, not a
  WhatsApp-specific gap.
- Research gap (4 points): structured + unstructured hybrid retrieval, conversational
  access, institutional specificity, real-time accuracy.
- Existing information landscape reframed as "Traditional & Semi-Digital Sources"
  (accurate to HITAM's actual state — no centralized system assumed).
- Tech stack presented with status tags: Confirmed / Proposed / To Be Finalized.
- Prototype chat mockup explicitly demonstrated anti-hallucination fallback behavior.

Full slide deck: see `assets/` or the original PPT (add file reference once placed
in this repo).

## Post-Review-1 architecture validation

After Review-1, the proposed development architecture and repository structure were
critically reviewed against this presentation to catch any drift before implementation
began. Outcome: architecture approved with minor adjustments (walking skeleton milestone
added, vector DB simplified to local ChromaDB persistence instead of a separate
containerized service, `data/` split into `dummy/` and `real/` to make the
dummy-to-real data swap explicit). See `docs/architecture/` for the current
architecture doc and `docs/scope.md` for the current/proposed/future-scope boundary.
