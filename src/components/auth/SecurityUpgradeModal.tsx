import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Mail, Lock, Check, ShieldAlert } from "lucide-react";
import { firebaseService } from "../../services/firebaseService";

interface SecurityUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currUser: any;
  darkMode: boolean;
  onUpgradeSuccess: (newFields: any) => void;
}

export default function SecurityUpgradeModal({
  isOpen,
  onClose,
  currUser,
  darkMode,
  onUpgradeSuccess
}: SecurityUpgradeModalProps) {
  const [method, setMethod] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleGoogleUpgrade = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await firebaseService.upgradeAccountToGoogle(currUser.id, currUser.email || "");
      if (res.success) {
        setSuccessMsg(res.message);
        onUpgradeSuccess({ authProvider: "google", emailVerified: true });
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to link Google account.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please complete all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await firebaseService.upgradeAccountToEmail(currUser.id, email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        onUpgradeSuccess({ authProvider: "email", emailVerified: false, email });
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to setup secure email credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          className={`relative w-full max-w-lg p-8 sm:p-10 rounded-[36px] shadow-2xl border overflow-hidden flex flex-col ${
            darkMode ? "bg-gray-900 border-white/5 text-white" : "bg-white border-gray-150 text-gray-900"
          }`}
        >
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -z-10" />

          {/* Close Header Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black">Upgrade Security</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enable Enterprise-Grade Auth Protection</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2 border border-red-200 dark:border-red-500/15">
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2 border border-green-200 dark:border-green-500/15">
              <Check size={16} /> {successMsg}
            </div>
          )}

          {!method ? (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Your account is currently using legacy credentials. To meet strict healthcare privacy standards (such as DISHA & ABDM guidelines), we highly recommend linking Google Authenticator or configuring a secure verified Email endpoint.
              </p>

              <button
                onClick={() => setMethod("google")}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Link with Google Sign-In
              </button>

              <button
                onClick={() => setMethod("email")}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-primary hover:bg-opacity-90 text-white shadow-xl shadow-brand-primary/10 transition-all"
              >
                <Mail size={16} />
                Configure Secure Verified Email
              </button>

              <button
                onClick={onClose}
                className="w-full py-4 text-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                I will upgrade later
              </button>
            </div>
          ) : method === "google" ? (
            <div className="space-y-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                Connect your workspace account directly to Google Sign-In. You'll be able to bypass manual passwords and gain instant, secure verification access.
              </p>

              <button
                onClick={handleGoogleUpgrade}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all disabled:opacity-50"
              >
                {loading ? "Authorizing Google..." : "Upgrade Now with Google"}
              </button>

              <button
                onClick={() => setMethod(null)}
                className="w-full text-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
              >
                Choose other method
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailUpgrade} className="space-y-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                Upgrade your legacy credential to a verified email endpoint. We will send an instant activation verification challenge to verify workspace ownership.
              </p>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Enterprise Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border outline-hidden transition-all ${
                      darkMode
                        ? "bg-white/5 border-white/5 focus:bg-gray-800 focus:border-white/10 focus:ring-4 focus:ring-white/5"
                        : "bg-gray-50 border-gray-150 focus:bg-white focus:border-brand-primary/25 focus:ring-4 focus:ring-brand-primary/5"
                    }`}
                    placeholder="doctor@workspace.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Set Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border outline-hidden transition-all ${
                      darkMode
                        ? "bg-white/5 border-white/5 focus:bg-gray-800 focus:border-white/10 focus:ring-4 focus:ring-white/5"
                        : "bg-gray-50 border-gray-150 focus:bg-white focus:border-brand-primary/25 focus:ring-4 focus:ring-brand-primary/5"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMethod(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 h-14"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-primary hover:bg-opacity-90 text-white h-14 shadow-xl shadow-brand-primary/15"
                >
                  {loading ? "Activating..." : "Send Verification Link"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
