import re
from typing import Optional

_CLASS_KEYWORDS = ("class", "period", "lecture")
_DAY_NAMES = ("monday","tuesday","wednesday","thursday","friday","saturday","sunday")
_TIME_PATTERN = re.compile(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", re.IGNORECASE)

def classify_query(text: str) -> str:
    lowered = text.lower()
    if any(k in lowered for k in _CLASS_KEYWORDS) and extract_time(text) is not None:
        return "timetable_lookup"
    return "unknown"

def extract_time(text: str) -> Optional[str]:
    match = _TIME_PATTERN.search(text)
    if not match:
        return None
    hour = int(match.group(1))
    if hour > 23:
        return None
    minute = int(match.group(2)) if match.group(2) else 0
    if minute > 59:
        return None
    period = match.group(3)
    if period:
        period = period.lower()
        if period == "pm" and hour != 12:
            hour += 12
        elif period == "am" and hour == 12:
            hour = 0
    elif 1 <= hour <= 7:
        hour += 12
    return f"{hour:02d}:{minute:02d}"

def extract_day(text: str) -> Optional[str]:
    lowered = text.lower()
    for day in _DAY_NAMES:
        if day in lowered:
            return day.capitalize()
    return None