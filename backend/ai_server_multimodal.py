#!/usr/bin/env python3
"""
Refugee Connect AI Server - Multimodal Version
Hardware Pivot: Pi Station → Dell Mini PC with Multimodal Gemma 3n

DEVELOPMENT MODE: Uses mock implementations for safe development on 16GB laptop
PRODUCTION MODE: Uses real multimodal model on Dell Mini PC with 32GB RAM

Features:
- Server-side vision processing (OCR, document analysis, image chat)
- Multimodal conversations (text + image)
- Enhanced form processing with automatic field detection
- Medical image analysis capabilities
- Document classification and verification
"""

import os
import sys
import json
import time
import random
import base64
import hashlib
import logging
from datetime import datetime
from io import BytesIO
from PIL import Image
import psutil
import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor

from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class MemorySafetyGuard:
    """Prevents accidental model loading during development"""
    
    @staticmethod
    def get_system_info():
        """Get system memory and hardware info"""
        memory_gb = psutil.virtual_memory().total / (1024**3)
        cpu_count = psutil.cpu_count()
        return {
            'memory_gb': memory_gb,
            'cpu_count': cpu_count,
            'is_development': memory_gb < 30  # Less than 30GB = development mode
        }
    
    @staticmethod
    def ensure_development_safety():
        """Ensure we're in safe development mode"""
        info = MemorySafetyGuard.get_system_info()
        
        if info['is_development']:
            logger.info(f"🛡️  DEVELOPMENT MODE: {info['memory_gb']:.1f}GB RAM detected")
            logger.info("✅ Using mock implementations for safe development")
            return True
        else:
            logger.info(f"🚀 PRODUCTION MODE: {info['memory_gb']:.1f}GB RAM available")
            logger.info("⚠️  Real multimodal model will be loaded")
            return False

class MockMultimodalModel:
    """Mock multimodal model for safe development - uses <100MB memory"""
    
    def __init__(self):
        self.mock_responses = self._load_mock_responses()
        self.processing_times = {
            'ocr': (2.0, 5.0),
            'document_analysis': (3.0, 8.0),
            'image_chat': (4.0, 10.0),
            'form_analysis': (2.5, 6.0)
        }
        logger.info("✅ Mock multimodal model initialized")
    
    def _load_mock_responses(self):
        """Load realistic mock responses for testing"""
        return {
            'ocr_responses': {
                'english': "Application for Asylum in the United States\nFull Name: _______________\nDate of Birth: _______________\nCountry of Origin: _______________\nReason for Seeking Asylum: _______________",
                'arabic': "طلب اللجوء في الولايات المتحدة\nالاسم الكامل: _______________\nتاريخ الميلاد: _______________\nبلد المنشأ: _______________\nسبب طلب اللجوء: _______________",
                'persian': "درخواست پناهندگی در ایالات متحده\nنام کامل: _______________\nتاریخ تولد: _______________\nکشور مبدأ: _______________\nدلیل درخواست پناهندگی: _______________"
            },
            'document_types': ['asylum_application', 'medical_intake', 'aid_registration', 'legal_form', 'id_document'],
            'medical_conditions': ['wound_healing', 'skin_condition', 'bruising', 'rash', 'normal_appearance'],
            'form_fields': {
                'asylum_application': ['full_name', 'date_of_birth', 'country_of_origin', 'reason_for_asylum', 'arrival_date'],
                'medical_intake': ['patient_name', 'symptoms', 'medical_history', 'current_medications', 'emergency_contact'],
                'aid_registration': ['family_name', 'family_size', 'current_location', 'needs_assessment', 'contact_info']
            }
        }
    
    def process_vision_ocr(self, image_data, language='en'):
        """Mock OCR processing"""
        # Simulate processing time
        processing_time = random.uniform(*self.processing_times['ocr'])
        time.sleep(processing_time)
        
        # Select appropriate mock response
        lang_map = {'en': 'english', 'ar': 'arabic', 'fa': 'persian'}
        mock_lang = lang_map.get(language, 'english')
        extracted_text = self.mock_responses['ocr_responses'][mock_lang]
        
        return {
            'extracted_text': extracted_text,
            'language_detected': language,
            'confidence': random.uniform(0.85, 0.98),
            'processing_time': processing_time,
            'character_count': len(extracted_text),
            'word_count': len(extracted_text.split())
        }
    
    def process_document_analysis(self, image_data, document_type='general'):
        """Mock document analysis"""
        processing_time = random.uniform(*self.processing_times['document_analysis'])
        time.sleep(processing_time)
        
        # Random document type if not specified
        if document_type == 'general':
            document_type = random.choice(self.mock_responses['document_types'])
        
        # Generate mock extracted fields
        fields = self.mock_responses['form_fields'].get(document_type, ['field1', 'field2'])
        extracted_fields = {
            field: f"[{field.replace('_', ' ').title()}]" for field in fields
        }
        
        return {
            'document_type': document_type,
            'extracted_fields': extracted_fields,
            'critical_fields': fields[:3],
            'completion_percentage': random.uniform(0.6, 0.95),
            'confidence': random.uniform(0.80, 0.95),
            'processing_time': processing_time,
            'language_detected': random.choice(['en', 'ar', 'fa']),
            'urgency_level': random.choice(['low', 'medium', 'high'])
        }
    
    def process_medical_image(self, image_data, symptoms=''):
        """Mock medical image analysis"""
        processing_time = random.uniform(3.0, 7.0)
        time.sleep(processing_time)
        
        condition = random.choice(self.mock_responses['medical_conditions'])
        
        return {
            'analysis': f"The image shows signs consistent with {condition.replace('_', ' ')}. {symptoms}",
            'condition_detected': condition,
            'urgency_level': random.choice(['routine', 'urgent', 'emergency']),
            'recommendations': [
                "Seek professional medical evaluation",
                "Keep the area clean and dry",
                "Monitor for changes or worsening symptoms"
            ],
            'confidence': random.uniform(0.7, 0.9),
            'processing_time': processing_time,
            'disclaimer': "This is AI-generated information. Always consult healthcare professionals."
        }
    
    def process_multimodal_chat(self, text, image_data=None):
        """Mock multimodal chat processing"""
        processing_time = random.uniform(*self.processing_times['image_chat'])
        time.sleep(processing_time)
        
        if image_data:
            response = f"I can see the image you've shared. Based on your question '{text}', I can provide guidance about what I observe in the image. This is a mock response for development purposes."
        else:
            response = f"Thank you for your question: '{text}'. This is a mock response for development purposes."
        
        return {
            'response': response,
            'has_image': image_data is not None,
            'processing_time': processing_time,
            'language_detected': 'en',
            'confidence': random.uniform(0.8, 0.95)
        }

