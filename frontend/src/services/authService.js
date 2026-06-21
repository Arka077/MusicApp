import apiClient from "./api";

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", {
      username: userData.username || userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
  },

  updateProfile: async (formData) => {
    const response = await apiClient.put("/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },
};
