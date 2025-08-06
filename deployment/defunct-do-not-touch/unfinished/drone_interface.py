"""
Abstract drone interface for hardware abstraction.
Allows seamless switching between real and simulated drones.
"""

from abc import ABC, abstractmethod
from typing import Tuple, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class GPSPosition:
    """GPS coordinates with altitude"""
    latitude: float
    longitude: float
    altitude: float = 50.0  # meters
    
    def distance_to(self, other: 'GPSPosition') -> float:
        """Calculate distance in meters using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371000  # Earth radius in meters
        lat1, lon1 = radians(self.latitude), radians(self.longitude)
        lat2, lon2 = radians(other.latitude), radians(other.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c

@dataclass
class TelemetryData:
    """Drone telemetry information"""
    position: GPSPosition
    battery_percent: float
    heading: float  # degrees
    speed: float    # m/s
    is_armed: bool
    flight_mode: str
    temperature: float  # Celsius
    wind_speed: float   # m/s
    timestamp: datetime

@dataclass
class ThermalData:
    """Thermal sensor data"""
    grid: List[List[float]]  # Temperature grid
    min_temp: float
    max_temp: float
    avg_temp: float
    timestamp: datetime

class DroneInterface(ABC):
    """Abstract base class for drone control"""
    
    def __init__(self):
        self.home_position: Optional[GPSPosition] = None
        self.current_mission: Optional[str] = None
        self.is_connected: bool = False
        
    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to drone"""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Close connection to drone"""
        pass
    
    @abstractmethod
    def arm(self) -> bool:
        """Arm the drone motors"""
        pass
    
    @abstractmethod
    def disarm(self) -> bool:
        """Disarm the drone motors"""
        pass
    
    @abstractmethod
    def takeoff(self, altitude: float = 50.0) -> bool:
        """Take off to specified altitude"""
        pass
    
    @abstractmethod
    def land(self) -> bool:
        """Land at current position"""
        pass
    
    @abstractmethod
    def return_to_launch(self) -> bool:
        """Return to home position and land"""
        pass
    
    @abstractmethod
    def fly_to(self, position: GPSPosition, speed: float = 10.0) -> bool:
        """Fly to specified GPS position"""
        pass
    
    @abstractmethod
    def hover(self, duration: int) -> bool:
        """Hover at current position for specified duration"""
        pass
    
    @abstractmethod
    def get_telemetry(self) -> TelemetryData:
        """Get current telemetry data"""
        pass
    
    @abstractmethod
    def get_thermal_data(self) -> ThermalData:
        """Get thermal camera data"""
        pass
    
    @abstractmethod
    def capture_image(self) -> bytes:
        """Capture image from main camera"""
        pass
    
    @abstractmethod
    def set_geofence(self, boundary: List[GPSPosition]) -> bool:
        """Set operational boundary"""
        pass
    
    def preflight_check(self) -> Dict[str, bool]:
        """Run preflight checks"""
        checks = {
            'connection': self.is_connected,
            'battery': self.get_telemetry().battery_percent > 90,
            'gps_fix': True,  # Simplified
            'sensors': True,  # Simplified
            'geofence': True, # Simplified
        }
        
        all_passed = all(checks.values())
        logger.info(f"Preflight checks: {'PASSED' if all_passed else 'FAILED'}")
        for check, status in checks.items():
            logger.debug(f"  {check}: {'✓' if status else '✗'}")
            
        return checks
    
    def emergency_land(self) -> bool:
        """Emergency landing procedure"""
        logger.warning("EMERGENCY LAND INITIATED")
        return self.land()
    
    def get_status_summary(self) -> Dict[str, any]:
        """Get human-readable status summary"""
        telemetry = self.get_telemetry()
        return {
            'connected': self.is_connected,
            'armed': telemetry.is_armed,
            'mode': telemetry.flight_mode,
            'battery': f"{telemetry.battery_percent}%",
            'position': f"{telemetry.position.latitude:.6f}, {telemetry.position.longitude:.6f}",
            'altitude': f"{telemetry.position.altitude}m",
            'speed': f"{telemetry.speed}m/s",
        }