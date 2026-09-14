import React, { useState, useMemo } from "react";
import { 
  Megaphone, Image as ImageIcon, MessageSquare, 
  Users, Send, BarChart3, Sparkles, LayoutDashboard,
  FileText, Bot, ArrowRight, CheckCircle2, Eye,
  Upload, Type, Palette, Move, Phone, MapPin, Plus, Check, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Patient {
  name: string;
  phone: string;
  age?: string;
  gender?: string;
  address?: string;
  area?: string;
  disease?: string;
  diagnosis?: string;
  bp?: string;
  sugar?: string;
  department?: string;
  lastVisit?: string;
  complaint?: string;
}

export interface MarketingOutreachProps {
  allPatients?: Patient[];
  selectedPatients?: string[];
  setSelectedPatients?: (phones: string[]) => void;
  handleBulkSendWhatsApp?: (content: string, type: "card" | "tip" | "campaign") => Promise<void>;
  darkMode?: boolean;
  user?: any;
  clinicDetails?: any;
  openWhatsAppPreview?: (
    phone: string,
    initialMessage: string,
    title: string,
    patientName: string,
    type: string,
    meta?: any
  ) => void;
}

type Tab = 
  | "home" 
  | "create_poster" 
  | "create_message" 
  | "library" 
  | "broadcast" 
  | "analytics" 
  | "ai_adviser";

export default function MarketingOutreach({
  allPatients = [],
  darkMode = false,
  user,
  clinicDetails,
}: MarketingOutreachProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shared state for the broadcast flow
  const [selectedBroadcastItem, setSelectedBroadcastItem] = useState<{type: 'poster' | 'message', content: any} | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navItems = [
    { id: "home", icon: LayoutDashboard, label: "Marketing Home" },
    { id: "create_poster", icon: ImageIcon, label: "Create Poster" },
    { id: "create_message", icon: MessageSquare, label: "Create Message" },
    { id: "library", icon: FileText, label: "My Library" },
    { id: "broadcast", icon: Send, label: "Broadcast" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "ai_adviser", icon: Bot, label: "AI Adviser" },
  ];

  return (
    <div className={`flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden font-sans ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium ${
              darkMode ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-slate-900 border border-slate-100"
            }`}
          >
            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
            <p className="text-sm">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <div className={`w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="p-4 md:p-6 hidden md:block">
          <h2 className="text-xl font-black tracking-tight text-teal-600 dark:text-teal-400">
            Marketing Outreach
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Create, Target & Grow Your Clinic
          </p>
        </div>
        <nav className="flex md:flex-col gap-2 md:gap-0 px-4 py-3 md:py-0 md:space-y-1.5 md:mt-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 shadow-sm border border-teal-100 dark:border-teal-500/20"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 md:w-[18px] md:h-[18px] ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === "home" && (
            <MarketingHome 
              setActiveTab={setActiveTab} 
              darkMode={darkMode} 
            />
          )}
          {activeTab === "create_poster" && (
            <CreatePoster 
              setActiveTab={setActiveTab} 
              darkMode={darkMode}
              clinicDetails={clinicDetails}
              user={user}
              showToast={showToast}
            />
          )}
          {activeTab === "create_message" && (
            <CreateMessage 
              setActiveTab={setActiveTab} 
              darkMode={darkMode}
              clinicDetails={clinicDetails}
              user={user}
              showToast={showToast}
            />
          )}
          {activeTab === "library" && (
            <Library 
              setActiveTab={setActiveTab} 
              darkMode={darkMode}
              setSelectedBroadcastItem={setSelectedBroadcastItem}
            />
          )}
          {activeTab === "broadcast" && (
            <Broadcast 
              setActiveTab={setActiveTab} 
              darkMode={darkMode}
              allPatients={allPatients}
              selectedBroadcastItem={selectedBroadcastItem}
              showToast={showToast}
            />
          )}
          {activeTab === "analytics" && (
            <Analytics darkMode={darkMode} />
          )}
          {activeTab === "ai_adviser" && (
            <AIAdviser 
              setActiveTab={setActiveTab} 
              darkMode={darkMode} 
              allPatients={allPatients}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function MarketingHome({ setActiveTab, darkMode }: { setActiveTab: any, darkMode: boolean }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Marketing Outreach</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create, Target & Grow Your Clinic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setActiveTab('create_poster')}
          className={`p-6 rounded-3xl border text-left transition-all hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CREATE POSTER</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Create a clinic poster using your photo or AI.</p>
        </button>

        <button 
          onClick={() => setActiveTab('create_message')}
          className={`p-6 rounded-3xl border text-left transition-all hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CREATE MESSAGE</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Create a professional patient message with AI.</p>
        </button>

        <button 
          onClick={() => setActiveTab('ai_adviser')}
          className={`p-6 rounded-3xl border text-left transition-all hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ASK AI ADVISER</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Get marketing ideas based on your patient audience.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Campaigns</h3>
            <button onClick={() => setActiveTab('analytics')} className="text-sm text-teal-600 font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { title: "Dengue Awareness", patients: 790, read: 620, replies: 84 },
              { title: "Diabetes Follow-up", patients: 120, read: 95, replies: 12 },
            ].map((camp, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{camp.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{camp.patients} Patients • {camp.read} Read</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-teal-600 dark:text-teal-400">{camp.replies} Replies</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">AI Suggestion</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-6 leading-relaxed">
            "Your clinic can run a <strong>Women's Health</strong> campaign this week. You have 340 eligible female patients between 18-40."
          </p>
          <button 
            onClick={() => setActiveTab('ai_adviser')}
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            CREATE CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatePoster({ setActiveTab, darkMode, clinicDetails, user, showToast }: any) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'photo' | 'ai' | null>(null);
  const [prompt, setPrompt] = useState("");
  
  // Editor State
  const docName = clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName || "Dr. Rajesh Kulkarni";
  const cliName = user?.name || user?.displayName || clinicDetails?.clinicName || "CareBridge Clinic";
  const contact = clinicDetails?.contact_no || clinicDetails?.phone || "+91 98220 12345";
  const address = clinicDetails?.address || "MG Road, Pune";

  if (step === 1) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto py-12">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">How do you want to create your poster?</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => { setMethod('photo'); setStep(3); }} className={`p-8 rounded-3xl border text-center transition-all hover:border-teal-500 hover:shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 mx-auto flex items-center justify-center mb-6">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">USE MY PHOTO</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upload a clinic photo or existing promotional image.</p>
          </button>
          <button onClick={() => { setMethod('ai'); setStep(2); }} className={`p-8 rounded-3xl border text-center transition-all hover:border-purple-500 hover:shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 mx-auto flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CREATE WITH AI</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Describe what you want and AI will generate it.</p>
          </button>
        </div>
      </div>
    );
  }

  if (step === 2 && method === 'ai') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">What kind of poster?</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Type in Marathi, Hindi, or English.</p>
        
        <textarea 
          className={`w-full p-4 rounded-2xl border min-h-[150px] resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none mb-6 font-medium ${darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
          placeholder="e.g., Create a premium Marathi Dengue Awareness poster for my clinic. Include prevention information."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              showToast("AI is generating your poster...");
              setTimeout(() => setStep(3), 1500);
            }} 
            className="px-6 py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Generate Poster
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Simple Editor
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Simple Poster Editor</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => showToast("Saved to My Library!")} className="px-5 py-2.5 rounded-xl font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors">
            SAVE TO LIBRARY
          </button>
          <button onClick={() => setActiveTab('broadcast')} className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors">
            BROADCAST
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Editor Toolbar */}
        <div className={`w-full lg:w-64 flex-shrink-0 p-4 rounded-3xl border overflow-y-auto ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Edit Options</h3>
          <div className="space-y-2">
            {[
              { icon: Palette, label: "Background" },
              { icon: Type, label: "Text" },
              { icon: ImageIcon, label: "Logo & Images" },
              { icon: Users, label: "Doctor Details" },
              { icon: MapPin, label: "Clinic Address" },
            ].map((tool, i) => (
              <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
                <tool.icon className="w-4 h-4" />
                {tool.label}
              </button>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10">
            <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-2">Clinic Info Loaded</h4>
            <div className="text-[11px] font-medium text-teal-600 dark:text-teal-400 space-y-1">
              <p>{docName}</p>
              <p>{cliName}</p>
              <p>{contact}</p>
            </div>
            <p className="text-[10px] text-teal-500 mt-2 opacity-80 italic">Changes here only affect this poster.</p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className={`flex-1 rounded-3xl border flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950 overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Mock Canvas */}
          <div className="w-[400px] h-[500px] bg-gradient-to-br from-teal-800 to-slate-900 rounded-lg shadow-2xl relative flex flex-col justify-between p-8 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black mb-1">{cliName}</h2>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-teal-300">Speciality Care</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-900 font-bold text-xs">LOGO</div>
            </div>

            <div className="relative z-10 text-center">
              <h1 className="text-4xl font-black mb-4 leading-tight">Monsoon Health<br/>Checkup</h1>
              <p className="text-sm font-medium opacity-90 max-w-[250px] mx-auto">Protect your family from Dengue, Malaria, and viral fevers today.</p>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <p className="font-bold">{docName}</p>
              <p className="text-xs opacity-90 mb-2">{address}</p>
              <div className="flex items-center gap-2 text-sm font-black text-teal-300">
                <Phone className="w-4 h-4" /> {contact}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateMessage({ setActiveTab, darkMode, clinicDetails, user, showToast }: any) {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");

  const docName = clinicDetails?.doctor_name || clinicDetails?.doctorName || user?.displayName || "Dr. Rajesh";
  const cliName = user?.name || user?.displayName || clinicDetails?.clinicName || "CareBridge Clinic";
  const contact = clinicDetails?.contact_no || clinicDetails?.phone || "+91 98220 12345";

  const handleGenerate = () => {
    showToast("AI is writing your message...");
    setTimeout(() => {
      setMessage(`Dear {{Patient Name}},\n\nDengue cases are increasing during the monsoon season. Take precautions and consult us immediately if you experience persistent fever, body ache, or weakness.\n\nStay Safe,\n${docName}\n${cliName}\n\nAppointments: ${contact}`);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create WhatsApp Message</h1>
        {step === 2 && (
          <div className="flex items-center gap-3">
             <button onClick={() => showToast("Saved to My Library!")} className="px-5 py-2.5 rounded-xl font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors">
              SAVE TO LIBRARY
            </button>
            <button onClick={() => setActiveTab('broadcast')} className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors">
              BROADCAST
            </button>
          </div>
        )}
      </div>

      <div className={`p-8 rounded-3xl border mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What message do you want?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">Describe the topic (e.g. Dengue Awareness, Clinic Holiday, Health Checkup).</p>
        
        <textarea 
          className={`w-full p-4 rounded-2xl border min-h-[120px] resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none mb-4 font-medium ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
          placeholder="Create a professional Marathi WhatsApp message about Dengue Awareness for my clinic."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleGenerate}
          className="px-6 py-3 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Message
        </button>
      </div>

      {step === 2 && (
        <div className={`p-8 rounded-3xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Message</h2>
          <textarea 
            className={`w-full p-4 rounded-2xl border min-h-[220px] resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex items-center gap-2 mt-4 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            Clinic details automatically added. Ready for broadcast.
          </div>
        </div>
      )}
    </div>
  );
}

function Library({ setActiveTab, darkMode, setSelectedBroadcastItem }: any) {
  const [tab, setTab] = useState<'posters' | 'messages'>('posters');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col py-4">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">My Library</h1>
      
      <div className="flex items-center gap-2 mb-8">
        <button 
          onClick={() => setTab('posters')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${tab === 'posters' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          POSTERS
        </button>
        <button 
          onClick={() => setTab('messages')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${tab === 'messages' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          MESSAGES
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tab === 'posters' ? (
          [1, 2, 3].map((item) => (
            <div key={item} className={`p-4 rounded-3xl border group transition-all hover:shadow-lg hover:border-teal-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-bold uppercase tracking-wider">Preview</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Monsoon Camp Poster</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">12 Sep 2026</p>
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">EDIT</button>
                <button 
                  onClick={() => { setSelectedBroadcastItem({type: 'poster', content: item}); setActiveTab('broadcast'); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  BROADCAST
                </button>
              </div>
            </div>
          ))
        ) : (
          [1, 2].map((item) => (
            <div key={item} className={`p-6 rounded-3xl border group transition-all hover:shadow-lg hover:border-teal-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Dengue Alert</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">10 Sep 2026</p>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                Dear {'{{Patient Name}}'},\nDengue cases are increasing. Take precautions and visit us...
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">EDIT</button>
                <button 
                  onClick={() => { setSelectedBroadcastItem({type: 'message', content: item}); setActiveTab('broadcast'); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  BROADCAST
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Broadcast({ setActiveTab, darkMode, allPatients = [], selectedBroadcastItem, showToast }: any) {
  const [step, setStep] = useState(1);
  const [filterGender, setFilterGender] = useState('All');
  const [filterAge, setFilterAge] = useState('All');
  const [isSending, setIsSending] = useState(false);

  // Simple mock targeting logic
  const matchedPatients = useMemo(() => {
    let list = [...allPatients];
    if (filterGender !== 'All') {
      list = list.filter(p => (p.gender || '').toLowerCase() === filterGender.toLowerCase());
    }
    return list;
  }, [allPatients, filterGender]);

  const maxLimit = 1000;
  const eligibleCount = Math.min(matchedPatients.length || 790, maxLimit);
  const isOverLimit = (matchedPatients.length || 790) > maxLimit;

  const handleBroadcast = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast("Broadcast Started Successfully!");
      setActiveTab('analytics');
    }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto h-full flex flex-col py-6">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Broadcast Campaign</h1>
      
      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`text-sm font-bold ${step >= 1 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>1. Target Patients</div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`text-sm font-bold ${step >= 2 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>2. Review & Send</div>
      </div>

      {step === 1 && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Patients</h2>
            
            <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Gender</label>
              <div className="flex flex-wrap gap-3">
                {['All', 'Female', 'Male'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setFilterGender(opt)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${filterGender === opt ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 mt-8">Age Group</label>
              <div className="flex flex-wrap gap-3">
                {['All', '18-40', '40-60', '60+'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setFilterAge(opt)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${filterAge === opt ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 mt-8">Location (Optional)</label>
              <input type="text" placeholder="e.g. Pune" className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
            </div>
          </div>

          <div>
             <div className={`p-8 rounded-3xl border sticky top-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Matching Patients</h3>
                <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{matchedPatients.length || 790}</div>
                <div className="text-sm font-medium text-emerald-600 mb-8">{eligibleCount} Eligible for WhatsApp</div>

                {isOverLimit && (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 text-sm font-bold mb-6">
                    Maximum 1,000 patients per broadcast. Please refine your audience.
                  </div>
                )}

                <button 
                  disabled={isOverLimit || eligibleCount === 0}
                  onClick={() => setStep(2)}
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                    isOverLimit || eligibleCount === 0 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-md'
                  }`}
                >
                  ADD TO BROADCAST
                </button>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 max-w-2xl mx-auto w-full py-8">
           <div className={`p-8 rounded-3xl border mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">Ready to Broadcast?</h2>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Audience</span>
                  <span className="font-black text-slate-900 dark:text-white">{eligibleCount} Patients</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Content</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedBroadcastItem?.type === 'poster' ? 'Campaign Poster' : 'WhatsApp Message'}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Channel</span>
                  <span className="font-black text-emerald-600">WhatsApp API</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  BACK
                </button>
                <button 
                  onClick={handleBroadcast}
                  disabled={isSending}
                  className="flex-[2] py-4 rounded-xl font-black text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>CONFIRM & BROADCAST</>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function Analytics({ darkMode }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Campaign Results</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Sent", value: "2,450" },
          { label: "Total Delivered", value: "2,390" },
          { label: "Total Read", value: "1,840" },
          { label: "Total Replies", value: "215" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-sm font-bold text-slate-500 mb-2">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Campaign History</h2>
      <div className="space-y-4">
        {[
          { name: "Dengue Awareness", date: "12 Sep 2026", sent: 790, delivered: 765, read: 620, replies: 84 },
          { name: "Diwali Health Checkup", date: "24 Oct 2025", sent: 950, delivered: 940, read: 810, replies: 102 },
        ].map((camp, i) => (
          <div key={i} className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-teal-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{camp.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{camp.date} • {camp.sent} Patients</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-xl font-black text-slate-900 dark:text-white">{camp.delivered}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-slate-900 dark:text-white">{camp.read}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Read</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-teal-600 dark:text-teal-400">{camp.replies}</div>
                <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-1">Replies</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAdviser({ setActiveTab, darkMode }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">AI Marketing Adviser</h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Smart recommendations based on your patient audience.</p>

      <div className={`p-8 rounded-3xl border bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 mb-10 ${darkMode ? 'border-purple-900/30' : 'border-purple-100'}`}>
        <h2 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">Top Recommendation</h2>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6">"Women's Health Awareness"</h3>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300">
            Suggested Audience: Female, 18-40
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300">
            Channel: WhatsApp
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('create_poster')}
          className="px-8 py-4 rounded-xl font-black text-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
        >
          CREATE THIS CAMPAIGN
        </button>
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">More Marketing Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Dengue Awareness", desc: "Good for monsoon season. Target all patients." },
          { title: "Diabetes Management", desc: "Target patients aged 40+ for regular screening." },
          { title: "Pediatric Vaccination", desc: "Reminders for seasonal boosters." },
          { title: "Clinic Health Check-up", desc: "Promote preventive care to returning patients." }
        ].map((idea, i) => (
          <div key={i} className={`p-6 rounded-3xl border transition-all hover:border-purple-500 hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{idea.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">{idea.desc}</p>
            <button 
              onClick={() => setActiveTab('create_message')}
              className="text-sm font-bold text-purple-600 hover:underline"
            >
              Use this idea
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
