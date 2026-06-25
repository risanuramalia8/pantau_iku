import React, { useState, useEffect } from "react";
import { Indicator, UserSession, QuarterName } from "./types";
import { INITIAL_INDICATORS } from "./initialData";
import ClockWidget from "./components/ClockWidget";
import GoogleLoginModal from "./components/GoogleLoginModal";
import HomeDashboard from "./components/HomeDashboard";
import IndicatorTabs from "./components/IndicatorTabs";
import PjBackend from "./components/PjBackend";
import AdminPanel from "./components/AdminPanel";
import LoadingSkeleton from "./LoadingSkeleton";
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
import { collection, doc, getDocs, setDoc, writeBatch, deleteDoc } from "firebase/firestore";
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

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const savedYear = localStorage.getItem("PANTAU_IKU_SELECTED_YEAR");
    if (savedYear) {
      const yr = Number(savedYear);
      if (yr >= 2026 && yr <= 2030) return yr;
    }
    return 2026;
  });

  useEffect(() => {
    localStorage.setItem("PANTAU_IKU_SELECTED_YEAR", String(selectedYear));
  }, [selectedYear]);

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
          // Cloud Firestore database is completely brand new/empty. Let's seed it for 2026!
          const batch = writeBatch(db);
          const seeded = INITIAL_INDICATORS.map(ind => ({
            ...ind,
            tahun: 2026
          }));

          seeded.forEach(ind => {
            const docId = `${ind.kode}_2026`;
            const docRef = doc(db, "indicators", docId);
            batch.set(docRef, ind);
          });
          await batch.commit();

          setIndicators(seeded);
          localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(seeded));
          setDbStatus("connected");
        } else {
          // Parse documents
          const fetched: Indicator[] = [];
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data() as Indicator;
            if (!data.tahun) {
              data.tahun = 2026;
            }
            fetched.push(data);
          });

          // Add any INITIAL_INDICATORS missing in the database for 2026
          const missing = INITIAL_INDICATORS.filter(
            initInd => !fetched.some(f => f.kode === initInd.kode && (f.tahun === 2026 || !f.tahun))
          );
          const finalFetched = [...fetched, ...missing.map(m => ({ ...m, tahun: 2026 }))];
          finalFetched.sort((a, b) => a.no - b.no || a.kode.localeCompare(b.kode));

          setIndicators(finalFetched);
          localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(finalFetched));
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
            const mapped = parsed.map(p => ({ ...p, tahun: p.tahun || 2026 }));
            
            // Ensure 2026 templates are present
            const missing = INITIAL_INDICATORS.filter(
              initInd => !mapped.some(f => f.kode === initInd.kode && f.tahun === 2026)
            );
            const merged = [...mapped, ...missing.map(m => ({ ...m, tahun: 2026 }))];
            merged.sort((a, b) => a.no - b.no || a.kode.localeCompare(b.kode));
            
            setIndicators(merged);
          } catch {
            if (indicators.length === 0) {
              const defaultList = INITIAL_INDICATORS.map(m => ({ ...m, tahun: 2026 }));
              setIndicators(defaultList);
            }
          }
        } else {
          if (indicators.length === 0) {
            const defaultList = INITIAL_INDICATORS.map(m => ({ ...m, tahun: 2026 }));
            setIndicators(defaultList);
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

  const handleAddIndicator = async (newInd: Indicator) => {
    setIsSyncing(true);
    if (!newInd.tahun) {
      newInd.tahun = selectedYear;
    }
    const updatedList = [...indicators, newInd];
    setIndicators(updatedList);
    localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(updatedList));

    try {
      const docId = `${newInd.kode}_${newInd.tahun}`;
      const docRef = doc(db, "indicators", docId);
      await setDoc(docRef, newInd);
    } catch (error) {
      console.error("Failed to add indicator to Firestore:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync to Firestore & LocalStorage whenever indicators change
  const handleUpdateIndicator = async (updatedInd: Indicator) => {
    setIsSyncing(true);
    if (!updatedInd.tahun) {
      updatedInd.tahun = selectedYear;
    }
    const updatedList = indicators.map(ind => 
      (ind.kode === updatedInd.kode && (ind.tahun || 2026) === (updatedInd.tahun || 2026)) 
        ? updatedInd 
        : ind
    );
    setIndicators(updatedList);
    
    // Update local copy
    localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(updatedList));

    // Update Cloud Firestore document
    try {
      const docId = `${updatedInd.kode}_${updatedInd.tahun}`;
      const docRef = doc(db, "indicators", docId);
      await setDoc(docRef, updatedInd);
    } catch (error) {
      console.error("Failed to sync updated indicator to Firestore:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteIndicator = async (kode: string, year: number) => {
    setIsSyncing(true);
    const updatedList = indicators.filter(ind => 
      !(ind.kode === kode && (ind.tahun || 2026) === year)
    );
    setIndicators(updatedList);
    localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(updatedList));

    try {
      const docId = `${kode}_${year}`;
      const docRef = doc(db, "indicators", docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Failed to delete indicator from Firestore:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyTemplates = async (targetYear: number) => {
    setIsSyncing(true);
    try {
      // Find all indicators from 2026
      const templateIndicators = indicators.filter(ind => (ind.tahun || 2026) === 2026);
      if (templateIndicators.length === 0) {
        alert("Tidak ada template IKU tahun 2026 yang dapat disalin.");
        return;
      }

      // Clone them with the targetYear and clear the quarters reporting progress (isFilled: false, etc.)
      const clonedList = templateIndicators.map(ind => {
        // Reset filled state for quarters
        const resetQuarters = JSON.parse(JSON.stringify(ind.quarters));
        (["TW I", "TW II", "TW III", "TW IV"] as const).forEach(tw => {
          const q = resetQuarters[tw];
          q.isFilled = false;
          q.realisasi = "";
          q.realisasiLabel = "";
          q.capaian = 0;
          q.status = "Belum Diisi";
          q.justifikasi = "";
          q.linkDokumen = "";
          // Reset variables back to 0
          if (q.variables) {
            Object.keys(q.variables).forEach(v => {
              q.variables[v] = 0;
            });
          }
        });

        return {
          ...ind,
          tahun: targetYear,
          quarters: resetQuarters
        };
      });

      // Write to Firestore in batch
      const batch = writeBatch(db);
      clonedList.forEach(cloned => {
        const docId = `${cloned.kode}_${targetYear}`;
        const docRef = doc(db, "indicators", docId);
        batch.set(docRef, cloned);
      });
      await batch.commit();

      const newList = [...indicators, ...clonedList];
      setIndicators(newList);
      localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to copy templates:", error);
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

  const yearFilteredIndicators = indicators.filter(ind => (ind.tahun || 2026) === selectedYear);

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
            
            {/* Year Selector Menu */}
            <div className="flex items-center gap-2 bg-teal-900/60 border border-teal-700/50 p-1 px-2.5 rounded-lg">
              <span className="text-[10px] font-black text-teal-200 tracking-wider uppercase font-mono">Tahun:</span>
              <select
                id="header-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer pr-1 border-none font-sans"
              >
                {[2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y} className="bg-teal-900 text-white font-bold">{y}</option>
                ))}
              </select>
            </div>

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
                indicators={yearFilteredIndicators} 
                selectedQuarter={selectedQuarter} 
                onSelectIndicator={handleSelectIndicatorFromDashboard} 
              />
            )}

            {activeTab === "tabs" && (
              <IndicatorTabs 
                indicators={yearFilteredIndicators} 
                selectedQuarter={selectedQuarter} 
                activeIndicatorKode={activeIndicatorKode} 
                setActiveIndicatorKode={setActiveIndicatorKode} 
              />
            )}

            {activeTab === "pj-backend" && userSession && (
              <PjBackend 
                indicators={yearFilteredIndicators} 
                session={userSession} 
                onUpdateIndicator={handleUpdateIndicator} 
              />
            )}

            {activeTab === "admin-panel" && userSession && (
              <AdminPanel 
                indicators={yearFilteredIndicators} 
                selectedQuarter={selectedQuarter} 
                onSelectIndicator={handleSelectIndicatorFromDashboard}
                onAddIndicator={handleAddIndicator}
                onUpdateIndicator={handleUpdateIndicator}
                onDeleteIndicator={handleDeleteIndicator}
                onCopyTemplates={handleCopyTemplates}
                selectedYear={selectedYear}
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
