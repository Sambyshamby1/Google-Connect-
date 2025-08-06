#!/usr/bin/env python3
"""
Advanced Request Queue System for Multimodal AI Server
Provides priority-based processing, overflow handling, and monitoring
"""

import asyncio
import time
import uuid
from enum import Enum
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Priority(Enum):
    """Request priority levels"""
    EMERGENCY = 1  # Medical emergencies, safety issues
    HIGH = 2       # Document processing, legal matters
    NORMAL = 3     # General queries, chat
    LOW = 4        # Background tasks, analytics

@dataclass
class QueuedRequest:
    """Request wrapper with metadata"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    priority: Priority = Priority.NORMAL
    request_type: str = ""
    payload: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    client_id: Optional[str] = None
    
    def __lt__(self, other):
        """Enable priority queue sorting"""
        if self.priority.value != other.priority.value:
            return self.priority.value < other.priority.value
        return self.timestamp < other.timestamp

class RequestQueueStats:
    """Queue statistics tracker"""
    def __init__(self):
        self.total_queued = 0
        self.total_processed = 0
        self.total_rejected = 0
        self.total_errors = 0
        self.processing_times = []
        self.queue_times = []
        self.priority_counts = {p: 0 for p in Priority}
        
    def record_queued(self, priority: Priority):
        self.total_queued += 1
        self.priority_counts[priority] += 1
    
    def record_processed(self, queue_time: float, processing_time: float):
        self.total_processed += 1
        self.queue_times.append(queue_time)
        self.processing_times.append(processing_time)
    
    def record_rejected(self):
        self.total_rejected += 1
    
    def record_error(self):
        self.total_errors += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current statistics"""
        avg_queue_time = sum(self.queue_times) / len(self.queue_times) if self.queue_times else 0
        avg_processing_time = sum(self.processing_times) / len(self.processing_times) if self.processing_times else 0
        
        return {
            'total_queued': self.total_queued,
            'total_processed': self.total_processed,
            'total_rejected': self.total_rejected,
            'total_errors': self.total_errors,
            'avg_queue_time': round(avg_queue_time, 2),
            'avg_processing_time': round(avg_processing_time, 2),
            'priority_breakdown': {p.name: count for p, count in self.priority_counts.items()},
            'success_rate': round(self.total_processed / self.total_queued * 100, 2) if self.total_queued > 0 else 0
        }

