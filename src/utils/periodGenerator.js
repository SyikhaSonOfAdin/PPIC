function generatePeriods(startDate, dueDate, intervalDays, periodType = 'weekly', advancedSettings = {}) {
  const periods = [];
  const start = new Date(startDate);
  const end = new Date(dueDate);
  const capacity = advancedSettings.capacity || 0;
  
  let currentStart = new Date(start);
  
  if (advancedSettings.startOffset) {
    const offsetDays = advancedSettings.startOffsetUnit === 'weeks' 
      ? advancedSettings.startOffset * 7
      : advancedSettings.startOffsetUnit === 'months'
      ? advancedSettings.startOffset * 30
      : advancedSettings.startOffset;
    currentStart.setDate(currentStart.getDate() + offsetDays);
    console.log(`[PERIOD] Applied start offset: +${offsetDays} days`);
  }
  
  let periodCount = 1;
  let periodPrefix = 'Week';
  if (periodType === 'monthly') {
    periodPrefix = 'Month';
  } else if (periodType === 'custom') {
    periodPrefix = 'Period';
  }
  
  if (advancedSettings.labelFormat) {
    periodPrefix = '';
  }
  
  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + intervalDays - 1);
    
    if (currentEnd > end) {
      currentEnd.setTime(end.getTime());
    }
    
    let label = advancedSettings.labelFormat 
      ? advancedSettings.labelFormat.replace('{n}', periodCount)
      : `${periodPrefix} ${periodCount}`;
    
    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd),
      week: label,
    });
    
    currentStart.setDate(currentStart.getDate() + intervalDays);
    periodCount++;
  }
  
  if (advancedSettings.bufferPercentage && advancedSettings.bufferPercentage > 0) {
    const bufferDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24) * advancedSettings.bufferPercentage / 100);
    const bufferEnd = new Date(end);
    bufferEnd.setDate(bufferEnd.getDate() + bufferDays);
    
    const bufferLabel = advancedSettings.labelFormat 
      ? advancedSettings.labelFormat.replace('{n}', periodCount)
      : `${periodPrefix} ${periodCount}`;
    
    periods.push({
      start: new Date(end),
      end: bufferEnd,
      week: bufferLabel,
      isBuffer: true,
    });
    console.log(`[PERIOD] Added ${advancedSettings.bufferPercentage}% buffer: ${bufferDays} days`);
  }
  
  if (advancedSettings.distributeByCapacity && capacity > 0) {
    const totalPeriods = periods.filter(p => !p.isBuffer).length;
    const amountPerPeriod = capacity / totalPeriods;
    const percentagePerPeriod = 100 / totalPeriods;
    
    periods.forEach((period, index) => {
      if (!period.isBuffer) {
        period.defaultPercentage = Math.round(percentagePerPeriod * 100) / 100;
        period.defaultAmount = Math.round(amountPerPeriod * 100) / 100;
      } else {
        period.defaultPercentage = 0;
        period.defaultAmount = 0;
      }
    });
    console.log(`[PERIOD] Distributed capacity: ${amountPerPeriod.toFixed(2)} per period (${percentagePerPeriod.toFixed(2)}% each)`);
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
