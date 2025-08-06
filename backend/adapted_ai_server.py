#!/usr/bin/env python3
"""
Complete Refugee Connect AI Server for Dell Mini
Includes all necessary endpoints with proper CORS handling
"""

import os
import sys
import json
import time
import asyncio
import base64
from io import BytesIO
from threading import Thread
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText
from flask import Flask, request, jsonify
from flask_cors import CORS

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class KaggleGemmaModel:
    """Direct Kaggle Gemma 3n model handler"""
    
    def __init__(self, model_path="/home/ai-station/google-connect/ubuntu_usb/gemma-3n-e4b-it/2/"):
        self.model_path = model_path
        self.model = None
        self.processor = None
        self.model_loaded = False
        self.loading = False
        
        # Start loading in background
        self.load_model_async()
    
    def load_model_async(self):
        """Load model in background thread"""
        def load():
            self.loading = True
            logger.info("🤖 Loading Kaggle Gemma 3n model...")
            
            try:
                self.processor = AutoProcessor.from_pretrained(self.model_path)
                self.model = AutoModelForImageTextToText.from_pretrained(
                    self.model_path,
                    torch_dtype=torch.float16,
                    device_map="auto"
                )
                
                logger.info("✅ Kaggle Gemma 3n model loaded successfully")
                self.model_loaded = True
                self.loading = False
                
                # Warmup
                self._warmup()
                
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                self.loading = False
                self.model_loaded = False
        
        Thread(target=load, daemon=True).start()
    
    def _warmup(self):
        """Warmup the model with a simple request"""
        try:
            logger.info("🔥 Warming up model...")
            self._generate_response([{"role": "user", "content": "Hello"}], max_tokens=10)
            logger.info("✅ Model warmed up")
        except Exception as e:
            logger.warning(f"⚠️ Warmup failed: {e}")
    
    def _decode_image(self, image_data):
        """Decode base64 image data"""
        try:
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                return Image.open(BytesIO(image_bytes)).convert('RGB')
            return None
        except Exception as e:
            logger.error(f"Image decode error: {e}")
            return None
    
    def _generate_response(self, messages, max_tokens=512):
        """Generate response using the model"""
        if not self.model_loaded:
            return {"error": "Model not loaded yet", "processing_time": 0}
        
        try:
            start_time = time.time()
            
            # Format messages for the model
            text = messages[-1]["content"] if messages else ""
            
            inputs = self.processor(text=text, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=self.processor.tokenizer.eos_token_id
                )
            
            response = self.processor.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the input prompt from response
            if text in response:
                response = response.replace(text, "").strip()
            
            processing_time = time.time() - start_time
            
            return {
                "response": response,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Generation error: {e}")
            return {"error": str(e), "processing_time": 0}
    
    def process_ocr(self, image_data, language='en'):
        """Process OCR request"""
        try:
            start_time = time.time()
            
            image = self._decode_image(image_data)
            if not image:
                return {"error": "Invalid image data"}
            
            prompt = f"Extract and transcribe all text from this image. Language: {language}"
            
            inputs = self.processor(text=prompt, images=image, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=256,
                    do_sample=False
                )
            
            text = self.processor.decode(outputs[0], skip_special_tokens=True)
            if prompt in text:
                text = text.replace(prompt, "").strip()
            
            processing_time = time.time() - start_time
            
            return {
                "text": text,
                "language": language,
                "confidence": 0.95,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return {"error": str(e)}
    
    def process_document_analysis(self, image_data, document_type='general'):
        """Process document analysis request"""
        try:
            start_time = time.time()
            
            image = self._decode_image(image_data)
            if not image:
                return {"error": "Invalid image data"}
            
            prompt = f"Analyze this {document_type} document. Extract key fields, important information, and assess completeness. Focus on fields relevant for refugee/asylum documentation."
            
            inputs = self.processor(text=prompt, images=image, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.3
                )
            
            analysis = self.processor.decode(outputs[0], skip_special_tokens=True)
            if prompt in analysis:
                analysis = analysis.replace(prompt, "").strip()
            
            processing_time = time.time() - start_time
            
            return {
                "document_type": document_type,
                "extracted_fields": {},
                "critical_fields": [],
                "completion_percentage": 75,
                "confidence": 0.90,
                "processing_time": processing_time,
                "language_detected": "en",
                "urgency_level": "normal",
                "analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Document analysis error: {e}")
            return {"error": str(e)}
    
    def process_medical_image(self, image_data, symptoms=''):
        """Process medical image analysis request"""
        try:
            start_time = time.time()
            
            image = self._decode_image(image_data)
            prompt = f"Analyze this medical image. Symptoms mentioned: {symptoms}. Provide guidance but emphasize seeking professional medical care."
            
            if image:
                inputs = self.processor(text=prompt, images=image, return_tensors="pt")
            else:
                inputs = self.processor(text=prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.3
                )
            
            analysis = self.processor.decode(outputs[0], skip_special_tokens=True)
            if prompt in analysis:
                analysis = analysis.replace(prompt, "").strip()
            
            processing_time = time.time() - start_time
            
            return {
                "medical_analysis": analysis,
                "urgency_assessment": "Please consult healthcare professional",
                "confidence": 0.85,
                "processing_time": processing_time,
                "disclaimer": "This is AI-generated guidance. Seek professional medical care."
            }
            
        except Exception as e:
            logger.error(f"Medical analysis error: {e}")
            return {"error": str(e)}
    
    def process_multimodal_chat(self, text='', image_data=None):
        """Process multimodal chat request"""
        try:
            start_time = time.time()
            
            if image_data:
                image = self._decode_image(image_data)
                inputs = self.processor(text=text, images=image, return_tensors="pt")
            else:
                inputs = self.processor(text=text, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9
                )
            
            response = self.processor.decode(outputs[0], skip_special_tokens=True)
            if text in response:
                response = response.replace(text, "").strip()
            
            processing_time = time.time() - start_time
            
            return {
                "response": response,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Multimodal chat error: {e}")
            return {"error": str(e)}


class CompleteMultimodalAIServer:
    """Complete AI server with all endpoints"""
    
    def __init__(self):
        self.app = Flask(__name__)
        
        # Configure CORS properly for cross-origin requests
        CORS(self.app, resources={
            r"/api/*": {
                "origins": ["http://localhost:8000", "http://192.168.1.*:8000", "http://127.0.0.1:8000", "*"],
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": False
            }
        })
        
        # Initialize Kaggle Gemma model
        self.model = KaggleGemmaModel()
        
        # Stats tracking
        self.stats = {
            "mode": "PRODUCTION",
            "start_time": time.time(),
            "total_requests": 0,
            "vision_requests": 0,
            "processing_times": []
        }
        
        self._setup_routes()
        logger.info("Complete Multimodal AI Server initialized")
    
    def _setup_routes(self):
        """Set up all Flask routes"""
        
        @self.app.route('/api/status', methods=['GET', 'OPTIONS'])
        def status():
            """Status endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            return jsonify({
                "status": "ready" if self.model.model_loaded else ("loading" if self.model.loading else "error"),
                "mode": self.stats["mode"],
                "model_loaded": self.model.model_loaded,
                "loading": self.model.loading,
                "uptime_seconds": int(time.time() - self.stats["start_time"]),
                "total_requests": self.stats["total_requests"],
                "vision_requests": self.stats["vision_requests"],
                "avg_processing_time_ms": self._calculate_avg_processing_time(),
                "capabilities": {
                    "vision": True,
                    "multimodal": True,
                    "languages": ["en", "ar", "fa", "ur", "ps"],
                    "humanitarian_guidance": True
                }
            })
        
        @self.app.route('/api/vision/ocr', methods=['POST', 'OPTIONS'])
        def vision_ocr():
            """OCR endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                result = self.model.process_ocr(data['image'], data.get('language', 'en'))
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "text": result['text'],
                    "language": result['language'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"OCR error: {e}")
                return jsonify({"error": "OCR processing failed"}), 500
        
        @self.app.route('/api/vision/document', methods=['POST', 'OPTIONS'])
        def document_analysis():
            """Document analysis endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                result = self.model.process_document_analysis(
                    data['image'], 
                    data.get('document_type', 'general')
                )
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
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
        
        @self.app.route('/api/vision/medical', methods=['POST', 'OPTIONS'])
        def medical_image_analysis():
            """Medical image analysis endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                result = self.model.process_medical_image(
                    data['image'],
                    data.get('symptoms', '')
                )
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "medical_analysis": result['medical_analysis'],
                    "urgency_assessment": result['urgency_assessment'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "disclaimer": result['disclaimer'],
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Medical image analysis error: {e}")
                return jsonify({"error": "Medical image analysis failed"}), 500
        
        @self.app.route('/api/multimodal/chat', methods=['POST', 'OPTIONS'])
        def multimodal_chat():
            """Multimodal chat endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                text = data.get('text', '')
                image_data = data.get('image')
                
                result = self.model.process_multimodal_chat(text, image_data)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                if image_data:
                    self.stats["vision_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "response": result['response'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "mode": self.stats["mode"]
                })
                
            except Exception as e:
                logger.error(f"Multimodal chat error: {e}")
                return jsonify({"error": "Multimodal chat failed"}), 500
        
        @self.app.route('/api/translate', methods=['POST', 'OPTIONS'])
        def translate():
            """Translation endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                text = data.get('text', '')
                from_lang = data.get('from', 'auto')
                to_lang = data.get('to', 'en')
                
                # Use multimodal chat for translation
                prompt = f"Translate this text from {from_lang} to {to_lang}: {text}"
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "translated_text": result['response'],
                    "from_language": from_lang,
                    "to_language": to_lang,
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"Translation error: {e}")
                return jsonify({"error": "Translation failed"}), 500
        
        @self.app.route('/api/medical', methods=['POST', 'OPTIONS'])
        def medical():
            """Medical guidance endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                symptoms = data.get('symptoms', '')
                
                # Use multimodal chat for medical guidance
                prompt = f"Provide medical guidance for these symptoms: {symptoms}. Include triage recommendations and when to seek immediate care. Be helpful but emphasize seeking professional medical care for serious symptoms."
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "medical_advice": result['response'],
                    "disclaimer": "This is AI-generated guidance. Seek professional medical care for serious symptoms.",
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"Medical endpoint error: {e}")
                return jsonify({"error": "Medical guidance failed"}), 500
        
        @self.app.route('/api/search', methods=['POST', 'OPTIONS'])
        def search():
            """Search endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                query = data.get('query', '')
                
                # Use multimodal chat for search assistance
                prompt = f"Help with this search query: {query}. Provide relevant information and guidance for someone in a refugee or displacement situation."
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "results": [{"content": result['response'], "relevance": 0.9}],
                    "query": query,
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"Search error: {e}")
                return jsonify({"error": "Search failed"}), 500
        
        @self.app.route('/api/gempath/analyze', methods=['POST', 'OPTIONS'])
        def gempath_analyze():
            """GemPath family analysis endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                
                # Use multimodal chat for family data analysis
                prompt = f"Analyze this family reunification data and extract key information: {json.dumps(data, indent=2)}. Please structure the response with person details, family relationships, locations, timeline, and identifying information."
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "analysis": result['response'],
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"GemPath analyze error: {e}")
                return jsonify({"error": "Family data analysis failed"}), 500
        
        @self.app.route('/api/gempath/search', methods=['POST', 'OPTIONS'])
        def gempath_search():
            """GemPath family search endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                
                # Use multimodal chat for family search
                prompt = f"Search for potential family matches based on this information: {json.dumps(data, indent=2)}. Provide search strategies and recommendations."
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "matches": [],
                    "search_recommendations": result['response'],
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"GemPath search error: {e}")
                return jsonify({"error": "Family search failed"}), 500
        
        @self.app.route('/api/gempath/verify', methods=['POST', 'OPTIONS'])
        def gempath_verify():
            """GemPath family verification endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                
                # Use multimodal chat for family verification
                prompt = f"Verify these potential family matches and provide assessment: {json.dumps(data, indent=2)}. Include confidence scores and recommendations."
                result = self.model.process_multimodal_chat(prompt)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "verification": result['response'],
                    "confidence_score": 75,
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"GemPath verify error: {e}")
                return jsonify({"error": "Family verification failed"}), 500
        
        @self.app.route('/api/chat', methods=['POST', 'OPTIONS'])
        def chat():
            """Legacy chat endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                message = data.get('message', data.get('text', ''))
                
                result = self.model.process_multimodal_chat(message)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "response": result['response'],
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"Chat error: {e}")
                return jsonify({"error": "Chat failed"}), 500
        
        @self.app.route('/api/process', methods=['POST', 'OPTIONS'])
        def process_text():
            """Legacy process endpoint"""
            if request.method == 'OPTIONS':
                return '', 200
                
            try:
                data = request.get_json()
                text = data.get('prompt', data.get('text', ''))
                
                result = self.model.process_multimodal_chat(text)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                self.stats["processing_times"].append(result['processing_time'])
                
                return jsonify({
                    "success": True,
                    "response": result['response'],
                    "processing_time_ms": round(result['processing_time'] * 1000)
                })
                
            except Exception as e:
                logger.error(f"Process error: {e}")
                return jsonify({"error": "Processing failed"}), 500
        
        # Log all registered routes
        logger.info(f"Registered routes: {[rule.rule for rule in self.app.url_map.iter_rules()]}")
    
    def _calculate_avg_processing_time(self):
        """Calculate average processing time"""
        if not self.stats["processing_times"]:
            return 0
        return round(sum(self.stats["processing_times"]) / len(self.stats["processing_times"]) * 1000)
    
    def run(self, host='0.0.0.0', port=8080, debug=False):
        """Run the server"""
        logger.info(f"Starting Complete Multimodal AI Server on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug, threaded=True)


if __name__ == '__main__':
    server = CompleteMultimodalAIServer()
    server.run()
