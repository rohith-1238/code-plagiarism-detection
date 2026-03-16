import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// ✅ Correct backend base URL
const API = `${process.env.REACT_APP_API_URL}/api/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ----------------------
  // SIGNUP
  // ----------------------
  const signup = async (name, email, password, confirm_password) => {
    const response = await axios.post(
      `${API}/signup`,
      {
        name: name,
        email: email,
        password: password,
        confirm_password: confirm_password
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  // ----------------------
  // LOGIN
  // ----------------------
  const login = async (email, password) => {
    const response = await axios.post(
      `${API}/login`,
      {
        email: email,
        password: password
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  // ----------------------
  // LOGOUT
  // ----------------------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => useContext(AuthContext);
