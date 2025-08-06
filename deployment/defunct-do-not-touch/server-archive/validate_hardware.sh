#!/bin/bash
# Hardware Validation Script for Dell Mini PC
# ONLY run this on Dell Mini PC with 32GB RAM - NEVER on development laptop

set -e

echo "🔍 Validating Dell Mini PC for multimodal deployment..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if running on development machine (prevent accidental execution)
TOTAL_RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [ $TOTAL_RAM_GB -lt 30 ]; then
    print_status $RED "❌ ERROR: This script should only run on Dell Mini PC with 32GB RAM"
    print_status $RED "   Current system has only ${TOTAL_RAM_GB}GB RAM"
    print_status $RED "   This appears to be a development machine - ABORTING"
    exit 1
fi

print_status $GREEN "✅ RAM check passed: ${TOTAL_RAM_GB}GB available"

# Check operating system
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_status $RED "❌ ERROR: This script requires Linux (Ubuntu Server 22.04 LTS recommended)"
    exit 1
fi

print_status $GREEN "✅ Operating system: Linux"

# Check disk space for model files
MODEL_DIR="/models/transformers/gemma-3n-e4b-it/2"
if [ ! -d "$MODEL_DIR" ]; then
    print_status $YELLOW "⚠️  Model directory not found: $MODEL_DIR"
    print_status $YELLOW "   Model files need to be installed"
else
    MODEL_SIZE=$(du -sh $MODEL_DIR | cut -f1)
    print_status $GREEN "✅ Model directory found: $MODEL_SIZE"
fi

# Check available disk space
DISK_SPACE_GB=$(df -BG / | tail -1 | awk '{print $4}' | sed 's/G//')
if [ $DISK_SPACE_GB -lt 25 ]; then
    print_status $RED "❌ ERROR: Insufficient disk space"
    print_status $RED "   Need at least 25GB free, found ${DISK_SPACE_GB}GB"
    exit 1
fi

print_status $GREEN "✅ Disk space check passed: ${DISK_SPACE_GB}GB available"

# Check CPU cores
CPU_CORES=$(nproc)
if [ $CPU_CORES -lt 4 ]; then
    print_status $YELLOW "⚠️  Warning: Only $CPU_CORES CPU cores detected"
    print_status $YELLOW "   Performance may be limited"
else
    print_status $GREEN "✅ CPU cores: $CPU_CORES"
fi

# Check Python version
if ! command -v python3 &> /dev/null; then
    print_status $RED "❌ ERROR: Python 3 not found"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ $PYTHON_MAJOR -lt 3 ] || [ $PYTHON_MAJOR -eq 3 -a $PYTHON_MINOR -lt 9 ]; then
    print_status $RED "❌ ERROR: Python 3.9+ required, found $PYTHON_VERSION"
    exit 1
fi

print_status $GREEN "✅ Python version: $PYTHON_VERSION"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    print_status $RED "❌ ERROR: pip3 not found"
    exit 1
fi

print_status $GREEN "✅ pip3 available"

# Check for CUDA support (optional)
if command -v nvidia-smi &> /dev/null; then
    GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits)
    print_status $GREEN "✅ NVIDIA GPU detected: $GPU_INFO"
    
    # Check CUDA version
    CUDA_VERSION=$(nvidia-smi | grep "CUDA Version" | awk '{print $9}')
    if [ ! -z "$CUDA_VERSION" ]; then
        print_status $GREEN "✅ CUDA Version: $CUDA_VERSION"
    fi
else
    print_status $YELLOW "⚠️  No NVIDIA GPU detected - will use CPU inference"
fi

# Check network connectivity
if ping -c 1 google.com &> /dev/null; then
    print_status $GREEN "✅ Network connectivity available"
else
    print_status $YELLOW "⚠️  Limited network connectivity - offline mode only"
fi

# Check for required system packages
REQUIRED_PACKAGES=("git" "wget" "curl" "unzip")
for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! command -v $package &> /dev/null; then
        print_status $RED "❌ ERROR: Required package not found: $package"
        exit 1
    fi
done

print_status $GREEN "✅ All required system packages found"

# Memory usage check
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", ($3/$2) * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 50" | bc -l) )); then
    print_status $YELLOW "⚠️  High memory usage: ${MEMORY_USAGE}%"
    print_status $YELLOW "   Consider restarting to free memory before deployment"
else
    print_status $GREEN "✅ Memory usage: ${MEMORY_USAGE}%"
fi

# Check virtual memory settings
SWAPPINESS=$(cat /proc/sys/vm/swappiness)
if [ $SWAPPINESS -gt 10 ]; then
    print_status $YELLOW "⚠️  High swappiness: $SWAPPINESS"
    print_status $YELLOW "   Consider lowering to 10 for better performance"
else
    print_status $GREEN "✅ Swappiness: $SWAPPINESS"
fi

# Check ulimits
ULIMIT_NOFILE=$(ulimit -n)
if [ $ULIMIT_NOFILE -lt 4096 ]; then
    print_status $YELLOW "⚠️  Low file descriptor limit: $ULIMIT_NOFILE"
    print_status $YELLOW "   Consider increasing to 4096+"
else
    print_status $GREEN "✅ File descriptor limit: $ULIMIT_NOFILE"
fi

# Port availability check
PORT=8080
if lsof -i :$PORT &> /dev/null; then
    print_status $YELLOW "⚠️  Port $PORT is already in use"
    print_status $YELLOW "   Server may conflict with existing service"
else
    print_status $GREEN "✅ Port $PORT available"
fi

# Final summary
echo ""
echo "📋 HARDWARE VALIDATION SUMMARY"
echo "=============================="
print_status $GREEN "✅ System is ready for multimodal deployment"
print_status $GREEN "✅ RAM: ${TOTAL_RAM_GB}GB (sufficient for 15GB model + 8GB inference)"
print_status $GREEN "✅ Disk: ${DISK_SPACE_GB}GB available"
print_status $GREEN "✅ CPU: $CPU_CORES cores"
print_status $GREEN "✅ Python: $PYTHON_VERSION"

echo ""
echo "🚀 NEXT STEPS:"
echo "1. Run ./deploy_model.sh to install model dependencies"
echo "2. Run ./test_model_loading.sh to validate model loading"
echo "3. Run ./start_multimodal_server.sh to start production server"
echo ""

print_status $GREEN "✅ Hardware validation complete - ready for deployment"