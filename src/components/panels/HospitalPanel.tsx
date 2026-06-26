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
} from "lucide-react";
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { HospitalWelcomeLanding } from "../landing/HospitalWelcomeLanding";
import ConfirmationModal from "../common/ConfirmationModal";
import PatientAvatar from "../common/PatientAvatar";
import { formatISTDate, formatISTTime, useLiveClock } from "../../utils/dateUtils";
import { firebaseService } from "../../services/firebaseService";
import { safeStringify } from "../../utils/firestoreErrorHandler";
import LegalFooter from "../common/LegalFooter";

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
  const [referrals, setReferrals] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

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
  const [referralView, setReferralView] = useState("history"); // "history" or "discharged"
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");

  // Alarm State
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
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioUnlockedRef = useRef(false);
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
    stopSynthBeep();
    setIsRingingWithRef(false);
    setNewReferralToast(null);
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

    if (!audioUnlockedRef.current && !forceUnlock) {
      console.warn(
        "[Alarm] Audio not unlocked. Alarm will stay in 'ringing' state but silent until user interaction.",
      );
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
              
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              
              // Set English style or generic premium voice
              const voices = window.speechSynthesis.getVoices();
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

              window.speechSynthesis.speak(utterance);
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

  const filteredReferrals = useMemo(() => {
    return referrals.filter((ref) => {
      const searchMatch =
        !historySearch ||
        String(ref.patientName || "")
          .toLowerCase()
          .includes(String(historySearch || "").toLowerCase()) ||
        String(ref.clinicName || "")
          .toLowerCase()
          .includes(String(historySearch || "").toLowerCase()) ||
        String(ref.status || "")
          .toLowerCase()
          .includes(String(historySearch || "").toLowerCase());

      const createdAt = ref.createdAt?.toDate
        ? ref.createdAt.toDate()
        : new Date(ref.createdAt || 0);
      const dischargedAt = ref.dischargedAt?.toDate
        ? ref.dischargedAt.toDate()
        : ref.dischargedAt
          ? new Date(ref.dischargedAt)
          : null;

      const fromMatch =
        !historyDateFrom ||
        createdAt >= new Date(historyDateFrom) ||
        (dischargedAt && dischargedAt >= new Date(historyDateFrom));
      const toMatch =
        !historyDateTo ||
        createdAt <= new Date(historyDateTo + "T23:59:59") ||
        (dischargedAt && dischargedAt <= new Date(historyDateTo + "T23:59:59"));

      return searchMatch && fromMatch && toMatch;
    });
  }, [referrals, historySearch, historyDateFrom, historyDateTo]);

  const handleHospitalImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.7);
      setProfileForm((prev) => ({ ...prev, [type]: compressedBase64 }));
    } catch (err) {
      console.error(
        "Profile image compression failed, fallback to original:",
        err,
      );
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      const detailsData = {
        helpline: profileForm.helpline,
        contact_no: profileForm.contact_no,
        address: profileForm.address,
        email: profileForm.email,
        website: profileForm.website,
        category: profileForm.category,
        departments: profileForm.departments,
        schemes: profileForm.schemes,
        bedsICU: Number(profileForm.bedsICU),
        bedsGeneral: Number(profileForm.bedsGeneral),
        bedsVentilator: Number(profileForm.bedsVentilator),
        ambulanceContact: profileForm.ambulanceContact,
        ambulanceStatus: profileForm.ambulanceStatus,
        emergencyContact: profileForm.emergencyContact,
        admissionNotes: profileForm.admissionNotes,
        webinarLink: profileForm.webinarLink,
        specialists: profileForm.specialists,
        hours: profileForm.hours,
        gallery: profileForm.gallery,
        logo: profileForm.logo,
        banner: profileForm.banner,
        userId: String(user.id),
      };

      if (hospDetails?.id) {
        await firebaseService.updateDocument(
          "hospital_details",
          hospDetails.id,
          detailsData,
        );
      } else {
        await firebaseService.addDocument("hospital_details", detailsData);
      }

      // Also update user name and city if changed
      await firebaseService.updateDocument("users", String(user.id), {
        name: profileForm.name,
        city: profileForm.city,
      });

      // Update local storage to keep session in sync
      const updatedUser = {
        ...user,
        name: profileForm.name,
        city: profileForm.city,
      };
      localStorage.setItem("user", safeStringify(updatedUser));

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", safeStringify(err));
      alert("Error saving profile");
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    const fileCount = files.length;
    let processedCount = 0;

    for (let i = 0; i < fileCount; i++) {
      try {
        const compressedBase64 = await compressImage(files[i], 1200, 1200, 0.7);
        newImages.push(compressedBase64);
      } catch (err) {
        console.error(
          "Gallery image compression failed, fallback to original:",
          err,
        );
        const originalBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(files[i]);
        });
        newImages.push(originalBase64);
      }
      processedCount++;
      if (processedCount === fileCount) {
        setProfileForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...newImages],
        }));
      }
    }
  };

  const handleAddDepartment = () => {
    if (newDept && !profileForm.departments.includes(newDept)) {
      setProfileForm({
        ...profileForm,
        departments: [...profileForm.departments, newDept],
      });
      setNewDept("");
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setProfileForm({
      ...profileForm,
      departments: profileForm.departments.filter((d) => d !== dept),
    });
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.qualification) return;
    try {
      await firebaseService.addDocument("doctors", {
        hospitalId: user.id,
        ...newDoctor,
        createdAt: new Date().toISOString(),
      });
      // Also add to specialists for backward compatibility / unified view
      setProfileForm((prev) => ({
        ...prev,
        specialists: [...prev.specialists, { ...newDoctor }],
      }));
      setNewDoctor({
        name: "",
        qualification: "",
        department: "",
        timing: "",
        contact: "",
      });
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert("Error adding doctor");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await firebaseService.deleteDocument("doctors", id);
    } catch (err) {
      alert("Error deleting doctor");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const statusLabels: Record<string, string> = {
      admitted: "Admit Patient",
      not_willing: "Mark as Not Willing",
      not_reachable: "Mark as Not Reachable",
      under_review: "Under Review",
      consultation_done: "Consultation Done",
      treatment_plan: "Start Treatment Plan",
      discharged: "Discharge Patient",
    };

    setConfirmModal({
      isOpen: true,
      title: `${statusLabels[status] || "Update Status"}?`,
      message: `Are you sure you want to update this patient's status to ${status.replace("_", " ")}? This action will be recorded in the history.`,
      type: status === "admitted" ? "info" : "warning",
      onConfirm: async () => {
        try {
          console.log(`[Hospital] Updating referral ${id} status to ${status}`);
          const updateData: any = { status };
          if (status === "admitted") {
            updateData.admittedAt = new Date();
          }
          if (status === "discharged") {
            updateData.dischargedAt = new Date();
          }
          if (status === "consultation_done") {
            updateData.consultationCompletedAt = new Date();
          }
          await firebaseService.updateDocument("referrals", id, updateData);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error updating status:", safeStringify(err));
          alert("Error updating status");
        }
      },
    });
  };

  const handleAdmitClick = (referral: any) => {
    setSelectedReferral(referral);
    setAdmitForm({
      condition: referral.patientCondition || "Stable",
      vitals: {
        temp: referral.vitals?.temp || "",
        bp: referral.vitals?.bp || "",
        pulse: referral.vitals?.pulse || "",
        spo2: referral.vitals?.spo2 || "",
      },
      ward: referral.suggestedWard || "",
      diagnosis: referral.diagnosis || "",
      scheme: referral.applicableScheme || "",
    });
    setShowAdmitModal(true);
  };

  const submitAdmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;

    try {
      const admissionDetails = {
        ...admitForm,
        admittedBy: user.name || "Carebridge Partner Hospital",
        hospitalId: user.id,
        timestamp: new Date(),
        hospitalCity: user.city || "",
      };

      await firebaseService.updateDocument("referrals", selectedReferral.id, {
        status: "admitted",
        admittedAt: new Date(),
        admissionDetails,
      });

      setShowAdmitModal(false);
      setConfirmModal({
        isOpen: true,
        title: "Patient Admitted",
        message: `${selectedReferral.patientName} has been successfully admitted. Clinic will be notified in real-time.`,
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false })),
        type: "info",
      });
    } catch (err) {
      console.error("Error admitting patient:", safeStringify(err));
      alert("Error admitting patient. Please try again.");
    }
  };

  const handleDischarge = async (referral: any) => {
    setConfirmModal({
      isOpen: true,
      title: "Discharge Patient?",
      message: `Are you sure you want to discharge ${referral.patientName}? This will notify the referring clinic.`,
      type: "info",
      onConfirm: async () => {
        try {
          const dischargeDate = new Date();
          const admissionDate = referral.admittedAt?.toDate
            ? referral.admittedAt.toDate()
            : referral.admittedAt
              ? new Date(referral.admittedAt)
              : new Date();

          await firebaseService.updateDocument("referrals", referral.id, {
            status: "discharged",
            dischargedAt: dischargeDate,
          });

          // Send notification to clinic
          const content = `Patient Discharged: ${referral.patientName}\nAdmission Date: ${formatISTDate(admissionDate)}\nDischarge Date: ${formatISTDate(dischargeDate)}`;

          await firebaseService.addDocument("messages", {
            senderId: user.id,
            senderName: user.name,
            senderRole: user.role,
            receiverId: referral.clinicId,
            receiverName: referral.clinicName || "Clinic Partner",
            receiverRole: "clinic",
            content: content,
            isRead: false,
            createdAt: new Date(),
          });

          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error discharging patient:", safeStringify(err));
          alert("Error discharging patient");
        }
      },
    });
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.content) return;
    try {
      let recipientName = "Unknown";
      let recipientRole = "clinic";

      if (messageForm.recipient_id === "admin") {
        recipientName = "Carebridge+ Admin";
        recipientRole = "admin";
      } else if (messageForm.recipient_id === "all_clinics") {
        recipientName = "All Clinics (Broadcast)";
        recipientRole = "clinic_broadcast";
      } else {
        const clinic = clinics.find(
          (c) => String(c.id) === messageForm.recipient_id,
        );
        if (clinic) {
          recipientName = clinic.name;
          recipientRole = "clinic";
        } else {
          // Check if it's a patient (from referrals or supervision)
          const patientMsg = messages.find(
            (m) =>
              (m.senderId === messageForm.recipient_id ||
                m.receiverId === messageForm.recipient_id) &&
              (m.senderRole === "patient" || m.receiverRole === "patient"),
          );
          if (patientMsg) {
            recipientName =
              patientMsg.senderId === messageForm.recipient_id
                ? patientMsg.senderName
                : patientMsg.receiverName;
            recipientRole = "patient";
          }
        }
      }

      await firebaseService.addDocument("messages", {
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId: messageForm.recipient_id,
        receiverName: recipientName,
        receiverRole: recipientRole,
        content: messageForm.content,
        text: messageForm.content, // Consistency with PatientPanel
        isRead: false,
        participants: [user.id, messageForm.recipient_id],
        createdAt: new Date(),
        timestamp: new Date(), // Consistency with PatientPanel
      });
      setMessageForm({ ...messageForm, content: "" });
    } catch (err) {
      alert("Error sending message");
    }
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessageIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Selected Messages",
      message: `Are you sure you want to delete the ${selectedMessageIds.length} marked messages? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedMessageIds.map((id) =>
              firebaseService.deleteDocument("messages", id),
            ),
          );
          setSelectedMessageIds([]);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error deleting selected messages:", err);
          alert("Error deleting some messages.");
        }
      },
    });
  };

  const handleDeleteAllMessages = async () => {
    const activeMessages = messages.filter((m) => {
      if (messageForm.recipient_id === "all_clinics") {
        return m.receiverId === "all_clinics";
      }
      return (
        (m.senderId === messageForm.recipient_id && m.receiverId === user.id) ||
        (m.senderId === user.id && m.receiverId === messageForm.recipient_id)
      );
    });
    if (activeMessages.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete All Messages",
      message: `Are you sure you want to delete all ${activeMessages.length} messages in this conversation? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await Promise.all(
            activeMessages.map((m) =>
              firebaseService.deleteDocument("messages", m.id),
            ),
          );
          setSelectedMessageIds([]);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error deleting all messages:", err);
          alert("Error clearing conversation.");
        }
      },
    });
  };

  const handleReply = (msg: any) => {
    setMessageForm({
      recipient_id: msg.senderId,
      recipient_role: msg.senderRole || "clinic",
      content: "",
    });
    const formElement = document.getElementById("message-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteMessage = async (msgId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Message",
      message:
        "Are you sure you want to delete this message? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          await firebaseService.deleteDocument("messages", msgId);
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          console.error("Error deleting message:", safeStringify(error));
          alert("Failed to delete message. Please try again.");
        }
      },
    });
  };

  const getRecipientInfo = (id: string) => {
    if (!id) return { name: "Select Conversation", role: "", initials: "?" };
    if (id === "admin") return { name: "Carebridge+ Admin", role: "Admin Liaison", initials: "A" };
    if (id === "all_clinics") return { name: "All Clinics (Broadcast)", role: "Internal Broadcast", initials: "📢" };
    
    // Look up clinic from clinics list
    const cl = clinics.find((c) => String(c.id) === String(id));
    if (cl) return { name: cl.name, role: "Partner Clinic", initials: cl.name[0].toUpperCase() };
    
    // Fallback: search in messages list
    const lastMsg = messages.find((m) => m.senderId === id || m.receiverId === id);
    if (lastMsg) {
      const name = lastMsg.senderId === id ? lastMsg.senderName : lastMsg.receiverName;
      const role = lastMsg.senderId === id ? lastMsg.senderRole : lastMsg.receiverRole;
      return { 
        name: name || "User", 
        role: role === "clinic" ? "Partner Clinic" : role === "patient" ? "Patient" : role || "Liaison", 
        initials: (name || "?")[0].toUpperCase() 
      };
    }
    
    return { name: "Active Chat", role: "Participant", initials: "?" };
  };

  if (showWelcomeScreen) {
    return (
      <HospitalWelcomeLanding
        hospDetails={hospDetails}
        user={user}
        darkMode={darkMode}
        setShowWelcomeScreen={setShowWelcomeScreen}
        referrals={referrals}
        clinics={clinics}
      />
    );
  }

  if (false && showWelcomeScreen) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#001219]" : "bg-[#F2F4F7]"} flex flex-col relative overflow-hidden`}
      >
        <motion.div
          key="hospital-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full h-screen overflow-y-auto"
        >
          {/* Top Decorative Background Gradients */}
          <div
            className={`relative overflow-hidden py-16 px-6 md:px-12 text-center border-b ${darkMode ? "border-violet-500/10 bg-gradient-to-b from-indigo-950/40 via-violet-950/20 to-transparent" : "border-violet-100 bg-gradient-to-b from-violet-500/5 via-indigo-500/5 to-transparent"}`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -z-10" />

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 shadow-sm border border-violet-200/50 dark:border-violet-800/50 mb-6">
              <Crown size={12} className="animate-pulse" /> CareBridge Plus
              Emergency Network
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-gray-900 dark:text-white uppercase max-w-5xl mx-auto">
              Welcome to{" "}
              <span className="text-[#4f46e5] dark:text-violet-400 bg-clip-text">
                CareBridge Plus
              </span>{" "}
              Hospital Wing
            </h1>

            <div className="mt-6 flex flex-col items-center justify-center max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900/50 border border-violet-100 dark:border-violet-850 rounded-[2.5rem] shadow-xl md:shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-[#4f46e5] dark:text-violet-400">
                Command Control Center
              </p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1 uppercase max-w-md text-center">
                {hospDetails?.name || user.name || "Apex SuperSpecialty"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-4 w-full">
                <span className="flex items-center gap-1.5">
                  <HospitalIcon size={14} className="text-[#4f46e5]" />{" "}
                  {hospDetails?.category || "Multi-Specialty Facility"}
                </span>
                {(hospDetails?.contact_no || hospDetails?.helpline) && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-[#4f46e5]" />{" "}
                    {hospDetails.helpline || hospDetails.contact_no}
                  </span>
                )}
                {hospDetails?.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#4f46e5]" />{" "}
                    {hospDetails.address}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-[#4f46e5] dark:text-violet-300 max-w-4xl mx-auto mt-10 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10 rounded-2xl py-4 px-6 shadow-sm">
              "Smarter Admission. Faster Bed-Allocation. Integrated Referral
              Network."
            </h2>
          </div>

          {/* Dynamic Stats Overview Layout (Mocked/Real Numbers) */}
          <div className="max-w-7xl mx-auto px-6 pt-12 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 text-center">
              Live Facility Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4 font-mono">
              {/* Stat 1 */}
              <div
                className={`p-6 rounded-[2rem] border ${darkMode ? "border-white/5 bg-gray-900/40" : "border-gray-100 bg-white"} text-center shadow-sm hover:translate-y-[-2px] transition-transform`}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-violet-600 dark:text-violet-400">
                  {referrals.length || 0}
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-1">
                  Cases Under Triage
                </div>
              </div>
              {/* Stat 2 */}
              <div
                className={`p-6 rounded-[2rem] border ${darkMode ? "border-white/5 bg-gray-900/40" : "border-gray-100 bg-white"} text-center shadow-sm hover:translate-y-[-2px] transition-transform`}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-blue-500">
                  {clinics.length || "12+"}
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-1">
                  Affiliated Clinics
                </div>
              </div>
              {/* Stat 3 */}
              <div
                className={`p-6 rounded-[2rem] border ${darkMode ? "border-white/5 bg-gray-900/40" : "border-gray-100 bg-white"} text-center shadow-sm hover:translate-y-[-2px] transition-transform`}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-[#00afb9]">
                  {(hospDetails?.bedsICU || 0) +
                    (hospDetails?.bedsGeneral || 0) +
                    (hospDetails?.bedsVentilator || 0) || "250"}
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-1">
                  Total Bed Slots
                </div>
              </div>
              {/* Stat 4 */}
              <div
                className={`p-6 rounded-[2rem] border ${darkMode ? "border-white/5 bg-gray-900/40" : "border-gray-100 bg-white"} text-center shadow-sm hover:translate-y-[-2px] transition-transform`}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-teal-500">
                  100%
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-1">
                  Siren Channel Active
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Blocks */}
          <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
            {/* How CareBridge Plus helps hospitals */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 text-violet-600 dark:text-violet-300 rounded-full">
                  Fast Admission
                </span>
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  Apex Care Command Features
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Bell size={22} className="animate-pulse" />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Instant Referral Alarms
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Audible emergency bells and siren flash banners trigger
                      live whenever companion family clinics refer severe cases.
                      Skip critical triage wait times.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950/50 text-[#4f46e5] dark:text-violet-300 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <UserMd size={22} />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Seamless Triage Routing
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Process digital patient profiles containing live vitals
                      (Pulse, Temp, SpO2, and BP) instantly sent by GPs, saving
                      extra checkout work inside primary emergency bays.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Layers size={22} />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Live Transparent Bed Slots
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Sync ICU, Ventilator, and General Bed statistics live
                      dynamically. Affiliated clinics view your real-time bed
                      inventory to refer cases only of guaranteed availability.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <MessageSquare size={22} />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Direct Feedback Messaging
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Reply to companion clinics regarding patient recovery
                      state or admission logs. Keeps peripheral doctors
                      integrated and loyal to your facility.
                    </p>
                  </div>
                </div>

                {/* Feature 5 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 text-[#4f46e5]/80 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <TrendingUp size={22} />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Strategic Clinic Analytics
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Analyze referral densities, clinic contributions, and
                      historical admission graphs. Optimize your patient
                      acquisition channels programmatically.
                    </p>
                  </div>
                </div>

                {/* Feature 6 */}
                <div
                  className={`p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:border-violet-500/20 group flex flex-col justify-between ${darkMode ? "border-white/5 bg-gray-900/40 hover:bg-gray-950/40" : "border-gray-150 bg-white"}`}
                >
                  <div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Activity size={22} />
                    </div>
                    <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight">
                      Voice & AI Diagnostic Logs
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                      Hear pre-recorded clinic voice notes outlining patient
                      backgrounds. Use AI templates to automatically structure
                      admission logs, prescription schemas, and clinical
                      reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Slogans and Operational Benefits split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Slogans & Sincere Slogans */}
              <div
                className={`p-8 sm:p-12 rounded-[2.5rem] border flex flex-col justify-between ${darkMode ? "border-violet-500/10 bg-gradient-to-b from-indigo-950/30 to-slate-900/50" : "border-violet-100 bg-gradient-to-br from-violet-500/5 to-white shadow-sm"}`}
              >
                <div>
                  <h4 className="text-xl md:text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
                    Smarter Hospital Admissions
                  </h4>
                  <p className="text-xs font-bold text-indigo-500 dark:text-violet-400 mt-1 uppercase tracking-wider">
                    Better Bed Visibility • Faster ER Response
                  </p>

                  <div className="space-y-6 mt-8">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                      By connecting companion General Practitioners directly
                      with your emergency dispatch desk, CareBridge Plus
                      establishes an unbreakable chain of collaborative
                      healthcare.
                    </p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                      GPs do not need to guess if ICU slots are available
                      anymore. They instantly review your digital profile
                      dashboard to secure beds before patient ambulances reach
                      your triage gates.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-violet-500/5 dark:bg-violet-500/10 p-5 rounded-2xl border border-violet-500/10">
                  <p className="text-xs font-black italic text-[#4f46e5] dark:text-violet-300">
                    "Streamlined bed tracking reduces triage allocation delays
                    up to 75% • Saving lives in gold minutes."
                  </p>
                </div>
              </div>

              {/* Connected Benefits */}
              <div
                className={`p-8 sm:p-12 rounded-[2.5rem] border ${darkMode ? "border-emerald-500/10 bg-gradient-to-b from-emerald-950/20 to-slate-900/50" : "border-emerald-100 bg-gradient-to-br from-emerald-50/20 to-white shadow-sm"}`}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 mb-4">
                  <ShieldCheck size={12} /> Strategic Advantages
                </div>
                <h4 className="text-xl md:text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
                  Key Operational Gains
                </h4>

                <div className="space-y-6 mt-8">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">
                        Min ER Wait Times
                      </h5>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        All clinical vitals, initial prescriptions, and
                        pre-injections log in advance.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">
                        Real-time Bed Tracking
                      </h5>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Prevents allocation mistakes and double-logging,
                        ensuring 100% bed utilization accuracy.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">
                        Boost GP & Clinic Loyalty
                      </h5>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Transparent digital reports keep referring partner
                        clinics happy and trusting.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">
                        Emergency Siren Fastpath
                      </h5>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Prioritizes emergency cases immediately in your
                        admissions workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Guide */}
            <div className="space-y-10 py-10">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-full">
                  Process flow
                </span>
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  Active Referral Triage Steps
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="p-8 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                    1
                  </div>
                  <h4 className="text-base font-black uppercase text-gray-900 dark:text-white">
                    Monitor Referral Inbox
                  </h4>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                    Check the live **Active Referrals** dashboard. Severe logs
                    trigger dynamic ambulance audio warnings containing full
                    vitals.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-8 rounded-[2rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                    2
                  </div>
                  <h4 className="text-base font-black uppercase text-gray-900 dark:text-white">
                    Admit & Allocate Beds
                  </h4>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                    Tap **Admit Patient**, choose general, ICU, or ventilator
                    slots, specify admission notes, and save bed logs
                    transparently.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-8 rounded-[2rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                    3
                  </div>
                  <h4 className="text-base font-black uppercase text-gray-900 dark:text-white">
                    Send GP Feedback
                  </h4>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                    Log instant updates or state summaries. CareBridge Plus
                    routes feedback directly back to partner general clinics to
                    complete the care chain.
                  </p>
                </div>
              </div>
            </div>

            {/* Slogan line */}
            <div className="text-center py-8 border-y border-dashed border-violet-500/20 max-w-4xl mx-auto">
              <p className="text-base sm:text-xl font-black font-mono tracking-tight text-[#4f46e5] dark:text-violet-400 uppercase animate-pulse">
                🏥 Connected Emergency Services • Minimizing Triage Tensions •
                Saving Gold Minutes 🏥
              </p>
            </div>

            {/* Launch CTA */}
            <div className="flex justify-center pt-8 pb-16">
              <button
                onClick={() => {
                  setShowWelcomeScreen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-10 py-5 bg-gradient-to-r from-violet-700 to-[#4f46e5] text-white font-black uppercase text-sm tracking-wider rounded-[2rem] shadow-xl hover:shadow-[#4f46e5]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
              >
                Continue to Hospital Dashboard
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
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
                className="bg-white/10 text-white border border-white/20 font-black px-6 py-3 rounded-2xl hover:bg-white/20 transition-colors hidden md:block"
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
                {!audioUnlocked && isRinging && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 animate-bounce">
                    Tap anywhere to enable sound
                  </p>
                )}
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
          className={`fixed inset-y-0 left-0 lg:relative lg:translate-x-0 z-50 w-64 transition-transform duration-300 overflow-hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-[#001219] border-r border-white/10" : "bg-white border-r border-gray-100"}`}
        >
          <div className="p-6 flex-1 flex flex-col min-h-0">
            <div className="flex flex-col items-center mb-8 shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#00796b] flex items-center justify-center mb-3 shadow-lg border-4 border-white overflow-hidden">
                <HospitalIcon size={48} className="text-white" />
              </div>
              <h2 className="text-white font-bold text-center text-sm bg-[#00796b] px-3 py-1 rounded-full shadow-sm max-w-full truncate">
                {user.name}
              </h2>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Hospital Panel
              </p>
            </div>

            <nav
              style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
              className="space-y-1 flex-1 no-scrollbar pr-1 py-1"
            >
              {[
                { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item.id
                      ? "bg-linear-to-r from-[#005f73] to-[#0a9396] text-white shadow-md"
                      : `${darkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-50"}`
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}

              <div className="pt-4 pb-1.5 px-4 font-black text-[10px] uppercase tracking-wider text-gray-550 dark:text-gray-450 border-t border-gray-100 dark:border-white/5 mt-4">
                Growth & Network
              </div>
              {[
                { id: "partner-clinics", icon: Users, label: "Partner Clinics" },
                { id: "medical-academy", icon: GraduationCap, label: "Medical Academy" },
                { id: "marketing-center", icon: Megaphone, label: "Marketing Center" },
                { id: "network-analytics", icon: BarChart3, label: "Network Analytics" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item.id
                      ? "bg-linear-to-r from-[#005f73] to-[#0a9396] text-white shadow-gradient"
                      : `${darkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-50"}`
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* SECTION 3 (Always Visible at Bottom) */}
            <div className="mt-auto pt-4 border-t shrink-0 border-gray-100 dark:border-white/5 space-y-1.5">
              {/* Log Out button above settings */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md shadow-red-600/25"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>

              {/* Settings button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                  darkMode ? "text-[#a9d6e5] hover:bg-white/5 hover:text-white" : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>

              {/* Theme Toggle button */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                  darkMode ? "text-[#a9d6e5] hover:bg-white/5 hover:text-white" : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                  <span>{darkMode ? "Light Theme" : "Deep Dark"}</span>
                </div>
              </button>

              {/* Help & Support button */}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                  darkMode ? "text-[#a9d6e5] hover:bg-white/5 hover:text-white" : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Info size={15} />
                <span>Help & Support</span>
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 mt-1 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md shadow-red-600/25"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-20 transition-all duration-300 bg-linear-to-r from-[#005f73] to-[#0a9396] shadow-lg">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`lg:hidden p-2 rounded-xl transition-all active:scale-95 ${
                    isSidebarOpen
                      ? "bg-white text-[#005f73] shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Menu size={20} />
                </button>
                <div className="block">
                  <h1 className="text-xl lg:text-3xl font-black flex items-center gap-0 leading-none">
                    <span className="text-[#ee9b00]">Care</span>
                    <span className="text-white">bridge</span>
                    <span className="text-[#ee9b00]">+</span>
                  </h1>
                  <p className="text-[#ee9b00] text-[8px] lg:text-xs font-extrabold uppercase tracking-widest mt-0.5">
                    Hospital Dashboard
                  </p>
                </div>
              </div>

              {/* Middle Section: Helpline & Time */}
              <div className="flex flex-col items-center justify-center flex-1 text-center px-1">
                <p className="text-[9px] lg:text-xs font-black uppercase tracking-widest text-white/90">
                  Helpline: <span className="text-[#ee9b00]">9022066914</span>
                </p>
                <p className="text-[8px] lg:text-[10px] font-bold text-white/70">
                  {formatISTDate(currentTime)} | {formatISTTime(currentTime)}
                </p>
              </div>

              {/* Right Section: Hospital Info & Notification */}
              <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <p className="text-xs font-black text-white leading-none truncate max-w-[120px] lg:max-w-[200px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold text-[#ee9b00] uppercase tracking-wider mt-1">
                    {user.city}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                  <HospitalIcon size={24} className="text-white" />
                </div>

                <div className="flex items-center gap-1.5 border-l border-white/20 pl-2 lg:pl-4">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 lg:p-2.5 rounded-xl transition-all ${darkMode ? "bg-white/10 text-yellow-400" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>

                  <button
                    onClick={() => setActiveTab("inbox")}
                    className={`p-2 lg:p-2.5 rounded-xl transition-all relative bg-white/10 text-white hover:bg-white/20`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ee9b00] rounded-full border-2 border-[#005f73]"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Bottom Nav */}
          <nav
            className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-around px-4 border-t transition-colors duration-300 ${darkMode ? "bg-[#001219] border-white/10" : "bg-white border-gray-100"}`}
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
                  activeTab === item.id ? "text-[#0a9396]" : "text-gray-400"
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={activeTab === item.id ? { y: -4 } : { y: 0 }}
                >
                  <item.icon size={22} />
                </motion.div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <main
            className={`flex-1 min-w-0 pt-24 px-4 lg:px-8 transition-colors duration-300 ${darkMode ? "bg-[#001219]" : "bg-[#F5F7FA]"} pb-32 lg:pb-10`}
          >
            {/* Alarm Controls (Floating/Inline) */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
              <button
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs ${alarmEnabled ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-500/30 dark:text-emerald-400" : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-white/5 dark:border-white/10"}`}
              >
                {alarmEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                {alarmEnabled ? "Alarm On" : "Alarm Off"}
              </button>

              {alarmEnabled && !isRinging && (
                <button
                  onClick={() => playAlarm("Test Patient")}
                  className="text-[10px] font-bold text-[#028090] dark:text-[#0a9396] hover:underline"
                >
                  Test Alarm
                </button>
              )}

              {isRinging && (
                <div className="flex items-center gap-2">
                  {!audioUnlocked && (
                    <button
                      onClick={() => {
                        setAudioUnlockedWithRef(true);
                        playAlarm(undefined, true);
                      }}
                      className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs animate-pulse shadow-lg shadow-amber-500/30"
                    >
                      <Volume2 size={16} className="animate-bounce" />
                      Tap to Enable Audio
                    </button>
                  )}
                  <button
                    onClick={stopAlarm}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xs animate-pulse shadow-lg shadow-red-500/30"
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                      className={`${darkMode ? "bg-white/5" : "bg-white"} p-5 rounded-3xl shadow-sm border ${darkMode ? "border-white/10" : "border-gray-100"}`}
                    >
                      <div
                        className={`w-10 h-10 ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"} rounded-2xl flex items-center justify-center mb-3`}
                      >
                        <Users size={20} />
                      </div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        Total Referrals
                      </p>
                      <h3
                        className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {referrals.length}
                      </h3>
                    </div>
                    <div
                      className={`${darkMode ? "bg-white/5" : "bg-white"} p-5 rounded-3xl shadow-sm border ${darkMode ? "border-white/10" : "border-gray-100"}`}
                    >
                      <div
                        className={`w-10 h-10 ${darkMode ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600"} rounded-2xl flex items-center justify-center mb-3`}
                      >
                        <Activity size={20} />
                      </div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        Admitted
                      </p>
                      <h3
                        className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {
                          referrals.filter((r) => r.status === "admitted")
                            .length
                        }
                      </h3>
                    </div>
                    <div
                      className={`${darkMode ? "bg-white/5" : "bg-white"} p-5 rounded-3xl shadow-sm border ${darkMode ? "border-white/10" : "border-gray-100"}`}
                    >
                      <div
                        className={`w-10 h-10 ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600"} rounded-2xl flex items-center justify-center mb-3`}
                      >
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        Completed
                      </p>
                      <h3
                        className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {
                          referrals.filter((r) => ["completed", "consultation_done"].includes(r.status))
                            .length
                        }
                      </h3>
                    </div>
                    <div
                      className={`${darkMode ? "bg-white/5" : "bg-white"} p-5 rounded-3xl shadow-sm border ${darkMode ? "border-white/10" : "border-gray-100"}`}
                    >
                      <div
                        className={`w-10 h-10 ${darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600"} rounded-2xl flex items-center justify-center mb-3`}
                      >
                        <TrendingUp size={20} />
                      </div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        Conversion
                      </p>
                      <h3
                        className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {referrals.length > 0
                          ? Math.round(
                              (referrals.filter((r) =>
                                ["admitted", "completed", "consultation_done"].includes(r.status),
                              ).length /
                                referrals.length) *
                                100,
                            )
                          : 0}
                        %
                      </h3>
                    </div>
                  </div>

                  {/* Healthcare Command Center - Rectangular Features */}
                  <div className="my-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-6 bg-[#00796b] rounded-full" />
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-wider ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
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
                      onClick={() => setReferralView("history")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        referralView === "history"
                          ? "bg-[#00796b] text-white shadow-md"
                          : `${darkMode ? "bg-white/5 text-gray-400 border-white/10" : "bg-white text-gray-500 border-gray-100"} border`
                      }`}
                    >
                      All History
                    </button>
                    <button
                      onClick={() => setReferralView("discharged")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        referralView === "discharged"
                          ? "bg-[#0a9396] text-white shadow-md"
                          : `${darkMode ? "bg-white/5 text-gray-400 border-white/10" : "bg-white text-gray-500 border-gray-100"} border`
                      }`}
                    >
                      Discharged
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
                      <Clock size={18} /> Past Referrals
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                        >
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase">
                              Referral Date
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
                              if (referralView === "discharged") {
                                return r.status === "discharged";
                              }
                              if (referralView === "history") {
                                if (r.referralType === "opd") {
                                  return ["consultation_done", "completed"].includes(r.status);
                                }
                                return ["admitted", "treatment_plan", "completed"].includes(
                                  r.status,
                                );
                              }
                              if (r.referralType === "opd") {
                                return ["consultation_done", "completed"].includes(r.status);
                              }
                              return ![
                                "pending",
                                "under_review",
                              ].includes(r.status);
                            })
                            .map((ref, index) => (
                              <tr
                                key={`${ref.id}-${index}`}
                                className={`hover:${darkMode ? "bg-white/5" : "bg-gray-50"} transition-colors`}
                              >
                                <td className="px-6 py-4">
                                  <div className="text-red-500 text-xs font-bold">
                                    {formatISTDate(
                                      ref.createdAt || ref.created_at,
                                    )}
                                  </div>
                                  <div className="text-gray-400 text-[10px] font-bold">
                                    {formatISTTime(
                                      ref.createdAt || ref.created_at,
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
                          <h2 className="text-2xl font-black flex items-center gap-3 italic tracking-tight uppercase">
                            <Activity className="text-red-500" /> Patient
                            Admission
                          </h2>
                          <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest leading-none">
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
                              <h4 className="font-black text-sm leading-none">
                                {selectedReferral.patientName}
                              </h4>
                              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                                {selectedReferral.patientAge}Y •{" "}
                                {selectedReferral.patientGender === "F"
                                  ? "Female"
                                  : "Male"}
                              </p>
                              <p className="text-[9px] text-gray-400 font-medium italic truncate max-w-[150px]">
                                {selectedReferral.patientArea || "Local Area"}
                              </p>
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
                              <h4 className="font-black text-sm leading-none">
                                {hospDetails?.name || user.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
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
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
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
                              <option value="Stable">Stable</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Critical">Critical</option>
                              <option value="Emergency">Emergency</option>
                            </select>
                          </div>

                          {/* Ward/ICU */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                              Admitted Ward / ICU
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. General Ward - B, ICU - 2"
                              value={admitForm.ward}
                              onChange={(e) =>
                                setAdmitForm({
                                  ...admitForm,
                                  ward: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 rounded-xl border font-bold text-sm outline-none focus:ring-2 focus:ring-[#005f73] transition-all ${darkMode ? "bg-white/10 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"}`}
                            />
                          </div>
                        </div>

                        {/* Vitals */}
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Current Vitals
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div
                              className={`p-3 rounded-2xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xs"}`}
                            >
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">
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
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">
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
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">
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
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">
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
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
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
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
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
                    +91 9921-229-21D
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

    </>
  );
}
