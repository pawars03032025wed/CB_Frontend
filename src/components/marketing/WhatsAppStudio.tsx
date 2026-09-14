import React, { useState } from "react";
import { MessageSquare, Phone, CheckCircle, Send, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppStudioProps {
  clinicDetails: any;
  user: any;
  darkMode: boolean;
  showToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function WhatsAppStudio({ clinicDetails, user, darkMode, showToast, setActiveTab }: WhatsAppStudioProps) {
  const [message, setMessage] = useState("Dear {{patient_name}},\n\nProtect your health this season! Book a complete health checkup at {{clinic_name}} today.\n\nCall {{helpline}} to book an appointment.");

  const previewMessage = message
    .replace(/{{patient_name}}/g, "John Doe")
    .replace(/{{clinic_name}}/g, user?.name || "CareBridge Clinic")
    .replace(/{{helpline}}/g, clinicDetails?.contact_no || user?.phone || "9876543210");

  const variables = ['{{patient_name}}', '{{clinic_name}}', '{{helpline}}', '{{appointment_date}}'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col h-full ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="text-green-500" /> WhatsApp Composer
        </h3>
        
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500">Message Content</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 w-full p-4 rounded-xl border outline-none resize-none mb-4 ${darkMode ? "bg-slate-900 border-slate-700 focus:border-green-500" : "bg-slate-50 border-slate-200 focus:border-green-500"}`}
          />

          <label className="block text-xs font-bold mb-2 uppercase text-slate-500">Dynamic Variables</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {variables.map(variable => (
              <button 
                key={variable}
                onClick={() => setMessage(prev => prev + " " + variable)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1 ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-700" : "bg-slate-100 border-slate-200 hover:bg-slate-200"}`}
              >
                <Plus size={12} /> {variable}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setActiveTab("campaign")}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-colors mt-auto"
        >
          Use in Campaign <Send size={20} />
        </button>
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm bg-cover bg-center flex items-center justify-center ${darkMode ? "border-slate-700" : "border-slate-200"}`} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          <div className="bg-[#075e54] text-white p-4 font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="leading-tight">John Doe</h4>
              <p className="text-[10px] text-white/80">Online</p>
            </div>
          </div>
          
          <div className="bg-[#e5ddd5] p-6 min-h-[400px] flex flex-col justify-end">
            <div className="bg-[#dcf8c6] text-slate-800 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[90%] self-end">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{previewMessage}</p>
              <p className="text-[10px] text-slate-500 text-right mt-2 flex items-center justify-end gap-1">
                12:00 PM <CheckCircle size={12} className="text-blue-500" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
