"""
Loads data/dummy/raw/*.csv into the SQLite database at the repo root
(harvis.db), using the SAME path resolution as backend/app/database.py.

Idempotent: drops and recreates all tables before reloading. Never modifies
the source CSVs.

Run from the repo root:
    python scripts/seed_db.py

seed() is also imported directly by backend/tests/test_phase1.py so the test
suite exercises this exact script rather than duplicating insertion logic.
"""
import csv
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.database import Base, SessionLocal, engine, DATABASE_URL  # noqa: E402
from app.models.branch import Branch  # noqa: E402
from app.models.classroom import Classroom  # noqa: E402
from app.models.examination import Examination  # noqa: E402
from app.models.faculty import Faculty  # noqa: E402
from app.models.section import Section  # noqa: E402
from app.models.subject import Subject  # noqa: E402
from app.models.timetable import Timetable  # noqa: E402

RAW = REPO_ROOT / "data" / "dummy" / "raw"


def read_csv(name: str) -> list[dict]:
    with open(RAW / name, newline="") as f:
        return list(csv.DictReader(f))


def seed() -> dict:
    """
    Drops/recreates tables and reloads all 7 CSVs. Returns a dict of table-name
    -> row-count so callers (including tests) can assert against it without
    re-querying or duplicating logic.
    """
    print(f"Database target: {DATABASE_URL}")
    print("Recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for row in read_csv("branches.csv"):
            db.add(Branch(branch_id=int(row["branch_id"]), branch_code=row["branch_code"], branch_name=row["branch_name"]))
        for row in read_csv("sections.csv"):
            db.add(Section(section_id=int(row["section_id"]), branch_id=int(row["branch_id"]), year=int(row["year"]), section_name=row["section_name"]))
        for row in read_csv("subjects.csv"):
            db.add(Subject(subject_id=int(row["subject_id"]), subject_name=row["subject_name"], subject_code=row["subject_code"], branch_id=int(row["branch_id"])))
        for row in read_csv("faculty.csv"):
            db.add(Faculty(faculty_id=int(row["faculty_id"]), faculty_name=row["faculty_name"], branch_id=int(row["branch_id"]), designation=row["designation"], cabin_room=row["cabin_room"], email=row["email"]))
        for row in read_csv("classrooms.csv"):
            db.add(Classroom(room_id=int(row["room_id"]), room_number=row["room_number"], building=row["building"], floor=int(row["floor"]), capacity=int(row["capacity"]), room_type=row["room_type"]))

        # Commit reference tables first so FK-bearing inserts below are valid.
        db.commit()

        for row in read_csv("timetable.csv"):
            db.add(Timetable(timetable_id=int(row["timetable_id"]), section_id=int(row["section_id"]), day_of_week=row["day_of_week"], start_time=row["start_time"], end_time=row["end_time"], subject_id=int(row["subject_id"]), faculty_id=int(row["faculty_id"]), room_id=int(row["room_id"])))
        for row in read_csv("examinations.csv"):
            db.add(Examination(exam_id=int(row["exam_id"]), section_id=int(row["section_id"]), subject_id=int(row["subject_id"]), exam_type=row["exam_type"], exam_date=row["exam_date"], start_time=row["start_time"], end_time=row["end_time"], room_id=int(row["room_id"])))

        db.commit()

        counts = {
            "branches": db.query(Branch).count(),
            "sections": db.query(Section).count(),
            "subjects": db.query(Subject).count(),
            "faculty": db.query(Faculty).count(),
            "classrooms": db.query(Classroom).count(),
            "timetable": db.query(Timetable).count(),
            "examinations": db.query(Examination).count(),
        }
        print("Seed complete:")
        for name, count in counts.items():
            print(f"  {name}: {count}")
        return counts
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()