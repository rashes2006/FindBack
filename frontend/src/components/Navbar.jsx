import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Bell,
  Shield,
  User,
  LogOut,
  FolderClock,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentView, setView, onOpenReport, onOpenAuth }) => {
  const {
    user,
    logout,
    demoLogin,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowDemoMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (role) => {
    await demoLogin(role);
    setShowDemoMenu(false);
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setView('catalog')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  FindBack
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Anti-Fraud Lost & Found System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setView('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'catalog'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-btn-browse"
            >
              Browse Catalog
            </button>

            {user && (
              <button
                onClick={() => setView('my-dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'my-dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="nav-btn-dashboard"
              >
                <FolderClock className="w-4 h-4 text-slate-500" />
                <span>My Claims & Reports</span>
              </button>
            )}

            <button
              onClick={() => setView('admin-hub')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'admin-hub'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-btn-admin-hub"
            >
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Security Desk Hub</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Switcher Pill (Great for evaluators) */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors shadow-sm"
                title="Switch persona for fast testing"
                id="demo-switcher-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {/* Demo Menu Dropdown */}
              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700 font-medium"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">🎓 Priya Patel</p>
                      <p className="text-[11px] text-slate-500">Student Claimant</p>
                    </div>
                    {user?.email === 'student@campus.edu' && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('finder')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700 font-medium"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">🔍 Aarav Sharma</p>
                      <p className="text-[11px] text-slate-500">Item Finder / Reporter</p>
                    </div>
                    {user?.email === 'finder@campus.edu' && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700 font-medium"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">🛡️ Officer Rajesh</p>
                      <p className="text-[11px] text-slate-500">Security Desk Officer</p>
                    </div>
                    {user?.email === 'admin@campus.edu' && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Report Item Primary Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
              id="report-item-navbar-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            {/* Notifications Popover */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  id="notifications-bell-btn"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              markNotificationRead(notif._id);
                              if (notif.link === '/my-claims' || notif.type === 'reward_received' || notif.type === 'payment_received') {
                                setView('my-dashboard');
                              }
                              setShowNotifications(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                              !notif.isRead ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 mb-0.5">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <button
                  onClick={() => setView('my-dashboard')}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  id="user-profile-btn"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {user.role === 'admin' ? 'Security Desk' : user.role}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Log out"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                id="login-btn"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
