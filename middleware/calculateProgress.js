const calculateUniqueProgress = (req, res, next) => {
  const { intervals, videoDuration } = req.body;

  if (!intervals || !videoDuration) {
    return res.status(400).json({ error: 'Intervals and videoDuration are required' });
  }

  // Merge overlapping intervals to calculate unique watched time
  const sortedIntervals = intervals.sort((a, b) => a.start - b.start);
  const mergedIntervals = [];
  let currentInterval = { ...sortedIntervals[0] };

  for (let i = 1; i < sortedIntervals.length; i++) {
    const nextInterval = sortedIntervals[i];
    if (currentInterval.end >= nextInterval.start) {
      // Overlapping intervals, merge them
      currentInterval.end = Math.max(currentInterval.end, nextInterval.end);
    } else {
      // Non-overlapping, push the current interval and start a new one
      mergedIntervals.push(currentInterval);
      currentInterval = { ...nextInterval };
    }
  }
  mergedIntervals.push(currentInterval);

  // Calculate total unique watched time
  const uniqueWatchedTime = mergedIntervals.reduce((total, interval) => {
    return total + (interval.end - interval.start);
  }, 0);

  // Calculate progress as a percentage
  const progress = (uniqueWatchedTime / videoDuration) * 100;

  // Attach calculated progress to the request
  req.calculatedProgress = progress;
  req.mergedIntervals = mergedIntervals;

  next();
};

module.exports = calculateUniqueProgress;