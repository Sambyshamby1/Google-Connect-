#!/usr/bin/env python3
"""
Main flight controller service.
Manages drone hardware interface and flight operations.
"""

import os
import sys
import time
import logging
import threading
from typing import Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DRONE_CONFIG, LOG_CONFIG
from drone_interface import DroneInterface
from simulated_drone import SimulatedDrone

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_CONFIG['level']),
    format=LOG_CONFIG['format'],
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_CONFIG['file'])
    ]
)

logger = logging.getLogger(__name__)

class FlightController:
    """Main flight controller service"""
    
    def __init__(self):
        self.drone: Optional[DroneInterface] = None
        self.running = False
        self.telemetry_thread: Optional[threading.Thread] = None
        
    def initialize(self):
        """Initialize drone connection"""
        mode = DRONE_CONFIG['mode']
        logger.info(f"Initializing flight controller in {mode} mode")
        
        if mode == 'real':
            # Check for hardware
            if os.path.exists('/dev/ttyUSB0'):
                try:
                    from mavlink_drone import MAVLinkDrone
                    self.drone = MAVLinkDrone()
                    logger.info("Using real drone via MAVLink")
                except Exception as e:
                    logger.error(f"Failed to initialize MAVLink drone: {e}")
                    logger.info("Falling back to simulated drone")
                    self.drone = SimulatedDrone()
            else:
                logger.warning("No drone hardware detected, using simulation")
                self.drone = SimulatedDrone()
        else:
            self.drone = SimulatedDrone()
        
        # Connect to drone
        if self.drone.connect():
            logger.info("✓ Drone connected successfully")
            return True
        else:
            logger.error("Failed to connect to drone")
            return False
    
    def start_telemetry_stream(self):
        """Start streaming telemetry data"""
        def stream_telemetry():
            while self.running:
                try:
                    telemetry = self.drone.get_telemetry()
                    
                    # Log telemetry
                    logger.debug(f"Telemetry: Battery={telemetry.battery_percent}%, "
                               f"Alt={telemetry.position.altitude}m, "
                               f"Speed={telemetry.speed}m/s")
                    
                    # In production, publish to message queue
                    # self.publish_telemetry(telemetry)
                    
                    time.sleep(1)  # 1Hz update rate
                    
                except Exception as e:
                    logger.error(f"Telemetry error: {e}")
                    time.sleep(5)
        
        self.telemetry_thread = threading.Thread(target=stream_telemetry, daemon=True)
        self.telemetry_thread.start()
        logger.info("Telemetry streaming started")
    
    def run(self):
        """Main service loop"""
        self.running = True
        
        # Initialize drone
        if not self.initialize():
            logger.error("Failed to initialize, exiting")
            return
        
        # Start telemetry
        self.start_telemetry_stream()
        
        logger.info("Flight controller running. Press Ctrl+C to stop.")
        
        try:
            while self.running:
                # Main loop - handle commands, monitor health, etc.
                time.sleep(1)
                
                # Check drone health
                telemetry = self.drone.get_telemetry()
                
                # Low battery warning
                if telemetry.battery_percent < 30:
                    logger.warning(f"LOW BATTERY: {telemetry.battery_percent}%")
                
                # Critical battery - auto RTL
                if telemetry.battery_percent < DRONE_CONFIG['battery_rtl']:
                    if telemetry.is_armed:
                        logger.critical("CRITICAL BATTERY - Initiating RTL")
                        self.drone.return_to_launch()
                
        except KeyboardInterrupt:
            logger.info("Shutdown requested")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Clean shutdown"""
        logger.info("Shutting down flight controller...")
        self.running = False
        
        # Land if flying
        if self.drone and self.drone.get_telemetry().is_armed:
            logger.warning("Drone is armed, initiating emergency land")
            self.drone.land()
            time.sleep(5)  # Wait for landing
        
        # Disconnect
        if self.drone:
            self.drone.disconnect()
        
        logger.info("Flight controller stopped")

def main():
    """Entry point"""
    controller = FlightController()
    controller.run()

if __name__ == "__main__":
    main()