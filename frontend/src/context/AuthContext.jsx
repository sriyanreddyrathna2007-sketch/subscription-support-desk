import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('supportdesk_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('supportdesk_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Auth token verification failed:", err);
          api.setToken(null);
          localStorage.removeItem('supportdesk_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('supportdesk_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (name, email, password, role = 'customer') => {
    const data = await api.register(name, email, password, role);
    api.setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('supportdesk_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem('supportdesk_user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('supportdesk_user', JSON.stringify(updatedUser));
  };

  const loginAsDemo = async (role = 'customer') => {
    const credentials = {
      customer: { email: 'customer@demo.com', password: 'Password123!' },
      agent: { email: 'agent@demo.com', password: 'Password123!' },
      admin: { email: 'admin@demo.com', password: 'Password123!' },
    };
    const cred = credentials[role] || credentials.customer;
    return await login(cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
