# Dummy HITAM-Style Data

All data in `data/dummy/` is fabricated for development purposes. None of it
represents real HITAM students, faculty, or schedules. It exists purely to
validate the HARVIS pipeline end-to-end before real institutional data is available.

## Files (`raw/`)

| File | Purpose | Used by |
|---|---|---|
| `departments.csv` | Department reference table | Structured DB (foreign key for faculty) |
| `faculty.csv` | Faculty directory | Structured DB — "who teaches X" queries |
| `classrooms.csv` | Room reference table | Structured DB — room lookups |
| `timetable.csv` | Weekly class schedule, section AIML-3A | Structured DB — primary walking-skeleton target ("what class do I have at 11?") |
| `examinations.csv` | Exam schedule, section AIML-3A | Structured DB — "when is the next exam?" |

## Not yet included (added in Phase 3, RAG-facing)

Unstructured documents (notices, circulars, FAQs) will be added as sample text/PDF
files under `data/dummy/raw/documents/` when the RAG pipeline (v0.2) begins. They are
intentionally excluded from Milestone 0 since the walking skeleton only needs the
structured path.

## Processed data

`processed/` will hold cleaned/validated versions of the above (post data-cleaning
notebook), kept separate from `raw/` so the cleaning step is reproducible and auditable.

## Swapping in real data later

When real HITAM data becomes available, it goes into `data/real/raw/` in the same
column format as these files, then through the same cleaning notebooks into
`data/real/processed/`. The backend should read from a configured data source
(dummy vs. real), not have file paths hardcoded — this is what keeps the swap from
requiring an architecture rewrite.
