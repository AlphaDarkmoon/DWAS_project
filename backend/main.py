# File: backend/main.py

from fastapi import FastAPI, UploadFile, File, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pathlib import Path
import shutil, uuid, json
from zipfile import ZipFile
from sqlalchemy.orm import Session
import traceback
from datetime import datetime

from backend.tasks import run_scan_task
from scanner.scanner import scan_project
from backend.database import SessionLocal, engine
from backend.models import Job
from backend.logger import logger

app = FastAPI(title="Django Project Analyzer with SQLite")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log server startup
logger.info("BACKEND", "FastAPI server starting", {
    "title": "Django Project Analyzer with SQLite",
    "cors_origins": ["http://localhost:5173", "http://localhost:3000"]
})

# ---------------------------
# Directories
# ---------------------------
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)


# ---------------------------
# Database Dependency
# ---------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------
# Extract zip
# ---------------------------
def extract_zip(file_path: Path, extract_to: Path):
    extract_to.mkdir(exist_ok=True)
    with ZipFile(file_path, "r") as zip_ref:
        zip_ref.extractall(extract_to)
    return extract_to


# ---------------------------
# Background scanning task
# ---------------------------
def run_scan(job_id: str, extract_path: Path):
    """
    Runs scan in background and updates DB
    """
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.job_id == job_id).first()
        if not job:
            return

        # mark job as running
        job.status = "running"
        job.updated_at = datetime.utcnow()
        db.commit()

        # Run scan
        scan_result = scan_project(extract_path)

        # Save results
        job.status = "completed"
        job.result = json.dumps(scan_result)
        job.summary = f"Scan finished with {len(scan_result.get('issues', []))} issues"
        job.completed_at = datetime.utcnow()
        job.updated_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        job = db.query(Job).filter(Job.job_id == job_id).first()
        if job:
            job.status = "failed"
            job.result = json.dumps({"error": str(e), "trace": traceback.format_exc()})
            job.updated_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


