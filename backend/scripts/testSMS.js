const mongoose = require('mongoose');
const dotenv = require('dotenv');
const smsService = require('../services/sms/SMSService');

dotenv.config();

const testSMS = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    console.log('📱 Testing SMS Service...');
    console.log(`Provider: ${smsService.provider.providerName}`);

    // Test SMS
    const result = await smsService.sendSMS({
      phone: '9876543210', // CHANGE THIS to your test number
      template: 'custom',
      data: {
        message: 'This is a test SMS from Ganpati Handloom SMS System!',
      },
    });

    console.log('\n📊 Test Result:', result);

    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ SMS failed:', result.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testSMS();