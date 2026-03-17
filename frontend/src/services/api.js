import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 60000,
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

// AUTH ROUTES
export const signup = (data) => API.post("/api/auth/signup", data);
export const login = (data) => API.post("/api/auth/login", data);
export const logout = () => API.post("/api/auth/logout");
export const getMe = () => API.get("/api/auth/me");

// ✅ FIXED FILE UPLOAD (NO manual Content-Type)
export const uploadFiles = (formData, onProgress) =>
  API.post("/api/upload", formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

// OTHER ROUTES
export const getAnalysis = (id) => API.get(`/api/analysis/${id}`);
export const getHistory = () => API.get("/api/history");
export const deleteAnalysis = (id) => API.delete(`/api/history/${id}`);

export default API;
