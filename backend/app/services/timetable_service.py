from sqlalchemy.orm import Session

from ..models.classroom import Classroom
from ..models.faculty import Faculty
from ..models.subject import Subject
from ..models.timetable import Timetable


def get_class_at_time(
    db: Session,
    section_id: int,
    query_time: str,
    day_of_week: str,
) -> str:
    rows = (
        db.query(Timetable)
        .filter(
            Timetable.section_id == section_id,
            Timetable.day_of_week == day_of_week,
        )
        .all()
    )

    for row in rows:
        if row.start_time <= query_time < row.end_time:
            subject = (
                db.query(Subject)
                .filter(Subject.subject_id == row.subject_id)
                .first()
            )
            faculty = (
                db.query(Faculty)
                .filter(Faculty.faculty_id == row.faculty_id)
                .first()
            )
            room = (
                db.query(Classroom)
                .filter(Classroom.room_id == row.room_id)
                .first()
            )

            subject_name = (
                subject.subject_name if subject else "an unlisted subject"
            )
            faculty_name = (
                faculty.faculty_name
                if faculty
                else "an unlisted faculty member"
            )
            room_number = room.room_number if room else "an unlisted room"

            return (
                f"You have {subject_name} at {row.start_time} "
                f"in Room {room_number} with {faculty_name} "
                f"({day_of_week})."
            )

    return (
        f"I couldn't find a class at that time on "
        f"{day_of_week} for your section."
    )
