// Document Vault for Refugee Connect
class DocumentVault {
  constructor() {
    this.documents = new Map();
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.maxDocuments = 50;
    this.maxFileSize = 10 * 1024 * 1024; // 10MB per document
    this.supportedTypes = [
      'passport',
      'national_id',
      'medical_record',
      'family_photo',
      'legal_document',
      'other'
    ];
    
    this.typeLabels = {
      passport: 'Passport',
      national_id: 'National ID',
      medical_record: 'Medical Record',
      family_photo: 'Family Photo',
      legal_document: 'Legal Document',
      other: 'Other Document'
    };
    
    this.cameraStream = null;
    this.isCapturing = false;
    
    // Load existing documents
    this.loadDocuments();
  }

  getOrCreateEncryptionKey() {
    let key = localStorage.getItem('documentVaultKey');
    if (!key) {
      // Generate a simple encryption key for demo purposes
      // In production, this would use proper cryptographic methods
      key = this.generateSimpleKey();
      localStorage.setItem('documentVaultKey', key);
    }
    return key;
  }

  generateSimpleKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async startCamera() {
    try {
      if (this.cameraStream) {
        this.stopCamera();
      }

      const video = document.getElementById('cameraVideo');
      if (!video) {
        throw new Error('Camera video element not found');
      }

      // Request camera access
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      video.srcObject = this.cameraStream;
      video.play();

      // Set up capture button
      const captureBtn = document.getElementById('captureBtn');
      const cancelBtn = document.getElementById('cancelCapture');
      
      if (captureBtn) {
        captureBtn.onclick = () => this.captureDocument();
      }
      
      if (cancelBtn) {
        cancelBtn.onclick = () => this.cancelCapture();
      }

      this.isCapturing = true;
      console.log('Camera started successfully');
      
    } catch (error) {
      console.error('Error starting camera:', error);
      this.showError('Camera access denied or not available. Please ensure camera permissions are granted.');
    }
  }

  async captureDocument() {
    try {
      const video = document.getElementById('cameraVideo');
      const canvas = document.getElementById('cameraCanvas');
      const typeSelect = document.getElementById('documentType');
      
      if (!video || !canvas || !typeSelect) {
        throw new Error('Required elements not found');
      }

      const context = canvas.getContext('2d');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
      
      // Check file size
      const sizeInBytes = this.getDataURLSize(imageDataURL);
      if (sizeInBytes > this.maxFileSize) {
        throw new Error('Document image is too large. Please try again with better lighting or closer positioning.');
      }
      
      // Create document record
      const document = {
        id: this.generateDocumentId(),
        type: typeSelect.value,
        timestamp: Date.now(),
        imageData: imageDataURL,
        thumbnail: this.createThumbnail(imageDataURL),
        encrypted: true,
        size: sizeInBytes
      };
      
      // Encrypt and store
      await this.storeDocument(document);
      
      // Close modal and refresh list
      this.cancelCapture();
      
      // Show success message
      this.showSuccess('Document captured and stored securely!');
      
      // Trigger list update
      if (window.app && typeof window.app.updateDocumentList === 'function') {
        window.app.updateDocumentList();
      }
      
    } catch (error) {
      console.error('Error capturing document:', error);
      this.showError('Failed to capture document: ' + error.message);
    }
  }

