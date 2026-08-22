import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")
_env_url = os.getenv("DATABASE_URL")

if _env_url and not _env_url.startswith("sqlite"):
    DATABASE_URL = f"sqlite:///{REPO_ROOT / 'harvis.db'}"
elif _env_url:
    DATABASE_URL = _env_url
else:
    DATABASE_URL = f"sqlite:///{REPO_ROOT / 'harvis.db'}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()