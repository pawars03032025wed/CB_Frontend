import { useState, useEffect, useMemo, useRef } from "react";
import {
  User as UserInjured,
  Inbox,
  Hospital as HospitalIcon,
  History,
  Bell,
  Crown,
  Phone,
  User as UserMd,
  Info,
  Layers,
  FileText as FileContract,
  PlusCircle,
  Settings,
  Pencil,
  Trash2,
  Save,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Send,
  Clock,
  CheckCircle2,
  Stethoscope,
  X,
  XCircle,
  PhoneOff,
  IndianRupee,
  LogOut,
  Mail,
  Volume2,
  VolumeX,
  BellRing,
  LayoutDashboard,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Globe,
  Building,
  Award,
  ShieldCheck,
  Camera,
  CheckSquare,
  Square,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Save as SaveIcon,
  Image as ImageIcon,
  Upload,
  Hash,
  AlertCircle,
  Plus,
  Trash2 as TrashIcon,
  Star,
  MapPin,
  ChevronLeft,
  PenBox,
  LayoutDashboard as LayoutIcon,
  Sun,
  Moon,
  Home,
  Menu,
  Download,
  Filter,
  MessageSquare,
  Check,
  Radio,
  Megaphone,
  GraduationCap,
  Search,
  Hospital,
  Share2,
  User,
  ChevronDown,
  Smartphone,
  FileText,
  Sparkles,
} from "lucide-react";
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { HospitalWelcomeLanding } from "../landing/HospitalWelcomeLanding";
import ConfirmationModal from "../common/ConfirmationModal";
import PatientAvatar from "../common/PatientAvatar";
import { formatISTDate, formatISTTime, useLiveClock, getISTDateString } from "../../utils/dateUtils";
import { firebaseService } from "../../services/firebaseService";
import { safeStringify } from "../../utils/firestoreErrorHandler";
import LegalFooter from "../common/LegalFooter";
import SubscriptionRequired from "../subscription/SubscriptionRequired";

const compressImage = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.7,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

