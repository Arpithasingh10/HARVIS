from sqlalchemy import Column, ForeignKey, Integer, String
from ..database import Base

class Subject(Base):
    __tablename__ = "subjects"
    subject_id = Column(Integer, primary_key=True, autoincrement=False)
    subject_name = Column(String, nullable=False)
    subject_code = Column(String, nullable=False, unique=True)
    branch_id = Column(Integer, ForeignKey("branches.branch_id"), nullable=False)