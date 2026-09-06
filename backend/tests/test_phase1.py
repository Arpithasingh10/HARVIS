from backend.app.services.router import extract_time


def test_extract_time_with_am():
    assert extract_time("What class do I have at 11 AM?") == "11:00"


def test_extract_time_with_pm():
    assert extract_time("What class do I have at 3 PM?") == "15:00"


def test_extract_time_with_colon_pm():
    assert extract_time("What class do I have at 3:00 PM?") == "15:00"


def test_extract_time_without_period():
    assert extract_time("What class do I have at 3?") == "15:00"


def test_extract_time_24_hour():
    assert extract_time("What class do I have at 15:00?") == "15:00"


def test_extract_time_invalid_hour():
    assert extract_time("What class do I have at 25:00?") is None


def test_extract_time_invalid_minute():
    assert extract_time("What class do I have at 3:75 PM?") is None