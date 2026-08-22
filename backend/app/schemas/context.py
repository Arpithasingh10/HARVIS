from pydantic import BaseModel, ConfigDict


class BranchOut(BaseModel):
    branch_id: int
    branch_code: str
    branch_name: str

    model_config = ConfigDict(from_attributes=True)


class SectionOut(BaseModel):
    section_id: int
    branch_id: int
    year: int
    section_name: str

    model_config = ConfigDict(from_attributes=True)
