from sqlalchemy import Column, Integer, String
from ..database import Base

class Classroom(Base):
    __tablename__ = "classrooms"
    room_id = Column(Integer, primary_key=True, autoincrement=False)
    room_number = Column(String, nullable=False)
    building = Column(String)
    floor = Column(Integer)
    capacity = Column(Integer)
    room_type = Column(String)