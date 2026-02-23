"""
Reports API endpoints
"""
import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from typing import List

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from utils.db import init_db, insert_report, list_reports_for_user, get_report
from backend.app.services.pii_redact import redact_pii
from backend.app.services.triage import triage_risk
from app.models.schemas import ReportCreate, ReportResponse
from app.services.model_service import ModelService

router = APIRouter()


@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    viewer: str = Query(..., description="Viewer (for permission checking)")
):
    """
    Get list of reports for a user (optimized single query)

    Args:
        viewer: The user viewing the reports (for permission checking)

    Returns:
        List of reports
    """
    import sqlite3
    from utils.db import DB_PATH

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        cur = conn.cursor()

        # Single query with permission filtering
        if viewer == "admin":
            # Admin sees all reports
            cur.execute("""
                SELECT id, owner, visibility, report_text, extracted_json,
                       patient_view, family_view, urgency, created_at
                FROM reports
                ORDER BY id DESC
                LIMIT 100
            """)
        else:
            # Regular users see their own + shared reports
            cur.execute("""
                SELECT id, owner, visibility, report_text, extracted_json,
                       patient_view, family_view, urgency, created_at
                FROM reports
                WHERE owner = ? OR visibility IN ('SHARED_SUMMARY', 'CAREGIVER')
                ORDER BY id DESC
                LIMIT 100
            """, (viewer,))

        rows = cur.fetchall()
        conn.close()

        result = []
        for row in rows:
            try:
                # Parse JSON fields
                import json
                extracted = json.loads(row["extracted_json"]) if row["extracted_json"] else None

                result.append(ReportResponse(
                    id=row["id"],
                    owner=row["owner"],
                    visibility=row["visibility"],
                    urgency=row["urgency"],
                    status="completed",
                    created_at=row["created_at"],
                    report_text=row["report_text"],
                    extracted=extracted,
                    patient_view=row["patient_view"],
                    family_view=row["family_view"]
                ))
            except Exception as e:
                print(f"ERROR creating response for report {row['id']}: {e}")

        return result

    except Exception as e:
        print(f"ERROR: Error listing reports: {e}")
        import traceback
        traceback.print_exc()
        return []


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report_detail(report_id: int):
    """
    Get detailed report by ID

    Args:
        report_id: Report ID

    Returns:
        Report details
    """
    detail = get_report(report_id)

    if not detail:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportResponse(
        id=detail['id'],
        owner=detail['owner'],
        visibility=detail['visibility'],
        urgency=detail['urgency'],
        status="completed",
        created_at=detail['created_at'],
        report_text=detail.get('report_text'),
        extracted=detail.get('extracted'),
        patient_view=detail.get('patient_view'),
        family_view=detail.get('family_view')
    )


@router.post("/reports", response_model=ReportResponse, status_code=202)
async def create_report(
    report_data: ReportCreate,
    background_tasks: BackgroundTasks
):
    """
    Create a new report (processed in background)

    Args:
        report_data: Report creation data
        background_tasks: FastAPI background tasks

    Returns:
        Created report (with status="processing")
    """
    import time
    from datetime import datetime

    # Create report immediately with processing status
    import sqlite3
    from utils.db import DB_PATH

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    now = datetime.utcnow().isoformat()

    cur.execute("""
        INSERT INTO reports(owner, visibility, report_text, urgency, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        report_data.owner,
        report_data.visibility.value,
        "[PROCESSING]",  # Placeholder
        "UNKNOWN",
        now
    ))

    report_id = cur.lastrowid
    conn.commit()
    conn.close()

    # Schedule background processing
    background_tasks.add_task(
        _process_report_task,
        report_id,
        report_data.report_text,
        report_data.owner,
        report_data.visibility.value
    )

    return ReportResponse(
        id=report_id,
        owner=report_data.owner,
        visibility=report_data.visibility.value,
        urgency="UNKNOWN",
        status="processing",
        created_at=now,
        report_text="[Processing in progress...]"
    )


async def _process_report_task(
    report_id: int,
    report_text: str,
    owner: str,
    visibility: str
):
    """Background task to process report"""
    import sqlite3
    import json
    from utils.db import DB_PATH

    print(f"[Background Task] Starting to process report {report_id}...")

    try:
        # Step 1: PII redaction
        print(f"[Background Task] Step 1: PII redaction...")
        redacted = redact_pii(report_text)

        # Step 2: Extract structured data
        print(f"[Background Task] Step 2: Extracting structured data...")
        model_service = ModelService.get_instance()
        extracted, _ = model_service.extract(redacted)
        print(f"[Background Task] Extraction result: {extracted is not None}")

        # Step 3: Risk triage
        print(f"[Background Task] Step 3: Risk triage...")
        if extracted:
            triage = triage_risk(extracted)
        else:
            triage = {"urgency": "UNKNOWN", "rationale": "Extraction failed"}

        # Step 4: Generate explanations
        print(f"[Background Task] Step 4: Generating explanations...")
        if extracted:
            patient_view = model_service.patient_view(extracted, triage)
            family_view = model_service.family_view(extracted, triage)
        else:
            patient_view = "⚠️ Unable to generate explanation due to extraction failure."
            family_view = "⚠️ Unable to generate explanation due to extraction failure."

        # Step 5: Update database
        print(f"[Background Task] Step 5: Updating database...")
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("""
            UPDATE reports
            SET report_text = ?,
                extracted_json = ?,
                patient_view = ?,
                family_view = ?,
                urgency = ?
            WHERE id = ?
        """, (
            redacted,
            json.dumps(extracted, ensure_ascii=False) if extracted else None,
            patient_view,
            family_view,
            triage["urgency"],
            report_id
        ))

        conn.commit()
        conn.close()

        print(f"✅ Report {report_id} processed successfully")

    except Exception as e:
        # Handle error with full traceback
        import traceback
        error_msg = f"{str(e)}\n\n{''.join(traceback.format_exc())}"
        print(f"❌ Error processing report {report_id}: {error_msg}")

        # Update database with error info
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()

            cur.execute("""
                UPDATE reports
                SET patient_view = ?,
                    family_view = ?
                WHERE id = ?
            """, (f"⚠️ Processing Error: {str(e)}", f"⚠️ Processing Error: {str(e)}", report_id))

            conn.commit()
            conn.close()
        except:
            print(f"❌ Failed to update error status for report {report_id}")


@router.delete("/reports/{report_id}")
async def delete_report(report_id: int):
    """
    Delete a report

    Args:
        report_id: Report ID to delete

    Returns:
        Success message
    """
    import sqlite3
    from utils.db import DB_PATH

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("DELETE FROM reports WHERE id = ?", (report_id,))

    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found")

    conn.commit()
    conn.close()

    return {"message": f"Report {report_id} deleted successfully"}
