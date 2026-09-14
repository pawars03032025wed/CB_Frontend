import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, User, Lock, ArrowRight, ShieldCheck, 
  Activity, Stethoscope, Building2, UserCircle, CheckCircle2, 
  Eye, EyeOff, Check, Zap, Shield, Sparkles, Scale, Heart, 
  Smartphone, Database, MessageSquare, TrendingUp, Inbox,
  Briefcase, Landmark, FileText, ChevronRight, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { firebaseService } from "../../services/firebaseService";
import ThemeToggle from "../common/ThemeToggle";

interface LoginProps {
  onLogin: (user: any) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Login({ onLogin, darkMode, setDarkMode }: LoginProps) {
  const [loginMethod, setLoginMethod] = useState<"existing" | "email">("existing");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<"privacy" | "terms" | null>(null);

  // Admin panel state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminShowPw, setAdminShowPw] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setSeedStatus("Seeding...");
    try {
      const res = await firebaseService.seedData();
      if (res?.success) {
        setSeedStatus(res.message);
        setTimeout(() => setSeedStatus(""), 3000);
      }
    } catch (err) {
      setError("Failed to seed data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    try {
      const data = await firebaseService.login(adminUsername, adminPassword);
      if (data?.success) {
        setShowAdminModal(false);
        onLogin(data.user);
      } else {
        setAdminError(data?.message || "Invalid admin credentials");
      }
    } catch (err: any) {
      setAdminError(err?.message || "Connection error. Please try again.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (loginMethod === "email") {
        const data = await firebaseService.loginWithEmail(username, password);
        if (data?.success) {
          onLogin(data.user);
        } else {
          setError(data?.message || "Invalid email or password");
        }
      } else {
        const data = await firebaseService.login(username, password);
        if (data?.success) {
          onLogin(data.user);
        } else {
          setError(data?.message || "Invalid credentials");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await firebaseService.loginWithGoogle();
      if (data?.success) {
        onLogin(data.user);
      } else {
        setError("Google login failed");
      }
    } catch (err) {
      setError("Google login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "patient", name: "Patient", icon: <UserCircle size={18} />, color: "border-teal-500 text-teal-600 dark:text-teal-400" },
    { id: "clinic", name: "Clinic", icon: <Stethoscope size={18} />, color: "border-blue-500 text-blue-600 dark:text-blue-400" },
    { id: "hospital", name: "Hospital", icon: <Building2 size={18} />, color: "border-sky-500 text-sky-600 dark:text-sky-400" },
    { id: "admin", name: "Admin", icon: <ShieldCheck size={18} />, color: "border-purple-500 text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-[#040814] text-white" : "bg-slate-50 text-slate-900"} flex flex-col relative overflow-x-hidden font-sans`}>
      {/* Decorative Blur Vectors — vibrant multi-color */}
      <div className="absolute top-[2%] right-[8%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute top-[35%] left-[2%] w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "14s" }} />
      <div className="absolute top-[60%] right-[5%] w-[250px] h-[250px] bg-pink-500/10 rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "9s" }} />

      {/* STICKY TOP HEADER */}
      <header className={`sticky top-0 z-[120] backdrop-blur-md border-b flex justify-between items-center px-6 py-4 sm:px-10 ${
        darkMode ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <img src="/carebridge-logo.png" alt="CareBridge Logo" className="w-14 h-14 object-contain drop-shadow-md hover:scale-105 transition-transform" />
          <div className="text-left">
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent block">
              CareBridgePlus
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 block -mt-0.5">
              Secure Connected Care
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-500 text-[10px] font-black uppercase tracking-wider rounded-full border border-teal-500/20">
            ● Secure Node Active
          </span>
        </div>
      </header>

      {/* HERO & ACCESS CONTROL COMBINED SURFACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 sm:px-10 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: HERO INFORMATION & SAAS BADGING */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border" style={{ background: "linear-gradient(135deg,rgba(20,184,166,0.15),rgba(59,130,246,0.15))", borderColor: "rgba(20,184,166,0.3)", color: "#2dd4bf" }}>
            <Sparkles size={12} />
            Connected Healthcare Ecosystem
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
            Smarter Healthcare.<br />
            <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Connected Care.
            </span>
          </h1>

          <p className="text-sm font-semibold leading-relaxed max-w-lg" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            CareBridgePlus bridges the digital divide with an AI-powered healthcare connectivity ecosystem for clinics, hospitals, and patients. Experience seamless hospital referrals, OPD queue tracking, instant bookkeeping, and secure DISHA/ABDM healthcare compliance.
          </p>

          {/* Secure Interactive Badges */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 hover:scale-[1.02] transition-all duration-300 ${ darkMode ? "bg-gradient-to-br from-teal-500/10 to-slate-900/60 border-teal-500/20" : "bg-gradient-to-br from-teal-50 to-white border-teal-200 shadow-sm" }`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#14b8a6,#0ea5e9)", boxShadow: "0 4px 12px rgba(20,184,166,0.35)" }}>
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black uppercase text-teal-600 dark:text-teal-400">DISHA Standard</h4>
                <p className="text-[10px] font-bold text-slate-500">100% Secure Node</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 hover:scale-[1.02] transition-all duration-300 ${ darkMode ? "bg-gradient-to-br from-blue-500/10 to-slate-900/60 border-blue-500/20" : "bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm" }`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}>
                <Zap size={18} className="text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">Inter-SaaS Link</h4>
                <p className="text-[10px] font-bold text-slate-500">Realtime Dispatch</p>
              </div>
            </div>
          </div>

          {/* Clinical telemetry decoration */}
          <div className="w-full hidden sm:block">
            <div className={`p-4 rounded-3xl border border-dashed text-left ${ darkMode ? "bg-gradient-to-r from-slate-900/60 to-slate-950/40 border-slate-700" : "bg-gradient-to-r from-slate-50 to-white border-slate-200" }`}>
              <div className="flex justify-between items-center text-[10px] font-bold font-mono mb-2">
                <span className="text-amber-500">⚡ Live Sync Alerts</span>
                <span className="text-emerald-500 animate-pulse">● System Operating</span>
              </div>
              <p className="text-[11px] font-semibold font-mono italic" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
                Incoming referrals and emergency alerts trigger direct rings instantly upon medical triage dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREMIUM LOGIN CARD */}
        <div id="login-form-area" className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className={`relative rounded-[36px] shadow-2xl overflow-hidden border ${
            darkMode ? "bg-slate-900/80 border-slate-800/80" : "bg-white border-slate-200"
          }`} style={{ boxShadow: darkMode ? "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,184,166,0.1)" : "0 25px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(20,184,166,0.15)" }}>
            {/* Colorful gradient top strip */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#14b8a6,#3b82f6,#8b5cf6,#ec4899,#f59e0b)" }} />

            <div className="p-8 sm:p-10">
            {/* Decorative glow blobs inside card */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(20,184,166,0.12),transparent)" }} />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.10),transparent)" }} />

            <div className="text-center mb-6 relative">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">Access Secure Portal</h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select user workspace role and input credentials</p>
            </div>

            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-red-500/10 text-red-500 p-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider mb-5 flex items-center gap-2.5 border border-red-500/20 text-left"
              >
                <ShieldAlert size={15} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Mode Tabs */}
            <div className={`flex p-1 rounded-xl mb-6 border ${ darkMode ? "bg-white/5 border-white/5" : "bg-slate-100/60 border-slate-200/50" }`}>
              <button
                type="button"
                onClick={() => setLoginMethod("existing")}
                className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "existing"
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                style={loginMethod === "existing" ? { background: "linear-gradient(135deg,#14b8a6,#3b82f6)", boxShadow: "0 2px 10px rgba(20,184,166,0.35)" } : {}}
              >
                Existing Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "email"
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                style={loginMethod === "email" ? { background: "linear-gradient(135deg,#14b8a6,#3b82f6)", boxShadow: "0 2px 10px rgba(20,184,166,0.35)" } : {}}
              >
                Continue with Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Select Grid — colorful individual gradients */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "patient", name: "Patient", icon: <UserCircle size={18} />, activeGrad: "linear-gradient(135deg,#14b8a6,#0ea5e9)", activeShadow: "0 4px 14px rgba(20,184,166,0.4)", activeText: "#fff" },
                  { id: "clinic", name: "Clinic", icon: <Stethoscope size={18} />, activeGrad: "linear-gradient(135deg,#3b82f6,#8b5cf6)", activeShadow: "0 4px 14px rgba(59,130,246,0.4)", activeText: "#fff" },
                  { id: "hospital", name: "Hospital", icon: <Building2 size={18} />, activeGrad: "linear-gradient(135deg,#f59e0b,#ef4444)", activeShadow: "0 4px 14px rgba(245,158,11,0.4)", activeText: "#fff" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all gap-1.5 cursor-pointer ${
                      role === r.id
                        ? "border-transparent"
                        : "border-transparent bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    style={role === r.id ? { background: r.activeGrad, boxShadow: r.activeShadow, color: r.activeText } : {}}
                  >
                    <div className="shrink-0">{r.icon}</div>
                    <span className="text-[10px] font-black lowercase capitalize tracking-widest mt-1">{r.name}</span>
                  </button>
                ))}
              </div>

              {/* Username Input */}
              <div className="text-left">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                  {loginMethod === "email" ? "Verified Email Address" : "Username / Email"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-500 transition-colors">
                    <User size={15} />
                  </div>
                  <input
                    type={loginMethod === "email" ? "email" : "text"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-semibold border outline-none transition-all normal-case input-premium ${
                      darkMode 
                        ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900/90 focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20" 
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20"
                    }`}
                    placeholder={loginMethod === "email" ? "doctor@carebridge.plus" : "username123"}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="text-left">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-500 transition-colors">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-xs font-semibold border outline-none transition-all normal-case input-premium ${
                      darkMode 
                        ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900/90 focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20" 
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-teal-500 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Legals Checkboxes */}
              <div className="space-y-3 px-1 py-0.5 text-left">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={`peer h-4 w-4 appearance-none rounded border transition-all ${
                        darkMode ? "bg-slate-800 border-slate-400" : "bg-white border-slate-300"
                      } checked:bg-teal-500 checked:border-teal-500 cursor-pointer`}
                    />
                    <Check size={11} className="absolute left-0.5 top-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-550 dark:text-slate-400">Remember my secure credentials</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <div className="relative mt-0.5 shrink-0">
                    <input 
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className={`peer h-4 w-4 appearance-none rounded border transition-all ${
                        darkMode ? "bg-slate-800 border-slate-400" : "bg-white border-slate-300"
                      } checked:bg-teal-500 checked:border-teal-500 cursor-pointer`}
                    />
                    <Check size={11} className="absolute left-0.5 top-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-550 dark:text-slate-400 leading-normal">
                    I verify health security consent to the {" "}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveLegalModal("privacy"); }}
                      className="text-teal-500 hover:underline font-black outline-none cursor-pointer"
                    >
                      Privacy Policy
                    </button>{" "}
                    &{" "}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveLegalModal("terms"); }}
                      className="text-teal-500 hover:underline font-black outline-none cursor-pointer"
                    >
                      Terms & Conditions
                    </button>
                  </span>
                </label>
              </div>

              {/* Login Buttons */}
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full text-white font-black py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-widest"
                style={{
                  background: agreed && !loading ? "linear-gradient(135deg,#14b8a6,#3b82f6,#8b5cf6)" : "linear-gradient(135deg,#475569,#334155)",
                  boxShadow: agreed && !loading ? "0 6px 24px rgba(20,184,166,0.4), 0 0 0 1px rgba(20,184,166,0.2)" : undefined,
                  backgroundSize: "200% auto",
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Access Secure Portal <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <div className="mt-5">
              <div className="relative flex items-center justify-center mb-4">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className={`px-3 text-[8px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap ${darkMode ? "bg-slate-900" : "bg-white"}`}>Verified Login Channels</span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                    darkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleSeed}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                    darkMode ? "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20" : "bg-teal-500/5 border-teal-120 text-teal-600 hover:bg-teal-100/40"
                  }`}
                >
                  {seedStatus || "Master Seed"}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-3">
              <Link to="/register" className={`w-full group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                darkMode ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60" : "bg-white border-slate-100 hover:border-blue-100"
              }`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 20px rgba(59,130,246,0.25)" }}>
                  <Zap className="text-white drop-shadow-md" size={24} />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-xl font-black tracking-tight" style={{ color: darkMode ? "#60a5fa" : "#2563eb" }}>
                    REGISTER NOW
                  </span>
                  <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    New workplace
                  </span>
                </div>
              </Link>
              {/* Admin Access Button — colorful premium */}
              <button
                type="button"
                onClick={() => { setShowAdminModal(true); setAdminError(""); setAdminUsername(""); setAdminPassword(""); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 3px 12px rgba(124,58,237,0.35)" }}
              >
                <Shield size={11} />
                <span className="text-[9px] font-black uppercase tracking-widest">Admin Access</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* COMPACT PREMIUM TRUST SECTION */}
      <section className={`py-12 border-t ${darkMode ? "bg-slate-900/30 border-slate-900" : "bg-slate-100/50 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest block mb-2">FOUNDATION PRINCIPLES</span>
            <h2 className="text-xl font-black uppercase tracking-tight">Trust & Patient Reliability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Vision Card */}
            <div className={`p-6 rounded-[24px] border text-left ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-205"}`}>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-sm font-black uppercase mb-2">Vision</h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                “To build India’s most trusted intelligent healthcare connectivity ecosystem through secure digital innovation.”
              </p>
            </div>

            {/* Mission Card */}
            <div className={`p-6 rounded-[24px] border text-left ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-205"}`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-black uppercase mb-2">Mission</h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                “To simplify healthcare operations through AI-powered workflows, secure communication, referrals, billing, and patient engagement.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GOALS GRID */}
      <section className={`py-12 border-t ${darkMode ? "border-slate-900" : "border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest block mb-2">OPERATIONAL BENCHMARKS</span>
            <h2 className="text-xl font-black uppercase tracking-tight">Ecosystem Goals</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { title: "Smart OPD/IPD Operations", desc: "Reduce queue load dynamically", icon: <Inbox size={16} className="text-teal-500" /> },
              { title: "Healthcare Connectivity", desc: "Link outpatient clinical chains", icon: <Activity size={16} className="text-blue-500" /> },
              { title: "AI Health Assistance", desc: "Automate intake history summarization", icon: <Sparkles size={16} className="text-purple-500" /> },
              { title: "Intelligent Billing", desc: "Speedy cashbooks and billing ledgers", icon: <Landmark size={16} className="text-emerald-500" /> },
              { title: "Secure Healthcare Workflows", desc: "Comply strictly with ABDM rules", icon: <ShieldCheck size={16} className="text-indigo-500" /> },
              { title: "Realtime Communication", desc: "Direct alarm sirens during transfers", icon: <MessageSquare size={16} className="text-sky-500" /> },
              { title: "Digital Patient Engagement", desc: "Automate reminders and records", icon: <Heart size={16} className="text-rose-500" /> },
              { title: "Healthcare CRM Ecosystem", desc: "Manage localized medical alerts", icon: <Briefcase size={16} className="text-amber-500" /> }
            ].map((goal, idx) => (
              <div key={idx} className={`p-5 rounded-[20px] border text-left flex flex-col justify-between ${
                darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
              }`}>
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center mb-3">
                    {goal.icon}
                  </div>
                  <h4 className="text-xs font-black leading-tight mb-1">{goal.title}</h4>
                  <p className="text-[10px] font-semibold text-slate-400">{goal.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIVES SECTION */}
      <section className={`py-12 border-t ${darkMode ? "bg-slate-900/10 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">TARGET OBJECTIVES</span>
            <h2 className="text-xl font-black uppercase tracking-tight">Key System Value</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Faster patient coordination", icon: <Users size={14} className="text-teal-500" /> },
              { label: "Better hospital referrals", icon: <Briefcase size={14} className="text-blue-500" /> },
              { label: "Smart healthcare communication", icon: <MessageSquare size={14} className="text-purple-500" /> },
              { label: "Efficient billing workflow", icon: <Landmark size={14} className="text-emerald-500" /> },
              { label: "Secure patient management", icon: <Shield size={14} className="text-indigo-500" /> },
              { label: "AI-assisted healthcare support", icon: <Sparkles size={14} className="text-rose-500" /> }
            ].map((obj, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 text-left ${
                darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-205"
              }`}>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0">
                  {obj.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{obj.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMS & PRIVACY SUMMARY */}
      <section className={`py-12 border-t ${darkMode ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">COMPLIANCE STATEMENTS</span>
            <h2 className="text-xl font-black uppercase tracking-tight">Security & Governance Summary</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8 text-left">
            <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-205"} space-y-2`}>
              <h4 className="text-xs font-black uppercase text-teal-500">Secure Data Handling</h4>
              <p className="text-[11px] font-bold text-slate-400 leading-normal">Patient vitals and clinical files are fully encrypted in transit using standards verified by ABDM nodes.</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-205"} space-y-2`}>
              <h4 className="text-xs font-black uppercase text-blue-500">Authorized Usage</h4>
              <p className="text-[11px] font-bold text-slate-400 leading-normal">Only verified clinics can dispatch transfer logs. Credentials undergo secure crosscheck validations.</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-205"} space-y-2`}>
              <h4 className="text-xs font-black uppercase text-purple-500">AI Assistance Disclaimer</h4>
              <p className="text-[11px] font-bold text-slate-400 leading-normal">AI indicators and diagnosis recommendations are clinical summaries and require verified doctor signoff.</p>
            </div>
            <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-205"} space-y-2`}>
              <h4 className="text-xs font-black uppercase text-sky-500">Secure Authentication</h4>
              <p className="text-[11px] font-bold text-slate-400 leading-normal">Sessions close automatically after 15 minutes of inactivity to protect hospital computer screens.</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveLegalModal("privacy")}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Read Privacy Policy
              <ChevronRight size={12} />
            </button>
            <button
              onClick={() => setActiveLegalModal("terms")}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Read Terms & Conditions
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 border-t text-center ${darkMode ? "bg-slate-950/80 border-slate-905" : "bg-slate-50 border-slate-200"}`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          CareBridgePlus Clinical Enterprise Control Systems • Secure Practice Node Active
        </p>
      </footer>


      {/* ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[19000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setShowAdminModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden ${
                darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className={`px-6 pt-6 pb-4 border-b ${ darkMode ? "border-slate-800" : "border-slate-100" }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black capitalize tracking-wider">Admin portal</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Restricted Access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleAdminSubmit} className="px-6 py-5 space-y-4">
                {adminError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider"
                  >
                    <ShieldAlert size={13} className="shrink-0" />
                    <span>{adminError}</span>
                  </motion.div>
                )}

                {/* Admin Username */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Admin Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                      <User size={14} />
                    </div>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                        darkMode
                          ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/15"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/15"
                      }`}
                      placeholder="admin"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-500 transition-colors">
                      <Lock size={14} />
                    </div>
                    <input
                      type={adminShowPw ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                        darkMode
                          ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/15"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/15"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setAdminShowPw(!adminShowPw)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-500 cursor-pointer"
                    >
                      {adminShowPw ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[10px] uppercase tracking-widest"
                  style={{ boxShadow: "0 4px 20px rgba(147,51,234,0.25)" }}
                >
                  {adminLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><ShieldCheck size={14} /> Access Admin Panel</>
                  )}
                </button>
              </form>

              {/* Footer badge */}
              <div className={`px-6 pb-4 text-center`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  🔒 Authorized Personnel Only
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEGAL MODALS */}
      <AnimatePresence>
        {activeLegalModal && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveLegalModal(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-2xl h-[400px] rounded-3xl shadow-2xl border overflow-hidden flex flex-col ${
                darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-teal-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    {activeLegalModal === "privacy" ? "CareBridgePlus Privacy Policy Manual" : "CareBridgePlus Platform Usage Terms"}
                  </h3>
                </div>
                <button onClick={() => setActiveLegalModal(null)} className="text-slate-400 hover:text-slate-100 cursor-pointer">
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 text-left space-y-4 text-xs font-bold text-slate-555 text-slate-500 dark:text-slate-400 leading-relaxed custom-scrollbar">
                {activeLegalModal === "privacy" ? (
                  <>
                    <h4 className="text-slate-950 dark:text-white font-black text-xs uppercase">1. Patient Information Sovereignty</h4>
                    <p>All clinical documents, diagnostic indicators, and medicine reminder timelines uploaded are the secure property of the originating patient/clinic. We enforce strict data compartmentalization rules using enterprise firewalls.</p>
                    <h4 className="text-slate-950 dark:text-white font-black text-xs uppercase">2. Access Control Consent Protocol</h4>
                    <p>Referral records, hospital admissions dispatch data, and vital analytics curves are visible strictly to verified medical practitioners with active security authentications.</p>
                    <h4 className="text-slate-950 dark:text-white font-black text-xs uppercase">3. Realtime Audit & Security</h4>
                    <p>Our platform maintains active connections to Firebase Cloud Storage with rule-bound parameter filters. Actions performed on the ledger are stored securely for regulatory verification compliance.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-slate-950 dark:text-white font-black text-xs uppercase">1. Clinical Credentials Authentication</h4>
                    <p>Registration onto the clinic or hospital workspace requires legitimate certification from legal state boards. Admin approvals remain pending until license credentials are confirmed manually.</p>
                    <h4 className="text-slate-955 dark:text-white font-black text-xs uppercase">2. Generative AI Guidelines</h4>
                    <p>AI recommendations generated through our secure endpoints represent clinical suggestions supporting the doctor's review. Medical decisions are the exclusive legal responsibility of the doctor.</p>
                    <h4 className="text-slate-955 dark:text-white font-black text-xs uppercase">3. Strict Session Disconnection</h4>
                    <p>Accounts unused during a contiguous 15-minute period trigger a forced secure log-out sequence. This prevents computer screen compromise during local outpatient workspace shifts.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
