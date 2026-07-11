import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  useEffect(() => {
    const validateSession = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.token) {
            // Verify with backend
            const config = {
              headers: { Authorization: `Bearer ${userData.token}` }
            };
            const { data } = await axios.get('/api/auth/validate', config);
            
            // Keep user token since backend /validate returns user details without token
            const updatedUser = { ...data, token: userData.token };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session validation failed or expired:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
