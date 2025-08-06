#!/bin/bash
# Enhanced AI Server Startup Script
# Starts the server with request queue and priority processing

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "🚀 Starting Enhanced Multimodal AI Server..."
print_status $BLUE "============================================="

# Check if we're in the correct directory
if [ ! -f "adapted_ai_server.py" ]; then
    print_status $RED "❌ ERROR: Adapted server file not found"
    print_status $RED "   Please run this script from the hardware-pivot directory"
    exit 1
fi

# Create directories if they don't exist
mkdir -p enhanced
mkdir -p tests
mkdir -p logs

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1-2)
print_status $GREEN "✅ Python version: $PYTHON_VERSION"

# Check if enhanced directory exists
if [ ! -d "enhanced" ]; then
    print_status $RED "❌ ERROR: Enhanced directory not found"
    print_status $RED "   Please ensure enhanced/request_queue.py exists"
    exit 1
fi

# Install dependencies if needed
print_status $BLUE "📦 Checking dependencies..."
if ! python3 -c "import flask, flask_cors, psutil" 2>/dev/null; then
    print_status $YELLOW "⚠️  Installing missing dependencies..."
    pip3 install flask flask-cors psutil
fi

# Check system resources
TOTAL_RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
CPU_CORES=$(nproc)

print_status $GREEN "💾 System RAM: ${TOTAL_RAM_GB}GB"
print_status $GREEN "🖥️  CPU Cores: $CPU_CORES"

if [ $TOTAL_RAM_GB -lt 4 ]; then
    print_status $YELLOW "⚠️  WARNING: Low RAM detected (${TOTAL_RAM_GB}GB)"
    print_status $YELLOW "   Performance may be limited"
fi

# Safety check for development mode
if [ $TOTAL_RAM_GB -lt 30 ]; then
    print_status $GREEN "🛡️  DEVELOPMENT MODE: Mock implementations will be used"
    print_status $GREEN "   Safe for development on ${TOTAL_RAM_GB}GB system"
else
    print_status $YELLOW "🚀 PRODUCTION MODE: Real model will be loaded"
    print_status $YELLOW "   Ensure model files are available"
fi

# Set environment variables
export FLASK_ENV=development
export PYTHONPATH="${PYTHONPATH}:$(pwd)/enhanced"

print_status $BLUE "🔧 Configuration:"
print_status $BLUE "   - Max Queue Size: 30 requests"
print_status $BLUE "   - Max Concurrent: 4 requests (dev) / 3 requests (prod)"
print_status $BLUE "   - Priority Processing: Enabled"
print_status $BLUE "   - Overflow Policy: Drop lowest priority"

# Start the server
print_status $GREEN "🌟 Starting Enhanced AI Server..."
print_status $GREEN "   Server URL: http://localhost:8080"
print_status $GREEN "   Status: http://localhost:8080/api/status"
print_status $GREEN "   Test Interface: http://localhost:8080/test-multimodal.html"

# Log startup
echo "$(date): Starting Enhanced AI Server" >> logs/server.log

# Handle shutdown gracefully
cleanup() {
    print_status $YELLOW "🛑 Shutting down server..."
    echo "$(date): Server shutdown" >> logs/server.log
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start server in background to capture PID
python3 adapted_ai_server.py &
SERVER_PID=$!

print_status $GREEN "✅ Server started successfully!"
print_status $GREEN "   Process ID: $SERVER_PID"
print_status $BLUE "   Press Ctrl+C to stop"

# Wait for server to be ready
sleep 2

# Test server connectivity
print_status $BLUE "🔍 Testing server connectivity..."
if curl -s "http://localhost:8080/api/status" > /dev/null 2>&1; then
    print_status $GREEN "✅ Server is responding"
    
    # Show server status
    STATUS=$(curl -s "http://localhost:8080/api/status" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'Mode: {data.get(\"mode\")}')
    print(f'Queue Max Size: {data.get(\"capabilities\", {}).get(\"queue_size\")}')
    print(f'Max Concurrent: {data.get(\"capabilities\", {}).get(\"max_concurrent\")}')
except:
    print('Status check failed')
")
    print_status $GREEN "$STATUS"
else
    print_status $RED "❌ Server not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Show available endpoints
print_status $BLUE "🔗 Available Endpoints:"
print_status $BLUE "   POST /api/vision/ocr           - OCR processing"
print_status $BLUE "   POST /api/vision/document      - Document analysis"
print_status $BLUE "   POST /api/vision/medical       - Medical image analysis"
print_status $BLUE "   POST /api/multimodal/chat      - Multimodal chat"
print_status $BLUE "   GET  /api/status               - Server status"

# Optional: Run queue tests
read -p "Run queue tests? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status $BLUE "🧪 Running queue tests..."
    python3 tests/test_request_queue.py
fi

# Wait for server process
print_status $BLUE "🎯 Server running. Waiting for requests..."
wait $SERVER_PID