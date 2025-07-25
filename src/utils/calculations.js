/**
 * Group materials data by parent and category
 * @param {Array} data - Array of material items
 * @returns {Object} Grouped data structure
 */
export const groupMaterialsData = (data) => {
  const groups = {};

  data.forEach((item) => {
    if (!groups[item.parent]) {
      groups[item.parent] = {};
    }
    if (!groups[item.parent][item.category]) {
      groups[item.parent][item.category] = [];
    }
    groups[item.parent][item.category].push(item);
  });

  return groups;
};

/**
 * Calculate totals for all levels (overall, parent, category)
 * @param {Object} groupedData - Grouped materials data
 * @returns {Object} Calculated totals
 */
export const calculateTotals = (groupedData) => {
  const fields = [
    "remind_start_amount",
    "remind_start_sum",
    "remind_income_amount",
    "remind_income_sum",
    "remind_outgo_amount",
    "remind_outgo_sum",
    "remind_end_amount",
    "remind_end_sum",
  ];

  const overallTotals = {};
  const parentTotals = {};
  const categoryTotals = {};

  // Initialize totals
  fields.forEach((field) => {
    overallTotals[field] = 0;
    parentTotals[field] = {};
    categoryTotals[field] = {};
  });

  // Calculate totals
  Object.keys(groupedData).forEach((parent) => {
    fields.forEach((field) => {
      parentTotals[field][parent] = 0;
    });

    Object.keys(groupedData[parent]).forEach((category) => {
      const categoryKey = `${parent}-${category}`;
      fields.forEach((field) => {
        categoryTotals[field][categoryKey] = 0;
      });

      groupedData[parent][category].forEach((item) => {
        fields.forEach((field) => {
          const value = parseFloat(item[field]) || 0;
          overallTotals[field] += value;
          parentTotals[field][parent] += value;
          categoryTotals[field][categoryKey] += value;
        });
      });
    });
  });

  return { overallTotals, parentTotals, categoryTotals };
};

/**
 * Format number with thousands separators
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  const number = parseFloat(num) || 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

/**
 * Format currency
 * @param {number|string} num - Number to format as currency
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (num, currency = "USD") => {
  const number = parseFloat(num) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(number);
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calculate total inventory turnover
 * @param {Array} data - Materials data
 * @returns {Object} Turnover calculations
 */
export const calculateInventoryTurnover = (data) => {
  const totals = data.reduce(
    (acc, item) => {
      acc.totalStart += parseFloat(item.remind_start_amount) || 0;
      acc.totalEnd += parseFloat(item.remind_end_amount) || 0;
      acc.totalOutgo += parseFloat(item.remind_outgo_amount) || 0;
      return acc;
    },
    { totalStart: 0, totalEnd: 0, totalOutgo: 0 }
  );

  const averageInventory = (totals.totalStart + totals.totalEnd) / 2;
  const turnoverRatio =
    averageInventory > 0 ? totals.totalOutgo / averageInventory : 0;

  return {
    ...totals,
    averageInventory,
    turnoverRatio,
  };
};

/**
 * Sort materials by specified field
 * @param {Array} data - Materials data
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted data
 */
export const sortMaterials = (data, field, direction = "asc") => {
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle numeric fields
    if (
      field.includes("amount") ||
      field.includes("sum") ||
      field.includes("price")
    ) {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }

    // Handle string fields
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

/**
 * Filter materials by search term
 * @param {Array} data - Materials data
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered data
 */
export const filterMaterials = (data, searchTerm) => {
  if (!searchTerm) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.parent.toLowerCase().includes(term)
  );
};
