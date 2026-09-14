import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, Users, TrendingUp, Calendar, MapPin, Activity, Heart,
  Smartphone, Plus, Search, Filter, Check, Award, Image as ImageIcon, 
  ArrowRight, Share2, Clipboard, ChevronRight, CheckCircle2, Star, Send, 
  MessageSquare, Copy, RefreshCw, FileText, Printer, Trash, Info, Phone, 
  Download, BookOpen, ThumbsUp, Clock, HelpCircle, AlertCircle, 
  Globe, LayoutGrid, CalendarRange, Share, BarChart3, ListTodo, X,
  Settings, ChevronLeft, Play, Pause, AlertTriangle, Eye, FileDown, Layers, 
  FileSpreadsheet, ShieldAlert, Megaphone, PieChart as PieChartIcon, 
  ArrowUpRight, Zap, Facebook, Instagram, Monitor, PenTool, Hash, Type, 
  Brush, Move, MoreVertical, Layout, AlignLeft, CheckCircle, Trash2, Mail
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, 
  Bar, Cell, PieChart, Pie, Legend, CartesianGrid, LineChart, Line
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface PatientCRMProps {
  allPatients: any[];
  selectedPatients: string[];
  setSelectedPatients: (phones: string[]) => void;
  digitalCards: any[];
  setDigitalCards: React.Dispatch<React.SetStateAction<any[]>>;
  handleAddDigitalCard: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  sendMarketingContent: (content: string, phone: string, type: string, skipDownload?: boolean) => Promise<void>;
  handleBulkSendWhatsApp: (content: string, type: "card" | "tip" | "campaign") => Promise<void>;
  darkMode: boolean;
  user: any;
  clinicDetails: any;
  openWhatsAppPreview: (phone: string, msg: string, title: string, patientName: string, type: string, meta?: any) => void;
}

type CRMTab = "dashboard" | "segmentation" | "campaign_builder" | "poster_studio" | "whatsapp_creator" | "broadcast" | "automation" | "templates" | "analytics" | "notifications";