  cancelCapture() {
    this.stopCamera();
    const modal = document.getElementById('cameraModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.isCapturing = false;
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    
    const video = document.getElementById('cameraVideo');
    if (video) {
      video.srcObject = null;
    }
  }

  async storeDocument(document) {
    try {
      // Check storage limits
      if (this.documents.size >= this.maxDocuments) {
        throw new Error(`Maximum ${this.maxDocuments} documents allowed. Please delete some documents first.`);
      }
      
      // Simple encryption (for demo purposes)
      const encryptedData = this.simpleEncrypt(document.imageData);
      
      const storedDocument = {
        ...document,
        imageData: encryptedData,
        originalSize: document.size
      };
      
      // Store in memory
      this.documents.set(document.id, storedDocument);
      
      // Persist to localStorage (with size limit check)
      await this.saveDocuments();
      
      console.log('Document stored successfully:', document.id);
      
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  async saveDocuments() {
    try {
      const documentsData = Array.from(this.documents.entries());
      const serialized = JSON.stringify(documentsData);
      
      // Check if we're approaching localStorage limits
      const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
      if (sizeInMB > 5) { // 5MB limit warning
        console.warn('Document storage approaching 5MB limit');
      }
      
      localStorage.setItem('refugeeDocuments', serialized);
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage full. Please delete some documents to make space.');
      }
      throw error;
    }
  }

  loadDocuments() {
    try {
      const saved = localStorage.getItem('refugeeDocuments');
      if (saved) {
        const documentsData = JSON.parse(saved);
        this.documents = new Map(documentsData);
        console.log(`Loaded ${this.documents.size} documents from storage`);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documents = new Map();
    }
  }

  getDocuments() {
    const result = [];
    
    for (const [id, document] of this.documents) {
      result.push({
        id: document.id,
        type: document.type,
        typeLabel: this.typeLabels[document.type] || document.type,
        timestamp: document.timestamp,
        thumbnail: document.thumbnail,
        size: document.originalSize || document.size,
        encrypted: document.encrypted
      });
    }
    
    // Sort by newest first
    result.sort((a, b) => b.timestamp - a.timestamp);
    
    return result;
  }

  async getDocumentImage(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    try {
      // Decrypt the image data
      const decryptedData = this.simpleDecrypt(document.imageData);
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting document:', error);
      throw new Error('Failed to access document');
    }
  }

  deleteDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }
    
    this.documents.delete(documentId);
    this.saveDocuments();
    
    console.log('Document deleted:', documentId);
    return true;
  }

  exportDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    try {
      const decryptedData = this.simpleDecrypt(document.imageData);
      
      // Create download link
      const link = document.createElement('a');
      link.href = decryptedData;
      link.download = `${document.type}_${new Date(document.timestamp).toISOString().split('T')[0]}.jpg`;
      link.click();
      
    } catch (error) {
      console.error('Error exporting document:', error);
      throw new Error('Failed to export document');
    }
  }

  async backupToAIStation(aiClient) {
    if (!aiClient || !aiClient.isConnected) {
      console.warn('AI station not available for backup');
      return false;
    }
    
    try {
      const documents = this.getDocuments();
      
      for (const doc of documents) {
        const imageData = await this.getDocumentImage(doc.id);
        
        await aiClient.makeRequest('/api/documents/backup', {
          documentId: doc.id,
          type: doc.type,
          timestamp: doc.timestamp,
          imageData: imageData
        });
      }
      
      console.log('Documents backed up to AI station');
      return true;
      
    } catch (error) {
      console.error('Error backing up documents:', error);
      return false;
    }
  }

  // Utility methods
  generateDocumentId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getDataURLSize(dataURL) {
    // Estimate size of data URL
    const base64Length = dataURL.split(',')[1].length;
    return Math.ceil(base64Length * 0.75);
  }

  createThumbnail(imageDataURL) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 120;
      canvas.height = 160;
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      
      img.src = imageDataURL;
      
      return canvas.toDataURL('image/jpeg', 0.6);
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      // Return a default thumbnail
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjQwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOUM5QzlDIi8+Cjx0ZXh0IHg9IjYwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDOUM5QyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RG9jPC90ZXh0Pgo8L3N2Zz4K';
    }
  }

  // Simple encryption/decryption (demo purposes only)
  simpleEncrypt(data) {
    if (!data || !this.encryptionKey) return data;
    
    try {
      // This is a very basic XOR encryption for demo purposes
      // In production, use proper encryption libraries
      const key = this.encryptionKey;
      let result = '';
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      
      return btoa(result); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  simpleDecrypt(encryptedData) {
    if (!encryptedData || !this.encryptionKey) return encryptedData;
    
    try {
      const data = atob(encryptedData); // Base64 decode
      const key = this.encryptionKey;
      let result = '';
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }

  showSuccess(message) {
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(message);
    } else {
      console.log('Success:', message);
    }
  }

  showError(message) {
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(message);
    } else {
      console.error('Error:', message);
    }
  }

  // Data management
  getStorageInfo() {
    const totalDocuments = this.documents.size;
    let totalSize = 0;
    
    for (const document of this.documents.values()) {
      totalSize += document.originalSize || document.size || 0;
    }
    
    return {
      totalDocuments,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxDocuments: this.maxDocuments,
      remainingSlots: this.maxDocuments - totalDocuments
    };
  }

  clearAllDocuments() {
    if (confirm('Are you sure you want to delete ALL documents? This cannot be undone.')) {
      this.documents.clear();
      this.saveDocuments();
      
      if (window.app && typeof window.app.updateDocumentList === 'function') {
        window.app.updateDocumentList();
      }
      
      this.showSuccess('All documents deleted successfully');
    }
  }

  // Check device capabilities
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.HTMLCanvasElement &&
      window.localStorage
    );
  }
}

// Create singleton instance
window.DocumentVault = DocumentVault;