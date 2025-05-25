require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express
const app = express();

// ======================
// Enhanced CORS Configuration (Matching your original setup)
// ======================
const allowedOrigins = [
  "https://aum-pharma-frontend.techbv.in",
  "https://aum-pharma.techbv.in",
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:3002",
  "https://aumpharma.techbv.in",
  "https://aumpharmacy.com",
  "https://www.aumpharmacy.com",
  "https://*.aumpharmacy.com",
  "https://tootdude-assignment-frontend-9idc.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests

// ======================
// Middleware
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// ======================
// Routes
// ======================
// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add your actual routes here
// app.use('/api/progress', require('./routes/progress'));

// ======================
// Error Handling
// ======================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler (Enhanced with CORS error handling)
app.use((err, req, res, next) => {
  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy'
    });
  }

  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('\n=== Server Started ===');
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS Origins: ${allowedOrigins.length} allowed origins`);
    console.log(`🗄️ Database: ${mongoose.connection.host.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  });
};

startServer();