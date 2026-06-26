import React, { useState, useMemo, useEffect } from "react";
import { 
  Shield, Search, Lock, Bell, Database, Filter,
  FileText, ClipboardList, ChevronRight, ArrowLeft, Mail, 
  Phone, Globe, Stethoscope, UserCheck, Eye, Sparkles, AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

export default function PrivacyPolicy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("intro");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const sections: Section[] = [
    {
      id: "intro",
      title: "Introduction",
      icon: <Globe size={18} />,
      content: "Welcome to CareBridge Plus Technologies Inc. ('CareBridge+'). We are committed to protecting the privacy, confidentiality, and security of all Personal Identifiable Information (PII) and Protected Health Information (PHI) processed through our SaaS web application. This comprehensive Privacy Policy defines our legal procedures under federal healthcare guidelines, defining how your files, clinical vitals, and system access logs are secured and audited."
    },
    {
      id: "data-collection",
      title: "Data Collection",
      icon: <Database size={18} />,
      content: "CareBridge+ collects data essential for healthcare operations. This includes personal identification elements (names, contact numbers, email addresses, and location identifiers) and operational metrics. We strictly segregate and store PII using isolated database configurations, ensuring compliance with global identity governance and zero-tolerance database injection standards."
    },
    {
      id: "patient-usage",
      title: "Patient Information Usage",
      icon: <UserCheck size={18} />,
      content: "Patient records are utilized exclusively to coordinate medical referrals, map clinical indicators, and streamline diagnostics. Under no circumstances is patient information sold, shared for marketing purposes, or processed by unauthorized third-party telemetry systems. Access is restricted strictly to qualified healthcare workspace users who possess explicit consent."
    },
    {
      id: "prescriptions",
      title: "Prescription & Medical Data",
      icon: <Stethoscope size={18} />,
      content: "All electronic prescriptions, active pharmaceutical ingredient logs, and historical diagnostic reports are encrypted at transition and rest using AES-256 standard protocols. Medical data is categorized as clinical-restrictive and is accessible only to credentialed practitioners directly involved in the patient's treatment line."
    },
    {
      id: "ai-coach",
      title: "AI Health Coach Data Usage",
      icon: <Sparkles size={18} />,
      content: "Our AI Health Coach analyzes structured vitals, medication logs, and patient inquiries on a real-time, non-persistent, read-only basis. All underlying LLM operations are managed server-side via secured proxy routers to prevent credentials or customer PII leaks. Standard telemetry inputs are completely anonymized before generating health assistance advices."
    },
    {
      id: "billing",
      title: "Appointment & Billing Records",
      icon: <FileText size={18} />,
      content: "Financial records, invoice calculations, transactional ledger details, and general outpatient (OPD) queue history are persisted for account balance audits and legal compliance. Transaction processing utilizes highly secured payment provider structures. Stripe and bank integrations operate fully server-side with zero direct local storage on client browsers."
    },
    {
      id: "referral-handling",
      title: "Referral Data Handling",
      icon: <ChevronRight size={18} />,
      content: "The CareBridge+ referral engine synchronizes clinical transfer metrics between clinics and hospitals. Patients' conditions, initial diagnoses, and contact paths are shared strictly over verified SSL/TLS channels with the receiving healthcare facility's board-approved coordinators, ensuring zero leakage during transit."
    },
    {
      id: "whatsapp-comms",
      title: "WhatsApp & Notification Consent",
      icon: <Bell size={18} />,
      content: "Users may opt-in to retrieve updates via automated SMS, emails, or official CareBridge+ WhatsApp integration channels. Notification preferences control the delivery of diagnostic reports, active medication chimes, and appointment confirmations. Notification consent can be revoked at any time via the User settings dashboard."
    },
    {
      id: "firebase-storage",
      title: "Firebase Cloud Security",
      icon: <Shield size={18} />,
      content: "CareBridge+ leverages Google Cloud-hosted Firebase databases. Document rules prevent unauthenticated readers from accessing private nodes. All document reads require verified authentication tokens, restricting profile-specific directories to authorized stakeholders. We actively model zero-trust policies database architectures."
    },
    {
      id: "role-visibility",
      title: "Role-Based Data Visibility",
      icon: <Eye size={18} />,
      content: "Access to CareBridge+ is restricted via rigid Role-Based Access Control (RBAC). Patients can only view their own vitals and reports. Clinicians and receptionists assess active records only within their registered hospitals or clinics. System administrators govern global platform integrity without viewing private patient records."
    },
    {
      id: "retention",
      title: "Data Retention Policy",
      icon: <Lock size={18} />,
      content: "Diagnostic reports and electronic health summaries are retained for a minimum of 7 years in accordance with sovereign healthcare records preservation acts and standard corporate audit codes. Data is permanently, securely purged using DoD-standard overwrites upon explicit deletion orders or legal account termination."
    },
    {
      id: "user-rights",
      title: "User Rights & Data Correction",
      icon: <ClipboardList size={18} />,
      content: "You hold absolute rights to inspect, download a copy of, and correct errors in your healthcare files or workspace profile details. Rectification can be initiated directly by accessing properties menus, or by raising a certified support query to your hospital administrator or CareBridge+ legal desk."
    },
    {
      id: "acc-security",
      title: "Account Security",
      icon: <Shield size={18} />,
      content: "Workspace workspace managers are solely responsible for protecting their access credentials. We enforce strict session timings, multi-factor tokens, blockages on consecutive invalid trials, and regular automated diagnostic audits. Any identified breach threat is logged, prompting instant account lockouts."
    },
    {
      id: "contact-support",
      title: "Contact & Support",
      icon: <Mail size={18} />,
      content: "For compliance inquiries, privacy data audits, or support coordination requests, reach out directly to the CareBridge+ Corporate Legal Division at: compliance@carebridge.plus or dial +1 (800) BRIDGE-CARE. We address verified corporate requests within 48 business hours."
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      
      {/* Mini Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
            </button>
            <Logo />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-500/20">
              <Shield size={12} /> ENTERPRISE COMPLIANCE
            </span>
            <button 
              onClick={() => {
                setDarkMode(!darkMode);
                localStorage.setItem("darkMode", String(!darkMode));
              }}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-black uppercase tracking-wider"
            >
              {darkMode ? "☼ LIGHT" : "🌙 DARK"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-brand-primary dark:text-brand-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Shield size={14} /> Corporate Security Protocol
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Healthcare Privacy Policy
          </h1>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
            Effective Date: May 29, 2026 | Version 4.2 | Compliance Audited under Zero-Trust Frameworks
          </p>

          {/* Search box within policy */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sections or topics inside privacy policy..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold border-2 border-transparent bg-white dark:bg-white/5 shadow-md focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-hidden transition-all text-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-12 items-start">
          
          {/* Side Sticky Navigation */}
          <aside className="lg:sticky lg:top-28 col-span-1 space-y-2 hidden lg:block max-h-[80vh] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-250">
            <div className="px-3 py-2 mb-2 text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Filter size={12} /> POLICY SECTIONS
            </div>
            
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all ${
                  activeTab === s.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15" 
                    : "hover:bg-white dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {s.icon}
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </aside>

          {/* Policy Contents Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-950 p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5">
              
              {filteredSections.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold space-y-4">
                  <AlertTriangle className="mx-auto text-orange-500" size={48} />
                  <p>No matching policy terms found for "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="text-xs font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-xl"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <section 
                    key={sec.id} 
                    id={sec.id} 
                    className="py-8 first:pt-0 border-b last:border-0 border-gray-100 dark:border-white/5 scroll-mt-24"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary dark:text-brand-secondary rounded-xl flex items-center justify-center shrink-0">
                        {sec.icon}
                      </div>
                      <h2 className="text-xl font-black tracking-tight">{sec.title}</h2>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed pl-14">
                      {sec.content}
                    </p>
                  </section>
                ))
              )}

            </div>

            {/* Disclaimer & Footer */}
            <div className="p-8 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Shield className="text-brand-primary shrink-0" size={32} />
                <div>
                  <h4 className="text-sm font-black uppercase">Sovereign Data Protection Certified</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">CareBridge+ coordinates strict data access governance protocols.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shrink-0"
              >
                Back to Dashboard Link
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Corporate Legal Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-10 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">
            © 2026 CareBridge Plus Technologies Inc. Compliance, Risk, & Legal Audit Division.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[10px] font-black text-gray-500 hover:text-brand-primary tracking-widest uppercase">Privacy Policy</Link>
            <Link to="/terms" className="text-[10px] font-black text-gray-500 hover:text-brand-primary tracking-widest uppercase">Terms & Conditions</Link>
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">STRICT DISHA & ABDM COMPLIANCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
