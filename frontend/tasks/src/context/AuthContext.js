import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi, resetPassword as resetPasswordApi, updateProfile as updateProfileApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tms_user')) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tms_token') || null);

  const login = useCallback(async (credentials) => {
    const res = await loginApi(credentials);
    const { token: t, user: u } = res.data;
    localStorage.setItem('tms_token', t);
    localStorage.setItem('tms_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    setToken(null);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (newPassword) => {
    await resetPasswordApi(newPassword);
    // update local user flag
    const updated = { ...user, must_reset_password: false };
    localStorage.setItem('tms_user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  const updateProfile = useCallback(async (data) => {
    const res = await updateProfileApi(data);
    const updated = res.data.user;
    localStorage.setItem('tms_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isProjectManager = user?.role === 'Project Manager';
  const isCollaborator = user?.role === 'Collaborator';
  const canManageTasks = isAdmin || isProjectManager;

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, resetPassword, updateProfile,
      isAdmin, isProjectManager, isCollaborator, canManageTasks,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
