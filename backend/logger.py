# Backend logging utility for debugging API communication
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

class BackendLogger:
    def __init__(self, log_file: str = "communication.log"):
        self.log_file = Path(log_file)
        self.logs = []
        self.max_logs = 1000
        
    def log(self, level: str, source: str, message: str, data: Optional[Dict[str, Any]] = None):
        """Log an entry with timestamp"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "source": source,
            "message": message,
            "data": data or {}
        }
        
        # Add to memory
        self.logs.append(entry)
        
        # Keep only the last max_logs entries
        if len(self.logs) > self.max_logs:
            self.logs = self.logs[-self.max_logs:]
        
        # Write to file
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            print(f"Failed to write to log file: {e}")
        
        # Also print to console
        print(f"[{entry['timestamp']}] {level} [{source}] {message}")
        if data:
            print(f"  Data: {json.dumps(data, indent=2)}")
    
    def info(self, source: str, message: str, data: Optional[Dict[str, Any]] = None):
        self.log("INFO", source, message, data)
    
    def error(self, source: str, message: str, data: Optional[Dict[str, Any]] = None):
        self.log("ERROR", source, message, data)
    
    def warn(self, source: str, message: str, data: Optional[Dict[str, Any]] = None):
        self.log("WARN", source, message, data)
    
    def debug(self, source: str, message: str, data: Optional[Dict[str, Any]] = None):
        self.log("DEBUG", source, message, data)
    
    def get_logs(self) -> list:
        """Get all logs from memory"""
        return self.logs.copy()
    
    def export_logs(self) -> str:
        """Export logs as JSON string"""
        return json.dumps(self.logs, indent=2)
    
    def clear_logs(self):
        """Clear logs from memory and file"""
        self.logs = []
        try:
            if self.log_file.exists():
                self.log_file.unlink()
        except Exception as e:
            print(f"Failed to clear log file: {e}")

# Global logger instance
logger = BackendLogger()