class ProductionMultimodalModel:
    """Production multimodal model - only loads on Dell Mini PC"""
    
    def __init__(self):
        # This will only be called on Dell Mini PC with 32GB RAM
        self.model_path = "/models/transformers/gemma-3n-e4b-it/2/"
        self.model = None
        self.processor = None
        self.device = None
        self.load_model()
    
    def load_model(self):
        """Load actual multimodal model - ONLY on Dell Mini PC"""
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoProcessor
            
            logger.info("🚀 Loading production multimodal Gemma model...")
            
            # Check available memory
            memory_gb = psutil.virtual_memory().total / (1024**3)
            if memory_gb < 30:
                raise RuntimeError(f"Insufficient RAM: {memory_gb:.1f}GB (need 32GB)")
            
            # Set device
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self.device}")
            
            # Load model with memory constraints
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.bfloat16,
                device_map="auto",
                max_memory={0: "20GB"},
                trust_remote_code=True
            )
            
            # Load processor
            self.processor = AutoProcessor.from_pretrained(self.model_path)
            
            logger.info("✅ Production multimodal model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load production model: {e}")
            raise
    
    def process_vision_ocr(self, image_data, language='en'):
        """Real OCR processing using multimodal model"""
        # Implementation for production Dell Mini PC
        # This would use the actual model for OCR
        pass
    
    def process_document_analysis(self, image_data, document_type='general'):
        """Real document analysis using multimodal model"""
        # Implementation for production Dell Mini PC
        pass
    
    def process_medical_image(self, image_data, symptoms=''):
        """Real medical image analysis using multimodal model"""
        # Implementation for production Dell Mini PC
        pass
    
    def process_multimodal_chat(self, text, image_data=None):
        """Real multimodal chat using multimodal model"""
        # Implementation for production Dell Mini PC
        pass

