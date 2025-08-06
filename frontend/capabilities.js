// Device Capabilities Detection for Refugee Connect
class DeviceCapabilities {
  constructor() {
    this.capabilities = {};
    this.deviceInfo = {};
    this.networkInfo = {};
    
    // Run initial capability check
    this.checkAllCapabilities();
  }

  checkAllCapabilities() {
    this.capabilities = {
      // Core web APIs
      serviceWorker: this.checkServiceWorker(),
      localStorage: this.checkLocalStorage(),
      indexedDB: this.checkIndexedDB(),
      webRTC: this.checkWebRTC(),
      geolocation: this.checkGeolocation(),
      
      // Media capabilities
      camera: this.checkCamera(),
      microphone: this.checkMicrophone(),
      mediaRecorder: this.checkMediaRecorder(),
      
      // Network and connectivity
      online: this.checkOnlineStatus(),
      fetch: this.checkFetch(),
      websockets: this.checkWebSockets(),
      
      // Mobile features
      touchscreen: this.checkTouchscreen(),
      deviceOrientation: this.checkDeviceOrientation(),
      vibration: this.checkVibration(),
      
      // PWA features
      pwaInstallable: this.checkPWAInstallable(),
      fullscreen: this.checkFullscreen(),
      pushNotifications: this.checkPushNotifications(),
      
      // Security features
      https: this.checkHTTPS(),
      cryptography: this.checkCryptography(),
      
      // Performance indicators
      memoryInfo: this.checkMemoryInfo(),
      connectionType: this.checkConnectionType(),
      
      // Accessibility features
      screenReader: this.checkScreenReader(),
      highContrast: this.checkHighContrast()
    };
    
    this.deviceInfo = this.getDeviceInfo();
    this.networkInfo = this.getNetworkInfo();
    
    // Log capabilities for debugging
    console.log('Device Capabilities:', this.capabilities);
    console.log('Device Info:', this.deviceInfo);
    console.log('Network Info:', this.networkInfo);
  }

  // Core Web API Checks
  checkServiceWorker() {
    return 'serviceWorker' in navigator;
  }

  checkLocalStorage() {
    try {
      const testKey = 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkIndexedDB() {
    return 'indexedDB' in window;
  }

  checkWebRTC() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  checkGeolocation() {
    return 'geolocation' in navigator;
  }

  // Media Capability Checks
  checkCamera() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  checkMicrophone() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  checkMediaRecorder() {
    return 'MediaRecorder' in window;
  }

  // Network Capability Checks
  checkOnlineStatus() {
    return {
      supported: 'onLine' in navigator,
      online: navigator.onLine
    };
  }

  checkFetch() {
    return 'fetch' in window;
  }

  checkWebSockets() {
    return 'WebSocket' in window;
  }

  // Mobile Feature Checks
  checkTouchscreen() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  checkDeviceOrientation() {
    return 'DeviceOrientationEvent' in window;
  }

  checkVibration() {
    return 'vibrate' in navigator;
  }

  // PWA Feature Checks
  checkPWAInstallable() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  checkFullscreen() {
    return !!(document.documentElement.requestFullscreen || 
              document.documentElement.webkitRequestFullscreen ||
              document.documentElement.mozRequestFullScreen ||
              document.documentElement.msRequestFullscreen);
  }

  checkPushNotifications() {
    return 'Notification' in window && 'PushManager' in window;
  }

  // Security Feature Checks
  checkHTTPS() {
    return location.protocol === 'https:' || location.hostname === 'localhost';
  }

  checkCryptography() {
    return 'crypto' in window && 'subtle' in window.crypto;
  }

  // Performance Checks
  checkMemoryInfo() {
    if ('memory' in performance) {
      return {
        supported: true,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      };
    }
    return { supported: false };
  }

  checkConnectionType() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        supported: true,
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return { supported: false };
  }

  // Accessibility Checks
  checkScreenReader() {
    return 'speechSynthesis' in window;
  }

  checkHighContrast() {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches;
    }
    return false;
  }

