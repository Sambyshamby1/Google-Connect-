// Enhanced AI Station Client for Refugee Connect - Multimodal Version
// Hardware Pivot: Pi Station → Dell Mini PC with Multimodal Gemma 3n

class MultimodalAIStationClient {
  constructor() {
    this.stationURL = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxAttempts = 3;
    this.timeout = 600000; // 10 minutes for AI responses (allows model loading)
    this.visionTimeout = 600000; // 10 minutes for vision processing
    this.translationTimeout = 900000; // 15 minutes for translation (can be very slow)
    
    // Common Pi station IPs to scan (port 8080 for AI server)
    this.commonIPs = [
      'localhost:8080',       // Local development
      '127.0.0.1:8080',       // Alternative localhost
      '192.168.1.87:8080',    // Dell Mini PC (primary target)
      '192.168.1.200:8080',   // Common home network
      '192.168.0.200:8080',   // Alternative subnet
      '10.0.0.200:8080',      // Alternative range
      '172.16.0.200:8080',    // Private network range
      '192.168.4.1:8080',     // Raspberry Pi Access Point mode
      '10.42.0.1:8080'        // Alternative Pi AP
    ];
    
    // Check for URL parameter override
    this.checkURLParameter();
    
    // Enhanced API endpoints with vision capabilities
    this.endpoints = {
      // Original endpoints (backward compatibility)
      status: '/api/status',
      translate: '/api/translate',
      search: '/api/search',
      medical: '/api/medical',
      legal: '/api/legal',
      profile: '/api/profile',
      emergency: '/api/emergency',
      chat: '/api/chat',
      education: '/api/education/help',
      conversation: '/api/conversation',
      
      // New multimodal endpoints
      vision: {
        ocr: '/api/vision/ocr',
        document: '/api/vision/document',
        medical: '/api/vision/medical'
      },
      multimodal: {
        chat: '/api/multimodal/chat'
      }
    };
    
    // Vision processing cache
    this.visionCache = new Map();
    this.maxCacheSize = 50;
    
    // Server capabilities
    this.capabilities = {
      multimodal: false,
      vision_processing: false,
      server_mode: 'unknown'
    };
  }

  checkURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const aiServer = urlParams.get('ai_server');
    
