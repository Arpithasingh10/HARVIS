from sqlalchemy import Column, ForeignKey, Integer, String
from ..database import Base

class Examination(Base):
    __tablename__ = "examinations"
    exam_id = Column(Integer, primary_key=True, autoincrement=False)
    section_id = Column(Integer, ForeignKey("sections.section_id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    exam_type = Column(String, nullable=False)
    exam_date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    room_id = Column(Integer, ForeignKey("classrooms.room_id"), nullable=False)