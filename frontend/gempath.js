/**
 * GemPath - Family Reunification System
 * Integrates with Refugee Connect for comprehensive humanitarian assistance
 */

class GemPath {
    constructor() {
        this.aiClient = null;
        this.currentSession = null;
        this.questionBank = null;
        this.currentLanguage = 'en';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.responses = [];
        this.currentQuestionIndex = 0;
        this.sessionId = null;
        
        // Storage for offline functionality
        this.storageName = 'gempath_sessions';
        this.profilesStorageName = 'gempath_profiles';
        
        this.initialize();
    }
    
    async initialize() {
        console.log('Initializing GemPath module...');
        
        // Load question bank
        await this.loadQuestionBank();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize storage
        this.initializeStorage();
        
        console.log('✓ GemPath module initialized');
    }
    
    async loadQuestionBank() {
        // Load question bank structure
        this.questionBank = {
            core_questions: [
                'Q001', 'Q002', 'Q003', 'Q004', 'Q005',
                'Q007', 'Q008', 'Q009', 'Q011', 'Q012',
                'Q015', 'Q016', 'Q018', 'Q019', 'Q020'
            ],
            questions: {
                'Q001': {
                    category: 'opening',
                    text: {
                        en: "Hello, I help children find families. Are you looking for someone?",
                        ar: "مرحباً، أنا أساعد الأطفال في العثور على عائلاتهم. هل تبحث عن أحد؟",
                        fa: "سلام، من به کودکان کمک می‌کنم تا خانواده‌هایشان را پیدا کنند. آیا دنبال کسی می‌گردی؟",
                        ur: "ہیلو، میں بچوں کی مدد کرتا ہوں اپنے خاندان تلاش کرنے میں۔ کیا آپ کسی کو تلاش کر رہے ہیں؟"
                    }
                },
                'Q002': {
                    category: 'opening',
                    text: {
                        en: "Are you hungry or thirsty? We can talk while you rest.",
                        ar: "هل أنت جائع أو عطشان؟ يمكننا التحدث أثناء راحتك.",
                        fa: "آیا گرسنه یا تشنه هستی؟ می‌توانیم در حین استراحت صحبت کنیم.",
                        ur: "کیا آپ بھوکے یا پیاسے ہیں؟ ہم آرام کرتے وقت بات کر سکتے ہیں۔"
                    }
                },
                'Q003': {
                    category: 'opening',
                    text: {
                        en: "What should I call you?",
                        ar: "ماذا يجب أن أناديك؟",
                        fa: "چه اسمی صدایت کنم؟",
                        ur: "میں آپ کو کیا کہہ کر بلاؤں؟"
                    }
                },
                'Q004': {
                    category: 'family_structure',
                    text: {
                        en: "Who are you looking for? Mother? Father? Brothers? Sisters?",
                        ar: "من تبحث عنه؟ الأم؟ الأب؟ الإخوة؟ الأخوات؟",
                        fa: "دنبال چه کسی می‌گردی؟ مادر؟ پدر؟ برادر؟ خواهر؟",
                        ur: "آپ کس کو تلاش کر رہے ہیں؟ ماں؟ باپ؟ بھائی؟ بہن؟"
                    }
                },
                'Q005': {
                    category: 'family_structure',
                    text: {
                        en: "Who else lives with your family?",
                        ar: "من آخر يعيش مع عائلتك؟",
                        fa: "چه کس دیگری با خانواده‌ات زندگی می‌کند؟",
                        ur: "آپ کے خاندان کے ساتھ اور کون رہتا ہے؟"
                    }
                },
                'Q007': {
                    category: 'identifiers',
                    text: {
                        en: "What does your father look like?",
                        ar: "كيف يبدو والدك؟",
                        fa: "پدرت چگونه است؟",
                        ur: "آپ کے والد کیسے لگتے ہیں؟"
                    }
                },
                'Q008': {
                    category: 'identifiers',
                    text: {
                        en: "What work does your father do?",
                        ar: "ما العمل الذي يقوم به والدك؟",
                        fa: "پدرت چه کاری می‌کند؟",
                        ur: "آپ کے والد کیا کام کرتے ہیں؟"
                    }
                },
                'Q009': {
                    category: 'identifiers',
                    text: {
                        en: "Tell me about your mother",
                        ar: "أخبرني عن والدتك",
                        fa: "درباره مادرت بگو",
                        ur: "اپنی ماں کے بارے میں بتائیں"
                    }
                },
                'Q011': {
                    category: 'identifiers',
                    text: {
                        en: "What games do you play with your family?",
                        ar: "ما الألعاب التي تلعبها مع عائلتك؟",
                        fa: "چه بازی‌هایی با خانواده‌ات انجام می‌دهی؟",
                        ur: "آپ اپنے خاندان کے ساتھ کون سے کھیل کھیلتے ہیں؟"
                    }
                },
                'Q012': {
                    category: 'identifiers',
                    text: {
                        en: "What food does your mother make?",
                        ar: "ما الطعام الذي تحضره والدتك؟",
                        fa: "مادرت چه غذایی درست می‌کند؟",
                        ur: "آپ کی ماں کیا کھانا بناتی ہے؟"
                    }
                },
                'Q015': {
                    category: 'location',
                    text: {
                        en: "What did your house look like?",
                        ar: "كيف كان يبدو منزلك؟",
                        fa: "خانه‌ات چگونه بود؟",
                        ur: "آپ کا گھر کیسا لگتا تھا؟"
                    }
                },
                'Q016': {
                    category: 'location',
                    text: {
                        en: "What was near your home? Big buildings? Water? Mountains?",
                        ar: "ماذا كان بالقرب من منزلك؟ مباني كبيرة؟ ماء؟ جبال؟",
                        fa: "نزدیک خانه‌ات چه چیزی بود؟ ساختمان‌های بزرگ؟ آب؟ کوه؟",
                        ur: "آپ کے گھر کے قریب کیا تھا؟ بڑی عمارتیں؟ پانی؟ پہاڑ؟"
                    }
                },
                'Q018': {
                    category: 'verification',
                    text: {
                        en: "Tell me a secret only your family knows",
                        ar: "أخبرني بسر تعرفه عائلتك فقط",
                        fa: "یک راز بگو که فقط خانواده‌ات می‌داند",
                        ur: "کوئی راز بتائیں جو صرف آپ کا خاندان جانتا ہے"
                    }
                },
                'Q019': {
                    category: 'verification',
                    text: {
                        en: "What's your favorite memory with your family?",
                        ar: "ما هي ذكرتك المفضلة مع عائلتك؟",
                        fa: "محبوب‌ترین خاطره‌ات با خانواده‌ات چیست؟",
                        ur: "آپ کا خاندان کے ساتھ پسندیدہ یاد کیا ہے؟"
                    }
                },
                'Q020': {
                    category: 'verification',
                    text: {
                        en: "Is there anything else special about your family?",
                        ar: "هل هناك أي شيء آخر مميز في عائلتك؟",
                        fa: "چیز خاص دیگری درباره خانواده‌ات هست؟",
                        ur: "آپ کے خاندان کے بارے میں کوئی اور خاص بات ہے؟"
                    }
                }
            }
        };
    }
    
