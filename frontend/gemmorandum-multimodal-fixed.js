// Gemmorandum - Multimodal Form Completion Assistant
// Hardware Pivot: Enhanced with server-side vision processing
// FIXED VERSION - Better error handling for AI client

class GemmorandumMultimodal {
  constructor() {
    this.isInitialized = false;
    this.currentSession = null;
    this.conversationHistory = [];
    this.formData = {};
    this.aiClient = null;
    
    // Session state
    this.sessionState = {
      formType: null,
      currentField: null,
      completedFields: [],
      totalFields: 0,
      isProcessing: false,
      useServerVision: true // Default to server-side processing
    };
    
    // Vision processing configuration
    this.visionConfig = {
      maxImageSize: 1024,
      compressionLimit: 1500,
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      processingTimeout: 300000 // 5 minutes
    };
    
    // Language support
    this.supportedLanguages = {
      'ar': { name: 'Arabic', direction: 'rtl', class: 'arabic-text' },
      'fa': { name: 'Persian', direction: 'rtl', class: 'persian-text' },
      'ur': { name: 'Urdu', direction: 'rtl', class: 'urdu-text' },
      'ps': { name: 'Pashto', direction: 'rtl', class: 'pashto-text' },
      'en': { name: 'English', direction: 'ltr', class: 'english-text' }
    };
    
    this.currentLanguage = 'en';
    
    // Processing state
    this.processingState = {
      stage: 'idle',
      progress: 0,
      message: '',
      startTime: null
    };
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️  Gemmorandum already initialized, skipping');
      return;
    }
    
    console.log('🚀 Initializing Gemmorandum Multimodal...');
    
    // Initialize AI client
    if (typeof MultimodalAIStationClient !== 'undefined') {
      this.aiClient = new MultimodalAIStationClient();
      console.log('✓ AI Client initialized');
      
      // Try to connect to AI server
      try {
        const connected = await this.aiClient.detectStation();
        console.log(`🔌 AI Server connection: ${connected ? 'CONNECTED' : 'FAILED'}`);
        if (connected) {
          console.log(`📡 Connected to: ${this.aiClient.stationURL}`);
        }
      } catch (error) {
        console.error('❌ Failed to connect to AI server:', error);
      }
    } else {
      console.error('❌ MultimodalAIStationClient not available');
    }
    
    // Check server capabilities
    await this.checkServerCapabilities();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize auto-save
    this.initializeAutoSave();
    
    // Attempt to recover previous session
    this.attemptSessionRecovery();
    
    this.isInitialized = true;
    console.log('✅ Gemmorandum Multimodal initialized successfully');
    console.log(`🔧 Server vision processing: ${this.sessionState.useServerVision ? 'enabled' : 'disabled'}`);
  }

  async checkServerCapabilities() {
    try {
      if (!this.aiClient) {
        console.warn('⚠️  No AI client available');
        this.sessionState.useServerVision = false;
        return;
      }
      
      const serverInfo = await this.aiClient.getServerInfo();
      if (serverInfo) {
        this.sessionState.useServerVision = serverInfo.vision_processing || false;
        console.log(`📊 Server capabilities: ${serverInfo.mode} mode, vision: ${this.sessionState.useServerVision}`);
      }
    } catch (error) {
      console.warn('⚠️  Could not check server capabilities, using fallback mode');
      this.sessionState.useServerVision = false;
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📁 Processing uploaded file: ${file.name}`);
    
    // Validate file type
    if (!this.visionConfig.supportedFormats.includes(file.type)) {
      this.showError('Unsupported file format. Please use JPEG, PNG, or WebP.');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('File too large. Please use files smaller than 10MB.');
      return;
    }
    
    // Check if AI client is available
    if (!this.aiClient || !this.aiClient.isConnected) {
      console.warn('⚠️  AI client not connected, trying to reconnect...');
      
      // Try to reconnect
      if (this.aiClient) {
        const connected = await this.aiClient.detectStation();
        if (!connected) {
          this.showError('AI server not available. Please check your connection or use manual entry.');
          this.startManualEntry();
          return;
        }
      } else {
        this.showError('AI client not initialized. Please refresh the page and try again.');
        return;
      }
    }
    
    this.showVisionProcessingProgress();
    await this.processImageWithServerVision(file);
  }

  async processImageWithServerVision(imageFile) {
    try {
      // Additional safety check
      if (!this.aiClient) {
        throw new Error('AI client not available');
      }
      
      // Convert to base64 for server processing
      console.log('📸 Converting image to base64...');
      let base64Image;
      
      try {
        base64Image = await this.aiClient.processImageFile(imageFile, this.visionConfig.maxImageSize);
      } catch (error) {
        console.error('❌ Failed to process image file:', error);
        // Fallback to direct conversion
        base64Image = await this.fileToBase64(imageFile);
      }
      
      console.log(`✅ Base64 conversion complete (${base64Image.length} chars)`);
      
      // Stage 1: OCR Processing
      this.processingState = {
        stage: 'ocr',
        progress: 10,
        message: 'Extracting text from image...',
        startTime: Date.now()
      };
      this.updateVisionProgress();
      
      console.log('🔤 Starting server-side OCR...');
      const ocrResult = await this.aiClient.serverOCR(base64Image, this.currentLanguage);
      
      // Stage 2: Document Analysis
      this.processingState = {
        stage: 'analysis',
        progress: 50,
        message: 'Analyzing document structure...',
        startTime: Date.now()
      };
      this.updateVisionProgress();
      
      console.log('📄 Starting document analysis...');
      const docResult = await this.aiClient.analyzeDocument(base64Image, 'general');
      
      // Stage 3: Processing Complete
      this.processingState = {
        stage: 'complete',
        progress: 100,
        message: 'Processing complete!',
        startTime: Date.now()
      };
      this.updateVisionProgress();
      
      console.log('✅ Server-side vision processing complete');
      console.log(`📊 OCR confidence: ${(ocrResult.confidence * 100).toFixed(1)}%`);
      console.log(`📊 Document type: ${docResult.document_type}`);
      
      // Process the results
      await this.processVisionResults(ocrResult, docResult);
      
    } catch (error) {
      console.error('❌ Server-side vision processing failed:', error);
      this.handleVisionProcessingError(error);
    }
  }

  // Fallback method to convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
      const errorText = errorElement.querySelector('.error-text');
      if (errorText) {
        errorText.textContent = message;
      } else {
        errorElement.textContent = message;
      }
      errorElement.style.display = 'block';
      
      // Scroll to error message
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Auto-hide after 8 seconds (longer for reading)
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 8000);
    }
    
    // Also show as toast if available
    if (window.app && window.app.showToast) {
      window.app.showToast(message);
    }
  }

  // ... rest of the methods remain the same ...
  
  setupEventListeners() {
    console.log('🔧 Setting up Gemmorandum Multimodal event listeners...');
    
    // File upload for form images
    const formImageUpload = document.getElementById('formImageUpload');
    if (formImageUpload) {
      console.log('✓ Found formImageUpload element');
      formImageUpload.addEventListener('change', (e) => {
        console.log('📁 File upload triggered');
        this.handleFileUpload(e);
      });
    } else {
      console.error('❌ formImageUpload element not found!');
    }
    
    // ... rest of event listeners remain the same ...
  }
  
  // Add remaining methods from original file...
}