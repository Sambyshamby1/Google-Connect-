#!/bin/bash
# Model Deployment Script for Dell Mini PC
# ONLY run this on Dell Mini PC with 32GB RAM - NEVER on development laptop

set -e

echo "🚀 Deploying Multimodal Gemma Model..."
echo "====================================="

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

# Safety check - ensure we're on Dell Mini PC
TOTAL_RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [ $TOTAL_RAM_GB -lt 30 ]; then
    print_status $RED "❌ CRITICAL ERROR: This script should only run on Dell Mini PC"
    print_status $RED "   Current system has only ${TOTAL_RAM_GB}GB RAM"
    print_status $RED "   This appears to be a development machine - ABORTING"
    exit 1
fi

print_status $GREEN "✅ Safety check passed: ${TOTAL_RAM_GB}GB RAM available"

# Set up directories
MODEL_DIR="/models/transformers/gemma-3n-e4b-it/2"
BACKUP_DIR="/models/backup"
LOGS_DIR="/var/log/refugee-connect"

print_status $BLUE "📁 Creating directory structure..."
sudo mkdir -p $MODEL_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $LOGS_DIR
sudo chown -R $USER:$USER /models
sudo chown -R $USER:$USER $LOGS_DIR

# Check if model files exist
if [ ! -d "$MODEL_DIR" ] || [ ! -f "$MODEL_DIR/config.json" ]; then
    print_status $RED "❌ ERROR: Model files not found at $MODEL_DIR"
    print_status $RED "   Please copy the gemma-3n-e4b-it model files first"
    exit 1
fi

# Clean model files (remove git artifacts)
print_status $BLUE "🧹 Cleaning model files..."
cd $MODEL_DIR

# Remove git artifacts if they exist
if [ -d ".git" ]; then
    print_status $YELLOW "   Removing .git directory..."
    rm -rf .git/
fi

if [ -f ".gitattributes" ]; then
    print_status $YELLOW "   Removing .gitattributes..."
    rm -f .gitattributes
fi

if [ -f ".gitignore" ]; then
    print_status $YELLOW "   Removing .gitignore..."
    rm -f .gitignore
fi

# Check final model size
MODEL_SIZE=$(du -sh . | cut -f1)
print_status $GREEN "✅ Model cleaned: $MODEL_SIZE"

# Create virtual environment
print_status $BLUE "🐍 Creating Python virtual environment..."
cd /opt
sudo python3 -m venv refugee-connect-multimodal
sudo chown -R $USER:$USER refugee-connect-multimodal/
source refugee-connect-multimodal/bin/activate

# Upgrade pip
print_status $BLUE "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install PyTorch first (CPU or CUDA version)
print_status $BLUE "🔥 Installing PyTorch..."
if command -v nvidia-smi &> /dev/null; then
    print_status $YELLOW "   NVIDIA GPU detected - installing CUDA version"
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
else
    print_status $YELLOW "   No GPU detected - installing CPU version"
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
fi

# Install transformers and related packages
print_status $BLUE "🤗 Installing Hugging Face transformers..."
pip install transformers==4.35.0
pip install accelerate==0.24.0
pip install tokenizers==0.14.1
pip install safetensors==0.4.0

# Install other multimodal dependencies
print_status $BLUE "📦 Installing additional dependencies..."
pip install numpy==1.24.3
pip install pillow==10.0.1
pip install librosa==0.10.1
pip install soundfile==0.12.1

# Install development requirements
print_status $BLUE "🔧 Installing base requirements..."
pip install -r requirements-multimodal.txt

# Test model loading
print_status $BLUE "🧪 Testing model loading..."
python3 -c "
import torch
import psutil
from transformers import AutoModelForCausalLM, AutoProcessor
import sys

print(f'Available RAM: {psutil.virtual_memory().total / (1024**3):.1f}GB')
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')

try:
    print('Loading model configuration...')
    from transformers import AutoConfig
    config = AutoConfig.from_pretrained('$MODEL_DIR')
    print('✅ Model configuration loaded successfully')
    
    print('Loading tokenizer/processor...')
    processor = AutoProcessor.from_pretrained('$MODEL_DIR')
    print('✅ Processor loaded successfully')
    
    print('Testing model loading (this may take several minutes)...')
    model = AutoModelForCausalLM.from_pretrained(
        '$MODEL_DIR',
        torch_dtype=torch.bfloat16,
        device_map='auto',
        max_memory={0: '20GB'},
        trust_remote_code=True
    )
    print('✅ Model loaded successfully')
    
    # Get memory usage
    memory_used = psutil.virtual_memory().used / (1024**3)
    print(f'Memory used after loading: {memory_used:.1f}GB')
    
    print('✅ All tests passed - deployment successful!')
    
