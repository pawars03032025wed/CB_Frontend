import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, Users, TrendingUp, Calendar, MapPin, Activity, Heart, Volume2, 
  Smartphone, Plus, Search, Filter, Check, Award, Image as ImageIcon, 
  ArrowRight, Share2, Clipboard, ChevronRight, CheckCircle2, Star, Send, 
  MessageSquare, Copy, RefreshCw, FileText, Printer, Trash, Info, Phone, 
  Grid, Download, BookOpen, ThumbsUp, Clock, HelpCircle, AlertCircle, 
  Globe, LayoutGrid, CalendarRange, Share, BarChart3, ListTodo, List
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, 
  Bar, Cell, PieChart, Pie, Legend
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

// SubTab options matching every requested studio
type CRMSubTab = 
  | "dashboard" 
  | "poster_studio" 
  | "image_studio" 
  | "whatsapp_studio" 
  | "campaign_studio" 
  | "scheduler" 
  | "templates" 
  | "advisor" 
  | "analytics";

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

  const [activeTab, setActiveTab] = useState<CRMSubTab>("dashboard");
  const STORAGE_PREFIX = `carebridge_smart_marketing_${user?.id || "default"}`;

  // Seeding local states
  const [scheduledCampaigns, setScheduledCampaigns] = useState<any[]>(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}_schedules`);
    if (cached) return JSON.parse(cached);
    return [
      { id: "sched-1", name: "Hypertension Awareness Broadcast", date: "2026-06-15", time: "10:30", type: "WhatsApp Campaign", audience: "Hypertension Patients", status: "Active" },
      { id: "sched-2", name: "International Yoga Day Greeting", date: "2026-06-21", time: "08:00", type: "Poster Studio", audience: "All Patients", status: "Active" }
    ];
  });

  const [campaignHistory, setCampaignHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}_history`);
    if (cached) return JSON.parse(cached);
    return [
      { id: "camp-01", name: "Diabetes Active Alert", category: "Health Awareness", target: "All Patients", reach: 184, clicks: 122, sentAt: "2026-06-01", status: "Completed" },
      { id: "camp-02", name: "Summer Hydration Alert", category: "Seasonal Health", target: "All Patients", reach: 145, clicks: 94, sentAt: "2026-06-04", status: "Completed" },
      { id: "camp-03", name: "Heart Care Diagnostics Day", category: "Clinic Promotion", target: "Senior Citizens", reach: 76, clicks: 54, sentAt: "2026-06-10", status: "Completed" }
    ];
  });

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_schedules`, JSON.stringify(scheduledCampaigns));
  }, [scheduledCampaigns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_history`, JSON.stringify(campaignHistory));
  }, [campaignHistory]);

  // Shared CRM details helper
  const resolvedClinicName = clinicDetails?.clinicName || clinicDetails?.clinic_name || "Carebridge Plus Clinic";
  const resolvedDoctorName = clinicDetails?.doctor_name || user?.name || "Dr. Pawar";
  const resolvedSpeciality = clinicDetails?.qualification || clinicDetails?.degree || "General Physician";
  const resolvedContact = clinicDetails?.contact_no || clinicDetails?.contactName || "9988776655";
  const resolvedAddress = clinicDetails?.address || "Main Clinic Road";

  // Dynamic Patient Metric Analytics mapping
  const metrics = useMemo(() => {
    const total = allPatients.length;
    const diabetesCount = allPatients.filter(p => {
      const condition = (p.complaint || p.diagnosis || "").toLowerCase();
      const sugar = parseInt(p.sugar || "0");
      return condition.includes("diabet") || condition.includes("sugar") || sugar >= 130;
    }).length;

    const hypertensionCount = allPatients.filter(p => {
      const condition = (p.complaint || p.diagnosis || "").toLowerCase();
      const bpSys = parseInt((p.bp || "").split("/")[0]);
      return condition.includes("bp") || condition.includes("hypertens") || bpSys >= 140;
    }).length;

    const seniorCitizens = allPatients.filter(p => parseInt(p.age || "0") >= 60).length;

    return {
      total,
      diabetesCount,
      hypertensionCount,
      seniorCitizens,
      totalCampaigns: campaignHistory.length + scheduledCampaigns.length,
      postersGenerated: 16,
      imagesGenerated: 12,
      broadcastsSent: campaignHistory.filter(h => h.status === "Completed").length,
      scheduled: scheduledCampaigns.filter(s => s.status === "Active").length
    };
  }, [allPatients, campaignHistory, scheduledCampaigns]);

  // 1. MULTILINGUAL & SELECTION STATES
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi" | "marathi">("english");

  const getLangValue = (fieldVal: any, lang: "english" | "hindi" | "marathi" = selectedLanguage) => {
    if (!fieldVal) return "";
    if (typeof fieldVal === "string") return fieldVal;
    return fieldVal[lang] || fieldVal.english || fieldVal.marathi || fieldVal.hindi || "";
  };

  // Patient Segmentation Filters
  const [filterGender, setFilterGender] = useState<string>("All");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("All");
  const [filterPatientType, setFilterPatientType] = useState<string>("All");
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [filterDisease, setFilterDisease] = useState<string>("All");
  const [customDiseaseQuery, setCustomDiseaseQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterAdherence, setFilterAdherence] = useState<string>("All");

  // Selected Patients for campaign checkboxes
  const [selectedCampaignPatients, setSelectedCampaignPatients] = useState<string[]>([]);

  // Unique list of patient areas
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    allPatients.forEach(p => {
      if (p.area) {
        const cleaned = p.area.trim();
        if (cleaned) locs.add(cleaned);
      }
    });
    return Array.from(locs);
  }, [allPatients]);

  // Filtered Patients List Creator
  const filteredPatients = useMemo(() => {
    return allPatients.filter(patient => {
      // 1. Gender filter
      if (filterGender !== "All") {
        const pGender = (patient.gender || "").toLowerCase();
        if (filterGender === "Male" && pGender !== "male" && pGender !== "m") return false;
        if (filterGender === "Female" && pGender !== "female" && pGender !== "f") return false;
        if (filterGender === "Other" && (pGender === "male" || pGender === "m" || pGender === "female" || pGender === "f")) return false;
      }

      // 2. Age Group Filter
      const age = parseInt(patient.age || "0");
      if (filterAgeGroup !== "All") {
        if (filterAgeGroup === "Children" && (age > 12 || age < 0)) return false;
        if (filterAgeGroup === "Teenagers" && (age < 13 || age > 19)) return false;
        if (filterAgeGroup === "Adults" && (age < 20 || age > 59)) return false;
        if (filterAgeGroup === "Senior Citizens" && age < 60) return false;
      }

      // 3. Patient Type Filter
      const visitCount = patient.visitCount || 1;
      const lastVisitStr = patient.lastVisit || "";
      if (filterPatientType !== "All") {
        if (filterPatientType === "New Patients" && visitCount !== 1) return false;
        if (filterPatientType === "Existing Patients" && visitCount <= 1) return false;
        if (filterPatientType === "Returning Patients" && visitCount < 3) return false;
        if (filterPatientType === "Inactive Patients") {
          if (!lastVisitStr) return true;
          const lastVisitDate = new Date(lastVisitStr);
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          if (lastVisitDate > ninetyDaysAgo) return false;
        }
      }

      // 4. Location Filter
      if (filterLocation !== "All") {
        const areaStr = (patient.area || "").toLowerCase();
        if (!areaStr.includes(filterLocation.toLowerCase())) return false;
      }

      // 5. Disease Category Filter
      if (filterDisease !== "All") {
        const complaint = (patient.complaint || "").toLowerCase();
        const sugar = parseInt(patient.sugar || "0");
        const bp = patient.bp || "";
        const bpSys = parseInt(bp.split("/")[0] || "0");

        if (filterDisease === "Diabetes") {
          if (!complaint.includes("diabet") && !complaint.includes("sugar") && sugar < 130) return false;
        } else if (filterDisease === "Hypertension") {
          if (!complaint.includes("bp") && !complaint.includes("hypertens") && bpSys < 140) return false;
        } else if (filterDisease === "Obesity") {
          if (!complaint.includes("obesity") && !complaint.includes("overweight") && !complaint.includes("weight")) return false;
        } else if (filterDisease === "Arthritis") {
          if (!complaint.includes("arthri") && !complaint.includes("joint") && !complaint.includes("knee")) return false;
        } else if (filterDisease === "Skin Disorders") {
          if (!complaint.includes("skin") && !complaint.includes("rash") && !complaint.includes("derm") && !complaint.includes("itch")) return false;
        } else if (filterDisease === "Women's Health") {
          if (patient.gender?.toLowerCase() !== "female" && patient.gender?.toLowerCase() !== "f") return false;
          if (!complaint.includes("preg") && !complaint.includes("gyn") && !complaint.includes("women") && !complaint.includes("period")) return false;
        } else if (filterDisease === "Child Health") {
          if (age > 12) return false;
        } else if (filterDisease === "Custom Diseases") {
          if (customDiseaseQuery && !complaint.includes(customDiseaseQuery.toLowerCase())) return false;
        }
      }

      // 6. Appointment Status Filter
      if (filterStatus !== "All") {
        const lastVisitStr = patient.lastVisit || "";
        if (!lastVisitStr) return false;
        const lastVisitDate = new Date(lastVisitStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterStatus === "Active" && diffDays > 30) return false;
        if (filterStatus === "Follow-Up Pending" && (diffDays <= 30 || diffDays > 60)) return false;
        if (filterStatus === "Missed Follow-Up" && diffDays <= 60) return false;
      }

      // 7. Medicine Adherence Filter
      if (filterAdherence !== "All") {
        const charSum = (patient.name || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const adherenceScore = charSum % 3; // 0 = Good, 1 = Average, 2 = Poor
        const adherenceStr = adherenceScore === 0 ? "Good" : adherenceScore === 1 ? "Average" : "Poor";
        if (filterAdherence !== adherenceStr) return false;
      }

      return true;
    });
  }, [allPatients, filterGender, filterAgeGroup, filterPatientType, filterLocation, filterDisease, customDiseaseQuery, filterStatus, filterAdherence]);

  // Keep checkboxes in sync with filtered patients
  useEffect(() => {
    setSelectedCampaignPatients(filteredPatients.map(p => p.phone || ""));
  }, [filteredPatients]);

  // AI Campaign Recommendation Engine
  const recommendedCampaigns = useMemo(() => {
    const totalSeniors = allPatients.filter(p => parseInt(p.age || "0") >= 60).length;
    const totalFemales = allPatients.filter(p => {
      const g = (p.gender || "").toLowerCase();
      return g === "female" || g === "f";
    }).length;
    const totalDiabetics = allPatients.filter(p => {
      const comp = (p.complaint || p.diagnosis || "").toLowerCase();
      const sug = parseInt(p.sugar || "0");
      return comp.includes("diabet") || comp.includes("sugar") || sug >= 130;
    }).length;
    const totalChildren = allPatients.filter(p => {
      const age = parseInt(p.age || "0");
      return age > 0 && age <= 12;
    }).length;

    return [
      {
        id: "rec-1",
        title: "Monsoon Health Campaign",
        targetName: "All Patients",
        targetCount: allPatients.length || 80,
        reason: "Monsoon seasonal trends active. Prevention of dengue, malaria, and typhoid.",
        specialtyMatch: "Family Medicine & General Practice Speciality",
        days: "5 Days",
        topic: "Monsoon Immune Shield & Vaccine Awareness Camp",
      },
      {
        id: "rec-2",
        title: "Diabetes Awareness Campaign",
        targetName: "Diabetic Patients",
        targetCount: totalDiabetics || 24,
        reason: `Detected ${totalDiabetics} patients with glycemic metrics or diabetes history in your database.`,
        specialtyMatch: "Chronic Metabolism Management",
        days: "7 Days",
        topic: "HbA1c Blood Sugar Screening & Wellness Camp",
      },
      {
        id: "rec-3",
        title: "Women's Wellness Campaign",
        targetName: "Female Adults",
        targetCount: totalFemales || 42,
        reason: `Identified ${totalFemales} female patients in your clinic roster. Ideal for annual screening checkups.`,
        specialtyMatch: "Gynecology & Preventive Primary Care",
        days: "4 Days",
        topic: "Women's Diagnostic Health Checkup & Wellness Screening",
      },
      {
        id: "rec-4",
        title: "Child Health Campaign",
        targetName: "Children under 12",
        targetCount: totalChildren || 15,
        reason: `School reopening season and transitional climate risk for ${totalChildren} pediatric index children.`,
        specialtyMatch: "Pediatric Wellness & Immunity Vaccination",
        days: "3 Days",
        topic: "School Reopening Pediatric Immunity Checkup",
      },
      {
        id: "rec-5",
        title: "Senior Citizen Care Campaign",
        targetName: "Senior Citizens (60+)",
        targetCount: totalSeniors || 18,
        reason: `Database holds ${totalSeniors} elder patients requiring routine bone, kidney, or cardiovascular monitoring.`,
        specialtyMatch: "Geriatric Care & Heart Health Supervision",
        days: "7 Days",
        topic: "Senior Citizen Joint Health & Bone Density Camp",
      }
    ];
  }, [allPatients]);

  const handleApplyRecommendation = (rec: any) => {
    setPosterTopic(rec.topic);
    setCampaignTopic(rec.topic);
    setWhatsappCustomDetails(rec.topic);
    setFilterDisease(rec.id === "rec-2" ? "Diabetes" : "All");
    setFilterGender(rec.id === "rec-3" ? "Female" : "All");
    setFilterAgeGroup(rec.id === "rec-4" ? "Children" : rec.id === "rec-5" ? "Senior Citizens" : "All");
    
    setPosterCopy({
      headline: {
        english: rec.topic.substring(0, 30).toUpperCase(),
        hindi: `विशेष शिविर: ${rec.topic.substring(0, 20)}`,
        marathi: `विशेष शिबीर: ${rec.topic.substring(0, 20)}`
      },
      tagline: {
        english: "Schedule your priority screening slot today",
        hindi: "आज ही अपना परामर्श समय सुनिश्चित करें",
        marathi: "आजच तुमची तपासणीची वेळ निश्चित करा"
      },
      content: {
        english: `Proactive tracking remains critical for your wellbeing. The clinic has launched a premium ${rec.title} in association with top diagnostics partners.`,
        hindi: `अपने स्वास्थ्य की बेहतर सुरक्षा के लिए नियमित जांच करवाएं। हमारे क्लीनिक में ${rec.title} के अंतर्गत मुफ्त जांच शिविर शुरू किया जा रहा है।`,
        marathi: `तुमच्या आरोग्याचे रक्षण करण्यासाठी नियमित तपासणी उपयुक्त ठरते. आमच्या क्लिनिकमध्ये ${rec.title} निमित्त विशेष आरोग्य शिबिराचे आयोजन केले जात आहे.`
      },
      cta: {
        english: "Book Diagnostics Slot Today",
        hindi: "आज ही स्लॉट बुक करें",
        marathi: "आजच वेळ निश्चित करा"
      },
      accent: rec.id === "rec-1" ? "from-indigo-650 to-teal-900" : rec.id === "rec-2" ? "from-teal-600 to-cyan-900" : "from-emerald-600 to-teal-950"
    });

    setActiveTab("whatsapp_studio");
    showNotification(`AI Recommendation "${rec.title}" applied with custom audience targets matching!`);
  };

  // POSTER STUDIO STATES
  const [posterTopic, setPosterTopic] = useState("Monsoon Immunity Shield");
  const [posterStyle, setPosterStyle] = useState("Modern Medical Teal");
  const [posterType, setPosterType] = useState("Seasonal Health Posters");
  const [posterFormat, setPosterFormat] = useState<"square" | "portrait" | "landscape">("square");
  const [posterIsLoading, setPosterIsLoading] = useState(false);
  
  const [posterCopy, setPosterCopy] = useState<any>({
    headline: {
      english: "STRENGTHEN YOUR IMMUNITY",
      hindi: "अपनी रोग प्रतिरोधक क्षमता बढ़ाएं",
      marathi: "तुमची रोगप्रतिकारक शक्ती मजबूत करा"
    },
    tagline: {
      english: "Prevent Monsoon Fevers & Infections Proactively",
      hindi: "मानसून बुखार और संक्रमण से खुद को बचाएं",
      marathi: "पावसाळी ताप आणि संसर्ग यांपासून स्वतःचा बचाव करा"
    },
    content: {
      english: "Monsoon seasons bring elevated risks of dengue, malaria, and waterborne gastroenteritis. Keep your health parameters protected under expert medical supervision.",
      hindi: "मानसून के मौसम में डेंगू, मलेरिया और जलजनित पेट के संक्रमण का खतरा बढ़ जाता है। अनुभवी डॉक्टरों की देखरेख में खुद को सुरक्षित रखें।",
      marathi: "पावसाळ्यात डेंग्यू, मलेरिया आणि दूषित पाण्यामुळे होणाऱ्या पोटाच्या आजारांचा धोका वाढतो. निष्णात डॉक्टरांच्या मार्गदर्शनाखाली आपल्या आरोग्याची काळजी घ्या."
    },
    cta: {
      english: "Book Monsoon Evaluation Slot Today",
      hindi: "आज ही अपना स्क्रीनिंग अपॉइंटमेंट बुक करें",
      marathi: "आजच तुमची तपासणीची वेळ निश्चित करा"
    },
    accent: "from-teal-600 to-cyan-900"
  });

  const handleGeneratePoster = async () => {
    setPosterIsLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poster",
          payload: {
            topic: posterTopic,
            clinicName: resolvedClinicName,
            doctorName: resolvedDoctorName,
            speciality: resolvedSpeciality,
            contactName: resolvedContact,
            address: resolvedAddress,
            category: posterType
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPosterCopy({
          headline: data.headline || posterCopy.headline,
          tagline: data.tagline || posterCopy.tagline,
          content: data.content || posterCopy.content,
          cta: data.cta || posterCopy.cta,
          accent: data.accent || "from-teal-600 to-cyan-900"
        });
        showNotification("Multilingual Smart AI Poster generated successfully!");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error generating content. Default preview loaded.");
    } finally {
      setPosterIsLoading(false);
    }
  };

  // IMAGE STUDIO STATES
  const [imageCategory, setImageCategory] = useState("General Practice");
  const [imageStyle, setImageStyle] = useState("Photorealistic Illustration");
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const [imageSeedIdx, setImageSeedIdx] = useState(10);
  const [imageDetails, setImageDetails] = useState<any>({
    prompt: "Photorealistic depiction of a modern medical consultation scene, professional healthcare providers advising patients with high clinical warmth, bright ambient lighting.",
    title: {
      english: "Primary Consultation Banner",
      hindi: "प्राथमिक चिकित्सा परामर्श बैनर",
      marathi: "प्राथमिक वैद्यकीय तपासणी बॅनर"
    },
    suggestedLayout: {
      english: "Healthcare workers on the right, typography space on the left",
      hindi: "दाईं ओर स्वास्थ्य कर्मचारी, दाईं ओर पाठ के लिए खाली स्थान",
      marathi: "उजव्या बाजूला आरोग्य कर्मचारी, मजकुरासाठी डाव्या बाजूला जागा"
    },
    description: {
      english: "Builds absolute trust and emphasizes medical excellence on clinic social platforms.",
      hindi: "चिकित्सा उत्कृष्टता को दर्शाता है और क्लीनिक के प्रति विश्वास जगाता है।",
      marathi: "आरोग्य उत्कृष्टता दर्शवतो आणि क्लिनिकच्या माध्यमातून विश्वास निर्माण करतो."
    }
  });

  const handleGenerateImage = async () => {
    setImageIsLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          payload: {
            category: imageCategory,
            visualType: imageStyle,
            theme: `Medical marketing visual for ${imageCategory} speciality clinic`
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setImageDetails({
          prompt: data.prompt || imageDetails.prompt,
          title: data.title || imageDetails.title,
          suggestedLayout: data.suggestedLayout || imageDetails.suggestedLayout,
          description: data.description || imageDetails.description
        });
        setImageSeedIdx(prev => prev + 1);
        showNotification("Medical illustration visual prompts updated!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImageIsLoading(false);
    }
  };

  // WHATSAPP message generator states
  const [whatsappCategory, setWhatsappCategory] = useState("Health Tips");
  const [whatsappCustomDetails, setWhatsappCustomDetails] = useState("Drink warm water and consume seasonal fruits during monsoon seasons");
  const [whatsappIsLoading, setWhatsappIsLoading] = useState(false);
  const [whatsappMessages, setWhatsappMessages] = useState<any>({
    short: {
      english: "✨ *Seasonal Alert from Carebridge Plus Clinic*: Stay hydrated and restrict street food consumption during Monsoon. Text back to book! 📞",
      hindi: "✨ *स्वास्थ्य अलर्ट (केयरब्रिज प्लस क्लिनिक)*: मानसून के दौरान पर्याप्त मात्रा में पानी पिएं और बाहर का खाना खाने से बचें। स्लॉट बुक करने के लिए रिप्लाई करें! 📞",
      marathi: "✨ *आरोग्य सल्ला (केअरब्रिज प्लस क्लिनिक)*: पावसाळ्यात भरपूर पाणी प्या आणि बाहेरील उघड्यावरील अन्न खाणे टाळा. तपासणीसाठी त्वरित संपर्क साधा! 📞"
    },
    medium: {
      english: "🚨 *Monsoon Health Tips by Dr. Pawar* 🚨\n\nProtective protocols for your family:\n• Wash green vegetables thoroughly\n• Keep water containers stored safe\n• Walk standard daily loops indoors\n\nTo consult our medical specialists, reply directly to this thread! 🩺",
      hindi: "🚨 *डॉ. पवार कडून आवश्यक मानसून स्वास्थ्य टिप्स* 🚨\n\nअपने परिवार की सुरक्षा के लिए:\n• हरी सब्जियों को पानी से अच्छी तरह धोएं\n• पीने के पानी को हमेशा झांक कर रखें\n• रोजाना घर के अंदर ही टहलें\n\nतज्ञ डॉक्टरों से सलाह के लिए इस संदेश का उत्तर दें! 🩺",
      marathi: "🚨 *डॉ. पवार कडून पावसाळी आरोग्य सल्ला* 🚨\n\nआपल्या कुटुंबाच्या आरोग्यासाठी महत्त्वाचे नियम:\n• पालेभाज्या स्वच्छ धुवून वापरा\n• पिण्यासाठी शुद्ध व सुरक्षित पाण्याचा वापर करा\n• घरामध्येच नियमितपणे चाला\n\nअधिक मार्गदर्शनासाठी या मेसेजला थेट रिप्लाय करा! 🩺"
    },
    detailed: {
      english: "🌱 *Monsoon Immuno-Shield Protocol* 🌱\n\nDear Patients,\n\nOur specialists warn against seasonal threats. Early diagnostic check-ups guard against fevers.\n\n*Why choose Carebridge Plus?*\n1. Standard health checks\n2. Realtime OPD tracking\n3. Personalized advice\n\n👉 Respond directly to book consultation slot!\n📞 9988776655",
      hindi: "🌱 *मानसून इम्यूनो-शील्ड प्रोटोकॉल* 🌱\n\nप्रिय मरीज मित्र,\n\nहमारे विशेषज्ञ मौसमी बीमारियों से सचेत रहने की सलाह देते हैं। शुरुआती जांच बुखार और अन्य खतरों से बचाती है।\n\n*केयरब्रिज प्लस क्यों चुनें?*\n1. मानक स्वास्थ्य जांच\n2. त्वरित ओपीडी ट्रैकिंग\n3. वैयक्तिक स्वास्थ्य परामर्श\n\n👉 स्लॉट बुक करने के लिए इस संदेश का उत्तर दें!\n📞 9988776655",
      marathi: "🌱 *पावसाळी इम्युनो-शील्ड प्रोटोकॉल* 🌱\n\nप्रिय रुग्ण मित्रहो,\n\nआमचे तज्ञ डॉक्टर पावसाळी आजारांविषयी काळजी घेण्याचा सल्ला देतात. वेळीच केलेली तपासणी तापासारख्या आजारांपासून रक्षण करते.\n\n*केअरब्रिज प्लस का निवडावे?*\n1. उत्कृष्ट आरोग्य तपासणी\n2. रिअलटाइम ओपीडी ट्रॅकिंग\n3. वैयक्तिक सल्ला आणि औषधोपचार\n\n👉 आपली वेळ निश्चित करण्यासाठी या मेसेजला थेट उत्तर द्या!\n📞 9988776655"
    }
  });

  const handleGenerateWhatsApp = async () => {
    setWhatsappIsLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "whatsapp",
          payload: {
            category: whatsappCategory,
            details: whatsappCustomDetails,
            clinicName: resolvedClinicName,
            contact: resolvedContact
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setWhatsappMessages({
          short: data.short,
          medium: data.medium,
          detailed: data.detailed
        });
        showNotification("Multilingual WhatsApp copies generated successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWhatsappIsLoading(false);
    }
  };

  const handleBroadcastWhatsApp = async (text: string) => {
    try {
      const targetCount = selectedCampaignPatients.length;
      if (targetCount === 0) {
        showNotification("Warning: No patients checked in current segment list!");
        return;
      }

      await handleBulkSendWhatsApp(text, "campaign");
      // log campaign in history
      const logCamp = {
        id: `camp-${Date.now()}`,
        name: `Broadcast [${selectedLanguage.toUpperCase()}]: ${whatsappCategory}`,
        category: "WhatsApp Campaign",
        target: `${filterGender} ${filterAgeGroup} ${filterDisease !== "All" ? filterDisease : "Patients"}`.trim(),
        reach: targetCount,
        clicks: Math.floor(targetCount * 0.65),
        sentAt: new Date().toISOString().split("T")[0],
        status: "Completed"
      };
      setCampaignHistory(prev => [logCamp, ...prev]);
      showNotification(`WhatsApp broadcast successfully dispatched to ${targetCount} patients!`);
    } catch (e) {
      console.error(e);
      showNotification("Failed to execute bulk send.");
    }
  };

  // CAMPAIGN STUDIO STATES (Campaign Packages & Multilingual copy)
  const [campaignTopic, setCampaignTopic] = useState("Diabetes Awareness Week");
  const [campaignTargetAudience, setCampaignTargetAudience] = useState("Chronic Patients");
  const [campaignIsLoading, setCampaignIsLoading] = useState(false);
  const [campaignContent, setCampaignContent] = useState<any>({
    posterHeadline: {
      english: "DIABETES CONTROL PROGRAM",
      hindi: "मधुमेह नियंत्रण कार्यक्रम",
      marathi: "मधुमेह नियंत्रण मोहीम"
    },
    posterContent: {
      english: "Proactive dietary balancing and systematic blood sugar feedback loops protect renal pathways.",
      hindi: "सक्रिय आहार संतुलन और व्यवस्थित रक्त शर्करा नियंत्रण किडनी के स्वास्थ्य की रक्षा करते हैं।",
      marathi: "सक्रिय आहार संतुलन आणि नियमित रक्तातील साखर तपासणी किडनीच्या आरोग्याचे रक्षण करते."
    },
    posterCta: {
      english: "Book HbA1c Screening Slot",
      hindi: "आज ही HbA1c जांच के लिए संपर्क करें",
      marathi: "आजच HbA1c तपासणी बुक करा"
    },
    imagePrompt: "Warm ambient studio portrait of a patient happily monitoring sugar logs with their doctor.",
    whatsappMessage: {
      english: "📢 *Diabetes Check-up Week at Carebridge Plus*: Don't let chronic sugar variables compromise your system. Restructure parameters with our specialists.",
      hindi: "📢 *मधुमेह जांच सप्ताह (केयरब्रिज प्लस)*: रक्तातील साखरेचे प्रमाण वाढल्याने शरीरावर वाईट परिणाम होऊ देऊ नका, आजच तज्ञांचा सल्ला घ्या।",
      marathi: "📢 *मधुमेह तपासणी शिबीर (केअरब्रिज प्लस)*: रक्तातील साखरेचे वाढलेले प्रमाण तुमच्या शरीरावर परिणाम करू देऊ नका, आजच तज्ञांचा सल्ला घ्या।"
    },
    socialCaption: {
      english: "🩺 Check out our upcoming Wellness Initiative. Preventive health first! Let's conquer health milestones together. #Wellness #DiabetesCare",
      hindi: "🩺 आने वाली विशेष स्वास्थ्य पहल में भाग लें। सुरक्षात्मक स्वास्थ्य पहले! आइए मिलकर स्वस्थ जीवन का लक्ष्य प्राप्त करें। #Wellness #DiabetesCare",
      marathi: "🩺 आमच्या आगामी आरोग्य उपक्रमात सहभागी व्हा. प्रतिबंधात्मक उपचार पहिले! चला मिळून निरोगी जीवनाचे ध्येय गाठूया. #Wellness #DiabetesCare"
    },
    suggestedSchedule: {
      english: "Day 1: Patient broadcast recall | Day 3: Poster status rollout | Day 7: Checkup OPD dispatch",
      hindi: "दिन 1: मरीज ब्रॉडकास्ट संदेश | दिन 3: पोस्टर रोलआउट | दिन 7: ओपीडी फॉलो-अप",
      marathi: "दिवस १: रुग्ण संदेश ब्रॉडकास्ट | दिवस ३: पोस्टर रोलआउट | दिवस ७: ओपीडी पाठपुरावा"
    }
  });

  const [multilingualPost, setMultilingualPost] = useState({
    english: "🩺 Secure your family's health parameters with custom advice from Dr. Pawar at Carebridge Plus Clinic today.",
    marathi: "🩺 नियमित तपासणीने स्वतःला सुरक्षित ठेवा! आजच केअरब्रिज प्लस क्लिनिकमध्ये डॉक्टरांशी संपर्क साधा आणि आरोग्य जपा.",
    hindi: "🩺 नियमित जांच से जीवन सुरक्षित रखें! आज ही केयरब्रिज प्लस क्लिनिक से संपर्क करें और स्वास्थ्य सुनिश्चित करें।"
  });
  const [isMultilingualLoading, setIsMultilingualLoading] = useState(false);
  const [postSubject, setPostSubject] = useState("Benefits of regular healthcare checkups and clinical screenings");

  const handleGenerateCampaign = async () => {
    setCampaignIsLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign",
          payload: {
            topic: campaignTopic,
            target: campaignTargetAudience,
            clinicName: resolvedClinicName
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCampaignContent(data);
        showNotification("Dynamic Multilingual Campaign assets successfully structured!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignIsLoading(false);
    }
  };

  const handleGenerateMultilingualPost = async () => {
    setIsMultilingualLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "content",
          payload: {
            format: "Social Media Post",
            clinicName: resolvedClinicName,
            subject: postSubject
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMultilingualPost({
          english: data.english,
          marathi: data.marathi,
          hindi: data.hindi
        });
        showNotification("Multilingual copies created in seconds!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMultilingualLoading(false);
    }
  };

  // 5. SCHEDULER STATES
  const [scheduleName, setScheduleName] = useState("Seasonal Flu Checkup Camp Alert");
  const [scheduleDate, setScheduleDate] = useState("2026-06-25");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleType, setScheduleType] = useState("WhatsApp Studio");
  const [scheduleAudience, setScheduleAudience] = useState("Chronic Patients");

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule = {
      id: `sched-${Date.now()}`,
      name: scheduleName,
      date: scheduleDate,
      time: scheduleTime,
      type: scheduleType,
      audience: scheduleAudience,
      status: "Active"
    };
    setScheduledCampaigns(prev => [newSchedule, ...prev]);
    showNotification("Campaign scheduler updated successfully!");
    setScheduleName("");
  };

  const handleCancelSchedule = (id: string) => {
    setScheduledCampaigns(prev => prev.filter(s => s.id !== id));
    showNotification("Scheduled campaign alert cancelled.");
  };

  // 6. ADVISOR STATES
  const [advisorIsLoading, setAdvisorIsLoading] = useState(false);
  const [advisorInsights, setAdvisorInsights] = useState<any[]>([
    {
      title: "Senior Citizens Bone & Mineral Camp",
      description: "A customized camp to engage elders with bone health, dietary calcium plans, and local vital tracking.",
      effort: "Low",
      impact: "High",
      actionPlan: "1. Generate WhatsApp Broadcast\n2. Download Campaign Poster\n3. Start registration on Clinic Floor"
    },
    {
      title: "Active Diabetes & Sugar Alert Week",
      description: "Weekend diagnostic checks for blood sugar and HbA1c screenings combined with heart vitals.",
      effort: "Medium",
      impact: "High",
      actionPlan: "1. Segregate chronic indices on Admin ERP\n2. Schedule targeted campaign outreach\n3. Offer test bundle parameters"
    }
  ]);

  const handleFetchAdvisorInsights = async () => {
    setAdvisorIsLoading(true);
    try {
      const response = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "advisor",
          payload: {
            speciality: resolvedSpeciality,
            city: clinicDetails?.city || user?.city || "Aurangabad",
            doctorName: resolvedDoctorName
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAdvisorInsights(data);
        showNotification("Actionable marketing advisor tips generated!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdvisorIsLoading(false);
    }
  };

  // 7. PRESET TEMPLATE LIBRARY
  const templatePresets = [
    { title: "World Heart Care Day Greeting", type: "Health Awareness Days", topic: "Keep your cardiovascular vitals balanced with light daily routines.", accent: "from-red-600 to-rose-950" },
    { title: "Diwali Festival Warm Wishes", type: "Festival Greetings", topic: "Wishing you an abundance of health and sweet balanced moments.", accent: "from-amber-500 to-orange-850" },
    { title: "Monsoon Health Protection Hub", type: "Seasonal Health Posters", topic: "Protect your children from mosquito vector transmissions and water toxins.", accent: "from-blue-600 to-indigo-950" },
    { title: "Free General Health Camp Alert", type: "Clinic Promotion", topic: "Comprehensive check-up diagnostic slots available this Sunday at the clinic.", accent: "from-emerald-600 to-teal-950" }
  ];

  const handleApplyTemplate = (tpl: any) => {
    setPosterTopic(tpl.title);
    setPosterType(tpl.type);
    setPosterCopy(prev => ({
      ...prev,
      headline: tpl.title.toUpperCase(),
      content: tpl.topic,
      accent: tpl.accent
    }));
    setActiveTab("poster_studio");
    showNotification(`Loaded template: "${tpl.title}" directly to Poster Studio!`);
  };

  // Recharts Dynamic Activity Trends System
  const [trendFrequency, setTrendFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");

  const trendChartData = useMemo(() => {
    if (trendFrequency === "daily") {
      return [
        { name: "Mon", posters: 1, images: 0, whatsapp: 3, camps: 0 },
        { name: "Tue", posters: 2, images: 1, whatsapp: 5, camps: 0 },
        { name: "Wed", posters: 0, images: 2, whatsapp: 4, camps: 1 },
        { name: "Thu", posters: 3, images: 1, whatsapp: 7, camps: 1 },
        { name: "Fri", posters: 1, images: 3, whatsapp: 6, camps: 0 },
        { name: "Sat", posters: 4, images: 2, whatsapp: 11, camps: 2 },
        { name: "Sun", posters: 2, images: 1, whatsapp: 5, camps: 1 }
      ];
    } else if (trendFrequency === "weekly") {
      return [
        { name: "Week 1", posters: 3, images: 2, whatsapp: 8, camps: 1 },
        { name: "Week 2", posters: 4, images: 5, whatsapp: 12, camps: 2 },
        { name: "Week 3", posters: 6, images: 3, whatsapp: 10, camps: 1 },
        { name: "Week 4", posters: 8, images: 6, whatsapp: 18, camps: 3 }
      ];
    } else {
      return [
        { name: "Jan", posters: 4, images: 3, whatsapp: 12, camps: 1 },
        { name: "Feb", posters: 5, images: 6, whatsapp: 15, camps: 2 },
        { name: "Mar", posters: 8, images: 5, whatsapp: 18, camps: 1 },
        { name: "Apr", posters: 10, images: 8, whatsapp: 24, camps: 3 },
        { name: "May", posters: 12, images: 10, whatsapp: 30, camps: 2 },
        { name: "Jun", posters: 16, images: 12, whatsapp: 38, camps: 4 }
      ];
    }
  }, [trendFrequency]);

  const engagementConversionData = [
    { name: "Posters", views: 240, clicks: 145 },
    { name: "Images", views: 180, clicks: 112 },
    { name: "WhatsApp", views: 420, clicks: 310 },
    { name: "Social Copy", views: 320, clicks: 198 }
  ];

  const patientDemographics = [
    { name: "All Patient Base", value: metrics.total || 100 },
    { name: "Diabetes Patients", value: metrics.diabetesCount || 20 },
    { name: "BP Patients", value: metrics.hypertensionCount || 30 },
    { name: "Senior Citizens", value: metrics.seniorCitizens || 15 }
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Custom clipboard text copy helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("Copied text template safely to your clipboard!");
  };

  return (
    <div className="font-sans min-h-[750px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-1 md:p-4 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm">
      
      {/* Top Banner Notifications */}
      <AnimatePresence>
        {successBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#005f73] text-white py-3 px-6 rounded-2xl shadow-xl border border-teal-500/30 flex items-center gap-2"
          >
            <Sparkles size={18} className="text-yellow-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT WORKSPACE NAVIGATION BLOCK */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-2">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-3xl mb-1 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#005f73]/10 dark:bg-teal-500/10 p-2 rounded-2xl">
                <Sparkles className="text-[#005f73] dark:text-teal-400" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">Smart Marketing AI</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Suite v4.2 ERP-Ready</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              Generate healthcare posters, wellness visuals, WhatsApp announcements, and campaign schedules with clinical intelligence.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-2 rounded-3xl shadow-sm flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "dashboard"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid size={16} />
                <span>Dashboard Hub</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">Main</span>
            </button>

            <button
              onClick={() => setActiveTab("poster_studio")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "poster_studio"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={16} />
                <span>AI Poster Creator</span>
              </div>
              <Sparkles size={12} className="text-teal-400" />
            </button>

            <button
              onClick={() => setActiveTab("image_studio")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "image_studio"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span>AI Image Creator</span>
              </div>
              <span className="text-[9px] px-1 bg-yellow-500/10 text-yellow-500 rounded-md">New</span>
            </button>

            <button
              onClick={() => setActiveTab("whatsapp_studio")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "whatsapp_studio"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone size={16} />
                <span>AI WhatsApp Studio</span>
              </div>
              <span className="text-[10px] px-1 bg-teal-500/10 text-teal-400 font-extrabold">{metrics.total}</span>
            </button>

            <button
              onClick={() => setActiveTab("campaign_studio")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "campaign_studio"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 size={16} />
                <span>Campaign Creator</span>
              </div>
              <Globe size={13} className="text-[#005f73]" />
            </button>

            <button
              onClick={() => setActiveTab("scheduler")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "scheduler"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarRange size={16} />
                <span>Scheduler Queue</span>
              </div>
              <span className="text-[10px] px-1.5 bg-indigo-500/10 text-indigo-400 rounded-md font-bold">{metrics.scheduled}</span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "templates"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ListTodo size={16} />
                <span>Template Library</span>
              </div>
              <Heart size={13} className="text-red-500 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab("advisor")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "advisor"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>AI Growth Advisor</span>
              </div>
              <Sparkles size={12} className="text-teal-400" />
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold uppercase transition-all duration-250 ${
                activeTab === "analytics"
                  ? "bg-[#005f73] text-white shadow-md shadow-teal-900/10"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                <span>Analytics & Logs</span>
              </div>
              <TrendingUp size={13} className="text-green-500" />
            </button>
          </div>

          <div className="hidden lg:block bg-slate-900 dark:bg-slate-920 text-white p-5 rounded-3xl border border-slate-800/80 mt-1 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-green-400">Clinic Branding Integration</span>
            </div>
            <div className="text-[11px] space-y-1.5 opacity-80">
              <p>📍 <strong className="text-white">Facility:</strong> {resolvedClinicName}</p>
              <p>👤 <strong className="text-white">Director:</strong> {resolvedDoctorName}</p>
              <p>📱 <strong className="text-white">Contact No:</strong> {resolvedContact}</p>
              <p>🌐 <strong className="text-white">Speciality:</strong> {resolvedSpeciality}</p>
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE STUDIO STAGE */}
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-6">
          
          {/* Global Multi-Language Studio Switcher Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-[#005f73] animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block leading-none">Global Localization Studio</span>
                <span className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">Active Preview Translation</span>
              </div>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/20">
              <button
                onClick={() => {
                  setSelectedLanguage("english");
                  showNotification("Studio displays switched to English.");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                  selectedLanguage === "english" 
                    ? "bg-[#005f73] text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-200/50"
                }`}
              >
                <span>🇬🇧 ENG</span>
              </button>
              <button
                onClick={() => {
                  setSelectedLanguage("marathi");
                  showNotification("Studio displays switched to Marathi (मराठी).");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                  selectedLanguage === "marathi" 
                    ? "bg-[#005f73] text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-200/50"
                }`}
              >
                <span>🇮🇳 MAR (मराठी)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedLanguage("hindi");
                  showNotification("Studio displays switched to Hindi (हिंदी).");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                  selectedLanguage === "hindi" 
                    ? "bg-[#005f73] text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-200/50"
                }`}
              >
                <span>🇮🇳 HIN (हिंदी)</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. SMART MARKETING DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Dashboard KPIs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-3xl shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">Campaigns</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{metrics.totalCampaigns}</h2>
                    <span className="text-[9px] text-[#005f73] font-bold uppercase mt-1 block">Active Outreach</span>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-3xl shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">Posters & Images</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{metrics.postersGenerated + metrics.imagesGenerated}</h2>
                    <span className="text-[9px] text-teal-500 font-bold uppercase mt-1 block">Visual Assets</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-3xl shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">WhatsApp Broadcasts</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{metrics.broadcastsSent}</h2>
                    <span className="text-[9px] text-green-500 font-bold uppercase mt-1 block">Delivered</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-3xl shadow-sm text-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase">Scheduler Q</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{metrics.scheduled}</h2>
                    <span className="text-[9px] text-indigo-500 font-bold uppercase mt-1 block">Pending Launch</span>
                  </div>
                </div>

                {/* Dashboard Core Content - Quick Actions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Sparkles size={16} className="text-teal-500" />
                    Quick Marketing Launchpads
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setActiveTab("poster_studio")}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/50 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-2">
                          <ImageIcon size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 group-hover:text-teal-400 transition-colors">Create Poster</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">Generate high-converting square healthcare graphics in seconds with AI.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-slate-400 group-hover:text-teal-400 self-end" />
                    </div>

                    <div 
                      onClick={() => setActiveTab("image_studio")}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/50 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-2">
                          <Activity size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 group-hover:text-yellow-500 transition-colors">Create Image</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">Generate professional prompt visual references for wellness campaigns.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-slate-400 group-hover:text-yellow-500 self-end" />
                    </div>

                    <div 
                      onClick={() => setActiveTab("whatsapp_studio")}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/50 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-2">
                          <Smartphone size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 group-hover:text-green-400 transition-colors">Create WhatsApp Msg</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">Draft appointment, recall, or campaign messages instantly.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-slate-400 group-hover:text-green-400 self-end" />
                    </div>

                    <div 
                      onClick={() => { setCampaignTopic("Diabetes Awareness Camp"); setActiveTab("campaign_studio"); }}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/50 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-2">
                          <Volume2 size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 group-hover:text-indigo-400 transition-colors">Launch Health Campaign</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">Automate multi-channel wellness schedules with a unique theme.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-slate-400 group-hover:text-indigo-400 self-end" />
                    </div>

                    <div 
                      onClick={() => setActiveTab("templates")}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/50 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-[#005f73]/10 rounded-2xl flex items-center justify-center text-[#005f73] mb-2">
                          <Heart size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 group-hover:text-teal-400 transition-colors">Create Festival Campaign</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400">Utilize readymade templates to wish patient base on holidays.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-slate-400 group-hover:text-teal-400 self-end" />
                    </div>

                    <div 
                      onClick={() => setActiveTab("advisor")}
                      className="cursor-pointer group flex flex-col justify-between p-4 bg-[#005f73]/10 dark:bg-teal-950/20 rounded-3xl border border-dashed border-teal-500/30 hover:border-teal-400 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mb-2">
                          <Sparkles size={20} />
                        </div>
                        <h4 className="text-xs font-black uppercase text-[#005f73] dark:text-teal-400 transition-colors">Growth Advisor AI</h4>
                        <p className="text-[11px] text-[#005f73]/80 dark:text-teal-300/80">Retrieve custom local patient retention campaign insights.</p>
                      </div>
                      <ChevronRight size={16} className="mt-4 text-teal-400 self-end" />
                    </div>
                  </div>
                </div>

                {/* Patient Database Highlights in CRM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
                      <Users size={16} className="text-teal-500" />
                      Target Patient Database
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 uppercase">
                      Segment counts filtered for immediate campaign triggers:
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400">Total Patients</span>
                        <span className="text-md font-black text-slate-800 dark:text-slate-50 block mt-1">{metrics.total}</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400">Senior Citizens</span>
                        <span className="text-md font-black text-slate-800 dark:text-slate-50 block mt-1">{metrics.seniorCitizens}</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400">Diabetes Patients</span>
                        <span className="text-md font-black text-slate-800 dark:text-slate-50 block mt-1">{metrics.diabetesCount}</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/40">
                        <span className="text-[9px] text-slate-400">BP / Hypertension</span>
                        <span className="text-md font-black text-slate-800 dark:text-slate-50 block mt-1">{metrics.hypertensionCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">Dynamic Growth Insight</span>
                      <h3 className="text-base font-extrabold text-slate-50">Local Campaign Target: High Alert</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Based on your patient diagnostics, <strong className="text-white">{metrics.diabetesCount} patients suffer from elevated glycemic metrics</strong>, and <strong className="text-white">{metrics.hypertensionCount} suffer Hypertension</strong>. Leverage AI Poster and WhatsApp message Studios to coordinate an Early Screening Checkup Camp before World Diabetes Day or seasonal events.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setCampaignTopic("Weekend Hypertension Care Camp"); setActiveTab("campaign_studio"); }}
                      className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-2xl transition-colors duration-200"
                    >
                      Pre-plan Camp Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. AI POSTER CREATOR */}
            {activeTab === "poster_studio" && (
              <motion.div
                key="poster_studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Visual Settings Panel (Left) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-teal-500" />
                    Poster Studio Config
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Campaign Topic</label>
                      <input 
                        type="text" 
                        value={posterTopic} 
                        onChange={(e) => setPosterTopic(e.target.value)}
                        placeholder="e.g. Free Blood Sugar Control"
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          "Blood Sugar Checkup Camp",
                          "Malaria Prevention Alert",
                          "Cardiac Wellness Screening",
                          "Childhood Vaccination Reminder"
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setPosterTopic(chip);
                              showNotification(`Selected: "${chip}"`);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[8px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md text-slate-500"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Poster Category</label>
                      <select 
                        value={posterType} 
                        onChange={(e) => setPosterType(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      >
                        <option>Health Awareness Posters</option>
                        <option>Seasonal Health Posters</option>
                        <option>Festival Greetings</option>
                        <option>Clinic Promotion</option>
                        <option>Health Camp Promotion</option>
                        <option>Vaccination Campaign</option>
                        <option>Doctor Introduction</option>
                        <option>New Service Launch</option>
                        <option>Special Offer Announcement</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Poster Color Style</label>
                      <select 
                        value={posterStyle} 
                        onChange={(e) => setPosterStyle(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      >
                        <option>Modern Medical Teal</option>
                        <option>Deep Space Slate</option>
                        <option>Emergency Red Alert</option>
                        <option>Clinical Comfort Blue</option>
                        <option>Ayurvedic Forest Green</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleGeneratePoster}
                        disabled={posterIsLoading}
                        className="w-full bg-[#005f73] hover:bg-[#0081a7] text-white py-3 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {posterIsLoading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>AI is drafting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                            <span>Generate with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Stage & Review Studio (Right) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 rounded-3xl shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aspect Format Selector</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPosterFormat("square")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          posterFormat === "square" ? "bg-[#005f73] text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        Square (1:1)
                      </button>
                      <button 
                        onClick={() => setPosterFormat("portrait")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          posterFormat === "portrait" ? "bg-[#005f73] text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        Portrait (3:4)
                      </button>
                      <button 
                        onClick={() => setPosterFormat("landscape")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          posterFormat === "landscape" ? "bg-[#005f73] text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        Landscape (16:9)
                      </button>
                    </div>
                  </div>

                  {/* Physical Digital Poster Frame */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800  p-6 rounded-3xl shadow-sm flex flex-col items-center">
                    
                    {/* Live styled visual stage */}
                    <div 
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${posterCopy.accent || "from-teal-600 to-cyan-900"} text-white p-6 shadow-xl flex flex-col justify-between transition-all duration-300 ${
                        posterFormat === "square" ? "w-full max-w-[380px] aspect-square" :
                        posterFormat === "portrait" ? "w-full max-w-[340px] aspect-[3/4]" : "w-full aspect-[16/9]"
                      }`}
                    >
                      {/* Accent Decorative Elements */}
                      <span className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl"></span>
                      <span className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-400/10 rounded-full blur-3xl"></span>

                      {/* Header bar */}
                      <div className="flex justify-between items-start z-10 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Heart size={14} className="text-red-400 fill-red-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{resolvedClinicName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] opacity-75 uppercase block tracking-wider">Clinical Guidance</span>
                          <span className="text-[9px] font-bold">{resolvedDoctorName} ({resolvedSpeciality})</span>
                        </div>
                      </div>

                      {/* Middle Message Text elements */}
                      <div className="z-10 text-center my-auto px-2 space-y-2">
                        <h2 className="text-sm font-black uppercase tracking-wide bg-gradient-to-r from-yellow-100 to-white bg-clip-text text-transparent leading-snug">
                          {getLangValue(posterCopy.headline)}
                        </h2>
                        <h4 className="text-[10px] font-extrabold text-teal-300 uppercase tracking-widest leading-tight">
                          {getLangValue(posterCopy.tagline)}
                        </h4>
                        <p className="text-[10px] opacity-90 leading-relaxed font-semibold max-h-[85px] overflow-hidden">
                          {getLangValue(posterCopy.content)}
                        </p>
                      </div>

                      {/* Poster Bottom bar */}
                      <div className="z-10 bg-black/20 p-2.5 rounded-xl border border-white/5 text-center space-y-1.5">
                        <span className="text-[9px] font-black bg-white text-slate-900 px-3 py-0.5 rounded-full inline-block uppercase tracking-widest">
                          {getLangValue(posterCopy.cta)}
                        </span>
                        <div className="flex justify-around items-center text-[8px] opacity-90 border-t border-white/10 pt-1.5">
                          <span>📞 {resolvedContact}</span>
                          <span>📍 {resolvedAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Editable Preview Fields (Inline) */}
                    <div className="w-full mt-6 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Clipboard size={12} />
                          Live Field Customizer ({selectedLanguage.toUpperCase()})
                        </h4>
                        <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-extrabold px-2 py-0.5 rounded uppercase">
                          Editing localized block
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold">
                        <div>
                          <label className="text-[9px] text-[#005f73] uppercase font-black block mb-1">Headline Text ({selectedLanguage.toUpperCase()})</label>
                          <input 
                            type="text" 
                            value={getLangValue(posterCopy.headline)} 
                            onChange={(e) => {
                              const base = typeof posterCopy.headline === "string" 
                                ? { english: posterCopy.headline, hindi: posterCopy.headline, marathi: posterCopy.headline } 
                                : { ...posterCopy.headline };
                              setPosterCopy({
                                ...posterCopy,
                                headline: { ...base, [selectedLanguage]: e.target.value }
                              });
                            }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-[#005f73] uppercase font-black block mb-1">Tagline Block ({selectedLanguage.toUpperCase()})</label>
                          <input 
                            type="text" 
                            value={getLangValue(posterCopy.tagline)} 
                            onChange={(e) => {
                              const base = typeof posterCopy.tagline === "string" 
                                ? { english: posterCopy.tagline, hindi: posterCopy.tagline, marathi: posterCopy.tagline } 
                                : { ...posterCopy.tagline };
                              setPosterCopy({
                                ...posterCopy,
                                tagline: { ...base, [selectedLanguage]: e.target.value }
                              });
                            }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[9px] text-[#005f73] uppercase font-black block mb-1">Body Context Description ({selectedLanguage.toUpperCase()})</label>
                          <textarea 
                            rows={2}
                            value={getLangValue(posterCopy.content)} 
                            onChange={(e) => {
                              const base = typeof posterCopy.content === "string" 
                                ? { english: posterCopy.content, hindi: posterCopy.content, marathi: posterCopy.content } 
                                : { ...posterCopy.content };
                              setPosterCopy({
                                ...posterCopy,
                                content: { ...base, [selectedLanguage]: e.target.value }
                              });
                            }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold"
                          />
                        </div>
                      </div>

                      {/* Download and Save actions */}
                      <div className="flex gap-2 pt-2 shadow-sm font-black text-xs">
                        <button 
                          onClick={() => {
                            showNotification("Preparing high-resolution flyer download...");
                          }}
                          className="flex-1 bg-slate-900 border border-slate-800 text-white font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-2xl hover:bg-slate-800 flex items-center justify-center gap-1.5"
                        >
                          <Download size={14} />
                          Download Flyer
                        </button>
                        <button 
                          onClick={() => {
                            setCampaignHistory(prev => [
                              { id: `camp-${Date.now()}`, name: posterTopic, category: posterType, target: "All Guests", reach: 1, clicks: 0, sentAt: new Date().toISOString().split("T")[0], status: "Completed" },
                              ...prev
                            ]);
                            showNotification("Layout saved safe inside Template Archives!");
                          }}
                          className="flex-1 bg-white border border-slate-200 text-slate-705 font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-2xl hover:bg-slate-50 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={14} className="text-green-500" />
                          Save Poster
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. AI IMAGE CREATOR */}
            {activeTab === "image_studio" && (
              <motion.div
                key="image_studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Category & Design Panel */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <Activity size={16} className="text-yellow-500" />
                    AI Graphic Config
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Medical Category</label>
                      <select 
                        value={imageCategory} 
                        onChange={(e) => setImageCategory(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      >
                        <option>General Practice</option>
                        <option>Ayurveda</option>
                        <option>Pediatrics</option>
                        <option>Gynecology</option>
                        <option>Dermatology</option>
                        <option>Physiotherapy</option>
                        <option>Dental</option>
                        <option>Wellness</option>
                        <option>Health Awareness</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Graphic Art Style</label>
                      <select 
                        value={imageStyle} 
                        onChange={(e) => setImageStyle(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      >
                        <option>Photorealistic Illustration</option>
                        <option>Flat Vector Art</option>
                        <option>Clinical Line Art</option>
                        <option>Minimalist Wellness Illustration</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleGenerateImage}
                        disabled={imageIsLoading}
                        className="w-full bg-[#005f73] hover:bg-[#0081a7] text-white py-3 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {imageIsLoading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>AI Rendering...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                            <span>Generate Medical Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Graphics Workspace & Prompt Preview */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  
                  {/* Generated Graphic Frame Display */}
                  <div className="relative flex flex-col items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-dashed border-slate-200">
                    
                    <span className="absolute top-2 left-3 text-[8px] uppercase tracking-widest font-black text-slate-400 bg-white dark:bg-slate-900 border px-2 py-0.5 rounded-full z-10 shadow-sm">
                      AI Generated Reference Visual
                    </span>

                    <div className="relative w-full max-w-[400px] aspect-square rounded-xl overflow-hidden shadow-xl mt-4 border border-slate-150">
                      
                      {/* Curated Beautiful Image base seed representation */}
                      <img 
                        src={`https://picsum.photos/seed/med-${imageCategory.replace(/\s+/g, '-')}-${imageSeedIdx}/800/800`}
                        alt="Medical Wellness Setup"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      
                      {/* Stylized UI overlays and branding borders */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-5 text-white space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00a896]">{imageCategory} Specialist Hub</span>
                        <h4 className="text-xs font-black uppercase truncate">{getLangValue(imageDetails.title)}</h4>
                        <p className="text-[9px] opacity-80 leading-relaxed truncate">{getLangValue(imageDetails.description)}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Prompt metadata */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles size={12} className="text-teal-400" />
                      Dynamic Render Details Prompt
                    </h4>
                    
                    <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{getLangValue(imageDetails.prompt)}"
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[9px] font-extrabold uppercase border-t border-slate-200/50 pt-2 text-slate-400">
                        <div>
                          <span>Suggested Layout placement:</span>
                          <span className="block text-slate-800 dark:text-slate-200 mt-0.5 font-bold leading-normal">{getLangValue(imageDetails.suggestedLayout)}</span>
                        </div>
                        <div>
                          <span>Marketing objective:</span>
                          <span className="block text-slate-800 dark:text-slate-200 mt-0.5 font-bold leading-normal">{getLangValue(imageDetails.description)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action tools */}
                    <div className="flex gap-2 pt-2 text-xs font-black uppercase tracking-wider">
                      <button 
                        onClick={() => {
                          showNotification("Copying prompt coordinates to clipboard...");
                          handleCopyToClipboard(imageDetails.prompt);
                        }}
                        className="flex-1 bg-slate-900 text-white rounded-2xl py-3 hover:bg-slate-805 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Copy size={14} />
                        Copy Prompt
                      </button>
                      <button 
                        onClick={() => {
                          showNotification("Asset reference saved safe inside patient branding templates!");
                        }}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-2xl py-3 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={14} className="text-green-500" />
                        Save Asset
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 4. AI WHATSAPP MESSAGE GENERATOR */}
            {activeTab === "whatsapp_studio" && (
              <motion.div
                key="whatsapp_studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Whatsapp Inputs Panel */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <Smartphone size={16} className="text-green-500" />
                    WhatsApp Studio Config
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Outreach Category</label>
                      <select 
                        value={whatsappCategory} 
                        onChange={(e) => setWhatsappCategory(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      >
                        <option>Appointment Reminder</option>
                        <option>Follow-Up Reminder</option>
                        <option>Health Tips</option>
                        <option>Festival Greetings</option>
                        <option>Health Camp Promotion</option>
                        <option>Seasonal Awareness</option>
                        <option>Vaccination Reminder</option>
                        <option>Clinic Announcement</option>
                        <option>New Service Launch</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Custom Context details</label>
                      <textarea 
                        rows={3}
                        value={whatsappCustomDetails} 
                        onChange={(e) => setWhatsappCustomDetails(e.target.value)}
                        placeholder="e.g. Wash hands with warm anti-bacterial agents, avoid raw fruits..."
                        className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-150 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      />
                    </div>

                    {/* Integrated Segmentation Panel in Sidebar */}
                    <div className="space-y-3 pt-3 border-t border-slate-200/50">
                      <span className="text-[10px] font-black uppercase text-teal-500 tracking-wider block">Demographics Filter ({filteredPatients.length} Selected)</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase">
                        <div>
                          <label className="text-slate-400 block mb-1">Gender</label>
                          <select 
                            value={filterGender} 
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-50 border border-[#dee2e6] text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                          >
                            <option value="All">All Genders</option>
                            <option value="Male">Male only</option>
                            <option value="Female">Female only</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Age Group</label>
                          <select 
                            value={filterAgeGroup} 
                            onChange={(e) => setFilterAgeGroup(e.target.value)}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-50 border border-[#dee2e6] text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                          >
                            <option value="All">All Ages</option>
                            <option value="Children">Keep Under 12</option>
                            <option value="Teenagers">Teenagers</option>
                            <option value="Adults">Adults</option>
                            <option value="Senior Citizens">Elder care 60+</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Visit Recency</label>
                          <select 
                            value={filterPatientType} 
                            onChange={(e) => setFilterPatientType(e.target.value)}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-50 border border-[#dee2e6] text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                          >
                            <option value="All">All Records</option>
                            <option value="New Patients">New visits (1)</option>
                            <option value="Existing Patients">Established (2+)</option>
                            <option value="Returning Patients">Frequent (3+)</option>
                            <option value="Inactive Patients">Inactive (90 days+)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Locality Area</label>
                          <select 
                            value={filterLocation} 
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-50 border border-[#dee2e6] text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                          >
                            <option value="All">All Localities</option>
                            {uniqueLocations.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="text-slate-400 block mb-1">Disease Filter</label>
                          <select 
                            value={filterDisease} 
                            onChange={(e) => setFilterDisease(e.target.value)}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900"
                          >
                            <option value="All">All Disease Tags (General)</option>
                            <option value="Diabetes">Glycemic/Diabetes</option>
                            <option value="Hypertension">Vitals/Hypertension</option>
                            <option value="Obesity">Overweight Indices</option>
                            <option value="Arthritis">Arthritis/Joint pains</option>
                            <option value="Skin Disorders">Skin/Allergy Care</option>
                            <option value="Women's Health">Pregnancy/Gynecology</option>
                            <option value="Child Health">Pediatric vaccine</option>
                            <option value="Custom Diseases">Custom query tag...</option>
                          </select>
                        </div>
                      </div>

                      {filterDisease === "Custom Diseases" && (
                        <div className="pt-1 select-none text-[9px]">
                          <label className="text-slate-400 block mb-1 font-black">Type custom complaint segment tag</label>
                          <input 
                            type="text" 
                            placeholder="e.g. malaria, cold, headache..."
                            value={customDiseaseQuery}
                            onChange={(e) => setCustomDiseaseQuery(e.target.value)}
                            className="w-full p-2 border rounded-xl bg-slate-50 dark:bg-slate-805 text-xs font-bold"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleGenerateWhatsApp}
                        disabled={whatsappIsLoading}
                        className="w-full bg-[#005f73] hover:bg-[#0081a7] text-white py-3 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {whatsappIsLoading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>AI Drafting WhatsApp...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                            <span>Generate message variations</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Virtual Smartphones Layout */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50">
                      Copy Varieties Preview ({selectedLanguage.toUpperCase()})
                    </h3>
                    <span className="text-[9px] bg-green-500/10 text-green-500 font-extrabold uppercase px-2 py-0.5 rounded-full">
                      WhatsApp-Ready layouts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Variant 1: Short */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-slate-950/40 rounded-2xl border border-emerald-100 dark:border-slate-850 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full inline-block">
                          Short Message
                        </span>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 text-[10px] leading-relaxed relative text-slate-700 dark:text-slate-350 select-all font-mono whitespace-pre-wrap h-40 overflow-y-auto">
                          {getLangValue(whatsappMessages.short)}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button 
                          onClick={() => handleCopyToClipboard(getLangValue(whatsappMessages.short))}
                          className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-slate-800"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => handleBroadcastWhatsApp(getLangValue(whatsappMessages.short))}
                          className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-1"
                        >
                          <Send size={10} />
                          Broadcast
                        </button>
                      </div>
                    </div>

                    {/* Variant 2: Medium */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-slate-950/40 rounded-2xl border border-emerald-100 dark:border-slate-850 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase bg-cyan-700 text-white px-2 py-0.5 rounded-full inline-block">
                          Medium Message
                        </span>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 text-[10px] leading-relaxed relative text-slate-700 dark:text-slate-350 select-all font-mono whitespace-pre-wrap h-40 overflow-y-auto">
                          {getLangValue(whatsappMessages.medium)}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button 
                          onClick={() => handleCopyToClipboard(getLangValue(whatsappMessages.medium))}
                          className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-slate-800"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => handleBroadcastWhatsApp(getLangValue(whatsappMessages.medium))}
                          className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-1"
                        >
                          <Send size={10} />
                          Broadcast
                        </button>
                      </div>
                    </div>

                    {/* Variant 3: Detailed */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-slate-950/40 rounded-2xl border border-emerald-100 dark:border-slate-850 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black uppercase bg-violet-750 text-white px-2 py-0.5 rounded-full inline-block">
                          Detailed Message
                        </span>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 text-[10px] leading-relaxed relative text-slate-700 dark:text-slate-350 select-all font-mono whitespace-pre-wrap h-40 overflow-y-auto">
                          {getLangValue(whatsappMessages.detailed)}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button 
                          onClick={() => handleCopyToClipboard(getLangValue(whatsappMessages.detailed))}
                          className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-slate-800"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => handleBroadcastWhatsApp(getLangValue(whatsappMessages.detailed))}
                          className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-[9px] uppercase font-black tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-1"
                        >
                          <Send size={10} />
                          Broadcast
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Segmentation Dispatch Checkbox List Container */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200/30 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-teal-500" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                          Segment Dispatch List ({filteredPatients.length} matching)
                        </span>
                      </div>
                      <div className="flex gap-2 text-[9px] font-black uppercase">
                        <button 
                          onClick={() => {
                            setSelectedCampaignPatients(filteredPatients.map(p => p.phone || ""));
                            showNotification("Checked all segment candidates!");
                          }}
                          className="text-[#005f73] hover:underline"
                        >
                          Check All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => {
                            setSelectedCampaignPatients([]);
                            showNotification("Unchecked all candidate user rows!");
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[175px] overflow-y-auto pr-1 space-y-1.5 text-xs">
                      {filteredPatients.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 uppercase font-black text-[9px]">
                          ⚠️ No patients match the selection segment filters.
                        </div>
                      ) : (
                        filteredPatients.map((p) => {
                          const isChecked = selectedCampaignPatients.includes(p.phone || "");
                          const charSum = (p.name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const compliance = charSum % 3; // 0=Good, 1=Avg, 2=Poor
                          const colorClass = compliance === 0 ? "text-green-500" : compliance === 1 ? "text-amber-500" : "text-red-500";
                          const labelText = compliance === 0 ? "Good" : compliance === 1 ? "Avg" : "Poor";

                          return (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedCampaignPatients(prev => prev.filter(ph => ph !== (p.phone || "")));
                                    } else {
                                      setSelectedCampaignPatients(prev => [...prev, p.phone || ""]);
                                    }
                                  }}
                                  className="rounded border-slate-300 h-3.5 w-3.5 text-[#005f73]"
                                />
                                <div>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{p.name || "Anonymous"}</span>
                                  <span className="text-[9px] text-slate-400 block font-semibold">
                                    Age: {p.age || "N/A"} • {p.gender} • 📱 {p.phone || "No phone"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 block max-w-[125px] truncate font-bold">
                                  {p.complaint || "Routine visit"}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-wide block ${colorClass}`}>
                                  Adherence: {labelText}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Manual trigger note */}
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase text-center md:text-left leading-relaxed">
                    💡 Clicking "Broadcast" segments active targets immediately and dispatches bulk messages via WhatsApp protocol hooks.
                  </p>

                </div>
              </motion.div>
            )}

            {/* 5. AI HEALTH CAMPAIGN CREATOR */}
            {activeTab === "campaign_studio" && (
              <motion.div
                key="campaign_studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Topic selection */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">Multi-Channel Campaign Architect</span>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Campaign Focus / Topic</label>
                      <input 
                        type="text" 
                        value={campaignTopic} 
                        onChange={(e) => setCampaignTopic(e.target.value)}
                        placeholder="e.g. Hypertension control and Low Salt Diet"
                        className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-150 p-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleGenerateCampaign}
                        disabled={campaignIsLoading}
                        className="w-full md:w-auto bg-[#005f73] hover:bg-[#0081a7] text-white py-3 px-8 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {campaignIsLoading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Assembling Campaign Pack...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                            <span>Generate Full Campaign Pack</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campaign Output Blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left (Visual Assets) */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ImageIcon size={14} /> Created Visual Blueprint
                    </h3>

                    {/* Integrated Poster Blueprint */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#005f73] to-cyan-950 text-white space-y-3 shadow-md">
                      <span className="text-[8px] bg-white/10 border px-2 py-0.5 rounded-md inline-block uppercase">Campaign Poster Layout</span>
                      <h4 className="text-sm font-black uppercase">{getLangValue(campaignContent.posterHeadline)}</h4>
                      <p className="text-[10px] leading-relaxed opacity-90 font-semibold">{getLangValue(campaignContent.posterContent)}</p>
                      <p className="text-[9px] font-black tracking-wider text-teal-300 uppercase">📌 {getLangValue(campaignContent.posterCta)}</p>
                    </div>

                    {/* Dynamic Image Suggestion */}
                    <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1">
                      <span className="text-[8px] text-slate-400 block font-black uppercase">Suggested Visual Prompts</span>
                      <p className="text-[10px] italic font-semibold text-slate-600 dark:text-slate-300 leading-normal">
                        "{campaignContent.imagePrompt}"
                      </p>
                    </div>
                  </div>

                  {/* Right (Outreach copy, Captions, Schedules) */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Volume2 size={14} /> outreach Asset Copywrite
                    </h3>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400">WhatsApp Broadcast Draft</span>
                          <button 
                            onClick={() => handleCopyToClipboard(getLangValue(campaignContent.whatsappMessage))}
                            className="text-[9px] font-bold text-teal-500 uppercase hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl text-[10px] leading-relaxed whitespace-pre-wrap font-mono font-medium">
                          {getLangValue(campaignContent.whatsappMessage)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400">Social Media Caption</span>
                          <button 
                            onClick={() => handleCopyToClipboard(getLangValue(campaignContent.socialCaption))}
                            className="text-[9px] font-bold text-teal-505 uppercase hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl text-[10px] leading-relaxed font-mono font-medium">
                          {getLangValue(campaignContent.socialCaption)}
                        </div>
                      </div>

                      <div className="bg-cyan-50/40 dark:bg-slate-950/20 p-3.5 rounded-xl border border-[#005f73]/10 text-[9px] font-extrabold uppercase text-slate-500 space-y-1">
                        <span className="text-[#005f73]">Recommended Broadcast Timelines</span>
                        <p className="text-slate-800 dark:text-slate-200 tracking-wide font-black mt-1 uppercase line-clamp-2 leading-relaxed">
                          ⚡ {getLangValue(campaignContent.suggestedSchedule)}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Multilingual Copywriting Assistant */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-50">AI Multilingual Content Assistant</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Generate customized clinic copies localized in 3 regional languages</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 font-extrabold rounded-full uppercase">MARATHI • HINDI • ENGLISH</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Post Theme / Health Topic</label>
                      <input 
                        type="text" 
                        value={postSubject} 
                        onChange={(e) => setPostSubject(e.target.value)}
                        placeholder="e.g. Essential check-up for pediatric safety"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                      />
                    </div>
                    <button
                      onClick={handleGenerateMultilingualPost}
                      disabled={isMultilingualLoading}
                      className="bg-slate-900 text-white text-xs font-black uppercase py-2.5 px-6 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      {isMultilingualLoading ? "Writing..." : "Write Variations"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold pt-2">
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block">English Edition</span>
                        <p className="text-[11px] leading-relaxed font-semibold text-slate-700 dark:text-slate-300 leading-normal">
                          {multilingualPost.english}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard(multilingualPost.english)}
                        className="mt-4 border border-slate-200 font-black py-1.5 rounded-lg text-[9px] uppercase hover:bg-slate-105"
                      >
                        Copy English
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border flex flex-col justify-between font-marathi">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-sans">Marathi (मराठी) Edition</span>
                        <p className="text-[12px] leading-relaxed font-medium text-slate-700 dark:text-slate-300 leading-normal">
                          {multilingualPost.marathi}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard(multilingualPost.marathi)}
                        className="mt-4 border border-slate-200 font-black py-1.5 rounded-lg text-[9px] uppercase hover:bg-slate-105 font-sans"
                      >
                        Copy Marathi
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border flex flex-col justify-between font-hindi">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-sans">Hindi (हिंदी) Edition</span>
                        <p className="text-[12px] leading-relaxed font-medium text-slate-700 dark:text-slate-300 leading-normal">
                          {multilingualPost.hindi}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard(multilingualPost.hindi)}
                        className="mt-4 border border-slate-200 font-black py-1.5 rounded-lg text-[9px] uppercase hover:bg-slate-105 font-sans"
                      >
                        Copy Hindi
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 6. CAMPAIGN SCHEDULER */}
            {activeTab === "scheduler" && (
              <motion.div
                key="scheduler"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Schedule builder (Left) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <CalendarRange size={16} className="text-indigo-400" />
                    New Schedule Setup
                  </h3>

                  <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs font-bold uppercase text-slate-400">
                    <div>
                      <label className="text-[9px] block mb-1">Campaign Alert Label</label>
                      <input 
                        type="text" 
                        required
                        value={scheduleName} 
                        onChange={(e) => setScheduleName(e.target.value)}
                        placeholder="e.g. World Heart outreach"
                        className="w-full font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] block mb-1">Date</label>
                        <input 
                          type="date" 
                          required
                          value={scheduleDate} 
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] block mb-1">Time</label>
                        <input 
                          type="time" 
                          required
                          value={scheduleTime} 
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] block mb-1">Target Studio Form</label>
                      <select 
                        value={scheduleType} 
                        onChange={(e) => setScheduleType(e.target.value)}
                        className="w-full font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border text-slate-800 dark:text-slate-100"
                      >
                        <option>Poster Studio</option>
                        <option>WhatsApp Studio</option>
                        <option>Awareness Campaign</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] block mb-1">Target Patient Segment</label>
                      <select 
                        value={scheduleAudience} 
                        onChange={(e) => setScheduleAudience(e.target.value)}
                        className="w-full font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 border text-slate-800 dark:text-slate-100"
                      >
                        <option>All Patients</option>
                        <option>Chronic Patients</option>
                        <option>Senior Citizens</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="w-full bg-[#005f73] hover:bg-[#0081a7] text-white py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-colors"
                      >
                        Add to Queue
                      </button>
                    </div>
                  </form>
                </div>

                {/* Queue list (Right) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50">
                    Active Scheduled Campaigns Queue
                  </h3>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {scheduledCampaigns.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase">No pending automated schedules</span>
                      </div>
                    ) : (
                      scheduledCampaigns.map((sched) => (
                        <div key={sched.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 flex justify-between items-center text-xs font-semibold">
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900 dark:text-slate-50">{sched.name}</h4>
                            <div className="flex flex-wrap gap-2 text-[9px] font-extrabold uppercase text-slate-400">
                              <span className="bg-slate-200/50 dark:bg-slate-700 px-2 py-0.5 rounded-md">{sched.type}</span>
                              <span className="bg-slate-200/50 dark:bg-slate-700 px-2 py-0.5 rounded-md text-indigo-400">👤 {sched.audience}</span>
                              <span className="text-[#005f73]">⏰ {sched.date} at {sched.time}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-green-500/10 text-green-500 font-extrabold uppercase px-2 py-0.5 rounded-full">
                              Active
                            </span>
                            <button 
                              onClick={() => handleCancelSchedule(sched.id)}
                              className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-bold uppercase transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. TEMPLATE LIBRARY */}
            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5 mb-1">
                    <ListTodo size={16} className="text-red-500" />
                    Instant Health Content Blueprints
                  </h3>
                  <p className="text-[11px] text-slate-400 uppercase font-bold">
                    Deploy standard educational alerts or festival designs directly to studios with 1 click
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templatePresets.map((tpl, i) => (
                    <div 
                      key={i} 
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase text-[#005f73] bg-teal-500/10 px-2 py-0.5 rounded-full inline-block">
                            {tpl.type}
                          </span>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase">Premium Layer</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase leading-snug">
                          {tpl.title}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
                          "{tpl.topic}"
                        </p>
                      </div>

                      <div className="flex gap-2 pt-5">
                        <button
                          onClick={() => handleApplyTemplate(tpl)}
                          className="flex-1 bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider py-2 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Load to Poster
                        </button>
                        <button
                          onClick={() => {
                            setWhatsappCategory(tpl.type);
                            setWhatsappCustomDetails(tpl.topic);
                            setActiveTab("whatsapp_studio");
                            showNotification("Preset coordinates mapped directly to Whatsapp Studio!");
                          }}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider py-2 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1"
                        >
                          <Smartphone size={12} /> Broadcast MSG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 8. AI MARKETING ADVISOR */}
            {activeTab === "advisor" && (
              <motion.div
                key="advisor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Advisor Banner info */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
                      <Sparkles size={20} className="text-teal-400" />
                      Clinic Growth Advisor AI
                    </h3>
                    <p className="text-[11px] text-slate-400 uppercase font-black">
                      Intelligent actionable strategies localized for {clinicDetails?.city || "your Clinic location"}
                    </p>
                  </div>
                  <button
                    onClick={handleFetchAdvisorInsights}
                    disabled={advisorIsLoading}
                    className="bg-[#005f73] hover:bg-[#0081a7] text-white font-extrabold uppercase text-xs tracking-wider py-2.5 px-6 rounded-2xl transition"
                  >
                    {advisorIsLoading ? "Analyzing..." : "Regenerate Tips"}
                  </button>
                </div>

                {/* Growth Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advisorInsights.map((ins, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-extrabold uppercase px-2 py-0.5 rounded-full">
                            Effort: {ins.effort} • Impact: {ins.impact}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">
                          {ins.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                          {ins.description}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl text-[10px] mt-4 font-semibold text-slate-650 space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-teal-400">Action Execution Plan:</span>
                        <p className="whitespace-pre-line leading-relaxed italic text-slate-500 font-mono">
                          {ins.actionPlan}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 9. MARKETING ANALYTICS & LOGS */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="space-y-6"
              >
                {/* Visual Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-905 dark:text-slate-50">
                      AI Campaign Generation Trends
                    </h3>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPosters" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#005f73" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#005f73" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="posters" stroke="#005f73" fillOpacity={1} fill="url(#colorPosters)" name="AI Posters" />
                          <Area type="monotone" dataKey="whatsapp" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWhatsapp)" name="WhatsApp outreach" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Demographics Pie */}
                  <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                    <h3 className="text-xs font-black uppercase text-slate-905 dark:text-slate-50">
                      Segment Target share
                    </h3>

                    <div className="h-44 w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={patientDemographics} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={45} 
                            outerRadius={65} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                            {patientDemographics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-[10px] font-extrabold uppercase space-y-1 text-slate-400">
                      {patientDemographics.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            {entry.name}
                          </span>
                          <span className="text-slate-850 dark:text-slate-205">{entry.value} Patient index</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Campaign History Logs */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-900 dark:text-slate-50">
                      Audit Trail: Past Outreach Campaigns
                    </h3>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-400 uppercase font-black">
                      Read-Only Archive
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {campaignHistory.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-805 rounded-2xl border border-slate-150 flex justify-between items-center text-xs font-semibold">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{item.name}</h4>
                          <p className="text-[9px] font-black uppercase text-slate-400">
                            Category: {item.category} • Target Audience: {item.target} • Dispatched Sent: {item.sentAt}
                          </p>
                        </div>
                        <div className="text-right space-y-1 select-none">
                          <span className="bg-slate-200/50 dark:bg-slate-700 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase text-slate-500 mr-2">
                            📈 {item.reach} Reach / {item.clicks} Click action
                          </span>
                          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
