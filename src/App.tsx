import React, { useState, useEffect } from "react";
import { Indicator, UserSession, QuarterName } from "./types";
import { INITIAL_INDICATORS } from "./initialData";
import ClockWidget from "./components/ClockWidget";
import GoogleLoginModal from "./components/GoogleLoginModal";
import HomeDashboard from "./components/HomeDashboard";
import IndicatorTabs from "./components/IndicatorTabs";
import PjBackend from "./components/PjBackend";
import AdminPanel from "./components/AdminPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { 
  Chrome, 
  LogIn, 
  LogOut, 
  UserCircle2, 
  Settings, 
  LayoutDashboard, 
  BookmarkCheck, 
  FileEdit, 
  FolderLock, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Cloud,
  CloudOff,
  RefreshCw
} from "lucide-react";
import { collection, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export default function App() {
  // Instant-on: Initialize from LocalStorage cache immediately to eliminate initial fetch delay for returning users
  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    const savedData = localStorage.getItem("PANTAU_IKU_DATA_2026");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Indicator[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback to empty state below
      }
    }
    return [];
  });

  const [selectedQuarter, setSelectedQuarter] = useState<QuarterName>("TW II"); // default evaluated quarter
  const [activeTab, setActiveTab] = useState<"dashboard" | "tabs" | "pj-backend" | "admin-panel">("dashboard");
  const [activeIndicatorKode, setActiveIndicatorKode] = useState<string>("IKM 17.3.1");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Cloud Sync State
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading");
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize and load persistent indicators from Firebase Cloud Storage
  useEffect(() => {
    async function initAndLoadData() {
      setDbStatus("loading");
      try {
        // Retrieve indicators directly from Firestore collection to optimize initial load speed (fetched once at mount)
        const querySnapshot = await getDocs(collection(db, "indicators"));
        if (querySnapshot.empty) {
          // Cloud Firestore database is completely brand new/empty. Let's seed it!
          const batch = writeBatch(db);
          INITIAL_INDICATORS.forEach(ind => {
            const docRef = doc(db, "indicators", ind.kode);
            batch.set(docRef, ind);
          });
          await batch.commit();

          setIndicators(INITIAL_INDICATORS);
          localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(INITIAL_INDICATORS));
          setDbStatus("connected");
        } else {
          // Parse documents
          const fetched: Indicator[] = [];
          querySnapshot.forEach(docSnap => {
            fetched.push(docSnap.data() as Indicator);
          });

          // Defensively merge with INITIAL_INDICATORS to preserve structure while restoring quarters entries
          const merged = INITIAL_INDICATORS.map(initInd => {
            const dbInd = fetched.find(p => p.kode === initInd.kode);
            if (dbInd) {
              return {
                ...initInd,
                quarters: dbInd.quarters
              };
            }
            return initInd;
          });

          setIndicators(merged);
          localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(merged));
          setDbStatus("connected");
        }
      } catch (error) {
        console.error("Error loading indicators from Firestore, falling back to LocalStorage:", error);
        setDbStatus("error");

        // Graceful LocalStorage fallback so the app stays perfectly robust offline
        const savedData = localStorage.getItem("PANTAU_IKU_DATA_2026");
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData) as Indicator[];
            const merged = INITIAL_INDICATORS.map(initInd => {
              const userInd = parsed.find(p => p.kode === initInd.kode);
              if (userInd) {
                return {
                  ...initInd,
                  quarters: userInd.quarters
                };
              }
              return initInd;
            });
            setIndicators(merged);
          } catch {
            if (indicators.length === 0) {
              setIndicators(INITIAL_INDICATORS);
            }
          }
        } else {
          if (indicators.length === 0) {
            setIndicators(INITIAL_INDICATORS);
          }
        }
      }
    }

    initAndLoadData();

    // Load active session from localstorage if available
    const savedSession = localStorage.getItem("PANTAU_IKU_SESSION_2026");
    if (savedSession) {
      try {
        setUserSession(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("PANTAU_IKU_SESSION_2026");
      }
    }
  }, []);

  // Sync to Firestore & LocalStorage whenever indicators change
  const handleUpdateIndicator = async (updatedInd: Indicator) => {
    setIsSyncing(true);
    const updatedList = indicators.map(ind => ind.kode === updatedInd.kode ? updatedInd : ind);
    setIndicators(updatedList);
    
    // Update local copy
    localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(updatedList));

    // Update Cloud Firestore document
    try {
      const docRef = doc(db, "indicators", updatedInd.kode);
      await setDoc(docRef, updatedInd);
    } catch (error) {
      console.error("Failed to sync updated indicator to Firestore:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem("PANTAU_IKU_SESSION_2026", JSON.stringify(session));
    
    // Auto-navigate to appropriate backend workspace
    if (session.role === "admin") {
      setActiveTab("admin-panel");
    } else {
      setActiveTab("pj-backend");
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem("PANTAU_IKU_SESSION_2026");
    setActiveTab("dashboard");
  };

  const handleSelectIndicatorFromDashboard = (kode: string) => {
    setActiveIndicatorKode(kode);
    setActiveTab("tabs");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-teal-700 selection:text-white">
      
      {/* 1. TOP HEADER BANNER */}
      <header className="bg-teal-800 border-b-4 border-yellow-500 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center">
            <div className="block max-w-xl">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wider leading-none uppercase">PANTAU IKU</h1>
              <p className="text-xs text-white font-bold leading-snug mt-1">Platform Pemantauan & Early Warning System Indikator Kinerja Utama</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <p className="text-[10px] text-teal-100 font-extrabold tracking-wide uppercase">Poltekkes Kemenkes Palembang</p>
                <div id="cloud-database-status" className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-teal-900/65 border border-teal-600/40 select-none">
                  {dbStatus === "loading" && (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 text-yellow-400 animate-spin" />
                      <span className="text-teal-200">Menghubungkan Database...</span>
                    </>
                  )}
                  {dbStatus === "connected" && (
                    <>
                      <Cloud className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-300">Database Cloud Aktif</span>
                    </>
                  )}
                  {dbStatus === "error" && (
                    <>
                      <CloudOff className="w-2.5 h-2.5 text-rose-400" />
                      <span className="text-rose-300">Mode Offline (Lokal)</span>
                    </>
                  )}
                  {isSyncing && (
                    <span className="text-yellow-400 animate-pulse ml-0.5">(Menyimpan...)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Login Section */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* View navigation model */}
            <div className="flex bg-teal-900/50 p-1 rounded-lg border border-teal-600/30">
              <button
                id="header-nav-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                  activeTab === "dashboard"
                    ? "bg-white text-teal-850 shadow"
                    : "text-teal-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                id="header-nav-tabs"
                onClick={() => setActiveTab("tabs")}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                  activeTab === "tabs"
                    ? "bg-white text-teal-850 shadow"
                    : "text-teal-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Tab Detail IKU</span>
              </button>

              {userSession && userSession.role === "pj" && (
                <button
                  id="header-nav-pj-backend"
                  onClick={() => setActiveTab("pj-backend")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                    activeTab === "pj-backend"
                      ? "bg-white text-teal-850 shadow"
                      : "text-teal-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Isian PJ</span>
                </button>
              )}

              {userSession && userSession.role === "admin" && (
                <button
                  id="header-nav-admin-panel"
                  onClick={() => setActiveTab("admin-panel")}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                    activeTab === "admin-panel"
                      ? "bg-white text-red-800 shadow"
                      : "text-teal-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Konsol Admin</span>
                </button>
              )}
            </div>

            {/* Auth Session Button */}
            {userSession ? (
              <div className="flex items-center gap-2 bg-teal-900/60 border border-teal-700/50 p-1 rounded-lg">
                <div id="user-session-badge" className="w-7 h-7 rounded-full bg-yellow-500 text-teal-950 font-black text-xs flex items-center justify-center flex-shrink-0 border border-yellow-400">
                  {userSession.pjName ? userSession.pjName.substring(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="hidden sm:block text-left text-[11px] leading-tight max-w-[120px]">
                  <p className="font-bold text-white truncate">{userSession.name}</p>
                  <p className="text-[9px] text-yellow-400 truncate uppercase tracking-widest font-bold font-mono">
                    {userSession.pjName ? `PJ ${userSession.pjName}` : "Admin"}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-white/10 text-teal-200 hover:text-white rounded transition-colors ml-1"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-trigger-login-modal"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-teal-950 font-extrabold text-xs rounded shadow-md transition-all duration-150 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-teal-950" />
                <span>Masuk Sistem</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* 2. BODY GENERAL WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        


        {/* Live Clock, Day / Date and Active Quarters Selector Widget */}
        <ClockWidget selectedQuarter={selectedQuarter} setSelectedQuarter={setSelectedQuarter} />

        {/* Main interactive Tab Contents render */}
        {indicators.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === "dashboard" && (
              <HomeDashboard 
                indicators={indicators} 
                selectedQuarter={selectedQuarter} 
                onSelectIndicator={handleSelectIndicatorFromDashboard} 
              />
            )}

            {activeTab === "tabs" && (
              <IndicatorTabs 
                indicators={indicators} 
                selectedQuarter={selectedQuarter} 
                activeIndicatorKode={activeIndicatorKode} 
                setActiveIndicatorKode={setActiveIndicatorKode} 
              />
            )}

            {activeTab === "pj-backend" && userSession && (
              <PjBackend 
                indicators={indicators} 
                session={userSession} 
                onUpdateIndicator={handleUpdateIndicator} 
              />
            )}

            {activeTab === "admin-panel" && userSession && (
              <AdminPanel 
                indicators={indicators} 
                selectedQuarter={selectedQuarter} 
                onSelectIndicator={handleSelectIndicatorFromDashboard} 
              />
            )}
          </>
        )}

      </main>

      {/* 3. PLATFORM FOOTER */}
      <footer className="bg-slate-200 border-t border-slate-300 py-5 text-center text-xs text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-2 font-semibold text-[11px]">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-pulse"></div>
          <span>PANTAU IKU Poltekkes Kemenkes Palembang © 2026</span>
        </div>
      </footer>

      {/* Google Login popup Modal */}
      <GoogleLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

    </div>
  );
}
