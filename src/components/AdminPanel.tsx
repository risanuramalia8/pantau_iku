import React, { useState } from "react";
import { Indicator, QuarterName } from "../types";
import { getStatusTW, convertToIndonesianCSV } from "../utils";
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
  UserCheck
} from "lucide-react";

interface AdminPanelProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  onSelectIndicator: (kode: string) => void;
}

export default function AdminPanel({ indicators, selectedQuarter, onSelectIndicator }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pjFilter, setPjFilter] = useState("Semua");
  const [wadirFilter, setWadirFilter] = useState("Semua");
  const [activeTab, setActiveTab] = useState<"worksheet" | "summary">("worksheet");

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
    const csvContent = convertToIndonesianCSV(indicators);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Worksheet_PANTAU_IKU_Poltekkes_Palembang_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <button
          id="btn-download-worksheet"
          onClick={handleDownloadWorksheet}
          className="px-5 py-3 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded flex items-center justify-center gap-2.5 shadow border border-teal-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer"
        >
          <Download className="w-4.5 h-4.5 text-yellow-400 animate-bounce" />
          <span>Download Worksheet (CSV/MS Excel)</span>
        </button>
      </div>

      {/* 2. Admin Dashboard View Selection (Worksheet or Summary Stats) */}
      <div className="flex bg-white p-1 rounded border border-slate-200 max-w-sm">
        <button
          id="tab-btn-worksheet-view"
          onClick={() => setActiveTab("worksheet")}
          className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
            activeTab === "worksheet"
              ? "bg-teal-800 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Worksheet Tabel Induk
        </button>
        <button
          id="tab-btn-summary-view"
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "summary"
              ? "bg-teal-700 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Status Penyelesaian Laporan (PJ)
        </button>
      </div>

      {activeTab === "worksheet" ? (
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
                  <th className="px-3 py-3 font-semibold text-right">Target 2026</th>
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
                      <td className="px-3 py-3 text-right font-bold text-gray-950 font-mono whitespace-nowrap">{ind.target2026Label}</td>
                      
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
            <span>Tabel mencakup {filteredIndicators.length} IKU Poltekkes Palembang aktif tahun anggaran 2026.</span>
            <span className="flex items-center gap-1.5 font-bold text-teal-800">
              <CheckCircle2 className="w-4.5 h-4.5 text-teal-600" /> Mode Worksheet Sinkronisasi Lokal
            </span>
          </div>

        </div>
      ) : (
        /* Status Penyelesaian Laporan summary view */
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
                  <span className="text-xs font-bold text-gray-500">Milestone 2026</span>
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
                      <span className="text-gray-500 font-semibold">On Track (Kuartal):</span>
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
      )}

    </div>
  );
}
