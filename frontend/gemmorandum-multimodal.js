// Gemmorandum - Multimodal Form Completion Assistant
// Hardware Pivot: Enhanced with server-side vision processing

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

  setupEventListeners() {
    console.log('🔧 Setting up Gemmorandum Multimodal event listeners...');
    
    // Capture form button
    const captureFormBtn = document.getElementById('captureFormBtn');
    if (captureFormBtn) {
      console.log('✓ Found captureFormBtn element, adding event listener');
      captureFormBtn.addEventListener('click', () => {
        console.log('📸 Capture form button clicked');
        this.startFormCapture();
      });
    } else {
      console.error('❌ captureFormBtn element not found!');
    }

    // Manual entry button
    const manualFormBtn = document.getElementById('manualFormBtn');
    if (manualFormBtn) {
      console.log('✓ Found manualFormBtn element, adding event listener');
      manualFormBtn.addEventListener('click', () => {
        console.log('✍️ Manual form button clicked');
        this.startManualEntry();
      });
    } else {
      console.error('❌ manualFormBtn element not found!');
    }

    // Camera controls
    const captureFormPhoto = document.getElementById('captureFormPhoto');
    if (captureFormPhoto) {
      captureFormPhoto.addEventListener('click', () => this.capturePhoto());
    }

    const cancelFormCapture = document.getElementById('cancelFormCapture');
    if (cancelFormCapture) {
      cancelFormCapture.addEventListener('click', () => this.cancelCapture());
    }

    // Form input controls
    const sendFormResponse = document.getElementById('sendFormResponse');
    if (sendFormResponse) {
      sendFormResponse.addEventListener('click', () => this.sendResponse());
    }

    const skipFormField = document.getElementById('skipFormField');
    if (skipFormField) {
      skipFormField.addEventListener('click', () => this.skipField());
    }

    // Keyboard toggle
    const keyboardToggleForm = document.getElementById('keyboardToggleForm');
    if (keyboardToggleForm) {
      keyboardToggleForm.addEventListener('click', () => this.toggleVirtualKeyboard());
    }

    // Export and new form buttons
    const exportForm = document.getElementById('exportForm');
    if (exportForm) {
      exportForm.addEventListener('click', () => this.exportForm());
    }

    const startNewForm = document.getElementById('startNewForm');
    if (startNewForm) {
      startNewForm.addEventListener('click', () => this.startNewForm());
    }

    // Form input Enter key handling
    const formInput = document.getElementById('formInput');
    if (formInput) {
      formInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendResponse();
        }
      });
    }

    // File upload for form images
    const formImageUpload = document.getElementById('formImageUpload');
    if (formImageUpload) {
      formImageUpload.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  async startFormCapture() {
    console.log('📸 Starting enhanced form capture...');
    
    // Check if server-side vision is available
    if (!this.sessionState.useServerVision) {
      console.warn('⚠️  Server-side vision not available, using fallback mode');
      this.showFallbackMessage();
      return;
    }
    
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ Camera API not supported');
      this.showError('Camera access is not supported in this browser. Please use a modern browser or try manual entry.');
      return;
    }
    
    // Check if we're in a secure context (HTTPS)
    if (!window.isSecureContext) {
      console.error('❌ Not in secure context');
      this.showError('Camera access requires HTTPS. Please use a secure connection or try manual entry.');
      return;
    }
    
    // Check existing permissions if available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        console.log(`📸 Camera permission status: ${cameraPermission.state}`);
        
        if (cameraPermission.state === 'denied') {
          this.showError('Camera access was denied. Please enable camera permissions in your browser settings and refresh the page.');
          return;
        }
      } catch (permError) {
        console.warn('⚠️  Could not check camera permissions:', permError);
        // Continue anyway - some browsers don't support permissions API
      }
    }
    
    // Show camera section
    this.showSection('formCameraSection');
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      const video = document.getElementById('formCameraVideo');
      if (video) {
        video.srcObject = stream;
        this.currentStream = stream;
        console.log('📹 Camera stream active');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      this.handleCameraError(error);
    }
  }

  async capturePhoto() {
    const video = document.getElementById('formCameraVideo');
    const canvas = document.getElementById('formCameraCanvas');
    
    if (!video || !canvas) {
      console.error('❌ Camera elements not found');
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Stop camera stream
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
    
    // Hide camera, show processing
    document.getElementById('formCameraSection').style.display = 'none';
    this.showVisionProcessingProgress();
    
    // Convert canvas to blob and process with server-side vision
    canvas.toBlob(async (blob) => {
      await this.processImageWithServerVision(blob);
    }, 'image/jpeg', 0.8);
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
    
    this.showVisionProcessingProgress();
    await this.processImageWithServerVision(file);
  }

  showVisionProcessingProgress() {
    const progressElement = document.getElementById('visionProgress');
    if (progressElement) {
      progressElement.style.display = 'block';
    }
    
    this.processingState = {
      stage: 'initializing',
      progress: 0,
      message: 'Preparing image for analysis...',
      startTime: Date.now()
    };
    
    this.updateVisionProgress();
  }

  updateVisionProgress() {
    const progressFill = document.getElementById('visionProgressFill');
    const progressText = document.getElementById('visionProgressText');
    
    if (progressFill) {
      progressFill.style.width = `${this.processingState.progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = this.processingState.message;
    }
  }

  async processImageWithServerVision(imageFile) {
    try {
      // Convert to base64 for server processing
      const base64Image = await this.aiClient.processImageFile(imageFile, this.visionConfig.maxImageSize);
      
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

  async processVisionResults(ocrResult, docResult) {
    // Hide progress indicator
    const progressElement = document.getElementById('visionProgress');
    if (progressElement) {
      progressElement.style.display = 'none';
    }
    
    // Extract and process the text
    const extractedText = ocrResult.extracted_text;
    const documentType = docResult.document_type;
    const detectedLanguage = ocrResult.language_detected;
    
    // Update language if different from current
    if (detectedLanguage !== this.currentLanguage) {
      this.currentLanguage = detectedLanguage;
      this.updateLanguageDisplay();
    }
    
    // Initialize conversation with extracted data
    this.conversationHistory = [];
    this.sessionState.formType = documentType;
    this.formData = {
      extractedText: extractedText,
      documentType: documentType,
      detectedLanguage: detectedLanguage,
      extractedFields: docResult.extracted_fields || {},
      criticalFields: docResult.critical_fields || [],
      processingTime: ocrResult.processing_time + docResult.processing_time
    };
    
    // Update form info display
    this.updateFormInfo(
      this.getFormTypeDisplay(documentType),
      Object.keys(docResult.extracted_fields || {}).length,
      docResult.critical_fields?.length || 0
    );
    
    // Create initial analysis message
    const analysisMessage = this.createFormAnalysisMessage(ocrResult, docResult);
    this.addMessage('assistant', analysisMessage);
    
    // Show conversation section
    this.showSection('formConversationSection');
    
    // Start guided form completion
    await this.startGuidedFormCompletion();
  }

  createFormAnalysisMessage(ocrResult, docResult) {
    const formType = this.getFormTypeDisplay(docResult.document_type);
    const confidence = Math.round(ocrResult.confidence * 100);
    const completionPercent = Math.round(docResult.completion_percentage * 100);
    
    let message = `📄 **Form Analysis Complete**\n\n`;
    message += `**Document Type:** ${formType}\n`;
    message += `**Text Extraction:** ${confidence}% confidence\n`;
    message += `**Completion Status:** ${completionPercent}% filled\n`;
    message += `**Language:** ${this.supportedLanguages[ocrResult.language_detected]?.name || 'Unknown'}\n\n`;
    
    if (docResult.critical_fields && docResult.critical_fields.length > 0) {
      message += `**Critical Fields Detected:**\n`;
      docResult.critical_fields.forEach(field => {
        message += `• ${field.replace('_', ' ')}\n`;
      });
      message += `\n`;
    }
    
    message += `I'll help you complete this form step by step. Let's start with the most important fields.`;
    
    return message;
  }

  async startGuidedFormCompletion() {
    if (!this.formData.criticalFields || this.formData.criticalFields.length === 0) {
      this.addMessage('assistant', 'What would you like to work on first?');
      return;
    }
    
    // Start with the first critical field
    const firstField = this.formData.criticalFields[0];
    this.sessionState.currentField = firstField;
    
    // Check if this field already has data
    const existingValue = this.formData.extractedFields[firstField];
    
    let message = `Let's start with **${firstField.replace('_', ' ')}**.`;
    
    if (existingValue && existingValue !== `[${firstField.replace('_', ' ')}]`) {
      message += `\n\nI found this information: "${existingValue}"\n\nIs this correct, or would you like to change it?`;
    } else {
      message += `\n\nPlease provide your ${firstField.replace('_', ' ')}.`;
    }
    
    this.addMessage('assistant', message);
  }

  async sendResponse() {
    const formInput = document.getElementById('formInput');
    const userMessage = formInput.value.trim();
    
    if (!userMessage) return;
    
    // Add user message to conversation
    this.addMessage('user', userMessage);
    formInput.value = '';
    
    // Show processing indicator
    this.showProcessingIndicator();
    
    try {
      // Get AI response based on current context
      const response = await this.getContextualResponse(userMessage);
      
      // Add assistant response
      this.addMessage('assistant', response);
      
      // Update form progress
      this.updateFormProgress(userMessage);
      
    } catch (error) {
      console.error('❌ Error getting response:', error);
      this.addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
      this.hideProcessingIndicator();
    }
  }

  async getContextualResponse(userMessage) {
    // Create context for the AI
    const context = {
      formType: this.sessionState.formType,
      currentField: this.sessionState.currentField,
      extractedFields: this.formData.extractedFields,
      conversationHistory: this.conversationHistory.slice(-5), // Last 5 messages
      completedFields: this.sessionState.completedFields,
      totalFields: this.sessionState.totalFields
    };
    
    // Use multimodal chat for contextual responses
    const prompt = this.buildFormGuidancePrompt(userMessage, context);
    
    try {
      const result = await this.aiClient.multimodalChat(prompt);
      return result.response;
    } catch (error) {
      console.error('❌ Error getting contextual response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  buildFormGuidancePrompt(userMessage, context) {
    let prompt = `You are helping someone complete a ${context.formType} form.\n\n`;
    
    if (context.currentField) {
      prompt += `Currently working on: ${context.currentField}\n`;
    }
    
    prompt += `User's response: "${userMessage}"\n\n`;
    
    prompt += `Please:\n`;
    prompt += `1. Acknowledge their response positively\n`;
    prompt += `2. Ask for the next most important field\n`;
    prompt += `3. Explain why this information is needed\n`;
    prompt += `4. Give an example if helpful\n\n`;
    
    prompt += `Be encouraging and trauma-informed. Keep responses under 100 words.`;
    
    return prompt;
  }

  getFallbackResponse(userMessage) {
    return `Thank you for providing that information. Let me help you with the next field on your form.`;
  }

  updateFormProgress(userMessage) {
    // Update completed fields
    if (this.sessionState.currentField) {
      this.formData.extractedFields[this.sessionState.currentField] = userMessage;
      
      if (!this.sessionState.completedFields.includes(this.sessionState.currentField)) {
        this.sessionState.completedFields.push(this.sessionState.currentField);
      }
    }
    
    // Update progress display
    const completed = this.sessionState.completedFields.length;
    const total = this.formData.criticalFields?.length || 0;
    
    this.updateFormInfo(
      this.getFormTypeDisplay(this.sessionState.formType),
      completed,
      total
    );
  }

  // Utility methods

  getFormTypeDisplay(formType) {
    const types = {
      'asylum_application': 'Asylum Application',
      'medical_intake': 'Medical Intake Form',
      'aid_registration': 'Aid Registration',
      'legal_form': 'Legal Document',
      'id_document': 'Identity Document',
      'general': 'General Form'
    };
    return types[formType] || 'Unknown Form';
  }

  updateLanguageDisplay() {
    const langInfo = this.supportedLanguages[this.currentLanguage];
    if (langInfo) {
      document.body.className = `language-${this.currentLanguage}`;
      document.body.dir = langInfo.direction;
    }
  }

  showSection(sectionId) {
    // Hide all sections
    const sections = [
      'form-capture-section',
      'formCameraSection',
      'formConversationSection',
      'visionProgress'
    ];
    
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'none';
      }
    });
    
    // Show requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  }

  showProcessingIndicator() {
    // Show processing indicator
    const indicator = document.getElementById('processingIndicator');
    if (indicator) {
      indicator.style.display = 'block';
    }
  }

  hideProcessingIndicator() {
    // Hide processing indicator
    const indicator = document.getElementById('processingIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  addMessage(type, content) {
    const conversation = document.getElementById('formConversation');
    if (!conversation) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = this.formatMessage(content);
    
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
    
    // Store in history
    this.conversationHistory.push({
      type: type,
      content: content,
      timestamp: new Date().toISOString()
    });
  }

  formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  updateFormInfo(formType, completed, total) {
    const formTypeElement = document.getElementById('formType');
    const formProgressElement = document.getElementById('formProgress');
    
    if (formTypeElement) {
      formTypeElement.textContent = formType;
    }
    
    if (formProgressElement) {
      formProgressElement.textContent = `${completed}/${total} fields completed`;
    }
  }

  handleVisionProcessingError(error) {
    console.error('❌ Vision processing error:', error);
    
    // Hide progress indicator
    const progressElement = document.getElementById('visionProgress');
    if (progressElement) {
      progressElement.style.display = 'none';
    }
    
    // Show error message
    this.showError('Vision processing failed. Please try again or use manual entry.');
    
    // Return to capture selection
    this.showSection('form-capture-section');
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
  }

  showFallbackMessage() {
    this.showError('Server-side vision processing not available. Please use manual entry.');
    this.startManualEntry();
  }

  // Additional methods for compatibility
  startManualEntry() {
    console.log('✏️  Starting manual form entry...');
    
    this.conversationHistory = [];
    this.sessionState.formType = 'manual';
    this.updateFormInfo('Manual Form Entry', 0, 0);
    
    this.addMessage('assistant', 
      'Hello! I\'m here to help you complete your form step by step. ' +
      'What type of form do you need help with?'
    );
    
    this.showSection('formConversationSection');
  }

  cancelCapture() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
    this.showSection('form-capture-section');
  }

  skipField() {
    if (this.sessionState.currentField) {
      this.addMessage('assistant', 'Field skipped. Let\'s continue with the next field.');
      // Logic to move to next field
    }
  }

  toggleVirtualKeyboard() {
    // Virtual keyboard toggle logic
    console.log('🎹 Virtual keyboard toggle');
  }

  exportForm() {
    // Export form data
    const exportData = {
      formData: this.formData,
      conversationHistory: this.conversationHistory,
      sessionState: this.sessionState,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  startNewForm() {
    // Reset for new form
    this.formData = {};
    this.conversationHistory = [];
    this.sessionState = {
      formType: null,
      currentField: null,
      completedFields: [],
      totalFields: 0,
      isProcessing: false,
      useServerVision: this.sessionState.useServerVision
    };
    
    this.showSection('form-capture-section');
  }

  initializeAutoSave() {
    // Auto-save implementation
    setInterval(() => {
      if (this.formData && Object.keys(this.formData).length > 0) {
        localStorage.setItem('gemmorandum_session', JSON.stringify({
          formData: this.formData,
          sessionState: this.sessionState,
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Save every 30 seconds
  }

  attemptSessionRecovery() {
    const saved = localStorage.getItem('gemmorandum_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Only recover if less than 1 hour old
        if (Date.now() - new Date(session.timestamp).getTime() < 3600000) {
          this.formData = session.formData;
          this.sessionState = { ...this.sessionState, ...session.sessionState };
          console.log('✅ Session recovered from local storage');
        }
      } catch (error) {
        console.warn('⚠️  Could not recover session:', error);
      }
    }
  }

  handleCameraError(error) {
    console.error('❌ Camera initialization failed:', error);
    
    // Stop any active streams
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    // Determine error message based on error type
    let errorMessage = 'Unable to access camera. ';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage += 'Please grant camera permissions in your browser settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage += 'No camera device found. Please connect a camera.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage += 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      errorMessage += 'Camera does not support the requested settings.';
    } else if (error.name === 'TypeError' && error.message.includes('getUserMedia')) {
      errorMessage += 'Camera access requires HTTPS. Please use a secure connection.';
    } else {
      errorMessage += 'Please try again or use manual entry.';
    }
    
    // Show error to user
    this.showError(errorMessage);
    
    // Highlight the manual entry option
    const manualBtn = document.getElementById('manualFormBtn');
    if (manualBtn) {
      manualBtn.style.animation = 'pulse 2s ease-in-out 3';
    }
    
    // Return to capture selection
    this.showSection('form-capture-section');
  }
}