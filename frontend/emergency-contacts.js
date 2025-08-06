// Emergency Contacts for Refugee Connect
class EmergencyContacts {
  constructor() {
    this.contacts = new Map();
    this.categories = {
      emergency: 'Emergency Services',
      medical: 'Medical Services',
      legal: 'Legal Aid',
      humanitarian: 'Humanitarian Organizations',
      embassy: 'Embassy/Consulate',
      family: 'Family/Friends',
      community: 'Community Support'
    };
    
    // Load saved contacts
    this.loadContacts();
    
    // Initialize with default emergency contacts
    this.initializeDefaultContacts();
  }

  initializeDefaultContacts() {
    // Only add defaults if no contacts exist
    if (this.contacts.size === 0) {
      const defaultContacts = [
        {
          id: 'emergency_general',
          name: 'Emergency Services',
          category: 'emergency',
          phone: 'Ask locals for emergency number',
          description: 'Police, Fire, Ambulance',
          priority: 'high',
          isDefault: true
        },
        {
          id: 'medical_emergency',
          name: 'Medical Emergency',
          category: 'medical',
          phone: 'Ask locals for ambulance number',
          description: 'Emergency medical services',
          priority: 'high',
          isDefault: true
        },
        {
          id: 'unhcr',
          name: 'UNHCR (UN Refugee Agency)',
          category: 'humanitarian',
          phone: 'Contact local UNHCR office',
          website: 'https://www.unhcr.org',
          description: 'UN agency for refugees',
          priority: 'medium',
          isDefault: true
        },
        {
          id: 'red_cross',
          name: 'International Red Cross',
          category: 'humanitarian',
          phone: 'Contact local Red Cross',
          website: 'https://www.icrc.org',
          description: 'Humanitarian assistance',
          priority: 'medium',
          isDefault: true
        },
        {
          id: 'legal_aid',
          name: 'Legal Aid Services',
          category: 'legal',
          phone: 'Ask for local legal aid number',
          description: 'Free legal assistance',
          priority: 'medium',
          isDefault: true
        }
      ];
      
      defaultContacts.forEach(contact => {
        this.contacts.set(contact.id, contact);
      });
      
      this.saveContacts();
    }
  }

  addContact(contactData) {
    const contact = {
      id: contactData.id || this.generateContactId(),
      name: contactData.name,
      category: contactData.category,
      phone: contactData.phone || '',
      email: contactData.email || '',
      website: contactData.website || '',
      address: contactData.address || '',
      description: contactData.description || '',
      priority: contactData.priority || 'medium',
      isDefault: contactData.isDefault || false,
      dateAdded: Date.now()
    };
    
    this.contacts.set(contact.id, contact);
    this.saveContacts();
    
    return contact.id;
  }

  updateContact(contactId, updates) {
    const contact = this.contacts.get(contactId);
    if (!contact) {
      return false;
    }
    
    // Don't allow updating default contacts' core info
    if (contact.isDefault) {
      const allowedUpdates = ['phone', 'email', 'address', 'description'];
      const filteredUpdates = {};
      allowedUpdates.forEach(key => {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      });
      updates = filteredUpdates;
    }
    
    const updatedContact = { ...contact, ...updates };
    this.contacts.set(contactId, updatedContact);
    this.saveContacts();
    
    return true;
  }

  deleteContact(contactId) {
    const contact = this.contacts.get(contactId);
    if (!contact) {
      return false;
    }
    
    // Don't allow deleting default contacts
    if (contact.isDefault) {
      return false;
    }
    
    this.contacts.delete(contactId);
    this.saveContacts();
    
    return true;
  }

  getContact(contactId) {
    return this.contacts.get(contactId);
  }

