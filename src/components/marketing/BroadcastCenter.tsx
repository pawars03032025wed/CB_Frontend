import React, { useState, useEffect } from "react";
import { Send, Clock, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface BroadcastCenterProps {
  darkMode: boolean;
  showToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
  handleBulkSendWhatsApp?: (content: string, type: "card" | "tip" | "campaign") => Promise<void>;
}

export default function BroadcastCenter({ darkMode, showToast, setActiveTab, handleBulkSendWhatsApp }: BroadcastCenterProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isBroadcasting && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 15, 100));
      }, 500);
    } else if (progress >= 100) {
      setIsBroadcasting(false);
      showToast("Broadcast completed successfully!");
    }
    return () => clearInterval(interval);
  }, [isBroadcasting, progress]);

  const startBroadcast = async () => {
    setIsBroadcasting(true);
    setProgress(0);
    if (handleBulkSendWhatsApp) {
      await handleBulkSendWhatsApp("Campaign Message", "campaign");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center">
      <div className={`w-full max-w-3xl p-8 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        
        <div className="text-center mb-10">
          <Send size={48} className="mx-auto text-teal-600 mb-4" />
          <h2 className="text-2xl font-black">Broadcast Center</h2>
          <p className="text-slate-500 mt-2">Manage and monitor your campaign deliveries.</p>
        </div>

        <div className={`p-6 rounded-2xl border-2 mb-8 ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">Queued Campaign: Monsoon Health Checkup</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Clock size={14} /> Scheduled: Immediate
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-xs uppercase tracking-wider rounded-full">
              Ready
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-xl border ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Total Audience</p>
              <p className="text-xl font-black">1,002</p>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Channel</p>
              <p className="text-xl font-black text-green-500">WhatsApp</p>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Estimated Time</p>
              <p className="text-xl font-black">~2 mins</p>
            </div>
          </div>

          {!isBroadcasting && progress === 0 && (
            <button 
              onClick={startBroadcast}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              Start Broadcast <Send size={20} />
            </button>
          )}

          {(isBroadcasting || progress > 0) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-teal-600">
                  {progress >= 100 ? <CheckCircle size={16} /> : <Activity size={16} className="animate-pulse" />}
                  {progress >= 100 ? "Completed" : "Sending..."}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              {progress >= 100 && (
                <button 
                  onClick={() => setActiveTab("analytics")}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 font-bold rounded-xl mt-4"
                >
                  View Analytics
                </button>
              )}
            </div>
          )}

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl flex gap-3 text-sm">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
          <div className="text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Background Processing Enabled</p>
            You can leave this page. The broadcast is queued and handled securely by our servers. Webhooks will automatically update delivery statuses in the Analytics tab.
          </div>
        </div>

      </div>
    </motion.div>
  );
}
