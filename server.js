// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// // Load environment variables
// dotenv.config();

// console.log('🚀 Starting server...');
// console.log('Environment variables loaded');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('PORT:', process.env.PORT);
// console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// const app = express();

// // Enhanced CORS configuration - Allow all origins for now
// const corsOptions = {
//   origin: true, // Allow all origins temporarily to fix the issue
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'Authorization',
//     'Cache-Control',
//     'Pragma'
//   ],
//   optionsSuccessStatus: 200
// };

// // Log all incoming requests for debugging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   console.log('Origin:', req.headers.origin);
//   console.log('User-Agent:', req.headers['user-agent']);
//   next();
// });

// // Apply CORS middleware
// app.use(cors(corsOptions));

// // Handle preflight requests explicitly
// app.options('*', cors(corsOptions));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Request logging middleware (helpful for debugging)
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
//   next();
// });

// // Health check endpoint (moved before routes for priority)
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development',
//     port: process.env.PORT || 5000
//   });
// });

// // Routes
// const progressRoutes = require('./routes/progress');
// app.use('/api', progressRoutes);

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     console.log('🔗 Attempting to connect to MongoDB...');
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// // Error handling middleware
// app.use((error, req, res, next) => {
//   console.error('Server error:', error);
//   res.status(500).json({ 
//     error: 'Internal server error',
//     message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   console.log('404 - Route not found:', req.method, req.originalUrl);
//   res.status(404).json({ 
//     error: 'Route not found',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 5000;

// console.log('🔧 Setting up server...');
// console.log('Target PORT:', PORT);

// connectDB().then(() => {
//   console.log('🌐 Starting HTTP server...');
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log('🎉 Server successfully started!');
//     console.log(`📍 Server running on port ${PORT}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    
//     if (process.env.NODE_ENV === 'production') {
//       console.log(`🚀 Production URL: https://tootdude-assignment-backend-production.up.railway.app/api/health`);
//     }
    
//     console.log('✅ Server is ready to accept connections');
//   });
// }).catch(error => {
//   console.error('💥 Failed to start server:', error);
//   console.error('Stack trace:', error.stack);
//   process.exit(1);
// });


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

console.log('🚀 Starting server...');
console.log('Environment variables loaded');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

const app = express();

// Allowed frontend origins for CORS
const allowedOrigins = [
  'https://tootdude-assignment-frontend-9idc.vercel.app'
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin like Postman or curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // origin allowed
    } else {
      callback(new Error('Not allowed by CORS')); // origin not allowed
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200
};

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Health check endpoint (moved before routes for priority)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

// Routes
const progressRoutes = require('./routes/progress');
app.use('/api', progressRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start the server
const PORT = process.env.PORT || 5000;

console.log('🔧 Setting up server...');
console.log('Target PORT:', PORT);

connectDB().then(() => {
  console.log('🌐 Starting HTTP server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 Server successfully started!');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`🚀 Production URL: https://tootdude-assignment-backend-production.up.railway.app/api/health`);
    }
    
    console.log('✅ Server is ready to accept connections');
  });
}).catch(error => {
  console.error('💥 Failed to start server:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});
