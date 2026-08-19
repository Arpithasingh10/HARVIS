import csv
from pathlib import Path
from collections import Counter

RAW = Path("data/dummy/raw")


def load(name):
    with open(RAW / name, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


branches = load("branches.csv")
sections = load("sections.csv")
subjects = load("subjects.csv")
faculty = load("faculty.csv")
classrooms = load("classrooms.csv")
timetable = load("timetable.csv")
examinations = load("examinations.csv")

errors = []


# ---------- Basic counts ----------

if len(branches) != 6:
    errors.append(f"Expected 6 branches, found {len(branches)}")

if len(sections) != 10:
    errors.append(f"Expected 10 sections, found {len(sections)}")

if len(subjects) != 31:
    errors.append(f"Expected 31 subjects, found {len(subjects)}")

if len(faculty) != 14:
    errors.append(f"Expected 14 faculty members, found {len(faculty)}")

if len(timetable) != 250:
    errors.append(f"Expected 250 timetable rows, found {len(timetable)}")

if len(examinations) != 43:
    errors.append(f"Expected 43 examination rows, found {len(examinations)}")


# ---------- IDs ----------

branch_ids = {row["branch_id"] for row in branches}
section_ids = {row["section_id"] for row in sections}
subject_ids = {row["subject_id"] for row in subjects}
faculty_ids = {row["faculty_id"] for row in faculty}
room_ids = {row["room_id"] for row in classrooms}


# ---------- Sections ----------

for section in sections:
    if section["branch_id"] not in branch_ids:
        errors.append(
            f"Section {section['section_id']} references missing branch "
            f"{section['branch_id']}"
        )

    if section["year"] != "4":
        errors.append(
            f"Section {section['section_id']} is not 4th year"
        )


expected_sections = {
    "CSM": {"A", "B"},
    "CSD": {"A", "B"},
    "CSE": {"A", "B", "C"},
    "ECE": {"A"},
    "EEE": {"A"},
    "MECH": {"A"},
}

branch_code_by_id = {
    row["branch_id"]: row["branch_code"]
    for row in branches
}

actual_sections = {}

for section in sections:
    branch_code = branch_code_by_id[section["branch_id"]]
    actual_sections.setdefault(branch_code, set()).add(
        section["section_name"]
    )

if actual_sections != expected_sections:
    errors.append(
        f"Section distribution mismatch:\n"
        f"Expected: {expected_sections}\n"
        f"Found: {actual_sections}"
    )


# ---------- Subject branch validation ----------

subject_branch = {
    row["subject_id"]: row["branch_id"]
    for row in subjects
}

faculty_branch = {
    row["faculty_id"]: row["branch_id"]
    for row in faculty
}

section_branch = {
    row["section_id"]: row["branch_id"]
    for row in sections
}


# ---------- Timetable validation ----------

seen_slots = set()

for row in timetable:

    section_id = row["section_id"]
    subject_id = row["subject_id"]
    faculty_id = row["faculty_id"]
    room_id = row["room_id"]

    if section_id not in section_ids:
        errors.append(
            f"Timetable {row['timetable_id']} references missing section "
            f"{section_id}"
        )
        continue

    if subject_id not in subject_ids:
        errors.append(
            f"Timetable {row['timetable_id']} references missing subject "
            f"{subject_id}"
        )

    if faculty_id not in faculty_ids:
        errors.append(
            f"Timetable {row['timetable_id']} references missing faculty "
            f"{faculty_id}"
        )

    if room_id not in room_ids:
        errors.append(
            f"Timetable {row['timetable_id']} references missing room "
            f"{room_id}"
        )

    branch_id = section_branch[section_id]

    if subject_id in subject_branch:
        if subject_branch[subject_id] != branch_id:
            errors.append(
                f"Timetable {row['timetable_id']}: subject {subject_id} "
                f"does not belong to section {section_id}'s branch"
            )

    if faculty_id in faculty_branch:
        if faculty_branch[faculty_id] != branch_id:
            errors.append(
                f"Timetable {row['timetable_id']}: faculty {faculty_id} "
                f"does not belong to section {section_id}'s branch"
            )

    slot = (
        section_id,
        row["day_of_week"],
        row["start_time"],
    )

    if slot in seen_slots:
        errors.append(
            f"Duplicate timetable slot: {slot}"
        )

    seen_slots.add(slot)


# ---------- Examination validation ----------

for row in examinations:

    if row["section_id"] not in section_ids:
        errors.append(
            f"Exam {row['exam_id']} references missing section "
            f"{row['section_id']}"
        )

    if row["subject_id"] not in subject_ids:
        errors.append(
            f"Exam {row['exam_id']} references missing subject "
            f"{row['subject_id']}"
        )

    if row["room_id"] not in room_ids:
        errors.append(
            f"Exam {row['exam_id']} references missing room "
            f"{row['room_id']}"
        )


# ---------- Results ----------

print("\nHARVIS Dummy Data Validation")
print("=" * 35)

print(f"Branches:       {len(branches)}")
print(f"Sections:       {len(sections)}")
print(f"Subjects:       {len(subjects)}")
print(f"Faculty:        {len(faculty)}")
print(f"Classrooms:     {len(classrooms)}")
print(f"Timetable rows: {len(timetable)}")
print(f"Exam rows:      {len(examinations)}")

print()

if errors:
    print(f"FAILED — {len(errors)} issue(s) found:\n")
    for error in errors:
        print(" -", error)
    raise SystemExit(1)

print("PASSED — all validation checks succeeded.")