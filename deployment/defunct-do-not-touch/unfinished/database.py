"""
Database management for the drone system.
Handles mission data, alerts, and analytics storage.
"""

import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import threading

from config import DATA_CONFIG

logger = logging.getLogger(__name__)

class Database:
    """SQLite database manager with thread safety"""
    
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or DATA_CONFIG['database_url']
        self.db_path = self._extract_db_path(self.db_url)
        self._local = threading.local()
        
        # Ensure database directory exists
        if self.db_path != ':memory:':
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        logger.info(f"Database initialized at {self.db_path}")
    
    def _extract_db_path(self, db_url: str) -> str:
        """Extract file path from SQLite URL"""
        if db_url.startswith('sqlite:///'):
            return db_url.replace('sqlite:///', '')
        elif db_url == 'sqlite:///:memory:':
            return ':memory:'
        else:
            return 'humanitarian_intel.db'
    
    @property
    def conn(self):
        """Get thread-local database connection"""
        if not hasattr(self._local, 'conn'):
            self._local.conn = sqlite3.connect(self.db_path)
            self._local.conn.row_factory = sqlite3.Row
        return self._local.conn
    
    def _init_database(self):
        """Initialize database schema"""
        with self.conn:
            # Missions table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS missions (
                    mission_id TEXT PRIMARY KEY,
                    mission_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    data_json TEXT,
                    alerts_json TEXT,
                    summary TEXT,
                    flight_stats_json TEXT
                )
            ''')
            
            # Alerts table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS alerts (
                    alert_id TEXT PRIMARY KEY,
                    mission_id TEXT,
                    alert_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT,
                    location_lat REAL,
                    location_lon REAL,
                    action_required TEXT,
                    details_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP,
                    FOREIGN KEY (mission_id) REFERENCES missions(mission_id)
                )
            ''')
            
            # Telemetry table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS telemetry (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mission_id TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    latitude REAL,
                    longitude REAL,
                    altitude REAL,
                    battery_percent REAL,
                    speed REAL,
                    heading REAL,
                    temperature REAL,
                    wind_speed REAL,
                    FOREIGN KEY (mission_id) REFERENCES missions(mission_id)
                )
            ''')
            
            # Analytics table
            self.conn.execute('''
                CREATE TABLE IF NOT EXISTS analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_type TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    data_json TEXT,
                    confidence_score REAL,
                    model_version TEXT
                )
            ''')
            
            # Create indexes
            self.conn.execute('CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status)')
            self.conn.execute('CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(mission_type)')
            self.conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity)')
            self.conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at)')
            self.conn.execute('CREATE INDEX IF NOT EXISTS idx_telemetry_mission ON telemetry(mission_id)')
    
    def save_mission(self, mission_data: Dict[str, Any]):
        """Save mission data to database"""
        try:
            with self.conn:
                self.conn.execute('''
                    INSERT INTO missions (
                        mission_id, mission_type, status, created_at,
                        started_at, completed_at, data_json, alerts_json,
                        summary, flight_stats_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    mission_data.get('mission_id'),
                    mission_data.get('mission_type'),
                    mission_data.get('status', 'pending'),
                    mission_data.get('created_at', datetime.now().isoformat()),
                    mission_data.get('start_time'),
                    mission_data.get('end_time'),
                    json.dumps(mission_data.get('data', {})),
                    json.dumps(mission_data.get('alerts', [])),
                    mission_data.get('summary', ''),
                    json.dumps(mission_data.get('flight_stats', {}))
                ))
            logger.info(f"Mission saved: {mission_data.get('mission_id')}")
        except Exception as e:
            logger.error(f"Failed to save mission: {e}")
            raise
    
    def get_mission(self, mission_id: str) -> Optional[Dict[str, Any]]:
        """Get mission by ID"""
        cursor = self.conn.execute(
            'SELECT * FROM missions WHERE mission_id = ?', (mission_id,)
        )
        row = cursor.fetchone()
        
        if row:
            return self._row_to_mission_dict(row)
        return None
    
    def get_missions(self, 
                    mission_type: Optional[str] = None,
                    status: Optional[str] = None,
                    limit: int = 20) -> List[Dict[str, Any]]:
        """Get missions with optional filtering"""
        query = 'SELECT * FROM missions WHERE 1=1'
        params = []
        
        if mission_type:
            query += ' AND mission_type = ?'
            params.append(mission_type)
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC LIMIT ?'
        params.append(limit)
        
        cursor = self.conn.execute(query, params)
        return [self._row_to_mission_dict(row) for row in cursor]
    
    def get_latest_mission(self) -> Optional[Dict[str, Any]]:
        """Get the most recent mission"""
        cursor = self.conn.execute(
            'SELECT * FROM missions ORDER BY created_at DESC LIMIT 1'
        )
        row = cursor.fetchone()
        
        if row:
            return self._row_to_mission_dict(row)
        return None
    
    def save_alert(self, alert_data: Dict[str, Any]):
        """Save alert to database"""
        try:
            with self.conn:
                self.conn.execute('''
                    INSERT INTO alerts (
                        alert_id, mission_id, alert_type, severity,
                        description, location_lat, location_lon,
                        action_required, details_json, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert_data.get('alert_id'),
                    alert_data.get('mission_id'),
                    alert_data.get('type'),
                    alert_data.get('severity'),
                    alert_data.get('description'),
                    alert_data.get('location', {}).get('latitude'),
                    alert_data.get('location', {}).get('longitude'),
                    alert_data.get('action_required'),
                    json.dumps(alert_data.get('details', {})),
                    alert_data.get('timestamp', datetime.now().isoformat())
                ))
            logger.info(f"Alert saved: {alert_data.get('alert_id')}")
        except Exception as e:
            logger.error(f"Failed to save alert: {e}")
    
    def get_recent_alerts(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        since = datetime.now() - timedelta(hours=hours)
        
        cursor = self.conn.execute('''
            SELECT * FROM alerts 
            WHERE created_at > ? 
            ORDER BY created_at DESC
        ''', (since.isoformat(),))
        
        alerts = []
        for row in cursor:
            alert = {
                'alert_id': row['alert_id'],
                'mission_id': row['mission_id'],
                'type': row['alert_type'],
                'severity': row['severity'],
                'description': row['description'],
                'location': {
                    'latitude': row['location_lat'],
                    'longitude': row['location_lon']
                } if row['location_lat'] else None,
                'action_required': row['action_required'],
                'details': json.loads(row['details_json']),
                'timestamp': row['created_at'],
                'resolved': row['resolved_at'] is not None
            }
            alerts.append(alert)
        
        return alerts
    
    def save_telemetry(self, telemetry_data: Dict[str, Any]):
        """Save telemetry data"""
        try:
            with self.conn:
                self.conn.execute('''
                    INSERT INTO telemetry (
                        mission_id, latitude, longitude, altitude,
                        battery_percent, speed, heading, temperature, wind_speed
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    telemetry_data.get('mission_id'),
                    telemetry_data.get('latitude'),
                    telemetry_data.get('longitude'),
                    telemetry_data.get('altitude'),
                    telemetry_data.get('battery_percent'),
                    telemetry_data.get('speed'),
                    telemetry_data.get('heading'),
                    telemetry_data.get('temperature'),
                    telemetry_data.get('wind_speed')
                ))
        except Exception as e:
            logger.error(f"Failed to save telemetry: {e}")
    
    def save_analysis(self, analysis_data: Dict[str, Any]):
        """Save AI analysis results"""
        try:
            with self.conn:
                self.conn.execute('''
                    INSERT INTO analytics (
                        analysis_type, data_json, confidence_score, model_version
                    ) VALUES (?, ?, ?, ?)
                ''', (
                    analysis_data.get('type'),
                    json.dumps(analysis_data.get('data', {})),
                    analysis_data.get('confidence', 0.0),
                    analysis_data.get('model', 'gemma-3n-15b')
                ))
            logger.info(f"Analysis saved: {analysis_data.get('type')}")
        except Exception as e:
            logger.error(f"Failed to save analysis: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get system statistics"""
        stats = {}
        
        # Mission statistics
        cursor = self.conn.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                COUNT(CASE WHEN created_at > datetime('now', '-24 hours') THEN 1 END) as last_24h
            FROM missions
        ''')
        mission_stats = cursor.fetchone()
        
        stats['missions'] = {
            'total': mission_stats['total'],
            'completed': mission_stats['completed'],
            'failed': mission_stats['failed'],
            'last_24_hours': mission_stats['last_24h'],
            'success_rate': (mission_stats['completed'] / mission_stats['total'] * 100) 
                           if mission_stats['total'] > 0 else 0
        }
        
        # Alert statistics
        cursor = self.conn.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
                COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
                COUNT(CASE WHEN resolved_at IS NULL THEN 1 END) as active
            FROM alerts
            WHERE created_at > datetime('now', '-7 days')
        ''')
        alert_stats = cursor.fetchone()
        
        stats['alerts'] = {
            'total_week': alert_stats['total'],
            'critical': alert_stats['critical'],
            'high': alert_stats['high'],
            'active': alert_stats['active']
        }
        
        # Mission type breakdown
        cursor = self.conn.execute('''
            SELECT mission_type, COUNT(*) as count
            FROM missions
            GROUP BY mission_type
        ''')
        
        stats['mission_types'] = {
            row['mission_type']: row['count'] for row in cursor
        }
        
        stats['missions_completed'] = mission_stats['completed']
        
        return stats
    
    def cleanup_old_data(self, days: int = 7):
        """Remove data older than specified days"""
        if DATA_CONFIG['retention_days'] <= 0:
            return  # Retention disabled
        
        cutoff = datetime.now() - timedelta(days=days)
        
        try:
            with self.conn:
                # Delete old telemetry (keep mission data longer)
                self.conn.execute(
                    'DELETE FROM telemetry WHERE timestamp < ?',
                    (cutoff.isoformat(),)
                )
                
                # Delete resolved alerts
                self.conn.execute(
                    'DELETE FROM alerts WHERE resolved_at < ?',
                    (cutoff.isoformat(),)
                )
                
            logger.info(f"Cleaned up data older than {days} days")
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")
    
    def _row_to_mission_dict(self, row) -> Dict[str, Any]:
        """Convert database row to mission dictionary"""
        return {
            'mission_id': row['mission_id'],
            'mission_type': row['mission_type'],
            'status': row['status'],
            'created_at': row['created_at'],
            'start_time': row['started_at'],
            'end_time': row['completed_at'],
            'data': json.loads(row['data_json']) if row['data_json'] else {},
            'alerts': json.loads(row['alerts_json']) if row['alerts_json'] else [],
            'summary': row['summary'],
            'flight_stats': json.loads(row['flight_stats_json']) if row['flight_stats_json'] else {}
        }
    
    def close(self):
        """Close database connection"""
        if hasattr(self._local, 'conn'):
            self._local.conn.close()
            delattr(self._local, 'conn')