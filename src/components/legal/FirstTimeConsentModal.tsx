import React, { useState } from "react";
import { 
  Shield, Check, Bell, MessageSquare, AlertTriangle, 
  HelpCircle, ChevronRight, FileText, Scale, Sparkles, Eye, X
} from "lucide-react";
import { firebaseService } from "../../services/firebaseService";
import { motion, AnimatePresence } from "motion/react";

interface FirstTimeConsentModalProps {
  userId: string;
  onConsentAccepted: (updatedUserFields: any) => void;
  darkMode: boolean;
}

export default function FirstTimeConsentModal({ userId, onConsentAccepted, darkMode }: FirstTimeConsentModalProps) {
  const [showDetailedPolicies, setShowDetailedPolicies] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  const [notificationsConsent, setNotificationsConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [agreedAll, setAgreedAll] = useState(false);
  const [hasReadPolicies, setHasReadPolicies] = useState(false);
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "ai" | "notif">("privacy");

  const handleAccept = async () => {
    if (!agreedAll) return;
    setLoading(true);
    try {
      const consentFields = {
        consentAcceptedAt: new Date().toISOString(),
        consentDetail: {
          privacy: true,
          terms: true,
          ai_use: true,
          whatsappConsent,
          notificationsConsent,
        },
        whatsappConsent,
        notificationsConsent,
      };

      await firebaseService.updateDocument("users", userId, consentFields);
      onConsentAccepted(consentFields);
    } catch (err) {
      console.error("Error saving consent timestamp:", err);
    } finally {
      setLoading(false);
    }
  };

  const policyTabs = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={16} className="text-blue-500" />,
      summary: "Patient records, clinical indicators, and referrals are fully encrypted at rest and in transit via bank-level AES-256 standards with no external sharing.",
      details: "Our Privacy Policy lays down protocols for DISHA & ABDM compliance. We encrypt clinical telemetry and do not authorize public query scraping. Patient details are stored in isolated document structures accessible page-wise under strict role access authorizations."
    },
    terms: {
      title: "Terms of Use",
      icon: <Scale size={16} className="text-teal-500" />,
      summary: "Qualified doctors hold professional medical liability. CareBridge+ is purely a medical workflow coordination platform.",
      details: "Our platform terms hold clinical practitioners fully liable for the accuracy of outpatient prescriptions and diagnostic transfers. Operating is subject to sovereign rules of the Republic of India under strict jurisdiction of courts in Bangalore, Karnataka."
    },
    ai: {
      title: "AI Advisory Disclaimer",
      icon: <Sparkles size={16} className="text-purple-500" />,
      summary: "AI Assist advice is advisory only. Clinicians maintain final clinical override authority.",
      details: "Our AI Health Coach processes clinical inputs in a read-only, non-persistent, and isolated manner. These are support assets for clinician reference. AI tips do not override a trained medical specialist's objective diagnosis."
    },
    notif: {
      title: "Notifications & WhatsApp",
      icon: <Bell size={16} className="text-orange-500" />,
      summary: "Receive real-time referral progress, clinical alarm chime logs, and medical alert timers.",
      details: "By opting into messaging channels, you authorise automated digital reminders for booking confirmations and diagnostic queues. You hold authority to change notifications preferences or mute WhatsApp alerts via Settings menus."
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-md" />

      {/* Main container */}
      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className={`relative w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border overflow-hidden p-5 sm:p-8 md:p-10 flex flex-col ${
          darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        {/* Sticky Header info */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 shrink-0 text-left">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand-primary uppercase block">ENTERPRISE COMPLIANCE SETUP</span>
            <h2 className="text-base sm:text-2xl font-black leading-tight">Your healthcare data privacy matters.</h2>
          </div>
        </div>

        {/* Scrollable Container Content */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-6 mb-4 sm:mb-6 text-left scrollbar-thin">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
            Before taking access inside the CareBridge+ secure sandbox portal, please review and accept our corporate policies. This ensures that clinical environments meet global guidelines.
          </p>

          {/* Dynamic policy summary blocks */}
          <div className="space-y-3">
            {(Object.keys(policyTabs) as Array<keyof typeof policyTabs>).map((key) => {
              const tab = policyTabs[key];
              return (
                <div 
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    activeTab === key 
                      ? "bg-brand-primary/5 border-brand-primary/25" 
                      : "bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <h4 className="text-xs font-black uppercase tracking-wider">{tab.title}</h4>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-150 dark:bg-white/10 px-2.5 py-0.5 rounded-full ml-auto uppercase shrink-0">Review Summary</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {tab.summary}
                  </p>
                  {activeTab === key && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-400 font-bold leading-relaxed"
                    >
                      {tab.details}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Consents toggles */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-white/5">
            <label className="flex-1 flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={whatsappConsent}
                onChange={(e) => setWhatsappConsent(e.target.checked)}
                className="peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-white/20 checked:bg-brand-primary checked:border-brand-primary"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">WhatsApp Updates</span>
                <span className="text-[10px] font-bold text-gray-500 mt-0.5">Automated referral alerts</span>
              </div>
            </label>

            <label className="flex-1 flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={notificationsConsent}
                onChange={(e) => setNotificationsConsent(e.target.checked)}
                className="peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-white/20 checked:bg-brand-primary checked:border-brand-primary"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">Portal Notifications</span>
                <span className="text-[10px] font-bold text-gray-500 mt-0.5">Live clinical chime alerts</span>
              </div>
            </label>
          </div>

          {/* Core Check */}
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input 
              type="checkbox"
              checked={agreedAll}
              onChange={(e) => setAgreedAll(e.target.checked)}
              className="peer h-5 w-5 mt-0.5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-gray-300 dark:border-white/20 checked:bg-brand-primary checked:border-brand-primary"
            />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-brand-primary leading-normal text-left">
              I certify that I am an authorised medical workspace user and I agree to retrieve personal patient records strictly under DISHA, ABDM & legal compliance rules.
            </span>
          </label>
        </div>

        {/* Sticky Action Panel Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/5 shrink-0">
          <button 
            type="button"
            onClick={() => setShowDetailedPolicies(true)}
            className="text-xs font-black uppercase tracking-widest text-[#005f73] dark:text-[#0a9396] hover:underline"
          >
            Read Detailed Policies
          </button>

          <button 
            onClick={handleAccept}
            disabled={loading || !agreedAll}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-brand-primary text-white font-black text-xs uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-brand-primary/10 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Registering Legal Stamp..." : "Accept & Continue"}
            <Check size={16} />
          </button>
        </div>
      </motion.div>

      {/* Detailed view Modal inside Modal */}
      <AnimatePresence>
        {showDetailedPolicies && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`relative w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 overflow-hidden flex flex-col ${
                darkMode ? "bg-gray-900 border border-white/10 text-white" : "bg-white border border-gray-100 text-gray-900"
              }`}
            >
              {/* Sticky header inside modal */}
              <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-gray-100 dark:border-white/5 shrink-0 text-left">
                <div className="flex items-center gap-3">
                  <FileText className="text-brand-primary shrink-0" size={22} />
                  <h3 className="text-base sm:text-xl font-black">CareBridge+ Core Regulations Manual</h3>
                </div>
                <button 
                  onClick={() => setShowDetailedPolicies(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable scroll space */}
              <div className="space-y-5 sm:space-y-6 flex-1 overflow-y-auto py-4 sm:py-6 pr-1 sm:pr-2 text-left scrollbar-thin">
                <div className="p-3.5 sm:p-4 bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20 rounded-2xl flex gap-3 text-xs font-bold leading-relaxed">
                  <AlertTriangle className="shrink-0" size={18} />
                  <span>The following text contains the full corporate security disclaimers, doctor liability terms, user rights, and Indian jurisdiction references. Please read thoroughly.</span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black uppercase text-brand-primary">1. PRIVACY PROTOCOL SUMMARY</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                    Under standard clinical rules, patient logs, vitals indicators (blood pressure, sugar index), and consultation prescriptions are held strictly confidential. Database registers prevent unauthenticated access. We deny telemetry routing to unapproved cloud networks.
                  </p>
                  
                  <h4 className="text-xs sm:text-sm font-black uppercase text-brand-primary">2. WORKSPACE OPERATOR OBLIGATIONS</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                    Referrals coordinations are shared purely over secure TLS models. The hospital receptionist or doctor maintains final liability for the correctness of cash credits, diagnostic queues, and patient condition data.
                  </p>

                  <h4 className="text-xs sm:text-sm font-black uppercase text-brand-primary">3. INTELLIGENT HEALTH AI OVERRIDE</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                    Users recognize that the AI Health Coach operates server-side via secured Gemini API handlers. Tips are informational suggestions. No diagnostics are automatically registered without direct medical authorization.
                  </p>

                  <h4 className="text-xs sm:text-sm font-black uppercase text-brand-primary">4. INDIAN SOVEREIGN COURT REFERENCE</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                    Disputes, breach trials, and subscription claims are subject to Karnataka State and Bangalore Court Competence chambers under standard information legislation acts.
                  </p>
                </div>
              </div>

              {/* Sticky bottom button */}
              <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-white/5 shrink-0 flex justify-end">
                <button 
                  onClick={() => setShowDetailedPolicies(false)}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Close Regulation View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
