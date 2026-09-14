import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Pill,
  Droplet,
  Syringe,
  Plus,
  Trash2,
  Clock,
  Bell,
  Activity,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Brain,
  AlertTriangle,
  FileText,
  Check,
  X,
  RotateCcw,
  RefreshCw,
  Search,
  BookOpen,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Info
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase";
import { firebaseService } from "../../services/firebaseService";

interface MedicationManagementProps {
  user: any;
  darkMode: boolean;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export default function MedicationManagement({
  user,
  darkMode,
  showNotification
}: MedicationManagementProps) {
  // Real-time Database state
  const [reminders, setReminders] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout tabs / views inside the Upgraded Medicine Panel
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "reminders" | "analytics" | "assistant" | "prescriptions">("dashboard");

  // Alarms and timing calculations
  const [nextDose, setNextDose] = useState<any | null>(null);
  const [countdownText, setCountdownText] = useState<string>("Calculating...");

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any | null>(null);

  // New medication form fields state
  const [formName, setFormName] = useState("");
  const [formGeneric, setFormGeneric] = useState("");
  const [formType, setFormType] = useState<"Tablet" | "Capsule" | "Syrup" | "Injection" | "Drops" | "Ointment" | "Powder">("Tablet");
  const [formStrength, setFormStrength] = useState("");
  const [formQuantityPerDose, setFormQuantityPerDose] = useState("1");
  const [formSchedule, setFormSchedule] = useState<"Once Daily" | "Twice Daily" | "Thrice Daily" | "Four Times Daily" | "Weekly" | "Custom">("Once Daily");
  const [formTimings, setFormTimings] = useState<string[]>(["08:00"]);
  const [formMealTime, setFormMealTime] = useState<"before" | "after" | "with" | "empty">("after");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");
  const [formDurationDays, setFormDurationDays] = useState("7");
  const [formStock, setFormStock] = useState("30");
  const [formRefillThreshold, setFormRefillThreshold] = useState("5");
  const [formNotes, setFormNotes] = useState("");
  const [formColor, setFormColor] = useState("#3B82F6"); // default primary blue
  const [formLanguage, setFormLanguage] = useState<"English" | "Hindi" | "Marathi">("English");
  const [selectedSymbol, setSelectedSymbol] = useState("pill");

  // Speech voice settings
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);

