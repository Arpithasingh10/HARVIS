from pydantic import BaseModel


class SessionContext(BaseModel):
    year: int
    branch_id: int
    section_id: int


class QueryRequest(BaseModel):
    session_context: SessionContext
    text: str


class QueryResponse(BaseModel):
    intent: str
    answer: str
