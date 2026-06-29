import React, { useState, useEffect, useRef } from "react";
import { Indicator, UserSession, QuarterName } from "../types";
import { calculateRealisasi, calculateCapaian, getStatusTW } from "../utils";
import { generateDocxReport, generatePptxReport } from "../utils/reportGenerator";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Link, 
  Coins, 
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Presentation,
  Download,
  ListTodo,
  Edit3,
  Eye,
  Lock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  CheckSquare,
  AlertTriangle
} from "lucide-react";

interface PjBackendProps {
  indicators: Indicator[];
  session: UserSession;
  onUpdateIndicator: (updatedIndicator: Indicator) => void;
}

export default function PjBackend({ indicators, session, onUpdateIndicator }: PjBackendProps) {
  // Helper to format Wadir names beautifully
  const formatPjName = (name: string | undefined) => {
    if (!name) return "Umum";
    if (name === "Wadir 1") return "Wadir I";
    if (name === "Wadir 2") return "Wadir II";
    if (name === "Wadir 3") return "Wadir III";
    return name;
  };

  // Check if current user is a Vice Director (Wadir)
  const isWadir = session.pjName && session.pjName.toLowerCase().startsWith("wadir");

  // Filter indicators that belong to this PJ
  const myIndicators = indicators.filter(ind => 
    ind.pj === session.pjName || ind.pjWadir === session.pjName
  );
  
  // Tab states for Wadir
  const [activeSubTab, setActiveSubTab] = useState<"rekap" | "isi" | "laporan">("rekap");

  const [activeKode, setActiveKode] = useState<string>("");
  const [selectedTw, setSelectedTw] = useState<QuarterName>("TW II");

  // Sync initial indicator selection
  useEffect(() => {
    if (myIndicators.length > 0 && !activeKode) {
      setActiveKode(myIndicators[0].kode);
    }
  }, [myIndicators, activeKode]);
  
  if (myIndicators.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800 font-sans">Tidak Ada Indikator</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Akun Anda terdaftar sebagai PJ/Verifikator <strong className="text-teal-900">{formatPjName(session.pjName)}</strong>. 
          Namun saat ini belum ada indikator kinerja utama (IKU) yang ditugaskan ke departemen Anda dalam database instansi 2026.
        </p>
      </div>
    );
  }

  const activeInd = myIndicators.find(ind => ind.kode === activeKode) || myIndicators[0] || myIndicators[0];
  const qData = activeInd ? activeInd.quarters[selectedTw] : {
    variables: {}, realisasi: "", realisasiLabel: "", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "", isFilled: false, locked: false
  };

  // Report scope for PJ/Wadir
  const [pjReportScope, setPjReportScope] = useState<"all" | "TW I" | "TW II" | "TW III" | "TW IV">("all");

  // Handle generating Word Report for PJ/Wadir
  const handleDownloadDocxReport = async () => {
    try {
      const blob = await generateDocxReport(
        myIndicators,
        pjReportScope,
        `Laporan Capaian IKU - ${formatPjName(session.pjName)}`,
        `Laporan Evaluasi Indikator Binaan Penanggung Jawab`,
        `${formatPjName(session.pjName)} (${session.name})`
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      let suffix = "Keseluruhan";
      if (pjReportScope === "TW I") suffix = "Triwulan_I";
      else if (pjReportScope === "TW II") suffix = "Triwulan_II";
      else if (pjReportScope === "TW III") suffix = "Triwulan_III";
      else if (pjReportScope === "TW IV") suffix = "Triwulan_IV";

      link.setAttribute("download", `Laporan_IKU_${formatPjName(session.pjName).replace(/\s+/g, "_")}_${suffix}_2026.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal generate DOCX:", err);
      alert("Gagal men-generate laporan Word.");
    }
  };

  // Handle generating PowerPoint Report for PJ/Wadir
  const handleDownloadPptxReport = async () => {
    try {
      await generatePptxReport(
        myIndicators,
        pjReportScope,
        `Capaian IKU - ${formatPjName(session.pjName)}`,
        `Poltekkes Kemenkes Palembang`,
        `${formatPjName(session.pjName)} (${session.name})`
      );
    } catch (err) {
      console.error("Gagal generate PPTX:", err);
      alert("Gagal men-generate presentasi PowerPoint.");
    }
  };

  // Form states
  const [variableInputs, setVariableInputs] = useState<{ [varName: string]: number }>({});
  const [justifikasi, setJustifikasi] = useState("");
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState("");
  const [linkDokumen, setLinkDokumen] = useState("");
  
  // File upload drag-drop state simulation
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Save notification toast state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLocalEditing, setIsLocalEditing] = useState(false);

  // Sync state whenever the selected indicator or selected TW changes
  useEffect(() => {
    if (!activeInd) return;
    // Collect variables
    const initialInputs: { [key: string]: number } = {};
    activeInd.dataDibutuhkan.forEach((v) => {
      initialInputs[v] = qData.variables[v] || 0;
    });

    setVariableInputs(initialInputs);
    setJustifikasi(qData.justifikasi || "");
    setRencanaTindakLanjut(qData.rencanaTindakLanjut || "");
    setLinkDokumen(qData.linkDokumen || "");
    setUploadedFiles(qData.linkDokumen ? [{ name: "Dokumen_Dukung_TW.pdf", size: "1.4 MB", status: "Uploaded" }] : []);
    // Auto-enable edit mode if not locked and not filled by another unit (read-only for pimpinan if filled by subordinate unit)
    const isLocked = qData?.locked === true;
    const isFilledByUnit = isWadir && qData.isFilled && qData.updatedBy !== session.email;
    if (!isLocked && !isFilledByUnit) {
      setIsLocalEditing(true);
    } else {
      setIsLocalEditing(false);
    }
  }, [activeKode, selectedTw, activeInd, qData.isFilled, activeSubTab, isWadir, session.email]);

  // Handle variable change
  const handleVariableChange = (vName: string, val: string) => {
    const numericVal = parseFloat(val);
    setVariableInputs(prev => ({
      ...prev,
      [vName]: isNaN(numericVal) ? 0 : numericVal
    }));
  };

  // Perform live preview calculations
  const { realisasi, label: realisasiLabel } = activeInd ? calculateRealisasi(activeInd.kode, variableInputs) : { realisasi: 0, label: "0" };
  const capaian = activeInd ? calculateCapaian(activeInd.kode, realisasi, activeInd.target2026) : 0;
  const liveStatus = getStatusTW(selectedTw, capaian, true);

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (fileName: string, fileSize: string) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFiles([{ name: fileName, size: fileSize, status: "Success" }]);
          // Fill a simulated link document if not available
          if (!linkDokumen) {
            setLinkDokumen(`https://drive.google.com/drive/folders/poltekkes-palembang/uploaded-proofs/${fileName}`);
          }
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      simulateUpload(file.name, sizeStr);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      simulateUpload(file.name, sizeStr);
    }
  };

  // On Save Submissions
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeInd) return;

    // Create deep copy of active indicator and modify of selected TW data
    const updatedIndicator: Indicator = JSON.parse(JSON.stringify(activeInd));
    
    updatedIndicator.quarters[selectedTw] = {
      ...qData,
      isFilled: true,
      variables: variableInputs,
      realisasi,
      realisasiLabel,
      capaian,
      status: liveStatus,
      justifikasi,
      rencanaTindakLanjut,
      linkDokumen,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
      locked: qData.locked || false
    };

    onUpdateIndicator(updatedIndicator);
    setIsLocalEditing(false);
    
    // Show beautiful banner
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  // Helper to jump to direct editing/viewing from the Rekapitulasi table
  const handleViewOrEditIndicator = (kode: string, tw: QuarterName) => {
    setActiveKode(kode);
    setSelectedTw(tw);
    setActiveSubTab("isi");
  };

  // Check if filled by unit (read-only for pimpinan)
  // Rule: Wadir can enter report themselves if not filled, but if already filled by unit below (i.e. updatedBy !== session.email),
  // they can only view and cannot overwrite/save.
  const isFilledByUnit = isWadir && qData.isFilled && qData.updatedBy !== session.email;
  const isFieldDisabled = !isLocalEditing || (qData?.locked === true) || isFilledByUnit;

  // Render Sub-tab views
  return (
    <div className="space-y-6">
      
      {/* ----------------- SUB HEADERS FOR USER ROLE INFO ----------------- */}
      <div className="bg-gradient-to-r from-teal-850 to-teal-800 rounded-2xl border border-teal-950 p-5 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest bg-yellow-500 text-teal-950 px-2 py-0.5 rounded font-black">
            {isWadir ? "KONSOL MONITORING PIMPINAN" : "KONSOL PELAPORAN UNIT"}
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">
            Penanggung Jawab: {formatPjName(session.pjName)}
          </h2>
          <p className="text-[11px] text-teal-100 font-semibold mt-0.5 max-w-2xl leading-relaxed">
            {isWadir 
              ? `Memantau, meninjau, dan melaporkan ${myIndicators.length} Indikator Kinerja Utama (IKU) yang didelegasikan ke unit-unit pelaksana di bawah koordinasi Anda.`
              : `Kelola pengisian data realisasi formula untuk ${myIndicators.length} Indikator Kinerja Utama instansi secara real-time.`
            }
          </p>
        </div>
        {isWadir && (
          <div className="bg-teal-900/50 px-4 py-2.5 rounded-xl border border-teal-700/40 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Kepatuhan Total</p>
              <p className="text-lg font-mono font-black text-white">
                {Math.round(
                  (myIndicators.reduce((acc, ind) => {
                    const filledQuarters = Object.values(ind.quarters).filter(q => q.isFilled).length;
                    return acc + filledQuarters;
                  }, 0) / (myIndicators.length * 4)) * 100
                )}% <span className="text-xs text-teal-200">terisi</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- WADIR THREE TABS BAR ----------------- */}
      {isWadir && (
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex shadow-sm w-full">
          <button
            id="tab-rekap-isian"
            onClick={() => setActiveSubTab("rekap")}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === "rekap"
                ? "bg-teal-800 text-white shadow"
                : "text-slate-600 hover:text-teal-900 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>1. Rekapitulasi Isian Unit</span>
          </button>
          <button
            id="tab-isi-pelaporan"
            onClick={() => setActiveSubTab("isi")}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === "isi"
                ? "bg-teal-800 text-white shadow"
                : "text-slate-600 hover:text-teal-900 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>2. Isi / Tinjau Pelaporan</span>
          </button>
          <button
            id="tab-generate-laporan"
            onClick={() => setActiveSubTab("laporan")}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === "laporan"
                ? "bg-teal-800 text-white shadow"
                : "text-slate-600 hover:text-teal-900 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Generate Laporan Kerja</span>
          </button>
        </div>
      )}

      {/* ----------------- TAB 1: REKAPITULASI ISIAN UNIT (Wadir Only) ----------------- */}
      {isWadir && activeSubTab === "rekap" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Rincian Kepatuhan Pengisian Unit</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pantau progres input data realisasi IKU oleh Unit Pelaksana di bawah koordinasi <strong className="text-teal-950">{formatPjName(session.pjName)}</strong>.
              </p>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SINKRONISASI AKTIF</span>
            </div>
          </div>

          {/* Quick compliance stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(tw => {
              const filled = myIndicators.filter(ind => ind.quarters[tw].isFilled).length;
              const total = myIndicators.length;
              const pct = Math.round((filled / total) * 100) || 0;
              return (
                <div key={tw} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left flex flex-col justify-between h-20">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{tw}</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-base font-extrabold font-mono text-slate-900">{filled} / {total} <span className="text-[10px] text-slate-400 font-semibold">Unit</span></span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      pct === 100 ? "bg-emerald-100 text-emerald-800" :
                      pct >= 50 ? "bg-amber-100 text-amber-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Big Rekap Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100 font-sans font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold">KODE</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold w-[35%]">INDIKATOR KINERJA UTAMA</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold">UNIT PELAKSANA (PJ)</th>
                  <th scope="col" className="px-3 py-3.5 text-center font-bold">TW I</th>
                  <th scope="col" className="px-3 py-3.5 text-center font-bold">TW II</th>
                  <th scope="col" className="px-3 py-3.5 text-center font-bold">TW III</th>
                  <th scope="col" className="px-3 py-3.5 text-center font-bold">TW IV</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {myIndicators.map((ind) => (
                  <tr key={ind.kode} className="hover:bg-slate-50/50 transition">
                    {/* Kode */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-[10px] bg-teal-50 text-teal-800 border border-teal-100 px-2.5 py-0.5 rounded">
                        {ind.kode}
                      </span>
                    </td>
                    {/* Indikator Kinerja */}
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-extrabold text-slate-800 leading-normal">{ind.indikatorKinerja}</p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">"DO: {ind.definisiOperasional}"</p>
                      </div>
                    </td>
                    {/* Unit PJ */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                        {ind.pj || "Sektor"}
                      </span>
                    </td>
                    {/* Quarters Status */}
                    <td className="px-3 py-4 text-center">
                      {(() => {
                        const q = ind.quarters["TW I"];
                        if (q.isFilled) {
                          const isWadirFilled = q.updatedBy === session.email;
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW I")}
                              className="text-left w-full p-2 rounded bg-emerald-50 border border-emerald-150 text-emerald-850 hover:bg-emerald-100 transition flex flex-col gap-0.5 group cursor-pointer"
                              title={`Diisi oleh: ${q.updatedBy || 'Unit'}. Klik untuk meninjau.`}
                            >
                              <span className="text-[8px] font-bold text-emerald-700 flex items-center gap-1">
                                <span>✓</span>
                                <span>{isWadirFilled ? "WADIR" : "TERISI"}</span>
                              </span>
                              <span className="text-[10.5px] font-mono font-bold text-emerald-950">
                                {typeof q.capaian === 'number' ? q.capaian.toFixed(1) : q.capaian}%
                              </span>
                              <span className={`text-[8px] font-black px-1 rounded-sm self-start uppercase mt-0.5 ${
                                q.status === "Tercapai" ? "bg-emerald-200/50 text-emerald-900" :
                                q.status === "On Track" ? "bg-amber-200/50 text-amber-900" :
                                "bg-rose-200/50 text-rose-900"
                              }`}>
                                {q.status}
                              </span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW I")}
                              className="text-left w-full p-2 rounded bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-400 hover:text-teal-700 transition flex flex-col gap-1 group cursor-pointer"
                              title="Belum dilaporkan. Klik untuk mengisi langsung."
                            >
                              <span className="text-[8px] font-bold flex items-center gap-1 text-slate-400 group-hover:text-teal-600">
                                <span className="animate-pulse text-amber-500">●</span>
                                <span>BELUM</span>
                              </span>
                              <span className="text-[9px] font-bold text-teal-850 hidden group-hover:block transition">
                                Isi Data →
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block group-hover:hidden">
                                Kosong
                              </span>
                            </button>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {(() => {
                        const q = ind.quarters["TW II"];
                        if (q.isFilled) {
                          const isWadirFilled = q.updatedBy === session.email;
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW II")}
                              className="text-left w-full p-2 rounded bg-emerald-50 border border-emerald-150 text-emerald-850 hover:bg-emerald-100 transition flex flex-col gap-0.5 group cursor-pointer"
                              title={`Diisi oleh: ${q.updatedBy || 'Unit'}. Klik untuk meninjau.`}
                            >
                              <span className="text-[8px] font-bold text-emerald-700 flex items-center gap-1">
                                <span>✓</span>
                                <span>{isWadirFilled ? "WADIR" : "TERISI"}</span>
                              </span>
                              <span className="text-[10.5px] font-mono font-bold text-emerald-950">
                                {typeof q.capaian === 'number' ? q.capaian.toFixed(1) : q.capaian}%
                              </span>
                              <span className={`text-[8px] font-black px-1 rounded-sm self-start uppercase mt-0.5 ${
                                q.status === "Tercapai" ? "bg-emerald-200/50 text-emerald-900" :
                                q.status === "On Track" ? "bg-amber-200/50 text-amber-900" :
                                "bg-rose-200/50 text-rose-900"
                              }`}>
                                {q.status}
                              </span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW II")}
                              className="text-left w-full p-2 rounded bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-400 hover:text-teal-700 transition flex flex-col gap-1 group cursor-pointer"
                              title="Belum dilaporkan. Klik untuk mengisi langsung."
                            >
                              <span className="text-[8px] font-bold flex items-center gap-1 text-slate-400 group-hover:text-teal-600">
                                <span className="animate-pulse text-amber-500">●</span>
                                <span>BELUM</span>
                              </span>
                              <span className="text-[9px] font-bold text-teal-850 hidden group-hover:block transition">
                                Isi Data →
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block group-hover:hidden">
                                Kosong
                              </span>
                            </button>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {(() => {
                        const q = ind.quarters["TW III"];
                        if (q.isFilled) {
                          const isWadirFilled = q.updatedBy === session.email;
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW III")}
                              className="text-left w-full p-2 rounded bg-emerald-50 border border-emerald-150 text-emerald-850 hover:bg-emerald-100 transition flex flex-col gap-0.5 group cursor-pointer"
                              title={`Diisi oleh: ${q.updatedBy || 'Unit'}. Klik untuk meninjau.`}
                            >
                              <span className="text-[8px] font-bold text-emerald-700 flex items-center gap-1">
                                <span>✓</span>
                                <span>{isWadirFilled ? "WADIR" : "TERISI"}</span>
                              </span>
                              <span className="text-[10.5px] font-mono font-bold text-emerald-950">
                                {typeof q.capaian === 'number' ? q.capaian.toFixed(1) : q.capaian}%
                              </span>
                              <span className={`text-[8px] font-black px-1 rounded-sm self-start uppercase mt-0.5 ${
                                q.status === "Tercapai" ? "bg-emerald-200/50 text-emerald-900" :
                                q.status === "On Track" ? "bg-amber-200/50 text-amber-900" :
                                "bg-rose-200/50 text-rose-900"
                              }`}>
                                {q.status}
                              </span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW III")}
                              className="text-left w-full p-2 rounded bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-400 hover:text-teal-700 transition flex flex-col gap-1 group cursor-pointer"
                              title="Belum dilaporkan. Klik untuk mengisi langsung."
                            >
                              <span className="text-[8px] font-bold flex items-center gap-1 text-slate-400 group-hover:text-teal-600">
                                <span className="animate-pulse text-amber-500">●</span>
                                <span>BELUM</span>
                              </span>
                              <span className="text-[9px] font-bold text-teal-850 hidden group-hover:block transition">
                                Isi Data →
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block group-hover:hidden">
                                Kosong
                              </span>
                            </button>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {(() => {
                        const q = ind.quarters["TW IV"];
                        if (q.isFilled) {
                          const isWadirFilled = q.updatedBy === session.email;
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW IV")}
                              className="text-left w-full p-2 rounded bg-emerald-50 border border-emerald-150 text-emerald-850 hover:bg-emerald-100 transition flex flex-col gap-0.5 group cursor-pointer"
                              title={`Diisi oleh: ${q.updatedBy || 'Unit'}. Klik untuk meninjau.`}
                            >
                              <span className="text-[8px] font-bold text-emerald-700 flex items-center gap-1">
                                <span>✓</span>
                                <span>{isWadirFilled ? "WADIR" : "TERISI"}</span>
                              </span>
                              <span className="text-[10.5px] font-mono font-bold text-emerald-950">
                                {typeof q.capaian === 'number' ? q.capaian.toFixed(1) : q.capaian}%
                              </span>
                              <span className={`text-[8px] font-black px-1 rounded-sm self-start uppercase mt-0.5 ${
                                q.status === "Tercapai" ? "bg-emerald-200/50 text-emerald-900" :
                                q.status === "On Track" ? "bg-amber-200/50 text-amber-900" :
                                "bg-rose-200/50 text-rose-900"
                              }`}>
                                {q.status}
                              </span>
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleViewOrEditIndicator(ind.kode, "TW IV")}
                              className="text-left w-full p-2 rounded bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-400 hover:text-teal-700 transition flex flex-col gap-1 group cursor-pointer"
                              title="Belum dilaporkan. Klik untuk mengisi langsung."
                            >
                              <span className="text-[8px] font-bold flex items-center gap-1 text-slate-400 group-hover:text-teal-600">
                                <span className="animate-pulse text-amber-500">●</span>
                                <span>BELUM</span>
                              </span>
                              <span className="text-[9px] font-bold text-teal-850 hidden group-hover:block transition">
                                Isi Data →
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block group-hover:hidden">
                                Kosong
                              </span>
                            </button>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: EDITING & INPUT LAYOUT (or normal view if not Wadir) ----------------- */}
      {(!isWadir || activeSubTab === "isi") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* 1. Left Column: list of indicators of this PJ */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">IKU yang Harus Dilaporkan</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sebagai {isWadir ? "Pimpinan" : "PJ/Verifikator"} <strong className="text-teal-900">{formatPjName(session.pjName)}</strong>, Anda dapat meninjau atau mengedit {myIndicators.length} indikator di bawah.
                </p>
              </div>

              <div className="mt-4 space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {myIndicators.map((ind) => {
                  const isActive = ind.kode === activeKode;
                  const hasTwIFilled = ind.quarters["TW I"].isFilled;
                  const hasTwIIFilled = ind.quarters["TW II"].isFilled;
                  
                  return (
                    <button
                      key={ind.kode}
                      id={`pj-ind-btn-${ind.kode.replace(".", "-").replace(/\s/g, "-")}`}
                      onClick={() => setActiveKode(ind.kode)}
                      className={`w-full p-3.5 rounded border text-left transition-all flex items-start gap-3 ${
                        isActive
                          ? "bg-teal-850 text-white border-teal-900 shadow scale-[1.01]"
                          : "bg-white hover:bg-teal-50/30 border-slate-200 hover:border-teal-200 cursor-pointer"
                      }`}
                    >
                      <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        isActive ? "bg-teal-950 text-yellow-400" : "bg-teal-50 text-teal-800"
                      }`}>
                        {ind.kode}
                      </span>
                      <div className="flex-1 space-y-1">
                        <h4 className={`font-extrabold text-xs line-clamp-2 ${isActive ? "text-white" : "text-slate-800"}`}>
                          {ind.indikatorKinerja}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px]">
                          <span className={isActive ? "text-teal-200 font-bold" : "text-slate-400 font-bold"}>Isian TW:</span>
                          <span className={`px-1 rounded-sm font-bold ${hasTwIFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-250 bg-slate-200 text-slate-400"}`}>I</span>
                          <span className={`px-1 rounded-sm font-bold ${hasTwIIFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-250 bg-slate-200 text-slate-400"}`}>II</span>
                          <span className={`px-1 rounded-sm font-bold ${ind.quarters["TW III"].isFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-250 bg-slate-200 text-slate-400"}`}>III</span>
                          <span className={`px-1 rounded-sm font-bold ${ind.quarters["TW IV"].isFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-250 bg-slate-200 text-slate-400"}`}>IV</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Centre & Right Column: Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Success Alert toast banner */}
            {showSaveSuccess && (
              <div id="save-success-banner" className="bg-emerald-50 border-s-4 border-emerald-500 p-4 rounded-xl flex items-center justify-between text-emerald-800 animate-slide-in shadow-md">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-bold text-xs">Capaian & Realisasi Berhasil Disimpan!</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Tabel IKU Konsolidasi dan Worksheet Admin langsung sinkron terupdate.</p>
                  </div>
                </div>
                <button className="text-emerald-500 hover:text-emerald-700 font-bold text-xs" onClick={() => setShowSaveSuccess(false)}>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
              
              {/* Header of input form list */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="font-mono text-[10px] font-bold bg-teal-50 border border-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">
                    {isWadir ? "Koreksi & Tinjau Pimpinan" : "Panel Kontributor PJ"}
                  </span>
                  <h2 className="text-base font-black text-slate-800 mt-1">Pelaporan Data Realisasi Formula</h2>
                </div>

                {/* Quarter Selectors for PJ form */}
                <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
                  {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(tw => (
                    <button
                      key={tw}
                      id={`form-tw-${tw.replace(" ", "-")}`}
                      type="button"
                      onClick={() => setSelectedTw(tw)}
                      className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                        selectedTw === tw
                          ? "bg-teal-850 text-white shadow"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special warning when filled by subordinate unit (Wadir View Only override) */}
              {isFilledByUnit && (
                <div className="bg-blue-50 border-s-4 border-blue-500 p-4 rounded-xl flex items-start gap-3 text-blue-800 my-4 shadow-sm animate-fade-in">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-blue-900">Mode Tinjau (Read-Only)</p>
                    <p className="text-[11.5px] text-blue-700 leading-normal font-semibold">
                      Isian laporan untuk <strong className="text-slate-900">{selectedTw}</strong> pada indikator ini telah dilaporkan oleh Unit PJ di bawah koordinasi Anda yaitu <strong className="text-slate-900">{activeInd.pj}</strong>.
                    </p>
                    <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                      Sesuai hak akses pimpinan, Anda hanya dapat melihat data dan tidak diizinkan menimpa/mengubah isian dari PJ Unit agar tidak mengacaukan basis data mereka.
                    </p>
                    {qData.updatedBy && (
                      <div className="text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-blue-100/50">
                        Oleh: {qData.updatedBy} • Terakhir diupdate: {qData.updatedAt ? new Date(qData.updatedAt).toLocaleString("id-ID") : "-"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special badge when filled by Wadir themselves */}
              {isWadir && qData.isFilled && qData.updatedBy === session.email && (
                <div className="bg-teal-50 border-s-4 border-teal-500 p-4 rounded-xl flex items-start gap-3 text-teal-800 my-4 shadow-sm animate-fade-in">
                  <CheckSquare className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-teal-900">Diisi Langsung Oleh Anda</p>
                    <p className="text-[11.5px] text-teal-700 leading-normal font-semibold">
                      Anda selaku pimpinan telah mengisi laporan ini secara mandiri. Anda bebas mengedit dan menyimpannya kembali kapan saja dengan mengeklik tombol edit di bawah.
                    </p>
                  </div>
                </div>
              )}

              <div className="py-4 bg-teal-50/40 px-4 rounded border border-teal-100 my-4">
                <h3 className="font-extrabold text-[#0f766e] text-xs">
                  [{activeInd.kode}] {activeInd.indikatorKinerja}
                </h3>
                <p className="text-xs text-slate-600 mt-1 italic font-semibold">
                  "DO: {activeInd.definisiOperasional}"
                </p>
                <div className="bg-white p-2 border border-teal-100/80 rounded mt-2 text-[10px] font-bold text-slate-700 font-mono leading-relaxed">
                  <span className="text-teal-700 font-black block mb-0.5 uppercase tracking-wide">Formula Perhitungan Realisasi:</span>
                  {activeInd.formulaPerhitungan}
                </div>
              </div>

              {/* Core Input Form */}
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. Dynamic Variables Input */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-teal-700" />
                    Kolom Input Variabel Formula ({selectedTw})
                  </h4>

                  <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-1 gap-4">
                    {activeInd.dataDibutuhkan.map((varName) => (
                      <div key={varName} className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          {varName}
                        </label>
                        <input
                          id={`input-var-${varName.replace(/\s+/g, "-")}`}
                          type="number"
                          step="any"
                          required
                          min="0"
                          disabled={isFieldDisabled}
                          placeholder="Input nominal angka..."
                          value={variableInputs[varName] !== undefined ? variableInputs[varName] : ""}
                          onChange={(e) => handleVariableChange(varName, e.target.value)}
                          className={`w-full text-sm px-3.5 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 ${
                            isFieldDisabled 
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                              : "font-black text-teal-950 bg-white"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIVE PREVIEW RECALCUATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Calculated Realisasi BOX */}
                  <div id="live-realisasi-box" className="p-4 bg-teal-50 rounded border border-teal-200">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block font-sans">Realisasi (Otomatis)</span>
                    <span className="text-2xl font-black text-teal-950 font-mono block mt-1">
                      {realisasiLabel}
                    </span>
                    <span className="text-[10px] text-teal-700 font-semibold block mt-1.5 leading-relaxed">
                      Dihitung otomatis via pembagian/penjumlahan formula PJ
                    </span>
                  </div>

                  {/* Calculated CAPAIAN & STATUS BOX */}
                  <div id="live-capaian-box" className="p-4 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest block font-sans">Capaian & Status (Otomatis)</span>
                    
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-yellow-950 font-mono">
                        {capaian.toFixed(2)}%
                      </span>
                      <span className="text-xs text-yellow-900 font-semibold">dari target {activeInd.target2026Label}</span>
                    </div>

                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] uppercase font-bold tracking-wider ${
                        liveStatus === "Tercapai" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                        liveStatus === "On Track" ? "bg-yellow-100 text-yellow-850 border border-yellow-200" :
                        "bg-red-50 text-red-800 border border-red-100"
                      }`}>
                        Status: {liveStatus}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Permasalahan & Tindak Lanjut & Link Dukung */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase block">
                    Permasalahan & Rencana Tindak Lanjut
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Permasalahan ({selectedTw})
                      </label>
                      <textarea
                        id="input-justifikasi"
                        required
                        disabled={isFieldDisabled}
                        rows={3}
                        placeholder="Contoh: Kendala keterbatasan data responden atau hambatan pengumpulan dokumen..."
                        value={justifikasi}
                        onChange={(e) => setJustifikasi(e.target.value)}
                        className={`w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 ${
                          isFieldDisabled 
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                            : "bg-white font-semibold"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Rencana Tindak Lanjut ({selectedTw})
                      </label>
                      <textarea
                        id="input-rencana-tindak-lanjut"
                        required
                        disabled={isFieldDisabled}
                        rows={3}
                        placeholder="Masukkan rencana aksi taktis untuk mengatasi permasalahan pada indikator ini..."
                        value={rencanaTindakLanjut}
                        onChange={(e) => setRencanaTindakLanjut(e.target.value)}
                        className={`w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 ${
                          isFieldDisabled 
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                            : "bg-white font-semibold"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Link URL Folder Dokumen Dukung (Google Drive / Spreadsheet)
                      </label>
                      <div className="relative">
                        <Link className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          id="input-link-dokumen"
                          type="url"
                          required
                          disabled={isFieldDisabled}
                          placeholder="https://drive.google.com/drive/folders/poltekkes-palembang/..."
                          value={linkDokumen}
                          onChange={(e) => setLinkDokumen(e.target.value)}
                          className={`w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono font-bold ${
                            isFieldDisabled 
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                              : "text-teal-950 bg-white"
                          }`}
                        />
                      </div>
                    </div>



                  </div>
                </div>

                {/* Status & Action Control */}
                <div className="space-y-4 pt-2">
                  {qData?.locked ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
                      <Lock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-red-900">Laporan Dikunci oleh Perencana</p>
                        <p className="text-[11px] text-red-700 leading-normal font-semibold">
                          Pelaporan data realisasi {selectedTw} untuk indikator ini telah dikunci oleh admin Perencana untuk proses verifikasi. Perubahan data saat ini tidak diperbolehkan.
                        </p>
                      </div>
                    </div>
                  ) : qData?.isFilled && !isLocalEditing && !isFilledByUnit ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800">
                      <span className="text-xl">✓</span>
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-emerald-900">Laporan Sudah Dilaporkan</p>
                        <p className="text-[11px] text-emerald-700 leading-normal font-semibold">
                          Data realisasi triwulan ini sudah tersimpan dengan aman dalam sistem. Silakan klik tombol <strong>"Edit Pelaporan Realisasi"</strong> di bawah jika Anda perlu melakukan penyesuaian data kembali.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {qData?.locked ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed text-xs border border-slate-300"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Pelaporan Dikunci & Selesai</span>
                      </button>
                    ) : isFilledByUnit ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed text-xs border border-slate-200"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>Hanya Tinjau (Disisi oleh Unit)</span>
                      </button>
                    ) : !isLocalEditing ? (
                      <button
                        id="btn-edit-indicator"
                        type="button"
                        onClick={() => setIsLocalEditing(true)}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow border border-amber-750 cursor-pointer text-xs transition"
                      >
                        <span>📝 Edit Pelaporan Realisasi {selectedTw}</span>
                      </button>
                    ) : (
                      <>
                        {qData?.isFilled && (
                          <button
                            type="button"
                            onClick={() => {
                              // Cancel and restore variables
                              const initialInputs: { [key: string]: number } = {};
                              activeInd.dataDibutuhkan.forEach((v) => {
                                initialInputs[v] = qData.variables[v] || 0;
                              });
                              setVariableInputs(initialInputs);
                              setJustifikasi(qData.justifikasi || "");
                              setRencanaTindakLanjut(qData.rencanaTindakLanjut || "");
                              setLinkDokumen(qData.linkDokumen || "");
                              setIsLocalEditing(false);
                            }}
                            className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-300 transition"
                          >
                            Batal Edit
                          </button>
                        )}
                        <button
                          id="btn-save-indicator"
                          type="submit"
                          className="flex-1 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow border border-teal-950 cursor-pointer text-xs tracking-wide transition"
                        >
                          <Save className="w-4 h-4 text-yellow-400" />
                          <span>Simpan Pelaporan Realisasi {selectedTw}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </form>

            </div>
          </div>

        </div>
      )}

      {/* ----------------- TAB 3: GENERATE LAPORAN (Wadir Only) ----------------- */}
      {isWadir && activeSubTab === "laporan" && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 text-teal-850">
              <Sparkles className="w-8 h-8 text-teal-800 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-slate-800">Unduh Dokumen Laporan Kinerja Utama</h3>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
              Ekspor laporan capaian indikator yang menjadi tanggung jawab binaan <strong className="text-teal-950">{formatPjName(session.pjName)}</strong> secara otomatis ke format dokumen standar Kemenkes.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 max-w-2xl mx-auto space-y-5">
            {/* Download range filter */}
            <div className="space-y-2">
              <label htmlFor="pj-report-scope-tab" className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                Pilih Cakupan Unduhan Laporan:
              </label>
              <select
                id="pj-report-scope-tab"
                value={pjReportScope}
                onChange={(e) => setPjReportScope(e.target.value as any)}
                className="text-xs p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-1 focus:ring-teal-700 focus:outline-none cursor-pointer transition w-full shadow-sm"
              >
                <option value="all">Seluruh Triwulan (Keseluruhan TW I - TW IV)</option>
                <option value="TW I">Hanya Triwulan I (TW I)</option>
                <option value="TW II">Hanya Triwulan II (TW II)</option>
                <option value="TW III">Hanya Triwulan III (TW III)</option>
                <option value="TW IV">Hanya Triwulan IV (TW IV)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Word Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="p-1.5 bg-blue-50 text-blue-800 rounded font-bold font-mono text-[9px] uppercase tracking-wider inline-block">DOCX TEMPLATE</span>
                  <h4 className="font-bold text-slate-800 text-xs">Laporan Word Tertulis</h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                    Laporan lengkap dengan cover resmi Kemenkes, bento box ringkasan eksekutif, detail worksheet capaian per indikator, dan lembar tanda tangan verifikasi SPI.
                  </p>
                </div>
                <button
                  onClick={handleDownloadDocxReport}
                  className="w-full py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md border border-blue-850 transition duration-150 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span>Download DOCX Laporan</span>
                </button>
              </div>

              {/* PPTX Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="p-1.5 bg-amber-50 text-amber-800 rounded font-bold font-mono text-[9px] uppercase tracking-wider inline-block">PPTX SLIDES</span>
                  <h4 className="font-bold text-slate-800 text-xs">Slide Presentasi PowerPoint</h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                    Draf slide presentasi otomatis dengan struktur eksekutif yang clean, infografis ringkasan, dan visualisasi tabular untuk memaparkan capaian di rapat pimpinan.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPptxReport}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md border border-amber-750 transition duration-150 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-amber-200" />
                  <span>Download Slide PPTX</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/60 text-teal-800 text-xs flex gap-3 max-w-2xl mx-auto font-medium">
            <span className="text-base mt-0.5">ℹ</span>
            <p className="leading-relaxed text-[11px] font-semibold text-teal-900">
              Setiap kali unit pelaksana Anda melakukan pembaruan isian realisasi di sistem, laporan DOCX dan presentasi PPTX akan langsung mengonsolidasikan data terbaru secara real-time. Anda tidak perlu menyalin data secara manual kembali.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
