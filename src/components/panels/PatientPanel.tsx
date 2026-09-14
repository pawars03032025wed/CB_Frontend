import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Mic,
  BellOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Send,
  Moon,
  Bell,
  Clock,
  Activity,
  Calendar,
  MapPin,
  Phone,
  User as UserIcon,
  Pill,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronRight,
  Heart,
  HeartPulse,
  Droplets,
  Dumbbell,
  Utensils,
  LogOut,
  Star,
  Zap,
  Crown,
  Info,
  ChevronDown,
  ChevronUp,
  Shield,
  Hospital,
  Stethoscope,
  Users,
  FileText,
  AlertCircle,
  Leaf,
  History as HistoryIcon,
  ArrowLeft,
  ArrowRight,
  Flame,
  Trophy,
  Wind,
  PhoneCall,
  UserCheck,
  FileSearch,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Share2,
  Hash,
  Smartphone,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Timer,
  Menu,
  Sun,
  Edit3,
  Footprints,
  Eye,
  Brain,
  ListTodo,
  Smile,
  ClipboardList,
  BriefcaseMedical,
  HeartHandshake,
  Upload,
  Vibrate,
  CircleDot,
  Waves,
  ArrowDownCircle,
  HandHeart,
  Sparkles,
  Lock,
  Cloud,
  ShieldCheck,
  MoreVertical,
  ExternalLink,
  Download,
  MessageCircle,
  WifiOff,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { firebaseService } from "../../services/firebaseService";
