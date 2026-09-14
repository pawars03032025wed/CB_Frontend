import React, { useState } from "react";
import { 
  ShieldAlert, User, Lock, ArrowRight, Hospital, MapPin, Phone, 
  FileText, GraduationCap, Stethoscope, Mail, CheckCircle, 
  Smartphone, Users, Hash, Eye, EyeOff, X, Building2, UserCircle,
  ShieldCheck, Check, Scale, Shield, Sparkles, Heart, Activity
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { firebaseService } from "../../services/firebaseService";
import { subscriptionService } from "../../services/subscriptionService";
import TrialWelcomeModal from "../subscription/TrialWelcomeModal";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

interface RegisterProps {
  onLogin?: (user: any) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Register({ onLogin, darkMode, setDarkMode }: RegisterProps) {
  const [role, setRole] = useState<"hospital" | "clinic" | "patient">("patient");
  const [registerMethod, setRegisterMethod] = useState<"username" | "email">("email");
  const [successEmailMessage, setSuccessEmailMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<"privacy" | "terms" | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    city: "",
    details: {
      helpline: "",
      address: "",
      degree: "",
      reg_no: "",
      doctor_name: "",
      qualification: "",
      contact_no: "",
      email: "",
      age: "",
      full_address: ""
    }
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [readLegals, setReadLegals] = useState(false);
  const [trialWelcome, setTrialWelcome] = useState<{ userId: string; trialEndAt: number; role: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the terms and conditions to proceed.");
      return;
    }

    setLoading(true);

    try {
      let data;
      if (registerMethod === "email") {
        data = await firebaseService.registerUserWithEmail({
          email: formData.username,
          password: formData.password,
          role,
          name: formData.name,
          city: formData.city,
          details: formData.details
        });
      } else {
        data = await firebaseService.register({ ...formData, role });
      }
      
      if (data?.success) {
        // Registration successful. Trial should be started explicitly by the user later.

        if (registerMethod === "email") {
          setSuccessEmailMessage(`WELCOME TO CAREBRIDGE FAMILY! YOUR REQUEST SENT TO ADMIN, AND IN SHORT TIME PERIOD YOU CAN GET FULL ACCESS. YOUR CREDENTIAL IS ${formData.username} AND SAVE IT.`);
          setSuccess(true);
        } else {
          if (role === 'patient' && data.user && onLogin) {
            onLogin(data.user);
            navigate("/patient");
          } else {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 5000);
          }
        }
      } else {
        setError(data?.message || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
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
        if (onLogin) onLogin(data.user);
        navigate(data.user.role === 'patient' ? "/patient" : `/${data.user.role}`);
      } else {
        setError("Google registration failed");
      }
    } catch (err) {
      setError("Google registration error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-grid bg-[#040814] bg-logo-watermark transition-colors duration-500 text-white">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-brand-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="bg-slate-950/80 backdrop-blur-xl p-10 rounded-[30px] shadow-2xl w-full max-w-md text-center border border-white/10 relative z-10"
          style={{ boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 40px rgba(10,147,150,0.1)" }}
        >
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl scale-125" />
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center shadow-xl shadow-green-500/30">
              <CheckCircle size={38} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-black mb-2 text-white">
            {registerMethod === "email" ? "Check Your Inbox!" : "You're In!"}
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            {registerMethod === "email" ? "A verification email has been dispatched." : "Account created and pending admin approval."}
          </p>

          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
              ● Pending Verification
            </span>
          </div>

          {registerMethod !== "email" && (
            <p className="text-gray-400 mb-6 font-semibold leading-relaxed text-xs">
              Your account has been created and is waiting for administrator approval. You will be redirected shortly.
            </p>
          )}

          {registerMethod === "email" && (
            <div className="mb-8 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1c] shadow-2xl relative text-left normal-case">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
              <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Mail size={14} className="text-brand-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Auto-Message Delivered</div>
                  <div className="text-xs font-bold text-white mt-0.5">Welcome to CareBridge Family</div>
                </div>
              </div>
              <div className="p-5 text-xs font-medium text-slate-300 space-y-4">
                <p>Hello <span className="text-white font-bold">{formData.name || "User"}</span>,</p>
                <p className="leading-relaxed uppercase text-[10px] tracking-wide font-bold">
                  WELCOME TO CAREBRIDGE FAMILY. YOUR REQUEST HAS BEEN SENT TO ADMIN, AND IN A SHORT TIME PERIOD YOU CAN GET FULL ACCESS.
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2 mt-4">
                  <p className="text-[9px] font-black uppercase text-brand-secondary tracking-widest mb-2 border-b border-white/5 pb-2">Your Credentials (SAVE IT)</p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Email</span>
                    <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formData.username}</span>
                  </p>
                  <p className="flex justify-between items-center mt-2">
                    <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Password</span>
                    <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formData.password}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/30">
            Go to Login <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const roleConfigs = [
    { 
      id: "patient", name: "Patient", 
      icon: <UserCircle size={16} />, 
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/20",
      desc: "Personal records"
    },
    { 
      id: "clinic", name: "Clinic", 
      icon: <Stethoscope size={16} />, 
      gradient: "from-teal-500 to-emerald-500",
      glow: "shadow-teal-500/20",
      desc: "Practice portal"
    },
    { 
      id: "hospital", name: "Hospital", 
      icon: <Building2 size={16} />, 
      gradient: "from-orange-500 to-amber-500",
      glow: "shadow-orange-500/20",
      desc: "Health system"
    },
  ];

  const inputClass = `w-full pl-10 pr-3 py-3 rounded-xl text-xs font-semibold border outline-none transition-all input-premium ${
    darkMode 
      ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900/90 focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20" 
      : "bg-slate-50 border-slate-205 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20"
  }`;
  const inputClassNoIcon = `w-full px-4 py-3 rounded-xl text-xs font-semibold border outline-none transition-all input-premium ${
    darkMode 
      ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900/90 focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20" 
      : "bg-slate-50 border-slate-205 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20"
  }`;

  return (
    <div className={`min-h-screen bg-grid bg-logo-watermark transition-colors duration-500 flex flex-col items-center justify-center relative overflow-x-hidden font-sans ${
      darkMode ? "bg-[#040814] text-white" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* ─── Ambient Background Orbs ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-1/4 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-12 right-1/4 w-[350px] h-[350px] bg-brand-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2.5s" }} />
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className={`mx-4 mt-3 rounded-xl px-5 py-2 flex items-center justify-between backdrop-blur-xl border transition-all ${
          darkMode ? "border-white/10 bg-slate-900/70 shadow-2xl" : "border-slate-200/80 bg-white/70 shadow-lg"
        }`}>
          <Logo size={24} />
          <div className="flex items-center gap-3">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <Link 
              to="/login" 
              className={`px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all ${
                darkMode 
                  ? "bg-white/10 hover:bg-white/15 text-gray-200 border-white/5" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTAINER ─── */}
      <div className="relative z-10 w-full max-w-2xl px-4 pt-20 pb-10">

        {/* ─── HERO HEADER ─── */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 mb-3"
          >
            <Sparkles size={11} className="text-brand-secondary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-secondary">Join CareBridge Network</span>
          </motion.div>

          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            Create Your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-secondary via-teal-400 to-brand-secondary bg-clip-text text-transparent animate-gradient"
                style={{ backgroundSize: "200% auto" }}>
                Workspace
              </span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 6 Q50 2 100 5 Q150 8 200 4" stroke="url(#grad)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0a9396"/>
                    <stop offset="100%" stopColor="#94d2bd"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          <p className={`text-xs font-semibold uppercase tracking-wider ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}>
            Secure • DISHA Compliant • Healthcare Platform
          </p>
        </motion.div>

        {/* ─── COMPACT REGISTER CARD ─── */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className={`rounded-3xl overflow-hidden border transition-all relative ${
            darkMode ? "border-white/10 bg-slate-950/80 shadow-2xl" : "border-slate-200/80 bg-white shadow-xl"
          }`}
          style={{ backdropFilter: "blur(20px)" }}
        >
          
          {/* ── Register Method Tabs ── */}
          <div className={`flex border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}>
            {[
              { id: "username", label: "Username Login", icon: <User size={12} /> },
              { id: "email", label: "Enterprise Email", icon: <Mail size={12} /> },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setRegisterMethod(method.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  registerMethod === method.id 
                    ? "text-brand-secondary" 
                    : darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-650"
                }`}
              >
                {method.icon}
                {method.label}
                {registerMethod === method.id && (
                  <motion.div 
                    layoutId="method-tab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-secondary to-teal-400 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">

            {/* ── Role Selector ── */}
            <div className="mb-6">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                Account Type
              </p>
              <div className="grid grid-cols-3 gap-2">
                {roleConfigs.map((r, i) => (
                  <motion.button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-3 rounded-xl border transition-all font-black text-[10px] flex flex-col items-center gap-1.5 overflow-hidden ${
                      role === r.id 
                        ? (darkMode ? `border-brand-secondary/50 shadow-lg bg-slate-900/60 ${r.glow}` : `border-brand-secondary/50 shadow-md bg-brand-secondary/5`)
                        : (darkMode ? "border-white/5 hover:border-white/10 bg-white/3" : "border-slate-100 hover:border-slate-200 bg-slate-50/60")
                    }`}
                  >
                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      role === r.id 
                        ? `bg-gradient-to-br ${r.gradient} text-white shadow-md` 
                        : (darkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
                    }`}>
                      {r.icon}
                    </div>
                    <div className="text-center">
                      <div className={`font-black uppercase tracking-wider text-[9px] ${
                        role === r.id 
                          ? (darkMode ? "text-white" : "text-slate-900")
                          : (darkMode ? "text-slate-400" : "text-slate-500")
                      }`}>
                        {r.name}
                      </div>
                      <div className={`text-[7px] font-semibold mt-0.5 whitespace-nowrap ${
                        darkMode ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {r.desc}
                      </div>
                    </div>
                    {role === r.id && (
                      <motion.div 
                        layoutId="role-check"
                        className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gradient-to-br ${r.gradient} flex items-center justify-center`}
                      >
                        <Check size={9} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* ── Left: Account Core ── */}
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 border-b pb-2 ${
                        darkMode ? "border-white/5" : "border-slate-100"
                      }`}>
                        <ShieldCheck size={14} className="text-brand-secondary" />
                        <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}>
                          Account Core
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {/* Email / Username */}
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                            darkMode ? "text-slate-500" : "text-slate-450"
                          }`}>
                            {registerMethod === "email" ? "Email Address" : "Username"}
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                              {registerMethod === "email" ? <Mail size={14} /> : <User size={14} />}
                            </div>
                            <input
                              type={registerMethod === "email" ? "email" : "text"}
                              required
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              className={inputClass}
                              placeholder={registerMethod === "email" ? "doctor@carebridge.com" : "Unique username"}
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                            darkMode ? "text-slate-500" : "text-slate-455"
                          }`}>
                            Password
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                              <Lock size={14} />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className={`${inputClass} pr-10`}
                              placeholder="Choose secure password"
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Name field */}
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                            darkMode ? "text-slate-500" : "text-slate-450"
                          }`}>
                            {role === 'hospital' ? 'Hospital Name' : role === 'clinic' ? 'Clinic Name' : 'Full Name'}
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                              {role === 'hospital' ? <Building2 size={14} /> : role === 'clinic' ? <Stethoscope size={14} /> : <UserCircle size={14} />}
                            </div>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className={inputClass}
                              placeholder={`Name of ${role}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Right: Profile Scope ── */}
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 border-b pb-2 ${
                        darkMode ? "border-white/5" : "border-slate-100"
                      }`}>
                        <MapPin size={14} className="text-brand-secondary" />
                        <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}>
                          Profile Scope
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {/* Role-specific top field */}
                        {role === 'patient' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                                darkMode ? "text-slate-500" : "text-slate-450"
                              }`}>Age</label>
                              <input
                                type="number"
                                required
                                value={formData.details.age}
                                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, age: e.target.value } })}
                                className={inputClassNoIcon}
                                placeholder="Age"
                              />
                            </div>
                            <div>
                              <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                                darkMode ? "text-slate-500" : "text-slate-450"
                              }`}>Contact</label>
                              <input
                                type="tel"
                                required
                                value={formData.details.contact_no}
                                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, contact_no: e.target.value } })}
                                className={inputClassNoIcon}
                                placeholder="Phone"
                                maxLength={10}
                              />
                            </div>
                          </div>
                        ) : role === 'hospital' ? (
                          <div>
                            <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                              darkMode ? "text-slate-500" : "text-slate-450"
                            }`}>Official Email</label>
                            <div className="relative group">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                                <Mail size={14} />
                              </div>
                              <input
                                type="email"
                                value={formData.details.email}
                                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, email: e.target.value } })}
                                className={inputClass}
                                placeholder="hospital@carebridge.com"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                                darkMode ? "text-slate-500" : "text-slate-450"
                              }`}>Doctor Name</label>
                              <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                                  <User size={14} />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={formData.details.doctor_name}
                                  onChange={(e) => setFormData({ ...formData, details: { ...formData.details, doctor_name: e.target.value } })}
                                  className={inputClass}
                                  placeholder="DR. FULL NAME"
                                />
                              </div>
                            </div>
                            <div>
                              <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                                darkMode ? "text-slate-500" : "text-slate-450"
                              }`}>Registration Number</label>
                              <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                                  <Hash size={14} />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={formData.details.reg_no}
                                  onChange={(e) => setFormData({ ...formData, details: { ...formData.details, reg_no: e.target.value } })}
                                  className={inputClass}
                                  placeholder="REG NO. (E.G. MMC-1234)"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* City */}
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                            darkMode ? "text-slate-500" : "text-slate-450"
                          }`}>City / Region</label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-secondary transition-colors">
                              <MapPin size={14} />
                            </div>
                            <input
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className={inputClass}
                              placeholder="City name"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${
                            darkMode ? "text-slate-500" : "text-slate-450"
                          }`}>Complete Address</label>
                          <textarea
                            required
                            value={role === 'patient' ? formData.details.full_address : formData.details.address}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              details: { 
                                ...formData.details, 
                                [role === 'patient' ? 'full_address' : 'address']: e.target.value 
                              } 
                            })}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all input-premium resize-none h-[75px] ${
                              darkMode 
                                ? "bg-slate-900/60 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900/90 focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20" 
                                : "bg-slate-50 border-slate-205 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-brand-secondary/60 focus:ring-2 focus:ring-brand-secondary/20"
                            }`}
                            placeholder="Physical address..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ── Error Alert ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"
                  >
                    <ShieldAlert size={16} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-wide">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Divider ── */}
              <div className={`my-5 border-t ${darkMode ? "border-white/5" : "border-slate-150"}`} />

              {/* ── Terms checkbox ── */}
              <label className="flex items-start gap-3 cursor-pointer group select-none mb-5">
                <div className="relative shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <input
                    type="checkbox"
                    checked={agreed}
                    disabled={!readLegals}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className={`peer h-4 w-4 appearance-none rounded border-2 transition-all ${
                      darkMode ? "border-slate-600" : "border-slate-300"
                    } checked:bg-green-500 checked:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                    title={!readLegals ? "Please read the Terms & Conditions first" : ""}
                  />
                  <Check size={12} className="absolute left-0.5 top-0.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                </div>
                <span className={`text-[10px] font-bold leading-relaxed ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  I have read and verify health security consent to the {" "}
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setActiveLegalModal("privacy"); setReadLegals(true); }}
                    className="text-brand-secondary hover:underline font-black outline-none cursor-pointer uppercase tracking-widest"
                  >
                    Privacy Policy
                  </button>{" "}
                  &{" "}
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setActiveLegalModal("terms"); setReadLegals(true); }}
                    className="text-brand-secondary hover:underline font-black outline-none cursor-pointer uppercase tracking-widest"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and confirm I am an authorized operator.
                </span>
              </label>

              {/* ── Submit + Google ── */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <motion.button
                  type="submit"
                  disabled={loading || !agreed}
                  whileHover={!loading && agreed ? { scale: 1.01 } : {}}
                  whileTap={!loading && agreed ? { scale: 0.99 } : {}}
                  className="flex-grow relative overflow-hidden rounded-xl font-black text-xs text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: "linear-gradient(135deg, #005f73 0%, #0a9396 100%)",
                    padding: "0.85rem 1.25rem",
                    boxShadow: agreed && !loading ? "0 4px 20px rgba(10,147,150,0.3)" : undefined
                  }}
                >
                  <span className="relative z-10 font-black uppercase tracking-wider flex items-center gap-1.5">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Initializing...
                      </>
                    ) : (
                      <>
                        Create Workspace
                        <ArrowRight size={14} />
                      </>
                    )}
                  </span>
                </motion.button>

                <div className="flex sm:flex-col items-center justify-center gap-1 sm:px-1">
                  <div className={`flex-1 h-px sm:h-auto sm:w-px sm:flex-1 ${darkMode ? "bg-white/5" : "bg-slate-200"}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${darkMode ? "text-slate-650" : "text-slate-400"}`}>or</span>
                  <div className={`flex-1 h-px sm:h-auto sm:w-px sm:flex-1 ${darkMode ? "bg-white/5" : "bg-slate-200"}`} />
                </div>

                <motion.button 
                  type="button"
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${
                    darkMode 
                      ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10" 
                      : "border-slate-205 bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-xs"
                  }`}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" />
                  Google
                </motion.button>
              </div>
            </form>

            <p className={`text-center mt-6 text-xs font-semibold ${darkMode ? "text-slate-500" : "text-slate-450"}`}>
              Already registered?{" "}
              <Link to="/login" className="text-brand-secondary hover:underline underline-offset-4 font-black">
                Sign in to portal →
              </Link>
            </p>

          </div>

          {/* ── Trust Bar ── */}
          <div className={`flex items-center justify-center gap-5 px-6 py-3 border-t ${
            darkMode ? "border-white/5 bg-slate-950/40" : "border-slate-100 bg-slate-50/60"
          }`}>
            {[
              { icon: <Shield size={10} />, label: "DISHA" },
              { icon: <Activity size={10} />, label: "256-bit AES" },
              { icon: <Heart size={10} />, label: "ABDM Ready" },
            ].map((trust) => (
              <div key={trust.label} className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider ${
                darkMode ? "text-slate-500" : "text-slate-450"
              }`}>
                <span className="text-brand-secondary">{trust.icon}</span>
                {trust.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── LEGAL MODALS ─── */}
      <AnimatePresence>
        {activeLegalModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" 
              onClick={() => setActiveLegalModal(null)} 
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className={`relative w-full max-w-2xl h-[380px] rounded-2xl shadow-2xl border overflow-hidden flex flex-col ${
                darkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-100 text-slate-900"
              }`}
            >
              <div className={`flex items-center justify-between px-6 py-4 border-b ${
                darkMode ? "border-white/5 bg-slate-950/50" : "border-slate-100 bg-slate-50/80"
              }`}>
                <div className="flex items-center gap-2">
                  {activeLegalModal === "privacy" ? (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-brand-primary/15 flex items-center justify-center">
                        <Shield className="text-brand-secondary" size={14} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wide">Enterprise Privacy Policy</h3>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
                        <Scale className="text-orange-500" size={14} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wide">Terms & Conditions</h3>
                    </>
                  )}
                </div>
                <motion.button 
                  onClick={() => setActiveLegalModal(null)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-lg transition-all ${
                    darkMode ? "bg-white/5 text-gray-400 hover:text-white" : "bg-slate-100 text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <X size={14} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className={`p-6 space-y-4 text-[11px] font-semibold leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-550"
                }`}>
                  {activeLegalModal === "privacy" ? (
                    <>
                      <h4 className={`text-xs font-black ${darkMode ? "text-white" : "text-slate-900"}`}>Healthcare Privacy Policy Protocol</h4>
                      <p>This comprehensive document defines secure procedures under Bangalore legal frameworks. All details are kept in zero-leak configurations.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {[
                          { title: "1. Data Storage & Segregation", body: "Every active patient vitals record is parsed in isolated blocks. No diagnostic or phone identifier data is linked to external ad trackers." },
                          { title: "2. AI Health Coach Parameters", body: "Our server-side Gemini API interfaces operate over a non-persistent, proxy network structure keeping patient identity unexposed." },
                          { title: "3. Active Notification Opt-ins", body: "Automated SMS, emails, and active WhatsApp referral timers utilize credentialed message gateways that support direct consent cancellation." },
                          { title: "4. Sovereign Jurisdiction", body: "In accordance with global standard, files are archived for 7 medical audit years and fully purged subsequently on legal requests." },
                        ].map(item => (
                          <div key={item.title}>
                            <h5 className={`font-black uppercase mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item.title}</h5>
                            <p>{item.body}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className={`text-xs font-black ${darkMode ? "text-white" : "text-slate-900"}`}>Enterprise Terms of Use Regulation</h4>
                      <p>Accepting this agreement is mandatory before operating CareBridge+ healthcare sandbox portals. All sessions are subject to access trace logging.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {[
                          { title: "1. Registered Doctor Responsibility", body: "Clinical workspace operators hold entire personal and official liability for medical records, OPD prescriptions, and diagnostic allocations." },
                          { title: "2. Diagnostic Disclaimer", body: "Vitals chimes, queue schedules, and AI analyses are workflow reference points. Clinicians must confirm diagnoses independently." },
                          { title: "3. Indian Jurisdiction Laws", body: "CareBridge+ terms and agreements are subject to the exclusive jurisdiction of courts of Bangalore, Karnataka State, Republic of India." },
                          { title: "4. Account Termination Terms", body: "We hold absolute privileges to freeze profiles showing consecutive failed authorization trials, illegal referral entries, or data scraping behaviour." },
                        ].map(item => (
                          <div key={item.title}>
                            <h5 className={`font-black uppercase mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item.title}</h5>
                            <p>{item.body}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
