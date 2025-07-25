export const getCurrentMonthDates = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: startOfMonth.toISOString().split("T")[0],
    end: endOfMonth.toISOString().split("T")[0],
  };
};

export const formatDisplayDate = (date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatApiDate = (date) => {
  return date.toISOString().split("T")[0];
};

export const getMonthDates = (year, month) => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  return {
    start: formatApiDate(startOfMonth),
    end: formatApiDate(endOfMonth),
  };
};

export const getCurrentMonthDisplay = () => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return checkDate >= start && checkDate <= end;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getPreviousMonthDates = () => {
  const now = new Date();
  const prevMonth = addMonths(now, -1);
  return getMonthDates(prevMonth.getFullYear(), prevMonth.getMonth());
};

export const getNextMonthDates = () => {
  const now = new Date();
  const nextMonth = addMonths(now, 1);
  return getMonthDates(nextMonth.getFullYear(), nextMonth.getMonth());
};
