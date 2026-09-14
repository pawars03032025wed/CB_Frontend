import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CreditCard, Stethoscope, Hospital, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { useState } from 'react';

interface SubscriptionRequiredProps {
  user: any;
  darkMode: boolean;
}

export default function SubscriptionRequired({ user, darkMode }: SubscriptionRequiredProps) {
  const navigate = useNavigate();
  const [startingTrial, setStartingTrial] = useState(false);
  const userRole = user?.role;
  const planType = user?.planType || (userRole === 'clinic' ? 'CLINIC' : 'HOSPITAL');
  
  const hasUsedTrial = user?.hasUsedTrial || false;
  
  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await subscriptionService.initTrial(user.uid, planType);
      if (res.success) {
        // Trigger a reload or state update to let them in
        window.location.reload();
      } else {
        alert(res.error || "Failed to start trial.");
      }
    } catch (e: any) {
      alert("Error starting trial");
    }
    setStartingTrial(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #005f73 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full max-w-lg ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="px-8 pt-12 pb-8 bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-5"
          >
            {hasUsedTrial ? <XCircle size={40} className="text-red-400" /> : <Stethoscope size={40} className="text-teal-400" />}
          </motion.div>

          <h1 className="text-2xl font-black tracking-tight mb-2">
            {hasUsedTrial ? "YOUR FREE TRIAL HAS ENDED" : `WELCOME TO CAREBRIDGE+ ${planType}`}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {hasUsedTrial ? "Your data is safe. Continue using Carebridge+ by choosing a subscription plan below." : "Start your 3-day free trial to explore all premium features."}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center mb-6">
            {hasUsedTrial ? "Your account & all data is preserved" : "No credit card required to start"}
          </p>

          <div className="space-y-3">
            {!hasUsedTrial && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleStartTrial}
                disabled={startingTrial}
                className="w-full flex items-center justify-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-teal-500/25"
              >
                <span className="font-black text-sm uppercase tracking-wider">
                  {startingTrial ? "Starting Trial..." : "START FREE TRIAL (3 DAYS)"}
                </span>
                <ArrowRight size={18} />
              </motion.button>
            )}

            {/* Clinic plan CTA */}
            {hasUsedTrial && (planType === 'CLINIC' || userRole === 'clinic') && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/subscription')}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-teal-500/25"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Stethoscope size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-sm uppercase tracking-wider">VIEW CLINIC PLAN</p>
                  <p className="text-teal-200 text-xs">₹329 / month · Full clinic access</p>
                </div>
                <ArrowRight size={18} className="text-teal-300 shrink-0" />
              </motion.button>
            )}

            {/* Hospital plan CTA */}
            {(planType === 'HOSPITAL' || userRole === 'hospital') && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => navigate('/subscription')}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Hospital size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-sm uppercase tracking-wider">VIEW HOSPITAL PLAN</p>
                  <p className="text-indigo-200 text-xs">₹3,290 / month · Full hospital access</p>
                </div>
                <ArrowRight size={18} className="text-indigo-300 shrink-0" />
              </motion.button>
            )}

            {/* If planType unknown, show both */}
            {hasUsedTrial && !planType && userRole !== 'clinic' && userRole !== 'hospital' && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => navigate('/subscription')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:scale-[1.02] transition-all shadow-lg shadow-teal-500/25"
                >
                  <Stethoscope size={20} className="shrink-0" />
                  <span className="flex-1 text-left font-black text-sm">VIEW CLINIC PLAN · ₹329/month</span>
                  <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate('/subscription')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:scale-[1.02] transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Hospital size={20} className="shrink-0" />
                  <span className="flex-1 text-left font-black text-sm">VIEW HOSPITAL PLAN · ₹3,290/month</span>
                  <ArrowRight size={16} />
                </motion.button>
              </>
            )}
          </div>

          {/* What's preserved */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Your data is safe</p>
            <div className="grid grid-cols-2 gap-2">
              {['Patients', 'Appointments', 'EMR Records', 'Prescriptions', 'Billing History', 'Reports'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-4 mt-5">
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              Need help?{' '}
              <a href="mailto:support@carebridge.health" className="text-teal-600 dark:text-teal-400 hover:underline">
                Contact support
              </a>
            </p>
            
            <button
              onClick={() => {
                // Remove auth tokens / clear session
                localStorage.removeItem("cb_user");
                sessionStorage.removeItem("cb_user");
                navigate('/login');
              }}
              className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Logout / Switch Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
