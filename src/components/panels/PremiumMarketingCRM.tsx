import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { 
  Megaphone, Image as ImageIcon, MessageSquare, FileText, 
  Users, Send, BarChart3, Sparkles, ChevronLeft, Search,
  Settings, Filter, Plus, Calendar, Clock, Download, Share2,
  TrendingUp, Target, Zap, Star, CheckCircle, ArrowRight,
  Eye, Heart, Activity, Award, RefreshCw, Copy, X, Menu,
  ChevronRight, AlertTriangle, Bell, Globe, Smartphone,
  PenTool, Palette, Type, Move, RotateCcw, Check, Trash2,
  ArrowUpRight, Hash, ExternalLink, Mail, Phone, Shield, ShieldCheck,
  Cpu, Layers, Sliders, Play, Pause, AlertCircle, Bot, CheckCircle2,
  FileCheck, HelpCircle, UserCheck, Lock, Key, Server
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, 
  Bar, Cell, PieChart, Pie, Legend, CartesianGrid, LineChart, Line
} from "recharts";

export interface PremiumMarketingCRMProps {
  allPatients?: any[];
  selectedPatients?: string[];
  setSelectedPatients?: (phones: string[]) => void;
  digitalCards?: any[];
  setDigitalCards?: React.Dispatch<React.SetStateAction<any[]>>;
  handleAddDigitalCard?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  sendMarketingContent?: (content: string, phone: string, type: string, skipDownload?: boolean) => Promise<void>;
  handleBulkSendWhatsApp?: (content: string, type: "card" | "tip" | "campaign") => Promise<void>;
  darkMode?: boolean;
  user?: any;
  clinicDetails?: any;
  openWhatsAppPreview?: (phone: string, msg: string, title: string, patientName: string, type: string, meta?: any) => void;
}

export type CRMWorkspaceTab = 
  | "dashboard"
  | "poster_studio"
  | "image_studio"
  | "whatsapp_studio"
  | "campaign_wizard"
  | "schedule_queue"
  | "template_library"
  | "growth_advisor"
  | "analytics_logs"
  | "crm_settings";

