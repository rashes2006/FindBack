import React, { useState, useEffect } from 'react';
import {
  FolderClock,
  ShieldCheck,
  Package,
  KeyRound,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Trash2
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const MyDashboard = ({ onSelectItem, onOpenReport }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'reported'
  const [claims, setClaims] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, itemsRes] = await Promise.all([
        apiClient('/claims/my-claims'),
        apiClient('/items/user/me')
      ]);

      if (claimsRes.success) setClaims(claimsRes.claims);
      if (itemsRes.success) setReportedItems(itemsRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item report?')) return;
    try {
      await apiClient(`/items/${itemId}`, { method: 'DELETE' });
      setReportedItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900">
              My Activity & Ownership Claims
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Logged in as{' '}
            <strong className="text-slate-700">{user?.name}</strong> (
            {user?.studentOrStaffId || 'Student'}) • {user?.department}
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
        >
          Report Another Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('claims')}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-my-claims"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Filed Claims ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reported')}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'reported'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-my-reported"
        >
          <Package className="w-4 h-4" />
          <span>My Reported Items ({reportedItems.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading your records...
        </div>
      ) : activeTab === 'claims' ? (
        /* Tab 1: Claims */
        claims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Claims Filed Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              If you lost an item, search the campus catalog and file a claim with verification clues.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claims.map((claim) => {
              const item = claim.item;
              if (!item) return null;

              return (
                <div
                  key={claim._id}
                  className={`bg-white rounded-3xl border p-6 space-y-4 shadow-sm transition ${
                    claim.status === 'approved'
                      ? 'border-blue-400 ring-2 ring-blue-100'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                        alt={item.title}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.location?.campusZone}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        claim.status === 'approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : claim.status === 'collected'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status === 'approved' ? 'Approved - OTP Issued' : claim.status}
                    </span>
                  </div>

                  {/* ACTIVE OTP CARD (If Approved) */}
                  {claim.status === 'approved' && claim.handoverOtp && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-2 shadow-md">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                        <span className="flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                          Handover Collection Token
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                          Show to Desk
                        </span>
                      </div>
                      <div className="text-center py-2 bg-black/20 rounded-xl">
                        <span className="text-3xl font-mono font-black tracking-widest text-amber-300">
                          {claim.handoverOtp}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-100 text-center">
                        Pick up item at: <strong>{item.location?.campusZone}</strong>
                      </p>
                    </div>
                  )}

                  {/* Review Notes */}
                  {claim.reviewNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-[11px] text-slate-500 uppercase">
                        Reviewer Feedback:
                      </span>
                      <p className="italic">"{claim.reviewNotes}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Filed on {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onSelectItem(item)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Item Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Tab 2: Reported Items */
        reportedItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">
              No Reported Items
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Have you found something on campus? Report it to help its owner.
            </p>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Report an Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportedItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                      alt={item.title}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {item.category} • {item.location?.campusZone}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Manage & Review Claims</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
