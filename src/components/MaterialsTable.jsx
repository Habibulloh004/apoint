import React, { useState, useMemo } from "react";
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
  console.log(materialsData)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return materialsData;

    const term = searchTerm.toLowerCase();
    return materialsData.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.parent.toLowerCase().includes(term)
    );
  }, [materialsData, searchTerm]);

  // Group and calculate totals
  const groupedData = useMemo(
    () => groupMaterialsData(filteredData),
    [filteredData]
  );
  const totals = useMemo(() => calculateTotals(groupedData), [groupedData]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const allKeys = {};
    Object.keys(groupedData).forEach((parent) => {
      allKeys[parent] = true;
      Object.keys(groupedData[parent]).forEach((category) => {
        allKeys[`${parent}-${category}`] = true;
      });
    });
    setExpandedGroups(allKeys);
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="input-primary pl-10 w-64"
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
          <div className="overflow-x-auto table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-right">Start Amount</th>
                  <th className="table-header text-right">Start Sum</th>
                  <th className="table-header text-right">Income Amount</th>
                  <th className="table-header text-right">Income Sum</th>
                  <th className="table-header text-right">Outgo Amount</th>
                  <th className="table-header text-right">Outgo Sum</th>
                  <th className="table-header text-right">End Amount</th>
                  <th className="table-header text-right">End Sum</th>
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
                            groupedData[parent][category].map((item) => (
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
                                          Code:
                                        </span>
                                        <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                          {item.code || "N/A"}
                                        </span>
                                      </span>
                                      <span className="ml-3">
                                        <span className="font-medium">
                                          Unit:
                                        </span>
                                        <span className="ml-1">
                                          {item.unit}
                                        </span>
                                      </span>
                                      <span className="ml-3">
                                        <span className="font-medium">ID:</span>
                                        <span className="ml-1">
                                          {item.material_id}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="table-cell text-right text-gray-600">
                                  {formatNumber(item.remind_start_amount)}
                                </td>
                                <td className="table-cell text-right text-gray-600">
                                  {formatNumber(item.remind_start_sum)}
                                </td>
                                <td className="table-cell text-right text-green-600">
                                  {formatNumber(item.remind_income_amount)}
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
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaterialsTable;
