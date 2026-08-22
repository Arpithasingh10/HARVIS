from sqlalchemy import Column, ForeignKey, Integer, String
from ..database import Base

class Section(Base):
    __tablename__ = "sections"
    section_id = Column(Integer, primary_key=True, autoincrement=False)
    branch_id = Column(Integer, ForeignKey("branches.branch_id"), nullable=False)
    year = Column(Integer, nullable=False)
    section_name = Column(String, nullable=False)