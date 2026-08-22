from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.branch import Branch
from ..models.section import Section
from ..schemas.context import BranchOut, SectionOut

router = APIRouter()


@router.get("/branches", response_model=list[BranchOut])
def get_branches(db: Session = Depends(get_db)):
    return db.query(Branch).order_by(Branch.branch_id).all()


@router.get("/branches/{branch_id}/sections", response_model=list[SectionOut])
def get_sections(branch_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Section)
        .filter(Section.branch_id == branch_id)
        .order_by(Section.section_id)
        .all()
    )
