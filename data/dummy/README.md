# Dummy HITAM-Style Data

All data in `data/dummy/` is fabricated for development purposes. None of it
represents real HITAM students, faculty, or schedules. It exists purely to
validate the HARVIS pipeline end-to-end before real institutional data is available.

## Dataset scope: 4th-year B.Tech only

The prototype dataset is intentionally restricted to 4th-year students across six
branches and ten sections:

| Branch | Sections |
|---|---|
| CSM (Computer Science and Machine Learning) | A, B |
| CSD (Computer Science and Data Science) | A, B |
| CSE (Computer Science and Engineering) | A, B, C |
| ECE (Electronics and Communication Engineering) | A |
| EEE (Electrical and Electronics Engineering) | A |
| MECH (Mechanical Engineering) | A |

This validates the architecture without unnecessary data volume. The schema
supports additional years without redesign — extending it later is a data
addition (`sections.csv`), not an architecture change.

## Academic hierarchy

```
Branch -> Section (branch_id + year) -> Timetable / Examinations
```

`section_id` is the single unambiguous identifier for a student's schedule —
e.g. `section_id = 6` means 4th Year CSE-B. Nothing downstream uses a raw
string like `"CSE-B"`.

## Files (`raw/`)

| File | Rows | Purpose |
|---|---|---|
| `branches.csv` | 6 | Branch reference table |
| `sections.csv` | 10 | Branch + year + section, the key everything else joins on |
| `subjects.csv` | ~31 | Branch-specific 4th-year subjects |
| `faculty.csv` | 14 | Faculty directory, keyed to `branch_id` |
| `classrooms.csv` | 5 | Room reference table |
| `timetable.csv` | 250 | 10 sections x 5 weekdays x 5 periods — generated |
| `examinations.csv` | 43 | Mid-1 exam schedule per section/subject — generated |

`timetable.csv` and `examinations.csv` are generated (not hand-written) by
`scripts/generate_dummy_timetable.py`, seeded for reproducibility. Re-run it
after editing `branches.csv`, `sections.csv`, `subjects.csv`, or `faculty.csv`
to regenerate consistent schedules:

```bash
python scripts/generate_dummy_timetable.py
```

## Not yet included (added in Phase 3, RAG-facing)

Unstructured documents (notices, circulars, FAQs) will be added as sample text/PDF
files under `data/dummy/raw/documents/` when the RAG pipeline (v0.2) begins.

## Processed data

`processed/` will hold cleaned/validated versions of the above (post data-cleaning
notebook), kept separate from `raw/` so the cleaning step is reproducible and auditable.

## Swapping in real data later

When real HITAM data becomes available, it goes into `data/real/raw/` in the same
column format as these files (including the branch -> section -> timetable hierarchy),
then through the same cleaning notebooks into `data/real/processed/`. The backend
reads from a configured data source (dummy vs. real), not hardcoded file paths —
this is what keeps the swap from requiring an architecture rewrite.
