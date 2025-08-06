"""
Global configuration for the Humanitarian Drone Intelligence System.
Manages feature flags, environment settings, and system parameters.
"""

import os
from pathlib import Path
from typing import Dict, Any

# Project root directory
PROJECT_ROOT = Path(__file__).parent.absolute()

# Feature flags - control which capabilities are enabled
FEATURES = {
    'pi_sync': True,              # Phase 1: Implemented and tested
    'disease_monitoring': True,    # Phase 2: Implemented, needs field testing
    'predictive_ai': False,       # Phase 3: Coming Q2 2025
    'swarm_coordination': False,  # Future: Multi-drone support
    'advanced_ocr': False,        # Future: Multi-language text recognition
}

# Drone configuration
DRONE_CONFIG = {
    'mode': os.getenv('DRONE_MODE', 'simulated'),  # 'real' or 'simulated'
    'max_altitude': 100,  # meters
    'min_altitude': 50,   # meters - above intimidation threshold
    'max_wind_speed': 30, # km/h
    'battery_rtl': 25,    # Return-to-launch battery percentage
    'hover_duration': 30, # seconds per Pi station
    'flight_speed': 10,   # m/s
}

# Camp operational parameters
CAMP_CONFIG = {
    'boundary_file': os.getenv('CAMP_BOUNDARY_FILE', str(PROJECT_ROOT / 'config' / 'camp_boundary.json')),
    'pi_stations_file': os.getenv('PI_STATIONS_FILE', str(PROJECT_ROOT / 'test_data' / 'pi_stations.json')),
    'operational_hours': {
        'start': '06:00',  # Morning flights only
        'end': '11:00',    # Respect prayer times
    },
    'no_fly_zones': ['mosque', 'women_section', 'medical_triage'],
    'announcement_required': True,
}

# AI Model configuration
AI_CONFIG = {
    'model_path': os.getenv('MODEL_PATH', '/models/gemma-3n-15b.gguf'),
    'use_mock': os.getenv('USE_MOCK_AI', 'true').lower() == 'true',
    'context_size': 8192,
    'temperature': 0.3,  # Low for factual analysis
    'gpu_layers': -1,    # Use all available GPU layers
    'system_prompt': """You are a humanitarian analyst reviewing aerial footage 
                       of refugee camps. Focus on actionable intelligence that 
                       saves lives. Be concise, specific, and prioritize safety.""",
}

# Thermal imaging configuration
THERMAL_CONFIG = {
    'fever_threshold': 38.5,      # Celsius
    'confidence_threshold': 0.85,  # Minimum confidence for alerts
    'grid_resolution': 5,         # meters per grid cell
    'calibration_offset': -0.3,   # Typical FLIR calibration
}

# Data management
DATA_CONFIG = {
    'database_url': os.getenv('DATABASE_URL', f'sqlite:///{PROJECT_ROOT}/data/humanitarian_intel.db'),
    'retention_days': 7,          # Privacy: auto-delete after 7 days
    'encryption_enabled': True,
    'backup_interval': 3600,      # seconds
}

# API configuration
API_CONFIG = {
    'host': '0.0.0.0',
    'port': 8000,
    'websocket_port': 8001,
    'api_key': os.getenv('DRONE_API_KEY', 'demo_key_replace_in_prod'),
    'cors_origins': ['http://localhost:8080', 'http://localhost:3000'],
    'rate_limit': '100/hour',
}

# Logging configuration
LOG_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': str(PROJECT_ROOT / 'logs' / 'drone_ops.log'),
    'max_size': '100MB',
    'backup_count': 5,
}

# Mission priorities (lower number = higher priority)
MISSION_PRIORITIES = {
    'emergency_medical': 1,
    'disease_monitoring': 2,
    'missing_person': 3,
    'routine_pi_sync': 4,
    'intelligence_gathering': 5,
}

# Alert thresholds
ALERT_THRESHOLDS = {
    'fever_cluster_size': 10,     # Number of people
    'queue_length': 50,           # People in resource queue
    'population_change': 100,     # Daily change threshold
    'fire_risk_score': 0.8,       # AI-computed risk score
}

# Safety protocols
SAFETY_CONFIG = {
    'preflight_checks': [
        'battery_above_90',
        'weather_check',
        'camp_coordination',
        'geofence_active',
        'rtl_configured',
    ],
    'emergency_protocols': {
        'low_battery': 'immediate_rtl',
        'high_wind': 'immediate_land',
        'system_failure': 'controlled_descent',
        'lost_connection': 'hover_then_rtl',
    },
}

# Development/Testing overrides
if os.getenv('TESTING', 'false').lower() == 'true':
    DRONE_CONFIG['mode'] = 'simulated'
    AI_CONFIG['use_mock'] = True
    DATA_CONFIG['database_url'] = 'sqlite:///:memory:'
    LOG_CONFIG['level'] = 'DEBUG'

def get_config() -> Dict[str, Any]:
    """Get complete configuration dictionary"""
    return {
        'features': FEATURES,
        'drone': DRONE_CONFIG,
        'camp': CAMP_CONFIG,
        'ai': AI_CONFIG,
        'thermal': THERMAL_CONFIG,
        'data': DATA_CONFIG,
        'api': API_CONFIG,
        'log': LOG_CONFIG,
        'priorities': MISSION_PRIORITIES,
        'alerts': ALERT_THRESHOLDS,
        'safety': SAFETY_CONFIG,
    }

def is_feature_enabled(feature: str) -> bool:
    """Check if a feature is enabled"""
    return FEATURES.get(feature, False)

def get_mission_priority(mission_type: str) -> int:
    """Get priority for a mission type"""
    return MISSION_PRIORITIES.get(mission_type, 999)

# Create necessary directories on import
for directory in ['logs', 'data', 'models', 'sample_outputs']:
    (PROJECT_ROOT / directory).mkdir(exist_ok=True)