import React, { useState } from "react";
import { Indicator, QuarterName } from "../types";
import { getStatusTW, convertToIndonesianCSV, getTargetLabel, getTargetValue } from "../utils";
import { generateDocxReport, generatePptxReport } from "../utils/reportGenerator";
import { 
  Download, 
  Search, 
  Filter, 
  HelpCircle, 
  ExternalLink,
  Table,
  CheckCircle2,
  FolderLock,
  Building,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Presentation
} from "lucide-react";

interface AdminPanelProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  onSelectIndicator: (kode: string) => void;
  onAddIndicator?: (indicator: Indicator) => void;
  onUpdateIndicator?: (indicator: Indicator) => void;
  onDeleteIndicator?: (kode: string, year: number) => void;
  onCopyTemplates?: (targetYear: number) => void;
  selectedYear: number;
}

export default function AdminPanel({ 
  indicators, 
  selectedQuarter, 
  onSelectIndicator,
  onAddIndicator,
  onUpdateIndicator,
  onDeleteIndicator,
  onCopyTemplates,
  selectedYear
}: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pjFilter, setPjFilter] = useState("Semua");
  const [wadirFilter, setWadirFilter] = useState("Semua");
  const [activeTab, setActiveTab] = useState<"rekap" | "worksheet" | "summary" | "manage">("rekap");

  // Master Management states
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmKode, setDeleteConfirmKode] = useState<string | null>(null);

  // Form states
  const [formNo, setFormNo] = useState(1);
  const [formKode, setFormKode] = useState("");
  const [formIndikatorKinerja, setFormIndikatorKinerja] = useState("");
  const [formDefinisiOperasional, setFormDefinisiOperasional] = useState("");
  const [formFormulaPerhitungan, setFormFormulaPerhitungan] = useState("");
  const [formVariablesText, setFormVariablesText] = useState("");
  const [formTarget, setFormTarget] = useState<number>(0);
  const [formTargetLabel, setFormTargetLabel] = useState("");
  const [formSatuan, setFormSatuan] = useState("");
  const [formPj, setFormPj] = useState("");
  const [formPjWadir, setFormPjWadir] = useState("Wadir 1");
  const [formTahun, setFormTahun] = useState(selectedYear);

  // Custom Penanggung Jawab Sektor states
  const [formPjType, setFormPjType] = useState<"select" | "custom">("select");
  const [customPjValue, setCustomPjValue] = useState("");

  // Download Worksheet filters state
  const [downloadScope, setDownloadScope] = useState<"all" | "TW I" | "TW II" | "TW III" | "TW IV">("all");

  // Form errors
  const [formError, setFormError] = useState("");

  const handleStartEdit = (ind: Indicator) => {
    setEditingIndicator(ind);
    setIsEditing(true);
    setIsAdding(false);
    setFormError("");
    setDeleteConfirmKode(null);

    setFormNo(ind.no);
    setFormKode(ind.kode);
    setFormIndikatorKinerja(ind.indikatorKinerja);
    setFormDefinisiOperasional(ind.definisiOperasional);
    setFormFormulaPerhitungan(ind.formulaPerhitungan);
    setFormVariablesText(ind.dataDibutuhkan ? ind.dataDibutuhkan.join(", ") : "");
    setFormTarget(ind.target !== undefined ? ind.target : ind.target2026);
    setFormTargetLabel(ind.targetLabel !== undefined ? ind.targetLabel : ind.target2026Label);
    setFormSatuan(ind.satuan);
    setFormPj(ind.pj);
    setFormPjWadir(ind.pjWadir);
    setFormTahun(ind.tahun || 2026);

    const standardPjs = ["Alumni dan Kerjasama", "Keuangan", "Akademik", "P2M", "Kepegawaian", "UPM", "Pengembangan Bahasa", "Kemahasiswaan", "SPI", "UPR", "Umum"];
    if (standardPjs.includes(ind.pj)) {
      setFormPjType("select");
      setFormPj(ind.pj);
      setCustomPjValue("");
    } else {
      setFormPjType("custom");
      setFormPj("Akademik"); // Fallback select
      setCustomPjValue(ind.pj);
    }

    setTimeout(() => {
      const formEl = document.getElementById("indicator-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 80);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setEditingIndicator(null);
    setFormError("");
    setDeleteConfirmKode(null);

    // Auto calculate next number
    const maxNo = indicators.length > 0 ? Math.max(...indicators.map(i => i.no)) : 0;
    setFormNo(maxNo + 1);
    setFormKode("");
    setFormIndikatorKinerja("");
    setFormDefinisiOperasional("");
    setFormFormulaPerhitungan("");
    setFormVariablesText("");
    setFormTarget(0);
    setFormTargetLabel("");
    setFormSatuan("%");
    setFormPj("Akademik");
    setFormPjWadir("Wadir 1");
    setFormTahun(selectedYear);
    setFormPjType("select");
    setCustomPjValue("");

    setTimeout(() => {
      const formEl = document.getElementById("indicator-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 80);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingIndicator(null);
    setFormError("");
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formKode.trim()) {
      setFormError("Kode IKU wajib diisi (contoh: IKM 17.3.15).");
      return;
    }
    if (!formIndikatorKinerja.trim()) {
      setFormError("Nama Indikator Kinerja Utama wajib diisi.");
      return;
    }
    if (!formTargetLabel.trim()) {
      setFormError("Tampilan Target wajib diisi (contoh: 85% atau 12 Prestasi).");
      return;
    }

    const variables = formVariablesText
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);

    if (variables.length === 0) {
      setFormError("Minimal isikan 1 variabel data yang dibutuhkan (contoh: Jumlah lulusan, Jumlah mahasiswa).");
      return;
    }

    let quartersData = editingIndicator ? editingIndicator.quarters : {
      "TW I": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "", capaian: 0, status: "Belum Diisi" as const, justifikasi: "", linkDokumen: "" },
      "TW II": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "", capaian: 0, status: "Belum Diisi" as const, justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "", capaian: 0, status: "Belum Diisi" as const, justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "", capaian: 0, status: "Belum Diisi" as const, justifikasi: "", linkDokumen: "" }
    };

    // Ensure variable structures exist in each quarter
    const updatedQuarters = JSON.parse(JSON.stringify(quartersData));
    (["TW I", "TW II", "TW III", "TW IV"] as const).forEach(tw => {
      const q = updatedQuarters[tw];
      if (!q.variables) q.variables = {};
      variables.forEach(v => {
        if (q.variables[v] === undefined) {
          q.variables[v] = 0;
        }
      });
    });

    const finalPj = formPjType === "custom" ? customPjValue.trim() : formPj.trim();
    if (!finalPj) {
      setFormError("Penanggung Jawab (PJ) Sektor wajib dipilih atau diisi.");
      return;
    }

    const finalIndicator: Indicator = {
      no: Number(formNo),
      kode: formKode.trim(),
      indikatorKinerja: formIndikatorKinerja.trim(),
      definisiOperasional: formDefinisiOperasional.trim(),
      formulaPerhitungan: formFormulaPerhitungan.trim(),
      dataDibutuhkan: variables,
      target2026: Number(formTarget),
      target2026Label: formTargetLabel.trim(),
      target: Number(formTarget),
      targetLabel: formTargetLabel.trim(),
      satuan: formSatuan.trim(),
      pj: finalPj,
      pjWadir: formPjWadir,
      quarters: updatedQuarters,
      tahun: Number(formTahun)
    };

    if (isEditing && onUpdateIndicator) {
      onUpdateIndicator(finalIndicator);
    } else if (isAdding && onAddIndicator) {
      onAddIndicator(finalIndicator);
    }

    setIsAdding(false);
    setIsEditing(false);
    setEditingIndicator(null);
  };

  const handleDelete = (kode: string, year: number) => {
    if (onDeleteIndicator) {
      onDeleteIndicator(kode, year);
    }
    setDeleteConfirmKode(null);
  };

  // Apply search & filter
  const filteredIndicators = indicators.filter(ind => {
    const matchesSearch = 
      ind.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.indikatorKinerja.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPj = pjFilter === "Semua" || ind.pj === pjFilter;
    const matchesWadir = wadirFilter === "Semua" || ind.pjWadir === wadirFilter;

    return matchesSearch && matchesPj && matchesWadir;
  });

  // Extract unique filter lists
  const uniquePJs = Array.from(new Set(indicators.map(i => i.pj))).sort();
  const uniqueWadirs = Array.from(new Set(indicators.map(i => i.pjWadir))).sort();

  // Handle download of Worksheet
  const handleDownloadWorksheet = () => {
    const csvContent = convertToIndonesianCSV(indicators, downloadScope);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    let suffix = "Keseluruhan";
    if (downloadScope === "TW I") suffix = "Triwulan_I";
    else if (downloadScope === "TW II") suffix = "Triwulan_II";
    else if (downloadScope === "TW III") suffix = "Triwulan_III";
    else if (downloadScope === "TW IV") suffix = "Triwulan_IV";

    link.setAttribute("download", `Worksheet_PANTAU_IKU_Poltekkes_Palembang_${suffix}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle generating Word Report
  const handleDownloadDocxReport = async () => {
    try {
      const blob = await generateDocxReport(
        indicators,
        downloadScope,
        "Laporan Kinerja Utama Poltekkes Palembang",
        `Laporan Evaluasi Capaian Indikator Kinerja Utama (IKU) - Tahun ${selectedYear}`,
        "Admin Perencana & Evaluasi"
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      let suffix = "Keseluruhan";
      if (downloadScope === "TW I") suffix = "Triwulan_I";
      else if (downloadScope === "TW II") suffix = "Triwulan_II";
      else if (downloadScope === "TW III") suffix = "Triwulan_III";
      else if (downloadScope === "TW IV") suffix = "Triwulan_IV";

      link.setAttribute("download", `Laporan_IKU_Poltekkes_Palembang_${suffix}_${selectedYear}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal generate DOCX:", err);
      alert("Gagal men-generate laporan Word.");
    }
  };

  // Handle generating PowerPoint Report
  const handleDownloadPptxReport = async () => {
    try {
      await generatePptxReport(
        indicators,
        downloadScope,
        "Laporan Capaian Indikator Kinerja Utama",
        `Poltekkes Kemenkes Palembang - Tahun ${selectedYear}`,
        "Admin Perencana & Evaluasi"
      );
    } catch (err) {
      console.error("Gagal generate PPTX:", err);
      alert("Gagal men-generate presentasi PowerPoint.");
    }
  };

  // Status statistics for summary
  const totalCount = indicators.length;
  const getQuarterStats = (tw: QuarterName) => {
    let filled = 0, warning = 0, ontrack = 0, tercapai = 0;
    indicators.forEach(i => {
      const q = i.quarters[tw];
      if (q.isFilled) {
        filled++;
        const s = getStatusTW(tw, q.capaian, true);
        if (s === "Tercapai") tercapai++;
        else if (s === "On Track") ontrack++;
        else warning++;
      }
    });
    return { filled, warning, ontrack, tercapai, empty: totalCount - filled };
  };

  const tw1Stats = getQuarterStats("TW I");
  const tw2Stats = getQuarterStats("TW II");
  const tw3Stats = getQuarterStats("TW III");
  const tw4Stats = getQuarterStats("TW IV");

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* 1. Admin Header & Download Button */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-yellow-50 text-yellow-800 font-bold border border-yellow-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1">
              <FolderLock className="w-3.5 h-3.5" /> Konsol Administrator Perencana
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">ID: SECURE-WORK-78A</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mt-1.5">Worksheet Pemantauan dan Konsolidasi Data Realisasi</h2>
          <p className="text-xs text-slate-500 mt-1">Unduh worksheet induk, kelola akurasi entri penanggung jawab, dan pantau milestone.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-3.5 flex-wrap">
          <div className="flex flex-col gap-1 w-full lg:w-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Filter Cakupan Unduhan:</span>
            <select
              id="select-download-scope"
              value={downloadScope}
              onChange={(e) => setDownloadScope(e.target.value as any)}
              className="text-xs p-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-700 focus:ring-1 focus:ring-teal-700 focus:outline-none cursor-pointer transition-colors min-w-[200px]"
            >
              <option value="all">Keseluruhan (TW I - TW IV)</option>
              <option value="TW I">Hanya Triwulan I (TW I)</option>
              <option value="TW II">Hanya Triwulan II (TW II)</option>
              <option value="TW III">Hanya Triwulan III (TW III)</option>
              <option value="TW IV">Hanya Triwulan IV (TW IV)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button
              id="btn-download-worksheet"
              onClick={handleDownloadWorksheet}
              title="Unduh data bentuk CSV/Excel"
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded flex items-center justify-center gap-2 shadow border border-teal-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer h-[38px]"
            >
              <Download className="w-4 h-4 text-yellow-450 text-yellow-400" />
              <span>Worksheet (CSV)</span>
            </button>

            <button
              id="btn-download-docx"
              onClick={handleDownloadDocxReport}
              title="Unduh laporan narasi lengkap Word (DOCX)"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded flex items-center justify-center gap-2 shadow border border-blue-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer h-[38px]"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Laporan (DOCX)</span>
            </button>

            <button
              id="btn-download-pptx"
              onClick={handleDownloadPptxReport}
              title="Unduh deck slide presentasi PowerPoint (PPTX)"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded flex items-center justify-center gap-2 shadow border border-amber-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer h-[38px]"
            >
              <Presentation className="w-4 h-4 text-amber-200" />
              <span>Presentasi (PPTX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Dashboard View Selection (Worksheet, Summary, or Manage) */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 max-w-2xl shadow-sm">
        <button
          id="tab-btn-rekap-view"
          onClick={() => setActiveTab("rekap")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "rekap"
              ? "bg-teal-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Rekapitulasi Isian Unit
        </button>
        <button
          id="tab-btn-worksheet-view"
          onClick={() => setActiveTab("worksheet")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "worksheet"
              ? "bg-teal-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Worksheet Tabel Induk
        </button>
        <button
          id="tab-btn-summary-view"
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "summary"
              ? "bg-teal-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Status Pengisian (PJ)
        </button>
        <button
          id="tab-btn-manage-view"
          onClick={() => setActiveTab("manage")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "manage"
              ? "bg-teal-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Kelola Master IKU ({selectedYear})
        </button>
      </div>

      {activeTab === "rekap" ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Rincian Kepatuhan Pengisian Unit (Seluruh Indikator)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pantau progres dan kelengkapan input data realisasi IKU oleh seluruh Unit Pelaksana secara real-time.
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
              const filled = indicators.filter(ind => ind.quarters[tw].isFilled).length;
              const total = indicators.length;
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

          {/* Table Filters header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                id="rekap-search"
                type="text"
                placeholder="Cari Kode atau Indikator Kinerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 text-gray-400" />
                <select
                  id="rekap-pj-filter"
                  value={pjFilter}
                  onChange={(e) => setPjFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700"
                >
                  <option value="Semua">Unit PJ: Semua</option>
                  {uniquePJs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <select
                  id="rekap-wadir-filter"
                  value={wadirFilter}
                  onChange={(e) => setWadirFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700"
                >
                  <option value="Semua">Pembina: Semua Wadir</option>
                  {uniqueWadirs.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Big Rekap Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[600px]">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100 font-sans font-bold text-slate-600 uppercase text-[10px] tracking-wider sticky top-0 z-10">
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
                {filteredIndicators.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold">
                      Tidak ada hasil yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredIndicators.map((ind) => (
                    <tr key={ind.kode} className="hover:bg-slate-50/50 transition">
                      {/* Kode */}
                      <td className="px-4 py-4 text-center whitespace-nowrap font-mono font-bold text-[10px]">
                        <span className="bg-teal-50 text-teal-800 border border-teal-100 px-2.5 py-0.5 rounded">
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
                      {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map((tw) => {
                        const q = ind.quarters[tw];
                        if (q.isFilled) {
                          const isWadirFilled = q.updatedBy && q.updatedBy.toLowerCase().includes("wadir");
                          return (
                            <td key={tw} className="px-3 py-4 text-center">
                              <button
                                onClick={() => onSelectIndicator(ind.kode)}
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
                            </td>
                          );
                        } else {
                          return (
                            <td key={tw} className="px-3 py-4 text-center">
                              <button
                                onClick={() => onSelectIndicator(ind.kode)}
                                className="text-left w-full p-2 rounded bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-400 hover:text-teal-700 transition flex flex-col gap-1 group cursor-pointer"
                                title="Belum dilaporkan. Klik untuk meninjau detail."
                              >
                                <span className="text-[8px] font-bold flex items-center gap-1 text-slate-400 group-hover:text-teal-600">
                                  <span className="animate-pulse text-amber-500">●</span>
                                  <span>BELUM</span>
                                </span>
                                <span className="text-[9px] font-bold text-teal-850 hidden group-hover:block transition">
                                  Detail →
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 block group-hover:hidden">
                                  Kosong
                                </span>
                              </button>
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "worksheet" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          
          {/* Table Filters header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                id="worksheet-search"
                type="text"
                placeholder="Cari Kode atau Indikator Kinerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 text-gray-400" />
                <select
                  id="worksheet-pj-filter"
                  value={pjFilter}
                  onChange={(e) => setPjFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700"
                >
                  <option value="Semua">Unit PJ: Semua</option>
                  {uniquePJs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <select
                  id="worksheet-wadir-filter"
                  value={wadirFilter}
                  onChange={(e) => setWadirFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700"
                >
                  <option value="Semua">Pembina: Semua Wadir</option>
                  {uniqueWadirs.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Core spreadsheet table */}
          <div className="overflow-x-auto border border-gray-150 rounded-xl max-h-[500px]">
            <table className="w-full text-xs text-left border-collapse select-text">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-3 font-semibold text-center w-10">No</th>
                  <th className="px-3 py-3 font-semibold">Kode</th>
                  <th className="px-4 py-3 font-semibold min-w-[280px]">Indikator Kinerja Utama</th>
                  <th className="px-3 py-3 font-semibold text-center">Satuan</th>
                  <th className="px-3 py-3 font-semibold text-right">Target {selectedYear}</th>
                  <th className="px-3 py-3 font-semibold bg-teal-50 text-teal-900 border-l border-teal-100 text-center">TW I Real</th>
                  <th className="px-3 py-3 font-semibold bg-teal-50 text-teal-900 text-center">TW I Capai</th>
                  <th className="px-3 py-3 font-semibold bg-lime-50 text-lime-900 border-l border-lime-100 text-center">TW II Real</th>
                  <th className="px-3 py-3 font-semibold bg-lime-50 text-lime-900 text-center">TW II Capai</th>
                  <th className="px-3 py-3 font-semibold bg-blue-50 text-blue-900 border-l border-blue-100 text-center">TW III Real</th>
                  <th className="px-3 py-3 font-semibold bg-blue-50 text-blue-900 text-center">TW III Capai</th>
                  <th className="px-3 py-3 font-semibold bg-amber-50 text-amber-900 border-l border-amber-100 text-center">TW IV Real</th>
                  <th className="px-3 py-3 font-semibold bg-amber-50 text-amber-900 text-center">TW IV Capai</th>
                  <th className="px-4 py-3 font-semibold">PJ Sektor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {filteredIndicators.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-400 font-bold">
                      Tidak ada hasil yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredIndicators.map((ind) => (
                    <tr 
                      key={ind.kode} 
                      className="hover:bg-teal-50/10 cursor-pointer transition-colors"
                      onClick={() => onSelectIndicator(ind.kode)}
                    >
                      <td className="px-3 py-3 text-center text-gray-500 font-semibold">{ind.no}</td>
                      <td className="px-3 py-3 font-semibold text-teal-800 font-mono">{ind.kode}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        <p className="line-clamp-2" title={ind.indikatorKinerja}>{ind.indikatorKinerja}</p>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500 font-semibold">{ind.satuan}</td>
                      <td className="px-3 py-3 text-right font-bold text-gray-950 font-mono whitespace-nowrap">{getTargetLabel(ind)}</td>
                      
                      {/* Quarters looping */}
                      {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map((tw, index) => {
                        const q = ind.quarters[tw];
                        const liveStatus = getStatusTW(tw, q.capaian, q.isFilled);
                        const bgCol = index === 0 ? "bg-teal-50/20" : index === 1 ? "bg-lime-50/20" : index === 2 ? "bg-blue-50/20" : "bg-amber-50/20";
                        const borderCol = index > 0 ? "border-l border-gray-150" : "border-l border-gray-100";
                        
                        return (
                          <React.Fragment key={tw}>
                            <td className={`px-2 py-3 text-center font-bold text-gray-800 font-mono whitespace-nowrap ${bgCol} ${borderCol}`}>
                              {q.isFilled ? q.realisasiLabel : "-"}
                            </td>
                            <td className={`px-2 py-3 text-center font-mono ${bgCol}`}>
                              {q.isFilled ? (
                                <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10.5px] ${
                                  liveStatus === "Tercapai" ? "bg-emerald-100 text-emerald-800" :
                                  liveStatus === "On Track" ? "bg-lime-100 text-lime-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {q.capaian.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-300 font-medium text-[10px]">Belum</span>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{ind.pj}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-2 p-1 pt-2">
            <span>Tabel mencakup {filteredIndicators.length} IKU Poltekkes Palembang aktif tahun anggaran {selectedYear}.</span>
            <span className="flex items-center gap-1.5 font-bold text-teal-800">
              <CheckCircle2 className="w-4.5 h-4.5 text-teal-600" /> Mode Worksheet Sinkronisasi Lokal
            </span>
          </div>

        </div>
      ) : activeTab === "summary" ? (
        <div className="space-y-6">
          {/* Status Penyelesaian Laporan summary view */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "TW I", stats: tw1Stats, style: "from-teal-700 to-teal-900 border-teal-600" },
              { name: "TW II", stats: tw2Stats, style: "from-lime-700 to-lime-900 border-lime-600" },
              { name: "TW III", stats: tw3Stats, style: "from-blue-700 to-blue-900 border-blue-600" },
              { name: "TW IV", stats: tw4Stats, style: "from-amber-700 to-amber-900 border-amber-600" }
            ].map((qGroup) => {
              const filledPercent = Number((qGroup.stats.filled / totalCount * 100).toFixed(0));
              
              return (
                <div key={qGroup.name} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                    <span className="font-bold text-gray-900 text-sm">Status {qGroup.name}</span>
                    <span className="text-xs font-bold text-gray-500">Milestone {selectedYear}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Progres Pengisian PJ</span>
                        <span>{qGroup.stats.filled} / {totalCount} IKU ({filledPercent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-2" style={{ width: `${filledPercent}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tercapai (100%):</span>
                        <strong className="text-emerald-600">{qGroup.stats.tercapai} IKU</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">On Track (Triwulan):</span>
                        <strong className="text-lime-600">{qGroup.stats.ontrack} IKU</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Perlu Perhatian (Warning):</span>
                        <strong className="text-red-500">{qGroup.stats.warning} IKU</strong>
                      </div>
                      <div className="flex justify-between font-bold text-gray-700 pt-1 border-t border-gray-150">
                        <span>Belum Dilaporkan:</span>
                        <span>{qGroup.stats.empty} IKU</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Lock Management Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <FolderLock className="w-4.5 h-4.5 text-teal-800" />
                <span>Penguncian Laporan Realisasi Triwulan (Admin Perencana)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kunci laporan yang sudah diisi oleh PJ agar data menjadi permanen dan tidak dapat diedit kembali oleh kontributor unit tanpa persetujuan Perencana.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">No</th>
                    <th className="px-3 py-3 w-20">Kode</th>
                    <th className="px-4 py-3 min-w-[280px]">Indikator Utama &amp; PJ Sektor</th>
                    <th className="px-4 py-3 text-center w-36 bg-teal-50/50 text-teal-900 border-l border-teal-100">TW I</th>
                    <th className="px-4 py-3 text-center w-36 bg-lime-50/50 text-lime-900 border-l border-lime-100">TW II</th>
                    <th className="px-4 py-3 text-center w-36 bg-blue-50/50 text-blue-900 border-l border-blue-100">TW III</th>
                    <th className="px-4 py-3 text-center w-36 bg-amber-50/50 text-amber-900 border-l border-amber-100">TW IV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {filteredIndicators.map((ind) => (
                    <tr key={ind.kode} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3.5 text-center text-slate-500 font-semibold">{ind.no}</td>
                      <td className="px-3 py-3.5 font-bold text-teal-850 font-mono">{ind.kode}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800 leading-tight">{ind.indikatorKinerja}</p>
                        <p className="text-[10px] text-teal-700 font-semibold mt-1 font-mono">PJ: {ind.pj}</p>
                      </td>
                      
                      {/* Quarters Lock Toggle */}
                      {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map((tw, index) => {
                        const q = ind.quarters[tw];
                        const isLocked = q?.locked === true;
                        const isFilled = q?.isFilled === true;
                        
                        const bgCol = index === 0 ? "bg-teal-50/10" : index === 1 ? "bg-lime-50/10" : index === 2 ? "bg-blue-50/10" : "bg-amber-50/10";
                        const borderCol = "border-l border-slate-150";

                        return (
                          <td key={tw} className={`px-3 py-3.5 text-center ${bgCol} ${borderCol}`}>
                            <div className="flex flex-col items-center gap-1.5">
                              {/* Status badge */}
                              {isFilled ? (
                                <span className="px-1.5 py-0.5 rounded-full font-bold text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Sudah Diisi
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full font-semibold text-[9px] bg-slate-100 text-slate-400 border border-slate-200">
                                  Belum Diisi
                                </span>
                              )}

                              {/* Toggle lock button */}
                              {onUpdateIndicator ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = JSON.parse(JSON.stringify(ind)) as Indicator;
                                    updated.quarters[tw].locked = !isLocked;
                                    onUpdateIndicator(updated);
                                  }}
                                  className={`w-full max-w-[120px] px-2.5 py-1 rounded text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition border cursor-pointer ${
                                    isLocked
                                      ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                                      : isFilled
                                      ? "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                                      : "bg-white text-slate-400 hover:bg-slate-50 border-slate-200 cursor-pointer"
                                  }`}
                                  title={isLocked ? "Buka kunci laporan" : "Kunci laporan agar tidak bisa diubah"}
                                >
                                  {isLocked ? (
                                    <>
                                      <Lock className="w-2.5 h-2.5 text-red-600 shrink-0" />
                                      <span>Terkunci</span>
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                      <span>Terbuka</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-[10.5px] text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 p-2.5 rounded border border-slate-150">
              <span className="text-amber-600 font-bold">Catatan Perencana:</span>
              <span>Laporan yang dikunci akan ditandai dengan label Terkunci 🔒. Unit PJ bersangkutan tidak akan bisa melakukan pengisian atau perubahan realisasi triwulan sampai kunci dibuka kembali.</span>
            </div>
          </div>
        </div>
      ) : activeTab === "manage" ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
          
          {/* Header Action with Tambah Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-teal-800" /> Kelola Daftar Indikator Utama (Tahun Anggaran {selectedYear})
              </h3>
              <p className="text-xs text-slate-500 mt-1">Tambahkan indikator baru, sesuaikan formula, target, dan Penanggung Jawab (PJ) sektor untuk laporan.</p>
            </div>
            
            {!isAdding && !isEditing && (
              <button
                onClick={handleStartAdd}
                className="px-4 py-2 bg-emerald-750 bg-emerald-850 bg-emerald-700 hover:bg-emerald-850 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Indikator Baru</span>
              </button>
            )}
          </div>

          {/* Error notice if any */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Editor Block */}
          {(isAdding || isEditing) && (
            <form id="indicator-form" onSubmit={handleSaveForm} className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-teal-700" /> 
                  {isAdding ? "Buat Indikator Kinerja Baru" : `Edit Detail Indikator: ${editingIndicator?.kode}`}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* No Urut */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">No. Urut</label>
                  <input
                    type="number"
                    value={formNo}
                    onChange={(e) => setFormNo(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                    required
                  />
                </div>

                {/* Kode Indikator */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Kode Indikator (Unique Key)</label>
                  <input
                    type="text"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="Contoh: IKM 17.3.15"
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-semibold uppercase font-mono"
                    disabled={isEditing} // Kode cannot be updated once saved as it's the identifier
                    required
                  />
                </div>

                {/* Tahun */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Tahun Anggaran</label>
                  <select
                    value={formTahun}
                    onChange={(e) => setFormTahun(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-bold text-slate-700"
                  >
                    {[2026, 2027, 2028, 2029, 2030].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Satuan */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Satuan (Contoh: %, orang, dokumen)</label>
                  <input
                    type="text"
                    value={formSatuan}
                    onChange={(e) => setFormSatuan(e.target.value)}
                    placeholder="%"
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Indikator Text */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-600 block">Nama Indikator Kinerja Utama</label>
                <textarea
                  value={formIndikatorKinerja}
                  onChange={(e) => setFormIndikatorKinerja(e.target.value)}
                  placeholder="Isikan nama lengkap indikator..."
                  rows={2}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Definisi Operasional */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-600 block">Definisi Operasional (DO)</label>
                <textarea
                  value={formDefinisiOperasional}
                  onChange={(e) => setFormDefinisiOperasional(e.target.value)}
                  placeholder="Isikan pengertian, ruang lingkup, pembatasan dan batasan ukur..."
                  rows={2}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                />
              </div>

              {/* Formula */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-600 block">Formula Perhitungan Realisasi</label>
                <input
                  type="text"
                  value={formFormulaPerhitungan}
                  onChange={(e) => setFormFormulaPerhitungan(e.target.value)}
                  placeholder="Contoh: (Variabel A / Variabel B) x 100%"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                />
              </div>

              {/* Variables */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-600 block">
                  Variabel Data yang Dibutuhkan <span className="text-red-600 font-bold">*</span> (Pisahkan dengan tanda Koma jika lebih dari satu)
                </label>
                <input
                  type="text"
                  value={formVariablesText}
                  onChange={(e) => setFormVariablesText(e.target.value)}
                  placeholder="Contoh: Jumlah Lulusan Bekerja, Total Seluruh Lulusan"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium"
                  required
                />
                <span className="text-[10px] text-slate-400 block font-medium leading-normal">
                  Variabel ini akan menghasilkan kolom input otomatis pada dashboard Isian Penanggung Jawab (PJ) di setiap triwulan (TW).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Target Value */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Angka Target (Untuk Grafik/Persen)</label>
                  <input
                    type="number"
                    step="any"
                    value={formTarget}
                    onChange={(e) => setFormTarget(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-medium font-mono"
                    required
                  />
                </div>

                {/* Target Label */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Tampilan Target (Label)</label>
                  <input
                    type="text"
                    value={formTargetLabel}
                    onChange={(e) => setFormTargetLabel(e.target.value)}
                    placeholder="Contoh: 85,2%"
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-bold"
                    required
                  />
                </div>

                 {/* PJ Sektor */}
                 <div className="space-y-1">
                   <label className="text-[10.5px] font-bold text-slate-600 block">Penanggung Jawab (PJ) Sektor</label>
                   <div className="flex gap-1.5 mb-1.5">
                     <button
                       type="button"
                       onClick={() => setFormPjType("select")}
                       className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                         formPjType === "select"
                           ? "bg-teal-800 text-white border-teal-900"
                           : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                       }`}
                     >
                       Pilih Daftar
                     </button>
                     <button
                       type="button"
                       onClick={() => setFormPjType("custom")}
                       className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                         formPjType === "custom"
                           ? "bg-teal-800 text-white border-teal-900"
                           : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                       }`}
                     >
                       + Ketik Unit Baru
                     </button>
                   </div>

                   {formPjType === "select" ? (
                     <select
                       value={formPj}
                       onChange={(e) => setFormPj(e.target.value)}
                       className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-semibold text-slate-700"
                     >
                       {Array.from(new Set([
                         "Alumni dan Kerjasama", "Keuangan", "Akademik", "P2M", "Kepegawaian", 
                         "UPM", "Pengembangan Bahasa", "Kemahasiswaan", "SPI", "UPR", "Umum",
                         ...indicators.map(ind => ind.pj).filter(Boolean)
                       ])).sort().map(pjName => (
                         <option key={pjName} value={pjName}>{pjName}</option>
                       ))}
                     </select>
                   ) : (
                     <input
                       type="text"
                       placeholder="Ketik nama Unit PJ Baru..."
                       value={customPjValue}
                       onChange={(e) => setCustomPjValue(e.target.value)}
                       className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-bold"
                       required={formPjType === "custom"}
                     />
                   )}
                 </div>

                {/* Wadir */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-600 block">Wadir Pembina</label>
                  <select
                    value={formPjWadir}
                    onChange={(e) => setFormPjWadir(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="Wadir 1">Wadir 1 (Akademik)</option>
                    <option value="Wadir 2">Wadir 2 (Umum & Keuangan)</option>
                    <option value="Wadir 3">Wadir 3 (Kemahasiswaan & Kerjasama)</option>
                  </select>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow border border-teal-950 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          )}

          {/* Master Indicator Table List */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-center w-10">No</th>
                  <th className="px-3 py-3 w-24">Kode</th>
                  <th className="px-4 py-3 min-w-[280px]">Indikator Utama</th>
                  <th className="px-3 py-3 text-right">Target {selectedYear}</th>
                  <th className="px-4 py-3">PJ Sektor & Wadir</th>
                  <th className="px-4 py-3 text-center w-36">Aksi Administrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {indicators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                      <p className="mb-3">Belum ada indikator yang terdaftar untuk tahun anggaran {selectedYear}.</p>
                      {selectedYear > 2026 && onCopyTemplates && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Salin seluruh template indikator & PJ dari tahun anggaran sebelumnya ke tahun ${selectedYear}?`)) {
                              onCopyTemplates(selectedYear);
                            }
                          }}
                          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-lg shadow cursor-pointer inline-flex items-center gap-1.5 transition"
                        >
                          <Plus className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Salin Seluruh IKU dari Tahun Sebelumnya</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  indicators.map((ind) => {
                    const isDeleteConfirm = deleteConfirmKode === ind.kode;
                    
                    return (
                      <tr key={ind.kode} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-4 text-center text-slate-500 font-semibold">{ind.no}</td>
                        <td className="px-3 py-4 font-bold text-teal-850 font-mono">{ind.kode}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-800 leading-snug">{ind.indikatorKinerja}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                            <strong>Formula:</strong> {ind.formulaPerhitungan || "-"}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">
                            <strong>Variabel:</strong> {ind.dataDibutuhkan.join(", ")}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-right font-extrabold text-slate-900 font-mono">{getTargetLabel(ind)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="font-bold text-slate-700">{ind.pj}</p>
                          <p className="text-[10.5px] text-slate-400 font-medium font-mono">{ind.pjWadir}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isDeleteConfirm ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[9.5px] font-bold text-red-700 animate-pulse">Yakin hapus?</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(ind.kode, ind.tahun || 2026)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Ya
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmKode(null)}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Tidak
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(ind)}
                                className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded border border-teal-100 transition cursor-pointer"
                                title="Edit Indikator"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmKode(ind.kode)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-100 transition cursor-pointer"
                                title="Hapus Indikator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : null}

    </div>
  );
}
