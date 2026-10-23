import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../api/client';

export const HandoverOtpModal = ({ isOpen, onClose, itemId, itemTitle, onHandoverSuccess }) => {
  const [otp, setOtp] = useState('');
  const [notes, setNotes] = useState('In-person verification confirmed at desk');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient('/claims/verify-handover', {
        body: {
          itemId,
          otp: otp.trim(),
          notes
        }
      });

      if (res.success) {
        setSuccess(true);
        triggerConfetti();
        setTimeout(() => {
          onHandoverSuccess(res.item);
          onClose();
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Handover Desk Verification</h3>
              <p className="text-xs text-blue-100 truncate max-w-[240px]">
                {itemTitle || 'Item Handover'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">
              OTP Verified! Item Returned 🎉
            </h4>
            <p className="text-xs text-slate-500">
              The digital audit trail has been logged. The item is now marked as Returned.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Enter Claimant's 6-Digit Handover OTP
              </label>
              <p className="text-[11px] text-slate-500">
                The student displays this code on their screen under "My Claims".
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-slate-50"
                autoFocus
                required
                id="handover-otp-input"
              />
            </div>

            {/* Desk notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Handover Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified with student ID card CS2026-142"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition active:scale-95 flex items-center justify-center gap-2"
              id="confirm-handover-otp-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify OTP & Complete Handover'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
