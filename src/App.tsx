import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PendingApproval from "./components/auth/PendingApproval";
import AppErrorBoundary from "./components/common/AppErrorBoundary";
import { doc, onSnapshot, getDocFromServer } from "firebase/firestore";
import { db } from "./firebase";
import { safeStringify } from "./utils/firestoreErrorHandler";
import { firebaseService } from "./services/firebaseService";

import AdminPanel from "./components/panels/AdminPanel";
import HospitalPanel from "./components/panels/HospitalPanel";
import ClinicPanel from "./components/panels/ClinicPanel";
import PatientPanel from "./components/panels/PatientPanel";

import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsAndConditions from "./components/legal/TermsAndConditions";
import FirstTimeConsentModal from "./components/legal/FirstTimeConsentModal";
import SecurityUpgradeModal from "./components/auth/SecurityUpgradeModal";
import LandingPage from "./components/landing/LandingPage";
import { Shield, X } from "lucide-react";

export default function App() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        console.log("[App] Firestore connection verified");
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("[App] Firestore client is offline. Please check your network or configuration.");
        } else {
          console.error("[App] Firestore connection error:", safeStringify(error));
        }
      }
    }
    const timer = setTimeout(testConnection, 3000);
    return () => clearTimeout(timer);
  }, []);

  const [user, setUser] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem("dismissedSecUpgrade") === "true";
  });
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    console.log("[App] useEffect running");
    try {
      const savedUser = localStorage.getItem("user");
      console.log("[App] savedUser from localStorage:", savedUser ? "Found" : "Not found");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
          
          // Real-time user status and profile updates
          const userRef = doc(db, "users", String(parsedUser.id));
          const listenerId = `app_user_status_${parsedUser.id}_${Math.random().toString(36).substring(2, 11)}`;
          firebaseService.activeListenersRegistry.add(listenerId, "users", `docId: ${parsedUser.id}`);

          const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = { id: docSnap.id, ...docSnap.data() };
              setUser(data);
              try {
                localStorage.setItem("user", safeStringify(data));
              } catch (e) {
                console.error("Error saving user to localStorage:", safeStringify(e));
              }
            } else {
              // User document deleted
              setUser(null);
              try {
                localStorage.removeItem("user");
              } catch (e) {
                console.error("Error removing user from localStorage:", e);
              }
            }
          }, (err) => {
            console.error("Error listening to user status:", safeStringify(err));
            // If it's a permission error or offline error, we might want to handle it
            if (err.message.includes("offline")) {
              console.warn("Firebase is offline. Operating in limited mode.");
            }
          });

          return () => {
            unsubscribe();
            firebaseService.activeListenersRegistry.remove(listenerId);
          };
        } else {
          try {
            localStorage.removeItem("user");
          } catch (e) {
            console.error("Error removing user from localStorage:", e);
          }
          setUser(null);
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      setUser(null);
    }
  }, []);

  // 15-minute Inactivity Timeout Secure Session
  useEffect(() => {
    if (!user) return;
    let timeoutId: any;
    
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Log out after 15 minutes of inactivity for DISHA/ABDM guidelines
      timeoutId = setTimeout(() => {
        console.log("[App] Inactivity timeout reached. Logging out...");
        handleLogout();
        alert("For security and DISHA/ABDM healthcare compliance, your session was closed due to 15 minutes of inactivity.");
      }, 15 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [user]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    try {
      localStorage.setItem("user", safeStringify(userData));
    } catch (e) {
      console.error("Error saving user to localStorage:", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch (e) {
      console.error("Error removing user from localStorage:", e);
    }
  };

  const isApproved = user?.role === "admin" || user?.status === "active";

  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to={`/${String(user.role || "")}`} /> : <Login onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to={`/${String(user.role || "")}`} /> : <Register onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />} 
        />
        <Route 
          path="/admin" 
          element={user?.role === "admin" ? <AdminPanel user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/hospital" 
          element={
            user?.role === "hospital" ? (
              isApproved ? (
                <HospitalPanel user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
              ) : (
                <PendingApproval user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/clinic" 
          element={
            user?.role === "clinic" ? (
              isApproved ? (
                <ClinicPanel user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
              ) : (
                <PendingApproval user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/patient" 
          element={user?.role === "patient" ? <PatientPanel user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {user && !user.consentAcceptedAt && (
        <FirstTimeConsentModal 
          userId={user.id} 
          darkMode={darkMode} 
          onConsentAccepted={(consentFields) => {
            setUser((prev: any) => ({ ...prev, ...consentFields }));
          }}
        />
      )}

      {user && !user.authProvider && !bannerDismissed && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-5 rounded-[24px] shadow-2xl bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-500/20 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-2.5">
              <Shield className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={20} />
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Upgrade Account Security</h4>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                  Link Google Sign-In or set up verified enterprise credentials to protect patient records.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setBannerDismissed(true);
                sessionStorage.setItem("dismissedSecUpgrade", "true");
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => {
                setBannerDismissed(true);
                sessionStorage.setItem("dismissedSecUpgrade", "true");
              }}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Later
            </button>
            <button 
              onClick={() => setIsUpgradeOpen(true)}
              className="px-4 py-2 rounded-xl text-[10px] bg-brand-primary hover:bg-opacity-95 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {user && isUpgradeOpen && (
        <SecurityUpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
          currUser={user}
          darkMode={darkMode}
          onUpgradeSuccess={(newFields) => {
            setUser((prev: any) => ({ ...prev, ...newFields }));
            setBannerDismissed(true);
            sessionStorage.setItem("dismissedSecUpgrade", "true");
          }}
        />
      )}
    </AppErrorBoundary>
  );
}
