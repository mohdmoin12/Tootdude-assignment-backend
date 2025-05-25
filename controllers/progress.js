const express = require('express');
const router = express.Router();
const Progress = require('../model/progress');
const calculateProgress = require('../middleware/calculateProgress');

// Save or update progress
router.post('/progress', calculateProgress, async (req, res) => {
  const { userId, videoId, videoDuration, currentTime } = req.body;
  const intervals = req.mergedIntervals;
  const progress = req.calculatedProgress;

  try {
    let progressDoc = await Progress.findOne({ userId, videoId });

    if (progressDoc) {
      // Update existing progress
      progressDoc.intervals = intervals;
      progressDoc.videoDuration = videoDuration;
      progressDoc.lastWatchedPosition = currentTime;
      progressDoc.progress = progress;
      progressDoc.updatedAt = new Date();
    } else {
      // Create new progress
      progressDoc = new Progress({
        userId,
        videoId,
        intervals,
        videoDuration,
        lastWatchedPosition: currentTime,
        progress,
      });
    }

    await progressDoc.save();

    res.json({
      userId,
      videoId,
      intervals,
      videoDuration,
      currentTime,
      progress,
      lastWatchedPosition: currentTime,
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});


// router.post(
//   '/progress',
//   validateProgressData,
//   calculateProgress,
//   asyncHandler(async (req, res) => {
//     const { userId, videoId, videoDuration, currentTime } = req.body;
//     const intervals = req.mergedIntervals;
//     const progress = req.calculatedProgress;

//     let progressDoc = await Progress.findOne({ userId, videoId });

//     if (progressDoc) {
//       progressDoc.intervals = intervals;
//       progressDoc.videoDuration = videoDuration;
//       progressDoc.lastWatchedPosition = currentTime;
//       progressDoc.progress = progress;
//       progressDoc.updatedAt = new Date();
//     } else {
//       progressDoc = new Progress({
//         userId,
//         videoId,
//         intervals,
//         videoDuration,
//         lastWatchedPosition: currentTime,
//         progress,
//       });
//     }

//     await progressDoc.save();
//     res.json({
//       userId,
//       videoId,
//       intervals,
//       videoDuration,
//       currentTime,
//       progress,
//       lastWatchedPosition: currentTime,
//     });
//   })
// );
// Get progress for a specific video
// router.get('/progress', async (req, res) => {
//   const { userId, videoId } = req.query;

//   try {
//     const progressDoc = await Progress.findOne({ userId, videoId });

//     if (!progressDoc) {
//       return res.json({
//         progress: 0,
//         lastWatchedPosition: 0,
//         intervals: [],
//       });
//     }

//     res.json({
//       progress: progressDoc.progress,
//       lastWatchedPosition: progressDoc.lastWatchedPosition,
//       intervals: progressDoc.intervals,
//     });
//   } catch (error) {
//     console.error('Error retrieving progress:', error);
//     res.status(500).json({ error: 'Failed to retrieve progress' });
//   }
// });

// Get all progress for a user
router.get('/user/:userId/progress', async (req, res) => {
  const { userId } = req.params;

  try {
    const progressDocs = await Progress.find({ userId });

    res.json(
      progressDocs.map(doc => ({
        videoId: doc.videoId,
        progress: doc.progress,
        lastWatchedPosition: doc.lastWatchedPosition,
        intervals: doc.intervals,
        videoDuration: doc.videoDuration,
        updatedAt: doc.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Error retrieving user progress:', error);
    res.status(500).json({ error: 'Failed to retrieve user progress' });
  }
});

module.exports = router;