// Virtual Keyboard for Refugee Connect
class VirtualKeyboard {
  constructor() {
    this.currentLayout = 'arabic';
    this.targetInput = null;
    this.capsLock = false;
    this.shift = false;
    
    // Keyboard layouts for different languages
    this.layouts = {
      arabic: {
        name: 'العربية',
        direction: 'rtl',
        rows: [
          ['ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
          ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
          ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
          ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
        ],
        shift: [
          ['ّ', '!', '@', '#', '$', '%', '^', '&', '*', ')', '(', '_', '+'],
          ['َ', 'ً', 'ُ', 'ٌ', 'ِ', 'ٍ', 'ْ', '÷', '×', '؛', '<', '>'],
          ['\\', '[', ']', 'لأ', 'لإ', 'أ', 'ـ', '،', '/', ':', '"'],
          ['~', 'ْ', '}', '{', 'لآ', 'آ', "'", ',', '.', '؟']
        ],
        special: {
          space: ' ',
          backspace: '⌫',
          enter: '↵',
          shift: '⇧',
          numbers: '123'
        }
      },
      persian: {
        name: 'فارسی',
        direction: 'rtl',
        rows: [
          ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
          ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
          ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'ژ'],
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
        ],
        shift: [
          ['ْ', 'ّ', 'ٌ', 'ً', 'ُ', 'َ', 'ِ', '÷', '×', '،', '؛', 'ۀ'],
          ['ؤ', 'ئ', 'ي', 'إ', 'أ', 'آ', 'ة', '»', '«', ':', '؟'],
          ['ك', 'ٓ', 'ژ', 'ٰ', 'ے', 'ء', '\\', ']', '['],
          ['!', '٬', '٫', '﷼', '٪', '×', '،', '*', ')', '(']
        ],
        special: {
          space: ' ',
          backspace: '⌫',
          enter: '↵',
          shift: '⇧',
          numbers: '123'
        }
      },
      urdu: {
        name: 'اردو',
        direction: 'rtl',
        rows: [
          ['ط', 'ص', 'ھ', 'د', 'ٹ', 'پ', 'ت', 'ب', 'ج', 'ح'],
          ['م', 'و', 'ر', 'ن', 'ل', 'ہ', 'ا', 'ک', 'ی', 'ے'],
          ['ق', 'ف', 'ع', 'س', 'ش', 'غ', 'گ', 'چ', 'خ'],
          ['ظ', 'ذ', 'ض', 'ز', 'ث', 'ژ', 'ڈ', 'ڑ', 'ں']
        ],
        shift: [
          ['ۃ', 'ّ', 'ء', 'ٔ', 'ٹ', 'ُ', 'ۂ', 'ـ', 'ۀ', 'ْ'],
          ['ٓ', 'ٗ', 'ڑ', 'ں', 'ؔ', 'ھ', 'آ', 'گ', 'ِ', 'ۓ'],
          ['"', ';', ':', 'ص', 'ئ', 'َ', 'ؤ', 'چ', 'ً'],
          [')', '(', '٪', '!', '،', '۔', 'ڈ', 'ڑ', 'ٖ']
        ],
        special: {
          space: ' ',
          backspace: '⌫',
          enter: '↵',
          shift: '⇧',
          numbers: '۱۲۳'
        }
      },
      pashto: {
        name: 'پښتو',
        direction: 'rtl',
        rows: [
          ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
          ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'ګ'],
          ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'ړ', 'و', 'ږ'],
          ['ښ', 'ډ', 'ټ', 'پ', 'ژ', 'ځ', 'څ', 'ڼ', 'ې']
        ],
        shift: [
          ['ْ', 'ٌ', 'ً', 'ُ', 'َ', 'ِ', 'ٍ', '÷', '×', '؛', '>', '<'],
          ['ؤ', 'ئ', 'ي', 'ـ', 'لا', 'آ', 'ة', '»', '«', ':', '"'],
          ['ك', 'ٓ', 'ى', 'ٰ', 'ے', 'ء', '\\', ']', '['],
          ['!', '@', '#', '$', '%', '^', '&', '*', ')']
        ],
        special: {
          space: ' ',
          backspace: '⌫',
          enter: '↵',
          shift: '⇧',
          numbers: '۱۲۳'
        }
      }
    };
  }

  show(language, inputElement) {
    // Map language codes to layout names
    const languageMap = {
      'ar': 'arabic',
      'fa': 'persian', 
      'ur': 'urdu',
      'ps': 'pashto'
    };
    
    this.currentLayout = languageMap[language] || language;
    this.targetInput = inputElement;
    
    const container = document.getElementById('virtualKeyboard');
    if (!container) return;
    
    container.innerHTML = '';
    this.render(container);
  }

  render(container) {
    const layout = this.layouts[this.currentLayout];
    if (!layout) return;
    
    // Set keyboard direction
    container.style.direction = layout.direction || 'ltr';
    
    // Create keyboard rows
    const rows = this.shift ? layout.shift : layout.rows;
    
    rows.forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      
      row.forEach(key => {
        const keyButton = this.createKey(key);
        rowDiv.appendChild(keyButton);
      });
      
      container.appendChild(rowDiv);
    });
    
    // Add special keys row
    const specialRow = document.createElement('div');
    specialRow.className = 'keyboard-row';
    
    // Shift key
    const shiftKey = this.createSpecialKey(layout.special.shift, () => {
      this.shift = !this.shift;
      this.render(container);
    });
    shiftKey.classList.add('special');
    if (this.shift) shiftKey.classList.add('active');
    specialRow.appendChild(shiftKey);
    
    // Numbers/Letters toggle
    const numbersKey = this.createSpecialKey(layout.special.numbers, () => {
      this.toggleNumbers();
    });
    numbersKey.classList.add('special');
    specialRow.appendChild(numbersKey);
    
    // Space bar
    const spaceKey = this.createSpecialKey('Space', () => {
      this.insertText(' ');
    });
    spaceKey.classList.add('space');
    specialRow.appendChild(spaceKey);
    
    // Backspace
    const backspaceKey = this.createSpecialKey(layout.special.backspace, () => {
      this.backspace();
    });
    backspaceKey.classList.add('backspace');
    specialRow.appendChild(backspaceKey);
    
    // Enter
    const enterKey = this.createSpecialKey(layout.special.enter, () => {
      this.insertText('\n');
    });
    enterKey.classList.add('enter');
    specialRow.appendChild(enterKey);
    
    container.appendChild(specialRow);
    
    // Language switcher
    const langRow = document.createElement('div');
    langRow.className = 'keyboard-row language-row';
    
    Object.keys(this.layouts).forEach(lang => {
      const langButton = document.createElement('button');
      langButton.className = 'key language-key';
      langButton.textContent = this.layouts[lang].name;
      langButton.onclick = () => {
        this.currentLayout = lang;
        this.render(container);
      };
      if (lang === this.currentLayout) {
        langButton.classList.add('active');
      }
      langRow.appendChild(langButton);
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'key close-key';
    closeButton.textContent = '✕';
    closeButton.onclick = () => {
      container.style.display = 'none';
    };
    langRow.appendChild(closeButton);
    
    container.appendChild(langRow);
  }

  createKey(char) {
    const key = document.createElement('button');
    key.className = 'key';
    key.textContent = char;
    key.onclick = () => {
      this.insertText(char);
      if (this.shift) {
        this.shift = false;
        this.render(document.getElementById('virtualKeyboard'));
      }
    };
    return key;
  }

  createSpecialKey(label, action) {
    const key = document.createElement('button');
    key.className = 'key';
    key.textContent = label;
    key.onclick = action;
    return key;
  }

  insertText(text) {
    if (!this.targetInput) return;
    
    const start = this.targetInput.selectionStart;
    const end = this.targetInput.selectionEnd;
    const value = this.targetInput.value;
    
    this.targetInput.value = value.substring(0, start) + text + value.substring(end);
    this.targetInput.selectionStart = this.targetInput.selectionEnd = start + text.length;
    
    // Trigger input event
    const event = new Event('input', { bubbles: true });
    this.targetInput.dispatchEvent(event);
    
    // Keep focus on input
    this.targetInput.focus();
  }

  backspace() {
    if (!this.targetInput) return;
    
    const start = this.targetInput.selectionStart;
    const end = this.targetInput.selectionEnd;
    const value = this.targetInput.value;
    
    if (start === end && start > 0) {
      // Delete one character before cursor
      this.targetInput.value = value.substring(0, start - 1) + value.substring(end);
      this.targetInput.selectionStart = this.targetInput.selectionEnd = start - 1;
    } else if (start !== end) {
      // Delete selection
      this.targetInput.value = value.substring(0, start) + value.substring(end);
      this.targetInput.selectionStart = this.targetInput.selectionEnd = start;
    }
    
    // Trigger input event
    const event = new Event('input', { bubbles: true });
    this.targetInput.dispatchEvent(event);
    
    // Keep focus on input
    this.targetInput.focus();
  }

  toggleNumbers() {
    // In a full implementation, this would switch to a numeric keypad
    // For now, we'll just insert common numbers
    const numbers = this.currentLayout === 'arabic' ? 
      ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] :
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    // Simple implementation: insert number row at top
    const container = document.getElementById('virtualKeyboard');
    const firstRow = container.querySelector('.keyboard-row');
    
    if (firstRow && !firstRow.classList.contains('number-row')) {
      const numberRow = document.createElement('div');
      numberRow.className = 'keyboard-row number-row';
      
      numbers.forEach(num => {
        const key = this.createKey(num);
        numberRow.appendChild(key);
      });
      
      container.insertBefore(numberRow, firstRow);
    }
  }

  hide() {
    const container = document.getElementById('virtualKeyboard');
    if (container) {
      container.style.display = 'none';
    }
  }

  isVisible() {
    const container = document.getElementById('virtualKeyboard');
    return container && container.style.display !== 'none';
  }
}

// Additional styles for the virtual keyboard
const style = document.createElement('style');
style.textContent = `
  .language-row {
    border-top: 1px solid #546E7A;
    padding-top: 8px;
    margin-top: 8px;
  }
  
  .language-key {
    font-size: 0.875rem !important;
    padding: 8px !important;
    min-width: auto !important;
  }
  
  .language-key.active {
    background: #2196F3 !important;
    color: white !important;
  }
  
  .close-key {
    background: #F44336 !important;
    color: white !important;
    font-weight: bold;
  }
  
  .number-row {
    background: rgba(33, 150, 243, 0.1);
  }
  
  .key.active {
    background: #546E7A !important;
  }
  
  /* RTL keyboard adjustments */
  .virtual-keyboard[dir="rtl"] .keyboard-row {
    direction: rtl;
  }
  
  .virtual-keyboard[dir="rtl"] .key {
    font-family: 'Arabic UI Display', 'Noto Arabic', Arial, sans-serif;
  }
`;
document.head.appendChild(style);

// Create singleton instance
window.VirtualKeyboard = VirtualKeyboard;