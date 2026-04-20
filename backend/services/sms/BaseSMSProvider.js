// Abstract base class for SMS providers
class BaseSMSProvider {
  constructor(config) {
    this.config = config;
    this.providerName = 'base';
  }

  // Send SMS - must be implemented by subclasses
  async send(phone, message, options = {}) {
    throw new Error('send() method must be implemented by subclass');
  }

  // Get delivery status - optional
  async getStatus(messageId) {
    return null; // Not all providers support this
  }

  // Validate configuration
  validateConfig() {
    throw new Error('validateConfig() method must be implemented by subclass');
  }

  // Format phone number
  formatPhone(phone, countryCode = '+91') {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.length !== 10) {
      throw new Error(`Invalid phone number: ${phone}`);
    }

    // Some providers want +91, some want 91, some want just 10 digits
    return this.config.includeCountryCode !== false 
      ? `${countryCode}${cleaned}` 
      : cleaned;
  }

  // Calculate cost
  getCost() {
    return 0;
  }
}

module.exports = BaseSMSProvider;