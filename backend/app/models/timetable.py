from sqlalchemy import Column, ForeignKey, Integer, String
from ..database import Base

class Timetable(Base):
    __tablename__ = "timetable"
    timetable_id = Column(Integer, primary_key=True, autoincrement=False)
    section_id = Column(Integer, ForeignKey("sections.section_id"), nullable=False)
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), nullable=False)
    room_id = Column(Integer, ForeignKey("classrooms.room_id"), nullable=False)