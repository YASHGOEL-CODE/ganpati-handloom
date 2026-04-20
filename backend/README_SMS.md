# SMS Notification System - Documentation

## Overview
Enterprise-grade, provider-agnostic SMS notification system with automatic retry, logging, and event-based triggers.

## Features
- ✅ Provider-agnostic architecture (MSG91, Twilio, AWS SNS, Mock)
- ✅ Event-based triggers (Order confirmation, shipped, delivered)
- ✅ Automatic retry with exponential backoff
- ✅ Complete SMS logging and tracking
- ✅ Template-based messages
- ✅ Cost tracking
- ✅ Rate limiting
- ✅ Mock provider for testing

## Supported Providers

### 1. Mock Provider (Development)
- Used automatically in development mode
- No API keys required
- Simulates delays and failures
- Perfect for testing

### 2. MSG91 (Recommended for India)
- Low cost (₹0.20 per SMS)
- High delivery rate
- DLT compliant
- Setup:
```env
  SMS_PROVIDER=msg91
  MSG91_AUTH_KEY=your_key
  MSG91_SENDER_ID=GANPAT
```

### 3. Twilio (International)
- Global coverage
- Excellent documentation
- Setup:
```env
  SMS_PROVIDER=twilio
  TWILIO_ACCOUNT_SID=your_sid
  TWILIO_AUTH_TOKEN=your_token
  TWILIO_FROM_NUMBER=+1234567890
```

### 4. AWS SNS
- Enterprise-grade
- Part of AWS ecosystem
- Setup:
```env
  SMS_PROVIDER=aws_sns
  AWS_ACCESS_KEY_ID=your_key
  AWS_SECRET_ACCESS_KEY=your_secret
  AWS_REGION=ap-south-1
```

## How It Works

### 1. Order Created
```javascript
// When order is created
orderEvents.emit(EVENTS.ORDER_CREATED, { order, user });

// SMS automatically sent with template:
// "Dear John, your order #AB123456 for Rs.1500 has been confirmed..."
```

### 2. Order Shipped
```javascript
// When admin updates order status to 'shipped'
orderEvents.emit(EVENTS.ORDER_SHIPPED, { order, user });

// SMS: "Dear John, your order #AB123456 has been shipped!..."
```

### 3. Order Delivered
```javascript
// When order status updated to 'delivered'
orderEvents.emit(EVENTS.ORDER_DELIVERED, { order, user });

// SMS: "Dear John, your order #AB123456 has been delivered!..."
```

## Testing

### Test SMS Service
```bash
npm run test-sms
```

### Test with Mock Provider
```env
NODE_ENV=development
SMS_PROVIDER=mock
```

### Test with Real Provider
```env
NODE_ENV=production
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_actual_key
```

## Configuration

### Enable/Disable SMS
```env
SMS_ENABLED=true  # Set to false to disable all SMS
```

### Set Provider
```env
SMS_PROVIDER=mock  # mock, msg91, twilio, aws_sns
```

### Retry Configuration
```env
SMS_MAX_ATTEMPTS=3  # Maximum retry attempts
```

## API Endpoints

### Get SMS Logs (User)
```
GET /api/sms/logs
Authorization: Bearer <token>
```

### Get SMS Statistics (Admin)
```
GET /api/sms/stats
Authorization: Bearer <admin-token>
```

### Send Test SMS (Admin)
```
POST /api/sms/test
Authorization: Bearer <admin-token>
{
  "phone": "9876543210",
  "message": "Test message"
}
```

### Resend Failed SMS (Admin)
```
POST /api/sms/resend/:smsLogId
Authorization: Bearer <admin-token>
```

## Templates

### Available Templates
- `order_confirmation` - Order placed
- `order_shipped` - Order shipped
- `order_delivered` - Order delivered
- `order_cancelled` - Order cancelled
- `otp_verification` - OTP codes
- `password_reset` - Password reset links
- `custom` - Custom messages

### Add New Template
Edit `backend/services/sms/templates.js`:
```javascript
templates.my_template = {
  name: 'My Template',
  getMessage: (data) => {
    return `Your custom message: ${data.value}`;
  },
};
```

## Monitoring

### View SMS Logs in MongoDB
```javascript
db.smslogs.find().sort({createdAt: -1}).limit(10)
```

### Check Success Rate
```javascript
db.smslogs.aggregate([
  {$group: {
    _id: '$status',
    count: {$sum: 1}
  }}
])
```

## Switching Providers

### From Mock to MSG91
1. Get MSG91 account and API key
2. Update .env:
```env
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_actual_key
   MSG91_SENDER_ID=GANPAT
```
3. Restart server
4. Test with: `npm run test-sms`

### From MSG91 to Twilio
1. Get Twilio credentials
2. Update .env:
```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_FROM_NUMBER=+1234567890
```
3. Restart server

## Cost Tracking

SMS costs are automatically tracked:
- MSG91: ₹0.20 per SMS
- Twilio: ₹0.50 per SMS
- AWS SNS: ₹0.30 per SMS
- Mock: ₹0

View total costs:
```
GET /api/sms/stats
```

## Troubleshooting

### SMS Not Sending
1. Check SMS_ENABLED=true in .env
2. Verify provider credentials
3. Check SMS logs: GET /api/sms/logs
4. Check server logs for errors

### High Failure Rate
1. Verify phone numbers are valid (10 digits for India)
2. Check provider account balance
3. Verify sender ID is approved (MSG91)
4. Check rate limits

### Testing in Development
Always use mock provider in development:
```env
NODE_ENV=development
SMS_PROVIDER=mock
```

## Production Checklist
- [ ] Set SMS_PROVIDER to real provider (msg91/twilio)
- [ ] Add actual API credentials to .env
- [ ] Test with real phone number
- [ ] Set up monitoring
- [ ] Configure rate limits
- [ ] Set up cost alerts

## Support
For issues or questions, check the SMS logs and server console output.