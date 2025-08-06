"""
Simulated drone implementation for testing without hardware.
Provides realistic behavior and responses.
"""

import time
import random
import logging
from datetime import datetime
from typing import List, Optional
import numpy as np

from .drone_interface import (
    DroneInterface, GPSPosition, TelemetryData, 
    ThermalData
)

logger = logging.getLogger(__name__)

class SimulatedDrone(DroneInterface):
    """Simulated drone for testing and development"""
    
    def __init__(self):
        super().__init__()
        self.position = GPSPosition(32.4567, 35.8901, 0)  # Ground level
        self.battery = 100.0
        self.heading = 0.0
        self.speed = 0.0
        self.armed = False
        self.flying = False
        self.mode = "GROUND"
        self.start_time = datetime.now()
        
        # Simulation parameters
        self.battery_drain_rate = 0.05  # % per second while flying
        self.base_temp = 25.0  # Base temperature for thermal simulation
        
        logger.info("🚁 Simulated drone initialized")
    
    def connect(self) -> bool:
        """Simulate connection"""
        logger.info("Connecting to simulated drone...")
        time.sleep(1)  # Simulate connection delay
        self.is_connected = True
        self.home_position = GPSPosition(
            self.position.latitude,
            self.position.longitude,
            self.position.altitude
        )
        logger.info("✓ Connected to simulated drone")
        return True
    
    def disconnect(self) -> None:
        """Simulate disconnection"""
        self.is_connected = False
        logger.info("Disconnected from simulated drone")
    
    def arm(self) -> bool:
        """Simulate arming"""
        if not self.is_connected:
            logger.error("Cannot arm: Not connected")
            return False
        
        logger.info("Arming motors...")
        time.sleep(2)  # Simulate arming delay
        self.armed = True
        self.mode = "ARMED"
        logger.info("✓ Motors armed")
        return True
    
    def disarm(self) -> bool:
        """Simulate disarming"""
        if self.flying:
            logger.error("Cannot disarm while flying!")
            return False
        
        self.armed = False
        self.mode = "GROUND"
        logger.info("Motors disarmed")
        return True
    
    def takeoff(self, altitude: float = 50.0) -> bool:
        """Simulate takeoff"""
        if not self.armed:
            logger.error("Cannot takeoff: Not armed")
            return False
        
        logger.info(f"Taking off to {altitude}m...")
        
        # Simulate gradual altitude increase
        steps = 10
        for i in range(steps):
            self.position.altitude = (altitude / steps) * (i + 1)
            self.battery -= self.battery_drain_rate
            time.sleep(0.5)
            print(f"\r  Altitude: {self.position.altitude:.1f}m", end="")
        
        print()  # New line
        self.flying = True
        self.mode = "FLYING"
        logger.info(f"✓ Reached altitude: {altitude}m")
        return True
    
    def land(self) -> bool:
        """Simulate landing"""
        if not self.flying:
            logger.warning("Already on ground")
            return True
        
        logger.info("Landing...")
        current_alt = self.position.altitude
        
        # Simulate gradual descent
        steps = 10
        for i in range(steps):
            self.position.altitude = current_alt * (1 - (i + 1) / steps)
            self.battery -= self.battery_drain_rate * 0.5  # Less drain while descending
            time.sleep(0.3)
            print(f"\r  Altitude: {self.position.altitude:.1f}m", end="")
        
        print()  # New line
        self.position.altitude = 0
        self.flying = False
        self.mode = "GROUND"
        self.speed = 0
        logger.info("✓ Landed successfully")
        return True
    
    def return_to_launch(self) -> bool:
        """Simulate return to home"""
        if not self.flying:
            logger.error("Must be flying to RTL")
            return False
        
        logger.info("Returning to launch position...")
        self.mode = "RTL"
        
        # Fly to home position
        success = self.fly_to(self.home_position)
        if success:
            return self.land()
        return False
    
    def fly_to(self, position: GPSPosition, speed: float = 10.0) -> bool:
        """Simulate flying to position"""
        if not self.flying:
            logger.error("Must be flying to navigate")
            return False
        
        distance = self.position.distance_to(position)
        flight_time = distance / speed
        
        logger.info(f"Flying to ({position.latitude:.6f}, {position.longitude:.6f})")
        logger.info(f"Distance: {distance:.1f}m, ETA: {flight_time:.1f}s")
        
        # Simulate gradual position change
        steps = max(int(flight_time * 2), 10)
        start_lat = self.position.latitude
        start_lon = self.position.longitude
        
        for i in range(steps):
            progress = (i + 1) / steps
            self.position.latitude = start_lat + (position.latitude - start_lat) * progress
            self.position.longitude = start_lon + (position.longitude - start_lon) * progress
            self.battery -= self.battery_drain_rate * (flight_time / steps)
            self.speed = speed
            
            # Add some random wind effect
            self.position.latitude += random.uniform(-0.00001, 0.00001)
            self.position.longitude += random.uniform(-0.00001, 0.00001)
            
            time.sleep(flight_time / steps)
            
            # Check battery
            if self.battery < 25:
                logger.warning("Low battery! Initiating RTL")
                return False
        
        self.speed = 0
        logger.info("✓ Reached destination")
        return True
    
    def hover(self, duration: int) -> bool:
        """Simulate hovering"""
        if not self.flying:
            logger.error("Must be flying to hover")
            return False
        
        logger.info(f"Hovering for {duration} seconds...")
        self.speed = 0
        
        for i in range(duration):
            self.battery -= self.battery_drain_rate
            
            # Simulate minor position drift
            self.position.latitude += random.uniform(-0.000005, 0.000005)
            self.position.longitude += random.uniform(-0.000005, 0.000005)
            self.position.altitude += random.uniform(-0.5, 0.5)
            
            time.sleep(1)
            
            if i % 10 == 0:
                logger.debug(f"  Hovering... {duration - i}s remaining")
        
        logger.info("✓ Hover complete")
        return True
    
    def get_telemetry(self) -> TelemetryData:
        """Generate simulated telemetry"""
        # Simulate environmental conditions
        elapsed = (datetime.now() - self.start_time).total_seconds()
        temp = self.base_temp + 5 * np.sin(elapsed / 100) + random.uniform(-1, 1)
        wind = 5 + 3 * np.sin(elapsed / 50) + random.uniform(-2, 2)
        
        return TelemetryData(
            position=GPSPosition(
                self.position.latitude,
                self.position.longitude,
                self.position.altitude
            ),
            battery_percent=max(0, self.battery),
            heading=self.heading + random.uniform(-5, 5),
            speed=self.speed,
            is_armed=self.armed,
            flight_mode=self.mode,
            temperature=temp,
            wind_speed=wind,
            timestamp=datetime.now()
        )
    
    def get_thermal_data(self) -> ThermalData:
        """Generate simulated thermal data"""
        # Create 20x20 thermal grid
        grid_size = 20
        base_temp = 36.5  # Human body temperature
        
        # Create base grid with normal temperatures
        grid = np.random.normal(base_temp, 0.5, (grid_size, grid_size))
        
        # Randomly add fever clusters (10% chance)
        if random.random() < 0.1:
            # Add fever cluster
            cluster_x = random.randint(5, 15)
            cluster_y = random.randint(5, 15)
            cluster_size = random.randint(3, 5)
            
            for i in range(cluster_x - cluster_size, cluster_x + cluster_size):
                for j in range(cluster_y - cluster_size, cluster_y + cluster_size):
                    if 0 <= i < grid_size and 0 <= j < grid_size:
                        # Fever temperature
                        grid[i, j] = random.uniform(38.5, 39.5)
        
        return ThermalData(
            grid=grid.tolist(),
            min_temp=float(np.min(grid)),
            max_temp=float(np.max(grid)),
            avg_temp=float(np.mean(grid)),
            timestamp=datetime.now()
        )
    
    def capture_image(self) -> bytes:
        """Return simulated image data"""
        # In real implementation, this would capture from camera
        # For simulation, return placeholder
        return b"SIMULATED_IMAGE_DATA_" + datetime.now().isoformat().encode()
    
    def set_geofence(self, boundary: List[GPSPosition]) -> bool:
        """Simulate geofence setting"""
        logger.info(f"Geofence set with {len(boundary)} waypoints")
        return True