import React, { useState, useEffect, useRef } from "react";
import { Indicator, UserSession, QuarterName } from "../types";
import { calculateRealisasi, calculateCapaian, getStatusTW } from "../utils";
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
  AlertCircle
} from "lucide-react";

interface PjBackendProps {
  indicators: Indicator[];
  session: UserSession;
  onUpdateIndicator: (updatedIndicator: Indicator) => void;
}

export default function PjBackend({ indicators, session, onUpdateIndicator }: PjBackendProps) {
  // Filter indicators that belong to this PJ
  const myIndicators = indicators.filter(ind => ind.pj === session.pjName);
  
  if (myIndicators.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800 font-sans">Tidak Ada Indikator</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Akun Anda terdaftar sebagai PJ <strong className="text-teal-900">{session.pjName || "Umum"}</strong>. 
          Namun saat ini belum ada indikator kinerja utama (IKU) yang ditugaskan ke departemen Anda dalam database instansi 2026.
        </p>
      </div>
    );
  }

  const [activeKode, setActiveKode] = useState(myIndicators[0].kode);
  const [selectedTw, setSelectedTw] = useState<QuarterName>("TW II");
  
  const activeInd = myIndicators.find(ind => ind.kode === activeKode) || myIndicators[0];
  const qData = activeInd.quarters[selectedTw];

  // Form states
  const [variableInputs, setVariableInputs] = useState<{ [varName: string]: number }>({});
  const [justifikasi, setJustifikasi] = useState("");
  const [linkDokumen, setLinkDokumen] = useState("");
  
  // File upload drag-drop state simulation
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Save notification toast state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Sync state whenever the selected indicator or selected TW changes
  useEffect(() => {
    // Collect variables
    const initialInputs: { [key: string]: number } = {};
    activeInd.dataDibutuhkan.forEach((v) => {
      initialInputs[v] = qData.variables[v] || 0;
    });

    setVariableInputs(initialInputs);
    setJustifikasi(qData.justifikasi || "");
    setLinkDokumen(qData.linkDokumen || "");
    setUploadedFiles(qData.linkDokumen ? [{ name: "Dokumen_Dukung_TW.pdf", size: "1.4 MB", status: "Uploaded" }] : []);
  }, [activeKode, selectedTw, activeInd]);

  // Handle variable change
  const handleVariableChange = (vName: string, val: string) => {
    const numericVal = parseFloat(val);
    setVariableInputs(prev => ({
      ...prev,
      [vName]: isNaN(numericVal) ? 0 : numericVal
    }));
  };

  // Perform live preview calculations
  const { realisasi, label: realisasiLabel } = calculateRealisasi(activeInd.kode, variableInputs);
  const capaian = calculateCapaian(activeInd.kode, realisasi, activeInd.target2026);
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

    // Create deep copy of active indicator and modify of selected TW data
    const updatedIndicator: Indicator = JSON.parse(JSON.stringify(activeInd));
    
    updatedIndicator.quarters[selectedTw] = {
      isFilled: true,
      variables: variableInputs,
      realisasi,
      realisasiLabel,
      capaian,
      status: liveStatus,
      justifikasi,
      linkDokumen,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email
    };

    onUpdateIndicator(updatedIndicator);
    
    // Show beautiful banner
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* 1. Left Column: list of indicators of this PJ */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">IKU yang Harus Dilaporkan</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Sebagai PJ <strong className="text-teal-900">{session.pjName}</strong>, Anda bertanggung jawab mengisi data untuk {myIndicators.length} indikator ini.
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
                      ? "bg-teal-800 text-white border-teal-850 shadow-md scale-[1.01]"
                      : "bg-white hover:bg-teal-50/30 border-slate-200 hover:border-teal-200"
                  }`}
                >
                  <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                    isActive ? "bg-teal-950 text-yellow-400" : "bg-teal-50 text-teal-850 text-teal-800"
                  }`}>
                    {ind.kode}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h4 className={`font-extrabold text-xs line-clamp-2 ${isActive ? "text-white" : "text-slate-800"}`}>
                      {ind.indikatorKinerja}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px]">
                      <span className={isActive ? "text-teal-200" : "text-slate-400 font-bold"}>Isian TW:</span>
                      <span className={`px-1 rounded-sm font-bold ${hasTwIFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-200 text-slate-400"}`}>I</span>
                      <span className={`px-1 rounded-sm font-bold ${hasTwIIFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-200 text-slate-400"}`}>II</span>
                      <span className={`px-1 rounded-sm font-bold ${ind.quarters["TW III"].isFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-200 text-slate-400"}`}>III</span>
                      <span className={`px-1 rounded-sm font-bold ${ind.quarters["TW IV"].isFilled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-200 text-slate-400"}`}>IV</span>
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
                <p className="text-[10px] text-emerald-700">Tabel IKU Konsolidasi dan Worksheet Admin langsung sinkron terupdate.</p>
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
                Panel Kontributor PJ
              </span>
              <h2 className="text-base font-extrabold text-slate-800 mt-1">Pelaporan Data Realisasi Formula</h2>
            </div>

            {/* Quarter Selectors for PJ form */}
            <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
              {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(tw => (
                <button
                  key={tw}
                  id={`form-tw-${tw.replace(" ", "-")}`}
                  type="button"
                  onClick={() => setSelectedTw(tw)}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                    selectedTw === tw
                      ? "bg-teal-800 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tw}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 bg-teal-50/40 px-4 rounded border border-teal-100 my-4">
            <h3 className="font-extrabold text-[#0f766e] text-xs">
              [{activeInd.kode}] {activeInd.indikatorKinerja}
            </h3>
            <p className="text-xs text-slate-600 mt-1 italic font-medium">
              "DO: {activeInd.definisiOperasional}"
            </p>
            <div className="bg-white p-2 border border-teal-100/80 rounded mt-2 text-[10px] font-semibold text-slate-700 font-mono">
              <span className="text-teal-700 font-bold block mb-0.5">FORMULA PERHITUNGAN REALISASI:</span>
              {activeInd.formulaPerhitungan}
            </div>
          </div>

          {/* Core Input Form */}
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Dynamic Variables Input */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
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
                      placeholder="Input nominal angka..."
                      value={variableInputs[varName] !== undefined ? variableInputs[varName] : ""}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-bold text-teal-950 bg-white"
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
                <span className="text-2xl font-extrabold text-teal-950 font-mono block mt-1">
                  {realisasiLabel}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold block mt-1.5">
                  Dihitung otomatis via pembagian/penjumlahan formula PJ
                </span>
              </div>

              {/* Calculated CAPAIAN & STATUS BOX */}
              <div id="live-capaian-box" className="p-4 bg-yellow-50 rounded border border-yellow-250 border-yellow-200">
                <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest block font-sans">Capaian & Status (Otomatis)</span>
                
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-yellow-950 font-mono">
                    {capaian.toFixed(2)}%
                  </span>
                  <span className="text-xs text-yellow-905 text-yellow-900 font-semibold">dari target {activeInd.target2026Label}</span>
                </div>

                <div className="mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] uppercase font-bold tracking-wider ${
                    liveStatus === "Tercapai" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                    liveStatus === "On Track" ? "bg-yellow-101 bg-yellow-100 text-yellow-850 border border-yellow-205 border-yellow-200" :
                    "bg-red-50 text-red-850 text-red-800 border border-red-100 animate-pulse"
                  }`}>
                    Status: {liveStatus}
                  </span>
                </div>
              </div>

            </div>

            {/* Justifikasi & Link Dukung */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase block">
                Pernyataan Dukung & Justifikasi
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Justifikasi / Keterangan Pencapaian ({selectedTw})
                  </label>
                  <textarea
                    id="input-justifikasi"
                    required
                    rows={3}
                    placeholder="Contoh: Proses Tracer Study sedang dipicu beriringan dengan pengumpulan laporan LTA..."
                    value={justifikasi}
                    onChange={(e) => setJustifikasi(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-medium"
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
                      placeholder="https://drive.google.com/drive/folders/poltekkes-palembang/..."
                      value={linkDokumen}
                      onChange={(e) => setLinkDokumen(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 bg-white rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono font-bold text-teal-950"
                    />
                  </div>
                </div>

                {/* Simulated file upload area matching "File Upload" requirements */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Unggah Bukti Laporan Digital (Simulasi PDF/Excel)
                  </label>
                  <div
                    id="dropzone"
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? "border-teal-700 bg-teal-50/50" 
                        : "border-slate-200 hover:border-teal-600 bg-slate-50 hover:bg-teal-50/10 text-slate-600"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.xlsx,.csv,.doc,.docx"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Tarik & Lepaskan dokumen di sini</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">atau klik untuk menelusuri folder komputer (.pdf, .xlsx up to 10MB)</p>
                  </div>

                  {/* Upload Progress Simulation */}
                  {isUploading && (
                    <div className="mt-3 bg-teal-50 p-3 rounded border border-teal-150 mx-1">
                      <div className="flex justify-between items-center text-[10px] text-teal-905 text-teal-900 font-bold mb-1">
                        <span>Mengunggah berkas secara aman...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-teal-200/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-700 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Uploaded lists */}
                  {uploadedFiles.length > 0 && !isUploading && (
                    <div className="mt-3 space-y-1">
                      {uploadedFiles.map(f => (
                        <div key={f.name} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-2.5 mx-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1 bg-emerald-200 text-emerald-800 rounded text-xs font-mono">PDF</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{f.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold font-sans">Ukuran file: {f.size} • Berhasil diunggah ke Google Drive</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setUploadedFiles([]); }}
                            className="text-[10px] text-red-650 text-red-600 hover:underline font-bold font-sans"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <button
              id="btn-save-indicator"
              type="submit"
              className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-extrabold rounded transition duration-150 flex items-center justify-center gap-2 shadow border border-teal-950 font-bold tracking-wide cursor-pointer text-sm"
            >
              <Save className="w-4 h-4" />
              Simpan Pelaporan Realisasi {selectedTw}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}