  // AI Assistant box state
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantResponses, setAssistantResponses] = useState<any[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  // AI Health Coach insights state
  const [coachInsight, setCoachInsight] = useState<string>("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Auto alarm trigger ref
  const lastTriggeredAlarm = useRef<string>("");

  // -------------------------------------------------------------
  // Load Web Speech Voices
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Categorize / Filter clean English speech voices
        const engVoices = voices.filter(v => v.lang.includes("en") || v.lang.includes("HI"));
        setVoiceList(engVoices);
        if (engVoices.length > 0) {
          setSelectedVoice(engVoices[0]);
        }
      };
      getVoices();
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
  }, []);

  // -------------------------------------------------------------
  // Real-time collections listen subscription
  // -------------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    // 1. Listen to patient's medicine reminders
    const unsubReminders = firebaseService.subscribeToCollection(
      "medicine_reminders",
      (data) => {
        setReminders(data);
        setLoading(false);
      },
      [
        { field: "userId", operator: "==", value: user.id },
        { field: "status", operator: "==", value: "active" }
      ]
    );

    // 2. Listen to patient's daily consumption reports
    const unsubLogs = firebaseService.subscribeToCollection(
      "medicine_logs",
      (data) => {
        const sortedData = [...data].sort((a: any, b: any) => {
          const tA = a.loggedAt?.seconds || 0;
          const tB = b.loggedAt?.seconds || 0;
          return tB - tA; // descending
        });
        setLogs(sortedData);
      },
      [
        { field: "userId", operator: "==", value: user.id }
      ]
    );

    // 3. Listen to doctor prescriptions written to prescriptions
    const unsubPrescriptions = firebaseService.subscribeToCollection(
      "prescriptions",
      (data) => {
        setPrescriptions(data);
      },
      [
        { field: "patientId", operator: "==", value: user.id }
      ]
    );

    return () => {
      unsubReminders();
      unsubLogs();
      unsubPrescriptions();
    };
  }, [user?.id]);

  // Handle auto end-date calculation based on start date and days duration
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

  // -------------------------------------------------------------
  // Upcoming Medicine Countdown calculation
  // -------------------------------------------------------------
  useEffect(() => {
    const calculateCountdown = () => {
      if (reminders.length === 0) {
        setNextDose(null);
        setCountdownText("No active reminders scheduled");
        return;
      }

      const now = new Date();
      let closestDose: any = null;
      let minDiff = Infinity;
      let targetDateStr = "";

      // Check both today and tomorrow to guarantee finding an upcoming dose
      const daysToCheck = [0, 1]; 

      for (const dayOffset of daysToCheck) {
        const checkDay = new Date(now);
        checkDay.setDate(now.getDate() + dayOffset);
        const yyyy = checkDay.getFullYear();
        const mm = String(checkDay.getMonth() + 1).padStart(2, "0");
        const dd = String(checkDay.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        for (const rem of reminders) {
          // Verify that this checkDay falls inside the medicine start & end dates
          if (dateStr < rem.startDate || dateStr > rem.endDate) continue;

          for (const timing of rem.timings || []) {
            try {
              const [h, m] = timing.split(":").map(Number);
              const schedTime = new Date(checkDay);
              schedTime.setHours(h, m, 0, 0);

              const diff = schedTime.getTime() - now.getTime();
              if (diff > 0 && diff < minDiff) {
                // Check if this dose was already logged as taken today to avoid prompting redundancy
                const alreadyLogged = logs.some(
                  l => l.medicineName === rem.medicineName && 
                       l.timing === timing && 
                       l.date === dateStr &&
                       (l.status === "taken" || l.status === "skipped")
                );

                if (!alreadyLogged) {
                  minDiff = diff;
                  closestDose = rem;
                  targetDateStr = timing;
                }
              }
            } catch (err) {}
          }
        }
        // If we found a match for today, stop checking tomorrow
        if (closestDose) break;
      }

      if (!closestDose) {
        setNextDose(null);
        setCountdownText("No remaining doses today or tomorrow.");
        return;
      }

      setNextDose({ medicine: closestDose, timing: targetDateStr });

      // Trigger automatic alarm if within 1 minute
      if (minDiff > 0 && minDiff <= 60000) {
        const alarmKey = `${closestDose.id}-${targetDateStr}`;
        if (lastTriggeredAlarm.current !== alarmKey) {
          lastTriggeredAlarm.current = alarmKey;
          triggerVoiceGuidance(closestDose, targetDateStr);
          
          let screenMsg = `Alarm: Time to take ${closestDose.medicineName}!`;
          if (closestDose.language === "Marathi") {
            screenMsg = `वेळ झाली आहे! तुमची ${closestDose.medicineName} घ्या.`;
          } else if (closestDose.language === "Hindi") {
            screenMsg = `समय हो गया! अपनी ${closestDose.medicineName} लें।`;
          }
          showNotification(screenMsg, "info");
        }
      }

      // Generate the display remaining minutes / hours text
      const totalSecs = Math.floor(minDiff / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);

      if (closestDose.language === "Marathi") {
         if (hrs > 0) {
           setCountdownText(`पुढील औषध: ${closestDose.medicineName} ${hrs} तास ${mins} मिनिटांत`);
         } else {
           setCountdownText(`पुढील औषध: ${closestDose.medicineName} ${mins} मिनिटांत`);
         }
      } else if (closestDose.language === "Hindi") {
         if (hrs > 0) {
           setCountdownText(`अगली दवा: ${closestDose.medicineName} ${hrs} घंटे ${mins} मिनट में`);
         } else {
           setCountdownText(`अगली दवा: ${closestDose.medicineName} ${mins} मिनट में`);
         }
      } else {
         if (hrs > 0) {
           setCountdownText(`Next Medicine: ${closestDose.medicineName} in ${hrs} Hr ${mins} Min`);
         } else {
           setCountdownText(`Next Medicine: ${closestDose.medicineName} in ${mins} Minutes`);
         }
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000 * 60); // Update timer every minute
    return () => clearInterval(interval);
  }, [reminders, logs]);

  // -------------------------------------------------------------
  // Adherence Score Analytics Calculations
  // -------------------------------------------------------------
  const getAdherenceMetrics = () => {
    const totalTaken = logs.filter(l => l.status === "taken").length;
    const totalMissed = logs.filter(l => l.status === "missed").length;
    const totalSkipped = logs.filter(l => l.status === "skipped").length;
    
    const totalPlanned = totalTaken + totalMissed + totalSkipped;
    const score = totalPlanned > 0 ? Math.round((totalTaken / totalPlanned) * 100) : 100;

    let tier: "excellent" | "good" | "needs_attention" = "excellent";
    if (score >= 90) tier = "excellent";
    else if (score >= 75) tier = "good";
    else tier = "needs_attention";

    return { score, totalTaken, totalMissed, totalSkipped, totalPlanned, tier };
  };

  const metrics = getAdherenceMetrics();

  // -------------------------------------------------------------
  // Add / Sync reminders helpers
  // -------------------------------------------------------------
  const handleAddNewReminder = async (e: React.FormEvent) => {
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
        language: formLanguage,
        notes: formNotes,
        color: formColor,
        symbol: selectedSymbol,
        status: "active",
        createdAt: serverTimestamp()
      };

      if (editingReminder) {
        await updateDoc(doc(db, "medicine_reminders", editingReminder.id), payload);
        showNotification(`"${formName}" schedule updated successfully!`, "success");
      } else {
        await addDoc(collection(db, "medicine_reminders"), payload);
        showNotification(`"${formName}" scheduled dynamically!`, "success");
      }

      resetForm();
      setShowAddModal(false);
    } catch (err: any) {
      console.error(err);
      showNotification("Could not schedule medication", "error");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormGeneric("");
    setFormType("Tablet");
    setFormStrength("");
    setFormQuantityPerDose("1");
    setFormSchedule("Once Daily");
    setFormTimings(["08:00"]);
    setFormMealTime("after");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormDurationDays("7");
    setFormStock("30");
    setFormRefillThreshold("5");
    setFormNotes("");
    setFormLanguage("English");
    setFormColor("#3B82F6");
    setSelectedSymbol("pill");
    setEditingReminder(null);
  };

  const openEditReminder = (rem: any) => {
    setEditingReminder(rem);
    setFormName(rem.medicineName || "");
    setFormGeneric(rem.genericName || "");
    setFormType(rem.type || "Tablet");
    setFormStrength(rem.dosage?.includes("(") ? rem.dosage.split("(")[1].replace(")", "") : "");
    // Extract quant
    const firstWord = rem.dosage?.split(" ")[0];
    setFormQuantityPerDose(!isNaN(Number(firstWord)) ? firstWord : "1");
    setFormSchedule(rem.repeatSchedule || "Once Daily");
    setFormTimings(rem.timings || ["08:00"]);
    setFormMealTime(rem.mealTime || "after");
    setFormStartDate(rem.startDate || new Date().toISOString().split("T")[0]);
    
    // Days duration diff
    if (rem.startDate && rem.endDate) {
      const start = new Date(rem.startDate);
      const end = new Date(rem.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormDurationDays(String(diffDays));
    } else {
      setFormDurationDays("7");
    }

    setFormStock(String(rem.stockQuantity || 30));
    setFormRefillThreshold(String(rem.refillThreshold || 5));
    setFormNotes(rem.notes || "");
    setFormLanguage(rem.language || "English");
    setFormColor(rem.color || "#3B82F6");
    setSelectedSymbol(rem.symbol || "pill");
    setShowAddModal(true);
  };

  const handleDeleteReminder = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to stop reminders for "${name}"?`)) {
      try {
        await updateDoc(doc(db, "medicine_reminders", id), { status: "deleted" });
        showNotification(`Scheduled reminders for "${name}" disabled.`, "info");
      } catch (err) {
        showNotification("Could not delete medicine reminder.", "error");
      }
    }
  };

  // Add schedules timings list dynamically based on standard selection
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

  // -------------------------------------------------------------
  // Manual / Quick Action log medication
  // -------------------------------------------------------------
  const logMedStatusDirect = async (rem: any, timing: string, status: "taken" | "missed" | "skipped") => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Save log entry to database
      await addDoc(collection(db, "medicine_logs"), {
        userId: user.id,
        userName: user.name || "Patient",
        medicineId: rem.id,
        medicineName: rem.medicineName,
        dosage: rem.dosage,
        timing,
        date: today,
        status,
        loggedAt: serverTimestamp()
      });

      // Update remaining stock inventory if taken
      if (status === "taken" && rem.stockQuantity !== undefined) {
        const remainingStock = Math.max(0, rem.stockQuantity - 1);
        await updateDoc(doc(db, "medicine_reminders", rem.id), {
          stockQuantity: remainingStock
        });
        
        if (remainingStock <= (rem.refillThreshold || 5)) {
          showNotification(`Low Stock Warning: "${rem.medicineName}" has only ${remainingStock} left!`, "error");
        }
      }

      showNotification(`medication marked as ${status.toUpperCase()} successfully.`, "success");

      // Voice guidelines feedback
      if (status === "taken" && voiceEnabled) {
        speakText(`Excellent job. You have logged your intake of ${rem.medicineName}. Keep up the great adherence!`);
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to log medication status", "error");
    }
  };

  // -------------------------------------------------------------
  // Refill pills inventory directly
  // -------------------------------------------------------------
  const handleRefillStock = async (rem: any) => {
    const refillQty = 30; // standard box refill
    const newQty = (rem.stockQuantity || 0) + refillQty;
    try {
      await updateDoc(doc(db, "medicine_reminders", rem.id), { stockQuantity: newQty });
      showNotification(`Refilled stock of "${rem.medicineName}" (+${refillQty} added). Total: ${newQty}`, "success");
    } catch (e) {
      showNotification("Could not complete stock refill", "error");
    }
  };

  // -------------------------------------------------------------
  // Voice Synthesis Engine Readout
  // -------------------------------------------------------------
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // cancel any running speaking session first
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.pitch = 1.0;
      utterance.rate = 0.95; // elegant slower speech
      window.speechSynthesis.speak(utterance);
    }
  };

  const playRingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // First chime ring tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second chime ring tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.35);
      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.45);
    } catch (err) {
      console.warn("Ring sound playback error:", err);
    }
  };

  const triggerVoiceGuidance = (rem: any, timing: string) => {
    // 1. Play ring chime sound first
    playRingChime();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    const timingStr = typeof timing === "string" ? timing : "08:00";
    const hour = parseInt(timingStr.split(":")[0], 10) || 8;
    const langRaw = String(rem?.audioLang || rem?.language || "english").toLowerCase();
    
    let greeting = "";
    let textToSpeak = "";
    let langCode = "en-US";

    const pName = user?.name || "Patient";
    const mName = typeof rem === "string" ? rem : (rem?.medicineName || rem?.medicine || "Medicine");
    const mealTime = rem?.mealTime || "after";
    const mealTextMr = mealTime === "after" ? "जेवणानंतर" : mealTime === "before" ? "जेवणापूर्वी" : mealTime === "with" ? "जेवणासोबत" : "रिकाम्या पोटी";
    const mealTextHi = mealTime === "after" ? "खाने के बाद" : mealTime === "before" ? "खाने से पहले" : mealTime === "with" ? "खाने के साथ" : "खाली पेट";
    const mealTextEn = mealTime === "after" ? "after food" : mealTime === "before" ? "before food" : mealTime === "with" ? "with food" : "on empty stomach";

    if (langRaw.includes("marathi") || langRaw.includes("mr")) {
      if (hour >= 12 && hour < 17) greeting = "शुभ दुपार";
      else if (hour >= 17) greeting = "शुभ संध्याकाळ";
      else greeting = "शुभ प्रभात";
      textToSpeak = `${greeting} ${pName} जी, तुमची ${mName} औषध घेण्याची वेळ झाली आहे. कृपया ही औषध ${mealTextMr} घ्या.`;
      langCode = "mr-IN";
    } else if (langRaw.includes("hindi") || langRaw.includes("hi")) {
      if (hour >= 12 && hour < 17) greeting = "शुभ दोपहर";
      else if (hour >= 17) greeting = "शुभ संध्या";
      else greeting = "शुभ प्रभात";
      textToSpeak = `${greeting} ${pName} जी, आपके ${mName} दवाई लेने का समय हो गया है। कृपया इसे ${mealTextHi} लें।`;
      langCode = "hi-IN";
    } else {
      if (hour >= 12 && hour < 17) greeting = "Good afternoon";
      else if (hour >= 17) greeting = "Good evening";
      else greeting = "Good morning";
      textToSpeak = `${greeting} ${pName}, it is time to take your ${mName}. Please take it ${mealTextEn}.`;
      langCode = "en-US";
    }

    // 2. Announce voice message after ring sound
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langCode;
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
        
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase()) ||
                             voices.find(v => v.lang.toLowerCase().startsWith(langCode.split("-")[0]));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech Synthesis Error:", err);
      }
    }, 450);
  };

  // -------------------------------------------------------------
  // Auto Prescription Sync Logic
  // -------------------------------------------------------------
  const getPrescriptionsToSync = () => {
    const unsynced: any[] = [];
    
    for (const rx of prescriptions) {
      const rxMeds = rx.medicines || [];
      for (const med of rxMeds) {
        // Check if there is an active reminder with a similar name
        const alreadyScheduled = reminders.some(
          r => r.medicineName.toLowerCase().trim() === med.name.toLowerCase().trim() && r.status === "active"
        );
        if (!alreadyScheduled) {
          unsynced.push({ rxId: rx.id, docName: rx.clinicName, med });
        }
      }
    }
    return unsynced;
  };

  const unsyncedMeds = getPrescriptionsToSync();

  const handleSyncPrescriptionMed = async (item: any) => {
    try {
      const { med, docName } = item;
      
      // Parse frequencies e.g. "1-0-1" -> Twice daily, "1-1-1" -> Thrice, etc.
      let sched: "Once Daily" | "Twice Daily" | "Thrice Daily" | "Weekly" = "Once Daily";
      let timings = ["08:00"];
      if (med.frequency === "1-0-1") {
        sched = "Twice Daily";
        timings = ["08:00", "20:00"];
      } else if (med.frequency === "1-1-1") {
        sched = "Thrice Daily";
        timings = ["08:00", "14:00", "20:00"];
      } else if (med.frequency === "0-0-1" || med.frequency === "Once Daily") {
        sched = "Once Daily";
        timings = ["20:00"];
      }

      const end = new Date();
      if (med.duration) {
        const days = parseInt(med.duration.replace(/[^0-9]/g, ""));
        if (!isNaN(days)) end.setDate(end.getDate() + days - 1);
        else end.setDate(end.getDate() + 6);
      } else {
        end.setDate(end.getDate() + 6);
      }

      const payload = {
        userId: user.id,
        userName: user.name || "Patient",
        medicineName: med.name,
        genericName: "",
        type: med.name.toLowerCase().includes("cough") || med.name.toLowerCase().includes("syrup") ? "Syrup" : "Tablet",
        form: med.name.toLowerCase().includes("cough") || med.name.toLowerCase().includes("syrup") ? "syrup" : "tablet",
        dosage: med.dose || "1 Tablet",
        timings,
        mealTime: med.timing?.toLowerCase().includes("before") ? "before" : "after",
        repeatSchedule: sched,
        startDate: new Date().toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        stockQuantity: parseInt(med.quantity, 10) || 30,
        refillThreshold: 5,
        alarmTone: "soft medical tone",
        notes: `Auto-synchronized from clinical prescription by clinic "${docName}". Instructions: ${med.route || "Oral"}`,
        color: "#10B981", // vibrant synced emerald
        symbol: "pill",
        status: "active",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "medicine_reminders"), payload);
      showNotification(`Synced prescribed remedy: "${med.name}" added to Dashboard!`, "success");
    } catch (e) {
      showNotification("Could not sync prescriped medication reminders.", "error");
    }
  };

  // -------------------------------------------------------------
  // AI Health Coach Guidelines supervision
  // -------------------------------------------------------------
  const fetchCoachReview = async () => {
    setCoachLoading(true);
    setCoachInsight("");
    try {
      const response = await fetch("/api/ai/medicine-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: reminders.map(r => ({ name: r.medicineName, dose: r.dosage, timings: r.timings, schedule: r.repeatSchedule })),
          adherenceScore: metrics.score,
          logs: logs.slice(0, 50).map(l => ({ name: l.medicineName, date: l.date, status: l.status, loggedAt: l.loggedAt }))
        })
      });

      const data = await response.json();
      if (data.text) {
        setCoachInsight(data.text);
      } else {
        setCoachInsight("Could not process insights from database metadata details.");
      }
    } catch (err) {
      setCoachInsight("The AI medication supervision coach is briefly sleeping. Set alarms and maintain standard schedules.");
    } finally {
      setCoachLoading(false);
    }
  };

  // Auto trigger coach review when subTab changes to analytics or coach insights tab
  useEffect(() => {
    if (activeSubTab === "analytics" && reminders.length > 0) {
      fetchCoachReview();
    }
  }, [activeSubTab, reminders.length]);

  // -------------------------------------------------------------
  // AI Medicine Assistant Chat
  // -------------------------------------------------------------
  const askAssistant = async () => {
    if (!assistantQuery.trim()) return;
    const userMsg = assistantQuery;
    setAssistantQuery("");
    setAssistantLoading(true);

    const tempHistory = [...assistantResponses, { role: "user", text: userMsg }];
    setAssistantResponses(tempHistory);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          language: "English",
          patientContext: `You are answering questions about medication management. Here are the user's active medicines: ${reminders.map(r => r.medicineName).join(", ")}. Provide safe, informative guidelines. State educational disclaimers.`
        })
      });

      const data = await response.json();
      if (data.text) {
        const cleanText = data.text.split("|")[0].trim(); // omit follow-ups
        setAssistantResponses([...tempHistory, { role: "model", text: cleanText }]);
      } else {
        setAssistantResponses([...tempHistory, { role: "model", text: "I'm sorry, I'm having trouble retrieving medication details right now." }]);
      }
    } catch (err) {
      setAssistantResponses([...tempHistory, { role: "model", text: "Connection error. Please review your medication instructions sheet." }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // Group todays medicines by periods
  const todayDateStr = new Date().toISOString().split("T")[0];
  const activeTodaysMeds = reminders.filter(r => todayDateStr >= r.startDate && todayDateStr <= r.endDate);

  const getPeriodDoses = (period: "morning" | "afternoon" | "evening" | "night") => {
    return activeTodaysMeds.filter(rem => {
      return (rem.timings || []).some((time: string) => {
        const hour = parseInt(time.split(":")[0], 10);
        if (period === "morning" && hour >= 5 && hour < 12) return true;
        if (period === "afternoon" && hour >= 12 && hour < 17) return true;
        if (period === "evening" && hour >= 17 && hour < 21) return true;
        if (period === "night" && (hour >= 21 || hour < 5)) return true;
        return false;
      });
    });
  };

  const dosePeriods = [
    { id: "morning" as const, label: "Morning Meals", range: "05:00 AM - 11:59 AM", color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
    { id: "afternoon" as const, label: "Afternoon Midday", range: "12:00 PM - 04:59 PM", color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-500/20" },
    { id: "evening" as const, label: "Evening Sunset", range: "05:00 PM - 08:59 PM", color: "from-orange-500 to-rose-500", shadow: "shadow-orange-500/20" },
    { id: "night" as const, label: "Night Bedtime", range: "09:00 PM - 04:59 AM", color: "from-purple-500 to-indigo-950", shadow: "shadow-purple-500/20" }
  ];

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------
          HEADER SUB-MENU TABS
          --------------------------------------------------------- */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-[1.5rem] bg-slate-500/5 backdrop-blur-md border border-slate-500/10 max-w-max">
        {[
          { id: "dashboard", label: "Dashboard", icon: Pill },
          { id: "reminders", label: "Schedules", icon: Clock },
          { id: "analytics", label: "Adherence Insights", icon: TrendingUp },
          { id: "assistant", label: "Pills Assistant", icon: Bot },
          { id: "prescriptions", label: "Rx Prescription Sync", icon: FileText, count: unsyncedMeds.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4.5 py-3.5 rounded-[1.1rem] font-bold text-xs uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                isActive 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                  : darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-slate-900 animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------
          TAB 1: MEDICATION DASHBOARD (TODAY'S MEDICINES)
          --------------------------------------------------------- */}
      {activeSubTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main left panels (Period doses + countdown) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Upcoming countdown widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2.2rem] border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
              }`}
            >
              {/* background glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                  <Clock className="text-white" size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                    Live Reminders & Countdown
                  </h3>
                  <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                    {countdownText}
                  </p>
                </div>
              </div>

              {nextDose ? (
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <button
                    onClick={() => triggerVoiceGuidance(nextDose.medicine, nextDose.timing)}
                    className="p-3 bg-slate-500/10 hover:bg-slate-500/20 rounded-xl transition-all cursor-pointer"
                    title="Audio Guideline Readout"
                  >
                    <Volume2 size={16} className="text-blue-500" />
                  </button>
                  <button
                    onClick={() => logMedStatusDirect(nextDose.medicine, nextDose.timing, "taken")}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Confirm Taken
                  </button>
                  <button
                    onClick={() => logMedStatusDirect(nextDose.medicine, nextDose.timing, "skipped")}
                    className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold max-w-xs uppercase tracking-wider">
                  You're fully up-to-date with your treatment timeline. Nice work!
                </p>
              )}
            </motion.div>

            {/* Dose Periods Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">Today's Treatment Schedule</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 text-xs font-black uppercase text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  <Plus size={16} /> Add Remedy Reminder
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dosePeriods.map((period) => {
                  const doses = getPeriodDoses(period.id);
                  return (
                    <motion.div
                      key={period.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-[2.2rem] border flex flex-col justify-between gap-4 ${
                        darkMode ? "bg-slate-900/20 border-white/5" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Period header */}
                        <div className="flex items-center justify-between border-b border-slate-500/10 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`h-3 w-3 rounded-full bg-gradient-to-tr ${period.color} shadow-md`} />
                            <div>
                              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{period.label}</h4>
                              <span className={`text-[10px] font-mono ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{period.range}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${darkMode ? "bg-slate-700/60 text-slate-300" : "bg-slate-500/10 text-slate-600"}`}>{doses.length} Doses</span>
                        </div>

                        {/* List Doses */}
                        <div className="mt-4 space-y-3">
                          {doses.length === 0 ? (
                            <p className={`text-xs font-semibold italic py-2 text-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No medicines schedule for this block.</p>
                          ) : (
                            doses.map((rem) => {
                              // Match exact timing for this period range
                              const checkTiming = rem.timings?.find((t: string) => {
                                const h = parseInt(t.split(":")[0], 10);
                                if (period.id === "morning" && h >= 5 && h < 12) return true;
                                if (period.id === "afternoon" && h >= 12 && h < 17) return true;
                                if (period.id === "evening" && h >= 17 && h < 21) return true;
                                if (period.id === "night" && (h >= 21 || h < 5)) return true;
                                return false;
                              }) || "08:00";

                              // Check if logged
                              const dStamp = new Date().toISOString().split("T")[0];
                              const loggedEntry = logs.find(l => l.medicineId === rem.id && l.timing === checkTiming && l.date === dStamp);

                              return (
                                <div
                                  key={rem.id}
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                    loggedEntry?.status === "taken" 
                                      ? "bg-emerald-500/10 border-emerald-500/20 opacity-75"
                                      : loggedEntry?.status === "skipped"
                                      ? "bg-slate-500/5 border-slate-500/10 opacity-60"
                                      : loggedEntry?.status === "missed"
                                      ? "bg-rose-500/10 border-rose-500/20"
                                      : "bg-slate-500/10 border-slate-500/10"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      style={{ backgroundColor: `${rem.color || "#3B82F6"}1D`, borderColor: rem.color }}
                                      className="h-9 w-9 rounded-lg border flex items-center justify-center shrink-0"
                                    >
                                      {rem.type === "Syrup" ? <Droplet size={14} style={{ color: rem.color }} /> : rem.type === "Injection" ? <Syringe size={14} style={{ color: rem.color }} /> : <Pill size={14} style={{ color: rem.color }} />}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className={`font-extrabold text-xs truncate leading-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{rem.medicineName}</h5>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 capitalize truncate font-mono">
                                        {rem.dosage} • {rem.mealTime} food
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/15 font-mono">{checkTiming}</span>
                                    
                                    {loggedEntry ? (
                                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                                        loggedEntry.status === "taken" ? "bg-emerald-600/20 text-emerald-500" : loggedEntry.status === "skipped" ? "text-slate-400 bg-slate-500/10" : "text-rose-500 bg-rose-600/20"
                                      }`}>
                                        {loggedEntry.status}
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => logMedStatusDirect(rem, checkTiming, "taken")}
                                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                                          title="Mark Taken"
                                        >
                                          <Check size={11} />
                                        </button>
                                        <button
                                          onClick={() => logMedStatusDirect(rem, checkTiming, "skipped")}
                                          className="p-1.5 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-lg transition-colors cursor-pointer"
                                          title="Mark Skipped"
                                        >
                                          <X size={11} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Bento Grid (Stats rings, generic Coach insights, refills) */}
          <div className="space-y-6">
            {/* Quick stats indicator */}
            <div className={`p-6 rounded-[2.2rem] border overflow-hidden relative shadow-md ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <h4 className={`font-extrabold text-sm uppercase tracking-wider mb-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Treatment adherence score</h4>
              
              <div className="flex items-center gap-6">
                {/* SVG circular progress */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" className="text-slate-500/10" strokeWidth="6.5" stroke="currentColor" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className={`${
                        metrics.tier === "excellent" ? "text-emerald-500" : metrics.tier === "good" ? "text-blue-500" : "text-rose-500 animate-pulse"
                      } transition-all duration-1000`}
                      strokeWidth="6.5"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - metrics.score / 100)}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-sm font-black tracking-tight">{metrics.score}%</span>
                </div>

                <div>
                  <h5 className={`font-black text-xs uppercase ${
                    metrics.tier === "excellent" ? "text-emerald-500" : metrics.tier === "good" ? "text-blue-500" : "text-rose-500"
                  }`}>
                    {metrics.tier === "excellent" ? "Excellent Treatment" : metrics.tier === "good" ? "Good Routine" : "Needs Attention"}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Logged {metrics.totalTaken} of {metrics.totalPlanned} planned medication doses. Keep a regular focus on your healthcare.
                  </p>
                </div>
              </div>
            </div>

            {/* AI medication insights bento */}
            <div className={`p-6 rounded-[2.2rem] border flex flex-col justify-between gap-4 overflow-hidden relative shadow-md ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between border-b border-slate-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-emerald-500 animate-pulse" />
                  <h4 className={`font-extrabold text-sm uppercase tracking-wider ${darkMode ? "text-slate-100" : "text-slate-800"}`}>AI Health Supervisor Coach</h4>
                </div>
                <button
                  onClick={fetchCoachReview}
                  disabled={coachLoading}
                  className={`p-1 transition-colors ${darkMode ? "text-slate-400 hover:text-emerald-500" : "text-slate-500 hover:text-emerald-500"}`}
                >
                  <RefreshCw size={13} className={coachLoading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="py-2">
                {coachLoading ? (
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold py-6 justify-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-200" />
                    <span>Analyzing intake logs...</span>
                  </div>
                ) : coachInsight ? (
                  <div className={`text-xs leading-relaxed font-semibold ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
                    <p className="whitespace-pre-line leading-relaxed">{coachInsight}</p>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <Bot size={34} className="mx-auto text-slate-500/30" />
                    <p className="text-xs font-bold text-slate-400">Click refresh to run smart health logs coaching.</p>
                  </div>
                )}
              </div>
              <div className="text-[10px] bg-slate-500/5 p-2 rounded-lg text-slate-400 font-semibold border border-slate-500/10 flex gap-1.5 items-start">
                <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
                <span>Coach insights are purely educational. Do not alter medicine counts without consulting doctor Patil.</span>
              </div>
            </div>

            {/* Medicine refils panel */}
            <div className={`p-6 rounded-[2.2rem] border shadow-md ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <h4 className={`font-extrabold text-sm uppercase tracking-wider mb-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Medicine Stock & Refills</h4>
              
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <p className={`text-xs italic text-center py-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No scheduled stock tracking</p>
                ) : (
                  reminders.map((rem) => {
                    const isLow = rem.stockQuantity <= (rem.refillThreshold || 5);
                    return (
                      <div key={rem.id} className="flex items-center justify-between gap-3 text-xs border-b border-slate-500/5 pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <h5 className={`font-extrabold truncate max-w-[120px] ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{rem.medicineName}</h5>
                          <span className={`text-[10px] font-bold mt-1 block ${isLow ? "text-rose-500" : darkMode ? "text-slate-400" : "text-slate-500"}`}>
                            {rem.stockQuantity !== undefined ? `${rem.stockQuantity} Remaining` : "Unlimited"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shink-0">
                          {isLow && (
                            <span className="px-2 py-0.5 bg-rose-500/15 text-rose-500 text-[9px] font-black uppercase rounded animate-pulse">Low Stock</span>
                          )}
                          <button
                            onClick={() => handleRefillStock(rem)}
                            className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Refill (+30)
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          TAB 2: SCHEDULES / ALL REMINDERS
          --------------------------------------------------------- */}
      {activeSubTab === "reminders" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-[2.5rem] border ${
            darkMode ? "bg-slate-900/20 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-black text-xl">Configured Remedial Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Configure complex medication loops and alarm profiles.</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Add New Reminder
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <Pill size={54} className="mx-auto text-slate-500/30 animate-pulse-slow" />
              <p className="text-base font-bold">No planned medicine alarms configured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-6 rounded-[2.2rem] border transition-all duration-350 hover:scale-[1.012] hover:shadow-xl relative flex flex-col justify-between gap-4 ${
                    darkMode 
                      ? "bg-slate-800/40 border-white/5 hover:border-slate-700" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Header medicine name, dose, generic */}
                    <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-550/10">
                      <div>
                        <h4 className="font-black text-lg text-emerald-500 leading-tight truncate max-w-[150px]">
                          {rem.medicineName}
                        </h4>
                        {rem.genericName && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px] italic">Gen: {rem.genericName}</p>
                        )}
                        <p className="text-xs font-bold text-slate-450 mt-1 capitalize">{rem.dosage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase shrink-0">
                          {rem.repeatSchedule}
                        </span>
                        <span className="text-[10px] text-slate-450 font-mono mt-1 shrink-0">
                          {rem.timings?.join(", ") || rem.timing}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400 py-3">
                      <p className="flex justify-between">
                        <span>Meal Instruction:</span> 
                        <span className="text-slate-900 dark:text-slate-200 capitalize font-bold">{rem.mealTime === "empty" ? "empty stomach" : `${rem.mealTime} food`}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Treatment Window:</span> 
                        <span className="font-mono text-[11px] text-slate-900 dark:text-slate-200 font-bold">{rem.startDate} to {rem.endDate}</span>
                      </p>
                      {rem.stockQuantity !== undefined && (
                        <p className="flex justify-between">
                          <span>Inventory Stock:</span> 
                          <span className={`font-mono font-black ${rem.stockQuantity <= (rem.refillThreshold || 5) ? "text-rose-500" : "text-emerald-500"}`}>
                            {rem.stockQuantity} pills left
                          </span>
                        </p>
                      )}
                      {rem.notes && (
                        <p className="mt-2 bg-slate-500/5 p-2.5 rounded-xl text-[11px] italic text-slate-405/60 truncate">
                          Instructions: "{rem.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-500/5 pt-3 mt-auto shrink-0">
                    <button
                      onClick={() => openEditReminder(rem)}
                      className="text-xs font-black uppercase text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Configure / Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(rem.id, rem.medicineName)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 rounded-xl transition-all cursor-pointer"
                      title="Disable Alarms"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          TAB 3: ANALYTICS & LOG HISTORIES
          --------------------------------------------------------- */}
      {activeSubTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Detailed statistics metrics bento panels */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-[2.5rem] border ${
              darkMode ? "bg-slate-900/20 border-white/5" : "bg-white border-slate-200"
            }`}>
              <h3 className="font-black text-lg mb-6">Historical Med Intake Logs</h3>

              {logs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-4">
                  <Activity className="mx-auto text-slate-500/30" size={54} />
                  <p className="text-sm font-bold">No medication status logged yet. Mark taken above!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs font-semibold ${
                        log.status === "taken" 
                          ? "bg-emerald-500/5 border-emerald-500/10" 
                          : log.status === "skipped"
                          ? "bg-slate-500/5 border-slate-500/10"
                          : "bg-rose-500/5 border-rose-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          log.status === "taken" ? "bg-emerald-500" : log.status === "skipped" ? "bg-slate-400" : "bg-rose-500 animate-pulse"
                        }`} />
                        <div>
                          <h5 className="font-extrabold dark:text-white leading-tight">{log.medicineName}</h5>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Scheduled Hour: {log.timing}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                          log.status === "taken" 
                            ? "bg-emerald-500/20 text-emerald-500" 
                            : log.status === "skipped"
                            ? "bg-slate-500/15 text-slate-400"
                            : "bg-rose-500/20 text-rose-500"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Adherence summaries & safety duplicates reports */}
          <div className="space-y-6">
            {/* Safety duplications validation */}
            <div className={`p-6 rounded-[2.2rem] border relative overflow-hidden flex flex-col justify-between gap-4 ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-500/10 header-title">
                <ShieldAlert className="text-emerald-500 animate-pulse" size={17} />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">AI Safety Alerts</h4>
              </div>
              
              <div className="py-2 space-y-3">
                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No scheduled items to inspect duplicate overlaps.</p>
                ) : (
                  (() => {
                    // Inspect duplicate timings or categories
                    const conflictTimings = new Set<string>();
                    const timingsCount: Record<string, string[]> = {};
                    
                    reminders.forEach(r => {
                      (r.timings || []).forEach((t: string) => {
                        if (!timingsCount[t]) timingsCount[t] = [];
                        timingsCount[t].push(r.medicineName);
                      });
                    });

                    const timingIssues = Object.entries(timingsCount).filter(([_, list]) => list.length > 1);

                    if (timingIssues.length === 0) {
                      return (
                        <div className="flex items-start gap-2.5 text-xs text-slate-405/85 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10">
                          <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                          <span>Perfect schedules: No critical timing conflicts or duplication overlaps detected. Your medicine loop is clean.</span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 text-xs">
                        <p className="font-bold text-red-500 uppercase tracking-widest text-[10px]">Overlapping Timings alert:</p>
                        {timingIssues.map(([time, list]) => (
                          <div key={time} className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-500">
                            <span className="font-bold block uppercase text-[10px]">Timing Block: {time}</span>
                            <span className="mt-1 block font-semibold leading-relaxed">
                              You have scheduled multiple medicines ({list.join(", ")}) at exact same minute. Verify if they conflict or need food gap.
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          TAB 4: AI PILLS ASSISTANT CHATBOX
          --------------------------------------------------------- */}
      {activeSubTab === "assistant" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-[2.5rem] border flex flex-col gap-4 shadow-lg ${
            darkMode ? "bg-slate-900/20 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-slate-500/10 pb-4">
            <div className="h-10 w-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg">AI Medicine & Pill Assistant</h3>
              <p className="text-xs text-slate-400">Ask about dosage timings, generic alternative components, or interactions.</p>
            </div>
          </div>

          {/* Chats grid history */}
          <div className="h-[350px] overflow-y-auto space-y-4 pr-1 p-2 bg-slate-500/5 rounded-2xl flex flex-col">
            {assistantResponses.length === 0 ? (
              <div className="my-auto text-center text-slate-400 space-y-3">
                <BookOpen className="mx-auto text-slate-500/20" size={44} />
                <p className="text-xs font-bold font-mono">Ask standard educational, therapeutic medicine prompts. Try e.g.:</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto pt-2">
                  {[
                    "Why should I take Multivitamins after food?",
                    "What are generic safe alternatives for Paracetamol?",
                    "How to recover missed remedy schedules?"
                  ].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => setAssistantQuery(tip)}
                      className="px-3 py-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              assistantResponses.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3.5 rounded-2.5xl leading-relaxed text-xs font-semibold ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white ml-auto"
                      : "bg-slate-500/10 border border-slate-500/10 text-slate-800 dark:text-slate-200 mr-auto whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}

            {assistantLoading && (
              <div className="flex items-center gap-3 text-xs text-slate-400 font-bold p-3 mr-auto bg-slate-500/5 border border-slate-500/10 rounded-2xl">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                <span>AI is formulating guidance...</span>
              </div>
            )}
          </div>

          {/* Quick interactive input footer */}
          <div className="flex gap-2.5 mt-2">
            <input
              type="text"
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAssistant()}
              placeholder="Query about generic tablet parameters, side effects, etc..."
              className="flex-1 p-4 bg-slate-500/5 hover:bg-slate-500/10 focus:bg-slate-500/10 outline-none border border-slate-500/10 text-slate-800 dark:text-white rounded-2xl font-semibold text-xs tracking-wide placeholder-slate-450"
            />
            <button
              onClick={askAssistant}
              className="px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase cursor-pointer"
            >
              Ask AI
            </button>
          </div>

          <div className="text-[10px] bg-sky-500/5 p-2 rounded-lg text-slate-400 font-semibold border border-sky-500/10 flex gap-1.5 items-start">
            <Info size={12} className="text-sky-500 shrink-0 mt-0.5" />
            <span>Educational Disclaimer: AI responses represent general pharmacology guidelines and are NOT professional e-prescriptions.</span>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          TAB 5: PRESCRIPTION SYNC (DOCTOR INTEGRATION)
          --------------------------------------------------------- */}
      {activeSubTab === "prescriptions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-[2.5rem] border ${
            darkMode ? "bg-slate-900/20 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="border-b border-slate-500/10 pb-4 mb-6">
            <h3 className="font-black text-lg">Auto Clinical Prescription Rx Sync</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your patient portal synchronizes digital prescriptions generated by your CareBridge doctor Patil automatically.
            </p>
          </div>

          {unsyncedMeds.length === 0 ? (
            <div className="text-center py-12 bg-slate-500/5 rounded-3xl border border-slate-500/5 text-slate-400 space-y-3">
              <Check className="mx-auto text-emerald-500" size={34} />
              <p className="font-black text-sm text-slate-800 dark:text-slate-100">All Doctor Prescriptions Synced!</p>
              <p className="text-xs max-w-xs mx-auto text-slate-400 leading-relaxed font-semibold">
                There are no active doctor prescribed remedies pending on-demand scheduling. All active pharmaceutical loops are synced.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-2">
                  <AlertTriangle size={15} /> Pending Prescriptions Available ({unsyncedMeds.length})
                </span>
                
                <button
                  onClick={async () => {
                    for (const item of unsyncedMeds) {
                      await handleSyncPrescriptionMed(item);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[10px] uppercase cursor-pointer"
                >
                  Sync All Pending (Rx)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unsyncedMeds.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                      darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase rounded-md">
                        Clinically Prescribed
                      </span>
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 mt-2 truncate">
                        {item.med.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 font-mono">
                        Dose: {item.med.dose || "1 tablet"} • Freq: {item.med.frequency} • Vol: {item.med.quantity}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-2 font-semibold">
                        Authorized by: {item.docName || "Dr. Patil"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSyncPrescriptionMed(item)}
                      className="flex items-center gap-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase cursor-pointer shrink-0"
                    >
                      <Plus size={14} /> Sync Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          POPUP MODAL: ADD / EDIT MEDICINE reminder FORM
          --------------------------------------------------------- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                    <h3 className="font-black text-base tracking-tight uppercase">
                      {editingReminder ? "UPDATE MEDICATION ALARMS" : "SCHEDULE NEW REMEDY ALARM"}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      CONFIGURE MEDICATION TIMELINE
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddNewReminder} className="p-7 space-y-5">

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
                      { id: "English", label: "ENGLISH", sub: "IN ENGLISH", emoji: "🇬🇧" },
                      { id: "Hindi",   label: "हिंदी",   sub: "IN HINDI",   emoji: "🇮🇳" },
                      { id: "Marathi", label: "मराठी",  sub: "IN MARATHI",  emoji: "🫶" },
                    ] as const).map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setFormLanguage(lang.id as any)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                          formLanguage === lang.id
                            ? "border-rose-500 bg-rose-500/10 text-rose-500 shadow-md shadow-rose-500/15"
                            : darkMode
                              ? "border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white"
                              : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-500 shadow-sm"
                        }`}
                      >
                        <span className="text-xl">{lang.emoji}</span>
                        <span>{lang.label}</span>
                        <span className={`text-[8px] font-bold tracking-widest ${formLanguage === lang.id ? "text-rose-400" : darkMode ? "text-slate-600" : "text-slate-400"}`}>{lang.sub}</span>
                      </button>
                    ))}
                  </div>
                  {/* Voice announcement preview */}
                  <div className={`mt-1 p-3 rounded-xl border text-[11px] font-semibold leading-relaxed ${darkMode ? "bg-black/20 border-white/5 text-slate-400" : "bg-slate-100/80 border-slate-200 text-slate-500"}`}>
                    🔔{" "}
                    {formLanguage === "Marathi"
                      ? `"${formName || "औषध"} घेण्याची वेळ झाली आहे. ${formMealTime === "after" ? "जेवणानंतर" : formMealTime === "before" ? "जेवणापूर्वी" : formMealTime === "with" ? "जेवणासोबत" : "रिकाम्या पोटी"} ${formQuantityPerDose || "1"} ${formType === "Tablet" ? "गोळी" : formType === "Syrup" ? "चमचा" : formType} घ्या."`
                      : formLanguage === "Hindi"
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
                  ✓ {editingReminder ? "UPDATE MEDICATION ALARMS" : "APPLY MEDICATION ALARM TIMELINE"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
