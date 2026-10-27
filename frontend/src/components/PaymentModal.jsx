import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  Building,
  Coins,
  ArrowRight,
  ExternalLink,
  Info,
  Lock,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Helper to ensure Razorpay checkout.js script is loaded
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentModal = ({
  isOpen,
  onClose,
  item = null,
  claim = null,
  defaultPurpose = 'finder_reward',
  onPaymentSuccess
}) => {
  const { user } = useAuth();

  // Step state: 'setup' | 'success'
  const [step, setStep] = useState('setup');

  // Payment Setup states
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [note, setNote] = useState('');

  // Processing & verification
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState(null);

  const presets = [50, 100, 250, 500];

  useEffect(() => {
    if (isOpen) {
      setStep('setup');
      setError('');
      setPaymentResult(null);
      setPurpose(defaultPurpose);
      fetchRazorpayConfig();
      loadRazorpayScript();
    }
  }, [isOpen, defaultPurpose]);

  const fetchRazorpayConfig = async () => {
    try {
      const res = await apiClient('/payments/config');
      if (res.success) {
        setRazorpayConfig(res);
      }
    } catch (err) {
      console.warn('Could not fetch Razorpay config:', err.message);
    }
  };

  if (!isOpen) return null;

  const currentAmount = customAmount ? Number(customAmount) : amount;

  const handlePresetSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  // Launch the Official Razorpay Standard Checkout Popup
  const handleLaunchRazorpay = async () => {
    if (!currentAmount || currentAmount <= 0) {
      setError('Please select or enter an amount greater than ₹0');
      return;
    }

    setLoading(true);
    setError('');
    setProcessingStatus('Connecting to Razorpay API...');

    try {
      // 1. Ensure Razorpay checkout.js is available on window
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error(
          'Failed to load Razorpay Checkout SDK. Please disable any ad-blockers or check internet connectivity.'
        );
      }

      // 2. Create order on backend via Razorpay Orders API
      setProcessingStatus('Creating official order on Razorpay servers...');
      const orderPayload = {
        amount: currentAmount,
        purpose,
        itemId: item ? item._id : null,
        claimId: claim ? claim._id : null,
        recipientId: item && item.reportedBy ? (item.reportedBy._id || item.reportedBy) : null,
        notes: note
      };

      const orderRes = await apiClient('/payments/create-order', {
        method: 'POST',
        body: orderPayload
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to create payment order on Razorpay');
      }

      const activeOrder = orderRes.order;
      const keyId = orderRes.keyId || razorpayConfig?.keyId;

      setProcessingStatus('Opening Razorpay Checkout...');

      // 3. Configure Official Razorpay Checkout Options
      const options = {
        key: keyId,
        amount: activeOrder.amount, // in paise
        currency: activeOrder.currency || 'INR',
        name: 'FindBack Campus',
        description: `${
          purpose === 'finder_reward'
            ? 'Finder Gratitude Reward'
            : purpose === 'desk_handling_fee'
            ? 'Campus Desk Storage Fee'
            : 'Campus Bounty Fund'
        }${item ? ` • ${item.title}` : ''}`,
        image: 'https://cdn-icons-png.flaticon.com/512/891/891462.png',
        order_id: activeOrder.id,
        prefill: {
          name: user?.name || 'Campus Student',
          email: user?.email || 'student@campus.edu',
          contact: user?.phone || '9876543210'
        },
        notes: {
          purpose,
          itemId: item ? item._id : '',
          payerStudentId: user?.studentOrStaffId || '',
          payerDepartment: user?.department || '',
          userNote: note || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async function (response) {
          // This callback is executed when payment succeeds on Razorpay's checkout!
          try {
            setLoading(true);
            setProcessingStatus('Verifying cryptographic HMAC signature with Razorpay...');

            const verifyRes = await apiClient('/payments/verify', {
              method: 'POST',
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: 'razorpay_checkout'
              }
            });

            if (verifyRes.success) {
              setPaymentResult(verifyRes.payment);
              setStep('success');

              try {
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.6 }
                });
              } catch (e) {
                // ignore confetti error
              }

              if (onPaymentSuccess) {
                onPaymentSuccess(verifyRes.payment);
              }
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed');
            }
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment capture verification failed');
          } finally {
            setLoading(false);
            setProcessingStatus('');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setProcessingStatus('');
          }
        }
      };

      // 4. Open the official Razorpay Checkout modal
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse);
        setError(
          failResponse.error?.description ||
            failResponse.error?.reason ||
            'Payment was cancelled or declined by user/bank'
        );
        setLoading(false);
        setProcessingStatus('');
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      setError(err.message || 'Failed to initialize Razorpay checkout');
      setLoading(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================================= */}
        {/* STEP 1: AMOUNT & PURPOSE SELECTION                                        */}
        {/* ========================================================================= */}
        {step === 'setup' && (
          <div>
            {/* Header */}
            <div className="relative bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-600 text-white p-6 sm:p-7">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Razorpay Official Checkout
                </span>
                <span className="text-xs text-blue-100 font-medium">Test Mode</span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight">
                Campus Payment Gateway
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {item ? `Item: ${item.title}` : 'FindBack Campus Secure Payments'}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Razorpay Connected Badge */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    Connected to Razorpay Dashboard
                    <span className="px-1.5 py-0.2 rounded bg-blue-200/80 text-[10px] font-mono font-bold text-blue-800">
                      {razorpayConfig?.keyId ? `${razorpayConfig.keyId.substring(0, 12)}...` : 'Test Mode'}
                    </span>
                  </p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Transactions open directly inside the <strong>official Razorpay Checkout portal</strong> and will record in your Razorpay Merchant Dashboard under Payments.
                  </p>
                </div>
              </div>

              {/* Purpose Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Select Payment Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPurpose('finder_reward')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      purpose === 'finder_reward'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 mb-2 ${
                        purpose === 'finder_reward' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold leading-snug">Finder Reward</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Gratitude Tip</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurpose('desk_handling_fee')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      purpose === 'desk_handling_fee'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Building
                      className={`w-4 h-4 mb-2 ${
                        purpose === 'desk_handling_fee' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold leading-snug">Desk Fee</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Storage & Locker</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurpose('campus_donation')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      purpose === 'campus_donation'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Coins
                      className={`w-4 h-4 mb-2 ${
                        purpose === 'campus_donation' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold leading-snug">Campus Bounty</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Lost & Found Pool</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Amount in INR (₹)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                        amount === val && !customAmount
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Or enter custom amount (e.g. 150)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Note / Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Appreciation Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thank you so much for finding my headphones!"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Loading Status indicator */}
              {loading && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{processingStatus || 'Connecting to Razorpay...'}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchRazorpay}
                  disabled={loading || !currentAmount}
                  className="w-full py-3.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  id="razorpay-pay-btn"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{currentAmount || 0} via Razorpay Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Protected by 256-bit Razorpay test encryption & HMAC SHA-256 verification
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SUCCESS RECEIPT SCREEN                                            */}
        {/* ========================================================================= */}
        {step === 'success' && paymentResult && (
          <div className="p-6 sm:p-8 space-y-5 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Official Razorpay Payment Captured
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                ₹{paymentResult.amount} INR Paid Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your transaction has been recorded on Razorpay and the campus ledger.
              </p>
            </div>

            {/* Receipt Details Table */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Razorpay Payment ID:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  {paymentResult.paymentId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Razorpay Order ID:</span>
                <span className="font-mono font-semibold text-slate-700 text-[11px]">
                  {paymentResult.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {paymentResult.paymentMethod || 'Razorpay Checkout'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Purpose:</span>
                <span className="font-semibold text-blue-700 uppercase text-[11px]">
                  {paymentResult.purpose?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600 text-[11px]">
                  Captured (Test Mode)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700 text-[11px]">
                  {new Date(paymentResult.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-md"
            >
              Done & Close Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