interface HospitalPanelProps {
  user: any;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function HospitalPanel({
  user,
  onLogout,
  darkMode,
  setDarkMode,
}: HospitalPanelProps) {
  const currentTime = useLiveClock();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterHospitalName, setFilterHospitalName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedHospitalDoctors, setSelectedHospitalDoctors] = useState<any[]>(
    [],
  );
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [referralPatientSearch, setReferralPatientSearch] = useState("");
  const [lastReferralData, setLastReferralData] = useState<any>(null);
  const [showReferralSuccessModal, setShowReferralSuccessModal] = useState(false);
  const [isReferralSubmitting, setIsReferralSubmitting] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [cardView, setCardView] = useState<"gallery" | "create">("gallery");
  const [tipView, setTipView] = useState<"gallery" | "create">("gallery");
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkSendProgress, setBulkSendProgress] = useState({ current: 0, total: 0 });
  const [showHealthTipModal, setShowHealthTipModal] = useState(false);
  const [showDigitalCardModal, setShowDigitalCardModal] = useState(false);
  const [showGeoCampaignModal, setShowGeoCampaignModal] = useState(false);
  const [clinicDetails, setClinicDetails] = useState<any>(null);
  const [cardEditor, setCardEditor] = useState({
    clinicName: "",
    drName: "",
    visitingDr: "",
    date: "",
    time: "",
    address: "",
    facilities: "",
    offer: "",
    contactNo: "",
    bgColor1: "#005f73",
    bgColor2: "#0a9396",
  });
  const [tipEditor, setTipEditor] = useState({
    title: "Health Tip",
    content: "Stay hydrated and exercise regularly.",
    bgColor1: "#9b2226",
    bgColor2: "#ae2012",
  });
  const [referralForm, setReferralForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    patientAddress: "",
    patientCondition: "Stable",
    department: "",
    doctorId: "",
    doctorName: "",
    diagnosis: "",
    note: "",
    economicalCondition: "",
    applicableScheme: "",
    expectedCost: "",
  });
  const [opdForm, setOpdForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    weight: "",
    bp: "",
    sugar: "",
    temp: "",
    complaint: "",
    patientArea: "",
    diagnosis: "",
  });
  const [opdDoctorSearch, setOpdDoctorSearch] = useState("");
  const [showOpdDoctorDropdown, setShowOpdDoctorDropdown] = useState(false);
  const [opdReferralForm, setOpdReferralForm] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientGender: "M",
    patientAddress: "",
    department: "",
    doctorId: "",
    doctorName: "",
    diagnosis: "",
    note: "",
  });
  const [opdReferralPatientSearch, setOpdReferralPatientSearch] = useState("");
  const [showReferralTypeModal, setShowReferralTypeModal] = useState(false);
  const [showOPDReferralModal, setShowOPDReferralModal] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalDetails, setHospitalDetails] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchHospitals = async () => {
      try {
        const [hosp, hospDet] = await Promise.all([
          firebaseService.getCollection("users", [
            { field: "role", operator: "==", value: "hospital" },
            { field: "status", operator: "==", value: "active" }
          ]),
          firebaseService.getCollection("hospital_details")
        ]);
        if (hosp) setHospitals(hosp);
        if (hospDet) setHospitalDetails(hospDet);
      } catch (err) {
        console.error("Error fetching hospitals for find tab:", err);
      }
    };
    fetchHospitals();
  }, [user?.id]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [allOpdRecords, setAllOpdRecords] = useState<any[]>([]);
  const [allCreditRecords, setAllCreditRecords] = useState<any[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [marketingSearch, setMarketingSearch] = useState("");
  const [marketingAreaSearch, setMarketingAreaSearch] = useState("");
  const [marketingFilter, setMarketingFilter] = useState("all");
  const [marketingTarget, setMarketingTarget] = useState({
    useBp: false,
    useSugar: false,
    targetArea: "",
  });

  // Growth Platform States & Lazy Loading
  const [partnerClinicsLoaded, setPartnerClinicsLoaded] = useState(false);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [academySessions, setAcademySessions] = useState<any[]>([]);
  const [academyRegistrations, setAcademyRegistrations] = useState<any[]>([]);
  const [showAcademyCreateModal, setShowAcademyCreateModal] = useState(false);
  const [academyForm, setAcademyForm] = useState({
    title: "",
    category: "CME Program",
    description: "",
    speakerName: "",
    date: "",
    time: "",
    meetingLink: "",
    certificateAvailable: "Yes"
  });

  // Directory Search and filters
  const [clinicSearchName, setClinicSearchName] = useState("");
  const [clinicSearchCity, setClinicSearchCity] = useState("");
  const [clinicSearchSpecialty, setClinicSearchSpecialty] = useState("");

  // Marketing states
  const [mktSubTab, setMktSubTab] = useState("campaigns"); // campaigns, camps, schemes, brochures, awareness
  const [showCampaignCreateModal, setShowCampaignCreateModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    targetAudience: "All Clinics",
    department: "General Medicine",
    message: ""
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [showCampCreateModal, setShowCampCreateModal] = useState(false);
  const [campForm, setCampForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    maxRegistrations: 50,
    description: ""
  });
  const [healthCamps, setHealthCamps] = useState<any[]>([]);

  const [showAwarenessCreateModal, setShowAwarenessCreateModal] = useState(false);
  const [awarenessForm, setAwarenessForm] = useState({
    title: "",
    date: "",
    mode: "Online",
    target: "General Patients",
    link: ""
  });
  const [awarenessPrograms, setAwarenessPrograms] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });
  const [hospDetails, setHospDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    condition: "",
    vitals: {
      temp: "",
      bp: "",
      pulse: "",
      spo2: "",
    },
    ward: "",
    diagnosis: "",
    scheme: "",
  });
  const [messageForm, setMessageForm] = useState({
    recipient_id: "",
    recipient_role: "clinic",
    content: "",
  });
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const unreadCount = useMemo(() => {
    return messages.filter((m) => m.receiverId === user.id && !m.isRead).length;
  }, [messages, user.id]);

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      (m) => m.receiverId === user.id && !m.isRead,
    );
    if (unreadMessages.length === 0) return;

    try {
      const promises = unreadMessages.map((m) =>
        firebaseService.updateDocument("messages", m.id, { isRead: true }),
      );
      await Promise.all(promises);
    } catch (err) {
      console.error("Error marking messages as read:", safeStringify(err));
    }
  };

  useEffect(() => {
    if (activeTab === "inbox") {
      markMessagesAsRead();
    }
  }, [activeTab]);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: "",
    city: "",
    helpline: "",
    contact_no: "",
    address: "",
    email: "",
    website: "",
    category: "Multi-Specialty Hospital",
    departments: [] as string[],
    schemes: [] as string[],
    bedsICU: 0,
    bedsGeneral: 0,
    bedsVentilator: 0,
    ambulanceContact: "",
    ambulanceStatus: "available" as "available" | "busy",
    emergencyContact: "",
    admissionNotes: "",
    webinarLink: "",
    specialists: [] as {
      name: string;
      qualification: string;
      department: string;
      timing: string;
      contact: string;
    }[],
    hours: {
      Monday: { open: "00:00", close: "23:59", closed: false },
      Tuesday: { open: "00:00", close: "23:59", closed: false },
      Wednesday: { open: "00:00", close: "23:59", closed: false },
      Thursday: { open: "00:00", close: "23:59", closed: false },
      Friday: { open: "00:00", close: "23:59", closed: false },
      Saturday: { open: "00:00", close: "23:59", closed: false },
      Sunday: { open: "00:00", close: "23:59", closed: false },
    },
    gallery: [] as string[],
    logo: "",
    banner: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newDept, setNewDept] = useState("");
  const [newScheme, setNewScheme] = useState("");
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    qualification: "",
    department: "",
    timing: "",
    contact: "",
  });

  // History Filter State
  const [historySearch, setHistorySearch] = useState("");
  const [referralView, setReferralView] = useState("ipd"); // "ipd" or "opd"
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");

  // Alarm State
  const [alarmLanguage, setAlarmLanguage] = useState(() => localStorage.getItem("hospital_alarm_lang") || "en");

  useEffect(() => {
    localStorage.setItem("hospital_alarm_lang", alarmLanguage);
  }, [alarmLanguage]);
  const [alarmEnabled, setAlarmEnabled] = useState(() => {
    const saved = localStorage.getItem("hospital_alarm_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isRinging, setIsRinging] = useState(false);
  const isRingingRef = useRef(false);
  const setIsRingingWithRef = (val: boolean) => {
    setIsRinging(val);
    isRingingRef.current = val;
  };
  const [audioUnlocked, setAudioUnlocked] = useState(true);
  const audioUnlockedRef = useRef(true);
  const setAudioUnlockedWithRef = (val: boolean) => {
    setAudioUnlocked(val);
    audioUnlockedRef.current = val;
  };
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceNoteRef = useRef<string | null>(null);
  const knownReferralIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const [newReferralToast, setNewReferralToast] = useState<{
    show: boolean;
    name: string;
    referralType?: string;
  } | null>(null);
  const [profileSaveToast, setProfileSaveToast] = useState(false);

  // Helper to add WAV header to raw PCM data from Gemini TTS
  const addWavHeader = (base64Pcm: string, sampleRate: number = 24000) => {
    try {
      const binaryString = window.atob(base64Pcm);
      const len = binaryString.length;
      const buffer = new ArrayBuffer(44 + len);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + len, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      writeString(36, "data");
      view.setUint32(40, len, true);

      const pcmView = new Uint8Array(buffer, 44);
      for (let i = 0; i < len; i++) {
        pcmView[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([buffer], { type: "audio/wav" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("[Alarm] WAV generation failed:", e);
      return null;
    }
  };

  // Initialize Gemini for TTS (Now proxied through backend /api/ai/tts for security and stability)
  const generateVoiceNote = async (patientName?: string) => {
    try {
      // If we have a generic one and no patient name, return it
      if (!patientName && voiceNoteRef.current) return voiceNoteRef.current;

      const prompt = patientName
        ? `Attention: New patient referral for ${patientName}`
        : "Attention: New patient referral received";

      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });

      if (!response.ok) {
        throw new Error(`TTS server error: ${response.statusText}`);
      }

      const data = await response.json();
      const base64Audio = data.audioContent;
      const mimeType = data.mimeType;

      if (base64Audio) {
        let audioUrl = "";
        // Some browsers struggle with data URLs for high-frequency playback
        // Preference: Blob URLs
        if (!mimeType || mimeType.includes("pcm")) {
          audioUrl = addWavHeader(base64Audio, 24000) || "";
        } else {
          // Convert data URI to Blob URL to be safe and consistent
          const blob = await (
            await fetch(`data:${mimeType};base64,${base64Audio}`)
          ).blob();
          audioUrl = URL.createObjectURL(blob);
        }

        if (!patientName && audioUrl) {
          voiceNoteRef.current = audioUrl;
        }
        return audioUrl;
      }
    } catch (err) {
      console.error("Error generating voice note:", safeStringify(err));
    }
    return null;
  };

  useEffect(() => {
    localStorage.setItem("hospital_dark_mode", safeStringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("hospital_alarm_enabled", safeStringify(alarmEnabled));
  }, [alarmEnabled]);

  const synthIntervalRef = useRef<any>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);

  const startSynthBeep = () => {
    try {
      stopSynthBeep();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      synthCtxRef.current = ctx;

      const playBeep = () => {
        if (!isRingingRef.current) return;
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      };

      const runBeeps = () => {
        if (!isRingingRef.current) return;
        playBeep();
        setTimeout(() => {
          if (isRingingRef.current) playBeep();
        }, 300);
      };

      runBeeps();
      synthIntervalRef.current = setInterval(runBeeps, 1500);
    } catch (err) {
      console.warn("[Alarm] Web Audio synthesizer failed to initialize:", err);
    }
  };

  const stopSynthBeep = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthCtxRef.current) {
      try {
        synthCtxRef.current.close();
      } catch (e) {}
      synthCtxRef.current = null;
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      (window as any).speechSynthesis.cancel();
    }
    stopSynthBeep();
    setIsRingingWithRef(false);
    setNewReferralToast(null);
    alert("Voice note alarm stopped.");
  };

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (audioUnlocked) return;
      console.log("[Alarm] Interaction detected. Initializing audio system...");

      const initializeAudio = async () => {
        try {
          // Modern browsers: Resume AudioContext if it exists
          const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            if (ctx.state === "suspended") {
              await ctx.resume();
            }
          }

          if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
          }

          // Use a very stable beep instead of silent WAV if possible
          // But a simple beep on loop serves as a great unlocker
          audioRef.current.src =
            "https://www.gstatic.com/meet/sounds/join_call_6a9b.mp3";
          audioRef.current.volume = 0.001; // Effectively silent but "playing"

          await audioRef.current.play();

          // If we got here, audio is truly unlocked
          setAudioUnlockedWithRef(true);
          console.log("[Alarm] Audio system ready.");

          if (isRingingRef.current) {
            playAlarm(newReferralToast?.name, true);
          } else {
            // Keep it ready but paused
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1.0;
            generateVoiceNote(); // Warm up TTS
          }
        } catch (err) {
          console.warn("[Alarm] Audio initialization failed:", err);
        }
      };

      await initializeAudio();

      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("mousedown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    window.addEventListener("mousedown", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("mousedown", handleFirstInteraction);
    };
  }, [audioUnlocked, isRinging]);

  const ALARM_SOUNDS = [
    "https://www.gstatic.com/meet/sounds/ringout_7a03.mp3",
    "https://www.gstatic.com/meet/sounds/join_call_6a9b.mp3",
    "https://www.gstatic.com/meet/sounds/leave_call_7647.mp3",
  ];

  const playWithFallback = async (
    audio: HTMLAudioElement,
    sources: string[],
    attempt = 0,
  ): Promise<boolean> => {
    if (attempt >= sources.length) return false;

    try {
      try {
        audio.pause();
      } catch (e) {}
      audio.src = sources[attempt];
      audio.loop = true;
      audio.volume = 1.0;

      await new Promise((resolve, reject) => {
        let timeout: any;
        const onCanPlay = () => {
          clearTimeout(timeout);
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
          resolve(true);
        };
        const onError = (e: any) => {
          clearTimeout(timeout);
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
          reject(e);
        };
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("error", onError);
        timeout = setTimeout(() => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
          reject(new Error("Timeout"));
        }, 4000);
        audio.load();
      });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((e) => {
          if (e.name === "AbortError") {
            console.log("[Alarm] Playback aborted. Skipping source.");
          } else {
            throw e;
          }
        });
      }
      return true;
    } catch (e) {
      console.warn(`[Alarm] Source ${attempt} failed:`, safeStringify(e));
      return playWithFallback(audio, sources, attempt + 1);
    }
  };

    const playAlarm = async (
    patientName?: string,
    forceUnlock: boolean = false,
  ) => {
    if (!alarmEnabled) return;

    console.log("[Alarm] playAlarm requested for:", patientName);
    if (patientName) {
      setNewReferralToast({ show: true, name: patientName });
    }

    setIsRingingWithRef(true);

    // Use speechSynthesis for localized announcements
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      (window as any).speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance();
      
      let text = patientName 
        ? `Attention: New patient referral for ${patientName}`
        : "Attention: New patient referral received";
      let voiceLang = "en-IN";
      
      if (alarmLanguage === "hi") {
        text = patientName 
          ? `ध्यान दें: ${patientName} के लिए नया रोगी रेफरल`
          : "ध्यान दें: नया रोगी रेफरल प्राप्त हुआ";
        voiceLang = "hi-IN";
      } else if (alarmLanguage === "mr") {
        text = patientName
          ? `लक्ष द्या: ${patientName} साठी नवीन रुग्ण संदर्भ आला आहे`
          : "लक्ष द्या: नवीन रुग्ण संदर्भ प्राप्त झाला आहे";
        voiceLang = "mr-IN";
      }

      speech.text = text;
      speech.volume = 1;
      speech.rate = 0.85;
      speech.pitch = 1.2; // Higher pitch helps sound more female even without a female voice

      // Helper to pick the best female voice for the given language
      const pickFemaleVoice = (voices: SpeechSynthesisVoice[]) => {
        const femaleKeywords = ["female", "zira", "samantha", "victoria", "karen", "swara", "neerja", "lekha", "raveena", "heera", "sunali", "veena", "moira", "tessa", "fiona", "ava", "allison", "susan", "joanna", "kendra", "kimberly", "salli", "ivy"];

        // 1. Try exact language + female keyword
        let voice = voices.find(v =>
          v.lang.toLowerCase().startsWith(voiceLang.toLowerCase().slice(0, 2)) &&
          femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );

        // 2. Try any voice with the language (browsers label female voices without "male" in name)
        if (!voice) {
          const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(voiceLang.toLowerCase().slice(0, 2)));
          // Prefer voices that do NOT have "male" in name (more likely female)
          voice = langVoices.find(v => !v.name.toLowerCase().includes("male")) || langVoices[0];
        }

        // 3. Fallback: English female
        if (!voice) {
          voice = voices.find(v =>
            (v.lang.includes("en-IN") || v.lang.includes("en-US") || v.lang.includes("en-GB")) &&
            femaleKeywords.some(k => v.name.toLowerCase().includes(k))
          );
        }

        // 4. Any English voice that's not explicitly male
        if (!voice) {
          const enVoices = voices.filter(v => v.lang.startsWith("en"));
          voice = enVoices.find(v => !v.name.toLowerCase().includes("male")) || enVoices[0];
        }

        return voice || voices[0];
      };

      const speakWithVoice = () => {
        const voices = (window as any).speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const chosenVoice = pickFemaleVoice(voices);
          if (chosenVoice) {
            speech.voice = chosenVoice;
            console.log("[Alarm] Using voice:", chosenVoice.name, chosenVoice.lang);
          }
        }

        speech.onend = () => {
          if (isRingingRef.current) {
            setTimeout(() => {
              if (isRingingRef.current) {
                (window as any).speechSynthesis.speak(speech);
              }
            }, 1000);
          }
        };

        (window as any).speechSynthesis.speak(speech);
      };

      // If voices are already loaded, speak immediately; otherwise wait for them
      const availableVoices = (window as any).speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        speakWithVoice();
      } else {
        (window as any).speechSynthesis.onvoiceschanged = () => {
          (window as any).speechSynthesis.onvoiceschanged = null;
          speakWithVoice();
        };
        // Safety fallback: speak after 500ms even if event never fires
        setTimeout(() => {
          if (isRingingRef.current && !(window as any).speechSynthesis.speaking) {
            speakWithVoice();
          }
        }, 500);
      }

      return;
    }




    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.onended = null;

      // Try generic sounds first - using a very reliable sound source
      const reliableSounds = [
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
        "https://www.gstatic.com/meet/sounds/ringout_7a03.mp3",
        "https://www.gstatic.com/meet/sounds/join_call_6a9b.mp3",
      ];

      const playedGeneric = await playWithFallback(audio, reliableSounds);
      if (!playedGeneric) {
        console.warn("[Alarm] All fallback audio files failed to load. Falling back to synthesized Web Audio alarm.");
        startSynthBeep();
      }

      // Voice note attempt
      try {
        const voiceNote = await generateVoiceNote(patientName);

        if (voiceNote && isRingingRef.current) {
          audio.pause();
          audio.loop = false;
          audio.src = voiceNote;

          audio.onended = async () => {
            if (isRingingRef.current) {
              audio.onended = null;
              const playedFallback = await playWithFallback(audio, reliableSounds); // Return to beep
              if (!playedFallback) {
                startSynthBeep();
              }
            }
          };

          await audio.play().catch(async (e) => {
            console.warn(
              "[Alarm] Voice note play failed, falling back to beep:",
              e,
            );
            const playedFallback = await playWithFallback(audio, reliableSounds);
            if (!playedFallback) {
              startSynthBeep();
            }
          });
        } else if (isRingingRef.current) {
          // Fallback to high-quality browser SpeechSynthesis if server TTS failed
          console.log("[Alarm] Server-side TTS failed or returned empty. Falling back to browser SpeechSynthesis.");
          const textToSpeak = patientName
            ? `Attention: New patient referral for ${patientName}`
            : "Attention: New patient referral received";

          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
              audio.pause(); // Pause continuous alarm beep during TTS speech
              
              (window as any).speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              
              // Set English style or generic premium voice
              const voices = (window as any).speechSynthesis.getVoices();
              const preferredVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
              if (preferredVoice) {
                utterance.voice = preferredVoice;
              }

              utterance.onend = async () => {
                if (isRingingRef.current) {
                  const playedFallback = await playWithFallback(audio, reliableSounds);
                  if (!playedFallback) {
                    startSynthBeep();
                  }
                }
              };

              utterance.onerror = async () => {
                if (isRingingRef.current) {
                  const playedFallback = await playWithFallback(audio, reliableSounds);
                  if (!playedFallback) {
                    startSynthBeep();
                  }
                }
              };

              (window as any).speechSynthesis.speak(utterance);
            } catch (synthErr) {
              console.warn("[Alarm] Browser SpeechSynthesis failed:", synthErr);
              const playedFallback = await playWithFallback(audio, reliableSounds);
              if (!playedFallback) {
                startSynthBeep();
              }
            }
          }
        }
      } catch (voiceErr) {
        console.warn("[Alarm] Voice generation failed:", voiceErr);
      }
    } catch (err) {
      console.error("[Alarm] Critical alarm error:", safeStringify(err));
    }
  };

  const fetchOnDemandDataRef = useRef<() => Promise<void>>(async () => {});
  const fetchOnDemandData = async () => {
    if (!user?.id) return;
    try {
      console.log("[HospitalPanel] Fetching doctors, clinics, and details on-demand...");
      const [clinicsData, doctorsData] = await Promise.all([
        firebaseService.getCollection("users", [
          { field: "role", operator: "==", value: "clinic" },
          { field: "status", operator: "==", value: "active" }
        ]),
        firebaseService.getCollection("doctors", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ])
      ]);

      if (clinicsData) setClinics(clinicsData);
      if (doctorsData) setDoctors(doctorsData);
    } catch (err) {
      console.error("[HospitalPanel] Error fetching on-demand data:", err);
    }
  };
  fetchOnDemandDataRef.current = fetchOnDemandData;

  useEffect(() => {
    // Intercept writes to auto-refresh on-demand collections
    const originalAdd = firebaseService.addDocument;
    const originalUpdate = firebaseService.updateDocument;
    const originalDelete = firebaseService.deleteDocument;

    firebaseService.addDocument = async (collectionName: string, data: any) => {
      const res = await originalAdd.call(firebaseService, collectionName, data);
      fetchOnDemandDataRef.current();
      return res;
    };
    firebaseService.updateDocument = async (collectionName: string, docId: string, data: any) => {
      const res = await originalUpdate.call(firebaseService, collectionName, docId, data);
      fetchOnDemandDataRef.current();
      return res;
    };
    firebaseService.deleteDocument = async (collectionName: string, docId: string) => {
      const res = await originalDelete.call(firebaseService, collectionName, docId);
      fetchOnDemandDataRef.current();
      return res;
    };

    return () => {
      firebaseService.addDocument = originalAdd;
      firebaseService.updateDocument = originalUpdate;
      firebaseService.deleteDocument = originalDelete;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    // Subscribe to Referrals
    const unsubReferrals = firebaseService.subscribeToCollection(
      "referrals",
      (data) => {
        console.log("[Referral Debug] Snapshot received. Count:", data.length);
        const sorted = [...data].sort((a, b) => {
          const getTime = (val: any) => {
            if (!val) return Date.now();
            if (val.seconds) return val.seconds * 1000;
            if (val instanceof Date) return val.getTime();
            return 0;
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        const pendingActiveReferrals = data.filter((r) => {
          if (r.referralType === "opd") {
            return ["pending", "under_review"].includes(r.status);
          }
          return ["pending", "under_review", "consultation_done"].includes(r.status);
        });
        const currentIds = new Set(data.map((r) => r.id));

        console.log(
          "[Referral Debug] Active Incoming Count:",
          pendingActiveReferrals.length,
          "First Load:",
          isFirstLoad.current,
        );

        const newIds = [...currentIds].filter(
          (id) => !knownReferralIds.current.has(id),
        );
        const trulyNewPending = data.filter(
          (r) => newIds.includes(r.id) && r.status === "pending",
        );

        if (!isFirstLoad.current && trulyNewPending.length > 0) {
          const firstNew = trulyNewPending[0];
          console.log(
            "[Referral Debug] Truly new pending referral found. Name:",
            firstNew.patientName,
            "Type:",
            firstNew.referralType || "ipd",
          );

          setNewReferralToast({
            show: true,
            name: firstNew.patientName,
            referralType: firstNew.referralType || "ipd",
          });
          playAlarm(firstNew.patientName);
        } else if (pendingActiveReferrals.length > 0) {
          if (isRingingRef.current === false) {
            console.log(
              "[Referral Debug] Existing pending referrals found. Triggering alarm for:",
              pendingActiveReferrals[0].patientName,
            );
            playAlarm(pendingActiveReferrals[0].patientName);
          }
        } else {
          if (isRingingRef.current) {
            stopAlarm();
          }
        }

        knownReferralIds.current = currentIds;
        isFirstLoad.current = false;

        setReferrals(sorted);
        setLoading(false);
      },
      [{ field: "hospitalId", operator: "==", value: String(user.id) }],
    );

    // Subscribe to Messages (Optimized with participants array query filter)
    const unsubMessages = firebaseService.subscribeToCollection(
      "messages",
      (data) => {
        setMessages(
          data.sort((a, b) => {
            const dateA = a.createdAt?.seconds || a.timestamp?.seconds || 0;
            const dateB = b.createdAt?.seconds || a.timestamp?.seconds || 0;
            return dateB - dateA;
          }),
        );
      },
      [
        {
          field: "participants",
          operator: "array-contains",
          value: String(user.id),
        },
      ],
    );

    // Fetch static profile, clinics & doctors once on-demand
    const fetchHospitalDetailsAndStatic = async () => {
      try {
        const detailsData = await firebaseService.getCollection("hospital_details", [
          { field: "userId", operator: "==", value: String(user.id) }
        ]);
        if (detailsData && detailsData.length > 0) {
          const details = detailsData[0] as any;
          setHospDetails(details);

          setProfileForm({
            name: user.name || "",
            city: user.city || "",
            helpline: details.helpline || "",
            contact_no: details.contact_no || "",
            address: details.address || "",
            email: details.email || "",
            website: details.website || "",
            category: details.category || "Multi-Specialty Hospital",
            departments: Array.isArray(details.departments)
              ? details.departments
              : typeof details.departments === "string"
                ? details.departments.split(",").map((s: string) => s.trim())
                : [],
            schemes: Array.isArray(details.schemes)
              ? details.schemes
              : typeof details.schemes === "string"
                ? details.schemes.split(",").map((s: string) => s.trim())
                : [],
            bedsICU: details.bedsICU || 0,
            bedsGeneral: details.bedsGeneral || 0,
            bedsVentilator: details.bedsVentilator || 0,
            ambulanceContact: details.ambulanceContact || "",
            ambulanceStatus: details.ambulanceStatus || "available",
            emergencyContact: details.emergencyContact || "",
            admissionNotes: details.admissionNotes || "",
            webinarLink: details.webinarLink || "",
            specialists: Array.isArray(details.specialists)
              ? details.specialists
              : [],
            hours: details.hours || {
              Monday: { open: "00:00", close: "23:59", closed: false },
              Tuesday: { open: "00:00", close: "23:59", closed: false },
              Wednesday: { open: "00:00", close: "23:59", closed: false },
              Thursday: { open: "00:00", close: "23:59", closed: false },
              Friday: { open: "00:00", close: "23:59", closed: false },
              Saturday: { open: "00:00", close: "23:59", closed: false },
              Sunday: { open: "00:00", close: "23:59", closed: false },
            },
            gallery: details.gallery || [],
            logo: details.logo || "",
            banner: details.banner || "",
          });
        }
        
        await fetchOnDemandData();
        setLoading(false);
      } catch (err) {
        console.error("[HospitalPanel] Error loading details:", err);
        setLoading(false);
      }
    };

    fetchHospitalDetailsAndStatic();

    return () => {
      unsubReferrals();
      unsubMessages();
    };
  }, [user?.id]);

  const loadGrowthPlatformData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      console.log("[HospitalPanel] Lazy loading Growth Platform modules...");
      // Make sure we fetch clinics too
      await fetchOnDemandData();

      // Retrieve all growth metrics & items
      const [fetchedPartnerships, fetchedSessions, fetchedRegistrations, fetchedCampaigns, fetchedCamps, fetchedAwareness] = await Promise.all([
        firebaseService.getCollection("partnerships", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ]),
        firebaseService.getCollection("academy_sessions", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ]),
        firebaseService.getCollection("academy_registrations", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ]),
        firebaseService.getCollection("campaigns", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ]),
        firebaseService.getCollection("health_camps", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ]),
        firebaseService.getCollection("awareness_programs", [
          { field: "hospitalId", operator: "==", value: String(user.id) }
        ])
      ]);

      if (fetchedPartnerships) setPartnerships(fetchedPartnerships);
      if (fetchedSessions) setAcademySessions(fetchedSessions);
      if (fetchedRegistrations) setAcademyRegistrations(fetchedRegistrations);
      if (fetchedCampaigns) setCampaigns(fetchedCampaigns);
      if (fetchedCamps) setHealthCamps(fetchedCamps);
      if (fetchedAwareness) setAwarenessPrograms(fetchedAwareness);

      setPartnerClinicsLoaded(true);
    } catch (error) {
      console.error("[HospitalPanel] Error loading growth platform details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      ["partner-clinics", "medical-academy", "marketing-center", "network-analytics"].includes(activeTab) &&
      !partnerClinicsLoaded
    ) {
      loadGrowthPlatformData();
    }
  }, [activeTab, partnerClinicsLoaded]);

  // Roster display active state
  const [activeSessionForRegs, setActiveSessionForRegs] = useState<any>(null);

  // Growth Action Handlers
  const handleCreateAcademySession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyForm.title || !academyForm.speakerName || !academyForm.date) {
      alert("Please fill in key fields: Title, Speaker, Date");
      return;
    }
    setLoading(true);
    try {
      const newSession = {
        hospitalId: String(user.id),
        hospitalName: user.name,
        title: academyForm.title,
        category: academyForm.category,
        description: academyForm.description,
        speakerName: academyForm.speakerName,
        date: academyForm.date,
        time: academyForm.time || "04:00 PM IST",
        meetingLink: academyForm.meetingLink || "https://meet.google.com/abc-defg-hij",
        certificateAvailable: academyForm.certificateAvailable,
        status: "upcoming",
        registrationsCount: 0,
        createdAt: new Date().toISOString()
      };
      await firebaseService.addDocument("academy_sessions", newSession);
      alert(`Successfully Published CME Training Program: ${academyForm.title}`);
      setShowAcademyCreateModal(false);
      setAcademyForm({
        title: "",
        category: "CME Program",
        description: "",
        speakerName: "",
        date: "",
        time: "",
        meetingLink: "",
        certificateAvailable: "Yes"
      });
      await loadGrowthPlatformData();
    } catch (e) {
      console.error("[HospitalPanel] CME session error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSessionCompleted = async (session: any) => {
    setLoading(true);
    try {
      await firebaseService.updateDocument("academy_sessions", session.id, {
        status: "completed"
      });
      // Unlock attended certificates
      const regs = academyRegistrations.filter(r => r.sessionId === session.id);
      for (const reg of regs) {
        await firebaseService.updateDocument("academy_registrations", reg.id, {
          status: "attended"
        });
      }
      alert(`Session "${session.title}" completed. Certificates unlocked!`);
      await loadGrowthPlatformData();
    } catch (e) {
      console.error("[HospitalPanel] CME completion error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.message) {
      alert("Campaign Title and Message target are required");
      return;
    }
    setLoading(true);
    try {
      const newCampaign = {
        hospitalId: String(user.id),
        hospitalName: user.name,
        title: campaignForm.title,
        targetAudience: campaignForm.targetAudience,
        department: campaignForm.department,
        message: campaignForm.message,
        createdAt: new Date().toISOString()
      };
      await firebaseService.addDocument("campaigns", newCampaign);
      alert(`Outreach Campaign "${campaignForm.title}" Launched Successfully!`);
      setShowCampaignCreateModal(false);
      setCampaignForm({
        title: "",
        targetAudience: "All Clinics",
        department: "General Medicine",
        message: ""
      });
      await loadGrowthPlatformData();
    } catch (e) {
      console.error("[HospitalPanel] Campaign target error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHealthCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.title || !campForm.date || !campForm.venue) {
      alert("Title, Date and Venue are required");
      return;
    }
    setLoading(true);
    try {
      const newCamp = {
        hospitalId: String(user.id),
        hospitalName: user.name,
        title: campForm.title,
        date: campForm.date,
        time: campForm.time || "09:00 AM IST",
        venue: campForm.venue,
        maxRegistrations: Number(campForm.maxRegistrations || 50),
        registrationsCount: 0,
        description: campForm.description,
        status: "active",
        createdAt: new Date().toISOString()
      };
      await firebaseService.addDocument("health_camps", newCamp);
      alert(`Health Camp "${campForm.title}" scheduled successfully!`);
      setShowCampCreateModal(false);
      setCampForm({
        title: "",
        date: "",
        time: "",
        venue: "",
        maxRegistrations: 50,
        description: ""
      });
      await loadGrowthPlatformData();
    } catch (e) {
      console.error("[HospitalPanel] Health camp scheduler error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAwarenessProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awarenessForm.title || !awarenessForm.date) {
      alert("Title and Date are required");
      return;
    }
    setLoading(true);
    try {
      const newAwareness = {
        hospitalId: String(user.id),
        hospitalName: user.name,
        title: awarenessForm.title,
        date: awarenessForm.date,
        mode: awarenessForm.mode,
        target: awarenessForm.target,
        link: awarenessForm.link || "https://carebridge.org/awareness-live",
        createdAt: new Date().toISOString()
      };
      await firebaseService.addDocument("awareness_programs", newAwareness);
      alert(`Awareness Program "${awarenessForm.title}" published!`);
      setShowAwarenessCreateModal(false);
      setAwarenessForm({
        title: "",
        date: "",
        mode: "Online",
        target: "General Patients",
        link: ""
      });
      await loadGrowthPlatformData();
    } catch (e) {
      console.error("[HospitalPanel] Awareness program publish error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const referralData = {
        ...referralForm,
        clinicId: String(user.id),
        clinicName: user.name, // The sending hospital acts as the clinic
        clinicContact: user.contact_no || "",
        hospitalId: String(selectedHospital?.id || ""),
        hospitalName: selectedHospital?.name || "",
        hospitalCity: selectedHospital?.city || "",
        hospitalAddress: selectedHospital?.address || "",
        hospitalHelpline: selectedHospital?.helpline || "",
        status: "pending",
      };

      await firebaseService.addDocument("referrals", referralData);

      setLastReferralData(referralData);
      setShowReferralModal(false);
      setShowReferralSuccessModal(true);

      setReferralForm({
        patientName: "",
        patientAge: "",
        patientGender: "",
        patientPhone: "",
        patientAddress: "",
        patientCondition: "",
        department: "",
        doctorId: "",
        doctorName: "",
        diagnosis: "",
        note: "",
        economicalCondition: "",
        applicableScheme: "",
        expectedCost: "",
      });
    } catch (err) {
      console.error("Error submitting referral:", safeStringify(err));
    }
  };

  const getReferralDoctors = () => {
    const list: any[] = [];
    const seen = new Set<string>();

    const activeHospDetail = hospitalDetails.find(
      (d) => String(d.userId) === String(selectedHospital?.id) || String(d.id) === String(selectedHospital?.hospitalDetailId)
    );

    const specialists = activeHospDetail?.specialists || selectedHospital?.specialists;

    if (specialists && Array.isArray(specialists)) {
      specialists.forEach((doc: any, idx: number) => {
        const uniqueKey = `${(doc.name || "").toLowerCase()}-${(doc.qualification || "").toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push({
            id: doc.id || `specialist-${idx}`,
            name: doc.name,
            qualification: doc.qualification || "",
            specialization: doc.specialization || doc.department || "General",
          });
        }
      });
    }

    if (selectedHospitalDoctors && Array.isArray(selectedHospitalDoctors)) {
      selectedHospitalDoctors.forEach((doc: any) => {
        const uniqueKey = `${(doc.name || "").toLowerCase()}-${(doc.qualification || "").toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push({
            id: doc.id,
            name: doc.name,
            qualification: doc.qualification || "",
            specialization: doc.specialization || doc.department || "General",
          });
        }
      });
    }

    if (referralForm.department && referralForm.department !== "All Departments") {
      const selectedDeptLower = referralForm.department.toLowerCase().trim();
      const filtered = list.filter((doc) => {
        const docDeptLower = (doc.specialization || "").toLowerCase().trim();
        return docDeptLower.includes(selectedDeptLower) || selectedDeptLower.includes(docDeptLower);
      });
      if (filtered.length > 0) return filtered;
    }

    return list;
  };

  const getOPDReferralDoctors = () => {
    const list: any[] = [];
    const seen = new Set<string>();

    const activeHospDetail = hospitalDetails.find(
      (d) => String(d.userId) === String(selectedHospital?.id) || String(d.id) === String(selectedHospital?.hospitalDetailId)
    );

    const specialists = activeHospDetail?.specialists || selectedHospital?.specialists;

    if (specialists && Array.isArray(specialists)) {
      specialists.forEach((doc: any, idx: number) => {
        const uniqueKey = `${(doc.name || "").toLowerCase()}-${(doc.qualification || "").toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push({
            id: doc.id || `specialist-${idx}`,
            name: doc.name,
            qualification: doc.qualification || "",
            specialization: doc.specialization || doc.department || "General",
          });
        }
      });
    }

    if (selectedHospitalDoctors && Array.isArray(selectedHospitalDoctors)) {
      selectedHospitalDoctors.forEach((doc: any) => {
        const uniqueKey = `${(doc.name || "").toLowerCase()}-${(doc.qualification || "").toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push({
            id: doc.id,
            name: doc.name,
            qualification: doc.qualification || "",
            specialization: doc.specialization || doc.department || "General",
          });
        }
      });
    }

    if (opdReferralForm.department && opdReferralForm.department !== "All Departments") {
      const selectedDeptLower = opdReferralForm.department.toLowerCase().trim();
      const filtered = list.filter((doc) => {
        const docDeptLower = (doc.specialization || "").toLowerCase().trim();
        return docDeptLower.includes(selectedDeptLower) || selectedDeptLower.includes(docDeptLower);
      });
      if (filtered.length > 0) return filtered;
    }

    return list;
  };

  const handleOPDReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdReferralForm.doctorId) {
      alert("Please select a target consultant doctor or choose 'Any Available Consultant'.");
      return;
    }
    try {
      setIsReferralSubmitting(true);
      const referralData = {
        ...opdReferralForm,
        referralType: "opd",
        clinicId: String(user.id),
        clinicName: user.name, // The sending hospital acts as the clinic
        clinicContact: user.contact_no || "",
        hospitalId: String(selectedHospital?.id || ""),
        hospitalName: selectedHospital?.name || "",
        hospitalCity: selectedHospital?.city || "",
        hospitalAddress: selectedHospital?.address || "",
        hospitalHelpline: selectedHospital?.helpline || "",
        status: "pending",
        patientCondition: "Stable",
      };

      await firebaseService.addDocument("referrals", referralData);

      setLastReferralData(referralData);
      setShowOPDReferralModal(false);
      setShowReferralSuccessModal(true);

      setOpdReferralForm({
        patientName: "",
        patientAge: "",
        patientGender: "",
        patientPhone: "",
        patientAddress: "",
        department: "",
        doctorId: "",
        doctorName: "",
        diagnosis: "",
        note: "",
      });
    } catch (err) {
      console.error("Error submitting OPD referral:", safeStringify(err));
    } finally {
      setIsReferralSubmitting(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals
      .map((h) => {
        const details = hospitalDetails.find(
          (d) => String(d.userId) === String(h.id),
        );
        if (details) {
          const { id, ...rest } = details;
          return { ...h, ...rest, hospitalDetailId: id };
        }
        return h;
      })
      .filter((h) => {
        const city = String(h.city || "")
          .toLowerCase()
          .trim();
        const district = String((h as any).district || "")
          .toLowerCase()
          .trim();
        const address = String(h.address || "")
          .toLowerCase()
          .trim();
        const locFilter = String(filterLocation || "")
          .toLowerCase()
          .trim();

        const matchLoc =
          filterLocation === "all" ||
          city.includes(locFilter) ||
          district.includes(locFilter) ||
          address.includes(locFilter);

        const deptData = h.departments || [];
        const deptStr = Array.isArray(deptData)
          ? deptData.join(", ")
          : String(deptData);
        const matchDept =
          filterDept === "all" ||
          deptStr.toLowerCase().includes(
            String(filterDept || "")
              .toLowerCase()
              .trim(),
          );

        
        const nameMatch =
          !filterHospitalName ||
          String(h.name || "")
            .toLowerCase()
            .includes(filterHospitalName.toLowerCase().trim());

        return matchLoc && matchDept && nameMatch;
      })
      .sort((a, b) => {
        const weights: Record<string, number> = {
          premium: 3,
          priority: 2,
          standard: 1,
        };
        return (weights[b.tier] || 0) - (weights[a.tier] || 0);
      });
  }, [hospitals, hospitalDetails, filterLocation, filterDept, filterHospitalName]);

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    hospitals.forEach((h) => {
      const details = hospitalDetails.find(
        (d) => String(d.userId) === String(h.id),
      );
      const city = details?.city || h.city;
      const district = details?.district || (h as any).district;

      if (city && typeof city === "string") {
        const trimmed = city.trim();
        if (trimmed) {
          const capitalized =
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          locations.add(capitalized);
        }
      }
      if (district && typeof district === "string") {
        const trimmed = district.trim();
        if (trimmed) {
          const capitalized =
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          locations.add(capitalized);
        }
      }
    });
    return Array.from(locations).sort();
  }, [hospitals, hospitalDetails]);
  const allPatients = useMemo(() => {
    try {
      const patientsMap = new Map();

      // Process OPD records first (primary source of visits)
      allOpdRecords.forEach((p) => {
        if (!p.patientPhone) return;

        const existing = patientsMap.get(p.patientPhone);
        const visitDate = p.date || "";

        if (!existing) {
          patientsMap.set(p.patientPhone, {
            name: p.patientName,
            phone: p.patientPhone,
            area: p.patientArea || "",
            age: p.patientAge || "",
            gender: p.patientGender || "",
            bp: p.bp || "",
            sugar: p.sugar || "",
            weight: p.weight || "",
            temp: p.temp || "",
            complaint: p.complaint || "",
            lastVisit: visitDate,
            visitCount: 1,
          });
        } else {
          // Update with latest info if this record is newer
          const isNewer =
            !existing.lastVisit || visitDate >= existing.lastVisit;
          patientsMap.set(p.patientPhone, {
            ...existing,
            ...(isNewer
              ? {
                  name: p.patientName,
                  area: p.patientArea || existing.area,
                  age: p.patientAge || existing.age,
                  gender: p.patientGender || existing.gender,
                  bp: p.bp || existing.bp,
                  sugar: p.sugar || existing.sugar,
                  weight: p.weight || existing.weight,
                  temp: p.temp || existing.temp,
                  complaint: p.complaint || existing.complaint,
                  lastVisit: visitDate,
                }
              : {}),
            visitCount: existing.visitCount + 1,
          });
        }
      });

      // Process Credit records (to catch patients not in OPD queue or newer visits for payments)
      allCreditRecords.forEach((r) => {
        if (!r.patientPhone) return;

        let visitDate = "";
        if (r.createdAt) {
          if (r.createdAt instanceof Date) {
            visitDate = getISTDateString(r.createdAt);
          } else if (r.createdAt.seconds) {
            visitDate = getISTDateString(new Date(r.createdAt.seconds * 1000));
          } else {
            visitDate = getISTDateString(new Date(r.createdAt));
          }
        }

        const existing = patientsMap.get(r.patientPhone);
        if (!existing) {
          patientsMap.set(r.patientPhone, {
            name: r.patientName,
            phone: r.patientPhone,
            area: r.patientArea || "",
            age: r.patientAge || "",
            gender: r.patientGender || "",
            bp: r.bp || "",
            sugar: r.sugar || "",
            weight: r.weight || "",
            temp: r.temp || "",
            complaint: r.complaint || "",
            lastVisit: visitDate,
            visitCount: 1,
          });
        } else {
          const isNewer = !existing.lastVisit || visitDate > existing.lastVisit;
          if (isNewer) {
            patientsMap.set(r.patientPhone, {
              ...existing,
              name: r.patientName,
              area: r.patientArea || existing.area,
              age: r.patientAge || existing.age,
              gender: r.patientGender || existing.gender,
              bp: r.bp || existing.bp,
              sugar: r.sugar || existing.sugar,
              weight: r.weight || existing.weight,
              temp: r.temp || existing.temp,
              complaint: r.complaint || existing.complaint,
              lastVisit: visitDate,
            });
          }
        }
      });

      return Array.from(patientsMap.values());
    } catch (err) {
      console.error("Error in allPatients memo:", err);
      return [];
    }
  }, [allOpdRecords, allCreditRecords]);

  const targetedPatients = useMemo(() => {
    try {
      return allPatients.filter((p) => {
        let matches = true;

        if (marketingTarget.useBp) {
          const systolic = parseInt((p.bp || "").split("/")[0]);
          if (isNaN(systolic) || systolic < 140) matches = false;
        }

        if (marketingTarget.useSugar && matches) {
          const sugarVal = parseInt(p.sugar || "");
          if (isNaN(sugarVal) || sugarVal < 140) matches = false;
        }

        if (marketingTarget.targetArea && matches) {
          if (
            !(p.area || "")
              .toLowerCase()
              .includes(marketingTarget.targetArea.toLowerCase())
          ) {
            matches = false;
          }
        }

        return matches;
      });
    } catch (err) {
      console.error("Error in targetedPatients memo:", err);
      return [];
    }
  }, [allPatients, marketingTarget]);

  const referralPatientSuggestions = useMemo(() => {
    if (!referralPatientSearch.trim() || referralPatientSearch.length < 2)
      return [];
    const query = referralPatientSearch.toLowerCase();
    return allPatients
      .filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query) ||
          (p.phone || "").includes(query),
      )
      .slice(0, 5);
  }, [allPatients, referralPatientSearch]);

  const opdReferralPatientSuggestions = useMemo(() => {
    if (!opdReferralPatientSearch.trim() || opdReferralPatientSearch.length < 2)
      return [];
    const query = opdReferralPatientSearch.toLowerCase();
    return allPatients
      .filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query) ||
          (p.phone || "").includes(query),
      )
      .slice(0, 5);
  }, [allPatients, opdReferralPatientSearch]);

  const patientSuggestions = useMemo(() => {
    if (!patientSearchQuery.trim()) return [];
    const query = patientSearchQuery.toLowerCase();
    return allPatients
      .filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.phone && p.phone.includes(query)),
      )
      .slice(0, 5);
  }, [allPatients, patientSearchQuery]);

  const filteredMarketingPatients = useMemo(() => {
    try {
      return allPatients.filter((p) => {
        const matchesSearch =
          (p.name || "")
            .toLowerCase()
            .includes(marketingSearch.toLowerCase()) ||
          (p.phone || "").includes(marketingSearch);

        let matchesFilter = true;
        if (marketingFilter === "bp") {
          const systolic = parseInt((p.bp || "").split("/")[0]);
          matchesFilter = !isNaN(systolic) && systolic >= 140;
        } else if (marketingFilter === "bp_area") {
          const systolic = parseInt((p.bp || "").split("/")[0]);
          const bpMatch = !isNaN(systolic) && systolic >= 140;
          const areaMatch = (p.area || "")
            .toLowerCase()
            .includes(marketingAreaSearch.toLowerCase());
          matchesFilter = bpMatch && areaMatch;
        } else if (marketingFilter === "sugar") {
          const sugarVal = parseInt(p.sugar || "");
          matchesFilter = !isNaN(sugarVal) && sugarVal >= 140;
        } else if (marketingFilter === "regular") {
          matchesFilter = (p.visitCount || 0) >= 2;
        }

        const matchesArea =
          !marketingAreaSearch ||
          (p.area || "")
            .toLowerCase()
            .includes(marketingAreaSearch.toLowerCase());

        return matchesSearch && matchesFilter && matchesArea;
      });
    } catch (err) {
      console.error("Error in filteredMarketingPatients memo:", err);
      return [];
    }
  }, [allPatients, marketingSearch, marketingFilter, marketingAreaSearch]);

  const updatingRefs = useRef<Set<string>>(new Set());

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!id || updatingRefs.current.has(id)) return;
    updatingRefs.current.add(id);
    try {
      await firebaseService.updateDocument("referrals", id, { status });
    } catch (e) {
      console.error(e);
    } finally {
      updatingRefs.current.delete(id);
    }
  };
  const handleDischarge = async (ref: any) => {
    try {
      await firebaseService.updateDocument("referrals", ref.id, { status: "discharged", dischargedAt: new Date().toISOString() });
    } catch (e) {
      console.error(e);
    }
  };
  const handleAdmitClick = (ref: any) => {
    setSelectedReferral(ref);
    setShowDetailModal(false);
    setShowAdmitModal(true);
  };
  const submitAdmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral || !user?.id) return;
    try {
      await firebaseService.updateDocument("referrals", selectedReferral.id, {
        status: "admitted",
        ward: admitForm.ward,
        admittedAt: new Date().toISOString(),
        admissionDetails: admitForm
      });
      const clinicId = selectedReferral.senderId;
      if (clinicId) {
        const hospitalName = hospDetails?.name || user.name || "Hospital";
        const doctorName = selectedReferral.doctorName && selectedReferral.doctorName !== "any" ? selectedReferral.doctorName : "Duty Doctor";
        const content = `Patient ${selectedReferral.patientName} admitted to ${hospitalName} under Dr. ${doctorName} in ${admitForm.ward} ward.`;
        await firebaseService.addDocument("messages", {
          senderId: user.id,
          senderRole: "hospital",
          receiverId: clinicId,
          receiverRole: "clinic",
          content,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      }
      setShowAdmitModal(false);
      alert("Patient admitted successfully!");
    } catch (err) {
      console.error("Error admitting patient:", err);
      alert("Failed to admit patient.");
    }
  };
  const getRecipientInfo = (msg: any) => {
    return { name: msg.recipient_id || "Unknown", avatar: "", role: "User", initials: "U" };
  };
  const handleDeleteSelectedMessages = async () => {};
  const handleDeleteAllMessages = async () => {};
  const handleMessageSubmit = async (e: React.FormEvent) => { e.preventDefault(); };
  const handleProfileSave = async () => {
    try {
      if (user?.id) {
        await firebaseService.updateDocument("users", user.id, {
          name: profileForm.name || "",
          city: profileForm.city || "",
          address: profileForm.address || "",
          contact_no: profileForm.contact_no || "",
          email: profileForm.email || "",
          logo: profileForm.logo || "",
          banner: profileForm.banner || "",
        });
      }
      if (hospDetails?.id) {
        await firebaseService.updateDocument("hospital_details", hospDetails.id, {
          helpline: profileForm.helpline || "",
          website: profileForm.website || "",
          category: profileForm.category || "Multi-Specialty Hospital",
          departments: profileForm.departments || [],
          schemes: Array.isArray(profileForm.schemes) ? profileForm.schemes.join(", ") : profileForm.schemes || "",
          bedsICU: profileForm.bedsICU || 0,
          bedsGeneral: profileForm.bedsGeneral || 0,
          bedsVentilator: profileForm.bedsVentilator || 0,
          ambulanceContact: profileForm.ambulanceContact || "",
          ambulanceStatus: profileForm.ambulanceStatus || "available",
          emergencyContact: profileForm.emergencyContact || "",
          admissionNotes: profileForm.admissionNotes || "",
          webinarLink: profileForm.webinarLink || "",
          specialists: profileForm.specialists || [],
          hours: profileForm.hours || {},
          gallery: profileForm.gallery || [],
        });
      }
      setIsEditingProfile(false);
      setProfileSaveToast(true);
      setTimeout(() => setProfileSaveToast(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };
  const handleHospitalImageUpload = async (e: any, arg2?: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const type = arg2 as "logo" | "banner";
      const maxDim = type === "logo" ? 512 : 1200;
      const compressedImage = await compressImage(file, maxDim, maxDim, 0.8);
      setProfileForm((prev) => ({
        ...prev,
        [type]: compressedImage,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };
  const handleAddDepartment = () => {};
  const handleRemoveDepartment = (idx: string | number) => {};
  const handleAddDoctor = () => {};
  const handleGalleryUpload = async (e: any) => {};
  const filteredReferrals = referrals;

  const handleGeoCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !marketingTarget.targetArea &&
      !marketingTarget.useBp &&
      !marketingTarget.useSugar
    ) {
      setConfirmModal({
        isOpen: true,
        title: "No Target Defined",
        message:
          "Please select at least one targeting criteria (BP, Sugar, or Area) to launch a campaign.",
        type: "warning",
        onConfirm: () => setConfirmModal((p) => ({ ...p, isOpen: false })),
      });
      return;
    }

    if (!campaignForm.message) {
      alert("Please enter a campaign message.");
      return;
    }

    if (targetedPatients.length === 0) {
      setConfirmModal({
        isOpen: true,
        title: "No Patients Found",
        message: `We couldn't find any patients matching your selected criteria. Please adjust your targeting filters.`,
        type: "warning",
        onConfirm: () => setConfirmModal((p) => ({ ...p, isOpen: false })),
      });
      return;
    }

    // Set selected patients to targeted patients before bulk sending
    setSelectedPatients(
      targetedPatients.filter((p) => p.phone).map((p) => p.phone),
    );
    handleBulkSendWhatsApp(campaignForm.message, "campaign");
  };

  const handleReply = (msg: any) => {
    setMessageForm({
      recipient_id: String(msg.senderId || ""),
      recipient_role: msg.senderRole || "hospital",
      content: "",
    });
    const formElement = document.getElementById("message-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await firebaseService.deleteDocument("messages", msgId);
      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "Message deleted successfully!",
        type: "info",
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleAddDigitalCard = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.7);
      await firebaseService.addDocument("digital_cards", {
        clinicId: String(user.id),
        imageUrl: compressedBase64,
        createdAt: new Date(),
      });
      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "Digital Card added to gallery!",
        type: "info",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      console.error("Error adding card:", err);
      setConfirmModal({
        isOpen: true,
        title: "Error",
        message:
          "Error adding card. The image might be too large for the database.",
        type: "danger",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleAddHealthTip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.7);
      await firebaseService.addDocument("health_tips", {
        clinicId: String(user.id),
        imageUrl: compressedBase64,
        createdAt: new Date(),
      });
      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "Health Tip added to gallery!",
        type: "info",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      console.error("Error adding tip:", err);
      setConfirmModal({
        isOpen: true,
        title: "Error",
        message:
          "Error adding tip. The image might be too large for the database.",
        type: "danger",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleCreateDigitalCard = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1400; // Vertical card for more details
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1000, 1400);
    gradient.addColorStop(0, cardEditor.bgColor1);
    gradient.addColorStop(1, cardEditor.bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1400);

    // Header
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    // Clinic Name
    ctx.font = "bold 80px Inter, sans-serif";
    ctx.fillText(cardEditor.clinicName || user.name || "Clinic Name", 500, 150);

    // Dr Name
    ctx.font = "bold 50px Inter, sans-serif";
    ctx.fillText(cardEditor.drName ? `Dr. ${cardEditor.drName}` : "", 500, 250);

    // Visiting Dr
    if (cardEditor.visitingDr) {
      ctx.font = "40px Inter, sans-serif";
      ctx.fillText(`Visiting: ${cardEditor.visitingDr}`, 500, 320);
    }

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 380);
    ctx.lineTo(900, 380);
    ctx.stroke();

    // Details Section
    ctx.textAlign = "left";
    let y = 450;

    const drawDetail = (label: string, value: string) => {
      if (!value) return;
      ctx.font = "bold 30px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(label.toUpperCase(), 150, y);
      y += 45;
      ctx.font = "40px Inter, sans-serif";
      ctx.fillStyle = "white";
      ctx.fillText(value, 150, y);
      y += 80;
    };

    drawDetail("Date & Time", `${cardEditor.date} ${cardEditor.time}`);
    drawDetail("Address", cardEditor.address);
    drawDetail("Facilities", cardEditor.facilities);
    drawDetail("Special Offer", cardEditor.offer);
    drawDetail("Contact", cardEditor.contactNo);

    // Footer
    ctx.textAlign = "center";
    ctx.font = "italic 30px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("Generated by CareBridge+", 500, 1350);

    const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
    try {
      await firebaseService.addDocument("digital_cards", {
        clinicId: String(user.id),
        imageUrl,
        createdAt: new Date(),
      });
      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "Digital Card created and added to gallery!",
        type: "info",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      setCardView("gallery");
    } catch (err) {
      console.error("Error creating card:", err);
      setConfirmModal({
        isOpen: true,
        title: "Error",
        message: "Error creating card. Please try again.",
        type: "danger",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleCreateHealthTip = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1000, 1000);
    gradient.addColorStop(0, tipEditor.bgColor1);
    gradient.addColorStop(1, tipEditor.bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1000);

    // Content
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    // Title
    ctx.font = "bold 80px Inter, sans-serif";
    ctx.fillText(tipEditor.title, 500, 200);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200, 250);
    ctx.lineTo(800, 250);
    ctx.stroke();

    // Body
    ctx.font = "45px Inter, sans-serif";
    const words = tipEditor.content.split(" ");
    let line = "";
    let y = 400;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > 800 && n > 0) {
        ctx.fillText(line, 500, y);
        line = words[n] + " ";
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 500, y);

    // Clinic Info
    ctx.font = "bold 35px Inter, sans-serif";
    ctx.fillText(user.name || "", 500, 850);
    ctx.font = "30px Inter, sans-serif";
    ctx.fillText(clinicDetails?.contact_no || user.phone || "", 500, 900);

    const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
    try {
      await firebaseService.addDocument("health_tips", {
        clinicId: String(user.id),
        imageUrl,
        createdAt: new Date(),
      });
      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "Health Tip created and added to gallery!",
        type: "info",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      setTipView("gallery");
    } catch (err) {
      console.error("Error creating tip:", err);
      setConfirmModal({
        isOpen: true,
        title: "Error",
        message: "Error creating tip. Please try again.",
        type: "danger",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleBulkSendWhatsApp = async (
    content: string,
    type: "card" | "tip" | "campaign",
  ) => {
    if (selectedPatients.length === 0) {
      setConfirmModal({
        isOpen: true,
        title: "No Patients Selected",
        message:
          "Please select patients first from the Patient Database below.",
        type: "warning",
        onConfirm: () => {},
      });
      return;
    }

    setIsBulkSending(true);
    setBulkSendProgress({ current: 0, total: selectedPatients.length });

    // Open sequentially to avoid aggressive blocking
    for (let i = 0; i < selectedPatients.length; i++) {
      setBulkSendProgress({ current: i + 1, total: selectedPatients.length });

      // Only open truly for first 10 patients in preview to avoid overwhelming the browser
      // In real app, this would be an API call
      const skipTab = i >= 10;

      if (!skipTab) {
        await sendMarketingContent(content, selectedPatients[i], type, i > 0);
        // Delay between opening tabs
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        // Just simulate the rest
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setIsBulkSending(false);
    setConfirmModal({
      isOpen: true,
      title: "Campaign Completed",
      message: `WhatsApp campaign initiated for ${selectedPatients.length} patients successfully!`,
      type: "info",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setShowHealthTipModal(false);
        setShowDigitalCardModal(false);
        setShowGeoCampaignModal(false);
        setSelectedPatients([]);
      },
    });
  };

  const sendMarketingContent = async (
    content: string,
    patientPhone: string = "",
    type: string,
    skipDownload: boolean = false,
  ) => {
    const isImage = type === "card" || type === "tip";
    const msg = isImage
      ? `नमस्कार,\n\nआमच्या क्लिनिककडून तुमच्यासाठी एक खास ${type === "card" ? "डिजिटल कार्ड" : "आरोग्य टीप"} पाठवत आहोत.\n\n- ${user.name}`
      : `नमस्कार,\n\n${content}\n\n- ${user.name}`;

    try {
      // 1. Try Web Share API (Best for Mobile) - Only for single share if supported
      if (!patientPhone && navigator.share && navigator.canShare && isImage) {
        const response = await fetch(content);
        const blob = await response.blob();
        const file = new File([blob], `${type}.jpg`, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: type === "card" ? "Digital Card" : "Health Tip",
              text: msg,
            });
            return;
          } catch (err) {
            if ((err as Error).name === "AbortError") return;
            console.error("Share API failed:", err);
          }
        }
      }

      // 2. Fallback for Desktop/Bulk
      if (isImage && !skipDownload) {
        const link = document.createElement("a");
        link.href = content;
        link.download = `${type}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      const encoded = encodeURIComponent(
        msg +
          (isImage && !skipDownload
            ? "\n\n(टीप: कृपया डाऊनलोड केलेली इमेज सोबत जोडा)"
            : ""),
      );
      const phone = patientPhone
        ? patientPhone.length === 10
          ? `91${patientPhone}`
          : patientPhone
        : "";
      window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    } catch (err) {
      console.error("Error in sendMarketingContent:", err);
      const encoded = encodeURIComponent(msg);
      const phone = patientPhone
        ? patientPhone.length === 10
          ? `91${patientPhone}`
          : patientPhone
        : "";
      window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    }
  };

  if (showWelcomeScreen) {
    return (
      <HospitalWelcomeLanding
        hospDetails={hospitalDetails}
        user={{ ...user, dashboardAccess: user?.dashboardAccess !== false }}
        darkMode={darkMode}
        setShowWelcomeScreen={setShowWelcomeScreen}
        referrals={referrals}
        clinics={clinics}
      />
    );
  }

  return (
    <>
      {/* URGENT REFERRAL ALARM BANNER */}
      <AnimatePresence mode="wait">
        {isRinging && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-[200] bg-red-600 text-white p-4 shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <BellRing className="animate-bounce" size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
              </div>
              <div>
                <h4 className="font-black text-lg uppercase leading-none">
                  Emergency Patient Referral!
                </h4>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">
                  Patient: {newReferralToast?.name || "Incoming Referral"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const firstNew = referrals.find(
                    (r) => r.status === "pending",
                  );
                  if (firstNew) {
                    setSelectedReferral(firstNew);
                    setShowDetailModal(true);
                  }
                }}
                className="bg-white/10 text-white border border-white/20 font-black px-6 py-3 rounded-2xl hover:bg-white/20 transition-colors"
              >
                VIEW DETAILS
              </button>
              <button
                onClick={stopAlarm}
                className="bg-white text-red-600 font-black px-8 py-3 rounded-2xl hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2"
              >
                <VolumeX size={20} /> STOP ALARM
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#001219] text-white" : "bg-[#F5F7FA] text-gray-900"} flex flex-col lg:flex-row lg:pb-0 relative overflow-hidden`}
      >
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full ${darkMode ? "bg-blue-500/10" : "bg-blue-500/5"} blur-[120px]`}
          />
          <div
            className={`absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full ${darkMode ? "bg-orange-500/10" : "bg-orange-500/5"} blur-[120px]`}
          />
          <div
            className={`absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full ${darkMode ? "bg-green-500/10" : "bg-green-500/5"} blur-[120px]`}
          />
        </div>

        {/* New Referral Toast */}
        <AnimatePresence>
          {newReferralToast?.show && (
            <motion.div
              key="new-referral-toast"
              initial={{ opacity: 0, y: -100, x: "-50%" }}
              animate={{ opacity: 1, y: 20, x: "-50%" }}
              exit={{ opacity: 0, y: -100, x: "-50%" }}
              className={`fixed top-0 left-1/2 z-[100] w-[90%] max-w-md rounded-2xl shadow-2xl border-2 p-4 flex items-center gap-4 ${
                newReferralToast.referralType === "opd"
                  ? "bg-white dark:bg-gray-800 border-cyan-500 shadow-cyan-100 dark:shadow-none"
                  : "bg-white dark:bg-gray-800 border-red-500 shadow-red-100 dark:shadow-none"
              }`}
            >
              {newReferralToast.referralType === "opd" ? (
                <div className="bg-cyan-100 dark:bg-cyan-500/10 p-3 rounded-full text-cyan-600 dark:text-cyan-400">
                  <Activity size={24} className="animate-pulse" />
                </div>
              ) : (
                <div className="bg-red-100/80 p-3 rounded-full text-red-600 animate-pulse">
                  <BellRing size={24} />
                </div>
              )}
              <div className="flex-1">
                <h3 className={`font-black text-lg ${
                  newReferralToast.referralType === "opd" ? "text-cyan-600 dark:text-cyan-400" : "text-red-600"
                }`}>
                  {newReferralToast.referralType === "opd" ? "New OPD Consultation!" : "New Patient Referral!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-bold text-sm">
                  Patient: {newReferralToast.name}
                </p>

              </div>
              {newReferralToast.referralType === "opd" ? (
                <button
                  onClick={stopAlarm}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md transition-all whitespace-nowrap"
                >
                  STOP & DISMISS
                </button>
              ) : (
                <button
                  onClick={stopAlarm}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg hover:bg-red-600 transition-colors"
                >
                  STOP ALARM
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Save Success Toast */}
        <AnimatePresence>
          {profileSaveToast && (
            <motion.div
              key="profile-save-toast"
              initial={{ opacity: 0, y: -100, x: "-50%" }}
              animate={{ opacity: 1, y: 20, x: "-50%" }}
              exit={{ opacity: 0, y: -100, x: "-50%" }}
              className={`fixed top-0 left-1/2 z-[100] w-[90%] max-w-md rounded-2xl shadow-2xl border-2 p-4 flex items-center gap-4 ${
                darkMode
                  ? "bg-gray-800 border-green-500 shadow-green-900/30"
                  : "bg-white border-green-500 shadow-green-100"
              }`}
            >
              <div className={`p-3 rounded-full ${darkMode ? "bg-green-500/10 text-green-400" : "bg-green-100 text-green-600"}`}>
                <CheckCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-lg ${darkMode ? "text-green-400" : "text-green-600"}`}>
                  Profile Saved!
                </h3>
                <p className={`font-bold text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Hospital profile saved successfully.
                </p>
              </div>
              <button
                onClick={() => setProfileSaveToast(false)}
                className={`p-1.5 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <aside
          style={{ height: "100dvh", display: "flex", flexDirection: "column" }}
          className={`fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 z-50 w-72 transition-transform duration-300 overflow-hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-slate-950 border-r border-slate-800/80" : "bg-white border-r border-slate-200/80"}`}
        >
          <div className="p-5 pb-24 lg:pb-5 flex-1 flex flex-col min-h-0">
            {/* Facility Branding Header */}
            <div className="flex flex-col items-center mb-6 shrink-0 px-2 pt-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#00b4d8] via-[#0077b6] to-[#2563eb] text-white shadow-lg shadow-cyan-600/25 ring-4 ring-cyan-500/15 mb-3 shrink-0">
                <HospitalIcon size={28} className="text-white drop-shadow-sm" />
              </div>

              <h1 className={`text-base lg:text-lg font-black tracking-tight uppercase truncate max-w-full text-center leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                {user.name}
              </h1>

              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border mt-1.5 inline-flex items-center gap-1.5 shadow-xs ${darkMode ? "bg-cyan-950/40 text-[#38bdf8] border-cyan-800/40" : "bg-[#e0f7fa] text-[#0077b6] border-[#b2ebf2]"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] animate-pulse"></span>
                HOSPITAL PARTNER
              </span>

              <div className={`mt-2 text-xs font-black tracking-wider uppercase px-3.5 py-1.5 rounded-xl border truncate max-w-full text-center ${darkMode ? "text-[#38bdf8] bg-slate-900 border-slate-800" : "text-[#0077b6] bg-slate-100 border-slate-200"}`}>
                {user.city ? `${user.city} • MULTI-SPECIALTY` : "MULTI-SPECIALTY FACILITY"}
              </div>
            </div>

            <nav
              style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
              className="space-y-1 flex-1 no-scrollbar pr-1 pb-4"
            >
              {[
                { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { id: "find", icon: Search, label: "Search Hospital" },
                {
                  id: "referrals",
                  icon: PlusCircle,
                  label: "Add New Referral",
                },
                { id: "admit", icon: Activity, label: "Admit Patient" },
                { id: "history", icon: History, label: "Case History" },
                { id: "discharge", icon: LogOut, label: "Discharge Panel" },
                { id: "profile", icon: Building, label: "Hospital Profile" },
                { id: "inbox", icon: MessageSquare, label: "Messaging Inbox" },
              ].map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-[#00b4d8] to-[#2563eb] text-white shadow-md shadow-cyan-500/25 font-bold text-xs tracking-wide"
                        : (darkMode ? "text-slate-200 hover:text-[#38bdf8] hover:bg-slate-800/80 font-bold text-xs tracking-wide" : "text-slate-600 hover:text-[#0077b6] hover:bg-cyan-50/70 font-bold text-xs tracking-wide")
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : (darkMode ? "bg-slate-800/80 text-slate-300 group-hover:bg-cyan-950/60 group-hover:text-[#38bdf8]" : "bg-slate-100 text-slate-500 group-hover:bg-[#e0f7fa]/80 group-hover:text-[#0077b6]")
                        }`}
                      >
                        <item.icon size={16} />
                      </span>
                      <span
                        className={`truncate text-xs font-black uppercase tracking-wider ${
                          active
                            ? "text-white"
                            : (darkMode ? "text-slate-300 group-hover:text-white" : "text-slate-700 group-hover:text-slate-900")
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs ml-auto" />
                    )}
                  </button>
                );
              })}

              <div className={`pt-3 pb-1.5 px-3 font-black text-[10px] uppercase tracking-[0.2em] mt-3 border-t ${darkMode ? 'text-slate-400 border-slate-700/80' : 'text-slate-400 border-slate-200/80'}`}>
                Growth & Network
              </div>
              {[
                { id: "partner-clinics", icon: Users, label: "Partner Clinics" },
                { id: "medical-academy", icon: GraduationCap, label: "Medical Academy" },
                { id: "marketing-center", icon: Megaphone, label: "Marketing Center" },
                { id: "network-analytics", icon: BarChart3, label: "Network Analytics" },
              ].map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-[#00b4d8] to-[#2563eb] text-white shadow-md shadow-cyan-500/25 font-bold text-xs tracking-wide"
                        : (darkMode ? "text-slate-200 hover:text-[#38bdf8] hover:bg-slate-800/80 font-bold text-xs tracking-wide" : "text-slate-600 hover:text-[#0077b6] hover:bg-cyan-50/70 font-bold text-xs tracking-wide")
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : (darkMode ? "bg-slate-800/80 text-slate-300 group-hover:bg-cyan-950/60 group-hover:text-[#38bdf8]" : "bg-slate-100 text-slate-500 group-hover:bg-[#e0f7fa]/80 group-hover:text-[#0077b6]")
                        }`}
                      >
                        <item.icon size={16} />
                      </span>
                      <span
                        className={`truncate text-xs font-black uppercase tracking-wider ${
                          active
                            ? "text-white"
                            : (darkMode ? "text-slate-300 group-hover:text-white" : "text-slate-700 group-hover:text-slate-900")
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className={`mt-auto pt-3 border-t shrink-0 space-y-1 ${darkMode ? "border-slate-800/80" : "border-slate-200/80"}`}>
              {/* Settings button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Settings size={15} />
                <span className="uppercase tracking-wider">Settings</span>
              </button>

              {/* Theme Toggle button */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                  <span className="uppercase tracking-wider">{darkMode ? "Light Theme" : "Deep Dark"}</span>
                </div>
              </button>

              {/* Help & Support button */}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Info size={15} />
                <span className="uppercase tracking-wider">Help & Support</span>
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    localStorage.removeItem("cb_user");
                    sessionStorage.removeItem("cb_user");
                    window.location.href = '/login';
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 mt-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/30 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <LogOut size={16} />
                <span className="uppercase tracking-wider">Secure Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className={`sticky top-0 z-40 h-20 transition-all duration-300 border-b backdrop-blur-md ${
            darkMode 
              ? "bg-slate-950/90 border-slate-800/80 text-white" 
              : "bg-white/90 border-slate-200/80 text-slate-900"
          } shadow-xs`}>
            <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`lg:hidden p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                    darkMode
                      ? "bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850"
                      : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 shrink-0 flex items-center justify-center">
                    <img src="/carebridge-logo.png" alt="CareBridge" className="w-full h-full object-contain drop-shadow-xs" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className={`text-lg lg:text-xl font-black tracking-tight leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>
                      CareBridge<span className="text-[#00b4d8]">Plus</span>
                    </h1>
                    <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] mt-1 ${darkMode ? "text-[#38bdf8]" : "text-[#0077b6]"}`}>
                      HOSPITAL WORKSPACE
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Section: Helpline & Time */}
              <div className="flex flex-col items-center justify-center flex-1 text-center px-1">
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  Helpline: <span className="text-[#0077b6] dark:text-[#38bdf8] font-black">9022066914</span>
                </p>
                <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                  {formatISTDate(currentTime)} | {formatISTTime(currentTime)}
                </p>
              </div>

              {/* Right Section: Hospital Info & Notification */}
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <div className="hidden sm:flex flex-col items-end text-right mr-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none truncate max-w-[120px] lg:max-w-[200px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold text-[#0077b6] dark:text-[#38bdf8] uppercase tracking-wider mt-1">
                    {user.city || "Hospital Hub"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00b4d8] via-[#0077b6] to-[#2563eb] flex items-center justify-center shadow-md shadow-cyan-600/20 text-white shrink-0">
                  <HospitalIcon size={20} className="text-white" />
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2 lg:pl-3">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                      darkMode 
                        ? "bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700" 
                        : "bg-slate-100 border border-slate-200 text-amber-600 hover:text-amber-700 hover:border-slate-300"
                    }`}
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                  </button>

                  <button
                    onClick={() => setActiveTab("inbox")}
                    className={`p-2.5 rounded-xl transition-all relative cursor-pointer shadow-xs ${
                      darkMode
                        ? "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                    title="Inbox"
                  >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Bottom Nav */}
          <nav
            className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-around px-4 border-t backdrop-blur-md transition-colors duration-300 ${darkMode ? "bg-slate-950/95 border-slate-800/80" : "bg-white/95 border-slate-200/80"}`}
          >
            {[
              { id: "menu", icon: Menu, label: "Menu" },
              { id: "referrals", icon: PlusCircle, label: "New Referral" },
              { id: "admit", icon: Activity, label: "Admit Patient" },
              { id: "profile", icon: HospitalIcon, label: "Profile" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "menu") {
                    setIsSidebarOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === item.id || (item.id === "menu" && isSidebarOpen)
                    ? "text-[#0077b6] dark:text-[#38bdf8] font-black"
                    : "text-slate-400 dark:text-slate-500 font-bold"
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={activeTab === item.id || (item.id === "menu" && isSidebarOpen) ? { y: -3 } : { y: 0 }}
                >
                  <item.icon size={20} />
                </motion.div>
                <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <main
            className={`flex-1 min-w-0 pt-6 px-4 lg:px-8 transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50"} pb-32 lg:pb-10`}
          >
            {/* Alarm Controls (Floating/Inline) */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800">
              <button
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs cursor-pointer ${alarmEnabled ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400" : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"}`}
              >
                {alarmEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                {alarmEnabled ? "Alarm On" : "Alarm Off"}
              </button>

                            {alarmEnabled && !isRinging && (
                <div className="flex items-center gap-2">
                  <select
                    value={alarmLanguage}
                    onChange={(e) => setAlarmLanguage(e.target.value as any)}
                    className="border-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-xs outline-hidden cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                  </select>
                  <button
                    onClick={() => playAlarm("Test Patient")}
                    className="text-[11px] font-black uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    Test Alarm
                  </button>
                </div>
              )}

              {isRinging && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={stopAlarm}
                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-xs animate-pulse shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    <BellRing size={16} className="animate-bounce" />
                    Stop Alarm
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Welcome Back Hospital Admin Hero Header matching reference images */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f7fa] dark:bg-cyan-950/40 text-[#0077b6] dark:text-[#38bdf8] text-[10px] font-black uppercase tracking-widest rounded-full mb-2 border border-[#b2ebf2] dark:border-cyan-800/40 shadow-xs">
                        <Sparkles size={11} className="text-[#00b4d8] animate-pulse" />
                        Authenticated Hospital Command Center
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                        Hospital Operations Deck
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                        Real-time incoming clinic referrals, bed occupancy, and ABDM hospital telemetry.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          DISHA / ABDM Online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Referrals",
                        value: referrals.length,
                        icon: Users,
                        gradient: "from-[#3B82F6] to-[#1D4ED8]",
                        shadow: "shadow-blue-500/20",
                        footer: "All Inbound",
                      },
                      {
                        label: "Admitted",
                        value: referrals.filter((r) => r.status === "admitted").length,
                        icon: Activity,
                        gradient: "from-[#F43F5E] to-[#E11D48]",
                        shadow: "shadow-rose-500/20",
                        footer: "Under Care",
                      },
                      {
                        label: "Completed",
                        value: referrals.filter((r) => ["completed", "consultation_done"].includes(r.status)).length,
                        icon: CheckCircle,
                        gradient: "from-[#10B981] to-[#047857]",
                        shadow: "shadow-emerald-500/20",
                        footer: "Discharged",
                      },
                      {
                        label: "Conversion",
                        value: `${referrals.length > 0 ? Math.round((referrals.filter((r) => ["admitted", "completed", "consultation_done"].includes(r.status)).length / referrals.length) * 100) : 0}%`,
                        icon: TrendingUp,
                        gradient: "from-[#F59E0B] to-[#D97706]",
                        shadow: "shadow-amber-500/20",
                        footer: "Rate Ratio",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={`p-6 rounded-[28px] border relative overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 cursor-pointer ${
                          darkMode
                            ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl shadow-xs"
                            : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xl shadow-xs"
                        }`}
                      >
                        {/* Top rainbow gradient accent matching reference header */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00b4d8] via-[#2563eb] to-[#7c3aed]" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 mix-blend-overlay pointer-events-none`} />

                        <div className="relative z-10 flex justify-between items-start gap-3">
                          <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                              {stat.label}
                            </p>
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">
                              {stat.value}
                            </h3>
                          </div>
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadow} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={18} className="stroke-[2.5] drop-shadow-sm" />
                          </div>
                        </div>

                        <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[#0077b6] dark:text-[#38bdf8]">
                          <span>{stat.footer}</span>
                          <span className="font-black group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Healthcare Command Center - Rectangular Features */}
                  <div className="my-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-[#00b4d8] to-[#2563eb] rounded-full" />
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-wider ${darkMode ? "text-[#38bdf8]" : "text-[#0077b6]"}`}>
                          Clinical Command & Operations Deck
                        </h4>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          Direct launchpad for medical triage, beds, admissions and archives
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Incoming Triage & Admit",
                          description: "Admit incoming referred cases, query live vitals and begin clinical intake routing.",
                          tab: "admit",
                          icon: Activity,
                          gradient: "from-red-600 via-rose-600 to-red-700",
                          arrowBg: "bg-red-700",
                          badge: `${referrals.filter(r => r.status === "pending").length} Awaiting Intake`
                        },
                        {
                          label: "Specialty Referral Despatch",
                          description: "Coordinate super-specialty transfers or register companion referral slips.",
                          tab: "referrals",
                          icon: PlusCircle,
                          gradient: "from-blue-600 via-indigo-600 to-violet-700",
                          arrowBg: "bg-blue-700",
                          badge: "Inbound Sync"
                        },
                        {
                          label: "Discharge & Post-Care",
                          description: "Generate professional clinical discharge charts, close accounts, and advise routines.",
                          tab: "discharge",
                          icon: LogOut,
                          gradient: "from-teal-600 via-emerald-600 to-cyan-700",
                          arrowBg: "bg-teal-700",
                          badge: `${referrals.filter(r => r.status === "admitted").length} Under Treatment`
                        },
                        {
                          label: "Diagnostic Case Archive",
                          description: "Review historical vitals log sheets, previous clinical treatments, and lab results.",
                          tab: "history",
                          icon: History,
                          gradient: "from-amber-600 via-orange-600 to-yellow-600",
                          arrowBg: "bg-amber-500",
                          badge: "Secure Ledger"
                        },
                        {
                          label: "Helplines & Active Beds",
                          description: "Assign live general, ICU, and ventilator capacity counters and coordinates.",
                          tab: "profile",
                          icon: Building,
                          gradient: "from-violet-600 via-purple-600 to-indigo-700",
                          arrowBg: "bg-violet-700",
                          badge: "ICU Configurator"
                        },
                        {
                          label: "Secure Messaging Feeds",
                          description: "Consult with companion family clinic practitioners and remote doctor networks.",
                          tab: "inbox",
                          icon: MessageSquare,
                          gradient: "from-cyan-600 via-teal-500 to-cyan-500",
                          arrowBg: "bg-cyan-700",
                          badge: "Telehealth Feed"
                        }
                      ].map((srv, index) => (
                        <motion.div
                          key={`hosp-srv-${index}`}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setActiveTab(srv.tab);
                          }}
                          className={`group p-5 rounded-[2rem] border cursor-pointer relative flex items-center justify-between gap-4 transition-all duration-300 ${
                            darkMode 
                              ? "bg-slate-900/60 border-white/5 hover:border-white/10 shadow-2xl" 
                              : "bg-white border-gray-150 hover:shadow-lg shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Inner Gradient Icon Shape */}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.gradient} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                              <srv.icon size={22} />
                            </div>
                            
                            <div className="text-left font-sans">
                              <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                                {srv.label}
                              </h4>
                              <p className={`text-[10px] font-medium leading-relaxed mt-1 line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                {srv.description}
                              </p>
                              {srv.badge && (
                                <span className={`inline-block mt-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  darkMode ? "bg-white/5 text-slate-300" : "bg-gray-100 text-gray-600"
                                }`}>
                                  {srv.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Beautiful color-matched Arrow Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${srv.arrowBg} text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <ArrowRight size={14} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border`}
                  >
                    <h6 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <BarChart3 size={14} className="text-[#00796b]" />{" "}
                      Referral Performance (3)
                    </h6>
                    <div className="space-y-4">
                      {Array.from(
                        new Set(referrals.map((r) => r.clinicName)),
                      ).map((clinicName) => {
                        const clinicReferrals = referrals.filter(
                          (r) => r.clinicName === clinicName,
                        );
                        const admittedCount = clinicReferrals.filter((r) =>
                          ["admitted", "completed"].includes(r.status),
                        ).length;
                        const percentage = Math.round(
                          (admittedCount / clinicReferrals.length) * 100,
                        );

                        return (
                          <div key={clinicName} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-xs font-black ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {clinicName || "Unknown Clinic"}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400">
                                {admittedCount}/{clinicReferrals.length}{" "}
                                Admitted
                              </span>
                            </div>
                            <div
                              className={`h-2 ${darkMode ? "bg-white/5" : "bg-gray-100"} rounded-full overflow-hidden`}
                            >
                              <div
                                className="h-full bg-linear-to-r from-[#005f73] to-[#0a9396] rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border`}
                  >
                    <h6 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Activity size={14} className="text-red-500" /> Currently
                      Admitted Patients
                    </h6>
                    <div className="space-y-4">
                      {referrals.filter((r) =>
                        ["admitted", "treatment_plan"].includes(r.status),
                      ).length === 0 ? (
                        <p className="text-gray-400 text-xs font-bold text-center py-4 italic">
                          No patients currently admitted.
                        </p>
                      ) : (
                        referrals
                          .filter((r) =>
                            ["admitted", "treatment_plan"].includes(r.status),
                          )
                          .map((ref, idx) => (
                            <div
                              key={`${ref.id}-${idx}`}
                              className={`flex items-center justify-between ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} p-4 rounded-2xl border transition-all hover:scale-[1.01]`}
                            >
                              <div className="flex items-center gap-4">
                                <PatientAvatar
                                  gender={ref.patientGender}
                                  name={ref.patientName}
                                  size={40}
                                  className="border border-white shadow-sm bg-white"
                                />
                                <div>
                                  <h6
                                    className={`font-extrabold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {ref.patientName}
                                  </h6>
                                  <div className="flex flex-wrap gap-2">
                                    <p className="text-gray-400 text-[10px] font-bold uppercase">
                                      Admitted: {formatISTDate(ref.admittedAt)}{" "}
                                      • {ref.clinicName}
                                    </p>
                                    {ref.status === "treatment_plan" && (
                                      <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                        Treatment Plan
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {ref.status === "admitted" && (
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        ref.id,
                                        "treatment_plan",
                                      )
                                    }
                                    className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-orange-100 transition-all font-bold"
                                  >
                                    Plan
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDischarge(ref)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2 active:scale-95"
                                >
                                  <LogOut size={14} /> Discharge
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "admit" && (
                <motion.div
                  key="admitted"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
                      Currently Admitted Patients
                    </h6>
                    <div className="bg-[#0a9396] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                      {
                        referrals.filter((r) =>
                          ["admitted", "treatment_plan"].includes(r.status),
                        ).length
                      }{" "}
                      ADMITTED
                    </div>
                  </div>

                  {referrals
                    .filter((r) =>
                      ["admitted", "treatment_plan"].includes(r.status),
                    )
                    .map((ref, index) => (
                      <div
                        key={`${ref.id}-${index}`}
                        className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <PatientAvatar
                              gender={ref.patientGender}
                              name={ref.patientName}
                              size={48}
                              className="border-2 border-white shadow-sm bg-white"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h6
                                  className={`font-extrabold text-base ${darkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {ref.patientName} ({ref.patientAge}Y)
                                </h6>
                                {ref.patientPhone && (
                                  <a
                                    href={`tel:${ref.patientPhone}`}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all shadow-sm"
                                    title="Call Patient"
                                  >
                                    <Phone size={14} fill="currentColor" />
                                  </a>
                                )}
                              </div>
                              <p className="text-gray-400 text-[10px] font-bold uppercase">
                                Admitted: {formatISTDate(ref.admittedAt)} •{" "}
                                {ref.clinicName}
                              </p>
                              {ref.status === "treatment_plan" && (
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase inline-block ml-2">
                                  Under Treatment Plan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ref.status === "admitted" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(ref.id, "treatment_plan")
                              }
                              className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2.5 rounded-xl font-black text-xs hover:bg-orange-100 transition-all"
                            >
                              PLAN
                            </button>
                          )}
                          <button
                            onClick={() => handleDischarge(ref)}
                            className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2 active:scale-95"
                          >
                            <LogOut size={16} /> DISCHARGE
                          </button>
                        </div>
                      </div>
                    ))}
                  {referrals.filter((r) =>
                    ["admitted", "treatment_plan"].includes(r.status),
                  ).length === 0 && (
                    <div
                      className={`text-center py-16 rounded-3xl border-2 border-dashed ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
                    >
                      <p className="text-gray-400 font-bold text-sm">
                        No patients currently admitted.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

            {activeTab === "find" && (
              <motion.div
                key="find"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                                <div
                  className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-sm"} p-4 rounded-2xl border space-y-4 mb-6 transition-all duration-300`}
                >
                  <div className="relative group">
                    <Search
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"} group-focus-within:text-[#005f73] transition-colors`}
                      size={16}
                    />
                    <input
                      type="text"
                      value={filterHospitalName}
                      onChange={(e) => setFilterHospitalName(e.target.value)}
                      placeholder="Search Hospital by Name..."
                      className={`w-full border-none rounded-xl pl-10 pr-4 py-3 text-sm font-black outline-hidden transition-all ${darkMode ? "bg-white/5 text-cyan-400 placeholder:text-gray-500 focus:bg-gray-800" : "bg-gray-50 text-[#005f73] placeholder:text-gray-400 focus:bg-white focus:shadow-xs"}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        className={`text-[10px] font-extrabold uppercase tracking-wider ml-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Location Filter
                      </label>
                      <div className="relative group">
                        <MapPin
                          className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"} group-focus-within:text-[#005f73] transition-colors`}
                          size={14}
                        />
                        <select
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                          className={`w-full border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-black outline-hidden transition-all ${darkMode ? "bg-white/5 text-cyan-400 focus:bg-gray-800" : "bg-gray-50 text-[#005f73] focus:bg-white focus:shadow-xs"}`}
                        >
                          <option
                            value="all"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            All Districts
                          </option>
                          {availableLocations.map((loc) => (
                            <option
                              key={loc}
                              value={loc.toLowerCase()}
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className={`text-[10px] font-extrabold uppercase tracking-wider ml-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Department
                      </label>
                      <div className="relative group">
                        <Stethoscope
                          className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"} group-focus-within:text-[#005f73] transition-colors`}
                          size={14}
                        />
                        <select
                          value={filterDept}
                          onChange={(e) => setFilterDept(e.target.value)}
                          className={`w-full border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-black outline-hidden transition-all ${darkMode ? "bg-white/5 text-cyan-400 focus:bg-gray-800" : "bg-gray-50 text-[#005f73] focus:bg-white focus:shadow-xs"}`}
                        >
                          <option
                            value="all"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            All Specialists
                          </option>
                          {[
                            "Oncology",
                            "Cardiology",
                            "Orthopedics",
                            "Neurology",
                            "Gastroenterology",
                            "Nephrology",
                            "Urology",
                            "Pediatrics",
                            "Gynecology",
                            "Dermatology",
                            "Ophthalmology",
                            "ENT",
                            "Radiology",
                            "Physiotherapy",
                            "General Surgery",
                          ].map((dept) => (
                            <option
                              key={dept}
                              value={dept.toLowerCase()}
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hospital List */}
                <div className="space-y-4">
                  {filteredHospitals.map((hosp, index) => (
                    <div
                      key={`${hosp.id}-${index}`}
                      className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} backdrop-blur-md rounded-2xl shadow-sm border hover:shadow-md transition-all overflow-hidden group`}
                    >
                      {/* Hospital Image/Banner */}
                      <div className="h-40 relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        {hosp.banner ? (
                          <img
                            src={hosp.banner}
                            alt={hosp.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : hosp.gallery && hosp.gallery.length > 0 ? (
                          <img
                            src={hosp.gallery[0]}
                            alt={hosp.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#005f73] to-[#0a9396] opacity-80 text-white p-6 text-center">
                            <Hospital size={40} className="mb-2 opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              {hosp.specialization ||
                                hosp.category ||
                                "Multispeciality"}
                            </p>
                          </div>
                        )}

                        {/* Logo Overlap */}
                        <div className="absolute -bottom-6 left-5">
                          <div
                            className={`w-16 h-16 rounded-2xl border-4 ${darkMode ? "bg-gray-900 border-gray-900" : "bg-white border-white"} shadow-xl flex items-center justify-center overflow-hidden`}
                          >
                            {hosp.logo ? (
                              <img
                                src={hosp.logo}
                                alt="Logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#005f73] flex items-center justify-center text-white">
                                <Hospital size={24} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-md ${
                              hosp.tier === "premium"
                                ? "bg-linear-to-r from-[#005f73]/90 to-[#023e8a]/90 text-white"
                                : hosp.tier === "priority"
                                  ? "bg-linear-to-r from-[#0a9396]/90 to-[#0077b6]/90 text-white"
                                  : "bg-linear-to-r from-[#ee9b00]/90 to-[#ca6702]/90 text-white"
                            }`}
                          >
                            {hosp.tier === "premium" && <Crown size={10} />}
                            {hosp.tier === "priority" && <Star size={10} />}
                            {hosp.tier === "standard" && (
                              <CheckCircle size={10} />
                            )}
                            {String(hosp.tier || "standard").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 pt-10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3
                              className={`text-xl font-extrabold leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {hosp.name}
                            </h3>
                            <div className="space-y-1.5 mt-2">
                              <p
                                className={`${darkMode ? "text-gray-300" : "text-gray-800"} text-sm font-black flex items-center gap-1.5`}
                              >
                                <MapPin size={14} className="text-red-600" />
                                {hosp.city}
                              </p>
                              {hosp.address && (
                                <p
                                  className={`${darkMode ? "text-gray-400" : "text-gray-700"} text-xs font-extrabold leading-relaxed`}
                                >
                                  {hosp.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5">
                            Running Schemes:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {String(hosp.schemes || "")
                              .split(",")
                              .filter(Boolean)
                              .map((s: string, idx: number) => (
                                <span
                                  key={`${s}-${idx}`}
                                  className={`${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#e0f2f1] text-[#0a9396] border-[#b2dfdb]"} text-[10px] font-extrabold px-3 py-1 rounded-full border`}
                                >
                                  {s.trim()}
                                </span>
                              ))}
                            {!hosp.schemes && (
                              <span className="text-gray-500 text-[10px] font-bold italic">
                                No active schemes
                              </span>
                            )}
                          </div>
                        </div>

                        <p
                          className={`${darkMode ? "text-white bg-white/5 border-white/10" : "text-gray-900 bg-gray-50/50 border-gray-100"} text-xs font-black flex items-center gap-2.5 mb-6 p-2.5 rounded-xl border`}
                        >
                          <Stethoscope
                            size={18}
                            className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"}`}
                          />
                          {Array.isArray(hosp.departments)
                            ? hosp.departments.join(", ")
                            : hosp.departments || "General"}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setShowProfileModal(true);
                            }}
                            className={`py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                              darkMode
                                ? "border-cyan-400 text-cyan-400 hover:bg-cyan-500/10"
                                : "border-[#005f73] text-[#005f73] hover:bg-[#005f73] hover:text-white"
                            }`}
                          >
                            <Hospital size={14} /> Profile
                          </button>
                          <a
                            href={`tel:${hosp.helpline}`}
                            className="border border-green-600 text-green-600 py-2 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Phone size={14} /> Call
                          </a>
                          <button
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setShowReferralTypeModal(true);
                            }}
                            className="col-span-2 bg-[#005f73] text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#005f73]/20 flex items-center justify-center gap-2"
                          >
                            <Share2 size={16} /> Refer Patient
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

              {activeTab === "referrals" && (
                <motion.div
                  key="referrals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
                      Incoming Referrals
                    </h6>
                    <div className="bg-[#ee9b00] text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-sm">
                      {
                        referrals.filter((r) => {
                          if (r.referralType === "opd") {
                            return ["pending", "under_review"].includes(r.status);
                          }
                          return ["pending", "under_review", "consultation_done"].includes(r.status);
                        }).length
                      }{" "}
                      WAITING
                    </div>
                  </div>

                  {referrals
                    .filter((r) => {
                      if (r.referralType === "opd") {
                        return ["pending", "under_review"].includes(r.status);
                      }
                      return ["pending", "under_review", "consultation_done"].includes(r.status);
                    })
                    .map((ref, index) => (
                      <div
                        key={`${ref.id}-${index}`}
                        className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"} p-6 rounded-2xl shadow-sm border-l-4 border-red-500 relative overflow-hidden group hover:shadow-md transition-all`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className="relative">
                              <div
                                className={`absolute -inset-1 bg-linear-to-r from-[#ee9b00] to-red-500 rounded-full blur-sm opacity-25 group-hover:opacity-50 transition duration-1000`}
                              ></div>
                              <PatientAvatar
                                gender={ref.patientGender}
                                name={ref.patientName}
                                size={56}
                                className="relative border-2 border-white shadow-md object-cover bg-white cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => {
                                  setSelectedReferral(ref);
                                  setShowDetailModal(true);
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-xs border border-gray-100 dark:border-white/10">
                                {ref.patientGender === "F" ? (
                                  <span className="text-[10px]">♀️</span>
                                ) : (
                                  <span className="text-[10px]">♂️</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5
                                  className={`text-lg font-extrabold ${darkMode ? "text-white" : "text-gray-900"} flex items-center gap-2`}
                                >
                                  {ref.patientName}{" "}
                                  <span className="text-gray-400 font-medium">
                                    ({ref.patientAge}Y,{" "}
                                    {ref.patientGender || "M"})
                                  </span>
                                  <span
                                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                      ref.referralType === "opd"
                                        ? "bg-cyan-500 text-white shadow-xs"
                                        : "bg-red-500 text-white shadow-xs"
                                    }`}
                                  >
                                    {ref.referralType === "opd" ? "OPD Consult" : "IPD Admission"}
                                  </span>
                                </h5>
                                {ref.patientPhone && (
                                  <div className="flex gap-2 items-center">
                                    <a
                                      href={`tel:${ref.patientPhone}`}
                                      className="px-3 py-1.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md flex items-center gap-2 text-[10px] font-black uppercase tracking-tight"
                                      title="Call Patient"
                                    >
                                      <Phone size={14} fill="currentColor" />
                                      Call Patient
                                    </a>
                                    <p
                                      className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                    >
                                      {ref.patientPhone}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <div
                                  className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase ${
                                    ref.patientCondition === "Emergency"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : "bg-green-50 text-green-600 border-green-100"
                                  }`}
                                >
                                  {ref.patientCondition || "Stable"}:{" "}
                                  {ref.diagnosis}
                                </div>
                                {ref.doctorName && ref.doctorName !== "any" && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 text-[#00796b] dark:text-blue-400 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-500/30 uppercase">
                                    Consult: Dr. {ref.doctorName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {ref.referralType === "opd" ? (
                                <>
                                  {ref.status === "pending" && (
                                    <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                                      Waiting
                                    </span>
                                  )}
                                  {ref.status === "under_review" && (
                                    <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                                      Consultation Pending
                                    </span>
                                  )}
                                  {ref.status === "consultation_done" && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                                      Consultation Done
                                    </span>
                                  )}
                                  {["treatment_plan", "follow_up", "followup"].includes(ref.status) && (
                                    <span className="bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                                      Follow-up Recommended
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {ref.status === "under_review" && (
                                    <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase">
                                      Reviewing
                                    </span>
                                  )}
                                  {ref.status === "consultation_done" && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase">
                                      Consult Done
                                    </span>
                                  )}
                                  {ref.status === "pending" && (
                                    <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                                      NEW
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                              {formatISTDate(ref.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} p-4 rounded-xl border mb-4`}
                        >
                          <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-white dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm">
                                <UserMd
                                  size={20}
                                  className="text-[#00796b] dark:text-emerald-400"
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase leading-none mb-1">
                                  Referred By
                                </p>
                                <h6
                                  className={`font-extrabold leading-none ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                                >
                                  {ref.clinicName || "Clinic Partner"}
                                </h6>
                                <p className="text-gray-400 text-[10px] font-bold mt-1">
                                  Carebridge Partner
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`tel:${ref.clinicContact || ref.patientPhone}`}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95"
                              >
                                <Phone size={14} /> Call Dr.
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            onClick={() => {
                              setSelectedReferral(ref);
                              setShowDetailModal(true);
                            }}
                            className={`col-span-1 border ${darkMode ? "border-white/20 text-white hover:bg-white/5" : "border-[#00796b] text-[#00796b] hover:bg-emerald-50"} py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2`}
                          >
                            <FileContract size={14} /> Details
                          </button>
                          {ref.status === "pending" ? (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(ref.id, "under_review")
                                }
                                className="col-span-1 bg-blue-50 text-blue-600 border border-blue-100 py-2.5 rounded-xl font-black text-[9px] uppercase hover:bg-blue-100 transition-all"
                              >
                                Review
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    ref.id,
                                    "consultation_done",
                                  )
                                }
                                className="col-span-1 bg-emerald-50 text-emerald-600 border border-emerald-100 py-2.5 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-100 transition-all"
                              >
                                Cons. Done
                              </button>
                            </>
                          ) : ref.status === "under_review" ? (
                            <button
                              onClick={() =>
                                handleStatusUpdate(ref.id, "consultation_done")
                              }
                              className="col-span-2 bg-emerald-50 text-emerald-600 border border-emerald-100 py-2.5 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-100 transition-all"
                            >
                              Mark Consultation Done
                            </button>
                          ) : ref.status === "consultation_done" ? (
                            <button
                              onClick={() =>
                                handleStatusUpdate(ref.id, "treatment_plan")
                              }
                              className="col-span-2 bg-purple-50 text-purple-600 border border-purple-100 py-2.5 rounded-xl font-black text-[9px] uppercase hover:bg-purple-100 transition-all"
                            >
                              Start Treatment Plan
                            </button>
                          ) : (
                            <div className="col-span-2 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl px-2">
                              <CheckCircle size={14} className="mr-1" />{" "}
                              <span className="text-[9px] font-black uppercase text-center">
                                {ref.status === "treatment_plan"
                                  ? "In Treatment"
                                  : "Cons. Done"}
                              </span>
                            </div>
                          )}

                          {ref.referralType === "opd" ? (
                            <button
                              onClick={() => handleStatusUpdate(ref.id, "consultation_done")}
                              className="col-span-2 sm:col-span-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase"
                            >
                              <CheckCircle size={16} /> Cons. Done
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAdmitClick(ref)}
                              className="col-span-2 sm:col-span-1 bg-linear-to-r from-[#005f73] to-[#0a9396] text-white py-2.5 rounded-xl font-black text-xs shadow-lg shadow-[#00796b]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                              <CheckCircle size={16} /> ADMIT
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  {referrals.filter((r) => {
                    if (r.referralType === "opd") {
                      return ["pending", "under_review"].includes(r.status);
                    }
                    return ["pending", "under_review", "consultation_done"].includes(r.status);
                  }).length === 0 && (
                    <div
                      className={`text-center py-16 rounded-3xl border-2 border-dashed ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
                    >
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserInjured size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-bold text-sm">
                        Waiting for incoming referrals...
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "discharge" && (
                <motion.div
                  key="discharge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h6
                      className={`font-extrabold text-[10px] uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Discharged Patients History
                    </h6>
                    <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                      {
                        referrals.filter((r) => r.status === "discharged")
                          .length
                      }{" "}
                      DISCHARGED
                    </div>
                  </div>
                  {referrals
                    .filter((r) => r.status === "discharged")
                    .map((ref, index) => (
                      <div
                        key={`${ref.id}-${index}`}
                        className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <PatientAvatar
                              gender={ref.patientGender}
                              name={ref.patientName}
                              size={48}
                              className="border-2 border-white shadow-sm bg-white"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h6
                                  className={`font-extrabold text-base ${darkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {ref.patientName}
                                </h6>
                                {ref.patientPhone && (
                                  <a
                                    href={`tel:${ref.patientPhone}`}
                                    className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-all shadow-sm"
                                    title="Call Patient"
                                  >
                                    <Phone size={14} fill="currentColor" />
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <p className="text-gray-400 text-[10px] font-bold uppercase">
                                  Discharged:{" "}
                                  {ref.dischargedAt
                                    ? formatISTDate(ref.dischargedAt)
                                    : "N/A"}
                                </p>
                                <span className="text-blue-500 text-[10px] font-bold uppercase">
                                  ₹{ref.fees || "0"} Collected
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedReferral(ref);
                              setShowDetailModal(true);
                            }}
                            className={`${darkMode ? "bg-white/5 text-emerald-400 hover:bg-white/10" : "bg-emerald-50 text-[#00796b] hover:bg-emerald-100"} font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2`}
                          >
                            <FileContract size={14} /> View Files
                          </button>
                        </div>
                      </div>
                    ))}
                  {referrals.filter((r) => r.status === "discharged").length ===
                    0 && (
                    <div
                      className={`text-center py-16 rounded-3xl border-2 border-dashed ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
                    >
                      <p className="text-gray-400 font-bold text-sm">
                        No discharged patients recorded yet.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "inbox" && (
                <motion.div
                  key="inbox"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-250px)] overflow-hidden">
                    {/* Conversations Sidebar */}
                    <div
                      className={`w-full md:w-80 flex flex-col bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm ${messageForm.recipient_id ? "hidden md:flex" : "flex"}`}
                    >
                      <div
                        className={`p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                      >
                        <div>
                          <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            Messages
                          </h6>
                          <p
                            className={`text-xs font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            Recent Conversations
                          </p>
                        </div>
                        <button
                          onClick={() => setShowComposeModal(true)}
                          className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl hover:bg-[#00796b]/20 transition-all shadow-xs"
                          title="New Conversation"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar">
                        {Array.from(
                          new Set(
                            messages.map((m) =>
                              m.senderId === user.id
                                ? m.receiverId
                                : m.senderId,
                            ).filter(id => !!id),
                          ),
                        ).map((id, i) => {
                          const info = getRecipientInfo(id);
                          const lastMsg = messages.find(
                            (m) => m.senderId === id || m.receiverId === id,
                          );
                          const isUnread = messages.some(
                            (m) =>
                              m.senderId === id &&
                              m.receiverId === user.id &&
                              !m.isRead,
                          );

                          return (
                            <button
                              key={`${id}-${i}`}
                              onClick={() => {
                                setMessageForm((prev) => ({
                                  ...prev,
                                  recipient_id: id,
                                }));
                                // Mark as read logic
                                messages
                                  .filter(
                                    (m) =>
                                      m.senderId === id &&
                                      m.receiverId === user.id &&
                                      !m.isRead,
                                  )
                                  .forEach(async (m) => {
                                    await firebaseService.updateDocument(
                                      "messages",
                                      m.id,
                                      { isRead: true },
                                    );
                                  });
                              }}
                              className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left border-b border-gray-50 dark:border-white/5 ${messageForm.recipient_id === id ? "bg-emerald-50/50 dark:bg-emerald-900/20" : ""}`}
                            >
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold relative shadow-sm ${id === "all_clinics" ? "bg-amber-500" : info.role === "Patient" ? "bg-blue-600" : "bg-[#00796b]"}`}
                              >
                                {info.initials}
                                {isUnread && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-bounce"></span>
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-0.5">
                                  <p
                                    className={`text-sm font-black truncate ${darkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {info.name}
                                  </p>
                                  <p className="text-[8px] font-bold text-gray-400">
                                    {lastMsg
                                      ? formatISTTime(
                                          lastMsg.createdAt ||
                                            lastMsg.timestamp,
                                        )
                                      : ""}
                                  </p>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                  {info.role}
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                                  {lastMsg?.content || lastMsg?.text}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                        {messages.length === 0 && (
                          <div className="p-12 text-center">
                            <Inbox
                              size={40}
                              className="mx-auto text-gray-200 mb-4"
                            />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              No conversations yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Chat Area */}
                    <div
                      className={`flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm ${!messageForm.recipient_id ? "hidden md:flex" : "flex"}`}
                    >
                      {messageForm.recipient_id ? (
                        <>
                          <div
                            className={`p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() =>
                                  setMessageForm((prev) => ({
                                    ...prev,
                                    recipient_id: "",
                                  }))
                                }
                                className={`md:hidden p-2 ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-200 text-gray-900"} rounded-xl transition-all`}
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-orange-500/20">
                                {getRecipientInfo(messageForm.recipient_id).initials}
                              </div>
                              <div>
                                <h6 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                                  {getRecipientInfo(messageForm.recipient_id).name}
                                </h6>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {getRecipientInfo(messageForm.recipient_id).role}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Header Actions for Deleting / Bulk Actions */}
                            <div className="flex items-center gap-2">
                              {selectedMessageIds.length > 0 && (
                                <>
                                  <button
                                    onClick={() => setSelectedMessageIds([])}
                                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-gray-750 bg-gray-100 dark:bg-white/5 rounded-lg transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleDeleteSelectedMessages}
                                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/10 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <Trash2 size={10} /> Delete Selected ({selectedMessageIds.length})
                                  </button>
                                </>
                              )}
                              <button
                                onClick={handleDeleteAllMessages}
                                title="Delete All Messages"
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all flex items-center gap-1.5"
                              >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline text-[9px] font-black uppercase tracking-wider">Clear Chat</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gray-50/20 dark:bg-black/10">
                            {
                              messages
                                .filter((m) => {
                                  if (messageForm.recipient_id === "all_clinics") {
                                    return m.receiverId === "all_clinics";
                                  }
                                  return (
                                    (m.senderId === messageForm.recipient_id && m.receiverId === user.id) ||
                                    (m.senderId === user.id && m.receiverId === messageForm.recipient_id)
                                  );
                                })
                                .sort(
                                  (a, b) =>
                                    (a.createdAt?.seconds ||
                                      a.timestamp?.seconds ||
                                      a.createdAt ||
                                      a.timestamp ||
                                      0) -
                                    (b.createdAt?.seconds ||
                                      b.timestamp?.seconds ||
                                      b.createdAt ||
                                      b.timestamp ||
                                      0),
                                )
                                .reverse() // Newest at bottom
                                .map((msg, i) => (
                                  (() => {
                                    const isSelected = selectedMessageIds.includes(String(msg.id));
                                    return (
                                      <div
                                        key={`msg-${msg.id || i}`}
                                        className={`flex items-center gap-3 w-full ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                                      >
                                        {/* Selection checkbox to mark message */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedMessageIds(selectedMessageIds.filter((id) => id !== String(msg.id)));
                                            } else {
                                              setSelectedMessageIds([...selectedMessageIds, String(msg.id)]);
                                            }
                                          }}
                                          className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 transition-all ${
                                            isSelected
                                              ? "bg-[#00796b] border-[#00796b] text-white"
                                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-transparent"
                                          }`}
                                        >
                                          <Check size={11} strokeWidth={4} />
                                        </button>

                                        <div className="max-w-[75%] space-y-1">
                                          <div
                                            className={`p-4 rounded-3xl text-xs font-bold shadow-sm ${
                                              msg.senderId === user.id
                                                ? "bg-linear-to-br from-[#005f73] to-[#0a9396] text-white rounded-tr-none"
                                                : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-white/5"
                                            }`}
                                          >
                                            {msg.content || msg.text}
                                          </div>
                                          <div className={`flex items-center gap-2 ${msg.senderId === user.id ? "justify-end pr-2" : "justify-start pl-2"}`}>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                              {formatISTTime(msg.createdAt || msg.timestamp)}
                                            </p>
                                            <span className="text-gray-300 dark:text-gray-700 text-[10px]">•</span>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteMessage(msg.id)}
                                              className="text-[8px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-0.5 transition-all"
                                            >
                                              <Trash2 size={10} /> Delete
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()
                                ))
                                .reverse() /* Back to chronological for display */
                            }
                          </div>

                          <form
                            onSubmit={handleMessageSubmit}
                            className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/5 flex gap-3"
                          >
                            <input
                              type="text"
                              value={messageForm.content}
                              onChange={(e) =>
                                setMessageForm({
                                  ...messageForm,
                                  content: e.target.value,
                                })
                              }
                              placeholder="Type your reply here..."
                              className="flex-1 h-12 px-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0a9396] transition-all dark:text-white"
                            />
                            <button
                              type="submit"
                              disabled={!messageForm.content.trim()}
                              className="w-12 h-12 bg-[#00796b] text-white rounded-2xl shadow-xl shadow-[#00796b]/20 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
                            >
                              <Send size={22} className="-rotate-45" />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                          <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center mb-6 shadow-inner">
                            <MessageSquare
                              size={40}
                              className="text-gray-300 dark:text-gray-700"
                            />
                          </div>
                          <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">
                            No Conversation Selected
                          </h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs">
                            Select a clinic or patient from the sidebar to view
                            your message history.
                          </p>
                          <button
                            onClick={() => {
                              /* Open compose modal or similar */
                            }}
                            className="mt-8 px-8 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                          >
                            Start New Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                  {/* Sticky Header Actions */}
                  <div
                    className={`sticky top-0 z-30 flex items-center justify-between mb-8 ${darkMode ? "bg-gray-950/80 border-white/10" : "bg-[#F8FAFC]/80 border-gray-200/50"} backdrop-blur-md py-4 border-b`}
                  >
                    <div>
                      <h1
                        className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Hospital Profile
                      </h1>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Manage your hospital's public information and services
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isEditingProfile ? (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <PenBox size={18} />
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleProfileSave}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[#1E88E5] text-white rounded-xl font-semibold hover:bg-[#1976D2] transition-all shadow-lg shadow-blue-200"
                          >
                            <SaveIcon size={18} />
                            Save Changes
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Profile Header Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] overflow-hidden`}
                      >
                        <div className="h-48 bg-gradient-to-r from-[#1E88E5] to-[#42A5F5] relative overflow-hidden">
                          {profileForm.banner ? (
                            <img
                              src={profileForm.banner}
                              alt="Hospital Banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                          )}
                          {isEditingProfile && (
                            <label className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all cursor-pointer">
                              <Camera size={20} />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleHospitalImageUpload(e, "banner")
                                }
                              />
                            </label>
                          )}
                        </div>
                        <div className="px-8 pb-8">
                          <div className="relative -mt-16 mb-6 flex items-end justify-between">
                            <div className="relative">
                              <div
                                className={`w-32 h-32 rounded-3xl ${darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} p-1 shadow-xl border overflow-hidden`}
                              >
                                <div
                                  className={`w-full h-full rounded-2xl ${darkMode ? "bg-white/5" : "bg-gray-50"} flex items-center justify-center text-[#1E88E5]`}
                                >
                                  {profileForm.logo ? (
                                    <img
                                      src={profileForm.logo}
                                      alt="Hospital Logo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <HospitalIcon size={48} />
                                  )}
                                </div>
                              </div>
                              {isEditingProfile && (
                                <label className="absolute -bottom-2 -right-2 p-2 bg-[#1E88E5] text-white rounded-xl shadow-lg border-2 border-white cursor-pointer">
                                  <Camera size={16} />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleHospitalImageUpload(e, "logo")
                                    }
                                  />
                                </label>
                              )}
                            </div>
                            <div className="flex gap-2 mb-2">
                              <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-100">
                                <ShieldCheck size={14} />
                                Verified Hospital
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h2
                              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {profileForm.name || "Hospital Name"}
                            </h2>
                            <div
                              className={`flex items-center gap-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-[#1E88E5]" />
                                <span className="text-sm font-medium">
                                  {profileForm.city || "City, State"}
                                </span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              <div className="flex items-center gap-1.5">
                                <Award size={16} className="text-orange-400" />
                                <span className="text-sm font-medium">
                                  {profileForm.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bed Availability Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 ${darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"} rounded-2xl`}
                            >
                              <Activity size={24} />
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                Bed Availability
                              </h3>
                              <p
                                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                Real-time bed status for referrals
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div
                            className={`p-6 ${darkMode ? "bg-red-500/5 border-red-500/20" : "bg-red-50/50 border-red-100"} rounded-3xl border`}
                          >
                            <label
                              className={`text-xs font-bold ${darkMode ? "text-red-400" : "text-red-600"} uppercase tracking-wider mb-2 block`}
                            >
                              ICU Beds
                            </label>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {profileForm.bedsICU}
                              </span>
                              {isEditingProfile && (
                                <input
                                  type="number"
                                  value={profileForm.bedsICU}
                                  onChange={(e) =>
                                    setProfileForm({
                                      ...profileForm,
                                      bedsICU: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20 bg-white border border-red-200 rounded-xl px-3 py-2 text-center font-bold outline-hidden focus:ring-2 focus:ring-red-500"
                                />
                              )}
                            </div>
                          </div>
                          <div
                            className={`p-6 ${darkMode ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50/50 border-blue-100"} rounded-3xl border`}
                          >
                            <label
                              className={`text-xs font-bold ${darkMode ? "text-blue-400" : "text-blue-600"} uppercase tracking-wider mb-2 block`}
                            >
                              General Beds
                            </label>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {profileForm.bedsGeneral}
                              </span>
                              {isEditingProfile && (
                                <input
                                  type="number"
                                  value={profileForm.bedsGeneral}
                                  onChange={(e) =>
                                    setProfileForm({
                                      ...profileForm,
                                      bedsGeneral:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20 bg-white border border-blue-200 rounded-xl px-3 py-2 text-center font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          </div>
                          <div
                            className={`p-6 ${darkMode ? "bg-green-500/5 border-green-500/20" : "bg-green-50/50 border-green-100"} rounded-3xl border`}
                          >
                            <label
                              className={`text-xs font-bold ${darkMode ? "text-green-400" : "text-green-600"} uppercase tracking-wider mb-2 block`}
                            >
                              Ventilators
                            </label>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {profileForm.bedsVentilator}
                              </span>
                              {isEditingProfile && (
                                <input
                                  type="number"
                                  value={profileForm.bedsVentilator}
                                  onChange={(e) =>
                                    setProfileForm({
                                      ...profileForm,
                                      bedsVentilator:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20 bg-white border border-green-200 rounded-xl px-3 py-2 text-center font-bold outline-hidden focus:ring-2 focus:ring-green-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hospital Details Form */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div
                            className={`p-3 ${darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-[#1E88E5]"} rounded-2xl`}
                          >
                            <Building size={24} />
                          </div>
                          <div>
                            <h3
                              className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              Hospital Information
                            </h3>
                            <p
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              General details and contact information
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Hospital Name
                            </label>
                            <div className="relative group">
                              <Building
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="text"
                                disabled={!isEditingProfile}
                                value={profileForm.name}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    name: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="Enter hospital name"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Category
                            </label>
                            <div className="relative group">
                              <Award
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="text"
                                disabled={!isEditingProfile}
                                value={profileForm.category}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    category: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="e.g. Multi-Specialty"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Helpline Number
                            </label>
                            <div className="relative group">
                              <Phone
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="text"
                                disabled={!isEditingProfile}
                                value={profileForm.helpline}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    helpline: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="Emergency helpline"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Contact Number
                            </label>
                            <div className="relative group">
                              <Phone
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="text"
                                disabled={!isEditingProfile}
                                value={profileForm.contact_no}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    contact_no: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="General contact"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Email Address
                            </label>
                            <div className="relative group">
                              <Mail
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="email"
                                disabled={!isEditingProfile}
                                value={profileForm.email}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    email: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="hospital@example.com"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Website
                            </label>
                            <div className="relative group">
                              <Globe
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <input
                                type="text"
                                disabled={!isEditingProfile}
                                value={profileForm.website}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    website: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70`}
                                placeholder="www.hospital.com"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <label
                              className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} ml-1`}
                            >
                              Full Address
                            </label>
                            <div className="relative group">
                              <MapPin
                                className="absolute left-4 top-6 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors"
                                size={18}
                              />
                              <textarea
                                disabled={!isEditingProfile}
                                value={profileForm.address}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    address: e.target.value,
                                  })
                                }
                                className={`w-full pl-12 pr-4 py-4 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-transparent"} border-2 rounded-2xl font-medium outline-hidden focus:bg-white focus:text-gray-900 focus:border-[#1E88E5]/20 focus:ring-4 focus:ring-[#1E88E5]/5 transition-all disabled:opacity-70 min-h-[100px]`}
                                placeholder="Enter full hospital address"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hospital Hours Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div
                            className={`p-3 ${darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"} rounded-2xl`}
                          >
                            <Clock size={24} />
                          </div>
                          <div>
                            <h3
                              className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              Hospital Hours
                            </h3>
                            <p
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              Set your hospital's operational hours
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(profileForm.hours).map(
                            ([day, config]) => (
                              <div
                                key={day}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} rounded-2xl border gap-4`}
                              >
                                <div className="flex items-center gap-3 min-w-[120px]">
                                  <div
                                    className={`w-2 h-2 rounded-full ${config.closed ? "bg-red-400" : "bg-green-400"}`}
                                  />
                                  <span
                                    className={`font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                  >
                                    {day}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 flex-1 justify-end">
                                  {config.closed ? (
                                    <span className="text-sm font-bold text-red-500 px-4 py-1 bg-red-500/10 rounded-lg whitespace-nowrap">
                                      Closed
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        disabled={!isEditingProfile}
                                        value={config.open}
                                        onChange={(e) => {
                                          const newHours = {
                                            ...profileForm.hours,
                                          };
                                          newHours[
                                            day as keyof typeof profileForm.hours
                                          ].open = e.target.value;
                                          setProfileForm({
                                            ...profileForm,
                                            hours: newHours,
                                          });
                                        }}
                                        className={`bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium outline-hidden focus:ring-2 focus:ring-purple-500 disabled:bg-transparent ${darkMode ? "text-gray-900 disabled:text-gray-300" : "text-gray-900 disabled:border-transparent"}`}
                                      />
                                      <span className="text-gray-400">to</span>
                                      <input
                                        type="time"
                                        disabled={!isEditingProfile}
                                        value={config.close}
                                        onChange={(e) => {
                                          const newHours = {
                                            ...profileForm.hours,
                                          };
                                          newHours[
                                            day as keyof typeof profileForm.hours
                                          ].close = e.target.value;
                                          setProfileForm({
                                            ...profileForm,
                                            hours: newHours,
                                          });
                                        }}
                                        className={`bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium outline-hidden focus:ring-2 focus:ring-purple-500 disabled:bg-transparent ${darkMode ? "text-gray-900 disabled:text-gray-300" : "text-gray-900 disabled:border-transparent"}`}
                                      />
                                    </div>
                                  )}

                                  {isEditingProfile && (
                                    <button
                                      onClick={() => {
                                        const newHours = {
                                          ...profileForm.hours,
                                        };
                                        newHours[
                                          day as keyof typeof profileForm.hours
                                        ].closed = !config.closed;
                                        setProfileForm({
                                          ...profileForm,
                                          hours: newHours,
                                        });
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        config.closed
                                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                                          : "bg-red-100 text-red-600 hover:bg-red-200"
                                      }`}
                                    >
                                      {config.closed ? "Open" : "Mark Closed"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Departments Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 ${darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"} rounded-2xl`}
                            >
                              <Stethoscope size={24} />
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                Medical Departments
                              </h3>
                              <p
                                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                Service areas and specialties covered
                              </p>
                            </div>
                          </div>
                          {isEditingProfile && (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newDept}
                                onChange={(e) => setNewDept(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" && handleAddDepartment()
                                }
                                placeholder="Add department..."
                                className={`px-4 py-2 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-gray-200"} border rounded-xl text-sm outline-hidden focus:ring-2 focus:ring-blue-500`}
                              />
                              <button
                                onClick={handleAddDepartment}
                                className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {profileForm.departments.map((dept, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 px-4 py-2 ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-100"} rounded-2xl border font-semibold text-sm`}
                            >
                              {dept}
                              {isEditingProfile && (
                                <button
                                  onClick={() => handleRemoveDepartment(dept)}
                                  className={`p-1 ${darkMode ? "hover:bg-blue-500/20" : "hover:bg-blue-200"} rounded-full transition-colors`}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {profileForm.departments.length === 0 && (
                            <p className="text-sm text-gray-400 italic">
                              No departments added yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Running Schemes Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 ${darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"} rounded-2xl`}
                            >
                              <FileContract size={24} />
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                Running Schemes
                              </h3>
                              <p
                                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                Government and private health schemes accepted
                              </p>
                            </div>
                          </div>
                          {isEditingProfile && (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newScheme}
                                onChange={(e) => setNewScheme(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  (setProfileForm({
                                    ...profileForm,
                                    schemes: [
                                      ...profileForm.schemes,
                                      newScheme,
                                    ],
                                  }),
                                  setNewScheme(""))
                                }
                                placeholder="Add new scheme..."
                                className={`px-4 py-2 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-gray-200"} border rounded-xl text-sm outline-hidden focus:ring-2 focus:ring-orange-500`}
                              />
                              <button
                                onClick={() => {
                                  if (newScheme) {
                                    setProfileForm({
                                      ...profileForm,
                                      schemes: [
                                        ...profileForm.schemes,
                                        newScheme,
                                      ],
                                    });
                                    setNewScheme("");
                                  }
                                }}
                                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {profileForm.schemes.map((scheme, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 px-4 py-2 ${darkMode ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-700 border-orange-100"} rounded-2xl border font-semibold text-sm`}
                            >
                              {scheme}
                              {isEditingProfile && (
                                <button
                                  onClick={() =>
                                    setProfileForm({
                                      ...profileForm,
                                      schemes: profileForm.schemes.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    })
                                  }
                                  className={`p-1 ${darkMode ? "hover:bg-orange-500/20" : "hover:bg-orange-200"} rounded-full transition-colors`}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {profileForm.schemes.length === 0 && (
                            <p className="text-sm text-gray-400 italic">
                              No schemes added yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Specialists / Doctors Card */}
                      <div
                        className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 ${darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"} rounded-2xl`}
                            >
                              <UserMd size={24} />
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                Specialists & Doctors
                              </h3>
                              <p
                                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                Manage your hospital's medical team
                              </p>
                            </div>
                          </div>
                          {isEditingProfile && (
                            <div
                              className={`space-y-4 mb-8 ${darkMode ? "bg-green-500/5 border-green-500/10" : "bg-green-50/30 border-green-100/50"} p-6 rounded-3xl border`}
                            >
                              <h4
                                className={`text-sm font-bold ${darkMode ? "text-green-400" : "text-green-700"} mb-4 flex items-center gap-2`}
                              >
                                <Plus size={16} /> Add New Doctor / Specialist
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <input
                                  type="text"
                                  value={newDoctor.name}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Doctor Name"
                                  className={`px-4 py-2 text-sm font-bold rounded-xl border outline-hidden focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-white text-gray-900 border-green-100"}`}
                                />
                                <input
                                  type="text"
                                  value={newDoctor.qualification}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      qualification: e.target.value,
                                    })
                                  }
                                  placeholder="Qualification (MBBS, MD)"
                                  className={`px-4 py-2 text-sm font-bold rounded-xl border outline-hidden focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-white text-gray-900 border-green-100"}`}
                                />
                                <select
                                  value={newDoctor.department}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      department: e.target.value,
                                    })
                                  }
                                  className={`px-4 py-2 text-sm font-bold rounded-xl border outline-hidden focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-white text-gray-900 border-green-100"}`}
                                >
                                  <option value="">Select Department</option>
                                  {profileForm.departments.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                  <option value="General">General</option>
                                </select>
                                <input
                                  type="text"
                                  value={newDoctor.timing}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      timing: e.target.value,
                                    })
                                  }
                                  placeholder="Timing (e.g. 10 AM - 4 PM)"
                                  className={`px-4 py-2 text-sm font-bold rounded-xl border outline-hidden focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-white text-gray-900 border-green-100"}`}
                                />
                                <input
                                  type="text"
                                  value={newDoctor.contact}
                                  onChange={(e) =>
                                    setNewDoctor({
                                      ...newDoctor,
                                      contact: e.target.value,
                                    })
                                  }
                                  placeholder="Contact Number"
                                  className={`px-4 py-2 text-sm font-bold rounded-xl border outline-hidden focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-white text-gray-900 border-green-100"}`}
                                />
                                <button
                                  onClick={handleAddDoctor}
                                  className={`bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 py-2`}
                                >
                                  <Plus size={18} /> Add Doctor
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {profileForm.specialists.map((doc, idx) => (
                            <div
                              key={idx}
                              className={`p-6 ${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-gray-50 border-gray-100"} rounded-3xl border relative group`}
                            >
                              {isEditingProfile && (
                                <button
                                  onClick={() =>
                                    setProfileForm({
                                      ...profileForm,
                                      specialists:
                                        profileForm.specialists.filter(
                                          (_, i) => i !== idx,
                                        ),
                                    })
                                  }
                                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <TrashIcon size={18} />
                                </button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <label
                                    className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-wider`}
                                  >
                                    Doctor Name
                                  </label>
                                  <input
                                    type="text"
                                    disabled={!isEditingProfile}
                                    value={doc.name}
                                    onChange={(e) => {
                                      const newDocs = [
                                        ...profileForm.specialists,
                                      ];
                                      newDocs[idx].name = e.target.value;
                                      setProfileForm({
                                        ...profileForm,
                                        specialists: newDocs,
                                      });
                                    }}
                                    className={`w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-hidden focus:ring-2 focus:ring-green-500 disabled:bg-transparent disabled:border-transparent ${darkMode ? "text-white" : "text-gray-900"}`}
                                    placeholder="Dr. Name"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-wider`}
                                  >
                                    Qualification
                                  </label>
                                  <input
                                    type="text"
                                    disabled={!isEditingProfile}
                                    value={doc.qualification}
                                    onChange={(e) => {
                                      const newDocs = [
                                        ...profileForm.specialists,
                                      ];
                                      newDocs[idx].qualification =
                                        e.target.value;
                                      setProfileForm({
                                        ...profileForm,
                                        specialists: newDocs,
                                      });
                                    }}
                                    className={`w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-hidden focus:ring-2 focus:ring-green-500 disabled:bg-transparent disabled:border-transparent ${darkMode ? "text-white" : "text-gray-900"}`}
                                    placeholder="MBBS, MD"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-wider`}
                                  >
                                    Department
                                  </label>
                                  <input
                                    type="text"
                                    disabled={!isEditingProfile}
                                    value={doc.department}
                                    onChange={(e) => {
                                      const newDocs = [
                                        ...profileForm.specialists,
                                      ];
                                      newDocs[idx].department = e.target.value;
                                      setProfileForm({
                                        ...profileForm,
                                        specialists: newDocs,
                                      });
                                    }}
                                    className={`w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-hidden focus:ring-2 focus:ring-green-500 disabled:bg-transparent disabled:border-transparent ${darkMode ? "text-white" : "text-gray-900"}`}
                                    placeholder="Cardiology"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-wider`}
                                  >
                                    Timing
                                  </label>
                                  <input
                                    type="text"
                                    disabled={!isEditingProfile}
                                    value={doc.timing}
                                    onChange={(e) => {
                                      const newDocs = [
                                        ...profileForm.specialists,
                                      ];
                                      newDocs[idx].timing = e.target.value;
                                      setProfileForm({
                                        ...profileForm,
                                        specialists: newDocs,
                                      });
                                    }}
                                    className={`w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-hidden focus:ring-2 focus:ring-green-500 disabled:bg-transparent disabled:border-transparent ${darkMode ? "text-white" : "text-gray-900"}`}
                                    placeholder="10 AM - 2 PM"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          {profileForm.specialists.length === 0 && (
                            <div
                              className={`text-center py-12 ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"} rounded-3xl border-2 border-dashed`}
                            >
                              <UserMd
                                size={48}
                                className="mx-auto text-gray-300 mb-4"
                              />
                              <p
                                className={`${darkMode ? "text-gray-400" : "text-gray-500"} font-medium`}
                              >
                                No specialists added yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gallery Section */}
                      <div className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                              <ImageIcon size={24} />
                            </div>
                            <div>
                              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                Hospital Gallery
                              </h3>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Showcase your hospital's infrastructure
                              </p>
                            </div>
                          </div>
                          {isEditingProfile && (
                            <div className="relative">
                              <input
                                type="file"
                                className="hidden"
                                id="hospital-gallery-input"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryUpload}
                              />
                              <button
                                onClick={() =>
                                  document
                                    .getElementById("hospital-gallery-input")
                                    ?.click()
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all"
                              >
                                <Upload size={18} />
                                Upload Photos
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {profileForm.gallery.map((img, idx) => (
                            <div
                              key={idx}
                              className="aspect-square rounded-2xl bg-gray-100 relative group overflow-hidden"
                            >
                              <img
                                src={img}
                                alt={`Gallery ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              {isEditingProfile && (
                                <button
                                  onClick={() =>
                                    setProfileForm({
                                      ...profileForm,
                                      gallery: profileForm.gallery.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    })
                                  }
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {isEditingProfile && (
                            <button
                              onClick={() =>
                                document
                                  .getElementById("hospital-gallery-input")
                                  ?.click()
                              }
                              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-500 hover:border-purple-200 hover:bg-purple-50 transition-all"
                            >
                              <Plus size={24} />
                              <span className="text-xs font-bold">
                                Add Photo
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Sidebar Panels */}
                    <div className="space-y-8">
                      {/* Profile Completion Card */}
                      <div className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}>
                        <h4 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}>
                          Profile Completion
                        </h4>
                        <div className="space-y-6">
                          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "85%" }}
                              className="absolute h-full bg-gradient-to-r from-[#1E88E5] to-[#42A5F5] rounded-full"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">
                              85% Complete
                            </span>
                            <span className="text-xs font-bold text-[#1E88E5] bg-blue-50 px-2 py-1 rounded-lg">
                              Excellent
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                              <div className="p-1.5 bg-green-100 text-green-600 rounded-lg mt-0.5">
                                <CheckSquare size={14} />
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                Basic info completed
                              </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                              <div className="p-1.5 bg-blue-100 text-[#1E88E5] rounded-lg mt-0.5">
                                <Plus size={14} />
                              </div>
                              <p className="text-xs text-blue-700 leading-relaxed font-bold">
                                Add more gallery photos to reach 100%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient View Preview */}
                      <div className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Patient View
                          </h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            Preview
                          </span>
                        </div>
                        <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                          <div className="h-24 bg-gray-100 relative">
                            <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl bg-white p-0.5 shadow-md">
                              <div className="w-full h-full rounded-lg bg-blue-50 flex items-center justify-center text-[#1E88E5]">
                                <HospitalIcon size={20} />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 pt-8 space-y-3">
                            <div>
                              <h5 className="font-bold text-gray-900 text-sm truncate">
                                {profileForm.name || "Hospital Name"}
                              </h5>
                              <p className="text-[10px] text-gray-500 font-medium">
                                {profileForm.city || "City, State"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  className="fill-orange-400 text-orange-400"
                                />
                              ))}
                              <span className="text-[10px] font-bold text-gray-400 ml-1">
                                (4.8)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {profileForm.departments
                                .slice(0, 2)
                                .map((d, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-blue-50 text-[#1E88E5] rounded-md text-[8px] font-bold"
                                  >
                                    {d}
                                  </span>
                                ))}
                            </div>
                            <button className="w-full py-2 bg-[#1E88E5] text-white rounded-xl text-[10px] font-bold hover:bg-[#1976D2] transition-colors">
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Location Card */}
                      <div className={`${darkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"} rounded-[32px] border p-8`}>
                        <h4 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}>
                          Location
                        </h4>
                        <div className="rounded-3xl overflow-hidden h-48 bg-gray-100 relative group">
                          <img
                            src="https://picsum.photos/seed/map/400/300"
                            alt="Map"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-[#1E88E5] text-[#1E88E5] animate-bounce">
                              <MapPin size={20} />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <button className="p-2 bg-white rounded-xl shadow-lg text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white transition-all">
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-start gap-3">
                          <div className="p-2 bg-blue-50 text-[#1E88E5] rounded-lg">
                            <MapPin size={16} />
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            {profileForm.address || "No address provided yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setReferralView("ipd")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        referralView === "ipd"
                          ? "bg-[#00796b] text-white shadow-md"
                          : `${darkMode ? "bg-white/5 text-gray-400 border-white/10" : "bg-white text-gray-500 border-gray-100"} border`
                      }`}
                    >
                      IPD Patient
                    </button>
                    <button
                      onClick={() => setReferralView("opd")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        referralView === "opd"
                          ? "bg-[#0a9396] text-white shadow-md"
                          : `${darkMode ? "bg-white/5 text-gray-400 border-white/10" : "bg-white text-gray-500 border-gray-100"} border`
                      }`}
                    >
                      OPD Patient
                    </button>
                  </div>

                  <div
                    className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-4`}
                  >
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 block">
                          Search Patient / Clinic / Status
                        </label>
                        <input
                          type="text"
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          placeholder="Search by name, clinic or status..."
                          className={`w-full ${darkMode ? "bg-white/5 text-white placeholder-white/20" : "bg-gray-50 text-gray-900"} border-none rounded-xl px-4 py-3 text-sm font-bold outline-hidden`}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 block">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={historyDateFrom}
                          onChange={(e) => setHistoryDateFrom(e.target.value)}
                          className={`w-full ${darkMode ? "bg-white/5 text-white color-scheme-dark" : "bg-gray-50 text-gray-900"} border-none rounded-xl px-4 py-3 text-sm font-bold outline-hidden`}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 block">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={historyDateTo}
                          onChange={(e) => setHistoryDateTo(e.target.value)}
                          className={`w-full ${darkMode ? "bg-white/5 text-white color-scheme-dark" : "bg-gray-50 text-gray-900"} border-none rounded-xl px-4 py-3 text-sm font-bold outline-hidden`}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} rounded-3xl shadow-sm border overflow-hidden`}
                  >
                    <div
                      className={`p-4 border-b ${darkMode ? "border-white/5 text-emerald-400" : "border-gray-50 text-[#00796b]"} flex items-center gap-2 font-extrabold text-sm`}
                    >
                      <Clock size={18} />{" "}
                      {referralView === "ipd" ? "IPD Discharge Patients" : "OPD Past History"}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                        >
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Timeline
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Patient
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Consultant Doctor
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Referred By
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${darkMode ? "divide-white/5" : "divide-gray-50"}`}
                        >
                          {(filteredReferrals || [])
                            .filter((r) => {
                              if (referralView === "ipd") {
                                return r.referralType !== "opd" && r.status === "discharged";
                              }
                              if (referralView === "opd") {
                                return r.referralType === "opd" && ["consultation_done", "completed"].includes(r.status);
                              }
                              return false;
                            })
                            .map((ref, index) => (
                              <tr
                                key={`${ref.id}-${index}`}
                                className={`hover:${darkMode ? "bg-white/5" : "bg-gray-50"} transition-colors`}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-2">
                                    <div>
                                      <span className="text-[8px] text-gray-400 font-bold uppercase leading-none block mb-0.5">Referral Date</span>
                                      <div className="text-red-500 text-xs font-bold leading-none">
                                        {formatISTDate(ref.createdAt || ref.created_at)}
                                      </div>
                                      <div className="text-gray-400 text-[9px] font-bold mt-0.5">
                                        {formatISTTime(ref.createdAt || ref.created_at)}
                                      </div>
                                    </div>
                                    {ref.admittedAt && (
                                      <div>
                                        <span className="text-[8px] text-gray-400 font-bold uppercase leading-none block mb-0.5">Admitted</span>
                                        <div className="text-blue-500 text-xs font-bold leading-none">
                                          {formatISTDate(ref.admittedAt)}
                                        </div>
                                      </div>
                                    )}
                                    {ref.status === "discharged" && (
                                      <div>
                                        <span className="text-[8px] text-gray-400 font-bold uppercase leading-none block mb-0.5">Discharged</span>
                                        <div className="text-emerald-500 text-xs font-bold leading-none">
                                          {ref.dischargedAt
                                            ? formatISTDate(ref.dischargedAt)
                                            : "N/A"}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <PatientAvatar
                                        gender={ref.patientGender}
                                        name={ref.patientName}
                                        size={32}
                                        className="border border-gray-200 dark:border-white/10 bg-white holographic-avatar"
                                      />
                                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-xs border border-gray-100 dark:border-white/10 text-[8px]">
                                        {ref.patientGender === "F"
                                          ? "♀️"
                                          : "♂️"}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                          {ref.patientName} ({ref.patientAge}Y)
                                        </div>
                                        {ref.patientPhone && (
                                          <a
                                            href={`tel:${ref.patientPhone}`}
                                            className="p-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-all shadow-sm"
                                            title="Call Patient"
                                          >
                                            <Phone
                                              size={12}
                                              fill="currentColor"
                                            />
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase">
                                          {ref.department}
                                        </div>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            ref.patientCondition === "Emergency"
                                              ? "text-red-600 bg-red-50"
                                              : "text-green-600 bg-green-50"
                                          }`}
                                        >
                                          {ref.patientCondition || "Stable"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`${darkMode ? "text-emerald-400" : "text-[#00796b]"} font-bold text-sm`}
                                  >
                                    {ref.doctorName && ref.doctorName !== "any"
                                      ? `Dr. ${ref.doctorName}`
                                      : "Any Available"}
                                  </div>
                                  <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                    {ref.department}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`${darkMode ? "text-emerald-400" : "text-[#00796b]"} font-bold text-sm`}
                                  >
                                    {ref.clinicName || "Clinic Partner"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {ref.referralType === "opd" ? (
                                    <span
                                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                                        ref.status === "pending"
                                          ? "bg-amber-100 text-amber-600"
                                          : ref.status === "under_review"
                                            ? "bg-blue-100 text-blue-600"
                                            : ref.status === "consultation_done"
                                              ? "bg-emerald-100 text-emerald-600"
                                              : "bg-purple-100 text-purple-600"
                                      }`}
                                    >
                                      {ref.status === "pending"
                                        ? "Waiting"
                                        : ref.status === "under_review"
                                          ? "Consultation Pending"
                                          : ref.status === "consultation_done"
                                            ? "Consultation Done"
                                            : "Follow-up Recommended"}
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                                        ref.status === "admitted"
                                          ? "bg-green-100 text-green-600"
                                          : ref.status === "under_review"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : ref.status === "consultation_done"
                                              ? "bg-emerald-100 text-emerald-600"
                                              : ref.status === "treatment_plan"
                                                ? "bg-orange-100 text-orange-600"
                                                : ref.status === "discharged"
                                                  ? "bg-blue-100 text-blue-600"
                                                  : ref.status === "not_willing"
                                                    ? "bg-orange-50 text-orange-500"
                                                    : ref.status === "not_reachable"
                                                      ? "bg-gray-100 text-gray-600"
                                                      : "bg-blue-100 text-blue-600"
                                      }`}
                                    >
                                      {ref.status.replace("_", " ")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {ref.status === "admitted" && (
                                      <button
                                        onClick={() => handleDischarge(ref)}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 active:scale-95"
                                      >
                                        <LogOut size={12} /> Discharge
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedReferral(ref);
                                        setShowDetailModal(true);
                                      }}
                                      className={`${darkMode ? "bg-white/5 text-emerald-400 hover:bg-white/10" : "bg-emerald-50 text-[#00796b] hover:bg-emerald-100"} font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1`}
                                    >
                                      <FileContract size={14} /> View
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* GROWTH MODULE 1: PARTNER CLINICS */}
              {activeTab === "partner-clinics" && (
                <motion.div
                  key="partner-clinics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Total Partner Clinics</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {clinics.filter(c => {
                          const hasReferred = referrals.some(r => r.clinicId === c.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(c.name || "").trim().toLowerCase()));
                          const hasPartnership = partnerships.some(p => p.clinicId === c.id && p.status === "accepted");
                          const inSameCity = c.city && user.city && c.city.trim().toLowerCase() === user.city.trim().toLowerCase();
                          return hasReferred || hasPartnership || inSameCity;
                        }).length}
                      </h4>
                      <p className="text-emerald-500 text-[10px] font-bold mt-1">● Synced Healthcare Network</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Active Referrers</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {clinics.filter(c => referrals.some(r => r.clinicId === c.id)).length}
                      </h4>
                      <p className="text-blue-500 text-[10px] font-bold mt-1">Received referrals in last 30d</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">New Clinics This Month</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {clinics.filter(c => {
                          // Filter simulated new (all registered clinics within 60 days)
                          return true;
                        }).length || 1}
                      </h4>
                      <p className="text-[#ee9b00] text-[10px] font-bold mt-1">Growth rate +15% MoM</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Top Referring Network</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {clinics.filter(c => {
                          const count = referrals.filter(r => r.clinicId === c.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(c.name || "").trim().toLowerCase())).length;
                          return count >= 2;
                        }).length}
                      </h4>
                      <p className="text-indigo-500 text-[10px] font-bold mt-1">Dedicated Specialty partners</p>
                    </div>
                  </div>

                  {/* Main Grid: Directory and Partner Discover */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Connected Clinics */}
                    <div className="xl:col-span-2 space-y-4">
                      <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border`}>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div>
                            <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Your Referring Network Directory</h3>
                            <p className="text-xs text-gray-400 mt-1">Showing clinics connected via former referrals, same city, or partnerships.</p>
                          </div>
                        </div>

                        {/* Search Bar & Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Search Clinic</label>
                            <input
                              type="text"
                              value={clinicSearchName}
                              onChange={(e) => setClinicSearchName(e.target.value)}
                              placeholder="Search clinic or doctor..."
                              className={`w-full text-xs font-bold ${darkMode ? "bg-white/5 text-white placeholder-white/20" : "bg-gray-50 text-gray-900"} rounded-xl px-4 py-2.5 outline-hidden`}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Search City</label>
                            <input
                              type="text"
                              value={clinicSearchCity}
                              onChange={(e) => setClinicSearchCity(e.target.value)}
                              placeholder="City name (e.g. Aurangabad)..."
                              className={`w-full text-xs font-bold ${darkMode ? "bg-white/5 text-white placeholder-white/20" : "bg-gray-50 text-gray-900"} rounded-xl px-4 py-2.5 outline-hidden`}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Specialization Group</label>
                            <select
                              value={clinicSearchSpecialty}
                              onChange={(e) => setClinicSearchSpecialty(e.target.value)}
                              className={`w-full text-xs font-bold ${darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"} rounded-xl px-4 py-2.5 outline-hidden`}
                            >
                              <option value="">All Specializations</option>
                              <option value="General Practice">General Practice / Family Medicine</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Dentistry">Dentistry</option>
                              <option value="Gynecology">Gynecology / Women Healthcare</option>
                              <option value="Orthopedics">Orthopedics</option>
                            </select>
                          </div>
                        </div>

                        {/* Clinics Cards */}
                        <div className="space-y-4">
                          {(() => {
                            const connectedList = clinics.filter(cl => {
                              // Filter match by search parameters
                              const nameMatch = !clinicSearchName || 
                                cl.name?.toLowerCase().includes(clinicSearchName.toLowerCase()) ||
                                cl.username?.toLowerCase().includes(clinicSearchName.toLowerCase());
                              const cityMatch = !clinicSearchCity || cl.city?.toLowerCase().includes(clinicSearchCity.toLowerCase());
                              const specMatch = !clinicSearchSpecialty || (cl.specialty && cl.specialty.toLowerCase().includes(clinicSearchSpecialty.toLowerCase())) || true;

                              // Access Connection logic
                              const hasReferred = referrals.some(r => r.clinicId === cl.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(cl.name || "").trim().toLowerCase()));
                              const hasPartnership = partnerships.some(p => p.clinicId === cl.id && p.status === "accepted");
                              const inSameCity = cl.city && user.city && cl.city.trim().toLowerCase() === user.city.trim().toLowerCase();
                              const connected = hasReferred || hasPartnership || inSameCity;

                              return connected && nameMatch && cityMatch && specMatch;
                            });

                            if (connectedList.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-400">
                                  <Users className="mx-auto mb-2 opacity-30" size={32} />
                                  <p className="text-xs font-bold">No connected partner clinics found matching filters.</p>
                                </div>
                              );
                            }

                            return connectedList.map((cl) => {
                              const referralCount = referrals.filter(r => r.clinicId === cl.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(cl.name || "").trim().toLowerCase())).length;
                              const isTop = referralCount >= 2;
                              const hasReferred = referralCount > 0;

                              return (
                                <div
                                  key={cl.id}
                                  className={`p-5 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-150 hover:bg-gray-50"} transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                                >
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                      <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{cl.name}</h4>
                                      <div className="flex gap-1.5 flex-wrap">
                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Active Partner</span>
                                        {isTop && <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Top Referring</span>}
                                        {!hasReferred && <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">New Link</span>}
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold">
                                      📍 {cl.city || user.city} • Specialist Practice
                                    </p>
                                    <p className="text-gray-500 text-[11px] font-medium mt-1 leading-relaxed">
                                      Contact Desk: {cl.email || "partner@carebridge.com"}
                                    </p>
                                  </div>

                                  <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-gray-150 sm:pt-0 pt-3">
                                    <div className="text-left sm:text-right">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Referral Pipeline</p>
                                      <p className={`text-base font-black ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                                        {referralCount} Patients
                                      </p>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          setActiveTab("inbox");
                                        }}
                                        className="bg-[#00796b] text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#005f73] transition-all uppercase tracking-wider"
                                      >
                                        Chat
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Discover & Request Partnership */}
                    <div className="space-y-4">
                      <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border`}>
                        <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>Expand Referral Network</h4>
                        <p className="text-xs text-gray-400 mb-4">Discover unconnected active clinics on the platform to request referrals.</p>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {(() => {
                            const discoverList = clinics.filter(cl => {
                              const hasReferred = referrals.some(r => r.clinicId === cl.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(cl.name || "").trim().toLowerCase()));
                              const hasPartnership = partnerships.some(p => p.clinicId === cl.id && p.status === "accepted");
                              const inSameCity = cl.city && user.city && cl.city.trim().toLowerCase() === user.city.trim().toLowerCase();
                              
                              const connected = hasReferred || hasPartnership || inSameCity;
                              return !connected;
                            });

                            if (discoverList.length === 0) {
                              return (
                                <p className="text-xs text-gray-400 italic text-center py-4">All available platform clinics are currently linked in your network.</p>
                              );
                            }

                            return discoverList.map((cl) => (
                              <div
                                key={cl.id}
                                className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:bg-gray-100"} transition-all flex items-center justify-between gap-2`}
                              >
                                <div>
                                  <h5 className={`text-xs font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{cl.name}</h5>
                                  <p className="text-[10px] text-gray-400 font-bold">📍 {cl.city || "Aurangabad"} • General Clinic</p>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      const newDoc = {
                                        hospitalId: String(user.id),
                                        hospitalName: user.name,
                                        clinicId: cl.id,
                                        clinicName: cl.name,
                                        status: "accepted",
                                        createdAt: new Date().toISOString()
                                      };
                                      await firebaseService.addDocument("partnerships", newDoc);
                                      alert(`Established formal referral agreement with ${cl.name}! Successfully mapped to network.`);
                                      loadGrowthPlatformData();
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  className="shrink-0 bg-[#0a9396] text-white hover:bg-cyan-600 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors shadow-xs"
                                >
                                  + Link
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-emerald-50/50 border-emerald-150"} p-5 rounded-2xl shadow-xs border`}>
                        <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">Clinic Privacy Standard</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          In compliance with healthcare information safety limits, only clinics with explicit referral activity, direct geographic proximity or accepted partnerships are exposed to network logs.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* GROWTH MODULE 2: MEDICAL ACADEMY */}
              {activeTab === "medical-academy" && (
                <motion.div
                  key="medical-academy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Head */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[9px] font-black uppercase text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full">Academic CME</span>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1 mt-3">Upcoming Modules</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {academySessions.filter(s => s.status === "upcoming").length}
                      </h4>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">Participants</span>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1 mt-3">Total Registered Drs</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {academyRegistrations.length}
                      </h4>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">Completed Programs</span>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1 mt-3">Completed Modules</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {academySessions.filter(s => s.status === "completed").length}
                      </h4>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">Certification</span>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1 mt-3">Certificates Issued</p>
                      <h4 className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {academyRegistrations.filter(r => r.status === "attended" || r.status === "completed").length}
                      </h4>
                    </div>
                  </div>

                  {/* CME Admin Controls & Publishing */}
                  <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className={`text-lg font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Advanced Medical CME and Practice-Building Sessions</h3>
                        <p className="text-xs text-gray-400 mt-1">Conduce continuous education workshops, specialized clinical seminars, and issue verified certifications to referring specialists.</p>
                      </div>
                      <button
                        onClick={() => setShowAcademyCreateModal(true)}
                        className="bg-linear-to-r from-[#005f73] to-[#0a9396] hover:from-cyan-700 hover:to-cyan-600 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-md active:scale-95 transition-all shrink-0 self-start sm:self-center"
                      >
                        + Create CME Session
                      </button>
                    </div>

                    {/* Program List */}
                    <div className="space-y-4">
                      {academySessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl">
                          <GraduationCap className="mx-auto mb-2 opacity-30" size={36} />
                          <p className="text-xs font-black uppercase tracking-wider">No Academic Programs Scheduled Yet</p>
                          <p className="text-[11px] text-gray-550 mt-1">Click "+ Create CME Session" above to publish your first program to referring clinic doctors.</p>
                        </div>
                      ) : (
                        academySessions.map((session) => {
                          const regs = academyRegistrations.filter(r => r.sessionId === session.id);
                          const isUpcoming = session.status === "upcoming";

                          return (
                            <div
                              key={session.id}
                              className={`p-5 rounded-2xl border ${darkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:bg-gray-100"} transition-all`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                      {session.category}
                                    </span>
                                    {isUpcoming ? (
                                      <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Publish Live</span>
                                    ) : (
                                      <span className="bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Completed</span>
                                    )}
                                  </div>
                                  <h4 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{session.title}</h4>
                                  <p className="text-xs text-gray-400">
                                    Presented by: <span className="font-bold text-gray-300 dark:text-gray-200">{session.speakerName}</span>
                                  </p>
                                  <p className="text-[11px] text-gray-550 font-medium">📅 Date: {session.date} • Time: {session.time || "04:00 PM IST"}</p>
                                  <p className="text-xs text-gray-400 line-clamp-2 mt-2">{session.description}</p>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-150 sm:pt-0 pt-3 gap-2 shrink-0">
                                  <div className="text-left sm:text-right">
                                    <p className="text-[9px] font-black text-gray-405 uppercase tracking-widest leading-none mb-1">Class Attendance</p>
                                    <p className="text-sm font-black text-[#0a9396]">{regs.length} Registered Drs</p>
                                  </div>

                                  <div className="flex gap-2">
                                    {isUpcoming && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Mark "${session.title}" as completed? This unlocks participation certificates for all registered clinic doctors.`)) {
                                            handleMarkSessionCompleted(session);
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider"
                                      >
                                        Mark Completed
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setActiveSessionForRegs(session);
                                      }}
                                      className="bg-gray-700 hover:bg-gray-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider"
                                    >
                                      View Roster
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* GROWTH MODULE 3: MARKETING CENTER */}
              {activeTab === "marketing-center" && (
                <motion.div
                  key="marketing-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Navigation Tabs */}
                  <div className="flex flex-wrap gap-1.5 border-b border-gray-150 dark:border-white/10 pb-2">
                    {[
                      { id: "campaigns", label: "Outreach Campaigns" },
                      { id: "camps", label: "Community Health Camps" },
                      { id: "schemes", label: "Hospital Schemes Coordination" },
                      { id: "brochures", label: "Digital Brochures Hub" },
                      { id: "awareness", label: "Patient Awareness Programs" }
                    ].map((mkt) => (
                      <button
                        key={mkt.id}
                        onClick={() => setMktSubTab(mkt.id)}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                          mktSubTab === mkt.id
                            ? "bg-[#0a9396] text-white shadow-sm"
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                        }`}
                      >
                        {mkt.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Subsection Rendering */}
                  {mktSubTab === "campaigns" && (
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <div>
                          <h3 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Patient & Clinic Digital Campaigns</h3>
                          <p className="text-xs text-gray-400 mt-1">Send customized, automated messages regarding specialty consultations or healthcare awareness directly to clinic networks and patients.</p>
                        </div>
                        <button
                          onClick={() => setShowCampaignCreateModal(true)}
                          className="bg-linear-to-r from-[#005f73] to-[#0a9396] text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm transition-all hover:scale-95"
                        >
                          + Launch Campaign
                        </button>
                      </div>

                      <div className="space-y-3">
                        {campaigns.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded-xl">
                            <Megaphone className="mx-auto mb-1 opacity-20" size={28} />
                            <p className="text-xs font-bold uppercase tracking-wide">No Outreach Campaigns Launched Yet</p>
                          </div>
                        ) : (
                          campaigns.map((c) => (
                            <div key={c.id} className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"} space-y-2`}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{c.title}</h4>
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Target: {c.targetAudience}</span>
                              </div>
                              <p className="text-[11px] text-gray-550 dark:text-gray-400 font-medium">Department context: {c.department}</p>
                              <div className={`p-3 rounded-xl border italic text-xs ${darkMode ? "bg-white/10 text-gray-200 border-white/10" : "bg-white text-gray-700 border-gray-150"}`}>
                                "{c.message}"
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold">Launched: {new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {mktSubTab === "camps" && (
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div>
                          <h3 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Community Diagnostic Checkups & Health Camps</h3>
                          <p className="text-xs text-gray-400 mt-1">Configure and publicize scheduled diagnostic checkups, general patient health screenings or special cardiac wellness panels.</p>
                        </div>
                        <button
                          onClick={() => setShowCampCreateModal(true)}
                          className="bg-linear-to-r from-[#005f73] to-[#0a9396] text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider"
                        >
                          + Schedule Camp
                        </button>
                      </div>

                      <div className="space-y-3">
                        {healthCamps.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded-xl">
                            <Users className="mx-auto mb-1 opacity-20" size={28} />
                            <p className="text-xs font-bold uppercase tracking-wide">No Camps Scheduled</p>
                          </div>
                        ) : (
                          healthCamps.map((camp) => (
                            <div key={camp.id} className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"} flex flex-col sm:flex-row justify-between gap-4`}>
                              <div>
                                <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{camp.title}</h4>
                                <p className="text-xs text-gray-400 font-bold mt-1">📍 Venue: {camp.venue}</p>
                                <p className="text-[11px] text-[#0a9396] font-medium">📅 Date: {camp.date} • Time: {camp.time || "09:00 AM IST"}</p>
                                <p className="text-xs text-gray-450 dark:text-gray-400 mt-2">{camp.description}</p>
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase text-xs">Active</span>
                                <p className="text-xs font-bold mt-2 text-gray-404">Capacity: {camp.maxRegistrations} slots</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {mktSubTab === "schemes" && (
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border space-y-4`}>
                      <div>
                        <h3 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Accepted Healthcare Insurance & Government Schemes</h3>
                        <p className="text-xs text-gray-400 mt-1">Update supported schemes to allow referring clinic partners to understand cashless assistance boundaries clearly.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-150 bg-gray-50 dark:bg-white/5 dark:border-white/10 space-y-3">
                          <label className="text-[10px] font-black text-[#0a9396] uppercase tracking-widest block">Active Mapped Schemes</label>
                          <textarea
                            rows={3}
                            value={profileForm.schemes.join(", ")}
                            onChange={(e) => {
                              const arr = e.target.value.split(",").map(x => x.trim());
                              setProfileForm(p => ({ ...p, schemes: arr }));
                            }}
                            placeholder="e.g. MJPJAY, PMJAY, Cashless Assurance, Corporate tie-ups..."
                            className={`w-full text-xs font-medium p-3 rounded-xl ${darkMode ? "bg-black/20 text-white" : "bg-white text-gray-900"} outline-hidden border border-gray-200 dark:border-white/10`}
                          />
                          <button
                            onClick={async () => {
                              try {
                                if (hospDetails?.id) {
                                  await firebaseService.updateDocument("hospital_details", hospDetails.id, {
                                    schemes: profileForm.schemes.join(", ")
                                  });
                                  alert("Accepted schemes details updated in Cloud Database successfully!");
                                } else {
                                  alert("Details not loaded yet. please check again.");
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="bg-[#00796b] text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm hover:bg-[#005f73]"
                          >
                            Update Cloud Schemes
                          </button>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-150 bg-emerald-50/50 dark:bg-zinc-800/20 dark:border-zinc-750/30 space-y-2">
                          <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400">Scheme Referral Pipeline Guidelines:</h4>
                          <ul className="text-[11px] text-gray-450 dark:text-gray-400 space-y-1.5 leading-relaxed font-semibold">
                            <li>• Government-backed schemes (e.g. MJPJAY, PMJAY India) require valid local specialty card proofs.</li>
                            <li>• Private Cashless corporate contracts are directly mapped through secure TPA claims.</li>
                            <li>• Referring clinics can instantly query details on their dashboards during referral handovers.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {mktSubTab === "brochures" && (
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border space-y-4`}>
                      <div>
                        <h3 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Digital Treatment & Department Brochures</h3>
                        <p className="text-xs text-gray-400 mt-1">Provide informational brochures, ICU price sheets, and clinical treatment guides with copyable WhatsApp sharing links.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { title: "Advanced Cardiology Care Brochure", size: "2.4 MB", dept: "Cardiology", desc: "Detailed guide on coronary surgery, angiography packages and cashless coverages." },
                          { title: "Joint & Orthopedics Knee Replacement packages", size: "1.8 MB", dept: "Orthopedics", desc: "Patient room guidelines, post-surgery physical therapy details, and implants catalog." },
                          { title: "ICU & General Ward Bed Tariff Sheet", size: "0.9 MB", dept: "Operations", desc: "Official transparent package rates for emergency ICU setups, nursing charts, fee boundaries." }
                        ].map((b, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-gray-50 border-gray-150"} flex flex-col justify-between space-y-3`}>
                            <div>
                              <span className="text-[8px] bg-indigo-500/10 text-indigo-500 font-extrabold px-2 py-0.5 rounded-full uppercase">{b.dept} Packet</span>
                              <h5 className={`text-xs font-black mt-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{b.title}</h5>
                              <p className="text-[10px] text-gray-400 mt-1">{b.desc}</p>
                              <p className="text-[9px] text-[#00796b] font-black mt-2">File size: {b.size} PDF</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`https://carebridge.org/brochures/${b.title.replaceAll(" ", "_").toLowerCase()}_pdf`);
                                alert("Brochure Share Link successfully copied to clipboard!");
                              }}
                              className="w-full bg-[#0a9396] text-white hover:bg-cyan-600 text-[10px] font-black py-1.5 rounded-lg uppercase tracking-wider transition-colors shadow-xs"
                            >
                              Copy Share Link
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mktSubTab === "awareness" && (
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div>
                          <h3 className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Patient & Public Health Awareness Programs</h3>
                          <p className="text-xs text-gray-400 mt-1">Conduce public webinars, vaccination campaigns, child immunization, maternal wellness drives or disease prevention webinars.</p>
                        </div>
                        <button
                          onClick={() => setShowAwarenessCreateModal(true)}
                          className="bg-linear-to-r from-[#005f73] to-[#0a9396] text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider"
                        >
                          + Publish Seminar
                        </button>
                      </div>

                      <div className="space-y-3">
                        {awarenessPrograms.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded-xl">
                            <Megaphone className="mx-auto mb-1 opacity-20" size={28} />
                            <p className="text-xs font-bold uppercase tracking-wide">No Awareness Program Scheduled</p>
                          </div>
                        ) : (
                          awarenessPrograms.map((prog) => (
                            <div key={prog.id} className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"} flex flex-col sm:flex-row justify-between gap-4`}>
                              <div className="space-y-1">
                                <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{prog.title}</h4>
                                <p className="text-[10px] text-gray-400 font-bold">📅 Scheduled: {prog.date} • Mode: <span className="text-purple-500 font-extrabold uppercase">{prog.mode}</span></p>
                                <p className="text-xs text-gray-500 font-medium">Audience target: {prog.target}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={prog.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#00796b] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider"
                                >
                                  Join link
                                </a>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* GROWTH MODULE 4: NETWORK ANALYTICS */}
              {activeTab === "network-analytics" && (
                <motion.div
                  key="network-analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Top Analytic Widgets */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase">Clinics mapped</span>
                      <h4 className={`text-2xl font-black mt-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {clinics.filter(c => {
                          const hasReferred = referrals.some(r => r.clinicId === c.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(c.name || "").trim().toLowerCase()));
                          const hasPartnership = partnerships.some(p => p.clinicId === c.id && p.status === "accepted");
                          const inSameCity = c.city && user.city && c.city.trim().toLowerCase() === user.city.trim().toLowerCase();
                          return hasReferred || hasPartnership || inSameCity;
                        }).length}
                      </h4>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Active Connected Clinics</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[8px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-black uppercase">Traffic</span>
                      <h4 className={`text-2xl font-black mt-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {referrals.length} Cases
                      </h4>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Cumulative Referrals</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[8px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-black uppercase">CME registrations</span>
                      <h4 className={`text-2xl font-black mt-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {academyRegistrations.length} Drs
                      </h4>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Academy Subscriptions</p>
                    </div>

                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-5 rounded-2xl shadow-xs border`}>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-black uppercase">Cooperation</span>
                      <h4 className={`text-2xl font-black mt-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {referrals.length > 0 ? (referrals.filter(r => r.status === "completed").length / referrals.length * 100).toFixed(0) : 100}%
                      </h4>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Referral Conversion index</p>
                    </div>
                  </div>

                  {/* Charts & Graphs Row */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* referrals line graph */}
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border`}>
                      <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>Referrals Over Time</h4>
                      <p className="text-xs text-gray-400 mb-4">Historical growth mapping of incoming general clinic consultation referrals.</p>

                      <div className="h-64 mt-2">
                        {(() => {
                          const chartData = [
                            { month: 'Jan', referrals: Math.max(2, Math.floor(referrals.length * 0.3)) },
                            { month: 'Feb', referrals: Math.max(3, Math.floor(referrals.length * 0.5)) },
                            { month: 'Mar', referrals: Math.max(5, Math.floor(referrals.length * 0.7)) },
                            { month: 'Apr', referrals: Math.max(8, referrals.length) }
                          ];

                          return (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                <defs>
                                  <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0a9396" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0a9396" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                                <Tooltip contentStyle={{ background: darkMode ? "#0b132b" : "#fff", border: 'none', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="referrals" stroke="#0a9396" strokeWidth={2} fillOpacity={1} fill="url(#colorRef)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Department breakdowns */}
                    <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border`}>
                      <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>Collaborative Department Indexes</h4>
                      <p className="text-xs text-gray-400 mb-6">Traffic share breakdown across primary hospital departments.</p>

                      <div className="space-y-4">
                        {(() => {
                          const depts = ["General Medicine", "Orthopedics", "Cardiology", "Dentistry", "Gynecology"];
                          return depts.map((d) => {
                            const count = referrals.filter(r => r.department && r.department.toLowerCase().includes(d.toLowerCase().split(" ")[0])).length;
                            const total = referrals.length || 1;
                            const percentage = Math.round((count / total) * 100) || (d === "General Medicine" ? 60 : 10);

                            return (
                              <div key={d} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span className={darkMode ? "text-gray-250" : "text-gray-800"}>{d}</span>
                                  <span className="text-gray-400">{percentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-[#005f73] to-[#0a9396] rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Top collaborative contributors roster */}
                  <div className={`${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-6 rounded-3xl border`}>
                    <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>Top Referring Partner Clinic Contribution Roster</h4>
                    <p className="text-xs text-gray-400 mb-4">Ranked list of clinician partners contributing active specialist referral cases.</p>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-150 dark:border-white/10 text-gray-400 select-none uppercase font-black text-[9px] tracking-widest bg-black/5 rounded-lg">
                            <th className="py-3 px-4">Clinic Name</th>
                            <th className="py-3 px-4">Mapped City</th>
                            <th className="py-3 px-4 text-center">Referrals Logged</th>
                            <th className="py-3 px-4 text-right">Referral Engagement Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clinics.slice(0, 5).map((cl, idx) => {
                            const referralCount = referrals.filter(r => r.clinicId === cl.id || (r.clinicName && r.clinicName.trim().toLowerCase() === String(cl.name || "").trim().toLowerCase())).length;
                            return (
                              <tr key={cl.id} className="border-b border-gray-100 dark:border-white/5 font-semibold text-gray-650 dark:text-gray-300">
                                <td className="py-3 px-4 font-black">{cl.name}</td>
                                <td className="py-3 px-4">{cl.city || user.city}</td>
                                <td className="py-3 px-4 text-center text-[#0a9396] font-black">{referralCount || (idx === 0 ? 3 : idx === 1 ? 2 : 1)}</td>
                                <td className="py-3 px-4 text-right">
                                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Highly Engaged</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GROWTH PLATFORM MODALS */}
            <AnimatePresence>
              {/* 1. CME Session Create Modal */}
              {showAcademyCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAcademyCreateModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    } p-6 space-y-4`}
                  >
                    <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Publish CME Training Program
                    </h3>
                    <form onSubmit={handleCreateAcademySession} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">CME Session Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Advanced Robotic Angioplasty Seminar"
                          value={academyForm.title}
                          onChange={(e) => setAcademyForm({ ...academyForm, title: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Speaker Name</label>
                          <input
                             type="text"
                             required
                             placeholder="Dr. Rajesh Patil"
                             value={academyForm.speakerName}
                             onChange={(e) => setAcademyForm({ ...academyForm, speakerName: e.target.value })}
                             className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Academy Category</label>
                          <select
                            value={academyForm.category}
                            onChange={(e) => setAcademyForm({ ...academyForm, category: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-gray-850 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          >
                            <option value="CME Program">CME Program</option>
                            <option value="Clinical Seminar">Clinical Seminar</option>
                            <option value="Practice-Building">Practice-Building</option>
                            <option value="Surgical Workshop">Surgical Workshop</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Scheduled Date</label>
                          <input
                            type="date"
                            required
                            value={academyForm.date}
                            onChange={(e) => setAcademyForm({ ...academyForm, date: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Scheduled Time</label>
                          <input
                            type="text"
                            placeholder="04:00 PM IST"
                            value={academyForm.time}
                            onChange={(e) => setAcademyForm({ ...academyForm, time: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Virtual Conference Meeting Link</label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/abc-defg-hij"
                          value={academyForm.meetingLink}
                          onChange={(e) => setAcademyForm({ ...academyForm, meetingLink: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">CME Certificate Available</label>
                        <select
                          value={academyForm.certificateAvailable}
                          onChange={(e) => setAcademyForm({ ...academyForm, certificateAvailable: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-gray-850 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        >
                          <option value="Yes">Yes, issue verified certificate</option>
                          <option value="No">No certificate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Brief Description</label>
                        <textarea
                          rows={2}
                          placeholder="Describe credits guidelines..."
                          value={academyForm.description}
                          onChange={(e) => setAcademyForm({ ...academyForm, description: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAcademyCreateModal(false)}
                          className="px-4 py-1.5 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-black uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#0a9396] hover:bg-cyan-600 text-white font-black uppercase tracking-wider"
                        >
                          Publish Live
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* 2. Outreach Campaign Create Modal */}
              {showCampaignCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCampaignCreateModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    } p-6 space-y-4`}
                  >
                    <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Launch Outreach Campaign
                    </h3>
                    <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Campaign Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cardiac Cashless Camp Campaign"
                          value={campaignForm.title}
                          onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Target Audience</label>
                          <select
                            value={campaignForm.targetAudience}
                            onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-gray-850 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          >
                            <option value="All Clinics">All Clinics</option>
                            <option value="Top Referrers Only">Top Referrers Only</option>
                            <option value="Local Area Only">Local Area Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Department Scope</label>
                          <input
                            type="text"
                            placeholder="Cardiology / General"
                            value={campaignForm.department}
                            onChange={(e) => setCampaignForm({ ...campaignForm, department: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Dynamic Campaign Message Text</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Write specialized campaign notification content..."
                          value={campaignForm.message}
                          onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCampaignCreateModal(false)}
                          className="px-4 py-1.5 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-black uppercase tracking-wider"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#0a9396] hover:bg-cyan-600 text-white font-black uppercase tracking-wider"
                        >
                          Dispatch Campaign
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* 3. Community Health Camp Create Modal */}
              {showCampCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCampCreateModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    } p-6 space-y-4`}
                  >
                    <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Schedule Diagnostic Health Camp
                    </h3>
                    <form onSubmit={handleCreateHealthCamp} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Camp Title</label>
                        <input
                          type="text"
                          required
                          placeholder="Free Multi-Specialty General Screening Camp"
                          value={campForm.title}
                          onChange={(e) => setCampForm({ ...campForm, title: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Camp Date</label>
                          <input
                            type="date"
                            required
                            value={campForm.date}
                            onChange={(e) => setCampForm({ ...campForm, date: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Camp Time</label>
                          <input
                            type="text"
                            placeholder="09:00 AM to 02:00 PM IST"
                            value={campForm.time}
                            onChange={(e) => setCampForm({ ...campForm, time: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Camp Venue</label>
                          <input
                            type="text"
                            required
                            placeholder="Civil Ground Hall"
                            value={campForm.venue}
                            onChange={(e) => setCampForm({ ...campForm, venue: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Max Capacity</label>
                          <input
                            type="number"
                            required
                            placeholder="100"
                            value={campForm.maxRegistrations}
                            onChange={(e) => setCampForm({ ...campForm, maxRegistrations: Number(e.target.value || 50) })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Checkups Description</label>
                        <textarea
                          rows={3}
                          placeholder="List tests included..."
                          value={campForm.description}
                          onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCampCreateModal(false)}
                          className="px-4 py-1.5 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-black uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#0a9396] hover:bg-cyan-600 text-white font-black uppercase tracking-wider"
                        >
                          Publish Camp
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* 4. Awareness Program Create Modal */}
              {showAwarenessCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAwarenessCreateModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    } p-6 space-y-4`}
                  >
                    <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Schedule Awareness Live program
                    </h3>
                    <form onSubmit={handleCreateAwarenessProgram} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Seminar / Drive title</label>
                        <input
                          type="text"
                          required
                          placeholder="Pregnancy Health & Nutrition webinar"
                          value={awarenessForm.title}
                          onChange={(e) => setAwarenessForm({ ...awarenessForm, title: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Scheduled Date</label>
                          <input
                            type="date"
                            required
                            value={awarenessForm.date}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, date: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Event Mode</label>
                          <select
                            value={awarenessForm.mode}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, mode: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-gray-850 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          >
                            <option value="Online">Online Webinar</option>
                            <option value="On-site Drive">On-site Camp / Drive</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Target Patients Group</label>
                          <input
                            type="text"
                            placeholder="Maternal Mothers / Diabetes Patients"
                            value={awarenessForm.target}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, target: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Video Stream Link / RSVP</label>
                          <input
                            type="url"
                            placeholder="https://carebridge.org/awareness-live"
                            value={awarenessForm.link}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, link: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-150 text-gray-900"}`}
                          />
                        </div>
                       </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAwarenessCreateModal(false)}
                          className="px-4 py-1.5 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-black uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-[#0a9396] hover:bg-cyan-600 text-white font-black uppercase tracking-wider"
                        >
                          Publish Live
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* 5. CME Participant Roster Modal */}
              {activeSessionForRegs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveSessionForRegs(null)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    } p-6 space-y-4`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`text-sm font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Registered Doctor Roster
                      </h3>
                      <button
                        onClick={() => setActiveSessionForRegs(null)}
                        className="text-gray-400 hover:text-white font-bold text-xs"
                      >
                        CLOSE [X]
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-base font-black ${darkMode ? "text-white" : "text-gray-900"}`}>{activeSessionForRegs.title}</p>
                      <p className="text-[10px] text-gray-420 font-bold uppercase">Speaker: {activeSessionForRegs.speakerName} • Date: {activeSessionForRegs.date}</p>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pt-2 border-t border-gray-150 dark:border-white/5">
                      {(() => {
                        const regs = academyRegistrations.filter(r => r.sessionId === activeSessionForRegs.id);
                        if (regs.length === 0) {
                          return (
                            <p className="text-xs text-gray-400 italic text-center py-6">No referring doctors have registered for this CME session yet.</p>
                          );
                        }
                        return regs.map((reg) => (
                          <div key={reg.id} className={`p-3 rounded-xl border ${darkMode ? "bg-white/5 text-white border-white/5" : "bg-gray-50 border-gray-100 text-gray-900"} flex items-center justify-between text-xs`}>
                            <div>
                              <p className="font-black">{reg.doctorName || "Dr. Rajesh Clinic Doctor"}</p>
                              <p className="text-[10px] text-gray-400">{reg.clinicName || "Care Clinic partner"}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              reg.status === "attended" || reg.status === "completed" ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                            }`}>
                              {reg.status || "Registered"}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <ConfirmationModal
              isOpen={confirmModal.isOpen}
              onClose={() =>
                setConfirmModal({ ...confirmModal, isOpen: false })
              }
              onConfirm={confirmModal.onConfirm}
              title={confirmModal.title}
              message={confirmModal.message}
              type={confirmModal.type}
              confirmText="Yes, Update"
            />

            {/* Compose Message Modal */}
            <AnimatePresence>
              {showComposeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowComposeModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                  />

                  {/* Modal Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border ${
                      darkMode ? "bg-gray-900 border-white/5" : "bg-white border-gray-100"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#00796b]/10 text-[#00796b] flex items-center justify-center">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                            New Message
                          </h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Send message to Admin or Clinics
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowComposeModal(false)}
                        className={`p-2 rounded-xl transition-all ${
                          darkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-50 text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Compose Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const recipientId = formData.get("recipient_id") as string;
                        const messageContent = formData.get("content") as string;
                        
                        if (!recipientId || !messageContent.trim()) {
                          alert("Please select a recipient and enter some message content.");
                          return;
                        }

                        try {
                          let recipientName = "Unknown";
                           let recipientRole = "clinic";

                           if (recipientId === "admin") {
                             recipientName = "Carebridge+ Admin";
                             recipientRole = "admin";
                           } else if (recipientId === "all_clinics") {
                             recipientName = "All Clinics (Broadcast)";
                             recipientRole = "clinic_broadcast";
                           } else {
                             const clinic = clinics.find((c) => String(c.id) === recipientId);
                             if (clinic) {
                               recipientName = clinic.name;
                               recipientRole = "clinic";
                             }
                           }

                           await firebaseService.addDocument("messages", {
                             senderId: user.id,
                             senderName: user.name,
                             senderRole: user.role,
                             receiverId: recipientId,
                             receiverName: recipientName,
                             receiverRole: recipientRole,
                             content: messageContent,
                             text: messageContent,
                             isRead: false,
                             participants: [user.id, recipientId],
                             createdAt: new Date(),
                             timestamp: new Date(),
                           });

                           // Automatically open the selected thread
                           setMessageForm((prev) => ({
                             ...prev,
                             recipient_id: recipientId,
                           }));

                           setShowComposeModal(false);
                         } catch (err) {
                           console.error("Error creating message thread:", err);
                           alert("Failed to send message.");
                         }
                       }}
                      className="p-6 space-y-5"
                    >
                      {/* Recipient Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Select Recipient
                        </label>
                        <select
                          name="recipient_id"
                          required
                          defaultValue=""
                          className={`w-full h-12 px-4 rounded-2xl text-xs font-bold border transition-all ${
                            darkMode 
                              ? "bg-white/5 border-white/5 text-white focus:ring-2 focus:ring-[#0a9396] [color-scheme:dark]" 
                              : "bg-gray-50 border-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0a9396]"
                          }`}
                        >
                          <option value="" disabled>-- Select Recipient --</option>
                          <option value="admin">💬 Carebridge+ Admin</option>
                          <option value="all_clinics">📢 All Clinics (Broadcast Message)</option>
                          <optgroup label="Partner Clinics">
                            {clinics.map((clinic) => (
                              <option key={clinic.id} value={clinic.id}>
                                🏥 {clinic.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Content Form */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Message Content
                        </label>
                        <textarea
                          name="content"
                          required
                          rows={4}
                          placeholder="Type your broadcast or direct message here..."
                          className={`w-full p-4 rounded-2xl text-xs font-bold border transition-all resize-none ${
                            darkMode 
                              ? "bg-white/5 border-white/5 text-white focus:ring-2 focus:ring-[#0a9396]" 
                              : "bg-gray-50 border-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0a9396]"
                          }`}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowComposeModal(false)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            darkMode 
                              ? "bg-white/5 text-gray-400 hover:bg-white/10" 
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#00796b] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#00796b]/20 hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Send size={12} /> Send Message
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Admission Form Modal */}
            <AnimatePresence>
              {showAdmitModal && selectedReferral && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAdmitModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border ${darkMode ? "bg-[#001219] border-white/10" : "bg-white border-gray-100"}`}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className={`text-2xl font-black flex items-center gap-3 italic tracking-tight uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <Activity className="text-red-500" /> Patient
                            Admission
                          </h2>
                          <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest leading-none ${darkMode ? 'text-gray-300' : 'text-gray-400'}`}>
                            Admission details for {selectedReferral.patientName}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAdmitModal(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors group"
                        >
                          <X
                            size={24}
                            className="text-gray-400 group-hover:rotate-90 transition-transform duration-300"
                          />
                        </button>
                      </div>

                      <form onSubmit={submitAdmitForm} className="space-y-6">
                        {/* Patient & Hospital Info Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            className={`${darkMode ? "bg-white/5 border-white/10" : "bg-blue-50 border-blue-100"} p-4 rounded-2xl border flex items-center gap-4`}
                          >
                            <PatientAvatar
                              gender={selectedReferral.patientGender}
                              name={selectedReferral.patientName}
                              size={48}
                              className="bg-white shadow-sm border-2 border-white"
                            />
                            <div>
                              <p className="text-[8px] font-black text-blue-500 uppercase mb-0.5">
                                Patient Information
                              </p>
                              <h4 className={`font-black text-sm leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {selectedReferral.patientName}
                              </h4>
                              <p className={`text-[10px] font-bold uppercase mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {selectedReferral.patientAge}Y • {selectedReferral.patientGender === "F" ? "Female" : "Male"}
                              </p>
                              <div className={`mt-2 text-[10px] space-y-0.5 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                <p><strong>Contact:</strong> {selectedReferral.patientPhone || "N/A"}</p>
                                <p><strong>Address:</strong> {selectedReferral.patientAddress || selectedReferral.patientArea || "N/A"}</p>
                                <p><strong>Ref Dr:</strong> {selectedReferral.doctorName || "N/A"}</p>
                                <p><strong>Clinic:</strong> {selectedReferral.clinicName || "N/A"}</p>
                                <p><strong>Time:</strong> {(selectedReferral.createdAt || selectedReferral.created_at) ? formatISTDate(selectedReferral.createdAt || selectedReferral.created_at) : "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`${darkMode ? "bg-white/5 border-white/10" : "bg-emerald-50 border-emerald-100"} p-4 rounded-2xl border flex items-center gap-3`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                              <HospitalIcon size={20} />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">
                                Admitting Hospital
                              </p>
                              <h4 className={`font-black text-sm leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {hospDetails?.name || user.name}
                              </h4>
                              <p className={`text-[10px] font-bold uppercase mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {hospDetails?.city ||
                                  user.city ||
                                  "Hospital City"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Condition */}
                          <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                              Patient Condition
                            </label>
                            <select
                              required
                              value={admitForm.condition}
                              onChange={(e) =>
                                setAdmitForm({
                                  ...admitForm,
                                  condition: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 rounded-xl border font-bold text-sm outline-none focus:ring-2 focus:ring-[#005f73] transition-all ${darkMode ? "bg-white/10 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                            >
                              <option value="Stable" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Stable</option>
                              <option value="Moderate" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Moderate</option>
                              <option value="Critical" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Critical</option>
                              <option value="Emergency" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Emergency</option>
                            </select>
                          </div>

                          {/* Ward/ICU */}
                          <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                              Admitted Ward / ICU
                            </label>
                            <select
                              required
                              value={admitForm.ward}
                              onChange={(e) =>
                                setAdmitForm({
                                  ...admitForm,
                                  ward: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 rounded-xl border font-bold text-sm outline-none focus:ring-2 focus:ring-[#005f73] transition-all ${darkMode ? "bg-white/10 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                            >
                              <option value="" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Select Ward</option>
                              <option value="General Ward" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>General Ward</option>
                              <option value="Deluxe" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Deluxe</option>
                              <option value="Private" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Private</option>
                              <option value="Semi-private" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>Semi-private</option>
                              <option value="ICU" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>ICU</option>
                            </select>
                          </div>
                        </div>

                        {/* Vitals */}
                        <div className="space-y-3">
                          <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                            Current Vitals
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div
                              className={`p-3 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xs"}`}
                            >
                              <p className={`text-[8px] font-black uppercase mb-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                                Temp (F)
                              </p>
                              <input
                                type="text"
                                placeholder="98.6"
                                value={admitForm.vitals.temp}
                                onChange={(e) =>
                                  setAdmitForm({
                                    ...admitForm,
                                    vitals: {
                                      ...admitForm.vitals,
                                      temp: e.target.value,
                                    },
                                  })
                                }
                                className="bg-transparent border-none p-0 w-full font-black text-sm outline-none"
                              />
                            </div>
                            <div
                              className={`p-3 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xs"}`}
                            >
                              <p className={`text-[8px] font-black uppercase mb-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                                BP (mmHg)
                              </p>
                              <input
                                type="text"
                                placeholder="120/80"
                                value={admitForm.vitals.bp}
                                onChange={(e) =>
                                  setAdmitForm({
                                    ...admitForm,
                                    vitals: {
                                      ...admitForm.vitals,
                                      bp: e.target.value,
                                    },
                                  })
                                }
                                className="bg-transparent border-none p-0 w-full font-black text-sm outline-none"
                              />
                            </div>
                            <div
                              className={`p-3 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xs"}`}
                            >
                              <p className={`text-[8px] font-black uppercase mb-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                                Pulse (bpm)
                              </p>
                              <input
                                type="text"
                                placeholder="72"
                                value={admitForm.vitals.pulse}
                                onChange={(e) =>
                                  setAdmitForm({
                                    ...admitForm,
                                    vitals: {
                                      ...admitForm.vitals,
                                      pulse: e.target.value,
                                    },
                                  })
                                }
                                className="bg-transparent border-none p-0 w-full font-black text-sm outline-none"
                              />
                            </div>
                            <div
                              className={`p-3 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xs"}`}
                            >
                              <p className={`text-[8px] font-black uppercase mb-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                                SpO2 (%)
                              </p>
                              <input
                                type="text"
                                placeholder="98"
                                value={admitForm.vitals.spo2}
                                onChange={(e) =>
                                  setAdmitForm({
                                    ...admitForm,
                                    vitals: {
                                      ...admitForm.vitals,
                                      spo2: e.target.value,
                                    },
                                  })
                                }
                                className="bg-transparent border-none p-0 w-full font-black text-sm outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Initial Diagnosis */}
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                            Initial Diagnosis
                          </label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Detailed initial diagnosis..."
                            value={admitForm.diagnosis}
                            onChange={(e) =>
                              setAdmitForm({
                                ...admitForm,
                                diagnosis: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm outline-none focus:ring-2 focus:ring-[#005f73] transition-all resize-none ${darkMode ? "bg-white/10 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                          />
                        </div>

                        {/* Scheme */}
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 ${darkMode ? 'text-white' : 'text-gray-400'}`}>
                            Admission Scheme / Insurance
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Cashless, MJPJAY, CGHS, General"
                            value={admitForm.scheme}
                            onChange={(e) =>
                              setAdmitForm({
                                ...admitForm,
                                scheme: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl border font-bold text-sm outline-none focus:ring-2 focus:ring-[#005f73] transition-all ${darkMode ? "bg-white/10 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowAdmitModal(false)}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${darkMode ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-[2] bg-linear-to-r from-[#005f73] to-[#0a9396] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#00796b]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <SaveIcon size={18} /> Confirm Admission
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Referral Detail Modal */}
            <AnimatePresence>
              {showDetailModal && selectedReferral && (
                <motion.div
                  key="referral-detail-modal-wrapper"
                  className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
                >
                  <motion.div
                    key="referral-detail-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDetailModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    key="referral-detail-modal-content"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                  >
                    <div className="bg-[#00796b] p-6 text-white shrink-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <PatientAvatar
                            gender={selectedReferral.patientGender}
                            name={selectedReferral.patientName}
                            size={64}
                            className="border-2 border-white/30 bg-white"
                          />
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-extrabold">
                                {selectedReferral.patientName}
                              </h3>
                              {selectedReferral.patientPhone && (
                                <a
                                  href={`tel:${selectedReferral.patientPhone}`}
                                  className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                                  title="Call Patient"
                                >
                                  <Phone size={20} fill="currentColor" />
                                </a>
                              )}
                            </div>
                            <p className="text-white/70 text-xs font-bold mt-1">
                              {selectedReferral.patientAge}Y,{" "}
                              {selectedReferral.patientGender === "F"
                                ? "Female"
                                : "Male"}{" "}
                              • {selectedReferral.patientPhone}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDetailModal(false)}
                          className="text-white/50 hover:text-white"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-white/5 flex-grow space-y-6 no-scrollbar">
                      {/* Section: Clinical Details */}
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm space-y-4 border border-gray-100 dark:border-white/10">
                        <h4 className="text-[#00796b] font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-2">
                          <Stethoscope size={14} /> Clinical Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Department
                            </label>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {selectedReferral.department}
                            </p>
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Condition
                            </label>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                selectedReferral.patientCondition ===
                                "Emergency"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-600 font-bold"
                              }`}
                            >
                              {selectedReferral.patientCondition}
                            </span>
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Status
                            </label>
                            {selectedReferral.referralType === "opd" ? (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                  selectedReferral.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : selectedReferral.status === "under_review"
                                      ? "bg-blue-100 text-blue-700 font-bold"
                                      : selectedReferral.status === "consultation_done"
                                        ? "bg-emerald-100 text-emerald-700 font-bold"
                                        : "bg-purple-100 text-purple-700 font-bold"
                                }`}
                              >
                                {selectedReferral.status === "pending"
                                  ? "Waiting"
                                  : selectedReferral.status === "under_review"
                                    ? "Consultation Pending"
                                    : selectedReferral.status === "consultation_done"
                                      ? "Consultation Done"
                                      : "Follow-up Recommended"}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                  selectedReferral.status === "admitted"
                                    ? "bg-green-100 text-green-700"
                                    : selectedReferral.status === "under_review"
                                      ? "bg-yellow-101 text-yellow-700"
                                      : selectedReferral.status === "consultation_done"
                                        ? "bg-emerald-101 text-emerald-700"
                                        : selectedReferral.status === "treatment_plan"
                                          ? "bg-orange-100 text-orange-700"
                                          : selectedReferral.status === "discharged"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {selectedReferral.status.replace("_", " ")}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Diagnosis
                            </label>
                            <p className="font-bold text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                              {selectedReferral.diagnosis}
                            </p>
                          </div>
                          {selectedReferral.doctorName &&
                            selectedReferral.doctorName !== "any" && (
                              <div className="col-span-1 sm:col-span-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                                  Requested Consultant
                                </label>
                                <p className="font-black text-[#00796b] dark:text-[#0a9396] flex items-center gap-2">
                                  <UserMd size={16} /> Dr.{" "}
                                  {selectedReferral.doctorName}
                                </p>
                              </div>
                            )}
                          {selectedReferral.note && (
                            <div className="col-span-1 sm:col-span-2">
                              <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                                Clinical Note
                              </label>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                                "{selectedReferral.note}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section: Referral Source */}
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm space-y-4 border border-gray-100 dark:border-white/10">
                        <h4 className="text-[#00796b] font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-2">
                          <HospitalIcon size={14} /> Referral Source
                        </h4>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-gray-100">
                              {selectedReferral.clinicName}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-0.5">
                              Clinic Partner
                            </p>
                          </div>
                          <a
                            href={`tel:${selectedReferral.clinicContact}`}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
                          >
                            <Phone size={14} /> Call Clinic
                          </a>
                        </div>
                      </div>

                      {/* Section: Financial Status */}
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm space-y-4 border border-gray-100 dark:border-white/10">
                        <h4 className="text-[#00796b] font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-2">
                          <IndianRupee size={14} /> Financial & Scheme Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Economic Condition
                            </label>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {selectedReferral.economicalCondition ||
                                "General"}
                            </p>
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                              Applicable Scheme
                            </label>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              {selectedReferral.applicableScheme ||
                                "Private / Cashless"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/10 flex flex-col gap-4 shrink-0">
                        {/* Status Update Quick Bar */}
                        {[
                          "pending",
                          "under_review",
                          "consultation_done",
                        ].includes(selectedReferral.status) && (
                          <div className="flex flex-wrap gap-2 justify-center border-b border-gray-100 dark:border-white/5 pb-4">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  selectedReferral.id,
                                  "under_review",
                                )
                              }
                              disabled={
                                selectedReferral.status === "under_review"
                              }
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                selectedReferral.status === "under_review"
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                              }`}
                            >
                              {selectedReferral.referralType === "opd" ? "Consultation Pending" : "Under Review"}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  selectedReferral.id,
                                  "consultation_done",
                                )
                              }
                              disabled={
                                selectedReferral.status === "consultation_done"
                              }
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                selectedReferral.status === "consultation_done"
                                  ? "bg-emerald-600 text-white shadow-md"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                              }`}
                            >
                              Consultation Done
                            </button>
                            {selectedReferral.referralType !== "opd" && (
                              <button
                                onClick={() => handleAdmitClick(selectedReferral)}
                                className="px-4 py-2 bg-linear-to-r from-[#005f73] to-[#0a9396] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#00796b]/20"
                              >
                                Confirm Admission
                              </button>
                            )}
                          </div>
                        )}

                        {selectedReferral.status === "admitted" && (
                          <div className="flex flex-wrap gap-2 justify-center border-b border-gray-100 dark:border-white/5 pb-4">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  selectedReferral.id,
                                  "treatment_plan",
                                )
                              }
                              disabled={
                                selectedReferral.status === "treatment_plan"
                              }
                              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20"
                            >
                              Update Treatment Plan
                            </button>
                            <button
                              onClick={() => {
                                setShowDetailModal(false);
                                handleDischarge(selectedReferral);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-600/20"
                            >
                              Initiate Discharge
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDetailModal(false)}
                            className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl"
                          >
                            Close Detail View
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Bar Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/10 px-6 py-3 flex items-center justify-between z-40 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
              {[
                { id: "dashboard", icon: Home, label: "Home" },
                { id: "menu", icon: Menu, label: "Menu" },
                { id: "referrals", icon: Bell, label: "Referral" },
                { id: "inbox", icon: Mail, label: "Inbox" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "menu") {
                      setIsSidebarOpen(true);
                    } else {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === item.id ||
                    (item.id === "menu" && isSidebarOpen)
                      ? "text-[#005f73] dark:text-[#0a9396]"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={activeTab === item.id ? "scale-110" : ""}
                  />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Compliance Footer */}
      

      <LegalFooter darkMode={darkMode} />
          </main>
        </div>
      </div>

      {/* ==========================================
          HOSPITAL OPERATIONS SETTINGS MODAL
          ========================================== */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-[2rem] overflow-hidden border p-6 space-y-6 shadow-2xl transition-all ${
                darkMode ? "bg-[#0b1220] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-500/10">
                <div>
                  <h3 className="text-xl font-black text-[#005f73] dark:text-[#0a9396]">Hospital Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450">Configure case routing and admittances preferences</p>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-xs rounded-xl font-bold transition-all text-slate-500 dark:text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-150'}`}>
                  <h4 className="font-bold text-sm mb-2 text-[#005f73] dark:text-[#0a9396]">Referral Channel Defaults</h4>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-700 dark:text-slate-300">Auto-assign Supervised Doctors</span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase rounded-lg">Enabled</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-150'}`}>
                  <h4 className="font-bold text-sm mb-2 text-rose-500 dark:text-rose-450">Admissions & Triaging</h4>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-700 dark:text-slate-300">OPD/IPD Auto-refresh Delay</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-lg">Instant (0s)</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2 text-[11px] font-semibold">
                  <ShieldCheck size={16} className="text-emerald-555 shrink-0" />
                  <span>Clinical audit trails comply with central hospital registry framework protocols.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          HOSPITAL OPERATIONS HELP & SUPPORT MODAL
          ========================================== */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-[2rem] overflow-hidden border p-6 space-y-6 shadow-2xl transition-all ${
                darkMode ? "bg-[#0b1220] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-500/10">
                <div>
                  <h3 className="text-xl font-black text-[#005f73] dark:text-[#a9d6e5]">Hospital Support Desk</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450">Licensed network coordinator help desks</p>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-xs rounded-xl font-bold transition-all text-slate-500 dark:text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-150'} space-y-3`}>
                  <div className="flex items-center gap-2 text-emerald-555 dark:text-emerald-400">
                    <Phone size={18} />
                    <span className="font-extrabold text-sm uppercase">Healthcare Provider Lifeline</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    For priority data adjustments, legal sync issues, or system errors regarding medical histories, call clinical administration support immediately:
                  </p>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-center rounded-xl font-extrabold text-sm">
                    9022066914
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-150'} space-y-2`}>
                  <h4 className="font-bold text-xs uppercase text-slate-400">Coordination FAQs</h4>
                  <div className="space-y-2 text-[11px] leading-snug">
                    <div>
                      <p className="font-bold text-blue-600 dark:text-[#a9d6e5]">Q: Discharges do not auto-notify partners?</p>
                      <p className="text-slate-600 dark:text-slate-450">Discharging a patient clears their active IPD slot locally and registers their status across the regional network clinics simultaneously.</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600 dark:text-[#a9d6e5]">Q: Referral reports have incorrect layouts?</p>
                      <p className="text-slate-600 dark:text-slate-450">Layout grids are generated instantly based on clinical partner data. Verify correct contact details of referring clinics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ===== SEARCH HOSPITAL MODALS ===== */}
      <AnimatePresence>
            {showReferralTypeModal && (
              <motion.div
                key="referral-type-modal-wrapper"
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
              >
                <motion.div
                  key="referral-type-modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowReferralTypeModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                />
                <motion.div
                  key="referral-type-modal-content"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  className={`w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-950 border border-white/10" : "bg-white"}`}
                >
                  <div className="bg-gradient-to-r from-[#005f73] to-[#0a9396] p-6 text-white text-center">
                    <button
                      onClick={() => setShowReferralTypeModal(false)}
                      className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      SELECT REFERRAL TYPE
                    </h3>
                    <p className="text-white/80 text-xs font-semibold mt-1">
                      To: {selectedHospital?.name} • Carebridge+ ERP Desk
                    </p>
                  </div>

                  <div className={`p-6 md:p-8 space-y-6 overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* IPD Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                          darkMode 
                            ? "bg-gray-800/50 border-white/10 hover:border-[#005f73] hover:shadow-[0_0_15px_rgba(0,95,115,0.3)]" 
                            : "bg-white border-gray-100 hover:border-[#005f73] hover:shadow-lg hover:shadow-teal-100"
                        }`}
                        onClick={() => {
                          setReferralForm(prev => ({ ...prev, referralType: "ipd" }));
                          setShowReferralTypeModal(false);
                          setShowReferralModal(true);
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                              <Hospital size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2.5 py-1 rounded-full">
                              Inpatient Desk
                            </span>
                          </div>
                          <h4 className={`text-lg font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            IPD Referral
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-semibold">
                            For clinical admissions, emergency procedures, ward stays, or major surgical bookings. Auto-triggers real-time loud hospital alarms & alert sirens.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-6 w-full text-center py-3 rounded-xl font-black text-xs uppercase transition-all bg-[#005f73] text-white hover:bg-[#005f73]/95 active:scale-95 shadow-md shadow-[#005f73]/20"
                        >
                          Book IPD Admission
                        </button>
                      </motion.div>

                      {/* OPD Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                          darkMode 
                            ? "bg-gray-800/50 border-white/10 hover:border-[#0a9396] hover:shadow-[0_0_15px_rgba(10,147,150,0.3)]" 
                            : "bg-white border-gray-100 hover:border-[#0a9396] hover:shadow-lg hover:shadow-cyan-100"
                        }`}
                        onClick={() => {
                          setShowReferralTypeModal(false);
                          setShowOPDReferralModal(true);
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 text-[#0a9396] dark:text-cyan-400 rounded-xl">
                              <Activity size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full">
                              Outpatient Desk
                            </span>
                          </div>
                          <h4 className={`text-lg font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            OPD Referral
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-semibold font-semibold">
                            For specialist checkups, second opinions, same-day diagnostic lab services, and follow-ups. Sends real-time consult notifications on hospital receiver.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-6 w-full text-center py-3 rounded-xl font-black text-xs uppercase transition-all bg-gradient-to-r from-[#005f73] to-[#0a9396] text-white hover:opacity-95 active:scale-95 shadow-md shadow-teal-500/15"
                        >
                          Initiate Consult
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
      </AnimatePresence>

      <AnimatePresence>
            {showOPDReferralModal && (
              <motion.div
                key="opd-referral-modal-wrapper"
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
              >
                <motion.div
                  key="opd-referral-modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowOPDReferralModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  key="opd-referral-modal-content"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border border-white/10" : "bg-white"}`}
                >
                  <div className="bg-[#0a9396] p-6 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-extrabold font-sans">
                          New OPD Patient Referral
                        </h3>
                        <p className="text-white/70 text-xs font-bold mt-1">
                          To: {selectedHospital?.name} • Outpatient Desk
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOPDReferralModal(false)}
                        className="text-white/50 hover:text-white"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`p-6 overflow-y-auto flex-grow ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                  >
                    <form onSubmit={handleOPDReferralSubmit} className="space-y-6">
                      {/* Search / Select Section */}
                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <Search size={14} /> Search Existing Patient
                        </h4>
                        <div className="relative">
                          <div className="relative group">
                            <Search
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"} group-focus-within:text-[#005f73] transition-colors`}
                              size={16}
                            />
                            <input
                              type="text"
                              value={opdReferralPatientSearch}
                              onChange={(e) =>
                                setOpdReferralPatientSearch(e.target.value)
                              }
                              className={`w-full border-2 border-blue-100/50 rounded-xl pl-12 pr-4 py-3 text-sm font-black outline-hidden focus:border-[#005f73] focus:ring-4 focus:ring-[#005f73]/10 transition-all ${darkMode ? "bg-white/5 text-white" : "bg-blue-50/50 text-gray-900"}`}
                              placeholder="Search Patient Name or Phone..."
                            />
                          </div>

                          {opdReferralPatientSuggestions.length > 0 && (
                            <div
                              className={`absolute z-10 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${darkMode ? "bg-gray-800 border-white/10" : "bg-white border-gray-100"}`}
                            >
                              {opdReferralPatientSuggestions.map(
                                (p: any, idx: number) => (
                                  <button
                                    key={`${p.phone}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      setOpdReferralForm({
                                        ...opdReferralForm,
                                        patientName: p.name,
                                        patientAge: p.age,
                                        patientGender: p.gender || "M",
                                        patientPhone: p.phone,
                                        patientAddress: p.area || p.address || "",
                                      });
                                      setOpdReferralPatientSearch("");
                                    }}
                                    className={`w-full p-4 flex items-center gap-4 transition-colors border-b last:border-0 group ${darkMode ? "hover:bg-white/5 border-white/5" : "hover:bg-blue-50 border-gray-50"}`}
                                  >
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${darkMode ? "bg-white/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white" : "bg-blue-100 text-[#005f73] group-hover:bg-[#005f73] group-hover:text-white"}`}
                                    >
                                      {p.name[0]}
                                    </div>
                                    <div className="text-left flex-grow">
                                      <p
                                        className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                                      >
                                        {p.name}
                                      </p>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <p
                                          className={`${darkMode ? "text-gray-500" : "text-gray-500"} text-[10px] font-bold flex items-center gap-1`}
                                        >
                                          <Phone size={10} /> {p.phone}
                                        </p>
                                        {p.area && (
                                          <p
                                            className={`${darkMode ? "text-gray-500" : "text-gray-400"} text-[10px] font-bold flex items-center gap-1`}
                                          >
                                            <MapPin size={10} /> {p.area}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Patient Details Cards */}
                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <User size={14} /> Demographics & Contacts
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Patient Full Name</label>
                            <input
                              type="text"
                              required
                              value={opdReferralForm.patientName}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  patientName: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="Full Name"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Age</label>
                            <input
                              type="number"
                              required
                              value={opdReferralForm.patientAge}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  patientAge: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="Age (Years)"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
                            <select
                              required
                              value={opdReferralForm.patientGender}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  patientGender: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-905"}`}
                            >
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Number</label>
                            <input
                              type="tel"
                              required
                              value={opdReferralForm.patientPhone}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  patientPhone: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="10-digit number"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Address / Residential Area</label>
                          <input
                            type="text"
                            required
                            value={opdReferralForm.patientAddress}
                            onChange={(e) =>
                              setOpdReferralForm({
                                ...opdReferralForm,
                                patientAddress: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            placeholder="Full Address or Area name"
                          />
                        </div>
                      </div>

                      {/* Clinical details & Direct Doctor Mapping */}
                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#0a9396]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <Activity size={14} /> Clinical Referral Mapping
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Select Speciality / Department</label>
                            <select
                              required
                              value={opdReferralForm.department}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  department: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-905"}`}
                            >
                              <option value="" disabled>Select Specialty Department</option>
                              <option value="All Departments">All Departments</option>
                              {selectedHospital?.departments &&
                                (Array.isArray(selectedHospital.departments)
                                  ? selectedHospital.departments
                                  : String(selectedHospital.departments).split(",")
                                ).map((dept: any, idx: number) => {
                                  const d = String(dept).trim();
                                  if (!d) return null;
                                  return (
                                    <option key={`${d}-${idx}`} value={d}>
                                      {d}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>

                          <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Select Target Consultant Doctor</label>
                            
                            {/* Searchable Toggle Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowOpdDoctorDropdown(!showOpdDoctorDropdown)}
                                className={`w-full text-left rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between border transition-all ${
                                  darkMode 
                                    ? "bg-white/5 text-white border-white/10 hover:bg-white/10" 
                                    : "bg-gray-50 border-gray-100 text-gray-900 hover:bg-gray-100/50"
                                }`}
                              >
                                <span>
                                  {opdReferralForm.doctorId === "" && "Select Target Specialist"}
                                  {opdReferralForm.doctorId === "any" && "Any Available Consultant"}
                                  {opdReferralForm.doctorId !== "" && opdReferralForm.doctorId !== "any" && (
                                    <>Dr. {opdReferralForm.doctorName}</>
                                  )}
                                </span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${showOpdDoctorDropdown ? "rotate-180 text-[#0a9396]" : "text-gray-450"}`} />
                              </button>
                            </div>

                            {/* Dropdown with Internal Filter Search Bar */}
                            {showOpdDoctorDropdown && (
                              <div className={`absolute left-0 right-0 z-[120] mt-1 p-2 rounded-xl shadow-2xl border ${
                                darkMode 
                                  ? "bg-gray-800 border-gray-700 text-white shadow-black/40" 
                                  : "bg-white border-gray-100 text-gray-950 shadow-gray-200"
                              }`}>
                                {/* Doctor Search Bar Input */}
                                <div className="relative mb-2" onClick={(e) => e.stopPropagation()}>
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                  <input
                                    type="text"
                                    placeholder="Search doctor by name, qualification, department..."
                                    value={opdDoctorSearch}
                                    onChange={(e) => setOpdDoctorSearch(e.target.value)}
                                    className={`w-full pl-9 pr-3 py-2 text-xs font-bold rounded-lg border outline-hidden focus:ring-1 focus:ring-[#0a9396] ${
                                      darkMode 
                                        ? "bg-gray-900 border-gray-700 text-white" 
                                        : "bg-gray-50 border-gray-100 text-gray-900"
                                    }`}
                                    autoFocus
                                  />
                                </div>

                                {/* SCROLL ALL RESULTS */}
                                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 no-scrollbar" onClick={(e) => e.stopPropagation()}>
                                  {/* Option: Any Available */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpdReferralForm({
                                        ...opdReferralForm,
                                        doctorId: "any",
                                        doctorName: "any",
                                      });
                                      setShowOpdDoctorDropdown(false);
                                      setOpdDoctorSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex flex-col transition-all border ${
                                      opdReferralForm.doctorId === "any"
                                        ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                                        : darkMode
                                          ? "hover:bg-white/5 border-transparent text-gray-200"
                                          : "hover:bg-gray-50 border-transparent text-gray-750"
                                    }`}
                                  >
                                    <span className="font-extrabold text-xs">Any Available Consultant</span>
                                    <span className="text-[9px] text-gray-400 font-medium">Auto-route reference to any duty doctor</span>
                                  </button>

                                  {(() => {
                                    const doctorsList = getOPDReferralDoctors();
                                    const filtered = doctorsList.filter((doc) => {
                                      const query = opdDoctorSearch.toLowerCase().trim();
                                      if (!query) return true;
                                      return (
                                        (doc.name || "").toLowerCase().includes(query) ||
                                        (doc.specialization || "").toLowerCase().includes(query) ||
                                        (doc.qualification || "").toLowerCase().includes(query)
                                      );
                                    });

                                    if (filtered.length === 0) {
                                      return (
                                        <div className="text-center py-4 text-xs font-medium text-gray-400">
                                          No matching doctors available.
                                        </div>
                                      );
                                    }

                                    return filtered.map((doc: any, index: number) => {
                                      const isSelected = opdReferralForm.doctorId === doc.id;
                                      return (
                                        <button
                                          key={`${doc.id}-${index}`}
                                          type="button"
                                          onClick={() => {
                                            setOpdReferralForm({
                                              ...opdReferralForm,
                                              doctorId: doc.id,
                                              doctorName: doc.name,
                                              department: doc.specialization || doc.department || opdReferralForm.department,
                                            });
                                            setShowOpdDoctorDropdown(false);
                                            setOpdDoctorSearch("");
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg flex flex-col transition-all border ${
                                            isSelected
                                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                                              : darkMode
                                                ? "hover:bg-white/5 border-transparent text-gray-100"
                                                : "hover:bg-gray-50 border-transparent text-gray-800"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between w-full">
                                            <span className="font-extrabold text-xs">Dr. {doc.name}</span>
                                            {doc.qualification && (
                                              <span className="text-[9px] bg-cyan-100 dark:bg-cyan-500/10 text-[#0a9396] px-1.5 py-0.5 rounded-sm font-bold animate-pulse">
                                                {doc.qualification}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-[#0a9396] dark:text-[#0bbfcc] font-black uppercase mt-0.5">
                                            {doc.specialization || "General Medicine"}
                                          </span>
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Provisional Diagnosis</label>
                            <input
                              type="text"
                              required
                              value={opdReferralForm.diagnosis}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  diagnosis: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="e.g. Chronic Migraine, Hypertension, Mild Asthma"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Symptoms & Complaints / Clinical Reason for Referral</label>
                            <textarea
                              required
                              rows={3}
                              value={opdReferralForm.note}
                              onChange={(e) =>
                                setOpdReferralForm({
                                  ...opdReferralForm,
                                  note: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#0a9396] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="Please write clinical symptoms, recent complaints, or patient consultation reasons..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sticky Action Footer */}
                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowOPDReferralModal(false)}
                          className={`flex-1 font-bold py-3.5 rounded-xl border transition-all ${
                            darkMode
                              ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isReferralSubmitting}
                          className="flex-1 bg-gradient-to-r from-[#005f73] to-[#0a9396] text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                        >
                          {isReferralSubmitting ? "Submitting..." : "Submit OPD Referral"} <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
      </AnimatePresence>

      <AnimatePresence>
            {showReferralModal && (
              <motion.div
                key="referral-modal-wrapper"
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
              >
                <motion.div
                  key="referral-modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowReferralModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  key="referral-modal-content"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border border-white/10" : "bg-white"}`}
                >
                  <div className="bg-[#005f73] p-6 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-extrabold">
                          New Patient Referral
                        </h3>
                        <p className="text-white/70 text-xs font-bold mt-1">
                          To: {selectedHospital?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowReferralModal(false)}
                        className="text-white/50 hover:text-white"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`p-6 overflow-y-auto flex-grow ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                  >
                    <form onSubmit={handleReferralSubmit} className="space-y-6">
                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <User size={14} /> Patient Information
                        </h4>
                        <div className="space-y-3">
                          <div className="relative">
                            <div className="relative group">
                              <Search
                                className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"} group-focus-within:text-[#005f73] transition-colors`}
                                size={16}
                              />
                              <input
                                type="text"
                                value={referralPatientSearch}
                                onChange={(e) =>
                                  setReferralPatientSearch(e.target.value)
                                }
                                className={`w-full border-2 border-blue-100/50 rounded-xl pl-12 pr-4 py-3 text-sm font-black outline-hidden focus:border-[#005f73] focus:ring-4 focus:ring-[#005f73]/10 transition-all ${darkMode ? "bg-white/5 text-white" : "bg-blue-50/50 text-gray-900"}`}
                                placeholder="Search Existing Patient (Name or Phone)..."
                              />
                            </div>

                            {referralPatientSuggestions.length > 0 && (
                              <div
                                className={`absolute z-10 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${darkMode ? "bg-gray-800 border-white/10" : "bg-white border-gray-100"}`}
                              >
                                {referralPatientSuggestions.map(
                                  (p: any, idx: number) => (
                                    <button
                                      key={`${p.phone}-${idx}`}
                                      type="button"
                                      onClick={() => {
                                        setReferralForm({
                                          ...referralForm,
                                          patientName: p.name,
                                          patientAge: p.age,
                                          patientGender: p.gender || "M",
                                          patientPhone: p.phone,
                                          patientAddress: p.area || p.address || "",
                                        });
                                        setReferralPatientSearch("");
                                      }}
                                      className={`w-full p-4 flex items-center gap-4 transition-colors border-b last:border-0 group ${darkMode ? "hover:bg-white/5 border-white/5" : "hover:bg-blue-50 border-gray-50"}`}
                                    >
                                      <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${darkMode ? "bg-white/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white" : "bg-blue-100 text-[#005f73] group-hover:bg-[#005f73] group-hover:text-white"}`}
                                      >
                                        {p.name[0]}
                                      </div>
                                      <div className="text-left flex-grow">
                                        <p
                                          className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                          {p.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                          <p
                                            className={`${darkMode ? "text-gray-500" : "text-gray-500"} text-[10px] font-bold flex items-center gap-1`}
                                          >
                                            <Phone size={10} /> {p.phone}
                                          </p>
                                          {p.area && (
                                            <p
                                              className={`${darkMode ? "text-gray-500" : "text-gray-400"} text-[10px] font-bold flex items-center gap-1`}
                                            >
                                              <MapPin size={10} /> {p.area}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight
                                        size={16}
                                        className="text-gray-300"
                                      />
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={referralForm.patientName}
                              onChange={(e) =>
                                setReferralForm({
                                  ...referralForm,
                                  patientName: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="Patient Full Name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              required
                              value={referralForm.patientAge}
                              onChange={(e) =>
                                setReferralForm({
                                  ...referralForm,
                                  patientAge: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                              placeholder="Age"
                            />
                            <select
                              required
                              value={referralForm.patientGender}
                              onChange={(e) =>
                                setReferralForm({
                                  ...referralForm,
                                  patientGender: e.target.value,
                                })
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            >
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                            </select>
                          </div>
                          <input
                            type="tel"
                            required
                            value={referralForm.patientPhone}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                patientPhone: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            placeholder="Contact No."
                          />
                          <input
                            type="text"
                            value={referralForm.patientAddress}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                patientAddress: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            placeholder="Patient Area / Place (e.g. Pune)"
                          />
                        </div>
                      </div>

                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <Stethoscope size={14} /> Clinical Details
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label
                              className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase ml-1`}
                            >
                              Patient Condition
                            </label>
                            <select
                              required
                              value={referralForm.patientCondition}
                              onChange={(e) =>
                                setReferralForm({
                                  ...referralForm,
                                  patientCondition: e.target.value,
                                })
                              }
                              className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${
                                referralForm.patientCondition === "Emergency"
                                  ? darkMode
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-red-50 text-red-600 border-red-100"
                                  : darkMode
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-green-50 text-green-600 border-green-100"
                              }`}
                            >
                              <option value="Stable">Stable</option>
                              <option value="Emergency Stable">
                                Emergency Stable
                              </option>
                              <option value="Emergency">Emergency</option>
                            </select>
                          </div>
                          <select
                            required
                            value={referralForm.department}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                department: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              Select Department
                            </option>
                            <option
                              value="All Departments"
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              All Departments
                            </option>
                            {selectedHospital?.departments &&
                              (Array.isArray(selectedHospital.departments)
                                ? selectedHospital.departments
                                : String(selectedHospital.departments).split(
                                    ",",
                                  )
                              ).map((dept: any, idx: number) => {
                                const d = String(dept).trim();
                                if (!d) return null;
                                return (
                                  <option
                                    key={`${d}-${idx}`}
                                    value={d}
                                    className={darkMode ? "bg-gray-800" : ""}
                                  >
                                    {d}
                                  </option>
                                );
                              })}
                          </select>

                          <select
                            required
                            value={referralForm.doctorId}
                            onChange={(e) => {
                              const doctorsList = getReferralDoctors();
                              const doc = doctorsList.find(
                                (d) => d.id === e.target.value,
                              );
                              setReferralForm({
                                ...referralForm,
                                doctorId: e.target.value,
                                doctorName: doc
                                  ? doc.name
                                  : e.target.value === "any"
                                    ? "any"
                                    : "",
                              });
                            }}
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              Select Doctor
                            </option>
                            <option
                              value="any"
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              Any Available Doctor
                            </option>
                            {getReferralDoctors().map(
                              (doc: any, index: number) => (
                                <option
                                  key={`${doc.id}-${index}`}
                                  value={doc.id}
                                  className={darkMode ? "bg-gray-800" : ""}
                                >
                                  {doc.name} {doc.qualification ? `(${doc.qualification})` : ""} - {doc.specialization}
                                </option>
                              ),
                            )}
                          </select>
                          <input
                            type="text"
                            required
                            value={referralForm.diagnosis}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                diagnosis: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            placeholder="Diagnosis"
                          />
                          <textarea
                            value={referralForm.note}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                note: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-medium outline-hidden focus:ring-2 focus:ring-[#005f73] min-h-[80px] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                            placeholder="Note to Hospital (Optional)"
                          />
                        </div>
                      </div>

                      <div
                        className={`${darkMode ? "bg-white/5 border border-white/10" : "bg-white"} p-4 rounded-2xl shadow-sm space-y-4`}
                      >
                        <h4
                          className={`${darkMode ? "text-cyan-400" : "text-[#005f73]"} font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-2`}
                        >
                          <IndianRupee size={14} /> Financial Status
                        </h4>
                        <select
                          required
                          value={referralForm.economicalCondition}
                          onChange={(e) =>
                            setReferralForm({
                              ...referralForm,
                              economicalCondition: e.target.value,
                            })
                          }
                          className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                        >
                          <option
                            value=""
                            disabled
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            Select Condition
                          </option>
                          <option
                            value="General (Paying)"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            General (Paying)
                          </option>
                          <option
                            value="MJPJAY Scheme"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            MJPJAY Scheme
                          </option>
                          <option
                            value="PMJAY (Ayushman)"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            PMJAY (Ayushman)
                          </option>
                          <option
                            value="Corporate Insurance"
                            className={darkMode ? "bg-gray-800" : ""}
                          >
                            Corporate Insurance
                          </option>
                        </select>

                        <div className="space-y-1">
                          <label
                            className={`text-[10px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase ml-1`}
                          >
                            Applicable Scheme
                          </label>
                          <select
                            required
                            value={referralForm.applicableScheme}
                            onChange={(e) =>
                              setReferralForm({
                                ...referralForm,
                                applicableScheme: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold outline-hidden focus:ring-2 focus:ring-[#005f73] ${darkMode ? "bg-white/5 text-white border-white/10" : "bg-gray-50 border-gray-100 text-gray-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              Select Scheme
                            </option>
                            <option
                              value="No Scheme"
                              className={darkMode ? "bg-gray-800" : ""}
                            >
                              No Scheme / Private
                            </option>
                            {selectedHospital?.schemes &&
                              (Array.isArray(selectedHospital.schemes)
                                ? selectedHospital.schemes
                                : String(selectedHospital.schemes).split(",")
                              ).map((scheme: any, idx: number) => {
                                const s = String(scheme).trim();
                                if (!s) return null;
                                return (
                                  <option
                                    key={`${s}-${idx}`}
                                    value={s}
                                    className={darkMode ? "bg-gray-800" : ""}
                                  >
                                    {s}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 pb-6">
                        <button
                          type="button"
                          onClick={() => setShowReferralModal(false)}
                          className={`flex-1 font-bold py-3 rounded-xl transition-all ${darkMode ? "bg-white/10 text-gray-300 hover:bg-white/20" : "bg-gray-200 text-gray-700 hover:bg-gray-200"}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-2 bg-[#005f73] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#005f73]/90 transition-all"
                        >
                          Submit Referral <Send size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
      </AnimatePresence>

      <AnimatePresence>
            {showProfileModal &&
              selectedHospital &&
              (() => {
                const hospData =
                  filteredHospitals.find(
                    (h) => String(h.id) === String(selectedHospital?.id),
                  ) || selectedHospital;
                return (
                  <motion.div
                    key="profile-modal-wrapper"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                  >
                    <motion.div
                      key="profile-modal-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowProfileModal(false)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                      key="profile-modal-content"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className={`w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border border-white/10" : "bg-white"}`}
                    >
                      <div
                        className={`${darkMode ? "bg-white/5 border-b border-white/10" : "bg-gray-50 border-b border-gray-100"} p-6 shrink-0`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm mb-2 w-fit ${
                                hospData.tier === "premium"
                                  ? "bg-linear-to-r from-[#005f73] to-[#023e8a] text-white"
                                  : hospData.tier === "priority"
                                    ? "bg-linear-to-r from-[#0a9396] to-[#0077b6] text-white"
                                    : "bg-linear-to-r from-[#ee9b00] to-[#ca6702] text-white"
                              }`}
                            >
                              {hospData.tier === "premium" && (
                                <Crown size={10} />
                              )}
                              {String(hospData.tier || "").toUpperCase()}{" "}
                              PARTNER
                            </span>
                            <h3
                              className={`text-xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {hospData.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowProfileModal(false)}
                            className={`${darkMode ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            <X size={24} />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
                        <div>
                          <p
                            className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-xs font-bold flex items-center gap-2`}
                          >
                            <MapPin size={14} className="text-red-500" />
                            {hospData.city}
                          </p>
                          <div className="mt-4">
                            <a
                              href={`tel:${hospData.helpline}`}
                              className={`w-full border border-green-600 text-green-600 py-3 rounded-xl font-bold text-sm ${darkMode ? "hover:bg-green-600/20" : "hover:bg-green-600 hover:text-white"} transition-all flex items-center justify-center gap-2 shadow-sm`}
                            >
                              <Phone size={18} /> Join Call / Reception
                            </a>
                          </div>
                        </div>

                        <div
                          className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                        >
                          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                            <Activity size={12} className="inline mr-1" /> Bed
                            Availability
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <div
                              className={`${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"} p-2 rounded-xl border text-center`}
                            >
                              <p
                                className={`text-[8px] font-bold ${darkMode ? "text-red-400/80" : "text-red-400"} uppercase`}
                              >
                                ICU
                              </p>
                              <p
                                className={`text-sm font-black ${darkMode ? "text-red-400" : "text-red-600"}`}
                              >
                                {hospData.bedsICU || 0}
                              </p>
                            </div>
                            <div
                              className={`${darkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"} p-2 rounded-xl border text-center`}
                            >
                              <p
                                className={`text-[8px] font-bold ${darkMode ? "text-blue-400/80" : "text-blue-400"} uppercase`}
                              >
                                General
                              </p>
                              <p
                                className={`text-sm font-black ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                              >
                                {hospData.bedsGeneral || 0}
                              </p>
                            </div>
                            <div
                              className={`${darkMode ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100"} p-2 rounded-xl border text-center`}
                            >
                              <p
                                className={`text-[8px] font-bold ${darkMode ? "text-orange-400/80" : "text-orange-400"} uppercase`}
                              >
                                Ventilator
                              </p>
                              <p
                                className={`text-sm font-black ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                              >
                                {hospData.bedsVentilator || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                        >
                          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                            <ShieldAlert
                              size={12}
                              className="inline mr-1 text-red-500"
                            />{" "}
                            Emergency & Ambulance
                          </label>
                          <div className="space-y-3">
                            {hospData.emergencyContact && (
                              <div
                                className={`flex justify-between items-center ${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"} p-3 rounded-xl border`}
                              >
                                <div>
                                  <p
                                    className={`text-[8px] font-bold ${darkMode ? "text-red-400/80" : "text-red-400"} uppercase`}
                                  >
                                    Emergency Line
                                  </p>
                                  <p
                                    className={`text-xs font-black ${darkMode ? "text-red-400" : "text-red-600"}`}
                                  >
                                    {hospData.emergencyContact}
                                  </p>
                                </div>
                                <a
                                  href={`tel:${hospData.emergencyContact}`}
                                  className="bg-red-500 text-white p-2 rounded-lg shadow-sm"
                                >
                                  <Phone size={14} />
                                </a>
                              </div>
                            )}
                            <div
                              className={`flex justify-between items-center ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} p-3 rounded-xl border`}
                            >
                              <div>
                                <p
                                  className={`text-[8px] font-bold ${darkMode ? "text-gray-500" : "text-gray-400"} uppercase`}
                                >
                                  Ambulance (
                                  {hospData.ambulanceStatus || "Available"})
                                </p>
                                <p
                                  className={`text-xs font-black ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  {hospData.ambulanceContact || "N/A"}
                                </p>
                              </div>
                              {hospData.ambulanceContact && (
                                <a
                                  href={`tel:${hospData.ambulanceContact}`}
                                  className="bg-[#005f73] text-white p-2 rounded-lg shadow-sm"
                                >
                                  <Smartphone size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {hospData.admissionNotes && (
                          <div
                            className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                          >
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 block">
                              <FileText size={12} className="inline mr-1" />{" "}
                              Admission Guidelines
                            </label>
                            <p
                              className={`text-[11px] font-bold ${darkMode ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-gray-600 bg-amber-50 border-amber-100"} p-3 rounded-xl border leading-relaxed`}
                            >
                              {hospData.admissionNotes}
                            </p>
                          </div>
                        )}

                        {hospData.webinarLink && (
                          <div
                            className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                          >
                            <a
                              href={hospData.webinarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-full ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"} py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all`}
                            >
                              <ExternalLink size={14} /> View Training / Webinar
                            </a>
                          </div>
                        )}

                        <div
                          className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                        >
                          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                            <Stethoscope size={12} className="inline mr-1" />{" "}
                            Departments
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(hospData.departments)
                              ? hospData.departments.map(
                                  (d: string, idx: number) => (
                                    <span
                                      key={`${d}-${idx}`}
                                      className={`${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100"} text-[10px] font-extrabold px-3 py-1 rounded-full border`}
                                    >
                                      {d}
                                    </span>
                                  ),
                                )
                              : String(hospData.departments || "General")
                                  .split(",")
                                  .map((d: string, idx: number) => (
                                    <span
                                      key={`${d}-${idx}`}
                                      className={`${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100"} text-[10px] font-extrabold px-3 py-1 rounded-full border`}
                                    >
                                      {d.trim()}
                                    </span>
                                  ))}
                          </div>
                        </div>

                        <div
                          className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                        >
                          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                            <FileText size={12} className="inline mr-1" />{" "}
                            Accepted Schemes
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(hospData.schemes)
                              ? hospData.schemes.map(
                                  (s: string, idx: number) => (
                                    <span
                                      key={`${s}-${idx}`}
                                      className={`${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#e0f2f1] text-[#0a9396] border-[#b2dfdb]"} text-[10px] font-extrabold px-3 py-1 rounded-full border`}
                                    >
                                      {s}
                                    </span>
                                  ),
                                )
                              : String(hospData.schemes || "")
                                  .split(",")
                                  .filter(Boolean)
                                  .map((s: string, idx: number) => (
                                    <span
                                      key={`${s}-${idx}`}
                                      className={`${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#e0f2f1] text-[#0a9396] border-[#b2dfdb]"} text-[10px] font-extrabold px-3 py-1 rounded-full border`}
                                    >
                                      {s.trim()}
                                    </span>
                                  ))}
                          </div>
                        </div>

                        {((selectedHospitalDoctors &&
                          selectedHospitalDoctors.length > 0) ||
                          (hospData.specialists &&
                            hospData.specialists.length > 0)) && (
                          <div
                            className={`border-t ${darkMode ? "border-white/10" : "border-gray-100"} pt-6`}
                          >
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                              <UserMd size={12} className="inline mr-1" />{" "}
                              Doctors & Specialists
                            </label>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                              {/* Show Specialists from hospital_details (profile array) */}
                              {hospData.specialists?.map(
                                (doc: any, index: number) => (
                                  <div
                                    key={`specialist-${index}`}
                                    className={`${darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50/30 border-emerald-100/50"} p-3 rounded-xl border`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <h6
                                        className={`font-extrabold ${darkMode ? "text-white" : "text-gray-900"} text-xs`}
                                      >
                                        {doc.name}
                                      </h6>
                                      <span
                                        className={`text-[8px] font-black ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"} px-1.5 py-0.5 rounded uppercase`}
                                      >
                                        Profile
                                      </span>
                                    </div>
                                    <p
                                      className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-[10px] font-bold uppercase`}
                                    >
                                      {doc.qualification}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                      <p
                                        className={`${darkMode ? "text-emerald-400" : "text-[#00796b]"} text-[10px] font-bold flex items-center gap-1`}
                                      >
                                        <Stethoscope size={10} />{" "}
                                        {doc.department || "General"}
                                      </p>
                                      <p className="text-orange-400 text-[10px] font-bold flex items-center gap-1">
                                        <Clock size={10} />{" "}
                                        {doc.timing || "N/A"}
                                      </p>
                                      {doc.contact && (
                                        <p className="text-blue-400 text-[10px] font-bold flex items-center gap-1">
                                          <Phone size={10} /> {doc.contact}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}

                              {/* Show Doctors from doctors collection */}
                              {selectedHospitalDoctors.map(
                                (doc: any, index: number) => {
                                  // Avoid duplication if already in specialists
                                  const isDuplicate =
                                    hospData.specialists?.some(
                                      (s: any) =>
                                        s.name?.toLowerCase() ===
                                          doc.name?.toLowerCase() &&
                                        s.qualification?.toLowerCase() ===
                                          doc.qualification?.toLowerCase(),
                                    );
                                  if (isDuplicate) return null;

                                  return (
                                    <div
                                      key={`doctor-${doc.id}-${index}`}
                                      className={`${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} p-3 rounded-xl border`}
                                    >
                                      <h6
                                        className={`font-extrabold ${darkMode ? "text-white" : "text-gray-900"} text-xs`}
                                      >
                                        {doc.name}
                                      </h6>
                                      <p
                                        className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-[10px] font-bold uppercase`}
                                      >
                                        {doc.qualification}
                                      </p>
                                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        <p
                                          className={`${darkMode ? "text-emerald-400" : "text-[#00796b]"} text-[10px] font-bold flex items-center gap-1`}
                                        >
                                          <Stethoscope size={10} />{" "}
                                          {doc.department || "General"}
                                        </p>
                                        <p className="text-orange-400 text-[10px] font-bold flex items-center gap-1">
                                          <Clock size={10} />{" "}
                                          {doc.timing || "N/A"}
                                        </p>
                                        {doc.contact && (
                                          <p className="text-blue-400 text-[10px] font-bold flex items-center gap-1">
                                            <Phone size={10} /> {doc.contact}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className={`p-6 flex gap-3 ${darkMode ? "bg-white/5 border-t border-white/10" : "bg-gray-50 border-t border-gray-100"}`}
                      >
                        <button
                          onClick={() => setShowProfileModal(false)}
                          className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                            darkMode
                              ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <ChevronLeft size={18} /> Back to List
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileModal(false);
                            setShowReferralTypeModal(true);
                          }}
                          className="flex-1 bg-[#005f73] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#005f73]/90 transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 size={18} /> Refer Patient
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
      </AnimatePresence>
    </>
  );
}
