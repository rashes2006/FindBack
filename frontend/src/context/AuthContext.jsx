import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('findback_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch current user and notifications if token exists
  const fetchMe = async () => {
    if (!localStorage.getItem('findback_token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient('/auth/me');
      if (data.success) {
        setUser(data.user);
        setUnreadCount(data.stats?.unreadNotifications || 0);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await apiClient('/auth/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, password) => {
    const data = await apiClient('/auth/login', {
      body: { email, password },
    });

    if (data.success && data.token) {
      localStorage.setItem('findback_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (formData) => {
    const data = await apiClient('/auth/register', {
      body: formData,
    });

    if (data.success && data.token) {
      localStorage.setItem('findback_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  // 1-Click Demo Login for fast grading
  const demoLogin = async (role) => {
    let email = 'student@campus.edu';
    if (role === 'finder') email = 'finder@campus.edu';
    if (role === 'admin') email = 'admin@campus.edu';

    return await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('findback_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const markNotificationRead = async (id) => {
    try {
      await apiClient(`/auth/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiClient('/auth/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        notifications,
        unreadCount,
        refreshMe: fetchMe,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
