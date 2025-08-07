#!/bin/bash
# Refugee Connect - Dependency Management Script
# Handles all Python dependencies for both development and production environments
# Run this BEFORE build-complete-server.sh

set -e

# Script version and metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="Refugee Connect Dependency Manager"

echo "🚀 $SCRIPT_NAME v$SCRIPT_VERSION"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get system info
get_system_info() {
    TOTAL_RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    CPU_CORES=$(nproc)
    DISK_SPACE_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    OS_INFO=$(lsb_release -d 2>/dev/null | cut -f2- || echo "Unknown Linux")
}

# Environment detection
detect_environment() {
    get_system_info
    
    print_status $CYAN "🔍 Detecting deployment environment..."
    print_status $BLUE "   RAM: ${TOTAL_RAM_GB}GB"
    print_status $BLUE "   CPU Cores: ${CPU_CORES}"
    print_status $BLUE "   Available Disk: ${DISK_SPACE_GB}GB"
    print_status $BLUE "   OS: ${OS_INFO}"
    
    # Environment classification
    if [ $TOTAL_RAM_GB -ge 30 ]; then
        ENVIRONMENT="production"
        print_status $GREEN "✅ Production environment detected (${TOTAL_RAM_GB}GB RAM)"
    elif [ $TOTAL_RAM_GB -ge 16 ]; then
        ENVIRONMENT="development"
        print_status $YELLOW "⚠️  Development environment detected (${TOTAL_RAM_GB}GB RAM)"
        print_status $YELLOW "   Production ML models will be disabled"
    else
        ENVIRONMENT="minimal"
        print_status $YELLOW "⚠️  Minimal environment detected (${TOTAL_RAM_GB}GB RAM)"
        print_status $YELLOW "   Only basic features will be available"
    fi
    
    # Check for NVIDIA GPU
    if command_exists nvidia-smi && nvidia-smi >/dev/null 2>&1; then
        HAS_NVIDIA_GPU=true
        GPU_INFO=$(nvidia-smi --query-gpu=name --format=csv,noheader,nounits | head -1)
        print_status $GREEN "✅ NVIDIA GPU detected: $GPU_INFO"
    else
        HAS_NVIDIA_GPU=false
        print_status $BLUE "   No NVIDIA GPU detected - CPU-only installation"
    fi
}

# System requirements validation
validate_system_requirements() {
    print_status $CYAN "🔧 Validating system requirements..."
    
    local errors=0
    
    # Check Python version
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
        
        if [ $PYTHON_MAJOR -eq 3 ] && [ $PYTHON_MINOR -ge 9 ]; then
            print_status $GREEN "✅ Python $PYTHON_VERSION"
        else
            print_status $RED "❌ Python 3.9+ required, found $PYTHON_VERSION"
            errors=$((errors + 1))
        fi
    else
        print_status $RED "❌ Python 3 not found"
        errors=$((errors + 1))
    fi
    
    # Check pip
    if command_exists pip3; then
        print_status $GREEN "✅ pip3 available"
    else
        print_status $RED "❌ pip3 not found"
        errors=$((errors + 1))
    fi
    
    # Check disk space (need at least 10GB for production)
    if [ $ENVIRONMENT = "production" ] && [ $DISK_SPACE_GB -lt 10 ]; then
        print_status $RED "❌ Insufficient disk space: ${DISK_SPACE_GB}GB (need 10GB+)"
        errors=$((errors + 1))
    elif [ $DISK_SPACE_GB -lt 2 ]; then
        print_status $RED "❌ Insufficient disk space: ${DISK_SPACE_GB}GB (need 2GB+)"
        errors=$((errors + 1))
    else
        print_status $GREEN "✅ Disk space: ${DISK_SPACE_GB}GB"
    fi
    
    # Check essential system packages
    local required_packages=("git" "curl" "wget")
    for pkg in "${required_packages[@]}"; do
        if command_exists $pkg; then
            print_status $GREEN "✅ $pkg available"
        else
            print_status $YELLOW "⚠️  $pkg not found - may be needed for some features"
        fi
    done
    
    if [ $errors -gt 0 ]; then
        print_status $RED "❌ System validation failed with $errors error(s)"
        exit 1
    fi
    
    print_status $GREEN "✅ System requirements validated"
}

