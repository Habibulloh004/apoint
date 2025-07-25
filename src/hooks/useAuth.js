import { useState, useEffect } from "react";
import { apiService } from "../services/api";

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

      // Use the API service for login
      const response = await apiService.login(username, password);

      if (response.token) {
        const authToken = response.token;
        const userData = response.user || { username };

        // Save to localStorage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
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
      const response = await apiService.refreshToken(token);
      if (response.token) {
        const newToken = response.token;
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        return newToken;
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
