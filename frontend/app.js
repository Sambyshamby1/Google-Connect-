// Refugee Connect Main App
class RefugeeConnectApp {
  constructor() {
    this.currentPage = 'home';
    this.aiConnected = false;
    this.modules = {};
    this.aiClient = null;
    this.capabilities = null;
    this.deferredPrompt = null;
  }

  async initialize() {
    console.log('Initializing Refugee Connect...');
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Initialize modules
    await this.loadModules();
    
    // Set up navigation
    this.setupNavigation();
    
    // Check device capabilities
    this.checkCapabilities();
    
    // Initialize AI connection
    this.initializeAIConnection();
    
    // Set up install prompt
    this.setupInstallPrompt();
    
    // Update battery status
    this.updateBatteryStatus();
    
    // Load saved data
    this.loadSavedData();
    
    // Set initial page
    this.showPage('home');
    
    console.log('Refugee Connect initialized successfully');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('New service worker activated');
              // Optionally show update notification
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async loadModules() {
    // Load all feature modules
    try {
      console.log('Loading modules...');
      
      if (typeof MultimodalAIStationClient !== 'undefined') {
        this.aiClient = new MultimodalAIStationClient();
        this.modules.aiClient = this.aiClient;
        console.log('✓ MultimodalAIStationClient loaded');
      }
      
      if (typeof VirtualKeyboard !== 'undefined') {
        this.modules.virtualKeyboard = new VirtualKeyboard();
        console.log('✓ VirtualKeyboard loaded');
      } else {
        console.error('✗ VirtualKeyboard not found');
      }
      
      if (typeof EmergencyPhrases !== 'undefined') {
        this.modules.emergencyPhrases = new EmergencyPhrases();
        console.log('✓ EmergencyPhrases loaded');
      }
      
      if (typeof DocumentVault !== 'undefined') {
        this.modules.documentVault = new DocumentVault();
        console.log('✓ DocumentVault loaded');
      }
      
      if (typeof MedicalGuide !== 'undefined') {
        this.modules.medicalGuide = new MedicalGuide();
        console.log('✓ MedicalGuide loaded');
      }
      
      if (typeof LegalRights !== 'undefined') {
        this.modules.legalRights = new LegalRights();
        console.log('✓ LegalRights loaded');
      }
      
      if (typeof EmergencyContacts !== 'undefined') {
        this.modules.emergencyContacts = new EmergencyContacts();
        console.log('✓ EmergencyContacts loaded');
      }
      
      if (typeof GemmorandumMultimodal !== 'undefined') {
        this.modules.gemmorandum = new GemmorandumMultimodal();
        console.log('✓ GemmorandumMultimodal loaded');
      } else {
        console.error('✗ GemmorandumMultimodal class not found');
      }
      
      if (typeof DeviceCapabilities !== 'undefined') {
        this.capabilities = new DeviceCapabilities();
        console.log('✓ DeviceCapabilities loaded');
      }
      
      if (typeof GemPath !== 'undefined') {
        this.modules.gemPath = new GemPath();
        // Expose gemPath globally for HTML onclick handlers
        window.gemPath = this.modules.gemPath;
        console.log('✓ GemPath loaded');
      }
      
      // Load Sustainable Living modules
      if (typeof LearnTogether !== 'undefined') {
        this.modules.learnTogether = new LearnTogether();
        console.log('✓ Learn Together loaded');
      }
      
      if (typeof SkillsExchange !== 'undefined') {
        this.modules.skillsExchange = new SkillsExchange();
        console.log('✓ Skills Exchange loaded');
      }
      
      console.log('Module loading complete. Available modules:', Object.keys(this.modules));
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  }

  setupNavigation() {
    // Navigation card clicks
    document.querySelectorAll('.nav-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetPage = card.dataset.page;
        this.showPage(targetPage);
      });
    });

