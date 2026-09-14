import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, X, ArrowLeft, Sparkles, CreditCard, Clock, ShieldCheck,
  Stethoscope, Hospital, AlertCircle, Loader2, RefreshCw, Home,
  IndianRupee, CheckCircle2, XCircle, ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';

interface PricingPageProps {
  user: any;
  darkMode: boolean;
}

type PaymentState = 'idle' | 'loading_order' | 'checkout' | 'verifying' | 'success' | 'failed' | 'cancelled';

const CLINIC_FEATURES = [
  'Smart OPD Queue Management',
  'AI Prescription System',
  'Billing & Finance (PDF invoices)',
  'Patient CRM & Follow-ups',
  'WhatsApp Marketing',
  'Hospital Referral Network',
  'Analytics Dashboard',
  'AI Clinical Assistant',
  'Medicine Tracking',
  'Lab & Pharmacy Integration',
  'Appointment Management',
  'Digital Patient Records (EMR)',
];

const HOSPITAL_FEATURES = [
  'OPD & IPD Referral Handling',
  'Real-time Referral Notifications',
  'Hospital-Clinic Network Directory',
  'Emergency Audio Alerts',
  'Secure Messaging System',
  'Hospital Profile Management',
  'Referral History & Analytics',
  'Growth Platform (CME & Marketing)',
];