import {
  formatISTDate,
  formatISTTime,
  useLiveClock,
  getISTDateString,
} from "../../utils/dateUtils";
import {
  handleFirestoreError,
  OperationType,
  safeStringify,
} from "../../utils/firestoreErrorHandler";
import {
  collection,
  serverTimestamp,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { MedicineForm } from "../../types";
import PatientAvatar from "../common/PatientAvatar";
import MedicationManagement from "../medicine/MedicationManagement";
import PersonalHealthAnalyst from "../analyst/PersonalHealthAnalyst";

// Static alarm sound mappings
const ALARM_SOUNDS_MAP: Record<string, string> = {
  "soft medical tone": "https://www.gstatic.com/meet/sounds/join_call_6a9b.mp3",
  "emergency tone": "https://www.gstatic.com/meet/sounds/ringout_7a03.mp3",
  "bell tone": "https://www.soundjay.com/buttons/beep-07.mp3",
};

const VIBRATION_PATTERNS: Record<string, number[]> = {
  "continuous pulse": [500, 200, 500, 200, 500],
  "heartbeat rhythm": [150, 150, 150, 300, 150, 150],
  "urgent alarm": [1000, 500, 1000, 500],
};

// Helper to sanitize any double-encoded UTF-8 strings back to clean Devanagari (Marathi/Hindi) characters.
const cleanDoubleEncoding = (str: string): string => {
  if (!str) return str;
  let current = str;
  for (let i = 0; i < 2; i++) {
    if (/[\u0900-\u097F]/.test(current)) {
      return current;
    }
    if (/[^\x00-\x7F]/.test(current)) {
      try {
        const bytes = new Uint8Array(
          Array.from(current).map((c) => c.charCodeAt(0))
        );
        const decoded = new TextDecoder("utf-8").decode(bytes);
        if (decoded === current) {
          break;
        }
        current = decoded;
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }
  return current;
};

const ColorfulImageIcon = ({
  icon: Icon,
  gradient,
  shadow,
  size = 18,
}: {
  icon: React.ComponentType<any>;
  gradient: string;
  shadow: string;
  size?: number;
}) => (
  <div className={`p-2.5 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg ${gradient} ${shadow} border border-white/15 transition duration-300 group-hover:scale-[1.06] shrink-0`}>
    <Icon size={size} className="drop-shadow-xs" />
  </div>
);

interface PatientPanelProps {
  user: any;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function PatientPanel({
  user,
  onLogout,
  darkMode,
  setDarkMode,
}: PatientPanelProps) {
  const currentTime = useLiveClock();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showSubscriptionPlan, setShowSubscriptionPlan] = useState(false);
  const [showPhonePeModal, setShowPhonePeModal] = useState(false);

  const subStatus = user?.subscriptionStatus;
  const trialEndAt = user?.trialEndAt;
  const endMs = typeof trialEndAt === "number" ? trialEndAt : trialEndAt ? new Date(trialEndAt).getTime() : 0;
  const remaining = Math.max(0, endMs - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);

  // Daily & Personal Reminders Persistent States
  const [dailyReminders, setDailyReminders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`daily_reminders_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showDailyReminderModal, setShowDailyReminderModal] = useState(false);
  const [editingDailyReminderId, setEditingDailyReminderId] = useState<string | null>(null);
  const [dailyReminderForm, setDailyReminderForm] = useState({
    title: "",
    description: "",
    date: getISTDateString(),
    time: "08:00",
    type: "task" as 'task' | 'work' | 'appointment' | 'personal' | 'water' | 'exercise' | 'custom_health' | 'blood_sugar' | 'yoga' | 'medicine',
    repeat: "none" as 'none' | 'daily' | 'weekly' | 'monthly',
    sound: "standard",
    priority: "medium" as 'low' | 'medium' | 'high',
  });
  const [activeDailyAlarm, setActiveDailyAlarm] = useState<any | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`daily_reminders_${user.id}`, JSON.stringify(dailyReminders));
    }
  }, [dailyReminders, user?.id]);

  // Databases Loaded via Firebase Realtime Core
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [medicalReports, setMedicalReports] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [clinicDetails, setClinicDetails] = useState<Record<string, any>>({});
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search parameters for finding doctors/clinics
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showClinicSearchModal, setShowClinicSearchModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<"privacy" | "terms" | null>(null);
  const [showClinicProfileModal, setShowClinicProfileModal] = useState(false);
  const [viewingClinic, setViewingClinic] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Profile edit form state & loading
  const [profileForm, setProfileForm] = useState({
    name: "",
    age: "",
    address: "",
    phone: "",
    emergencyDoctor: "",
    emergencyRelative: "",
    emergencyOther: "",
    conditions: "",
    gender: "M",
    whatsappConsent: true,
    notificationConsent: true,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (patientDetails) {
      setProfileForm({
        name: patientDetails.name || user?.name || "",
        age: patientDetails.age || "",
        address: patientDetails.address || "",
        phone: patientDetails.phone || user?.phone || "",
        emergencyDoctor: patientDetails.emergencyDoctor || "",
        emergencyRelative: patientDetails.emergencyRelative || "",
        emergencyOther: patientDetails.emergencyOther || "",
        conditions: patientDetails.conditions || "",
        gender: patientDetails.gender || user?.gender || "M",
        whatsappConsent: patientDetails.whatsappConsent !== false,
        notificationConsent: patientDetails.notificationConsent !== false,
      });
    } else if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "M",
        whatsappConsent: user.whatsappConsent !== false,
        notificationConsent: user.notificationConsent !== false,
      }));
    }
  }, [patientDetails, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
       showNotification("Authentication state not loaded. Access Denied.", "error");
       return;
    }
    
    setIsSavingProfile(true);
    try {
      if (patientDetails?.id) {
        await firebaseService.updateDocument("patient_details", patientDetails.id, {
          name: profileForm.name,
          age: profileForm.age,
          address: profileForm.address,
          phone: profileForm.phone,
          emergencyDoctor: profileForm.emergencyDoctor,
          emergencyRelative: profileForm.emergencyRelative,
          emergencyOther: profileForm.emergencyOther,
          conditions: profileForm.conditions,
          gender: profileForm.gender,
          whatsappConsent: profileForm.whatsappConsent,
          notificationConsent: profileForm.notificationConsent,
          updatedAt: serverTimestamp(),
        });
        showNotification("Profile details updated successfully!", "success");
      } else {
        await firebaseService.addDocument("patient_details", {
          userId: user.id,
          name: profileForm.name,
          age: profileForm.age,
          address: profileForm.address,
          phone: profileForm.phone,
          emergencyDoctor: profileForm.emergencyDoctor,
          emergencyRelative: profileForm.emergencyRelative,
          emergencyOther: profileForm.emergencyOther,
          conditions: profileForm.conditions,
          gender: profileForm.gender,
          whatsappConsent: profileForm.whatsappConsent,
          notificationConsent: profileForm.notificationConsent,
          createdAt: serverTimestamp(),
        });
        showNotification("Health profile synchronized with database!", "success");
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      showNotification("Failed to save profile. Please try again.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [bookingForm, setBookingForm] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "M",
    patientPhone: "",
    patientAddress: "",
    preferredDate: getISTDateString(),
    preferredTime: "10:00",
    preferredAmPm: "AM",
  });

  // UI state for Modals and overlays
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    clinicName: "",
    date: getISTDateString(),
    type: "report" as "report" | "prescription",
    fileUrl: "",
  });
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showReportViewer, setShowReportViewer] = useState<any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // My Reports search and sub-tab states
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportSearchDate, setReportSearchDate] = useState("");
  const [reportsSubTab, setReportsSubTab] = useState<"files" | "voice">("files");

  // Camera integration state and refs
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);

  // Start devices camera stream
  const startCamera = async () => {
    try {
      setCapturedImageBase64(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video play error:", err));
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      showNotification("Could not open camera. Please use File Upload or grant camera access.", "error");
      setCameraActive(false);
    }
  };

  // Stop camera stream safely
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture canvas image snapshot as JPEG Base64
  const captureSnapshot = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 480;
        
        const MAX_DIM = 1000;
        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          setCapturedImageBase64(base64);
          setReportForm(prev => ({ ...prev, fileUrl: base64 }));
          stopCamera();
          showNotification("Photo snapshot captured successfully!", "success");
        }
      } catch (err) {
        console.error("Capture snapshot error:", err);
        showNotification("Snapshot failed. Please try choosing from gallery instead.", "error");
      }
    }
  };

  // Gallery File upload converter
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        // Limit non-images to 700KB to stay within Firestore 1MB max document limit
        if (file.size > 700 * 1024) {
          showNotification("Non-image files must be under 700KB.", "error");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setReportForm(prev => ({ ...prev, fileUrl: reader.result as string }));
            setCapturedImageBase64(null); // Clear camera mode
            showNotification("Report file loaded from gallery!", "success");
          }
        };
        reader.onerror = () => {
          showNotification("Error converting file.", "error");
        };
        reader.readAsDataURL(file);
        return;
      }

      // For images, dynamically compress them
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 1000;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            if (compressedBase64.length > 900000) {
              showNotification("Image is still too large after compression. Try a smaller one.", "error");
              return;
            }
            
            setReportForm(prev => ({ ...prev, fileUrl: compressedBase64 }));
            setCapturedImageBase64(null);
            showNotification("Image compressed and loaded successfully!", "success");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        showNotification("Error converting file.", "error");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving the report to Firestore
  const handleAddReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim()) {
      showNotification("Please specify a name/title for your report.", "error");
      return;
    }
    if (!reportForm.fileUrl) {
      showNotification("Please upload an image from gallery or capture with the camera.", "error");
      return;
    }

    try {
      setIsProcessingFile(true);
      await firebaseService.addDocument("medical_reports", {
        patientId: user.id,
        title: reportForm.title.trim(),
        clinicName: reportForm.clinicName.trim() || "My Self-Upload",
        date: reportForm.date,
        type: reportForm?.type || "report",
        fileUrl: reportForm.fileUrl,
        createdAt: new Date().toISOString(),
      });
      
      showNotification("Medical Report saved to your cloud drive successfully!", "success");
      setShowAddReportModal(false);
      // Reset state for next uploads
      setReportForm({
        title: "",
        clinicName: "",
        date: getISTDateString(),
        type: "report",
        fileUrl: "",
      });
      setCapturedImageBase64(null);
    } catch (err: any) {
      console.error("Save report error:", err);
      showNotification("Error saving medical report: " + err.message, "error");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle deleting report from Firestore
  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this clinical report permanent?")) return;
    try {
      await firebaseService.deleteDocument("medical_reports", reportId);
      showNotification("Report deleted successfully and removed from database.", "success");
      if (showReportViewer?.id === reportId) {
        setShowReportViewer(null);
      }
    } catch (err: any) {
      console.error("Delete report error:", err);
      showNotification("Could not delete report file.", "error");
    }
  };
  
  // Custom Alert / Feedback System
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      4000,
    );
  };

  // ==========================================
  // MODULE 1: AI HEALTH COACH CHAT ENGINE
  // ==========================================
  const [aiInput, setAiInput] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<
    { role: "user" | "model"; content: string; suggestions?: string[] }[]
  >(() => {
    const saved = localStorage.getItem(`ai_coach_chat_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            role: m.role,
            content: cleanDoubleEncoding(m.content || ""),
            suggestions: Array.isArray(m.suggestions)
              ? m.suggestions.map((s: string) => cleanDoubleEncoding(s))
              : m.suggestions
          }));
        }
      } catch (e) {
        console.warn("Failed to parse saved chat history:", e);
      }
    }
    return [
      {
        role: "model",
        content: "Namaste! I am your CareBridge AI Health Coach.\n\nI can analyze your vitals, remind you to take active medications, and guide you on diet, sleep, or physical wellness. \n\n*English, Hindi, and Marathi* are fully supported. How are you feeling today?",
        suggestions: [
          "Review my water and walking goals",
          "Suggest exercises to normalize blood pressure",
          "Describe high-fiber foods for diabetics",
        ],
      },
    ];
  });
  const [aiLanguage, setAiLanguage] = useState<"English" | "Hindi" | "Marathi">(
    "English",
  );
  const [isSTTListening, setIsSTTListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currAudioPayload, setCurrAudioPayload] = useState<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const ttsCache = useRef<Record<string, string>>({});

  const recognitionRef = useRef<any>(null);
  const sttActiveRef = useRef(false);

  // Helper utility to deduplicate chat history and prevent duplicate conversation history injection
  const deduplicateMessages = (msgs: { role: "user" | "model"; content: string; suggestions?: string[] }[]) => {
    const result: typeof msgs = [];
    let lastKey = "";
    for (const m of msgs) {
      if (!m || !m.content) continue;
      const key = `${m.role}:${m.content.trim().toLowerCase()}`;
      if (key !== lastKey) {
        result.push(m);
        lastKey = key;
      }
    }
    return result;
  };

  // Preload voice assistant and initialize speech recognition structures in background during app launch
  useEffect(() => {
    // 1. Silent backend warming request
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isWarmup: true })
    }).catch((preloadErr) => {
      console.warn("Background AI warmup failed:", preloadErr);
    });

    // 2. Pre-initialize SpeechRecognition
    const SpeechRecog = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecog && !recognitionRef.current) {
      try {
        const rec = new SpeechRecog();
        rec.continuous = false;
        rec.interimResults = false;
        recognitionRef.current = rec;
      } catch (err) {
        console.warn("SpeechRecognition background pre-init failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`ai_coach_chat_${user?.id}`, JSON.stringify(deduplicateMessages(aiChatMessages)));
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatMessages]);

  const startSTT = () => {
    const SpeechRecog = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecog) {
      showNotification("Speech recognition is not fully supported by your browser.", "info");
      return;
    }

    if (!recognitionRef.current) {
      try {
        recognitionRef.current = new SpeechRecog();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      } catch (err) {
        console.warn("STT initialization failed:", err);
        return;
      }
    }

    const recognition = recognitionRef.current;
    recognition.lang = aiLanguage === "Marathi" ? "mr-IN" : aiLanguage === "Hindi" ? "hi-IN" : "en-US";

    recognition.onstart = () => {
      setIsSTTListening(true);
      sttActiveRef.current = true;
    };

    recognition.onresult = (e: any) => {
      // WaitForComplete transcript - wait until transcript parts are complete
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }

      const cleanText = finalTranscript.trim();
      // Validate speech transcription is valid and complete before launching AI request
      if (cleanText) {
        setAiInput(cleanText);
        showNotification(`Captured: "${cleanText}"`, "success");
        handleAiChatSubmit(cleanText);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error callback:", event.error);
      if (event.error === "aborted" || event.error === "not-allowed") {
        sttActiveRef.current = false;
      }
      setIsSTTListening(false);
    };

    recognition.onend = () => {
      setIsSTTListening(false);
      // Auto-restart/keep microphone ready when Coach is active & user desires dictation
      if (activeTab === "ai_helper" && sttActiveRef.current && !isAiThinking) {
        const isSpeakingAny = isSpeaking || (window.speechSynthesis && window.speechSynthesis.speaking);
        if (!isSpeakingAny) {
          try {
            recognition.start();
          } catch (e) {
            // Already active/running
          }
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      // Already running or denied
    }
  };

  const stopSTT = () => {
    sttActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsSTTListening(false);
  };

  const triggerSTT = () => {
    if (isSTTListening) {
      stopSTT();
    } else {
      sttActiveRef.current = true;
      startSTT();
    }
  };

  // Keeps microphone ready after opening AI Health Coach automatically
  useEffect(() => {
    if (activeTab === "ai_helper") {
      const waitTimer = setTimeout(() => {
        sttActiveRef.current = true;
        startSTT();
      }, 800);
      return () => clearTimeout(waitTimer);
    } else {
      stopSTT();
    }
  }, [activeTab]);

  // Pause speech recognition feedback loop while model is thinking or speaking
  useEffect(() => {
    if (activeTab === "ai_helper") {
      const isSpeakingAny = isSpeaking || (window.speechSynthesis && window.speechSynthesis.speaking);
      if (isSpeakingAny || isAiThinking) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
      } else {
        if (sttActiveRef.current) {
          const waitTimer = setTimeout(() => {
            startSTT();
          }, 350);
          return () => clearTimeout(waitTimer);
        }
      }
    }
  }, [isSpeaking, isAiThinking, activeTab]);

  const runBrowserSpeechSynthesis = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel(); // Clears any hung/suspended utterances
        window.speechSynthesis.resume(); // Solves Chrome/Safari auto-pause issues
        
        const langCode = aiLanguage === "Marathi" ? "mr-IN" : aiLanguage === "Hindi" ? "hi-IN" : "en-US";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        
        // Query fully loaded browser voices
        const allVoices = window.speechSynthesis.getVoices();
        let matchedVoice = allVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase()) ||
                           allVoices.find(v => v.lang.toLowerCase().startsWith(langCode.split("-")[0])) ||
                           allVoices.find(v => v.lang.toLowerCase().includes("india") || v.lang.toLowerCase().includes("in"));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        
        utterance.volume = 1.0; // Crank to 100% volume for high audibility
        utterance.rate = 0.95;  // Highly comprehensive, clear pacing
        utterance.pitch = 1.05; // Balanced crisp tone
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        utterance.onerror = (e) => {
          console.warn("Speech synthesis error:", e);
          setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
        
        // Anti-clipping Chrome workaround
        setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
          }
        }, 100);
      } catch (e) {
        console.error("Browser speech synthesis failed:", e);
        setIsSpeaking(false);
      }
    } else {
      setIsSpeaking(false);
      setSpeechError("Speech output unavailable");
    }
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    try {
      if (currAudioPayload) {
        currAudioPayload.pause();
      }
      setIsSpeaking(true);
      setSpeechError(null);

      // Clean the text from markdown or special symbols and resolve any encoding bugs
      const cleanText = cleanDoubleEncoding(textToSpeak).split("|")[0].trim().replace(/[*#_~]/g, "");

      // Ensure browser queue is clear and initialized
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      // Use system's own native speech synthesis
      runBrowserSpeechSynthesis(cleanText);
    } catch (err: any) {
      console.warn("TTS Synthesis failed, trying browser default:", err);
      const cleanText = textToSpeak.split("|")[0].trim().replace(/[*#_~]/g, "");
      runBrowserSpeechSynthesis(cleanText);
    }
  };

  const stopActiveSpeech = () => {
    if (currAudioPayload) {
      currAudioPayload.pause();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleAiChatSubmit = async (customMessage?: string) => {
    const queryStr = customMessage || aiInput;
    if (!queryStr.trim()) return;

    const cleanedQueryStr = cleanDoubleEncoding(queryStr);
    setAiInput("");
    setAiChatMessages((prev) => {
      const updated = [...prev, { role: "user" as const, content: cleanedQueryStr }];
      return deduplicateMessages(updated);
    });
    setIsAiThinking(true);

    // Build patient metrics analysis context to make the coach super smart
    const lastLog = healthLogs?.[0] || {};
    const profile = patientDetails || {};
    const formattedVitalsContext = `
      Patient Name: ${profile.name || user?.name || "Patient"}, Age: ${profile.age || "N/A"}, Gender: ${profile.gender || "N/A"}. 
      Address: ${profile.address || "N/A"}.
      Contact Number: ${profile.phone || user?.phone || "N/A"}.
      Chronic Medical Diseases/Conditions: ${profile.conditions || "None reported yet"}.
      Emergency Doctor Contact: ${profile.emergencyDoctor || "None reported yet"}.
      Emergency Relative Contact: ${profile.emergencyRelative || "None reported yet"}.
      Emergency Other Contact: ${profile.emergencyOther || "None reported yet"}.
      Current vitals logged: 
        - Weight: ${lastLog.weight || "N/A"}kg, 
        - BP: ${lastLog.bp || "N/A"} mmHg, 
        - Blood sugar: ${lastLog.sugar || "N/A"} mg/dL, 
        - Pulse rate: ${lastLog.pulse || "N/A"} bpm.
      Daily Medications: ${reminders.map(r => r.medicineName).filter(Boolean).join(', ') || "None reported"}.
      Missed medicines today: ${reminders.filter(r => r.status === "missed").length}.
    `;

    try {
      // Clear out duplicates from historical message queue
      const cleanedHistory = deduplicateMessages(aiChatMessages);

      // Automated client-side retry for robust error resilience (Issue 3)
      let response;
      let val;
      const maxAttempts = 2; // Initial try + 1 automatic retry
      let success = false;
      let lastErr = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: queryStr,
              language: aiLanguage,
              patientContext: formattedVitalsContext,
              history: cleanedHistory.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned error status ${response.status}`);
          }

          val = await response.json();
          success = true;
          break; // Succeeded! Break loop
        } catch (attemptErr: any) {
          lastErr = attemptErr;
          console.warn(`[AI Chat Client] Attempt ${attempt} failed: ${attemptErr.message}`);
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Sleep briefly before automated retry
          }
        }
      }

      if (!success || !val) {
        throw lastErr || new Error("All transcription processing server routes failed.");
      }

      const rawText = val.text || "I apologize, I'm experiencing some difficulty organizing advice right now.";
      const cleanedRawText = cleanDoubleEncoding(rawText);

      // Extract suggestions divided by the vertical bar '|'
      let mainText = cleanedRawText;
      let suggestionChips: string[] = [];

      if (cleanedRawText.includes("|")) {
        const parts = cleanedRawText.split("|");
        mainText = parts[0].trim();
        suggestionChips = parts[1]
          .split(";")
          .map((s: string) => cleanDoubleEncoding(s.trim()))
          .filter(Boolean);
      }

      setAiChatMessages((prev) => {
        const updated = [
          ...prev,
          { role: "model" as const, content: mainText, suggestions: suggestionChips },
        ];
        return deduplicateMessages(updated);
      });

      if (speechEnabled) {
        speakText(mainText);
      }
    } catch (err: any) {
      console.error("[AI Chat Client Error]:", err);
      showNotification("Health Coach is offline. Please check connection.", "error");

      // Only display apology when BOTH primary and backup retry attempts fully fail.
      setAiChatMessages((prev) => {
        const updated = [
          ...prev,
          {
            role: "model" as const,
            content: "I apologize, my servers are currently busy. AI suggestions are supportive guidance only and not a replacement for licensed medical professionals.",
          },
        ];
        return deduplicateMessages(updated);
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  // Language selection trigger
  const triggerLanguageSelect = (lang: "English" | "Hindi" | "Marathi") => {
    setAiLanguage(lang);
    showNotification(`Language switched to ${lang}`, "success");
    const localizedGreetings = {
      English: "Hello! I am ready to guide you.",
      Hindi: "Namaste! Main aapki sahayata ke liye taiyar hoon.",
      Marathi: "Namaskar! Mi tumhala margadarshan karanyaas tayaar aahe.",
    };
    setAiChatMessages((prev) => {
      const updated = [
        ...prev,
        { role: "model" as const, content: localizedGreetings[lang] },
      ];
      return deduplicateMessages(updated);
    });
  };


  // ==========================================
  // MODULE 2: SMART MEDICINE REMINDER SYSTEM
  // ==========================================
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [medAlarmSettings, setMedAlarmSettings] = useState(() => {
    const saved = localStorage.getItem(`med_alarm_settings_${user?.id}`);
    return saved
      ? JSON.parse(saved)
      : {
          alarmSound: true,
          alarmSoundFile: "soft medical tone",
          alarmVibration: true,
          vibrationPattern: "continuous pulse",
          highNotificationPriority: true,
        };
  });

  const [formName, setFormName] = useState("");
  const [formGeneric, setFormGeneric] = useState("");
  const [formType, setFormType] = useState<"Tablet" | "Capsule" | "Syrup" | "Injection" | "Drops" | "Ointment" | "Powder">("Tablet");
  const [formStrength, setFormStrength] = useState("");
  const [formQuantityPerDose, setFormQuantityPerDose] = useState("1");
  const [formSchedule, setFormSchedule] = useState<"Once Daily" | "Twice Daily" | "Thrice Daily" | "Four Times Daily" | "Weekly" | "Custom">("Once Daily");
  const [formMealTime, setFormMealTime] = useState<"after" | "before" | "with" | "empty">("after");
  const [formTimings, setFormTimings] = useState<string[]>(["08:00"]);
  const [formStartDate, setFormStartDate] = useState(getISTDateString());
  const [formDurationDays, setFormDurationDays] = useState("7");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStock, setFormStock] = useState("30");
  const [formRefillThreshold, setFormRefillThreshold] = useState("5");
  const [formNotes, setFormNotes] = useState("");
  const [formAudioLang, setFormAudioLang] = useState<"english" | "hindi" | "marathi">("english");

  useEffect(() => {
    if (formStartDate && formDurationDays) {
      const start = new Date(formStartDate);
      const days = parseInt(formDurationDays, 10);
      if (!isNaN(days) && days > 0) {
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);
        setFormEndDate(end.toISOString().split("T")[0]);
      }
    }
  }, [formStartDate, formDurationDays]);

  // Save medication reminders to Firebase
  const resetForm = () => {
    setFormName("");
    setFormGeneric("");
    setFormType("Tablet");
    setFormStrength("");
    setFormQuantityPerDose("1");
    setFormSchedule("Once Daily");
    setFormTimings(["08:00"]);
    setFormMealTime("after");
    setFormStartDate(getISTDateString());
    setFormDurationDays("7");
    setFormStock("30");
    setFormRefillThreshold("5");
    setFormNotes("");
    setFormAudioLang("english");
  };

  const handleScheduleChange = (val: any) => {
    setFormSchedule(val);
    if (val === "Once Daily") {
      setFormTimings(["08:00"]);
    } else if (val === "Twice Daily") {
      setFormTimings(["08:00", "20:00"]);
    } else if (val === "Thrice Daily") {
      setFormTimings(["08:00", "14:00", "20:00"]);
    } else if (val === "Four Times Daily") {
      setFormTimings(["08:00", "12:00", "16:00", "20:00"]);
    } else if (val === "Weekly") {
      setFormTimings(["09:00"]);
    }
  };

  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification("Please specify the medicine name", "error");
      return;
    }

    try {
      const payload: any = {
        userId: user.id,
        userName: user.name || "Patient",
        medicineName: formName,
        genericName: formGeneric,
        type: formType,
        form: formType.toLowerCase(),
        dosage: formStrength ? `${formQuantityPerDose} ${formType} (${formStrength})` : `${formQuantityPerDose} ${formType}`,
        timings: formTimings,
        mealTime: formMealTime,
        repeatSchedule: formSchedule,
        startDate: formStartDate,
        endDate: formEndDate,
        stockQuantity: parseInt(formStock, 10) || 50,
        refillThreshold: parseInt(formRefillThreshold, 10) || 5,
        alarmTone: "soft medical tone",
        notes: formNotes,
        audioLang: formAudioLang,
        language: formAudioLang === "marathi" ? "Marathi" : formAudioLang === "hindi" ? "Hindi" : "English",
        color: "#3B82F6",
        symbol: "pill",
        status: "active",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "medicine_reminders"), payload);
      showNotification(`"${formName}" scheduled dynamically!`, "success");

      resetForm();
      setShowReminderModal(false);
    } catch (err: any) {
      console.error(err);
      showNotification("Could not schedule medication", "error");
    }
  };

  const deleteMedReminder = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, "medicine_reminders", id), { status: "deleted" });
      showNotification(`Deleted reminder for "${name}"`, "info");
    } catch (err) {
      showNotification("Could not delete reminder.", "error");
    }
  };

  // Fullscreen alarms state matching trigger interval loop
  const [activeAlarm, setActiveAlarm] = useState<{
    show: boolean;
    reminder: any;
    timing: string;
  } | null>(null);

  const [simulatedVibeAct, setSimulatedVibeAct] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const runningAlarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const handledAlarmsRef = useRef<Record<string, boolean>>({});
  const wakeLockRef = useRef<any>(null);

  // Support Screen Wake Lock API to prevent screen-off suspension
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log("[PatientPanel] Screen Wake Lock acquired successfully.");
        }
      } catch (err) {
        console.warn("[PatientPanel] Wake Lock failed:", err);
      }
    }
    
    requestWakeLock();
    
    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        }).catch((e: any) => console.log(e));
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Global user interaction unblocker for browser AudioContext and SpeechSynthesis
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass && !audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        
        // Globally unlock speech synthesis for automated background alarms
        if ("speechSynthesis" in window) {
           const unlockUtterance = new SpeechSynthesisUtterance("");
           unlockUtterance.volume = 0;
           window.speechSynthesis.speak(unlockUtterance);
        }
      } catch (err) {
        console.warn("Could not auto-initialize Web Audio Context:", err);
      }
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // Safe sound player supporting both synthesized Web Audio and media links
  const startAlarmSound = (tone: string) => {
    // 1. Play synthesized tone loop
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass && !audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      if (ctx) {
        // Clear any existing active synthesizer loop
        if (synthIntervalRef.current) {
          clearInterval(synthIntervalRef.current);
        }

        const playBeep = () => {
          try {
            if (ctx.state === "suspended") {
              ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            const toneLower = String(tone || "soft medical tone").toLowerCase();

            if (toneLower.includes("emergency") || toneLower.includes("assertive")) {
              // Rapid high-frequency laser sweep siren (3000Hz up to 4000Hz)
              osc.type = "sawtooth";
              osc.frequency.setValueAtTime(3000, now);
              osc.frequency.exponentialRampToValueAtTime(4200, now + 0.12);
              gain.gain.setValueAtTime(0.24, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
              osc.start(now);
              osc.stop(now + 0.22);

              // Add secondary sharp harmonic oscillator
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = "square";
              osc2.frequency.setValueAtTime(5000, now);
              osc2.frequency.exponentialRampToValueAtTime(6500, now + 0.12);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(0.12, now);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
              osc2.start(now);
              osc2.stop(now + 0.22);
            } else if (toneLower.includes("bell") || toneLower.includes("chime")) {
              // Piercing high-pitch rapid digital watch ring pattern (3400Hz square waves)
              osc.type = "square";
              osc.frequency.setValueAtTime(3400, now);
              gain.gain.setValueAtTime(0.24, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
              osc.start(now);
              osc.stop(now + 0.35);

              // Second dissonant tone at 3450Hz for active acoustic beating
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = "sawtooth";
              osc2.frequency.setValueAtTime(3455, now);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(0.18, now);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
              osc2.start(now);
              osc2.stop(now + 0.32);
            } else if (toneLower.includes("harp") || toneLower.includes("gentle")) {
              // Soft warm sine sweeps (Harp acoustic wave emulation)
              osc.type = "sine";
              osc.frequency.setValueAtTime(440, now);
              osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
              gain.gain.setValueAtTime(0.25, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
              osc.start(now);
              osc.stop(now + 0.4);

              // Harmonic notes
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = "sine";
              osc2.frequency.setValueAtTime(659.25, now); // E5 note
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(0.12, now);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
              osc2.start(now);
              osc2.stop(now + 0.35);
            } else {
              // High Frequency Sharp Patient Beeps (classic triple high-pitched ICU chirp)
              osc.type = "square"; // switched to square wave for extra sharpness
              osc.frequency.setValueAtTime(2950, now);
              gain.gain.setValueAtTime(0.25, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
              osc.start(now);
              osc.stop(now + 0.1);

              // Second rapid chime
              setTimeout(() => {
                try {
                  if (ctx.state === "suspended") return;
                  const o2 = ctx.createOscillator();
                  const g2 = ctx.createGain();
                  o2.connect(g2);
                  g2.connect(ctx.destination);
                  o2.type = "square";
                  o2.frequency.setValueAtTime(2950, ctx.currentTime);
                  g2.gain.setValueAtTime(0.25, ctx.currentTime);
                  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                  o2.start(ctx.currentTime);
                  o2.stop(ctx.currentTime + 0.1);
                } catch (subErr) {
                  console.warn(subErr);
                }
              }, 110);

              // Third rapid chime for a complete sharp triple beep sequence
              setTimeout(() => {
                try {
                  if (ctx.state === "suspended") return;
                  const o3 = ctx.createOscillator();
                  const g3 = ctx.createGain();
                  o3.connect(g3);
                  g3.connect(ctx.destination);
                  o3.type = "square";
                  o3.frequency.setValueAtTime(2950, ctx.currentTime);
                  g3.gain.setValueAtTime(0.25, ctx.currentTime);
                  g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
                  o3.start(ctx.currentTime);
                  o3.stop(ctx.currentTime + 0.11);
                } catch (subErr) {
                  console.warn(subErr);
                }
              }, 220);
            }
          } catch (err) {
            console.error("[Web Audio Beep Wave Error]:", err);
          }
        };

        // Trigger beep rate
        const toneLower = String(tone || "soft medical tone").toLowerCase();
        const rate = toneLower.includes("emergency") ? 450 : (toneLower.includes("bell") ? 1300 : 1000);
        playBeep();
        synthIntervalRef.current = setInterval(playBeep, rate);
      }
    } catch (ex) {
      console.error("[Alarm Synthesizer Exception]:", ex);
    }

    // 2. Play secondary/backup HTML5 Audio channel
    try {
      const soundUrl = ALARM_SOUNDS_MAP[tone] || ALARM_SOUNDS_MAP["soft medical tone"];
      if (soundUrl) {
        if (runningAlarmSoundRef.current) {
          try {
            runningAlarmSoundRef.current.pause();
          } catch (_) {}
        }
        const audio = new Audio(soundUrl);
        audio.loop = true;
        audio.volume = 0.8;
        audio.play().catch((playErr) => {
          console.warn("HTML5 audio playback blocked by browser/sandboxing autoplay rules, fell back to Web Audio API: ", playErr.message);
        });
        runningAlarmSoundRef.current = audio;
      }
    } catch (audioEx) {
      console.error("[HTML5 standard audio failed to load/play]:", audioEx);
    }
  };

  const stopAlarmSound = () => {
    // 1. Pause HTML5 audio safely
    if (runningAlarmSoundRef.current) {
      try {
        runningAlarmSoundRef.current.pause();
        runningAlarmSoundRef.current.currentTime = 0;
        runningAlarmSoundRef.current.removeAttribute('src');
      } catch (err) {}
      runningAlarmSoundRef.current = null;
    }

    // 2. Clear synth loop
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Safe sound stop on component unmount
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  const startFullscreenAlarm = (rem: any, timeStr: string) => {
    setActiveAlarm({ show: true, reminder: rem, timing: timeStr });
    
    // Play sound safely using the secure audio pipeline
    startAlarmSound(rem.alarmTone || "soft medical tone");

    // Trigger the precise voice message based on selected language and time of day
    setTimeout(() => {
      const hour = new Date().getHours();
      let greetingEn = "Good morning";
      let greetingHi = "शुभ प्रभात";
      let greetingMr = "शुभ प्रभात";
      
      if (hour >= 12 && hour < 17) {
        greetingEn = "Good afternoon";
        greetingHi = "शुभ दोपहर";
        greetingMr = "शुभ दुपार";
      } else if (hour >= 17) {
        greetingEn = "Good evening";
        greetingHi = "शुभ संध्या";
        greetingMr = "शुभ संध्या";
      }

      const pName = rem.userName || "Patient";
      const mName = rem.medicineName || "Medicine";

      let voiceMsg = `${greetingEn} ${pName}, your ${mName} time is up, please take your medicine.`;
      let langCode = "en-US";
      
      const langLower = String(rem.audioLang || rem.language || "english").toLowerCase();
      if (langLower.includes("marathi") || langLower.includes("mr")) {
        voiceMsg = `${greetingMr} ${pName} जी, तुमच्या ${mName} ची वेळ झाली आहे, औषध घ्या.`;
        langCode = "mr-IN";
      } else if (langLower.includes("hindi") || langLower.includes("hi")) {
        voiceMsg = `${greetingHi} ${pName} जी, आपके ${mName} का टाइम हो गया है, दवाई लीजिये।`;
        langCode = "hi-IN";
      }

      // Direct fallback-free native TTS call for max reliability during alarms
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
          const utterance = new SpeechSynthesisUtterance(voiceMsg);
          utterance.lang = langCode;
          utterance.volume = 1.0;
          utterance.rate = 0.9;
          
          const allVoices = window.speechSynthesis.getVoices();
          let matchedVoice = allVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase()) ||
                             allVoices.find(v => v.lang.toLowerCase().startsWith(langCode.split("-")[0]));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error("Direct Speech error:", e);
        }
      } else {
         speakText(voiceMsg);
      }
    }, 1000);

    // Simulate vibration pattern with visual flashes
    if (medAlarmSettings.alarmVibration && "vibrate" in navigator) {
      navigator.vibrate(VIBRATION_PATTERNS[medAlarmSettings.vibrationPattern] || [500, 200, 500]);
    }
    setSimulatedVibeAct(true);

    // PERSISTENT LOCK-SCREEN SYSTEM NOTIFICATION & VIBRATION FOR MEDICATIONS
    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(`Medication Alert: Take ${rem.medicineName}`, {
          body: `Time: ${timeStr} | Dosage: ${rem.dosage || "1 Unit"} (${rem.mealTime || "anytime"}). Note: ${rem.notes || ""}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `medicine-reminder-${rem.id}`,
          requireInteraction: true,
          vibrate: [500, 110, 500, 110, 450],
          actions: [
            { action: "take", title: "Mark Taken" },
            { action: "dismiss", title: "Dismiss Alarm" }
          ]
        } as any);
      });
    }
  };

  const closeActiveAlarm = (action: "taken" | "missed" | "snooze") => {
    stopAlarmSound();
    setSimulatedVibeAct(false);

    if (activeAlarm) {
      const handledKey = `${activeAlarm.reminder.id}_${getISTDateString()}_${activeAlarm.timing}`;
      if (action !== "snooze") {
        handledAlarmsRef.current[handledKey] = true;
      }
      logMedicineConsumption(activeAlarm.reminder, action);
    }
    setActiveAlarm(null);
  };

  // Logging Taken/Missed history logs securely
  const logMedicineConsumption = async (rem: any, outcome: "taken" | "missed" | "snooze", explicitTime?: string) => {
    try {
      const today = getISTDateString();
      const timeStr = explicitTime || activeAlarm?.timing || formatISTTime(new Date().toISOString());

      await addDoc(collection(db, "medicine_logs"), {
        userId: user.id,
        medicineName: rem.medicineName,
        dosage: rem.dosage,
        timing: timeStr,
        date: today,
        status: outcome,
        loggedAt: serverTimestamp(),
      });

      if (outcome === "taken") {
        showNotification(`Excellent! Marked "${rem.medicineName}" as Taken.`, "success");
      } else if (outcome === "snooze") {
        showNotification(`Snoozed alarm for 5 minutes.`, "info");
        setTimeout(() => {
          startFullscreenAlarm(rem, timeStr);
        }, 5 * 60 * 1000);
      } else {
        showNotification(`Medicine marked as missed. Attention needed!`, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Daily Personal Reminder Handlers
  const startFullscreenDailyAlarm = (rem: any, timeStr: string) => {
    setActiveDailyAlarm({ show: true, reminder: rem, timing: timeStr });
    startAlarmSound(rem.sound || "standard");

    if (medAlarmSettings.alarmVibration && "vibrate" in navigator) {
      navigator.vibrate([400, 200, 400]);
    }

    showNotification(`Reminder Alarm: ${rem.title}`, "info");

    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(`CareBridge Reminder: ${rem.title}`, {
          body: rem.description || "Time for your scheduled reminder.",
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `daily-reminder-${rem.id}`,
          requireInteraction: true,
          actions: [
            { action: "done", title: "Mark Done" },
            { action: "dismiss", title: "Dismiss" }
          ]
        } as any);
      });
    }
  };

  const closeActiveDailyAlarm = (action: "done" | "dismiss") => {
    stopAlarmSound();
    if (activeDailyAlarm) {
      const handledKey = `daily_${activeDailyAlarm.reminder.id}_${getISTDateString()}_${activeDailyAlarm.timing}`;
      handledAlarmsRef.current[handledKey] = true;

      if (action === "done") {
        markDailyReminderStatus(activeDailyAlarm.reminder.id, "completed");
      } else {
        showNotification("Reminder alert dismissed.", "info");
      }
    }
    setActiveDailyAlarm(null);
  };

  const markDailyReminderStatus = (id: string, newStatus: 'completed' | 'missed' | 'pending') => {
    setDailyReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            completedAt: newStatus === "completed" ? new Date().toISOString() : null,
          };
        }
        return r;
      })
    );
    showNotification(`Reminder updated to ${newStatus}.`, "success");
  };

  // Comprehensive Alarm Check routine for Medicines & Daily Reminders
  const runAlarmCheck = () => {
    const d = new Date();
    const currH = d.getHours().toString().padStart(2, "0");
    const currM = d.getMinutes().toString().padStart(2, "0");
    const checkedTime = `${currH}:${currM}`;
    const today = getISTDateString();

    // 1. Medicine Checking
    const activeList = reminders.filter((r) => r.status === "active");
    activeList.forEach((rem) => {
      if (today >= rem.startDate && today <= rem.endDate) {
        const matchedTiming = rem.timings?.find((t: string) => t === checkedTime);
        if (matchedTiming) {
          const alreadyLogged = healthLogs.some(
            (l) => l.medicineName === rem.medicineName && l.timing === checkedTime && l.date === today
          );
          const handledKey = `${rem.id}_${today}_${checkedTime}`;
          if (!alreadyLogged && !handledAlarmsRef.current[handledKey] && (!activeAlarm || activeAlarm.reminder.id !== rem.id)) {
            startFullscreenAlarm(rem, checkedTime);
          }
        }
      }
    });

    // 2. Daily Reminders checking
    dailyReminders.forEach((rem) => {
      if (rem.status === "pending") {
        let isTodayMatch = rem.date === today;
        if (!isTodayMatch && rem.repeat) {
          if (rem.repeat === "daily") {
            isTodayMatch = true;
          } else if (rem.repeat === "weekly") {
            const remD = new Date(rem.date);
            isTodayMatch = remD.getDay() === d.getDay();
          } else if (rem.repeat === "monthly") {
            const remD = new Date(rem.date);
            isTodayMatch = remD.getDate() === d.getDate();
          }
        }

        if (isTodayMatch && rem.time === checkedTime) {
          const handledKey = `daily_${rem.id}_${today}_${checkedTime}`;
          if (!handledAlarmsRef.current[handledKey] && (!activeDailyAlarm || activeDailyAlarm.reminder.id !== rem.id)) {
            startFullscreenDailyAlarm(rem, checkedTime);
          }
        }
      }
    });
  };

  // Background Web Worker and redundant tab scheduler loop
  useEffect(() => {
    let worker: Worker | null = null;
    try {
      const code = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(() => {
              postMessage('tick');
            }, 8000);
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([code], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = (event) => {
        if (event.data === 'tick') {
          runAlarmCheck();
        }
      };
      worker.postMessage('start');
    } catch (e) {
      console.warn("Background Web Worker scheduler could not be started, falls back:", e);
    }

    // Redundant main-thread backup timer
    const alarmTimeTriggerLoop = setInterval(() => {
      runAlarmCheck();
    }, 12000);

    // Register simple Service Worker notification action receiver
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ALARM_ACTION") {
        const { action, tag } = event.data;
        if (tag && tag.startsWith("daily-reminder-")) {
          const reminderId = tag.replace("daily-reminder-", "");
          if (action === "done") {
            markDailyReminderStatus(reminderId, "completed");
          } else {
            showNotification("Reminder dismissed from interface", "info");
          }
        } else if (tag && tag.startsWith("medicine-reminder-")) {
          const reminderId = tag.replace("medicine-reminder-", "");
          const rem = reminders.find((r) => r.id === reminderId);
          if (rem) {
            if (action === "take" || action === "taken") {
              const currentH = new Date().getHours().toString().padStart(2, "0");
              const currentM = new Date().getMinutes().toString().padStart(2, "0");
              const currentTime = `${currentH}:${currentM}`;
              const handledKey = `${rem.id}_${getISTDateString()}_${currentTime}`;
              handledAlarmsRef.current[handledKey] = true;
              logMedicineConsumption(rem, "taken", currentTime);
              stopAlarmSound();
              setActiveAlarm(null);
            } else {
              showNotification("Medication alarm dismissed", "info");
              stopAlarmSound();
              setActiveAlarm(null);
            }
          }
        }
      }
    };
    navigator.serviceWorker?.addEventListener?.("message", handleSWMessage);

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
      clearInterval(alarmTimeTriggerLoop);
      navigator.serviceWorker?.removeEventListener?.("message", handleSWMessage);
    };
  }, [reminders, dailyReminders, activeAlarm, activeDailyAlarm, healthLogs]);

  const handleDailyReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyReminderForm.title.trim()) {
      showNotification("Please specify a title", "error");
      return;
    }

    if (editingDailyReminderId) {
      setDailyReminders((prev) =>
        prev.map((r) =>
          r.id === editingDailyReminderId ? { ...r, ...dailyReminderForm } : r
        )
      );
      showNotification("Reminder edited successfully.", "success");
    } else {
      const newRem = {
        id: Math.random().toString(36).substring(2, 9),
        title: dailyReminderForm.title,
        description: dailyReminderForm.description,
        date: dailyReminderForm.date || getISTDateString(),
        time: dailyReminderForm.time || "08:00",
        type: dailyReminderForm.type || "medicine",
        repeat: dailyReminderForm.repeat || "daily",
        sound: dailyReminderForm.sound || "standard",
        priority: dailyReminderForm.priority || "high",
        status: "pending",
      };
      setDailyReminders((prev) => [...prev, newRem]);
      showNotification("Reminder alert added successfully.", "success");
    }

    setShowDailyReminderModal(false);
    setEditingDailyReminderId(null);
  };

  // Aggregate Medicine Adherence metric
  const medicineAdherenceRate = useMemo(() => {
    // Read total logs count
    const matches = healthLogs.filter((log) => log.medicineName);
    if (!matches.length) return 85; // healthy industry baseline default
    const countTaken = matches.filter((l) => l.status === "taken").length;
    return Math.round((countTaken / matches.length) * 100);
  }, [healthLogs]);


  // ==========================================
  // MODULE 3: HEALTH ANALYST REPORT ENGINE
  // ==========================================
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    bp_systolic: "120",
    bp_diastolic: "80",
    sugar: "110",
    pulse: "72",
    oxygen: "98",
    weight: "70",
    temperature: "98.6",
    sleepHours: "7.5",
    waterLogMl: "2000",
  });

  const handleLogVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = getISTDateString();
      const combinedBp = `${logForm.bp_systolic}/${logForm.bp_diastolic}`;

      await addDoc(collection(db, "health_logs"), {
        userId: user.id,
        date: today,
        bp: combinedBp,
        sugar: logForm.sugar,
        pulse: logForm.pulse,
        oxygen: logForm.oxygen,
        weight: logForm.weight,
        temperature: logForm.temperature,
        sleepHours: logForm.sleepHours,
        waterLogMl: logForm.waterLogMl,
        createdAt: serverTimestamp(),
      });

      showNotification("Health logs updated successfully!", "success");
      setShowLogModal(false);
    } catch (err) {
      showNotification("Failed to log clinical statistics.", "error");
    }
  };

  // Warning metrics alerts
  const vitalsWarnings = useMemo(() => {
    const alerts: string[] = [];
    const latest = healthLogs?.[0];
    if (!latest) return alerts;

    if (latest.bp) {
      const sys = parseInt(latest.bp.split("/")[0] || "0");
      const dia = parseInt(latest.bp.split("/")[1] || "0");
      if (sys > 135 || dia > 88) {
        alerts.push(`Hypertension alert: BP is Elevated (${latest.bp} mmHg)`);
      } else if (sys < 90) {
        alerts.push(`Low BP Alert: BP is low (${latest.bp} mmHg)`);
      }
    }

    if (latest.sugar && parseInt(latest.sugar) > 145) {
      alerts.push(`Hyperglycemia check: Blood sugar is High (${latest.sugar} mg/dL)`);
    } else if (latest.sugar && parseInt(latest.sugar) < 70) {
      alerts.push(`Hypoglycemia risk: Blood sugar is low (${latest.sugar} mg/dL)`);
    }

    if (latest.oxygen && parseInt(latest.oxygen) < 95) {
      alerts.push(`Critical Hypoxia Indicator: Oxygen levels are low (${latest.oxygen}%)`);
    }

    return alerts;
  }, [healthLogs]);

  // AI-Powered Diagnostics Analyst compiler
  const [isCompilingAnalysis, setIsCompilingAnalysis] = useState(false);
  const [compiledReportText, setCompiledReportText] = useState<string | null>(null);

  const generateAIVitalsAnalysis = async () => {
    setIsCompilingAnalysis(true);
    setCompiledReportText(null);
    try {
      const logsToAnalyze = healthLogs.slice(0, 10);
      const logPayloadString = logsToAnalyze
        .map((l) => `Date: ${l.date}, BP: ${l.bp || "N/A"}, Sugar: ${l.sugar || "N/A"}mg/dL, Oxygen: ${l.oxygen || "N/A"}%, Sleep: ${l.sleepHours || "N/A"}h`)
        .join("\n");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Perform an expert clinical diagnostics analysis on the following raw physiological patient records and assemble a highly polished medical report with lifestyle correctives for CareBridge Plus:\n\n${logPayloadString}`,
          language: aiLanguage,
        }),
      });

      const data = await response.json();
      const output = data.text || "Your vitals are steady. Consult healthcare providers for therapeutic advice.";
      setCompiledReportText(output.split("|")[0]);
      showNotification("Clinical report compiled successfully!", "success");
    } catch (e) {
      showNotification("Failed to consult virtual diagnostics system.", "error");
    } finally {
      setIsCompilingAnalysis(false);
    }
  };


  // ==========================================
  // MODULE 4: HABIT TRACKER & GAMIFICATION
  // ==========================================
  const defaultHabitList = [
    { key: "water", name: "Drink 2.5L Water", goal: "2500ml", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { key: "walking", name: "30-min Outdoor Walk", goal: "3k Steps", icon: Footprints, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
    { key: "yoga", name: "Pranayama / Yoga Practice", goal: "15 min", icon: Leaf, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/20" },
    { key: "sleep", name: "Optimal Restful Sleep", goal: "7.5 hrs", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { key: "meditation", name: "Vipassana Meditation", goal: "10 mins", icon: Brain, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
    { key: "consistency", name: "On-time Medicine Intake", goal: "All Doses", icon: Pill, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
  ];

  const loggedHabitsToday = useMemo(() => {
    const today = getISTDateString();
    const map: Record<string, boolean> = {};
    habitLogs
      .filter((l) => l.date === today)
      .forEach((log) => {
        if (log.habitKey) map[log.habitKey] = true;
      });
    return map;
  }, [habitLogs]);

  const toggleHabitState = async (habitKey: string) => {
    const today = getISTDateString();
    const alreadyLogged = habitLogs.find((l) => l.date === today && l.habitKey === habitKey);

    try {
      if (alreadyLogged) {
        // Mock remove by modifying database state or deleting
        await updateDoc(doc(db, "habit_logs", alreadyLogged.id), { status: "unlogged" });
      } else {
        await addDoc(collection(db, "habit_logs"), {
          userId: user.id,
          habitKey,
          date: today,
          status: "logged",
          createdAt: serverTimestamp(),
        });
        showNotification("Habit logged! Keep up the great streak!", "success");
      }
    } catch (e) {
      showNotification("Could not record habit session.", "error");
    }
  };

  // Streak computations (gamification)
  const activeHabitStreak = useMemo(() => {
    // Basic streak calculator from log dates count
    const uniqueDates = Array.from(new Set(habitLogs.map((h) => h.date))).sort().reverse();
    if (!uniqueDates.length) return 2; // base level standard setup helper
    let streak = 0;
    let expected = getISTDateString();

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === expected) {
        streak++;
        const prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - streak);
        expected = prevDate.toISOString().slice(0, 10);
      } else {
        break;
      }
    }
    return Math.max(streak, 1);
  }, [habitLogs]);


  // ==========================================
  // MODULE 5: VOICE NOTE + SMART RECALL SYSTEM
  // ==========================================
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);
  const [memoWaveform, setMemoWaveform] = useState<number[]>([]);
  const [memoDuration, setMemoDuration] = useState(0);
  const [recordedMemos, setRecordedMemos] = useState<{ id: string; text: string; date: string; time: string; extractedData?: any }[]>(() => {
    const saved = localStorage.getItem(`voice_memos_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const waveTimerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(`voice_memos_${user?.id}`, JSON.stringify(recordedMemos));
  }, [recordedMemos]);

  const startVoiceMemoRecording = () => {
    setIsRecordingMemo(true);
    setMemoDuration(0);
    setMemoWaveform([20, 30, 15, 45]);

    waveTimerRef.current = setInterval(() => {
      setMemoDuration((prev) => prev + 1);
      // Generate pulsating visual waveforms randomly
      setMemoWaveform((prev) => {
        const next = [...prev, Math.floor(Math.random() * 80) + 15];
        if (next.length > 25) next.shift();
        return next;
      });
    }, 1000);
  };

  const stopVoiceMemoAndAnalyze = async () => {
    setIsRecordingMemo(false);
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
    }

    showNotification("Analyzing and extracting schedule items...", "info");

    const dictationPhrases = [
      "Remind me to check blood sugar tomorrow at 11:00 AM",
      "Schedule Dr. Patil checkup for next Thursday",
      "Take Paracetamol tablet after food tonight at 09:00 PM",
    ];
    const transcriptText = dictationPhrases[Math.floor(Math.random() * dictationPhrases.length)];

    let parsedActionLabel = "General Memo";
    let extractedDetails = "";

    // Simulated parsing of schedule cues from audio transcripts
    if (transcriptText.toLowerCase().includes("sugar") || transcriptText.toLowerCase().includes("blood")) {
      parsedActionLabel = "Blood Sugar Tracker Auto-Recall";
      extractedDetails = "Configured: Remind sugar test daily at 11:00 AM";
    } else if (transcriptText.toLowerCase().includes("doctor") || transcriptText.toLowerCase().includes("patil")) {
      parsedActionLabel = "Dr. Patil Appointment Recall";
      extractedDetails = "Auto-filled calendar note for next clinical appointment!";
    } else {
      parsedActionLabel = "Medicine Intake Auto-Recall";
      extractedDetails = "Configured: Schedule Paracetamol dose reminder tonight";
    }

    const newMemo = {
      id: `memo_${Date.now()}`,
      text: transcriptText,
      date: getISTDateString(),
      time: formatISTTime(new Date().toISOString()),
      extractedData: {
        action: parsedActionLabel,
        details: extractedDetails,
      },
    };

    setRecordedMemos((prev) => [newMemo, ...prev]);
    showNotification("Recall alert parsed and logged successfully!", "success");
  };


  // ==========================================
  // MODULE 6: COMPREHENSIVE AI SUPERVISOR PANELS
  // ==========================================
  const supervisorIntegrityAdvisory = useMemo(() => {
    // Analyzes current patient statistics and compiles real-time safety briefs
    const anomalies: { issue: string; advice: string } = { issue: "", advice: "" };
    
    const latestHealth = healthLogs?.[0];
    const missedMeds = reminders.filter((m) => m.status === "missed").length;

    if (latestHealth) {
      const bpRaw = latestHealth.bp || "";
      const sys = parseInt(bpRaw.split("/")[0] || "120");
      if (sys > 135) {
        return {
          header: "CRITICAL SYSTOLIC SPIKE DETECTED",
          message: `Your last logged blood pressure of ${bpRaw} exceeds ideal ranges. CareBridge Plus recommends low sodium, increased hydration, and resting in a quiet area.`,
          severity: "high",
        };
      }
    }

    if (missedMeds > 0) {
      return {
        header: "MEDICATION ADHERENCE WARNING",
        message: `You missed ${missedMeds} planned doses this week. Establish a routine or consult Dr. Patil if you experience discomfort or medication side effects.`,
        severity: "medium",
      };
    }

    return {
      header: "HOURLY HEALTH STATUS: OPTIMAL",
      message: "Continuous biosystems analytics indicate normal physiological bounds. Streak systems are robust. Take regular walks of 20 minutes to improve cardiovascular circulation.",
      severity: "low",
    };
  }, [healthLogs, reminders]);


  // ==========================================
  // FIREBASE INITIALIZATION & DB BINDINGS
  // ==========================================
  const fetchOnDemandDataRef = useRef<() => Promise<void>>(async () => {});
  const fetchOnDemandData = async () => {
    if (!user?.id) return;
    try {
      console.log("[PatientPanel] Fetching clinical and clinic lists on-demand...");
      const clinicFilters = [
        { field: "role", operator: "==", value: "clinic" },
        { field: "status", operator: "==", value: "active" }
      ];
      
      const [
        clinicsData,
        clinicDetailsData,
      ] = await Promise.all([
        firebaseService.getCollection("users", clinicFilters),
        firebaseService.getCollection("clinic_details"),
      ]);

      if (clinicsData) {
        setClinics(clinicsData);
      }
      
      if (clinicDetailsData) {
        const detailsMap = clinicDetailsData.reduce((acc: any, d: any) => {
          acc[d.userId] = d;
          return acc;
        }, {});
        setClinicDetails(detailsMap);
      }
    } catch (err) {
      console.error("[PatientPanel] Error fetching on-demand data:", err);
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

    // Prompt for notification permission on dashboard load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("[PatientPanel] System Notification Permission Requested:", perm);
      });
    }

    // 1. Listen to Appointments
    const unsubAppointments = firebaseService.subscribeToCollection(
      "appointments",
      (data) => setAppointments(data),
      [{ field: "patientId", operator: "==", value: user.id }]
    );

    // 2. Listen to Notifications
    const unsubNotifications = firebaseService.subscribeToCollection(
      "notifications",
      (data) => {
        const sorted = [...data].sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setNotifications(sorted);
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    // 3. Listen to messages with focused patient-participants filter
    const unsubMessages = firebaseService.subscribeToCollection(
      "messages",
      (data) => {
        setMessages(data);
        setUnreadCount(data.filter((m: any) => m.receiverId === user.id && !m.isRead).length);
      },
      [{ field: "participants", operator: "array-contains", value: String(user.id) }]
    );

    // Real-time patient details sync
    const unsubPatientDetails = firebaseService.subscribeToCollection(
      "patient_details",
      (data) => {
        if (data && data.length > 0) {
          setPatientDetails(data[0]);
        } else {
          setPatientDetails(null);
        }
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    // Real-time medicine reminders sync
    const unsubReminders = firebaseService.subscribeToCollection(
      "medicine_reminders",
      (data) => {
        setReminders(data);
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    // Real-time medical reports sync
    const unsubMedicalReports = firebaseService.subscribeToCollection(
      "medical_reports",
      (data) => {
        setMedicalReports(data);
      },
      [{ field: "patientId", operator: "==", value: user.id }]
    );

    // Real-time emergency contacts sync
    const unsubEmergencyContacts = firebaseService.subscribeToCollection(
      "emergency_contacts",
      (data) => {
        setEmergencyContacts(data);
      },
      [{ field: "patientId", operator: "==", value: user.id }]
    );

    // Real-time habit logs sync
    const unsubHabitLogs = firebaseService.subscribeToCollection(
      "habit_logs",
      (data) => {
        setHabitLogs(data);
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    // Real-time health logs and medicine logs merge
    let healthDataList: any[] = [];
    let medDataList: any[] = [];
    const mergeLogs = () => {
      const combined = [...healthDataList, ...medDataList].sort((a: any, b: any) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        return dateB.localeCompare(dateA);
      });
      setHealthLogs(combined);
    };

    const unsubHealthLogs = firebaseService.subscribeToCollection(
      "health_logs",
      (data) => {
        healthDataList = data;
        mergeLogs();
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    const unsubMedicineLogs = firebaseService.subscribeToCollection(
      "medicine_logs",
      (data) => {
        medDataList = data;
        mergeLogs();
      },
      [{ field: "userId", operator: "==", value: user.id }]
    );

    // Initial fetch of static collections on load
    fetchOnDemandData();

    return () => {
      unsubAppointments();
      unsubNotifications();
      unsubMessages();
      unsubPatientDetails();
      unsubReminders();
      unsubMedicalReports();
      unsubEmergencyContacts();
      unsubHabitLogs();
      unsubHealthLogs();
      unsubMedicineLogs();
    };
  }, [user]);


  // ==========================================
  // APPOINTMENTS SUBMISSION Flow
  // ==========================================
  const handleBookAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;

    if (!bookingForm.patientName.trim()) {
      showNotification("Please enter patient name", "info");
      return;
    }

    try {
      const combinedTime = `${bookingForm.preferredTime} ${bookingForm.preferredAmPm}`;
      const bookingData = {
        patientId: user.id,
        patientName: bookingForm.patientName,
        patientAge: bookingForm.patientAge,
        patientPhone: bookingForm.patientPhone,
        patientGender: bookingForm.patientGender,
        patientAddress: bookingForm.patientAddress,
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.name,
        appointmentDate: bookingForm.preferredDate,
        appointmentTime: combinedTime,
        status: "pending",
      };

      const appointmentRef = await addDoc(collection(db, "appointments"), {
        ...bookingData,
        createdAt: serverTimestamp(),
      });

      // Insert to OPD queue for live monitoring on the clinic panel
      await addDoc(collection(db, "opd_queue"), {
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.name,
        patientName: bookingForm.patientName,
        patientAge: bookingForm.patientAge || "",
        patientPhone: bookingForm.patientPhone,
        patientGender: bookingForm.patientGender || "M",
        patientArea: bookingForm.patientAddress || "",
        status: "requested",
        token: 0,
        date: bookingForm.preferredDate,
        createdAt: serverTimestamp(),
        type: "online",
        appointmentId: appointmentRef.id,
      });

      showNotification("Appointment request dispatched to clinic!", "success");
      setShowBookingModal(false);
    } catch (err) {
      showNotification("Failed to schedule appointment.", "error");
    }
  };

  const handleLogVitalsToggle = () => {
    setShowLogModal(true);
  };


  // ==========================================
  // RENDERING COMPONENT PIECES
  // ==========================================
  return (
    <>
      {/* Dynamic Screen Flash Alert indicating Simulated Vibration */}
      {simulatedVibeAct && (
        <div className="fixed inset-0 pointer-events-none bg-rose-500/15 animate-ping z-[1001]" />
      )}

      {/* Top Banner Custom Notification System */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] max-w-md w-full px-4"
          >
            <div
              className={`p-4 rounded-3xl shadow-xl flex items-center justify-between border ${
                notification.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/40 dark:text-emerald-300"
                  : notification.type === "error"
                  ? "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900/40 dark:text-rose-300"
                  : "bg-blue-50 border-blue-100 text-blue-800 dark:bg-slate-950/90 dark:border-slate-900/40 dark:text-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Info size={18} />
                <p className="text-xs font-bold leading-tight">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          FULLSCREEN EMERGENCY MEDICINE ALARM PORTAL
          ========================================== */}
      <AnimatePresence>
        {activeAlarm?.show && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[1500] flex flex-col justify-between items-center p-8 text-center text-white select-none">
            <div className="mt-12 space-y-4">
              <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/50 animate-bounce">
                <Pill size={44} className="text-white" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-400 font-extrabold animate-pulse">
                CAREBRIDGE CLINICAL ALARM ACTIVATED
              </p>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                {activeAlarm.reminder.language === "Marathi" 
                  ? "औषध घेण्याची वेळ झाली आहे" 
                  : activeAlarm.reminder.language === "Hindi"
                  ? "दवा लेने का समय हो गया है"
                  : "Time to take your Medicine"}
              </h2>
            </div>

            <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] w-full max-w-md my-auto space-y-4">
              <div>
                <h3 className="text-3xl font-black text-rose-400">
                  {activeAlarm.reminder.medicineName}
                </h3>
                <p className="text-sm font-bold opacity-75 mt-1">
                  Dosage requirement: {activeAlarm.reminder.dosage}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-black uppercase flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  Sched: {activeAlarm.timing}
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-black uppercase flex items-center gap-2">
                  <Utensils size={14} className="text-green-400" />
                  Take {activeAlarm.reminder.mealTime} meal
                </div>
              </div>

              {activeAlarm.reminder.notes && (
                <div className="p-4 bg-slate-950/60 rounded-2xl text-xs text-left text-slate-500 dark:text-slate-400 italic">
                  Note: {activeAlarm.reminder.notes}
                </div>
              )}
            </div>

            <div className="mb-12 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button
                onClick={() => closeActiveAlarm("taken")}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-3xl text-sm font-black uppercase text-white shadow-xl shadow-emerald-500/20"
              >
                Taken & Logged
              </button>
              <button
                onClick={() => closeActiveAlarm("snooze")}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-white/10 rounded-3xl text-sm font-black uppercase text-slate-600 dark:text-slate-300"
              >
                Snooze 5 Min
              </button>
              <button
                onClick={() => closeActiveAlarm("missed")}
                className="py-4 px-6 bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-3xl text-xs font-black uppercase transition-all"
              >
                Skip Dose
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          FULLSCREEN DAILY REMINDER ALARM PORTAL
          ========================================== */}
      <AnimatePresence>
        {activeDailyAlarm?.show && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[1500] flex flex-col justify-between items-center p-8 text-center text-white select-none">
            <div className="mt-12 space-y-4">
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/50 animate-bounce">
                <Bell size={44} className="text-white text-white/90 animate-pulse" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-extrabold animate-pulse">
                CAREBRIDGE DAILY ALARM SYSTEM
              </p>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Everyday Reminder Alert
              </h2>
            </div>

            <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] w-full max-w-md my-auto space-y-4">
              <div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[9px] uppercase font-black tracking-wider">
                  {activeDailyAlarm.reminder.type}
                </span>
                <h3 className="text-3xl font-black text-amber-400 mt-2">
                  {activeDailyAlarm.reminder.title}
                </h3>
                {activeDailyAlarm.reminder.description && (
                  <p className="text-sm font-bold opacity-75 mt-1.5 leading-relaxed">
                    {activeDailyAlarm.reminder.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-black uppercase flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  Time: {activeDailyAlarm.timing}
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-2xl text-xs font-black uppercase flex items-center gap-2">
                  <AlertCircle size={14} className="text-green-400" />
                  Pr: {activeDailyAlarm.reminder.priority}
                </div>
              </div>
            </div>

            <div className="mb-12 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button
                onClick={() => closeActiveDailyAlarm("done")}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-3xl text-sm font-black uppercase text-white shadow-xl shadow-emerald-500/20"
              >
                Mark Accomplished
              </button>
              <button
                onClick={() => {
                  stopAlarmSound();
                  showNotification("Snoozed alarm for 5 minutes.", "info");
                  const cachedRem = activeDailyAlarm.reminder;
                  const cachedTime = activeDailyAlarm.timing;
                  setActiveDailyAlarm(null);
                  setTimeout(() => {
                    startFullscreenDailyAlarm(cachedRem, cachedTime);
                  }, 5 * 60 * 1000);
                }}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-white/10 rounded-3xl text-sm font-black uppercase text-slate-600 dark:text-slate-300"
              >
                Snooze 5 Min
              </button>
              <button
                onClick={() => closeActiveDailyAlarm("dismiss")}
                className="py-4 px-6 bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-3xl text-xs font-black uppercase transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen flex flex-col font-sans transition-all ${darkMode ? "dark bg-[#040814] text-slate-100" : "bg-[#f8f9fc] text-slate-800"}`}>
        
        {/* ==========================================
            PREMIUM HEADER AND MOBILE APP TOPBAR
            ========================================== */}
        <header className={`sticky top-0 z-40 border-b flex px-4 lg:px-10 py-4 items-center justify-between backdrop-blur-md ${
          darkMode ? "bg-[#040814]/80 border-white/5" : "bg-white/80 border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden rounded-2xl hover:bg-slate-500/10"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <img src="/carebridge-logo.png" alt="CareBridge Logo" className="w-12 h-12 object-contain drop-shadow-md hover:scale-105 transition-transform" />
                <span className="font-black text-lg tracking-tight bg-linear-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
                  CareBridge Plus
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-emerald-500/10 text-emerald-500">
                  PT
                </span>
              </div>
              <p className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Active Patient Universe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live UTC Clinical System Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/5 border border-slate-500/10 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Clock size={13} className="text-emerald-400 animate-pulse" />
              {formatISTDate(currentTime)} | {formatISTTime(currentTime)}
            </div>

            {/* Notification alert bells */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-2xl hover:bg-slate-500/10 relative transition-transform duration-200 active:scale-90"
              >
                <Bell size={18} className="text-slate-500 dark:text-slate-400" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            </div>

            <PatientAvatar
              gender={patientDetails?.gender || user?.gender}
              name={user?.name}
              size={36}
            />
          </div>
        </header>

        {/* ==========================================
            DESKTOP PERSISTENT NAVIGATION SIDEBAR
            ========================================== */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <aside
            style={{ height: "100dvh", display: "flex", flexDirection: "column" }}
            className={`fixed inset-y-0 left-0 lg:static lg:flex flex-col w-64 lg:w-64 border-r transition-all duration-300 z-[70] overflow-y-auto lg:overflow-hidden backdrop-blur-xl ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } ${darkMode ? "bg-slate-900 border-white/20 shadow-2xl shadow-black/50" : "bg-white/95 border-slate-200/50 shadow-2xl shadow-slate-300/40"}`}
          >
            {/* ── PATIENT PROFILE CARD ── */}
            <div className={`p-3.5 m-3 mb-2 rounded-2xl flex items-center justify-between gap-3 shrink-0 ${darkMode ? "bg-white/5 border border-white/8" : "bg-slate-50 border border-slate-100"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <PatientAvatar
                  gender={patientDetails?.gender || user?.gender}
                  name={user?.name}
                  size={38}
                />
                <div className="flex flex-col min-w-0">
                  <h4 className={`font-black text-xs uppercase tracking-wider truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {user?.name || "PATIENT"}
                  </h4>
                  <p className={`text-[9px] font-extrabold uppercase tracking-widest truncate mt-0.5 ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
                    HEALTH ID: CARE-{user?.id?.slice(-5)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 lg:hidden rounded-xl hover:bg-slate-500/10 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── NAVIGATION MENU ── */}
            <nav
              style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
              className="flex-1 px-3 py-2 space-y-0.5 custom-scrollbar"
            >
              {[
                { id: "dashboard", icon: LayoutDashboard, label: "HOME BASE", gradient: "from-[#3B82F6] to-[#1D4ED8]", shadow: "shadow-blue-500/20" },
                { id: "profile", icon: UserIcon, label: "MY PROFILE", gradient: "from-[#EC4899] to-[#DB2777]", shadow: "shadow-pink-500/20" },
                { id: "ai_helper", icon: Brain, label: "AI HEALTH COACH", gradient: "from-[#F59E0B] to-[#D97706]", shadow: "shadow-amber-500/20" },
                { id: "my_medicine", icon: Pill, label: "MEDICINE TRACKER", gradient: "from-[#10B981] to-[#047857]", shadow: "shadow-emerald-500/20" },
                { id: "daily_reminders", icon: Bell, label: "REMINDERS HUB", gradient: "from-[#F59E0B] to-[#D97706]", shadow: "shadow-amber-500/20" },
                { id: "online_apt", icon: Stethoscope, label: "ONLINE APPOINTMENT", gradient: "from-[#0D9488] to-[#0F766E]", shadow: "shadow-teal-500/20" },
                { id: "health_analyst", icon: Activity, label: "CLINICAL ANALYST", gradient: "from-[#EF4444] to-[#B91C1C]", shadow: "shadow-rose-500/20" },
                { id: "habits", icon: ListTodo, label: "PERSONAL HABITS", gradient: "from-[#8B5CF6] to-[#6D28D9]", shadow: "shadow-purple-500/20" },
                { id: "reports", icon: ClipboardList, label: "MY REPORTS", gradient: "from-[#06B6D4] to-[#0891B2]", shadow: "shadow-cyan-500/20" },
              ].map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      active
                        ? darkMode
                          ? "bg-slate-800/90 text-white shadow-md border border-white/20"
                          : "bg-white text-blue-600 shadow-sm border border-slate-100"
                        : darkMode
                          ? "text-slate-300 hover:text-white hover:bg-white/10"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-blue-500 to-emerald-400" />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <ColorfulImageIcon
                        icon={item.icon}
                        gradient={item.gradient}
                        shadow={item.shadow}
                        size={16}
                      />
                      <span className={`font-black text-[12px] uppercase tracking-wider truncate ${
                        active 
                          ? (darkMode ? "text-blue-400" : "text-blue-600") 
                          : (darkMode ? "text-slate-200 group-hover:text-white" : "text-slate-700 group-hover:text-slate-900")
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {item.id === "ai_helper" && (
                      <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-xs shrink-0 animate-pulse">
                        LIVE AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── BOTTOM ACTIONS ── */}
            <div className={`p-3.5 pb-8 lg:pb-3.5 border-t shrink-0 ${darkMode ? "border-white/8" : "border-slate-100"}`}>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                    darkMode ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Settings size={14} className="opacity-70 shrink-0" />
                  <span>SETTINGS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                    darkMode ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {darkMode ? <Sun size={14} className="opacity-70 shrink-0" /> : <Moon size={14} className="opacity-70 shrink-0" />}
                  <span>{darkMode ? "LIGHT THEME" : "DEEP DARK"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                    darkMode ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Info size={14} className="opacity-70 shrink-0" />
                  <span>HELP &amp; SUPPORT</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 active:scale-[0.98] text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-md shadow-rose-500/20"
              >
                <LogOut size={14} />
                <span>LOG OUT</span>
              </button>
            </div>
          </aside>

          {/* ==========================================
              MAIN DOCK COMPILATION CONTAINER
              ========================================== */}
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-12 bg-linear-to-b from-transparent to-slate-500/5">
            <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
              
              <AnimatePresence mode="wait">
                
                {/* ==========================================
                    SCREEN 1: THE INTELLIGENT CLINICAL BASE (HOME)
                    ========================================== */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    
                    {/* ==========================================
                        SUBSCRIPTION NAVIGATION BANNER (PATIENT)
                        ========================================== */}
                    <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${darkMode ? "bg-slate-900/50 border-blue-900/30" : "bg-blue-50/50 border-blue-100"}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <Crown size={24} className="animate-pulse" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-black uppercase tracking-wide ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                            {subStatus === "active" ? "CareBridge+ Patient (Active)" : "CareBridge+ Patient Subscription"}
                          </h3>
                          {subStatus === "trial" && remaining > 0 ? (
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              Free Trial: {days >= 3 ? 3 : days + 1}/3 Days Remaining
                            </p>
                          ) : subStatus === "expired" || (subStatus === "trial" && remaining <= 0) ? (
                            <p className="text-xs font-bold text-red-500 mt-0.5">
                              Trial Expired. Please subscribe to continue.
                            </p>
                          ) : subStatus === "active" ? (
                            <p className="text-xs font-bold text-emerald-500 mt-0.5">
                              All premium health tracking features unlocked.
                            </p>
                          ) : (
                            <p className={`text-xs font-bold mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              Upgrade to unlock AI Coach & Premium Tracking at just ₹49/mo
                            </p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowSubscriptionPlan(true)}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
                      >
                        View Plan Details
                      </button>
                    </div>

                    {/* Hello Board Welcoming Card */}
                    <div className={`p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden border bg-linear-to-tr ${
                      darkMode 
                        ? "from-slate-900/60 via-[#0a142c]/20 to-slate-900/40 border-white/5 shadow-2xl shadow-blue-500/5" 
                        : "from-blue-50/15 via-emerald-50/5 to-white border-slate-200/60 shadow-xl shadow-slate-100"
                    }`}>
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-500/15 text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none">
                            Patient Hub Console
                          </span>
                          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                            Namaste & Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 drop-shadow-sm">{user?.name || "Patient"}</span>
                          </h1>
                          <p className={`text-sm sm:text-base font-semibold max-w-xl leading-relaxed mt-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                            Continuous Care Network Active. Your bio-metric data trends and today's active medical schedule are fully synchronized under clinical security standards.
                          </p> 
                          {/* Instant Advice Bullet */}
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-teal-700 dark:text-teal-400 pt-1.5">
                            <Sparkles size={16} className="animate-spin-slow text-amber-500" />
                            <span>AI HEALTH SCORE:</span>
                            <span className="font-mono bg-emerald-100/80 dark:bg-emerald-900/40 px-3 py-1 rounded-xl text-base text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                              {medicineAdherenceRate}% Consistent
                            </span>
                          </div>
                        </div>
 
                        {/* Quick action buttons */}
                        <div className="flex flex-wrap items-center gap-4 shrink-0">
                          <button
                            onClick={handleLogVitalsToggle}
                            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-sm uppercase tracking-[0.15em] rounded-[1rem] shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-white/10"
                          >
                            Update My Vitals
                          </button>
                          <button
                            onClick={() => setActiveTab("ai_helper")}
                            className="p-3.5 rounded-[1rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-1"
                            title="Open AI Health Coach Chat"
                          >
                            <Brain size={26} className="text-[#3b82f6]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
                        MODULE 6: LIVE AI SUPERVISOR CRITICAL ADVISORY BANDS
                        ========================================== */}
                    <div className={`p-6 rounded-[2.5rem] border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md ${
                      supervisorIntegrityAdvisory.severity === "high"
                        ? "bg-rose-50/80 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300"
                        : supervisorIntegrityAdvisory.severity === "medium"
                        ? "bg-amber-50/80 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300"
                        : "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300"
                    }`}>
                      <div className="flex items-start gap-4 z-10">
                        <div className={`p-3 rounded-2xl mt-0.5 shadow-sm ${
                          supervisorIntegrityAdvisory.severity === "high"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                            : supervisorIntegrityAdvisory.severity === "medium"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                        }`}>
                          <ShieldCheck size={26} className="animate-pulse" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs uppercase font-extrabold tracking-[0.15em]">{supervisorIntegrityAdvisory.header}</h4>
                          <p className={`text-sm font-medium leading-relaxed max-w-2xl opacity-90`}>
                            {supervisorIntegrityAdvisory.message}
                          </p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto flex justify-end z-10">
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] bg-black/5 dark:bg-white/10 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
                          Supervisor Active
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
                        ALL CORE CLINICAL FEATURES MENU HUB
                        ========================================== */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <Sparkles className="text-amber-500 animate-pulse-slow font-bold" size={20} />
                        <div>
                          <h3 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Clinical Service Suites</h3>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Instantly launch your desired digital healthcare system</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                        {[
                          {
                            id: "ai_helper",
                            label: "AI Health Coach",
                            desc: "Real-time voice & text consult",
                            icon: Brain,
                            gradient: "from-[#F59E0B] to-[#D97706]",
                            shadow: "shadow-amber-500/20",
                            borderCol: "hover:border-amber-400/50 dark:hover:bg-amber-950/20",
                            bgCol: "bg-amber-500/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "my_medicine",
                            label: "Medicine Tracker",
                            desc: "On-time medical schedule",
                            icon: Pill,
                            gradient: "from-[#10B981] to-[#047857]",
                            shadow: "shadow-emerald-500/20",
                            borderCol: "hover:border-emerald-400/50 dark:hover:bg-emerald-950/20",
                            bgCol: "bg-emerald-500/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "health_analyst",
                            label: "Health Analyst",
                            desc: "Clinical vital trends models",
                            icon: Activity,
                            gradient: "from-[#EF4444] to-[#B91C1C]",
                            shadow: "shadow-rose-500/20",
                            borderCol: "hover:border-rose-400/50 dark:hover:bg-rose-950/20",
                            bgCol: "bg-rose-500/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "habits",
                            label: "Personal Habits",
                            desc: "Spiritual routine & water logs",
                            icon: ListTodo,
                            gradient: "from-[#8B5CF6] to-[#6D28D9]",
                            shadow: "shadow-purple-500/20",
                            borderCol: "hover:border-purple-400/50 dark:hover:bg-purple-950/20",
                            bgCol: "bg-purple-500/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "reports",
                            label: "My Reports",
                            desc: "Diagnostics file safekeeping",
                            icon: ClipboardList,
                            gradient: "from-[#06B6D4] to-[#0891B2]",
                            shadow: "shadow-cyan-500/20",
                            borderCol: "hover:border-cyan-400/50 dark:hover:bg-cyan-950/20",
                            bgCol: "bg-cyan-505/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "online_apt",
                            label: "Online Appointment",
                            desc: "OPD schedules slot finder",
                            icon: Stethoscope,
                            gradient: "from-[#0D9488] to-[#0F766E]",
                            shadow: "shadow-teal-500/20",
                            borderCol: "hover:border-teal-400/50 dark:hover:bg-teal-950/20",
                            bgCol: "bg-[#0D9488]/5 dark:bg-[#060b1e]",
                          },
                          {
                            id: "daily_reminders",
                            label: "Reminders Hub",
                            desc: "Everyday alarms & agenda",
                            icon: Bell,
                            gradient: "from-[#F59E0B] to-[#D97706]",
                            shadow: "shadow-amber-500/20",
                            borderCol: "hover:border-amber-400/50 dark:hover:bg-amber-950/20",
                            bgCol: "bg-amber-500/5 dark:bg-[#060b1e]",
                          },
                        ].map((feat) => {
                          const IconComp = feat.icon;
                          const active = activeTab === feat.id;
                          return (
                            <button
                              key={feat.id}
                              onClick={() => {
                                setActiveTab(feat.id);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`group p-6 rounded-[2.5rem] border text-left space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-300 cursor-pointer ${
                                active 
                                  ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                                  : darkMode 
                                    ? "bg-slate-900/60 border-white/10 hover:border-slate-700 backdrop-blur-sm" 
                                    : "bg-white/80 border-slate-200/80 hover:border-slate-300 backdrop-blur-sm shadow-sm"
                              }`}
                            >
                              {/* Colour full image like icons */}
                              <ColorfulImageIcon
                                icon={IconComp}
                                gradient={feat.gradient}
                                shadow={feat.shadow}
                                size={22}
                              />
                              <div className="space-y-1">
                                <h4 className={`font-black text-sm sm:text-base tracking-tight group-hover:text-blue-500 transition-colors ${
                                  darkMode ? "text-slate-100" : "text-slate-800"
                                }`}>
                                  {feat.label}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[130px]">
                                  {feat.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Active Medicines reminder cards widget (Module 2) */}
                      <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-3">
                            <ColorfulImageIcon
                              icon={Pill}
                              gradient="from-[#10B981] to-[#059669]"
                              shadow="shadow-emerald-500/10"
                              size={16}
                            />
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">Active Medications for Today</h3>
                          </div>
                          <button
                            onClick={() => {
                              setShowReminderModal(true);
                            }}
                            className="text-sm font-extrabold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus size={16} /> Add Medicine
                          </button>
                        </div>

                        {reminders.filter((m) => m.status === "active").length === 0 ? (
                          <div className={`p-10 rounded-[2.5rem] border text-center ${
                            darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                          }`}>
                            <ClipboardList className="mx-auto text-slate-450/40 mb-3" size={48} />
                            <p className="text-base text-slate-500 font-bold">No active planned medicines scheduled today.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {reminders
                              .filter((m) => m.status === "active")
                              .slice(0, 4)
                              .map((med) => (
                                <div
                                  key={med.id}
                                  className={`p-6 rounded-[2.2rem] border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                                    darkMode 
                                      ? "bg-slate-900/40 border-white/5 hover:border-slate-800" 
                                      : "bg-white border-slate-200/60 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="space-y-1">
                                      <h4 className="font-black text-lg text-[#3b82f6] dark:text-[#10B981] tracking-tight truncate max-w-[170px]">{med.medicineName}</h4>
                                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 capitalize">{med.dosage}</p>
                                    </div>
                                    <span className="text-xs font-black uppercase bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3.5 py-1.5 rounded-xl border border-blue-500/10 shrink-0 font-mono">
                                      {med.timings?.[0] || "10:00"}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center pt-3 border-t border-slate-200/30 dark:border-white/5 gap-2">
                                    <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <Utensils size={12} className="text-emerald-500" />
                                      {med.mealTime} food
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => startFullscreenAlarm(med, med.timings?.[0] || "08:00")}
                                        className="p-2 px-3.5 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 text-xs font-black rounded-xl uppercase transition-colors shrink-0"
                                      >
                                        Test Ring
                                      </button>
                                      <button
                                        onClick={() => deleteMedReminder(med.id, med.medicineName)}
                                        className="p-2.5 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors shrink-0"
                                        title="Delete Medication"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Vitals Diagnostics card logs */}
                      <div className="space-y-5">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-3">
                            <ColorfulImageIcon
                              icon={Activity}
                              gradient="from-[#EF4444] to-[#DC2626]"
                              shadow="shadow-red-500/10"
                              size={16}
                            />
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">Bio-Diagnostics</h3>
                          </div>
                          <button
                            onClick={handleLogVitalsToggle}
                            className="text-sm font-extrabold uppercase tracking-wider text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Update
                          </button>
                        </div>

                        <div className={`p-6 sm:p-7 rounded-[2.5rem] border space-y-5 shadow-sm ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                        }`}>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Blood Pressure Card */}
                            <div className={`p-4 rounded-[1.8rem] border ${darkMode ? "bg-slate-800/60 border-red-500/20" : "bg-red-500/5 border-red-500/10"}`}>
                              <p className="text-xs font-extrabold uppercase text-rose-500 flex items-center gap-1">
                                <HeartPulse size={12} className="animate-pulse" />
                                BP
                              </p>
                              <p className={`font-mono text-2xl font-black mt-1.5 ${darkMode ? "text-white" : "text-slate-900"}`}>{healthLogs?.[0]?.bp || "120/80"}</p>
                              <span className={`text-[10px] uppercase font-bold block mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>mmHg</span>
                            </div>

                            {/* Sugar Card */}
                            <div className={`p-4 rounded-[1.8rem] border ${darkMode ? "bg-slate-800/60 border-amber-500/20" : "bg-amber-500/5 border-amber-500/10"}`}>
                              <p className="text-xs font-extrabold uppercase text-amber-500 flex items-center gap-1">
                                <Activity size={12} />
                                Sugar
                              </p>
                              <p className={`font-mono text-2xl font-black mt-1.5 ${darkMode ? "text-white" : "text-slate-900"}`}>{healthLogs?.[0]?.sugar || "110"}</p>
                              <span className={`text-[10px] uppercase font-bold block mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>mg/dL</span>
                            </div>

                            {/* SpO2 Card */}
                            <div className={`p-4 rounded-[1.8rem] border ${darkMode ? "bg-slate-800/60 border-cyan-500/20" : "bg-cyan-500/5 border-cyan-500/10"}`}>
                              <p className="text-xs font-extrabold uppercase text-cyan-500 flex items-center gap-1">
                                <Wind size={12} />
                                SpO2
                              </p>
                              <p className={`font-mono text-2xl font-black mt-1.5 ${darkMode ? "text-white" : "text-slate-900"}`}>{healthLogs?.[0]?.oxygen || "98"}%</p>
                              <span className={`text-[10px] uppercase font-bold block mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Oxygenation</span>
                            </div>

                            {/* Pulse Card */}
                            <div className={`p-4 rounded-[1.8rem] border ${darkMode ? "bg-slate-800/60 border-emerald-500/20" : "bg-emerald-500/5 border-emerald-500/10"}`}>
                              <p className="text-xs font-extrabold uppercase text-emerald-500 flex items-center gap-1">
                                <Heart size={12} className="animate-pulse" />
                                Pulse
                              </p>
                              <p className={`font-mono text-2xl font-black mt-1.5 ${darkMode ? "text-white" : "text-slate-900"}`}>{healthLogs?.[0]?.pulse || "72"}</p>
                              <span className={`text-[10px] uppercase font-bold block mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>bpm</span>
                            </div>
                          </div>

                          {vitalsWarnings.length > 0 && (
                            <div className="p-4 bg-rose-500/10 rounded-2.2xl border border-rose-500/20 space-y-1.5">
                              <p className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                Clinical Advisory Alert
                              </p>
                              <p className="text-xs text-rose-900 dark:text-rose-300 font-bold leading-relaxed">{vitalsWarnings[0]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Habits tracker overview in the bottom grid with gamification and AI goals */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Interactive health analyst weekly reports compiled */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <BriefcaseMedical size={18} className="text-purple-500" />
                            <h3 className="font-extrabold text-lg">Diagnostics Trends Engine</h3>
                          </div>
                          <button
                            onClick={() => setActiveTab("health_analyst")}
                            className="text-xs font-black uppercase text-purple-500 hover:underline"
                          >
                            Full Analyst Mode
                          </button>
                        </div>

                        <div className={`p-6 rounded-[2rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                        }`}>
                          <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={healthLogs.slice(0, 10).reverse()}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                  </linearGradient>
                                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                                <YAxis stroke="#94a3b8" fontSize={9} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                                    borderColor: "rgba(148,163,184,0.1)",
                                    borderRadius: "16px",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="sugar"
                                  name="Blood Sugar (mg/dL)"
                                  stroke="#10b981"
                                  fillOpacity={1}
                                  fill="url(#colorSugar)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="pulse"
                                  name="Pulse (bpm)"
                                  stroke="#3b82f6"
                                  fillOpacity={1}
                                  fill="url(#colorBp)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Gamified Habits Streaks and Trophies summary */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-amber-500 animate-bounce" />
                            <h3 className="font-extrabold text-lg">Habits & Trophies</h3>
                          </div>
                          <button
                            onClick={() => setActiveTab("habits")}
                            className="text-xs font-black uppercase text-amber-500 hover:underline"
                          >
                            Explore
                          </button>
                        </div>

                        <div className={`p-6 rounded-[2rem] border text-center space-y-5 ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                        }`}>
                          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                            <Flame size={32} className="text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-black text-xl">{activeHabitStreak} Day Streak</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-xs mx-auto">
                              Consistent wellness check-ins are earning you premium diagnostic credits. Run yoga and water trackers everyday!
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-500/10 text-left">
                            <div className="p-3 bg-slate-500/5 rounded-2xl">
                              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Next Trophy</span>
                              <p className="text-xs font-black mt-0.5">Yoga Sage (7d)</p>
                            </div>
                            <div className="p-3 bg-slate-500/5 rounded-2xl">
                              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Adherence Score</span>
                              <p className="text-xs font-black mt-0.5">{medicineAdherenceRate}% Elite</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 2: REALTIME CHAT ASSISTANT & AUDIO WAVES (COACH)
                    ========================================== */}
                {activeTab === "ai_helper" && (
                  <motion.div
                    key="ai_helper"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 flex flex-col h-full min-h-[75vh]"
                  >
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                          <Brain className="text-blue-500" /> AI Health Coach Companion
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Real-time multilingual support and automatic diagnostic suggestion chips.
                        </p>
                      </div>

                      {/* Language selects & Test voice button */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {(["English", "Hindi", "Marathi"] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => triggerLanguageSelect(lang)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                              aiLanguage === lang
                                ? "bg-blue-600 text-white"
                                : "bg-slate-500/5 hover:bg-slate-500/10 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}

                        <div className="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mx-1" />

                        <button
                          onClick={() => {
                            const testPhrases = {
                              English: "Hello! This is an test of your A.I. health coach voice. Can you hear me clearly?",
                              Hindi: "नमस्ते! यह आपके ए.आई. स्वास्थ्य कोच की आवाज़ का परीक्षण है। क्या आप मुझे स्पष्ट रूप से सुन सकते हैं?",
                              Marathi: "नमस्कार! ही तुमच्या ए.आय. आरोग्य कोचच्या आवाजाची चाचणी आहे. तुम्हाला माझा आवाज स्पष्ट ऐकू येतो का?"
                            };
                            speakText(testPhrases[aiLanguage] || testPhrases.English);
                          }}
                          disabled={isSpeaking}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                            isSpeaking
                              ? "bg-amber-500/20 text-amber-500 animate-pulse cursor-not-allowed"
                              : "bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer shadow-md shadow-emerald-500/10"
                          }`}
                          title="Test Speech Synthesizer Audibility"
                        >
                          <Volume2 size={14} className={isSpeaking ? "animate-bounce" : ""} />
                          {isSpeaking ? "Speaking..." : "Test Voice"}
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages Frame */}
                    <div className={`p-6 rounded-[2.5rem] border flex-1 flex flex-col justify-between gap-6 ${
                      darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                    }`}>
                      <div className="flex-1 overflow-y-auto max-h-[480px] space-y-4 pr-2 custom-scrollbar">
                        {aiChatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              msg.role === "user" ? "bg-blue-600 text-white" : "bg-teal-500/10 text-teal-400"
                            }`}>
                              {msg.role === "user" ? <UserIcon size={14} /> : <Brain size={14} />}
                            </div>

                            <div className="space-y-3">
                              <div className={`p-4 rounded-[1.8rem] text-sm leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : darkMode
                                  ? "bg-slate-800/80 text-slate-100 rounded-tl-none border border-white/5"
                                  : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                              }`}>
                                <p className="whitespace-pre-line">{msg.content}</p>
                              </div>

                              {/* Suggestion Chips printed chronologically if available */}
                              {msg.role === "model" && msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {msg.suggestions.map((chip, cIdx) => (
                                    <button
                                      key={cIdx}
                                      onClick={() => {
                                        setSpeechEnabled(true);
                                        setAiInput(chip);
                                        handleAiChatSubmit(chip);
                                      }}
                                      className="px-3 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 dark:hover:bg-blue-500/15 border border-blue-500/10 hover:border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 transition-all text-left max-w-xs shrink-0 truncate"
                                    >
                                      {chip}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {isAiThinking && (
                          <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Brain size={14} className="animate-spin-slow text-blue-500" />
                            </div>
                            <div className={`p-4 rounded-3xl text-xs italic ${
                              darkMode ? "bg-slate-800 text-slate-500 dark:text-slate-400" : "bg-slate-50 text-slate-500"
                            }`}>
                              Coach analysis clinical metrics...
                            </div>
                          </div>
                        )}
                        <div ref={chatScrollRef} />
                      </div>

                      {/* AI Audio Sound Waves or waveform animations on Voice activity */}
                      {isSpeaking && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-xs font-extrabold text-emerald-400 animate-pulse">
                            <Volume2 size={16} /> Reading response aloud...
                          </div>
                          <button
                            onClick={stopActiveSpeech}
                            className="p-1 px-2.5 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase rounded-lg hover:bg-rose-500/20"
                          >
                            Stop TTS
                          </button>
                        </div>
                      )}

                      {/* Text Entry and Voice Actions */}
                      <div className="space-y-3 border-t border-slate-500/10 pt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={triggerSTT}
                            className={`p-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-white ${
                              isSTTListening ? "bg-rose-500 animate-pulse-slow" : "bg-slate-500/10 text-slate-500 dark:text-slate-400"
                            }`}
                            title="Start Speech Dictation Input"
                          >
                            <Mic size={18} />
                          </button>

                          <input
                            type="text"
                            placeholder={isSTTListening ? "Listening... Speak directly" : "Ask about symptoms, diabetes diets, BP correctives..."}
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAiChatSubmit();
                            }}
                            className={`flex-1 px-4 py-3 text-sm font-bold border rounded-2xl focus:outline-hidden transition-all ${
                              darkMode ? "bg-slate-800/50 border-white/5 focus:border-blue-600 text-white" : "bg-slate-50 border-slate-200 focus:border-blue-600"
                            }`}
                          />

                          <button
                            onClick={() => handleAiChatSubmit()}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-transform active:scale-95"
                          >
                            <Send size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                            <Shield size={10} />
                            "AI suggestions are supportive guidance only."
                          </span>
                          
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Speak Responses</span>
                            <input
                              type="checkbox"
                              checked={speechEnabled}
                              onChange={(e) => {
                                setSpeechEnabled(e.target.checked);
                                if (!e.target.checked) stopActiveSpeech();
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 3: SMART MEDICINE LIST & REMINDER SCHEDULER
                    ========================================== */}
                {activeTab === "my_medicine" && (
                  <motion.div
                    key="my_medicine"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <MedicationManagement
                      user={user}
                      darkMode={darkMode}
                      showNotification={showNotification}
                    />
                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 4: CLINICAL HEALTH ANALYST REPORTS
                    ========================================== */}
                {activeTab === "health_analyst" && (
                  <motion.div
                    key="health_analyst"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <PersonalHealthAnalyst
                      user={user}
                      darkMode={darkMode}
                      showNotification={showNotification}
                    />
                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 5: HABIT TRACKING GRID (GAMIFICATION)
                    ========================================== */}
                {activeTab === "habits" && (
                  <motion.div
                    key="habits"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    
                    <div>
                      <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <ListTodo className="text-teal-500" /> Personal Habits & Gamified Rewards
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        Maintaining consistency earns healthy trophies and unlocks virtual credits.
                      </p>
                    </div>

                    {/* Habit cards checklist grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {defaultHabitList.map((hObj) => {
                        const isDone = loggedHabitsToday[hObj.key] || false;
                        return (
                          <div
                            key={hObj.key}
                            className={`p-5 rounded-[2rem] border flex items-center justify-between transition-all ${
                              darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl ${hObj.bg} ${hObj.color}`}>
                                <hObj.icon size={22} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm truncate max-w-[150px]">{hObj.name}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Goal: {hObj.goal}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleHabitState(hObj.key)}
                              className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "border-slate-500/10 text-slate-500 dark:text-slate-400 hover:bg-slate-500/5"
                              }`}
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 6: MY REPORTS, IMAGING & DIARIES
                    ========================================== */}
                {activeTab === "reports" && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Screen Navigation Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                          <ClipboardList className="text-blue-500" /> My Medical Reports
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Safekeeping your diagnostic reports, lab files, prescriptions, and voice memos securely.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReportForm({
                              title: "",
                              clinicName: "",
                              date: getISTDateString(),
                              type: "report",
                              fileUrl: "",
                            });
                            setCapturedImageBase64(null);
                            setShowAddReportModal(true);
                          }}
                          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 text-center transition-transform active:scale-95"
                        >
                          <Plus size={14} />
                          Upload / Snap Report
                        </button>
                      </div>
                    </div>

                    {/* Navigation Sub-Tabs Toggle */}
                    <div className="flex border-b border-slate-500/10 pb-px">
                      <button
                        onClick={() => setReportsSubTab("files")}
                        className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                          reportsSubTab === "files"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <ImageIcon size={14} />
                        My Uploaded Files ({medicalReports.length})
                      </button>
                      <button
                        onClick={() => setReportsSubTab("voice")}
                        className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                          reportsSubTab === "voice"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Mic size={14} />
                        Recorded Health Memos ({recordedMemos.length})
                      </button>
                    </div>

                    {/* SUB-TAB 1: DYNAMICS CLOUD FILES & IMAGING */}
                    {reportsSubTab === "files" && (
                      <div className="space-y-6">
                        {/* Elegant Dual Filter & Search Panel */}
                        <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center ${
                          darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
                        }`}>
                          <div className="relative flex-1 w-full">
                            <Search size={16} className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search report by name, clinic, prescription..."
                              value={reportSearchQuery}
                              onChange={(e) => setReportSearchQuery(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-500/10 dark:bg-slate-950/40 font-bold focus:outline-hidden focus:border-blue-500/50"
                            />
                            {reportSearchQuery && (
                              <button
                                onClick={() => setReportSearchQuery("")}
                                className="absolute right-3 top-3 text-slate-500 hover:text-slate-600 dark:text-slate-300 text-xs px-1"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="relative w-full md:w-56">
                            <input
                              type="date"
                              value={reportSearchDate}
                              onChange={(e) => setReportSearchDate(e.target.value)}
                              className="w-full pl-4 pr-10 py-3 text-xs rounded-2xl border border-slate-500/10 dark:bg-slate-950/40 font-bold focus:outline-hidden focus:border-blue-500/50"
                            />
                            {reportSearchDate && (
                              <button
                                onClick={() => setReportSearchDate("")}
                                className="absolute right-3 top-3 text-slate-500 hover:text-slate-600 dark:text-slate-300 text-xs px-1"
                              >
                                Clear Date
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reports Dynamic Cloud Grid */}
                        {(() => {
                          const queried = medicalReports.filter((rep: any) => {
                            const nameMatch = (rep.title || "").toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                                              (rep.clinicName || "").toLowerCase().includes(reportSearchQuery.toLowerCase());
                            const dateMatch = reportSearchDate ? rep.date === reportSearchDate : true;
                            return nameMatch && dateMatch;
                          });

                          if (queried.length === 0) {
                            return (
                              <div className="text-center py-20 border border-dashed border-slate-550/10 rounded-[2.5rem] space-y-4">
                                <ClipboardList size={48} className="mx-auto text-slate-500 dark:text-slate-400/20" />
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-sm">No report files identified</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    {(reportSearchQuery || reportSearchDate) 
                                      ? "Adjust your filters or query text to check other archives."
                                      : "Upload or click a photo of your clinical prescription or imaging paper to safely store in deep archives."}
                                  </p>
                                </div>
                                {(reportSearchQuery || reportSearchDate) && (
                                  <button
                                    onClick={() => {
                                      setReportSearchQuery("");
                                      setReportSearchDate("");
                                    }}
                                    className="px-4 py-2 bg-slate-500/10 text-slate-500 dark:text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs"
                                  >
                                    Reset Filters
                                  </button>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {queried.map((rep: any) => (
                                <div
                                  key={rep.id}
                                  onClick={() => setShowReportViewer(rep)}
                                  className={`group rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl ${
                                    darkMode ? "bg-slate-900/30 border-white/5 hover:border-blue-500/15" : "bg-white border-slate-200/50 hover:border-blue-500/15"
                                  }`}
                                >
                                  {/* Thumbnail Preview Banner */}
                                  <div className="h-40 bg-slate-950/20 relative flex items-center justify-center overflow-hidden border-b border-slate-500/10">
                                    {rep.fileUrl ? (
                                      <img
                                        src={rep.fileUrl}
                                        alt={rep.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <ClipboardList size={40} className="text-slate-500/40" />
                                    )}
                                    
                                    {/* Sub-badge indicating prescriptions or generic reports */}
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      rep.type === "prescription"
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/10"
                                        : "bg-blue-500/20 text-blue-400 border border-blue-500/10"
                                    }`}>
                                      {rep.type === "prescription" ? "Prescription" : "Lab Diagnostics"}
                                    </span>
                                  </div>

                                  {/* Meta descriptions */}
                                  <div className="p-5 space-y-3">
                                    <div className="space-y-1">
                                      <h4 className="font-extrabold text-sm truncate group-hover:text-blue-400 transition-colors">{rep.title}</h4>
                                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-tight">Clinic: {rep.clinicName || "Self Upload"}</p>
                                    </div>

                                    {/* Info footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-500/10">
                                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{rep.date}</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowReportViewer(rep);
                                          }}
                                          className="p-1.5 hover:bg-slate-500/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-400"
                                          title="View Original"
                                        >
                                          <Eye size={13} />
                                        </button>
                                        <button
                                          onClick={(e) => handleDeleteReport(rep.id, e)}
                                          className="p-1.5 hover:bg-slate-500/15 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400"
                                          title="Delete Permanently"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* SUB-TAB 2: VOICE MEMO & SMART APPOINTMENT EXTRACTS */}
                    {reportsSubTab === "voice" && (
                      <div className="space-y-6">
                        <div className={`p-6 rounded-[2rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                        } flex flex-col md:flex-row items-center justify-between gap-6`}>
                          <div>
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Mic className="text-rose-500 animate-pulse" /> Wellness Recording Console
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Record your symptom updates or medication logs verbally. Our AI engine extracts medical terms and appointments automatically.
                            </p>
                          </div>
                          
                          <button
                            onClick={isRecordingMemo ? stopVoiceMemoAndAnalyze : startVoiceMemoRecording}
                            className={`px-5 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-lg transition-transform active:scale-95 ${
                              isRecordingMemo ? "bg-rose-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10"
                            }`}
                          >
                            <Mic size={14} />
                            {isRecordingMemo ? `Stop Recording (${memoDuration}s)` : "Record Health Memo"}
                          </button>
                        </div>

                        {/* Active Voice waves visualizer during dictation */}
                        {isRecordingMemo && (
                          <div className="p-8 bg-rose-500/5 rounded-[2rem] border border-rose-500/20 space-y-4">
                            <div className="flex items-center justify-center gap-1.5 h-16">
                              {memoWaveform.map((hValue, iIdx) => (
                                <span
                                  key={iIdx}
                                  style={{ height: `${hValue}%` }}
                                  className="w-1 bg-rose-500 rounded-full transition-all duration-300"
                                />
                              ))}
                            </div>
                            <p className="text-center text-xs text-rose-400 font-extrabold animate-pulse uppercase tracking-wider">Listening to health notes...</p>
                          </div>
                        )}

                        {/* Voice Memos list with extraction items */}
                        <div className="space-y-4">
                          <h3 className="font-extrabold text-lg px-2">Recorded Dictation Diaries</h3>

                          {recordedMemos.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 font-semibold text-center py-10 text-xs">No verbal wellness records found yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {recordedMemos.map((memo) => (
                                <div
                                  key={memo.id}
                                  className={`p-5 rounded-3xl border ${
                                    darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-[#22C55E]">Audio Dictation Summary</span>
                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{memo.date} {memo.time}</span>
                                  </div>
                                  <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-4 font-semibold">"{memo.text}"</p>

                                  {memo.extractedData && (
                                    <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-1">
                                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{memo.extractedData.action}</p>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">{memo.extractedData.details}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 7: SEARCH CLINICS & MY BOOKINGS
                    ========================================== */}
                {activeTab === "appointments" && (
                  <motion.div
                    key="appointments"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                          <Calendar className="text-blue-500" /> Clinic Appointments & OPD booking
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Query available clinic consultation teams and coordinate scheduling.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowClinicSearchModal(true)}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-transform active:scale-95 animate-pulse-slow"
                      >
                        Find Clinics / Book Slots
                      </button>
                    </div>

                    {/* Booked Appointments Listing */}
                    <div className={`p-8 rounded-[2.5rem] border ${
                      darkMode ? "bg-slate-900/30 border-white/5 shadow-2xl" : "bg-white border-slate-200/50 shadow-sm"
                    } space-y-6`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-xl tracking-tight">Booking History</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Real-time status updates from clinic healthcare partners</p>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          appointments.length > 0
                            ? "bg-teal-500/15 text-teal-400"
                            : "bg-slate-500/15 text-slate-500 dark:text-slate-400"
                        }`}>
                          {appointments.length} Total Slots
                        </span>
                      </div>

                      {appointments.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
                          <div className="p-4 bg-slate-500/5 rounded-full inline-block">
                            <Calendar size={44} className="mx-auto text-slate-500 dark:text-slate-400/20 animate-pulse-slow" />
                          </div>
                          <h4 className="font-extrabold text-sm">No Active Registrations</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">You haven't scheduled any consultation slots with our medical centers yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {appointments.map((apt, idx) => {
                            // Assign beautiful dynamic gradient patterns depending on the card index
                            const colorIndex = idx % 5;
                            const colors = [
                              {
                                text: "text-blue-500 dark:text-blue-400",
                                ring: "ring-blue-500/20 dark:ring-blue-400/20",
                                bgGradient: darkMode ? "from-blue-500/5 to-indigo-500/5" : "from-blue-50/50 to-indigo-50/50",
                                accent: "bg-blue-600 dark:bg-blue-400",
                                borderHex: darkMode ? "border-blue-500/10 hover:border-blue-500/30" : "border-blue-200 hover:border-blue-300",
                                badgeBg: "bg-blue-500/10",
                                accentText: "text-blue-600 dark:text-blue-400"
                              },
                              {
                                text: "text-emerald-500 dark:text-emerald-400",
                                ring: "ring-emerald-500/20 dark:ring-emerald-400/20",
                                bgGradient: darkMode ? "from-emerald-500/5 to-teal-500/5" : "from-emerald-50/50 to-teal-50/50",
                                accent: "bg-emerald-600 dark:bg-emerald-400",
                                borderHex: darkMode ? "border-emerald-500/10 hover:border-emerald-500/30" : "border-emerald-200 hover:border-emerald-300",
                                badgeBg: "bg-emerald-500/10",
                                accentText: "text-emerald-600 dark:text-emerald-400"
                              },
                              {
                                text: "text-purple-500 dark:text-purple-400",
                                ring: "ring-purple-500/20 dark:ring-purple-400/20",
                                bgGradient: darkMode ? "from-purple-500/5 to-fuchsia-500/5" : "from-purple-50/50 to-fuchsia-50/50",
                                accent: "bg-purple-600 dark:bg-purple-400",
                                borderHex: darkMode ? "border-purple-500/10 hover:border-purple-500/30" : "border-purple-200 hover:border-purple-300",
                                badgeBg: "bg-purple-500/10",
                                accentText: "text-purple-600 dark:text-purple-400"
                              },
                              {
                                text: "text-amber-500 dark:text-amber-400",
                                ring: "ring-amber-500/20 dark:ring-amber-400/20",
                                bgGradient: darkMode ? "from-amber-500/5 to-orange-500/5" : "from-amber-50/50 to-orange-5/50",
                                accent: "bg-amber-600 dark:bg-amber-400",
                                borderHex: darkMode ? "border-amber-500/10 hover:border-amber-500/30" : "border-amber-200 hover:border-amber-300",
                                badgeBg: "bg-amber-500/10",
                                accentText: "text-amber-600 dark:text-amber-400"
                              },
                              {
                                text: "text-cyan-500 dark:text-cyan-400",
                                ring: "ring-cyan-500/20 dark:ring-cyan-400/20",
                                bgGradient: darkMode ? "from-cyan-500/5 to-sky-500/5" : "from-cyan-50/50 to-sky-50/50",
                                accent: "bg-cyan-600 dark:bg-cyan-400",
                                borderHex: darkMode ? "border-cyan-500/10 hover:border-cyan-500/30" : "border-cyan-200 hover:border-cyan-300",
                                badgeBg: "bg-cyan-500/10",
                                accentText: "text-cyan-600 dark:text-cyan-400"
                              }
                            ];
                            const palette = colors[colorIndex];

                            // Status styles
                            const isConfirmed = apt.status === "confirmed" || apt.status === "accepted";
                            const isCancelled = apt.status === "cancelled" || apt.status === "denied";

                            return (
                              <motion.div
                                key={apt.id}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className={`p-6 rounded-[2rem] border bg-linear-to-b ${palette.bgGradient} ${palette.borderHex} transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 relative`}
                              >
                                {/* Multi-color Accent Bar */}
                                <div className={`absolute top-0 left-8 right-8 h-[3px] rounded-b-full ${palette.accent}`} />

                                {/* Header with Clinic Name & Live Status */}
                                <div className="flex justify-between items-start pt-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${palette.badgeBg} ${palette.text} shrink-0`}>
                                      <Hospital size={18} />
                                    </div>
                                    <div className="space-y-0.5">
                                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                                        {apt.clinicName}
                                      </h4>
                                      <span className="text-[10px] bg-slate-500/10 text-slate-500 dark:text-slate-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">
                                        Partner Clinic
                                      </span>
                                    </div>
                                  </div>

                                  {/* Refined Health Standard Status Badge */}
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                      isConfirmed
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-xs"
                                        : isCancelled
                                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/10 animate-pulse-slow"
                                    }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                        isConfirmed
                                          ? "bg-emerald-500"
                                          : isCancelled
                                          ? "bg-rose-400"
                                          : "bg-amber-400"
                                      }`} />
                                      {isConfirmed ? "Confirmed" : isCancelled ? "Denied" : "Approval Pending"}
                                    </span>
                                  </div>
                                </div>

                                {/* Patient Information Details Group */}
                                <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-950/40" : "bg-slate-50"} space-y-3 text-xs`}>
                                  <div className="flex items-center justify-between border-b border-slate-500/5 pb-2.5">
                                    <span className="text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[9px]">Patient Profile</span>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-black">
                                      <UserIcon size={12} className={palette.text} />
                                      <span>ID: {apt.patientId ? apt.patientId.slice(0, 5).toUpperCase() : "REG50"}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Full Name</span>
                                      <p className="font-black text-slate-800 dark:text-slate-100 mt-0.5 truncate">{apt.patientName}</p>
                                    </div>

                                    <div>
                                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Demographics</span>
                                      <p className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                                        {apt.patientAge || "N/A"} Yrs Ã¢â‚¬Â¢ {apt.patientGender === "M" ? "Male" : apt.patientGender === "F" ? "Female" : "Other"}
                                      </p>
                                    </div>

                                    <div className="col-span-2">
                                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Registered Address</span>
                                      <p className="font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate flex items-center gap-1">
                                        <MapPin size={11} className="text-rose-500 shrink-0" />
                                        {apt.patientAddress || "Hinjewadi, Pune"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Appointment Ticket Details Group */}
                                <div className="border-t border-dashed border-slate-500/20 pt-4 flex flex-wrap items-center justify-between gap-4">
                                  {/* Slot Schedules */}
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-slate-500/5 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0`}>
                                      <Calendar size={14} className="text-teal-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Scheduled Schedule</span>
                                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                        {apt.appointmentDate}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-slate-500/5 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0`}>
                                      <Clock size={14} className="text-orange-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Assigned Slot Hour</span>
                                      <p className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                                        {apt.appointmentTime}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Communication & Help Overlay Actions */}
                                <div className="flex gap-2">
                                  {apt.patientPhone && (
                                    <a
                                      href={`tel:${apt.patientPhone}`}
                                      className="flex-1 py-2.5 bg-slate-500/10 hover:bg-slate-500/15 rounded-xl text-center text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                                    >
                                      <Phone size={11} /> Call Registered
                                    </a>
                                  )}
                                  <div className={`px-4 py-2.5 rounded-xl ${palette.badgeBg} ${palette.accentText} text-center text-[10px] font-black uppercase flex items-center justify-center gap-1 shrink-0`}>
                                    <Stethoscope size={11} /> Standard
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 10: EVERYDAY PERSONAL REMINDERS HUB
                    ========================================== */}
                {activeTab === "daily_reminders" && (
                  <motion.div
                    key="daily_reminders"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                          <Bell className="text-amber-500 animate-pulse-slow" /> Daily Reminders & Alerts Hub
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Configure professional medicine alarms and customized personal hydration/nutrition notifications.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDailyReminderId(null);
                          setDailyReminderForm({
                            title: "",
                            description: "",
                            date: getISTDateString(),
                            time: "08:00",
                            type: "medicine",
                            repeat: "daily",
                            sound: "standard",
                            priority: "high"
                          });
                          setShowDailyReminderModal(true);
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                      >
                        Add Personal Reminder Ã°Å¸â€â€
                      </button>
                    </div>

                    {/* Reminders Grid Analytics Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100"} flex items-center gap-4`}>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                          <Bell size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Alerts</p>
                          <h4 className="text-xl font-black">{dailyReminders.length}</h4>
                        </div>
                      </div>
                      <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100"} flex items-center gap-4`}>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl animate-pulse">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Pending Today</p>
                          <h4 className="text-xl font-black">
                            {dailyReminders.filter(r => r.status === "pending").length}
                          </h4>
                        </div>
                      </div>
                      <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-[#ffffff] border-slate-100"} flex items-center gap-4`}>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Accomplished</p>
                          <h4 className="text-xl font-black">
                            {dailyReminders.filter(r => r.status === "completed").length}
                          </h4>
                        </div>
                      </div>
                      <div className={`p-5 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100"} flex items-center gap-4`}>
                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">High Priority</p>
                          <h4 className="text-xl font-black">
                            {dailyReminders.filter(r => r.priority === "high").length}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Listing Screen */}
                    <div className={`p-8 rounded-[2.5rem] border ${
                      darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50"
                    } space-y-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-500/5 pb-4">
                        <div>
                          <h3 className="font-black text-xl tracking-tight">Active Agenda Reminders</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">Real-time dynamic agenda scheduling loop</p>
                        </div>
                      </div>

                      {dailyReminders.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
                          <div className="p-4 bg-slate-500/5 rounded-full inline-block">
                            <BellOff size={44} className="mx-auto text-slate-450/30" />
                          </div>
                          <h4 className="font-extrabold text-sm">No Active Reminders</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Click "Add Personal Reminder" to setup a customizable health, lifestyle, or clinical alarm.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {dailyReminders.map((rem) => {
                            const isCompleted = rem.status === "completed";
                            const isHighPr = rem.priority === "high";

                            return (
                              <div
                                key={rem.id}
                                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                                  isCompleted
                                    ? "opacity-60 bg-slate-500/5 border-slate-500/10"
                                    : darkMode
                                    ? "bg-slate-900/50 border-white/5 hover:border-amber-500/30"
                                    : "bg-slate-50/50 border-slate-100 hover:border-amber-400/30"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                                        rem.type === "medicine"
                                          ? "bg-emerald-500/10 text-emerald-500"
                                          : rem.type === "water"
                                          ? "bg-blue-500/10 text-blue-500"
                                          : rem.type === "yoga"
                                          ? "bg-teal-500/10 text-teal-555"
                                          : "bg-purple-500/10 text-purple-500"
                                      }`}>
                                        {rem.type}
                                      </span>
                                      {isHighPr && (
                                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 animate-pulse">
                                          High Focus
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`text-base font-black truncate ${isCompleted ? "line-through text-slate-500" : ""}`}>
                                      {rem.title}
                                    </h4>
                                    {rem.description && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {rem.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-end shrink-0 gap-1">
                                    <div className="px-3 py-1 bg-slate-500/5 border border-slate-500/10 rounded-xl text-xs font-mono font-black flex items-center gap-1.5">
                                      <Clock size={12} className="text-amber-500" />
                                      {rem.time}
                                    </div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                      {rem.repeat ? `Ã°Å¸â€â€ž ${rem.repeat}` : "Once"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-500/5 pt-4">
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    <Volume2 size={12} className="text-blue-500" />
                                    Tone: <span className="uppercase font-extrabold text-[9px]">{rem.sound || "standard"}</span>
                                  </div>

                                  <div className="flex gap-2">
                                    {!isCompleted && (
                                      <button
                                        onClick={() => markDailyReminderStatus(rem.id, "completed")}
                                        className="p-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                      >
                                        Mark Done
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setEditingDailyReminderId(rem.id);
                                        setDailyReminderForm({ ...rem });
                                        setShowDailyReminderModal(true);
                                      }}
                                      className="p-1.5 px-3 bg-slate-500/10 hover:bg-slate-500/25 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDailyReminders((prev) => prev.filter((r) => r.id !== rem.id));
                                        showNotification("Reminder deleted.", "info");
                                      }}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN 8: ONLINE APPOINTMENT LISTING & BOOKING (INLINE SEARCH)
                    ========================================== */}
                {activeTab === "online_apt" && (
                  <motion.div
                    key="online_apt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Stethoscope className="text-teal-500 animate-pulse-slow" /> Book Online Appointment
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        Directly search available partner family clinics by location or department and schedule consultation slots instantly.
                      </p>
                    </div>

                    {/* Dual Search Filters Card */}
                    <div className={`p-6 rounded-[2.5rem] border ${
                      darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200/50 shadow-xs"
                    } space-y-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Location / Name Check */}
                        <div className="md:col-span-2 relative">
                          <Search size={18} className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400" />
                          <input
                            type="text"
                            placeholder="Type clinic name, city (e.g. Pune), doctor name or qualifications..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full pl-11 pr-16 p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 font-bold focus:outline-hidden focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 text-slate-900 dark:text-white shadow-xs"
                          />
                          {searchLocation && (
                            <button
                              onClick={() => setSearchLocation("")}
                              className="absolute right-4 top-3.5 text-slate-500 hover:text-teal-400 text-xs font-black uppercase transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Department Dropdown */}
                        <div className="relative">
                          <Stethoscope size={18} className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400 pointer-events-none" />
                          <select
                            value={searchDepartment}
                            onChange={(e) => setSearchDepartment(e.target.value)}
                            className="w-full pl-11 pr-10 p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 font-bold focus:outline-hidden focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 appearance-none text-slate-900 dark:text-white shadow-xs"
                          >
                            <option value="">All Departments</option>
                            {(() => {
                              const deptsMap = new Map<string, string>(); // lowercase -> original casing
                              Object.values(clinicDetails).forEach((detail: any) => {
                                if (detail?.department && typeof detail.department === "string") {
                                  const dep = detail.department.trim();
                                  if (dep) {
                                    const lower = dep.toLowerCase();
                                    if (!deptsMap.has(lower)) {
                                      deptsMap.set(lower, dep);
                                    }
                                  }
                                }
                              });
                              const allDepts = Array.from(deptsMap.values()).sort((a, b) => a.localeCompare(b));
                              return allDepts.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ));
                            })()}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Filtered Healthcare Partner List</p>
                        <span className="text-[10px] bg-teal-500/15 text-teal-400 font-mono font-black px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
                          {(() => {
                            const queried = clinics.filter((cl) => {
                              const detail = clinicDetails[cl.id] || {};
                              let matchesText = true;
                              if (searchLocation.trim()) {
                                const qStr = searchLocation.trim().toLowerCase();
                                matchesText = (
                                  (cl.name || "").toLowerCase().includes(qStr) ||
                                  (cl.city || "").toLowerCase().includes(qStr) ||
                                  (cl.email || "").toLowerCase().includes(qStr) ||
                                  (detail.address || "").toLowerCase().includes(qStr) ||
                                  (detail.doctor_name || "").toLowerCase().includes(qStr) ||
                                  (detail.qualification || "").toLowerCase().includes(qStr) ||
                                  (detail.department || "").toLowerCase().includes(qStr) ||
                                  (detail.specialization || "").toLowerCase().includes(qStr)
                                );
                              }
                              let matchesDept = true;
                              if (searchDepartment) {
                                const deptLower = searchDepartment.toLowerCase();
                                matchesDept = (detail.department || "").toLowerCase().includes(deptLower) || (detail.specialization || "").toLowerCase().includes(deptLower);
                              }
                              return matchesText && matchesDept;
                            });
                            return queried.length;
                          })()} Available Specialties
                        </span>
                      </div>
                    </div>

                    {/* Clinic Cards Render Block */}
                    <div className="space-y-4">
                      {(() => {
                        const queried = clinics.filter((cl) => {
                          const detail = clinicDetails[cl.id] || {};
                          let matchesText = true;
                          if (searchLocation.trim()) {
                            const qStr = searchLocation.trim().toLowerCase();
                            matchesText = (
                              (cl.name || "").toLowerCase().includes(qStr) ||
                              (cl.city || "").toLowerCase().includes(qStr) ||
                              (cl.email || "").toLowerCase().includes(qStr) ||
                              (detail.address || "").toLowerCase().includes(qStr) ||
                              (detail.doctor_name || "").toLowerCase().includes(qStr) ||
                              (detail.qualification || "").toLowerCase().includes(qStr) ||
                              (detail.department || "").toLowerCase().includes(qStr) ||
                              (detail.specialization || "").toLowerCase().includes(qStr)
                            );
                          }
                          let matchesDept = true;
                          if (searchDepartment) {
                            const deptLower = searchDepartment.toLowerCase();
                            matchesDept = (detail.department || "").toLowerCase().includes(deptLower) || (detail.specialization || "").toLowerCase().includes(deptLower);
                          }
                          return matchesText && matchesDept;
                        });

                        if (queried.length === 0) {
                          return (
                            <div className={`text-center py-16 border border-dashed rounded-[2rem] space-y-3 ${
                              darkMode ? "border-white/5 bg-slate-900/10 text-slate-500 dark:text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-500"
                            }`}>
                              <Hospital size={44} className="mx-auto text-slate-500 dark:text-slate-400/20" />
                              <h4 className="font-extrabold text-sm">No clinics matched your query</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Try checking your spelling, selecting "All Departments", or typing a general region like Pune.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 gap-6">
                            {queried.map((cl) => {
                              const detail = clinicDetails[cl.id] || {};
                              return (
                                <motion.div
                                  key={`inline-clinic-${cl.id}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all hover:border-teal-500/20 ${
                                    darkMode ? "bg-slate-900/30 border-white/5 shadow-2xl" : "bg-white border-slate-200 shadow-sm"
                                  } flex flex-col lg:flex-row lg:items-center justify-between gap-6`}
                                >
                                  <div className="space-y-4 flex-1">
                                    <div className="flex items-start gap-4">
                                      <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl shrink-0">
                                        <Hospital size={26} />
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h4 className={`font-black text-sm sm:text-base ${darkMode ? "text-white" : "text-slate-900"}`}>{cl.name || "CareBridge Partner Clinic"}</h4>
                                          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase rounded-lg">
                                            <Star size={10} className="fill-yellow-500 text-yellow-500" /> {detail.rating || "4.8"}
                                          </span>
                                        </div>
                                        <p className={`text-[11px] font-bold flex items-center gap-1 mt-0.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                          <MapPin size={11} className="text-rose-500 shrink-0" /> {detail.address || cl.city || "Pune Area"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold pt-3 border-t border-slate-500/5">
                                      {/* Doctor Detail */}
                                      <div className="space-y-0.5">
                                        <span className={`text-[9px] uppercase font-black tracking-wider block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Supervising Practitioner</span>
                                        <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.doctor_name || "Dr. Authorized Member"}</p>
                                        <span className={`text-[10px] block truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{detail.qualification || "MBBS Certificate Specialist"}</span>
                                      </div>

                                      {/* Specialty/Department */}
                                      <div className="space-y-0.5">
                                        <span className={`text-[9px] uppercase font-black tracking-wider block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Clinical Specialization</span>
                                        <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.department || "Consultant Generalist"}</p>
                                        <span className={`text-[10px] block truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Reg No: {detail.reg_no || "REG-9921D"}</span>
                                      </div>

                                      {/* Timing / Schedules */}
                                      <div className="space-y-0.5">
                                        <span className={`text-[9px] uppercase font-black tracking-wider block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Consultation timings</span>
                                        <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.timing || "09:00 AM - 05:00 PM"}</p>
                                        <span className={`text-[10px] block truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Mon - Sat Active</span>
                                      </div>

                                      {/* Consultation Fees */}
                                      <div className="space-y-0.5">
                                        <span className={`text-[9px] uppercase font-black tracking-wider block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Consultation Fees</span>
                                        <p className={`font-black text-sm ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>{detail.fees ? `₹ ${detail.fees}` : "Not Specified"}</p>
                                        <span className={`text-[10px] block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Includes Digital Record</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-2.5 justify-end lg:self-stretch shrink-0">
                                    <button
                                      onClick={() => {
                                        setViewingClinic(cl);
                                        setShowClinicProfileModal(true);
                                      }}
                                      className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/15 rounded-xl text-center text-[11px] font-black uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1.5 w-full sm:w-auto lg:w-36 justify-center transition"
                                    >
                                      <Eye size={11} /> View Profile
                                    </button>
                                    {detail.contact_no && (
                                      <a
                                        href={`tel:${detail.contact_no}`}
                                        className="px-4 py-2.5 bg-slate-500/10 hover:bg-slate-500/15 rounded-xl text-center text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5 w-full sm:w-auto lg:w-36 justify-center transition"
                                      >
                                        <Phone size={11} /> Call Clinic
                                      </a>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedClinic(cl);
                                        setBookingForm({
                                          patientName: patientDetails?.name || user?.name || "Rajesh Pawar",
                                          patientAge: patientDetails?.age || "32",
                                          patientGender: patientDetails?.gender || "M",
                                          patientPhone: patientDetails?.phone || user?.phone || "9876543210",
                                          patientAddress: patientDetails?.address || "Hinjewadi, Pune",
                                          preferredDate: getISTDateString(),
                                          preferredTime: "10:00",
                                          preferredAmPm: "AM",
                                        });
                                        setShowBookingModal(true);
                                      }}
                                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-[11px] font-black uppercase tracking-wider text-center w-full sm:w-auto lg:w-36 justify-center transition shadow-lg shadow-teal-500/10"
                                    >
                                      Book Slot
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* ==========================================
                    SCREEN: MY HEALTH PROFILE EDIT FORM
                    ========================================== */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Screen Navigation Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                          <UserIcon className="text-pink-500" /> My Patient Profile
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Configure your vital and contact details to assist clinical operations and enrich A.I. health recommendations.
                        </p>
                      </div>

                      {/* Info Pill */}
                      <span className="self-start sm:self-auto px-3.5 py-1.5 bg-pink-500/10 text-pink-400 font-mono text-[10px] font-black uppercase rounded-2xl flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                        Secure Encrypted Cloud Persistence
                      </span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
                      {/* Left: General & Clinical Information */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className={`p-6 rounded-[2.5rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200"
                        } space-y-5`}>
                          <div className="flex items-center gap-3 border-b border-slate-500/10 pb-4">
                            <PatientAvatar gender={profileForm.gender} name={profileForm.name} size={36} />
                            <h3 className="font-extrabold text-sm uppercase text-slate-500 dark:text-slate-400 tracking-wider">General Information</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Full Name</label>
                              <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                required
                                placeholder="e.g. Rajesh Pawar"
                                className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-sm font-bold ${
                                  darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                                } focus:outline-hidden transition`}
                              />
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Contact Number</label>
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                required
                                placeholder="e.g. 9876543210"
                                className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-sm font-bold ${
                                  darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                                } focus:outline-hidden transition`}
                              />
                            </div>

                            {/* Age */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Age (Years)</label>
                              <input
                                type="number"
                                value={profileForm.age}
                                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                                required
                                placeholder="e.g. 32"
                                className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-sm font-bold ${
                                  darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                                } focus:outline-hidden transition`}
                              />
                            </div>

                            {/* Biological Gender */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Gender</label>
                              <select
                                value={profileForm.gender}
                                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                className={`w-full px-4 py-3 rounded-2xl border text-slate-800 dark:text-white text-sm font-bold ${
                                  darkMode ? "bg-slate-800/40 border-white/5 text-slate-200 focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                                } focus:outline-hidden transition`}
                              >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                              </select>
                            </div>
                          </div>

                          {/* Home Address */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Physical Home Address</label>
                            <textarea
                              value={profileForm.address}
                              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                              required
                              rows={2}
                              placeholder="Complete home details, Locality, Area Code & City (e.g. Hinjewadi Phase 1, Pune)"
                              className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-sm font-bold ${
                                darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                              } focus:outline-hidden transition`}
                            />
                          </div>
                        </div>

                        {/* Chronic conditions & diseases optionally */}
                        <div className={`p-6 rounded-[2.5rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200"
                        } space-y-4`}>
                          <div className="flex items-center gap-3 border-b border-slate-500/10 pb-4">
                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                              <AlertCircle size={18} />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm uppercase text-slate-500 dark:text-slate-400 tracking-wider">Chronic Disease & Medical Conditions</h3>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">These details are synced with your AI Health Coach to customize response modeling.</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Chronic illnesses, Active Diseases, or Allergies (Optional)</label>
                            <textarea
                              value={profileForm.conditions}
                              onChange={(e) => setProfileForm({ ...profileForm, conditions: e.target.value })}
                              rows={4}
                              placeholder="e.g. Type-2 Diabetes diagnosed in 2021, Hypertension, Mild penicillin allergy, Lactose sensitivity"
                              className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-sm font-bold ${
                                darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-slate-200 focus:border-pink-500"
                              } focus:outline-hidden transition`}
                            />
                            <div className="flex flex-wrap gap-2 pt-2">
                              {["Type-2 Diabetes", "Hypertension", "Asthma", "Thyroid", "Cholesterol", "Allergy"].map((pill) => (
                                <button
                                  type="button"
                                  key={pill}
                                  onClick={() => {
                                    const trimmed = profileForm.conditions.trim();
                                    const prefix = trimmed ? trimmed + ", " : "";
                                    if (!trimmed.toLowerCase().includes(pill.toLowerCase())) {
                                      setProfileForm({ ...profileForm, conditions: prefix + pill });
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-slate-500/10 hover:bg-slate-500/15 border border-slate-500/5 hover:border-slate-500/15 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 rounded-lg transition shrink-0"
                                >
                                  + {pill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Emergency Contacts Directory */}
                      <div className="space-y-6">
                        <div className={`p-6 rounded-[2.5rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200"
                        } space-y-5`}>
                          <div className="flex items-center gap-3 border-b border-slate-500/10 pb-4">
                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                              <PhoneCall size={18} />
                            </div>
                            <h3 className="font-extrabold text-sm uppercase text-slate-500 dark:text-slate-400 tracking-wider">Emergency Contacts</h3>
                          </div>

                          {/* Emergency Supervising Doctor */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-rose-500 tracking-wider block">Supervising / Emergency Doctor</label>
                            <input
                              type="text"
                              value={profileForm.emergencyDoctor}
                              onChange={(e) => setProfileForm({ ...profileForm, emergencyDoctor: e.target.value })}
                              required
                              placeholder="Doctor Name & Mob. (e.g. Dr. Anil Patil - 9821456172)"
                              className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-xs font-bold ${
                                darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-rose-500" : "bg-slate-50 border-slate-200 focus:border-rose-500"
                              } focus:outline-hidden transition`}
                            />
                          </div>

                          {/* Emergency Relative Contact */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider block">Emergency Relative</label>
                            <input
                              type="text"
                              value={profileForm.emergencyRelative}
                              onChange={(e) => setProfileForm({ ...profileForm, emergencyRelative: e.target.value })}
                              required
                              placeholder="Relative Name & Mob. (e.g. Sunita Pawar (Wife) - 9765432109)"
                              className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-xs font-bold ${
                                darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-rose-500" : "bg-slate-50 border-slate-200 focus:border-rose-500"
                              } focus:outline-hidden transition`}
                            />
                          </div>

                          {/* Emergency Other Call Contact */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider block font-mono">Emergency Other / Neighbor (Optional)</label>
                            <input
                              type="text"
                              value={profileForm.emergencyOther}
                              onChange={(e) => setProfileForm({ ...profileForm, emergencyOther: e.target.value })}
                              placeholder="Specify Relation & Mob. (e.g. Neighbor Amol Deshmukh - 9021452178)"
                              className={`w-full px-4 text-slate-800 dark:text-white py-3 rounded-2xl border text-xs font-bold ${
                                darkMode ? "bg-slate-800/40 border-white/5 text-white focus:border-rose-500" : "bg-slate-50 border-slate-200 focus:border-rose-500"
                              } focus:outline-hidden transition`}
                            />
                          </div>
                        </div>

                        {/* Interactive Status Panel showing how AI Coach utilizes this */}
                        <div className={`p-6 rounded-[2.5rem] border ${
                          darkMode ? "bg-slate-900/40 border-[#EC4899]/15" : "bg-[#EC4899]/5 border-[#EC4899]/20"
                        } space-y-4`}>
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-pink-500 shrink-0" />
                            <h4 className="font-extrabold text-xs uppercase text-pink-600 dark:text-pink-400 tracking-wider">Health Coach Integration</h4>
                          </div>
                          <p className="text-xs leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                            By filling out your profile, the virtual AI coach contextualizes its reasoning. It tracks your disease profiles, alerts relative handles on critical statistics, and guides wellness strategies with personal fidelity.
                          </p>
                          <div className="p-3.5 bg-slate-500/5 rounded-2xl border border-slate-500/5 text-[10px] font-mono whitespace-pre-wrap leading-tight text-slate-500">
                            <strong>ACTIVE CONTEXT SYSTEM:</strong>{"\n"}
                            Ã¢â‚¬Â¢ diseases: {profileForm.conditions || "Unset"}{"\n"}
                            Ã¢â‚¬Â¢ call_dr: {profileForm.emergencyDoctor || "Unset"}{"\n"}
                            Ã¢â‚¬Â¢ contact_relative: {profileForm.emergencyRelative || "Unset"}
                          </div>
                        </div>

                        {/* Legal & Privacy Preferences Card */}
                        <div className={`p-6 rounded-[2.5rem] border ${
                          darkMode ? "bg-slate-900/30 border-white/5 text-white" : "bg-white border-slate-200 text-slate-800"
                        } space-y-5`}>
                          <div className="flex items-center gap-3 border-b border-slate-500/10 pb-4">
                            <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl">
                              <Shield size={18} />
                            </div>
                            <h3 className="font-extrabold text-sm uppercase text-slate-500 dark:text-slate-400 tracking-wider">Legal & Privacy Settings</h3>
                          </div>

                          {/* WhatsApp Consent Option */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-500/5 rounded-2xl border border-slate-500/5">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">WhatsApp Updates</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Receive immediate digital referral reports on WhatsApp</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={profileForm.whatsappConsent} 
                                onChange={(e) => setProfileForm({ ...profileForm, whatsappConsent: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                            </label>
                          </div>

                          {/* Notification Consent Option */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-500/5 rounded-2xl border border-slate-500/5">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Clinical Alerts & Alerts</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Push notifications on critical indicators and queues</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={profileForm.notificationConsent} 
                                onChange={(e) => setProfileForm({ ...profileForm, notificationConsent: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                            </label>
                          </div>

                          {/* Policies Previews and Sovereign Data Access Information */}
                          <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl space-y-3">
                            <span className="text-[10px] uppercase font-black text-yellow-500 tracking-wider">Sovereign Patient Data Rights</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                              Your medical health locker is compliant under CareBridge+ privacy protocols. You retain full privilege to request a digital download ledger or instant database purge by mailing <strong className="text-pink-500 hover:underline">compliance@carebridge.in</strong>.
                            </p>
                            <div className="flex items-center gap-4 pt-1">
                              <button 
                                type="button"
                                onClick={() => setActiveLegalModal("privacy")}
                                className="text-[10px] text-pink-500 hover:underline font-black uppercase tracking-wider text-left cursor-pointer"
                              >
                                View Privacy Manual
                              </button>
                              <span className="text-slate-500 text-[10px]">Ã¢â‚¬Â¢</span>
                              <button 
                                type="button"
                                onClick={() => setActiveLegalModal("terms")}
                                className="text-[10px] text-pink-500 hover:underline font-black uppercase tracking-wider text-left cursor-pointer"
                              >
                                View Policy Ledger
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Save Trigger Button */}
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 disabled:cursor-not-allowed uppercase text-white font-extrabold text-xs rounded-2.5xl tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 transition-transform active:scale-95 duration-200"
                        >
                          {isSavingProfile ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" /> Synchronizing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} /> Commit Changes & Save Profile
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* COMPLIANCE OVERLAY PREVIEWS */}
                    <AnimatePresence>
                      {activeLegalModal && (
                        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 sm:p-8">
                          <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm shadow-inner" onClick={() => setActiveLegalModal(null)} />
                          
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className={`relative w-full max-w-4xl h-[400px] rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${
                              darkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/30">
                              <div className="flex items-center gap-3">
                                {activeLegalModal === "privacy" ? (
                                  <>
                                    <Shield className="text-pink-500" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wide">Enterprise Privacy Policy manual</h3>
                                  </>
                                ) : (
                                  <>
                                    <Shield className="text-pink-400" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wide">Enterprise Terms & Conditions ledger</h3>
                                  </>
                                )}
                              </div>
                              <button 
                                type="button"
                                onClick={() => setActiveLegalModal(null)}
                                className="p-1.5 rounded-xl bg-gray-150 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-750 transition-all cursor-pointer"
                              >
                                <X size={18} />
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                              <div className={`p-8 sm:p-12 space-y-6 text-xs font-bold leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {activeLegalModal === "privacy" ? (
                                  <>
                                    <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Healthcare Privacy Policy Protocol</h4>
                                    <p>This comprehensive document defines secure procedures under Bangalore legal frameworks. All details are kept in zero-leak configurations.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">1. Data Storage & Segregation</h5>
                                        <p>Every active patient vitals record is parsed in isolated blocks. No diagnostic or phone identifier data is linked to external ad trackers.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">2. AI health coach parameters</h5>
                                        <p>Our server-side Gemini API interfaces operate over a non-persistent, proxy network structure keeping patient identity unexposed.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">3. Active Notification opt-ins</h5>
                                        <p>Automated SMS, emails, and active WhatsApp referral timers utilize credentialed message gateways that support direct consent cancellation.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">4. Sovereign Jurisdiction</h5>
                                        <p>In accordance with global standard, files are archived for 7 medical audit years and fully purged subsequently on legal requests.</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <h4 className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Enterprise Terms of Use Regulation</h4>
                                    <p>Accepting this agreement is mandatory before operating CareBridge+ healthcare sandbox portals. All sessions are subject to access trace logging.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">1. Registered doctor responsibility</h5>
                                        <p>Clinical workspace operators hold entire personal and official liability for medical records, OPD prescriptions, and diagnostic allocations.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">2. Diagnostic disclaimer</h5>
                                        <p>Vitals chimes, queue schedules, and AI analyses are workflow reference points. Clinicians must confirm diagnoses independently.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">3. Indian Jurisdiction Laws</h5>
                                        <p>CareBridge+ terms and agreements are subject to the exclusive jurisdiction ofcourts of Bangalore, Karnataka State, Republic of India.</p>
                                      </div>
                                      <div>
                                        <h5 className="font-black uppercase mb-2 text-pink-500">4. Account termination terms</h5>
                                        <p>We hold absolute privileges to freeze profiles showing consecutive failed authorization trials, illegal referral entries, or data scraping behaviour.</p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </main>
        </div>

        {/* ==========================================
            MOBILE VISUALLY COHESIVE BOTTOM TASKBAR
            ========================================== */}
        <nav className={`fixed bottom-0 left-0 right-0 border-t lg:hidden z-50 px-4 py-2 flex justify-between items-center pb-8 shadow-xl ${
          darkMode ? "bg-[#060b1e]/95 border-white/5 backdrop-blur-xl" : "bg-white/95 border-slate-150 backdrop-blur-xl"
        }`}>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Home" },
            { id: "ai_helper", icon: Brain, label: "Coach" },
            { id: "my_medicine", icon: Pill, label: "Meds" },
            { id: "reports", icon: ClipboardList, label: "Reports" },
          ].map((itm) => (
            <button
              key={itm.id}
              onClick={() => setActiveTab(itm.id)}
              className={`flex flex-col items-center gap-1 flex-1 py-1.5 transition-all outline-hidden ${
                activeTab === itm.id ? "text-blue-500 font-black scale-105" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <itm.icon size={20} />
              <span className="text-[9px] uppercase font-bold tracking-tight">{itm.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-1 flex-1 py-1.5 text-slate-500 dark:text-slate-400 outline-hidden"
          >
            <Menu size={20} />
            <span className="text-[9px] uppercase font-bold tracking-tight">More</span>
          </button>
        </nav>

        {/* ==========================================
            POPUP CLINICAL RECORD LOGS MODAL
            ========================================== */}
        <AnimatePresence>
          {showLogModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden border p-6 space-y-6 ${
                  darkMode ? "bg-[#0c1226] border-white/5 text-white" : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black">Record Clinical Parameters</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Assemble precise physiological records</p>
                  </div>
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="p-1 px-2.5 bg-slate-500/10 hover:bg-slate-500/20 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleLogVitalsSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        value={logForm.bp_systolic}
                        onChange={(e) => setLogForm({ ...logForm, bp_systolic: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        value={logForm.bp_diastolic}
                        onChange={(e) => setLogForm({ ...logForm, bp_diastolic: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Blood Sugar (mg/dL)</label>
                      <input
                        type="number"
                        value={logForm.sugar}
                        onChange={(e) => setLogForm({ ...logForm, sugar: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Heart Pulse (bpm)</label>
                      <input
                        type="number"
                        value={logForm.pulse}
                        onChange={(e) => setLogForm({ ...logForm, pulse: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">SpO2 Oxygen %</label>
                      <input
                        type="number"
                        value={logForm.oxygen}
                        onChange={(e) => setLogForm({ ...logForm, oxygen: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                        min="70"
                        max="100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Body Weight (kg)</label>
                      <input
                        type="number"
                        value={logForm.weight}
                        onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wide rounded-2xl"
                  >
                    Schedule Medication reminders
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReminderModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowReminderModal(false); resetForm(); }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${
                  darkMode
                    ? "bg-[#0b1120] text-white border-white/8 shadow-black/60"
                    : "bg-white text-slate-900 border-slate-200/80 shadow-slate-300/40"
                }`}
              >
                {/* ── HEADER BAR ── */}
                <div className={`sticky top-0 z-10 flex items-center justify-between px-7 py-5 border-b ${darkMode ? "bg-[#0b1120] border-white/8" : "bg-white border-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <Bell size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-base tracking-tight uppercase">SCHEDULE NEW REMEDY ALARM</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>CONFIGURE MEDICATION TIMELINE</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowReminderModal(false); resetForm(); }}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddReminderSubmit} className="p-7 space-y-5">

                  {/* ── SECTION 1: MEDICINE IDENTITY ── */}
                  <div className={`rounded-2xl border p-4 space-y-4 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px]">1</span>
                      MEDICINE IDENTITY
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>MEDICINE NAME *</label>
                        <input
                          required
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value.toUpperCase())}
                          placeholder="E.G. PARACETAMOL"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white/8" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-emerald-400 shadow-sm"}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>GENERIC ALTERNATIVE (OPTIONAL)</label>
                        <input
                          type="text"
                          value={formGeneric}
                          onChange={(e) => setFormGeneric(e.target.value.toUpperCase())}
                          placeholder="E.G. ACETAMINOPHEN"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white/8" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-emerald-400 shadow-sm"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 2: DOSAGE PARAMETERS ── */}
                  <div className={`rounded-2xl border p-4 space-y-4 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px]">2</span>
                      DOSAGE PARAMETERS
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>DOSAGE TYPE</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as any)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-[#0b1120] border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm"}`}
                        >
                          {["Tablet", "Capsule", "Syrup", "Injection", "Drops", "Ointment", "Powder"].map(t => (
                            <option key={t} value={t}>{t.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>STRENGTH (E.G. 500MG, 10ML)</label>
                        <input
                          type="text"
                          value={formStrength}
                          onChange={(e) => setFormStrength(e.target.value.toUpperCase())}
                          placeholder="E.G. 500 MG"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-blue-400 shadow-sm"}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>QUANTITY PER DOSE</label>
                        <input
                          type="text"
                          value={formQuantityPerDose}
                          onChange={(e) => setFormQuantityPerDose(e.target.value)}
                          placeholder="E.G. 1 TABLET"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-blue-400 shadow-sm"}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>DOSAGE SCHEDULE LOOP</label>
                        <select
                          value={formSchedule}
                          onChange={(e) => handleScheduleChange(e.target.value as any)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-[#0b1120] border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm"}`}
                        >
                          {["Once Daily", "Twice Daily", "Thrice Daily", "Four Times Daily", "Weekly", "Custom"].map(s => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>MEAL ASSOCIATION</label>
                        <select
                          value={formMealTime}
                          onChange={(e) => setFormMealTime(e.target.value as any)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all ${darkMode ? "bg-[#0b1120] border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm"}`}
                        >
                          <option value="after">TAKE AFTER FOOD</option>
                          <option value="before">TAKE BEFORE FOOD</option>
                          <option value="with">TAKE WITH FOOD</option>
                          <option value="empty">TAKE ON EMPTY STOMACH</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 3: ALARM TIMES ── */}
                  <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px]">3</span>
                      REMINDER ALARM TIMES (HH:MM)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formTimings.map((time, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${darkMode ? "bg-white/8 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                          <Clock size={13} className="text-amber-500 shrink-0" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const copy = [...formTimings];
                              copy[idx] = e.target.value;
                              setFormTimings(copy);
                            }}
                            className={`bg-transparent text-sm font-black outline-none font-mono w-[72px] ${darkMode ? "text-white" : "text-slate-800"}`}
                          />
                          {formTimings.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormTimings(formTimings.filter((_, i) => i !== idx))}
                              className="p-0.5 text-rose-400 hover:text-rose-500 transition-all cursor-pointer"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormTimings([...formTimings, "12:00"])}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-black uppercase tracking-wider cursor-pointer border border-amber-500/20 transition-all"
                      >
                        <Plus size={12} /> ADD TIME
                      </button>
                    </div>
                  </div>

                  {/* ── SECTION 4: TREATMENT DURATION ── */}
                  <div className={`rounded-2xl border p-4 space-y-4 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-[9px]">4</span>
                      TREATMENT DURATION & STOCK
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>START DATE</label>
                        <input
                          required
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border transition-all font-mono ${darkMode ? "bg-white/5 border-white/10 text-white focus:border-purple-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-purple-400 shadow-sm"}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>TREATMENT DURATION (DAYS)</label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={formDurationDays}
                          onChange={(e) => setFormDurationDays(e.target.value)}
                          placeholder="E.G. 7"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border transition-all font-mono ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-purple-400 shadow-sm"}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>DERIVED END DATE</label>
                        <input
                          readOnly
                          disabled
                          type="date"
                          value={formEndDate}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border font-mono cursor-not-allowed ${darkMode ? "bg-white/3 border-white/5 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>INITIAL PILL STOCK AVAILABLE</label>
                        <input
                          type="number"
                          min="1"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          placeholder="E.G. 30"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border transition-all font-mono ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-purple-400 shadow-sm"}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>LOW STOCK ALERT THRESHOLD</label>
                        <input
                          type="number"
                          min="1"
                          value={formRefillThreshold}
                          onChange={(e) => setFormRefillThreshold(e.target.value)}
                          placeholder="E.G. 5"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none border transition-all font-mono ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-purple-400 shadow-sm"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 5: AUDIO ALARM LANGUAGE ── */}
                  <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-rose-400" : "text-rose-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-[9px]">5</span>
                      AUDIO ALARM LANGUAGE
                    </p>
                    <p className={`text-[10px] font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>SELECT THE LANGUAGE FOR VOICE REMINDER ANNOUNCEMENTS</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: "english", label: "ENGLISH", sub: "IN ENGLISH", emoji: "🇬🇧" },
                        { id: "hindi",   label: "हिंदी",   sub: "IN HINDI",   emoji: "🇮🇳" },
                        { id: "marathi", label: "मराठी",  sub: "IN MARATHI",  emoji: "🫶" },
                      ] as const).map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setFormAudioLang(lang.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                            formAudioLang === lang.id
                              ? "border-rose-500 bg-rose-500/10 text-rose-500 shadow-md shadow-rose-500/15"
                              : darkMode
                                ? "border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white"
                                : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-500 shadow-sm"
                          }`}
                        >
                          <span className="text-xl">{lang.emoji}</span>
                          <span>{lang.label}</span>
                          <span className={`text-[8px] font-bold tracking-widest ${formAudioLang === lang.id ? "text-rose-400" : darkMode ? "text-slate-600" : "text-slate-400"}`}>{lang.sub}</span>
                        </button>
                      ))}
                    </div>
                    {/* Preview the alarm announcement text */}
                    <div className={`mt-1 p-3 rounded-xl border text-[11px] font-semibold leading-relaxed ${darkMode ? "bg-black/20 border-white/5 text-slate-400" : "bg-slate-100/80 border-slate-200 text-slate-500"}`}>
                      🔔{" "}
                      {formAudioLang === "marathi"
                        ? `"${formName || "औषध"} घेण्याची वेळ झाली आहे. ${formMealTime === "after" ? "जेवणानंतर" : formMealTime === "before" ? "जेवणापूर्वी" : formMealTime === "with" ? "जेवणासोबत" : "रिकाम्या पोटी"} ${formQuantityPerDose || "1"} ${formType === "Tablet" ? "गोळी" : formType === "Syrup" ? "चमचा" : formType} घ्या."`
                        : formAudioLang === "hindi"
                        ? `"${formName || "दवाई"} लेने का समय हो गया है। ${formMealTime === "after" ? "खाने के बाद" : formMealTime === "before" ? "खाने से पहले" : formMealTime === "with" ? "खाने के साथ" : "खाली पेट"} ${formQuantityPerDose || "1"} ${formType === "Tablet" ? "गोली" : formType === "Syrup" ? "चम्मच" : formType} लें।"`
                        : `"IT IS TIME TO TAKE YOUR ${formName || "MEDICINE"}. PLEASE TAKE ${formQuantityPerDose || "1"} ${formType.toUpperCase()} ${formMealTime === "after" ? "AFTER FOOD" : formMealTime === "before" ? "BEFORE FOOD" : formMealTime === "with" ? "WITH FOOD" : "ON EMPTY STOMACH"}."`}
                    </div>
                  </div>

                  {/* ── SECTION 6: DOCTOR NOTES ── */}
                  <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? "bg-white/3 border-white/8" : "bg-slate-50/80 border-slate-200/60"}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.22em] flex items-center gap-2 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[9px]">6</span>
                      DOCTOR INSTRUCTIONS / PATIENT NOTES
                    </p>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value.toUpperCase())}
                      placeholder="E.G. DO NOT CONSUME ALCOHOL WITHIN 6 HOURS. CHEW TABLET COMPLETELY."
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide outline-none border transition-all leading-relaxed resize-none ${darkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-cyan-400 shadow-sm"}`}
                    />
                  </div>

                  {/* ── SUBMIT ── */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-[0.98]"
                  >
                    ✓ APPLY MEDICATION ALARM TIMELINE
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            POPUP CLINICS SEARCH DETAILS BOOKINGS MODAL
            ========================================== */}
        <AnimatePresence>
          {showClinicSearchModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-4xl rounded-[2.5rem] overflow-hidden border p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar ${
                  darkMode ? "bg-[#0c1226] border-white/5 text-white" : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">Search Clinics & Specializations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Match active healthcare facilities near Pune area</p>
                  </div>
                  <button
                    onClick={() => setShowClinicSearchModal(false)}
                    className="p-1 px-3 bg-slate-500/10 text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Field (2 columns on medium screens and up) */}
                    <div className="md:col-span-2 relative">
                      <Search size={18} className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search clinic name, city location, practitioner doctor or degree (e.g. Pune, Pediatric)..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full pl-11 pr-16 p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 font-bold focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-slate-900 dark:text-white shadow-xs"
                      />
                      {searchLocation && (
                        <button
                          onClick={() => setSearchLocation("")}
                          className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300 text-xs font-black uppercase transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Department Dropdown (1 column) */}
                    <div className="relative">
                      <Stethoscope size={18} className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400 pointer-events-none" />
                      <select
                        value={searchDepartment}
                        onChange={(e) => setSearchDepartment(e.target.value)}
                        className="w-full pl-11 pr-10 p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 font-bold focus:outline-hidden focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 appearance-none text-slate-900 dark:text-white shadow-xs"
                      >
                        <option value="">All Departments</option>
                        {(() => {
                          const deptsMap = new Map<string, string>(); // lowercase -> original casing
                          Object.values(clinicDetails).forEach((detail: any) => {
                            if (detail?.department && typeof detail.department === "string") {
                              const dep = detail.department.trim();
                              if (dep) {
                                const lower = dep.toLowerCase();
                                if (!deptsMap.has(lower)) {
                                  deptsMap.set(lower, dep);
                                }
                              }
                            }
                          });
                          const allDepts = Array.from(deptsMap.values()).sort((a, b) => a.localeCompare(b));
                          return allDepts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ));
                        })()}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Available Healthcare Units</p>
                      <span className="text-[10px] bg-blue-500/15 text-blue-400 font-mono font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping"></span>
                        {(() => {
                          const queried = clinics.filter((cl) => {
                            const detail = clinicDetails[cl.id] || {};
                            // text check
                            let matchesText = true;
                            if (searchLocation.trim()) {
                              const qStr = searchLocation.trim().toLowerCase();
                              matchesText = (
                                (cl.name || "").toLowerCase().includes(qStr) ||
                                (cl.city || "").toLowerCase().includes(qStr) ||
                                (cl.email || "").toLowerCase().includes(qStr) ||
                                (detail.address || "").toLowerCase().includes(qStr) ||
                                (detail.doctor_name || "").toLowerCase().includes(qStr) ||
                                (detail.qualification || "").toLowerCase().includes(qStr) ||
                                (detail.department || "").toLowerCase().includes(qStr) ||
                                (detail.specialization || "").toLowerCase().includes(qStr)
                              );
                            }
                            // dept check
                            let matchesDept = true;
                            if (searchDepartment) {
                              const deptLower = searchDepartment.toLowerCase();
                              matchesDept = (detail.department || "").toLowerCase().includes(deptLower) || (detail.specialization || "").toLowerCase().includes(deptLower);
                            }
                            return matchesText && matchesDept;
                          });
                          return queried.length;
                        })()} Matches Found
                      </span>
                    </div>
                    
                    {(() => {
                      const queried = clinics.filter((cl) => {
                        const detail = clinicDetails[cl.id] || {};
                        // text check
                        let matchesText = true;
                        if (searchLocation.trim()) {
                          const qStr = searchLocation.trim().toLowerCase();
                          matchesText = (
                            (cl.name || "").toLowerCase().includes(qStr) ||
                            (cl.city || "").toLowerCase().includes(qStr) ||
                            (cl.email || "").toLowerCase().includes(qStr) ||
                            (detail.address || "").toLowerCase().includes(qStr) ||
                            (detail.doctor_name || "").toLowerCase().includes(qStr) ||
                            (detail.qualification || "").toLowerCase().includes(qStr) ||
                            (detail.department || "").toLowerCase().includes(qStr) ||
                            (detail.specialization || "").toLowerCase().includes(qStr)
                          );
                        }
                        // dept check
                        let matchesDept = true;
                        if (searchDepartment) {
                          const deptLower = searchDepartment.toLowerCase();
                          matchesDept = (detail.department || "").toLowerCase().includes(deptLower) || (detail.specialization || "").toLowerCase().includes(deptLower);
                        }
                        return matchesText && matchesDept;
                      });

                      if (queried.length === 0) {
                        return (
                          <div className="text-center py-12 border border-dashed border-slate-500/10 rounded-3xl space-y-2">
                            <Hospital size={44} className="mx-auto text-slate-500 dark:text-slate-400/20" />
                            <h4 className="font-extrabold text-sm">No clinics matched your query</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Try typing a city name like "Pune", specialty like "Physician", or a doctor's name.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                          {queried.map((cl) => {
                            const detail = clinicDetails[cl.id] || {};
                            return (
                              <div
                                key={cl.id}
                                className={`p-5 rounded-[2rem] border relative overflow-hidden transition-all hover:border-blue-500/20 ${
                                  darkMode ? "bg-slate-900/30 border-white/5" : "bg-slate-50 border-slate-200"
                                } flex flex-col lg:flex-row lg:items-center justify-between gap-6`}
                              >
                                <div className="space-y-4 flex-1">
                                  <div className="flex items-start gap-3">
                                    <div className="p-3 bg-blue-550/10 text-blue-400 rounded-2xl shrink-0">
                                      <Hospital size={24} />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className={`font-black text-sm sm:text-base ${darkMode ? "text-white" : "text-slate-900"}`}>{cl.name || "CareBridge Partner Clinic"}</h4>
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase rounded-lg">
                                          <Star size={10} className="fill-yellow-500 text-yellow-500 animate-pulse-slow" /> {detail.rating || "4.8"}
                                        </span>
                                      </div>
                                      <p className={`text-[11px] font-bold flex items-center gap-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                        <MapPin size={11} className="text-rose-500 shrink-0" /> {detail.address || cl.city || "Pune Area"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold pt-2 border-t border-slate-500/5">
                                    {/* Doctor Detail */}
                                    <div className="space-y-0.5">
                                      <span className={`text-[9px] uppercase font-black tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Supervising Practitioner</span>
                                      <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.doctor_name || "Dr. Authorized Member"}</p>
                                      <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{detail.qualification || "MBBS Certificate Specialist"}</span>
                                    </div>

                                    {/* Specialty/Department */}
                                    <div className="space-y-0.5">
                                      <span className={`text-[9px] uppercase font-black tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Clinical Specialization</span>
                                      <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.department || "Consultant Generalist"}</p>
                                      <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Reg No: {detail.reg_no || "REG-9921D"}</span>
                                    </div>

                                    {/* Timing / Schedules */}
                                    <div className="space-y-0.5">
                                      <span className={`text-[9px] uppercase font-black tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Consultation timings</span>
                                      <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{detail.timing || "09:00 AM - 05:00 PM"}</p>
                                      <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Mon - Sat Active</span>
                                    </div>

                                    {/* Consultation Fees */}
                                    <div className="space-y-0.5">
                                      <span className={`text-[9px] uppercase font-black tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Consultation Fees</span>
                                      <p className={`font-black text-sm ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>{detail.fees ? `₹ ${detail.fees}` : "Not Specified"}</p>
                                      <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Includes Digital Record</span>
                                    </div>
                                  </div>

                                  {/* Additional Details if available */}
                                  {detail.visiting_doctors && (
                                    <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                                      <span className="font-black text-slate-600 dark:text-slate-300 mr-2 uppercase tracking-wide animate-pulse-slow">Visiting Consultants:</span>
                                      {typeof detail.visiting_doctors === "string"
                                        ? detail.visiting_doctors
                                        : Array.isArray(detail.visiting_doctors)
                                        ? detail.visiting_doctors
                                            .map((vd: any) =>
                                              typeof vd === "string"
                                                ? vd
                                                : [vd.name, vd.department, vd.qualification, vd.time]
                                                    .filter(Boolean)
                                                    .join(" · ")
                                            )
                                            .filter(Boolean)
                                            .join("  |  ")
                                        : String(detail.visiting_doctors)}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-2 justify-end lg:self-stretch shrink-0">
                                  <button
                                    onClick={() => {
                                      setViewingClinic(cl);
                                      setShowClinicProfileModal(true);
                                    }}
                                    className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/15 rounded-xl text-center text-[11px] font-black uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1.5 w-full sm:w-auto lg:w-36 justify-center transition"
                                  >
                                    <Eye size={11} /> View Profile
                                  </button>
                                  {detail.contact_no && (
                                    <a
                                      href={`tel:${detail.contact_no}`}
                                      className="px-4 py-2.5 bg-slate-500/10 hover:bg-slate-500/15 rounded-xl text-center text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5 w-full sm:w-auto lg:w-36 justify-center transition"
                                    >
                                      <Phone size={11} /> Call Clinic
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedClinic(cl);
                                      setBookingForm({
                                        patientName: patientDetails?.name || user?.name || "Rajesh Pawar",
                                        patientAge: patientDetails?.age || "32",
                                        patientGender: patientDetails?.gender || "M",
                                        patientPhone: patientDetails?.phone || user?.phone || "9876543210",
                                        patientAddress: patientDetails?.address || "Hinjewadi, Pune",
                                        preferredDate: getISTDateString(),
                                        preferredTime: "10:00",
                                        preferredAmPm: "AM",
                                      });
                                      setShowBookingModal(true);
                                      setShowClinicSearchModal(false);
                                    }}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-[11px] font-black uppercase tracking-wider text-center w-full sm:w-auto lg:w-36 justify-center transition shadow-lg shadow-blue-500/10 animate-pulse-slow"
                                  >
                                    Book Slot
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            POPUP CLINICAL BOOKINGS SCHEDULER MODAL
            ========================================== */}
        <AnimatePresence>
          {showBookingModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden border p-6 space-y-6 ${
                  darkMode ? "bg-[#0c1226] border-white/5 text-white" : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">Configure Clinic booking slot</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scheduling with: {selectedClinic?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-1 px-3 bg-slate-500/10 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleBookAppointmentSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2.5 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span>Ã°Å¸â€œâ€¹ Profile details (Name, Age, Address, Phone) auto-generated!</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Patient Name</label>
                    <input
                      type="text"
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Patient age</label>
                      <input
                        type="number"
                        placeholder="Age"
                        value={bookingForm.patientAge}
                        onChange={(e) => setBookingForm({ ...bookingForm, patientAge: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="Primary Phone"
                        value={bookingForm.patientPhone}
                        onChange={(e) => setBookingForm({ ...bookingForm, patientPhone: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Patient Place / Address Input */}
                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Patient Area / Place</label>
                    <input
                      type="text"
                      placeholder="e.g. Kothrud, Pune"
                      value={bookingForm.patientAddress}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientAddress: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Appointment Date</label>
                      <input
                        type="date"
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                        style={{ colorScheme: darkMode ? "dark" : "light" }}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Slot Time (AM / PM)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="e.g. 10:30"
                            value={bookingForm.preferredTime}
                            onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white font-bold font-mono focus:outline-hidden focus:border-blue-500/50"
                          />
                        </div>
                        
                        <div className="flex bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setBookingForm({ ...bookingForm, preferredAmPm: "AM" })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                              bookingForm.preferredAmPm === "AM"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingForm({ ...bookingForm, preferredAmPm: "PM" })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                              bookingForm.preferredAmPm === "PM"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase"
                  >
                    Confirm schedule Slot
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            POPUP CLINIC FULL PROFILE DETAILS MODAL
            ========================================== */}
        <AnimatePresence>
          {showClinicProfileModal && viewingClinic && (() => {
            const detail = clinicDetails[viewingClinic.id] || viewingClinic.detail || {};
            return (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1050] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`w-full max-w-2xl rounded-[2.5rem] overflow-hidden border shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar ${
                    darkMode ? "bg-[#0c1226] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  {/* Aspect Cover Header */}
                  <div className="relative h-44 bg-gradient-to-r from-teal-600/30 to-blue-600/30 overflow-hidden shrink-0">
                    {detail.banner ? (
                      <img src={detail.banner} alt="Clinic Banner" className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-grid-pattern opacity-10" />
                    )}
                    <button
                      onClick={() => setShowClinicProfileModal(false)}
                      className="absolute top-5 right-5 p-2 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-sm text-white rounded-full transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    <div className="absolute bottom-4 left-6 flex items-end gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-md overflow-hidden relative shrink-0">
                        {detail.logo ? (
                          <img src={detail.logo} alt="Clinic Logo" className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${viewingClinic.name || "Clinic"}&backgroundColor=1E88E5`}
                            alt="Clinic Logo Default"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="-mb-1 space-y-0.5">
                        <span className="px-2.5 py-0.5 bg-teal-500/15 text-teal-400 text-[10px] font-black uppercase rounded-lg inline-block mb-1">
                          Partner Member
                        </span>
                        <h3 className="text-lg font-black tracking-tight text-white drop-shadow-md truncate max-w-xs sm:max-w-md">
                          {viewingClinic.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-6">
                    {/* Key Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className={`p-3 rounded-2xl border text-center ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-slate-50 border-slate-150"}`}>
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block mb-0.5">Clinic Rating</span>
                        <div className="flex items-center justify-center gap-1">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          <span className="font-extrabold text-sm">{detail.rating || "4.8"}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-center ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-slate-50 border-slate-150"}`}>
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block mb-0.5">Experience</span>
                        <span className="font-extrabold text-sm text-teal-450">10+ Years</span>
                      </div>
                      <div className={`p-3 rounded-2xl border text-center ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-slate-50 border-slate-150"}`}>
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block mb-0.5">Consultation Fees</span>
                        <span className="font-black text-sm text-emerald-450">{detail.fees ? `₹ ${detail.fees}` : "Not Specified"}</span>
                      </div>
                      <div className={`p-3 rounded-2xl border text-center ${darkMode ? "bg-slate-900/50 border-white/5" : "bg-slate-50 border-slate-150"}`}>
                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block mb-0.5">Open Days</span>
                        <span className="font-bold text-sm text-blue-450">Mon - Sat</span>
                      </div>
                    </div>

                    {/* Practitioner & Registration details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Supervising Doctor */}
                      <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900/20 border-white/5" : "bg-slate-50 border-slate-150"} space-y-2`}>
                        <div className="flex items-center gap-2">
                          <div className="p-1 px-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-black">MD</div>
                          <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Supervising Practitioner</h4>
                        </div>
                        <div>
                          <p className="font-extrabold text-base">{detail.doctor_name || "Dr. Authorized Member"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">{detail.qualification || "MBBS Certificate Specialist"}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">Registration No: {detail.reg_no || "REG-9921D"}</p>
                        </div>
                      </div>

                      {/* Specialist Department info */}
                      <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900/20 border-white/5" : "bg-slate-50 border-slate-150"} space-y-2`}>
                        <div className="flex items-center gap-2">
                          <Stethoscope size={16} className="text-teal-400" />
                          <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Clinical Specialization</h4>
                        </div>
                        <div>
                          <p className="font-extrabold text-base">{detail.department || "Consultant Generalist"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">{detail.specialization || "Ayurvedic, Homeopathic & General Care"}</p>
                          <p className="text-[10px] text-teal-400 font-bold mt-1 font-mono">Active Medical Unit</p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Timings & Location */}
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Physical Address & Access</h4>
                          <p className="text-sm font-bold mt-0.5 leading-relaxed">{detail.address || viewingClinic.city || "Pune Area, Maharashtra"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Consultation timings</h4>
                          <p className="text-sm font-bold mt-0.5">{detail.timing || "09:00 AM - 05:00 PM"}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Sundays Closed (Available on Emergency Callout)</p>
                        </div>
                      </div>
                    </div>

                    {/* Practice Days / Hours detailed calendar if available */}
                    {detail.hours && typeof detail.hours === 'object' && !Array.isArray(detail.hours) && (
                      <div className="space-y-2 border-t border-slate-500/10 pt-4">
                        <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Practitioner Availability Hours</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                          {Object.entries(detail.hours).map(([day, hrs]: [any, any]) => {
                            if (!hrs) return null;
                            const isClosed = hrs.closed === true || hrs.is_closed === true;
                            return (
                              <div key={day} className={`p-2 rounded-lg text-center ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"} border`}>
                                <span className="font-black uppercase block text-[9px] text-slate-500 dark:text-slate-400">{day}</span>
                                <span className="font-bold text-slate-500 dark:text-slate-350 block mt-0.5 truncate">
                                  {isClosed ? "Closed" : `${hrs.open || "09:00"} - ${hrs.close || "17:00"}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Facilities Pills */}
                    <div className="space-y-2.5 border-t border-slate-500/10 pt-4">
                      <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Offered facilities & Infrastructure</h4>
                      {(() => {
                        let facs: string[] = [];
                        if (Array.isArray(detail.facilities)) {
                          facs = detail.facilities;
                        } else if (typeof detail.facilities === "string") {
                          facs = detail.facilities.split(",").map(f => f.trim()).filter(Boolean);
                        } else {
                          facs = ["OPD Diagnostics", "Laboratory reports", "Digital prescriptions", "Home delivery medicine courier", "ECG Monitor check", "Vaccination drive center"];
                        }
                        return (
                          <div className="flex flex-wrap gap-2">
                            {facs.map((fac, idx) => (
                              <span
                                key={`${fac}-${idx}`}
                                className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-wide"
                              >
                                🏥 {fac}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Visiting Doctors */}
                    {detail.visiting_doctors && (
                      <div className="space-y-2.5 border-t border-slate-500/10 pt-4">
                        <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Visiting Consultant Panel</h4>
                        <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                          {typeof detail.visiting_doctors === "string" ? (
                            <span>{detail.visiting_doctors}</span>
                          ) : Array.isArray(detail.visiting_doctors) ? (
                            <div className="space-y-2">
                              {detail.visiting_doctors.map((vDoc: any, dIdx: number) => {
                                const name = typeof vDoc === "string" ? vDoc : (vDoc.name || "");
                                const dept = typeof vDoc === "string" ? "" : (vDoc.department || vDoc.specialization || "");
                                const qual = typeof vDoc === "string" ? "" : (vDoc.qualification || "");
                                const timing = typeof vDoc === "string" ? "" : (vDoc.time || "");
                                if (!name && !dept) return null;
                                return (
                                  <div key={dIdx} className={`flex justify-between items-start gap-2 pb-2 border-b last:border-0 ${darkMode ? "border-white/5" : "border-slate-100"}`}>
                                    <div>
                                      <p className={`font-bold text-xs ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{name || "Visiting Consultant"}</p>
                                      {qual && <p className="text-[10px] text-slate-500 dark:text-slate-400">{qual}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                      {dept && <p className="text-[10px] text-teal-400 font-semibold">{dept}</p>}
                                      {timing && <p className="text-[10px] text-slate-500 font-mono">{timing}</p>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            String(detail.visiting_doctors)
                          )}
                        </div>
                      </div>
                    )}

                    {/* Clinic Gallery */}
                    {detail.gallery && detail.gallery.length > 0 && (
                      <div className="space-y-2.5 border-t border-slate-500/10 pt-4">
                        <h4 className="font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                          <ImageIcon size={12} className="inline mr-1" /> Clinic Gallery
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                          {detail.gallery.map((imgSrc: string, idx: number) => (
                            <img
                              key={idx}
                              src={imgSrc}
                              alt={`Gallery ${idx + 1}`}
                              className="h-24 w-32 object-cover rounded-xl border border-slate-500/10 shadow-sm shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Contact bar */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-500/10 pt-6">
                      {detail.website && (
                        <a
                          href={detail.website.startsWith("http") ? detail.website : `https://${detail.website}`}
                          target="_blank"
                          rel="noreferrerReferenced"
                          className="text-xs text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink size={12} /> Visit Official Website
                        </a>
                      )}
                      
                      <div className="flex items-center gap-2 ml-auto text-xs font-black">
                        <button
                          onClick={() => setShowClinicProfileModal(false)}
                          className="px-5 py-3 rounded-2xl bg-slate-500/10 hover:bg-slate-500/15 uppercase text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClinic(viewingClinic);
                            setBookingForm({
                              patientName: patientDetails?.name || user?.name || "Rajesh Pawar",
                              patientAge: patientDetails?.age || "32",
                              patientGender: patientDetails?.gender || "M",
                              patientPhone: patientDetails?.phone || user?.phone || "9876543210",
                              patientAddress: patientDetails?.address || "Hinjewadi, Pune",
                              preferredDate: getISTDateString(),
                              preferredTime: "10:00",
                              preferredAmPm: "AM",
                            });
                            setShowClinicProfileModal(false);
                            setShowBookingModal(true);
                          }}
                          className="px-6 py-3 bg-teal-650 hover:bg-teal-700 uppercase text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition cursor-pointer"
                        >
                          <Calendar size={14} /> Book Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* ==========================================
            POPUP EVERYDAY PERSONAL REMINDER SCHEDULER DIALOG
            ========================================== */}
        <AnimatePresence>
          {showDailyReminderModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden border p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar ${
                  darkMode ? "bg-[#0c1226] border-white/5 text-white" : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">
                      {editingDailyReminderId ? "Edit Personal Reminder" : "Schedule Personal Reminder"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure customized alerts with visual patterns and medical tones</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDailyReminderModal(false);
                      setEditingDailyReminderId(null);
                    }}
                    className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/25 text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleDailyReminderSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Reminder Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Drink 500ml of copper-infused water"
                      value={dailyReminderForm.title}
                      onChange={(e) => setDailyReminderForm({ ...dailyReminderForm, title: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Description</label>
                    <textarea
                      placeholder="Special medical instructions or details..."
                      rows={2}
                      value={dailyReminderForm.description}
                      onChange={(e) => setDailyReminderForm({ ...dailyReminderForm, description: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Scheduled Date</label>
                      <input
                        type="date"
                        value={dailyReminderForm.date}
                        onChange={(e) => setDailyReminderForm({ ...dailyReminderForm, date: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Scheduled Hour</label>
                      <input
                        type="time"
                        value={dailyReminderForm.time}
                        onChange={(e) => setDailyReminderForm({ ...dailyReminderForm, time: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50 font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Reminder Style</label>
                      <select
                        value={dailyReminderForm.type}
                        onChange={(e: any) => setDailyReminderForm({ ...dailyReminderForm, type: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                      >
                        <option value="medicine">Ã°Å¸â€™Å  Medicine Intake</option>
                        <option value="water">Ã°Å¸â€™Â§ Hydration Alert</option>
                        <option value="yoga">Ã°Å¸Â§Ëœ Pranayama / Habit</option>
                        <option value="other">Ã°Å¸â€â€ General Announcement</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Repeat Loop</label>
                      <select
                        value={dailyReminderForm.repeat}
                        onChange={(e: any) => setDailyReminderForm({ ...dailyReminderForm, repeat: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                      >
                        <option value="once">Once (On date specified)</option>
                        <option value="daily">Every single day</option>
                        <option value="weekly">Weekly recurrence</option>
                        <option value="monthly">Monthly recurrence</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Alarm Sound Tone</label>
                      <select
                        value={dailyReminderForm.sound}
                        onChange={(e: any) => setDailyReminderForm({ ...dailyReminderForm, sound: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50 animate-pulse-slow"
                      >
                        <option value="standard">Standard triple beep Ã°Å¸â€œÂ¢</option>
                        <option value="clinical chime">Clinical Watch Chime Ã°Å¸â€â€</option>
                        <option value="gentle harp">Gentle Acoustic Harp Ã°Å¸Å½Â¼</option>
                        <option value="assertive pulse">Assertive Emergency Alert Ã°Å¸Å¡Â¨</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Attention Level</label>
                      <select
                        value={dailyReminderForm.priority}
                        onChange={(e: any) => setDailyReminderForm({ ...dailyReminderForm, priority: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-500/10 dark:bg-slate-900/50"
                      >
                        <option value="low">Low Attention (Soft Beeps)</option>
                        <option value="medium">Medium Priority (Chamber Sounds)</option>
                        <option value="high">Ã°Å¸Å¡Â¨ High Focus (Loud persistent sweep)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold uppercase mt-4 transition-all shadow-lg shadow-amber-500/15"
                  >
                    {editingDailyReminderId ? "Update Alert Configuration" : "Establish Everyday Reminder"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            POPUP MY REPORTS UPLOAD AND CAMERA SCANNER MODAL
            ========================================== */}
        <AnimatePresence>
          {showAddReportModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden border p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar ${
                  darkMode ? "bg-[#0c1226] border-white/5 text-white" : "bg-white border-slate-100 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">Archive Health Report</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add via Device Gallery or Snap with Live Camera</p>
                  </div>
                  <button
                    onClick={() => {
                      stopCamera();
                      setShowAddReportModal(false);
                    }}
                    className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/25 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleAddReportSubmit} className="space-y-4 text-xs font-semibold">
                  {/* File Upload Selector & Live Camera View Area */}
                  <div className="space-y-2">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Document Attachment (Gallery/Camera)</label>
                    
                    {/* Live Camera Streaming Box */}
                    {cameraActive ? (
                      <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-500/30 aspect-video flex flex-col justify-end">
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                          playsInline
                        />
                        {/* Camera Scanlines Overlay */}
                        <div className="absolute inset-0 border border-emerald-500/20 bg-gradient-to-b from-transparent via-emerald-550/10 to-transparent animate-pulse pointer-events-none" />
                        
                        <div className="relative p-4 flex gap-2 justify-between items-center bg-slate-950/75 backdrop-blur-xs w-full">
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            Live Camera Lens Active
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={captureSnapshot}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded-xl tracking-wider text-[10px]"
                            >
                              Snap Photo
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 uppercase rounded-xl text-[10px]"
                            >
                              Off
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Image Preview Box when Base64 content is generated */}
                        {reportForm.fileUrl ? (
                          <div className="relative rounded-3xl overflow-hidden bg-slate-950/30 border border-slate-500/10 h-44 flex items-center justify-center">
                            <img
                              src={reportForm.fileUrl}
                              alt="Uploaded Report Attachment"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setReportForm(prev => ({ ...prev, fileUrl: "" }))}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white font-black rounded-full hover:bg-rose-700"
                              title="Delete Attachment"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          /* Dropzone selector */
                          <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer rounded-2xl border border-dashed p-6 text-center space-y-2 hover:border-blue-500 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center ${
                              darkMode ? "border-white/10 bg-slate-950/10" : "border-slate-300 bg-slate-50"
                            }`}>
                              <Upload size={24} className="text-slate-500 dark:text-slate-400" />
                              <div className="space-y-0.5">
                                <span className="block font-black text-[11px] text-blue-400">Device Gallery</span>
                                <span className="block text-[9px] text-slate-500 dark:text-slate-400">Choose PNG/JPG files</span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleGalleryFileSelect}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={startCamera}
                              className={`rounded-2xl border border-dashed p-6 text-center space-y-2 hover:border-blue-500 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center ${
                                darkMode ? "border-white/10 bg-slate-950/10" : "border-slate-300 bg-slate-50"
                              }`}
                            >
                              <Camera size={24} className="text-slate-500 dark:text-slate-400" />
                              <div className="space-y-0.5">
                                <span className="block font-black text-[11px] text-emerald-400 font-extrabold">Use Medical Camera</span>
                                <span className="block text-[9px] text-slate-500 dark:text-slate-400">Snap hardcopy now</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Report Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Blood Sugar Lab, Pune Pathology Report"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-950/40"
                    />
                  </div>

                  {/* Hospital/Clinic name */}
                  <div className="space-y-1">
                    <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Clinic, Laboratory, or Doctor Source</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Patil Clinic, Self Records"
                      value={reportForm.clinicName}
                      onChange={(e) => setReportForm({ ...reportForm, clinicName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-950/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Type select */}
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Report Archive Type</label>
                      <select
                        value={reportForm.type}
                        onChange={(e) => setReportForm({ ...reportForm, type: e.target.value as any })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-950/40 font-bold"
                      >
                        <option value="report">Lab Report / Investigation</option>
                        <option value="prescription">Prescription Slip / RX Paper</option>
                      </select>
                    </div>

                    {/* Report date */}
                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Report Issue Date</label>
                      <input
                        type="date"
                        value={reportForm.date}
                        onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-500/10 dark:bg-slate-950/40 font-bold"
                      />
                    </div>
                  </div>

                  {/* Submit Action Block */}
                  <button
                    type="submit"
                    disabled={isProcessingFile}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 disabled:opacity-50"
                  >
                    {isProcessingFile ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Securing to Health Cloud...
                      </>
                    ) : (
                      "Save Report Permanent"
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            POPUP CLINICAL REPORT ZOOMED VIEW MODAL
            ========================================== */}
        <AnimatePresence>
          {showReportViewer && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl max-h-[92vh] flex flex-col justify-between"
              >
                {/* Image magnifier viewer header */}
                <div className="flex justify-between items-center p-4 bg-slate-900/90 text-white rounded-t-[2rem] border-t border-x border-white/15">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#22C55E]">Secured Clinical Archive</span>
                    <h3 className="text-lg font-black">{showReportViewer.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Source: {showReportViewer.clinicName || "Self-Record"} | Date: {showReportViewer.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Download offline trigger
                        const fileUrl = showReportViewer.fileUrl || "";
                        let ext = "jpg";
                        if (fileUrl.startsWith("data:")) {
                          const mime = fileUrl.split(";")[0]?.split(":")[1];
                          if (mime) {
                            if (mime.includes("pdf")) ext = "pdf";
                            else if (mime.includes("png")) ext = "png";
                            else if (mime.includes("webp")) ext = "webp";
                          }
                        } else {
                          const cleanUrl = fileUrl.split("?")[0].split("#")[0];
                          const match = cleanUrl.match(/\.(pdf|jpg|jpeg|png|webp)$/i);
                          if (match) {
                            ext = match[1].toLowerCase();
                          } else if (showReportViewer.type === "prescription") {
                            ext = "pdf";
                          }
                        }
                        const link = document.createElement("a");
                        link.href = fileUrl;
                        link.download = `${showReportViewer.title.replace(/\s+/g, "_")}.${ext}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showNotification("Clinical file downloaded to device local directory.", "success");
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs flex items-center gap-1.5 font-bold"
                      title="Download File Offline"
                    >
                      <Download size={15} /> Download
                    </button>
                    <button
                      onClick={() => setShowReportViewer(null)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Actual image canvas */}
                <div className="flex-1 bg-black overflow-y-auto overflow-x-hidden p-6 border-x border-slate-800 flex items-center justify-center">
                  {showReportViewer.fileUrl ? (
                    <img
                      src={showReportViewer.fileUrl}
                      alt={showReportViewer.title}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[65vh] object-contain rounded-xl select-none"
                    />
                  ) : (
                    <div className="text-center py-20 text-slate-500">
                      <ClipboardList size={60} className="mx-auto text-slate-500/30 mb-2" />
                      <p className="text-sm font-bold">This clinical file has no attached photo preview.</p>
                    </div>
                  )}
                </div>

                {/* Footer panel */}
                <div className="p-4 bg-slate-900 rounded-b-[2rem] border-b border-x border-white/15 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Report Reference: ID-{showReportViewer.id}</span>
                  <button
                    onClick={(e) => {
                      handleDeleteReport(showReportViewer.id, e);
                    }}
                    className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all"
                  >
                    Delete Permanent
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            SETTINGS MODAL
            ========================================== */}
        <AnimatePresence>
          {showSettingsModal && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md rounded-[2rem] overflow-hidden border p-6 space-y-6 shadow-2xl transition-all ${
                  darkMode ? "bg-[#090e21] border-white/5 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">CareBridge Settings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450">Configure personal care dashboard preferences</p>
                  </div>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-xs rounded-xl font-bold transition-all text-slate-500 dark:text-slate-300"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                    <h4 className="font-bold text-sm mb-2 text-blue-500 dark:text-blue-400">Audio & Haptics Preferences</h4>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-700 dark:text-slate-300">Medicine Alarm Vibration</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = { ...medAlarmSettings, alarmVibration: !medAlarmSettings.alarmVibration };
                          setMedAlarmSettings(updated);
                          localStorage.setItem(`med_alarm_settings_${user?.id}`, JSON.stringify(updated));
                        }}
                        className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] ${
                          medAlarmSettings?.alarmVibration 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-500/25 text-slate-500 dark:text-slate-400 dark:text-slate-300"
                        }`}
                      >
                        {medAlarmSettings?.alarmVibration ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                    <h4 className="font-bold text-sm mb-2 text-[#ee9b00]">Security & Profile Sync</h4>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-700 dark:text-slate-300">Automatic WhatsApp Reports</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = { ...profileForm, whatsappConsent: !profileForm.whatsappConsent };
                          setProfileForm(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] ${
                          profileForm?.whatsappConsent 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-500/25 text-slate-500 dark:text-slate-400 dark:text-slate-300"
                        }`}
                      >
                        {profileForm?.whatsappConsent ? "Approved" : "Pending"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center gap-2 text-[11px] font-bold">
                    <Shield size={16} />
                    <span>Your patient records are secured using end-to-end medical encryption patterns.</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            HELP & SUPPORT MODAL
            ========================================== */}
        <AnimatePresence>
          {showHelpModal && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md rounded-[2rem] overflow-hidden border p-6 space-y-6 shadow-2xl transition-all ${
                  darkMode ? "bg-[#090e21] border-white/5 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-500/10">
                  <div>
                    <h3 className="text-xl font-black">Help & Support Desk</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450">Licensed 24/7 technical and support assistance</p>
                  </div>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/20 text-xs rounded-xl font-bold transition-all text-slate-500 dark:text-slate-300"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-150'} space-y-3`}>
                    <div className="flex items-center gap-2 text-emerald-555 dark:text-emerald-400">
                      <Phone size={18} />
                      <span className="font-extrabold text-sm uppercase">Direct Medical Hotline</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      If you are experiencing a medical emergency, please call 102/108 immediately. For CareBridge system support, contact us:
                    </p>
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-center rounded-xl font-extrabold text-sm">
                      +91 9921-229-21D
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-150'} space-y-2`}>
                    <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400">Frequently Asked Questions</h4>
                    <div className="space-y-2 text-[11px] leading-snug">
                      <div>
                        <p className="font-bold text-blue-550 dark:text-blue-400">Q: How do clinic appointments work?</p>
                        <p className="text-slate-600 dark:text-slate-450">Appointments are secured in real-time, syncing cleanly with the local hospital queues.</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-550 dark:text-blue-400">Q: Is symptom tracking HIPAA compliant?</p>
                        <p className="text-slate-600 dark:text-slate-450">Yes, clinical tracking details are kept on private storage blocks with zero public exposure.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PATIENT SUBSCRIPTION PLAN DETAILS MODAL */}
        <AnimatePresence>
          {showSubscriptionPlan && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`w-full max-w-lg rounded-[32px] border shadow-2xl overflow-hidden relative ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => setShowSubscriptionPlan(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
                
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-600" />
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Crown size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">CareBridge+ Patient</h2>
                      <p className="text-xs font-bold text-slate-400">Unlock your personal health AI</p>
                    </div>
                  </div>

                  <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-5xl font-black text-blue-600 dark:text-blue-400">₹49</span>
                      <span className="text-sm font-bold text-slate-500">/month</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400">No hidden fees • Cancel anytime</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {["Unlimited AI Health Coach Access", "Daily Vitals Tracking & Analysis", "Automated Medicine Reminders", "Secure Clinic Report Syncing", "Priority 24/7 Medical Hotline"].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => {
                      setShowSubscriptionPlan(false);
                      setShowPhonePeModal(true);
                    }} 
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest text-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Start Subscription
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PHONEPE PAYMENT MODAL (PATIENT) */}
        <AnimatePresence>
          {showPhonePeModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`w-full max-w-md rounded-[32px] border shadow-2xl overflow-hidden relative ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => setShowPhonePeModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
                
                <div className="p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
                  
                  <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                    <Crown size={32} />
                  </div>
                  
                  <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-slate-800 dark:text-slate-100">CareBridge+ Patient</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">Scan to pay securely via PhonePe / UPI</p>

                  <div className="bg-white p-4 rounded-3xl inline-block border-2 border-slate-100 dark:border-slate-700 mb-6 shadow-inner">
                    {/* Placeholder QR Code for Patient */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=carebridge@ybl%26pn=CareBridgePlus%26am=49%26cu=INR" alt="UPI QR Code" className="w-48 h-48 rounded-xl object-contain" />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 mb-6 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Amount to Pay</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹49.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">UPI ID</span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">carebridge@ybl</span>
                    </div>
                  </div>

                  <button onClick={() => setShowPhonePeModal(false)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Close & Continue
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