class AdvancedRequestQueue:
    """Advanced request queue with priority processing and monitoring"""
    
    def __init__(self, max_size: int = 20, max_concurrent: int = 4, overflow_policy: str = 'reject'):
        self.max_size = max_size
        self.max_concurrent = max_concurrent
        self.overflow_policy = overflow_policy  # 'reject', 'drop_oldest', 'drop_lowest_priority'
        
        # Use asyncio PriorityQueue for automatic priority sorting
        self.queue = asyncio.PriorityQueue(maxsize=max_size)
        self.processing = {}  # Track active requests
        self.stats = RequestQueueStats()
        
        # Callbacks for monitoring
        self.on_queue_full = None
        self.on_request_complete = None
        self.on_error = None
        
        logger.info(f"RequestQueue initialized: max_size={max_size}, max_concurrent={max_concurrent}")
    
    async def add_request(self, 
                         request_type: str,
                         payload: Dict[str, Any],
                         priority: Priority = Priority.NORMAL,
                         client_id: Optional[str] = None) -> Optional[str]:
        """Add request to queue with priority"""
        request = QueuedRequest(
            priority=priority,
            request_type=request_type,
            payload=payload,
            client_id=client_id
        )
        
        try:
            # Try to add to queue
            self.queue.put_nowait((request.priority.value, request))
            self.stats.record_queued(priority)
            logger.info(f"Request {request.id} queued with priority {priority.name}")
            return request.id
            
        except asyncio.QueueFull:
            # Handle overflow based on policy
            if self.overflow_policy == 'reject':
                self.stats.record_rejected()
                logger.warning(f"Queue full - rejected request {request.id}")
                if self.on_queue_full:
                    await self.on_queue_full(request)
                return None
                
            elif self.overflow_policy == 'drop_oldest':
                # Remove oldest item and add new one
                await self._drop_oldest()
                await self.queue.put((request.priority.value, request))
                self.stats.record_queued(priority)
                return request.id
                
            elif self.overflow_policy == 'drop_lowest_priority':
                # Remove lowest priority item if new one is higher
                dropped = await self._drop_lowest_priority(request)
                if dropped:
                    await self.queue.put((request.priority.value, request))
                    self.stats.record_queued(priority)
                    return request.id
                else:
                    self.stats.record_rejected()
                    return None
    
    async def process_requests(self, handler: Callable):
        """Main processing loop - run this in background"""
        while True:
            # Wait if at max concurrent limit
            while len(self.processing) >= self.max_concurrent:
                await asyncio.sleep(0.1)
            
            try:
                # Get next priority request
                priority_value, request = await self.queue.get()
                
                # Track processing
                self.processing[request.id] = {
                    'request': request,
                    'start_time': time.time()
                }
                
                # Process in background
                asyncio.create_task(self._process_single(request, handler))
                
            except Exception as e:
                logger.error(f"Error in process loop: {e}")
                self.stats.record_error()
    
    async def _process_single(self, request: QueuedRequest, handler: Callable):
        """Process a single request"""
        start_time = time.time()
        queue_time = start_time - request.timestamp
        
        try:
            # Call handler
            result = await handler(request)
            
            # Record success
            processing_time = time.time() - start_time
            self.stats.record_processed(queue_time, processing_time)
            
            logger.info(f"Request {request.id} completed in {processing_time:.2f}s")
            
            if self.on_request_complete:
                await self.on_request_complete(request, result)
                
        except Exception as e:
            logger.error(f"Error processing request {request.id}: {e}")
            self.stats.record_error()
            
            if self.on_error:
                await self.on_error(request, e)
                
        finally:
            # Remove from processing
            self.processing.pop(request.id, None)
    
    async def _drop_oldest(self):
        """Drop oldest request from queue"""
        # Get all items, sort by timestamp, remove oldest
        items = []
        while not self.queue.empty():
            items.append(await self.queue.get())
        
        if items:
            # Sort by timestamp (oldest first)
            items.sort(key=lambda x: x[1].timestamp)
            dropped = items.pop(0)
            logger.warning(f"Dropped oldest request {dropped[1].id}")
            
            # Put back remaining items
            for item in items:
                await self.queue.put(item)
    
    async def _drop_lowest_priority(self, new_request: QueuedRequest) -> bool:
        """Drop lowest priority if new request is higher priority"""
        items = []
        while not self.queue.empty():
            items.append(await self.queue.get())
        
        if not items:
            return True
        
        # Find lowest priority
        items.sort(key=lambda x: (-x[0], x[1].timestamp))  # Sort by priority DESC, then timestamp
        lowest = items[0]
        
        # Check if new request is higher priority
        if new_request.priority.value < lowest[0]:
            # Drop lowest priority
            items.pop(0)
            logger.warning(f"Dropped low priority request {lowest[1].id}")
            
            # Put back remaining items
            for item in items:
                await self.queue.put(item)
            return True
        else:
            # Put everything back - new request is not higher priority
            for item in items:
                await self.queue.put(item)
            return False
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        return {
            'queue_size': self.queue.qsize(),
            'processing': len(self.processing),
            'max_size': self.max_size,
            'max_concurrent': self.max_concurrent,
            'stats': self.stats.get_stats()
        }
    
    async def shutdown(self):
        """Graceful shutdown - wait for processing to complete"""
        logger.info("Shutting down request queue...")
        
        # Stop accepting new requests
        self.max_size = 0
        
        # Wait for queue to empty
        while not self.queue.empty():
            await asyncio.sleep(0.1)
        
        # Wait for processing to complete
        while self.processing:
            await asyncio.sleep(0.1)
        
        logger.info("Request queue shutdown complete")

# Helper functions for common patterns
def create_emergency_queue():
    """Create queue optimized for emergency responses"""
    return AdvancedRequestQueue(
        max_size=50,
        max_concurrent=8,
        overflow_policy='drop_lowest_priority'
    )

def create_standard_queue():
    """Create standard queue for normal operations"""
    return AdvancedRequestQueue(
        max_size=20,
        max_concurrent=4,
        overflow_policy='reject'
    )

# Example usage
if __name__ == "__main__":
    async def example_handler(request: QueuedRequest):
        """Example request handler"""
        print(f"Processing {request.id} - {request.request_type}")
        # Simulate processing
        await asyncio.sleep(2)
        return {"status": "success", "id": request.id}
    
    async def main():
        # Create queue
        queue = create_standard_queue()
        
        # Start processor
        processor_task = asyncio.create_task(queue.process_requests(example_handler))
        
        # Add some requests
        await queue.add_request("ocr", {"image": "base64..."}, Priority.HIGH)
        await queue.add_request("chat", {"text": "Hello"}, Priority.NORMAL)
        await queue.add_request("medical", {"image": "xray.jpg"}, Priority.EMERGENCY)
        
        # Check status
        print(queue.get_queue_status())
        
        # Wait a bit
        await asyncio.sleep(10)
        
        # Shutdown
        await queue.shutdown()
        processor_task.cancel()
    
    asyncio.run(main())