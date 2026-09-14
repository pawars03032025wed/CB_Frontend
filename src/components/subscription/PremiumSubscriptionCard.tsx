import React, { useState, useEffect } from 'react';
import { Clock, Crown, History, ShieldCheck, Zap, Activity, Star, Calendar, ArrowRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';

interface PremiumSubscriptionCardProps {
  user: any;
  accountType: 'clinic' | 'hospital';
  darkMode: boolean;
  onRefreshUser?: () => void;
  onContinueToDashboard?: () => void;
}

export default function PremiumSubscriptionCard({ user, accountType, darkMode, onRefreshUser, onContinueToDashboard }: PremiumSubscriptionCardProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);

  // Check trial status
  const trialActive = user?.subscriptionStatus === 'trial';
  const trialUsed = user?.trialUsed;
  const trialEndsAt = user?.trialEndsAt;
  const isActive = user?.subscriptionStatus === 'active';

  useEffect(() => {
    if (trialActive && trialEndsAt) {
      const calculateTimeLeft = () => {
        let endsAtDate;
        
        if (trialEndsAt?.toDate) {
          endsAtDate = trialEndsAt.toDate();
        } else if (typeof trialEndsAt === 'string') {
          endsAtDate = new Date(trialEndsAt);
        } else if (trialEndsAt?.seconds) {
          endsAtDate = new Date(trialEndsAt.seconds * 1000);
        } else {
          endsAtDate = new Date(trialEndsAt);
        }

        const now = new Date();
        const diff = endsAtDate.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft("00 HOURS");
          if (onRefreshUser) onRefreshUser();
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeLeft(`${hours.toString().padStart(2, '0')} HOURS`);
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 60000); 
      return () => clearInterval(timer);
    }
  }, [trialActive, trialEndsAt, onRefreshUser]);

  const startFreeTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await fetch('/api/subscription/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, accountType })
      });
      const data = await res.json();
      if (data.success) {
        if (onRefreshUser) onRefreshUser();
        if (onContinueToDashboard) onContinueToDashboard();
      } else {
        alert(data.message || 'Failed to start trial');
      }
    } catch (error) {
      console.error("Error starting trial:", error);
      alert('Network error. Please try again.');
    } finally {
      setStartingTrial(false);
    }
  };

  const prices = {
    clinic: { monthly: 2999, yearly: 29999 },
    hospital: { monthly: 9999, yearly: 99999 }
  };

  if (!showDetailedPlan) {
    return (
      <div className={`mx-auto w-full max-w-5xl mb-8 overflow-hidden rounded-[20px] shadow-sm border ${darkMode ? 'bg-[#0f172a] border-slate-700/50' : 'bg-white border-slate-200/50'} p-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md`}>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-gradient-to-b from-[#1877F2] to-[#0b5cce] rounded-[14px] flex items-center justify-center text-white shadow-md shrink-0">
            <Crown size={24} className="drop-shadow-sm" />
          </div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 text-[9px] font-black rounded uppercase tracking-widest">PRO</span>
              <span className={`text-sm font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                CareBridge+ Premium
              </span>
            </div>
            <p className={`text-xs font-bold leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Unlock advanced clinical tools, real-time sync, and premium support.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto shrink-0">
          {!trialUsed && !trialActive && !isActive && (
            <button 
              onClick={startFreeTrial}
              disabled={startingTrial}
              className="py-2 px-4 bg-gradient-to-b from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 shadow-md shadow-orange-500/20"
            >
              <Clock size={14} />
              {startingTrial ? 'STARTING...' : '3-DAY TRIAL'}
            </button>
          )}

          {trialActive && (
            <div className="py-1 px-4 bg-orange-50/80 border border-orange-200 rounded-xl flex flex-col justify-center items-center text-center shadow-inner min-w-[120px]">
               <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest">Trial Active</span>
               <span className="text-xs font-black text-orange-700">{timeLeft || '...'}</span>
            </div>
          )}

          <button 
            onClick={() => setShowDetailedPlan(true)}
            className="py-2 px-4 bg-gradient-to-b from-[#1877F2] to-[#0b5cce] hover:from-[#1464cc] hover:to-[#084298] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Zap size={14} />
            UPGRADE NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-[450px] mb-8 overflow-hidden rounded-[32px] shadow-2xl border relative ${darkMode ? 'bg-[#0f172a] border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
      
      <button 
        onClick={() => setShowDetailedPlan(false)}
        className="absolute top-4 left-4 z-20 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition text-white shadow-sm border border-white/20"
      >
        <ArrowRight size={16} className="rotate-180" />
      </button>

      {/* Header Gradient */}
      <div className="relative h-[130px] bg-gradient-to-br from-[#c6ecd9] via-[#d4e4f7] to-[#b3cbf2] px-6 pt-6">
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowHistory(true)} className="p-2 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full transition text-slate-800 shadow-sm border border-white/20">
            <History size={18} />
          </button>
        </div>
        
        {/* Overlapping Icon and Title */}
        <div className="absolute -bottom-8 left-6 flex items-end gap-5">
          <div className="w-[88px] h-[88px] bg-gradient-to-b from-[#1877F2] to-[#0b5cce] rounded-[24px] border-[5px] border-white dark:border-[#0f172a] flex items-center justify-center text-white shadow-lg relative">
             <div className="absolute inset-0 bg-white/10 rounded-[19px] pointer-events-none"></div>
            <Crown size={42} className="drop-shadow-md" />
          </div>
          <div className="mb-9">
            <div className="inline-flex items-center px-3 py-1 bg-white/50 backdrop-blur-sm border border-white/60 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-full mb-1.5 shadow-xs">
              {isActive ? 'ACTIVE SUBSCRIBER' : trialActive ? 'TRIAL MEMBER' : 'PREMIUM PLAN'}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter drop-shadow-sm leading-none">
              CareBridge+
            </h2>
          </div>
        </div>
      </div>

      <div className="px-6 pt-14 pb-6 space-y-5">
        
        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-[22px] border ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200/70 bg-slate-50/70'} flex flex-col items-center justify-center text-center shadow-xs transition-transform hover:scale-[1.02]`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Plan</span>
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
               ₹{prices[accountType].monthly}
            </span>
          </div>
          <div className={`p-4 rounded-[22px] border ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200/70 bg-slate-50/70'} flex flex-col items-center justify-center text-center shadow-xs transition-transform hover:scale-[1.02]`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Yearly Plan</span>
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              ₹{prices[accountType].yearly}
            </span>
          </div>
          <div className={`p-4 rounded-[22px] border ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200/70 bg-slate-50/70'} flex flex-col items-center justify-center text-center shadow-xs transition-transform hover:scale-[1.02]`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Consultations</span>
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Unlimited
            </span>
          </div>
          <div className={`p-4 rounded-[22px] border ${darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200/70 bg-slate-50/70'} flex flex-col items-center justify-center text-center shadow-xs transition-transform hover:scale-[1.02]`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Support</span>
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              24/7 Priority
            </span>
          </div>
        </div>

        {/* Action Box */}
        <div className={`p-6 rounded-[28px] border relative overflow-hidden ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'} shadow-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="px-2.5 py-1 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 text-[10px] font-black rounded-lg uppercase tracking-widest">PRO</span>
            <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Subscription Actions</span>
          </div>
          
          <h3 className={`text-xl font-black mb-1.5 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'} relative z-10`}>
            Upgrade to Premium
          </h3>
          <p className={`text-[13px] font-bold mb-6 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'} relative z-10`}>
            Unlock all advanced clinical tools, real-time sync, and premium support for your workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            {!trialUsed && !trialActive && !isActive && (
              <button 
                onClick={startFreeTrial}
                disabled={startingTrial}
                className="flex-1 py-3.5 bg-gradient-to-b from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30"
              >
                <Clock size={16} />
                {startingTrial ? 'STARTING...' : '3-DAY TRIAL'}
              </button>
            )}

            {trialActive && (
              <div className="flex-1 py-3 bg-orange-50/80 border border-orange-200 rounded-2xl flex flex-col justify-center items-center text-center shadow-inner">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Free Trial Active</span>
                <span className="text-base font-black text-orange-700 tracking-tight">{timeLeft || '...'}</span>
              </div>
            )}

            <button 
              onClick={() => setShowPayment(true)}
              className="flex-1 py-3.5 bg-gradient-to-b from-[#1877F2] to-[#0b5cce] hover:from-[#1464cc] hover:to-[#084298] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Zap size={16} />
              UPGRADE NOW
            </button>
          </div>
        </div>

        {/* Feature Box */}
        <div className={`p-6 rounded-[28px] border relative overflow-hidden ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'} shadow-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Activity size={16} className="text-[#0d9488]" />
            <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enterprise Features</span>
          </div>
          <h3 className={`text-xl font-black mb-1.5 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'} relative z-10`}>
            Full Clinical Suite
          </h3>
          <p className={`text-[13px] font-bold mb-4 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'} relative z-10`}>
            Comprehensive tools for managing patients, queues, billing, and AI diagnostics.
          </p>
          <div className="text-[11px] font-black text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-lg inline-block relative z-10 uppercase tracking-widest">
            Active Software Environment
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          user={user} 
          accountType={accountType} 
          darkMode={darkMode} 
          onClose={() => setShowPayment(false)} 
          onSuccess={() => {
            setShowPayment(false);
            if (onContinueToDashboard) onContinueToDashboard();
          }}
        />
      )}
      
      {showHistory && (
        <PaymentHistoryModal 
          user={user} 
          darkMode={darkMode} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
}