# Create directory structure
setup_directories() {
    print_status $CYAN "📁 Setting up directory structure..."
    
    # Base directories
    INSTALL_DIR="/opt/refugee-connect"
    VENV_DIR="$INSTALL_DIR/venv"
    LOGS_DIR="$INSTALL_DIR/logs"
    CACHE_DIR="$INSTALL_DIR/cache"
    BACKUP_DIR="$INSTALL_DIR/backup"
    CONFIG_DIR="$INSTALL_DIR/config"
    
    # Create directories
    local dirs=("$INSTALL_DIR" "$LOGS_DIR" "$CACHE_DIR" "$BACKUP_DIR" "$CONFIG_DIR")
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            sudo mkdir -p "$dir"
            print_status $GREEN "✅ Created: $dir"
        else
            print_status $BLUE "   Exists: $dir"
        fi
    done
    
    # Set permissions
    sudo chown -R $USER:$USER "$INSTALL_DIR" 2>/dev/null || true
    print_status $GREEN "✅ Directory structure ready"
}

# Backup existing environment
backup_existing_environment() {
    if [ -d "$VENV_DIR" ]; then
        print_status $YELLOW "⚠️  Existing virtual environment found"
        BACKUP_NAME="venv-backup-$(date +%Y%m%d-%H%M%S)"
        print_status $BLUE "   Creating backup: $BACKUP_NAME"
        mv "$VENV_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        print_status $GREEN "✅ Environment backed up"
    fi
}

# Create virtual environment
create_virtual_environment() {
    print_status $CYAN "🐍 Creating Python virtual environment..."
    
    # Create virtual environment
    python3 -m venv "$VENV_DIR"
    print_status $GREEN "✅ Virtual environment created"
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    print_status $GREEN "✅ Virtual environment activated"
    
    # Upgrade pip and essential tools
    print_status $BLUE "   Upgrading pip..."
    pip install --upgrade pip setuptools wheel
    print_status $GREEN "✅ Essential tools upgraded"
}

# Install core dependencies (always needed)
install_core_dependencies() {
    print_status $CYAN "📦 Installing core dependencies..."
    
    # Essential web framework
    print_status $BLUE "   Installing Flask ecosystem..."
    pip install flask==3.0.0 flask-cors==4.0.0 waitress==3.0.0
    
    # System monitoring
    print_status $BLUE "   Installing system utilities..."
    pip install psutil==5.9.6
    
    # Basic image processing
    print_status $BLUE "   Installing image processing..."
    pip install Pillow==10.0.1
    
    # Essential utilities
    print_status $BLUE "   Installing essential utilities..."
    pip install numpy==1.24.3 requests==2.31.0 python-dateutil==2.8.2
    
    print_status $GREEN "✅ Core dependencies installed"
}

# Install development dependencies
install_development_dependencies() {
    print_status $CYAN "🔧 Installing development dependencies..."
    
    # Testing framework
    pip install pytest==7.4.3 pytest-asyncio==0.21.1 mock==5.1.0
    
    # Development tools
    pip install black==23.7.0 flake8==6.0.0 isort==5.12.0
    
    # Utilities for development
    pip install responses==0.23.3 memory-profiler==0.61.0 python-dotenv==1.0.0
    
    # Additional dev utilities
    pip install structlog==23.1.0 colorlog==6.7.0 watchdog==3.0.0
    
    print_status $GREEN "✅ Development dependencies installed"
}