  getAllContacts() {
    const contactsArray = Array.from(this.contacts.values());
    
    // Sort by priority and then by name
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return contactsArray.sort((a, b) => {
      const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityCompare !== 0) {
        return priorityCompare;
      }
      return a.name.localeCompare(b.name);
    });
  }

  getContactsByCategory(category) {
    const contactsArray = Array.from(this.contacts.values());
    return contactsArray
      .filter(contact => contact.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getEmergencyContacts() {
    const contactsArray = Array.from(this.contacts.values());
    return contactsArray
      .filter(contact => contact.priority === 'high' || contact.category === 'emergency')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  searchContacts(query) {
    const normalizedQuery = query.toLowerCase();
    const contactsArray = Array.from(this.contacts.values());
    
    return contactsArray.filter(contact =>
      contact.name.toLowerCase().includes(normalizedQuery) ||
      contact.description.toLowerCase().includes(normalizedQuery) ||
      contact.phone.includes(normalizedQuery) ||
      contact.email.toLowerCase().includes(normalizedQuery)
    );
  }

  // Quick dial functionality
  callContact(contactId) {
    const contact = this.contacts.get(contactId);
    if (!contact || !contact.phone) {
      return false;
    }
    
    // Check if phone number looks like it can be dialed
    const phoneNumber = contact.phone.replace(/[^\d+]/g, '');
    if (phoneNumber.length > 3 && phoneNumber.match(/^[\d+]/)) {
      // Create tel: link
      const telLink = `tel:${phoneNumber}`;
      window.location.href = telLink;
      return true;
    }
    
    return false;
  }

  emailContact(contactId) {
    const contact = this.contacts.get(contactId);
    if (!contact || !contact.email) {
      return false;
    }
    
    const mailtoLink = `mailto:${contact.email}`;
    window.location.href = mailtoLink;
    return true;
  }

  visitWebsite(contactId) {
    const contact = this.contacts.get(contactId);
    if (!contact || !contact.website) {
      return false;
    }
    
    window.open(contact.website, '_blank');
    return true;
  }

  // Share contact information
  shareContact(contactId) {
    const contact = this.contacts.get(contactId);
    if (!contact) {
      return false;
    }
    
    const shareText = this.formatContactForSharing(contact);
    
    if (navigator.share) {
      navigator.share({
        title: contact.name,
        text: shareText
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast('Contact information copied to clipboard');
        }
      });
    }
    
    return true;
  }

  formatContactForSharing(contact) {
    let text = `${contact.name}\n`;
    
    if (contact.description) {
      text += `${contact.description}\n`;
    }
    
    if (contact.phone) {
      text += `Phone: ${contact.phone}\n`;
    }
    
    if (contact.email) {
      text += `Email: ${contact.email}\n`;
    }
    
    if (contact.website) {
      text += `Website: ${contact.website}\n`;
    }
    
    if (contact.address) {
      text += `Address: ${contact.address}\n`;
    }
    
    return text;
  }

  // Backup and sync with AI station
  async backupToAIStation(aiClient) {
    if (!aiClient || !aiClient.isConnected) {
      console.warn('AI station not available for backup');
      return false;
    }
    
    try {
      const contacts = this.getAllContacts();
      
      await aiClient.makeRequest('/api/contacts/backup', {
        contacts: contacts.filter(c => !c.isDefault), // Only backup user-added contacts
        timestamp: Date.now()
      });
      
      console.log('Contacts backed up to AI station');
      return true;
      
    } catch (error) {
      console.error('Error backing up contacts:', error);
      return false;
    }
  }

  async syncFromAIStation(aiClient) {
    if (!aiClient || !aiClient.isConnected) {
      console.warn('AI station not available for sync');
      return false;
    }
    
    try {
      const result = await aiClient.makeRequest('/api/contacts/sync', {
        lastSync: localStorage.getItem('lastContactSync') || 0
      });
      
      if (result.contacts && result.contacts.length > 0) {
        result.contacts.forEach(contact => {
          this.contacts.set(contact.id, contact);
        });
        
        this.saveContacts();
        localStorage.setItem('lastContactSync', Date.now().toString());
        
        console.log(`Synced ${result.contacts.length} contacts from AI station`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error syncing contacts:', error);
      return false;
    }
  }

  // Import/Export functionality
  exportContacts() {
    const contacts = this.getAllContacts();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      contacts: contacts.filter(c => !c.isDefault) // Don't export default contacts
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `refugee_contacts_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  importContacts(fileData) {
    try {
      const importData = JSON.parse(fileData);
      
      if (!importData.contacts || !Array.isArray(importData.contacts)) {
        throw new Error('Invalid contact file format');
      }
      
      let importedCount = 0;
      
      importData.contacts.forEach(contact => {
        if (contact.name && contact.category) {
          // Generate new ID to avoid conflicts
          contact.id = this.generateContactId();
          contact.dateAdded = Date.now();
          
          this.contacts.set(contact.id, contact);
          importedCount++;
        }
      });
      
      this.saveContacts();
      
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(`Imported ${importedCount} contacts successfully`);
      }
      
      return importedCount;
      
    } catch (error) {
      console.error('Error importing contacts:', error);
      
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('Error importing contacts: ' + error.message);
      }
      
      return 0;
    }
  }

  // Get localized emergency numbers by country
  getCountryEmergencyNumbers(countryCode) {
    const emergencyNumbers = {
      US: { police: '911', medical: '911', fire: '911' },
      UK: { police: '999', medical: '999', fire: '999' },
      DE: { police: '110', medical: '112', fire: '112' },
      FR: { police: '17', medical: '15', fire: '18' },
      ES: { police: '091', medical: '061', fire: '080' },
      IT: { police: '113', medical: '118', fire: '115' },
      GR: { police: '100', medical: '166', fire: '199' },
      TR: { police: '155', medical: '112', fire: '110' },
      // Add more countries as needed
    };
    
    return emergencyNumbers[countryCode] || {
      police: 'Ask locals for police number',
      medical: 'Ask locals for ambulance number',
      fire: 'Ask locals for fire department number'
    };
  }

  // Generate quick contact cards for emergency use
  generateEmergencyCard() {
    const emergencyContacts = this.getEmergencyContacts();
    const userProfile = this.getUserProfile();
    
    let card = 'EMERGENCY CONTACT CARD\n';
    card += '========================\n\n';
    
    if (userProfile) {
      card += `Name: ${userProfile.name || 'Not provided'}\n`;
      card += `From: ${userProfile.origin || 'Not provided'}\n`;
      card += `Current Location: ${userProfile.location || 'Not provided'}\n`;
      card += `Emergency Contact: ${userProfile.emergencyContact || 'Not provided'}\n\n`;
    }
    
    card += 'EMERGENCY NUMBERS:\n';
    card += '==================\n';
    
    emergencyContacts.forEach(contact => {
      card += `${contact.name}: ${contact.phone}\n`;
      if (contact.description) {
        card += `  (${contact.description})\n`;
      }
    });
    
    return card;
  }

  getUserProfile() {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  }

  // Storage methods
  saveContacts() {
    try {
      const contactsData = Array.from(this.contacts.entries());
      localStorage.setItem('refugeeContacts', JSON.stringify(contactsData));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  loadContacts() {
    try {
      const saved = localStorage.getItem('refugeeContacts');
      if (saved) {
        const contactsData = JSON.parse(saved);
        this.contacts = new Map(contactsData);
        console.log(`Loaded ${this.contacts.size} contacts from storage`);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.contacts = new Map();
    }
  }

  generateContactId() {
    return 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCategories() {
    return this.categories;
  }

  getCategoryName(categoryKey) {
    return this.categories[categoryKey] || categoryKey;
  }

  // Statistics and usage
  getContactStats() {
    const stats = {
      total: this.contacts.size,
      byCategory: {},
      byPriority: { high: 0, medium: 0, low: 0 },
      userAdded: 0,
      default: 0
    };
    
    for (const contact of this.contacts.values()) {
      // Count by category
      stats.byCategory[contact.category] = (stats.byCategory[contact.category] || 0) + 1;
      
      // Count by priority
      stats.byPriority[contact.priority]++;
      
      // Count user-added vs default
      if (contact.isDefault) {
        stats.default++;
      } else {
        stats.userAdded++;
      }
    }
    
    return stats;
  }
}

// Create singleton instance
window.EmergencyContacts = EmergencyContacts;