export default function HealthcareCRM({
  allPatients = [],
  selectedPatients = [],
  setSelectedPatients,
  digitalCards = [],
  setDigitalCards,
  handleAddDigitalCard,
  sendMarketingContent,
  handleBulkSendWhatsApp,
  darkMode,
  user,
  clinicDetails,
  openWhatsAppPreview
}: PatientCRMProps) {

  // Active Tab & Substates
  const [activeTab, setActiveTab] = useState<CRMTab>("dashboard");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");

  // Role Access (Simulated Role Selection for Demo)
  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "Receptionist" | "Marketing Manager" | "Doctor">("Marketing Manager");

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: "1", type: "success", title: "Campaign Completed", message: "Monsoon Health Checkup delivered successfully to 845 patients.", time: "10 mins ago", read: false },
    { id: "2", type: "failed", title: "Campaign Failed", message: "SMS delivery failed for 12 recipients in high-range area due to carrier failure.", time: "1 hour ago", read: false },
    { id: "3", type: "warning", title: "Low Credits Warning", message: "Your WhatsApp API credit balance is below 500. Recharge soon to avoid interruptions.", time: "3 hours ago", read: true },
    { id: "4", type: "info", title: "Automation Triggered", message: "14 birthday wishes queued for automated dispatch at 10:00 AM.", time: "5 hours ago", read: true }
  ]);

  // Mock Campaigns Database
  const [campaigns, setCampaigns] = useState([
    { id: "c-1", name: "Diabetic Care Outreach", type: "WhatsApp Broadcast", status: "Running", createdDate: "2026-07-09", reach: 1420, clicks: 423, appointments: 86, revenue: 38200, roi: "310%", channel: "WhatsApp" },
    { id: "c-2", name: "Monsoon Dental Camp", type: "Festival Campaign", status: "Completed", createdDate: "2026-07-05", reach: 3500, clicks: 890, appointments: 145, revenue: 72500, roi: "415%", channel: "WhatsApp" },
    { id: "c-3", name: "Weekly Health Advisory", type: "Email Campaign", status: "Scheduled", createdDate: "2026-07-08", reach: 2800, clicks: 310, appointments: 15, revenue: 6400, roi: "120%", channel: "Email" },
    { id: "c-4", name: "Vaccination Reminder", type: "Vaccination Reminder", status: "Paused", createdDate: "2026-07-01", reach: 980, clicks: 120, appointments: 40, revenue: 18000, roi: "280%", channel: "SMS" },
    { id: "c-5", name: "Cardiac Camp Promo", type: "SMS Campaign", status: "Completed", createdDate: "2026-06-28", reach: 5000, clicks: 1100, appointments: 210, revenue: 105000, roi: "520%", channel: "SMS" }
  ]);

  // Dynamic Patient Segmentation Filters
  const [segmentationFilters, setSegmentationFilters] = useState({
    ageMin: "",
    ageMax: "",
    gender: "all",
    area: "",
    village: "",
    city: "",
    pinCode: "",
    disease: "",
    diagnosis: "",
    procedure: "",
    medicine: "",
    doctor: "",
    lastVisitMonths: "",
    missedFollowup: false,
    highValue: false,
    inactive: false,
    newPatient: false,
    birthdayToday: false,
    anniversaryToday: false,
    pregnant: false,
    seniorCitizen: false,
    child: false,
    customTag: "",
    logicMode: "AND" // "AND" | "OR"
  });

  // Saved Audiences State
  const [savedAudiences, setSavedAudiences] = useState([
    { id: "aud-1", name: "Elderly Diabetics (Pune)", count: 245, disease: "Diabetes", minAge: 60 },
    { id: "aud-2", name: "Monsoon Skin Care Target", count: 512, procedure: "Consultation", area: "Hadapsar" },
    { id: "aud-3", name: "High Value Pediatric Patients", count: 88, maxAge: 12, value: "high" }
  ]);
  const [saveAudienceName, setSaveAudienceName] = useState("");

  // Campaign Builder Form
  const [campaignBuilder, setCampaignBuilder] = useState({
    step: 1,
    name: "",
    goal: "Lead Generation",
    targetAudienceId: "",
    channel: "WhatsApp Broadcast",
    scheduleType: "Immediate", // Immediate, Scheduled, Recurring
    scheduleTime: "",
    recurringFrequency: "Weekly",
    aiTiming: true,
    templateId: "",
    aiGeneratedHeadline: "",
    aiGeneratedCaption: "",
    aiGeneratedCTA: "",
    aiTone: "Professional",
    aiLanguage: "English"
  });

  // AI Content Generator State
  const [aiGenerator, setAiGenerator] = useState({
    prompt: "",
    tone: "Friendly",
    language: "English",
    resultHeadline: "",
    resultCaption: "",
    resultWhatsApp: "",
    resultSMS: "",
    resultEmail: "",
    resultPosterText: "",
    resultSocial: "",
    resultHashtags: "",
    resultCTA: "",
    generating: false
  });

  // Poster Studio Canvas State
  const [posterStudio, setPosterStudio] = useState({
    category: "General Medicine",
    headline: "Protect Your Family's Health",
    description: "Book an annual health checkup package today at CareBridge Clinic. Special packages for senior citizens.",
    cta: "Call 98765 43210 to book",
    brandColor: "#0f766e",
    logoUploaded: false,
    doctorPhotoUploaded: false,
    clinicPhotoUploaded: false,
    aiPrompt: "",
    aiImageLoading: false,
    generatedImageUrl: "",
    exportFormat: "PNG"
  });

  // WhatsApp Post Creator States
  const [waCreator, setWaCreator] = useState({
    aspectRatio: "square", // square, portrait, story, status, carousel
    caption: "Take charge of your health! Regular checkups are the first step to healthy living. 🌟",
    suggestedEmojis: ["🩺", "❤️", "📅", "🏥"],
    cta: "Click here to book a consult",
    previewImage: null as string | null
  });

  // AI Topic Auto-Generation States
  const [aiPosterTopic, setAiPosterTopic] = useState("Festival Greeting");
  const aiPosterTopicsList = [
    { id: "Festival Greeting", label: "Festival Greeting" },
    { id: "Health Tips", label: "Health Tips" },
    { id: "Doctor Promotion", label: "Doctor Promotion" },
    { id: "Vaccination Drive", label: "Vaccination Drive" },
    { id: "Seasonal Diseases Alert", label: "Seasonal Diseases Alert" },
    { id: "Diabetes Care Checkup", label: "Diabetes Care Checkup" }
  ];

  const autoGenerateAIPoster = (topic: string) => {
    switch (topic) {
      case "Festival Greeting":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Happy Diwali & Healthy Season!",
          description: "CareBridge Clinic wishes you a happy, safe, and healthy festival season! Protect your health and family.",
          cta: "Call 98765 43210 for emergency support",
          brandColor: "#d97706"
        }));
        break;
      case "Health Tips":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Daily Monsoon Health Tips",
          description: "Drink boiled water, keep surroundings mosquito-free, and boost immunity with fresh vitamins.",
          cta: "Read more tips at CareBridge",
          brandColor: "#0284c7"
        }));
        break;
      case "Doctor Promotion":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Meet Our Senior Consultant",
          description: "Dr. Rajesh Pawar (MD, Medicine) is available for consultations this week from 10 AM to 5 PM.",
          cta: "Schedule consulting slot",
          brandColor: "#4f46e5"
        }));
        break;
      case "Vaccination Drive":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Free Pediatric Vaccination Camp",
          description: "Ensure your children's immunity is up to date. Schedule standard and booster vaccinations on Sunday.",
          cta: "Book a pediatric slot",
          brandColor: "#059669"
        }));
        break;
      case "Seasonal Diseases Alert":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Monsoon Dengue & Malaria Alert",
          description: "Fever? Don't self-medicate. Get a rapid blood screen test done today and secure early safety.",
          cta: "Book Blood Screen Test",
          brandColor: "#dc2626"
        }));
        break;
      case "Diabetes Care Checkup":
        setPosterStudio(prev => ({
          ...prev,
          headline: "Comprehensive Diabetes Health Check",
          description: "Includes HbA1c, fasting sugar, kidney function, and cardiac consults. Normal rates reduced by 30%.",
          cta: "Book Diabetes Package",
          brandColor: "#0891b2"
        }));
        break;
      default:
        break;
    }
    alert(`Automatically generated poster layout for "${topic}"!`);
  };

  const [aiWhatsAppTopic, setAiWhatsAppTopic] = useState("Diabetic Health Checkup Alert");
  const aiWhatsAppTopicsList = [
    { id: "Diabetic Health Checkup Alert", label: "Diabetic Health Checkup" },
    { id: "Dental Camp Promotion", label: "Dental Camp Promotion" },
    { id: "General Medicine Consultation", label: "General Medicine Consultation" },
    { id: "Monsoon Skin Care Tips", label: "Monsoon Skin Care Tips" },
    { id: "Vaccination Refill Alert", label: "Vaccination Refill Alert" }
  ];

  const autoGenerateAIWhatsApp = (topic: string) => {
    switch (topic) {
      case "Diabetic Health Checkup Alert":
        setWaCreator(prev => ({
          ...prev,
          caption: "Attention! 🩸 Keep your HbA1c in check. Join our Diabetes Checkup Camp this Sunday. Special concession for families. 🩺❤️",
          cta: "Click to book diabetes slot",
          suggestedEmojis: ["🩺", "❤️", "🩸", "📅"]
        }));
        break;
      case "Dental Camp Promotion":
        setWaCreator(prev => ({
          ...prev,
          caption: "Smile bright! 🦷 Free dental scaling & consults at CareBridge Clinic. Only this Saturday. Limited spots. Book yours now! ✨",
          cta: "Click to book dental consult",
          suggestedEmojis: ["🦷", "✨", "📅", "🏥"]
        }));
        break;
      case "General Medicine Consultation":
        setWaCreator(prev => ({
          ...prev,
          caption: "Feeling under the weather? 🤒 Consult our expert general physician. Easy walk-ins or online bookings. Stay healthy, stay safe! 🏥",
          cta: "Click to book physician consult",
          suggestedEmojis: ["🤒", "🏥", "📞", "📅"]
        }));
        break;
      case "Monsoon Skin Care Tips":
        setWaCreator(prev => ({
          ...prev,
          caption: "Monsoon humidity causing skin rashes or acne? 🧴 Get expert guidance from our dermatologist. Glow naturally and healthily! 🌟",
          cta: "Click to book skin consult",
          suggestedEmojis: ["🧴", "🌟", "❤️", "🏥"]
        }));
        break;
      case "Vaccination Refill Alert":
        setWaCreator(prev => ({
          ...prev,
          caption: "Parent Alert! 👶 Don't miss your child's vaccination schedule. Booking open for monthly booster doses. 🩺💉",
          cta: "Click to book baby vaccine slot",
          suggestedEmojis: ["👶", "🩺", "💉", "📅"]
        }));
        break;
      default:
        break;
    }
    alert(`Automatically generated WhatsApp status copy for "${topic}"!`);
  };

  // Broadcast Module States
  const [broadcastForm, setBroadcastForm] = useState({
    name: "",
    selectedAudienceId: "",
    channel: "WhatsApp",
    scheduleType: "immediate", // immediate, scheduled
    scheduleDate: ""
  });
  const [broadcastProgress, setBroadcastProgress] = useState(-1); // -1 = idle, 0 to 100 = active
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "sending" | "completed" | "failed">("idle");
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);

  // Automation Hub Workflows
  const [automations, setAutomations] = useState([
    { id: "a-1", type: "Birthday Wishes", active: true, channel: "WhatsApp", desc: "Send dynamic birthday poster + special discount voucher." },
    { id: "a-2", type: "Anniversary Wishes", active: false, channel: "WhatsApp", desc: "Automated couple health packages promotion." },
    { id: "a-3", type: "Follow-up Reminder", active: true, channel: "WhatsApp", desc: "Send 7 days after last consultation for chronic follow-ups." },
    { id: "a-4", type: "Missed Appointment Alert", active: true, channel: "SMS & WhatsApp", desc: "Send 2 hours after missed appointment to prompt rescheduling." },
    { id: "a-5", type: "Medicine Refill Alert", active: true, channel: "WhatsApp", desc: "Refill reminders for diabetic & hypertensive patients." },
    { id: "a-6", type: "Google Review Request", active: false, channel: "WhatsApp", desc: "Send Google Review link 24 hours post-consultation." },
    { id: "a-7", type: "Health Camp Invite", active: true, channel: "SMS", desc: "Broadcast free local diagnostic camp invites automatically." },
    { id: "a-8", type: "Festival Greetings", active: true, channel: "WhatsApp", desc: "Automated greeting posters on major local festivals." },
    { id: "a-9", type: "Inactive Patient Reactivation", active: false, channel: "Email", desc: "Offer checkup discounts to patients inactive for >6 months." }
  ]);

  // Templates Manager
  const [templates, setTemplates] = useState([
    { id: "t-1", name: "Festival Greeting Template", category: "Festival Posters", rating: 4.8, favorite: true },
    { id: "t-2", name: "Weekly Diabetic Advisory", category: "Diabetes", rating: 4.5, favorite: false },
    { id: "t-3", name: "Specialist Consultation Callout", category: "Doctor Promotion", rating: 4.9, favorite: true },
    { id: "t-4", name: "Immunization & Vaccination Alert", category: "Vaccination", rating: 4.2, favorite: false },
    { id: "t-5", name: "Seasonal Health Tips", category: "Seasonal Diseases", rating: 4.7, favorite: false }
  ]);

  // Analytics timeframe
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Dynamic filter logic: matches allPatients
  const filteredPatientsForSegmentation = useMemo(() => {
    return allPatients.filter(patient => {
      const matchAgeMin = !segmentationFilters.ageMin || (patient.age && patient.age >= parseInt(segmentationFilters.ageMin));
      const matchAgeMax = !segmentationFilters.ageMax || (patient.age && patient.age <= parseInt(segmentationFilters.ageMax));
      const matchGender = segmentationFilters.gender === "all" || (patient.gender && patient.gender.toLowerCase() === segmentationFilters.gender.toLowerCase());
      
      const matchArea = !segmentationFilters.area || (patient.area && patient.area.toLowerCase().includes(segmentationFilters.area.toLowerCase()));
      const matchVillage = !segmentationFilters.village || (patient.village && patient.village.toLowerCase().includes(segmentationFilters.village.toLowerCase()));
      const matchCity = !segmentationFilters.city || (patient.city && patient.city.toLowerCase().includes(segmentationFilters.city.toLowerCase()));
      const matchPin = !segmentationFilters.pinCode || (patient.pinCode && patient.pinCode.includes(segmentationFilters.pinCode));
      
      const matchDisease = !segmentationFilters.disease || (patient.disease && patient.disease.toLowerCase().includes(segmentationFilters.disease.toLowerCase()));
      const matchDiagnosis = !segmentationFilters.diagnosis || (patient.diagnosis && patient.diagnosis.toLowerCase().includes(segmentationFilters.diagnosis.toLowerCase()));
      const matchProcedure = !segmentationFilters.procedure || (patient.procedure && patient.procedure.toLowerCase().includes(segmentationFilters.procedure.toLowerCase()));
      const matchMedicine = !segmentationFilters.medicine || (patient.medicine && patient.medicine.toLowerCase().includes(segmentationFilters.medicine.toLowerCase()));
      const matchDoctor = !segmentationFilters.doctor || (patient.doctor && patient.doctor.toLowerCase().includes(segmentationFilters.doctor.toLowerCase()));
      
      // Last visit months filter
      let matchLastVisit = true;
      if (segmentationFilters.lastVisitMonths) {
        if (!patient.lastVisit) matchLastVisit = false;
        else {
          const monthsAgo = (new Date().getTime() - new Date(patient.lastVisit).getTime()) / (1000 * 60 * 60 * 24 * 30.4);
          matchLastVisit = monthsAgo >= parseInt(segmentationFilters.lastVisitMonths);
        }
      }

      // Boolean filters
      const matchMissedFollowup = !segmentationFilters.missedFollowup || patient.missedFollowup;
      const matchHighValue = !segmentationFilters.highValue || patient.tags?.includes("high-value") || patient.highValue;
      const matchInactive = !segmentationFilters.inactive || patient.tags?.includes("inactive") || patient.inactive;
      const matchNew = !segmentationFilters.newPatient || patient.tags?.includes("new") || patient.newPatient;
      const matchBirthday = !segmentationFilters.birthdayToday || patient.birthdayToday;
      const matchAnniversary = !segmentationFilters.anniversaryToday || patient.anniversaryToday;
      const matchPregnant = !segmentationFilters.pregnant || patient.gender?.toLowerCase() === "female" && (patient.pregnant || patient.tags?.includes("pregnant"));
      const matchSenior = !segmentationFilters.seniorCitizen || (patient.age && patient.age >= 60);
      const matchChild = !segmentationFilters.child || (patient.age && patient.age <= 12);
      
      const matchCustomTag = !segmentationFilters.customTag || patient.tags?.includes(segmentationFilters.customTag.toLowerCase());

      if (segmentationFilters.logicMode === "AND") {
        return matchAgeMin && matchAgeMax && matchGender && matchArea && matchVillage && matchCity && matchPin &&
               matchDisease && matchDiagnosis && matchProcedure && matchMedicine && matchDoctor && matchLastVisit &&
               matchMissedFollowup && matchHighValue && matchInactive && matchNew && matchBirthday && matchAnniversary &&
               matchPregnant && matchSenior && matchChild && matchCustomTag;
      } else {
        // OR Logic
        return matchAgeMin || matchAgeMax || (segmentationFilters.gender !== "all" && matchGender) || matchArea || 
               matchVillage || matchCity || matchPin || matchDisease || matchDiagnosis || matchProcedure || 
               matchMedicine || matchDoctor || (segmentationFilters.lastVisitMonths && matchLastVisit) ||
               (segmentationFilters.missedFollowup && matchMissedFollowup) || (segmentationFilters.highValue && matchHighValue) ||
               (segmentationFilters.inactive && matchInactive) || (segmentationFilters.newPatient && matchNew) ||
               (segmentationFilters.birthdayToday && matchBirthday) || (segmentationFilters.anniversaryToday && matchAnniversary) ||
               (segmentationFilters.pregnant && matchPregnant) || (segmentationFilters.seniorCitizen && matchSenior) ||
               (segmentationFilters.child && matchChild) || (segmentationFilters.customTag && matchCustomTag);
      }
    });
  }, [allPatients, segmentationFilters]);

  // Global Search filter
  const globalFilteredCampaigns = useMemo(() => {
    if (!globalSearch) return campaigns;
    const s = globalSearch.toLowerCase();
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.type.toLowerCase().includes(s) || 
      c.status.toLowerCase().includes(s)
    );
  }, [campaigns, globalSearch]);

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  const generateAIContent = () => {
    if (!aiGenerator.prompt) return;
    setAiGenerator(prev => ({ ...prev, generating: true }));
    
    // Simulate generation
    setTimeout(() => {
      const languageSuffix = aiGenerator.language === "Marathi" ? " (मराठीत)" : aiGenerator.language === "Hindi" ? " (हिंदी में)" : aiGenerator.language === "Mixed Language" ? " (Hinglish mix)" : "";
      const tonePrefix = `[Tone: ${aiGenerator.tone}] `;
      
      setAiGenerator(prev => ({
        ...prev,
        generating: false,
        resultHeadline: `${tonePrefix}Attention All Patients! Health is Wealth${languageSuffix}`,
        resultCaption: `Take control of your wellness with our weekly diagnostics camp. Check details inside.${languageSuffix}`,
        resultWhatsApp: `Hello *Patient*, 🩺\n\nHope you are doing well. ${tonePrefix}CareBridge Clinic is hosting a Health Checkup Camp this Sunday. Enjoy specialized consultant guidance.\n\n👉 *Book here:* https://carebridge.in/camp\n\nStay Healthy!${languageSuffix}`,
        resultSMS: `CareBridge: Special Health camp this Sunday. ${tonePrefix}Consult our top doctors. Book slot: https://cb.in/sc - CareBridge Clinic`,
        resultEmail: `Subject: Invitation to CareBridge Health & Wellness Checkup Camp\n\nDear Patient,\n\nWe hope this email finds you in good health. We are pleased to announce our clinic's wellness camp scheduled for this weekend. Our specialized care advisors will be available.\n\nRegards,\nCareBridge Team`,
        resultPosterText: `FREE HEALTH CAMP\nSunday, 10AM - 4PM\nSpecialist Consultations Inside`,
        resultSocial: `Prioritize your wellbeing today! Join us for the upcoming diagnostic camp. ${tonePrefix}#HealthFirst`,
        resultHashtags: "#healthcare #cliniccamp #carebridge #healthyindia",
        resultCTA: "Book Appointment Now"
      }));
    }, 1500);
  };

  const handleCreateCampaignFromWizard = () => {
    const newCamp = {
      id: `c-${Date.now()}`,
      name: campaignBuilder.name || "AI Suggested Campaign",
      type: campaignBuilder.channel,
      status: campaignBuilder.scheduleType === "Immediate" ? "Completed" : "Scheduled",
      createdDate: new Date().toISOString().split('T')[0],
      reach: filteredPatientsForSegmentation.length || Math.floor(Math.random() * 1500) + 100,
      clicks: 0,
      appointments: 0,
      revenue: 0,
      roi: "0%",
      channel: campaignBuilder.channel.includes("WhatsApp") ? "WhatsApp" : campaignBuilder.channel.includes("SMS") ? "SMS" : "Email"
    };

    setCampaigns([newCamp, ...campaigns]);
    setCampaignBuilder(prev => ({ ...prev, step: 1, name: "" }));
    setActiveTab("dashboard");
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === "Running" ? "Paused" : c.status === "Paused" ? "Running" : c.status };
      }
      return c;
    }));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const duplicateCampaign = (id: string) => {
    const target = campaigns.find(c => c.id === id);
    if (target) {
      setCampaigns([{
        ...target,
        id: `c-${Date.now()}`,
        name: `${target.name} (Copy)`,
        createdDate: new Date().toISOString().split('T')[0]
      }, ...campaigns]);
    }
  };

  const startBroadcast = () => {
    if (!broadcastForm.name) {
      alert("Please enter a campaign name");
      return;
    }
    setBroadcastLogs([]);
    setBroadcastStatus("sending");
    setBroadcastProgress(0);

    const targetAudience = broadcastForm.selectedAudienceId 
      ? savedAudiences.find(a => a.id === broadcastForm.selectedAudienceId)?.name 
      : "Filtered Dynamic Segment";

    let logs = [
      `Initializing broadcast: ${broadcastForm.name}`,
      `Selected channel: ${broadcastForm.channel}`,
      `Targeting group: ${targetAudience}`,
      `Resolving audience details...`
    ];
    setBroadcastLogs([...logs]);

    // Simulate sending batch
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setBroadcastProgress(current);
      
      if (current === 20) {
        logs.push(`Found ${filteredPatientsForSegmentation.length || 150} eligible patients.`);
        logs.push(`Connecting to gateway... Secure link established.`);
      } else if (current === 60) {
        logs.push(`Sending messages: 50% processed...`);
      } else if (current === 100) {
        logs.push(`Broadcast finished! 100% of messages successfully dispatched.`);
        setBroadcastStatus("completed");
        clearInterval(interval);
      }
      setBroadcastLogs([...logs]);
    }, 800);
  };

  const saveAudienceSegment = () => {
    if (!saveAudienceName) return;
    const newAudience = {
      id: `aud-${Date.now()}`,
      name: saveAudienceName,
      count: filteredPatientsForSegmentation.length,
      disease: segmentationFilters.disease || "All Specialities",
      minAge: segmentationFilters.ageMin ? parseInt(segmentationFilters.ageMin) : 0
    };
    setSavedAudiences([...savedAudiences, newAudience]);
    setSaveAudienceName("");
    alert("Audience Segment Saved Successfully!");
  };

  // Mock charts data
  const chartsData = useMemo(() => {
    return [
      { name: "Jan", campaigns: 3, reach: 2400, clicks: 350, revenue: 18000, appointments: 42 },
      { name: "Feb", campaigns: 5, reach: 4500, clicks: 810, revenue: 32000, appointments: 85 },
      { name: "Mar", campaigns: 4, reach: 3800, clicks: 620, revenue: 27000, appointments: 68 },
      { name: "Apr", campaigns: 7, reach: 6800, clicks: 1250, revenue: 54000, appointments: 130 },
      { name: "May", campaigns: 8, reach: 8900, clicks: 1980, revenue: 84000, appointments: 195 },
      { name: "Jun", campaigns: 6, reach: 7200, clicks: 1420, revenue: 68000, appointments: 154 },
      { name: "Jul", campaigns: 10, reach: 11200, clicks: 2850, revenue: 115000, appointments: 275 }
    ];
  }, []);

  // Disease wise campaign distribution data
  const diseaseBreakdownData = [
    { name: "Diabetes", value: 38, color: "#0d9488" },
    { name: "Hypertension", value: 24, color: "#4f46e5" },
    { name: "Dental", value: 18, color: "#e11d48" },
    { name: "Skin & Cosmetics", value: 12, color: "#d97706" },
    { name: "Others", value: 8, color: "#64748b" }
  ];

  return (
    <div className={`w-full min-h-screen ${darkMode ? "dark bg-[#0f172a]" : "bg-[#f8fafc]"} text-slate-800 dark:text-slate-105 font-sans transition-colors duration-300`}>
      
      {/* Top Global Search & Stats Hub Banner */}
      <div className="border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-teal-505 bg-clip-text text-transparent">
              Clinic Marketing CRM & Outreach
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enterprise Health campaigns, AI posters, and conversion analytics</p>
          </div>
        </div>

        {/* Global Search and Role selection */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search campaigns, templates..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-202 dark:border-slate-700/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Role selection indicator to demo access rights */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Role:</span>
            <select 
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as any)}
              className="bg-white dark:bg-slate-900 text-xs font-bold py-1 px-2.5 rounded-lg border-none focus:ring-1 focus:ring-indigo-500/20"
            >
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-5.5rem)]">
        
        {/* Left Sidebar Menu */}
        <aside className="w-64 border-r border-slate-202/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-6 shrink-0 flex flex-col justify-between hidden lg:flex">
          <div className="px-4 space-y-1.5 flex-1 overflow-y-auto">
            
            {[
              { id: "dashboard", label: "Today's Summary", icon: LayoutGrid },
              { id: "segmentation", label: "Audience Segments", icon: Users },
              { id: "campaign_builder", label: "Campaign Studio", icon: PenTool },
              { id: "poster_studio", label: "Poster & Design", icon: ImageIcon },
              { id: "whatsapp_creator", label: "WhatsApp Status Studio", icon: MessageSquare },
              { id: "broadcast", label: "Outbox Broadcast", icon: Send },
              { id: "automation", label: "Automation Rules", icon: Zap },
              { id: "templates", label: "Template Library", icon: FileText },
              { id: "analytics", label: "Insights & Reports", icon: BarChart3 },
              { id: "notifications", label: "System Alerts", icon: ShieldAlert, badge: notifications.filter(n => !n.read).length }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as CRMTab);
                  setSelectedCampaignId(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Credits remaining indicator */}
          <div className="px-6 py-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">API Wallet Balance</span>
                <span className="text-indigo-600 dark:text-indigo-400">4,120 Cr</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[45%]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/10">
          
          {/* Notifications banner if credits are low */}
          {notifications.some(n => n.type === "warning" && !n.read) && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold">System Warning: </span>
                Your communication API portal has low credits. Automated follow-up messages may pause once credit levels touch zero.
              </div>
              <button 
                onClick={() => setNotifications(notifications.map(n => n.type === "warning" ? { ...n, read: true } : n))}
                className="text-xs underline font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Campaign details overlay details view */}
          {selectedCampaignId ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setSelectedCampaignId(null)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                    {campaigns.find(c => c.id === selectedCampaignId)?.type}
                  </span>
                </div>
              </div>

              {(() => {
                const camp = campaigns.find(c => c.id === selectedCampaignId);
                if (!camp) return <p>Campaign not found</p>;
                return (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{camp.name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Dispatched on {camp.createdDate}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Reach</p>
                        <p className="text-2xl font-black text-slate-700 dark:text-white mt-1">{camp.reach.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total Clickbacks</p>
                        <p className="text-2xl font-black text-indigo-600 mt-1">{camp.clicks.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Appointments Set</p>
                        <p className="text-2xl font-black text-teal-600 mt-1">{camp.appointments.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-405 uppercase">Tracked Revenue</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">₹{camp.revenue.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Timeline & logs logs logs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Delivery Timeline & Status Logs</h4>
                        <div className="space-y-4">
                          <div className="flex gap-3 text-xs">
                            <Clock className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-202">Broadcast Completed</p>
                              <p className="text-slate-400 text-[10px]">Gateway reported 100% completion success.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5" />
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-202">Patient Response Triggered</p>
                              <p className="text-slate-400 text-[10px]">Over 300 message clickbacks recorded within first hour.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-202">Unreachable Recipient Logs</p>
                              <p className="text-slate-400 text-[10px]">14 phone numbers returned invalid routing signals.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Performance Analytics</h4>
                        <div className="flex justify-between text-xs border-b pb-2">
                          <span className="text-slate-400">Total Campaign ROI:</span>
                          <span className="font-bold text-emerald-600">{camp.roi}</span>
                        </div>
                        <div className="flex justify-between text-xs border-b pb-2">
                          <span className="text-slate-400">Average Conversion Rate:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-202">{(camp.appointments / (camp.reach || 1) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs border-b pb-2">
                          <span className="text-slate-400">Doctor Performance Contribution:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-202">Dr. Rajesh Pawar (80%)</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Top Performing Area:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-202">Hadapsar, Pune</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Today's Marketing Summary Dashboard */}
              {activeTab === "dashboard" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Today's Marketing Summary</h2>
                      <p className="text-xs text-slate-400">Real-time health promotional statistics and ROI</p>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { title: "Total Campaigns", value: campaigns.length, sub: "All history", color: "indigo" },
                      { title: "Running", value: campaigns.filter(c => c.status === "Running").length, sub: "Dispatched", color: "teal" },
                      { title: "Scheduled", value: campaigns.filter(c => c.status === "Scheduled").length, sub: "Queued", color: "blue" },
                      { title: "Today's Reach", value: "3,892", sub: "Patients contacted", color: "purple" },
                      { title: "Appointments", value: "112", sub: "Conversions today", color: "emerald" },
                      { title: "Today's Revenue", value: "₹42,800", sub: "ROI: 380%", color: "pink" }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.title}</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white mt-1.5">{m.value}</p>
                        <p className="text-[9px] font-semibold text-slate-400 mt-1">{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Cards Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider">Quick Studio Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {[
                        { tab: "campaign_builder", label: "Create Campaign", icon: Plus, bg: "bg-indigo-600 text-white" },
                        { tab: "campaign_builder", label: "AI Generator", icon: Sparkles, bg: "bg-teal-600 text-white" },
                        { tab: "poster_studio", label: "Poster Studio", icon: ImageIcon, bg: "bg-rose-500 text-white" },
                        { tab: "whatsapp_creator", label: "WhatsApp Post", icon: MessageSquare, bg: "bg-emerald-600 text-white" },
                        { tab: "broadcast", label: "Send Broadcast", icon: Send, bg: "bg-sky-600 text-white" },
                        { tab: "automation", label: "Automation Rules", icon: Zap, bg: "bg-amber-600 text-white" }
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(action.tab as any)}
                          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-xs font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${action.bg}`}
                        >
                          <action.icon className="w-5 h-5" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Campaigns Table */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider">Recent Campaign Log</h3>
                      <button 
                        onClick={() => setActiveTab("campaign_builder")}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        Launch New Studio <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                            <th className="pb-3 pr-2">Campaign Details</th>
                            <th className="pb-3 px-2">Type</th>
                            <th className="pb-3 px-2">Scheduled</th>
                            <th className="pb-3 px-2 text-right">Reach</th>
                            <th className="pb-3 px-2 text-right">Appointments</th>
                            <th className="pb-3 px-2 text-right">Revenue</th>
                            <th className="pb-3 pl-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {globalFilteredCampaigns.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="py-3.5 pr-2 font-bold text-slate-700 dark:text-slate-202">
                                <div>{c.name}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">Created {c.createdDate}</div>
                              </td>
                              <td className="py-3.5 px-2 font-medium text-slate-505">{c.type}</td>
                              <td className="py-3.5 px-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  c.status === "Running" ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" :
                                  c.status === "Scheduled" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" :
                                  c.status === "Paused" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                                  "bg-slate-100 text-slate-655 dark:bg-slate-700 dark:text-slate-350"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-right font-semibold">{c.reach.toLocaleString()}</td>
                              <td className="py-3.5 px-2 text-right font-semibold text-teal-600">{c.appointments}</td>
                              <td className="py-3.5 px-2 text-right font-black text-emerald-600">₹{c.revenue.toLocaleString()}</td>
                              <td className="py-3.5 pl-2 text-center space-x-1 whitespace-nowrap">
                                <button 
                                  onClick={() => setSelectedCampaignId(c.id)}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-lg font-bold text-[10px]"
                                >
                                  Details
                                </button>
                                <button 
                                  onClick={() => duplicateCampaign(c.id)}
                                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg font-bold text-[10px]"
                                >
                                  Duplicate
                                </button>
                                <button 
                                  onClick={() => toggleCampaignStatus(c.id)}
                                  className="px-2 py-1 bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg font-bold text-[10px]"
                                >
                                  {c.status === "Running" ? "Pause" : "Resume"}
                                </button>
                                <button 
                                  onClick={() => deleteCampaign(c.id)}
                                  className="px-2 py-1 bg-rose-50 dark:bg-rose-500/15 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[10px]"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Advanced Patient Segmentation */}
              {activeTab === "segmentation" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Patient Segmentation</h2>
                      <p className="text-xs text-slate-400">Generate targeted contact arrays for high precision promotions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Logic:</span>
                      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                        <button 
                          onClick={() => setSegmentationFilters(prev => ({ ...prev, logicMode: "AND" }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${segmentationFilters.logicMode === "AND" ? "bg-white dark:bg-slate-900 text-indigo-600" : "text-slate-400"}`}
                        >
                          AND
                        </button>
                        <button 
                          onClick={() => setSegmentationFilters(prev => ({ ...prev, logicMode: "OR" }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${segmentationFilters.logicMode === "OR" ? "bg-white dark:bg-slate-900 text-indigo-600" : "text-slate-405"}`}
                        >
                          OR
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Filters configuration column */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Demographic & Location Filters</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Min Age</label>
                          <input 
                            type="number" 
                            value={segmentationFilters.ageMin}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, ageMin: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl"
                            placeholder="e.g. 18"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Max Age</label>
                          <input 
                            type="number" 
                            value={segmentationFilters.ageMax}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, ageMax: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl"
                            placeholder="e.g. 70"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Gender</label>
                          <select 
                            value={segmentationFilters.gender}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl"
                          >
                            <option value="all">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Area / Suburb</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.area}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, area: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl"
                            placeholder="e.g. Hadapsar"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Village</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.village}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, village: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">City</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.city}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">PIN Code</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.pinCode}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, pinCode: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>

                      <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider pt-2">Clinical Diagnosis & Medical Filters</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Speciality / Disease</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.disease}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, disease: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            placeholder="e.g. Diabetes"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Exact Diagnosis</label>
                          <input 
                            type="text" 
                            value={segmentationFilters.diagnosis}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, diagnosis: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Last Visit (Months Ago)</label>
                          <input 
                            type="number" 
                            value={segmentationFilters.lastVisitMonths}
                            onChange={(e) => setSegmentationFilters(prev => ({ ...prev, lastVisitMonths: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Quick Demographic Checkboxes */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                        {[
                          { key: "missedFollowup", label: "Missed Follow-up" },
                          { key: "highValue", label: "High Value Patients" },
                          { key: "inactive", label: "Inactive Patients" },
                          { key: "newPatient", label: "New Registrations" },
                          { key: "birthdayToday", label: "Birthday Today" },
                          { key: "anniversaryToday", label: "Anniversary Today" },
                          { key: "pregnant", label: "Pregnant Women" },
                          { key: "seniorCitizen", label: "Senior Citizens" },
                          { key: "child", label: "Children (0-12)" }
                        ].map((c) => (
                          <label key={c.key} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl cursor-pointer hover:bg-slate-100/50">
                            <input 
                              type="checkbox"
                              checked={(segmentationFilters as any)[c.key]}
                              onChange={(e) => setSegmentationFilters(prev => ({ ...prev, [c.key]: e.target.checked }))}
                              className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                            />
                            <span className="text-[11px] font-semibold">{c.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <button 
                          onClick={() => setSegmentationFilters({
                            ageMin: "", ageMax: "", gender: "all", area: "", village: "", city: "", pinCode: "",
                            disease: "", diagnosis: "", procedure: "", medicine: "", doctor: "", lastVisitMonths: "",
                            missedFollowup: false, highValue: false, inactive: false, newPatient: false, birthdayToday: false,
                            anniversaryToday: false, pregnant: false, seniorCitizen: false, child: false, customTag: "", logicMode: "AND"
                          })}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>

                    {/* Result Estimation Column */}
                    <div className="bg-gradient-to-b from-indigo-50/50 to-indigo-100/20 dark:from-slate-800 dark:to-slate-800/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-955 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-xs font-bold text-indigo-600/80 dark:text-indigo-400 uppercase tracking-widest">Matched Audience Size</p>
                          <p className="text-5xl font-black text-slate-800 dark:text-white mt-2">
                            {filteredPatientsForSegmentation.length}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">out of {allPatients.length} registered clinic records</p>
                        </div>

                        <div className="h-px bg-slate-200/50 dark:bg-slate-800 w-full" />

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Save this audience</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. Elderly Diabetic group"
                              value={saveAudienceName}
                              onChange={(e) => setSaveAudienceName(e.target.value)}
                              className="flex-1 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-xl"
                            />
                            <button 
                              onClick={saveAudienceSegment}
                              className="px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Saved Groups</p>
                          <div className="space-y-1.5">
                            {savedAudiences.map(aud => (
                              <div key={aud.id} className="flex justify-between items-center text-[11px] font-bold bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span>{aud.name}</span>
                                <span className="text-indigo-600">{aud.count} patients</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const phones = filteredPatientsForSegmentation.map(p => p.phone).filter(Boolean);
                          setSelectedPatients(phones);
                          setActiveTab("broadcast");
                          alert(`${phones.length} patients loaded to outbox broadcast queue!`);
                        }}
                        className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Load into Broadcast Queue
                      </button>
                    </div>
                  </div>

                  {/* Matched Patients List */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Matched Patients List</h3>
                      <span className="text-xs text-slate-400 font-bold">{filteredPatientsForSegmentation.length} records matched</span>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                            <th className="pb-2.5 pr-2">Name</th>
                            <th className="pb-2.5 px-2">Phone</th>
                            <th className="pb-2.5 px-2">Age / Gender</th>
                            <th className="pb-2.5 px-2">Location</th>
                            <th className="pb-2.5 px-2">Disease / Speciality</th>
                            <th className="pb-2.5 pl-2">Last Visit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredPatientsForSegmentation.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="py-2.5 pr-2 font-bold text-slate-700 dark:text-slate-202">{p.name || "N/A"}</td>
                              <td className="py-2.5 px-2 font-medium text-slate-505">{p.phone || "N/A"}</td>
                              <td className="py-2.5 px-2 text-slate-505">{p.age ? `${p.age} yrs` : "N/A"} / {p.gender || "N/A"}</td>
                              <td className="py-2.5 px-2 text-slate-555">{p.area || p.city || "N/A"}</td>
                              <td className="py-2.5 px-2">
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-650 rounded-full text-[10px]">
                                  {p.disease || "General"}
                                </span>
                              </td>
                              <td className="py-2.5 pl-2 text-slate-404 font-medium">{p.lastVisit || "N/A"}</td>
                            </tr>
                          ))}
                          {filteredPatientsForSegmentation.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 italic">No patients match the selected filter criteria.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Step-by-Step Campaign Wizard & AI Generator */}
              {activeTab === "campaign_builder" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Studio Campaign Builder</h2>
                      <p className="text-xs text-slate-400">Step-by-step health promotions wizard with AI assists</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto">
                    
                    {/* Stepper Wizard Indicator */}
                    <div className="flex items-center justify-between mb-8 relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0" />
                      <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300" style={{ width: `${(campaignBuilder.step - 1) * 33.3}%` }} />
                      
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                            campaignBuilder.step > idx ? "bg-indigo-650 text-white" :
                            campaignBuilder.step === idx ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20" :
                            "bg-slate-100 text-slate-400 dark:bg-slate-900"
                          }`}>
                            {campaignBuilder.step > idx ? "✓" : idx}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${campaignBuilder.step === idx ? "text-indigo-600" : "text-slate-400"}`}>
                            {idx === 1 ? "Basics" : idx === 2 ? "Goal & Target" : idx === 3 ? "AI Content" : "Approval"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Basics */}
                    {campaignBuilder.step === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-sm font-bold text-slate-705 dark:text-white border-b pb-2">Campaign Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Campaign Name</label>
                            <input 
                              type="text"
                              value={campaignBuilder.name}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Diabetics Monsoon Checkup Invite"
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Outreach Channel</label>
                            <select 
                              value={campaignBuilder.channel}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, channel: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="WhatsApp Broadcast">WhatsApp Broadcast (Recommended)</option>
                              <option value="SMS Campaign">SMS Campaign</option>
                              <option value="Email Campaign">Email Campaign</option>
                              <option value="Festival Campaign">Festival Greeting Broadcast</option>
                              <option value="Health Awareness Campaign">Health Awareness Poster</option>
                              <option value="Vaccination Reminder">Vaccination Refill Reminder</option>
                              <option value="Medicine Reminder">Medicine Refill Reminder</option>
                              <option value="Review Request">Google Review Request</option>
                              <option value="Seasonal Campaign">Seasonal Epidemics Campaign</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Schedule Priority</label>
                            <select 
                              value={campaignBuilder.scheduleType}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, scheduleType: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="Immediate">Send Immediately</option>
                              <option value="Scheduled">Schedule For Later</option>
                              <option value="Recurring">Set Recurring Automation</option>
                            </select>
                          </div>
                          {campaignBuilder.scheduleType === "Scheduled" && (
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1">Target Dispatch Time</label>
                              <input 
                                type="datetime-local"
                                value={campaignBuilder.scheduleTime}
                                onChange={(e) => setCampaignBuilder(prev => ({ ...prev, scheduleTime: e.target.value }))}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                              />
                            </div>
                          )}
                        </div>

                        {/* AI timing toggler */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                            <div>
                              <p className="text-xs font-bold">AI Suggested Timing Optimizer</p>
                              <p className="text-[10px] text-slate-400">Queue campaign for optimal dispatch hours to maximize CTR rates.</p>
                            </div>
                          </div>
                          <input 
                            type="checkbox"
                            checked={campaignBuilder.aiTiming}
                            onChange={(e) => setCampaignBuilder(prev => ({ ...prev, aiTiming: e.target.checked }))}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Goal & Target */}
                    {campaignBuilder.step === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                        <h3 className="text-sm font-bold text-slate-705 dark:text-white border-b pb-2">Campaign Goal & Audience Segment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Core Campaign Goal</label>
                            <select 
                              value={campaignBuilder.goal}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, goal: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="Lead Generation">Lead Generation (New Patient Camp)</option>
                              <option value="Patient Retention">Patient Retention (Follow-up Checkup)</option>
                              <option value="Brand Building">Brand Building (Festival greeting)</option>
                              <option value="Refill Alert">Medicine Refill reminder</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Audience Segment Group</label>
                            <select 
                              value={campaignBuilder.targetAudienceId}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, targetAudienceId: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="">-- Choose Segment --</option>
                              {savedAudiences.map(aud => (
                                <option key={aud.id} value={aud.id}>{aud.name} ({aud.count} Patients)</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50/50 dark:bg-slate-900 rounded-2xl border border-indigo-150">
                          <p className="font-bold mb-1">Selected Segment Estimate:</p>
                          <p className="text-[10px] text-slate-400">
                            You are about to direct this outreach campaign to {campaignBuilder.targetAudienceId ? savedAudiences.find(a => a.id === campaignBuilder.targetAudienceId)?.count : 0} validated patient numbers.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: AI content prompt */}
                    {campaignBuilder.step === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                        <h3 className="text-sm font-bold text-slate-705 dark:text-white border-b pb-2">AI Copilot copy assistant</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Target Language Tone</label>
                            <select 
                              value={campaignBuilder.aiTone}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, aiTone: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="Professional">Professional (Informative & clinical)</option>
                              <option value="Friendly">Friendly (Warm & inviting)</option>
                              <option value="Emotional">Emotional (Empathy driven health safety)</option>
                              <option value="Promotional">Promotional (Value coupon focus)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Output Language</label>
                            <select 
                              value={campaignBuilder.aiLanguage}
                              onChange={(e) => setCampaignBuilder(prev => ({ ...prev, aiLanguage: e.target.value }))}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            >
                              <option value="English">English Only</option>
                              <option value="Marathi">Marathi Only (मराठी)</option>
                              <option value="Hindi">Hindi Only (हिंदी)</option>
                              <option value="Mixed Language">Mixed Hinglish Language</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">AI Prompt Instruction</label>
                          <textarea 
                            rows={3}
                            value={aiGenerator.prompt}
                            onChange={(e) => setAiGenerator(prev => ({ ...prev, prompt: e.target.value }))}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            placeholder="e.g. 10% discount on heart health diagnostics camp this Sunday at CareBridge clinic..."
                          />
                        </div>

                        <div className="flex justify-start">
                          <button 
                            onClick={() => {
                              if (!aiGenerator.prompt) {
                                alert("Please type a custom prompt instruction first!");
                                return;
                              }
                              setAiGenerator(prev => ({ ...prev, generating: true }));
                              setTimeout(() => {
                                setCampaignBuilder(prev => ({
                                  ...prev,
                                  aiGeneratedHeadline: "Protect Your Heart: Free Cardiac Consultations",
                                  aiGeneratedCaption: "CareBridge invites you for customized cardiac testing camp. Limited Sunday slots available.",
                                  aiGeneratedCTA: "Book Cardiac Slot Now"
                                }));
                                setAiGenerator(prev => ({ ...prev, generating: false }));
                              }, 1200);
                            }}
                            className="px-4 py-2.5 bg-teal-605 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" /> 
                            {aiGenerator.generating ? "AI generating templates..." : "Draft Campaign Copy Automatically"}
                          </button>
                        </div>

                        {campaignBuilder.aiGeneratedHeadline && (
                          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Headline Preview</span>
                              <p className="font-bold text-slate-700 dark:text-white">{campaignBuilder.aiGeneratedHeadline}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Body Copy</span>
                              <p className="text-slate-600 dark:text-slate-305">{campaignBuilder.aiGeneratedCaption}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">CTA Button</span>
                              <p className="font-bold text-indigo-650">{campaignBuilder.aiGeneratedCTA}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Preview & Launch */}
                    {campaignBuilder.step === 4 && (
                      <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                        <h3 className="text-sm font-bold text-slate-705 dark:text-white border-b pb-2">Approval & Final Review</h3>
                        <div className="bg-slate-50 dark:bg-slate-905 p-6 rounded-3xl space-y-4">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-405">Campaign Name:</span>
                            <span className="font-bold">{campaignBuilder.name || "AI Outreach Broadcast"}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-405">Recipient Target:</span>
                            <span className="font-bold text-indigo-650">
                              {campaignBuilder.targetAudienceId ? savedAudiences.find(a => a.id === campaignBuilder.targetAudienceId)?.name : "Dynamic Filters"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-405">Channel Mode:</span>
                            <span className="font-bold">{campaignBuilder.channel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-405">AI Suggested Schedule:</span>
                            <span className="font-bold text-emerald-650">Optimal (4:00 PM Sunday)</span>
                          </div>
                        </div>

                        <div className="bg-indigo-500/10 p-4 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-300">
                          <Info className="w-5 h-5 shrink-0" />
                          <p className="text-[10px] leading-relaxed">
                            Once launched, the gateway will process the dispatch using standard queue mechanisms. Live delivery status can be tracked directly in the main Dashboard logs.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stepper control buttons */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <button 
                        onClick={() => setCampaignBuilder(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }))}
                        disabled={campaignBuilder.step === 1}
                        className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-655 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                      >
                        Go Back
                      </button>

                      {campaignBuilder.step < 4 ? (
                        <button 
                          onClick={() => setCampaignBuilder(prev => ({ ...prev, step: prev.step + 1 }))}
                          className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={handleCreateCampaignFromWizard}
                          className="px-8 py-2.5 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                        >
                          Approve & Launch Campaign <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Poster Studio */}
              {activeTab === "poster_studio" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI Poster Studio</h2>
                      <p className="text-xs text-slate-400">Design health tips & doctor promotional banners instantly</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Canvas Controller */}
                    <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      {/* Automatically AI Generate Poster */}
                      <div className="p-3 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 rounded-2xl space-y-2">
                        <label className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Automatically AI Generate Poster</label>
                        <div className="flex gap-2">
                          <select 
                            value={aiPosterTopic}
                            onChange={(e) => setAiPosterTopic(e.target.value)}
                            className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl text-xs font-semibold"
                          >
                            {aiPosterTopicsList.map(t => (
                              <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => autoGenerateAIPoster(aiPosterTopic)}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> AI Run
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Select Ready Theme</label>
                        <select 
                          value={posterStudio.category}
                          onChange={(e) => setPosterStudio(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl font-semibold"
                        >
                          <option value="General Medicine">General Medicine checkup</option>
                          <option value="Diabetes">Diabetic Care camp</option>
                          <option value="Dental">Dental Care camp</option>
                          <option value="Vaccination">Vaccination Reminder</option>
                          <option value="Ayurveda">Ayurveda consults</option>
                          <option value="Women's Health">Pregnancy checkup</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Headline Text</label>
                        <input 
                          type="text" 
                          value={posterStudio.headline}
                          onChange={(e) => setPosterStudio(prev => ({ ...prev, headline: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Description Copy</label>
                        <textarea 
                          rows={3} 
                          value={posterStudio.description}
                          onChange={(e) => setPosterStudio(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-404 font-bold mb-1">Brand Main Color</label>
                          <input 
                            type="color" 
                            value={posterStudio.brandColor}
                            onChange={(e) => setPosterStudio(prev => ({ ...prev, brandColor: e.target.value }))}
                            className="w-full h-9 p-1 bg-slate-50 rounded-xl cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-404 font-bold mb-1">CTA Text</label>
                          <input 
                            type="text" 
                            value={posterStudio.cta}
                            onChange={(e) => setPosterStudio(prev => ({ ...prev, cta: e.target.value }))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Photo Upload Triggers */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-[10px] font-bold text-slate-404 uppercase">Logo & Photos Branding</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setPosterStudio(prev => ({ ...prev, logoUploaded: true }))}
                            className={`p-2 border rounded-xl text-center font-bold text-[10px] truncate ${posterStudio.logoUploaded ? "bg-teal-50 border-teal-300 text-teal-700" : "bg-slate-50 hover:bg-slate-100"}`}
                          >
                            {posterStudio.logoUploaded ? "Logo Added" : "+ Clinic Logo"}
                          </button>
                          <button 
                            onClick={() => setPosterStudio(prev => ({ ...prev, doctorPhotoUploaded: true }))}
                            className={`p-2 border rounded-xl text-center font-bold text-[10px] truncate ${posterStudio.doctorPhotoUploaded ? "bg-teal-50 border-teal-300 text-teal-700" : "bg-slate-50 hover:bg-slate-100"}`}
                          >
                            {posterStudio.doctorPhotoUploaded ? "Photo Added" : "+ Doctor Photo"}
                          </button>
                          <button 
                            onClick={() => setPosterStudio(prev => ({ ...prev, clinicPhotoUploaded: true }))}
                            className={`p-2 border rounded-xl text-center font-bold text-[10px] truncate ${posterStudio.clinicPhotoUploaded ? "bg-teal-50 border-teal-300 text-teal-700" : "bg-slate-50 hover:bg-slate-100"}`}
                          >
                            {posterStudio.clinicPhotoUploaded ? "Clinic Image" : "+ Clinic Image"}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200/50 dark:bg-slate-800 my-4" />

                      {/* AI Image prompt inside Poster studio */}
                      <div className="space-y-2">
                        <label className="block text-slate-404 font-bold">AI Poster Background Image Generator</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="e.g. cartoon stethoscope with happy family..."
                            value={posterStudio.aiPrompt}
                            onChange={(e) => setPosterStudio(prev => ({ ...prev, aiPrompt: e.target.value }))}
                            className="flex-1 p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          />
                          <button 
                            onClick={() => {
                              if (!posterStudio.aiPrompt) return;
                              setPosterStudio(prev => ({ ...prev, aiImageLoading: true }));
                              setTimeout(() => {
                                setPosterStudio(prev => ({ 
                                  ...prev, 
                                  aiImageLoading: false, 
                                  generatedImageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" 
                                }));
                              }, 1500);
                            }}
                            className="px-3 bg-indigo-600 text-white rounded-xl font-bold"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Canvas Preview Area */}
                    <div className="lg:col-span-8 bg-slate-200/50 dark:bg-slate-955 p-6 rounded-3xl border border-slate-100 dark:border-slate-900/60 flex flex-col items-center justify-between">
                      
                      <div className="w-full flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-404 uppercase">Live Canvas Preview</span>
                        <div className="flex items-center gap-2 text-xs">
                          <select 
                            value={posterStudio.exportFormat}
                            onChange={(e) => setPosterStudio(prev => ({ ...prev, exportFormat: e.target.value }))}
                            className="p-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold"
                          >
                            <option value="PNG">PNG Export</option>
                            <option value="PDF">PDF Print</option>
                          </select>
                          <button 
                            onClick={() => alert(`Exporting poster as ${posterStudio.exportFormat}... Done!`)}
                            className="px-3 py-1.5 bg-slate-905 hover:bg-black text-white dark:bg-white dark:text-slate-905 rounded-xl font-bold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Export
                          </button>
                        </div>
                      </div>

                      {/* Poster Mock Box */}
                      <div 
                        className="w-full max-w-[340px] aspect-square rounded-2xl shadow-xl overflow-hidden relative flex flex-col justify-between p-6 bg-white transition-all text-slate-800"
                        style={{ borderTop: `8px solid ${posterStudio.brandColor}` }}
                      >
                        {/* Header logo row */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-150 flex items-center justify-center font-black text-[10px] text-slate-600 uppercase">
                              {posterStudio.logoUploaded ? "LOGO" : "CB"}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider">CareBridge Clinic</p>
                              <p className="text-[8px] font-bold text-slate-400">Trusted Family Care</p>
                            </div>
                          </div>
                          {posterStudio.doctorPhotoUploaded && (
                            <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-xs">
                              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80" alt="Doctor" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        {/* Mid background if generated */}
                        {posterStudio.generatedImageUrl ? (
                          <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${posterStudio.generatedImageUrl})` }} />
                        ) : null}

                        {/* Mid core layout */}
                        <div className="my-auto space-y-2 relative z-10 text-center">
                          <h4 
                            className="text-lg font-black tracking-tight leading-tight uppercase"
                            style={{ color: posterStudio.brandColor }}
                          >
                            {posterStudio.headline}
                          </h4>
                          <p className="text-[10px] text-slate-555 font-medium leading-relaxed">
                            {posterStudio.description}
                          </p>
                        </div>

                        {/* CTA Footer banner */}
                        <div 
                          className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white tracking-wide mt-2 shadow-xs"
                          style={{ backgroundColor: posterStudio.brandColor }}
                        >
                          {posterStudio.cta}
                        </div>
                      </div>

                      <div className="w-full text-center mt-4">
                        <button 
                          onClick={() => {
                            alert("Sharing directly to connected clinic numbers...");
                          }}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Share2 className="w-4 h-4" /> Share Directly to WhatsApp Status
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 5: WhatsApp Post Creator with Resizer */}
              {activeTab === "whatsapp_creator" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">WhatsApp Post & Story Creator</h2>
                      <p className="text-xs text-slate-400">Generate, resize, and dispatch high engagement assets for WhatsApp statuses</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left sizing and captions input */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-5 text-xs">
                      {/* Automatically AI Generate WhatsApp Message */}
                      <div className="p-3 bg-emerald-50/30 dark:bg-slate-900 border border-emerald-100/50 dark:border-emerald-950 rounded-2xl space-y-2">
                        <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Automatically AI Generate WhatsApp Message</label>
                        <div className="flex gap-2">
                          <select 
                            value={aiWhatsAppTopic}
                            onChange={(e) => setAiWhatsAppTopic(e.target.value)}
                            className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-202 rounded-xl text-xs font-semibold"
                          >
                            {aiWhatsAppTopicsList.map(t => (
                              <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => autoGenerateAIWhatsApp(aiWhatsAppTopic)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> AI Run
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-2">Select Canvas Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "square", label: "Square (1:1)" },
                            { id: "portrait", label: "Portrait (4:5)" },
                            { id: "story", label: "Story/Status (9:16)" }
                          ].map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setWaCreator(prev => ({ ...prev, aspectRatio: a.id }))}
                              className={`p-3 border rounded-xl text-center font-bold ${waCreator.aspectRatio === a.id ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "bg-slate-50 hover:bg-slate-100"}`}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">AI Suggested Caption Copy</label>
                        <textarea 
                          rows={4}
                          value={waCreator.caption}
                          onChange={(e) => setWaCreator(prev => ({ ...prev, caption: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      {/* Emojis suggested */}
                      <div>
                        <span className="block text-slate-404 font-bold mb-1">Suggested Emoji Enhancers</span>
                        <div className="flex gap-2">
                          {waCreator.suggestedEmojis.map((emoji, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setWaCreator(prev => ({ ...prev, caption: prev.caption + " " + emoji }))}
                              className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center hover:scale-105 transition-all text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Interactive Call To Action (CTA)</label>
                        <input 
                          type="text" 
                          value={waCreator.cta}
                          onChange={(e) => setWaCreator(prev => ({ ...prev, cta: e.target.value }))}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Right Resized preview wrapper */}
                    <div className="lg:col-span-7 bg-slate-250 dark:bg-slate-955 p-6 rounded-3xl border border-slate-100 dark:border-slate-900/60 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-slate-455 uppercase mb-4">Auto-Resized Preview ({waCreator.aspectRatio})</span>
                      
                      <div 
                        className={`bg-white text-slate-800 shadow-xl rounded-2xl overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 ${
                          waCreator.aspectRatio === "square" ? "w-[260px] aspect-square" :
                          waCreator.aspectRatio === "portrait" ? "w-[240px] h-[300px]" :
                          "w-[200px] h-[356px]" // Story status aspect ratio
                        }`}
                      >
                        <div className="border-b pb-2">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">🟢 Whatsapp status template</p>
                        </div>
                        <div className="my-auto space-y-2 text-center">
                          <p className="text-xs font-bold leading-normal text-slate-705">
                            {waCreator.caption}
                          </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 font-bold text-[10px] py-2 rounded-xl text-center border border-emerald-200">
                          {waCreator.cta}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          alert("WhatsApp post dispatched to client list!");
                        }}
                        className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> One Click dispatch
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 6: Broadcast Module */}
              {activeTab === "broadcast" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Broadcast Module</h2>
                      <p className="text-xs text-slate-400">Launch urgent manual or scheduled campaigns instantly</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    
                    {/* Broadcast Form */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      <h3 className="text-xs font-bold text-slate-404 uppercase tracking-wider mb-2">Outbox configuration</h3>
                      
                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Broadcast Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Free Eye Diagnostics camp"
                          value={broadcastForm.name}
                          onChange={(e) => setBroadcastForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-404 font-bold mb-1">Target Audience Group</label>
                        <select 
                          value={broadcastForm.selectedAudienceId}
                          onChange={(e) => setBroadcastForm(prev => ({ ...prev, selectedAudienceId: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                        >
                          <option value="">Choose Dynamic Segment (Loads Patient Count)</option>
                          {savedAudiences.map(aud => (
                            <option key={aud.id} value={aud.id}>{aud.name} ({aud.count} Patients)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-455 font-bold mb-1">Gateway Channel</label>
                        <select 
                          value={broadcastForm.channel}
                          onChange={(e) => setBroadcastForm(prev => ({ ...prev, channel: e.target.value }))}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl font-bold"
                        >
                          <option value="WhatsApp">WhatsApp Gateway API</option>
                          <option value="SMS">National Telecom SMS Gateway</option>
                          <option value="Email">Secure SMTP Mail server</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-404 font-bold mb-1">Dispatch Mode</label>
                          <select 
                            value={broadcastForm.scheduleType}
                            onChange={(e) => setBroadcastForm(prev => ({ ...prev, scheduleType: e.target.value }))}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                          >
                            <option value="immediate">Immediate Dispatch</option>
                            <option value="scheduled">Schedule dispatch</option>
                          </select>
                        </div>
                        {broadcastForm.scheduleType === "scheduled" && (
                          <div>
                            <label className="block text-slate-404 font-bold mb-1">Target Date</label>
                            <input 
                              type="datetime-local" 
                              value={broadcastForm.scheduleDate}
                              onChange={(e) => setBroadcastForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-905 border border-slate-202 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={startBroadcast}
                          disabled={broadcastStatus === "sending"}
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" /> Start Broadcast Run
                        </button>
                      </div>
                    </div>

                    {/* Progress Console Output */}
                    <div className="bg-[#111827] text-slate-100 p-6 rounded-3xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold tracking-wider text-slate-450 uppercase">Gateway progress console</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            broadcastStatus === "sending" ? "bg-blue-500 text-white animate-pulse" :
                            broadcastStatus === "completed" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}>
                            {broadcastStatus}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {broadcastProgress >= 0 && (
                          <div className="space-y-1.5">
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${broadcastProgress}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                              <span>Dispatched: {broadcastProgress}%</span>
                              <span>Est Delivery: ~1 min remaining</span>
                            </div>
                          </div>
                        )}

                        {/* Logs stack */}
                        <div className="bg-black/40 rounded-2xl p-4 h-48 overflow-y-auto text-[10px] font-mono space-y-1 text-slate-300">
                          {broadcastLogs.map((log, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                              <span>{log}</span>
                            </div>
                          ))}
                          {broadcastLogs.length === 0 && (
                            <p className="text-slate-500 italic">Logs console idle. Trigger a broadcast to view trace signals.</p>
                          )}
                        </div>
                      </div>

                      {broadcastStatus === "failed" && (
                        <button 
                          onClick={startBroadcast}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                        >
                          Retry Failed Dispatches
                        </button>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Tab 7: Automation Hub */}
              {activeTab === "automation" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Clinic Automation Workflows</h2>
                      <p className="text-xs text-slate-400">Trigger patient greetings, follow-ups, and review alerts automatically</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map(auto => (
                      <div 
                        key={auto.id}
                        className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border shadow-xs transition-all flex flex-col justify-between ${
                          auto.active ? "border-teal-200 dark:border-teal-900" : "border-slate-200/60 dark:border-slate-800"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 dark:text-white">{auto.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{auto.channel}</span>
                              
                              {/* Active Switch toggler */}
                              <button 
                                onClick={() => {
                                  setAutomations(automations.map(a => a.id === auto.id ? { ...a, active: !a.active } : a));
                                }}
                                className={`w-8 h-4 rounded-full transition-all relative ${auto.active ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`}
                              >
                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${auto.active ? "right-0.5" : "left-0.5"}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{auto.desc}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Triggered: <strong className="text-slate-655 dark:text-slate-350">Daily 10:00 AM</strong></span>
                          <button 
                            onClick={() => alert(`Configuring templates for ${auto.type}`)}
                            className="text-indigo-650 hover:underline font-bold"
                          >
                            Edit Rule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 8: Template Library */}
              {activeTab === "templates" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Promotional Templates Manager</h2>
                      <p className="text-xs text-slate-400">Create, edit, duplicate and bookmark outreach designs</p>
                    </div>
                    <button 
                      onClick={() => alert("Creating a new blank layout template...")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Custom Template
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(t => (
                      <div key={t.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-500 px-2.5 py-0.5 rounded-full">
                              {t.category}
                            </span>
                            
                            {/* Favorite toggle bookmark */}
                            <button 
                              onClick={() => {
                                setTemplates(templates.map(temp => temp.id === t.id ? { ...temp, favorite: !temp.favorite } : temp));
                              }}
                              className="text-slate-400 hover:text-amber-500 transition-colors"
                            >
                              <Star className={`w-4 h-4 ${t.favorite ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-white">{t.name}</h4>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Rating: <strong className="text-slate-655 dark:text-slate-350">{t.rating} ★</strong></span>
                          <div className="space-x-2">
                            <button 
                              onClick={() => alert(`Duplicating layout ${t.name}...`)}
                              className="text-slate-505 hover:underline font-semibold"
                            >
                              Duplicate
                            </button>
                            <button 
                              onClick={() => alert(`Sharing template ${t.name}...`)}
                              className="text-indigo-600 hover:underline font-bold"
                            >
                              Dispatch/Use
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 9: Insights & Deep Analytics */}
              {activeTab === "analytics" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Marketing Analytics Hub</h2>
                      <p className="text-xs text-slate-400">Deep campaign ROI, read rates, and patient acquisition growth stats</p>
                    </div>

                    <div className="flex gap-2">
                      <select 
                        value={analyticsTimeframe}
                        onChange={(e) => setAnalyticsTimeframe(e.target.value as any)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 px-3 py-1.5 rounded-xl text-xs font-bold"
                      >
                        <option value="daily">Daily report</option>
                        <option value="weekly">Weekly report</option>
                        <option value="monthly">Monthly report</option>
                      </select>
                      <button 
                        onClick={() => alert("Generating marketing PDF performance audit report...")}
                        className="px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <FileDown className="w-4 h-4" /> Export Report
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Line Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider mb-6">Patient Acquisition Revenue & Reach Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartsData}>
                            <defs>
                              <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey="revenue" name="Acquisition Revenue (₹)" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAcq)" />
                            <Area type="monotone" dataKey="reach" name="Total Reach" stroke="#0d9488" strokeWidth={3} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Disease/Speciality breakdown representation */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider mb-4">Disease Wise Campaign Success</h3>
                      
                      <div className="h-44 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={diseaseBreakdownData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {diseaseBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-2 pt-2">
                        {diseaseBreakdownData.map(item => (
                          <div key={item.name} className="flex justify-between items-center text-[11px] font-bold">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-500">{item.name}</span>
                            </div>
                            <span>{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 10: System Notifications Alerts Log */}
              {activeTab === "notifications" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">Marketing Alerts & Logs</h2>
                      <p className="text-xs text-slate-400">Security audit trace and credit status logs</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-xs font-bold text-indigo-650 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-5 flex gap-4 items-start ${n.read ? "opacity-75" : "bg-indigo-50/10"}`}>
                        <div className="mt-1">
                          {n.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                           n.type === "failed" ? <X className="w-5 h-5 text-rose-500" /> :
                           n.type === "warning" ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                           <Info className="w-5 h-5 text-indigo-500" />}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-700 dark:text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-slate-555 font-semibold leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}

        </main>

      </div>

    </div>
  );
}
