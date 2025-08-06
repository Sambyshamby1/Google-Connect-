// Google Connect Demo Script
class GoogleConnectDemo {
    constructor() {
        this.connectLink = document.getElementById('google-connect');
        this.cacheToast = document.getElementById('cache-toast');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.highlightConnectLink();
    }

    setupEventListeners() {
        this.connectLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.startConnectDemo();
        });

        // Simulate search functionality
        const searchInput = document.querySelector('.search-input');
        const searchButtons = document.querySelectorAll('.google-button');
        
        searchButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (searchInput.value.trim()) {
                    this.simulateSearch(searchInput.value);
                }
            });
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                this.simulateSearch(searchInput.value);
            }
        });
    }

    highlightConnectLink() {
        // Subtle animation to draw attention to Connect link
        setTimeout(() => {
            this.connectLink.classList.add('highlight');
            
            setTimeout(() => {
                this.connectLink.classList.remove('highlight');
            }, 6000);
        }, 2000);
    }

    startConnectDemo() {
        // Show caching process
        this.showCacheToast();
        
        // Simulate caching progress
        this.simulateCaching();
    }

    showCacheToast() {
        this.cacheToast.classList.remove('hidden');
        
        // Auto-hide after completion
        setTimeout(() => {
            this.cacheToast.classList.add('hidden');
            this.showOfflineReady();
            this.redirectToConnect();
        }, 5000);
    }

    simulateCaching() {
        const progressFill = document.querySelector('.progress-fill');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Random progress increments
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                this.updateCacheMessage();
            }
        }, 200);
    }

    updateCacheMessage() {
        const cacheTitle = document.querySelector('.cache-title');
        cacheTitle.textContent = 'Google Connect is now available offline!';
        
        // Add checkmark icon
        const cacheContent = document.querySelector('.cache-content');
        const checkIcon = document.createElement('div');
        checkIcon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#34a853"/>
                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        const offlineIcon = document.querySelector('.offline-icon');
        offlineIcon.replaceWith(checkIcon.firstElementChild);
    }

    showOfflineReady() {
        const offlineIndicator = document.createElement('div');
        offlineIndicator.className = 'offline-ready';
        offlineIndicator.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="white"/>
                <path d="M9 12L11 14L15 10" stroke="#34a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Available offline
        `;
        
        document.body.appendChild(offlineIndicator);
        
        setTimeout(() => {
            offlineIndicator.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            offlineIndicator.classList.remove('show');
            setTimeout(() => {
                offlineIndicator.remove();
            }, 300);
        }, 3000);
    }

    redirectToConnect() {
        setTimeout(() => {
            // Redirect to the actual Refugee Connect PWA
            window.location.href = '../competition-submission/frontend/index.html';
        }, 2000);
    }

    showDemoMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'demo-overlay';
        overlay.innerHTML = `
            <div class="demo-popup">
                <h2>Demo Complete!</h2>
                <p>In a real deployment, clicking "Connect" would:</p>
                <ul style="text-align: left; margin: 16px 0; color: #5f6368;">
                    <li>Cache the entire Refugee Connect PWA</li>
                    <li>Enable offline access to humanitarian services</li>
                    <li>Allow installation as a home screen app</li>
                    <li>Work without any internet connection</li>
                </ul>
                <p>The user would now have permanent access to translation, medical guidance, legal rights information, and AI-powered assistance.</p>
                <button class="demo-button" onclick="this.closest('.demo-overlay').remove()">
                    Got it!
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);
    }

    simulateSearch(query) {
        // Show that this is just a demo
        const demoNotice = document.createElement('div');
        demoNotice.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            text-align: center;
            z-index: 1000;
        `;
        
        demoNotice.innerHTML = `
            <h3 style="color: #1a73e8; margin-bottom: 12px;">Demo Mode</h3>
            <p style="color: #5f6368; margin-bottom: 16px;">This is a demonstration of Google Connect integration.</p>
            <p style="color: #5f6368; margin-bottom: 16px;">Try clicking the <strong>"Connect"</strong> link in the footer!</p>
            <button onclick="this.parentElement.remove()" style="background: #1a73e8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Close
            </button>
        `;
        
        document.body.appendChild(demoNotice);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (demoNotice.parentElement) {
                demoNotice.remove();
            }
        }, 5000);
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GoogleConnectDemo();
});

// Add some demo info to console
console.log(`
%c🌐 Google Connect Demo
%cThis demonstrates how Google could integrate Refugee Connect directly into their homepage.

Key features:
• One-click access from Google.com
• Automatic offline caching
• Global humanitarian service distribution
• No app store required

Try clicking the "Connect" link in the footer!
`, 
'color: #1a73e8; font-size: 16px; font-weight: bold;',
'color: #5f6368; font-size: 14px;'
);