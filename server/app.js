const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust proxy for rate limiting behind reverse proxies / development tools
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  validate: { xForwardedForHeader: false }
});
app.use('/api', limiter);

// Root Endpoint - Health and Status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running successfully',
    status: 'OK'
  });
});

// Base API Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GitScope Backend API is running successfully',
    status: 'OK'
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/staffRoutes'));

// 404 Handler for undefined API routes and requests
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 'NOT_FOUND'
  });
});

// Basic generic error handler - do not expose internal server errors
app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