    // Back button clicks
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page || 'home';
        this.showPage(targetPage);
      });
    });

    // Language swap button
    const swapBtn = document.getElementById('swapLanguages');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const fromLang = document.getElementById('fromLanguage');
        const toLang = document.getElementById('toLanguage');
        const temp = fromLang.value;
        fromLang.value = toLang.value;
        toLang.value = temp;
      });
    }

    // Translation button
    const translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
      translateBtn.addEventListener('click', () => this.handleTranslation());
    }

    // Emergency language selector
    const emergencyLang = document.getElementById('emergencyLanguage');
    if (emergencyLang) {
      emergencyLang.addEventListener('change', () => {
        this.updateEmergencyPhrases();
      });
    }

    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.updateEmergencyPhrases();
      });
    });

    // Symptom buttons
    document.querySelectorAll('.symptom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const condition = btn.dataset.condition;
        this.showMedicalAdvice(condition);
      });
    });

    // Rights buttons
    document.querySelectorAll('.rights-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const right = btn.dataset.right;
        this.showLegalRights(right);
      });
    });

    // Document capture
    const captureBtn = document.getElementById('captureDocument');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => this.openDocumentCapture());
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Family search
    const searchBtn = document.getElementById('searchFamilyBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.searchFamily());
    }

    // Keyboard toggle
    const keyboardToggle = document.getElementById('keyboardToggle');
    if (keyboardToggle) {
      keyboardToggle.addEventListener('click', () => this.toggleVirtualKeyboard());
    }

    // Language change listeners for translation page
    const fromLangSelect = document.getElementById('fromLanguage');
    const toLangSelect = document.getElementById('toLanguage');
    if (fromLangSelect) {
      fromLangSelect.addEventListener('change', () => this.setupTranslationPage());
    }
    if (toLangSelect) {
      toLangSelect.addEventListener('change', () => this.setupTranslationPage());
    }

    // Chat functionality
    const sendChatBtn = document.getElementById('sendChatBtn');
    if (sendChatBtn) {
      sendChatBtn.addEventListener('click', () => this.handleChatMessage());
    }

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleChatMessage();
        }
      });
    }

    // Chat keyboard toggle
    const keyboardToggleChat = document.getElementById('keyboardToggleChat');
    if (keyboardToggleChat) {
      keyboardToggleChat.addEventListener('click', () => this.toggleChatKeyboard());
    }
  }

  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageName;

      // Page-specific initialization
      switch (pageName) {
        case 'emergency':
          this.updateEmergencyPhrases();
          break;
        case 'translate':
          this.setupTranslationPage();
          // Small delay to ensure DOM is ready
          setTimeout(() => this.setupTranslationPage(), 100);
          break;
        case 'documents':
          this.updateDocumentList();
          break;
        case 'family':
          this.loadProfile();
          break;
        case 'medical':
          this.hideMedicalAdvice();
          break;
        case 'legal':
          this.hideLegalDetails();
          // Initialize language selector to show current legal rights language
          const legalLanguageSelect = document.getElementById('legalLanguageSelect');
          if (legalLanguageSelect && this.modules.legalRights) {
            legalLanguageSelect.value = this.modules.legalRights.currentLanguage || 'en';
          }
          break;
        case 'chat':
          this.setupChatPage();
          break;
        case 'gemmorandum':
          this.setupGemmorandumPage();
          break;
        case 'gempath':
          this.setupGemPathPage();
          break;
        case 'learn-together':
          this.setupLearnTogetherPage().catch(error => {
            console.error('Error setting up Learn Together page:', error);
            this.showToast('Error loading education page');
          });
          break;
        case 'skills-exchange':
          this.setupSkillsExchangePage();
          break;
      }
    }
  }

  async initializeAIConnection() {
    // Create AI client instance
    this.aiClient = new MultimodalAIStationClient();
    
    try {
      const connected = await this.aiClient.detectStation();
      this.updateAIStatus(connected);
      
      // Set up periodic connection checks
      setInterval(async () => {
        const connected = await this.aiClient.checkConnection();
        this.updateAIStatus(connected);
      }, 30000); // Check every 30 seconds
    } catch (error) {
      console.error('Error initializing AI connection:', error);
      this.updateAIStatus(false);
    }
  }

  updateAIStatus(connected) {
    this.aiConnected = connected;
    const statusElement = document.getElementById('aiStatus');
    if (statusElement) {
      const statusText = statusElement.querySelector('.status-text');
      const statusIcon = statusElement.querySelector('.status-icon');
      
      if (connected) {
        statusText.textContent = 'AI Connected';
        statusIcon.textContent = '🟢';
        statusElement.classList.add('connected');
      } else {
        statusText.textContent = 'Offline';
        statusIcon.textContent = '📡';
        statusElement.classList.remove('connected');
      }
    }
  }

  async updateBatteryStatus() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        const updateBattery = () => {
          const batteryLevel = document.querySelector('.battery-level');
          if (batteryLevel) {
            const level = Math.round(battery.level * 100);
            batteryLevel.textContent = level + '%';
            
            // Update battery icon based on level
            const batteryIcon = document.querySelector('.battery-icon');
            if (battery.charging) {
              batteryIcon.textContent = '🔌';
            } else if (level < 20) {
              batteryIcon.textContent = '🪫';
            } else {
              batteryIcon.textContent = '🔋';
            }
          }
        };
        
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      } catch (error) {
        console.log('Battery API not supported');
      }
    }
  }

  checkCapabilities() {
    if (this.capabilities) {
      const caps = this.capabilities.check();
      console.log('Device capabilities:', caps);
      
      // Adjust features based on capabilities
      if (!caps.camera) {
        const captureBtn = document.getElementById('captureDocument');
        if (captureBtn) {
          captureBtn.disabled = true;
          captureBtn.textContent = 'Camera not available';
        }
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show install prompt after 30 seconds
      setTimeout(() => {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt && this.deferredPrompt) {
          installPrompt.style.display = 'block';
        }
      }, 30000);
    });

    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const result = await this.deferredPrompt.userChoice;
          console.log('Install prompt result:', result);
          this.deferredPrompt = null;
          document.getElementById('installPrompt').style.display = 'none';
        }
      });
    }

    const dismissBtn = document.getElementById('dismissInstall');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        document.getElementById('installPrompt').style.display = 'none';
      });
    }
  }

  // Emergency phrases functionality
  updateEmergencyPhrases() {
    if (!this.modules.emergencyPhrases) return;
    
    const language = document.getElementById('emergencyLanguage').value;
    const activeTab = document.querySelector('.category-tab.active');
    const category = activeTab ? activeTab.dataset.category : 'emergency';
    
    const phrases = this.modules.emergencyPhrases.getPhrases(category, language);
    const container = document.getElementById('phrasesContainer');
    
    if (container) {
      container.innerHTML = '';
      phrases.forEach(phrase => {
        const phraseElement = document.createElement('div');
        phraseElement.className = 'phrase-card';
        phraseElement.innerHTML = `
          <div class="phrase-text">${phrase.text}</div>
          <div class="phrase-original">${phrase.original}</div>
          ${phrase.phonetic ? `<div class="phrase-phonetic">${phrase.phonetic}</div>` : ''}
          <button class="copy-btn" onclick="app.copyPhrase('${phrase.text}')">Copy</button>
        `;
        container.appendChild(phraseElement);
      });
    }
  }

  copyPhrase(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Phrase copied!');
      });
    }
  }

  // Translation functionality
  setupTranslationPage() {
    const fromLang = document.getElementById('fromLanguage').value;
    const keyboardToggle = document.getElementById('keyboardToggle');
    const inputText = document.getElementById('inputText');
    
    // Show/hide virtual keyboard toggle for non-Latin scripts
    if (['ar', 'fa', 'ur', 'ps'].includes(fromLang)) {
      if (keyboardToggle) {
        keyboardToggle.style.display = 'block';
      }
      // Auto-set RTL direction for input
      if (inputText) {
        inputText.dir = 'rtl';
        inputText.style.textAlign = 'right';
      }
    } else {
      if (keyboardToggle) {
        keyboardToggle.style.display = 'none';
      }
      // Reset to LTR for Latin scripts
      if (inputText) {
        inputText.dir = 'ltr';
        inputText.style.textAlign = 'left';
      }
      // Hide keyboard if visible
      const keyboardContainer = document.getElementById('virtualKeyboard');
      if (keyboardContainer) {
        keyboardContainer.style.display = 'none';
      }
    }
  }

  toggleVirtualKeyboard() {
    console.log('Toggle virtual keyboard called');
    console.log('Available modules:', Object.keys(this.modules));
    console.log('VirtualKeyboard module:', this.modules.virtualKeyboard);
    
    if (!this.modules.virtualKeyboard) {
      console.error('Virtual keyboard module not loaded');
      this.showToast('Virtual keyboard not available - check console for details');
      return;
    }
    
    const fromLang = document.getElementById('fromLanguage').value;
    const keyboardContainer = document.getElementById('virtualKeyboard');
    const inputText = document.getElementById('inputText');
    const keyboardBtn = document.querySelector('.keyboard-btn');
    
    if (!keyboardContainer || !inputText) {
      this.showToast('Keyboard elements not found');
      return;
    }
    
    if (keyboardContainer.style.display === 'none' || !keyboardContainer.style.display) {
      // Show keyboard
      console.log('Showing keyboard for language:', fromLang);
      this.modules.virtualKeyboard.show(fromLang, inputText);
      keyboardContainer.style.display = 'block';
      console.log('Keyboard container display set to block');
      console.log('Keyboard container children:', keyboardContainer.children.length);
      if (keyboardBtn) {
        keyboardBtn.textContent = '🔽 Hide Keyboard';
        keyboardBtn.style.background = '#4CAF50';
        keyboardBtn.style.color = 'white';
      }
      // Focus on input for immediate typing
      inputText.focus();
    } else {
      // Hide keyboard
      keyboardContainer.style.display = 'none';
      if (keyboardBtn) {
        keyboardBtn.textContent = '⌨️ Show Keyboard';
        keyboardBtn.style.background = '';
        keyboardBtn.style.color = '';
      }
    }
  }

  async handleTranslation() {
    const inputText = document.getElementById('inputText').value;
    const fromLang = document.getElementById('fromLanguage').value;
    const toLang = document.getElementById('toLanguage').value;
    
    console.log(`🔄 Starting translation: "${inputText}" (${fromLang} → ${toLang})`);
    console.log('🔗 AI Connected:', this.aiConnected, 'AI Client:', !!this.aiClient);
    
    if (!inputText.trim()) {
      this.showToast('Please enter text to translate');
      return;
    }
    
    this.showLoading(true);
    
    // Show a progress message in the output area
    const outputDiv = document.getElementById('translationOutput');
    if (outputDiv) {
      outputDiv.innerHTML = `<p class="processing-message" style="color: blue; font-style: italic;">🔄 AI is processing your translation... This may take up to 15 minutes for complex translations.</p>`;
    }
    
    try {
      if (this.aiConnected && this.aiClient) {
        console.log('📡 Using AI station for translation...');
        // Use AI station for translation
        const result = await this.aiClient.translate(inputText, fromLang, toLang);
        console.log('📨 Translation result received:', result);
        console.log('🎯 About to call displayTranslation...');
        this.displayTranslation(result);
        console.log('✅ displayTranslation called');
      } else {
        console.log('💾 Using cached translation fallback...');
        // Fallback to cached phrases
        const cached = this.getCachedTranslation(inputText, fromLang, toLang);
        if (cached) {
          console.log('✅ Found cached translation:', cached);
          this.displayTranslation(cached);
        } else {
          console.log('❌ No cached translation found, showing offline message');
          this.displayTranslation({
            translation: 'Translation requires AI connection',
            offline: true
          });
        }
      }
    } catch (error) {
      console.error('❌ Translation error:', error);
      this.displayTranslation({
        translation: 'Translation failed. Please try again.',
        error: true
      });
    } finally {
      this.showLoading(false);
    }
  }

  displayTranslation(result) {
    const outputDiv = document.getElementById('translationOutput');
    const adviceDiv = document.getElementById('aiAdvice');
    
    console.log('📄 Displaying translation result:', result);
    console.log('🎯 Output div found:', !!outputDiv);
    console.log('🎯 Output div style display:', outputDiv?.style.display);
    console.log('🎯 Output div parent visible:', outputDiv?.parentElement?.style.display);
    
    if (outputDiv) {
      // Make sure the parent translate page is visible
      const translatePage = document.getElementById('translatePage');
      if (translatePage && !translatePage.classList.contains('active')) {
        console.warn('⚠️ Translate page is not active!');
      }
      
      if (result.translation) {
        outputDiv.innerHTML = `<p class="translation-text" style="color: green; font-weight: bold; padding: 10px; background: #f0f0f0;">${result.translation}</p>`;
        console.log('✅ Translation displayed successfully:', result.translation);
      } else if (result.translated_text) {
        // Fallback: handle direct backend response format
        outputDiv.innerHTML = `<p class="translation-text" style="color: green; font-weight: bold; padding: 10px; background: #f0f0f0;">${result.translated_text}</p>`;
        console.log('✅ Translation displayed (fallback format):', result.translated_text);
      } else if (result.offline) {
        outputDiv.innerHTML = '<p class="offline-message" style="color: orange; font-weight: bold;">AI translation unavailable offline</p>';
      } else if (result.error) {
        outputDiv.innerHTML = '<p class="error-message" style="color: red; font-weight: bold;">Translation failed</p>';
      } else {
        outputDiv.innerHTML = '<p class="error-message" style="color: red; font-weight: bold;">No translation received</p>';
        console.warn('⚠️ No translation data in result:', result);
      }
      
      // Force a scroll to the output
      outputDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } else {
      console.error('❌ translationOutput element not found!');
      // Let's try to show the result in a toast as backup
      if (result.translation) {
        this.showToast(`Translation: ${result.translation}`);
      } else if (result.translated_text) {
        this.showToast(`Translation: ${result.translated_text}`);
      }
    }
    
    if (adviceDiv && result.advice) {
      document.getElementById('adviceContent').textContent = result.advice;
      adviceDiv.style.display = 'block';
    } else if (adviceDiv) {
      adviceDiv.style.display = 'none';
    }
  }

  getCachedTranslation(text, fromLang, toLang) {
    // Simple cached translations for critical phrases
    const cache = {
      'help': { ar: 'مساعدة', en: 'Help' },
      'مساعدة': { en: 'Help', ar: 'مساعدة' },
      'doctor': { ar: 'طبيب', en: 'Doctor' },
      'طبيب': { en: 'Doctor', ar: 'طبيب' }
    };
    
    const normalized = text.toLowerCase().trim();
    if (cache[normalized] && cache[normalized][toLang]) {
      return { translation: cache[normalized][toLang] };
    }
    
    return null;
  }

  // Document vault functionality
  openDocumentCapture() {
    if (!this.modules.documentVault) return;
    
    const modal = document.getElementById('cameraModal');
    if (modal) {
      modal.style.display = 'flex';
      this.modules.documentVault.startCamera();
    }
  }

  updateDocumentList() {
    if (!this.modules.documentVault) return;
    
    const documents = this.modules.documentVault.getDocuments();
    const listContainer = document.getElementById('documentList');
    
    if (listContainer) {
      if (documents.length === 0) {
        listContainer.innerHTML = '<p class="empty-message">No documents stored yet. Tap the camera button to add important documents.</p>';
      } else {
        listContainer.innerHTML = '';
        documents.forEach(doc => {
          const docElement = document.createElement('div');
          docElement.className = 'document-item';
          docElement.innerHTML = `
            <img src="${doc.thumbnail}" alt="${doc.type}" class="document-thumbnail">
            <div class="document-info">
              <h4>${doc.type.replace('_', ' ')}</h4>
              <p>${new Date(doc.timestamp).toLocaleDateString()}</p>
            </div>
            <button class="delete-btn" onclick="app.deleteDocument('${doc.id}')">Delete</button>
          `;
          listContainer.appendChild(docElement);
        });
      }
    }
  }

  deleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.modules.documentVault.deleteDocument(docId);
      this.updateDocumentList();
    }
  }

  // Medical guide functionality
  showMedicalAdvice(condition) {
    if (!this.modules.medicalGuide) return;
    
    const advice = this.modules.medicalGuide.getAdvice(condition);
    const adviceDiv = document.getElementById('medicalAdvice');
    
    if (adviceDiv && advice) {
      // Build the advice content HTML
      let adviceContent = '<div class="advice-sections">';
      
      // Show different advice levels based on condition
      if (advice.advice.immediate) {
        adviceContent += `
          <div class="advice-immediate">
            <h4>🚨 Immediate Action:</h4>
            <p class="immediate-advice">${advice.advice.immediate}</p>
          </div>
        `;
      }
      
      if (advice.advice.mild) {
        adviceContent += `
          <div class="advice-mild">
            <h4>💡 General Care:</h4>
            <p class="mild-advice">${advice.advice.mild}</p>
          </div>
        `;
      }
      
      if (advice.advice.urgent) {
        adviceContent += `
          <div class="advice-urgent">
            <h4>⚠️ When to Seek Help:</h4>
            <p class="urgent-advice">${advice.advice.urgent}</p>
          </div>
        `;
      }
      
      if (advice.advice.routine) {
        adviceContent += `
          <div class="advice-routine">
            <h4>📋 Routine Care:</h4>
            <p class="routine-advice">${advice.advice.routine}</p>
          </div>
        `;
      }
      
      adviceContent += '</div>';
      
      // Show urgent conditions if any
      let urgentConditions = '';
      if (advice.urgentIf && advice.urgentIf.length > 0) {
        urgentConditions = `
          <div class="urgent-conditions">
            <h4>🚩 Seek immediate help if you have:</h4>
            <ul>${advice.urgentIf.map(condition => `<li>${condition}</li>`).join('')}</ul>
          </div>
        `;
      }
      
      adviceDiv.innerHTML = `
        <div class="advice-header">
          <h3>${advice.icon} ${advice.title}</h3>
          <button class="close-advice" onclick="app.hideMedicalAdvice()">✕</button>
        </div>
        <div class="symptoms">
          <h4>🔍 Common Symptoms:</h4>
          <ul>${advice.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        ${adviceContent}
        ${urgentConditions}
        ${advice.urgent ? '<div class="urgent-warning">⚠️ This condition requires immediate medical attention!</div>' : ''}
        <div class="medical-disclaimer">
          <p><small>⚕️ This guidance is for informational purposes only and does not replace professional medical advice. Seek qualified medical help when available.</small></p>
        </div>
      `;
      adviceDiv.style.display = 'block';
    }
  }

  hideMedicalAdvice() {
    const adviceDiv = document.getElementById('medicalAdvice');
    if (adviceDiv) {
      adviceDiv.style.display = 'none';
    }
  }

  // Legal rights functionality
  setLegalLanguage(language) {
    if (this.modules.legalRights) {
      this.modules.legalRights.setLanguage(language);
      // Hide any currently displayed details so they'll refresh with new language
      const detailsDiv = document.getElementById('rightsDetails');
      if (detailsDiv) {
        detailsDiv.style.display = 'none';
      }
    }
  }

  showLegalRights(rightType) {
    if (!this.modules.legalRights) return;
    
    // Handle the legal_aid -> legal key mapping
    const mappedRightType = rightType === 'legal_aid' ? 'legal' : rightType;
    
    const rights = this.modules.legalRights.getRights(mappedRightType);
    const detailsDiv = document.getElementById('rightsDetails');
    
    if (detailsDiv && rights) {
      // Get language from the legal rights module's current language
      const language = this.modules.legalRights.currentLanguage || 'en';
      const content = rights.content[language] || rights.content.en;
      
      // Build the content HTML from the structured data
      let contentHTML = '';
      
      if (typeof content === 'object') {
        // Handle structured content
        if (content.summary) {
          contentHTML += `<div class="rights-summary">${content.summary}</div>`;
        }
        
        if (content.tips && content.tips.length > 0) {
          contentHTML += `
            <div class="rights-tips">
              <strong>Important Tips:</strong>
              <ul>
                ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        if (content.warning) {
          contentHTML += `
            <div class="rights-warning">
              <strong>⚠️ Watch Out:</strong> ${content.warning}
            </div>
          `;
        }
        
        if (content.phonetic) {
          contentHTML += `
            <div class="rights-phonetic">
              <strong>🗣️ How to say it:</strong> ${content.phonetic}
            </div>
          `;
        }
      } else {
        // Fallback for simple string content
        contentHTML = content;
      }
      
      detailsDiv.innerHTML = `
        <div class="rights-header">
          <h3>${rights.icon || ''} ${rights.title}</h3>
          <button class="close-rights" onclick="app.hideLegalDetails()">✕</button>
        </div>
        <div class="rights-content">
          ${contentHTML}
        </div>
        <div class="rights-actions">
          <button onclick="app.copyRights('${rightType}')">📋 Copy Text</button>
          <button onclick="app.shareRights('${rightType}')">📤 Share</button>
        </div>
        <div class="rights-disclaimer">
          <p><small>⚖️ This information is for general guidance only. Laws vary by location. Always seek specific legal advice for your situation from qualified professionals.</small></p>
        </div>
      `;
      detailsDiv.style.display = 'block';
    }
  }

  hideLegalDetails() {
    const detailsDiv = document.getElementById('rightsDetails');
    if (detailsDiv) {
      detailsDiv.style.display = 'none';
    }
  }

  copyRights(rightType) {
    if (!this.modules.legalRights) return;
    
    // Handle the legal_aid -> legal key mapping
    const mappedRightType = rightType === 'legal_aid' ? 'legal' : rightType;
    
    const rights = this.modules.legalRights.getRights(mappedRightType);
    const language = this.modules.legalRights.currentLanguage || 'en';
    const content = rights.content[language] || rights.content.en;
    
    let text = '';
    
    if (typeof content === 'object') {
      // Format structured content as plain text
      text = `${rights.title}\n\n`;
      
      if (content.summary) {
        text += `${content.summary}\n\n`;
      }
      
      if (content.tips && content.tips.length > 0) {
        text += 'Important Tips:\n';
        content.tips.forEach(tip => {
          text += `• ${tip}\n`;
        });
        text += '\n';
      }
      
      if (content.warning) {
        text += `⚠️ Warning: ${content.warning}\n\n`;
      }
      
      if (content.phonetic) {
        text += `How to say it: ${content.phonetic}\n`;
      }
    } else {
      // Fallback for simple string content
      text = content;
    }
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Rights information copied!');
      });
    }
  }

  shareRights(rightType) {
    if (!this.modules.legalRights) return;
    
    // Handle the legal_aid -> legal key mapping
    const mappedRightType = rightType === 'legal_aid' ? 'legal' : rightType;
    
    const rights = this.modules.legalRights.getRights(mappedRightType);
    const language = this.modules.legalRights.currentLanguage || 'en';
    const content = rights.content[language] || rights.content.en;
    
    let text = '';
    
    if (typeof content === 'object') {
      // Format structured content as plain text for sharing
      text = `${rights.title}\n\n`;
      
      if (content.summary) {
        text += `${content.summary}\n\n`;
      }
      
      if (content.tips && content.tips.length > 0) {
        text += 'Important Tips:\n';
        content.tips.forEach(tip => {
          text += `• ${tip}\n`;
        });
        text += '\n';
      }
      
      if (content.warning) {
        text += `⚠️ Warning: ${content.warning}\n\n`;
      }
      
      if (content.phonetic) {
        text += `How to say it: ${content.phonetic}\n`;
      }
    } else {
      // Fallback for simple string content
      text = content;
    }
    
    if (navigator.share) {
      navigator.share({
        title: rights.title,
        text: text
      });
    }
  }

  // Family search functionality
  saveProfile() {
    const profile = {
      name: document.getElementById('profileName').value,
      origin: document.getElementById('profileOrigin').value,
      location: document.getElementById('profileLocation').value,
      family: document.getElementById('profileFamily').value,
      timestamp: Date.now()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    this.showToast('Profile saved successfully');
    
    // Sync with AI station if connected
    if (this.aiConnected && this.aiClient) {
      this.aiClient.syncProfile(profile);
    }
  }

  loadProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const profile = JSON.parse(saved);
      document.getElementById('profileName').value = profile.name || '';
      document.getElementById('profileOrigin').value = profile.origin || '';
      document.getElementById('profileLocation').value = profile.location || '';
      document.getElementById('profileFamily').value = profile.family || '';
    }
  }

  async searchFamily() {
    const query = document.getElementById('familySearch').value;
    if (!query.trim()) {
      this.showToast('Please enter search terms');
      return;
    }
    
    this.showLoading(true);
    const resultsDiv = document.getElementById('searchResults');
    
    try {
      let results = [];
      
      if (this.aiConnected && this.aiClient) {
        results = await this.aiClient.searchFamily(query);
      } else {
        // Search local storage only
        const localProfiles = this.getLocalFamilyProfiles();
        results = localProfiles.filter(p => 
          p.name.includes(query) || 
          p.origin.includes(query) || 
          p.location.includes(query)
        );
      }
      
      if (resultsDiv) {
        if (results.length === 0) {
          resultsDiv.innerHTML = '<p class="no-results">No matches found. Try different search terms.</p>';
        } else {
          resultsDiv.innerHTML = results.map(result => `
            <div class="search-result">
              <h4>${result.name}</h4>
              <p>From: ${result.origin}</p>
              <p>Currently: ${result.location}</p>
              ${result.contact ? `<p>Contact: ${result.contact}</p>` : ''}
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Family search error:', error);
      if (resultsDiv) {
        resultsDiv.innerHTML = '<p class="error-message">Search failed. Please try again.</p>';
      }
    } finally {
      this.showLoading(false);
    }
  }

  getLocalFamilyProfiles() {
    // In a real app, this would query IndexedDB
    return JSON.parse(localStorage.getItem('familyProfiles') || '[]');
  }

  // Utility functions
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  setupChatPage() {
    // Clear previous chat response
    const chatResponse = document.getElementById('chatResponse');
    if (chatResponse) {
      chatResponse.style.display = 'none';
    }
    
    // Focus on chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.focus();
    }
  }

  async handleChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) {
      this.showToast('Please enter a message');
      return;
    }
    
    this.showLoading(true);
    
    try {
      if (this.aiConnected && this.aiClient) {
        // Use AI station for chat
        const result = await this.aiClient.chatWithGemma(message);
        this.displayChatResponse(result);
        
        // Clear input after successful response
        chatInput.value = '';
      } else {
        this.displayChatResponse({
          response: 'Chat requires AI connection. Please wait for AI station to connect or use offline features.',
          language_detected: 'en',
          offline: true
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.displayChatResponse({
        response: 'Unable to connect to Gemma. Please try again later.',
        error: error.message,
        offline: true
      });
    }
    
    this.showLoading(false);
  }

  displayChatResponse(data) {
    const chatResponse = document.getElementById('chatResponse');
    const responseContent = document.getElementById('chatResponseContent');
    const detectedLanguage = document.getElementById('detectedLanguage');
    const responseTime = document.getElementById('chatResponseTime');
    
    if (chatResponse && responseContent) {
      // Update content
      responseContent.innerHTML = data.response.replace(/\n/g, '<br>');
      
      // Update language badge
      if (detectedLanguage && data.language_detected) {
        const languageNames = {
          'ar': 'Arabic',
          'fa': 'Persian',
          'en': 'English',
          'fr': 'French',
          'es': 'Spanish',
          'ur': 'Urdu',
          'ps': 'Pashto'
        };
        detectedLanguage.textContent = languageNames[data.language_detected] || data.language_detected;
      }
      
      // Update response time
      if (responseTime && data.response_time_ms) {
        responseTime.textContent = `(${Math.round(data.response_time_ms / 1000)}s)`;
      }
      
      // Show response
      chatResponse.style.display = 'block';
      
      // Scroll to response
      chatResponse.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleChatKeyboard() {
    const keyboardContainer = document.getElementById('keyboardContainerChat');
    const keyboardBtn = document.getElementById('keyboardToggleChat');
    const chatInput = document.getElementById('chatInput');
    
    if (keyboardContainer.style.display === 'none' || !keyboardContainer.style.display) {
      // Show keyboard
      if (this.modules.virtualKeyboard) {
        this.modules.virtualKeyboard.showKeyboard(keyboardContainer, chatInput);
      }
      keyboardContainer.style.display = 'block';
      if (keyboardBtn) {
        keyboardBtn.textContent = '🔽 Hide Keyboard';
        keyboardBtn.style.background = '#4CAF50';
        keyboardBtn.style.color = 'white';
      }
      // Focus on input for immediate typing
      chatInput.focus();
    } else {
      // Hide keyboard
      keyboardContainer.style.display = 'none';
      if (keyboardBtn) {
        keyboardBtn.textContent = '⌨️ Show Keyboard';
        keyboardBtn.style.background = '';
        keyboardBtn.style.color = '';
      }
    }
  }

  setupGemmorandumPage() {
    // Initialize Gemmorandum module if available
    if (this.modules.gemmorandum) {
      this.modules.gemmorandum.initialize();
    }
    
    // Set up AI client reference for Gemmorandum
    if (this.modules.gemmorandum && this.aiClient) {
      this.modules.gemmorandum.aiClient = this.aiClient;
    }
  }

  setupGemPathPage() {
    // Initialize GemPath module if available
    if (this.modules.gemPath) {
      // Set up AI client reference for GemPath
      this.modules.gemPath.setAIClient(this.aiClient);
      
      // Load saved sessions
      this.loadGemPathSessions();
    }
  }

  loadGemPathSessions() {
    // Load and display saved interview sessions
    if (this.modules.gemPath) {
      const sessions = JSON.parse(localStorage.getItem('gempath_sessions') || '[]');
      const sessionsList = document.getElementById('gemPathSessionsList');
      
      if (sessionsList) {
        if (sessions.length === 0) {
          sessionsList.innerHTML = '<p class="empty-message">No interview sessions yet. Start an interview to begin.</p>';
        } else {
          sessionsList.innerHTML = sessions.map(session => `
            <div class="session-card">
              <h4>Session ${session.sessionId}</h4>
              <p><strong>Language:</strong> ${session.language}</p>
              <p><strong>Date:</strong> ${new Date(session.timestamp).toLocaleDateString()}</p>
              <p><strong>Responses:</strong> ${session.responses?.length || 0}</p>
              <p><strong>Status:</strong> ${session.analysis ? 'Analyzed' : 'Pending Analysis'}</p>
            </div>
          `).join('');
        }
      }
    }
  }

  async setupLearnTogetherPage() {
    // Initialize Learn Together module if available
    if (this.modules.learnTogether) {
      // Set up AI client reference
      this.modules.learnTogether.setAIClient(this.aiClient);
      
      // Set current language
      const currentLang = localStorage.getItem('preferredLanguage') || 'en';
      this.modules.learnTogether.setLanguage(currentLang);
      
      // Update age group info
      this.updateAgeGroupInfo();
      
      // Load available subjects (now async)
      await this.loadEducationSubjects();
    }
  }

  setupSkillsExchangePage() {
    // Initialize Skills Exchange module if available
    if (this.modules.skillsExchange) {
      // Set up AI client reference
      this.modules.skillsExchange.setAIClient(this.aiClient);
      
      // Set current language
      const currentLang = localStorage.getItem('preferredLanguage') || 'en';
      this.modules.skillsExchange.setLanguage(currentLang);
      
      // Load discovered skills if any
      this.loadDiscoveredSkills();
      
      // Load registration status
      this.loadRegistrationStatus();
    }
  }

  async loadEducationSubjects() {
    // Load available subjects for education
    if (this.modules.learnTogether) {
      // Show loading state
      this.showSubjectsLoading(true);
      
      // Wait for curriculum to load with timeout
      const timeout = 5000; // 5 seconds
      const startTime = Date.now();
      
      while (!this.modules.learnTogether.curriculum && 
             (Date.now() - startTime) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!this.modules.learnTogether.curriculum) {
        this.showSubjectsError();
        // Try to load fallback curriculum
        this.modules.learnTogether.curriculum = this.modules.learnTogether.getFallbackCurriculum();
        console.warn('Using fallback curriculum due to loading timeout');
      }
      
      // Load subjects normally
      const currentAge = this.getCurrentChildAge();
      const subjects = this.modules.learnTogether.getAvailableSubjects(currentAge);
      
      // Render subjects
      this.renderSubjects(subjects, currentAge);
      this.showSubjectsLoading(false);
    }
  }

  renderSubjects(subjects, currentAge) {
    const subjectsContainer = document.getElementById('educationSubjects');
    if (subjectsContainer) {
      if (subjects.length > 0) {
        subjectsContainer.innerHTML = subjects.map(subject => `
          <div class="subject-card" onclick="app.selectSubject('${subject.key}', ${currentAge})">
            <div class="subject-icon">${subject.icon}</div>
            <div class="subject-name">${subject.name}</div>
            <div class="subject-progress">Week ${subject.progress.currentWeek}</div>
          </div>
        `).join('');
      } else {
        subjectsContainer.innerHTML = '<p class="no-subjects">No subjects available for this age group.</p>';
      }
    }
  }

  showSubjectsLoading(show) {
    const loader = document.getElementById('subjectsLoading');
    const container = document.getElementById('educationSubjects');
    const errorDiv = document.getElementById('subjectsError');
    
    if (loader) loader.style.display = show ? 'block' : 'none';
    if (container) container.style.display = show ? 'none' : 'block';
    if (errorDiv && !show) errorDiv.style.display = 'none';
  }

  showSubjectsError() {
    const errorDiv = document.getElementById('subjectsError');
    if (errorDiv) errorDiv.style.display = 'block';
  }

  getCurrentChildAge() {
    // Get current child age from UI or default to 7
    const ageSelector = document.getElementById('childAge');
    return ageSelector ? parseInt(ageSelector.value) : 7;
  }

  updateAgeGroupInfo() {
    const age = this.getCurrentChildAge();
    const ageGroupInfo = document.getElementById('ageGroupInfo');
    if (ageGroupInfo) {
      let groupText = '';
      if (age <= 5) {
        groupText = 'Age Group: 3-5 years (Early Learning)';
      } else if (age <= 7) {
        groupText = 'Age Group: 5-7 years (Foundation)';
      } else {
        groupText = 'Age Group: 7-10 years (Advanced)';
      }
      ageGroupInfo.textContent = groupText;
    }
  }

  loadDiscoveredSkills() {
    // Load previously discovered skills
    if (this.modules.skillsExchange) {
      const discovered = this.modules.skillsExchange.getDiscoveredSkills();
      const skillsContainer = document.getElementById('discoveredSkills');
      
      if (skillsContainer) {
        if (discovered.discovered.length > 0) {
          skillsContainer.innerHTML = `
            <h3>Your Discovered Skills</h3>
            <div class="skills-list">
              ${discovered.discovered.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            ${discovered.highDemand.length > 0 ? `
              <h4>High Demand Skills</h4>
              <div class="skills-list high-demand">
                ${discovered.highDemand.map(skill => `<span class="skill-tag high-demand">${skill}</span>`).join('')}
              </div>
            ` : ''}
            ${discovered.suggestions ? `<p class="suggestions">${discovered.suggestions}</p>` : ''}
          `;
        } else {
          skillsContainer.innerHTML = '<p class="empty-message">No skills discovered yet. Start the discovery process to find your valuable skills.</p>';
        }
      }
    }
  }

  loadRegistrationStatus() {
    // Load registration status
    if (this.modules.skillsExchange) {
      const status = this.modules.skillsExchange.getRegistrationStatus();
      const statusContainer = document.getElementById('registrationStatus');
      
      if (statusContainer) {
        if (status.registered) {
          statusContainer.innerHTML = `
            <div class="registration-status ${status.status}">
              <h4>Registration Status: ${status.status.replace('_', ' ')}</h4>
              <p>Skills: ${status.skills.join(', ')}</p>
              <p>Availability: ${status.availability.join(', ')}</p>
              <p>Registration ID: ${status.registrationId}</p>
            </div>
          `;
        } else {
          statusContainer.innerHTML = '<p class="empty-message">No skills registered yet.</p>';
        }
      }
    }
  }

  // Education module interactions
  selectSubject(subjectKey, childAge) {
    if (this.modules.learnTogether) {
      const lesson = this.modules.learnTogether.getCurrentLesson(childAge, subjectKey);
      this.displayCurrentLesson(lesson, subjectKey, childAge);
    }
  }

  displayCurrentLesson(lesson, subjectKey, childAge) {
    const lessonContainer = document.getElementById('currentLesson');
    if (lessonContainer && lesson) {
      if (lesson.completed) {
        lessonContainer.innerHTML = `
          <div class="lesson-completed">
            <h3>${lesson.message}</h3>
            ${lesson.nextLevel ? `<p>Ready for ${lesson.nextLevel} level!</p>` : ''}
          </div>
        `;
      } else {
        // Build content sections if available
        let contentHtml = '';
        if (lesson.content) {
          contentHtml = `
            <div class="lesson-introduction">
              <p>${lesson.content.introduction || ''}</p>
            </div>
            
            ${lesson.content.steps ? `
              <div class="lesson-steps">
                <h4>Steps to Follow:</h4>
                <ol>${lesson.content.steps.map(step => `<li>${step}</li>`).join('')}</ol>
              </div>
            ` : ''}
            
            ${lesson.content.games ? `
              <div class="lesson-games">
                <h4>Fun Games to Play:</h4>
                <ul>${lesson.content.games.map(game => `<li>${game}</li>`).join('')}</ul>
              </div>
            ` : ''}
            
            ${lesson.content.tips ? `
              <div class="lesson-tips">
                <h4>Teaching Tips:</h4>
                <ul>${lesson.content.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
              </div>
            ` : ''}
          `;
        }
        
        lessonContainer.innerHTML = `
          <div class="lesson-content">
            <h3>${lesson.topic}</h3>
            ${contentHtml}
            <div class="lesson-objectives">
              <h4>Learning Goals:</h4>
              <ul>${lesson.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
            </div>
            <div class="lesson-activities">
              <h4>Activities:</h4>
              <ul>${lesson.activities.map(act => `<li>${act}</li>`).join('')}</ul>
            </div>
            <div class="lesson-materials">
              <h4>Materials Needed:</h4>
              <p>${lesson.materials}</p>
            </div>
            
            <!-- Ask Gemma Section -->
            <div class="ask-gemma-section">
              <h4>🤖 Ask Gemma for Help</h4>
              <div class="ask-gemma-form">
                <textarea id="gemmaQuestion" placeholder="What would you like help with? For example: 'How do I make counting fun?' or 'My child gets frustrated with numbers'" rows="3"></textarea>
                <button onclick="app.askGemmaForHelp('${subjectKey}', '${lesson.topic}', ${childAge}, ${lesson.week})" class="ask-gemma-btn">Ask Gemma</button>
              </div>
              <div id="gemmaResponse" class="gemma-response" style="display: none;"></div>
            </div>
            
            <div class="lesson-actions">
              <button onclick="app.markLessonComplete(${childAge}, '${subjectKey}', ${lesson.week})" class="complete-btn">✓ Mark Complete</button>
            </div>
          </div>
        `;
      }
      
      // Show the lesson container
      lessonContainer.style.display = 'block';
      
      // Scroll to lesson
      lessonContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  async askGemmaForHelp(subject, topic, age, week) {
    const questionInput = document.getElementById('gemmaQuestion');
    const question = questionInput?.value?.trim();
    
    if (!question) {
      this.showToast('Please enter a question for Gemma');
      return;
    }

    this.showLoading(true);
    const responseDiv = document.getElementById('gemmaResponse');
    
    try {
      if (this.modules.learnTogether) {
        // Build lesson context for better AI response
        const lessonId = `${subject}_age${this.getAgeGroupForAge(age)}_week${week}`;
        const lessonContext = {
          subject: subject,
          topic: topic,
          age: age,
          week: week
        };
        
        const help = await this.modules.learnTogether.getContextualHelp(lessonId, question, lessonContext);
        
        if (responseDiv) {
          responseDiv.innerHTML = `
            <div class="gemma-help-response ${help.cached ? 'cached' : ''} ${help.offline ? 'offline' : ''}">
              <div class="gemma-avatar">🤖 Gemma says:</div>
              <div class="gemma-message">${help.response || help.suggestions?.join('<br>') || 'I can help you when connected to an AI station.'}</div>
              ${help.cached ? '<div class="cache-note">📱 From saved responses</div>' : ''}
              ${help.offline ? '<div class="offline-note">📡 Connect to AI station for personalized help</div>' : ''}
            </div>
          `;
          responseDiv.style.display = 'block';
          
          // Clear the question input
          questionInput.value = '';
        }
      }
    } catch (error) {
      this.showToast('Unable to get help right now. Please try again.');
      if (responseDiv) {
        responseDiv.innerHTML = `
          <div class="gemma-help-response error">
            <div class="gemma-avatar">🤖</div>
            <div class="gemma-message">I'm having trouble connecting. Here are some general tips:
              <ul>
                <li>Make learning fun with games and songs</li>
                <li>Use objects your child can touch and count</li>
                <li>Practice a little bit every day</li>
                <li>Celebrate small successes</li>
              </ul>
            </div>
          </div>
        `;
        responseDiv.style.display = 'block';
      }
    } finally {
      this.showLoading(false);
    }
  }

  getAgeGroupForAge(age) {
    if (age <= 5) return '3_5';
    if (age <= 7) return '5_7';
    return '7_10';
  }

  displayTeachingHelp(help) {
    const helpContainer = document.getElementById('teachingHelp');
    if (helpContainer) {
      helpContainer.innerHTML = `
        <div class="teaching-help ${help.cached ? 'cached' : ''} ${help.offline ? 'offline' : ''}">
          <h4>Teaching Help ${help.cached ? '(From Cache)' : ''}</h4>
          <div class="help-response">${help.response || 'No response available'}</div>
          ${help.suggestions ? `
            <div class="help-suggestions">
              <h5>Offline Suggestions:</h5>
              <ul>${help.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>
      `;
      helpContainer.style.display = 'block';
    }
  }

  markLessonComplete(childAge, subject, week) {
    if (this.modules.learnTogether) {
      const result = this.modules.learnTogether.markLessonComplete(childAge, subject, week);
      if (result.congratulations) {
        this.showToast(result.message);
        // Refresh the lesson display
        setTimeout(() => {
          this.selectSubject(subject, childAge);
        }, 1000);
      }
    }
  }

  // Skills exchange interactions
  async startSkillsDiscovery() {
    this.showLoading(true);
    
    try {
      if (this.modules.skillsExchange) {
        const discovery = await this.modules.skillsExchange.discoverSkills();
        this.handleDiscoveryResult(discovery);
      }
    } catch (error) {
      this.showToast('Failed to start skills discovery. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  handleDiscoveryResult(discovery) {
    const discoveryContainer = document.getElementById('skillsDiscovery');
    if (discoveryContainer) {
      if (discovery.error) {
        discoveryContainer.innerHTML = `
          <div class="discovery-error">
            <p>${discovery.error}</p>
            ${discovery.offline ? '<p>Connect to an AI station to discover your skills.</p>' : ''}
          </div>
        `;
      } else {
        const offlineNote = discovery.offlineMode ? '<div class="offline-note">📱 Working offline - basic skills analysis will be provided</div>' : '';
        
        discoveryContainer.innerHTML = `
          <div class="discovery-conversation">
            <div class="opening">${discovery.opening}</div>
            ${offlineNote}
            <div class="current-prompt" id="currentPrompt">${discovery.prompts[0]}</div>
            <input type="text" id="discoveryResponse" placeholder="Your answer...">
            <button onclick="app.continueDiscovery('${discovery.conversationId}')">Continue</button>
            <div class="progress">Question 1 of ${discovery.prompts.length}</div>
          </div>
        `;
      }
    }
  }

  async continueDiscovery(conversationId) {
    const response = document.getElementById('discoveryResponse')?.value;
    if (!response) {
      this.showToast('Please provide an answer before continuing.');
      return;
    }

    this.showLoading(true);
    
    try {
      if (this.modules.skillsExchange) {
        const result = await this.modules.skillsExchange.continueDiscovery(conversationId, response);
        this.handleDiscoveryContinuation(result);
      }
    } catch (error) {
      this.showToast('Failed to continue discovery. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  handleDiscoveryContinuation(result) {
    if (result.error) {
      this.showToast(result.error);
      
      // If conversation needs restart, show restart button
      if (result.needsRestart) {
        const discoveryContainer = document.getElementById('skillsDiscovery');
        if (discoveryContainer) {
          discoveryContainer.innerHTML = `
            <div class="discovery-error">
              <p>${result.error}</p>
              <button class="primary-btn" onclick="app.startSkillsDiscovery()">Restart Discovery</button>
            </div>
          `;
        }
      }
      return;
    }

    const discoveryContainer = document.getElementById('skillsDiscovery');
    if (result.completed) {
      // Discovery completed, show results
      const fallbackNote = result.fallback ? '<p><em>Note: Analysis performed offline due to AI connection issues.</em></p>' : '';
      
      discoveryContainer.innerHTML = `
        <div class="discovery-results">
          <h3>Skills Discovery Complete!</h3>
          ${fallbackNote}
          <div class="discovered-skills">
            <h4>Your Skills:</h4>
            <div class="skills-list">
              ${result.analysis.discovered.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          ${result.analysis.highDemand && result.analysis.highDemand.length > 0 ? `
            <div class="high-demand-skills">
              <h4>High Demand Skills:</h4>
              <div class="skills-list high-demand">
                ${result.analysis.highDemand.map(skill => `<span class="skill-tag high-demand">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          <div class="suggestions">${result.analysis.suggestions}</div>
          <button onclick="app.loadDiscoveredSkills()">View All Skills</button>
        </div>
      `;
    } else {
      // Continue with next question
      discoveryContainer.innerHTML = `
        <div class="discovery-conversation">
          <div class="current-prompt" id="currentPrompt">${result.nextPrompt}</div>
          <input type="text" id="discoveryResponse" placeholder="Your answer...">
          <button onclick="app.continueDiscovery('${result.conversationId || 'current'}')">Continue</button>
          <div class="progress">Question ${result.currentPromptIndex + 1} of ${result.totalPrompts}</div>
        </div>
      `;
    }
  }

  // Community skills search
  async searchCommunitySkills() {
    const category = document.getElementById('skillCategory')?.value;
    const description = document.getElementById('skillDescription')?.value;
    
    if (!category && !description) {
      this.showToast('Please select a category or enter a description');
      return;
    }

    this.showLoading(true);
    
    try {
      if (this.modules.skillsExchange) {
        const results = await this.modules.skillsExchange.searchSkills(category, description);
        this.displaySkillsSearchResults(results);
      }
    } catch (error) {
      this.showToast('Skills search failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  displaySkillsSearchResults(searchResults) {
    const resultsContainer = document.getElementById('skillsSearchResults');
    if (resultsContainer) {
      if (searchResults.error) {
        resultsContainer.innerHTML = `
          <div class="search-error">
            <p>${searchResults.error}</p>
            ${searchResults.offline ? '<p>Connect to an AI station to search for community skills.</p>' : ''}
          </div>
        `;
      } else if (searchResults.results && searchResults.results.length > 0) {
        resultsContainer.innerHTML = `
          <div class="search-results">
            <h4>Found ${searchResults.totalFound} matches</h4>
            <div class="results-list">
              ${searchResults.results.map(result => `
                <div class="result-card">
                  <h5>${result.skills.join(', ')}</h5>
                  <p><strong>Available:</strong> ${result.availability.join(', ')}</p>
                  <p><strong>Station:</strong> ${result.station}</p>
                  ${result.verified ? '<span class="verified-badge">✓ Verified</span>' : '<span class="pending-badge">⏳ Pending</span>'}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>No matches found for your search. Try different keywords or check back later.</p>
          </div>
        `;
      }
    }
  }

  loadSavedData() {
    // Load any saved preferences
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      const langSelectors = document.querySelectorAll('.language-dropdown');
      langSelectors.forEach(selector => {
        if (selector.id === 'toLanguage') {
          selector.value = 'en'; // Default translation target
        } else {
          selector.value = savedLang;
        }
      });
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RefugeeConnectApp();
  window.app.initialize();
});