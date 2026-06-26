import React from "react";
import { motion } from "framer-motion";
import {
  Hospital as HospitalIcon,
  Phone,
  MapPin,
  ShieldCheck,
  Layers,
  Activity,
  Stethoscope,
  Inbox,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  BadgeAlert,
  Shield,
  Coins
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface HospitalWelcomeLandingProps {
  hospDetails: any;
  user: any;
  darkMode: boolean;
  setShowWelcomeScreen: (show: boolean) => void;
  referrals: any[];
  clinics: any[];
}

export const HospitalWelcomeLanding: React.FC<HospitalWelcomeLandingProps> = ({
  hospDetails,
  user,
  darkMode,
  setShowWelcomeScreen,
  referrals = [],
  clinics = []
}) => {
  // Enterprise clinical metrics simulation for visualization
  const previewChartData = [
    { day: "Mon", admissions: 42, emergencies: 8, revenue: 145000 },
    { day: "Tue", admissions: 58, emergencies: 14, revenue: 198000 },
    { day: "Wed", admissions: 51, emergencies: 11, revenue: 182000 },
    { day: "Thu", admissions: 67, emergencies: 19, revenue: 235000 },
    { day: "Fri", admissions: 78, emergencies: 25, revenue: 289000 },
    { day: "Sat", admissions: 69, emergencies: 18, revenue: 210000 },
  ];

  const categories = [
    { name: "General Medicine", code: "GEN-MED", active: true },
    { name: "Emergency Triage", code: "EMR-TRG", active: true },
    { name: "Cardiology Unit", code: "CRD-UNT", active: true },
    { name: "Pediatrics Desk", code: "PED-DSK", active: true },
  ];

  const handleProceed = () => {
    setShowWelcomeScreen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen transition-colors duration-550 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"} flex flex-col relative overflow-x-hidden font-sans`}>
      {/* Premium Apple-Style Decorative Lighting Overlays */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />

      {/* STICKY TOP SECURITY HEADER */}
      <header className={`sticky top-0 z-[120] backdrop-blur-md border-b flex justify-between items-center px-6 py-4 sm:px-10 ${
        darkMode ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md animate-pulse">
            <HospitalIcon size={20} className="stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent block">
              CareBridgePlus
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 block -mt-0.5">
              HOSPITAL ENTERPRISE CLIENT
            </span>
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          Continue to Dashboard
          <ArrowRight size={14} className="stroke-[2.5]" />
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 sm:px-10 flex flex-col justify-start">
        
        {/* TOP COMMAND HERO */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-500 to-blue-600 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3.5 border border-teal-500/20">
            <Sparkles size={11} className="text-teal-500 animate-pulse" />
            COMPREHENSIVE ENTERPRISE HUB
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none mb-3">
            Connected Hospital Operations
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Welcome to the CareBridgePlus hospital ecosystem command center. Your clinical departments, emergency admissions workflows, real-time doctor slots, and inbound outpatient clinic referrals are synchronized with companion nodes.
          </p>
        </div>

        {/* BROAD WELCOME TO CAREBRIDGEPLUS FAMILY BANNER */}
        <div className={`mb-10 p-6 sm:p-8 rounded-[32px] border relative overflow-hidden transition-all shadow-md ${
          darkMode 
            ? "bg-gradient-to-r from-teal-950/40 via-slate-900/30 to-blue-950/40 border-slate-800/80" 
            : "bg-gradient-to-r from-teal-5/60 via-slate-50/60 to-blue-50/60 border-slate-205"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full">
              <Sparkles size={11} className="text-teal-500 animate-pulse" style={{ animationDuration: "3s" }} />
              Proud Member of the CareBridgePlus Family
            </div>
            
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase">
                Welcome to the CareBridgePlus Family!
              </h2>
              <p className="text-base font-bold text-slate-600 dark:text-slate-300">
                Respective Doctor: <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent font-black px-1">
                  Dr. {hospDetails?.doctor_name || hospDetails?.contact_person || hospDetails?.medical_director || user.name || "Senior Specialist Doctor"}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-dashed border-slate-200 dark:border-slate-800 text-left">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Hospital Enterprise Name</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                  {hospDetails?.name || user.name || "Apex SuperSpecialty Hospital"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Medical Qualification</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                  {hospDetails?.qualification || hospDetails?.category || "M.D. / M.S. Specialist Director"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Verified Campus Address</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 block truncate" title={hospDetails?.address || user.location || "National Healthcare Campus"}>
                  {hospDetails?.address || user.location || "National Healthcare Campus"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ONBOARDING PANEL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: HOSPITAL BRANDING & ENTERPRISE METADATA */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Main Branding Card */}
            <div className={`p-6 rounded-[32px] border text-left relative overflow-hidden ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-5 shrink-0 shadow-inner overflow-hidden">
                <HospitalIcon size={24} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Corporate Client Registry</p>
              <h3 className="text-xl font-black mb-1 leading-tight text-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent truncate">
                {hospDetails?.name || user.name || "Apex SuperSpecialty"}
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-5">
                {hospDetails?.category || "Multi-Specialty Healthcare Wing"}
              </p>

              {/* Verified Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Partner Facility</span>
              </div>

              {/* Dynamic Metadata Details */}
              <div className="border-t border-slate-100 dark:border-slate-800/85 pt-5 space-y-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-teal-500 shrink-0" />
                  <span className="truncate text-slate-500 dark:text-slate-350">{hospDetails?.phone || hospDetails?.contact_no || "Hotline Connected"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-teal-500 shrink-0" />
                  <span className="truncate text-slate-500 dark:text-slate-350">{hospDetails?.address || hospDetails?.city || "National Health Network"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-emerald-500 font-extrabold uppercase tracking-wider text-[10px]">ABDM & DISHA COMPLIANT ENDPOINT</span>
                </div>
              </div>

              {/* Operational Advisory Desk */}
              <div className="mt-6 bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10">
                <p className="text-[10px] font-black text-teal-500 uppercase tracking-wider mb-1">🚨 Direct Transfer Siren Node</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                  Inbound transfer notifications trigger secure ring alarms on the medical console desk immediately upon clinic dispatch.
                </p>
              </div>
            </div>

            {/* Department Sync Index */}
            <div className={`p-6 rounded-[32px] border text-left ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-500">
                <Layers size={14} /> Integrated Departments ({categories.length})
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex flex-col justify-between ${
                    darkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <span className="text-[9px] font-black text-slate-400 block mb-0.5">{cat.code}</span>
                    <span className="text-xs font-black truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: REALTIME CONSOLE CONTROL DESK METRICS */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Widget 1: Emergency Admissions Readiness Index */}
            <div className={`p-6 rounded-[32px] border text-left flex flex-col justify-between ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WIDGET ADRESS_SYS - T1</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-650 dark:text-teal-400 animate-pulse">TRIAGE ACTIVE</span>
                </div>

                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-teal-500" /> Emergency & Beds Readiness
                </h3>

                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <div className={`p-3.5 rounded-2xl text-center ${
                    darkMode ? "bg-slate-950/60 border border-slate-850" : "bg-slate-50 border border-slate-150"
                  }`}>
                    <p className="text-2xl font-black text-teal-500">{hospDetails?.beds || "150"}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">Total Bed Cap</p>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-center ${
                    darkMode ? "bg-slate-950/60 border border-slate-850" : "bg-slate-50 border border-slate-150"
                  }`}>
                    <p className="text-2xl font-black text-emerald-500">18</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1">Emergency Slots</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center gap-2.5">
                <Clock size={13} className="text-teal-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Realtime patient arrival monitor feeds auto-escalation protocols.
                </span>
              </div>
            </div>

            {/* Widget 2: Referral Notification Desk Previews */}
            <div className={`p-6 rounded-[32px] border text-left flex flex-col justify-between ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WIDGET RFL_NOTY - T2</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">SYNCED</span>
                </div>

                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Stethoscope size={16} className="text-blue-500" /> Inbound Clinics Link
                </h3>

                <div className="space-y-3.5 mb-5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total Connected Clinics</span>
                    <span className="font-extrabold text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-lg text-[10px] border border-blue-500/10">
                      {clinics.length || "12"} NODES ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Inbound Referrals Today</span>
                    <span className="font-extrabold text-slate-600 dark:text-slate-300">
                      {referrals.length || "5"} Case Logs Received
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Average Review Response</span>
                    <span className="text-emerald-500 font-semibold">1.5 Minutes</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center gap-2.5">
                <CheckCircle2 size={13} className="text-blue-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Doctor signature approvals validate transfer billing records.
                </span>
              </div>
            </div>

            {/* Widget 3: Real-Time Patient Activity & OPD/IPD Workflows Feed */}
            <div className={`p-6 rounded-[32px] border text-left flex flex-col justify-between md:col-span-2 ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE WORKFLOW CONTROL DESK</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    LIVE TELEMETRY
                  </div>
                </div>

                <h3 className="text-base font-black mb-3 flex items-center gap-2">
                  <Inbox size={16} className="text-emerald-500" /> Patient Admissions Flow Pre-View
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className={`p-3.5 rounded-2xl border ${
                    darkMode ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-150"
                  } space-y-1`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-teal-500 uppercase tracking-wider">OPD INTAKE</span>
                      <span className="text-[8px] font-bold text-slate-400 font-mono">2 MIN AGO</span>
                    </div>
                    <p className="text-xs font-black">Admitted walk-in OPD transfer</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                      Allocated General Medicine slot #3 - triage diagnostic summary synced.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${
                    darkMode ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-150"
                  } space-y-1`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">CRITICAL TRANSFER</span>
                      <span className="text-[8px] font-bold text-slate-400 font-mono">15 MIN ACC_LOG</span>
                    </div>
                    <p className="text-xs font-black">Ambulance dispatched from City Clinic</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                      Trauma emergency category. Patient file pre-injection validated securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-3 w-full flex items-center gap-2 text-slate-400 text-[10px]">
                <Shield size={12} className="text-teal-500" />
                <span className="font-bold">Encryption Signature: MD5_SYS4890 - Session locked automatically on standby.</span>
              </div>
            </div>

            {/* Widget 4: Ward Index Fin Desk Chart Overview */}
            <div className={`p-6 rounded-[32px] border text-left md:col-span-2 ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-205 shadow-xs"
            }`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FINANCE INTEGRATED MATRIX</span>
                  <h4 className="text-base font-black flex items-center gap-2 mt-0.5">
                    <TrendingUp size={16} className="text-teal-500" /> Financial Analytics & Rev Index
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/5 text-teal-500 rounded-xl border border-teal-500/10 text-[9px] font-black uppercase tracking-wider">
                  <Coins size={12} />
                  Live Fiscal Preview
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={previewChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hospWidgetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                        borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        borderRadius: "16px", 
                        fontSize: "11px",
                        fontWeight: "bold" 
                      }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#hospWidgetGradient)" name="Daily Invoiced (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM GLOBAL ACTION INITIATOR */}
        <div className="mt-14 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-xl hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mx-auto"
          >
            Continue to Hospital Dashboard
            <ArrowRight size={16} className="stroke-[2.5]" />
          </button>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">
            CareBridgePlus Clinical Enterprise Control Systems • Central Active Server Node
          </p>
        </div>

      </main>
    </div>
  );
};
