import React from "react";
import { Users, Send, CheckCircle, Activity, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  allPatients: any[];
  darkMode: boolean;
}

export default function Dashboard({ setActiveTab, allPatients, darkMode }: DashboardProps) {
  const kpiCards = [
    { title: "Total Audience", value: allPatients?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Active Campaigns", value: 3, icon: Activity, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "WhatsApp Sent", value: "1,248", icon: Send, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Appointments Gen", value: 39, icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30" },
    { title: "Replies", value: 126, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Conversion Rate", value: "3.8%", icon: Activity, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* AI Command Bar */}
      <div className={`p-4 rounded-2xl shadow-sm border flex items-center gap-4 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <Activity size={20} />
        </div>
        <input 
          type="text" 
          placeholder="What would you like to create? (e.g., 'Create a Dengue awareness poster')" 
          className={`flex-1 bg-transparent border-none outline-none text-lg font-medium ${darkMode ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
        />
        <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors">
          Ask AI
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {kpi.title}
            </p>
            <h3 className="text-2xl font-black mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Create AI Poster", tab: "poster", bg: "bg-blue-600" },
          { label: "Create AI Image", tab: "image", bg: "bg-indigo-600" },
          { label: "Create WhatsApp", tab: "whatsapp", bg: "bg-green-600" },
          { label: "Create Campaign", tab: "campaign", bg: "bg-teal-600" }
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(action.tab)}
            className={`${action.bg} hover:brightness-110 text-white p-6 rounded-2xl font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center gap-2`}
          >
            {action.label}
            <ArrowRight size={20} className="opacity-70" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className="text-lg font-bold mb-4">Active Campaigns</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50"}`}>
              <div>
                <h4 className="font-bold">Monsoon Health Checkup</h4>
                <p className="text-sm text-slate-500">WhatsApp • 1,248 Contacts</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-1">Running</span>
                <p className="text-xs text-slate-500">45% delivered</p>
              </div>
            </div>
            {/* Add more active campaigns here */}
            <button className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View all campaigns <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h3 className="text-lg font-bold mb-4">AI Growth Recommendations</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border border-teal-100 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800 flex items-start gap-3`}>
              <div className="mt-0.5 text-teal-600">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="font-bold text-teal-900 dark:text-teal-300">Monsoon Season Approaching</h4>
                <p className="text-sm text-teal-700 dark:text-teal-400 mt-1 mb-2">Patients over 50 haven't received a flu checkup reminder this year.</p>
                <button className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold">Generate Campaign</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
}
