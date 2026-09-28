import React, { useState, useMemo } from "react";
import {
  Calculator,
  Search,
  Filter,
  Download,
  Info,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Indicator, QuarterName } from "../types";
import { getTargetLabel } from "../utils";
import { getFormulaSimulation, generateRekapIndukExcelWorkbook } from "../utils/formulaData";

interface FormulaDataViewProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  selectedYear: number;
  onSelectIndicator?: (ind: Indicator) => void;
}

export default function FormulaDataView({
  indicators,
  selectedQuarter,
  selectedYear,
  onSelectIndicator
}: FormulaDataViewProps) {
  // Active quarter view in this tab
  const [activeQuarter, setActiveQuarter] = useState<QuarterName | "all">(selectedQuarter);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPj, setSelectedPj] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selected indicator for detailed audit modal
  const [detailIndicator, setDetailIndicator] = useState<{
    indicator: Indicator;
    tw: QuarterName;
  } | null>(null);

  // Extract unique PJs
  const uniquePJs = useMemo(() => {
    return Array.from(new Set(indicators.map(i => i.pj))).sort();
  }, [indicators]);

  // The quarter to use for single-quarter inspections
  const currentInspectQuarter: QuarterName = activeQuarter === "all" ? selectedQuarter : activeQuarter;

  // Filtered indicators
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const q = ind.quarters[currentInspectQuarter];

      // Search match
      const qLower = searchTerm.toLowerCase();
      const matchKode = ind.kode.toLowerCase().includes(qLower);
      const matchName = ind.indikatorKinerja.toLowerCase().includes(qLower);
      const matchPj = ind.pj.toLowerCase().includes(qLower);
      const matchVars = ind.dataDibutuhkan?.some(v => v.toLowerCase().includes(qLower));
      const matchSearch = matchKode || matchName || matchPj || matchVars;

      // PJ match
      const matchPjFilter = selectedPj === "Semua" || ind.pj === selectedPj;

      // Status match
      let matchStatus = true;
      if (selectedStatus !== "Semua") {
        if (selectedStatus === "Belum Diisi") {
          matchStatus = !q.isFilled;
        } else {
          matchStatus = q.isFilled && q.status === selectedStatus;
        }
      }

      return matchSearch && matchPjFilter && matchStatus;
    });
  }, [indicators, currentInspectQuarter, searchTerm, selectedPj, selectedStatus]);

  // Real-time statistics across all indicators for currentInspectQuarter
  const stats = useMemo(() => {
    let filledCount = 0;
    let tercapaiCount = 0;
    let ontrackCount = 0;
    let warningCount = 0;
    let totalVariables = 0;
    let filledVariables = 0;

    indicators.forEach(ind => {
      const q = ind.quarters[currentInspectQuarter];
      if (q.isFilled) filledCount++;
      if (q.status === "Tercapai") tercapaiCount++;
      if (q.status === "On Track") ontrackCount++;
      if (q.status === "Perlu Perhatian") warningCount++;

      const needed = ind.dataDibutuhkan || [];
      totalVariables += needed.length;
      needed.forEach(v => {
        if (q.variables && q.variables[v] !== undefined && q.variables[v] !== null) {
          filledVariables++;
        }
      });
    });

    return {
      total: indicators.length,
      filledCount,
      unfilledCount: indicators.length - filledCount,
      tercapaiCount,
      ontrackCount,
      warningCount,
      totalVariables,
      filledVariables
    };
  }, [indicators, currentInspectQuarter]);

  const handleDownloadExcel = () => {
    generateRekapIndukExcelWorkbook(indicators, activeQuarter, selectedYear);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-teal-50 text-teal-800 font-extrabold border border-teal-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-teal-700" />
                Audit Formula &amp; Asal-Usul Angka
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Live
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-2">
              Data Formula Per Indikator (Data Mentah &amp; Simulasi)
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Ketahui secara transparan asal-usul angka realisasi dan capaian. Setiap nilai yang dimasukkan oleh Penanggung Jawab Sektor (seperti data pembilang &amp; penyebut) ditampilkan secara langsung lengkap dengan alur perhitungan matematisnya.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="btn-download-formula-excel"
              onClick={handleDownloadExcel}
              className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow border border-teal-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer"
              title="Unduh seluruh rekap tabel induk beserta sheet data formula mentah ke dalam Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-teal-200" />
              <span>Unduh Excel Multi-Sheet (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Real-time metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total IKU</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Seluruh Indikator</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">Variabel Terisi</span>
            <span className="text-xl font-black text-blue-900 font-mono mt-0.5 block">
              {stats.filledVariables} <span className="text-xs font-normal text-blue-600">/ {stats.totalVariables}</span>
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Data mentah aktif</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">Laporan Terisi</span>
            <span className="text-xl font-black text-purple-900 font-mono mt-0.5 block">
              {stats.filledCount} <span className="text-xs font-normal text-purple-600">({Math.round((stats.filledCount / stats.total) * 100)}%)</span>
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">{currentInspectQuarter}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Tercapai (≥100%)</span>
            <span className="text-xl font-black text-emerald-900 font-mono mt-0.5 block">{stats.tercapaiCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Memenuhi target</span>
          </div>

          <div className="bg-lime-50 border border-lime-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-lime-700 uppercase tracking-wider block">On Track</span>
            <span className="text-xl font-black text-lime-900 font-mono mt-0.5 block">{stats.ontrackCount}</span>
            <span className="text-[10px] text-lime-600 font-semibold">Sesuai milestone</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">Perlu Perhatian</span>
            <span className="text-xl font-black text-rose-900 font-mono mt-0.5 block">{stats.warningCount}</span>
            <span className="text-[10px] text-rose-600 font-semibold">Perlu intervensi</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Quarter Pill Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <span className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-wider">
              Triwulan:
            </span>
            {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(tw => (
              <button
                key={tw}
                onClick={() => setActiveQuarter(tw)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  activeQuarter === tw
                    ? "bg-teal-800 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tw}
              </button>
            ))}
            <button
              onClick={() => setActiveQuarter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                activeQuarter === "all"
                  ? "bg-teal-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Semua TW (Matrix)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-end lg:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Tampilan Tabel Matriks Variabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Matriks Tabel</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Tampilan Kartu Alur Formula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Alur</span>
            </button>
          </div>
        </div>

        {/* Search, PJ, and Status Filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode (misal: IKD 33.1.2), nama indikator, atau variabel..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-medium"
            />
          </div>

          <div className="relative">
            <select
              value={selectedPj}
              onChange={(e) => setSelectedPj(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 cursor-pointer"
            >
              <option value="Semua">Semua Penanggung Jawab (PJ Sektor)</option>
              {uniquePJs.map(pj => (
                <option key={pj} value={pj}>{pj}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 cursor-pointer"
            >
              <option value="Semua">Semua Status Capaian</option>
              <option value="Tercapai">Tercapai (≥ 100%)</option>
              <option value="On Track">On Track (Sesuai Tahapan)</option>
              <option value="Perlu Perhatian">Perlu Perhatian</option>
              <option value="Belum Diisi">Belum Diisi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Table Mode vs Cards Mode */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Matriks Data Mentah &amp; Simulasi Formula ({filteredIndicators.length} IKU)
              </span>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-full">
                Periode: {activeQuarter === "all" ? "Seluruh Triwulan (TW I - TW IV)" : activeQuarter}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Klik baris atau tombol detail untuk bedah perhitungan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-10">No</th>
                  <th className="p-3 w-24">Kode</th>
                  <th className="p-3 min-w-[240px]">Indikator Kinerja Utama</th>
                  <th className="p-3 min-w-[120px]">PJ Sektor</th>
                  <th className="p-3 text-right">Target</th>
                  <th className="p-3 min-w-[280px] bg-slate-50 border-l border-slate-200">
                    Data Mentah Variabel (Input PJ)
                  </th>
                  <th className="p-3 min-w-[240px] bg-teal-50/50 border-l border-teal-100 text-teal-950">
                    Simulasi &amp; Asal-Usul Rumus
                  </th>
                  <th className="p-3 text-center bg-teal-50 border-l border-teal-100 text-teal-950">Realisasi</th>
                  <th className="p-3 text-center bg-purple-50 border-l border-purple-100 text-purple-950">Capaian</th>
                  <th className="p-3 text-center border-l border-slate-200">Status</th>
                  <th className="p-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredIndicators.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      Tidak ada data indikator yang sesuai dengan kriteria pencarian / filter.
                    </td>
                  </tr>
                ) : (
                  filteredIndicators.map(ind => {
                    const q = ind.quarters[currentInspectQuarter];
                    const sim = getFormulaSimulation(ind, currentInspectQuarter);

                    return (
                      <tr
                        key={ind.kode}
                        className="hover:bg-teal-50/30 transition group text-[11.5px]"
                      >
                        <td className="p-3 text-center font-mono text-slate-400 font-semibold">{ind.no}</td>
                        <td className="p-3 font-mono font-bold text-teal-900 whitespace-nowrap">
                          {ind.kode}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 leading-snug">
                          {ind.indikatorKinerja}
                          <span className="block text-[10px] text-slate-400 font-normal italic mt-0.5 line-clamp-1">
                            Rumus: {ind.formulaPerhitungan}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-bold whitespace-nowrap">
                          <span className="p-1 px-2 rounded bg-slate-100 text-slate-700 text-[10.5px]">
                            {ind.pj}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black font-mono text-slate-900 whitespace-nowrap">
                          {getTargetLabel(ind)}
                        </td>

                        {/* Raw Variable Values */}
                        <td className="p-3 bg-slate-50/60 border-l border-slate-200">
                          {sim.variablesList.length === 0 ? (
                            <span className="text-slate-400 italic text-[10.5px]">Entri nilai langsung</span>
                          ) : (
                            <div className="space-y-1.5">
                              {sim.variablesList.map((v, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200/80 text-[10.5px]"
                                >
                                  <span className="text-slate-600 font-medium leading-tight flex-1">
                                    {v.name}:
                                  </span>
                                  <span className={`font-mono font-black px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap ${
                                    v.isFilled
                                      ? "bg-teal-100 text-teal-900 border border-teal-200"
                                      : "bg-slate-100 text-slate-400"
                                  }`}>
                                    {v.value !== undefined && v.value !== null && v.value !== ""
                                      ? (typeof v.value === "number" ? v.value.toLocaleString("id-ID") : String(v.value))
                                      : 0}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Formula Math Simulation */}
                        <td className="p-3 bg-teal-50/30 border-l border-teal-100 font-mono text-[10.5px]">
                          <div className="p-2 bg-white rounded-lg border border-teal-200/80 shadow-2xs space-y-1">
                            <span className="text-[9.5px] font-bold text-teal-800 uppercase block tracking-wider">
                              Rumus Realisasi:
                            </span>
                            <span className="text-slate-800 font-black block font-mono text-[11px] text-teal-950">
                              {sim.simulasiRumus}
                            </span>
                            {sim.simulasiCapaian !== "-" && (
                              <span className="text-[10px] text-slate-500 font-medium block pt-1 border-t border-slate-100">
                                Capaian: {sim.simulasiCapaian}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Realisasi */}
                        <td className="p-3 text-center bg-teal-50/50 border-l border-teal-100 whitespace-nowrap font-mono font-black text-slate-900">
                          {q.isFilled ? sim.realisasiDisplay : <span className="text-slate-300">-</span>}
                        </td>

                        {/* Capaian */}
                        <td className="p-3 text-center bg-purple-50/50 border-l border-purple-100 whitespace-nowrap font-mono font-black text-purple-950">
                          {q.isFilled ? (
                            <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              q.capaian >= 100 ? "bg-emerald-100 text-emerald-800" :
                              q.capaian >= 80 ? "bg-amber-100 text-amber-800" :
                              "bg-rose-100 text-rose-800"
                            }`}>
                              {sim.capaianDisplay}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center border-l border-slate-200 whitespace-nowrap">
                          {q.isFilled ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              q.status === "Tercapai" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                              q.status === "On Track" ? "bg-lime-100 text-lime-800 border border-lime-300" :
                              "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}>
                              {q.status}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Belum Diisi</span>
                          )}
                        </td>

                        {/* Detail Action */}
                        <td className="p-3 text-center border-l border-slate-100">
                          <button
                            onClick={() => setDetailIndicator({ indicator: ind, tw: currentInspectQuarter })}
                            className="p-1.5 bg-slate-100 hover:bg-teal-700 hover:text-white rounded-lg text-slate-600 transition cursor-pointer"
                            title="Bedah Detail Alur Formula"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIndicators.map(ind => {
            const q = ind.quarters[currentInspectQuarter];
            const sim = getFormulaSimulation(ind, currentInspectQuarter);

            return (
              <div
                key={ind.kode}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-teal-500/50 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg">
                        {ind.kode}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {ind.pj}
                      </span>
                    </div>

                    {q.isFilled ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                        q.status === "Tercapai" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                        q.status === "On Track" ? "bg-lime-100 text-lime-800 border border-lime-300" :
                        "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {q.status} ({sim.capaianDisplay})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 text-slate-400 font-semibold">
                        Belum Diisi
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 leading-snug">
                    {ind.indikatorKinerja}
                  </h3>

                  {/* Formula Definition Box */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Formula Perhitungan:
                    </span>
                    <p className="text-xs text-slate-700 font-mono font-semibold">
                      {ind.formulaPerhitungan}
                    </p>
                  </div>

                  {/* Raw Variables Section */}
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider block">
                      Data Mentah Variabel Formula ({currentInspectQuarter}):
                    </span>
                    {sim.variablesList.length === 0 ? (
                      <div className="p-2 bg-slate-50 rounded-lg text-xs text-slate-500 italic">
                        Indikator ini diisi nilai realisasi langsung: <strong>{sim.realisasiDisplay}</strong>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5">
                        {sim.variablesList.map((v, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs transition"
                          >
                            <span className="text-slate-700 font-medium line-clamp-1 pr-2">
                              {v.name}
                            </span>
                            <span className="font-mono font-black px-2 py-0.5 bg-white text-teal-900 border border-teal-200 rounded shadow-2xs">
                              {v.value !== undefined && v.value !== null && v.value !== ""
                                ? (typeof v.value === "number" ? v.value.toLocaleString("id-ID") : String(v.value))
                                : 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mathematical Simulation Banner */}
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200/80 space-y-1.5">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                      Alur Perhitungan Otomatis:
                    </span>
                    <div className="font-mono text-xs text-slate-900 font-extrabold flex items-center gap-1.5 flex-wrap">
                      <span>{sim.simulasiRumus}</span>
                    </div>
                    {sim.simulasiCapaian !== "-" && (
                      <div className="text-[11px] text-teal-800 font-semibold pt-1 border-t border-teal-200/60 font-mono">
                        Evaluasi: {sim.simulasiCapaian}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metrics & button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Target Tahunan</span>
                      <span className="font-black font-mono text-slate-800">{getTargetLabel(ind)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Realisasi</span>
                      <span className="font-black font-mono text-teal-900">{sim.realisasiDisplay}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDetailIndicator({ indicator: ind, tw: currentInspectQuarter })}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 font-extrabold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Audit Alur</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Detailed Audit & Simulation Modal */}
      {detailIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-900 font-mono font-black text-xs rounded-lg">
                    {detailIndicator.indicator.kode}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-md">
                    {detailIndicator.indicator.pj}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold text-xs rounded-md">
                    Periode: {detailIndicator.tw}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {detailIndicator.indicator.indikatorKinerja}
                </h3>
              </div>

              <button
                onClick={() => setDetailIndicator(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const ind = detailIndicator.indicator;
              const tw = detailIndicator.tw;
              const q = ind.quarters[tw];
              const sim = getFormulaSimulation(ind, tw);

              return (
                <div className="space-y-5">
                  {/* Definisi & Formula */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Formula &amp; Definisi Operasional
                    </span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <p><strong>Rumus:</strong> {ind.formulaPerhitungan}</p>
                      <p className="text-slate-500"><strong>Definisi:</strong> {ind.definisiOperasional}</p>
                    </div>
                  </div>

                  {/* Raw Variables Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Data Mentah Variabel yang Dimasukkan ({tw})
                    </span>
                    <div className="space-y-2">
                      {sim.variablesList.map((v, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-0.5 pr-3">
                            <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                              Variabel {i + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {v.name}
                            </span>
                          </div>
                          <span className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-900 font-mono font-black text-base rounded-xl">
                            {typeof v.value === "number" ? v.value.toLocaleString("id-ID") : v.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Mathematical Explanation */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Alur Langkah Perhitungan (Asal-Usul Nilai)
                    </span>
                    <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-2.5">
                      {sim.steps.map((st, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800">
                          <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="font-medium leading-relaxed">{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome Cards */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target Tahunan</span>
                      <span className="text-base font-black text-slate-900 font-mono mt-1 block">{getTargetLabel(ind)}</span>
                    </div>

                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
                      <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider block">Realisasi ({tw})</span>
                      <span className="text-base font-black text-teal-900 font-mono mt-1 block">{sim.realisasiDisplay}</span>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">Capaian Target</span>
                      <span className="text-base font-black text-purple-900 font-mono mt-1 block">{sim.capaianDisplay}</span>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === "Tercapai" ? "bg-emerald-200 text-emerald-900" :
                        q.status === "On Track" ? "bg-lime-200 text-lime-900" :
                        "bg-rose-200 text-rose-900"
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  </div>

                  {/* Justifikasi & Link Dokumen */}
                  {q.justifikasi && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-rose-900 block">Justifikasi / Kendala Sektor:</span>
                      <p className="text-rose-800 italic">"{q.justifikasi}"</p>
                    </div>
                  )}

                  {q.linkDokumen && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-bold text-slate-700">Tautan Berkas Bukti Dukung:</span>
                      <a
                        href={q.linkDokumen}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Buka Tautan Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setDetailIndicator(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
