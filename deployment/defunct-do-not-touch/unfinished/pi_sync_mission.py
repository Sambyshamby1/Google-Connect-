"""
Pi Station synchronization mission implementation.
Optimizes route between stations and handles data collection.
"""

import json
import logging
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from flight_control.drone_interface import DroneInterface, GPSPosition
from .mission_types import Mission, MissionStatus, MissionResult
from .route_optimizer import RouteOptimizer

logger = logging.getLogger(__name__)

class PiSyncMission(Mission):
    """Mission to sync data from Pi stations across the camp"""
    
    def __init__(self, 
                 drone: DroneInterface,
                 stations: List[Dict[str, Any]],
                 hover_duration: int = 30):
        super().__init__(drone, "pi_sync")
        self.stations = stations
        self.hover_duration = hover_duration
        self.route_optimizer = RouteOptimizer()
        self.synced_data = []
        
    def plan(self) -> bool:
        """Plan the mission route"""
        logger.info(f"Planning Pi sync mission for {len(self.stations)} stations")
        
        # Convert stations to GPS positions
        positions = []
        for station in self.stations:
            positions.append(GPSPosition(
                station['latitude'],
                station['longitude'],
                50.0  # Standard altitude
            ))
        
        # Optimize route
        self.route = self.route_optimizer.optimize_route(
            self.drone.home_position,
            positions
        )
        
        # Calculate mission time
        total_distance = self._calculate_total_distance()
        flight_time = total_distance / 10.0  # 10 m/s average speed
        hover_time = len(self.stations) * self.hover_duration
        self.estimated_duration = flight_time + hover_time
        
        logger.info(f"Route planned: {len(self.route)} waypoints")
        logger.info(f"Estimated duration: {self.estimated_duration:.1f} seconds")
        
        return True
    
    def validate(self) -> bool:
        """Validate mission parameters"""
        if not self.stations:
            logger.error("No Pi stations configured")
            return False
        
        if len(self.stations) > 20:
            logger.error("Too many stations for single mission")
            return False
        
        # Check battery for mission
        telemetry = self.drone.get_telemetry()
        required_battery = self.estimated_duration / 30  # Rough estimate
        
        if telemetry.battery_percent < required_battery + 20:  # 20% margin
            logger.error(f"Insufficient battery: {telemetry.battery_percent}%")
            return False
        
        return True
    
    def execute(self) -> MissionResult:
        """Execute the Pi sync mission"""
        self.status = MissionStatus.EXECUTING
        self.start_time = datetime.now()
        
        try:
            # Preflight checks
            if not self._preflight_check():
                return self._mission_failed("Preflight check failed")
            
            # Takeoff
            logger.info("Taking off for Pi sync mission")
            if not self.drone.takeoff():
                return self._mission_failed("Takeoff failed")
            
            # Visit each station
            for i, (position, station) in enumerate(zip(self.route[1:-1], self.stations)):
                logger.info(f"Station {i+1}/{len(self.stations)}: {station['id']}")
                
                # Fly to station
                if not self.drone.fly_to(position):
                    logger.error(f"Failed to reach station {station['id']}")
                    continue
                
                # Hover and sync
                logger.info(f"Syncing with {station['id']}...")
                sync_result = self._sync_with_station(station)
                
                if sync_result:
                    self.synced_data.append(sync_result)
                    logger.info(f"✓ Synced {sync_result['bulletin_count']} bulletins")
                else:
                    logger.warning(f"Failed to sync with {station['id']}")
                
                # Check battery
                if self.drone.get_telemetry().battery_percent < 30:
                    logger.warning("Low battery, returning home")
                    break
            
            # Return to launch
            logger.info("Mission complete, returning to launch")
            self.drone.return_to_launch()
            
            # Process results
            return self._process_results()
            
        except Exception as e:
            logger.error(f"Mission failed: {e}")
            return self._mission_failed(str(e))
    
    def _sync_with_station(self, station: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Sync data with a Pi station"""
        
        # Start hovering
        self.drone.hover(self.hover_duration)
        
        # Simulate WiFi connection and data transfer
        # In production, this would use actual WiFi APIs
        sync_data = {
            "station_id": station['id'],
            "timestamp": datetime.now().isoformat(),
            "bulletin_count": 0,
            "bulletins": {
                "family_searches": [],
                "medical_alerts": [],
                "resource_needs": []
            }
        }
        
        # Load sample data (in production, this would be real WiFi sync)
        sample_file = Path("sample_outputs/pi_station_data.json")
        if sample_file.exists():
            with open(sample_file) as f:
                template = json.load(f)
                
                # Customize for this station
                sync_data['bulletins'] = template.get('bulletins', {})
                sync_data['bulletin_count'] = sum(
                    len(v) for v in sync_data['bulletins'].values()
                )
        else:
            # Generate mock data
            import random
            bulletin_count = random.randint(10, 50)
            sync_data['bulletin_count'] = bulletin_count
            
            # Add some sample bulletins
            if random.random() > 0.3:
                sync_data['bulletins']['family_searches'].append({
                    "id": f"fs_{station['id']}_{int(time.time())}",
                    "seeker": "Mother",
                    "seeking": "Daughter, age 8-10",
                    "last_seen": "Near medical tent",
                    "contact": station['id']
                })
            
            if random.random() > 0.5:
                sync_data['bulletins']['medical_alerts'].append({
                    "type": "supply_shortage",
                    "item": "Insulin",
                    "urgency": "high",
                    "quantity_needed": "20 vials"
                })
        
        return sync_data
    
    def _process_results(self) -> MissionResult:
        """Process and save mission results"""
        
        total_bulletins = sum(d['bulletin_count'] for d in self.synced_data)
        
        # Analyze collected data
        family_searches = []
        medical_alerts = []
        resource_needs = []
        
        for station_data in self.synced_data:
            bulletins = station_data['bulletins']
            family_searches.extend(bulletins.get('family_searches', []))
            medical_alerts.extend(bulletins.get('medical_alerts', []))
            resource_needs.extend(bulletins.get('resource_needs', []))
        
        # Create result
        result = MissionResult(
            mission_id=self.mission_id,
            mission_type=self.mission_type,
            status=MissionStatus.COMPLETED,
            start_time=self.start_time,
            end_time=datetime.now(),
            data={
                "stations_visited": len(self.synced_data),
                "total_bulletins": total_bulletins,
                "family_searches": len(family_searches),
                "medical_alerts": len(medical_alerts),
                "resource_needs": len(resource_needs),
                "synced_stations": [d['station_id'] for d in self.synced_data]
            },
            alerts=self._generate_alerts(medical_alerts, family_searches),
            summary=f"Synced {total_bulletins} bulletins from {len(self.synced_data)} stations"
        )
        
        # Save detailed data
        self._save_mission_data(result)
        
        self.status = MissionStatus.COMPLETED
        return result
    
    def _generate_alerts(self, 
                        medical_alerts: List[Dict],
                        family_searches: List[Dict]) -> List[Dict[str, Any]]:
        """Generate alerts from collected data"""
        alerts = []
        
        # Check for urgent medical needs
        urgent_medical = [m for m in medical_alerts if m.get('urgency') == 'high']
        if urgent_medical:
            alerts.append({
                "type": "medical_urgent",
                "severity": "high",
                "description": f"{len(urgent_medical)} urgent medical supply requests",
                "action_required": "Deploy medical supplies immediately",
                "details": urgent_medical
            })
        
        # Check for missing children
        missing_children = [f for f in family_searches 
                          if 'child' in f.get('seeking', '').lower() 
                          or 'daughter' in f.get('seeking', '').lower()
                          or 'son' in f.get('seeking', '').lower()]
        
        if missing_children:
            alerts.append({
                "type": "missing_children",
                "severity": "high",
                "description": f"{len(missing_children)} missing children reported",
                "action_required": "Alert security and aid teams",
                "details": missing_children
            })
        
        return alerts
    
    def _calculate_total_distance(self) -> float:
        """Calculate total mission distance"""
        if not self.route:
            return 0
        
        total = 0
        for i in range(len(self.route) - 1):
            total += self.route[i].distance_to(self.route[i + 1])
        
        return total
    
    def _save_mission_data(self, result: MissionResult):
        """Save detailed mission data"""
        output_dir = Path("sample_outputs")
        output_dir.mkdir(exist_ok=True)
        
        filename = f"pi_sync_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_dir / filename, 'w') as f:
            json.dump({
                "mission": result.__dict__,
                "detailed_data": self.synced_data
            }, f, indent=2, default=str)
        
        logger.info(f"Mission data saved to {filename}")