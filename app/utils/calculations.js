
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
          const value = parseFloat(String(item[field])) || 0;
          overallTotals[field] += value;
          parentTotals[field][parent] += value;
          categoryTotals[field][categoryKey] += value;
        });
      });
    });
  });

  return { overallTotals, parentTotals, categoryTotals };
};

export const formatNumber = (num) => {
  const number = parseFloat(String(num)) || 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatCurrency = (num, currency = "USD") => {
  const number = parseFloat(String(num)) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(number);
};

export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

export const calculateInventoryTurnover = (data) => {
  const totals = data.reduce(
    (acc, item) => {
      acc.totalStart += parseFloat(String(item.remind_start_amount)) || 0;
      acc.totalEnd += parseFloat(String(item.remind_end_amount)) || 0;
      acc.totalOutgo += parseFloat(String(item.remind_outgo_amount)) || 0;
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

export const sortMaterials = (data, field, direction) => {
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle numeric fields
    if (
      field.includes("amount") ||
      field.includes("sum") ||
      field.includes("price")
    ) {
      aVal = parseFloat(String(aVal)) || 0;
      bVal = parseFloat(String(bVal)) || 0;
    }

    // Handle string fields
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (direction === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

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
