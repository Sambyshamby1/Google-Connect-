#!/usr/bin/env python3
"""
Enhanced Refugee Connect AI Server with Request Queue
Adds priority-based processing and better concurrent request handling
"""

import os
import sys
import json
import time
import asyncio
from threading import Thread
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add enhanced modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'enhanced'))

# Import the original server and queue
from ai_server_multimodal import MemorySafetyGuard, MockMultimodalModel, ProductionMultimodalModel
from request_queue import AdvancedRequestQueue, Priority, QueuedRequest

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class EnhancedMultimodalAIServer:
    """Enhanced AI server with request queuing and priority processing"""
    
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Initialize base components
        self.is_development = MemorySafetyGuard.ensure_development_safety()
        
        if self.is_development:
            self.model = MockMultimodalModel()
        else:
            self.model = ProductionMultimodalModel()
        
        # Initialize request queue
        self.request_queue = AdvancedRequestQueue(
            max_size=30,  # Larger queue for production
            max_concurrent=4 if self.is_development else 3,  # Fewer concurrent for real model
            overflow_policy='drop_lowest_priority'
        )
        
        # Stats tracking
        self.stats = {
            "mode": "DEVELOPMENT" if self.is_development else "PRODUCTION",
            "start_time": time.time(),
            "total_requests": 0,
            "vision_requests": 0,
            "processing_times": [],
            "queue_stats": {}
        }
        
        # Start async event loop in background thread
        self.loop = asyncio.new_event_loop()
        self.async_thread = Thread(target=self._run_async_loop, daemon=True)
        self.async_thread.start()
        
        # Start request processor
        asyncio.run_coroutine_threadsafe(
            self.request_queue.process_requests(self._process_request),
            self.loop
        )
        
        # Set up routes
        self._setup_routes()
        
        logger.info("Enhanced Multimodal AI Server initialized")
    
    def _run_async_loop(self):
        """Run async event loop in background thread"""
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()
    
    def _get_priority_from_request_type(self, request_type: str, data: dict) -> Priority:
        """Determine priority based on request type and content"""
        # Medical requests are always high priority
        if request_type == 'medical':
            urgency = data.get('urgency', 'normal')
            if urgency == 'emergency':
                return Priority.EMERGENCY
            return Priority.HIGH
        
        # Document processing is high priority
        elif request_type == 'document':
            doc_type = data.get('document_type', 'general')
            if doc_type in ['asylum_application', 'legal_form', 'id_document']:
                return Priority.HIGH
            return Priority.NORMAL
        
        # OCR requests are normal priority
        elif request_type == 'ocr':
            return Priority.NORMAL
        
        # Chat is low priority unless specified
        elif request_type == 'chat':
            if data.get('priority') == 'high':
                return Priority.HIGH
            return Priority.LOW
        
        # GemPath family reunification requests are high priority
        elif request_type in ['gempath_analyze', 'gempath_search', 'gempath_verify']:
            return Priority.HIGH
        
        return Priority.NORMAL
    
    async def _process_request(self, queued_request: QueuedRequest) -> dict:
        """Process a queued request"""
        request_type = queued_request.request_type
        payload = queued_request.payload
        
        try:
            if request_type == 'ocr':
                return await self._process_ocr_async(payload)
            elif request_type == 'document':
                return await self._process_document_async(payload)
            elif request_type == 'medical':
                return await self._process_medical_async(payload)
            elif request_type == 'chat':
                return await self._process_chat_async(payload)
            elif request_type == 'gempath_analyze':
                return await self._process_gempath_analyze_async(payload)
            elif request_type == 'gempath_search':
                return await self._process_gempath_search_async(payload)
            elif request_type == 'gempath_verify':
                return await self._process_gempath_verify_async(payload)
            else:
                raise ValueError(f"Unknown request type: {request_type}")
                
        except Exception as e:
            logger.error(f"Error processing request {queued_request.id}: {e}")
            return {"error": str(e)}
    
    async def _process_ocr_async(self, data: dict) -> dict:
        """Async OCR processing"""
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.model.process_ocr,
            data['image'],
            data.get('language', 'en')
        )
    
    async def _process_document_async(self, data: dict) -> dict:
        """Async document processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.model.process_document_analysis,
            data['image'],
            data.get('document_type', 'general')
        )
    
    async def _process_medical_async(self, data: dict) -> dict:
        """Async medical image processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.model.process_medical_image,
            data['image'],
            data.get('symptoms', '')
        )
    
    async def _process_chat_async(self, data: dict) -> dict:
        """Async multimodal chat processing"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.model.process_multimodal_chat,
            data.get('text', ''),
            data.get('image')
        )
    
    async def _process_gempath_analyze_async(self, data: dict) -> dict:
        """Async family reunification form analysis"""
        loop = asyncio.get_event_loop()
        
        # Create analysis prompt for family data
        prompt = f"""
        Analyze this family reunification form data and extract key information:
        
        Form Data: {json.dumps(data, indent=2)}
        
        Please extract and structure:
        1. Person details (name, age, gender, description)
        2. Family relationships and members
        3. Locations (origin, current, seeking)
        4. Timeline and dates
        5. Key identifying information
        6. Contact preferences
        
        Return structured JSON with extracted information and confidence scores.
        """
        
        return await loop.run_in_executor(
            None,
            self.model.process_multimodal_chat,
            prompt,
            None
        )
    
    async def _process_gempath_search_async(self, data: dict) -> dict:
        """Async family member search processing"""
        loop = asyncio.get_event_loop()
        
        # Create search prompt
        search_query = data.get('search_query', '')
        person_data = data.get('person_data', {})
        
        prompt = f"""
        Search for potential family matches based on this information:
        
        Search Query: {search_query}
        Person Data: {json.dumps(person_data, indent=2)}
        
        Based on the provided information, suggest potential matching strategies and
        generate search parameters that could help find family members:
        
        1. Key identifiers to search for
        2. Location-based search strategies  
        3. Timeline correlation methods
        4. Physical description matching
        5. Cultural/linguistic connections
        
        Return a structured response with search recommendations and confidence levels.
        """
        
        return await loop.run_in_executor(
            None,
            self.model.process_multimodal_chat,
            prompt,
            data.get('image')
        )
    
    async def _process_gempath_verify_async(self, data: dict) -> dict:
        """Async family match verification processing"""
        loop = asyncio.get_event_loop()
        
        # Create verification prompt
        match_data = data.get('match_data', {})
        person_data = data.get('person_data', {})
        
        prompt = f"""
        Verify if these two family records could be a match:
        
        Person A: {json.dumps(person_data, indent=2)}
        Person B: {json.dumps(match_data, indent=2)}
        
        Analyze and compare:
        1. Name similarities and variations
        2. Age consistency and timelines
        3. Location correlations
        4. Physical descriptions
        5. Family relationship patterns
        6. Cultural and linguistic indicators
        
        Provide a verification assessment with:
        - Confidence score (0-100)
        - Matching factors
        - Conflicting information
        - Recommendations for further verification
        
        Return structured JSON with detailed analysis.
        """
        
        return await loop.run_in_executor(
            None,
            self.model.process_multimodal_chat,
            prompt,
            data.get('image')
        )
    
    def _setup_routes(self):
        """Set up enhanced Flask routes with queuing"""
        
        @self.app.route('/api/status', methods=['GET'])
        def status():
            """Enhanced status with queue information"""
            queue_status = self.request_queue.get_queue_status()
            
            return jsonify({
                "status": "online",
                "mode": self.stats["mode"],
                "uptime_seconds": int(time.time() - self.stats["start_time"]),
                "total_requests": self.stats["total_requests"],
                "vision_requests": self.stats["vision_requests"],
                "avg_processing_time_ms": self._calculate_avg_processing_time(),
                "queue": queue_status,
                "capabilities": {
                    "vision": True,
                    "multimodal": True,
                    "languages": ["en", "ar", "fa", "ur", "ps"],
                    "max_concurrent": self.request_queue.max_concurrent,
                    "queue_size": self.request_queue.max_size
                }
            })
        
        @self.app.route('/api/vision/ocr', methods=['POST'])
        def vision_ocr():
            """Enhanced OCR with queuing"""
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                # Determine priority
                priority = self._get_priority_from_request_type('ocr', data)
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('ocr', data, priority),
                    self.loop
                )
                
                # Wait for result with timeout
                result = future.result(timeout=60)  # 60 second timeout
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "success": True,
                    "text": result['text'],
                    "language": result['language'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "queue_time_ms": result.get('queue_time_ms', 0),
                    "mode": self.stats["mode"]
                })
                
            except asyncio.TimeoutError:
                return jsonify({"error": "Request timeout - server overloaded"}), 503
            except Exception as e:
                logger.error(f"OCR error: {e}")
                return jsonify({"error": "OCR processing failed"}), 500
        
        @self.app.route('/api/vision/document', methods=['POST'])
        def document_analysis():
            """Enhanced document analysis with queuing"""
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                # Determine priority
                priority = self._get_priority_from_request_type('document', data)
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('document', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=60)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "success": True,
                    "document_type": result['document_type'],
                    "extracted_fields": result['extracted_fields'],
                    "critical_fields": result['critical_fields'],
                    "completion_percentage": result['completion_percentage'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "queue_time_ms": result.get('queue_time_ms', 0),
                    "language_detected": result['language_detected'],
                    "urgency_level": result['urgency_level'],
                    "mode": self.stats["mode"]
                })
                
            except asyncio.TimeoutError:
                return jsonify({"error": "Request timeout - server overloaded"}), 503
            except Exception as e:
                logger.error(f"Document analysis error: {e}")
                return jsonify({"error": "Document analysis failed"}), 500
        
        @self.app.route('/api/vision/medical', methods=['POST'])
        def medical_image_analysis():
            """Enhanced medical image analysis with priority queuing"""
            try:
                data = request.get_json()
                if not data.get('image'):
                    return jsonify({"error": "No image data provided"}), 400
                
                # Medical requests get higher priority
                priority = self._get_priority_from_request_type('medical', data)
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('medical', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=60)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["vision_requests"] += 1
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "success": True,
                    "analysis": result['analysis'],
                    "condition_detected": result['condition_detected'],
                    "urgency_level": result['urgency_level'],
                    "recommendations": result['recommendations'],
                    "confidence": result['confidence'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "queue_time_ms": result.get('queue_time_ms', 0),
                    "disclaimer": result['disclaimer'],
                    "mode": self.stats["mode"]
                })
                
            except asyncio.TimeoutError:
                return jsonify({"error": "Request timeout - server overloaded"}), 503
            except Exception as e:
                logger.error(f"Medical image analysis error: {e}")
                return jsonify({"error": "Medical image analysis failed"}), 500
        
        @self.app.route('/api/multimodal/chat', methods=['POST'])
        def multimodal_chat():
            """Enhanced multimodal chat with queuing"""
            try:
                data = request.get_json()
                if not data.get('text') and not data.get('image'):
                    return jsonify({"error": "No text or image provided"}), 400
                
                # Determine priority
                priority = self._get_priority_from_request_type('chat', data)
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('chat', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=60)
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "success": True,
                    "response": result['response'],
                    "has_image": result['has_image'],
                    "processing_time_ms": round(result['processing_time'] * 1000),
                    "queue_time_ms": result.get('queue_time_ms', 0),
                    "language_detected": result['language_detected'],
                    "confidence": result['confidence'],
                    "mode": self.stats["mode"]
                })
                
            except asyncio.TimeoutError:
                return jsonify({"error": "Request timeout - server overloaded"}), 503
            except Exception as e:
                logger.error(f"Multimodal chat error: {e}")
                return jsonify({"error": "Multimodal chat failed"}), 500
        
        # Keep original endpoints for backward compatibility
        @self.app.route('/api/process', methods=['POST'])
        def process_text():
            """Legacy text processing endpoint"""
            data = request.get_json()
            text = data.get('prompt', '')
            
            # Use chat endpoint with normal priority
            future = asyncio.run_coroutine_threadsafe(
                self._queue_and_wait('chat', {'text': text}, Priority.NORMAL),
                self.loop
            )
            
            try:
                result = future.result(timeout=30)
                self.stats["total_requests"] += 1
                return jsonify({
                    "response": result.get('response', 'Processing failed'),
                    "processing_time_ms": round(result.get('processing_time', 0) * 1000)
                })
            except:
                return jsonify({"response": "Server is busy, please try again"}), 503
        
        # GemPath family reunification endpoints
        @self.app.route('/api/gempath/analyze', methods=['POST'])
        def gempath_analyze():
            """Analyze family reunification form data"""
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "No data provided"}), 400
                
                # High priority for family reunification
                priority = Priority.HIGH
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('gempath_analyze', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=45)  # 45 second timeout
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                return jsonify(result)
                
            except Exception as e:
                logger.error(f"GemPath analyze error: {e}")
                return jsonify({"error": "Family data analysis failed"}), 500
        
        @self.app.route('/api/gempath/search', methods=['POST'])
        def gempath_search():
            """Search for potential family matches"""
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "No search data provided"}), 400
                
                # High priority for family searches
                priority = Priority.HIGH
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('gempath_search', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=60)  # 60 second timeout for searches
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                return jsonify(result)
                
            except Exception as e:
                logger.error(f"GemPath search error: {e}")
                return jsonify({"error": "Family search failed"}), 500
        
        @self.app.route('/api/gempath/verify', methods=['POST'])
        def gempath_verify():
            """Verify potential family matches"""
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "No verification data provided"}), 400
                
                # High priority for family verification
                priority = Priority.HIGH
                
                # Queue request
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('gempath_verify', data, priority),
                    self.loop
                )
                
                result = future.result(timeout=30)  # 30 second timeout for verification
                
                if 'error' in result:
                    return jsonify({"error": result['error']}), 500
                
                self.stats["total_requests"] += 1
                return jsonify(result)
                
            except Exception as e:
                logger.error(f"GemPath verify error: {e}")
                return jsonify({"error": "Family verification failed"}), 500
        
        # Legacy compatibility endpoints
        @self.app.route('/api/translate', methods=['POST'])
        def translate():
            """Legacy translation endpoint"""
            try:
                data = request.get_json()
                text = data.get('text', '')
                from_lang = data.get('from', 'auto')
                to_lang = data.get('to', 'en')
                
                # Convert to chat format
                prompt = f"Translate this text from {from_lang} to {to_lang}: {text}"
                chat_data = {'text': prompt}
                
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('chat', chat_data, Priority.NORMAL),
                    self.loop
                )
                
                result = future.result(timeout=30)
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "translated_text": result.get('response', text),
                    "from_language": from_lang,
                    "to_language": to_lang
                })
                
            except Exception as e:
                logger.error(f"Translation error: {e}")
                return jsonify({"error": "Translation failed"}), 500
        
        @self.app.route('/api/medical', methods=['POST'])
        def medical():
            """Legacy medical endpoint"""
            try:
                data = request.get_json()
                symptoms = data.get('symptoms', '')
                
                # Convert to chat format
                prompt = f"Provide medical guidance for these symptoms: {symptoms}. Include triage recommendations and when to seek immediate care."
                chat_data = {'text': prompt}
                
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('chat', chat_data, Priority.HIGH),
                    self.loop
                )
                
                result = future.result(timeout=30)
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "medical_advice": result.get('response', 'Unable to provide medical guidance'),
                    "disclaimer": "This is AI-generated guidance. Seek professional medical care for serious symptoms."
                })
                
            except Exception as e:
                logger.error(f"Medical endpoint error: {e}")
                return jsonify({"error": "Medical guidance failed"}), 500
        
        @self.app.route('/api/search', methods=['POST'])
        def search():
            """Legacy search endpoint"""
            try:
                data = request.get_json()
                query = data.get('query', '')
                
                # Convert to chat format
                prompt = f"Help with this search query: {query}. Provide relevant information and guidance."
                chat_data = {'text': prompt}
                
                future = asyncio.run_coroutine_threadsafe(
                    self._queue_and_wait('chat', chat_data, Priority.NORMAL),
                    self.loop
                )
                
                result = future.result(timeout=30)
                self.stats["total_requests"] += 1
                
                return jsonify({
                    "results": [{"content": result.get('response', 'No results found'), "relevance": 0.9}],
                    "query": query
                })
                
            except Exception as e:
                logger.error(f"Search error: {e}")
                return jsonify({"error": "Search failed"}), 500
    
    async def _queue_and_wait(self, request_type: str, data: dict, priority: Priority) -> dict:
        """Queue request and wait for result"""
        queue_start = time.time()
        
        # Create response future
        response_future = asyncio.Future()
        
        # Create wrapped data with future
        wrapped_data = {
            **data,
            '_response_future': response_future
        }
        
        # Queue request
        request_id = await self.request_queue.add_request(
            request_type=request_type,
            payload=wrapped_data,
            priority=priority
        )
        
        if not request_id:
            return {"error": "Queue full - server overloaded"}
        
        # Wait for processing
        result = await response_future
        
        # Add queue time
        result['queue_time_ms'] = round((time.time() - queue_start - result.get('processing_time', 0)) * 1000)
        
        return result
    
    def _calculate_avg_processing_time(self):
        """Calculate average processing time"""
        if not self.stats["processing_times"]:
            return 0
        recent = self.stats["processing_times"][-100:]  # Last 100 requests
        return round(sum(recent) / len(recent) * 1000)
    
    def run(self, host='0.0.0.0', port=8080, debug=False):
        """Run the enhanced server"""
        logger.info(f"Starting Enhanced Multimodal AI Server on {host}:{port}")
        logger.info(f"Mode: {self.stats['mode']}")
        logger.info(f"Queue: max_size={self.request_queue.max_size}, max_concurrent={self.request_queue.max_concurrent}")
        
        self.app.run(host=host, port=port, debug=debug, threaded=True)

if __name__ == "__main__":
    server = EnhancedMultimodalAIServer()
    server.run()