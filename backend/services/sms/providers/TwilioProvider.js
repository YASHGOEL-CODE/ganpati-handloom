const BaseSMSProvider = require('../BaseSMSProvider');
const twilio = require('twilio');

class TwilioProvider extends BaseSMSProvider {
  constructor(config) {
    super(config);
    this.providerName = 'twilio';
    this.client = null;

    if (config.accountSid && config.authToken) {
      this.client = twilio(config.accountSid, config.authToken);
    }
  }

  validateConfig() {
    if (!this.config.accountSid) {
      throw new Error('Twilio Account SID is required');
    }
    if (!this.config.authToken) {
      throw new Error('Twilio Auth Token is required');
    }
    if (!this.config.fromNumber) {
      throw new Error('Twilio From Number is required');
    }
    return true;
  }

  async send(phone, message, options = {}) {
    this.validateConfig();

    if (!this.client) {
      this.client = twilio(this.config.accountSid, this.config.authToken);
    }

    try {
      const formattedPhone = this.formatPhone(phone, '+91');

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.config.fromNumber,
        to: formattedPhone,
      });

      return {
        success: twilioMessage.status !== 'failed',
        messageId: twilioMessage.sid,
        provider: this.providerName,
        phone: formattedPhone,
        response: {
          status: twilioMessage.status,
          price: twilioMessage.price,
          priceUnit: twilioMessage.priceUnit,
        },
      };
    } catch (error) {
      console.error('Twilio Error:', error.message);

      return {
        success: false,
        error: error.message,
        provider: this.providerName,
        phone,
      };
    }
  }

  async getStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();

      return {
        status: message.status,
        deliveredAt: message.dateUpdated,
      };
    } catch (error) {
      return null;
    }
  }

  getCost() {
    return 0.50; // Approximate cost
  }
}

module.exports = TwilioProvider;