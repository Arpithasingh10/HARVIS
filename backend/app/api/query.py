from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.query import QueryRequest, QueryResponse
from ..services.router import classify_query, extract_day, extract_time
from ..services.timetable_service import get_class_at_time
router = APIRouter()
_WEEKEND_DAYS = ("Saturday", "Sunday")
@router.post("/query", response_model=QueryResponse)
def handle_query(payload: QueryRequest, db: Session = Depends(get_db)):
    intent = classify_query(payload.text)
    if intent == "timetable_lookup":
        query_time = extract_time(payload.text)
        if query_time is None:
            return QueryResponse(
                answer="I couldn't understand the time in your question. Try something like 'What class do I have at 11?'",
                intent=intent,
            )
        day_of_week = extract_day(payload.text) or datetime.now().strftime("%A")
        if day_of_week in _WEEKEND_DAYS:
            return QueryResponse(answer=f"There's no class scheduled on {day_of_week}.", intent=intent)
        answer = get_class_at_time(db, payload.session_context.section_id, query_time, day_of_week)
        return QueryResponse(answer=answer, intent=intent)
    return QueryResponse(
        answer="I can currently only answer timetable questions like 'What class do I have at 11 on Monday?'. More query types are coming in later milestones.",
        intent=intent,
    )