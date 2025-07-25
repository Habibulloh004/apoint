"use client";

import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const authToken = data.token.token;
        const userData = data.user || { username };

        // Save to localStorage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        throw new Error(data.error || "No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Reset state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/refresh-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const newToken = data.token;
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        return newToken;
      } else {
        throw new Error(data.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  return {
    isAuthenticated,
    token,
    user,
    loading,
    login,
    logout,
    refreshToken,
  };
};
