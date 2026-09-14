import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, ArrowRight, CreditCard, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrialWelcomeModalProps {
  user: any;
  trialEndAt: number; // ms timestamp
  onClose: () => void;
}

function useCountdown(endMs: number) {
  const [remaining, setRemaining] = useState(Math.max(0, endMs - Date.now()));

  useEffect(() => {
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

  return { days, hours, minutes, seconds, remaining };
}

export default function TrialWelcomeModal({ user, trialEndAt, onClose }: TrialWelcomeModalProps) {
  const navigate = useNavigate();
  const { days, hours, minutes, seconds } = useCountdown(trialEndAt);
  const planType = user?.planType || (user?.role === 'clinic' ? 'CLINIC' : 'HOSPITAL');
  const planPrice = planType === 'CLINIC' ? '₹329/month' : '₹3,290/month';

  const features = planType === 'CLINIC'
    ? ['Smart OPD Queue', 'AI Prescription System', 'Billing & Finance', 'Patient CRM', 'WhatsApp Marketing', 'Referral Network', 'Analytics Dashboard']
    : ['IPD Management', 'OPD Referral Handling', 'Department Routing', 'Emergency Alerts', 'Admission Workflow', 'Financial Analytics', 'Referral Notifications'];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header gradient */}
          <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <Sparkles size={32} className="text-amber-300" />
            </motion.div>

            <h2 className="text-2xl font-black tracking-tight mb-1">Welcome to Carebridge+</h2>
            <p className="text-teal-100 text-sm font-medium">
              Your 72-Hour Free Trial Has Started!
            </p>
          </div>

          {/* Countdown */}
          <div className="px-8 py-6 bg-gradient-to-b from-teal-50 to-white dark:from-slate-800 dark:to-slate-900">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4">
              Trial Time Remaining
            </p>
            <div className="flex items-center justify-center gap-3">
              {[
                { value: days, label: 'Days' },
                { value: hours, label: 'Hrs' },
                { value: minutes, label: 'Min' },
                { value: seconds, label: 'Sec' },
              ].map((unit, i) => (
                <React.Fragment key={unit.label}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-teal-100 dark:border-slate-700 flex items-center justify-center">
                      <span className="text-2xl font-black text-teal-700 dark:text-teal-300 tabular-nums">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-wider">
                      {unit.label}
                    </span>
                  </div>
                  {i < 3 && <span className="text-2xl font-black text-teal-400 dark:text-teal-500 mb-4">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="px-8 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              Full Access to {planType === 'CLINIC' ? 'Clinic' : 'Hospital'} Features
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {features.slice(0, 6).map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle size={12} className="text-teal-500 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/40 flex items-center gap-3">
              <Clock size={16} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                After 72 hours, continue with <strong>{planPrice}</strong> — no data lost.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="px-8 pb-8 pt-4 flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Carebridge+</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => { onClose(); navigate('/subscription'); }}
              className="w-full py-3 rounded-2xl border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-bold text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={15} />
              <span>View Subscription Plans</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
