import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  KeyRound,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Heart,
  CreditCard
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimModal } from '../components/ClaimModal';
import { HandoverOtpModal } from '../components/HandoverOtpModal';
import { PaymentModal } from '../components/PaymentModal';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ItemDetailsPage = ({ itemId, onBack, onOpenAuth }) => {
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [userClaim, setUserClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [itemPayments, setItemPayments] = useState([]);

  // Review states
  const [reviewNote, setReviewNote] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient(`/items/${itemId}`);
      if (res.success) {
        setItem(res.item);
        setPotentialMatches(res.potentialMatches || []);

        // If user is reporter or admin, fetch claims submitted for this item
        const isReporter =
          user &&
          res.item.reportedBy &&
          (res.item.reportedBy._id === user.id ||
            res.item.reportedBy.id === user.id);
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        if (isReporter || isAdmin) {
          try {
            const claimsRes = await apiClient(`/claims/item/${itemId}`);
            if (claimsRes.success) {
              setClaims(claimsRes.claims);
            }
          } catch (claimsErr) {
            console.warn('Could not fetch claims:', claimsErr.message);
          }
        }

        // Check if logged in user has an active claim for this item
        if (user) {
          try {
            const myClaimsRes = await apiClient('/claims/my-claims');
            if (myClaimsRes.success) {
              const matched = myClaimsRes.claims.find(
                (c) => c.item && c.item._id === itemId
              );
              setUserClaim(matched || null);
            }
          } catch (myClaimErr) {
            console.warn(myClaimErr.message);
          }
        }

        // Fetch captured payments / rewards for this item
        try {
          const itemPayRes = await apiClient(`/payments/item/${itemId}`);
          if (itemPayRes.success) {
            setItemPayments(itemPayRes.payments || []);
          }
        } catch (payErr) {
          console.warn('Could not fetch item payments:', payErr.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [itemId, user]);

  const handleReviewClaim = async (claimId, action) => {
    setReviewingId(claimId);
    try {
      const res = await apiClient(`/claims/${claimId}/review`, {
        method: 'PUT',
        body: { action, reviewNotes: reviewNote }
      });
      if (res.success) {
        setReviewNote('');
        fetchItemDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to review claim');
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold">
          Loading item information & security status...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || 'Item not found'}</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isReporter =
    user &&
    item.reportedBy &&
    (item.reportedBy._id === user.id || item.reportedBy.id === user.id);
  const isAdmin = user && (user.role === 'admin' || user.role === 'staff');
  const isFound = item.type === 'found';

  return (
    <div className="space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        id="back-to-catalog-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Image */}
            <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
              <img
                src={
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
                }
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md ${
                    isFound ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isFound ? 'Found Item' : 'Lost Report'}
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                  {item.category}
                </span>
              </div>
              <div className="absolute bottom-4 right-4">
                <StatusBadge status={item.status} />
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  {item.title}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Meta tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Location</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{item.location?.campusZone}</span>
                  </div>
                  {item.location?.specificSpot && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {item.location.specificSpot}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">
                    Date {isFound ? 'Found' : 'Lost'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      {new Date(item.dateOccurred || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Reported By</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.reportedBy?.name || 'Campus Student'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {item.reportedBy?.department}
                  </span>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Recovery Workflow Timeline
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center font-bold">
                      1
                    </div>
                    <span className="text-blue-700">Reported</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                        ['claim_pending', 'approved_for_handover', 'returned'].includes(
                          item.status
                        )
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      2
                    </div>
                    <span
                      className={
                        ['claim_pending', 'approved_for_handover', 'returned'].includes(
                          item.status
                        )
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }
                    >
                      Under Review
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                        ['approved_for_handover', 'returned'].includes(item.status)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      3
                    </div>
                    <span
                      className={
                        ['approved_for_handover', 'returned'].includes(item.status)
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }
                    >
                      OTP Ready
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                        item.status === 'returned'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      4
                    </div>
                    <span
                      className={
                        item.status === 'returned'
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      Returned
                    </span>
                  </div>
                </div>
              </div>

              {/* Handover Completed Notice */}
              {item.status === 'returned' && item.handoverRecord && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Item Handed Over & Returned</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Verified on:{' '}
                    {new Date(item.handoverRecord.handedOverAt).toLocaleString()}
                  </p>
                  {item.handoverRecord.notes && (
                    <p className="text-[11px] italic text-emerald-800">
                      "{item.handoverRecord.notes}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* If Lost Item: Show Smart Matches */}
          {!isFound && potentialMatches.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Potential Found Matches on Campus
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Our matching engine found {potentialMatches.length} recently reported
                items in matching campus zones or categories.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {potentialMatches.map((match) => (
                  <div
                    key={match._id}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-blue-400 transition flex items-center gap-3 bg-slate-50/50"
                  >
                    <img
                      src={match.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                      alt={match.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {match.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {match.location?.campusZone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Security Claiming & Verification Actions */}
        <div className="space-y-6">
          {/* Active Handover OTP Card (Visible to Approved Claimant) */}
          {userClaim && userClaim.status === 'approved' && userClaim.handoverOtp && (
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl overflow-hidden pulse-glow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Handover Token
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900">
                  ACTIVE
                </span>
              </div>

              <div className="text-center py-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mb-4">
                <span className="text-xs text-blue-100 font-medium block mb-1">
                  Your 6-Digit Collection OTP
                </span>
                <span className="text-4xl font-mono font-black tracking-widest text-white drop-shadow">
                  {userClaim.handoverOtp}
                </span>
              </div>

              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                Present this code to the finder or Central Security Desk ({item.location?.campusZone}) along with your student ID to claim your item.
              </p>

              <div className="text-[11px] text-blue-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Valid for 48 hours</span>
              </div>
            </div>
          )}

          {/* Action Box: Claim this item */}
          {isFound && item.status !== 'returned' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Is this your item?
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                To prevent fraud, you will be required to answer secret verification
                questions set by the finder (e.g. engravings, wallpaper, sticker
                details) and provide proof.
              </p>

              {user ? (
                isReporter ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    You reported finding this item. You cannot claim your own item.
                  </div>
                ) : userClaim ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                    <p className="font-bold">Claim Filed: Status {userClaim.status}</p>
                    <p className="text-[11px]">
                      {userClaim.status === 'pending'
                        ? 'Your claim is pending review by the finder/security.'
                        : userClaim.status === 'approved'
                        ? 'Approved! Collect using the OTP above.'
                        : 'Review completed.'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition"
                    id="claim-this-item-btn"
                  >
                    Verify & Claim This Item
                  </button>
                )
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition"
                >
                  Sign In to Claim Item
                </button>
              )}
            </div>
          )}

          {/* Razorpay Test Mode Payment Gateway Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-6 border border-blue-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                <h3 className="text-sm font-bold text-slate-900">
                  Finder Reward & Desk Fee
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                ⚡ Razorpay Test Mode
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Show gratitude to the student who found and safely reported this item, or cover campus desk storage & security processing.
            </p>

            {itemPayments && itemPayments.length > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rewards Recorded ({itemPayments.length})</span>
                </div>
                {itemPayments.map((p) => (
                  <div key={p._id} className="text-[11px] text-emerald-700 flex justify-between">
                    <span>{p.payer?.name || 'A student'} tipped finder:</span>
                    <strong className="font-mono text-emerald-900">₹{p.amount} INR</strong>
                  </div>
                ))}
              </div>
            )}

            {user ? (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
                id="open-payment-gateway-btn"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Finder Reward via Razorpay</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Sign in to Pay Finder Reward</span>
              </button>
            )}
          </div>

          {/* Verification Clues (Visible questions) */}
          {item.verificationClues && item.verificationClues.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Verification Clues Required
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Claimants must correctly answer:
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                {item.verificationClues.map((clue, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2"
                  >
                    <span className="font-bold text-blue-600">{i + 1}.</span>
                    <div>
                      <span>{clue.question}</span>
                      {clue.expectedAnswerHint && (
                        <div className="text-[10px] text-indigo-600 font-normal mt-1 bg-indigo-50 p-1.5 rounded">
                          <strong>Private Expected Hint:</strong> {clue.expectedAnswerHint}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Finder / Admin Claims Review Section */}
          {(isReporter || isAdmin) && (
            <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Claims Submitted ({claims.length})
                  </h3>
                </div>
                {item.status === 'approved_for_handover' && (
                  <button
                    onClick={() => setShowHandoverModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1"
                    id="open-handover-desk-btn"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Handover Desk OTP</span>
                  </button>
                )}
              </div>

              {claims.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No claims have been submitted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            {claim.claimant?.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {claim.claimant?.studentOrStaffId || 'Student'} •{' '}
                            {claim.claimant?.email}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            claim.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : claim.status === 'collected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : claim.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      {/* Answers */}
                      <div className="space-y-1.5 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          Claimant's Clue Answers:
                        </span>
                        {claim.answers?.map((ans, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded-lg border border-slate-200/80"
                          >
                            <p className="font-semibold text-slate-700 text-[11px]">
                              Q: {ans.question}
                            </p>
                            <p className="text-slate-900 font-medium mt-0.5 text-xs">
                              A: "{ans.answer}"
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Proof */}
                      <div className="text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          Ownership Proof:
                        </span>
                        <p className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs mt-0.5">
                          "{claim.proofDescription}"
                        </p>
                      </div>

                      {/* Action buttons if pending */}
                      {claim.status === 'pending' && (
                        <div className="pt-2 border-t border-slate-200 flex gap-2">
                          <button
                            onClick={() => handleReviewClaim(claim._id, 'approve')}
                            disabled={reviewingId === claim._id}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                          >
                            Approve & Issue OTP
                          </button>
                          <button
                            onClick={() => handleReviewClaim(claim._id, 'reject')}
                            disabled={reviewingId === claim._id}
                            className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={item}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onClaimSubmitted={() => fetchItemDetails()}
      />

      {/* Handover OTP Desk Modal */}
      <HandoverOtpModal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        itemId={item._id}
        itemTitle={item.title}
        onHandoverSuccess={() => fetchItemDetails()}
      />

      {/* Payment Gateway Modal (Razorpay Test Mode) */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        item={item}
        claim={userClaim}
        defaultPurpose="finder_reward"
        onPaymentSuccess={() => fetchItemDetails()}
      />
    </div>
  );
};
