import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard, AlertTriangle,
  Calendar, RefreshCw, Loader2, Download, ExternalLink, Trash2, 
  ChevronRight, Home, IndianRupee, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, BillingEvent } from '../../services/subscriptionService';

interface SubscriptionManagementProps {
  user: any;
  darkMode: boolean;
}

type CancelState = 'idle' | 'confirming' | 'cancelling' | 'done';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', label: '● ACTIVE' },
    trial: { cls: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400', label: '● FREE TRIAL' },
    expired: { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: '● EXPIRED' },
    cancelled: { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500', label: '● CANCELLED' },
    payment_failed: { cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', label: '● PAYMENT ISSUE' },
    paused: { cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: '● PAUSED' },
    suspended: { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: '● SUSPENDED' },
  };
  const { cls, label } = map[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const positiveEvents = ['trial_started', 'payment_successful', 'webhook_payment_captured', 'subscription_reactivated'];
  const negativeEvents = ['payment_signature_failed', 'webhook_payment_failed', 'trial_expired'];
  const isPositive = positiveEvents.some(e => type.includes(e.replace('trial_started', 'trial_start')));
  const isNegative = negativeEvents.some(e => type.includes('failed') || type.includes('expired'));

  let label = type.replace(/_/g, ' ').replace(/webhook /g, '');
  label = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
      isNegative ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      : isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    }`}>{label}</span>
  );
}

export default function SubscriptionManagement({ user, darkMode }: SubscriptionManagementProps) {
  const navigate = useNavigate();
  const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [cancelState, setCancelState] = useState<CancelState>('idle');

  const status = user?.subscriptionStatus;
  const planType = user?.planType;
  const price = planType === 'CLINIC' ? '₹329' : planType === 'HOSPITAL' ? '₹3,290' : '—';
  const planLabel = planType === 'CLINIC' ? 'Clinic Plan' : planType === 'HOSPITAL' ? 'Hospital Plan' : '—';

  useEffect(() => {
    if (!user?.id) return;
    subscriptionService.getBillingHistory(user.id)
      .then(res => setBillingHistory(res.events || []))
      .finally(() => setLoadingHistory(false));
  }, [user?.id]);

  const handleCancel = async () => {
    if (cancelState === 'confirming') {
      setCancelState('cancelling');
      const res = await subscriptionService.cancelSubscription(user.id);
      if (res.success) {
        setCancelState('done');
      } else {
        setCancelState('idle');
        alert('Failed to cancel subscription. Please contact support.');
      }
    } else {
      setCancelState('confirming');
    }
  };

  const canCancel = status === 'active' && cancelState !== 'done' && !user?.cancelAtPeriodEnd;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* Header */}
      <div className={`sticky top-0 z-40 border-b ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="font-black text-lg text-slate-800 dark:text-slate-200">Subscription</h1>
          <button onClick={() => navigate(`/${user?.role}`)} className="text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400">
            <Home size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Current Plan</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{planLabel}</h2>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-black text-teal-700 dark:text-teal-400">{price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm pb-1">/month</span>
                </div>
              </div>
              <StatusBadge status={status || 'trial'} />
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Plan Type', value: planType || '—' },
              { label: 'Status', value: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : '—' },
              { label: 'Start Date', value: formatDate(user?.subscriptionStartAt) },
              { label: 'Next Billing', value: formatDate(user?.subscriptionNextBillingAt) },
              { label: 'Payment Status', value: user?.paymentStatus?.replace(/_/g, ' ') || '—' },
              { label: 'Subscription ID', value: user?.subscriptionId ? user.subscriptionId.slice(0, 16) + '...' : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{value}</p>
              </div>
            ))}
          </div>

          {user?.cancelAtPeriodEnd && (
            <div className="mx-6 mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Cancellation scheduled — access continues until {formatDate(user?.subscriptionNextBillingAt)}.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 pb-6 flex flex-wrap gap-3">
            {(status === 'expired' || status === 'payment_failed') && (
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-teal-500/20"
              >
                <RefreshCw size={14} />
                RENEW SUBSCRIPTION
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelState === 'cancelling'}
                className={`px-5 py-3 rounded-xl border text-sm font-bold transition-colors flex items-center gap-2
                  ${cancelState === 'confirming'
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 dark:border-red-700/50'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400'
                  }`}
              >
                {cancelState === 'cancelling' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {cancelState === 'confirming' ? 'CONFIRM CANCEL' : 'Cancel Subscription'}
              </button>
            )}

            {cancelState === 'confirming' && (
              <button
                onClick={() => setCancelState('idle')}
                className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Plan
              </button>
            )}

            {cancelState === 'done' && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                <CheckCircle2 size={15} />
                Cancellation scheduled. No further charges.
              </div>
            )}

            <a
              href="mailto:support@carebridge.health"
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <ExternalLink size={14} />
              Contact Support
            </a>
          </div>
        </motion.div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-slate-900 dark:text-slate-100">Billing History</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All subscription events and payments</p>
          </div>

          {loadingHistory ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={24} className="text-teal-500 animate-spin" />
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No billing history yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {billingHistory.map((event, i) => (
                <motion.div
                  key={event.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <EventTypeBadge type={event.eventType || ''} />
                      {event.planType && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{event.planType}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {event.amount ? (
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                        ₹{(event.amount / 100).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                    {event.paymentId && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[120px]">{event.paymentId.slice(0, 16)}...</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 justify-center pb-4">
          <ShieldCheck size={14} />
          <span>Payments secured by Razorpay · All INR transactions · Your data is never deleted</span>
        </div>
      </div>
    </div>
  );
}
