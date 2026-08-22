from sqlalchemy import Column, Integer, String
from ..database import Base

class Branch(Base):
    __tablename__ = "branches"
    branch_id = Column(Integer, primary_key=True, autoincrement=False)
    branch_code = Column(String, nullable=False, unique=True)
    branch_name = Column(String, nullable=False)