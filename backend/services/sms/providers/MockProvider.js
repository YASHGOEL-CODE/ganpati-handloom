const BaseSMSProvider = require('../BaseSMSProvider');

class MockProvider extends BaseSMSProvider {
  constructor(config) {
    super(config);
    this.providerName = 'mock';
    this.sentMessages = []; // Store for testing
  }

  validateConfig() {
    // Mock provider doesn't need real config
    return true;
  }

  async send(phone, message, options = {}) {
    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, this.config.delay || 1000)
    );

    // Simulate success/failure based on success rate
    const successRate = this.config.successRate || 0.95;
    const isSuccess = Math.random() < successRate;

    const messageId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = {
      success: isSuccess,
      messageId,
      provider: this.providerName,
      phone,
      message,
      timestamp: new Date(),
    };

    if (!isSuccess) {
      result.error = 'Mock provider simulated failure';
    }

    // Store for testing/debugging
    this.sentMessages.push(result);

    console.log('📱 [MOCK SMS]', {
      to: phone,
      message: message.substring(0, 50) + '...',
      status: isSuccess ? '✅ Sent' : '❌ Failed',
      messageId,
    });

    return result;
  }

  async getStatus(messageId) {
    const message = this.sentMessages.find(m => m.messageId === messageId);
    if (!message) return null;

    return {
      status: message.success ? 'delivered' : 'failed',
      deliveredAt: message.success ? message.timestamp : null,
    };
  }

  getCost() {
    return 0; // Mock provider is free
  }

  // Helper method for testing
  getLastMessage() {
    return this.sentMessages[this.sentMessages.length - 1];
  }

  // Helper method for testing
  getAllMessages() {
    return this.sentMessages;
  }

  // Clear message history
  clearHistory() {
    this.sentMessages = [];
  }
}

module.exports = MockProvider;