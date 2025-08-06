"""
Flask API for the Humanitarian Drone Intelligence System.
Provides REST endpoints and WebSocket support for real-time updates.
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime
import json
import logging
import os
from pathlib import Path
from typing import Dict, Any, List

from config import API_CONFIG, get_config
from data_manager.database import Database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Enable CORS
CORS(app, origins=API_CONFIG['cors_origins'])

# Initialize SocketIO for real-time updates
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize database
db = Database()

# Store active missions in memory (in production, use Redis)
active_missions = {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/config', methods=['GET'])
def get_configuration():
    """Get current system configuration"""
    config = get_config()
    # Remove sensitive information
    config['api'].pop('api_key', None)
    return jsonify(config)

@app.route('/api/missions', methods=['GET'])
def list_missions():
    """List all missions with optional filtering"""
    mission_type = request.args.get('type')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 20))
    
    missions = db.get_missions(
        mission_type=mission_type,
        status=status,
        limit=limit
    )
    
    return jsonify({
        'missions': missions,
        'count': len(missions),
        'filters': {
            'type': mission_type,
            'status': status
        }
    })

@app.route('/api/missions/latest', methods=['GET'])
def get_latest_mission():
    """Get the most recent mission results"""
    latest = db.get_latest_mission()
    
    if not latest:
        # Return sample data if no missions yet
        latest = {
            'mission_id': 'demo_mission_001',
            'mission_type': 'intelligence_gathering',
            'status': 'completed',
            'timestamp': datetime.now().isoformat(),
            'findings': {
                'population_change': '+127 since last week',
                'critical_issues': [
                    'Water point overcrowding in Sector 7',
                    'Fire hazard detected in Block C'
                ],
                'disease_risk': 'Low',
                'resource_status': {
                    'water': 'Strained',
                    'food': 'Adequate',
                    'medical': 'Low supplies'
                }
            },
            'recommendations': [
                'Deploy mobile water unit to Sector 7',
                'Fire safety inspection for Block C',
                'Restock medical supplies within 48 hours'
            ]
        }
    
    return jsonify(latest)

@app.route('/api/missions/create', methods=['POST'])
def create_mission():
    """Create a new mission"""
    data = request.json
    
    # Validate API key
    api_key = request.headers.get('X-API-Key')
    if api_key != API_CONFIG['api_key']:
        return jsonify({'error': 'Invalid API key'}), 401
    
    # Validate mission data
    required_fields = ['mission_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create mission
    mission_id = f"mission_{int(datetime.now().timestamp())}"
    mission = {
        'mission_id': mission_id,
        'mission_type': data['mission_type'],
        'status': 'pending',
        'created_at': datetime.now().isoformat(),
        'parameters': data.get('parameters', {})
    }
    
    # Store mission
    active_missions[mission_id] = mission
    db.save_mission(mission)
    
    # Emit to WebSocket clients
    socketio.emit('mission_created', mission)
    
    # In production, this would trigger actual drone deployment
    logger.info(f"Mission created: {mission_id}")
    
    return jsonify(mission), 201

@app.route('/api/missions/<mission_id>', methods=['GET'])
def get_mission(mission_id: str):
    """Get specific mission details"""
    mission = db.get_mission(mission_id)
    
    if not mission:
        return jsonify({'error': 'Mission not found'}), 404
    
    return jsonify(mission)

@app.route('/api/analysis/current', methods=['GET'])
def get_current_analysis():
    """Get current AI analysis of camp conditions"""
    
    # Load latest analysis or generate sample
    analysis_files = list(Path('sample_outputs').glob('*analysis*.json'))
    
    if analysis_files:
        # Load most recent
        latest_file = max(analysis_files, key=lambda f: f.stat().st_mtime)
        with open(latest_file) as f:
            analysis = json.load(f)
    else:
        # Return sample analysis
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'model': 'gemma-3n-15b',
            'camp_overview': {
                'population': 5234,
                'density': 'High',
                'trend': 'Increasing'
            },
            'risk_assessment': {
                'overall': 'MEDIUM',
                'factors': {
                    'overcrowding': 'HIGH',
                    'disease': 'LOW', 
                    'resources': 'MEDIUM',
                    'infrastructure': 'MEDIUM'
                }
            },
            'ai_insights': [
                'Population clustering detected in eastern sectors',
                'Water distribution efficiency below optimal threshold',
                'New arrival integration proceeding smoothly',
                'Recommend additional latrines in Sector 4'
            ],
            'priority_actions': [
                {
                    'action': 'Expand water distribution',
                    'urgency': 'HIGH',
                    'deadline': '24 hours'
                },
                {
                    'action': 'Open overflow housing',
                    'urgency': 'MEDIUM',
                    'deadline': '72 hours'
                }
            ]
        }
    
    return jsonify(analysis)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get active alerts"""
    hours = int(request.args.get('hours', 24))
    
    alerts = db.get_recent_alerts(hours=hours)
    
    # Add sample alerts if none exist
    if not alerts:
        alerts = [
            {
                'alert_id': 'alert_001',
                'type': 'resource_shortage',
                'severity': 'medium',
                'location': 'Medical Tent 3',
                'description': 'Insulin supplies running low',
                'timestamp': datetime.now().isoformat(),
                'status': 'active'
            }
        ]
    
    return jsonify({
        'alerts': alerts,
        'count': len(alerts),
        'timeframe_hours': hours
    })

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    """Get current drone telemetry"""
    
    # In production, this would come from actual drone
    telemetry = {
        'drone_id': 'HDIS-001',
        'status': 'ready',
        'battery': 95,
        'location': {
            'latitude': 32.4567,
            'longitude': 35.8901,
            'altitude': 0
        },
        'last_mission': datetime.now().isoformat(),
        'flight_hours': 127.3,
        'missions_completed': 847
    }
    
    return jsonify(telemetry)

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get system statistics"""
    
    stats = db.get_statistics()
    
    # Add calculated metrics
    stats['efficiency_metrics'] = {
        'time_saved_hours': stats.get('missions_completed', 0) * 2,
        'area_covered_hectares': stats.get('missions_completed', 0) * 10,
        'bulletins_collected': stats.get('missions_completed', 0) * 35
    }
    
    return jsonify(stats)

# WebSocket events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'data': 'Connected to drone operations center'})

@socketio.on('disconnect') 
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('subscribe_alerts')
def handle_subscribe_alerts():
    """Subscribe to real-time alerts"""
    logger.info(f"Client {request.sid} subscribed to alerts")
    # In production, add client to alert subscription list

@socketio.on('request_mission_update')
def handle_mission_update(data):
    """Request update for specific mission"""
    mission_id = data.get('mission_id')
    if mission_id in active_missions:
        emit('mission_update', active_missions[mission_id])

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# Serve dashboard for development
@app.route('/')
def serve_dashboard():
    """Redirect to dashboard"""
    return send_from_directory('../dashboard', 'index.html')

@app.route('/dashboard/<path:path>')
def serve_dashboard_files(path):
    """Serve dashboard static files"""
    return send_from_directory('../dashboard', path)

def emit_test_alerts():
    """Emit test alerts for demo purposes"""
    import threading
    import time
    import random
    
    def emit_alerts():
        while True:
            time.sleep(random.randint(30, 120))
            
            alert_types = [
                {
                    'type': 'fever_detected',
                    'severity': 'high',
                    'location': f'Sector {random.randint(1, 8)}',
                    'description': f'Thermal anomaly detected: {random.randint(10, 50)} individuals'
                },
                {
                    'type': 'resource_critical',
                    'severity': 'medium',
                    'location': f'Water Point {random.randint(1, 5)}',
                    'description': 'Queue length exceeding 2 hours'
                },
                {
                    'type': 'missing_person',
                    'severity': 'high',
                    'location': 'Multiple',
                    'description': 'New missing person bulletin received'
                }
            ]
            
            alert = random.choice(alert_types)
            alert['timestamp'] = datetime.now().isoformat()
            alert['alert_id'] = f"alert_{int(datetime.now().timestamp())}"
            
            socketio.emit('new_alert', alert)
            logger.info(f"Emitted test alert: {alert['type']}")
    
    if os.environ.get('EMIT_TEST_ALERTS', 'true').lower() == 'true':
        thread = threading.Thread(target=emit_alerts, daemon=True)
        thread.start()

if __name__ == '__main__':
    # Start test alert emitter
    emit_test_alerts()
    
    # Run the application
    port = API_CONFIG['port']
    logger.info(f"Starting API server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)