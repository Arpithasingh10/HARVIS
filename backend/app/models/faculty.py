from sqlalchemy import Column, ForeignKey, Integer, String
from ..database import Base

class Faculty(Base):
    __tablename__ = "faculty"
    faculty_id = Column(Integer, primary_key=True, autoincrement=False)
    faculty_name = Column(String, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.branch_id"), nullable=False)
    designation = Column(String)
    cabin_room = Column(String)
    email = Column(String)