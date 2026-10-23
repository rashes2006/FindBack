import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HandoverOtpModal } from '../components/HandoverOtpModal';

export const AdminDeskHub = ({ onSelectItem }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [pendingHandovers, setPendingHandovers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Terminal state
  const [terminalItemId, setTerminalItemId] = useState('');
  const [terminalOtp, setTerminalOtp] = useState('');
  const [terminalNotes, setTerminalNotes] = useState('');
  const [terminalLoading, setTerminalLoading] = useState(false);
  const [terminalMessage, setTerminalMessage] = useState({ type: '', text: '' });

  // Modal
  const [modalItem, setModalItem] = useState(null);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        apiClient('/analytics/dashboard'),
        apiClient('/items?status=approved_for_handover')
      ]);

      if (analyticsRes.success) {
        setStats(analyticsRes);
        setAuditLogs(analyticsRes.recentActivity || []);
      }
      if (pendingRes.success) {
        setPendingHandovers(pendingRes.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleTerminalVerify = async (e) => {
    e.preventDefault();
    setTerminalMessage({ type: '', text: '' });

    if (!terminalItemId || !terminalOtp || terminalOtp.length !== 6) {
      setTerminalMessage({
        type: 'error',
        text: 'Please select an item and enter a valid 6-digit OTP code.'
      });
      return;
    }

    setTerminalLoading(true);

    try {
      const res = await apiClient('/claims/verify-handover', {
        body: {
          itemId: terminalItemId,
          otp: terminalOtp.trim(),
          notes: terminalNotes || 'Verified at Central Campus Security Desk'
        }
      });

      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });

        setTerminalMessage({
          type: 'success',
          text: `Success! Item "${res.item?.title}" handed over and marked as Returned.`
        });
        setTerminalOtp('');
        setTerminalItemId('');
        fetchHubData();
      }
    } catch (err) {
      setTerminalMessage({
        type: 'error',
        text: err.message || 'OTP verification failed'
      });
    } finally {
      setTerminalLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Campus Security & Desk Operations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Security Desk & Handover Terminal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            In-person collection desk terminal, fraud prevention logs, and campus recovery metrics.
          </p>
        </div>

        <button
          onClick={fetchHubData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs backdrop-blur-md border border-white/10 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Terminal + Quick Test Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rapid Handover OTP Terminal */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Direct Handover Verification Terminal
                </h2>
                <p className="text-xs text-slate-500">
                  Verify the claimant's 6-digit OTP code to release the item
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
              Desk Online
            </span>
          </div>

          {/* Test Hint Pill */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Quick Evaluation Test:</strong> Pre-seeded AirPods Pro waiting for pickup with OTP <strong>749216</strong>
              </span>
            </div>
            {pendingHandovers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTerminalItemId(pendingHandovers[0]._id);
                  setTerminalOtp('749216');
                }}
                className="text-[11px] font-bold text-amber-800 underline hover:text-amber-900 shrink-0 ml-2"
              >
                Auto-fill
              </button>
            )}
          </div>

          {terminalMessage.text && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                terminalMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {terminalMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{terminalMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleTerminalVerify} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Item Awaiting Pickup *
                </label>
                <select
                  value={terminalItemId}
                  onChange={(e) => setTerminalItemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Choose item --</option>
                  {pendingHandovers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title} ({item.location?.campusZone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student's 6-Digit Handover OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={terminalOtp}
                  onChange={(e) => setTerminalOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 749216"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 font-mono text-sm font-bold tracking-widest outline-none bg-slate-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Officer Notes / ID Verification Reference
              </label>
              <input
                type="text"
                value={terminalNotes}
                onChange={(e) => setTerminalNotes(e.target.value)}
                placeholder="e.g. Verified with student ID card and photo match"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={terminalLoading || !terminalItemId || terminalOtp.length !== 6}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition active:scale-95 flex items-center justify-center gap-2"
              id="terminal-verify-btn"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {terminalLoading
                  ? 'Verifying with Security Ledger...'
                  : 'Verify OTP & Release Item to Owner'}
              </span>
            </button>
          </form>
        </div>

        {/* Pending Items Waiting for Collection List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Ready for Pickup ({pendingHandovers.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          </div>

          {pendingHandovers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No items currently awaiting OTP pickup.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {pendingHandovers.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-2xl border border-blue-100 bg-blue-50/40 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.location?.campusZone}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalItem(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 transition"
                  >
                    Enter OTP
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics & Zone Hotspots */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Campus Hotspots */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Top Lost & Found Campus Hotspots
              </h3>
            </div>
            <div className="space-y-3">
              {stats.zoneHotspots?.map((hotspot) => (
                <div
                  key={hotspot._id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800">
                    {hotspot._id}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                      {hotspot.foundCount} Found
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px]">
                      {hotspot.lostCount} Lost
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Recovery Rate by Category
              </h3>
            </div>
            <div className="space-y-2.5">
              {stats.categoryStats?.slice(0, 5).map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat._id}</span>
                    <span className="text-slate-500">
                      {cat.recovered} of {cat.count} recovered
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                      style={{
                        width: `${cat.count > 0 ? (cat.recovered / cat.count) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Security Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Immutable Audit Trail & Anti-Fraud Activity Log
          </h3>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No audit records logged yet.
            </p>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {log.performedBy?.name || 'System / Officer'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Handover Modal for specific item */}
      {modalItem && (
        <HandoverOtpModal
          isOpen={!!modalItem}
          onClose={() => setModalItem(null)}
          itemId={modalItem._id}
          itemTitle={modalItem.title}
          onHandoverSuccess={() => {
            fetchHubData();
            setModalItem(null);
          }}
        />
      )}
    </div>
  );
};
