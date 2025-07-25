"use client";

import { useState, useEffect } from "react";
import { getCurrentMonthDates } from "../utils/dateUtils";
import axios from "axios";

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
      const response = await axios.get(`/api/materials?start=${start}&end=${end}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status != 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.data;
      setMaterialsData(data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch materials data"
      );
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
