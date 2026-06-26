import React, { useState, useEffect } from "react";
import { ShieldAlert, Clock, Send, LogOut } from "lucide-react";
import { safeStringify } from "../../utils/firestoreErrorHandler";

interface PendingApprovalProps {
  user: any;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function PendingApproval({ user, onLogout, darkMode, setDarkMode }: PendingApprovalProps) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically send request on first load if not already sent
    const hasRequested = localStorage.getItem(`requested_${user.id}`);
    if (hasRequested) {
      setRequested(true);
    } else {
      handleRequestApproval();
    }
  }, []);

  const handleRequestApproval = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: safeStringify({
          user_id: user.id,
          name: user.name,
          role: user.role
        }),
      });
      if (response.ok) {
        setRequested(true);
        localStorage.setItem(`requested_${user.id}`, "true");
      }
    } catch (err) {
      console.error("Error requesting approval:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-[#F5F7FA]'} p-4 relative overflow-hidden transition-colors duration-300`}>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <span className={`text-[15vw] font-extrabold ${darkMode ? 'text-white/5' : 'text-[#0a9396]/5'} rotate-[-15deg] whitespace-nowrap select-none`}>
          Carebridge+
        </span>
      </div>

      <div className={`${darkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center relative z-10 border transition-colors duration-300`}>
        <div className={`${darkMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-[#ee9b00]'} rounded-full inline-flex items-center justify-center shadow-sm mb-6 w-24 h-24 border-4 ${darkMode ? 'border-gray-800' : 'border-white'}`}>
          <Clock size={48} />
        </div>
        
        <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-[#005f73]'} mb-2`}>
          Approval <span className="text-[#ee9b00]">Pending</span>
        </h1>
        
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium mb-8 leading-relaxed`}>
          Hello <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</span>, your account is currently awaiting administrative approval. 
          Please request approval to access your dashboard.
        </p>

        <div className="space-y-4">
          {!requested ? (
            <button
              onClick={handleRequestApproval}
              disabled={loading}
              className="w-full bg-linear-to-r from-[#005f73] to-[#0a9396] text-white font-extrabold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending Request..." : "Send Approval Request"}
              <Send size={20} />
            </button>
          ) : (
            <div className={`${darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100'} p-4 rounded-2xl font-bold border flex items-center justify-center gap-2`}>
              <ShieldAlert size={20} />
              Request Sent! Admin will review soon.
            </div>
          )}

          <button
            onClick={onLogout}
            className={`w-full ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} font-extrabold py-4 rounded-2xl transition-all flex items-center justify-center gap-2`}
          >
            Logout <LogOut size={20} />
          </button>
        </div>

        <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-white/5' : 'border-gray-50'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Carebridge+ Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