    if (aiServer) {
      console.log(`🔧 URL parameter detected: ai_server=${aiServer}`);
      this.commonIPs.unshift(aiServer);
      console.log(`📡 Will try custom AI server first: ${aiServer}`);
    }
  }

  async detectStation() {
    console.log('🔍 Searching for multimodal AI station...');
    
    // First check if we have a saved station URL
    const savedURL = localStorage.getItem('aiStationURL');
    if (savedURL) {
      const isValid = await this.testConnection(savedURL);
      if (isValid) {
        this.stationURL = savedURL;
        this.isConnected = true;
        await this.updateCapabilities();
        console.log('✅ Connected to saved AI station:', savedURL);
        return true;
      }
    }
    
    // Scan common IPs
    for (const ip of this.commonIPs) {
      const url = `http://${ip}`;
      console.log(`🔍 Trying: ${url}`);
      
      const isValid = await this.testConnection(url);
      if (isValid) {
        this.stationURL = url;
        this.isConnected = true;
        localStorage.setItem('aiStationURL', url);
        await this.updateCapabilities();
        console.log('✅ AI station found at:', url);
        return true;
      }
    }
    
    // Try mDNS/Bonjour names
    const mdnsNames = [
      'refugee-connect.local:8080',
      'ai-station.local:8080',
      'raspberrypi.local:8080',
      'gemma-station.local:8080'
    ];
    
    for (const name of mdnsNames) {
      const url = `http://${name}`;
      const isValid = await this.testConnection(url);
      if (isValid) {
        this.stationURL = url;
        this.isConnected = true;
        localStorage.setItem('aiStationURL', url);
        await this.updateCapabilities();
        console.log('✅ AI station found via mDNS:', url);
        return true;
      }
    }
    
    console.log('❌ No AI station found');
    this.isConnected = false;
    return false;
  }

  async checkConnection() {
    /* Check if current connection is still active */
    if (!this.stationURL) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.stationURL}${this.endpoints.status}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const isConnected = response.ok;
      this.isConnected = isConnected;
      return isConnected;
    } catch (error) {
      console.log('🔌 Connection check failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async testConnection(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${url}${this.endpoints.status}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ready' || data.status === 'ok' || data.status === 'online';
      }
    } catch (error) {
      // Connection failed
    }
    return false;
  }

  async updateCapabilities() {
    try {
      const response = await fetch(`${this.stationURL}${this.endpoints.status}`);
      const data = await response.json();
      
      this.capabilities = {
        multimodal: data.multimodal_enabled || false,
        vision_processing: data.vision_processing || false,
        server_mode: data.mode || 'unknown',
        model_type: data.model_type || 'unknown'
      };
      
      console.log('📊 Server capabilities:', this.capabilities);
    } catch (error) {
      console.warn('⚠️  Could not update server capabilities:', error);
    }
  }

  async makeRequest(endpoint, data, options = {}) {
    if (!this.isConnected || !this.stationURL) {
      const connected = await this.detectStation();
      if (!connected) {
        throw new Error('No AI station available');
      }
    }
    
    const requestTimeout = options.timeout || this.timeout;
    const isVisionRequest = endpoint.includes('/vision/') || endpoint.includes('/multimodal/');
    const actualTimeout = isVisionRequest ? this.visionTimeout : requestTimeout;
    
    console.log(`🌐 Making request to: ${this.stationURL}${endpoint}`);
    console.log(`⏱️  Timeout: ${actualTimeout}ms ${isVisionRequest ? '(vision)' : '(standard)'}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Request timeout after ${actualTimeout}ms`);
      controller.abort();
    }, actualTimeout);
    
    try {
      const response = await fetch(`${this.stationURL}${endpoint}`, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - AI station is taking too long to respond');
      }
      
      this.isConnected = false;
      throw error;
    }
  }

  // Enhanced vision processing methods

  async serverOCR(imageData, language = 'en', useCache = true) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('ocr', imageData, language);
      if (useCache && this.visionCache.has(cacheKey)) {
        console.log('📋 Using cached OCR result');
        return this.visionCache.get(cacheKey);
      }
      
      console.log(`🔤 Starting server-side OCR (${language})`);
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.vision.ocr, {
        image: imageData,
        language: language,
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ OCR completed in ${duration}ms`);
      console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`📝 Extracted ${result.character_count} characters, ${result.word_count} words`);
      
      // Cache result
      if (useCache) {
        this.cacheVisionResult(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Server OCR error:', error);
      throw error;
    }
  }

  async analyzeDocument(imageData, documentType = 'general', useCache = true) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('document', imageData, documentType);
      if (useCache && this.visionCache.has(cacheKey)) {
        console.log('📋 Using cached document analysis');
        return this.visionCache.get(cacheKey);
      }
      
      console.log(`📄 Starting document analysis (${documentType})`);
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.vision.document, {
        image: imageData,
        document_type: documentType,
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Document analysis completed in ${duration}ms`);
      console.log(`📊 Document type: ${result.document_type}`);
      console.log(`📊 Completion: ${(result.completion_percentage * 100).toFixed(1)}%`);
      
      // Cache result
      if (useCache) {
        this.cacheVisionResult(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Document analysis error:', error);
      throw error;
    }
  }

  async analyzeMedicalImage(imageData, symptoms = '', useCache = true) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('medical', imageData, symptoms);
      if (useCache && this.visionCache.has(cacheKey)) {
        console.log('📋 Using cached medical analysis');
        return this.visionCache.get(cacheKey);
      }
      
      console.log('🏥 Starting medical image analysis');
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.vision.medical, {
        image: imageData,
        symptoms: symptoms,
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Medical analysis completed in ${duration}ms`);
      console.log(`⚕️  Urgency level: ${result.urgency_level}`);
      
      // Cache result
      if (useCache) {
        this.cacheVisionResult(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Medical image analysis error:', error);
      throw error;
    }
  }

  async multimodalChat(text, imageData = null, useCache = true) {
    try {
      // Check cache for image-based chats
      let cacheKey = null;
      if (imageData && useCache) {
        cacheKey = this.generateCacheKey('chat', imageData, text);
        if (this.visionCache.has(cacheKey)) {
          console.log('📋 Using cached multimodal chat');
          return this.visionCache.get(cacheKey);
        }
      }
      
      console.log(`💬 Starting multimodal chat ${imageData ? 'with image' : 'text-only'}`);
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.multimodal.chat, {
        text: text,
        image: imageData,
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Multimodal chat completed in ${duration}ms`);
      console.log(`🌍 Language detected: ${result.language_detected}`);
      
      // Cache result if it includes image
      if (imageData && useCache && cacheKey) {
        this.cacheVisionResult(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Multimodal chat error:', error);
      throw error;
    }
  }

  // Original methods for backward compatibility
  async translate(text, fromLang, toLang, context = 'general') {
    try {
      console.log(`🔄 Translation: "${text}" (${fromLang} → ${toLang})`);
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.translate, {
        text,
        from: fromLang,
        to: toLang,
        context,
        timestamp: Date.now()
      }, {
        method: 'POST',
        timeout: this.translationTimeout
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Translation completed in ${duration}ms`);
      console.log('🔍 Raw API response:', JSON.stringify(result, null, 2));
      
      // Transform response to match expected frontend format
      // Backend returns "translated_text", frontend expects "translation"
      if (result && result.translated_text) {
        const transformedResult = {
          translation: result.translated_text,
          from_language: result.from_language,
          to_language: result.to_language,
          success: true
        };
        console.log('🔄 Transformed result:', JSON.stringify(transformedResult, null, 2));
        return transformedResult;
      }
      
      console.log('⚠️ No translated_text found, returning raw result');
      return result;
    } catch (error) {
      console.error('❌ Translation error:', error);
      throw error;
    }
  }

  async chatWithGemma(message) {
    try {
      console.log(`💬 Chat with Gemma: "${message}"`);
      const startTime = Date.now();
      
      const result = await this.makeRequest(this.endpoints.chat, {
        message,
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Chat response received in ${duration}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw error;
    }
  }

  async searchFamily(query) {
    try {
      const result = await this.makeRequest(this.endpoints.search, {
        query,
        type: 'family',
        timestamp: Date.now()
      });
      
      return result.matches || [];
    } catch (error) {
      console.error('❌ Family search error:', error);
      return [];
    }
  }

  async getMedicalAdvice(symptoms, urgency = 'normal') {
    try {
      const result = await this.makeRequest(this.endpoints.medical, {
        symptoms,
        urgency,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('❌ Medical advice error:', error);
      throw error;
    }
  }

  async getLegalAdvice(situation, country = 'general') {
    try {
      const result = await this.makeRequest(this.endpoints.legal, {
        situation,
        country,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('❌ Legal advice error:', error);
      throw error;
    }
  }

  // Utility methods

  generateCacheKey(type, imageData, additional = '') {
    const imageHash = this.hashString(imageData);
    const additionalHash = this.hashString(additional);
    return `${type}_${imageHash}_${additionalHash}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  cacheVisionResult(key, result) {
    // Implement LRU cache
    if (this.visionCache.size >= this.maxCacheSize) {
      const firstKey = this.visionCache.keys().next().value;
      this.visionCache.delete(firstKey);
    }
    
    this.visionCache.set(key, result);
    console.log(`📋 Cached vision result (${this.visionCache.size}/${this.maxCacheSize})`);
  }

  clearVisionCache() {
    this.visionCache.clear();
    console.log('🗑️  Vision cache cleared');
  }

  // Image processing utilities

  async processImageFile(file, maxSize = 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = height * (maxSize / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = width * (maxSize / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Server info methods

  async getServerInfo() {
    try {
      const response = await fetch(`${this.stationURL}${this.endpoints.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to get server info:', error);
      return null;
    }
  }

  isMultimodalEnabled() {
    return this.capabilities.multimodal;
  }

  isVisionProcessingEnabled() {
    return this.capabilities.vision_processing;
  }

  getServerMode() {
    return this.capabilities.server_mode;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultimodalAIStationClient;
}

// Global instance for backward compatibility
const aiClient = new MultimodalAIStationClient();