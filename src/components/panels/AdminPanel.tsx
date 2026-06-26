import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Hospital as HospitalIcon,
  User as UserMd,
  ArrowLeftRight as ExchangeAlt,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle as ExclamationTriangle,
  Ban,
  Unlock,
  FileSpreadsheet as FileExcel,
  Send,
  ShieldAlert,
  LogOut,
  MapPin,
  Phone,
  Star,
  Zap,
  Crown,
  Shield,
  Clock,
  Activity as Heartbeat,
  ArrowRight,
  Trash2,
  Users,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  X,
  History,
  ClipboardList,
  Home,
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../common/ConfirmationModal";
import PatientAvatar from "../common/PatientAvatar";
import { formatISTDate, formatISTTime, useLiveClock } from "../../utils/dateUtils";
import { safeStringify } from "../../utils/firestoreErrorHandler";

import { firebaseService } from "../../services/firebaseService";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

interface AdminPanelProps {
  user: any;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function AdminPanel({
  user,
  onLogout,
  darkMode: isDarkMode,
  setDarkMode: setIsDarkMode,
}: AdminPanelProps) {
  const currentTime = useLiveClock();
  const [activeTab, setActiveTab] = useState("approvals");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [hospDetails, setHospDetails] = useState<Record<string, any>>({});
  const [clinicDetails, setClinicDetails] = useState<Record<string, any>>({});
  const [referrals, setReferrals] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [notifForm, setNotifForm] = useState({
    recipient: "all",
    title: "",
    content: "",
  });

  const unreadCount = useMemo(() => {
    return messages.filter(
      (m) =>
        (m.receiverId === user.id || m.receiverId === "admin") && !m.isRead,
    ).length;
  }, [messages, user.id]);

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      (m) =>
        (m.receiverId === user.id || m.receiverId === "admin") && !m.isRead,
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
    if (activeTab === "notifs") {
      markMessagesAsRead();
    }
  }, [activeTab]);

  const [referralView, setReferralView] = useState("active"); // "active" (24h) or "history"
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [hospSearch, setHospSearch] = useState("");
  const [clinicSearch, setClinicSearch] = useState("");

  useEffect(() => {
    setLoading(true);

    // Subscriptions for real-time updates
    const unsubUsers = firebaseService.subscribeToCollection(
      "users",
      (data) => {
        setHospitals(data.filter((u) => u.role === "hospital"));
        setClinics(data.filter((u) => u.role === "clinic"));
        setPatients(data.filter((u) => u.role === "patient"));
        setPendingApprovals(data.filter((u) => u.status === "pending"));
      },
    );

    const unsubAppointments = firebaseService.subscribeToCollection(
      "appointments",
      (data) => {
        setAppointments(
          data.sort((a, b) => {
            const dateA =
              a.createdAt?.seconds ||
              (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
            const dateB =
              b.createdAt?.seconds ||
              (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
            return dateB - dateA;
          }),
        );
      },
    );

    const unsubHospDetails = firebaseService.subscribeToCollection(
      "hospital_details",
      (details) => {
        const detailsMap = details.reduce((acc: any, d) => {
          const { id, ...rest } = d;
          acc[d.userId] = { ...rest, hospitalDetailId: id };
          return acc;
        }, {});
        setHospDetails(detailsMap);
      },
    );

    const unsubClinicDetails = firebaseService.subscribeToCollection(
      "clinic_details",
      (details) => {
        const detailsMap = details.reduce((acc: any, d) => {
          const { id, ...rest } = d;
          acc[d.userId] = { ...rest, clinicDetailId: id };
          return acc;
        }, {});
        setClinicDetails(detailsMap);
      },
    );

    const unsubReferrals = firebaseService.subscribeToCollection(
      "referrals",
      (data) => {
        const sorted = [...data].sort((a, b) => {
          const dateA =
            a.createdAt?.seconds ||
            (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
          const dateB =
            b.createdAt?.seconds ||
            (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
          return dateB - dateA;
        });
        setReferrals(sorted);
      },
    );

    const unsubMessages = firebaseService.subscribeToCollection(
      "messages",
      (data) => {
        setMessages(
          data.filter(
            (m) =>
              m.receiverId === user.id ||
              m.senderId === user.id ||
              m.receiverId === "admin",
          ),
        );
      },
    );

    setLoading(false);

    return () => {
      unsubUsers();
      unsubHospDetails();
      unsubClinicDetails();
      unsubReferrals();
      unsubMessages();
      unsubAppointments();
    };
  }, [user.id]);

  // Merged data for rendering
  const mergedHospitals = useMemo(() => {
    return hospitals
      .map((h) => ({ ...h, ...(hospDetails[h.id] || {}) }))
      .filter(
        (h) =>
          !hospSearch ||
          h.name?.toLowerCase().includes(hospSearch.toLowerCase()) ||
          h.city?.toLowerCase().includes(hospSearch.toLowerCase()) ||
          h.username?.toLowerCase().includes(hospSearch.toLowerCase()),
      );
  }, [hospitals, hospDetails, hospSearch]);

  const mergedClinics = useMemo(() => {
    return clinics
      .map((c) => ({ ...c, ...(clinicDetails[c.id] || {}) }))
      .filter(
        (c) =>
          !clinicSearch ||
          c.name?.toLowerCase().includes(clinicSearch.toLowerCase()) ||
          c.city?.toLowerCase().includes(clinicSearch.toLowerCase()) ||
          c.username?.toLowerCase().includes(clinicSearch.toLowerCase()),
      );
  }, [clinics, clinicDetails, clinicSearch]);
  const mergedPendingApprovals = useMemo(
    () =>
      pendingApprovals.map((a) => {
        const details =
          a.role === "hospital" ? hospDetails[a.id] : clinicDetails[a.id];
        return { ...a, ...(details || {}) };
      }),
    [pendingApprovals, hospDetails, clinicDetails],
  );

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
        String(ref.hospitalName || "")
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

  const handleStatusUpdate = async (id: string, status: string) => {
    const action = status === "blocked" ? "block" : "unblock";

    setConfirmModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
      message: `Are you sure you want to ${action} this user? They will ${status === "blocked" ? "no longer" : "now"} be able to access the platform.`,
      type: status === "blocked" ? "danger" : "warning",
      onConfirm: async () => {
        try {
          await firebaseService.updateDocument("users", id, { status });
        } catch (err) {
          alert("Error updating status");
        }
      },
    });
  };

  const handleTierUpdate = async (
    userId: string,
    tier: string,
    role: "hospital" | "clinic" = "hospital",
  ) => {
    setConfirmModal({
      isOpen: true,
      title: `Change ${role.charAt(0).toUpperCase() + role.slice(1)} Ranking?`,
      message: `Are you sure you want to change this ${role}'s ranking to ${tier.toUpperCase()}? This will affect its position in the search results.`,
      type: "info",
      onConfirm: async () => {
        try {
          const collectionName =
            role === "hospital" ? "hospital_details" : "clinic_details";
          const q = query(
            collection(db, collectionName),
            where("userId", "==", userId),
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            await firebaseService.updateDocument(
              collectionName,
              snap.docs[0].id,
              { tier },
            );
            // Also update the users collection for consistency and UI updates in other panels
            await firebaseService.updateDocument("users", userId, { tier });
          }
        } catch (err) {
          alert("Error updating tier");
        }
      },
    });
  };

  const handleRatingUpdate = async (userId: string, rating: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Change Clinic Rating?",
      message: `Are you sure you want to change this clinic's rating to ${rating} stars?`,
      type: "info",
      onConfirm: async () => {
        try {
          const details = clinicDetails[userId];

          if (details?.clinicDetailId) {
            await firebaseService.updateDocument(
              "clinic_details",
              details.clinicDetailId,
              {
                rating: Number(rating),
                updatedAt: serverTimestamp(),
              },
            );
          } else {
            // Create new details if they don't exist
            await firebaseService.addDocument("clinic_details", {
              userId,
              rating: Number(rating),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          alert("Rating updated successfully!");
        } catch (err) {
          console.error("Error updating rating:", safeStringify(err));
          alert("Error updating rating");
        }
      },
    });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.content) return;
    try {
      const isIndividual = !["all", "hospital", "clinic"].includes(
        String(notifForm.recipient || ""),
      );

      if (isIndividual) {
        const recipientUser = [...hospitals, ...clinics].find(
          (u) => String(u.id) === notifForm.recipient,
        );
        await firebaseService.addDocument("messages", {
          senderId: user.id,
          senderName: user.name,
          receiverId: notifForm.recipient,
          receiverName: recipientUser?.name || "Unknown",
          title: notifForm.title,
          content: notifForm.content,
          isRead: false,
        });
      } else {
        // Broadcast to roles or all
        const usersSnap = await getDocs(collection(db, "users"));
        const recipients = usersSnap.docs.filter((uDoc) => {
          const uData = uDoc.data();
          if (notifForm.recipient === "all") return true;
          return uData.role === notifForm.recipient;
        });

        const promises = recipients.map((rDoc) => {
          const uData = rDoc.data();
          return firebaseService.addDocument("messages", {
            senderId: user.id,
            senderName: user.name,
            receiverId: rDoc.id,
            receiverName: uData.name || "Unknown",
            recipient_role: notifForm.recipient, // Keep this for history filtering
            title: notifForm.title,
            content: notifForm.content,
            isRead: false,
          });
        });
        await Promise.all(promises);
      }

      alert("Message sent!");
      setNotifForm({ ...notifForm, title: "", content: "" });
    } catch (err) {
      alert("Error sending message");
    }
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

  const handleApproval = async (id: string, status: "active" | "rejected") => {
    try {
      await firebaseService.updateDocument("users", id, { status });

      // Send notification via messages
      await firebaseService.addDocument("messages", {
        senderId: "admin",
        senderName: "Carebridge+ Admin",
        receiverId: id,
        title: status === "active" ? "Account Approved" : "Account Rejected",
        content:
          status === "active"
            ? "Welcome to Carebridge+! Your account has been approved. You can now access all features."
            : "We're sorry, but your account registration has been rejected. Please contact support for more information.",
        isRead: false,
      });
    } catch (err) {
      alert("Error processing approval");
    }
  };

  const handleReply = (msg: any) => {
    setNotifForm({
      recipient: String(msg.senderId || ""),
      title: `Re: ${msg.title}`,
      content: "",
    });
    const formElement = document.getElementById("broadcast-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  const menuItems = [
    { id: "home", icon: LayoutDashboard, label: "Dashboard" },
    { id: "approvals", icon: ShieldCheck, label: "Panel Approvals" },
    { id: "hospitals", icon: HospitalIcon, label: "Hospital Management" },
    { id: "clinics", icon: UserMd, label: "Clinic Management" },
    { id: "patients", icon: Users, label: "Public User List" },
    { id: "referrals", icon: ExchangeAlt, label: "Active Referral" },
    { id: "history", icon: History, label: "Referral History" },
    { id: "opd_history", icon: ClipboardList, label: "Opd History" },
    { id: "notifs", icon: Bell, label: "Notification" },
  ];

  const bottomNavItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "menu", icon: Menu, label: "Menu" },
    { id: "hospitals", icon: HospitalIcon, label: "Hospital" },
    { id: "clinics", icon: UserMd, label: "Clinic" },
    { id: "patients", icon: Users, label: "Public User" },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-[#F5F7FA]"} flex`}
    >
      {/* Sidebar */}
      <aside
        style={{ height: "100dvh", display: "flex", flexDirection: "column" }}
        className={`fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? "bg-gray-900 border-r border-white/10" : "bg-white"} shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 shrink-0">
            <h1 className="text-2xl font-black italic tracking-tighter">
              <span className="text-[#99CC00]">Carebridge</span>
              <span
                className={`${isDarkMode ? "text-white" : "text-[#87CEEB]"}`}
              >
                +
              </span>
            </h1>
            <p
              className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-widest mt-1`}
            >
              Admin Control
            </p>
          </div>

          <nav
            style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
            className="flex-1 px-4 space-y-1"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "history") setReferralView("history");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === item.id ||
                  (item.id === "history" &&
                    activeTab === "referrals" &&
                    referralView === "history")
                    ? "bg-[#005f73] text-white shadow-lg shadow-[#005f73]/20"
                    : isDarkMode
                      ? "text-gray-400 hover:bg-white/5 hover:text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#005f73]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-white/10 shrink-0">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md shadow-red-600/25"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header
          className={`sticky top-0 z-40 ${isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} border-b h-20 flex items-center px-6`}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`lg:hidden p-2 ${isDarkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100"} rounded-lg mr-4`}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1">
            <h2
              className={`text-lg font-black italic ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              <span className="text-[#99CC00] text-xl">Carebridge</span>
              <span
                className={`${isDarkMode ? "text-white" : "text-[#87CEEB] text-xl"}`}
              >
                +
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-widest`}
              >
                Welcome to Admin Panel
              </span>
              <div
                className={`w-1 h-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"} rounded-full`}
              ></div>
              <span
                className={`text-[10px] font-black ${isDarkMode ? "text-blue-400" : "text-blue-500"} uppercase tracking-widest flex items-center gap-1`}
              >
                <Clock size={10} /> {formatISTDate(currentTime)} |{" "}
                {formatISTTime(currentTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              className={`relative p-2 rounded-xl transition-all ${isDarkMode ? "bg-white/5 text-gray-400 hover:bg-white/10" : "text-gray-400 hover:bg-gray-50"}`}
              onClick={() => setActiveTab("notifs")}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  className={`absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 ${isDarkMode ? "border-gray-950" : "border-white"}`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <div
              className={`h-8 w-px ${isDarkMode ? "bg-white/10" : "bg-gray-100"} mx-2 hidden sm:block`}
            ></div>

            <div
              className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border ${isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50/50 border-blue-100/50"}`}
            >
              <div
                className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg ${isDarkMode ? "" : "shadow-blue-200"}`}
              >
                <ShieldCheck size={18} />
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-[10px] font-black uppercase leading-none mb-1 tracking-tighter ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  Health Trust Icon
                </p>
                <p
                  className={`text-xs font-black uppercase tracking-tighter leading-none ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  Verified Admin
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-28 relative">
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
            <span className="text-[15vw] font-extrabold text-[#99CC00]/5 rotate-[-15deg] whitespace-nowrap select-none">
              Carebridge+
            </span>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* KPI Cards (Only show on dashboard/approvals view) */}
            {(activeTab === "approvals" || activeTab === "home") && (<>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    id: "hospitals",
                    label: "Active Hospitals",
                    value: hospitals.length,
                    icon: HospitalIcon,
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    id: "clinics",
                    label: "Active Clinics",
                    value: clinics.length,
                    icon: UserMd,
                    color: "bg-teal-50 text-teal-600",
                  },
                  {
                    id: "referrals",
                    label: "Active Referrals",
                    value: referrals.filter((r) => r.status === "pending")
                      .length,
                    icon: ExchangeAlt,
                    color: "bg-orange-50 text-orange-600",
                  },
                  {
                    id: "patients",
                    label: "Public Users",
                    value: patients.length,
                    icon: Users,
                    color: "bg-purple-50 text-purple-600",
                  },
                ].map((kpi) => (
                  <motion.div
                    key={kpi.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveTab(kpi.id)}
                    className={`${isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-100 shadow-sm hover:border-blue-200"} p-5 rounded-3xl border cursor-pointer transition-all`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p
                          className={`text-[10px] font-black ${isDarkMode ? "text-gray-500" : "text-gray-400"} uppercase tracking-widest mb-1`}
                        >
                          {kpi.label}
                        </p>
                        <h3
                          className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {kpi.value}
                        </h3>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color} ${isDarkMode ? "opacity-90" : "shadow-inner"}`}
                      >
                        <kpi.icon size={24} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main Command Center Grid (Rectangular Features with Standard Beautiful UI) */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-[#99CC00] rounded-full" />
                  <div>
                    <h4 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                      SYSTEM ADMINISTRATION COMMAND CENTER
                    </h4>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      Direct launchpad for healthcare network operations, status routing & auditing
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Triage & Approvals",
                      description: "Review and onboard pending family clinics and city hospitals smoothly.",
                      tab: "approvals",
                      icon: ShieldCheck,
                      gradient: "from-blue-600 via-indigo-600 to-indigo-700",
                      arrowBg: "bg-indigo-700",
                      badge: "Gateway Node"
                    },
                    {
                      label: "Hospital Fleet Management",
                      description: "Audit certified specialty centers, live bed counts, and coordinate contacts.",
                      tab: "hospitals",
                      icon: HospitalIcon,
                      gradient: "from-cyan-600 via-teal-600 to-emerald-600",
                      arrowBg: "bg-teal-700",
                      badge: `${hospitals.length} Super-Specialties`
                    },
                    {
                      label: "Clinic Consultation Centers",
                      description: "Supervise primary physicians, GPs, practice locations and active chambers.",
                      tab: "clinics",
                      icon: UserMd,
                      gradient: "from-emerald-600 via-teal-500 to-cyan-500",
                      arrowBg: "bg-teal-600",
                      badge: `${clinics.length} Consulting Labs`
                    },
                    {
                      label: "Cross-City Patient Transfers",
                      description: "Orchestrate real-time emergency referrals and companion secondary-care admissions.",
                      tab: "referrals",
                      icon: ExchangeAlt,
                      gradient: "from-amber-600 via-orange-600 to-red-600",
                      arrowBg: "bg-orange-700",
                      badge: "Live Transfers"
                    },
                    {
                      label: "Global Citizen Indexes",
                      description: "Access registered public demographics, emergency cards, and general user pools.",
                      tab: "patients",
                      icon: Users,
                      gradient: "from-purple-600 via-pink-600 to-indigo-600",
                      arrowBg: "bg-pink-700",
                      badge: `${patients.length} Registered Pulses`
                    },
                    {
                      label: "Referral Case Archive",
                      description: "Query completed treatment files, patient historical vitals, and discharge notes.",
                      tab: "referrals",
                      onClick: () => {
                        setReferralView("history");
                      },
                      icon: History,
                      gradient: "from-violet-600 via-purple-600 to-indigo-700",
                      arrowBg: "bg-purple-700",
                      badge: "Historical Ledger"
                    },
                    {
                      label: "Clinical OPD Logbooks",
                      description: "Monitor doctor e-prescription files, diagnostic registries, and OPD schedules.",
                      tab: "opd_history",
                      icon: ClipboardList,
                      gradient: "from-rose-600 via-red-600 to-orange-600",
                      arrowBg: "bg-red-700",
                      badge: "Live Registers"
                    },
                    {
                      label: "Direct System Broadcasting",
                      description: "Broadcast instant emergency alerts, critical city schedules, or dynamic system updates.",
                      tab: "notifs",
                      icon: Bell,
                      gradient: "from-yellow-600 via-amber-500 to-orange-500",
                      arrowBg: "bg-orange-600",
                      badge: "Notif Deck"
                    }
                  ].map((srv, index) => (
                    <motion.div
                      key={`admin-srv-${index}`}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(srv.tab);
                        if (srv.onClick) srv.onClick();
                      }}
                      className={`group p-5 rounded-[2rem] border cursor-pointer relative flex items-center justify-between gap-4 transition-all duration-300 ${
                        isDarkMode 
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
                          <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {srv.label}
                          </h4>
                          <p className={`text-[10px] font-medium leading-relaxed mt-1 line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                            {srv.description}
                          </p>
                          {srv.badge && (
                            <span className={`inline-block mt-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isDarkMode ? "bg-white/5 text-slate-300" : "bg-gray-100 text-gray-600"
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
            </>)}

            <AnimatePresence mode="wait">
              {activeTab === "approvals" && (
                <motion.div
                  key="approvals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md p-6 rounded-3xl border`}
                  >
                    <h6
                      className={`font-extrabold text-[10px] uppercase tracking-wider mb-6 border-b pb-4 ${isDarkMode ? "text-blue-400 border-white/5" : "text-[#005f73] border-gray-50"}`}
                    >
                      New Hospital Registrations
                    </h6>
                    <div className="space-y-4">
                      {mergedPendingApprovals
                        .filter((u) => u.role === "hospital")
                        .map((u, index) => (
                          <div
                            key={`hosp-pending-${u.id}-${index}`}
                            className={`p-4 rounded-2xl border ${isDarkMode ? "bg-gray-800 border-white/10" : "bg-gray-50 border-gray-100"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div
                                  className={`font-extrabold ${isDarkMode ? "text-blue-100" : "text-gray-900"}`}
                                >
                                  {u.name}
                                </div>
                                <div
                                  className={`text-[10px] font-bold uppercase ${isDarkMode ? "text-gray-300" : "text-gray-400"}`}
                                >
                                  {u.city}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproval(u.id, "active")}
                                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleApproval(u.id, "rejected")
                                  }
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </div>
                            <div
                              className={`grid grid-cols-2 gap-2 text-[10px] font-bold border-t pt-2 mt-2 ${isDarkMode ? "text-gray-500 border-white/5" : "text-gray-500 border-gray-200"}`}
                            >
                              <div className="flex items-center gap-1">
                                <Phone size={10} />{" "}
                                {u.hospital_helpline || "N/A"}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={10} />{" "}
                                {u.hospital_address || "N/A"}
                              </div>
                            </div>
                          </div>
                        ))}
                      {mergedPendingApprovals.filter(
                        (u) => u.role === "hospital",
                      ).length === 0 && (
                        <div
                          className={`text-center py-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"} font-bold`}
                        >
                          No pending hospital approvals.
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md p-6 rounded-3xl border`}
                  >
                    <h6
                      className={`font-extrabold text-[10px] uppercase tracking-wider mb-6 border-b pb-4 ${isDarkMode ? "text-emerald-400 border-white/5" : "text-[#005f73] border-gray-50"}`}
                    >
                      New Clinic Registrations
                    </h6>
                    <div className="space-y-4">
                      {mergedPendingApprovals
                        .filter((u) => u.role === "clinic")
                        .map((u, index) => (
                          <div
                            key={`clinic-pending-${u.id}-${index}`}
                            className={`p-4 rounded-2xl border ${isDarkMode ? "bg-gray-800 border-white/10" : "bg-gray-50 border-gray-100"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div
                                  className={`font-extrabold ${isDarkMode ? "text-green-100" : "text-gray-900"}`}
                                >
                                  {u.name}
                                </div>
                                <div
                                  className={`text-[10px] font-bold uppercase ${isDarkMode ? "text-gray-300" : "text-gray-400"}`}
                                >
                                  {u.city}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproval(u.id, "active")}
                                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleApproval(u.id, "rejected")
                                  }
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </div>
                            <div
                              className={`space-y-1 text-[10px] font-bold border-t pt-2 mt-2 ${isDarkMode ? "text-gray-500 border-white/5" : "text-gray-500 border-gray-200"}`}
                            >
                              <div
                                className={`flex items-center gap-1 ${isDarkMode ? "text-emerald-400" : "text-[#005f73]"}`}
                              >
                                <UserMd size={10} /> {u.doctor_name || "N/A"} (
                                {u.qualification || "N/A"})
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone size={10} /> {u.clinic_contact || "N/A"}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={10} /> {u.clinic_address || "N/A"}
                              </div>
                            </div>
                          </div>
                        ))}
                      {mergedPendingApprovals.filter((u) => u.role === "clinic")
                        .length === 0 && (
                        <div
                          className={`text-center py-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"} font-bold`}
                        >
                          No pending clinic approvals.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "hospitals" && (
                <motion.div
                  key="hospitals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div
                    className={`p-4 rounded-2xl shadow-sm border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}
                  >
                    <div className="relative">
                      <Shield
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      />
                      <input
                        type="text"
                        placeholder="Search Hospitals by name, city or username..."
                        value={hospSearch}
                        onChange={(e) => setHospSearch(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl font-bold text-sm outline-hidden ${isDarkMode ? "bg-white/5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/20" : "bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#005f73]/20"}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md rounded-3xl border overflow-hidden`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${isDarkMode ? "bg-white/5" : "bg-gray-50/50"}`}
                        >
                          <tr>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Hospital Name & Address
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Contact Info
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Ranking
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-right ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}
                        >
                          {[...mergedHospitals]
                            .sort((a, b) => {
                              const weights: Record<string, number> = {
                                premium: 3,
                                priority: 2,
                                standard: 1,
                              };
                              return (
                                (weights[b.tier] || 0) - (weights[a.tier] || 0)
                              );
                            })
                            .map((hosp, index) => (
                              <tr
                                key={`${hosp.id}-${index}`}
                                className={`${hosp.status === "blocked" ? (isDarkMode ? "opacity-30 bg-white/5" : "opacity-50 bg-gray-50") : ""}`}
                              >
                                <td className="px-6 py-4">
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {hosp.name}
                                  </div>
                                  <div
                                    className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    <MapPin
                                      size={10}
                                      className="text-red-500"
                                    />{" "}
                                    {hosp.city}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {hosp.helpline}
                                  </div>
                                  <div
                                    className={`${isDarkMode ? "text-emerald-400" : "text-[#005f73]"} text-[10px] font-bold mt-1`}
                                  >
                                    hosp-{hosp.id}@carebridge.com
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`flex items-center gap-1 p-1 rounded-xl border w-fit ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                  >
                                    <button
                                      onClick={() =>
                                        handleTierUpdate(
                                          hosp.id,
                                          "premium",
                                          "hospital",
                                        )
                                      }
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                                        hosp.tier === "premium"
                                          ? "bg-amber-500 text-white shadow-md scale-105"
                                          : `${isDarkMode ? "text-gray-600 hover:text-amber-400 hover:bg-white/5" : "text-gray-400 hover:text-[#005f73] hover:bg-white"}`
                                      }`}
                                      title="Premium Tier"
                                    >
                                      <Crown
                                        size={12}
                                        className={
                                          hosp.tier === "premium"
                                            ? "text-yellow-400"
                                            : ""
                                        }
                                      />
                                      Premium
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleTierUpdate(
                                          hosp.id,
                                          "priority",
                                          "hospital",
                                        )
                                      }
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                                        hosp.tier === "priority"
                                          ? "bg-purple-500 text-white shadow-md scale-105"
                                          : `${isDarkMode ? "text-gray-600 hover:text-purple-400 hover:bg-white/5" : "text-gray-400 hover:text-[#0a9396] hover:bg-white"}`
                                      }`}
                                      title="Priority Tier"
                                    >
                                      <Zap
                                        size={12}
                                        className={
                                          hosp.tier === "priority"
                                            ? "text-yellow-300"
                                            : ""
                                        }
                                      />
                                      Priority
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleTierUpdate(
                                          hosp.id,
                                          "standard",
                                          "hospital",
                                        )
                                      }
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                                        hosp.tier === "standard"
                                          ? "bg-blue-600 text-white shadow-md scale-105"
                                          : `${isDarkMode ? "text-gray-600 hover:text-blue-400 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-white"}`
                                      }`}
                                      title="Standard Tier"
                                    >
                                      <Shield size={12} />
                                      Standard
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    className={`p-2 rounded-lg transition-all ${isDarkMode ? "text-amber-400 hover:bg-amber-400/10" : "text-[#ee9b00] hover:bg-[#ee9b00]/10"}`}
                                    title="Send Warning"
                                  >
                                    <ExclamationTriangle size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        hosp.id,
                                        hosp.status === "active"
                                          ? "blocked"
                                          : "active",
                                      )
                                    }
                                    className={`p-2 rounded-lg transition-all ${hosp.status === "active" ? (isDarkMode ? "text-red-400 hover:bg-red-400/10" : "text-red-500 hover:bg-red-50") : isDarkMode ? "text-green-400 hover:bg-green-400/10" : "text-green-500 hover:bg-green-50"}`}
                                    title={
                                      hosp.status === "active"
                                        ? "Block"
                                        : "Unblock"
                                    }
                                  >
                                    {hosp.status === "active" ? (
                                      <Ban size={18} />
                                    ) : (
                                      <Unlock size={18} />
                                    )}
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

              {activeTab === "clinics" && (
                <motion.div
                  key="clinics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"} p-4 rounded-2xl shadow-sm border`}>
                    <div className="relative">
                      <Shield
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search Clinics by name, city or username..."
                        value={clinicSearch}
                        onChange={(e) => setClinicSearch(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-none rounded-xl font-bold text-sm outline-hidden ${isDarkMode ? "bg-white/5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-[#0a9396]/25" : "bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0a9396]/20"}`}
                      />
                    </div>
                  </div>

                  <div className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md rounded-3xl border overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className={isDarkMode ? "bg-white/5" : "bg-gray-50/50"}>
                          <tr>
                            <th className={`px-6 py-4 text-[10px] font-extrabold ${isDarkMode ? "text-cyan-400" : "text-[#005f73]"} uppercase tracking-wider`}>
                              Clinic & Doctor
                            </th>
                            <th className={`px-6 py-4 text-[10px] font-extrabold ${isDarkMode ? "text-cyan-400" : "text-[#005f73]"} uppercase tracking-wider`}>
                              Contact & Address
                            </th>
                            <th className={`px-6 py-4 text-[10px] font-extrabold ${isDarkMode ? "text-cyan-400" : "text-[#005f73]"} uppercase tracking-wider`}>
                              Rating
                            </th>
                            <th className={`px-6 py-4 text-[10px] font-extrabold ${isDarkMode ? "text-cyan-400" : "text-[#005f73]"} uppercase tracking-wider text-right`}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}>
                          {[...mergedClinics]
                            .sort((a, b) => {
                              const ratingA = a.rating ?? 5;
                              const ratingB = b.rating ?? 5;
                              if (ratingB !== ratingA) {
                                return ratingB - ratingA;
                              }
                              return (a.name || "").localeCompare(b.name || "");
                            })
                            .map((clinic, index) => (
                              <tr
                                key={`${clinic.id}-${index}`}
                                className={
                                  clinic.status === "blocked"
                                    ? "opacity-50 bg-gray-50"
                                    : ""
                                }
                              >
                                <td className="px-6 py-4">
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {clinic.name || "Unnamed Clinic"}
                                  </div>
                                  <div
                                    className={`${isDarkMode ? "text-sky-300" : "text-[#005f73]"} text-[10px] font-bold mt-1`}
                                  >
                                    Dr.{" "}
                                    {String(clinic.name || "").split(" ")[0]} (
                                    {clinic.degree || "N/A"})
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"} text-sm`}
                                  >
                                    9988776655
                                  </div>
                                  <div className="text-gray-400 text-[10px] font-bold mt-1">
                                    {clinic.address}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={clinic.rating || 5}
                                    onChange={(e) =>
                                      handleRatingUpdate(
                                        clinic.id,
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="flex items-center gap-1 bg-[#ee9b00]/10 text-[#ee9b00] px-3 py-1 rounded-lg w-fit font-bold text-xs border border-[#ee9b00]/20 outline-hidden cursor-pointer hover:bg-[#ee9b00]/20 transition-all"
                                  >
                                    {[5, 4, 3, 2, 1].map((star, index) => (
                                      <option
                                        key={`${star}-${index}`}
                                        value={star}
                                      >
                                        {star} ⭐
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    className="p-2 text-[#ee9b00] hover:bg-[#ee9b00]/10 rounded-lg transition-all"
                                    title="Send Warning"
                                  >
                                    <ExclamationTriangle size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        clinic.id,
                                        clinic.status === "active"
                                          ? "blocked"
                                          : "active",
                                      )
                                    }
                                    className={`p-2 rounded-lg transition-all ${clinic.status === "active" ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                    title={
                                      clinic.status === "active"
                                        ? "Block"
                                        : "Unblock"
                                    }
                                  >
                                    {clinic.status === "active" ? (
                                      <Ban size={18} />
                                    ) : (
                                      <Unlock size={18} />
                                    )}
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

              {activeTab === "referrals" && (
                <motion.div
                  key="referrals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReferralView("active")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          referralView === "active"
                            ? isDarkMode
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                              : "bg-[#005f73] text-white shadow-md"
                            : isDarkMode
                              ? "bg-white/5 text-gray-400 border-white/5"
                              : "bg-white text-gray-500 border border-gray-100"
                        }`}
                      >
                        Active (Last 24h)
                      </button>
                      <button
                        onClick={() => setReferralView("history")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          referralView === "history"
                            ? isDarkMode
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                              : "bg-[#005f73] text-white shadow-md"
                            : isDarkMode
                              ? "bg-white/5 text-gray-400 border-white/5"
                              : "bg-white text-gray-500 border border-gray-100"
                        }`}
                      >
                        History
                      </button>
                      <button
                        onClick={() => setReferralView("discharged")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          referralView === "discharged"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                            : isDarkMode
                              ? "bg-white/5 text-gray-400 border-white/5"
                              : "bg-white text-gray-500 border border-gray-100"
                        }`}
                      >
                        Discharged
                      </button>
                    </div>
                    <button
                      className={`px-6 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 ${isDarkMode ? "bg-amber-500 text-black shadow-amber-500/10" : "bg-[#ee9b00] text-white shadow-[#ee9b00]/20"}`}
                    >
                      <FileExcel size={16} /> Export Data
                    </button>
                  </div>

                  {(referralView === "history" ||
                    referralView === "discharged") && (
                    <div
                      className={`${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md p-4 rounded-2xl border space-y-4`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Search by Patient, Clinic, Hospital or Status..."
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          className={`border-none rounded-xl px-4 py-2 text-sm font-bold outline-hidden ${isDarkMode ? "bg-white/5 text-white placeholder:text-gray-600" : "bg-gray-50 text-gray-900"}`}
                        />
                        <input
                          type="date"
                          value={historyDateFrom}
                          onChange={(e) => setHistoryDateFrom(e.target.value)}
                          className={`border-none rounded-xl px-4 py-2 text-sm font-bold outline-hidden ${isDarkMode ? "bg-white/5 text-white color-scheme-dark" : "bg-gray-50 text-gray-900"}`}
                        />
                        <input
                          type="date"
                          value={historyDateTo}
                          onChange={(e) => setHistoryDateTo(e.target.value)}
                          className={`border-none rounded-xl px-4 py-2 text-sm font-bold outline-hidden ${isDarkMode ? "bg-white/5 text-white color-scheme-dark" : "bg-gray-50 text-gray-900"}`}
                        />
                        <button
                          onClick={() => {
                            setHistorySearch("");
                            setHistoryDateFrom("");
                            setHistoryDateTo("");
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? "bg-white/10 text-gray-300 hover:bg-white/20" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md rounded-3xl border overflow-hidden`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${isDarkMode ? "bg-white/5" : "bg-[#005f73]"} text-white`}
                        >
                          <tr>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Date
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Patient Status
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Referred By (Source)
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Referred To (Target)
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Doctor
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : ""}`}
                            >
                              Current Status
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}
                        >
                          {filteredReferrals
                            .filter((ref) => {
                              if (referralView === "active") {
                                if (ref.status === "admitted") return true;
                                const refDate = ref.created_at?.toDate
                                  ? ref.created_at.toDate()
                                  : new Date(ref.created_at || 0);
                                const now = new Date();
                                return (
                                  now.getTime() - refDate.getTime() <=
                                  24 * 60 * 60 * 1000
                                );
                              }
                              if (referralView === "discharged") {
                                return ref.status === "discharged";
                              }
                              return true;
                            })
                            .map((ref, index) => (
                              <tr key={`${ref.id}-${index}`}>
                                <td className="px-6 py-4">
                                  <div className="text-red-500 text-[9px] font-bold uppercase opacity-60 mb-1 text-center">
                                    Referral Date
                                  </div>
                                  <div
                                    className={`font-extrabold text-sm text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {formatISTDate(
                                      ref.createdAt || ref.created_at,
                                    )}
                                  </div>
                                  <div
                                    className={`text-[10px] font-bold text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                  >
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
                                        size={40}
                                        className={`border bg-white shadow-xs holographic-avatar ${isDarkMode ? "border-white/10" : "border-gray-100"}`}
                                      />
                                      <div
                                        className={`absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-xs border text-[8px] ${isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}
                                      >
                                        {ref.patientGender === "F"
                                          ? "♀️"
                                          : "♂️"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                          {ref.patientName}{" "}
                                          <span
                                            className={`font-medium text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                          >
                                            ({ref.patientAge}Y,{" "}
                                            {ref.patientGender || "M"})
                                          </span>
                                        </div>
                                        {ref.patientPhone && (
                                          <a
                                            href={`tel:${ref.patientPhone}`}
                                            className={`p-1.5 rounded-lg transition-all ${isDarkMode ? "bg-white/5 text-emerald-400 hover:bg-emerald-400/10" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                            title={`Call ${ref.patientName}`}
                                          >
                                            <Phone size={12} />
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase inline-block ${isDarkMode ? "bg-red-400/10 text-red-400 border-red-400/20" : "bg-red-50 text-red-600 border-red-100"}`}
                                        >
                                          {ref.department}
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                            ref.patientCondition === "Emergency"
                                              ? isDarkMode
                                                ? "bg-red-500 text-white border-red-500"
                                                : "text-red-600 border-red-100 font-black bg-red-50"
                                              : isDarkMode
                                                ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                                : "text-green-600 border-green-100 bg-green-50"
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
                                    className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? "text-amber-400" : "text-[#ee9b00]"}`}
                                  >
                                    Clinic
                                  </div>
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-white" : "text-[#005f73]"}`}
                                  >
                                    {ref.clinicName}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? "text-blue-400" : "text-[#0a9396]"}`}
                                  >
                                    Hospital
                                  </div>
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-blue-400" : "text-[#0a9396]"}`}
                                  >
                                    {ref.hospitalName}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? "text-emerald-400" : "text-[#00796b]"}`}
                                  >
                                    Doctor
                                  </div>
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-emerald-400" : "text-[#00796b]"}`}
                                  >
                                    {ref.doctorName && ref.doctorName !== "any"
                                      ? `Dr. ${ref.doctorName}`
                                      : "Any Available"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold shadow-sm uppercase ${
                                      ref.status === "admitted"
                                        ? "bg-green-500 text-white"
                                        : ref.status === "discharged"
                                          ? "bg-blue-500 text-white"
                                          : ref.status === "not_willing"
                                            ? "bg-orange-500 text-white"
                                            : ref.status === "not_reachable"
                                              ? "bg-gray-500 text-white"
                                              : "bg-yellow-500 text-black"
                                    }`}
                                  >
                                    {ref.status.replace("_", " ")}
                                  </span>
                                  <div className="mt-2 space-y-1">
                                    {ref.admittedAt && (
                                      <div
                                        className={`text-[9px] font-bold ${isDarkMode ? "text-emerald-400" : "text-green-600"}`}
                                      >
                                        <span className="opacity-60 uppercase">
                                          Admission:
                                        </span>{" "}
                                        {formatISTDate(ref.admittedAt)}
                                      </div>
                                    )}
                                    {ref.dischargedAt && (
                                      <div
                                        className={`text-[9px] font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                                      >
                                        <span className="opacity-60 uppercase">
                                          Discharge:
                                        </span>{" "}
                                        {formatISTDate(ref.dischargedAt)}
                                      </div>
                                    )}
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

              {activeTab === "patients" && (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md rounded-3xl border overflow-hidden`}
                  >
                    <div
                      className={`p-6 border-b ${isDarkMode ? "border-white/5" : "border-gray-50"}`}
                    >
                      <h5
                        className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Public Portal Users
                      </h5>
                      <p
                        className={`${isDarkMode ? "text-gray-500" : "text-gray-400"} text-xs font-bold uppercase tracking-wider mt-1`}
                      >
                        Total registered patients using the public portal
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${isDarkMode ? "bg-white/5" : "bg-gray-50/50"}`}
                        >
                          <tr>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Patient Name
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Email
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Joined Date
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-right ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}
                        >
                          {patients.map((p, index) => (
                            <tr key={`${p.id}-${index}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <PatientAvatar
                                    gender={p.gender || p.patientGender}
                                    name={p.name}
                                    size={32}
                                    className={`border ${isDarkMode ? "border-white/10" : "border-gray-100"}`}
                                  />
                                  <div
                                    className={`font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    {p.name}
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`px-6 py-4 text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {p.email}
                              </td>
                              <td
                                className={`px-6 py-4 text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {formatISTDate(p.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="bg-green-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {patients.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className={`px-6 py-12 text-center font-bold ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                              >
                                No public portal users found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "opd_history" && (
                <motion.div
                  key="opd_history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div
                    className={`${isDarkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md rounded-3xl border overflow-hidden`}
                  >
                    <div
                      className={`p-6 border-b ${isDarkMode ? "border-white/5" : "border-gray-50"}`}
                    >
                      <h5
                        className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        OPD & Online Appointments History
                      </h5>
                      <p
                        className={`${isDarkMode ? "text-gray-500" : "text-gray-400"} text-xs font-bold uppercase tracking-wider mt-1`}
                      >
                        Consolidated record of all clinic visits and online
                        bookings
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead
                          className={`${isDarkMode ? "bg-white/5" : "bg-gray-50/50"}`}
                        >
                          <tr>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Date & Time
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Patient
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Clinic
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Type
                            </th>
                            <th
                              className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-right ${isDarkMode ? "text-blue-400" : "text-[#005f73]"}`}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}
                        >
                          {appointments.map((apt, index) => (
                            <tr key={`${apt.id}-${index}`}>
                              <td className="px-6 py-4">
                                <div
                                  className={`font-extrabold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {formatISTDate(apt.createdAt)}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  {formatISTTime(apt.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {apt.patientName}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  {apt.patientPhone}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`font-extrabold ${isDarkMode ? "text-emerald-400" : "text-[#005f73]"}`}
                                >
                                  {apt.clinicName}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-purple-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                                  Online
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                                    apt.status === "completed"
                                      ? "bg-green-500 text-white"
                                      : apt.status === "cancelled"
                                        ? "bg-red-500 text-white"
                                        : "bg-amber-500 text-black"
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {appointments.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className={`px-6 py-12 text-center font-bold ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                              >
                                No appointment history found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifs" && (
                <motion.div
                  key="notifs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  <div id="broadcast-form" className="md:col-span-5">
                    <div
                      className={`${isDarkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md p-6 rounded-3xl border`}
                    >
                      <h5
                        className={`text-xl font-extrabold mb-6 flex items-center gap-2 ${isDarkMode ? "text-sky-400" : "text-[#005f73]"}`}
                      >
                        <Send
                          size={20}
                          className={
                            isDarkMode ? "text-sky-400" : "text-[#0a9396]"
                          }
                        />{" "}
                        {notifForm.recipient !== "all" &&
                        notifForm.recipient !== "hospital" &&
                        notifForm.recipient !== "clinic"
                          ? "Send Reply"
                          : "Send Broadcast"}
                      </h5>
                      <form
                        onSubmit={handleSendBroadcast}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 block ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            Recipient Group
                          </label>
                          <select
                            value={notifForm.recipient}
                            onChange={(e) =>
                              setNotifForm({
                                ...notifForm,
                                recipient: e.target.value,
                              })
                            }
                            className={`w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-hidden ${isDarkMode ? "bg-white/5 text-white" : "bg-gray-50 text-gray-900"}`}
                          >
                            <optgroup label="Broadcast Groups">
                              <option value="all">
                                All Users (Clinics & Hospitals)
                              </option>
                              <option value="hospital">
                                All Hospitals Only
                              </option>
                              <option value="clinic">All Clinics Only</option>
                            </optgroup>
                            <optgroup label="Individual Hospitals">
                              {hospitals.map((h, index) => (
                                <option
                                  key={`${h.id}-${index}`}
                                  value={String(h.id || "")}
                                >
                                  {h.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Individual Clinics">
                              {clinics.map((c, index) => (
                                <option
                                  key={`${c.id}-${index}`}
                                  value={String(c.id || "")}
                                >
                                  {c.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label
                            className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 block ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            value={notifForm.title}
                            onChange={(e) =>
                              setNotifForm({
                                ...notifForm,
                                title: e.target.value,
                              })
                            }
                            className={`w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-hidden ${isDarkMode ? "bg-white/5 text-white placeholder:text-gray-600" : "bg-gray-50 text-gray-900"}`}
                            placeholder="e.g. Server Maintenance"
                            required
                          />
                        </div>
                        <div>
                          <label
                            className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 block ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            Message
                          </label>
                          <textarea
                            value={notifForm.content}
                            onChange={(e) =>
                              setNotifForm({
                                ...notifForm,
                                content: e.target.value,
                              })
                            }
                            className={`w-full border-none rounded-xl px-4 py-3 text-sm font-medium outline-hidden min-h-[120px] ${isDarkMode ? "bg-white/5 text-white placeholder:text-gray-600" : "bg-gray-50 text-gray-900"}`}
                            placeholder="Type your message here..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className={`w-full text-white font-extrabold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${isDarkMode ? "bg-blue-600 shadow-blue-500/20" : "bg-[#0a9396] shadow-[#0a9396]/20"}`}
                        >
                          Send Message <ArrowRight size={20} />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="md:col-span-7">
                    <div
                      className={`${isDarkMode ? "bg-white/5 border-white/10 shadow-none" : "bg-white/95 border-gray-100 shadow-sm"} backdrop-blur-md p-6 rounded-3xl border h-full`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h5
                          className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          Notification History
                        </h5>
                        <button
                          className={`font-bold text-xs px-4 py-1.5 rounded-full transition-all ${isDarkMode ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                        {messages.map((msg, index) => (
                          <div
                            key={`${msg.id}-${index}`}
                            className={`p-4 rounded-2xl border shadow-sm ${
                              msg.recipient_role === "all"
                                ? "border-l-4 border-yellow-500 bg-yellow-500/5"
                                : msg.recipient_role === "hospital"
                                  ? isDarkMode
                                    ? "border-l-4 border-blue-500 bg-blue-500/5"
                                    : "border-l-4 border-[#0a9396] bg-[#0a9396]/5"
                                  : isDarkMode
                                    ? "border-l-4 border-emerald-500 bg-emerald-500/5"
                                    : "border-l-4 border-[#005f73] bg-[#005f73]/5"
                            } ${!msg.isRead && msg.receiverId === user.id ? "ring-2 ring-red-500/20" : ""} ${isDarkMode ? "border-white/5" : "border-gray-50"}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <strong
                                  className={`text-xs font-extrabold uppercase tracking-wider opacity-70 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {msg.senderId === user.id
                                    ? `Sent to: ${msg.recipient_role === "all" ? "Everyone" : msg.recipient_role === "hospital" ? "All Hospitals" : msg.recipient_role === "clinic" ? "All Clinics" : msg.receiverName || "Unknown"}`
                                    : `From: ${msg.senderName || msg.sender_name || "Unknown"}`}
                                </strong>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div
                                    className={`text-[10px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    {formatISTDate(
                                      msg.createdAt || msg.created_at,
                                    )}
                                  </div>
                                  <div
                                    className={`text-[9px] font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    {formatISTTime(
                                      msg.createdAt || msg.created_at,
                                    )}
                                  </div>
                                </div>
                                {msg.senderId !== user.id && (
                                  <button
                                    onClick={() => handleReply(msg)}
                                    className={`text-[10px] font-bold hover:underline ${isDarkMode ? "text-sky-400" : "text-[#005f73]"}`}
                                  >
                                    Reply
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="Delete Message"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <strong
                              className={`block mt-2 text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {msg.title}
                            </strong>
                            <p
                              className={`m-0 mt-1 text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {msg.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Bar Navigation */}
            <nav
              className={`fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex items-center justify-between z-40 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)] ${isDarkMode ? "bg-[#001219] border-white/10" : "bg-white border-gray-100"}`}
            >
              {bottomNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "menu") {
                      setIsSidebarOpen(true);
                    } else {
                      setActiveTab(item.id === "home" ? "approvals" : item.id);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === item.id ||
                    (item.id === "home" && activeTab === "approvals")
                      ? isDarkMode
                        ? "text-blue-400"
                        : "text-[#005f73]"
                      : isDarkMode
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={
                      activeTab === item.id ||
                      (item.id === "home" && activeTab === "approvals")
                        ? "scale-110"
                        : ""
                    }
                  />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            <ConfirmationModal
              isOpen={confirmModal.isOpen}
              onClose={() =>
                setConfirmModal({ ...confirmModal, isOpen: false })
              }
              onConfirm={confirmModal.onConfirm}
              title={confirmModal.title}
              message={confirmModal.message}
              type={confirmModal.type}
              confirmText="Yes, Proceed"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
