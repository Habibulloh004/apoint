/**
 * Get the start and end dates of the current month
 * @returns {Object} Object with start and end date strings in YYYY-MM-DD format
 */
export const getCurrentMonthDates = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: startOfMonth.toISOString().split("T")[0],
    end: endOfMonth.toISOString().split("T")[0],
  };
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date for API requests
 * @param {Date} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatApiDate = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Get date range for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} Object with start and end date strings
 */
export const getMonthDates = (year, month) => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  return {
    start: formatApiDate(startOfMonth),
    end: formatApiDate(endOfMonth),
  };
};

/**
 * Get the current month name and year
 * @returns {string} Current month and year (e.g., "July 2025")
 */
export const getCurrentMonthDisplay = () => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

/**
 * Check if a date is within a range
 * @param {string|Date} date - Date to check
 * @param {string|Date} startDate - Start of range
 * @param {string|Date} endDate - End of range
 * @returns {boolean} True if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return checkDate >= start && checkDate <= end;
};

/**
 * Add months to a date
 * @param {Date} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date with months added
 */
export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Get previous month dates
 * @returns {Object} Object with start and end date strings for previous month
 */
export const getPreviousMonthDates = () => {
  const now = new Date();
  const prevMonth = addMonths(now, -1);
  return getMonthDates(prevMonth.getFullYear(), prevMonth.getMonth());
};

/**
 * Get next month dates
 * @returns {Object} Object with start and end date strings for next month
 */
export const getNextMonthDates = () => {
  const now = new Date();
  const nextMonth = addMonths(now, 1);
  return getMonthDates(nextMonth.getFullYear(), nextMonth.getMonth());
};
