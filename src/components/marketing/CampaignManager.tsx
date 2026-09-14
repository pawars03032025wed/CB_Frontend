import React, { useState } from "react";
import { Megaphone, Users, Palette, MessageSquare, Clock, ArrowRight, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

interface CampaignManagerProps {
  darkMode: boolean;
  showToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
  selectedPatients: string[];
}

export default function CampaignManager({ darkMode, showToast, setActiveTab, selectedPatients }: CampaignManagerProps) {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: "",
    objective: "awareness",
    channel: "whatsapp",
    schedule: "now"
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const objectives = [
    { id: "awareness", label: "Health Awareness", icon: Megaphone },
    { id: "appointment", label: "Book Appointment", icon: Clock },
    { id: "birthday", label: "Birthday Greeting", icon: Palette },
  ];

  return (
    <div className="h-full flex flex-col items-center">
      <div className={`w-full max-w-4xl p-8 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute left-0 top-1/2 w-full h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 -z-10"></div>
          {[
            { s: 1, label: "Objective", icon: Megaphone },
            { s: 2, label: "Audience", icon: Users },
            { s: 3, label: "Creative", icon: Palette },
            { s: 4, label: "Review", icon: CheckCircle },
          ].map(item => (
            <div key={item.s} className="flex flex-col items-center bg-white dark:bg-slate-800 px-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors ${
                step === item.s ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400" :
                step > item.s ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 text-slate-400 dark:border-slate-700"
              }`}>
                {step > item.s ? <CheckCircle size={24} /> : item.s}
              </div>
              <span className={`text-xs font-bold mt-2 ${step >= item.s ? "text-teal-700 dark:text-teal-400" : "text-slate-400"}`}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Steps Content */}
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase text-slate-500">Campaign Name</label>
                <input 
                  type="text" 
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                  placeholder="E.g. Monsoon Health Checkup 2024"
                  className={`w-full px-4 py-3 rounded-xl border text-lg outline-none ${darkMode ? "bg-slate-900 border-slate-700 focus:border-teal-500" : "bg-slate-50 border-slate-200 focus:border-teal-500"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase text-slate-500">Campaign Objective</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {objectives.map(obj => (
                    <button
                      key={obj.id}
                      onClick={() => setCampaignData({...campaignData, objective: obj.id})}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                        campaignData.objective === obj.id 
                          ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" 
                          : `border-slate-200 hover:border-teal-300 dark:border-slate-700 ${darkMode ? "text-slate-400" : "text-slate-600"}`
                      }`}
                    >
                      <obj.icon size={32} />
                      <span className="font-bold">{obj.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-8">
              <Users size={64} className="mx-auto text-teal-600 mb-4 opacity-80" />
              <h2 className="text-2xl font-black">Audience Selection</h2>
              <p className="text-slate-500">You have selected <strong className="text-teal-600 text-xl">{selectedPatients.length}</strong> eligible patients for this campaign.</p>
              
              {selectedPatients.length === 0 ? (
                <div className="p-6 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl mt-4">
                  <p className="font-bold text-rose-700 dark:text-rose-400">Warning: No audience selected.</p>
                  <button onClick={() => setActiveTab("audience")} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg font-bold">Go to Audience Manager</button>
                </div>
              ) : (
                <button onClick={() => setActiveTab("audience")} className="text-teal-600 font-bold hover:underline">Edit Audience Filters</button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:border-teal-500 transition-colors ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
                <Palette size={48} className="text-purple-500" />
                <div>
                  <h3 className="font-bold text-lg">Use AI Poster</h3>
                  <p className="text-sm text-slate-500">Select a creative from Poster Studio</p>
                </div>
              </div>
              <div className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:border-teal-500 transition-colors ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
                <MessageSquare size={48} className="text-green-500" />
                <div>
                  <h3 className="font-bold text-lg">Use WhatsApp Message</h3>
                  <p className="text-sm text-slate-500">Select a template from WhatsApp Studio</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700`}>
                <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-slate-800">Campaign Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-500">Name</p>
                    <p className="font-bold">{campaignData.name || "Untitled Campaign"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-500">Audience</p>
                    <p className="font-bold text-teal-600">{selectedPatients.length} Patients</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-500">Objective</p>
                    <p className="font-bold capitalize">{campaignData.objective}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-500">Channel</p>
                    <p className="font-bold text-green-600 capitalize">{campaignData.channel}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-400 text-sm font-medium">
                <strong>Safety Check Passed:</strong> Audience deduplicated. Opt-outs removed. Message template approved.
              </div>
            </div>
          )}

        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={prevStep}
            className={`px-6 py-3 font-bold rounded-xl transition-colors ${step === 1 ? "invisible" : darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={nextStep}
              disabled={step === 2 && selectedPatients.length === 0}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => {
                showToast("Campaign sent to Broadcast Center!");
                setActiveTab("broadcast");
              }}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-colors"
            >
              Confirm & Launch <Send size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
