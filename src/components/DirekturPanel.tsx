import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { Indicator, QuarterName } from "../types";
import { 
  getTargetLabel, 
  getStatusTW, 
  convertToIndonesianCSV 
} from "../utils";
import { 
  generateDocxReport, 
  generatePptxReport 
} from "../utils/reportGenerator";
import { 
  SignatureConfig, 
  DEFAULT_SIGNATURE_CONFIG, 
  getLocalSignatureConfig, 
  fetchSignatureConfigFromFirestore, 
  onSignatureConfigUpdated 
} from "../utils/signatureSettings";
import { 
  FileText, 
  Download, 
  Table, 
  Search, 
  Building, 
  UserCheck, 
  Presentation, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  FileCheck, 
  Sparkles, 
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  Eye,
  BarChart3,
  FileDown
} from "lucide-react";
import { generatePdfSurat } from "../utils/pdfGenerator";

interface DirekturPanelProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  onSelectIndicator: (kode: string) => void;
  selectedYear: number;
}

export default function DirekturPanel({
  indicators,
  selectedQuarter,
  onSelectIndicator,
  selectedYear
}: DirekturPanelProps) {
  // Tabs: 1. "rekap" with title (Rekapitulasi Capaian IKU), 2. "laporan" with title (Generate Laporan Kerja)
  const [activeTab, setActiveTab] = useState<"rekap" | "laporan">("rekap");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [pjFilter, setPjFilter] = useState("Semua");
  const [wadirFilter, setWadirFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // Report generator states
  const [reportScope, setReportScope] = useState<"all" | QuarterName>("all");
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Print & Signature states
  const [signatureConfig, setSignatureConfig] = useState<SignatureConfig>(getLocalSignatureConfig());

  // Load signature settings from Firestore and keep in sync
  useEffect(() => {
    fetchSignatureConfigFromFirestore().then((cfg) => {
      setSignatureConfig(cfg);
    }).catch(err => {
      console.warn("Could not fetch remote signature config:", err);
    });

    const unsubscribe = onSignatureConfigUpdated((updatedCfg) => {
      setSignatureConfig(updatedCfg);
    });

    return () => unsubscribe();
  }, []);

  // Extract unique filter lists
  const uniquePJs = useMemo(() => Array.from(new Set(indicators.map(i => i.pj))).sort(), [indicators]);
  const uniqueWadirs = useMemo(() => Array.from(new Set(indicators.map(i => i.pjWadir))).sort(), [indicators]);

  // Filtered indicators for Worksheet
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const matchesSearch = 
        ind.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.indikatorKinerja.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPj = pjFilter === "Semua" || ind.pj === pjFilter;
      const matchesWadir = wadirFilter === "Semua" || ind.pjWadir === wadirFilter;

      if (!matchesSearch || !matchesPj || !matchesWadir) return false;

      if (statusFilter !== "Semua") {
        const q = ind.quarters[selectedQuarter];
        if (!q.isFilled && statusFilter === "Belum") return true;
        if (q.isFilled && q.status === statusFilter) return true;
        return false;
      }

      return true;
    });
  }, [indicators, searchTerm, pjFilter, wadirFilter, statusFilter, selectedQuarter]);

  // Overall Statistics across all indicators
  const stats = useMemo(() => {
    const total = indicators.length;
    let tercapaiCount = 0;
    let ontrackCount = 0;
    let warningCount = 0;
    let unfilledCount = 0;

    indicators.forEach(ind => {
      const q = ind.quarters[selectedQuarter];
      if (!q.isFilled) {
        unfilledCount++;
      } else {
        const s = getStatusTW(selectedQuarter, q.capaian, true);
        if (s === "Tercapai") tercapaiCount++;
        else if (s === "On Track") ontrackCount++;
        else warningCount++;
      }
    });

    const filledCount = total - unfilledCount;
    const filledPercent = total > 0 ? Math.round((filledCount / total) * 100) : 0;
    const tercapaiPercent = total > 0 ? Math.round((tercapaiCount / total) * 100) : 0;

    return {
      total,
      filledCount,
      filledPercent,
      tercapaiCount,
      tercapaiPercent,
      ontrackCount,
      warningCount,
      unfilledCount
    };
  }, [indicators, selectedQuarter]);

  // Dynamic statistics specifically for the selected reportScope (or fallback to selectedQuarter if "all")
  const activeReportQuarter: QuarterName = reportScope === "all" ? selectedQuarter : reportScope;

  const reportStats = useMemo(() => {
    const qTarget = activeReportQuarter;
    const total = indicators.length;
    let tercapaiCount = 0;
    let ontrackCount = 0;
    let warningCount = 0;
    let unfilledCount = 0;

    indicators.forEach(ind => {
      const q = ind.quarters[qTarget];
      if (!q.isFilled) {
        unfilledCount++;
      } else {
        const s = getStatusTW(qTarget, q.capaian, true);
        if (s === "Tercapai") tercapaiCount++;
        else if (s === "On Track") ontrackCount++;
        else warningCount++;
      }
    });

    const filledCount = total - unfilledCount;
    const filledPercent = total > 0 ? Math.round((filledCount / total) * 100) : 0;
    const tercapaiPercent = total > 0 ? Math.round((tercapaiCount / total) * 100) : 0;

    return {
      total,
      filledCount,
      filledPercent,
      tercapaiCount,
      tercapaiPercent,
      ontrackCount,
      warningCount,
      unfilledCount
    };
  }, [indicators, activeReportQuarter]);

  // CSV Rekap Download
  const handleDownloadCSV = () => {
    try {
      const csvContent = convertToIndonesianCSV(indicators, reportScope);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      let suffix = "Keseluruhan";
      if (reportScope === "TW I") suffix = "Triwulan_I";
      else if (reportScope === "TW II") suffix = "Triwulan_II";
      else if (reportScope === "TW III") suffix = "Triwulan_III";
      else if (reportScope === "TW IV") suffix = "Triwulan_IV";

      link.setAttribute(
        "download",
        `Rekapitulasi_Capaian_IKU_Direktur_Poltekkes_Palembang_${suffix}_${selectedYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Gagal mengunduh CSV: " + err.message);
    }
  };

  // Excel Worksheet Download
  const handleDownloadExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const headers = [
        "NO", "KODE", "INDIKATOR KINERJA UTAMA", "SATUAN", `TARGET ${selectedYear}`,
        "TW I REAL", "TW I CAPAIAN (%)", "TW I STATUS",
        "TW II REAL", "TW II CAPAIAN (%)", "TW II STATUS",
        "TW III REAL", "TW III CAPAIAN (%)", "TW III STATUS",
        "TW IV REAL", "TW IV CAPAIAN (%)", "TW IV STATUS",
        "PJ SEKTOR", "PEMBINA WADIR"
      ];

      const rows = indicators.map(ind => [
        ind.no,
        ind.kode,
        ind.indikatorKinerja,
        ind.satuan,
        getTargetLabel(ind),
        ind.quarters["TW I"].isFilled ? ind.quarters["TW I"].realisasiLabel : "-",
        ind.quarters["TW I"].isFilled ? `${ind.quarters["TW I"].capaian}%` : "-",
        ind.quarters["TW I"].isFilled ? ind.quarters["TW I"].status : "Belum",
        ind.quarters["TW II"].isFilled ? ind.quarters["TW II"].realisasiLabel : "-",
        ind.quarters["TW II"].isFilled ? `${ind.quarters["TW II"].capaian}%` : "-",
        ind.quarters["TW II"].isFilled ? ind.quarters["TW II"].status : "Belum",
        ind.quarters["TW III"].isFilled ? ind.quarters["TW III"].realisasiLabel : "-",
        ind.quarters["TW III"].isFilled ? `${ind.quarters["TW III"].capaian}%` : "-",
        ind.quarters["TW III"].isFilled ? ind.quarters["TW III"].status : "Belum",
        ind.quarters["TW IV"].isFilled ? ind.quarters["TW IV"].realisasiLabel : "-",
        ind.quarters["TW IV"].isFilled ? `${ind.quarters["TW IV"].capaian}%` : "-",
        ind.quarters["TW IV"].isFilled ? ind.quarters["TW IV"].status : "Belum",
        ind.pj,
        ind.pjWadir
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "REKAPITULASI IKU");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      };

      const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Rekapitulasi_Capaian_IKU_Direktur_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      alert("Gagal mengunduh Excel: " + e.message);
    }
  };

  // Generate Word Document (DOCX)
  const handleGenerateDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      const blob = await generateDocxReport(
        indicators,
        reportScope,
        "LAPORAN KERJA CAPAIAN INDIKATOR KINERJA UTAMA (IKU)",
        `Politeknik Kesehatan Kemenkes Palembang - Tahun Anggaran ${selectedYear}`,
        "Direktur Poltekkes Kemenkes Palembang",
        selectedYear
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      let suffix = "Keseluruhan_Indikator";
      if (reportScope === "TW I") suffix = "Triwulan_I";
      else if (reportScope === "TW II") suffix = "Triwulan_II";
      else if (reportScope === "TW III") suffix = "Triwulan_III";
      else if (reportScope === "TW IV") suffix = "Triwulan_IV";

      link.setAttribute("download", `Laporan_Kerja_Direktur_Poltekkes_Palembang_${suffix}_${selectedYear}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat laporan Word: " + err.message);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Generate Presentation (PPTX)
  const handleGeneratePptx = async () => {
    setIsGeneratingPptx(true);
    try {
      await generatePptxReport(
        indicators,
        reportScope,
        "PAPARAN CAPAIAN INDIKATOR KINERJA UTAMA (IKU)",
        `Politeknik Kesehatan Kemenkes Palembang - Tahun ${selectedYear}`,
        "Direktur Poltekkes Kemenkes Palembang"
      );
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat presentasi PPTX: " + err.message);
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  // Generate PDF of on-screen document
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfSurat({
        indicators,
        selectedYear,
        reportScope,
        selectedQuarter,
        stats: reportStats
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      let suffix = "Keseluruhan_Indikator";
      if (reportScope === "TW I") suffix = "Triwulan_I";
      else if (reportScope === "TW II") suffix = "Triwulan_II";
      else if (reportScope === "TW III") suffix = "Triwulan_III";
      else if (reportScope === "TW IV") suffix = "Triwulan_IV";

      link.setAttribute("download", `Surat_Laporan_Kerja_IKU_Poltekkes_Palembang_${suffix}_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 300);
    } catch (err: any) {
      console.error("Gagal mengunduh PDF:", err);
      alert("Gagal mengunduh berkas PDF: " + (err?.message || "Terjadi kesalahan saat memproses berkas PDF."));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* 1. Executive Direktur Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-purple-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 px-2.5 bg-purple-500/20 text-purple-200 font-black border border-purple-400/30 text-[10px] rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-yellow-400" /> Panel Eksekutif Direktur
              </span>
              <span className="text-[11px] text-purple-200/80 font-mono font-semibold">
                POLTEKKES KEMENKES PALEMBANG
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tahun Anggaran {selectedYear}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              Rekapitulasi Capaian & Pelaporan Kerja Institusi
            </h2>
            <p className="text-xs text-purple-100/90 mt-1 max-w-2xl leading-relaxed font-medium">
              Pengawasan menyeluruh terhadap seluruh {indicators.length} Indikator Kinerja Utama (IKU), evaluasi progres triwulanan sektor pelaksana, dan penerbitan laporan kerja resmi institusi.
            </p>
          </div>

          {/* Quick Metrics Badge for Direktur */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 px-4 rounded-xl border border-white/15">
            <div className="text-right">
              <span className="text-[10px] text-purple-200 font-extrabold uppercase tracking-wider block">Keterisian ({selectedQuarter})</span>
              <span className="text-xl font-black text-white font-mono">{stats.filledPercent}%</span>
              <span className="text-[10px] text-purple-200 block font-semibold">{stats.filledCount} dari {stats.total} IKU</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-left">
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">Tercapai Target</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{stats.tercapaiCount}</span>
              <span className="text-[10px] text-purple-200 block font-semibold">{stats.tercapaiPercent}% dari total</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTION BUTTONS: (1. Rekapitulasi Capaian IKU, 2. Generate Laporan Kerja) */}
      <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm max-w-2xl gap-1">
        <button
          id="direktur-tab-rekap"
          onClick={() => setActiveTab("rekap")}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "rekap"
              ? "bg-purple-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Table className="w-4 h-4 text-purple-300" />
          <span>Rekapitulasi Capaian IKU</span>
        </button>

        <button
          id="direktur-tab-laporan"
          onClick={() => setActiveTab("laporan")}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "laporan"
              ? "bg-purple-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-300" />
          <span>Generate Laporan Kerja</span>
        </button>
      </div>

      {/* TAB 1: REKAPITULASI CAPAIAN IKU (WORKSHEET TABEL INDUK SEPERTI ADMIN) */}
      {activeTab === "rekap" && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Header Bar with Download Options */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-800" />
                <span>Worksheet Tabel Induk Rekapitulasi Capaian IKU ({selectedYear})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konsolidasi data target, realisasi, capaian triwulanan, dan status kepatuhan dari keseluruhan {indicators.length} indikator.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadCSV}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                title="Unduh Rekapitulasi Tabel Induk dalam Format CSV"
              >
                <Download className="w-3.5 h-3.5 text-teal-200" />
                <span>Unduh CSV</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                title="Unduh Lembar Kerja Excel Rekapitulasi Lengkap"
              >
                <Table className="w-3.5 h-3.5 text-emerald-200" />
                <span>Unduh Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode (misal: IKM 17.3.1) atau nama indikator..."
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 font-medium"
              />
            </div>

            {/* Select Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={pjFilter}
                  onChange={(e) => setPjFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Unit PJ: Semua</option>
                  {uniquePJs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={wadirFilter}
                  onChange={(e) => setWadirFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Pembina: Semua Wadir</option>
                  {uniqueWadirs.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Status ({selectedQuarter}): Semua</option>
                  <option value="Tercapai">Tercapai (≥ 100%)</option>
                  <option value="On Track">On Track (Sesuai TW)</option>
                  <option value="Perlu Perhatian">Perlu Perhatian</option>
                  <option value="Belum">Belum Dilaporkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Worksheet Spreadsheet Core Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-xs text-left border-collapse select-text">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-20">
                  <tr>
                    <th className="px-3 py-3 font-bold text-center w-10">No</th>
                    <th className="px-3 py-3 font-bold w-24">Kode</th>
                    <th className="px-4 py-3 font-bold min-w-[300px]">Indikator Kinerja Utama</th>
                    <th className="px-3 py-3 font-bold text-center">Satuan</th>
                    <th className="px-3 py-3 font-bold text-right">Target {selectedYear}</th>
                    <th className="px-3 py-3 font-bold bg-teal-50 text-teal-900 border-l border-teal-100 text-center">TW I Real</th>
                    <th className="px-3 py-3 font-bold bg-teal-50 text-teal-900 text-center">TW I Capai</th>
                    <th className="px-3 py-3 font-bold bg-lime-50 text-lime-900 border-l border-lime-100 text-center">TW II Real</th>
                    <th className="px-3 py-3 font-bold bg-lime-50 text-lime-900 text-center">TW II Capai</th>
                    <th className="px-3 py-3 font-bold bg-blue-50 text-blue-900 border-l border-blue-100 text-center">TW III Real</th>
                    <th className="px-3 py-3 font-bold bg-blue-50 text-blue-900 text-center">TW III Capai</th>
                    <th className="px-3 py-3 font-bold bg-amber-50 text-amber-900 border-l border-amber-100 text-center">TW IV Real</th>
                    <th className="px-3 py-3 font-bold bg-amber-50 text-amber-900 text-center">TW IV Capai</th>
                    <th className="px-4 py-3 font-bold">PJ Sektor</th>
                    <th className="px-3 py-3 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredIndicators.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="px-6 py-12 text-center text-slate-400 font-bold">
                        Tidak ada data indikator yang sesuai dengan kata kunci atau filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredIndicators.map((ind) => (
                      <tr 
                        key={ind.kode} 
                        className="hover:bg-purple-50/20 transition-colors"
                      >
                        <td className="px-3 py-3 text-center text-slate-500 font-semibold font-mono">{ind.no}</td>
                        <td className="px-3 py-3 font-extrabold text-purple-900 font-mono whitespace-nowrap">
                          {ind.kode}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          <p className="line-clamp-2" title={ind.indikatorKinerja}>{ind.indikatorKinerja}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{ind.pjWadir}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 font-medium">{ind.satuan}</td>
                        <td className="px-3 py-3 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                          {getTargetLabel(ind)}
                        </td>
                        
                        {/* Quarters looping */}
                        {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map((tw, index) => {
                          const q = ind.quarters[tw];
                          const liveStatus = getStatusTW(tw, q.capaian, q.isFilled);
                          const bgCol = index === 0 ? "bg-teal-50/25" : index === 1 ? "bg-lime-50/25" : index === 2 ? "bg-blue-50/25" : "bg-amber-50/25";
                          const borderCol = index > 0 ? "border-l border-slate-150" : "border-l border-slate-100";
                          
                          return (
                            <React.Fragment key={tw}>
                              <td className={`px-2 py-3 text-center font-bold text-slate-800 font-mono whitespace-nowrap ${bgCol} ${borderCol}`}>
                                {q.isFilled ? q.realisasiLabel : "-"}
                              </td>
                              <td className={`px-2 py-3 text-center font-mono ${bgCol}`}>
                                {q.isFilled ? (
                                  <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10.5px] ${
                                    liveStatus === "Tercapai" ? "bg-emerald-100 text-emerald-800" :
                                    liveStatus === "On Track" ? "bg-lime-100 text-lime-800" :
                                    "bg-rose-100 text-rose-800"
                                  }`}>
                                    {q.capaian.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-medium text-[10px]">Belum</span>
                                )}
                              </td>
                            </React.Fragment>
                          );
                        })}

                        <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap text-xs">
                          {ind.pj}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => onSelectIndicator(ind.kode)}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[11px] font-bold border border-purple-200 transition cursor-pointer flex items-center gap-1 mx-auto"
                            title="Tinjau detail rumus dan riwayat capaian"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Menampilkan <strong>{filteredIndicators.length}</strong> dari <strong>{indicators.length}</strong> total IKU Poltekkes Palembang aktif tahun anggaran {selectedYear}.</span>
              <span className="flex items-center gap-1 font-bold text-purple-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mode Worksheet Rekapitulasi Direktur
              </span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: GENERATE LAPORAN KERJA (MEMUAT KESELURUHAN INDIKATOR) */}
      {activeTab === "laporan" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Action Hub & Generation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-purple-50 text-purple-800 font-black border border-purple-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-purple-700" /> Penerbitan Laporan Resmi
                  </span>
                  <span className="text-xs text-slate-400 font-mono">DOKUMEN RESMI DIREKTUR</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 mt-1.5">
                  {reportScope === "all"
                    ? `Generate Laporan Kerja Keseluruhan Indikator (${selectedYear})`
                    : `Generate Laporan Kerja ${reportScope} (${selectedYear})`}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {reportScope === "all"
                    ? `Pusat pembuatan dan unduhan laporan kerja eksekutif komprehensif yang memuat seluruh ${indicators.length} indikator Poltekkes Kemenkes Palembang, lengkap dengan narasi evaluasi, tabel capaian, dan slide paparan rapat pimpinan.`
                    : `Pusat penerbitan dan evaluasi laporan kerja kinerja institusi khusus periode ${reportScope} Tahun ${selectedYear}, disajikan lengkap dengan capaian realisasi, status milestone, dan identifikasi kendala.`}
                </p>
              </div>

              {/* Scope Selector */}
              <div className="flex flex-col gap-1 min-w-[220px]">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Cakupan Periode Laporan:
                </label>
                <select
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value as any)}
                  className="text-xs p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 cursor-pointer transition"
                >
                  <option value="all">Keseluruhan Indikator (TW I - TW IV)</option>
                  <option value="TW I">Laporan Triwulan I (TW I)</option>
                  <option value="TW II">Laporan Triwulan II (TW II)</option>
                  <option value="TW III">Laporan Triwulan III (TW III)</option>
                  <option value="TW IV">Laporan Triwulan IV (TW IV)</option>
                </select>
              </div>
            </div>

            {/* Quick Metrics Display for the Report */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Indikator</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{indicators.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Seluruh sektor institusi</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Tercapai (≥ 100%)</span>
                <span className="text-2xl font-black text-emerald-800 font-mono">{reportStats.tercapaiCount}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{reportStats.tercapaiPercent}% dari total indikator</span>
              </div>

              <div className="bg-lime-50 border border-lime-200 rounded-xl p-3.5">
                <span className="text-[10px] font-black text-lime-700 uppercase tracking-wider block">On Track</span>
                <span className="text-2xl font-black text-lime-800 font-mono">{reportStats.ontrackCount}</span>
                <span className="text-[10px] text-lime-600 font-semibold block mt-0.5">Sesuai target {reportScope === "all" ? "triwulan" : reportScope}</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">Perlu Perhatian</span>
                <span className="text-2xl font-black text-rose-800 font-mono">{reportStats.warningCount}</span>
                <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Memerlukan intervensi</span>
              </div>
            </div>

            {/* 4 Generation Action Buttons */}
            <div>
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                Pilih Format Penerbitan Laporan:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* 1. PDF Surat Generator */}
                <button
                  id="btn-download-pdf-surat"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="p-4 bg-gradient-to-br from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950 text-white rounded-xl shadow-md border border-rose-950 flex flex-col justify-between text-left transition transform hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-rose-500/40 text-rose-100 px-2 py-0.5 rounded-full uppercase">PDF / RESMI</span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-black text-white group-hover:underline">Unduh PDF Surat</h5>
                    <p className="text-[11px] text-rose-200 mt-1 leading-snug">
                      Konversi dan unduh tampilan surat laporan kerja resmi yang ada di layar ini ke dalam berkas PDF.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-rose-200">
                    <span>{isGeneratingPdf ? "Menyiapkan PDF..." : "Unduh Berkas .pdf"}</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. DOCX Generator */}
                <button
                  onClick={handleGenerateDocx}
                  disabled={isGeneratingDocx}
                  className="p-4 bg-gradient-to-br from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl shadow-md border border-blue-950 flex flex-col justify-between text-left transition transform hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-blue-500/40 text-blue-100 px-2 py-0.5 rounded-full uppercase">DOCX / WORD</span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-black text-white group-hover:underline">Laporan Kerja Lengkap</h5>
                    <p className="text-[11px] text-blue-200 mt-1 leading-snug">
                      Format resmi dokumen Microsoft Word lengkap dengan narasi, bab evaluasi, dan tabel seluruh indikator.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-blue-200">
                    <span>{isGeneratingDocx ? "Men-generate..." : "Unduh Berkas .docx"}</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 3. PPTX Generator */}
                <button
                  onClick={handleGeneratePptx}
                  disabled={isGeneratingPptx}
                  className="p-4 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white rounded-xl shadow-md border border-amber-950 flex flex-col justify-between text-left transition transform hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <Presentation className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-amber-400/40 text-amber-100 px-2 py-0.5 rounded-full uppercase">PPTX / SLIDE</span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-black text-white group-hover:underline">Slide Paparan Rapat</h5>
                    <p className="text-[11px] text-amber-100 mt-1 leading-snug">
                      Deck slide presentasi PowerPoint eksekutif siap pakai untuk rapat pimpinan atau kementerian.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-amber-100">
                    <span>{isGeneratingPptx ? "Men-generate..." : "Unduh Berkas .pptx"}</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 4. Excel Rekap Generator */}
                <button
                  onClick={handleDownloadExcel}
                  className="p-4 bg-gradient-to-br from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white rounded-xl shadow-md border border-emerald-950 flex flex-col justify-between text-left transition transform hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-white/10 rounded-lg text-white">
                      <Table className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full uppercase">XLSX / EXCEL</span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-black text-white group-hover:underline">Rekapitulasi Excel</h5>
                    <p className="text-[11px] text-emerald-200 mt-1 leading-snug">
                      Matriks lembar kerja Excel terstruktur memuat keseluruhan capaian seluruh triwulan dan sektor.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span>Unduh Berkas .xlsx</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

              </div>
            </div>

          </div>

          {/* Action Header for Screen View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                <FileText className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Tampilan Surat &amp; Lembar Laporan Kerja Resmi
                </h4>
                <p className="text-[11px] text-slate-500">
                  Format tata naskah dinas resmi Poltekkes Palembang ({reportScope === "all" ? "Seluruh Triwulan" : reportScope})
                </p>
              </div>
            </div>

            <button
              id="btn-download-pdf-surat-direct"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-rose-200" />
              <span>{isGeneratingPdf ? "Sedang Mengunduh PDF..." : "Unduh PDF Surat di Layar"}</span>
            </button>
          </div>

          {/* Document Printable Live Preview */}
          <div id="surat-laporan-preview" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 select-text">
            
            {/* Kop Surat Resmi Gambar */}
            <div className="w-full flex justify-end pb-4">
              <img 
                src="/kopbaru.png" 
                alt="Kop Surat Resmi Poltekkes Kemenkes Palembang" 
                className="w-full max-w-5xl h-auto object-contain object-right ml-auto"
              />
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1.5 py-2">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                {reportScope === "all"
                  ? "LAPORAN KERJA CAPAIAN INDIKATOR KINERJA UTAMA (IKU)"
                  : `LAPORAN KERJA CAPAIAN INDIKATOR KINERJA UTAMA (IKU) - ${reportScope}`}
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Cakupan: {reportScope === "all" ? "Keseluruhan Indikator (TW I - TW IV)" : `Periode ${reportScope}`} | Tahun {selectedYear}
              </p>
              <div className="w-24 h-1 bg-purple-800 mx-auto mt-2 rounded-full" />
            </div>

            {/* Bagian 1: Ringkasan Eksekutif */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                <span>I. Ringkasan Eksekutif Kinerja Institusi {reportScope !== "all" ? `(${reportScope})` : ""}</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {reportScope === "all" ? (
                  <>
                    Berdasarkan hasil pemantauan pada platform PANTAU IKU Poltekkes Kemenkes Palembang untuk Tahun Anggaran {selectedYear}, dari total <strong>{indicators.length} Indikator Kinerja Utama (IKU)</strong> yang ditugaskan kepada seluruh unit kerja dan sektor, tercatat sebanyak <strong>{reportStats.tercapaiCount} indikator ({reportStats.tercapaiPercent}%)</strong> telah mencapai target kinerja 100%. Sebanyak <strong>{reportStats.ontrackCount} indikator</strong> berada dalam status on track sesuai target pentahapan triwulan, dan <strong>{reportStats.warningCount} indikator</strong> masuk dalam kategori perlu perhatian khusus.
                  </>
                ) : (
                  <>
                    Berdasarkan hasil pemantauan capaian kinerja pada platform PANTAU IKU Poltekkes Kemenkes Palembang untuk <strong>{reportScope} Tahun Anggaran {selectedYear}</strong>, dari total <strong>{indicators.length} Indikator Kinerja Utama (IKU)</strong>, tercatat sebanyak <strong>{reportStats.tercapaiCount} indikator ({reportStats.tercapaiPercent}%)</strong> berstatus Tercapai (≥100%), sebanyak <strong>{reportStats.ontrackCount} indikator</strong> On Track sesuai milestone, dan <strong>{reportStats.warningCount} indikator</strong> memerlukan perhatian khusus serta percepatan tindak lanjut pimpinan.
                  </>
                )}
              </p>
            </div>

            {/* Bagian 2: Tabel Rekapitulasi Keseluruhan Indikator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <Table className="w-4 h-4 text-purple-800" />
                  <span>
                    II. Matriks Capaian {reportScope === "all" ? "Keseluruhan Indikator" : `Indikator Kinerja Utama - ${reportScope}`} ({indicators.length} IKU)
                  </span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {reportScope === "all" ? "Tabel Lengkap (Semua TW)" : `Tabel Khusus ${reportScope}`}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-8">No</th>
                      <th className="p-2.5 w-24">Kode</th>
                      <th className="p-2.5 min-w-[260px]">Indikator Kinerja Utama</th>
                      <th className="p-2.5 text-center">Satuan</th>
                      <th className="p-2.5 text-right">Target</th>
                      {reportScope === "all" ? (
                        <>
                          <th className="p-2.5 text-center bg-teal-50 text-teal-900 border-l border-teal-100">TW I</th>
                          <th className="p-2.5 text-center bg-lime-50 text-lime-900 border-l border-lime-100">TW II</th>
                          <th className="p-2.5 text-center bg-blue-50 text-blue-900 border-l border-blue-100">TW III</th>
                          <th className="p-2.5 text-center bg-amber-50 text-amber-900 border-l border-amber-100">TW IV</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5 text-center bg-purple-50 text-purple-900 border-l border-purple-200">Realisasi {reportScope}</th>
                          <th className="p-2.5 text-center bg-purple-100 text-purple-950 border-l border-purple-200">Capaian {reportScope}</th>
                          <th className="p-2.5 text-center bg-slate-50 text-slate-800 border-l border-slate-200">Status</th>
                        </>
                      )}
                      <th className="p-2.5">PJ Sektor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {indicators.map((ind) => (
                      <tr key={ind.kode} className="hover:bg-slate-50 text-[11.5px]">
                        <td className="p-2.5 text-center font-mono text-slate-400">{ind.no}</td>
                        <td className="p-2.5 font-bold font-mono text-purple-900">{ind.kode}</td>
                        <td className="p-2.5 font-medium text-slate-800 leading-snug">{ind.indikatorKinerja}</td>
                        <td className="p-2.5 text-center text-slate-500">{ind.satuan}</td>
                        <td className="p-2.5 text-right font-black font-mono text-slate-900">{getTargetLabel(ind)}</td>
                        
                        {reportScope === "all" ? (
                          (["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(tw => {
                            const q = ind.quarters[tw];
                            return (
                              <td key={tw} className="p-2.5 text-center font-mono border-l border-slate-100">
                                {q.isFilled ? (
                                  <span className={`px-1 py-0.5 rounded text-[10px] font-extrabold ${
                                    q.status === "Tercapai" ? "bg-emerald-100 text-emerald-800" :
                                    q.status === "On Track" ? "bg-lime-100 text-lime-800" :
                                    "bg-rose-100 text-rose-800"
                                  }`}>
                                    {q.capaian.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">-</span>
                                )}
                              </td>
                            );
                          })
                        ) : (
                          <>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-800 border-l border-slate-100">
                              {ind.quarters[reportScope].isFilled
                                ? (ind.quarters[reportScope].realisasiLabel || String(ind.quarters[reportScope].realisasi))
                                : "-"}
                            </td>
                            <td className="p-2.5 text-center font-mono border-l border-slate-100">
                              {ind.quarters[reportScope].isFilled ? (
                                <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                                  ind.quarters[reportScope].capaian >= 100 ? "text-emerald-700 bg-emerald-50" :
                                  ind.quarters[reportScope].capaian >= 80 ? "text-amber-700 bg-amber-50" :
                                  "text-rose-700 bg-rose-50"
                                }`}>
                                  {ind.quarters[reportScope].capaian.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center border-l border-slate-100">
                              {ind.quarters[reportScope].isFilled ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  ind.quarters[reportScope].status === "Tercapai" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                                  ind.quarters[reportScope].status === "On Track" ? "bg-lime-100 text-lime-800 border border-lime-300" :
                                  "bg-rose-100 text-rose-800 border border-rose-300"
                                }`}>
                                  {ind.quarters[reportScope].status}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-400">Belum Diisi</span>
                              )}
                            </td>
                          </>
                        )}

                        <td className="p-2.5 text-slate-600 font-semibold whitespace-nowrap text-[11px]">
                          {ind.pj}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian 3: Indikator Perlu Perhatian (Risk Matrix) */}
            {reportStats.warningCount > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-200 pb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>
                    III. Indikator Perlu Perhatian Khusus & Tindak Lanjut Pimpinan {reportScope !== "all" ? `- ${reportScope}` : ""} ({reportStats.warningCount} IKU)
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {indicators
                    .filter(ind => ind.quarters[activeReportQuarter].isFilled && ind.quarters[activeReportQuarter].status === "Perlu Perhatian")
                    .map(ind => (
                      <div key={ind.kode} className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-black text-rose-900 text-xs">{ind.kode}</span>
                          <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                            Capaian: {ind.quarters[activeReportQuarter].capaian.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-2">{ind.indikatorKinerja}</p>
                        <p className="text-[11px] text-slate-600"><strong>PJ Sektor:</strong> {ind.pj} ({ind.pjWadir})</p>
                        {ind.quarters[activeReportQuarter].justifikasi && (
                          <p className="text-[10.5px] text-rose-700 italic">
                            "Kendala: {ind.quarters[activeReportQuarter].justifikasi}"
                          </p>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Bagian 4: Lembar Tanda Tangan & Pengesahan Direktur */}
            <div className="pt-8 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-700">
              <div className="space-y-1 text-slate-500 text-[11px]">
                <p>Dokumen diterbitkan melalui Sistem Digital <strong>PANTAU IKU</strong></p>
                <p>Status: Laporan Kerja Resmi Disahkan</p>
                <p>Dicetak pada: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
              </div>

              <div className="text-center min-w-[260px] space-y-1">
                <p className="font-semibold text-slate-600">
                  {signatureConfig.city || "Palembang"}, {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
                </p>
                <p className="font-bold text-slate-800">
                  {signatureConfig.directorTitle || "Direktur Poltekkes Kemenkes Palembang"},
                </p>
                <div className="h-16" />
                {signatureConfig.directorName ? (
                  <p className="font-black text-slate-900 underline uppercase tracking-wide text-xs">
                    {signatureConfig.directorName}
                  </p>
                ) : (
                  <p className="font-bold text-slate-400 tracking-wider text-xs">
                    ( ............................................................ )
                  </p>
                )}
                {signatureConfig.directorNip ? (
                  <p className="text-[10.5px] text-slate-600 font-mono font-bold">
                    NIP. {signatureConfig.directorNip}
                  </p>
                ) : (
                  <p className="text-[10.5px] text-slate-400 font-mono">
                    NIP. .......................................................
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
