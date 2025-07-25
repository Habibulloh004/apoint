"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useMaterials } from "../hooks/useMaterials";
import {
  groupMaterialsData,
  calculateTotals,
  formatNumber,
} from "../utils/calculations";
import { getCurrentMonthDisplay } from "../utils/dateUtils";

const MaterialsTable = ({ token, onLogout }) => {
  const { materialsData, loading, error, refetchMaterials } =
    useMaterials(token);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleItems, setVisibleItems] = useState({});
  const tableContainerRef = useRef(null);

  const ITEMS_PER_PAGE = 10;
  const LOAD_MORE_THRESHOLD = 10; // pixels from bottom to trigger load more

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return materialsData;

    const term = searchTerm.toLowerCase();
    return materialsData.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.code && item.code.toLowerCase().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term)) ||
        (item.parent && item.parent.toLowerCase().includes(term)) ||
        (item.unit && item.unit.toLowerCase().includes(term)) ||
        (item.material_id && item.material_id.toString().includes(term))
    );
  }, [materialsData, searchTerm]);

  // Group and calculate totals
  const groupedData = useMemo(
    () => groupMaterialsData(filteredData),
    [filteredData]
  );
  const totals = useMemo(() => calculateTotals(groupedData), [groupedData]);

  // Initialize visible items for each category
  useEffect(() => {
    const initialVisibleItems = {};
    Object.keys(groupedData).forEach((parent) => {
      Object.keys(groupedData[parent]).forEach((category) => {
        const categoryKey = `${parent}-${category}`;
        initialVisibleItems[categoryKey] = Math.min(
          ITEMS_PER_PAGE,
          groupedData[parent][category].length
        );
      });
    });
    setVisibleItems(initialVisibleItems);
  }, [groupedData]);

  // Get visible items for a category with pagination
  const getVisibleCategoryItems = useCallback(
    (parent, category) => {
      const categoryKey = `${parent}-${category}`;
      const allItems = groupedData[parent]?.[category] || [];
      const visibleCount = visibleItems[categoryKey] || ITEMS_PER_PAGE;
      return allItems.slice(0, visibleCount);
    },
    [groupedData, visibleItems]
  );

  // Load more items for a category
  const loadMoreItems = useCallback(
    (parent, category) => {
      const categoryKey = `${parent}-${category}`;
      const currentVisible = visibleItems[categoryKey] || ITEMS_PER_PAGE;
      const totalItems = groupedData[parent]?.[category]?.length || 0;

      if (currentVisible < totalItems) {
        setVisibleItems((prev) => ({
          ...prev,
          [categoryKey]: Math.min(currentVisible + ITEMS_PER_PAGE, totalItems),
        }));
      }
    },
    [visibleItems, groupedData]
  );

  // Handle scroll events for infinite loading
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Check if we're near the bottom
      if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD) {
        // Find expanded categories and load more items if needed
        Object.keys(expandedGroups).forEach((key) => {
          if (expandedGroups[key] && key.includes("-")) {
            const [parent, category] = key.split("-");
            if (parent && category) {
              const categoryKey = `${parent}-${category}`;
              const currentVisible =
                visibleItems[categoryKey] || ITEMS_PER_PAGE;
              const totalItems = groupedData[parent]?.[category]?.length || 0;

              if (currentVisible < totalItems) {
                loadMoreItems(parent, category);
              }
            }
          }
        });
      }
    },
    [expandedGroups, visibleItems, groupedData, loadMoreItems]
  );

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => {
      const newState = {
        ...prev,
        [key]: !prev[key],
      };

      // When expanding a category, ensure we show initial items
      if (newState[key] && key.includes("-")) {
        const [parent, category] = key.split("-");
        if (parent && category) {
          const categoryKey = `${parent}-${category}`;
          setVisibleItems((prevVisible) => ({
            ...prevVisible,
            [categoryKey]: Math.min(
              ITEMS_PER_PAGE,
              groupedData[parent]?.[category]?.length || 0
            ),
          }));
        }
      }

      return newState;
    });
  };

  const expandAll = () => {
    const allKeys = {};
    const initialVisibleItems = {};

    Object.keys(groupedData).forEach((parent) => {
      allKeys[parent] = true;
      Object.keys(groupedData[parent]).forEach((category) => {
        const categoryKey = `${parent}-${category}`;
        allKeys[categoryKey] = true;
        initialVisibleItems[categoryKey] = Math.min(
          ITEMS_PER_PAGE,
          groupedData[parent][category].length
        );
      });
    });

    setExpandedGroups(allKeys);
    setVisibleItems((prev) => ({ ...prev, ...initialVisibleItems }));
  };

  const collapseAll = () => {
    setExpandedGroups({});
  };

  if (loading && materialsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-lg text-gray-600">
            Loading materials data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Materials Report
                </h1>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Period: {getCurrentMonthDisplay()}</span>
                </div>
              </div>

              <button
                onClick={refetchMaterials}
                disabled={loading}
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            <button onClick={onLogout} className="btn-danger">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="input-primary pl-10 w-64 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="btn-secondary text-xs px-3 py-1"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="btn-secondary text-xs px-3 py-1"
              >
                Collapse All
              </button>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredData.length} items matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div
            ref={tableContainerRef}
            className="overflow-x-auto table-container"
            onScroll={handleScroll}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="table-header" rowSpan={2}>
                    Name
                  </th>
                  <th className="table-header" rowSpan={2}>
                    Color
                  </th>
                  <th className="table-header" rowSpan={2}>
                    Unit
                  </th>
                  <th className="table-header" rowSpan={2}>
                    Code
                  </th>
                  <th className="table-header" rowSpan={2}>
                    Price
                  </th>
                  <th className="table-header text-center bg-green-300" colSpan={2}>
                    Start
                  </th>
                  <th className="table-header text-center bg-blue-300" colSpan={2}>
                    Income
                  </th>
                  <th className="table-header text-center bg-red-300" colSpan={2}>
                    Outgo
                  </th>
                  <th className="table-header text-center bg-yellow-300" colSpan={2}>
                    End
                  </th>
                </tr>
                <tr>
                  <th className="table-header bg-green-300">Amount</th>
                  <th className="table-header bg-green-300">Sum</th>
                  <th className="table-header bg-blue-300">Amount</th>
                  <th className="table-header bg-blue-300">Sum</th>
                  <th className="table-header bg-red-300">Amount</th>
                  <th className="table-header bg-red-300">Sum</th>
                  <th className="table-header bg-yellow-300">Amount</th>
                  <th className="table-header bg-yellow-300">Sum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Overall totals */}
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <strong>OVERALL TOTAL</strong>
                    </div>
                  </td>
                  <td className="table-cell"></td>
                  <td className="table-cell"></td>
                  <td className="table-cell"></td>
                  <td className="table-cell text-right font-bold text-blue-800">
                    {formatNumber(
                      Object.values(groupedData).reduce((total, parent) => {
                        return (
                          total +
                          Object.values(parent).reduce((parentTotal, items) => {
                            return (
                              parentTotal +
                              items.reduce((itemTotal, item) => {
                                return (
                                  itemTotal + (parseFloat(item.last_price) || 0)
                                );
                              }, 0)
                            );
                          }, 0)
                        );
                      }, 0)
                    )}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-800">
                    {formatNumber(totals.overallTotals.remind_start_amount)}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-800">
                    {formatNumber(totals.overallTotals.remind_start_sum)}
                  </td>
                  <td className="table-cell text-right font-bold text-green-700">
                    {formatNumber(totals.overallTotals.remind_income_amount)}
                  </td>
                  <td className="table-cell text-right font-bold text-green-700">
                    {formatNumber(totals.overallTotals.remind_income_sum)}
                  </td>
                  <td className="table-cell text-right font-bold text-red-700">
                    {formatNumber(totals.overallTotals.remind_outgo_amount)}
                  </td>
                  <td className="table-cell text-right font-bold text-red-700">
                    {formatNumber(totals.overallTotals.remind_outgo_sum)}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-800">
                    {formatNumber(totals.overallTotals.remind_end_amount)}
                  </td>
                  <td className="table-cell text-right font-bold text-blue-800">
                    {formatNumber(totals.overallTotals.remind_end_sum)}
                  </td>
                </tr>

                {/* Grouped data */}
                {Object.keys(groupedData).map((parent) => (
                  <React.Fragment key={parent}>
                    {/* Parent row */}
                    <tr
                      className="bg-gray-100 table-row-hover cursor-pointer"
                      onClick={() => toggleGroup(parent)}
                    >
                      <td className="table-cell">
                        <div className="flex items-center">
                          {expandedGroups[parent] ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-gray-600" />
                          )}
                          <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                          <strong className="text-gray-900">{parent}</strong>
                        </div>
                      </td>
                      <td className="table-cell"></td>
                      <td className="table-cell"></td>
                      <td className="table-cell"></td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          Object.values(groupedData[parent]).reduce(
                            (total, items) => {
                              return (
                                total +
                                items.reduce((itemTotal, item) => {
                                  return (
                                    itemTotal +
                                    (parseFloat(item.last_price) || 0)
                                  );
                                }, 0)
                              );
                            },
                            0
                          )
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_start_amount[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_start_sum[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_income_amount[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_income_sum[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_outgo_amount[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_outgo_sum[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_end_amount[parent]
                        )}
                      </td>
                      <td className="table-cell text-right font-medium text-gray-800">
                        {formatNumber(
                          totals.parentTotals.remind_end_sum[parent]
                        )}
                      </td>
                    </tr>

                    {/* Categories and items */}
                    {expandedGroups[parent] &&
                      Object.keys(groupedData[parent]).map((category) => (
                        <React.Fragment key={`${parent}-${category}`}>
                          {/* Category row */}
                          <tr
                            className="bg-gray-50 table-row-hover cursor-pointer collapsible-row"
                            onClick={() => toggleGroup(`${parent}-${category}`)}
                          >
                            <td className="table-cell">
                              <div className="flex items-center pl-6">
                                {expandedGroups[`${parent}-${category}`] ? (
                                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                                )}
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                <span className="font-medium text-gray-700">
                                  {category}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({groupedData[parent][category].length} items)
                                </span>
                              </div>
                            </td>
                            <td className="table-cell"></td>
                            <td className="table-cell"></td>
                            <td className="table-cell"></td>
                            <td className="table-cell"></td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_start_amount[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_start_sum[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_income_amount[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_income_sum[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_outgo_amount[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_outgo_sum[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_end_amount[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                            <td className="table-cell text-right text-gray-700">
                              {formatNumber(
                                totals.categoryTotals.remind_end_sum[
                                  `${parent}-${category}`
                                ]
                              )}
                            </td>
                          </tr>

                          {/* Individual items */}
                          {expandedGroups[`${parent}-${category}`] &&
                            (() => {
                              const visibleCategoryItems =
                                getVisibleCategoryItems(parent, category);
                              const totalItems =
                                groupedData[parent][category].length;
                              const currentVisible =
                                visibleItems[`${parent}-${category}`] ||
                                ITEMS_PER_PAGE;
                              const hasMore = currentVisible < totalItems;

                              return (
                                <>
                                  {visibleCategoryItems.map((item) => (
                                    <tr
                                      key={item.material_id}
                                      className="table-row-hover slide-in"
                                    >
                                      <td className="table-cell">
                                        <div className="pl-12">
                                          <div className="text-gray-900 font-medium">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            <span className="inline-flex items-center">
                                              <span className="font-medium">
                                                ID:
                                              </span>
                                              <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {item.material_id}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="table-cell text-center">
                                        <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto"></div>
                                      </td>
                                      <td className="table-cell text-center text-gray-600">
                                        {item.unit || "N/A"}
                                      </td>
                                      <td className="table-cell text-center text-gray-600">
                                        {item.code || "N/A"}
                                      </td>
                                      <td className="table-cell text-right text-gray-600">
                                        {formatNumber(item.last_price)}
                                      </td>
                                      <td className="table-cell text-right text-gray-600">
                                        {formatNumber(item.remind_start_amount)}
                                      </td>
                                      <td className="table-cell text-right text-gray-600">
                                        {formatNumber(item.remind_start_sum)}
                                      </td>
                                      <td className="table-cell text-right text-green-600">
                                        {formatNumber(
                                          item.remind_income_amount
                                        )}
                                      </td>
                                      <td className="table-cell text-right text-green-600">
                                        {formatNumber(item.remind_income_sum)}
                                      </td>
                                      <td className="table-cell text-right text-red-600">
                                        {formatNumber(item.remind_outgo_amount)}
                                      </td>
                                      <td className="table-cell text-right text-red-600">
                                        {formatNumber(item.remind_outgo_sum)}
                                      </td>
                                      <td className="table-cell text-right text-gray-600">
                                        {formatNumber(item.remind_end_amount)}
                                      </td>
                                      <td className="table-cell text-right text-gray-600">
                                        {formatNumber(item.remind_end_sum)}
                                      </td>
                                    </tr>
                                  ))}

                                  {/* Load More Button */}
                                  {hasMore && (
                                    <tr>
                                      <td
                                        colSpan={13}
                                        className="table-cell text-center py-4"
                                      >
                                        <button
                                          onClick={() =>
                                            loadMoreItems(parent, category)
                                          }
                                          className="btn-secondary text-sm px-4 py-2"
                                          disabled={loading}
                                        >
                                          {loading ? (
                                            <div className="flex items-center justify-center">
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                              Loading...
                                            </div>
                                          ) : (
                                            `Load More (${
                                              totalItems - currentVisible
                                            } remaining)`
                                          )}
                                        </button>
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })()}
                        </React.Fragment>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Total items: {materialsData.length} | Filtered:{" "}
            {filteredData.length}
            {Object.keys(expandedGroups).some(
              (key) => expandedGroups[key] && key.includes("-")
            ) && (
              <span className="ml-2">
                | Showing:{" "}
                {Object.keys(visibleItems).reduce((total, key) => {
                  return total + (visibleItems[key] || 0);
                }, 0)}{" "}
                visible items
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaterialsTable;
