"""
End-to-end test of full mission execution.
Tests the complete workflow from planning to analysis.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
import json
from datetime import datetime
from pathlib import Path

from flight_control.simulated_drone import SimulatedDrone
from mission_planner.pi_sync_mission import PiSyncMission
from mission_planner.mission_types import MissionStatus
from ai_analysis.gemma_analyzer import GemmaAnalyzer

class TestFullMission(unittest.TestCase):
    """Test complete mission execution"""
    
    def setUp(self):
        """Set up test environment"""
        self.drone = SimulatedDrone()
        self.drone.connect()
        
        # Test Pi stations
        self.test_stations = [
            {"id": "test_north", "latitude": 32.4567, "longitude": 35.8901},
            {"id": "test_south", "latitude": 32.4590, "longitude": 35.8920},
            {"id": "test_east", "latitude": 32.4580, "longitude": 35.8940}
        ]
    
    def tearDown(self):
        """Clean up after tests"""
        self.drone.disconnect()
    
    def test_pi_sync_mission_success(self):
        """Test successful Pi sync mission"""
        # Create mission
        mission = PiSyncMission(self.drone, self.test_stations, hover_duration=5)
        
        # Plan mission
        self.assertTrue(mission.plan())
        self.assertGreater(len(mission.route), len(self.test_stations))
        
        # Validate mission
        self.assertTrue(mission.validate())
        
        # Execute mission
        result = mission.execute()
        
        # Verify results
        self.assertEqual(result.status, MissionStatus.COMPLETED)
        self.assertEqual(result.mission_type, "pi_sync")
        self.assertIn("stations_visited", result.data)
        self.assertEqual(result.data["stations_visited"], len(self.test_stations))
        self.assertGreater(result.data["total_bulletins"], 0)
    
    def test_disease_monitoring_mission(self):
        """Test disease monitoring mission with thermal analysis"""
        # Simulate thermal data detection
        self.drone.get_thermal_data()  # Prime the thermal system
        
        # In a real test, we'd create and run DiseaseSurveyMission
        # For now, test the thermal data generation
        thermal_data = self.drone.get_thermal_data()
        
        self.assertIsNotNone(thermal_data)
        self.assertIn("grid", thermal_data.__dict__)
        self.assertGreater(thermal_data.max_temp, thermal_data.min_temp)
        
        # Test AI analysis of thermal data
        analyzer = GemmaAnalyzer(use_mock=True)
        
        # Test anomaly detection
        anomalies = analyzer.detect_anomalies({
            "thermal_data": thermal_data.__dict__,
            "scan_location": "test_camp"
        })
        
        self.assertIsInstance(anomalies, list)
        # May or may not detect anomalies based on random generation
    
    def test_mission_abort_handling(self):
        """Test mission abort functionality"""
        mission = PiSyncMission(self.drone, self.test_stations)
        
        # Start mission in thread to test abort
        import threading
        import time
        
        result_container = []
        
        def run_mission():
            result = mission.execute()
            result_container.append(result)
        
        thread = threading.Thread(target=run_mission)
        thread.start()
        
        # Let mission start
        time.sleep(2)
        
        # Abort mission
        mission.abort("Test abort")
        
        # Wait for completion
        thread.join(timeout=10)
        
        # Check result
        self.assertEqual(mission.status, MissionStatus.ABORTED)
    
    def test_low_battery_rtl(self):
        """Test return-to-launch on low battery"""
        # Set battery low
        self.drone.battery = 24  # Below RTL threshold
        
        # Create mission with many stations
        many_stations = self.test_stations * 5  # 15 stations
        mission = PiSyncMission(self.drone, many_stations)
        
        # Execute mission
        result = mission.execute()
        
        # Should not visit all stations due to low battery
        self.assertLess(result.data["stations_visited"], len(many_stations))
    
    def test_ai_camp_analysis(self):
        """Test AI analysis of camp conditions"""
        analyzer = GemmaAnalyzer(use_mock=True)
        
        # Test camp analysis
        visual_data = b"mock_image_data"
        thermal_data = {
            "avg_temp": 36.7,
            "max_temp": 39.2,
            "hotspots": [{"location": "sector_7", "temp": 39.2}]
        }
        context = {
            "population": 5234,
            "last_inspection": "2024-12-20",
            "issues": ["water_shortage", "overcrowding"]
        }
        
        analysis = analyzer.analyze_camp_conditions(
            visual_data, thermal_data, context
        )
        
        self.assertIsNotNone(analysis)
        self.assertIn("analysis", analysis)
        self.assertIn("timestamp", analysis)
    
    def test_text_translation(self):
        """Test text translation from camp signage"""
        analyzer = GemmaAnalyzer(use_mock=True)
        
        # Test translation
        result = analyzer.translate_text("مفقود طفل")
        
        self.assertIn("translation", result)
        self.assertIn("is_missing_person", result)
        self.assertIsInstance(result["is_missing_person"], bool)
    
    def test_resource_prediction(self):
        """Test resource needs prediction"""
        analyzer = GemmaAnalyzer(use_mock=True)
        
        population_data = {
            "total": 5234,
            "growth_rate": 0.02,
            "demographics": {
                "children": 1567,
                "adults": 3102,
                "elderly": 565
            }
        }
        
        consumption_history = [
            {"date": "2024-12-20", "water": 75000, "food": 2500},
            {"date": "2024-12-21", "water": 76000, "food": 2600}
        ]
        
        predictions = analyzer.predict_resource_needs(
            population_data, consumption_history
        )
        
        self.assertIn("predictions", predictions)
        self.assertIn("water", predictions["predictions"])
        self.assertIn("confidence", predictions)
    
    def test_mission_data_persistence(self):
        """Test saving mission data to files"""
        # Run a mission
        mission = PiSyncMission(self.drone, self.test_stations[:1])  # Just one station
        result = mission.execute()
        
        # Check if data was saved
        output_dir = Path("sample_outputs")
        self.assertTrue(output_dir.exists())
        
        # Find the saved file
        files = list(output_dir.glob("pi_sync_*.json"))
        self.assertGreater(len(files), 0)
        
        # Verify file content
        with open(files[-1]) as f:
            saved_data = json.load(f)
        
        self.assertIn("mission", saved_data)
        self.assertIn("detailed_data", saved_data)

class TestSystemIntegration(unittest.TestCase):
    """Test system component integration"""
    
    def test_config_loading(self):
        """Test configuration system"""
        from config import get_config, is_feature_enabled
        
        config = get_config()
        self.assertIn("drone", config)
        self.assertIn("features", config)
        
        # Test feature flags
        self.assertTrue(is_feature_enabled("pi_sync"))
        self.assertFalse(is_feature_enabled("swarm_coordination"))
    
    def test_database_operations(self):
        """Test database functionality"""
        from data_manager.database import Database
        
        # Use in-memory database for testing
        db = Database("sqlite:///:memory:")
        
        # Save a mission
        mission_data = {
            "mission_id": "test_001",
            "mission_type": "test",
            "status": "completed",
            "data": {"test": True},
            "summary": "Test mission"
        }
        
        db.save_mission(mission_data)
        
        # Retrieve mission
        retrieved = db.get_mission("test_001")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["mission_id"], "test_001")
        
        # Test statistics
        stats = db.get_statistics()
        self.assertIn("missions", stats)
        self.assertEqual(stats["missions"]["total"], 1)
        
        db.close()

if __name__ == "__main__":
    # Create necessary directories
    Path("logs").mkdir(exist_ok=True)
    Path("sample_outputs").mkdir(exist_ok=True)
    
    # Run tests
    unittest.main()