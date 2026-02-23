"""
Database session management
For now, using existing SQLite setup
"""
from contextlib import contextmanager
import sqlite3
from pathlib import Path


# Use existing database
DB_PATH = Path(__file__).parent.parent.parent.parent / "family_health.db"


@contextmanager
def get_db():
    """
    Get database session (context manager)

    Usage:
        with get_db() as conn:
            # use connection
    """
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def get_db_connection():
    """
    Get database connection (for dependency injection)

    Returns:
        Database connection
    """
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn
