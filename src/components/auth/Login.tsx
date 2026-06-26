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
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"} flex flex-col relative overflow-x-hidden font-sans`}>
      {/* Decorative Blur Vectors */}
      <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />

      {/* STICKY TOP HEADER */}
      <header className={`sticky top-0 z-[120] backdrop-blur-md border-b flex justify-between items-center px-6 py-4 sm:px-10 ${
        darkMode ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <Stethoscope size={20} className="stroke-[2.5]" />
          </div>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider border border-teal-500/20">
            <Sparkles size={12} className="text-teal-500" />
            Connected Healthcare Ecosystem
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
            Smarter Healthcare.<br />
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
              Connected Care.
            </span>
          </h1>

          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
            CareBridgePlus bridges the digital divide with an AI-powered healthcare connectivity ecosystem for clinics, hospitals, and patients. Experience seamless hospital referrals, OPD queue tracking, instant bookkeeping, and secure DISHA/ABDM healthcare compliance.
          </p>

          {/* Secure Interactive Badges with Smooth Hover */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-205 shadow-xs"} flex items-center gap-3.5 hover:scale-[1.01] transition-transform`}>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left font-sans">
                <h4 className="text-xs font-black uppercase text-slate-400">DISHA Standard</h4>
                <p className="text-[10px] font-bold text-slate-500">100% Secure Node</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-205 shadow-xs"} flex items-center gap-3.5 hover:scale-[1.01] transition-transform`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div className="text-left font-sans">
                <h4 className="text-xs font-black uppercase text-slate-400">Inter-SaaS Link</h4>
                <p className="text-[10px] font-bold text-slate-500">Realtime Dispatch</p>
              </div>
            </div>
          </div>

          {/* Clinical visual telemetry decoration */}
          <div className="w-full hidden sm:block">
            <div className={`p-4 rounded-3xl border border-dashed text-left ${darkMode ? "bg-slate-950/45 border-slate-800" : "bg-slate-100/50 border-slate-200"}`}>
              <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400 mb-2">
                <span>⚡ Live Sync Alerts</span>
                <span className="text-emerald-500 animate-pulse">● System Operating</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono italic">
                Incoming referrals and emergency alerts trigger direct rings instantly upon medical triage dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GLASSMORPHISM LOGIN CARD */}
        <div id="login-form-area" className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className={`glass p-8 sm:p-10 rounded-[36px] shadow-2xl relative border overflow-hidden ${
            darkMode ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Access Secure Portal</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Select user workspace role and input credentials</p>
            </div>

            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-3 border border-red-500/20 text-left"
              >
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Mode Tabs */}
            <div className="flex bg-slate-100/60 dark:bg-white/5 p-1.5 rounded-2xl mb-6 border border-slate-200/40 dark:border-white/5">
              <button
                type="button"
                onClick={() => setLoginMethod("existing")}
                className={`flex-1 text-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "existing"
                    ? "bg-white dark:bg-slate-800 text-teal-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                }`}
              >
                Existing Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 text-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "email"
                    ? "bg-white dark:bg-slate-800 text-teal-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                }`}
              >
                Continue with Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Select Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all gap-1.5 cursor-pointer ${
                      role === r.id 
                        ? `bg-teal-500/10 ${r.color} shadow-md` 
                        : "border-transparent bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-200 hover:border-slate-350 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className="shrink-0">{r.icon}</div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{r.name}</span>
                  </button>
                ))}
              </div>

              {/* Username Input */}
              <div className="text-left">
                <label className="text-[9px] font-black text-slate-450 text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  {loginMethod === "email" ? "Verified Email Address" : "Username / Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type={loginMethod === "email" ? "email" : "text"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold border-2 border-transparent transition-all outline-none focus:ring-2 focus:ring-teal-500/10 ${
                      darkMode ? "bg-white/5 focus:bg-slate-800 focus:border-slate-700" : "bg-slate-100 focus:bg-white focus:border-teal-500/20"
                    }`}
                    placeholder={loginMethod === "email" ? "doctor@carebridge.plus" : "username123"}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="text-left">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3.5 rounded-2xl text-xs font-bold border-2 border-transparent transition-all outline-none focus:ring-2 focus:ring-teal-500/10 ${
                      darkMode ? "bg-white/5 focus:bg-slate-800 focus:border-slate-700" : "bg-slate-100 focus:bg-white focus:border-teal-500/20"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-500 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Legals Checkboxes */}
              <div className="space-y-3.5 px-1 py-1 text-left">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer h-5 w-5 appearance-none rounded-md border border-slate-350 dark:border-white/20 checked:bg-teal-500 checked:border-teal-500 transition-all cursor-pointer"
                    />
                    <Check size={14} className="absolute left-0.5 top-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Remember my secure credentials</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <div className="relative mt-0.5 shrink-0">
                    <input 
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer h-5 w-5 appearance-none rounded-md border border-slate-350 dark:border-white/20 checked:bg-teal-500 checked:border-teal-500 transition-all cursor-pointer"
                    />
                    <Check size={14} className="absolute left-0.5 top-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
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
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Access Secure Portal <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className={`px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 tracking-wider ${darkMode ? "bg-slate-900" : "bg-white"}`}>Verified Login Channels</span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                    darkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleSeed}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${
                    darkMode ? "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20" : "bg-teal-500/5 border-teal-120 text-teal-600 hover:bg-teal-100/40"
                  }`}
                >
                  {seedStatus || "Master Seed"}
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-slate-400">
                New clinical workspace?{" "}
                <Link to="/register" className="text-teal-500 hover:underline underline-offset-4 font-black">Register Practice</Link>
              </p>
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
