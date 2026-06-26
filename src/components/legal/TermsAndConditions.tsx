import React, { useState, useMemo, useEffect } from "react";
import { 
  Shield, Search, Lock, ShieldAlert, Scale, Info,
  FileText, ClipboardList, ChevronRight, ArrowLeft, Mail, 
  Phone, Globe, Stethoscope, AlertOctagon, HelpCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

export default function TermsAndConditions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("platform");
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
      id: "platform",
      title: "Platform Usage Rules",
      icon: <Globe size={18} />,
      content: "CareBridge+ is an enterprise healthcare management system designed exclusively for legal clinical interactions. Users agree to access workspaces only using registered credentials, prevent unauthorized access to active sessions, and never inject malicious automation scripts. Misrepresentation of roles or clinical identities is strictly prohibited."
    },
    {
      id: "doctor",
      title: "Doctor Responsibility Clause",
      icon: <Stethoscope size={18} />,
      content: "All medical practitioners registered on CareBridge+ maintain ultimate professional, moral, and legal liability for direct clinical diagnoses, electronic prescriptions, and treatment plan approvals. The CareBridge+ platform is purely a workflow facilitation mechanism and does not override, substitute, or influence standard medical examinations."
    },
    {
      id: "ai-advisory",
      title: "AI Advisory Disclaimer",
      icon: <ShieldAlert size={18} />,
      content: "Intelligent analytics, diagnostic estimations, and medication remind chimes analyzed by our AI health coach or structured widgets are tools designed to support clinical workflows. These insights DO NOT constitute absolute diagnostic medical advice. Clinicians must independently verify all vitals before proceeding."
    },
    {
      id: "billing",
      title: "Billing & Financial Terms",
      icon: <FileText size={18} />,
      content: "Workspace subscription fees, general outpatient (OPD) billing calculations, receptionist cash allocations, and credit account limits must be strictly verified before entry. CareBridge+ calculates transactional reports but is not responsible for accounting discrepancies arising from manual record entry errors."
    },
    {
      id: "crm",
      title: "CRM & Marketing Policy",
      icon: <HelpCircle size={18} />,
      content: "Client notifications, alerts, and medication history trackers are strictly for procedural healthcare updates and coordination. Users are strictly forbidden from distributing unsolicited bulk promotional campaigns (spam), unsolicited commercial lists, or unauthorized market catalogs through our messaging networks."
    },
    {
      id: "referrals",
      title: "Referral Workflow Terms",
      icon: <ChevronRight size={18} />,
      content: "Doctors and clinic coordinators certify that all patient records shared over the referral transfer engine represent true clinical vectors. Patient referrals must satisfy real medical emergency or treatment requirements. The correct transfer of ownership remains the responsibility of the clinical sender."
    },
    {
      id: "misuse",
      title: "Data Misuse Restrictions",
      icon: <AlertOctagon size={18} />,
      content: "Any attempts to crop, scrape, duplicate, or dump records from directories, clinic details, or personal vitals is a federal defense violation. Violators will face immediate profile ban, permanent workspace freeze, and complete disclosure of tracking logs to security authorities."
    },
    {
      id: "suspension",
      title: "Account Suspension Rights",
      icon: <Lock size={18} />,
      content: "CareBridge+ reserves absolute, unconditioned privileges to terminate, freeze, or transition accounts showing fraudulent log patterns, unauthorized access attempts, non-payment of subscriptions, or direct breaches of patient confidentiality protocols."
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: <Scale size={18} />,
      content: "In no event shall CareBridge Plus Technologies Inc., its executives, or technology developers be liable for direct, secondary, or punitive damages resulting from platform down-times, server-side data synchronization delays, or incorrect prescription inputs from clinical operators."
    },
    {
      id: "disclaimer",
      title: "Healthcare Disclaimer",
      icon: <Info size={18} />,
      content: "THE SYSTEMS ARE OPERATED ON AN 'AS IS' BASIS WITHOUT DECLARED OR IMPLICIT WARRANTIES of clinic accuracy or operational speed. Users recognize that secure data transit involves internet protocols that remain subject to transient service disruptions."
    },
    {
      id: "jurisdiction",
      title: "Indian Legal Jurisdiction",
      icon: <ClipboardList size={18} />,
      content: "This Agreement, terms of operation, and dispute mitigations are structured, registered, and audited under the sovereign laws of the Republic of India. Any legal disputes arising hereafter shall be exclusively filed in and resolved by Courts of Competent Jurisdiction in Bangalore, Karnataka, India."
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
            <span className="text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-orange-500/20">
              <Scale size={12} /> ENTERPRISE CORE
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Scale size={14} /> Legally Enforceable Agreement
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Platform Terms & Conditions
          </h1>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
            Effective Date: May 29, 2026 | Enterprise Regulation Group | Sovereign Court Reference Code: CG-IND-2026
          </p>

          {/* Search box within policy */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search specific terms or legal sections..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold border-2 border-transparent bg-white dark:bg-white/5 shadow-md focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-hidden transition-all text-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-12 items-start">
          
          {/* Side Sticky Navigation */}
          <aside className="lg:sticky lg:top-28 col-span-1 space-y-2 hidden lg:block max-h-[80vh] overflow-y-auto pr-3">
            <div className="px-3 py-2 mb-2 text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Scale size={11} /> CORE TERMS
            </div>
            
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all ${
                  activeTab === s.id 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15" 
                    : "hover:bg-white dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {s.icon}
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </aside>

          {/* Terms Contents Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-950 p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5">
              
              {filteredSections.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold space-y-4">
                  <AlertOctagon className="mx-auto text-orange-500" size={48} />
                  <p>No matching legal terms found for "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-4 py-2 rounded-xl"
                  >
                    Clear Filter
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
                      <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
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
            <div className="p-8 bg-orange-500/5 rounded-[2rem] border border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Scale className="text-orange-500 shrink-0" size={32} />
                <div>
                  <h4 className="text-sm font-black uppercase">Indian Jurisdiction Registered Agreement</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Governed strictly under Bangalore Courts guidelines.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shrink-0"
              >
                Return to Login
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
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">REGULATED MEDICAL SAAS SYSTEM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