# ---------------------------
# Health Check
# ---------------------------
@app.get("/")
def root():
    logger.info("BACKEND", "Root endpoint accessed")
    return {"message": "DWAS Scanner API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    logger.info("BACKEND", "Health check endpoint accessed")
    return {"status": "healthy", "message": "API is accessible"}

@app.get("/logs")
def get_logs():
    logger.info("BACKEND", "Logs endpoint accessed")
    return {
        "logs": logger.get_logs(),
        "total_logs": len(logger.get_logs())
    }

@app.delete("/logs")
def clear_logs():
    logger.info("BACKEND", "Clear logs endpoint accessed")
    logger.clear_logs()
    return {"message": "Logs cleared successfully"}

# ---------------------------
# Upload & Scan
# ---------------------------
@app.post("/upload")
async def upload_project(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        logger.info("BACKEND", "Upload request received", {
            "filename": file.filename,
            "content_type": file.content_type,
            "file_size": file.size
        })
        
        print(f"Received upload request for file: {file.filename}")
        print(f"Content type: {file.content_type}")
        print(f"File size: {file.size}")
        
        # Validate file
        if not file.filename:
            logger.error("BACKEND", "No filename provided")
            raise ValueError("No filename provided")
        
        if not file.filename.endswith('.zip'):
            logger.error("BACKEND", "File is not a ZIP file", {"filename": file.filename})
            raise ValueError("File must be a ZIP file")
        
        job_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{job_id}_{file.filename}"
        
        logger.info("BACKEND", "Processing upload", {
            "job_id": job_id,
            "file_path": str(file_path)
        })
        
        print(f"Job ID: {job_id}")
        print(f"File path: {file_path}")

        # Save uploaded zip
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        logger.info("BACKEND", "File saved successfully", {"file_path": str(file_path)})
        print(f"File saved successfully to: {file_path}")

        # Extract zip
        extract_path = UPLOAD_DIR / f"{job_id}_extracted"
        extract_zip(file_path, extract_path)
        
        logger.info("BACKEND", "File extracted successfully", {"extract_path": str(extract_path)})
        print(f"File extracted to: {extract_path}")

        # Create pending job in DB
        job = Job(
            job_id=job_id,
            filename=file.filename,
            status="pending",
            result=json.dumps({}),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(job)
        db.commit()
        
        logger.info("BACKEND", "Job created in database", {"job_id": job_id})
        print(f"Job created in database: {job_id}")

        # Trigger Celery task
        run_scan_task.delay(job_id, str(extract_path))
        
        logger.info("BACKEND", "Celery task triggered", {"job_id": job_id})
        print(f"Celery task triggered for job: {job_id}")

        result = {"job_id": job_id, "status": "pending"}
        logger.info("BACKEND", "Upload completed successfully", result)
        return result
    
    except Exception as e:
        error_msg = str(e)
        logger.error("BACKEND", "Upload failed", {
            "error": error_msg,
            "traceback": traceback.format_exc()
        })
        print(f"Error in upload endpoint: {error_msg}")
        print(f"Traceback: {traceback.format_exc()}")
        raise e


# ---------------------------
# List All Jobs (summary)
# ---------------------------
@app.get("/jobs")
def get_all_jobs(db: Session = Depends(get_db)):
    all_jobs = db.query(Job).all()
    return [
        {
            "job_id": j.job_id,
            "filename": j.filename,
            "status": j.status,
            "summary": j.summary,
            "created_at": j.created_at,
            "updated_at": j.updated_at,
            "completed_at": j.completed_at,
        }
        for j in all_jobs
    ]


# ---------------------------
# Unified Job Details Endpoint
# ---------------------------
@app.get("/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        return {"error": "Job not found"}
    return {
        "job_id": job.job_id,
        "filename": job.filename,
        "status": job.status,
        "summary": job.summary,
        "result": json.loads(job.result),
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "completed_at": job.completed_at,
    }


# ---------------------------
# Delete a Job and Its Files
# ---------------------------
@app.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        return {"error": "Job not found"}

    # Delete DB record
    db.delete(job)
    db.commit()

    # Delete uploaded zip and extracted folder
    upload_path = UPLOAD_DIR / f"{job_id}_{job.filename}"
    extract_path = UPLOAD_DIR / f"{job_id}_extracted"
    for path in [upload_path, extract_path]:
        if path.exists():
            if path.is_file():
                path.unlink()
            elif path.is_dir():
                shutil.rmtree(path)

    return {"message": f"Job {job_id} deleted successfully"}


# ---------------------------
# Delete All Jobs
# ---------------------------
@app.delete("/jobs")
def delete_all_jobs(db: Session = Depends(get_db)):
    logger.info("BACKEND", "Delete all jobs endpoint accessed")
    
    # Get all jobs
    all_jobs = db.query(Job).all()
    deleted_count = len(all_jobs)
    
    if deleted_count == 0:
        return {"message": "No jobs to delete", "deleted_count": 0}
    
    # Delete all jobs from database
    for job in all_jobs:
        # Delete uploaded zip and extracted folder for each job
        upload_path = UPLOAD_DIR / f"{job.job_id}_{job.filename}"
        extract_path = UPLOAD_DIR / f"{job.job_id}_extracted"
        for path in [upload_path, extract_path]:
            if path.exists():
                if path.is_file():
                    path.unlink()
                elif path.is_dir():
                    shutil.rmtree(path)
        
        # Delete job from database
        db.delete(job)
    
    db.commit()
    
    logger.info("BACKEND", f"Deleted {deleted_count} jobs successfully")
    return {"message": f"All {deleted_count} jobs deleted successfully", "deleted_count": deleted_count}


# ---------------------------
# Report Generation
# ---------------------------
@app.get("/jobs/{job_id}/report/json")
def get_json_report(job_id: str, db: Session = Depends(get_db)):
    logger.info("BACKEND", f"JSON report requested for job {job_id}")
    
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        return {"error": "Job not found"}
    
    # Create comprehensive report
    report = {
        "job_info": {
            "job_id": job.job_id,
            "filename": job.filename,
            "status": job.status,
            "summary": job.summary,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "updated_at": job.updated_at.isoformat() if job.updated_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        },
        "scan_results": json.loads(job.result) if job.result else {},
        "report_metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "report_version": "1.0",
            "generator": "DWAS Scanner"
        }
    }
    
    # Save report to reports directory
    report_filename = f"{job_id}_report.json"
    report_path = REPORTS_DIR / report_filename
    
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    logger.info("BACKEND", f"JSON report generated: {report_path}")
    
    return FileResponse(
        path=report_path,
        filename=f"{job.filename}_security_report.json",
        media_type="application/json"
    )


@app.get("/jobs/{job_id}/report/pdf")
def get_pdf_report(job_id: str, db: Session = Depends(get_db)):
    logger.info("BACKEND", f"PDF report requested for job {job_id}")
    
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        return {"error": "Job not found"}
    
    # Get scan results
    scan_results = json.loads(job.result) if job.result else {}
    
    # Generate HTML report
    html_content = generate_html_report(job, scan_results)
    
    # For now, return HTML content with PDF headers
    # In a production environment, you would use a library like weasyprint or reportlab
    return Response(
        content=html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f"attachment; filename={job.filename}_security_report.html"
        }
    )


def generate_html_report(job, scan_results):
    """Generate HTML report that can be printed as PDF"""
    
    # Calculate scores and counts
    bandit_results = scan_results.get('static_code_analysis', {}).get('bandit', {}).get('results', [])
    semgrep_results = scan_results.get('static_code_analysis', {}).get('semgrep', {}).get('results', [])
    pip_audit_results = scan_results.get('dependency_analysis', {}).get('pip_audit', {}).get('vulnerabilities', [])
    
    total_issues = len(bandit_results) + len(semgrep_results) + len(pip_audit_results)
    critical_issues = len([r for r in bandit_results if r.get('issue_severity') == 'HIGH'])
    high_issues = len([r for r in bandit_results if r.get('issue_severity') == 'MEDIUM'])
    
    # Calculate security score
    score = 10
    score -= critical_issues * 3
    score -= high_issues * 1
    score -= (total_issues - critical_issues - high_issues) * 0.5
    score = max(0, min(10, score))
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>DWAS Security Report - {job.filename}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
            .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }}
            .header h1 {{ color: #333; margin: 0; }}
            .header .subtitle {{ color: #666; margin: 5px 0; }}
            .section {{ margin-bottom: 30px; }}
            .section h2 {{ color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }}
            .score {{ font-size: 24px; font-weight: bold; color: {'#28a745' if score >= 8 else '#ffc107' if score >= 6 else '#dc3545'}; }}
            .issue {{ background: #f8f9fa; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; }}
            .issue.medium {{ border-left-color: #ffc107; }}
            .issue.low {{ border-left-color: #28a745; }}
            .issue h4 {{ margin: 0 0 5px 0; color: #333; }}
            .issue p {{ margin: 5px 0; color: #666; }}
            .metadata {{ background: #f8f9fa; padding: 15px; border-radius: 5px; }}
            .metadata table {{ width: 100%; }}
            .metadata td {{ padding: 5px 0; }}
            .metadata td:first-child {{ font-weight: bold; width: 150px; }}
            @media print {{ body {{ margin: 20px; }} }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>DWAS Security Analysis Report</h1>
            <div class="subtitle">Project: {job.filename}</div>
            <div class="subtitle">Scan ID: {job.job_id}</div>
            <div class="subtitle">Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
        </div>
        
        <div class="section">
            <h2>Executive Summary</h2>
            <div class="metadata">
                <table>
                    <tr><td>Security Score:</td><td><span class="score">{score:.1f}/10</span></td></tr>
                    <tr><td>Total Issues:</td><td>{total_issues}</td></tr>
                    <tr><td>Critical Issues:</td><td>{critical_issues}</td></tr>
                    <tr><td>High Issues:</td><td>{high_issues}</td></tr>
                    <tr><td>Scan Status:</td><td>{job.status}</td></tr>
                    <tr><td>Scan Date:</td><td>{job.created_at.strftime('%Y-%m-%d %H:%M:%S') if job.created_at else 'N/A'}</td></tr>
                </table>
            </div>
        </div>
        
        <div class="section">
            <h2>Bandit Security Issues</h2>
            {generate_issues_html(bandit_results, 'bandit')}
        </div>
        
        <div class="section">
            <h2>Semgrep Security Issues</h2>
            {generate_issues_html(semgrep_results, 'semgrep')}
        </div>
        
        <div class="section">
            <h2>Dependency Vulnerabilities</h2>
            {generate_dependency_issues_html(pip_audit_results)}
        </div>
        
        <div class="section">
            <h2>Recommendations</h2>
            <ul>
                <li>Address all critical and high severity issues immediately</li>
                <li>Update vulnerable dependencies to their latest secure versions</li>
                <li>Implement regular security scanning in your CI/CD pipeline</li>
                <li>Review and fix medium and low severity issues when possible</li>
                <li>Consider implementing additional security measures based on the findings</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>Report Metadata</h2>
            <div class="metadata">
                <table>
                    <tr><td>Report Version:</td><td>1.0</td></tr>
                    <tr><td>Generator:</td><td>DWAS Scanner</td></tr>
                    <tr><td>Generated At:</td><td>{datetime.utcnow().isoformat()}</td></tr>
                </table>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_issues_html(issues, tool_name):
    """Generate HTML for security issues"""
    if not issues:
        return "<p>No issues found.</p>"
    
    html = ""
    for issue in issues[:20]:  # Limit to first 20 issues
        severity = issue.get('issue_severity', issue.get('severity', 'UNKNOWN')).lower()
        severity_class = severity if severity in ['high', 'medium', 'low'] else 'low'
        
        html += f"""
        <div class="issue {severity_class}">
            <h4>{issue.get('issue_text', issue.get('message', 'Unknown issue'))}</h4>
            <p><strong>Severity:</strong> {severity.upper()}</p>
            <p><strong>File:</strong> {issue.get('filename', 'Unknown')}</p>
            <p><strong>Line:</strong> {issue.get('line_number', 'Unknown')}</p>
            <p><strong>Description:</strong> {issue.get('issue_cwe', issue.get('description', 'No description available'))}</p>
        </div>
        """
    
    if len(issues) > 20:
        html += f"<p><em>... and {len(issues) - 20} more issues. See full JSON report for complete details.</em></p>"
    
    return html


def generate_dependency_issues_html(vulnerabilities):
    """Generate HTML for dependency vulnerabilities"""
    if not vulnerabilities:
        return "<p>No dependency vulnerabilities found.</p>"
    
    html = ""
    for vuln in vulnerabilities[:10]:  # Limit to first 10 vulnerabilities
        html += f"""
        <div class="issue">
            <h4>{vuln.get('package', 'Unknown package')}</h4>
            <p><strong>Version:</strong> {vuln.get('installed_version', 'Unknown')}</p>
            <p><strong>Vulnerability:</strong> {vuln.get('vulnerability', 'Unknown')}</p>
            <p><strong>Description:</strong> {vuln.get('description', 'No description available')}</p>
        </div>
        """
    
    if len(vulnerabilities) > 10:
        html += f"<p><em>... and {len(vulnerabilities) - 10} more vulnerabilities. See full JSON report for complete details.</em></p>"
    
    return html