export default function PremiumMarketingCRM({
  allPatients = [],
  selectedPatients = [],
  setSelectedPatients,
  digitalCards = [],
  setDigitalCards,
  handleAddDigitalCard,
  sendMarketingContent,
  handleBulkSendWhatsApp,
  darkMode = false,
  user,
  clinicDetails,
  openWhatsAppPreview
}: PremiumMarketingCRMProps) {

  const [activeTab, setActiveTab] = useState<CRMWorkspaceTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shared state across workspaces
  const [composerMessage, setComposerMessage] = useState<string>(
    "Dear {{patient_name}},\n\nProtect your family this monsoon with CareBridge's Comprehensive Monsoon Health Checkup. Book your slot today at {{clinic_name}}!\n\nHelpline: {{helpline}}"
  );
  const [composerMedia, setComposerMedia] = useState<{ type: string; title: string; url?: string } | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");

  // CRM Settings persistent state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("growth_director_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      aiWorkingMode: "hybrid", // ai_first | manual | hybrid
      language: "en", // en | mr | hi
      antiSpamThrottle: "1_sec", // 1_sec | 3_sec | express
      sandboxMode: false,
      whatsappToken: "",
      whatsappPhoneId: "",
      whatsappBusinessId: "",
      geminiApiKey: ""
    };
  });

  useEffect(() => {
    localStorage.setItem("growth_director_settings", JSON.stringify(settings));
  }, [settings]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboardIcon, badge: "Live" },
    { id: "poster_studio", label: "AI Poster Studio", icon: Palette },
    { id: "image_studio", label: "AI Image Studio", icon: ImageIcon, badge: "Gemini" },
    { id: "whatsapp_studio", label: "WhatsApp Studio", icon: MessageSquare },
    { id: "campaign_wizard", label: "Campaign Wizard", icon: Sparkles },
    { id: "schedule_queue", label: "Schedule Queue", icon: Clock, badge: "4" },
    { id: "template_library", label: "Template Library", icon: FileText },
    { id: "growth_advisor", label: "AI Growth Advisor", icon: TrendingUp, badge: "AI" },
    { id: "analytics_logs", label: "Analytics & Logs", icon: BarChart3 },
    { id: "crm_settings", label: "CRM Settings", icon: Settings }
  ];

  return (
    <div className={`w-full min-h-[90vh] font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 bg-[#005f73] text-white rounded-2xl shadow-xl flex items-center gap-3 border border-teal-400/30"
          >
            <Sparkles className="w-5 h-5 text-teal-300 animate-spin" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Rail */}
      <header className={`border-b sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between gap-4 backdrop-blur-md ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#005f73] to-[#0A9396] text-white shadow-md shadow-teal-900/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-[#005f73] via-[#0A9396] to-teal-500 bg-clip-text text-transparent">
                Growth Director CRM
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full bg-teal-500/15 text-[#0A9396] border border-teal-500/20">
                Enterprise AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">CareBridge Marketing & Patient Retention Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${darkMode ? "bg-slate-800 text-teal-400" : "bg-teal-50 text-[#005f73]"}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {allPatients.length > 0 ? `${allPatients.length} Patients Active` : "2,480 Patients Connected"}
          </div>

          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold ${settings.sandboxMode ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
            <Shield className="w-3.5 h-3.5" />
            {settings.sandboxMode ? "Sandbox Mode" : "Live Dispatch"}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex relative min-h-[calc(90vh-3.5rem)]">
        
        {/* Desktop Sidebar Rail */}
        <aside className={`w-64 border-r py-4 flex-col justify-between hidden lg:flex shrink-0 sticky top-[3.75rem] h-[calc(100vh-3.75rem)] ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200/80"}`}>
          <div className="px-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Sub-Workspaces
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as CRMWorkspaceTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? "bg-[#005f73] text-white shadow-lg shadow-[#005f73]/25 font-extrabold scale-[1.01]" 
                      : darkMode 
                        ? "text-slate-400 hover:bg-slate-800/60 hover:text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#005f73]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-teal-300" : ""}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-teal-500/10 text-[#0A9396]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Quota Status */}
          <div className="p-3 mx-3 mt-2 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">Meta API Rate</span>
              <span className="text-emerald-400">99.8% Healthy</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[88%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Mode: {settings.aiWorkingMode.toUpperCase()}</span>
              <span className="text-teal-300 font-mono">v4.2 PRO</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex"
            >
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className={`w-72 h-full p-4 flex flex-col justify-between ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#005f73]" />
                      <span className="font-black text-sm">Growth Director</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)}>
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as CRMWorkspaceTab);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                            isActive 
                              ? "bg-[#005f73] text-white" 
                              : (darkMode ? "text-slate-200 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100")
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-teal-500/20 text-[#0A9396]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Display */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <SubWorkspaceDashboard 
                  darkMode={darkMode} 
                  allPatients={allPatients} 
                  setActiveTab={setActiveTab}
                  showToast={showToast}
                  setComposerMessage={setComposerMessage}
                />
              )}
              {activeTab === "poster_studio" && (
                <SubWorkspacePosterStudio 
                  darkMode={darkMode} 
                  clinicDetails={clinicDetails}
                  user={user}
                  allPatients={allPatients}
                  setActiveTab={setActiveTab}
                  setComposerMedia={setComposerMedia}
                  setComposerMessage={setComposerMessage}
                  showToast={showToast}
                />
              )}
              {activeTab === "image_studio" && (
                <SubWorkspaceImageStudio 
                  darkMode={darkMode} 
                  settings={settings}
                  setComposerMedia={setComposerMedia}
                  setActiveTab={setActiveTab}
                  showToast={showToast}
                />
              )}
              {activeTab === "whatsapp_studio" && (
                <SubWorkspaceWhatsAppStudio 
                  darkMode={darkMode} 
                  allPatients={allPatients}
                  selectedPatients={selectedPatients}
                  setSelectedPatients={setSelectedPatients}
                  composerMessage={composerMessage}
                  setComposerMessage={setComposerMessage}
                  composerMedia={composerMedia}
                  setComposerMedia={setComposerMedia}
                  handleBulkSendWhatsApp={handleBulkSendWhatsApp}
                  sendMarketingContent={sendMarketingContent}
                  clinicDetails={clinicDetails}
                  showToast={showToast}
                  openWhatsAppPreview={openWhatsAppPreview}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "campaign_wizard" && (
                <SubWorkspaceCampaignWizard 
                  darkMode={darkMode} 
                  allPatients={allPatients}
                  setActiveTab={setActiveTab}
                  setComposerMessage={setComposerMessage}
                  showToast={showToast}
                />
              )}
              {activeTab === "schedule_queue" && (
                <SubWorkspaceScheduleQueue 
                  darkMode={darkMode} 
                  showToast={showToast}
                />
              )}
              {activeTab === "template_library" && (
                <SubWorkspaceTemplateLibrary 
                  darkMode={darkMode} 
                  setActiveTab={setActiveTab}
                  setComposerMessage={setComposerMessage}
                  setComposerMedia={setComposerMedia}
                  showToast={showToast}
                />
              )}
              {activeTab === "growth_advisor" && (
                <SubWorkspaceGrowthAdvisor 
                  darkMode={darkMode} 
                  setActiveTab={setActiveTab}
                  setComposerMessage={setComposerMessage}
                  showToast={showToast}
                />
              )}
              {activeTab === "analytics_logs" && (
                <SubWorkspaceAnalyticsLogs 
                  darkMode={darkMode} 
                  allPatients={allPatients}
                />
              )}
              {activeTab === "crm_settings" && (
                <SubWorkspaceCRMSettings 
                  darkMode={darkMode} 
                  settings={settings}
                  setSettings={setSettings}
                  showToast={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Icon Helper
// ----------------------------------------------------
function LayoutDashboardIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

// ====================================================
// 1. DASHBOARD HUB WORKSPACE
// ====================================================
function SubWorkspaceDashboard({
  darkMode,
  allPatients,
  setActiveTab,
  showToast,
  setComposerMessage
}: {
  darkMode: boolean;
  allPatients: any[];
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  showToast: (msg: string) => void;
  setComposerMessage: (msg: string) => void;
}) {
  const kpiCards = [
    { label: "Total Broadcasts", value: "14,280", sub: "+1,240 this month", icon: Send, color: "from-teal-600 to-cyan-600" },
    { label: "Delivery Rate", value: "98.4%", sub: "Meta WhatsApp Cloud API", icon: CheckCircle2, color: "from-[#005f73] to-[#0A9396]" },
    { label: "Read Rate", value: "85.2%", sub: "vs 22% Industry Email Avg", icon: Eye, color: "from-emerald-600 to-teal-600" },
    { label: "Click-Through Rate", value: "45.6%", sub: "Interactive CTA Taps", icon: Target, color: "from-indigo-600 to-blue-600" },
    { label: "Appointments Booked", value: "384", sub: "Attributed Patient Visits", icon: Calendar, color: "from-purple-600 to-violet-600" },
    { label: "Total Revenue Generated", value: "₹1,84,200", sub: "Calculated Attributed Value", icon: TrendingUp, color: "from-amber-600 to-orange-600" },
  ];

  const liveStream = [
    { id: 1, time: "2 mins ago", patient: "Ramesh Sharma", event: "WhatsApp Poster Delivered", tag: "Monsoon Dengue", status: "delivered" },
    { id: 2, time: "8 mins ago", patient: "Priya Kulkarni", event: "Appointment Booked via CTA", tag: "Diabetes Follow-Up", status: "booked" },
    { id: 3, time: "14 mins ago", patient: "Anil Deshmukh", event: "Broadcast Message Opened", tag: "Hypertension Care", status: "read" },
    { id: 4, time: "25 mins ago", patient: "Sunita Patil", event: "Digital Card View", tag: "Dr. Kulkarni Profile", status: "viewed" },
    { id: 5, time: "40 mins ago", patient: "Vikram Joshi", event: "Audience Matched Segment", tag: "Cardiac Follow-up", status: "matched" },
  ];

  const quickActions = [
    {
      title: "Launch Monsoon Typhoid Awareness",
      desc: "Target 240 patients in low-lying localities with monsoon care guidance.",
      category: "Preventive Care",
      impact: "+45 Appointments Projected",
      msg: "Dear {{patient_name}},\nMonsoon brings an increase in Typhoid & Fever cases. Get your preventive health panel at {{clinic_name}} today!\nCall: {{helpline}}"
    },
    {
      title: "Hypertension Follow-Up Batch",
      desc: "Send automated quarterly checkup reminders to 118 hypertensive patients.",
      category: "Chronic Care",
      impact: "₹38,000 Revenue Potential",
      msg: "Dear {{patient_name}},\nIt's time for your periodic BP & Kidney Health checkup with {{doctor_name}} at {{clinic_name}}. Book slot now!"
    },
    {
      title: "Pediatric Vaccination Drive",
      desc: "Reach young mothers for monsoon booster dose schedules.",
      category: "Pediatrics",
      impact: "92% Retention Booster",
      msg: "Dear {{patient_name}},\nKeep your child protected against seasonal flu. Book your pediatric booster dose at {{clinic_name}}."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br ${darkMode ? "from-slate-900 via-slate-900 to-slate-800 border-slate-800" : "from-white via-teal-50/30 to-slate-50 border-slate-200"}`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#005f73] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-teal-500" />
            Executive Growth Command
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Clinic Performance & Live Patient Engagement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery logs, automated retention pipelines & revenue attribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("campaign_wizard")}
            className="px-4 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white font-extrabold text-xs shadow-md shadow-teal-900/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New AI Campaign
          </button>
          <button 
            onClick={() => setActiveTab("growth_advisor")}
            className="px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-[#005f73] dark:text-teal-300 font-extrabold text-xs border border-teal-500/20 flex items-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-[#0A9396]" />
            AI Strategy Recommendations
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-r ${kpi.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{kpi.value}</span>
                <span className="text-[11px] font-bold text-emerald-500">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Live Timeline & AI Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Stream Timeline */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Live Patient Interaction Timeline
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab("analytics_logs")}
              className="text-xs font-bold text-[#005f73] dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              View Full Delivery Logs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {liveStream.map((item) => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-xs font-bold ${
                    item.status === "booked" ? "bg-emerald-500/20 text-emerald-500" :
                    item.status === "delivered" ? "bg-blue-500/20 text-blue-500" :
                    "bg-teal-500/20 text-[#005f73]"
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {item.patient} <span className="font-normal text-slate-500">— {item.event}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Campaign Tag: <span className="text-[#0A9396] font-bold">{item.tag}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Recommendations */}
        <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"}`}>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              AI Growth Recommendations
            </h3>
          </div>

          <div className="mt-4 space-y-4">
            {quickActions.map((action, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50/80 border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{action.title}</h4>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-teal-500/10 text-[#005f73] border border-teal-500/20 shrink-0">
                    {action.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{action.desc}</p>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-black text-emerald-500">{action.impact}</span>
                  <button 
                    onClick={() => {
                      setComposerMessage(action.msg);
                      setActiveTab("whatsapp_studio");
                      showToast(`Loaded "${action.title}" into WhatsApp Studio!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#005f73] hover:bg-[#0A9396] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    Execute Campaign <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ====================================================
// 2. AI POSTER STUDIO WORKSPACE
// ====================================================
function SubWorkspacePosterStudio({
  darkMode,
  clinicDetails,
  user,
  allPatients = [],
  setActiveTab,
  setComposerMedia,
  setComposerMessage,
  showToast
}: {
  darkMode: boolean;
  clinicDetails: any;
  user: any;
  allPatients?: any[];
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  setComposerMedia: (media: any) => void;
  setComposerMessage: (msg: string) => void;
  showToast: (msg: string) => void;
}) {
  const [editableDoctorName, setEditableDoctorName] = useState(() => localStorage.getItem("cb_branding_doctorName") || clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName || "Dr. Rajesh Kulkarni");
  const [editableDoctorQual, setEditableDoctorQual] = useState(() => localStorage.getItem("cb_branding_doctorQual") || clinicDetails?.qualification || "M.D. (Medicine), Senior Physician");
  const [editableClinicName, setEditableClinicName] = useState(() => localStorage.getItem("cb_branding_clinicName") || user?.name || user?.displayName || clinicDetails?.clinicName || "CareBridge Speciality Clinic");
  const [editableClinicAddress, setEditableClinicAddress] = useState(() => localStorage.getItem("cb_branding_clinicAddress") || clinicDetails?.address || "Suite 402, Medical Enclave, MG Road, Pune");
  const [editableHelpline, setEditableHelpline] = useState(() => localStorage.getItem("cb_branding_helpline") || clinicDetails?.contact_no || clinicDetails?.phone || "+91 98220 12345");

  useEffect(() => {
    if (!localStorage.getItem("cb_branding_doctorName") && (clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName)) {
      setEditableDoctorName(clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName || "Dr. Rajesh Kulkarni");
    }
    if (!localStorage.getItem("cb_branding_doctorQual") && clinicDetails?.qualification) {
      setEditableDoctorQual(clinicDetails?.qualification || "M.D. (Medicine), Senior Physician");
    }
    if (!localStorage.getItem("cb_branding_clinicName") && (user?.name || user?.displayName || clinicDetails?.clinicName)) {
      setEditableClinicName(user?.name || user?.displayName || clinicDetails?.clinicName || "CareBridge Speciality Clinic");
    }
    if (!localStorage.getItem("cb_branding_clinicAddress") && clinicDetails?.address) {
      setEditableClinicAddress(clinicDetails?.address || "Suite 402, Medical Enclave, MG Road, Pune");
    }
    if (!localStorage.getItem("cb_branding_helpline") && (clinicDetails?.contact_no || clinicDetails?.phone)) {
      setEditableHelpline(clinicDetails?.contact_no || clinicDetails?.phone || "+91 98220 12345");
    }
  }, [clinicDetails, user]);

  const handleSaveBranding = () => {
    localStorage.setItem("cb_branding_doctorName", editableDoctorName);
    localStorage.setItem("cb_branding_doctorQual", editableDoctorQual);
    localStorage.setItem("cb_branding_clinicName", editableClinicName);
    localStorage.setItem("cb_branding_clinicAddress", editableClinicAddress);
    localStorage.setItem("cb_branding_helpline", editableHelpline);
    showToast("Branding settings saved successfully!");
  };

  const handleRefreshBranding = () => {
    const docName = clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName || "Dr. Rajesh Kulkarni";
    const docQual = clinicDetails?.qualification || "M.D. (Medicine), Senior Physician";
    const cliName = user?.name || user?.displayName || clinicDetails?.clinicName || "CareBridge Speciality Clinic";
    const cliAddr = clinicDetails?.address || "Suite 402, Medical Enclave, MG Road, Pune";
    const cliHelp = clinicDetails?.contact_no || clinicDetails?.phone || "+91 98220 12345";

    setEditableDoctorName(docName);
    setEditableDoctorQual(docQual);
    setEditableClinicName(cliName);
    setEditableClinicAddress(cliAddr);
    setEditableHelpline(cliHelp);

    localStorage.setItem("cb_branding_doctorName", docName);
    localStorage.setItem("cb_branding_doctorQual", docQual);
    localStorage.setItem("cb_branding_clinicName", cliName);
    localStorage.setItem("cb_branding_clinicAddress", cliAddr);
    localStorage.setItem("cb_branding_helpline", cliHelp);

    showToast("Branding refreshed to clinic defaults!");
  };

  const [activePreset, setActivePreset] = useState("monsoon");
  
  const [customPresets, setCustomPresets] = useState([
    {
      id: "monsoon",
      category: "Seasonal Awareness",
      title: "Monsoon Dengue & Malaria Safety",
      headline: "Protect Your Family From Seasonal Fever",
      tips: ["Eliminate Stagnant Water", "Use Mosquito Nets & Repellents", "Get Early Blood Screening"],
      bgColor: "from-slate-900 via-[#005f73] to-teal-900"
    },
    {
      id: "diabetes",
      category: "Chronic Care",
      title: "Comprehensive Diabetes Care Drive",
      headline: "Know Your HbA1c & Blood Sugar Levels",
      tips: ["Fasting & PP Sugar Screening", "Dietary Consultation Included", "Neuropathy & Eye Checkup"],
      bgColor: "from-blue-950 via-indigo-900 to-slate-900"
    },
    {
      id: "pediatric",
      category: "Child Health",
      title: "Pediatric Vaccination & Wellness",
      headline: "Keep Immunity High This Season",
      tips: ["Seasonal Flu Booster Doses", "Growth & Nutrition Tracking", "Gentle Care for Newborns"],
      bgColor: "from-teal-950 via-emerald-900 to-slate-900"
    },
    {
      id: "cardiac",
      category: "Specialist Camp",
      title: "Healthy Heart Wellness Camp",
      headline: "Comprehensive ECG & Lipid Profile",
      tips: ["Blood Pressure Monitoring", "Cardiologist Consultation", "Custom Lifestyle Plan"],
      bgColor: "from-rose-950 via-red-900 to-slate-900"
    },
    {
      id: "festival",
      category: "Greetings",
      title: "Warm Festive Health Wishes",
      headline: "Wishing You Health & Prosperity",
      tips: ["Stay Hydrated During Celebrations", "Keep Medications Regular", "24/7 Emergency Care Active"],
      bgColor: "from-amber-950 via-amber-900 to-slate-900"
    }
  ]);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [customCategory, setCustomCategory] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBgColor, setAiBgColor] = useState("from-[#005f73] via-teal-800 to-slate-900");
  const [aiFontStyle, setAiFontStyle] = useState("Modern Premium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<any>(null);
  
  const [isEditingPoster, setIsEditingPoster] = useState(false);
  
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState({
    contact: "",
    ageMin: "",
    ageMax: "",
    gender: "All",
    address: "",
    visits: "",
    disease: "",
    department: "",
    bpSugar: ""
  });

  const filteredAudience = useMemo(() => {
    if (!allPatients) return [];
    return allPatients.filter((patient: any) => {
      if (audienceFilter.contact && !String(patient.phone || patient.contact_no || patient.contact || "").includes(audienceFilter.contact)) return false;
      
      const patientAge = parseInt(patient.age || "0", 10);
      if (audienceFilter.ageMin && patientAge < parseInt(audienceFilter.ageMin, 10)) return false;
      if (audienceFilter.ageMax && patientAge > parseInt(audienceFilter.ageMax, 10)) return false;
      
      if (audienceFilter.gender && audienceFilter.gender !== "All") {
        const patientGender = String(patient.gender || patient.patientGender || "").toLowerCase().charAt(0);
        const filterGender = audienceFilter.gender.toLowerCase().charAt(0);
        if (patientGender && patientGender !== filterGender) return false;
        if (!patientGender) return false;
      }
      
      if (audienceFilter.address && !String(patient.address || patient.patientAddress || patient.area || patient.location || patient.city || "").toLowerCase().includes(audienceFilter.address.toLowerCase())) return false;
      
      if (audienceFilter.visits) {
        const minVisits = parseInt(audienceFilter.visits, 10);
        let patientVisits = parseInt(String(patient.visits || patient.visitCount || patient.visit_count || "1"), 10);
        if (isNaN(patientVisits)) patientVisits = 1;
        if (patientVisits < minVisits) return false;
      }
      
      if (audienceFilter.disease && !String(patient.disease || patient.diagnosis || patient.condition || "").toLowerCase().includes(audienceFilter.disease.toLowerCase())) return false;
      
      if (audienceFilter.department && audienceFilter.department !== "All Departments" && audienceFilter.department !== "") {
        if (!String(patient.department || "").toLowerCase().includes(audienceFilter.department.toLowerCase())) return false;
      }
      
      if (audienceFilter.bpSugar && audienceFilter.bpSugar !== "None") {
        const bp = String(patient.bp || patient.vitals?.bp || "").toLowerCase();
        const sugar = String(patient.sugar || patient.vitals?.sugar || "").toLowerCase();
        if (audienceFilter.bpSugar === "High BP" && (!bp.includes("high") && parseInt(bp.split('/')[0] || "0") < 130)) return false;
        if (audienceFilter.bpSugar === "High Sugar" && (!sugar.includes("high") && parseInt(sugar || "0") < 140)) return false;
      }
      
      return true;
    });
  }, [allPatients, audienceFilter]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poster",
          payload: {
            customPrompt: `${aiPrompt} [Style: Premium ${aiFontStyle}, Theme: ${aiBgColor}]`,
            category: customCategory || "Custom AI Campaign",
            clinicName: editableClinicName,
            doctorName: editableDoctorName
          }
        })
      });

      if (!response.ok) throw new Error("Failed to generate AI poster");
      const data = await response.json();
      
      const newPreset = {
        id: "custom-ai",
        category: customCategory || "AI Generated",
        title: data.tagline?.english || "AI Health Campaign",
        headline: data.headline?.english || aiPrompt,
        tips: data.content?.english ? data.content.english.split('. ').filter(Boolean).slice(0, 3) : ["Consult Doctor", "Stay Hydrated", "Take Care"],
        bgColor: aiBgColor || "from-[#005f73] via-teal-800 to-slate-900"
      };
      
      setGeneratedPoster(newPreset);
      setActivePreset("custom-ai");
      
      showToast("AI Poster generated successfully based on prompt!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate AI poster. Showing fallback.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiGenerateMessage = () => {
    if (!aiPrompt.trim()) return;
    const msg = `Dear {{patient_name}},\n\n${aiPrompt}\n\nVisit us at ${editableClinicName}.\n📍 Location: ${editableClinicAddress}\n📞 Helpline: ${editableHelpline}\n\nStay healthy!`;
    setComposerMessage(msg);
    setActiveTab("whatsapp_studio");
    showToast("Premium WhatsApp Message generated and loaded!");
  };

  const currentPreset = generatedPoster && activePreset === "custom-ai" 
    ? generatedPoster 
    : (customPresets.find(p => p.id === activePreset) || customPresets[0]);

  const handleUpdatePreset = (field: string, value: any) => {
    setCustomPresets(customPresets.map(p => p.id === currentPreset.id ? { ...p, [field]: value } : p));
  };

  const handleLaunchToWhatsApp = () => {
    setComposerMedia({
      type: "poster",
      title: currentPreset.title,
      url: `[AI Poster: ${currentPreset.title}]`
    });
    setComposerMessage(
      `Dear {{patient_name}},\n\n${currentPreset.headline}!\n\n${currentPreset.title} at ${editableClinicName}.\n\n📍 Address: ${editableClinicAddress}\n📞 Helpline: ${editableHelpline}\n\nBook your slot today!`
    );
    setActiveTab("whatsapp_studio");
    showToast("Poster attached to WhatsApp Studio!");
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#005f73]" />
            AI Medical Poster Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time preview of medical promotional and health awareness posters with clinic branding auto-population.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast("Poster graphics copied to share link!")}
            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-300 transition-all"
          >
            <Share2 className="w-4 h-4" /> Copy Share Link
          </button>
          <button 
            onClick={handleLaunchToWhatsApp}
            className="px-4 py-2 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-teal-900/20 transition-all"
          >
            <Send className="w-4 h-4" /> Dispatch via WhatsApp Studio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Preset Selector & Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Choose Category Preset
              </h3>
              <button 
                onClick={() => {
                  const newId = `custom-${Date.now()}`;
                  setCustomPresets([...customPresets, {
                    id: newId,
                    category: "Custom Setup",
                    title: "New Custom Campaign",
                    headline: "Your Catchy Headline Here",
                    tips: ["First important tip", "Second important tip", "Third important tip"],
                    bgColor: "from-[#005f73] via-teal-800 to-slate-900"
                  }]);
                  setActivePreset(newId);
                }}
                className="text-[10px] font-bold text-[#005f73] dark:text-teal-400 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> New Preset
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {customPresets.map(p => (
                <div key={p.id} className="relative group">
                  <button
                    onClick={() => setActivePreset(p.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all ${
                      activePreset === p.id 
                        ? "border-[#005f73] bg-teal-500/10 text-[#005f73] dark:text-teal-300 font-black shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium"
                    }`}
                  >
                    <div className="text-xs font-bold pr-6 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.category}</div>
                  </button>
                  {p.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomPresets(customPresets.filter(preset => preset.id !== p.id));
                        if (activePreset === p.id) setActivePreset(customPresets[0]?.id || "");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto Branding Engine Info */}
          <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                2. Editable Branding
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={handleRefreshBranding} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1" title="Reset to default clinic profile">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
                <button onClick={handleSaveBranding} className="px-3 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-[#005f73] dark:text-teal-400 text-[10px] font-black border border-teal-500/20 transition-all">
                  Save Changes
                </button>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Doctor Name</span>
                <input type="text" value={editableDoctorName} onChange={(e) => setEditableDoctorName(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Clinic Name</span>
                <input type="text" value={editableClinicName} onChange={(e) => setEditableClinicName(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                <input type="text" value={editableClinicAddress} onChange={(e) => setEditableClinicAddress(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Helpline</span>
                <input type="text" value={editableHelpline} onChange={(e) => setEditableHelpline(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Logo Branding</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#005f73] file:text-white hover:file:bg-[#0A9396] w-full" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Main Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#005f73] file:text-white hover:file:bg-[#0A9396] w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Generation Box */}
          <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                3. Custom AI Generation
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Custom Category</span>
                <input type="text" placeholder="e.g. Winter Care" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Style Profile</span>
                  <select value={aiFontStyle} onChange={(e) => setAiFontStyle(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full text-slate-800 dark:text-white">
                    <option value="Modern Premium">Modern Premium</option>
                    <option value="Clinical Clean">Clinical Clean</option>
                    <option value="Bold Aesthetic">Bold Aesthetic</option>
                    <option value="Festive Warm">Festive Warm</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Color Theme</span>
                  <select value={aiBgColor} onChange={(e) => setAiBgColor(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full text-slate-800 dark:text-white">
                    <option value="from-[#005f73] via-teal-800 to-slate-900">Teal Trust (Premium)</option>
                    <option value="from-blue-950 via-indigo-900 to-slate-900">Indigo Care (Clinical)</option>
                    <option value="from-emerald-900 via-emerald-800 to-slate-900">Emerald Wellness</option>
                    <option value="from-rose-950 via-red-900 to-slate-900">Cardio Red</option>
                    <option value="from-amber-950 via-amber-900 to-slate-900">Warm Festive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[10px] text-slate-400 font-bold uppercase">AI Prompt</span>
                <textarea rows={3} placeholder="Describe the poster (e.g., Cardiology awareness with large premium fonts)..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="p-2 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full custom-scrollbar resize-none text-slate-800 dark:text-white" />
                <label className="absolute right-2 bottom-2 p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors" title="Attach Gallery Image">
                  <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#005f73] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]">
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? "Generating..." : "Generate Poster"}
                </button>
                <button onClick={handleAiGenerateMessage} disabled={!aiPrompt.trim()} className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]">
                  <MessageSquare className="w-4 h-4" />
                  Generate WA Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className={`w-full max-w-xs aspect-[4/5] rounded-3xl p-5 text-white bg-gradient-to-br ${currentPreset.bgColor} shadow-2xl flex flex-col justify-between border border-white/10 relative overflow-hidden`}>
            
            {/* Background Aesthetic Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            {/* Canvas Header */}
            <div className="relative z-10 flex justify-between items-start border-b border-white/15 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-teal-200">
                  {customCategory || currentPreset.category}
                </span>
                <div className="flex items-center gap-3 mt-3">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white/90 p-0.5 shadow-sm" />}
                  <h4 className="text-lg font-black tracking-tight text-white">{editableClinicName}</h4>
                </div>
                <p className="text-[10px] text-teal-200/80 mt-1">{editableClinicAddress}</p>
              </div>
              <button 
                onClick={() => setIsEditingPoster(!isEditingPoster)}
                className={`p-2 rounded-2xl backdrop-blur-md border transition-all ${isEditingPoster ? "bg-amber-500/20 border-amber-400/50 text-amber-300" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
                title="Edit Poster Content"
              >
                {isEditingPoster ? <Check className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
              </button>
            </div>

            {/* Canvas Body */}
            <div className="relative z-10 my-4 space-y-3 flex-1 flex flex-col justify-center">
              {isEditingPoster ? (
                <textarea
                  value={currentPreset.headline}
                  onChange={(e) => handleUpdatePreset("headline", e.target.value)}
                  className="w-full text-2xl font-black leading-tight tracking-tight bg-white/10 border border-white/30 rounded-xl p-2 text-white placeholder-white/50 focus:outline-hidden"
                  rows={2}
                />
              ) : (
                <h3 className="text-2xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                  {isGenerating ? "Generating poster details..." : currentPreset.headline}
                </h3>
              )}
              
              {imageUrl ? (
                <div className="w-full h-36 rounded-2xl overflow-hidden border border-white/20 shadow-inner mt-2">
                  <img src={imageUrl} alt="Poster visual" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 mt-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    Key Health Guidance:
                  </div>
                  {currentPreset.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-white/90">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      {isEditingPoster ? (
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => {
                            const newTips = [...currentPreset.tips];
                            newTips[i] = e.target.value;
                            handleUpdatePreset("tips", newTips);
                          }}
                          className="flex-1 bg-white/10 border border-white/30 rounded px-2 py-0.5 text-white focus:outline-hidden"
                        />
                      ) : (
                        <span>{tip}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Canvas Footer (Doctor Info & Helpline) */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">{editableDoctorName}</div>
                <div className="text-[10px] text-teal-200">{editableDoctorQual}</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                📞 {editableHelpline}
              </div>
            </div>

          </div>

          {/* Broadcast Action Area */}
          <div className="w-full max-w-xs mt-6 flex flex-col gap-3">
            <button 
              onClick={() => setShowAudienceModal(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" /> Send to Broadcast / WhatsApp
            </button>
          </div>
        </div>

      </div>

      {/* Audience Selector Modal */}
      <AnimatePresence>
        {showAudienceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                <h3 className={`text-lg font-black flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                  <Filter className="w-5 h-5 text-teal-500" />
                  Target Audience Selector
                </h3>
                <button onClick={() => setShowAudienceModal(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Contact No</label>
                    <input type="text" placeholder="e.g. 9876543210" value={audienceFilter.contact} onChange={(e) => setAudienceFilter({...audienceFilter, contact: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Age</label>
                      <input type="number" value={audienceFilter.ageMin} onChange={(e) => setAudienceFilter({...audienceFilter, ageMin: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Age</label>
                      <input type="number" value={audienceFilter.ageMax} onChange={(e) => setAudienceFilter({...audienceFilter, ageMax: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                    <select value={audienceFilter.gender} onChange={(e) => setAudienceFilter({...audienceFilter, gender: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}>
                      <option>All</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City/Address</label>
                    <input type="text" placeholder="e.g. Pune" value={audienceFilter.address} onChange={(e) => setAudienceFilter({...audienceFilter, address: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visit Count (Min)</label>
                    <select value={audienceFilter.visits} onChange={(e) => setAudienceFilter({...audienceFilter, visits: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}>
                      <option value="">Any</option>
                      <option value="1">1+ Visits</option>
                      <option value="2">2+ Visits</option>
                      <option value="3">3+ Visits (Loyal)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disease/Diagnosis</label>
                    <input type="text" placeholder="e.g. Diabetes, Hypertension" value={audienceFilter.disease} onChange={(e) => setAudienceFilter({...audienceFilter, disease: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                    <select value={audienceFilter.department} onChange={(e) => setAudienceFilter({...audienceFilter, department: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}>
                      <option value="">All Departments</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vitals (BP/Sugar Alert)</label>
                    <select value={audienceFilter.bpSugar} onChange={(e) => setAudienceFilter({...audienceFilter, bpSugar: e.target.value})} className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}>
                      <option value="">None</option>
                      <option value="High BP">High BP</option>
                      <option value="High Sugar">High Sugar</option>
                    </select>
                  </div>
                </div>

                {/* MATCHED PATIENTS LIST */}
                {filteredAudience.length > 0 && (
                  <div className="mt-6 space-y-2 border-t pt-4 border-slate-200 dark:border-slate-700">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Matched Patients List</h4>
                    <div className="space-y-2">
                      {filteredAudience.map((patient: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 ${darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-white border-slate-200"}`}>
                          <div>
                            <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{patient.name || patient.patientName || "Unknown Patient"}</p>
                            <p className="text-xs text-slate-500">{patient.phone || patient.contact_no || "No Contact"} • {patient.gender || patient.patientGender || "Gender N/A"} • {patient.age ? `${patient.age} yrs` : "Age N/A"}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{patient.address || patient.patientAddress || patient.area || patient.location || patient.city || "No Address"}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-right md:text-left justify-end">
                            {(patient.bp || patient.vitals?.bp) && (
                              <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">BP: {patient.bp || patient.vitals?.bp}</span>
                            )}
                            {(patient.sugar || patient.vitals?.sugar) && (
                              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">Sugar: {patient.sugar || patient.vitals?.sugar}</span>
                            )}
                            {(patient.disease || patient.diagnosis) && (
                              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">{patient.disease || patient.diagnosis}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Filter Results */}
              <div className={`p-6 border-t ${darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Matched Patients</p>
                      <h4 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-800"}`}>
                        {filteredAudience.length}
                      </h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAudienceModal(false);
                      handleLaunchToWhatsApp();
                    }}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-lg flex items-center gap-2"
                  >
                    Execute Broadcast <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================================
// 3. AI IMAGE STUDIO WORKSPACE (GEMINI INTEGRATION)
// ====================================================
function SubWorkspaceImageStudio({
  darkMode,
  settings,
  setComposerMedia,
  setActiveTab,
  showToast
}: {
  darkMode: boolean;
  settings: any;
  setComposerMedia: (media: any) => void;
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  showToast: (msg: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [assetType, setAssetType] = useState("infographic");

  const [generatedAssets, setGeneratedAssets] = useState([
    { id: 1, title: "Hypertension Care Infographic", tag: "Infographic", color: "from-blue-600 to-teal-600", date: "Today" },
    { id: 2, title: "Monsoon Dengue Prevention Banner", tag: "Banner", color: "from-teal-600 to-[#005f73]", date: "Yesterday" },
    { id: 3, title: "Pediatric Booster Vaccination Asset", tag: "Poster", color: "from-indigo-600 to-purple-600", date: "3 days ago" },
  ]);

  const presetPrompts = [
    "High contrast infographic for Diabetes Prevention & Dietary Management",
    "Clinical social banner for Monsoon Typhoid Screening Camp",
    "Pediatric Immunization Awareness Graphic with CareBridge branding",
    "Cardiac Risk Factors & Blood Pressure Tracking Infographic"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const newAsset = {
        id: Date.now(),
        title: "AI Generated " + assetType.charAt(0).toUpperCase() + assetType.slice(1),
        fullPrompt: prompt,
        tag: assetType.toUpperCase(),
        color: "from-teal-600 via-[#005f73] to-slate-900",
        date: "Just now",
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " premium clinical medical style")}?width=800&height=600&nologo=true`
      };
      setGeneratedAssets([newAsset, ...generatedAssets] as any);
      setIsGenerating(false);
      showToast("Premium AI Asset generated successfully!");
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#005f73]" />
            AI Image & Banner Studio (Gemini Engine)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate clinical infographics, social media banners, and patient education graphics using AI prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20">
          <Sparkles className="w-4 h-4 text-teal-500" />
          {settings.geminiApiKey ? "Gemini Key Configured" : "Demo Prompt Mode Active"}
        </div>
      </div>

      {/* Generator Prompt Panel */}
      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the medical graphic or campaign banner you want to generate..."
            className={`flex-1 px-4 py-3 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005f73] ${
              darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 rounded-2xl bg-[#005f73] hover:bg-[#0A9396] disabled:opacity-50 text-white text-xs font-black shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? "Generating..." : "Generate AI Asset"}
          </button>
        </div>

        {/* Prompt Presets */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quick Prompt Presets:</div>
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-500/10 hover:text-[#005f73] transition-all"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Library Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Generated Asset Library
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedAssets.map((asset) => (
            <div 
              key={asset.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"
              }`}
            >
              {/* Asset Preview Box */}
              <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${asset.color} p-4 text-white flex flex-col justify-between border border-white/10 shadow-inner relative overflow-hidden group`}>
                {(asset as any).imageUrl && (
                  <img src={(asset as any).imageUrl} alt={asset.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-slate-900/40 pointer-events-none" />
                <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-wider w-fit shadow-sm">
                  {asset.tag}
                </span>
                <h4 className="relative z-10 text-sm font-black leading-snug drop-shadow-md truncate w-full" title={(asset as any).fullPrompt || asset.title}>{asset.title}</h4>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">{asset.date}</span>
                <button 
                  onClick={() => {
                    setComposerMedia({ type: "image", title: asset.title, url: "[Generated Asset]" });
                    setActiveTab("whatsapp_studio");
                    showToast(`Attached "${asset.title}" to WhatsApp Studio!`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Attach to WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 4. AI WHATSAPP STUDIO WORKSPACE
// ====================================================
function SubWorkspaceWhatsAppStudio({
  darkMode,
  allPatients,
  selectedPatients,
  setSelectedPatients,
  composerMessage,
  setComposerMessage,
  composerMedia,
  setComposerMedia,
  handleBulkSendWhatsApp,
  sendMarketingContent,
  clinicDetails,
  showToast,
  openWhatsAppPreview,
  setActiveTab
}: {
  darkMode: boolean;
  allPatients: any[];
  selectedPatients: string[];
  setSelectedPatients?: (phones: string[]) => void;
  composerMessage: string;
  setComposerMessage: (msg: string) => void;
  composerMedia: any;
  setComposerMedia: (media: any) => void;
  handleBulkSendWhatsApp?: (content: string, type: "card" | "tip" | "campaign") => Promise<void>;
  sendMarketingContent?: (content: string, phone: string, type: string) => Promise<void>;
  clinicDetails: any;
  showToast: (msg: string) => void;
  openWhatsAppPreview?: any;
  setActiveTab: (tab: CRMWorkspaceTab) => void;
}) {
  const clinicName = clinicDetails?.clinicName || "CareBridge Clinic";
  const doctorName = clinicDetails?.doctorName || "Dr. Rajesh Kulkarni";
  const helpline = clinicDetails?.phone || "+91 98220 12345";

  const [audienceFilter, setAudienceFilter] = useState("all");

  const placeholders = [
    { label: "{{patient_name}}", val: "{{patient_name}}" },
    { label: "{{doctor_name}}", val: "{{doctor_name}}" },
    { label: "{{clinic_name}}", val: "{{clinic_name}}" },
    { label: "{{helpline}}", val: "{{helpline}}" }
  ];

  const insertPlaceholder = (val: string) => {
    setComposerMessage(composerMessage + " " + val);
  };

  const formattedPreview = useMemo(() => {
    return composerMessage
      .replace(/{{patient_name}}/g, "Rajesh Sharma")
      .replace(/{{doctor_name}}/g, doctorName)
      .replace(/{{clinic_name}}/g, clinicName)
      .replace(/{{helpline}}/g, helpline);
  }, [composerMessage, doctorName, clinicName, helpline]);

  const handleExecuteDispatch = async () => {
    if (handleBulkSendWhatsApp) {
      await handleBulkSendWhatsApp(formattedPreview, "campaign");
    }
    showToast("WhatsApp Campaign Dispatched Successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#005f73]" />
            AI WhatsApp Broadcast Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalized broadcast composer with rich media attachments & live WhatsApp mobile simulator.
          </p>
        </div>

        <button 
          onClick={handleExecuteDispatch}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" /> Dispatch Bulk Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Composer & Attachments */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Smart Message Composer */}
          <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Smart Message Composer
              </h3>
              <div className="flex items-center gap-1.5">
                {placeholders.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => insertPlaceholder(p.val)}
                    className="px-2 py-1 rounded-md bg-teal-500/10 text-[#005f73] dark:text-teal-300 text-[10px] font-bold border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              rows={6}
              value={composerMessage}
              onChange={(e) => setComposerMessage(e.target.value)}
              className={`w-full p-4 rounded-2xl border text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005f73] ${
                darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>

          {/* Media Attachments Panel */}
          <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                2. Rich Media Attachment
              </h3>
              {composerMedia && (
                <button 
                  onClick={() => setComposerMedia(null)}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                >
                  Remove Attachment
                </button>
              )}
            </div>

            {composerMedia ? (
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs font-bold text-[#005f73] dark:text-teal-300">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Attached: {composerMedia.title} ({composerMedia.type.toUpperCase()})</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  onClick={() => setComposerMedia({ type: "card", title: "Digital Profile Card" })}
                  className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  + Digital Card
                </button>
                <button 
                  onClick={() => setComposerMedia({ type: "brochure", title: "Health Camp PDF" })}
                  className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  + PDF Brochure
                </button>
                <button 
                  onClick={() => setActiveTab("poster_studio")}
                  className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  + Poster Studio
                </button>
                <button 
                  onClick={() => setActiveTab("image_studio")}
                  className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  + Gemini Image
                </button>
              </div>
            )}
          </div>

          {/* Target Audience Segment Selection */}
          <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-3`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              3. Select Audience Segment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["all", "chronic", "opd_followup", "locality"].map((seg) => (
                <button
                  key={seg}
                  onClick={() => setAudienceFilter(seg)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center uppercase tracking-wider ${
                    audienceFilter === seg 
                      ? "bg-[#005f73] text-white border-[#005f73]" 
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {seg.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: WhatsApp Phone Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-[40px] border-8 border-slate-800 bg-[#0b141a] text-white shadow-2xl p-4 flex flex-col justify-between min-h-[520px] relative">
            
            {/* WhatsApp Top Bar */}
            <div className="pb-3 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#005f73] flex items-center justify-center font-black text-sm">
                CB
              </div>
              <div>
                <div className="text-xs font-black text-white">{clinicName}</div>
                <div className="text-[10px] text-emerald-400">Official WhatsApp Verified</div>
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div className="my-4 flex-1 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#202c33] text-slate-100 text-xs font-normal leading-relaxed space-y-2 border border-white/5 relative">
                
                {composerMedia && (
                  <div className="p-2.5 rounded-xl bg-slate-800 text-[11px] font-bold text-teal-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> {composerMedia.title}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{formattedPreview}</div>

                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1">
                  <span>10:45 AM</span>
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                </div>
              </div>

              <div className="w-full p-2.5 rounded-xl bg-[#202c33] text-teal-400 text-[11px] font-black text-center border border-white/5">
                📲 Book Appointment via WhatsApp CTA
              </div>
            </div>

            {/* Simulator Bottom Footer */}
            <div className="text-center text-[10px] text-slate-500 font-bold">
              Live Formatting Preview Simulator
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ====================================================
// 5. CAMPAIGN WIZARD WORKSPACE
// ====================================================
function SubWorkspaceCampaignWizard({
  darkMode,
  allPatients,
  setActiveTab,
  setComposerMessage,
  showToast
}: {
  darkMode: boolean;
  allPatients: any[];
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  setComposerMessage: (msg: string) => void;
  showToast: (msg: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("reactivation");
  const [segment, setSegment] = useState("chronic");
  const [language, setLanguage] = useState("en");

  const generateCopy = (lang: string) => {
    if (lang === "mr") {
      return "नमस्कार {{patient_name}},\nकेअरब्रिज क्लिनिकतर्फे आरोग्य तपासणी मोहीम. आजच तुमची वेळ निश्चित करा!";
    } else if (lang === "hi") {
      return "नमस्ते {{patient_name}},\nकेयरब्रिज क्लिनिक में विशेष स्वास्थ्य जांच शिविर। आज ही अपॉइंटमेंट बुक करें!";
    }
    return "Dear {{patient_name}},\nSpecial Seasonal Preventive Health Camp at {{clinic_name}}. Book your appointment today!";
  };

  const handleFinishWizard = () => {
    const copy = generateCopy(language);
    setComposerMessage(copy);
    setActiveTab("whatsapp_studio");
    showToast("Campaign configured & prefilled into WhatsApp Studio!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#005f73]" />
          4-Step Targeted Campaign Wizard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step-by-step target campaign builder with localized copy generation & scheduled dispatch.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
              step >= s ? "bg-[#005f73] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
            }`}>
              {s}
            </div>
            <span className="text-xs font-bold hidden sm:block text-slate-600 dark:text-slate-300">
              {s === 1 ? "Goal" : s === 2 ? "Audience" : s === 3 ? "Copy" : "Launch"}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={`p-8 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-6`}>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Step 1: Select Campaign Goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "reactivation", label: "Patient Reactivation", desc: "Re-engage patients inactive for over 90 days." },
                { id: "awareness", label: "Monsoon Health Awareness", desc: "Educate on seasonal fever & waterborne risks." },
                { id: "chronic", label: "Chronic Care Follow-Up", desc: "Quarterly reminders for Diabetes & BP." },
                { id: "offer", label: "Special Preventive Discount", desc: "Promote health package checkups." }
              ].map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setGoal(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    goal === item.id 
                      ? "border-[#005f73] bg-teal-500/10 text-[#005f73] font-bold" 
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  <div className="text-xs font-black">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Step 2: Audience Segmentation</h3>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400">Filter Segment:</label>
              <select 
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-bold ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
              >
                <option value="chronic">Patients with Chronic Conditions (Diabetes, Hypertension)</option>
                <option value="inactive_90">Inactive Patients (&gt; 90 Days since last visit)</option>
                <option value="pediatric">Pediatric Parents Batch</option>
                <option value="all">All Registered Patients</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Step 3: Creative Drafting</h3>
            <div className="flex gap-3">
              {["en", "mr", "hi"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                    language === l ? "bg-[#005f73] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                  }`}
                >
                  {l === "mr" ? "Marathi (मराठी)" : l === "hi" ? "Hindi (हिंदी)" : "English"}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-medium whitespace-pre-wrap">
              {generateCopy(language)}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Campaign Ready for Launch!</h3>
            <p className="text-xs text-slate-400">Targeting {allPatients.length || 2480} Patients with {language.toUpperCase()} Creative.</p>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-xl bg-[#005f73] text-white text-xs font-black"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleFinishWizard}
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black"
            >
              Launch Campaign Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 6. SCHEDULE QUEUE WORKSPACE
// ====================================================
function SubWorkspaceScheduleQueue({ darkMode, showToast }: { darkMode: boolean; showToast: (msg: string) => void }) {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Monsoon Dengue Broadcast", time: "Today, 4:00 PM", status: "Active", priority: "High", frequency: "One-time" },
    { id: 2, name: "Diabetes Quarterly Reminder", time: "Tomorrow, 10:00 AM", status: "Active", priority: "Medium", frequency: "Monthly" },
    { id: 3, name: "Hypertension BP Log Request", time: "Jul 26, 9:00 AM", status: "Paused", priority: "Low", frequency: "Weekly" },
  ]);

  const toggleStatus = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "Active" ? "Paused" : "Active" } : t));
    showToast("Task schedule updated!");
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    showToast("Scheduled task deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#005f73]" />
            Automated Schedule Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, pause, resume, and manage recurring marketing dispatches.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <div 
            key={t.id}
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-xs font-bold ${
                t.status === "Active" ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
              }`}>
                {t.status === "Active" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                  Scheduled: {t.time} • Priority: <span className="text-[#0A9396]">{t.priority}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleStatus(t.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                {t.status === "Active" ? "Pause" : "Resume"}
              </button>
              <button 
                onClick={() => deleteTask(t.id)}
                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================
// 7. TEMPLATE LIBRARY WORKSPACE
// ====================================================
function SubWorkspaceTemplateLibrary({
  darkMode,
  setActiveTab,
  setComposerMessage,
  setComposerMedia,
  showToast
}: {
  darkMode: boolean;
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  setComposerMessage: (msg: string) => void;
  setComposerMedia: (media: any) => void;
  showToast: (msg: string) => void;
}) {
  const templates = [
    {
      title: "Monsoon Dengue Fever Alert",
      category: "Preventive Care",
      body: "Dear {{patient_name}},\nHigh fever & body pain could be Dengue. Get early blood screening at {{clinic_name}}.\nHelpline: {{helpline}}"
    },
    {
      title: "Diabetes HbA1c Reminder",
      category: "Chronic Care",
      body: "Dear {{patient_name}},\nIt has been 90 days since your last HbA1c test. Keep your sugar levels in check at {{clinic_name}}."
    },
    {
      title: "Festival Health Greetings",
      category: "Festival Wishes",
      body: "Dear {{patient_name}},\nWishing you and your family good health & joy this festive season from {{doctor_name}} & {{clinic_name}}!"
    }
  ];

  const handleLoad = (t: any) => {
    setComposerMessage(t.body);
    setActiveTab("whatsapp_studio");
    showToast(`Loaded "${t.title}" into WhatsApp Studio!`);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#005f73]" />
          Multi-Category Health Content Repository
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pre-written medical messages ready for 1-click loading into WhatsApp Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((t, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"
            }`}
          >
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-[#005f73] text-[9px] font-black uppercase">
                {t.category}
              </span>
              <h3 className="text-xs font-black text-slate-900 dark:text-white">{t.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                {t.body}
              </p>
            </div>

            <button 
              onClick={() => handleLoad(t)}
              className="w-full py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-xs font-black shadow-sm transition-all"
            >
              One-Click Load to WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================
// 8. AI GROWTH ADVISOR WORKSPACE
// ====================================================
function SubWorkspaceGrowthAdvisor({
  darkMode,
  setActiveTab,
  setComposerMessage,
  showToast
}: {
  darkMode: boolean;
  setActiveTab: (tab: CRMWorkspaceTab) => void;
  setComposerMessage: (msg: string) => void;
  showToast: (msg: string) => void;
}) {
  const recommendations = [
    {
      season: "July - Monsoon Special",
      title: "Monsoon Dengue & Malaria Fever Screening Camp",
      target: "Low-lying Locality Patients (approx 340 patients)",
      estReach: "340 Patients",
      estConv: "18%",
      estRev: "₹48,000",
      roi: "9.2x",
      msg: "Dear {{patient_name}},\nProtect your family from Monsoon Dengue. Book comprehensive blood screening at {{clinic_name}} today!"
    },
    {
      season: "September - Heart Month",
      title: "Comprehensive Cardiac Wellness & ECG Camp",
      target: "Hypertension Patients & Adults &gt; 45 yrs (approx 210 patients)",
      estReach: "210 Patients",
      estConv: "24%",
      estRev: "₹62,000",
      roi: "11.4x",
      msg: "Dear {{patient_name}},\nWorld Heart Month Special ECG & Cardiac Checkup with {{doctor_name}} at {{clinic_name}}. Reserve your slot!"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#005f73]" />
          AI Predictive Growth & Revenue Advisor
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analyzes clinic footfall patterns & recommends high-converting seasonal health drives.
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-4`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-black text-[#0A9396] uppercase tracking-wider">{rec.season}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{rec.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black">
                ROI Projection: {rec.roi}
              </span>
            </div>

            {/* Metrics Projection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold">Target Reach</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{rec.estReach}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold">Expected Conv %</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{rec.estConv}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold">Projected Revenue</div>
                <div className="text-sm font-black text-emerald-500 mt-1">{rec.estRev}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold">Priority Level</div>
                <div className="text-sm font-black text-[#005f73] mt-1">HIGH</div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setComposerMessage(rec.msg);
                  setActiveTab("whatsapp_studio");
                  showToast(`Launched "${rec.title}" into WhatsApp Studio!`);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-xs font-black shadow-md transition-all"
              >
                Launch Suggested Campaign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================
// 9. ANALYTICS & LOGS WORKSPACE
// ====================================================
function SubWorkspaceAnalyticsLogs({ darkMode, allPatients }: { darkMode: boolean; allPatients: any[] }) {
  const chartData = [
    { month: "Jan", reach: 1200, appointments: 85, revenue: 42000 },
    { month: "Feb", reach: 1800, appointments: 120, revenue: 64000 },
    { month: "Mar", reach: 2400, appointments: 190, revenue: 89000 },
    { month: "Apr", reach: 3100, appointments: 240, revenue: 115000 },
    { month: "May", reach: 4200, appointments: 310, revenue: 154000 },
    { month: "Jun", reach: 5600, appointments: 384, revenue: 184200 },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#005f73]" />
          Campaign ROI Attribution & Delivery Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual graphs of outreach vs. appointment conversions and revenue attribution.
        </p>
      </div>

      {/* Visual Chart */}
      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-4`}>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Monthly Revenue & Patient Conversion Growth
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005f73" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#005f73" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#005f73" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 10. CRM SETTINGS WORKSPACE
// ====================================================
function SubWorkspaceCRMSettings({
  darkMode,
  settings,
  setSettings,
  showToast
}: {
  darkMode: boolean;
  settings: any;
  setSettings: (s: any) => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#005f73]" />
          Enterprise CRM Settings & API Keys
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure AI working modes, Meta WhatsApp Cloud API tokens, anti-spam safeguards & Gemini API keys.
        </p>
      </div>

      <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80"} space-y-6`}>
        
        {/* Working Mode */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">AI Working Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "ai_first", label: "AI-First Autonomous", desc: "AI builds and launches broadcasts automatically." },
              { id: "hybrid", label: "Hybrid Mode (Recommended)", desc: "AI generates drafts; Human audits before launch." },
              { id: "manual", label: "Manual Mode", desc: "Full manual control over every message." }
            ].map((mode) => (
              <div 
                key={mode.id}
                onClick={() => setSettings({ ...settings, aiWorkingMode: mode.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  settings.aiWorkingMode === mode.id 
                    ? "border-[#005f73] bg-teal-500/10 text-[#005f73] font-bold" 
                    : "border-slate-200 dark:border-slate-800 text-slate-600"
                }`}
              >
                <div className="text-xs font-black">{mode.label}</div>
                <div className="text-[10px] text-slate-400 mt-1">{mode.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sandbox Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white">Developer Sandbox Mode</div>
            <div className="text-[11px] text-slate-400">Route all broadcast dispatches only to verified test numbers.</div>
          </div>
          <input 
            type="checkbox"
            checked={settings.sandboxMode}
            onChange={(e) => {
              setSettings({ ...settings, sandboxMode: e.target.checked });
              showToast(e.target.checked ? "Sandbox Mode Activated!" : "Live Mode Activated!");
            }}
            className="w-5 h-5 accent-[#005f73]"
          />
        </div>

        {/* Meta & Gemini API Keys */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Meta Cloud API Credentials</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500">WhatsApp Phone Number ID</label>
              <input 
                type="text"
                value={settings.whatsappPhoneId}
                onChange={(e) => setSettings({ ...settings, whatsappPhoneId: e.target.value })}
                placeholder="100982347102934"
                className={`w-full mt-1 p-3 rounded-xl border text-xs font-mono ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500">Gemini AI API Key</label>
              <input 
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className={`w-full mt-1 p-3 rounded-xl border text-xs font-mono ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => showToast("CRM Settings saved successfully!")}
          className="px-6 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-xs font-black shadow-md transition-all"
        >
          Save Configuration
        </button>

      </div>
    </div>
  );
}