# Install production ML dependencies
install_production_dependencies() {
    print_status $CYAN "🤖 Installing production ML dependencies..."
    
    # PyTorch installation based on GPU availability
    if [ "$HAS_NVIDIA_GPU" = true ]; then
        print_status $BLUE "   Installing PyTorch with CUDA support..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    else
        print_status $BLUE "   Installing PyTorch (CPU-only)..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    fi
    
    # Hugging Face ecosystem
    print_status $BLUE "   Installing Hugging Face transformers..."
    pip install transformers==4.35.0 accelerate==0.24.0 tokenizers==0.14.1 safetensors==0.4.0
    
    # Additional ML utilities
    print_status $BLUE "   Installing additional ML utilities..."
    pip install librosa==0.10.1 soundfile==0.12.1
    
    print_status $GREEN "✅ Production ML dependencies installed"
}

# Install optional dependencies
install_optional_dependencies() {
    print_status $CYAN "🔧 Installing optional dependencies..."
    
    # Configuration management
    pip install pydantic==2.4.2 orjson==3.9.7
    
    # HTTP utilities
    pip install httpx==0.24.1 urllib3==2.0.7
    
    # Async support
    pip install aiofiles==23.2.1 asyncio-throttle==1.0.2
    
    # Time utilities
    pip install pytz==2023.3
    
    # Performance monitoring
    pip install gunicorn==21.2.0 py-spy==0.3.14
    
    print_status $GREEN "✅ Optional dependencies installed"
}

# Test installation
test_installation() {
    print_status $CYAN "🧪 Testing installation..."
    
    # Test core imports
    python3 -c "
import sys
print(f'Python version: {sys.version}')

# Test core dependencies
try:
    import flask
    import flask_cors
    import psutil
    from PIL import Image
    import numpy
    print('✅ Core dependencies working')
except ImportError as e:
    print(f'❌ Core dependency error: {e}')
    sys.exit(1)

# Test ML dependencies if in production
if '$ENVIRONMENT' == 'production':
    try:
        import torch
        import transformers
        print('✅ ML dependencies working')
        print(f'PyTorch version: {torch.__version__}')
        print(f'CUDA available: {torch.cuda.is_available()}')
    except ImportError as e:
        print(f'❌ ML dependency error: {e}')
        sys.exit(1)

print('✅ Installation test passed')
"
    
    if [ $? -eq 0 ]; then
        print_status $GREEN "✅ Installation test passed"
    else
        print_status $RED "❌ Installation test failed"
        exit 1
    fi
}

# Generate configuration file
generate_configuration() {
    print_status $CYAN "⚙️  Generating configuration..."
    
    CONFIG_FILE="$CONFIG_DIR/environment.conf"
    
    cat > "$CONFIG_FILE" << EOF
# Refugee Connect Environment Configuration
# Generated by setup-dependencies.sh on $(date)

ENVIRONMENT=$ENVIRONMENT
TOTAL_RAM_GB=$TOTAL_RAM_GB
CPU_CORES=$CPU_CORES
HAS_NVIDIA_GPU=$HAS_NVIDIA_GPU
PYTHON_VERSION=$PYTHON_VERSION
VENV_PATH=$VENV_DIR
INSTALL_PATH=$INSTALL_DIR

# Dependency versions installed
FLASK_VERSION=$(pip show flask | grep Version | cut -d: -f2 | xargs)
TORCH_VERSION=$(pip show torch 2>/dev/null | grep Version | cut -d: -f2 | xargs || echo "not_installed")
TRANSFORMERS_VERSION=$(pip show transformers 2>/dev/null | grep Version | cut -d: -f2 | xargs || echo "not_installed")
EOF
    
    print_status $GREEN "✅ Configuration saved to: $CONFIG_FILE"
}

