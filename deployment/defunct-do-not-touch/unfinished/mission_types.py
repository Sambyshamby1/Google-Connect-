"""
Base classes and types for drone missions.
Provides common interface for all mission types.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Optional
import uuid
import logging

from flight_control.drone_interface import DroneInterface, GPSPosition

logger = logging.getLogger(__name__)

class MissionStatus(Enum):
    """Mission execution status"""
    PENDING = "pending"
    PLANNING = "planning"
    READY = "ready"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    ABORTED = "aborted"

class AlertSeverity(Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class MissionAlert:
    """Alert generated during mission"""
    alert_id: str
    type: str
    severity: AlertSeverity
    description: str
    location: Optional[GPSPosition]
    action_required: str
    details: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class MissionResult:
    """Results from a completed mission"""
    mission_id: str
    mission_type: str
    status: MissionStatus
    start_time: datetime
    end_time: datetime
    data: Dict[str, Any]
    alerts: List[MissionAlert]
    summary: str
    flight_stats: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'mission_id': self.mission_id,
            'mission_type': self.mission_type,
            'status': self.status.value,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'duration_minutes': (self.end_time - self.start_time).total_seconds() / 60,
            'data': self.data,
            'alerts': [
                {
                    'alert_id': alert.alert_id,
                    'type': alert.type,
                    'severity': alert.severity.value,
                    'description': alert.description,
                    'action_required': alert.action_required,
                    'timestamp': alert.timestamp.isoformat()
                } for alert in self.alerts
            ],
            'summary': self.summary,
            'flight_stats': self.flight_stats
        }

class Mission(ABC):
    """Abstract base class for all mission types"""
    
    def __init__(self, drone: DroneInterface, mission_type: str):
        self.drone = drone
        self.mission_type = mission_type
        self.mission_id = f"{mission_type}_{uuid.uuid4().hex[:8]}"
        self.status = MissionStatus.PENDING
        self.created_at = datetime.now()
        self.start_time: Optional[datetime] = None
        self.alerts: List[MissionAlert] = []
        self.route: List[GPSPosition] = []
        self.estimated_duration: float = 0
        
        logger.info(f"Created mission: {self.mission_id}")
    
    @abstractmethod
    def plan(self) -> bool:
        """Plan the mission route and parameters"""
        pass
    
    @abstractmethod
    def validate(self) -> bool:
        """Validate mission can be executed safely"""
        pass
    
    @abstractmethod
    def execute(self) -> MissionResult:
        """Execute the mission"""
        pass
    
    def add_alert(self, 
                  alert_type: str,
                  severity: AlertSeverity,
                  description: str,
                  action_required: str,
                  location: Optional[GPSPosition] = None,
                  details: Optional[Dict[str, Any]] = None):
        """Add an alert to the mission"""
        alert = MissionAlert(
            alert_id=f"alert_{uuid.uuid4().hex[:8]}",
            type=alert_type,
            severity=severity,
            description=description,
            location=location,
            action_required=action_required,
            details=details or {}
        )
        self.alerts.append(alert)
        
        # Log critical alerts
        if severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL]:
            logger.warning(f"HIGH/CRITICAL Alert: {description}")
        
        # Emit to real-time systems
        self._emit_alert(alert)
        
        return alert
    
    def _emit_alert(self, alert: MissionAlert):
        """Emit alert to real-time monitoring systems"""
        # In production, this would send to WebSocket, database, etc.
        logger.info(f"Alert emitted: {alert.type} - {alert.severity.value}")
    
    def _preflight_check(self) -> bool:
        """Run standard preflight checks"""
        logger.info("Running preflight checks...")
        
        checks = self.drone.preflight_check()
        all_passed = all(checks.values())
        
        if not all_passed:
            failed = [k for k, v in checks.items() if not v]
            logger.error(f"Preflight checks failed: {failed}")
            
        return all_passed
    
    def _mission_failed(self, reason: str) -> MissionResult:
        """Create a failed mission result"""
        self.status = MissionStatus.FAILED
        
        return MissionResult(
            mission_id=self.mission_id,
            mission_type=self.mission_type,
            status=MissionStatus.FAILED,
            start_time=self.start_time or datetime.now(),
            end_time=datetime.now(),
            data={'failure_reason': reason},
            alerts=self.alerts,
            summary=f"Mission failed: {reason}"
        )
    
    def abort(self, reason: str = "User requested abort"):
        """Abort the mission"""
        logger.warning(f"Mission abort requested: {reason}")
        self.status = MissionStatus.ABORTED
        
        # Return to launch if flying
        if self.drone.get_telemetry().is_armed:
            logger.info("Initiating return to launch...")
            self.drone.return_to_launch()
    
    def get_progress(self) -> Dict[str, Any]:
        """Get current mission progress"""
        if not self.start_time:
            return {
                'status': self.status.value,
                'progress_percent': 0,
                'elapsed_time': 0
            }
        
        elapsed = (datetime.now() - self.start_time).total_seconds()
        progress = min(100, (elapsed / self.estimated_duration) * 100) if self.estimated_duration > 0 else 0
        
        return {
            'status': self.status.value,
            'progress_percent': round(progress, 1),
            'elapsed_time': round(elapsed, 1),
            'estimated_remaining': max(0, self.estimated_duration - elapsed),
            'current_position': self.drone.get_telemetry().position.__dict__ if self.drone.is_connected else None,
            'alerts_count': len(self.alerts)
        }

class ScheduledMission:
    """Container for scheduled missions"""
    
    def __init__(self, mission: Mission, scheduled_time: datetime, priority: int = 5):
        self.mission = mission
        self.scheduled_time = scheduled_time
        self.priority = priority  # 1-10, 1 being highest
        self.created_at = datetime.now()
        
    def is_ready(self) -> bool:
        """Check if mission is ready to execute"""
        return datetime.now() >= self.scheduled_time
    
    def __lt__(self, other):
        """For priority queue sorting"""
        # Sort by priority first, then scheduled time
        if self.priority != other.priority:
            return self.priority < other.priority
        return self.scheduled_time < other.scheduled_time