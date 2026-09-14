import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  Clock,
  Sparkles,
  Award,
  Plus,
  Trash2,
  Brain,
  TrendingUp,
  AlertCircle,
  FileText,
  Check,
  X,
  RefreshCw,
  Search,
  BookOpen,
  ChevronRight,
  Info,
  User,
  ShieldAlert,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  Share2,
  Watch,
  Smile,
  Frown,
  CheckCircle2,
  CheckSquare,
  Activity as StepsIcon,
  PlusCircle,
  Stethoscope,
  ChevronDown
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase";
import { firebaseService } from "../../services/firebaseService";

interface PersonalHealthAnalystProps {
  user: any;
  darkMode: boolean;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export default function PersonalHealthAnalyst({
  user,
  darkMode,
  showNotification
}: PersonalHealthAnalystProps) {
  // Navigation active tab index
  const [activeTab, setActiveTab] = useState<"dashboard" | "checkin" | "symptoms" | "vitals" | "assistant" | "sharing" | "monthly">("dashboard");
  const [drRequestSending, setDrRequestSending] = useState(false);
  const [drRequestSent, setDrRequestSent] = useState(false);

  // Clinic searching and selection states for doctor analysis requests
  const [clinics, setClinics] = useState<any[]>([]);
  const [clinicSearchQuery, setClinicSearchQuery] = useState("");
  const [selectedClinicForRequest, setSelectedClinicForRequest] = useState<any>(null);
  const [showClinicSearchModal, setShowClinicSearchModal] = useState(false);

  // Load clinics list on mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "clinic"),
          where("status", "==", "active")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClinics(data);
      } catch (err) {
        console.error("Error loading clinics:", err);
      }
    };
    fetchClinics();
  }, []);

  // Real-time Firestore state
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [medicineLogs, setMedicineLogs] = useState<any[]>([]);
  const [medicineReminders, setMedicineReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Smartwatch simulation state
  const [smartwatchConnected, setSmartwatchConnected] = useState<boolean>(() => {
    return localStorage.getItem(`carebridge_smartwatch_${user?.id}`) === "true";
  });
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    hr: 74,
    spo2: 99,
    calories: 340,
    steps: 8120
  });

  // Doctor sharing preference state
  const [shareLogsWithDoctor, setShareLogsWithDoctor] = useState<boolean>(() => {
    return localStorage.getItem(`carebridge_share_doctor_${user?.id}`) === "true";
  });
  const [doctorConsentSigned, setDoctorConsentSigned] = useState<boolean>(() => {
    return localStorage.getItem(`carebridge_doctor_consent_${user?.id}`) === "true";
  });

  // Check-In Form Fields
  const [wellbeing, setWellbeing] = useState<"Excellent" | "Good" | "Average" | "Poor">("Good");
  const [energy, setEnergy] = useState<"High" | "Medium" | "Low">("Medium");
  const [mood, setMood] = useState<"Happy" | "Neutral" | "Stressed" | "Sad">("Neutral");
  const [stress, setStress] = useState<"Low" | "Medium" | "High">("Low");
  const [sleepHours, setSleepHours] = useState<string>("7");
  const [sleepQuality, setSleepQuality] = useState<"Excellent" | "Good" | "Average" | "Poor">("Good");
  const [waterCups, setWaterCups] = useState<number>(4); // 1 cup = 250ml (1000ml default)
  const [activityLevel, setActivityLevel] = useState<"Low" | "Moderate" | "Active">("Moderate");
  const [stepsInput, setStepsInput] = useState<string>("6500");
  const [exerciseMin, setExerciseMin] = useState<string>("30");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Symptom Tracker Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState<string>("");
  const [symptomSeverity, setSymptomSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");
  const [symptomFrequency, setSymptomFrequency] = useState<"Occasional" | "Intermittent" | "Constant">("Occasional");
  const [symptomDuration, setSymptomDuration] = useState<string>("1");

  // AI Analyst state
  const [aiReport, setAiReport] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [supervisionAlerts, setSupervisionAlerts] = useState<string[]>([]);

  // Local state for chat integration with AI Health Coach
  const [coachQuery, setCoachQuery] = useState("");
  const [coachChatHistory, setCoachChatHistory] = useState<any[]>([]);
  const [coachChatLoading, setCoachChatLoading] = useState(false);

  // List of pre-defined common symptoms
  const COMMON_SYMPTOMS = [
    "Fever",
    "Headache",
    "Cough",
    "Cold",
    "Body Pain",
    "Fatigue",
    "Nausea",
    "Stomach Pain"
  ];

  // -------------------------------------------------------------
  // Load real-time Firestore database data streams
  // -------------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    // 1. Subscribe to patient daily health check-in/vitals logs
    const unsubHealth = firebaseService.subscribeToCollection(
      "health_logs",
      (data) => {
        const sortedData = [...data].sort((a: any, b: any) => {
          const dateA = a.date || "";
          const dateB = b.date || "";
          return dateB.localeCompare(dateA); // newest logs first
        });
        setHealthLogs(sortedData);
        setLoading(false);
      },
      [
        { field: "userId", operator: "==", value: user.id }
      ]
    );

    // 2. Subscribe to patient medicine configuration settings
    const unsubReminders = firebaseService.subscribeToCollection(
      "medicine_reminders",
      (data) => {
        setMedicineReminders(data);
      },
      [
        { field: "userId", operator: "==", value: user.id },
        { field: "status", operator: "==", value: "active" }
      ]
    );

    // 3. Subscribe to medicine logs history
    const unsubMeds = firebaseService.subscribeToCollection(
      "medicine_logs",
      (data) => {
        setMedicineLogs(data);
      },
      [
        { field: "userId", operator: "==", value: user.id }
      ]
    );

    return () => {
      unsubHealth();
      unsubReminders();
      unsubMeds();
    };
  }, [user?.id]);

  // Handle smartwatch simulation loops to keep telemetry metrics active and alive
  useEffect(() => {
    if (!smartwatchConnected) return;

    const interval = setInterval(() => {
      setSimulatedMetrics(prev => {
        const hrDelta = Math.random() > 0.5 ? 1 : -1;
        const newHr = Math.min(95, Math.max(58, prev.hr + hrDelta));
        const newSpo2 = Math.random() > 0.9 ? (Math.random() > 0.5 ? 99 : 98) : prev.spo2;
        return {
          ...prev,
          hr: newHr,
          spo2: newSpo2,
          calories: prev.calories + (Math.random() > 0.85 ? 1 : 0),
          steps: prev.steps + (Math.random() > 0.5 ? 2 : 0)
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [smartwatchConnected]);

  // -------------------------------------------------------------
  // INTELLIGENT HEALTH SCORE ENGINE
  // Syntax structures a durable clinical health score 0-100
  // -------------------------------------------------------------
  const processedMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysLog = healthLogs.find(l => l.date === todayStr);

    // 1. Sleep score analysis
    const currentSleep = todaysLog?.sleepHours ? parseFloat(todaysLog.sleepHours) : 7.0;
    let sleepScore = 80;
    if (currentSleep >= 7 && currentSleep <= 9) sleepScore = 100;
    else if (currentSleep >= 6 && currentSleep < 7) sleepScore = 85;
    else if (currentSleep >= 5 && currentSleep < 6) sleepScore = 65;
    else sleepScore = 45;

    // 2. Hydration Score Calculation (Goal = 2500 ml)
    const currentWater = todaysLog?.waterLogMl ? parseInt(todaysLog.waterLogMl, 10) : 0;
    const waterScore = Math.min(100, Math.round((currentWater / 2500) * 100));

    // 3. Activity Progression (Goal = 10k steps)
    const stepsCount = todaysLog?.steps ? parseInt(todaysLog.steps, 10) : (smartwatchConnected ? simulatedMetrics.steps : 5000);
    const activityScore = Math.min(100, Math.round((stepsCount / 10000) * 100));

    // 4. Medication Compliance Integration
    let adherenceScore = 100;
    const matchMeds = medicineLogs || [];
    if (matchMeds.length > 0) {
      const taken = matchMeds.filter(l => l.status === "taken").length;
      const missed = matchMeds.filter(l => l.status === "missed").length;
      const totalEvents = taken + missed;
      if (totalEvents > 0) {
        adherenceScore = Math.round((taken / totalEvents) * 100);
      }
    }

    // 5. Wellbeing ratings
    const currentWellbeing = todaysLog?.wellbeing || "Good";
    let checkInVal = 80;
    if (currentWellbeing === "Excellent") checkInVal = 100;
    else if (currentWellbeing === "Good") checkInVal = 85;
    else if (currentWellbeing === "Average") checkInVal = 65;
    else checkInVal = 40;

    const stressVal = todaysLog?.stress || "Low";
    let stressPenalty = 0;
    if (stressVal === "High") stressPenalty = 10;
    else if (stressVal === "Medium") stressPenalty = 4;

    const activeSymptoms = todaysLog?.symptoms || [];
    let symptomPenalty = 0;
    if (activeSymptoms.length > 0) {
      symptomPenalty = Math.min(20, activeSymptoms.length * 5);
    }

    // Consolidated weighted scoring:
    let calculatedScore = Math.round(
      (sleepScore * 0.20) +
      (waterScore * 0.15) +
      (activityScore * 0.20) +
      (adherenceScore * 0.25) +
      (checkInVal * 0.20) -
      stressPenalty -
      symptomPenalty
    );

    calculatedScore = Math.max(0, Math.min(100, calculatedScore));

    let healthCategory: "Excellent" | "Good" | "Fair" | "Needs Attention" = "Good";
    if (calculatedScore >= 90) healthCategory = "Excellent";
    else if (calculatedScore >= 75) healthCategory = "Good";
    else if (calculatedScore >= 60) healthCategory = "Fair";
    else healthCategory = "Needs Attention";

    return {
      score: calculatedScore,
      category: healthCategory,
      sleep: sleepScore,
      hydration: waterScore,
      activity: activityScore,
      adherence: adherenceScore,
      wellbeing: currentWellbeing,
      stress: stressVal,
      symptomsList: activeSymptoms,
      notes: todaysLog?.notes || "",
      waterVolume: currentWater,
      sleepHoursActual: currentSleep,
      stepsActual: stepsCount,
      exerciseActual: todaysLog?.exerciseDuration ? parseInt(todaysLog.exerciseDuration, 10) : 30
    };
  }, [healthLogs, medicineLogs, smartwatchConnected, simulatedMetrics]);

  // -------------------------------------------------------------
  // DAILY HEALTH CHECK-IN FORM SUBMISSION
  // -------------------------------------------------------------
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split("T")[0];
      const waterTotalMl = waterCups * 250;

      const symptomsPayload = selectedSymptoms.map(sym => ({
        name: sym,
        severity: symptomSeverity,
        frequency: symptomFrequency,
        durationDays: parseInt(symptomDuration, 10) || 1
      }));

      const payload: any = {
        userId: user.id,
        date: today,
        wellbeing,
        energy,
        mood,
        stress,
        sleepHours: parseFloat(sleepHours) || 7,
        sleepQuality,
        waterLogMl: waterTotalMl,
        activityLevel,
        steps: parseInt(stepsInput, 10) || 5000,
        exerciseDuration: parseInt(exerciseMin, 10) || 30,
        symptoms: symptomsPayload,
        notes: additionalNotes,
        smartwatchLinked: smartwatchConnected,
        createdAt: serverTimestamp()
      };

      if (smartwatchConnected) {
        payload.avgHeartRate = simulatedMetrics.hr;
        payload.spo2 = simulatedMetrics.spo2;
        payload.caloriesBurned = simulatedMetrics.calories;
      }

      const existingToday = healthLogs.find(l => l.date === today);
      if (existingToday) {
        await updateDoc(doc(db, "health_logs", existingToday.id), payload);
        showNotification("Daily health metrics and check-in updated successfully!", "success");
      } else {
        await addDoc(collection(db, "health_logs"), payload);
        showNotification("Daily health check-in logged successfully!", "success");
      }

      fetchAIAnalystReport(payload);
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save check-in parameters.", "error");
    }
  };

  // -------------------------------------------------------------
  // Add a Custom Symptom to list
  // -------------------------------------------------------------
  const handleAddSymptom = (s: string) => {
    if (!s.trim()) return;
    if (!selectedSymptoms.includes(s.trim())) {
      setSelectedSymptoms(prev => [...prev, s.trim()]);
    }
  };

  const handleRemoveSymptom = (sym: string) => {
    setSelectedSymptoms(prev => prev.filter(item => item !== sym));
  };

  // -------------------------------------------------------------
  // WATER INTAKE TRACKER: Add quick ML logs directly
  // -------------------------------------------------------------
  const addQuickWaterAmount = async (ml: number) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const existingToday = healthLogs.find(l => l.date === today);

      const targetMl = (existingToday?.waterLogMl ? parseInt(existingToday.waterLogMl, 10) : 0) + ml;
      const targetCups = Math.round(targetMl / 250);

      const payload = {
        userId: user.id,
        date: today,
        waterLogMl: targetMl,
        wellbeing: existingToday?.wellbeing || "Good",
        sleepHours: existingToday?.sleepHours || 7,
        steps: existingToday?.steps || 6000,
        createdAt: serverTimestamp()
      };

      if (existingToday) {
        await updateDoc(doc(db, "health_logs", existingToday.id), { waterLogMl: targetMl });
      } else {
        await addDoc(collection(db, "health_logs"), payload);
      }

      setWaterCups(targetCups);
      showNotification(`Added +${ml}ml of water tracker! Total today: ${targetMl}ml`, "success");
    } catch (e) {
      showNotification("Could not index water score", "error");
    }
  };

  // Smartwatch connectivity preference
  const toggleSmartwatchConnection = () => {
    const nextState = !smartwatchConnected;
    setSmartwatchConnected(nextState);
    localStorage.setItem(`carebridge_smartwatch_${user?.id}`, String(nextState));
    if (nextState) {
      setStepsInput("8120");
      showNotification("Connected to wearable smartwatch sensor metrics successfully!", "success");
    } else {
      showNotification("Wearable device sensor integration disabled.", "info");
    }
  };

  // Consent Doctor profile sharing Toggle
  const toggleDoctorSharing = () => {
    const next = !shareLogsWithDoctor;
    if (next && !doctorConsentSigned) {
      const consent = window.confirm(
        "By continuing, you authorize CareBridge Plus to forward digital health reports, weekly analysis diaries, sleep ratings, and symptom profiles to Dr. Amit Patil. Do you grant consent?"
      );
      if (!consent) return;
      setDoctorConsentSigned(true);
      localStorage.setItem(`carebridge_doctor_consent_${user?.id}`, "true");
    }
    setShareLogsWithDoctor(next);
    localStorage.setItem(`carebridge_share_doctor_${user?.id}`, String(next));
    showNotification(
      next
        ? "Consent saved! Analysis charts shared with Dr. Amit Patil's clinical console."
        : "Report sharing revoked. Data remains private to you.",
      next ? "success" : "info"
    );
  };

  // -------------------------------------------------------------
  // AI HEALTH ANALYST REPORT ENGINE WITH SUPERVISION ALERTS
  // -------------------------------------------------------------
  const fetchAIAnalystReport = async (overrideData?: any) => {
    setAiLoading(true);
    setAiReport("");
    setSupervisionAlerts([]);

    try {
      const activeData = overrideData || {
        wellbeing: processedMetrics.wellbeing,
        sleepHours: processedMetrics.sleepHoursActual,
        waterLogMl: processedMetrics.waterVolume,
        steps: processedMetrics.stepsActual,
        stress: processedMetrics.stress,
        symptoms: processedMetrics.symptomsList
      };

      const recentLogs = healthLogs.slice(0, 5);
      const historyStr = recentLogs.map(l => {
        const symsStr = l.symptoms ? l.symptoms.map((s: any) => `${s.name} (${s.severity})`).join(", ") : "None";
        return `Date: ${l.date}, Sleep: ${l.sleepHours}h, Water: ${l.waterLogMl}ml, Steps: ${l.steps}, Stress: ${l.stress || "Low"}, Mood: ${l.mood || "Neutral"}, Symptoms: ${symsStr}`;
      }).join("\n");

      const message = `Please act as the expert clinical AI advisor supervising patient health metrics.
      
      Patient Name/ID: ${user?.name || "Patient"}
      Current Aggregate Metrics:
      - Overall Health Score: ${processedMetrics.score}/100 [Category: ${processedMetrics.category}]
      - Today's Sleep: ${activeData.sleepHours} Hours
      - Today's Water: ${activeData.waterLogMl} ml (Target: 2500ml)
      - Today's Steps: ${activeData.steps} (Target: 10000 steps)
      - Medication Adherence: ${processedMetrics.adherence}%
      
      Log History of previous days:
      ${historyStr || "First day of logged parameters."}
      
      Directives:
      1. Provide easy-to-read educational overview insights. State noticeable trends (e.g. low sleep, falling steps, strong meds discipline).
      2. Construct 2 or 3 distinct system supervisor alerts or proactive alerts based on poor patterns (e.g. sleep <6h, recurring head discomfort, rising stress, low hydration scores). Use plain text sentences.
      3. CRITICAL: Strictly provide wellness and health guidance only. Do NOT make absolute medical diagnoses, prescribe specific pharmacological products, or alter official doctors dosages. Keep the advice supervisor-focused.
      
      Structure your response exactly in two JSON compartments separated by the word "---ALERTS_SPLIT---":
      
      [Formatted Insight paragraphs with bullet guidelines]
      ---ALERTS_SPLIT---
      [Alert Line 1]
      [Alert Line 2]`;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language: "English",
          patientContext: "The CareBridge plus health analytics team coordinates chronic care alerts, warning models, and vital analysis reports to empower patient wellness."
        })
      });

      const data = await response.json();
      if (data.text) {
        const parts = data.text.split("---ALERTS_SPLIT---");
        const insightPart = parts[0]?.trim() || "Analysis assembled successfully.";
        const alertsPart = parts[1]?.trim() || "";

        setAiReport(insightPart);
        if (alertsPart) {
          const splitLines = alertsPart.split("\n").map((l: string) => l.replace(/^[-*•\s\d.]+/g, "").trim()).filter(Boolean);
          setSupervisionAlerts(splitLines);
        } else {
          const fallbackAlerts = [];
          if (activeData.sleepHours < 6.5) fallbackAlerts.push("Sleep duration is below the standard 6.5 hour threshold.");
          if (activeData.waterLogMl < 1500) fallbackAlerts.push("Hydration levels are insufficient. Increase intake.");
          if (activeData.stress === "High") fallbackAlerts.push("Elevated stress levels registered. Take structured breathing steps.");
          setSupervisionAlerts(fallbackAlerts);
        }
      } else {
        setAiReport("Under heavier analytical load. Regular medical metrics apply: Maintain your step count and log sleep hours.");
      }
    } catch (err) {
      setAiReport("The AI Health Supervision layer is loaded. Continue referencing daily goals.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (healthLogs.length > 0 && !aiReport) {
      fetchAIAnalystReport();
    }
  }, [healthLogs.length]);

  // -------------------------------------------------------------
  // AI HEALTH COACH CLINICAL INTEGRATION CHAT
  // -------------------------------------------------------------
  const askCoachIntegration = async (customQuery?: string) => {
    const q = customQuery || coachQuery;
    if (!q.trim()) return;

    setCoachQuery("");
    setCoachChatLoading(true);

    const updatedHistory = [...coachChatHistory, { role: "user", text: q }];
    setCoachChatHistory(updatedHistory);

    try {
      const patientSummary = `Overall health rating: ${processedMetrics.score}/100 (${processedMetrics.category}). Average Sleep: ${processedMetrics.sleepHoursActual}h, Average Water: ${processedMetrics.waterVolume}ml, Medication Adherence: ${processedMetrics.adherence}%. Current Symptoms: ${processedMetrics.symptomsList.map((s: any) => s.name).join(", ") || "None"}.`;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          language: "English",
          patientContext: `You are integrating directly with the Patient's Supervised Health Analyst console. Here is the patient's clinical summary: ${patientSummary}. Be warm, encouraging, safety-focused, and educational. Do not diagnose or prescribe.`
        })
      });

      const data = await response.json();
      if (data.text) {
        setCoachChatHistory([...updatedHistory, { role: "model", text: data.text }]);
      } else {
        setCoachChatHistory([...updatedHistory, { role: "model", text: "I apologize, the AI Health Coach is having trouble reviewing your data chart. Please ensure your vitals are loaded." }]);
      }
    } catch (e) {
      setCoachChatHistory([...updatedHistory, { role: "model", text: "Connection offline. Continue maintaining regular schedule." }]);
    } finally {
      setCoachChatLoading(false);
    }
  };

  // Send Doctor Analysis Request
  const sendDrAnalysisRequest = async () => {
    if (!selectedClinicForRequest) {
      showNotification("Please select a clinic first.", "error");
      return;
    }
    if (drRequestSent || drRequestSending) return;
    setDrRequestSending(true);
    try {
      const last30Days = healthLogs.slice(0, 30);
      const medSummary = medicineReminders.map((r: any) => r.medicineName).join(", ") || "None";
      const requestPayload = {
        userId: user.id,
        patientName: user.name || "Patient",
        requestType: "monthly_analysis",
        summary: `Patient requests doctor analysis for last 30-day health record. Medicines: ${medSummary}. Health Score: ${processedMetrics.score}/100.`,
        healthLogsCount: last30Days.length,
        medicineReminders: medicineReminders.map((r: any) => ({
          id: r.id || "",
          medicineName: r.medicineName || "",
          dosage: r.dosage || "",
          repeatSchedule: r.repeatSchedule || "Daily",
          mealTime: r.mealTime || "after",
          status: r.status || "active",
          timings: Array.isArray(r.timings) ? r.timings : []
        })),
        requestedAt: serverTimestamp(),
        status: "pending",
        clinicId: selectedClinicForRequest.id,
        clinicName: selectedClinicForRequest.name || selectedClinicForRequest.doctor_name || "Partner Clinic"
      };
      await addDoc(collection(db, "doctor_analysis_requests"), requestPayload);
      setDrRequestSent(true);
      showNotification("Doctor analysis request sent successfully! The doctor will review your 30-day report.", "success");
      setShowClinicSearchModal(false);
    } catch (err) {
      showNotification("Failed to send request. Please try again.", "error");
    } finally {
      setDrRequestSending(false);
    }
  };

  const AI_COACH_PRESETS = [
    { label: "My health this week?", text: "How is my aggregate health score looking this week and what needs attention?" },
    { label: "Sleep patterns?", text: "Can you analyze my recent sleep hours and suggest routine guidelines?" },
    { label: "Hydration advice?", text: "Check my water log volume and suggest routine routines to improve hydration." },
    { label: "Medicine compliance?", text: "Evaluate my medicine adherence logs and point out safety improvements." }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SUB-MENU TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-[1.5rem] bg-slate-500/5 backdrop-blur-md border border-slate-500/10 max-w-max">
        {[
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "checkin", label: "Daily Check-In", icon: Plus },
          { id: "symptoms", label: "Symptom Log", icon: ShieldAlert },
          { id: "vitals", label: "Vitals & Trends", icon: TrendingUp },
          { id: "monthly", label: "Monthly Record", icon: Calendar },
          { id: "assistant", label: "AI Health Coach", icon: Brain },
          { id: "sharing", label: "Doctor Sharing", icon: Share2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-[1.1rem] font-bold text-xs uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-500/5"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------
          SUBTAB 1: HEALTH ANALYSIS DASHBOARD
          --------------------------------------------------------- */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-8 rounded-[2.5rem] border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="text-slate-500/10" strokeWidth="8" stroke="currentColor" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className={`${
                        processedMetrics.score >= 90 ? "text-emerald-500" : processedMetrics.score >= 75 ? "text-blue-500" : "text-rose-500"
                      } transition-all duration-1000`}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - processedMetrics.score / 100)}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xl font-black tracking-tight dark:text-white">{processedMetrics.score}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      processedMetrics.score >= 90 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : processedMetrics.score >= 75 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {processedMetrics.category} Health Continuity
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mt-2.5 dark:text-white">
                    Overall Wellness Index
                  </h3>
                  <p className="text-sm text-slate-400 font-semibold mt-1">
                    Based on medication, sleep habits, activity metrics, and current reports.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("checkin")}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Quick Daily Check-In
                </button>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-semibold px-1">
                  <span>Last check: Today</span>
                  <button
                    onClick={() => fetchAIAnalystReport()}
                    className="flex items-center gap-1 text-emerald-500 hover:underline cursor-pointer"
                  >
                    Recalculate <RefreshCw size={10} />
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Sleep Habits", val: `${processedMetrics.sleepHoursActual} hrs`, score: processedMetrics.sleep, color: "text-purple-500", bg: "bg-purple-500/10", tag: processedMetrics.sleepHoursActual >= 7 ? "Optimum" : "Short" },
                { label: "Hydration Vol", val: `${processedMetrics.waterVolume} ml`, score: processedMetrics.hydration, color: "text-blue-500", bg: "bg-blue-500/10", tag: processedMetrics.waterVolume >= 2000 ? "Hydrated" : "Low" },
                { label: "Steps Daily", val: `${processedMetrics.stepsActual.toLocaleString()}`, score: processedMetrics.activity, color: "text-amber-500", bg: "bg-amber-500/10", tag: processedMetrics.stepsActual >= 7000 ? "Active" : "Sedentary" },
                { label: "Medication", val: `${processedMetrics.adherence}%`, score: processedMetrics.adherence, color: "text-emerald-500", bg: "bg-emerald-500/10", tag: processedMetrics.adherence >= 90 ? "Excellent" : "Irregular" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-[2rem] border min-h-[140px] flex flex-col justify-between ${
                    darkMode ? "bg-slate-900/25 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">{item.label}</span>
                    <h4 className="text-xl font-black mt-1 dark:text-white leading-tight">{item.val}</h4>
                  </div>
                  <div>
                    <div className="w-full bg-slate-500/10 h-1.5 rounded-full overflow-hidden mt-3 mb-1">
                      <div style={{ width: `${item.score}%` }} className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-450`} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>Score: {item.score}%</span>
                      <span className={item.score >= 80 ? "text-emerald-500" : "text-amber-500"}>{item.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-[2.5rem] border space-y-4 ${
              darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-500/15">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Weekly Health score trends</h4>
                  <span className="text-[10px] font-mono text-slate-500">Historical Patient Diagnostics Dashboard</span>
                </div>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Score</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Goal</span>
                </div>
              </div>

              <div className="h-44 w-full flex items-end justify-between pt-6 px-4">
                {[
                  { day: "Mon", score: 72 },
                  { day: "Tue", score: 78 },
                  { day: "Wed", score: 85 },
                  { day: "Thu", score: 68 },
                  { day: "Fri", score: 80 },
                  { day: "Sat", score: 92 },
                  { day: "Sun", score: processedMetrics.score }
                ].map((pt, i) => {
                  const barHeightPercent = Math.max(10, pt.score);
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                      <div className="relative w-full flex justify-center items-end h-28">
                        <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-all text-[9.5px] bg-slate-800 text-white font-black px-1.5 py-0.5 rounded-md pointer-events-none">
                          {pt.score}%
                        </span>
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-4 sm:w-6 rounded-t-lg transition-all duration-500 relative cursor-pointer ${
                            pt.score >= 90 ? "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500" : pt.score >= 75 ? "bg-gradient-to-t from-blue-600 to-indigo-400 group-hover:from-blue-500" : "bg-gradient-to-t from-rose-600 to-rose-450 group-hover:from-rose-500"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{pt.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-[2.5rem] border relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
              
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-rose-500 animate-pulse" size={20} />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 font-sans">Live AI Supervision Layer</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Anomalies & clinical warnings</p>

                <div className="mt-4 space-y-3">
                  {supervisionAlerts.length === 0 ? (
                    <div className="flex gap-2 items-start p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 text-xs font-semibold text-slate-400">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>No critical physiological anomalies detected today. Keep tracking parameters.</span>
                    </div>
                  ) : (
                    supervisionAlerts.map((alert, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-3 bg-rose-500/5 rounded-xl border border-rose-500/15 text-xs text-rose-500 font-semibold leading-relaxed">
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                        <span>{alert}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[9px] text-slate-500 mt-4 bg-slate-500/5 p-2 rounded-lg border border-slate-500/10">
                AI continuously monitors logs to flag high stress, bad sleep loops, or low hydration levels.
              </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border shadow-sm ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Watch className="text-blue-500 animate-pulse" size={18} />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Wearable Devices</h4>
                </div>
                <button
                  type="button"
                  onClick={toggleSmartwatchConnection}
                  className={`p-1 px-3.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                    smartwatchConnected ? "bg-emerald-600 text-white" : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {smartwatchConnected ? "Connected" : "Connect Device"}
                </button>
              </div>

              {smartwatchConnected ? (
                <div className="mt-4 space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="text-rose-500 animate-pulse" size={16} />
                      <span className="text-xs font-bold">Simulated Pulse</span>
                    </div>
                    <span className="text-sm font-black font-mono">{simulatedMetrics.hr} bpm</span>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="text-blue-450 animate-pulse" size={16} />
                      <span className="text-xs font-bold">SpO2 Percentage</span>
                    </div>
                    <span className="text-sm font-black font-mono">{simulatedMetrics.spo2}%</span>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="text-amber-550 mr-1" size={16} />
                      <span className="text-xs font-bold">Active Calories</span>
                    </div>
                    <span className="text-sm font-black font-mono">{simulatedMetrics.calories} kcal</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                  Enable integration to automatically sync live heart rate, SpO2, and active steps calories.
                </p>
              )}
            </div>

            <div className={`p-6 rounded-[2.5rem] border ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between border-b border-slate-500/15 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-emerald-500" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Live AI Health Analyst</h4>
                </div>
                {aiLoading && <RefreshCw size={12} className="animate-spin text-blue-500" />}
              </div>

              {aiLoading ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center animate-pulse">Running health metrics parser...</p>
              ) : aiReport ? (
                <div className="text-xs text-slate-350 leading-relaxed font-semibold">
                  <p className="whitespace-pre-line bg-slate-500/5 p-3 rounded-xl border border-slate-500/10 text-[11px] leading-relaxed italic">
                    "{aiReport.split("\n\n")[0] || aiReport}"
                  </p>
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className="mt-3.5 text-[10px] font-black text-emerald-500 tracking-wider uppercase flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Discuss Insights with Coach <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold text-center py-4">
                  Log your parameters and run analysis reviews.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          SUBTAB 2: DAILY HEALTH CHECK-IN FORM
          --------------------------------------------------------- */}
      {activeTab === "checkin" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-[2.5rem] border max-w-3xl mx-auto shadow-lg ${
            darkMode ? "bg-slate-900/10 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="pb-4 border-b border-slate-500/10 mb-6">
            <h3 className="text-xl font-black">Daily Healthcare Diagnostics Check-In</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold">
              Check in takes seconds. Synchronizes with medical records.
            </p>
          </div>

          <form onSubmit={handleCheckInSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">General Wellbeing</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Excellent", "Good", "Average", "Poor"].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setWellbeing(item as any)}
                      className={`px-4 py-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        wellbeing === item
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 font-black"
                          : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Energy Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["High", "Medium", "Low"].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setEnergy(item as any)}
                      className={`px-3 py-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        energy === item
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 font-black"
                          : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Current Mood</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Happy", "Neutral", "Stressed", "Sad"].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMood(item as any)}
                      className={`px-2 py-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        mood === item
                          ? "bg-purple-600/20 border-purple-500 text-purple-400"
                          : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Stress index</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStress(item as any)}
                      className={`px-3 py-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        stress === item
                          ? "bg-rose-600/20 border-rose-500 text-rose-400 font-black"
                          : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  placeholder="e.g. 7.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Sleep Quality</label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Excellent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Excellent</option>
                  <option value="Good" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Good</option>
                  <option value="Average" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Average</option>
                  <option value="Poor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Water Consumption today</label>
                <div className="flex items-center gap-3 bg-slate-500/5 border border-slate-500/10 rounded-xl p-1.5 px-3">
                  <span className="text-slate-400 text-xs font-bold mr-2">{waterCups * 250} ml ({waterCups} Cups)</span>
                  <button
                    type="button"
                    onClick={() => setWaterCups(prev => Math.max(0, prev - 1))}
                    className="p-1 px-3 bg-slate-500/10 hover:bg-slate-500/20 rounded font-black text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterCups(prev => prev + 1)}
                    className="p-1 px-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded font-black text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Physical Activity Category</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low (Sedentary)</option>
                  <option value="Moderate" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Moderate (Average active)</option>
                  <option value="Active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Active (Intense workout)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Steps Walked count</label>
                <input
                  type="number"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  placeholder="e.g. 8000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Active Minutes</label>
                <input
                  type="number"
                  value={exerciseMin}
                  onChange={(e) => setExerciseMin(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  placeholder="e.g. 30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Wellness & Symptoms Notes</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-2xl p-4 text-xs h-20 focus:outline-none focus:border-emerald-500 resize-none font-semibold"
                placeholder="Log any noticeable fatigue, headaches, specific medicine interactions or notes..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className="px-5 py-3 bg-slate-500/15 rounded-xl text-xs font-bold uppercase transition hover:bg-slate-500/25"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Update Diagnostics Chart
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          SUBTAB 3: SYMPTOM TRACKER
          --------------------------------------------------------- */}
      {activeTab === "symptoms" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-2 space-y-6">
            <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
              darkMode ? "bg-slate-900/10 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="pb-3 border-b border-slate-500/10 mb-6">
                <h3 className="text-xl font-black">Register Current Symptoms</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quickly check clinical conditions or add unique custom records.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Select Symptoms</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COMMON_SYMPTOMS.map((sym) => {
                    const active = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (active) handleRemoveSymptom(sym);
                          else handleAddSymptom(sym);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                          active
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-450 font-extrabold"
                            : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5 hover:border-slate-400/30"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Custom Symptom entry</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                    placeholder="Describe custom symptom (e.g. skin rash)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSymptom(customSymptom);
                      setCustomSymptom("");
                    }}
                    className="px-4 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/35 border border-emerald-500/15 rounded-xl font-black text-xs uppercase cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="mt-6 border-t border-slate-500/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Severity Rating</label>
                    <div className="flex gap-1">
                      {["Mild", "Moderate", "Severe"].map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSymptomSeverity(item as any)}
                          className={`flex-1 p-2 rounded-lg border text-[10px] font-black uppercase text-center transition cursor-pointer ${
                            symptomSeverity === item
                              ? "bg-rose-600/20 border-rose-500 text-rose-500"
                              : "border-slate-500/10 text-slate-400 hover:bg-slate-500/5"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Frequency profile</label>
                    <select
                      value={symptomFrequency}
                      onChange={(e) => setSymptomFrequency(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none font-semibold"
                    >
                      <option value="Occasional" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Occasional / Rare</option>
                      <option value="Intermittent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Intermittent</option>
                      <option value="Constant" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Constant / Persistent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={symptomDuration}
                      onChange={(e) => setSymptomDuration(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-500/15 flex justify-end">
                <button
                  type="button"
                  onClick={handleCheckInSubmit}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Save Symptom Record
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-[2.5rem] border ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <h4 className="font-extrabold text-sm uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-100">Symptom History Logs</h4>

              <div className="space-y-4">
                {healthLogs.filter(l => l.symptoms && l.symptoms.length > 0).length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-6 text-center">No reported symptoms on record. You are feeling fully fit!</p>
                ) : (
                  healthLogs
                    .filter(l => l.symptoms && l.symptoms.length > 0)
                    .slice(0, 10)
                    .map((log, idx) => (
                      <div key={idx} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-2">
                          <span>{log.date}</span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-black uppercase">Fired alert</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {log.symptoms.map((s: any, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-500/10 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 font-semibold border border-slate-500/15 dark:border-white/5">
                              {s.name} • {s.severity} ({s.frequency})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          SUBTAB 4: VITALS & TREND SECTIONS
          --------------------------------------------------------- */}
      {activeTab === "vitals" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-sm ${
              darkMode ? "bg-slate-900/15 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

              <div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-500/10">
                  <div className="flex items-center gap-2">
                    <Droplet className="text-blue-500 shrink-0" size={18} />
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Daily Water Tracker</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">Goal: 2500 ml</span>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex flex-col items-center justify-center font-mono text-xs border border-blue-500/20">
                    <span className="text-sm font-black text-blue-550 dark:text-blue-400">{processedMetrics.hydration}%</span>
                    <span className="text-[9px] uppercase font-black mt-0.5 text-slate-500 dark:text-slate-400">Hydrated</span>
                  </div>

                  <div>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{processedMetrics.waterVolume} ml</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Logged today. Goal completion progress.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 pt-3">
                {[
                  { label: "+250 ml", val: 250 },
                  { label: "+500 ml", val: 500 },
                  { label: "+750 ml", val: 750 },
                  { label: "+1 L", val: 1000 }
                ].map((act) => (
                  <button
                    key={act.val}
                    type="button"
                    onClick={() => addQuickWaterAmount(act.val)}
                    className="flex-1 p-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-350 hover:text-white rounded-lg font-black text-[10px] transition uppercase cursor-pointer"
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between min-h-[220px] shadow-sm ${
              darkMode ? "bg-slate-900/15 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-500/10">
                  <div className="flex items-center gap-2">
                    <Moon className="text-purple-400 shrink-0" size={18} />
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Sleep Score & Hours</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">Optimum: 7.5 hr</span>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="h-16 w-16 bg-purple-500/10 rounded-2xl flex flex-col items-center justify-center font-mono text-xs border border-purple-500/20">
                    <span className="text-sm font-black text-purple-600 dark:text-purple-400">{processedMetrics.sleep}%</span>
                    <span className="text-[9px] uppercase font-black mt-0.5 text-slate-550 dark:text-slate-400">Rating</span>
                  </div>

                  <div>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{processedMetrics.sleepHoursActual} Hours</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Quality category is healthy and consistent.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-slate-500/5 p-2 rounded-xl text-slate-400 border border-white/5 leading-relaxed">
                Aim for 7-8 hours average. Sleeping less than 6.5 hours can raise metabolic parameters significantly.
              </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between min-h-[220px] shadow-sm ${
              darkMode ? "bg-slate-900/15 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div>
                <div className="flex justify-between items-start pb-2 border-b border-slate-500/10">
                  <div className="flex items-center gap-2">
                    <Activity className="text-amber-500 shrink-0" size={18} />
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Steps & Active index</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">Goal: 10,000</span>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex flex-col items-center justify-center font-mono text-xs border border-amber-500/20">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-500">{processedMetrics.activity}%</span>
                    <span className="text-[9px] uppercase font-black mt-0.5 text-slate-500 dark:text-slate-400">Steps</span>
                  </div>

                  <div>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{processedMetrics.stepsActual.toLocaleString()} Steps</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Exercise duration: {processedMetrics.exerciseActual} mins.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-slate-500/5 p-2 rounded-xl text-slate-400 border border-white/5">
                Active steps help maintain heart rate and support positive metabolic outcomes.
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${
            darkMode ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200"
          }`}>
            <h3 className="font-extrabold text-base mb-6">Historical Vitals & Wellness Logs</h3>

            {healthLogs.length === 0 ? (
              <p className="text-slate-450 italic text-center py-8">No daily check-ins recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-500/10 text-[10px] uppercase font-black text-slate-400 font-mono">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Wellbeing</th>
                      <th className="py-2.5">Energy</th>
                      <th className="py-2.5 font-mono">Sleep Hours</th>
                      <th className="py-2.5">Water Volume</th>
                      <th className="py-2.5">Steps Count</th>
                      <th className="py-2.5">Stress Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthLogs.slice(0, 10).map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-500/10 dark:border-white/5 hover:bg-slate-500/5 text-slate-800 dark:text-slate-200 font-semibold">
                        <td className="py-3.5 font-mono">{log.date}</td>
                        <td className="py-3.5 capitalize">{log.wellbeing || "Good"}</td>
                        <td className="py-3.5 capitalize">{log.energy || "Medium"}</td>
                        <td className="py-3.5 font-mono">{log.sleepHours || "N/A"}h</td>
                        <td className="py-3.5">{log.waterLogMl ? `${log.waterLogMl} ml` : "N/A"}</td>
                        <td className="py-3.5 font-mono">{log.steps ? parseInt(log.steps, 10).toLocaleString() : "N/A"}</td>
                        <td className="py-3.5 capitalize">{log.stress || "Low"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          SUBTAB 5: AI HEALTH COACH CHAT INTEGRATION
          --------------------------------------------------------- */}
      {activeTab === "assistant" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-[2.5rem] border ${
            darkMode ? "bg-slate-900/10 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="pb-4 border-b border-slate-500/10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black">AI Health Analyst Supervisor</h3>
              <p className="text-xs text-slate-400 mt-0.5">Discuss sleep logs, symptoms indicators, water intake, and trends.</p>
            </div>
            <div className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-black uppercase">
              Database Sync Active
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2.5">Tap quick questions for your logs</p>
            <div className="flex flex-wrap gap-2">
              {AI_COACH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => askCoachIntegration(preset.text)}
                  disabled={coachChatLoading}
                  className="px-3.5 py-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/15 dark:border-white/5 text-[11px] font-black uppercase transition text-slate-700 dark:text-slate-300 disabled:opacity-50 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-500/5 rounded-3xl border border-slate-500/10 p-6 h-80 overflow-y-auto mb-6 space-y-4 font-sans">
            {coachChatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-3">
                <Brain size={44} className="text-emerald-500/45 animate-pulse" />
                <p className="text-xs font-bold font-mono">Ask standard prompts above to run analysis diagnostics.</p>
              </div>
            ) : (
              coachChatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed font-semibold font-sans ${
                    item.role === 'user'
                      ? "bg-emerald-600 text-white rounded-br-none font-bold"
                      : "bg-slate-500/15 border border-slate-500/15 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none leading-relaxed"
                  }`}>
                    {item.role === "model" ? (
                      <p className="whitespace-pre-line leading-relaxed">{item.text}</p>
                    ) : (
                      <p>{item.text}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {coachChatLoading && (
              <div className="flex gap-2.5 items-center bg-slate-500/10 p-3 rounded-lg max-w-max text-[11px] font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-75" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-150" />
                <span>Coach is analyzing metrics...</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={coachQuery}
              onChange={(e) => setCoachQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askCoachIntegration()}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-500/15 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              placeholder="Ask anything about your health trends, sleep profiles, water logs, or medicine compliance..."
            />
            <button
              type="button"
              onClick={() => askCoachIntegration()}
              disabled={coachChatLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase cursor-pointer transition disabled:opacity-50"
            >
              Analyze
            </button>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          SUBTAB 6: DOCTOR REPORT SHARING
          --------------------------------------------------------- */}
      {activeTab === "sharing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-[2.5rem] border max-w-2xl mx-auto space-y-6 ${
            darkMode ? "bg-slate-900/10 border-white/5" : "bg-white border-slate-200"
          }`}
        >
          <div className="pb-3 border-b border-slate-500/15">
            <h3 className="text-xl font-black">Digital Doctor Report Sharing</h3>
            <p className="text-xs text-slate-400 mt-1">Conforms to Ayushman Bharat Digital Mission data guidelines.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-500/5 border border-slate-500/15 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-start">
              <User className="text-emerald-500 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Primary Care Physician</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dr. Amit Patil, MBBS (MD Cardiology)</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black text-emerald-400">Direct referral link active</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-500/15 dark:border-white/5 bg-slate-500/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Allow Doctor Console Sync</h5>
                <button
                  type="button"
                  onClick={toggleDoctorSharing}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    shareLogsWithDoctor ? "bg-emerald-600" : "bg-slate-700"
                  }`}
                  role="switch"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      shareLogsWithDoctor ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Activating this toggle instantly pushes weekly check-in graphs, daily sleep duration reports, water levels log history, and live AI diagnostics logs straight to Dr. Patil's referral panel dashboard, supporting remote active monitoring.
              </p>

              {shareLogsWithDoctor && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 font-bold leading-relaxed space-y-2">
                  <p>✓ Ayushman Bharat Consent ID validated: ABDM-CB-CON-491295</p>
                  <p>✓ All data logs shared are encrypted dynamically over secure TLS layers.</p>
                </div>
              )}
            </div>

            <div className="text-[10px] bg-slate-500/5 p-3 rounded-xl text-slate-450 border border-slate-500/10 italic leading-relaxed">
              CareBridge Plus fully safeguards private indicators. Your diagnostic timeline is only shared with medical providers upon explicit authorization toggled above. You can revoke consents at any time.
            </div>
          </div>
        </motion.div>
      )}
      {/* ---------------------------------------------------------
          SUBTAB: MONTHLY RECORD TABLE
          --------------------------------------------------------- */}
      {activeTab === "monthly" && (() => {
        // Build last 30 calendar days
        const today = new Date();
        const days: string[] = [];
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          days.push(d.toISOString().split("T")[0]);
        }

        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={18} className="text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Last 30 Days</span>
                </div>
                <h3 className="text-2xl font-black dark:text-white">Monthly Patient Health Record</h3>
                <p className="text-sm text-slate-400 font-semibold mt-1">Day-wise vitals, medicine compliance & health conditions.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedClinicForRequest(null);
                  setClinicSearchQuery("");
                  setShowClinicSearchModal(true);
                }}
                disabled={drRequestSent || drRequestSending}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                  drRequestSent
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                    : drRequestSending
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 animate-pulse cursor-wait"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-50 hover:to-blue-500 shadow-indigo-500/30"
                }`}
              >
                <Stethoscope size={14} />
                {drRequestSent ? "✓ Request Sent to Doctor" : drRequestSending ? "Sending..." : "Request Doctor Analysis"}
              </button>
            </div>

            {/* Table */}
            <div className={`rounded-[2rem] border overflow-hidden ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-xs">
                  <thead>
                    <tr className={`${darkMode ? "bg-slate-800/60" : "bg-slate-50"}`}>
                      <th className="text-left px-5 py-4 font-black uppercase tracking-widest text-slate-400 w-28 border-b border-slate-500/10">Date</th>
                      <th className="text-left px-4 py-4 font-black uppercase tracking-widest text-purple-400 border-b border-slate-500/10">
                        <div className="flex items-center gap-1.5"><Heart size={11} /> Vitals</div>
                      </th>
                      <th className="text-left px-4 py-4 font-black uppercase tracking-widest text-emerald-400 border-b border-slate-500/10">
                        <div className="flex items-center gap-1.5"><CheckSquare size={11} /> Medicine</div>
                      </th>
                      <th className="text-left px-4 py-4 font-black uppercase tracking-widest text-rose-400 border-b border-slate-500/10">
                        <div className="flex items-center gap-1.5"><ShieldAlert size={11} /> Health Condition</div>
                      </th>
                      <th className="text-left px-4 py-4 font-black uppercase tracking-widest text-amber-400 border-b border-slate-500/10">
                        <div className="flex items-center gap-1.5"><Activity size={11} /> Score</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((dateStr, idx) => {
                      const log = healthLogs.find((l: any) => l.date === dateStr);
                      const medsForDay = medicineLogs.filter((l: any) => l.date === dateStr);
                      const takenMeds = medsForDay.filter((l: any) => l.status === "taken");
                      const missedMeds = medsForDay.filter((l: any) => l.status === "missed");
                      const symptoms = log?.symptoms || [];
                      const isToday = idx === 0;
                      const hasLog = !!log;

                      // Score for this day
                      let dayScore = 0;
                      if (hasLog) {
                        const sl = log.sleepHours ? (log.sleepHours >= 7 ? 100 : log.sleepHours >= 6 ? 80 : 55) : 0;
                        const wl = log.waterLogMl ? Math.min(100, Math.round((log.waterLogMl / 2500) * 100)) : 0;
                        const al = log.steps ? Math.min(100, Math.round((log.steps / 10000) * 100)) : 0;
                        const ml = medsForDay.length > 0 ? Math.round((takenMeds.length / medsForDay.length) * 100) : 100;
                        dayScore = Math.round((sl * 0.25) + (wl * 0.20) + (al * 0.25) + (ml * 0.30));
                      }

                      const formattedDate = new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" });

                      return (
                        <tr
                          key={dateStr}
                          className={`border-b border-slate-500/10 transition-colors ${
                            isToday
                              ? (darkMode ? "bg-emerald-900/20" : "bg-emerald-50")
                              : idx % 2 === 0
                              ? (darkMode ? "bg-slate-900/10" : "bg-white")
                              : (darkMode ? "bg-slate-800/10" : "bg-slate-50/50")
                          } hover:bg-blue-500/5`}
                        >
                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="font-black text-[11px] dark:text-white text-slate-700">{formattedDate}</div>
                            {isToday && <span className="text-[9px] font-black text-emerald-500 uppercase">Today</span>}
                          </td>

                          {/* Vitals */}
                          <td className="px-4 py-4">
                            {hasLog ? (
                              <div className="space-y-1">
                                {log.sleepHours && <div className="flex items-center gap-1 text-purple-400"><Moon size={9} /> <span className="text-slate-500 dark:text-slate-300">{log.sleepHours}h sleep</span></div>}
                                {log.waterLogMl && <div className="flex items-center gap-1 text-blue-400"><Droplet size={9} /> <span className="text-slate-500 dark:text-slate-300">{log.waterLogMl}ml water</span></div>}
                                {log.steps && <div className="flex items-center gap-1 text-amber-400"><Activity size={9} /> <span className="text-slate-500 dark:text-slate-300">{Number(log.steps).toLocaleString()} steps</span></div>}
                                {log.bp && <div className="flex items-center gap-1 text-rose-400"><Heart size={9} /> <span className="text-slate-500 dark:text-slate-300">BP: {log.bp}</span></div>}
                                {log.avgHeartRate && <div className="flex items-center gap-1 text-rose-400"><Heart size={9} /> <span className="text-slate-500 dark:text-slate-300">{log.avgHeartRate} bpm</span></div>}
                                {!log.sleepHours && !log.waterLogMl && !log.steps && <span className="text-slate-400 italic">Partial data</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400/50 italic">—</span>
                            )}
                          </td>

                          {/* Medicine */}
                          <td className="px-4 py-4">
                            {medsForDay.length > 0 ? (
                              <div className="space-y-1">
                                {takenMeds.slice(0, 3).map((m: any, i: number) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <Check size={9} className="text-emerald-500 shrink-0" />
                                    <span className="text-slate-500 dark:text-slate-300 truncate max-w-[120px]">{m.medicineName}</span>
                                  </div>
                                ))}
                                {missedMeds.slice(0, 2).map((m: any, i: number) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <X size={9} className="text-rose-500 shrink-0" />
                                    <span className="text-rose-400 truncate max-w-[120px]">{m.medicineName}</span>
                                  </div>
                                ))}
                                {(takenMeds.length > 3 || missedMeds.length > 2) && (
                                  <span className="text-slate-400/70 text-[9px]">+more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400/50 italic">—</span>
                            )}
                          </td>

                          {/* Health Condition / Symptoms */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {hasLog && log.wellbeing && (
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  log.wellbeing === "Excellent" ? "bg-emerald-500/15 text-emerald-400" :
                                  log.wellbeing === "Good" ? "bg-blue-500/15 text-blue-400" :
                                  log.wellbeing === "Average" ? "bg-amber-500/15 text-amber-400" :
                                  "bg-rose-500/15 text-rose-400"
                                }`}>{log.wellbeing}</div>
                              )}
                              {symptoms.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {symptoms.slice(0, 2).map((sym: any, i: number) => (
                                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-full font-bold">
                                      {typeof sym === "string" ? sym : sym.name}
                                    </span>
                                  ))}
                                  {symptoms.length > 2 && <span className="text-[9px] text-slate-400">+{symptoms.length - 2}</span>}
                                </div>
                              ) : hasLog ? (
                                <span className="text-emerald-500/70 text-[9px] font-bold">No symptoms</span>
                              ) : (
                                <span className="text-slate-400/50 italic">—</span>
                              )}
                            </div>
                          </td>

                          {/* Daily Score */}
                          <td className="px-4 py-4">
                            {hasLog ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                                  dayScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                  dayScore >= 60 ? "bg-blue-500/20 text-blue-400" :
                                  dayScore >= 40 ? "bg-amber-500/20 text-amber-400" :
                                  "bg-rose-500/20 text-rose-400"
                                }`}>{dayScore}</div>
                                <div className="w-12 h-1.5 rounded-full bg-slate-500/20 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      dayScore >= 80 ? "bg-emerald-500" : dayScore >= 60 ? "bg-blue-500" : dayScore >= 40 ? "bg-amber-500" : "bg-rose-500"
                                    }`}
                                    style={{ width: `${dayScore}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400/50 italic">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className={`px-6 py-4 border-t border-slate-500/10 flex flex-wrap items-center gap-4 text-[10px] font-bold ${
                darkMode ? "bg-slate-800/30" : "bg-slate-50"
              }`}>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Score ≥ 80: Excellent</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Score 60–79: Good</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Score 40–59: Fair</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Score &lt; 40: Needs Attention</div>
                <div className="ml-auto text-slate-400">Showing last 30 days • {healthLogs.filter((l: any) => days.includes(l.date)).length} days with records</div>
              </div>
            </div>

            {/* Clinic Search Modal */}
            <AnimatePresence>
              {showClinicSearchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`w-full max-w-lg rounded-[2rem] border p-6 overflow-hidden shadow-2xl relative ${
                      darkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-500/10">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="text-emerald-500" size={20} />
                        <h4 className="text-base font-black tracking-tight uppercase">Select Clinic for Supervision</h4>
                      </div>
                      <button
                        onClick={() => {
                          setShowClinicSearchModal(false);
                          setSelectedClinicForRequest(null);
                        }}
                        className="p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="mt-4 relative">
                      <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search clinic name or location..."
                        value={clinicSearchQuery}
                        onChange={(e) => setClinicSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-bold outline-hidden transition-all ${
                          darkMode
                            ? "bg-white/5 border-white/10 text-white focus:border-emerald-500"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500"
                        }`}
                      />
                    </div>

                    {/* Clinics List */}
                    <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {clinics.filter(c => {
                        const name = (c.name || c.doctor_name || "").toLowerCase();
                        const address = (c.address || "").toLowerCase();
                        const query = clinicSearchQuery.toLowerCase();
                        return name.includes(query) || address.includes(query);
                      }).length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-bold italic">
                          No active partner clinics found matching query.
                        </div>
                      ) : (
                        clinics.filter(c => {
                          const name = (c.name || c.doctor_name || "").toLowerCase();
                          const address = (c.address || "").toLowerCase();
                          const query = clinicSearchQuery.toLowerCase();
                          return name.includes(query) || address.includes(query);
                        }).map((clinic) => {
                          const isSelected = selectedClinicForRequest?.id === clinic.id;
                          return (
                            <button
                              key={clinic.id}
                              onClick={() => setSelectedClinicForRequest(clinic)}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500/15 border-emerald-500/40"
                                  : darkMode
                                  ? "bg-white/5 border-white/5 hover:bg-white/10"
                                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="font-black text-xs truncate dark:text-white text-slate-800">
                                  {clinic.name || clinic.doctor_name || "Partner Clinic"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                                  📍 {clinic.address || "Location on file"}
                                </p>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-white font-black" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-500/10 flex gap-3">
                      <button
                        onClick={() => {
                          setShowClinicSearchModal(false);
                          setSelectedClinicForRequest(null);
                        }}
                        className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                          darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={sendDrAnalysisRequest}
                        disabled={!selectedClinicForRequest || drRequestSending}
                        className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-white shadow-lg cursor-pointer ${
                          !selectedClinicForRequest
                            ? "bg-slate-550 opacity-45 cursor-not-allowed shadow-none"
                            : drRequestSending
                            ? "bg-blue-600 animate-pulse cursor-wait"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
                        }`}
                      >
                        {drRequestSending ? "Sending..." : "Send Request"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })()}
    </div>
  );
}
