const mongoose = require('mongoose');

const intervalSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  end: { type: Number, required: true },
});

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  intervals: [intervalSchema],
  videoDuration: { type: Number, required: true },
  lastWatchedPosition: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Progress', progressSchema);