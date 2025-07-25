import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { getCurrentMonthDates } from "../utils/dateUtils";

export const useMaterials = (token) => {
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(() => getCurrentMonthDates());

  const fetchMaterials = async (customDateRange = null) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const { start, end } = customDateRange || dateRange;
      const data = await apiService.getMaterials(token, start, end);

      setMaterialsData(data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      setError(err.message || "Failed to fetch materials data");
    } finally {
      setLoading(false);
    }
  };

  const refetchMaterials = () => {
    fetchMaterials();
  };

  const updateDateRange = (newDateRange) => {
    setDateRange(newDateRange);
    fetchMaterials(newDateRange);
  };

  // Fetch data when token is available
  useEffect(() => {
    if (token) {
      fetchMaterials();
    }
  }, [token]);

  return {
    materialsData,
    loading,
    error,
    dateRange,
    refetchMaterials,
    updateDateRange,
    setError,
  };
};