  // Device Information
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        orientation: screen.orientation ? screen.orientation.type : 'unknown'
      },
      
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      
      browser: this.detectBrowser(),
      os: this.detectOS(),
      isMobile: this.isMobileDevice(),
      isTablet: this.isTabletDevice()
    };
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  detectOS() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    
    return 'Unknown';
  }

  isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isTabletDevice() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }

  // Network Information
  getNetworkInfo() {
    const info = {
      online: navigator.onLine,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false
    };
    
    if ('connection' in navigator) {
      const conn = navigator.connection;
      info.connectionType = conn.type || 'unknown';
      info.effectiveType = conn.effectiveType || 'unknown';
      info.downlink = conn.downlink || null;
      info.rtt = conn.rtt || null;
      info.saveData = conn.saveData || false;
    }
    
    return info;
  }

  // Permission Checks
  async checkPermission(permissionName) {
    if (!('permissions' in navigator)) {
      return 'unsupported';
    }
    
    try {
      const result = await navigator.permissions.query({ name: permissionName });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.warn(`Permission ${permissionName} not supported:`, error);
      return 'unsupported';
    }
  }

  async checkCameraPermission() {
    return await this.checkPermission('camera');
  }

  async checkMicrophonePermission() {
    return await this.checkPermission('microphone');
  }

  async checkGeolocationPermission() {
    return await this.checkPermission('geolocation');
  }

  async checkNotificationPermission() {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  }

  // Storage Quota Information
  async getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          supported: true,
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota - estimate.usage,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }
    
    return { supported: false };
  }

  // Feature Recommendations
  getRecommendations() {
    const recommendations = [];
    
    if (!this.capabilities.https) {
      recommendations.push({
        type: 'security',
        message: 'App should be served over HTTPS for security and full functionality',
        severity: 'high'
      });
    }
    
    if (!this.capabilities.serviceWorker) {
      recommendations.push({
        type: 'offline',
        message: 'Service Workers not supported - offline functionality limited',
        severity: 'medium'
      });
    }
    
    if (!this.capabilities.camera) {
      recommendations.push({
        type: 'feature',
        message: 'Camera not available - document capture disabled',
        severity: 'low'
      });
    }
    
    if (this.networkInfo.saveData) {
      recommendations.push({
        type: 'performance',
        message: 'Data saver mode detected - reducing resource usage',
        severity: 'info'
      });
    }
    
    if (this.deviceInfo.isMobile && !this.capabilities.touchscreen) {
      recommendations.push({
        type: 'usability',
        message: 'Mobile device without touch support - ensure keyboard navigation works',
        severity: 'medium'
      });
    }
    
    const memoryInfo = this.capabilities.memoryInfo;
    if (memoryInfo.supported && memoryInfo.jsHeapSizeLimit < 100 * 1024 * 1024) { // Less than 100MB
      recommendations.push({
        type: 'performance',
        message: 'Low memory device - consider reducing app complexity',
        severity: 'medium'
      });
    }
    
    return recommendations;
  }

  // Optimization Suggestions
  getOptimizationSuggestions() {
    const suggestions = [];
    
    // Network optimizations
    if (this.networkInfo.effectiveType === 'slow-2g' || this.networkInfo.effectiveType === '2g') {
      suggestions.push('Enable aggressive caching for slow network');
      suggestions.push('Reduce image quality and size');
      suggestions.push('Minimize network requests');
    }
    
    if (this.networkInfo.saveData) {
      suggestions.push('Respect data saver preferences');
      suggestions.push('Load images on demand');
    }
    
    // Device optimizations
    if (this.deviceInfo.isMobile) {
      suggestions.push('Optimize for touch interactions');
      suggestions.push('Use mobile-friendly font sizes');
      suggestions.push('Consider battery usage');
    }
    
    if (this.capabilities.memoryInfo.supported && 
        this.capabilities.memoryInfo.jsHeapSizeLimit < 200 * 1024 * 1024) {
      suggestions.push('Implement lazy loading for non-critical features');
      suggestions.push('Clear unused data regularly');
    }
    
    // Accessibility optimizations
    if (this.capabilities.highContrast) {
      suggestions.push('Use high contrast color schemes');
    }
    
    if (this.capabilities.screenReader) {
      suggestions.push('Ensure proper ARIA labels');
      suggestions.push('Provide text alternatives for images');
    }
    
    return suggestions;
  }

  // App Configuration Recommendations
  getAppConfig() {
    return {
      // Feature flags based on capabilities
      enableCamera: this.capabilities.camera,
      enableGeolocation: this.capabilities.geolocation,
      enablePushNotifications: this.capabilities.pushNotifications,
      enableOfflineMode: this.capabilities.serviceWorker && this.capabilities.localStorage,
      enableVibration: this.capabilities.vibration,
      
      // Performance settings
      enableServiceWorker: this.capabilities.serviceWorker,
      enableIndexedDB: this.capabilities.indexedDB,
      enableWebRTC: this.capabilities.webRTC,
      
      // UI adaptations
      useTouchOptimization: this.capabilities.touchscreen,
      useMobileLayout: this.deviceInfo.isMobile,
      useHighContrast: this.capabilities.highContrast,
      
      // Network optimizations
      enableDataSaver: this.networkInfo.saveData,
      optimizeForSlowNetwork: ['slow-2g', '2g'].includes(this.networkInfo.effectiveType),
      
      // Storage limits
      maxDocumentSize: this.getRecommendedDocumentSize(),
      maxCacheSize: this.getRecommendedCacheSize()
    };
  }

  getRecommendedDocumentSize() {
    const memoryInfo = this.capabilities.memoryInfo;
    if (!memoryInfo.supported) return 5 * 1024 * 1024; // 5MB default
    
    const availableMemory = memoryInfo.jsHeapSizeLimit;
    if (availableMemory < 100 * 1024 * 1024) return 2 * 1024 * 1024; // 2MB for low memory
    if (availableMemory < 500 * 1024 * 1024) return 5 * 1024 * 1024; // 5MB for medium memory
    return 10 * 1024 * 1024; // 10MB for high memory
  }

  getRecommendedCacheSize() {
    const memoryInfo = this.capabilities.memoryInfo;
    if (!memoryInfo.supported) return 50 * 1024 * 1024; // 50MB default
    
    const availableMemory = memoryInfo.jsHeapSizeLimit;
    if (availableMemory < 100 * 1024 * 1024) return 20 * 1024 * 1024; // 20MB for low memory
    if (availableMemory < 500 * 1024 * 1024) return 50 * 1024 * 1024; // 50MB for medium memory
    return 100 * 1024 * 1024; // 100MB for high memory
  }

  // Real-time monitoring
  startMonitoring() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.networkInfo.online = true;
      this.onCapabilityChange('network', 'online', true);
    });
    
    window.addEventListener('offline', () => {
      this.networkInfo.online = false;
      this.onCapabilityChange('network', 'offline', false);
    });
    
    // Monitor orientation changes
    if (this.capabilities.deviceOrientation) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.deviceInfo.viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
          };
          this.onCapabilityChange('viewport', 'orientation', screen.orientation?.type);
        }, 100);
      });
    }
    
    // Monitor memory usage (if supported)
    if (this.capabilities.memoryInfo.supported) {
      setInterval(() => {
        this.capabilities.memoryInfo = this.checkMemoryInfo();
        this.onCapabilityChange('memory', 'usage', this.capabilities.memoryInfo.usedJSHeapSize);
      }, 30000); // Check every 30 seconds
    }
  }

  onCapabilityChange(category, type, value) {
    // Emit custom event for app to respond to capability changes
    const event = new CustomEvent('capabilityChange', {
      detail: { category, type, value, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  // Public API
  check() {
    return {
      capabilities: this.capabilities,
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo,
      recommendations: this.getRecommendations(),
      optimizations: this.getOptimizationSuggestions(),
      appConfig: this.getAppConfig()
    };
  }

  isFeatureSupported(feature) {
    return this.capabilities[feature] || false;
  }

  getDeviceType() {
    if (this.deviceInfo.isMobile) return 'mobile';
    if (this.deviceInfo.isTablet) return 'tablet';
    return 'desktop';
  }

  getNetworkQuality() {
    const effectiveType = this.networkInfo.effectiveType;
    if (['4g'].includes(effectiveType)) return 'good';
    if (['3g'].includes(effectiveType)) return 'fair';
    if (['2g', 'slow-2g'].includes(effectiveType)) return 'poor';
    return 'unknown';
  }
}

// Create singleton instance
window.DeviceCapabilities = DeviceCapabilities;