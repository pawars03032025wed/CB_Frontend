import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, XCircle, CreditCard, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionBannerProps {
  user: any;
  compact?: boolean; // true = sidebar item, false = top bar notification
}

function useServerSyncedCountdown(trialEndAt: any) {
  const endMs = typeof trialEndAt === 'number'
    ? trialEndAt
    : trialEndAt
      ? new Date(trialEndAt).getTime()
      : 0;

  const [remaining, setRemaining] = useState(Math.max(0, endMs - Date.now()));

  useEffect(() => {
    if (!endMs) return;
    const timer = setInterval(() => {
      setRemaining(Math.max(0, endMs - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [endMs]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursTotal = days * 24 + hours;

  let urgency: 'safe' | 'warning' | 'urgent' | 'critical' = 'safe';
  if (hoursTotal <= 1) urgency = 'critical';
  else if (hoursTotal <= 6) urgency = 'urgent';
  else if (hoursTotal <= 24) urgency = 'warning';

  return { days, hours, minutes, seconds, remaining, urgency, hoursTotal };
}

export default function SubscriptionBanner({ user, compact = false }: SubscriptionBannerProps) {
  const navigate = useNavigate();
  const status = user?.subscriptionStatus;
  const planType = user?.planType || (user?.role === 'clinic' ? 'CLINIC' : 'HOSPITAL');

  const { days, hours, minutes, seconds, remaining, urgency, hoursTotal } =
    useServerSyncedCountdown(status === 'trial' ? user?.trialEndAt : null);

  if (!status || status === null) {
    // Grandfathered user — no banner
    return null;
  }

  // ─── ACTIVE SUBSCRIPTION ───────────────────────────────────────────────
  if (status === 'active') {
    const price = planType === 'CLINIC' ? '₹329' : '₹3,290';
    const label = planType === 'CLINIC' ? 'Clinic Plan' : 'Hospital Plan';

    if (compact) {
      return (
        <button
          onClick={() => navigate('/subscription/manage')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-left"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">ACTIVE</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 truncate">{label} · {price}/mo</p>
          </div>
          <ChevronRight size={12} className="text-emerald-400 shrink-0" />
        </button>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        onClick={() => navigate('/subscription/manage')}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">ACTIVE</span>
          <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-500">{label} · {price}/mo</span>
        </div>
      </motion.div>
    );
  }

  // ─── TRIAL ACTIVE ─────────────────────────────────────────────────────
  if (status === 'trial' && remaining > 0) {
    const urgencyConfig = {
      safe: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800/40', dot: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300', label: 'FREE TRIAL ACTIVE', sub: 'text-teal-600 dark:text-teal-400' },
      warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', label: 'TRIAL ENDING SOON', sub: 'text-amber-600 dark:text-amber-400' },
      urgent: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/40', dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', label: 'TRIAL ENDS TODAY', sub: 'text-orange-600 dark:text-orange-400' },
      critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/40', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300', label: 'TRIAL ENDING SOON', sub: 'text-red-600 dark:text-red-400' },
    }[urgency];

    const countdownStr = days > 0
      ? `${days}D : ${String(hours).padStart(2,'0')}H : ${String(minutes).padStart(2,'0')}M`
      : `${String(hours).padStart(2,'0')}H : ${String(minutes).padStart(2,'0')}M : ${String(seconds).padStart(2,'0')}S`;

    if (compact) {
      return (
        <button
          onClick={() => navigate('/subscription')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl ${urgencyConfig.bg} border ${urgencyConfig.border} hover:opacity-90 transition-all text-left`}
        >
          <div className={`w-2 h-2 rounded-full ${urgencyConfig.dot} animate-pulse shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-wider ${urgencyConfig.text} truncate`}>{urgencyConfig.label}</p>
            <p className={`text-[10px] font-bold tabular-nums ${urgencyConfig.sub} truncate`}>{countdownStr}</p>
          </div>
          <ChevronRight size={12} className="text-slate-400 shrink-0" />
        </button>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${urgencyConfig.bg} border ${urgencyConfig.border} cursor-pointer hover:opacity-90 transition-all`}
        onClick={() => navigate('/subscription')}
      >
        <div className={`w-2 h-2 rounded-full ${urgencyConfig.dot} animate-pulse`} />
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black uppercase tracking-wider ${urgencyConfig.text}`}>FREE TRIAL</span>
          <span className={`text-xs font-bold tabular-nums ${urgencyConfig.sub}`}>{countdownStr}</span>
        </div>
      </motion.div>
    );
  }

  // ─── EXPIRED ──────────────────────────────────────────────────────────
  if (status === 'expired' || (status === 'trial' && remaining === 0)) {
    if (compact) {
      return (
        <button
          onClick={() => navigate('/subscription')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
        >
          <XCircle size={14} className="text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 truncate">TRIAL EXPIRED</p>
            <p className="text-[10px] text-red-500 dark:text-red-500 truncate">Subscribe to continue</p>
          </div>
          <ChevronRight size={12} className="text-red-400 shrink-0" />
        </button>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        onClick={() => navigate('/subscription')}
      >
        <XCircle size={14} className="text-red-500" />
        <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400">TRIAL EXPIRED</span>
        <span className="text-xs text-red-500 dark:text-red-500">· Subscribe Now</span>
      </motion.div>
    );
  }

  // ─── PAYMENT FAILED ───────────────────────────────────────────────────
  if (status === 'payment_failed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        onClick={() => navigate('/subscription')}
      >
        <AlertTriangle size={14} className="text-orange-500" />
        <span className="text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">PAYMENT ISSUE</span>
        <span className="text-xs text-orange-500">· Retry Payment</span>
      </motion.div>
    );
  }

  // ─── CANCELLED ────────────────────────────────────────────────────────
  if (status === 'cancelled') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
        onClick={() => navigate('/subscription')}
      >
        <div className="w-2 h-2 rounded-full bg-slate-400" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">CANCELLED</span>
      </motion.div>
    );
  }

  return null;
}
