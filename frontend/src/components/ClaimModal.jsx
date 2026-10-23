import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  Send,
  Lock
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ClaimModal = ({ item, isOpen, onClose, onClaimSubmitted }) => {
  const { user } = useAuth();

  const [answers, setAnswers] = useState(
    (item?.verificationClues || []).map((clue) => ({
      question: clue.question,
      answer: ''
    }))
  );
  const [proofDescription, setProofDescription] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that all verification questions are answered
    if (answers.some((a) => !a.answer.trim())) {
      setError('Please answer all verification security questions.');
      return;
    }

    if (!proofDescription.trim() || proofDescription.trim().length < 10) {
      setError('Please provide at least 10 characters detailing ownership proof.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient('/claims', {
        body: {
          itemId: item._id,
          answers,
          proofDescription,
          proofImageUrl
        }
      });

      if (res.success) {
        onClaimSubmitted(res.claim);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                File Ownership Claim
              </h2>
              <p className="text-xs text-slate-500">
                Item: <span className="font-semibold text-slate-700">{item.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Anti-Fraud Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Anti-Fraud Protection:</span> Your submission
              will be reviewed by the finder and campus security. Submitting fraudulent
              claims violates the campus honor code.
            </div>
          </div>

          {/* Verification Questions set by the finder */}
          {answers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Security Verification Clues</span>
              </div>

              {answers.map((clue, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <label className="block text-xs font-semibold text-slate-800">
                    {idx + 1}. {clue.question}
                  </label>
                  <input
                    type="text"
                    value={clue.answer}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full px-3 py-2 bg-white text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none transition"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* Proof Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Additional Proof of Ownership *
            </label>
            <textarea
              rows={3}
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="e.g. Can unlock screen with PIN 4821; has a scratch on the bottom edge; student ID is in the back case; purchase date was Oct 2024."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs outline-none transition"
              required
            />
          </div>

          {/* Optional Proof image / invoice URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Proof Photo / Receipt URL (Optional)
            </label>
            <input
              type="url"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
              placeholder="https://... photo of bill, previous photo with item, or warranty card"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 text-xs outline-none transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-95"
              id="submit-claim-modal-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Claim...' : 'Submit Claim for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
