"""
database.py
------------
Sets up the connection to our SQLite database file (slopesafe.db).
SQLite stores everything in a single file on disk, so no separate
database server needs to be installed or run — perfect for a hackathon demo.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The database file will be created automatically in the backend/ folder.
SQLALCHEMY_DATABASE_URL = "sqlite:///./slopesafe.db"

# check_same_thread=False is required for SQLite when used with FastAPI,
# because FastAPI can handle requests using different threads.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal is a factory for creating new database sessions (connections).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class that all our table models (in models.py) inherit from.
Base = declarative_base()


def get_db():
    """
    A dependency function used by FastAPI endpoints.
    It opens a database session, hands it to the endpoint,
    and makes sure it's closed afterwards — even if an error happens.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
