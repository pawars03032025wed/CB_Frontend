import React, { useState } from "react";
import { 
  ShieldAlert, User, Lock, ArrowRight, Hospital, MapPin, Phone, 
  FileText, GraduationCap, Stethoscope, Mail, CheckCircle, 
  Smartphone, Users, Hash, Eye, EyeOff, X, Building2, UserCircle,
  ShieldCheck, Check, Scale, Shield
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { firebaseService } from "../../services/firebaseService";
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
        if (registerMethod === "email") {
          setSuccessEmailMessage(data?.message || "Registration successful! A verification email has been sent. Please verify before login.");
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
      <div className={`min-h-screen flex items-center justify-center p-4 bg-grid transition-colors duration-500 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass dark:bg-gray-800/80 p-12 rounded-[50px] shadow-2xl w-full max-w-lg text-center border-white/20"
        >
          <div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full inline-flex items-center justify-center w-24 h-24 mb-8 shadow-inner">
            <CheckCircle size={48} />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {registerMethod === "email" ? "Verification Email Sent!" : "Registration Successful!"}
          </h2>

          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/20">
              ● Pending Verification
            </span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed">
            {registerMethod === "email" 
              ? successEmailMessage 
              : "Your account has been created and is waiting for administrator approval. You will be redirected shortly."}
          </p>

          {registerMethod === "email" && (
            <div className="mb-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs font-bold text-gray-500 dark:text-gray-400">
              Please click the link in your email to verify. Didn't receive it?
              <button
                onClick={async () => {
                  const res = await firebaseService.resendVerificationEmail();
                  alert(res.message);
                }}
                className="ml-2 text-brand-primary hover:underline font-black"
              >
                Resend Verification Link
              </button>
            </div>
          )}

          <Link to="/login" className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all inline-block shadow-lg">
            Take me to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const roleConfigs = [
    { id: "patient", name: "Patient", icon: <UserCircle size={18} />, color: "text-blue-500 bg-blue-500/10" },
    { id: "clinic", name: "Clinic", icon: <Stethoscope size={18} />, color: "text-teal-500 bg-teal-500/10" },
    { id: "hospital", name: "Hospital", icon: <Building2 size={18} />, color: "text-orange-500 bg-orange-500/10" },
  ];

  return (
    <div className={`min-h-screen bg-grid transition-colors duration-500 ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <Link to="/login" className="px-6 py-2.5 glass dark:hover:bg-white/10 rounded-full font-black text-xs uppercase tracking-widest transition-all">Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass dark:bg-gray-900/60 p-10 rounded-[50px] shadow-2xl w-full max-w-4xl border-white/20 dark:border-white/5"
        >
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Join Our Network
            </div>
            <h1 className="text-4xl font-black">Register Workspace</h1>
            <p className="text-gray-500 font-bold mt-2 tracking-wide uppercase text-[10px]">Create your secure professional account</p>
          </div>

          {/* Secure Registration Method choice */}
          <div className="flex bg-gray-100/60 dark:bg-white/5 p-1.5 rounded-3xl mb-8 max-w-2xl mx-auto border border-slate-200/40 dark:border-white/5">
            <button
              type="button"
              onClick={() => setRegisterMethod("username")}
              className={`flex-grow text-center py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                registerMethod === "username"
                  ? "bg-white dark:bg-gray-800 text-brand-primary shadow-md"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              Legacy Username Access
            </button>
            <button
              type="button"
              onClick={() => setRegisterMethod("email")}
              className={`flex-grow text-center py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                registerMethod === "email"
                  ? "bg-white dark:bg-gray-800 text-brand-primary shadow-md"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              Enterprise Secure Email
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Role Switcher */}
            <div className="flex flex-wrap gap-4 justify-center bg-gray-100/50 dark:bg-white/5 p-2 rounded-[32px] max-w-2xl mx-auto animate-fade-in">
              {(roleConfigs as any[]).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-grow flex items-center justify-center gap-3 py-4 px-6 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${
                    role === r.id 
                       ? "bg-white dark:bg-gray-800 text-brand-primary shadow-xl" 
                       : "text-gray-400 grayscale hover:grayscale-0 hover:text-gray-600"
                  }`}
                >
                  {r.icon} {r.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={role}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                       <ShieldCheck size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Account Core</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                        {registerMethod === "email" ? "Secure Email Address" : "Username"}
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary" />
                        <input
                          type={registerMethod === "email" ? "email" : "text"}
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                            darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                          }`}
                          placeholder={registerMethod === "email" ? "doctor@carebridge.com" : "Choose unique username"}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full pl-12 pr-12 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                            darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                          }`}
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">{role === 'hospital' ? 'Hospital' : role === 'clinic' ? 'Clinic' : 'Full Name'}</label>
                      <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                            darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                          }`}
                          placeholder={`Enter name of ${role}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                       <MapPin size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Profile Scope</h3>
                  </div>

                  <div className="space-y-6">
                    {role === 'patient' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Age</label>
                          <input
                            type="number"
                            required
                            value={formData.details.age}
                            onChange={(e) => setFormData({ ...formData, details: { ...formData.details, age: e.target.value } })}
                            className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                              darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                            }`}
                            placeholder="Age"
                          />
                        </div>
                        <div className="group">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Contact</label>
                          <input
                            type="tel"
                            required
                            value={formData.details.contact_no}
                            onChange={(e) => setFormData({ ...formData, details: { ...formData.details, contact_no: e.target.value } })}
                            className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                              darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                            }`}
                            placeholder="Phone Num"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    ) : role === 'hospital' ? (
                      <div className="group">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Email</label>
                        <input
                          type="email"
                          value={formData.details.email}
                          onChange={(e) => setFormData({ ...formData, details: { ...formData.details, email: e.target.value } })}
                          className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                            darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                          }`}
                          placeholder="hospital@carebridge.com"
                        />
                      </div>
                    ) : (
                      <div className="group">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Doctor Name</label>
                        <input
                          type="text"
                          required
                          value={formData.details.doctor_name}
                          onChange={(e) => setFormData({ ...formData, details: { ...formData.details, doctor_name: e.target.value } })}
                          className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                            darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                          }`}
                          placeholder="Dr. Full Name"
                        />
                      </div>
                    )}

                    <div className="group">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">City / Region</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 ${
                          darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                        }`}
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Complete Address</label>
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
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent outline-hidden transition-all focus:ring-4 focus:ring-brand-primary/5 min-h-[100px] resize-none ${
                          darkMode ? "bg-white/5 focus:bg-gray-800 focus:border-white/10" : "bg-gray-50 focus:bg-white focus:border-brand-primary/20"
                        }`}
                        placeholder="Full physical address..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-200 flex items-center gap-3">
                <ShieldAlert size={18} /> {error}
              </div>
            )}

            <div className="space-y-6 pt-10 border-t border-white/10">
               <label className="flex items-start gap-4 cursor-pointer group select-none">
                  <div className="relative flex items-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 dark:border-white/20 transition-all checked:bg-brand-primary checked:border-brand-primary"
                    />
                    <Check size={16} className="absolute left-1 top-1 text-white scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed animate-fade-in">
                    I agree to the CareBridge+{" "}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveLegalModal("privacy"); }}
                      className="text-brand-primary hover:underline font-black outline-none cursor-pointer"
                    >
                      Privacy Policy
                    </button>{" "}
                    &{" "}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setActiveLegalModal("terms"); }}
                      className="text-brand-primary hover:underline font-black outline-none cursor-pointer"
                    >
                      Terms & Conditions
                    </button>{" "}
                    and confirm that I am an authorized healthcare workspace operator.
                  </span>
               </label>

               <div className="flex flex-col sm:flex-row items-center gap-6">
                 <button
                    type="submit"
                    disabled={loading || !agreed}
                    className="flex-1 w-full bg-linear-to-r from-brand-primary to-brand-secondary text-white font-black py-5 rounded-[24px] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? "Initializing..." : "Create Professional Workspace"}
                    <ArrowRight size={20} />
                 </button>
                 
                 <div className="flex items-center gap-4 text-center">
                   <p className="text-xs font-bold text-gray-400">OR JOIN WITH</p>
                   <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className={`p-4 rounded-2xl border transition-all ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:bg-gray-100"}`}
                   >
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" />
                   </button>
                 </div>
               </div>
            </div>
          </form>

          <p className="text-center mt-12 text-sm font-bold text-gray-500">
            Already registered? <Link to="/login" className="text-brand-primary hover:underline underline-offset-4 font-black">Login to portal</Link>
          </p>
        </motion.div>
      </div>

      {/* COMPLIANCE OVERLAY PREVIEWS */}
      <AnimatePresence>
        {activeLegalModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm shadow-inner" onClick={() => setActiveLegalModal(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className={`relative w-full max-w-4xl h-[400px] rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${
                darkMode ? "bg-gray-950 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-3">
                  {activeLegalModal === "privacy" ? (
                    <>
                      <Shield className="text-brand-primary" size={20} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Enterprise Privacy Policy manual</h3>
                    </>
                  ) : (
                    <>
                      <Scale className="text-orange-500" size={20} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Enterprise Terms & Conditions ledger</h3>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setActiveLegalModal(null)}
                  className="p-1.5 rounded-xl bg-gray-150 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-750 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className={`p-8 sm:p-12 space-y-6 text-xs font-bold leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {activeLegalModal === "privacy" ? (
                    <>
                      <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Healthcare Privacy Policy Protocol</h4>
                      <p>This comprehensive document defines secure procedures under Bangalore legal frameworks. All details are kept in zero-leak configurations.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-250" : "text-gray-700"}`}>1. Data Storage & Segregation</h5>
                          <p>Every active patient vitals record is parsed in isolated blocks. No diagnostic or phone identifier data is linked to external ad trackers.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-250" : "text-gray-700"}`}>2. AI health coach parameters</h5>
                          <p>Our server-side Gemini API interfaces operate over a non-persistent, proxy network structure keeping patient identity unexposed.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-250" : "text-gray-700"}`}>3. Active Notification opt-ins</h5>
                          <p>Automated SMS, emails, and active WhatsApp referral timers utilize credentialed message gateways that support direct consent cancellation.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-250" : "text-gray-700"}`}>4. Sovereign Jurisdiction</h5>
                          <p>In accordance with global standard, files are archived for 7 medical audit years and fully purged subsequently on legal requests.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Enterprise Terms of Use Regulation</h4>
                      <p>Accepting this agreement is mandatory before operating CareBridge+ healthcare sandbox portals. All sessions are subject to access trace logging.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-255" : "text-gray-700"}`}>1. Registered doctor responsibility</h5>
                          <p>Clinical workspace operators hold entire personal and official liability for medical records, OPD prescriptions, and diagnostic allocations.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-255" : "text-gray-700"}`}>2. Diagnostic disclaimer</h5>
                          <p>Vitals chimes, queue schedules, and AI analyses are workflow reference points. Clinicians must confirm diagnoses independently.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-255" : "text-gray-700"}`}>3. Indian Jurisdiction Laws</h5>
                          <p>CareBridge+ terms and agreements are subject to the exclusive jurisdiction ofcourts of Bangalore, Karnataka State, Republic of India.</p>
                        </div>
                        <div>
                          <h5 className={`font-black uppercase mb-2 ${darkMode ? "text-gray-255" : "text-gray-700"}`}>4. Account termination terms</h5>
                          <p>We hold absolute privileges to freeze profiles showing consecutive failed authorization trials, illegal referral entries, or data scraping behaviour.</p>
                        </div>
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
