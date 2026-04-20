const SMSLog = require('../../models/SMSLog');
const smsConfig = require('../../config/sms.config');
const { getTemplate, validatePhone, formatOrderId } = require('./templates');

// Import providers
const MockProvider = require('./providers/MockProvider');
const MSG91Provider = require('./providers/MSG91Provider');
const TwilioProvider = require('./providers/TwilioProvider');

class SMSService {
  constructor() {
    this.provider = null;
    this.initializeProvider();
  }

  initializeProvider() {
    // In development, always use mock
    const providerName = smsConfig.isDevelopment 
      ? 'mock' 
      : smsConfig.activeProvider;

    const providerConfig = smsConfig.providers[providerName];

    switch (providerName) {
      case 'msg91':
        this.provider = new MSG91Provider(providerConfig);
        break;
      case 'twilio':
        this.provider = new TwilioProvider(providerConfig);
        break;
      case 'mock':
      default:
        this.provider = new MockProvider(providerConfig);
        break;
    }

    console.log(`📱 SMS Service initialized with provider: ${this.provider.providerName}`);
  }

  // Send SMS with template
  async sendSMS({ phone, template, data, userId, orderId, metadata = {} }) {
    // Check if SMS is globally enabled
    if (!smsConfig.enabled) {
      console.log('📱 SMS disabled globally');
      return { success: false, message: 'SMS disabled' };
    }

    try {
      // Validate and format phone
      const formattedPhone = validatePhone(phone);

      // Get message from template
      const message = getTemplate(template, data);

      // Create SMS log entry
      const smsLog = await SMSLog.create({
        user: userId,
        order: orderId,
        phone: formattedPhone,
        message,
        template,
        provider: this.provider.providerName,
        status: 'pending',
        metadata,
      });

      // Send SMS with retry logic
      const result = await this.sendWithRetry(smsLog, formattedPhone, message);

      return result;
    } catch (error) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send with retry logic
  async sendWithRetry(smsLog, phone, message, attempt = 1) {
    const maxAttempts = smsConfig.retry.maxAttempts;

    try {
      smsLog.attempts = attempt;
      smsLog.lastAttemptAt = new Date();
      await smsLog.save();

      // Send via provider
      const result = await this.provider.send(phone, message);

      if (result.success) {
        // Update log on success
        smsLog.status = 'sent';
        smsLog.providerId = result.messageId;
        smsLog.providerResponse = result.response;
        smsLog.sentAt = new Date();
        smsLog.cost = this.provider.getCost();
        await smsLog.save();

        console.log(`✅ SMS sent successfully to ${phone}`);
        return { success: true, messageId: result.messageId, smsLogId: smsLog._id };
      } else {
        // Retry if attempts remaining
        if (attempt < maxAttempts) {
          const delay = smsConfig.retry.backoffDelay * 
                       Math.pow(smsConfig.retry.backoffMultiplier, attempt - 1);
          
          console.log(`⚠️ SMS failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.sendWithRetry(smsLog, phone, message, attempt + 1);
        } else {
          // Max attempts reached
          smsLog.status = 'failed';
          smsLog.failedAt = new Date();
          smsLog.errorMessage = result.error || 'Unknown error';
          smsLog.providerResponse = result.response;
          await smsLog.save();

          console.error(`❌ SMS failed after ${maxAttempts} attempts to ${phone}`);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      smsLog.status = 'failed';
      smsLog.failedAt = new Date();
      smsLog.errorMessage = error.message;
      await smsLog.save();

      console.error('SMS Retry Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Convenience methods for common SMS types
  async sendOrderConfirmation(order, user) {
    return this.sendSMS({
      phone: user.phone,
      template: 'order_confirmation',
      data: {
        orderId: formatOrderId(order._id),
        customerName: user.fullName,
        totalAmount: order.totalPrice.toFixed(2),
        items: order.orderItems.length,
      },
      userId: user._id,
      orderId: order._id,
      metadata: { orderStatus: order.orderStatus },
    });
  }

  async sendOrderShipped(order, user) {
    return this.sendSMS({
      phone: user.phone,
      template: 'order_shipped',
      data: {
        orderId: formatOrderId(order._id),
        customerName: user.fullName,
        trackingUrl: order.trackingUrl || null,
      },
      userId: user._id,
      orderId: order._id,
      metadata: { orderStatus: order.orderStatus },
    });
  }

  async sendOrderDelivered(order, user) {
    return this.sendSMS({
      phone: user.phone,
      template: 'order_delivered',
      data: {
        orderId: formatOrderId(order._id),
        customerName: user.fullName,
      },
      userId: user._id,
      orderId: order._id,
      metadata: { orderStatus: order.orderStatus },
    });
  }

  // Get SMS statistics
  async getStats(userId = null, dateRange = null) {
    const query = {};
    
    if (userId) query.user = userId;
    if (dateRange) {
      query.createdAt = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      };
    }

    const stats = await SMSLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' },
        },
      },
    ]);

    return stats;
  }
}

// Export singleton instance
module.exports = new SMSService();