function CountdownBadge({ trialEndAt }: { trialEndAt: any }) {
  const endMs = typeof trialEndAt === 'number' ? trialEndAt : trialEndAt ? new Date(trialEndAt).getTime() : 0;
  const [remaining, setRemaining] = useState(Math.max(0, endMs - Date.now()));

  useEffect(() => {
    if (!endMs) return;
    const t = setInterval(() => setRemaining(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endMs]);

  if (!endMs || remaining <= 0) return null;

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-xs font-bold">
      <Clock size={11} />
      <span>Trial: {h}h {m}m remaining</span>
    </div>
  );
}

export default function PricingPage({ user, darkMode }: PricingPageProps) {
  const navigate = useNavigate();
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [selectedPlan, setSelectedPlan] = useState<'CLINIC' | 'HOSPITAL' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState<string>('');

  const userRole = user?.role;
  const userId = user?.id;
  const subscriptionStatus = user?.subscriptionStatus;

  const isExpired = subscriptionStatus === 'expired';
  const isActive = subscriptionStatus === 'active';
  const isTrial = subscriptionStatus === 'trial';

  const recommendedPlan: 'CLINIC' | 'HOSPITAL' = userRole === 'hospital' ? 'HOSPITAL' : 'CLINIC';

  const plans = [
    {
      id: 'CLINIC' as const,
      icon: <Stethoscope size={28} />,
      name: 'Clinic Plan',
      price: 329,
      priceStr: '₹329',
      period: '/month | ₹3,000/yr',
      tagline: 'Perfect for independent clinics & doctors',
      features: CLINIC_FEATURES,
      gradient: 'from-teal-500 to-teal-700',
      border: 'border-teal-200 dark:border-teal-700/40',
      bg: 'bg-teal-50 dark:bg-teal-900/10',
      ctaText: 'START CLINIC SUBSCRIPTION',
      recommended: recommendedPlan === 'CLINIC',
    },
    {
      id: 'HOSPITAL' as const,
      icon: <Hospital size={28} />,
      name: 'Hospital Plan',
      price: 3290,
      priceStr: '₹3,290',
      period: '/month | ₹30,000/yr',
      tagline: 'Built for multi-department hospitals',
      features: HOSPITAL_FEATURES,
      gradient: 'from-indigo-500 to-indigo-700',
      border: 'border-indigo-200 dark:border-indigo-700/40',
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      ctaText: 'START HOSPITAL SUBSCRIPTION',
      recommended: recommendedPlan === 'HOSPITAL',
    },
  ];

  const handleSubscribe = async (planType: 'CLINIC' | 'HOSPITAL', type: 'monthly' | 'yearly') => {
    // Prevent cross-plan subscription
    if (userRole === 'clinic' && planType === 'HOSPITAL') {
      setErrorMsg('Your account is registered as a Clinic. Please contact support to upgrade to Hospital plan.');
      return;
    }
    if (userRole === 'hospital' && planType === 'CLINIC') {
      setErrorMsg('Your account is registered as a Hospital. Please use the Hospital plan.');
      return;
    }

    setSelectedPlan(planType);
    setErrorMsg('');
    setPaymentState('loading_order');

    try {
      const orderRes = await subscriptionService.createOrder(userId, planType, type);

      if (!orderRes.success) {
        setErrorMsg(orderRes.error || 'Failed to create payment order. Please try again.');
        setPaymentState('failed');
        return;
      }

      if (orderRes.isMockMode) {
        // Mock payment flow for development
        setPaymentState('verifying');
        const verifyRes = await subscriptionService.verifyPayment({
          razorpay_order_id: orderRes.orderId || '',
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          userId,
          planType,
          subscriptionType: type,
        });

        if (verifyRes.success) {
          if (verifyRes.nextBillingAt) {
            setNextBillingDate(new Date(verifyRes.nextBillingAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
          }
          setPaymentState('success');
        } else {
          setErrorMsg(verifyRes.error || 'Payment verification failed.');
          setPaymentState('failed');
        }
        return;
      }

      // Real Razorpay checkout
      setPaymentState('checkout');
      const scriptLoaded = await subscriptionService.loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Failed to load payment gateway. Please check your internet connection.');
        setPaymentState('failed');
        return;
      }

      subscriptionService.openCheckout({
        orderId: orderRes.orderId!,
        amount: orderRes.amount!,
        currency: orderRes.currency!,
        razorpayKeyId: orderRes.razorpayKeyId!,
        userName: user?.name || '',
        userEmail: user?.email || '',
        description: planType === 'CLINIC' ? 'Carebridge+ Clinic Plan ₹329/month' : 'Carebridge+ Hospital Plan ₹3,290/month',
        onSuccess: async (data) => {
          setPaymentState('verifying');
          const verifyRes = await subscriptionService.verifyPayment({
            ...data,
            userId,
            planType,
            subscriptionType: type,
          });
          if (verifyRes.success) {
            if (verifyRes.nextBillingAt) {
              setNextBillingDate(new Date(verifyRes.nextBillingAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
            }
            setPaymentState('success');
          } else {
            setErrorMsg(verifyRes.error || 'Payment verification failed. Please contact support.');
            setPaymentState('failed');
          }
        },
        onFailure: (error) => {
          setErrorMsg(error?.description || 'Payment failed. Please try again.');
          setPaymentState('failed');
        },
        onDismiss: () => {
          setPaymentState('cancelled');
        },
      });
    } catch (e: any) {
      setErrorMsg(e.message || 'An error occurred. Please try again.');
      setPaymentState('failed');
    }
  };

  const activePlan = plans.find(p => p.id === (selectedPlan || recommendedPlan));

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────
  if (paymentState === 'success') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden text-center"
        >
          <div className="px-8 pt-12 pb-8 bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-5"
            >
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-black mb-2">SUBSCRIPTION ACTIVATED</h1>
            <p className="text-emerald-100 text-sm">Welcome to Carebridge+</p>
          </div>

          <div className="px-8 py-8">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 mb-6">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Your <strong className="text-emerald-700 dark:text-emerald-400">{activePlan?.name}</strong> is now active.
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{activePlan?.priceStr}<span className="text-sm font-bold text-slate-500">/month</span></p>
              {nextBillingDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Next billing: <strong>{nextBillingDate}</strong></p>
              )}
            </div>

            <button
              onClick={() => navigate(`/${userRole || 'clinic'}`)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              GO TO DASHBOARD
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── FAILURE SCREEN ───────────────────────────────────────────────────
  if (paymentState === 'failed') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden text-center"
        >
          <div className="px-8 pt-12 pb-8 bg-gradient-to-br from-red-500 to-rose-700 text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-5">
              <XCircle size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-black mb-2">PAYMENT FAILED</h1>
            <p className="text-red-100 text-sm">Your subscription was not activated.</p>
          </div>

          <div className="px-8 py-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 mb-6 text-left">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setPaymentState('idle'); setErrorMsg(''); }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-teal-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={15} />
                TRY AGAIN
              </button>
              <button
                onClick={() => { setPaymentState('idle'); setErrorMsg(''); setSelectedPlan(null); }}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                VIEW PLANS
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── CANCELLED SCREEN ─────────────────────────────────────────────────
  if (paymentState === 'cancelled') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-slate-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">PAYMENT NOT COMPLETED</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Your subscription is still inactive. You can continue your trial or subscribe now.</p>
          <button
            onClick={() => setPaymentState('idle')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black uppercase tracking-widest text-sm shadow-lg hover:scale-[1.01] transition-all"
          >
            CONTINUE SUBSCRIPTION
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── LOADING / VERIFYING OVERLAY ──────────────────────────────────────
  if (paymentState === 'loading_order' || paymentState === 'verifying') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <Loader2 size={48} className="text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {paymentState === 'loading_order' ? 'Preparing your payment...' : 'Verifying your payment...'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">Please do not close this page</p>
        </div>
      </div>
    );
  }

  // ─── MAIN PRICING PAGE ────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* Top nav */}
      <div className={`sticky top-0 z-40 border-b ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <img src="/carebridge-logo.png" alt="Carebridge+" className="h-7 w-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-black text-lg text-teal-700 dark:text-teal-400">CAREBRIDGE<span className="text-amber-500">+</span></span>
          </div>
          {user && (
            <button
              onClick={() => navigate(`/${userRole}`)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <Home size={16} />
              Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-400 text-sm font-bold mb-6"
          >
            <XCircle size={14} />
            Your free trial has ended
          </motion.div>
        )}
        {isTrial && user?.trialEndAt && (
          <div className="mb-6 flex justify-center">
            <CountdownBadge trialEndAt={user.trialEndAt} />
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4"
        >
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Plan</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
        >
          Power your healthcare practice with Carebridge+.
          Full access. No hidden fees. Cancel anytime.
        </motion.p>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 mx-auto max-w-lg p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl flex items-start gap-3"
          >
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 text-left">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`relative rounded-3xl border-2 ${plan.recommended ? 'border-teal-400 dark:border-teal-500 shadow-2xl shadow-teal-500/10' : plan.border + ' shadow-lg'} ${darkMode ? 'bg-slate-900' : 'bg-white'} overflow-hidden`}
            >
              {plan.recommended && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-400" />
              )}
              {plan.recommended && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 rounded-full bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest">
                    Recommended
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className={`p-8 pb-6 ${plan.recommended ? 'bg-gradient-to-br from-teal-600/5 to-teal-500/5 dark:from-teal-900/20 dark:to-teal-800/10' : ''}`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white mb-5`}>
                  {plan.icon}
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{plan.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{plan.tagline}</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-slate-100">{plan.priceStr}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm pb-2">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="px-8 pb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">What's included</p>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle size={15} className="text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-8 pb-8">
                {isActive && user?.planType === plan.id ? (
                  <div className="w-full py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 text-center text-emerald-700 dark:text-emerald-400 font-black text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    CURRENT PLAN — ACTIVE
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleSubscribe(plan.id, 'monthly')}
                      disabled={paymentState !== 'idle'}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
                        ${plan.recommended
                          ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
                    >
                      <CreditCard size={16} />
                      {plan.ctaText} (MONTHLY)
                    </button>
                    <button
                      onClick={() => handleSubscribe(plan.id, 'yearly')}
                      disabled={paymentState !== 'idle'}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2
                        ${plan.recommended
                          ? 'border-teal-600 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:scale-[1.02] active:scale-[0.98]'
                          : 'border-indigo-600 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-[1.02] active:scale-[0.98]'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
                    >
                      <CreditCard size={16} />
                      {plan.ctaText} (YEARLY)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 dark:text-slate-500"
        >
          {[
            { icon: <ShieldCheck size={16} />, text: 'Secure payments via Razorpay' },
            { icon: <RefreshCw size={16} />, text: 'Cancel anytime' },
            { icon: <Sparkles size={16} />, text: 'No data deleted on cancellation' },
            { icon: <CreditCard size={16} />, text: 'INR billing · GST inclusive' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
