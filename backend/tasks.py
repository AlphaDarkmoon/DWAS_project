# backend/tasks.py
from backend.celery_worker import celery_app
from scanner.scanner import scan_project
from backend.database import SessionLocal
from backend.models import Job
from datetime import datetime
import json
import traceback
from pathlib import Path


@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, extract_path: str):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.job_id == job_id).first()
        if not job:
            return

        # Mark job as ongoing
        job.status = "ongoing"
        job.updated_at = datetime.utcnow()
        db.commit()

        # Run the actual scan
        scan_result = scan_project(Path(extract_path))

        # Save result
        job.status = "completed"
        job.result = json.dumps(scan_result)
        job.summary = f"Scan finished with {len(scan_result.get('issues', []))} issues"
        job.completed_at = datetime.utcnow()
        job.updated_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        if job:
            job.status = "failed"
            job.result = json.dumps({"error": str(e), "trace": traceback.format_exc()})
            job.updated_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()
