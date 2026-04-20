import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // ✅ SECURITY: Only restore if user is verified
          if (parsedUser.isVerified) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Clear unverified user data from storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse stored auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // ✅ CRITICAL: Check success flag from backend
      if (data.success && data.token && data.user) {
        // Double-check user is verified before storing
        if (!data.user.isVerified) {
          return {
            success: false,
            message: 'Email verification required',
            requiresVerification: true,
            email: data.user.email,
          };
        }

        // Store credentials
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update state
        setToken(data.token);
        setUser(data.user);

        return { success: true, user: data.user };
      } else {
        // ✅ Backend rejected login — return error details
        return {
          success: false,
          message: data.message || 'Login failed',
          requiresVerification: data.requiresVerification || false,
          email: data.email || email,
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};