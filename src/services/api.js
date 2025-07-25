// import { mockMaterialsData } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true" || true;

class ApiService {
  async makeRequest(url, options = {}) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async login(username, password) {
    if (USE_MOCK_DATA) {
      // Mock login for development
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username && password) {
            resolve({
              token: `mock-jwt-token-${Date.now()}`,
              user: {
                username,
                id: 1,
                role: "user",
              },
            });
          } else {
            reject(new Error("Invalid credentials"));
          }
        }, 1000);
      });
    }

    return this.makeRequest("/hr/user/sign-in?include=token", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getMaterials(token, startDate, endDate) {
    // if (USE_MOCK_DATA) {
    //   // Mock API call with delay
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       resolve(mockMaterialsData);
    //     }, 500);
    //   });
    // }

    return this.makeRequest(
      `/reports/reports/materials?sort=name&start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async refreshToken(token) {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: `refreshed-mock-jwt-token-${Date.now()}`,
          });
        }, 500);
      });
    }

    return this.makeRequest("/hr/user/refresh-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Additional API methods can be added here
  async getUserProfile(token) {
    return this.makeRequest("/hr/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async exportMaterials(token, startDate, endDate, format = "xlsx") {
    return this.makeRequest(
      `/reports/reports/materials/export?start=${startDate}&end=${endDate}&format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

export const apiService = new ApiService();