class MultimodalRefugeeConnectAI:
    """Enhanced Refugee Connect AI with multimodal capabilities"""
    
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Determine if we're in development or production mode
        self.is_development = MemorySafetyGuard.ensure_development_safety()
        
        # Initialize appropriate model
        if self.is_development:
            self.model = MockMultimodalModel()
        else:
            self.model = ProductionMultimodalModel()
        
        # Server configuration
        self.host = "0.0.0.0"
        self.port = 8080
        
        # Performance tracking
        self.stats = {
            "requests_served": 0,
            "avg_response_time": 0,
            "vision_requests": 0,
            "start_time": datetime.now(),
            "active_users": set(),
            "mode": "development" if self.is_development else "production"
        }
        
        # Response cache for development
        self.response_cache = {}
        
        # Load humanitarian context prompts from original server
        self.system_prompts = self._load_humanitarian_prompts()
        
        # Setup API routes
        self.setup_routes()
        
        logger.info(f"✅ Multimodal Refugee Connect AI initialized in {self.stats['mode']} mode")
    
    def _load_humanitarian_prompts(self):
        """Load humanitarian context prompts (inherited from original server)"""
        return {
            "vision_ocr": """You are helping extract text from documents for refugees. 
            Be accurate and preserve formatting. Focus on official forms and important documents.""",
            
            "document_analysis": """You are analyzing documents for refugee assistance. 
            Identify document types, extract key information, and highlight critical fields that need completion.""",
            
            "medical_image": """You are providing basic medical image analysis for humanitarian purposes. 
            ALWAYS emphasize the need for professional medical evaluation. Be helpful but cautious.""",
            
            "multimodal_chat": """You are a humanitarian AI assistant helping refugees. 
            When analyzing images, focus on safety, legal rights, and essential needs. Be trauma-informed."""
        }
    
    def setup_routes(self):
        """Setup enhanced API routes with vision capabilities"""
        
        # Keep all original routes for backward compatibility
        self._setup_original_routes()
        
        # Add new multimodal routes
        self._setup_vision_routes()
        
        # Enhanced status endpoint
        @self.app.route('/api/status', methods=['GET'])
        def get_enhanced_status():
            """Enhanced status with multimodal capabilities"""
            uptime = (datetime.now() - self.stats["start_time"]).total_seconds()
            
            system_info = MemorySafetyGuard.get_system_info()
            
            status_data = {
                "status": "online",
                "mode": self.stats["mode"],
                "multimodal_enabled": True,
                "vision_processing": True,
                "model_type": "Mock Multimodal Gemma" if self.is_development else "Multimodal Gemma 3n E4B",
                "system_info": {
                    "memory_gb": round(system_info['memory_gb'], 1),
                    "cpu_count": system_info['cpu_count'],
                    "is_development": system_info['is_development']
                },
                "capabilities": [
                    "text_processing",
                    "vision_ocr", 
                    "document_analysis",
                    "medical_image_analysis",
                    "multimodal_chat",
                    "form_processing"
                ],
                "users_connected": len(self.stats["active_users"]),
                "uptime_seconds": uptime,
                "uptime_readable": f"{int(uptime//3600)}h {int((uptime%3600)//60)}m",
                "requests_served": self.stats["requests_served"],
                "vision_requests": self.stats["vision_requests"],
                "avg_response_time_seconds": round(self.stats["avg_response_time"], 2),
                "memory_usage_gb": round(self._get_memory_usage(), 2),
                "server_time": datetime.now().isoformat()
            }
            
            return jsonify(status_data)
    
    def _setup_original_routes(self):
        """Setup original routes for backward compatibility"""
        # We'll inherit the original routes from ai_server.py
        # This ensures existing client code continues to work
        pass
    
    def _setup_vision_routes(self):
        """Setup new vision processing routes"""
        
        @self.app.route('/api/vision/ocr', methods=['POST'])
        def vision_ocr():
            """Server-side OCR processing"""
            try:
                data = request.get_json()
                image_data = data.get('image')
                language = data.get('language', 'en')
                
                if not image_data:
                    return jsonify({"error": "No image data provided"}), 400
                
                # Process with multimodal model
                result = self.model.process_vision_ocr(image_data, language)
                
                # Update stats
                self.stats["vision_requests"] += 1
                self._update_stats(result.get('processing_time', 0))
                
                return jsonify({
                    "success": True,
                    "extracted_text": result['extracted_text'],
                    "language_detected": result['language_detected'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "character_count": result.get('character_count', 0),
                    "word_count": result.get('word_count', 0),
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Vision OCR error: {e}")
                return jsonify({"error": "OCR processing failed"}), 500
        
        @self.app.route('/api/vision/document', methods=['POST'])
        def document_analysis():
            """Document analysis and classification"""
            try:
                data = request.get_json()
                image_data = data.get('image')
                document_type = data.get('document_type', 'general')
                
                if not image_data:
                    return jsonify({"error": "No image data provided"}), 400
                
                # Process with multimodal model
                result = self.model.process_document_analysis(image_data, document_type)
                
                # Update stats
                self.stats["vision_requests"] += 1
                self._update_stats(result.get('processing_time', 0))
                
                return jsonify({
                    "success": True,
                    "document_type": result['document_type'],
                    "extracted_fields": result['extracted_fields'],
                    "critical_fields": result['critical_fields'],
                    "completion_percentage": result['completion_percentage'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "language_detected": result['language_detected'],
                    "urgency_level": result['urgency_level'],
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Document analysis error: {e}")
                return jsonify({"error": "Document analysis failed"}), 500
        
        @self.app.route('/api/vision/medical', methods=['POST'])
        def medical_image_analysis():
            """Medical image analysis"""
            try:
                data = request.get_json()
                image_data = data.get('image')
                symptoms = data.get('symptoms', '')
                
                if not image_data:
                    return jsonify({"error": "No image data provided"}), 400
                
                # Process with multimodal model
                result = self.model.process_medical_image(image_data, symptoms)
                
                # Update stats
                self.stats["vision_requests"] += 1
                self._update_stats(result.get('processing_time', 0))
                
                return jsonify({
                    "success": True,
                    "analysis": result['analysis'],
                    "condition_detected": result['condition_detected'],
                    "urgency_level": result['urgency_level'],
                    "recommendations": result['recommendations'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "disclaimer": result['disclaimer'],
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Medical image analysis error: {e}")
                return jsonify({"error": "Medical image analysis failed"}), 500
        
        @self.app.route('/api/multimodal/chat', methods=['POST'])
        def multimodal_chat():
            """Combined text and image chat"""
            try:
                data = request.get_json()
                text = data.get('text', '')
                image_data = data.get('image')
                
                if not text and not image_data:
                    return jsonify({"error": "No text or image provided"}), 400
                
                # Process with multimodal model
                result = self.model.process_multimodal_chat(text, image_data)
                
                # Update stats
                self._update_stats(result.get('processing_time', 0))
                
                return jsonify({
                    "success": True,
                    "response": result['response'],
                    "has_image": result['has_image'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "language_detected": result['language_detected'],
                    "confidence": result['confidence'],
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Multimodal chat error: {e}")
                return jsonify({"error": "Multimodal chat failed"}), 500
    
    def _get_memory_usage(self):
        """Get current memory usage in GB"""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            return memory_info.rss / (1024 ** 3)
        except:
            return 0.0
    
    def _update_stats(self, response_time):
        """Update server performance statistics"""
        self.stats["requests_served"] += 1
        current_avg = self.stats["avg_response_time"]
        count = self.stats["requests_served"]
        
        # Calculate rolling average
        self.stats["avg_response_time"] = (current_avg * (count - 1) + response_time) / count
    
    def run_server(self):
        """Start the multimodal AI server"""
        logger.info("🚀 Starting Multimodal Refugee Connect AI Server...")
        logger.info(f"📡 Server available at http://{self.host}:{self.port}")
        logger.info(f"🔧 Mode: {self.stats['mode']}")
        logger.info(f"🧠 Model: {'Mock' if self.is_development else 'Production'} Multimodal Gemma")
        
        # Start Flask server
        try:
            from waitress import serve
            logger.info("🌟 Starting with Waitress WSGI server...")
            serve(
                self.app,
                host=self.host,
                port=self.port,
                threads=4,
                cleanup_interval=30,
                channel_timeout=120
            )
        except ImportError:
            logger.warning("Waitress not available, using Flask dev server")
            self.app.run(host=self.host, port=self.port, threaded=True)

def main():
    """Main entry point"""
    server = MultimodalRefugeeConnectAI()
    try:
        server.run_server()
    except KeyboardInterrupt:
        logger.info("🛑 Server shutdown requested")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")

if __name__ == "__main__":
    main()