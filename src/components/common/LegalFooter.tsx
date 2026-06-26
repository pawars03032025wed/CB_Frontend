import React, { useState } from "react";
import { Shield, Scale, Mail, Info, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PrivacyPolicy from "../legal/PrivacyPolicy";
import TermsAndConditions from "../legal/TermsAndConditions";

interface LegalFooterProps {
  darkMode: boolean;
}

export default function LegalFooter({ darkMode }: LegalFooterProps) {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="mt-12 py-8 px-6 border-t border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/10 rounded-t-[2.5rem] tracking-wide">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Shield size={14} className="text-brand-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Enterprise Legal Compliance Core
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 leading-normal max-w-lg">
              CareBridge+ operates under sovereign medical privacy protocols. Diagnostic logs, outpatient databases, and referral indicators are monitored and encrypted using AES-256 AES-GCM standards. Bangalore, Karnataka Jurisdiction.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button 
                onClick={() => setActiveModal("privacy")}
                className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-brand-primary transition-colors flex items-center gap-1"
              >
                Privacy Policy <ExternalLink size={10} />
              </button>
              <button 
                onClick={() => setActiveModal("terms")}
                className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-[#0aa396] transition-colors flex items-center gap-1"
              >
                Terms of Service <ExternalLink size={10} />
              </button>
              <a 
                href="mailto:compliance@carebridge.plus"
                className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <Mail size={10} /> Support Desk
              </a>
            </div>

            <div className="p-3 bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 dark:border-white/5 rounded-xl flex items-start gap-2 max-w-md">
              <Info size={12} className="text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-gray-400 leading-relaxed">
                <span className="text-gray-500">Healthcare Disclaimer:</span> AI analytical outputs, digital vitals chimes, and reminders are advisory only. Final medical authorization rests solely with the registered doctor.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Shared Overlay Modals to keep session intact */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className={`relative w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${
                darkMode ? "bg-gray-950 border-white/10" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-3">
                  {activeModal === "privacy" ? (
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
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl bg-gray-150 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-750 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto index-0">
                {activeModal === "privacy" ? (
                  <PrivacyPolicyView />
                ) : (
                  <TermsAndConditionsView />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Minimalist inline views to prevent loading outer router assets inside the dashboard
function PrivacyPolicyView() {
  return (
    <div className="p-8 sm:p-12 space-y-6 text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
      <h4 className="text-base font-black text-gray-900 dark:text-white">Healthcare Privacy Policy Protocol</h4>
      <p>This comprehensive document defines secure procedures under Bangalore legal frameworks. All details are kept in zero-leak configurations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">1. Data Storage & Segregation</h5>
          <p>Every active patient vitals record is parsed in isolated blocks. No diagnostic or phone identifier data is linked to external ad trackers.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">2. AI health coach parameters</h5>
          <p>Our server-side Gemini API interfaces operate over a non-persistent, proxy network structure keeping patient identity unexposed.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">3. Active Notification opt-ins</h5>
          <p>Automated SMS, emails, and active WhatsApp referral timers utilize credentialed message gateways that support direct consent cancellation.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">4. Sovereign Jurisdiction</h5>
          <p>In accordance with global standard, files are archived for 7 medical audit years and fully purged subsequently on legal requests.</p>
        </div>
      </div>
    </div>
  );
}

function TermsAndConditionsView() {
  return (
    <div className="p-8 sm:p-12 space-y-6 text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
      <h4 className="text-base font-black text-gray-900 dark:text-white">Enterprise Terms of Use Regulation</h4>
      <p>Accepting this agreement is mandatory before operating CareBridge+ healthcare sandbox portals. All sessions are subject to access trace logging.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">1. Registered doctor responsibility</h5>
          <p>Clinical workspace users hold entire personal and official liability for medical records, OPD prescriptions, and diagnostic allocations.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">2. Diagnostic disclaimer</h5>
          <p>Vitals chimes, queue schedules, and AI analyses are workflow reference points. Clinicians must confirm diagnoses independently.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">3. Indian Jurisdiction Laws</h5>
          <p>CareBridge+ terms and agreements are subject to the exclusive jurisdiction ofcourts of Bangalore, Karnataka State, Republic of India.</p>
        </div>
        <div>
          <h5 className="font-black text-gray-700 dark:text-gray-200 uppercase mb-2">4. Account termination terms</h5>
          <p>We hold absolute privileges to freeze profiles showing consecutive failed authorization trials, illegal referral entries, or data scraping behaviour.</p>
        </div>
      </div>
    </div>
  );
}
