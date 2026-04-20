const BaseSMSProvider = require('../BaseSMSProvider');
const axios = require('axios');

class MSG91Provider extends BaseSMSProvider {
  constructor(config) {
    super(config);
    this.providerName = 'msg91';
    this.apiUrl = config.apiUrl || 'https://api.msg91.com/api/v5/flow/';
  }

  validateConfig() {
    if (!this.config.authKey) {
      throw new Error('MSG91 Auth Key is required');
    }
    if (!this.config.senderId) {
      throw new Error('MSG91 Sender ID is required');
    }
    return true;
  }

  async send(phone, message, options = {}) {
    this.validateConfig();

    try {
      // Format phone for MSG91 (remove + and country code for API)
      const formattedPhone = this.formatPhone(phone, '').replace(/^\+/, '');

      const payload = {
        authkey: this.config.authKey,
        mobiles: formattedPhone,
        message: message,
        sender: this.config.senderId,
        route: this.config.route || '4', // 4 = Transactional
        country: this.config.country || '91',
        DLT_TE_ID: options.templateId || '', // DLT Template ID (required for India)
      };

      const response = await axios.post(
        'https://api.msg91.com/api/sendhttp.php',
        null,
        { params: payload }
      );

      const isSuccess = response.data.type === 'success' || 
                       response.status === 200;

      return {
        success: isSuccess,
        messageId: response.data.message_id || response.data.request_id,
        provider: this.providerName,
        phone: formattedPhone,
        response: response.data,
      };
    } catch (error) {
      console.error('MSG91 Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: this.providerName,
        phone,
      };
    }
  }

  async getStatus(messageId) {
    try {
      const response = await axios.get(
        'https://api.msg91.com/api/v5/report',
        {
          params: {
            authkey: this.config.authKey,
            message_id: messageId,
          },
        }
      );

      return {
        status: response.data.status,
        deliveredAt: response.data.delivered_at,
      };
    } catch (error) {
      return null;
    }
  }

  getCost() {
    return 0.20; // Rs 0.20 per SMS (approximate)
  }
}

module.exports = MSG91Provider;