// ============================================
// AUTHENTICATION CONTEXT
// Global state management for user authentication
// ============================================

import React, { createContext, useState, useEffect } from 'react';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on component mount
  useEffect(() => {
    if (token) {
      const username = localStorage.getItem('username');
      setUser({ username });
    }
  }, [token]);

  // Login function
  const login = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setToken(token);
    setUser({ username });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  // Provide user, token, login, and logout to all children
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};