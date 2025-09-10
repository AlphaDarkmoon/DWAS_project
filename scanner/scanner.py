import subprocess
import json
import os
from pathlib import Path

# Get the conda environment path
CONDA_ENV_PATH = os.environ.get('CONDA_PREFIX', '/home/rex/miniconda3/envs/DWAS_env')

def run_bandit(project_path: Path):
    bandit_path = f"{CONDA_ENV_PATH}/bin/bandit"
    result = subprocess.run(
        [bandit_path, "-r", str(project_path), "-f", "json"],
        capture_output=True, text=True
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"error": "Bandit scan failed"}

def run_semgrep(project_path: Path):
    semgrep_path = f"{CONDA_ENV_PATH}/bin/semgrep"
    result = subprocess.run(
        [semgrep_path, "--config=auto", str(project_path), "--json"],
        capture_output=True, text=True
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"error": "Semgrep scan failed"}

def run_pip_audit(project_path: Path):
    requirements = project_path / "requirements.txt"
    if not requirements.exists():
        return {"vulnerabilities_found": 0, "details": []}
    
    pip_audit_path = f"{CONDA_ENV_PATH}/bin/pip-audit"
    result = subprocess.run(
        [pip_audit_path, "-r", str(requirements), "-f", "json"],
        capture_output=True, text=True
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"error": "pip-audit failed"}

def run_pylint(project_path: Path):
    py_files = list(project_path.rglob("*.py"))
    results = []
    for f in py_files:
        pylint_path = f"{CONDA_ENV_PATH}/bin/pylint"
        result = subprocess.run([pylint_path, str(f), "-f", "json"], capture_output=True, text=True)
        try:
            results.append(json.loads(result.stdout))
        except:
            results.append({"file": str(f), "error": "pylint failed"})
    return results

def scan_project(project_path: Path):
    """
    Real scanner integrating:
    - Static code analysis (Bandit + Semgrep)
    - Dependency vulnerabilities (pip-audit)
    - Coding standards (pylint)
    """
    bandit_results = run_bandit(project_path)
    semgrep_results = run_semgrep(project_path)
    pip_audit_results = run_pip_audit(project_path)
    pylint_results = run_pylint(project_path)
    
    return {
        "static_code_analysis": {
            "bandit": bandit_results,
            "semgrep": semgrep_results
        },
        "dependency_scan": pip_audit_results,
        "coding_standards": pylint_results,
        "summary": "Scan completed"
    }
