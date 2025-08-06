"""
Gemma AI integration for camp analysis.
Supports both real model and mock responses for testing.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64

from config import AI_CONFIG

logger = logging.getLogger(__name__)

# Try to import llama-cpp-python, fall back to mock if not available
try:
    import llama_cpp
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False
    logger.warning("llama-cpp-python not available, using mock AI")

class GemmaAnalyzer:
    """AI analyzer using Gemma 3n model"""
    
    def __init__(self, use_mock: bool = None):
        """Initialize analyzer with real or mock model"""
        if use_mock is None:
            use_mock = AI_CONFIG['use_mock'] or not LLAMA_CPP_AVAILABLE
        
        self.use_mock = use_mock
        self.model = None
        
        if not self.use_mock and LLAMA_CPP_AVAILABLE:
            try:
                logger.info(f"Loading Gemma model from {AI_CONFIG['model_path']}")
                self.model = llama_cpp.Llama(
                    model_path=AI_CONFIG['model_path'],
                    n_ctx=AI_CONFIG['context_size'],
                    n_gpu_layers=AI_CONFIG['gpu_layers'],
                    verbose=False
                )
                logger.info("✓ Gemma model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                logger.info("Falling back to mock AI")
                self.use_mock = True
        
        if self.use_mock:
            from .mock_gemma import MockGemma
            self.model = MockGemma()
            logger.info("Using mock Gemma for testing")
    
    def analyze_camp_conditions(self, 
                               visual_data: bytes,
                               thermal_data: Optional[Dict] = None,
                               context: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze camp conditions from aerial data"""
        
        prompt = self._build_analysis_prompt(visual_data, thermal_data, context)
        
        if self.use_mock:
            return self.model.analyze_camp_conditions(visual_data, thermal_data, context)
        
        # Real model inference
        response = self.model(
            prompt,
            max_tokens=1024,
            temperature=AI_CONFIG['temperature'],
            stop=["</analysis>"]
        )
        
        # Parse response
        try:
            return self._parse_analysis_response(response['choices'][0]['text'])
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            return self._get_fallback_analysis()
    
    def detect_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect anomalies in camp data"""
        
        if self.use_mock:
            return self.model.detect_anomalies(data)
        
        prompt = f"""<system>{AI_CONFIG['system_prompt']}</system>

Analyze the following camp data for anomalies:
{json.dumps(data, indent=2)}

Identify any concerning patterns, safety issues, or resource problems.
Format your response as JSON with an 'anomalies' array.
"""
        
        response = self.model(prompt, max_tokens=512, temperature=0.1)
        
        try:
            result = json.loads(response['choices'][0]['text'])
            return result.get('anomalies', [])
        except:
            return []
    
    def translate_text(self, text: str, source_lang: str = 'auto') -> Dict[str, str]:
        """Translate text from camp signage or messages"""
        
        if self.use_mock:
            return self.model.translate_text(text, source_lang)
        
        prompt = f"""Translate the following text from {source_lang}:
"{text}"

Provide translation and detect if this is a missing person notice.
Response format:
{{
    "original": "...",
    "detected_language": "...",
    "translation": "...",
    "is_missing_person": true/false,
    "urgent": true/false
}}"""
        
        response = self.model(prompt, max_tokens=256, temperature=0.1)
        
        try:
            return json.loads(response['choices'][0]['text'])
        except:
            return {
                "original": text,
                "translation": "[Translation failed]",
                "is_missing_person": False,
                "urgent": False
            }
    
    def predict_resource_needs(self, 
                              population_data: Dict,
                              consumption_history: List[Dict]) -> Dict[str, Any]:
        """Predict upcoming resource needs"""
        
        if self.use_mock:
            return self.model.predict_resource_needs(population_data, consumption_history)
        
        prompt = f"""Based on the population data and consumption history, 
predict resource needs for the next 7 days.

Population: {json.dumps(population_data)}
History: {json.dumps(consumption_history[-7:])}  # Last week

Provide specific quantities and urgency levels."""
        
        response = self.model(prompt, max_tokens=512, temperature=0.2)
        
        return self._parse_prediction_response(response['choices'][0]['text'])
    
    def _build_analysis_prompt(self, visual_data: bytes, 
                              thermal_data: Optional[Dict],
                              context: Optional[Dict]) -> str:
        """Build comprehensive analysis prompt"""
        
        # In production, visual_data would be processed/encoded
        # For now, we'll use metadata
        image_description = "Aerial view of refugee camp section"
        
        prompt = f"""<system>{AI_CONFIG['system_prompt']}</system>

Analyze this refugee camp aerial data:

Visual: {image_description}
Timestamp: {datetime.now().isoformat()}
"""
        
        if thermal_data:
            prompt += f"""
Thermal data:
- Average temperature: {thermal_data.get('avg_temp', 'N/A')}°C
- Max temperature: {thermal_data.get('max_temp', 'N/A')}°C
- Anomalies detected: {len(thermal_data.get('hotspots', []))}
"""
        
        if context:
            prompt += f"""
Context:
- Camp population: {context.get('population', 'Unknown')}
- Last inspection: {context.get('last_inspection', 'Unknown')}
- Known issues: {', '.join(context.get('issues', ['None reported']))}
"""
        
        prompt += """

Provide comprehensive analysis including:
1. Population density assessment
2. Resource distribution effectiveness  
3. Infrastructure concerns
4. Safety hazards
5. Recommended actions

<analysis>"""
        
        return prompt
    
    def _parse_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        # Implement parsing logic based on expected response format
        # This is simplified - production would be more robust
        
        return {
            "timestamp": datetime.now().isoformat(),
            "model": "gemma-3n-15b",
            "analysis": {
                "raw_response": response,
                "summary": "Analysis complete",
                "recommendations": ["Parsed from response"],
                "priority_actions": []
            }
        }
    
    def _parse_prediction_response(self, response: str) -> Dict[str, Any]:
        """Parse resource prediction response"""
        # Simplified parsing
        return {
            "predictions": {
                "water": {"quantity": "15000L", "urgency": "normal"},
                "food": {"quantity": "2000kg", "urgency": "high"},
                "medical": {"quantity": "various", "urgency": "normal"}
            },
            "confidence": 0.85
        }
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Fallback analysis if AI fails"""
        return {
            "timestamp": datetime.now().isoformat(),
            "model": "fallback",
            "analysis": {
                "summary": "AI analysis unavailable - basic metrics only",
                "recommendations": [
                    "Manual inspection recommended",
                    "Verify sensor data"
                ],
                "priority_actions": []
            }
        }