"""
Mock Gemma implementation for testing without the actual model.
Provides realistic, varied responses.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class MockGemma:
    """Mock AI model that returns realistic analysis"""
    
    def __init__(self):
        self.response_variations = self._load_response_variations()
        self.call_count = 0
    
    def analyze_camp_conditions(self, 
                               visual_data: bytes,
                               thermal_data: Optional[Dict] = None,
                               context: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate realistic camp analysis"""
        
        self.call_count += 1
        
        # Vary responses based on call count and randomness
        scenario = random.choice(['normal', 'concern', 'urgent', 'mixed'])
        
        if scenario == 'normal':
            return self._normal_conditions_analysis()
        elif scenario == 'concern':
            return self._concerning_conditions_analysis()
        elif scenario == 'urgent':
            return self._urgent_conditions_analysis()
        else:
            return self._mixed_conditions_analysis(thermal_data)
    
    def detect_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate anomaly detection results"""
        
        anomalies = []
        
        # Randomly generate 0-3 anomalies
        num_anomalies = random.randint(0, 3)
        
        anomaly_types = [
            {
                "type": "overcrowding",
                "location": f"Sector {random.randint(1, 8)}",
                "severity": "medium",
                "description": "Population density 40% above safe threshold",
                "recommendation": "Open overflow area or redistribute residents"
            },
            {
                "type": "resource_bottleneck",
                "location": f"Water Point {random.randint(1, 5)}",
                "severity": "high",
                "description": "2+ hour queues detected during peak times",
                "recommendation": "Deploy mobile water distribution unit"
            },
            {
                "type": "fire_hazard",
                "location": f"Block {random.choice(['A', 'B', 'C'])}-{random.randint(1, 20)}",
                "severity": "critical",
                "description": "Dense cooking fires near flammable structures",
                "recommendation": "Install fire breaks and distribute safety equipment"
            },
            {
                "type": "drainage_issue",
                "location": f"Sectors {random.randint(1, 4)} and {random.randint(5, 8)}",
                "severity": "medium",
                "description": "Standing water creating disease risk",
                "recommendation": "Dig drainage channels before rainy season"
            },
            {
                "type": "social_tension",
                "location": "East fence area",
                "severity": "low",
                "description": "New ethnic clustering patterns observed",
                "recommendation": "Monitor situation, engage community leaders"
            }
        ]
        
        selected = random.sample(anomaly_types, min(num_anomalies, len(anomaly_types)))
        
        for anomaly in selected:
            anomaly['detected_at'] = datetime.now().isoformat()
            anomaly['confidence'] = round(random.uniform(0.75, 0.95), 2)
            anomalies.append(anomaly)
        
        return anomalies
    
    def translate_text(self, text: str, source_lang: str = 'auto') -> Dict[str, str]:
        """Mock translation results"""
        
        # Simulate different types of messages
        message_types = [
            {
                "translation": "Looking for my daughter Amara, age 9, last seen near medical tent",
                "is_missing_person": True,
                "urgent": True,
                "detected_language": "Arabic"
            },
            {
                "translation": "Need insulin for diabetes - Block C tent 47",
                "is_missing_person": False,
                "urgent": True,
                "detected_language": "Tigrinya"
            },
            {
                "translation": "Meeting tomorrow 10am near mosque",
                "is_missing_person": False,
                "urgent": False,
                "detected_language": "Dari"
            },
            {
                "translation": "Water pump broken in sector 3",
                "is_missing_person": False,
                "urgent": True,
                "detected_language": "Kurdish"
            }
        ]
        
        result = random.choice(message_types)
        result['original'] = text
        
        return result
    
    def predict_resource_needs(self, 
                              population_data: Dict,
                              consumption_history: List[Dict]) -> Dict[str, Any]:
        """Generate resource predictions"""
        
        base_population = population_data.get('total', 5000)
        growth_rate = population_data.get('growth_rate', 0.02)
        
        # Calculate predicted needs with some variation
        predictions = {
            "water": {
                "daily_need": f"{int(base_population * 15 * random.uniform(0.9, 1.1))}L",
                "weekly_total": f"{int(base_population * 15 * 7 * random.uniform(0.9, 1.1))}L",
                "urgency": random.choice(["normal", "high", "critical"]),
                "stock_days": random.randint(2, 10)
            },
            "food": {
                "daily_need": f"{int(base_population * 0.5 * random.uniform(0.9, 1.1))}kg",
                "weekly_total": f"{int(base_population * 0.5 * 7 * random.uniform(0.9, 1.1))}kg",
                "urgency": random.choice(["normal", "high"]),
                "stock_days": random.randint(3, 14)
            },
            "medical_supplies": {
                "insulin": {"units": 120, "urgency": "critical", "patients": 12},
                "antibiotics": {"doses": 500, "urgency": "high"},
                "bandages": {"units": 2000, "urgency": "normal"},
                "iv_fluids": {"bags": 100, "urgency": "high"}
            },
            "shelter_materials": {
                "tarps": int(50 * random.uniform(0.8, 1.2)),
                "blankets": int(200 * random.uniform(0.8, 1.2)),
                "urgency": "normal" if random.random() > 0.3 else "high"
            }
        }
        
        return {
            "predictions": predictions,
            "confidence": round(random.uniform(0.80, 0.92), 2),
            "factors_considered": [
                "Population growth trend",
                "Seasonal variations",
                "Historical consumption",
                "Current stock levels",
                "Weather forecast"
            ],
            "warnings": self._generate_warnings(predictions)
        }
    
    def _generate_warnings(self, predictions: Dict) -> List[str]:
        """Generate relevant warnings based on predictions"""
        warnings = []
        
        if predictions['water']['urgency'] == 'critical':
            warnings.append("Water shortage expected within 48 hours")
        
        if predictions['medical_supplies']['insulin']['urgency'] == 'critical':
            warnings.append(f"Insulin critically low for {predictions['medical_supplies']['insulin']['patients']} patients")
        
        if random.random() > 0.7:
            warnings.append("Rainy season approaching - increase shelter materials")
        
        return warnings
    
    def _normal_conditions_analysis(self) -> Dict[str, Any]:
        """Generate analysis for normal conditions"""
        return {
            "timestamp": datetime.now().isoformat(),
            "model": "gemma-3n-15b-mock",
            "analysis": {
                "summary": "Camp conditions are within normal parameters. No immediate concerns detected.",
                "population_density": {
                    "status": "acceptable",
                    "occupancy": "73%",
                    "distribution": "even",
                    "changes": "Stable over past week"
                },
                "resource_distribution": {
                    "efficiency": "84%",
                    "bottlenecks": [],
                    "wait_times": "15-30 minutes average",
                    "coverage": "All sectors adequately served"
                },
                "infrastructure": {
                    "condition": "good",
                    "maintenance_needed": ["Minor repairs to Sector 3 latrines"],
                    "safety_score": 8.5
                },
                "health_indicators": {
                    "disease_risk": "low",
                    "sanitation": "adequate",
                    "medical_capacity": "sufficient"
                },
                "recommendations": [
                    "Continue routine maintenance schedule",
                    "Monitor water point 3 for increasing demand",
                    "Prepare for seasonal population increase"
                ],
                "priority_actions": []
            }
        }
    
    def _concerning_conditions_analysis(self) -> Dict[str, Any]:
        """Generate analysis with concerning findings"""
        return {
            "timestamp": datetime.now().isoformat(),
            "model": "gemma-3n-15b-mock",
            "analysis": {
                "summary": "Several concerning patterns detected requiring attention within 48 hours.",
                "population_density": {
                    "status": "concerning",
                    "occupancy": "89%",
                    "distribution": "uneven - Sector 4 overcrowded",
                    "changes": "+127 individuals in past week"
                },
                "resource_distribution": {
                    "efficiency": "67%",
                    "bottlenecks": ["Water point 3", "Food distribution center"],
                    "wait_times": "1-2 hours during peak",
                    "coverage": "Sectors 4 and 7 underserved"
                },
                "infrastructure": {
                    "condition": "deteriorating",
                    "maintenance_needed": [
                        "Urgent latrine repairs in Sector 4",
                        "Drainage system blocked in Sector 2"
                    ],
                    "safety_score": 6.2
                },
                "health_indicators": {
                    "disease_risk": "medium",
                    "sanitation": "declining",
                    "medical_capacity": "strained"
                },
                "recommendations": [
                    "Open overflow area to reduce Sector 4 density",
                    "Deploy mobile water distribution to reduce queues",
                    "Urgent sanitation team to Sector 4",
                    "Increase medical staff for next 72 hours"
                ],
                "priority_actions": [
                    {"action": "Address Sector 4 overcrowding", "deadline": "24 hours"},
                    {"action": "Repair critical sanitation infrastructure", "deadline": "48 hours"}
                ]
            }
        }
    
    def _urgent_conditions_analysis(self) -> Dict[str, Any]:
        """Generate analysis with urgent findings"""
        return {
            "timestamp": datetime.now().isoformat(),
            "model": "gemma-3n-15b-mock",
            "analysis": {
                "summary": "URGENT: Multiple critical issues detected requiring immediate intervention.",
                "population_density": {
                    "status": "critical",
                    "occupancy": "112%",
                    "distribution": "dangerous clustering in Sectors 4 and 7",
                    "changes": "+340 individuals in 48 hours - possible influx event"
                },
                "resource_distribution": {
                    "efficiency": "43%",
                    "bottlenecks": ["All water points", "Medical supplies depleted"],
                    "wait_times": "3+ hours, some giving up",
                    "coverage": "Multiple sectors without access"
                },
                "infrastructure": {
                    "condition": "failing",
                    "maintenance_needed": [
                        "CRITICAL: Fire hazard in Sector 7",
                        "CRITICAL: Latrine system failure",
                        "CRITICAL: No drainage, flood risk"
                    ],
                    "safety_score": 3.8
                },
                "health_indicators": {
                    "disease_risk": "HIGH - possible outbreak",
                    "sanitation": "failed",
                    "medical_capacity": "overwhelmed"
                },
                "recommendations": [
                    "IMMEDIATE: Deploy emergency response team",
                    "IMMEDIATE: Establish temporary medical facility",
                    "URGENT: Bring in water trucks within 6 hours",
                    "URGENT: Evacuate fire hazard areas",
                    "CRITICAL: Request inter-agency support"
                ],
                "priority_actions": [
                    {"action": "Deploy emergency medical team", "deadline": "2 hours"},
                    {"action": "Water truck deployment", "deadline": "6 hours"},
                    {"action": "Fire hazard evacuation", "deadline": "immediately"},
                    {"action": "Activate emergency protocols", "deadline": "immediately"}
                ]
            }
        }
    
    def _mixed_conditions_analysis(self, thermal_data: Optional[Dict]) -> Dict[str, Any]:
        """Generate mixed analysis with thermal data consideration"""
        
        has_fever = thermal_data and thermal_data.get('max_temp', 0) > 38.5 if thermal_data else random.random() > 0.7
        
        analysis = {
            "timestamp": datetime.now().isoformat(),
            "model": "gemma-3n-15b-mock",
            "analysis": {
                "summary": "Mixed conditions detected with both positive developments and areas of concern.",
                "population_density": {
                    "status": "improving",
                    "occupancy": "81%",
                    "distribution": "better balanced after recent redistributions",
                    "changes": "+43 individuals, well managed"
                },
                "resource_distribution": {
                    "efficiency": "75%",
                    "bottlenecks": ["Morning water distribution only"],
                    "wait_times": "45 minutes average",
                    "coverage": "Good except new arrivals area"
                },
                "infrastructure": {
                    "condition": "fair",
                    "maintenance_needed": ["Routine repairs scheduled"],
                    "safety_score": 7.1
                },
                "health_indicators": {
                    "disease_risk": "elevated" if has_fever else "medium",
                    "sanitation": "improving",
                    "medical_capacity": "adequate with reserves"
                }
            }
        }
        
        if has_fever:
            analysis["analysis"]["health_alert"] = {
                "type": "fever_cluster",
                "location": "Sector 7 - northwest corner",
                "affected_estimate": 45,
                "confidence": 0.89,
                "action": "Medical team deployed"
            }
            analysis["analysis"]["recommendations"] = [
                "Immediate medical response to Sector 7",
                "Establish quarantine protocol",
                "Increase medical supplies",
                "Monitor adjacent sectors"
            ]
        else:
            analysis["analysis"]["recommendations"] = [
                "Continue infrastructure improvements",
                "Add morning water distribution point",
                "Prepare new arrivals integration plan"
            ]
        
        return analysis
    
    def _load_response_variations(self) -> Dict:
        """Load variety of response templates"""
        return {
            "population_descriptors": [
                "stable", "growing", "declining", "shifting", "consolidating"
            ],
            "resource_descriptors": [
                "adequate", "strained", "critical", "improving", "deteriorating"
            ],
            "urgency_levels": [
                "routine", "elevated", "high", "critical", "emergency"
            ]
        }