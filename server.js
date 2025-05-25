const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (optional - can use JSON file for demo)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('Using in-memory storage (no MongoDB URI provided)');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// In-memory storage for demo (replace with MongoDB in production)
let progressData = {};

// Video Progress Schema (for MongoDB)
const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  intervals: [{
    start: Number,
    end: Number
  }],
  lastWatchedPosition: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  videoDuration: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

// Utility functions
function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  
  intervals.sort((a, b) => a.start - b.start);
  const merged = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end + 1) { // Allow 1 second gap
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push(intervals[i]);
    }
  }
  
  return merged;
}

function calculateProgress(intervals, videoDuration) {
  const merged = mergeIntervals(intervals);
  const watchedSeconds = merged.reduce((acc, cur) => acc + (cur.end - cur.start), 0);
  return Math.min(100, (watchedSeconds / videoDuration) * 100);
}

// Routes

// Save progress
app.post('/api/progress', async (req, res) => {
  try {
    const { userId, videoId, intervals, videoDuration, currentTime } = req.body;
    
    if (!userId || !videoId || !intervals || !videoDuration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const progress = calculateProgress(intervals, videoDuration);
    const lastWatchedPosition = currentTime || intervals[intervals.length - 1]?.end || 0;

    if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
      // Use MongoDB
      const existingProgress = await Progress.findOne({ userId, videoId });
      
      if (existingProgress) {
        // Merge with existing intervals
        const allIntervals = [...existingProgress.intervals, ...intervals];
        const mergedIntervals = mergeIntervals(allIntervals);
        
        existingProgress.intervals = mergedIntervals;
        existingProgress.progress = calculateProgress(mergedIntervals, videoDuration);
        existingProgress.lastWatchedPosition = lastWatchedPosition;
        existingProgress.updatedAt = new Date();
        
        await existingProgress.save();
      } else {
        const newProgress = new Progress({
          userId,
          videoId,
          intervals: mergeIntervals(intervals),
          progress,
          lastWatchedPosition,
          videoDuration
        });
        
        await newProgress.save();
      }
    } else {
      // Use in-memory storage
      const key = `${userId}_${videoId}`;
      if (progressData[key]) {
        const allIntervals = [...progressData[key].intervals, ...intervals];
        const mergedIntervals = mergeIntervals(allIntervals);
        
        progressData[key] = {
          ...progressData[key],
          intervals: mergedIntervals,
          progress: calculateProgress(mergedIntervals, videoDuration),
          lastWatchedPosition,
          updatedAt: new Date().toISOString()
        };
      } else {
        progressData[key] = {
          userId,
          videoId,
          intervals: mergeIntervals(intervals),
          progress,
          lastWatchedPosition,
          videoDuration,
          updatedAt: new Date().toISOString()
        };
      }
    }

    res.json({ 
      success: true, 
      progress: Math.round(progress * 100) / 100,
      lastWatchedPosition 
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get progress
app.get('/api/progress', async (req, res) => {
  try {
    const { userId, videoId } = req.query;
    
    if (!userId || !videoId) {
      return res.status(400).json({ error: 'Missing userId or videoId' });
    }

    let progressRecord = null;

    if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
      // Use MongoDB
      progressRecord = await Progress.findOne({ userId, videoId });
    } else {
      // Use in-memory storage
      const key = `${userId}_${videoId}`;
      progressRecord = progressData[key] || null;
    }

    if (!progressRecord) {
      return res.json({
        progress: 0,
        lastWatchedPosition: 0,
        intervals: []
      });
    }

    res.json({
      progress: Math.round(progressRecord.progress * 100) / 100,
      lastWatchedPosition: progressRecord.lastWatchedPosition,
      intervals: progressRecord.intervals
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user progress (bonus)
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userProgress = [];

    if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
      userProgress = await Progress.find({ userId });
    } else {
      userProgress = Object.values(progressData).filter(p => p.userId === userId);
    }

    res.json(userProgress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});