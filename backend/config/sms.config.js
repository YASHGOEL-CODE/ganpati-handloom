module.exports = {
  // Active provider: 'msg91', 'twilio', 'aws_sns', 'mock'
  activeProvider: process.env.SMS_PROVIDER || 'mock',

  // Enable/disable SMS sending globally
  enabled: process.env.SMS_ENABLED !== 'false',

  // Development mode (uses mock provider regardless of config)
  isDevelopment: process.env.NODE_ENV === 'development',

  // Retry configuration
  retry: {
    maxAttempts: parseInt(process.env.SMS_MAX_ATTEMPTS) || 3,
    backoffDelay: 5000, // 5 seconds
    backoffMultiplier: 2, // Exponential backoff
  },

  // Rate limiting
  rateLimit: {
    maxPerMinute: 60,
    maxPerHour: 500,
  },

  // Provider configurations
  providers: {
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY,
      senderId: process.env.MSG91_SENDER_ID || 'GANPAT',
      route: process.env.MSG91_ROUTE || '4', // Transactional
      country: process.env.MSG91_COUNTRY || '91',
      apiUrl: 'https://api.msg91.com/api/v5/flow/',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
    aws_sns: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1',
    },
    mock: {
      delay: 1000, // Simulate 1 second delay
      successRate: 0.95, // 95% success rate in mock
    },
  },

  // Default country code
  defaultCountryCode: '+91',

  // SMS cost tracking (in INR)
  costs: {
    msg91: 0.20, // 20 paise per SMS
    twilio: 0.50,
    aws_sns: 0.30,
    mock: 0,
  },
};