    setupEventListeners() {
        // Set up all event listeners for GemPath functionality
        const startInterviewBtn = document.getElementById('startInterviewBtn');
        if (startInterviewBtn) {
            startInterviewBtn.addEventListener('click', () => this.startInterview());
        }
        
        const playQuestionBtn = document.getElementById('playQuestionBtn');
        if (playQuestionBtn) {
            playQuestionBtn.addEventListener('click', () => this.playCurrentQuestion());
        }
        
        const recordBtn = document.getElementById('recordAnswerBtn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        const endInterviewBtn = document.getElementById('endInterviewBtn');
        if (endInterviewBtn) {
            endInterviewBtn.addEventListener('click', () => this.endInterview());
        }
        
        const searchBtn = document.getElementById('gemPathSearchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
    }
    
    initializeStorage() {
        // Initialize IndexedDB for offline storage
        if (!localStorage.getItem(this.storageName)) {
            localStorage.setItem(this.storageName, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.profilesStorageName)) {
            localStorage.setItem(this.profilesStorageName, JSON.stringify([]));
        }
    }
    
    startInterview() {
        console.log('Starting GemPath interview...');
        
        this.sessionId = this.generateSessionId();
        this.currentQuestionIndex = 0;
        this.responses = [];
        this.currentLanguage = document.getElementById('gemPathLanguage')?.value || 'en';
        
        // Show interview interface
        const interviewInterface = document.getElementById('gemPathQuestionContainer');
        if (interviewInterface) {
            interviewInterface.style.display = 'block';
        }
        
        // Update UI to show interview interface
        this.updateInterviewUI();
        
        // Auto-play first question
        setTimeout(() => this.playCurrentQuestion(), 500);
    }
    
    updateInterviewUI() {
        const questionContainer = document.getElementById('gemPathQuestionContainer');
        const currentQuestion = this.questionBank.questions[this.questionBank.core_questions[this.currentQuestionIndex]];
        
        if (questionContainer && currentQuestion) {
            const questionText = currentQuestion.text[this.currentLanguage] || currentQuestion.text.en;
            
            questionContainer.innerHTML = `
                <div class="interview-progress">
                    <span class="progress-text">Question ${this.currentQuestionIndex + 1} of ${this.questionBank.core_questions.length}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((this.currentQuestionIndex + 1) / this.questionBank.core_questions.length) * 100}%"></div>
                    </div>
                </div>
                <div class="current-question">
                    <h3>${questionText}</h3>
                </div>
                <div class="interview-controls">
                    <button id="playQuestionBtn" class="play-btn">▶️ Play Question</button>
                    <button id="recordAnswerBtn" class="record-btn">🎤 Record Answer</button>
                    <button id="nextQuestionBtn" class="next-btn">Next Question ➡️</button>
                    <button id="endInterviewBtn" class="end-btn">End Interview 📋</button>
                </div>
                <div class="response-status">
                    Responses recorded: <span id="responseCount">${this.responses.length}</span>
                </div>
            `;
            
            // Re-attach event listeners
            this.setupEventListeners();
        }
    }
    
    playCurrentQuestion() {
        const currentQuestionId = this.questionBank.core_questions[this.currentQuestionIndex];
        
        // In a full implementation, this would play pre-recorded audio
        // For now, use speech synthesis as fallback
        if ('speechSynthesis' in window) {
            const currentQuestion = this.questionBank.questions[currentQuestionId];
            const questionText = currentQuestion.text[this.currentLanguage] || currentQuestion.text.en;
            
            const utterance = new SpeechSynthesisUtterance(questionText);
            utterance.lang = this.getLanguageCode(this.currentLanguage);
            speechSynthesis.speak(utterance);
        }
    }
    
    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.saveResponse(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            const recordBtn = document.getElementById('recordAnswerBtn');
            if (recordBtn) {
                recordBtn.textContent = '⏹️ Stop Recording';
                recordBtn.classList.add('recording');
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast('Unable to access microphone');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            const recordBtn = document.getElementById('recordAnswerBtn');
            if (recordBtn) {
                recordBtn.textContent = '🎤 Record Answer';
                recordBtn.classList.remove('recording');
            }
            
            // Stop all media tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }
    
    saveResponse(audioBlob) {
        const currentQuestionId = this.questionBank.core_questions[this.currentQuestionIndex];
        
        const response = {
            questionId: currentQuestionId,
            audio: audioBlob,
            timestamp: new Date().toISOString(),
            language: this.currentLanguage
        };
        
        this.responses.push(response);
        
        // Update response count
        const responseCount = document.getElementById('responseCount');
        if (responseCount) {
            responseCount.textContent = this.responses.length;
        }
        
        this.showToast('Response recorded successfully');
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questionBank.core_questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateInterviewUI();
        } else {
            this.showToast('Interview complete! Click "End Interview" to process.');
        }
    }
    
    async endInterview() {
        if (this.responses.length === 0) {
            this.showToast('No responses recorded');
            return;
        }
        
        console.log('Ending interview with', this.responses.length, 'responses');
        
        // Show loading
        this.showLoading(true);
        
        try {
            // Prepare interview data
            const interviewData = {
                sessionId: this.sessionId,
                language: this.currentLanguage,
                responses: this.responses,
                timestamp: new Date().toISOString(),
                questionsCompleted: this.responses.length,
                totalQuestions: this.questionBank.core_questions.length
            };
            
            // Try to send to AI server for analysis
            let analysisResult = null;
            if (this.aiClient && this.aiClient.isConnected) {
                try {
                    analysisResult = await this.submitToAIServer(interviewData);
                } catch (error) {
                    console.error('AI analysis failed:', error);
                }
            }
            
            // Save locally regardless of AI server status
            this.saveInterviewLocally(interviewData, analysisResult);
            
            // Show results
            this.displayInterviewResults(analysisResult);
            
        } catch (error) {
            console.error('Error ending interview:', error);
            this.showToast('Error processing interview');
        } finally {
            this.showLoading(false);
        }
    }
    
    async submitToAIServer(interviewData) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('session_id', interviewData.sessionId);
        formData.append('language', interviewData.language);
        formData.append('timestamp', interviewData.timestamp);
        
        // Add each response
        interviewData.responses.forEach((response, index) => {
            formData.append(`response_${index}_question`, response.questionId);
            formData.append(`response_${index}_audio`, response.audio);
            formData.append(`response_${index}_timestamp`, response.timestamp);
            formData.append(`response_${index}_language`, response.language);
        });
        
        // Submit to AI server using AI client
        if (!this.aiClient) {
            throw new Error('AI client not available');
        }
        
        // Convert FormData to regular object
        const dataObj = {};
        for (let [key, value] of formData.entries()) {
            dataObj[key] = value;
        }
        
        return await this.aiClient.makeRequest('/api/gempath/analyze', dataObj, {
            timeout: 45000 // 45 second timeout for analysis
        });
    }
    
    saveInterviewLocally(interviewData, analysisResult) {
        const sessions = JSON.parse(localStorage.getItem(this.storageName) || '[]');
        
        const sessionRecord = {
            ...interviewData,
            analysis: analysisResult,
            savedAt: new Date().toISOString()
        };
        
        sessions.push(sessionRecord);
        localStorage.setItem(this.storageName, JSON.stringify(sessions));
        
        console.log('Interview saved locally:', sessionRecord);
    }
    
    displayInterviewResults(analysisResult) {
        const resultsContainer = document.getElementById('gemPathResults');
        
        if (!resultsContainer) return;
        
        let resultsHTML = `
            <div class="interview-complete">
                <h3>✅ Interview Complete</h3>
                <p>Session ID: ${this.sessionId}</p>
                <p>Responses recorded: ${this.responses.length}</p>
                <p>Language: ${this.currentLanguage}</p>
            </div>
        `;
        
        if (analysisResult) {
            resultsHTML += `
                <div class="ai-analysis">
                    <h4>AI Analysis Results</h4>
                    <div class="analysis-content">
                        <p><strong>Match Readiness:</strong> ${analysisResult.match_readiness || 'Processing'}</p>
                        ${analysisResult.seeking ? `<p><strong>Seeking:</strong> ${analysisResult.seeking.join(', ')}</p>` : ''}
                        ${analysisResult.warnings && analysisResult.warnings.length > 0 ? 
                            `<div class="warnings">
                                <strong>⚠️ Warnings:</strong>
                                <ul>${analysisResult.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                            </div>` : ''}
                    </div>
                </div>
            `;
        } else {
            resultsHTML += `
                <div class="offline-notice">
                    <p>📱 Interview saved offline. Analysis will be performed when AI server is available.</p>
                </div>
            `;
        }
        
        resultsHTML += `
            <div class="next-steps">
                <h4>Next Steps</h4>
                <button onclick="gemPath.startNewInterview()" class="new-interview-btn">New Interview</button>
                <button onclick="gemPath.showSearchInterface()" class="search-btn">Search for Matches</button>
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
    }
    
    async performSearch() {
        const query = document.getElementById('gemPathSearchQuery')?.value;
        
        if (!query) {
            this.showToast('Please enter search terms');
            return;
        }
        
        this.showLoading(true);
        
        try {
            let searchResults = [];
            
            if (this.aiClient && this.aiClient.isConnected) {
                // Use AI server for intelligent search
                try {
                    const data = await this.aiClient.makeRequest('/api/gempath/search', {
                        search_query: query,
                        person_data: this.getCurrentPersonData()
                    }, {
                        timeout: 60000 // 60 second timeout for search
                    });
                    searchResults = data.matches || [];
                } catch (error) {
                    console.error('AI search failed, falling back to local:', error);
                    searchResults = this.searchLocalProfiles(query);
                }
            } else {
                // Fallback to local search
                searchResults = this.searchLocalProfiles(query);
            }
            
            this.displaySearchResults(searchResults, query);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    searchLocalProfiles(query) {
        const profiles = JSON.parse(localStorage.getItem(this.profilesStorageName) || '[]');
        const sessions = JSON.parse(localStorage.getItem(this.storageName) || '[]');
        
        const allProfiles = [...profiles, ...sessions];
        
        return allProfiles.filter(profile => {
            const searchText = `${profile.name || ''} ${profile.origin || ''} ${profile.location || ''}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }
    
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('gemPathSearchResults');
        
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No matches found for "${query}"</p>
                    <p>Try different search terms or check with nearby camps.</p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(result => `
            <div class="search-result-card">
                <h4>${result.name || 'Unknown'}</h4>
                <p><strong>Origin:</strong> ${result.origin || 'Not specified'}</p>
                <p><strong>Location:</strong> ${result.current_location || result.location || 'Unknown'}</p>
                ${result.family_seeking ? `<p><strong>Seeking:</strong> ${result.family_seeking}</p>` : ''}
                ${result.confidence ? `<p><strong>Match Confidence:</strong> ${Math.round(result.confidence * 100)}%</p>` : ''}
                <div class="result-actions">
                    <button onclick="gemPath.initiateVerification('${result.id || result.sessionId}')" class="verify-btn">
                        Start Verification
                    </button>
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <h3>Search Results for "${query}"</h3>
                <p>Found ${results.length} potential match${results.length !== 1 ? 'es' : ''}</p>
            </div>
            <div class="results-list">
                ${resultsHTML}
            </div>
        `;
    }
    
    // Utility functions
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getLanguageCode(lang) {
        const codes = {
            en: 'en-US',
            ar: 'ar-SA',
            fa: 'fa-IR',
            ur: 'ur-PK',
            ps: 'ps-AF'
        };
        return codes[lang] || 'en-US';
    }
    
    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'gempath-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    showLoading(show) {
        // Use the existing loading overlay from the main app
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    startNewInterview() {
        // Reset state for new interview
        this.currentSession = null;
        this.responses = [];
        this.currentQuestionIndex = 0;
        this.sessionId = null;
        
        // Hide results and show interview interface
        const resultsContainer = document.getElementById('gemPathResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Start new interview
        this.startInterview();
    }
    
    showSearchInterface() {
        // Switch to search mode in the UI
        const searchContainer = document.getElementById('gemPathSearchContainer');
        if (searchContainer) {
            searchContainer.style.display = 'block';
        }
    }
    
    async initiateVerification(profileId) {
        console.log('Initiating verification for profile:', profileId);
        
        if (!profileId) {
            this.showToast('Error: No profile ID provided');
            return;
        }
        
        this.showLoading(true);
        
        try {
            // Get parent search query for verification
            const query = document.getElementById('gemPathSearchQuery')?.value || 'Unknown query';
            
            if (this.aiClient && this.aiClient.isConnected) {
                // Use AI server for verification protocol
                try {
                    const verification = await this.aiClient.makeRequest('/api/gempath/verify', {
                        match_data: { interview_id: profileId },
                        person_data: this.getCurrentPersonData(),
                        parent_query: query
                    }, {
                        timeout: 30000 // 30 second timeout for verification
                    });
                    this.displayVerificationProtocol(verification);
                } catch (error) {
                    console.error('AI verification failed, using offline fallback:', error);
                    this.displayOfflineVerification(profileId);
                }
            } else {
                // Offline fallback
                this.displayOfflineVerification(profileId);
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            this.showToast('Unable to start verification. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayVerificationProtocol(verification) {
        const resultsContainer = document.getElementById('gemPathSearchResults');
        
        if (!resultsContainer) return;
        
        const protocolHTML = `
            <div class="verification-protocol">
                <h3>🔍 Verification Protocol</h3>
                <div class="verification-steps">
                    <div class="verification-step">
                        <h4>Step 1: Ask Parent</h4>
                        <div class="verification-question">
                            <strong>Question:</strong> ${verification.parent_question}
                        </div>
                    </div>
                    
                    <div class="verification-step">
                        <h4>Step 2: Ask Child</h4>
                        <div class="verification-question">
                            <strong>Question:</strong> ${verification.child_question}
                        </div>
                    </div>
                    
                    <div class="verification-step">
                        <h4>Step 3: Compare Answers</h4>
                        <div class="verification-instructions">
                            <p>Confidence threshold: ${Math.round(verification.confidence_threshold * 100)}%</p>
                            <ul>
                                ${verification.next_steps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="verification-actions">
                    <button onclick="gemPath.completeVerification('${verification.interview_id}', true)" class="verify-success-btn">
                        ✅ Answers Match - Proceed
                    </button>
                    <button onclick="gemPath.completeVerification('${verification.interview_id}', false)" class="verify-fail-btn">
                        ❌ Answers Don't Match
                    </button>
                    <button onclick="gemPath.showSearchInterface()" class="back-btn">
                        ← Back to Search
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = protocolHTML;
        this.showToast('Verification protocol ready');
    }
    
    displayOfflineVerification(profileId) {
        const resultsContainer = document.getElementById('gemPathSearchResults');
        
        if (!resultsContainer) return;
        
        const offlineHTML = `
            <div class="verification-protocol offline">
                <h3>📱 Offline Verification</h3>
                <div class="offline-instructions">
                    <p><strong>AI verification not available.</strong> Please follow manual verification process:</p>
                    
                    <ol>
                        <li><strong>Ask parent detailed questions</strong> about the child's habits, favorite games, or family memories</li>
                        <li><strong>Compare with child's recorded interview</strong> (Session: ${profileId})</li>
                        <li><strong>Look for unique identifiers</strong> that only family members would know</li>
                        <li><strong>Ensure supervised contact</strong> with aid worker present</li>
                        <li><strong>Document the verification</strong> process for records</li>
                    </ol>
                    
                    <div class="safety-warning">
                        ⚠️ <strong>Safety First:</strong> Never allow unsupervised contact until verification is complete and documented.
                    </div>
                </div>
                
                <div class="verification-actions">
                    <button onclick="gemPath.completeVerification('${profileId}', true)" class="verify-success-btn">
                        ✅ Manual Verification Complete
                    </button>
                    <button onclick="gemPath.showSearchInterface()" class="back-btn">
                        ← Back to Search
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = offlineHTML;
        this.showToast('Manual verification process started');
    }
    
    completeVerification(interviewId, success) {
        if (success) {
            this.showToast('✅ Verification successful! Proceeding with supervised reunification.');
            console.log('Verification completed successfully for:', interviewId);
            
            // In real implementation, this would:
            // 1. Update database with verification result
            // 2. Notify aid workers
            // 3. Schedule supervised reunification
            // 4. Generate documentation
            
        } else {
            this.showToast('❌ Verification failed. Continuing search for other matches.');
            console.log('Verification failed for:', interviewId);
        }
        
        // Return to search interface
        setTimeout(() => {
            this.showSearchInterface();
        }, 3000);
    }
    
    // Helper method to get current person data for search context
    getCurrentPersonData() {
        // Get data from current interview or form
        const formData = new FormData(document.getElementById('gempath-form') || document.createElement('form'));
        const personData = {};
        
        for (let [key, value] of formData.entries()) {
            personData[key] = value;
        }
        
        return personData;
    }
    
    // Integration with main app
    setAIClient(aiClient) {
        this.aiClient = aiClient;
        console.log('GemPath: AI client connected');
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.GemPath = GemPath;
}