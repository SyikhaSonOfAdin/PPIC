/**
 * Generate period dates based on start date, due date, interval, and type
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} dueDate - Due date in YYYY-MM-DD format
 * @param {number} intervalDays - Number of days between periods
 * @param {string} periodType - Type of period (weekly, monthly, custom)
 * @returns {Array<{start: Date, end: Date, week: string}>} Array of period objects
 */
function generatePeriods(startDate, dueDate, intervalDays, periodType = 'weekly') {
  const periods = [];
  const start = new Date(startDate);
  const end = new Date(dueDate);
  
  let currentStart = new Date(start);
  let periodCount = 1;
  
  // Determine period label prefix based on type
  let periodPrefix = 'Week';
  if (periodType === 'monthly') {
    periodPrefix = 'Month';
  } else if (periodType === 'custom') {
    periodPrefix = 'Period';
  }
  
  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + intervalDays - 1);
    
    // Don't exceed the project due date
    if (currentEnd > end) {
      currentEnd.setTime(end.getTime());
    }
    
    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd),
      week: `${periodPrefix} ${periodCount}`,
    });
    
    // Move to next period
    currentStart.setDate(currentStart.getDate() + intervalDays);
    periodCount++;
  }
  
  return periods;
}

/**
 * Get interval days based on period type
 * @param {string} periodType - Type of period (weekly, monthly, custom)
 * @param {number} customInterval - Custom interval in days (for custom type)
 * @returns {number} Number of days for the interval
 */
function getIntervalDays(periodType, customInterval) {
  switch (periodType) {
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    case 'custom':
      return customInterval || 7;
    default:
      return 7;
  }
}

module.exports = {
  generatePeriods,
  getIntervalDays,
};