except Exception as e:
    print(f'❌ Error during model loading: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    print_status $GREEN "✅ Model loading test passed"
else
    print_status $RED "❌ Model loading test failed"
    exit 1
fi

# Create startup script
print_status $BLUE "📝 Creating startup script..."
cat > /opt/refugee-connect-multimodal/start_server.sh << 'EOF'
#!/bin/bash
# Startup script for multimodal server

cd /opt/refugee-connect-multimodal
source bin/activate

# Set environment variables
export PYTHONPATH=/opt/refugee-connect-multimodal:$PYTHONPATH
export MODEL_PATH=/models/transformers/gemma-3n-e4b-it/2
export LOG_LEVEL=INFO

# Start server
python3 ai_server_multimodal.py
EOF

chmod +x /opt/refugee-connect-multimodal/start_server.sh

# Create systemd service
print_status $BLUE "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/refugee-connect-multimodal.service > /dev/null << EOF
[Unit]
Description=Refugee Connect Multimodal AI Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/refugee-connect-multimodal
ExecStart=/opt/refugee-connect-multimodal/start_server.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=refugee-connect-multimodal

# Resource limits
LimitNOFILE=4096
MemoryHigh=30G
MemoryMax=32G

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable refugee-connect-multimodal.service

# Create log rotation
print_status $BLUE "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/refugee-connect-multimodal > /dev/null << EOF
/var/log/refugee-connect/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
}
EOF

# Create monitoring script
print_status $BLUE "📊 Creating monitoring script..."
cat > /opt/refugee-connect-multimodal/monitor.sh << 'EOF'
#!/bin/bash
# Monitoring script for multimodal server

echo "🔍 Refugee Connect Multimodal Server Status"
echo "=========================================="

# Service status
echo "Service Status:"
systemctl is-active refugee-connect-multimodal.service

# Memory usage
echo -e "\nMemory Usage:"
free -h

# Disk usage
echo -e "\nDisk Usage:"
df -h /

# Process information
echo -e "\nServer Process:"
ps aux | grep ai_server_multimodal | grep -v grep

# Port status
echo -e "\nPort Status:"
lsof -i :8080

# Recent logs
echo -e "\nRecent Logs:"
journalctl -u refugee-connect-multimodal.service -n 10 --no-pager
EOF

chmod +x /opt/refugee-connect-multimodal/monitor.sh

# Create backup script
print_status $BLUE "💾 Creating backup script..."
cat > /opt/refugee-connect-multimodal/backup.sh << 'EOF'
#!/bin/bash
# Backup script for configuration and data

BACKUP_DIR="/models/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/refugee-connect-backup-$DATE.tar.gz"

echo "📦 Creating backup: $BACKUP_FILE"

tar -czf $BACKUP_FILE \
    /opt/refugee-connect-multimodal/*.py \
    /opt/refugee-connect-multimodal/*.js \
    /opt/refugee-connect-multimodal/*.html \
    /opt/refugee-connect-multimodal/*.txt \
    /etc/systemd/system/refugee-connect-multimodal.service \
    /var/log/refugee-connect/

echo "✅ Backup created: $BACKUP_FILE"
EOF

chmod +x /opt/refugee-connect-multimodal/backup.sh

# Copy project files
print_status $BLUE "📁 Copying project files..."
cp ai_server_multimodal.py /opt/refugee-connect-multimodal/
cp pi-client-multimodal.js /opt/refugee-connect-multimodal/
cp gemmorandum-multimodal.js /opt/refugee-connect-multimodal/
cp requirements-multimodal.txt /opt/refugee-connect-multimodal/

# Set permissions
sudo chown -R $USER:$USER /opt/refugee-connect-multimodal/
chmod +x /opt/refugee-connect-multimodal/ai_server_multimodal.py

# Final summary
echo ""
print_status $GREEN "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
print_status $GREEN "✅ Model cleaned and validated"
print_status $GREEN "✅ Python environment created"
print_status $GREEN "✅ Dependencies installed"
print_status $GREEN "✅ Model loading tested"
print_status $GREEN "✅ Systemd service created"
print_status $GREEN "✅ Monitoring tools installed"

echo ""
echo "🔧 AVAILABLE COMMANDS:"
echo "  Start server:    sudo systemctl start refugee-connect-multimodal"
echo "  Stop server:     sudo systemctl stop refugee-connect-multimodal"
echo "  Server status:   sudo systemctl status refugee-connect-multimodal"
echo "  View logs:       journalctl -u refugee-connect-multimodal -f"
echo "  Monitor:         /opt/refugee-connect-multimodal/monitor.sh"
echo "  Backup:          /opt/refugee-connect-multimodal/backup.sh"
echo ""

print_status $BLUE "🚀 To start the server now, run:"
print_status $BLUE "   sudo systemctl start refugee-connect-multimodal"
print_status $BLUE ""
print_status $BLUE "📊 To monitor the server, run:"
print_status $BLUE "   /opt/refugee-connect-multimodal/monitor.sh"