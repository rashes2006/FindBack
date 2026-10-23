import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  switch (status) {
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Available to Claim
        </span>
      );

    case 'claim_pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Claim Under Review
        </span>
      );

    case 'approved_for_handover':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ring-2 ring-blue-400/30 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Ready for OTP Pickup
        </span>
      );

    case 'returned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Returned to Owner
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 ${className}`}
        >
          {status}
        </span>
      );
  }
};
