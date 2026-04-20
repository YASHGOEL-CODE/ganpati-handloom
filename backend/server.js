// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const path = require('path');
// const { notFound, errorHandler } = require('./middleware/errorHandler');

// // Load environment variables
// dotenv.config();

// // Connect to database
// connectDB();

// require('./services/orderService');

// const app = express();

// // Trust proxy
// app.set('trust proxy', 1);

// // CORS configuration
// const corsOptions = {
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// // Body parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Serve uploaded files - MUST be before any other middleware
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   setHeaders: (res, filepath) => {
//     console.log('📸 Serving file:', filepath);
//   }
// }));

// // ============================================
// // SECURITY MIDDLEWARE
// // ============================================
// const {
//   apiLimiter,
//   preventParameterPollution,
//   securityHeaders,
//   requestLogger,
//   mongoSanitize,
//   xss,
// } = require('./middleware/security');

// app.use(securityHeaders);
// app.use(mongoSanitize);
// app.use(xss);
// app.use(preventParameterPollution);
// app.use(requestLogger);

// // ============================================
// // ROUTES
// // ============================================

// // Admin routes (no additional middleware)
// app.use('/admin', require('./routes/admin'));

// // Public routes
// app.use('/api/auth',            require('./routes/auth'));
// app.use('/api/products',        require('./routes/products'));
// app.use('/api/users',           require('./routes/users'));
// app.use('/api/orders',          require('./routes/orders'));
// app.use('/api/reviews',         require('./routes/reviews'));
// app.use('/api/wishlist',        require('./routes/wishlist'));
// app.use('/api/recommendations', require('./routes/recommendations'));
// app.use('/api/interactions',    require('./routes/interactions'));
// app.use('/api/sms',             require('./routes/sms'));
// app.use('/api/addresses',       require('./routes/address'));
// app.use('/api/geocoding',       require('./routes/geocoding'));
// app.use('/api/otp',             require('./routes/otp'));
// app.use('/api/notifications',   require('./routes/notifications'));
// app.use('/api/coupons',         require('./routes/coupons'));

// // ✅ NEW: Festive collections route
// app.use('/api/festive-collections', require('./routes/festiveCollectionRoutes'));

// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({ message: 'Ganpati Handloom API is running securely...' });
// });

// // Error handlers
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
// });

// // Handle unhandled rejections
// process.on('unhandledRejection', (err) => {
//   console.error('❌ Unhandled Promise Rejection:', err);
//   process.exit(1);
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('❌ Uncaught Exception:', err);
//   process.exit(1);
// });



const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

require('./services/orderService');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// ============================================
// ✅ PRO-LEVEL CORS CONFIGURATION (SAFE)
// ============================================
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  process.env.CLIENT_URL   // Production frontend (Vercel)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ============================================
// BODY PARSER
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath) => {
    console.log('📸 Serving file:', filepath);
  }
}));

// ============================================
// SECURITY MIDDLEWARE
// ============================================
const {
  apiLimiter,
  preventParameterPollution,
  securityHeaders,
  requestLogger,
  mongoSanitize,
  xss,
} = require('./middleware/security');

app.use(securityHeaders);
app.use(mongoSanitize);
app.use(xss);
app.use(preventParameterPollution);
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================

// Admin routes
app.use('/admin', require('./routes/admin'));

// Public routes
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/orders',          require('./routes/orders'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/wishlist',        require('./routes/wishlist'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/interactions',    require('./routes/interactions'));
app.use('/api/sms',             require('./routes/sms'));
app.use('/api/addresses',       require('./routes/address'));
app.use('/api/geocoding',       require('./routes/geocoding'));
app.use('/api/otp',             require('./routes/otp'));
app.use('/api/notifications',   require('./routes/notifications'));
app.use('/api/coupons',         require('./routes/coupons'));

// Festive collections
app.use('/api/festive-collections', require('./routes/festiveCollectionRoutes'));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint (for Render test)
app.get('/', (req, res) => {
  res.send("Ganpati Handloom API is running successfully! 🙏");
});

// ============================================
// ERROR HANDLERS
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================
// GLOBAL ERROR HANDLING
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});