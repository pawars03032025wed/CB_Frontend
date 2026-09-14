import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  ArrowRight, 
  Lock, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles, 
  Phone, 
  MapPin, 
  Mail, 
  Heart, 
  Smartphone, 
  CheckCircle2, 
  Bell, 
  FileText, 
  Send,
  Zap,
  Moon,
  Sun,
  Shield,
  MessageSquare,
  Award,
  Database,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function LandingPage({ user, darkMode, setDarkMode }: LandingPageProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<"clinic" | "hospital" | "patient">("clinic");

  const clinicFeatures = [
    { id: "opd", title: "Smart OPD Queue", desc: "Automated queue tracking to streamline outpatient patient walk-ins dynamically.", icon: <Clock className="text-teal-500" /> },
    { id: "ai_rx", title: "AI Prescription System", desc: "Intelligent prescription generation with live drug interaction safeguards.", icon: <Sparkles className="text-purple-500" /> },
    { id: "billing", title: "Billing & Finance", desc: "Integrated instant invoicing, automated PDF billing, and transaction tracking.", icon: <IndianRupee className="text-emerald-500" /> },
    { id: "crm", title: "Patient CRM & WhatsApp", desc: "Keep patients engaged with custom follow-ups, updates, and personalized outreaches.", icon: <Users className="text-blue-500" /> },
    { id: "whatsapp", title: "WhatsApp Marketing", desc: "Send tailored digital greetings, festive messages and wellness guidelines.", icon: <Smartphone className="text-green-500" /> },
    { id: "referral", title: "Referral Network", desc: "Seamless patient transfer flow connecting clinic doctors with specialist hospitals.", icon: <Activity className="text-indigo-500" /> },
    { id: "analytics", title: "Analytics Dashboard", desc: "Get real-time insights on your clinic's OPD volumes, earnings, and referrals.", icon: <TrendingUp className="text-amber-500" /> },
    { id: "assistant", title: "AI Assistant", desc: "A clinical copilot answering dosage queries and summarizing health logs.", icon: <Zap className="text-orange-500" /> },
    { id: "medicine", title: "Medicine Tracking", desc: "Simple, real-time inventory management for patient wellness plans.", icon: <Stethoscope className="text-pink-500" /> },
  ];

  const hospitalFeatures = [
    { id: "ipd", title: "IPD Management", desc: "Comprehensive ward tracking, bed assignment flow, and in-patient records.", icon: <Database className="text-blue-500" /> },
    { id: "ref_handling", title: "OPD Referral Handling", desc: "Receive incoming digital cases with real-time feedback loop to referring clinics.", icon: <Activity className="text-teal-500" /> },
    { id: "dept_routing", title: "Department Routing", desc: "Coordinate smoothly between Pediatrics, Cardiology, Emergency, and and General medicine.", icon: <Users className="text-indigo-500" /> },
    { id: "emergency", title: "Emergency Alerts", desc: "Instant critical notification triggers for trauma and operating rooms.", icon: <Bell className="text-red-500" /> },
    { id: "admission", title: "Admission Workflow", desc: "Efficient, glass-smooth checklist for patient intake, consent, and bed assignment.", icon: <CheckCircle2 className="text-emerald-500" /> },
    { id: "nursing", title: "Nursing Coordination", desc: "Empower staff with live shift handovers, fluid vitals tracking, and charting.", icon: <FileText className="text-purple-500" /> },
    { id: "fin_analytics", title: "Financial Analytics", desc: "Deep analytics tracking insurance claim status, IPD revenues and package margins.", icon: <TrendingUp className="text-pink-500" /> },
    { id: "ref_notifs", title: "Referral Notifications", desc: "Receive real-time popups with immediate detailed access profiles.", icon: <Smartphone className="text-amber-500" /> },
  ];

  const patientFeatures = [
    { id: "coach", title: "AI Health Coach", desc: "Generative guidance powered by secure clinical endpoints to support daily health.", icon: <Sparkles className="text-purple-500" /> },
    { id: "reminders", title: "Medicine Reminder", desc: "Automated schedule prompts that send timely alerts for prescription doses.", icon: <Bell className="text-orange-500" /> },
    { id: "voice", title: "Voice Reminder System", desc: "Natural medical announcements supporting clear accessibility guidance.", icon: <MessageSquare className="text-blue-500" /> },
    { id: "health_analytics", title: "Health Analytics", desc: "Visual metrics monitoring weight trend, fever curves, and vitals updates.", icon: <TrendingUp className="text-red-500" /> },
    { id: "habits", title: "Habit Tracking", desc: "Encourage consistent clinical milestones like water, light exercise, or sleep.", icon: <Heart className="text-pink-500" /> },
    { id: "logs", title: "Daily Health Logs", desc: "Simple check-ins documenting active symptoms and temperature indexes.", icon: <FileText className="text-teal-500" /> },
  ];

  const currentFeatures = 
    activeFeatureTab === "clinic" ? clinicFeatures : 
    activeFeatureTab === "hospital" ? hospitalFeatures : 
    patientFeatures;

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const ctaRoute = user ? `/${user.role || "login"}` : "/login";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* STICKY NAVBAR */}
      <header className={`sticky top-0 z-[100] backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <img src="/carebridge-logo.png" alt="CareBridge Logo" className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-brand-primary to-teal-500 bg-clip-text text-transparent">
                  CareBridgePlus
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                  HEALTH SAAS ECOSYSTEM
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => handleNavClick("home")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Home</button>
              <button onClick={() => handleNavClick("features")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Features</button>
              <button onClick={() => handleNavClick("crm")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Solutions</button>
              <button onClick={() => { setActiveFeatureTab("clinic"); handleNavClick("features"); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Clinic Panel</button>
              <button onClick={() => { setActiveFeatureTab("hospital"); handleNavClick("features"); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Hospital Panel</button>
              <button onClick={() => handleNavClick("security")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">Security</button>
              <button onClick={() => handleNavClick("about")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">About</button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Dark mode switcher */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-850" : "bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200"
                }`}
                title="Toggle visual style"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Continue to Action Button */}
              <Link 
                to={ctaRoute}
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {user ? "Continue to Dashboard" : "Continue"}
                <ArrowRight size={14} className="stroke-[2.5]" />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden border-t overflow-hidden transition-colors ${
                darkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200"
              }`}
            >
              <div className="px-4 py-6 space-y-3">
                <button onClick={() => handleNavClick("home")} className="block w-full text-left py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">Home</button>
                <button onClick={() => handleNavClick("features")} className="block w-full text-left py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">Features</button>
                <button onClick={() => handleNavClick("crm")} className="block w-full text-left py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">CRM Solutions</button>
                <button onClick={() => handleNavClick("security")} className="block w-full text-left py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">Security</button>
                <button onClick={() => handleNavClick("about")} className="block w-full text-left py-2 px-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl">About</button>
                <Link 
                  to={ctaRoute}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/10"
                >
                  {user ? "Continue to Dashboard" : "Continue to Login"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative py-20 lg:py-28 overflow-hidden">
        {/* Soft elegant background grids/blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* HER0 LEFT */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Sparkles size={12} className="stroke-[2.5]" />
                India's Next Gen Healthcare Connectivity Ecosystem
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-tight mb-6">
                Redefining Patient Referrals & <span className="bg-gradient-to-r from-brand-primary to-teal-500 bg-clip-text text-transparent">Digital Operations</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10 max-w-2xl">
                Modern enterprise-grade healthcare workflow platform for clinics, hospitals, digital referrals, patient engagement, invoice tracking, real-time metrics, and clinical outreach.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link 
                  to={ctaRoute}
                  className="px-8 py-4 bg-brand-primary hover:bg-opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/15 cursor-pointer"
                >
                  Continue to Login
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </Link>
                <button
                  onClick={() => handleNavClick("features")}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800 border border-slate-200 text-slate-500 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Explore Features
                </button>
              </div>

              {/* Ecosystem Stats Footer */}
              <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-slate-200 dark:border-slate-900 w-full">
                <div>
                  <div className="text-2xl font-black text-brand-primary">1Click</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inter-SaaS Referral</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-500">100%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Data Portability</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-indigo-500">Realtime</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sync Alerts</div>
                </div>
              </div>
            </div>

            {/* HERO RIGHT (Interactive Presentation Canvas Mockup) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-[380px] sm:max-w-md">
                
                {/* Main Hub Dashboard Frame */}
                <div className={`p-6 rounded-[36px] border shadow-2xl relative transition-all duration-300 ${
                  darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-250"
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ecosystem Overview</span>
                  </div>

                  <div className="space-y-4">
                    {/* Live referral alert */}
                    <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
                        <Activity size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">Referral Dispatched</p>
                        <p className="text-xs font-bold truncate">Metro Super Specialty Hospital</p>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-sm">Just Now</span>
                    </div>

                    {/* Operational metrics widget */}
                    <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">OPD Load Capacity</span>
                        <span className="text-xs font-black text-emerald-500">84% Live</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "84%" }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>32 Active Tickets</span>
                        <span>4 Specialists Free</span>
                      </div>
                    </div>

                    {/* Quick billing widget */}
                    <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-extrabold text-sm">
                          ₹
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-brand-primary">Billing System</p>
                          <p className="text-xs font-black">₹48,250 Pending Cash</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black tracking-wider bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full uppercase">Collected</span>
                    </div>

                    {/* Targeted WhatsApp outreach visual */}
                    <div className="p-3.5 rounded-2xl bg-green-500/5 border border-green-500/10 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0">
                        <Smartphone size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Digital Outreach Active</p>
                        <p className="text-xs font-bold">"Diabetes Wellness Camp Update sent to 142 local patients."</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating absolute badges */}
                <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-gradient-to-br from-brand-primary to-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: "5s" }}>
                  <Award size={20} className="text-amber-300" />
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-brand-primary-light uppercase tracking-wider">Enterprise Grade</p>
                    <p className="text-xs font-black">ABDM Ready</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl border border-white/10 dark:border-slate-200 flex items-center gap-3">
                  <UserCheck className="text-teal-400 dark:text-teal-600" size={18} />
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Secure Access</p>
                    <p className="text-xs font-black">2-Factor Authentication Ready</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 lg:py-28 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary block mb-3">All-In-One Healthcare Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Powerful Custom Panels for Your Entire Organization
            </h2>
            <p className="text-slate-500 font-bold mt-4 leading-relaxed">
              Explore tailored workflows developed exclusively to bridge the communication gaps between clinics, corporate multispecialty hospitals, and patients.
            </p>
          </div>

          {/* Feature Tab Select buttons */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-200/50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-1.5 rounded-[24px] inline-flex gap-2">
              <button
                onClick={() => setActiveFeatureTab("clinic")}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeFeatureTab === "clinic" ? "bg-brand-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Clinic Features
              </button>
              <button
                onClick={() => setActiveFeatureTab("hospital")}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeFeatureTab === "hospital" ? "bg-brand-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Hospital Features
              </button>
              <button
                onClick={() => setActiveFeatureTab("patient")}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeFeatureTab === "patient" ? "bg-brand-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Patient App Features
              </button>
            </div>
          </div>

          {/* Dynamic grid rendering */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {currentFeatures.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-7 rounded-[28px] border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    darkMode 
                      ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900" 
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                    darkMode ? "bg-slate-950" : "bg-slate-100"
                  }`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-black mb-3">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* HEALTHCARE CRM Showcase */}
      <section id="crm" className="py-20 lg:py-28 border-t border-slate-200 dark:border-slate-900 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Visual Dashboard Mock */}
            <div className="lg:col-span-6 relative order-last lg:order-first">
              <div className={`p-6 rounded-[36px] border shadow-2xl ${
                darkMode ? "bg-slate-900 bg-linear-to-b from-slate-900 to-slate-950 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <div className="flex items-center justify-between mb-8 border-b border-slate-200/50 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">Outreach Campaign Manager</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Integrated SaaS API</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-green-500/10 text-green-500 rounded-full uppercase tracking-wider">CONNECTED</span>
                </div>

                <div className="space-y-4">
                  {/* Outreach types breakdown */}
                  {[
                    { title: "Targeted Birthday Wishes", text: "Auto-send wellness coupon with clinic branding details on correct morning.", tag: "AUTOMATED", bg: "from-blue-500 to-indigo-600" },
                    { title: "Geographical Health Campaigns", text: "Target patients in localized city blocks for customized immunizations or clinic wellness days.", tag: "GEO-FILTER", bg: "from-emerald-500 to-teal-600" },
                    { title: "Chronic Disease Protocols", text: "Track patients requesting Diabetes, Thyroid & Cardio indicators with relevant updates.", tag: "DIETARY", bg: "from-pink-500 to-rose-600" },
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-2xl flex gap-4 transition-colors items-start ${
                      darkMode ? "bg-slate-950 hover:bg-slate-900" : "bg-slate-50 hover:bg-slate-100"
                    }`}>
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white bg-gradient-to-br ${item.bg} text-[10px] font-black`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-black">{item.title}</span>
                          <span className="text-[8px] font-black tracking-widest text-[#5676FF] uppercase bg-brand-primary/5 px-2 py-0.5 rounded-sm shrink-0">{item.tag}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">{item.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Digital profile preview code block mockup */}
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MessageSquare size={12} className="text-green-500" /> WhatsApp Template Preview
                    </p>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "Namaste [Patient Name], this is Dr. [Doctor Name] from [Clinic Name]. Wishing you a healthy morning. Reminder: your routine OPD appointment is booked on Wednesday at 10:00 AM."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Text */}
            <div className="lg:col-span-6 text-left flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 block mb-3">Enterprise Patient CRM</span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
                Extend Care Beyond Clinic Walls with Dynamic Outreaches
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8">
                Build patient stickiness, automate administrative workflows, and share beautifully designed digital clinic profile templates globally. Direct targeted communications toward customized disease categories.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400">Targeted Targeting</h4>
                    <p className="text-xs font-bold text-slate-500">Target by geographical cities, diagnosis category or age range.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400">WhatsApp Engine</h4>
                    <p className="text-xs font-bold text-slate-500">Automated messaging directly linking patients to digital OPD bookings.</p>
                  </div>
                </div>
              </div>

              <div>
                <Link to={ctaRoute} className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-slate-250 text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                  Launch Live Campaign
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section id="security" className="py-20 lg:py-28 border-t border-slate-200 dark:border-slate-900 bg-linear-to-b from-slate-100/50 via-transparent to-transparent dark:from-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Context Left */}
            <div className="lg:col-span-7 text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 block mb-3">Enterprise Data Security</span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
                Protecting Medical Workspaces with Strict Compliance Verification
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8">
                Keep sensitive clinical logs and private indicators secure with server-validated, encrypted endpoints conforming strictly to Digital Information Security in Healthcare (DISHA) and Ayushman Bharat (ABDM) guidelines.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Encrypted Workflows", text: "Patient information is encrypted at rest and in transit via leading AES-256 server configurations.", icon: <Lock size={16} className="text-indigo-500" /> },
                  { title: "Verified Authentication", text: "Protect workspaces via enterprise-grade Google Sign-In popups or verified security email verification tokens.", icon: <ShieldCheck size={16} className="text-emerald-500" /> },
                  { title: "Role-Based Security", text: "Doctors, hospital workers, and patients operate on isolated firestore data streams to prevent leakage.", icon: <Users size={16} className="text-blue-500" /> },
                  { title: "Firebase Active Safeguards", text: "Secure Firestore Rules actively enforce real-time checks on document parameters before permission validation.", icon: <Shield size={16} className="text-amber-500" /> },
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200/50 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{s.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Right */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative p-8 rounded-[40px] shadow-2xl overflow-hidden max-w-[360px] w-full border text-center bg-slate-900 border-white/5 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-brand-primary flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ShieldCheck size={36} className="text-indigo-400" />
                </div>

                <h3 className="text-lg font-black mb-2">ABDM & DISHA Ready</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 font-mono">ENCRYPTED WORKSPACES</p>
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Security Ingestion</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Session Timeout</span>
                    <span className="text-amber-400">15m Auto-close</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="text-blue-450 text-indigo-400">Firebase Protected</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={ctaRoute} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white block rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                    Test Platform Security
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT THE MISSION */}
      <section id="about" className="py-20 lg:py-28 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary block mb-3">Our Dedicated Journey</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">
              Empowering Seamless Healthcare Coordination
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10 text-base sm:text-lg">
              CareBridgePlus was founded to address critical breakdowns in patient care transfers. By building reliable pipelines for referral synchronization, billing automation, clinic profile visibility, and digital WhatsApp communication, we aim to accelerate the digital transformation of local healthcare networks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              {[
                { title: "Empower Clinics", text: "Offer high-end digitizations for smart OPD scheduling, AI prescriptions, and automated financial cash flows." },
                { title: "Connect Hospitals", text: "Facilitate immediate referral intakes, emergency alerts, vitals reporting and coordinate patient transfers." },
                { title: "Engage Patients", text: "Support active health outcomes through routine habit checklists, reminders, and generative AI coaches." },
              ].map((m, idx) => (
                <div key={idx} className={`p-6 rounded-[24px] border ${
                  darkMode ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200 shadow-xs"
                }`}>
                  <h4 className="text-sm font-black mb-2 text-brand-primary">{m.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & TERMS LEGAL OVERVIEWS */}
      <section className="py-16 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-lg font-black tracking-tight mb-2">Legal Agreements & Protocols</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Read our transparent workspace usage policies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Privacy Card */}
            <div className={`p-6 sm:p-8 rounded-[28px] border text-left flex flex-col justify-between ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">PROTECTED DATA SUMMARY</span>
                <h4 className="text-base font-black mb-3">Healthcare Data Privacy Summary</h4>
                <ul className="text-xs font-bold text-slate-500 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex gap-2">● Patients control personal habit profiles and clinical reminder times.</li>
                  <li className="flex gap-2">● Healthcare clinicians access referral profiles based strictly on direct workflow consents.</li>
                  <li className="flex gap-2">● Encryption protocols prevent any unauthorized data scraping.</li>
                </ul>
              </div>
              <Link to="/privacy" className="inline-flex items-center gap-1.5 text-xs font-black text-brand-primary hover:underline uppercase tracking-wider">
                Read Full Privacy Policy <ChevronRight size={14} />
              </Link>
            </div>

            {/* Terms Card */}
            <div className={`p-6 sm:p-8 rounded-[28px] border text-left flex flex-col justify-between ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">PLATFORM RULES SUMMARY</span>
                <h4 className="text-base font-black mb-3">Platform Usage Policy</h4>
                <ul className="text-xs font-bold text-slate-500 dark:text-slate-400 space-y-2 mb-6">
                  <li className="flex gap-2">● Users must verify clinical licensing status before clinic approvals.</li>
                  <li className="flex gap-2">● CareBridgePlus AI Coach recommendations are educational and exclude core legal advice.</li>
                  <li className="flex gap-2">● Inactivity timeouts trigger after 15 minutes of session silence.</li>
                </ul>
              </div>
              <Link to="/terms" className="inline-flex items-center gap-1.5 text-xs font-black text-brand-primary hover:underline uppercase tracking-wider">
                Read Terms & Conditions <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-12 border-t text-center transition-colors ${
        darkMode ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-primary flex items-center justify-center text-white text-xs font-extrabold">
                +
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                CareBridgePlus Healthcare Ecosystem
              </span>
            </div>
            
            <div className="flex gap-5 text-xs font-bold">
              <button onClick={() => handleNavClick("home")} className="hover:text-brand-primary">Home</button>
              <button onClick={() => handleNavClick("features")} className="hover:text-brand-primary">Features</button>
              <button onClick={() => handleNavClick("security")} className="hover:text-brand-primary">Security</button>
              <Link to="/privacy" className="hover:text-brand-primary">Privacy</Link>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-slate-400 mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
            © {new Date().getFullYear()} CareBridgePlus SaaS. All rights reserved. Registered under strict Indian clinical data stewardship frameworks.
          </div>
        </div>
      </footer>

    </div>
  );
}
