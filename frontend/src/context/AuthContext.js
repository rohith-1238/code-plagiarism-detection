import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Backend URL
const API_BASE = process.env.REACT_APP_API_URL;

// Create axios instance
const API = axios.create({
  baseURL: `${API_BASE}/api/auth`,
  headers: {
    "Content-Type": "application/json"
  }
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ----------------------
  // SIGNUP
  // ----------------------
  const signup = async (name, email, password, confirm_password) => {
    try {
      const response = await API.post("/signup", {
        name,
        email,
        password,
        confirm_password
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ----------------------
  // LOGIN
  // ----------------------
  const login = async (email, password) => {
    try {
      const response = await API.post("/login", {
        email,
        password
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ----------------------
  // LOGOUT
  // ----------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export const useAuth = () => useContext(AuthContext);
