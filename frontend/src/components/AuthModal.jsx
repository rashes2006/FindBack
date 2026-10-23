import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentOrStaffId, setStudentOrStaffId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          studentOrStaffId,
          department,
          role
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleName) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(roleName);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base">
              {isRegister ? 'Join Campus FindBack' : 'Sign In to FindBack'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRegister
                ? 'Create your verified student or staff account'
                : 'Access your claims, reports, and security verifications'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick 1-Click Demo Login Bar */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>One-Click Demo Personas (For Evaluators)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-800 border border-amber-200 hover:bg-amber-100/50 shadow-xs transition"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleDemo('finder')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-800 border border-amber-200 hover:bg-amber-100/50 shadow-xs transition"
              >
                🔍 Finder
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white text-slate-800 border border-amber-200 hover:bg-amber-100/50 shadow-xs transition"
              >
                🛡️ Security
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Roll / Staff ID
                    </label>
                    <input
                      type="text"
                      value={studentOrStaffId}
                      onChange={(e) => setStudentOrStaffId(e.target.value)}
                      placeholder="e.g. CS2026-042"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff / Faculty</option>
                      <option value="admin">Security Officer</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-95"
              id="auth-submit-btn"
            >
              {loading
                ? 'Processing...'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Toggle register / signin */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