# Create activation script
create_activation_script() {
    print_status $CYAN "🔗 Creating activation script..."
    
    ACTIVATE_SCRIPT="$INSTALL_DIR/activate"
    
    cat > "$ACTIVATE_SCRIPT" << EOF
#!/bin/bash
# Refugee Connect Environment Activation Script
# Source this script to activate the environment: source /opt/refugee-connect/activate

export REFUGEE_CONNECT_ENV=$ENVIRONMENT
export REFUGEE_CONNECT_VENV=$VENV_DIR
export REFUGEE_CONNECT_PATH=$INSTALL_DIR

# Activate virtual environment
source "$VENV_DIR/bin/activate"

echo "🚀 Refugee Connect environment activated ($ENVIRONMENT mode)"
echo "   Virtual env: $VENV_DIR"
echo "   Install dir: $INSTALL_DIR"

# Add useful aliases
alias rc-status='systemctl status refugee-connect'
alias rc-logs='journalctl -u refugee-connect -f'
alias rc-restart='sudo systemctl restart refugee-connect'
EOF
    
    chmod +x "$ACTIVATE_SCRIPT"
    print_status $GREEN "✅ Activation script created: $ACTIVATE_SCRIPT"
}

# Main installation flow
main() {
    print_status $PURPLE "Starting dependency installation process..."
    
    # Phase 1: Environment Detection and Validation
    detect_environment
    validate_system_requirements
    
    # Phase 2: Setup
    setup_directories
    backup_existing_environment
    create_virtual_environment
    
    # Phase 3: Core Installation (always)
    install_core_dependencies
    
    # Phase 4: Environment-specific Installation
    case $ENVIRONMENT in
        "production")
            install_production_dependencies
            install_optional_dependencies
            ;;
        "development")
            install_development_dependencies
            install_optional_dependencies
            ;;
        "minimal")
            print_status $YELLOW "⚠️  Minimal installation - only core dependencies"
            ;;
    esac
    
    # Phase 5: Validation and Configuration
    test_installation
    generate_configuration
    create_activation_script
    
    # Final status
    print_status $GREEN "🎉 DEPENDENCY INSTALLATION COMPLETE!"
    print_status $GREEN "====================================="
    
    case $ENVIRONMENT in
        "production")
            print_status $GREEN "✅ Production environment ready with full ML capabilities"
            ;;
        "development")
            print_status $GREEN "✅ Development environment ready with mock implementations"
            ;;
        "minimal")
            print_status $GREEN "✅ Minimal environment ready with basic features"
            ;;
    esac
    
    echo ""
    print_status $CYAN "📋 Next Steps:"
    print_status $BLUE "   1. Activate environment: source $INSTALL_DIR/activate"
    print_status $BLUE "   2. Run server deployment: ./build-complete-server.sh"
    print_status $BLUE "   3. Check logs: tail -f $LOGS_DIR/installation.log"
    
    echo ""
    print_status $CYAN "🔧 Management Commands:"
    print_status $BLUE "   Activate environment: source $ACTIVATE_SCRIPT"
    print_status $BLUE "   Check configuration: cat $CONFIG_DIR/environment.conf"
    print_status $BLUE "   View install log: $LOGS_DIR/dependencies-$(date +%Y%m%d).log"
    
    # Save installation log
    LOG_FILE="$LOGS_DIR/dependencies-$(date +%Y%m%d).log"
    echo "Dependency installation completed on $(date)" > "$LOG_FILE"
    echo "Environment: $ENVIRONMENT" >> "$LOG_FILE"
    echo "RAM: ${TOTAL_RAM_GB}GB" >> "$LOG_FILE"
    echo "GPU: $HAS_NVIDIA_GPU" >> "$LOG_FILE"
    
    print_status $GREEN "✅ Ready for server deployment!"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --version, -v  Show version information"
        echo "  --force        Skip safety checks (use with caution)"
        echo "  --offline      Use offline installation mode"
        exit 0
        ;;
    --version|-v)
        echo "$SCRIPT_NAME v$SCRIPT_VERSION"
        exit 0
        ;;
    --force)
        print_status $YELLOW "⚠️  Force mode enabled - skipping safety checks"
        FORCE_MODE=true
        ;;
    --offline)
        print_status $BLUE "📦 Offline installation mode enabled"
        OFFLINE_MODE=true
        ;;
esac

# Run main installation
main "$@"