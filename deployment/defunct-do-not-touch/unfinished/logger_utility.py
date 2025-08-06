"""
Centralized logging configuration for the drone system.
Provides consistent logging across all components.
"""

import logging
import logging.handlers
import os
from pathlib import Path
from datetime import datetime
import json

from config import LOG_CONFIG

class DroneSystemLogger:
    """Custom logger with drone-specific formatting and features"""
    
    @staticmethod
    def setup_logger(name: str, 
                    log_file: str = None,
                    level: str = None) -> logging.Logger:
        """Set up a logger with consistent configuration"""
        
        logger = logging.getLogger(name)
        
        # Use provided level or default from config
        log_level = getattr(logging, level or LOG_CONFIG['level'])
        logger.setLevel(log_level)
        
        # Prevent duplicate handlers
        if logger.handlers:
            return logger
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        simple_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)
        
        # File handler
        if log_file:
            file_path = Path(log_file)
        else:
            # Use component-specific log file
            log_dir = Path(LOG_CONFIG['file']).parent
            log_dir.mkdir(exist_ok=True)
            file_path = log_dir / f"{name}.log"
        
        file_handler = logging.handlers.RotatingFileHandler(
            file_path,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=LOG_CONFIG.get('backup_count', 5)
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)
        
        return logger

class MissionLogger:
    """Specialized logger for mission events"""
    
    def __init__(self, mission_id: str):
        self.mission_id = mission_id
        self.logger = DroneSystemLogger.setup_logger(f"mission.{mission_id}")
        self.events = []
        
    def log_event(self, event_type: str, details: dict, level: str = "INFO"):
        """Log a mission event with structured data"""
        event = {
            "timestamp": datetime.now().isoformat(),
            "mission_id": self.mission_id,
            "event_type": event_type,
            "details": details
        }
        
        self.events.append(event)
        
        # Log to standard logger
        log_method = getattr(self.logger, level.lower())
        log_method(f"{event_type}: {json.dumps(details)}")
        
        return event
    
    def log_waypoint_reached(self, waypoint_id: str, position: dict):
        """Log waypoint arrival"""
        return self.log_event("waypoint_reached", {
            "waypoint_id": waypoint_id,
            "position": position,
            "time": datetime.now().isoformat()
        })
    
    def log_anomaly_detected(self, anomaly_type: str, 
                            location: dict, 
                            severity: str,
                            details: dict):
        """Log anomaly detection"""
        return self.log_event("anomaly_detected", {
            "type": anomaly_type,
            "location": location,
            "severity": severity,
            "details": details
        }, level="WARNING" if severity in ["high", "critical"] else "INFO")
    
    def log_data_synced(self, station_id: str, 
                       bulletin_count: int,
                       data_size_kb: float):
        """Log successful data sync"""
        return self.log_event("data_synced", {
            "station_id": station_id,
            "bulletin_count": bulletin_count,
            "data_size_kb": data_size_kb
        })
    
    def get_mission_timeline(self) -> list:
        """Get chronological list of mission events"""
        return sorted(self.events, key=lambda x: x["timestamp"])
    
    def save_mission_log(self, output_path: str = None):
        """Save mission log to file"""
        if not output_path:
            output_path = f"logs/missions/{self.mission_id}_timeline.json"
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump({
                "mission_id": self.mission_id,
                "start_time": self.events[0]["timestamp"] if self.events else None,
                "end_time": self.events[-1]["timestamp"] if self.events else None,
                "total_events": len(self.events),
                "timeline": self.get_mission_timeline()
            }, f, indent=2)
        
        self.logger.info(f"Mission log saved to {output_path}")

class TelemetryLogger:
    """High-frequency telemetry data logger"""
    
    def __init__(self, drone_id: str):
        self.drone_id = drone_id
        self.logger = DroneSystemLogger.setup_logger(f"telemetry.{drone_id}")
        self.buffer = []
        self.buffer_size = 100  # Flush every 100 entries
        
    def log_telemetry(self, telemetry_data: dict):
        """Buffer telemetry data for efficient writing"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "drone_id": self.drone_id,
            **telemetry_data
        }
        
        self.buffer.append(entry)
        
        # Flush buffer if full
        if len(self.buffer) >= self.buffer_size:
            self.flush()
    
    def flush(self):
        """Write buffered telemetry to file"""
        if not self.buffer:
            return
        
        # Create daily telemetry file
        date_str = datetime.now().strftime("%Y%m%d")
        telemetry_file = f"logs/telemetry/{self.drone_id}_{date_str}.jsonl"
        
        Path(telemetry_file).parent.mkdir(parents=True, exist_ok=True)
        
        # Append to JSONL file (one JSON object per line)
        with open(telemetry_file, 'a') as f:
            for entry in self.buffer:
                f.write(json.dumps(entry) + '\n')
        
        self.logger.debug(f"Flushed {len(self.buffer)} telemetry entries")
        self.buffer.clear()

# Convenience function for quick logger setup
def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance"""
    return DroneSystemLogger.setup_logger(name)