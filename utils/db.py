import sqlite3
from typing import Optional, Dict, Any
import json
from datetime import datetime
from pathlib import Path

# Use backend database directory
PROJECT_ROOT = Path(__file__).parent
DB_PATH = str(PROJECT_ROOT / "backend" / "family_health.db")

# Fallback to root database if backend doesn't exist
if not Path(DB_PATH).exists():
    DB_PATH = str(PROJECT_ROOT / "family_health.db")

def init_db():
    """
    Initialize database and create tables if they don't exist.

    Returns:
        dict: Database initialization status with actual checks
    """
    try:
        # Check if database file exists and is accessible
        db_exists = Path(DB_PATH).exists()
        db_writable = False

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # Check if we can write to the database
        try:
            cur.execute("SELECT 1")
            db_writable = True
        except sqlite3.Error:
            pass

        # Create reports table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            visibility TEXT NOT NULL,
            report_text TEXT NOT NULL,
            extracted_json TEXT,
            patient_view TEXT,
            family_view TEXT,
            urgency TEXT,
            created_at TEXT NOT NULL
        )
        """)

        # Create reminders table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            title TEXT NOT NULL,
            due_date TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        # Verify tables were created
        cur.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN ('reports', 'reminders')
        """)
        tables = {row[0] for row in cur.fetchall()}

        conn.commit()
        conn.close()

        return {
            "status": "healthy",
            "database_exists": db_exists,
            "database_writable": db_writable,
            "tables_created": len(tables),
            "tables": list(tables),
            "db_path": DB_PATH
        }

    except sqlite3.Error as e:
        return {
            "status": "error",
            "error": str(e),
            "db_path": DB_PATH
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Unexpected error: {str(e)}",
            "db_path": DB_PATH
        }


def check_db_health():
    """
    Check database health status.

    Returns:
        dict: Database health status
    """
    try:
        if not Path(DB_PATH).exists():
            return {
                "status": "unhealthy",
                "error": "Database file does not exist",
                "db_path": DB_PATH
            }

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # Check if we can query the database
        cur.execute("SELECT 1")

        # Check if required tables exist
        cur.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN ('reports', 'reminders')
        """)
        tables = {row[0] for row in cur.fetchall()}

        # Count reports
        cur.execute("SELECT COUNT(*) FROM reports")
        report_count = cur.fetchone()[0]

        conn.close()

        all_tables_present = tables == {"reports", "reminders"}

        return {
            "status": "healthy" if all_tables_present else "degraded",
            "db_path": DB_PATH,
            "tables_present": list(tables),
            "all_tables_present": all_tables_present,
            "report_count": report_count
        }

    except sqlite3.Error as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "db_path": DB_PATH
        }

def insert_report(owner: str, visibility: str, report_text: str,
                  extracted: Optional[Dict[str, Any]], patient_view: str,
                  family_view: str, urgency: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO reports(owner, visibility, report_text, extracted_json, patient_view, family_view, urgency, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        owner,
        visibility,
        report_text,
        json.dumps(extracted, ensure_ascii=False) if extracted else None,
        patient_view,
        family_view,
        urgency,
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()

def list_reports_for_user(viewer: str):
    # MVP：简单规则演示
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    SELECT id, owner, visibility, urgency, created_at
    FROM reports
    ORDER BY id DESC
    """)
    rows = cur.fetchall()
    conn.close()

    visible = []
    for rid, owner, vis, urg, ts in rows:
        if viewer == owner:
            visible.append((rid, owner, vis, urg, ts))
        else:
            if vis in ("SHARED_SUMMARY", "CAREGIVER"):
                visible.append((rid, owner, vis, urg, ts))
    return visible

def get_report(report_id: int):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    SELECT id, owner, visibility, report_text, extracted_json, patient_view, family_view, urgency, created_at
    FROM reports WHERE id=?
    """, (report_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    rid, owner, vis, text, extracted_json, pview, fview, urg, ts = row
    return {
        "id": rid, "owner": owner, "visibility": vis,
        "report_text": text,
        "extracted": json.loads(extracted_json) if extracted_json else None,
        "patient_view": pview, "family_view": fview,
        "urgency": urg, "created_at": ts
    }
