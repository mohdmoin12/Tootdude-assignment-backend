const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ======================
//      CORS Setup
// ======================
// Allow ALL origins (*) - Simplest way
app.use(cors());  // Enables CORS for all routes

// (Optional) Explicit CORS configuration
// app.use(cors({
//   origin: '*',  // Allow any origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: false  // Disable credentials if not needed
// }));

// Handle preflight requests globally
app.options('*', cors());

// ======================
//   Middleware Setup
// ======================
// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
//       Routes
// ======================
// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Example API Route
app.get('/api/greet', (req, res) => {
  res.json({ message: 'Hello World! 👋' });
});

// ======================
//   Database Connection
// ======================
const connectDB = async () => {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// ======================
//   Error Handling
// ======================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ======================
//     Start Server
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=== Server Started ===');
    console.log(`🚀 http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔄 CORS: Enabled for ALL origins (*)`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});