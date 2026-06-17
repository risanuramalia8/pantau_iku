import React, { useState } from "react";
import { Indicator, QuarterName } from "../types";
import { getStatusTW } from "../utils";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Filter, 
  LayoutGrid, 
  ArrowUpDown, 
  UserSquare2, 
  Building2, 
  ChevronsRight 
} from "lucide-react";

interface HomeDashboardProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  onSelectIndicator: (kode: string) => void;
}

export default function HomeDashboard({ indicators, selectedQuarter, onSelectIndicator }: HomeDashboardProps) {
  const [pjFilter, setPjFilter] = useState("Semua");
  const [wadirFilter, setWadirFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState<"no" | "highest" | "lowest">("no");

  // Dynamically analyze status for the active evaluation quarter
  const evaluatedData = indicators.map(ind => {
    const qData = ind.quarters[selectedQuarter];
    const liveStatus = getStatusTW(selectedQuarter, qData.capaian, qData.isFilled);
    return {
      ...ind,
      liveCapaian: qData.isFilled ? qData.capaian : 0,
      liveStatus,
      liveRealisasiLabel: qData.isFilled ? qData.realisasiLabel : "Belum diisi",
      justifikasi: qData.justifikasi,
      isFilled: qData.isFilled
    };
  });

  // Extract unique PJs and Wadirs for filter options
  const uniquePJs = Array.from(new Set(indicators.map(i => i.pj))).sort();
  const uniqueWadirs = Array.from(new Set(indicators.map(i => i.pjWadir))).sort();

  // Apply filters and sorting
  let filteredData = evaluatedData.filter(ind => {
    const matchesPj = pjFilter === "Semua" || ind.pj === pjFilter;
    const matchesWadir = wadirFilter === "Semua" || ind.pjWadir === wadirFilter;
    
    let matchesStatus = true;
    if (statusFilter !== "Semua") {
      if (statusFilter === "Tercapai") matchesStatus = ind.liveStatus === "Tercapai";
      else if (statusFilter === "On Track") matchesStatus = ind.liveStatus === "On Track";
      else if (statusFilter === "Perlu Perhatian") matchesStatus = ind.liveStatus === "Perlu Perhatian";
      else if (statusFilter === "Belum Diisi") matchesStatus = !ind.isFilled;
    }
    
    return matchesPj && matchesWadir && matchesStatus;
  });

  if (sortBy === "highest") {
    filteredData.sort((a, b) => b.liveCapaian - a.liveCapaian);
  } else if (sortBy === "lowest") {
    filteredData.sort((a, b) => a.liveCapaian - b.liveCapaian);
  } else {
    filteredData.sort((a, b) => a.no - b.no);
  }

  // Calculate high-level summary counters
  const totalCount = evaluatedData.length;
  const filledCount = evaluatedData.filter(i => i.isFilled).length;
  const tercapaiCount = evaluatedData.filter(i => i.liveStatus === "Tercapai").length;
  const onTrackCount = evaluatedData.filter(i => i.liveStatus === "On Track").length;
  const warningCount = evaluatedData.filter(i => i.liveStatus === "Perlu Perhatian").length;
  const emptyCount = totalCount - filledCount;

  // Calculate dynamic threshold based on Quarter
  const thresholdMap = { "TW I": 25, "TW II": 50, "TW III": 75, "TW IV": 100 };
  const targetThreshold = thresholdMap[selectedQuarter];

  // Calculate overall average achievement among filled indicators
  const totalCapaianFilled = evaluatedData.reduce((acc, curr) => acc + curr.liveCapaian, 0);
  const averageCapaian = totalCount > 0 ? Number((totalCapaianFilled / totalCount).toFixed(2)) : 0;

  // List indicators needing leadership attention
  const attentionIndicators = evaluatedData.filter(i => i.liveStatus === "Perlu Perhatian");

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 4 Executive Counter Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Indicators */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-teal-600 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Indikator (IKU)</span>
            <div className="p-2 bg-teal-50 rounded text-teal-600">
              <LayoutGrid className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400 font-bold">Sasaran</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Terdiri dari 21 IKM & 2 IKD
          </div>
        </div>

        {/* Status Tercapai (>=100%) */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-emerald-500 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Selesai / Melampaui</span>
            <div className="p-2 bg-emerald-50 rounded text-emerald-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">{tercapaiCount}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">100% Target</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            {Number((tercapaiCount / totalCount * 100).toFixed(0))}% dari total target 2026
          </div>
        </div>

        {/* Status On Track */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-yellow-500 p-5 shadow-sm hover:shadow-md transition-all bg-yellow-50/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-wider">On Track ({selectedQuarter})</span>
            <div className="p-2 bg-yellow-50 rounded text-yellow-600">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-yellow-600 font-mono">{onTrackCount}</span>
            <span className="text-xs text-yellow-800 bg-yellow-105-disabled bg-yellow-105 bg-yellow-100 px-1.5 py-0.5 rounded font-bold">≥ {targetThreshold}% Capaian</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Sesuai milestone {selectedQuarter}
          </div>
        </div>

        {/* Status Perlu Perhatian */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-red-500 p-5 shadow-sm hover:shadow-md transition-all bg-red-50/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Perlu Perhatian</span>
            <div className="p-2 bg-red-50 rounded text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 font-mono">{warningCount}</span>
            <span className="text-xs text-red-800 bg-red-100 px-1.5 py-0.5 rounded font-bold">&lt; {targetThreshold}% Capaian</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Di bawah target batas pimpinan
          </div>
        </div>

        {/* Belum Diisi */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-slate-400 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Belum Dilaporkan</span>
            <div className="p-2 bg-slate-50 rounded text-slate-400">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-400 font-mono">{emptyCount}</span>
            <span className="text-xs text-slate-400 font-bold">Menunggu</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">
            Belum ada entri variables PJ
          </div>
        </div>

      </div>

      {/* Main Graph & Radar / Circular Target section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Circular Gauge Card of Overall Achievement */}
        <div id="average-gauge-card" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Status Konsolidasi Kelembagaan</h3>
            <p className="text-xs text-slate-550-disabled text-slate-500 mt-1">Average Capaian Keseluruhan Indikator ({selectedQuarter})</p>
          </div>

          <div className="my-6 flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer Circular SVG Track and Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#f1f5f9" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#0f766e" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2.6389 * Math.min(averageCapaian, 100)} 264`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-4xl font-extrabold text-[#0f766e] font-mono leading-none tracking-tight">
                  {averageCapaian}%
                </span>
                <span className="text-[10px] text-teal-600 font-bold tracking-wider uppercase mt-1">
                  Rata-Rata IKU
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 mt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Rata-Rata Capaian</span>
                <span className="text-teal-700">{averageCapaian}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-teal-700 h-2 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(averageCapaian, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3.5 text-[11px] text-teal-800 space-y-1">
            <div className="font-bold text-teal-900">Informasi Penilaian IKU:</div>
            <div>Agar dinilai <strong className="text-teal-950">On Track</strong>, masing-masing indikator harus memenuhi target kuartalan minimum yaitu: <strong className="text-teal-700 underline font-extrabold">{targetThreshold}%</strong>.</div>
          </div>
        </div>

        {/* Indicators achievement horizontal list (The graphic view of achievements requested) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Grafik Capaian Indikator Kinerja ({selectedQuarter})</h3>
              <p className="text-xs text-slate-500 mt-1">Daftar grafik persentase pencapaian terhadap target penilaian</p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                id="sort-indicators"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium text-gray-700"
              >
                <option value="no">Urutkan: Kode IKU</option>
                <option value="highest">Capaian: Tertinggi</option>
                <option value="lowest">Capaian: Terendah</option>
              </select>
            </div>
          </div>

          {/* Quick filter pill buttons */}
          <div className="flex flex-wrap gap-1.5 py-3 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 self-center">Filter:</span>
            {[
              { id: "Semua", label: "Semua" },
              { id: "Tercapai", label: "Tercapai (100%)", count: tercapaiCount },
              { id: "On Track", label: `On Track (≥${targetThreshold}%)`, count: onTrackCount },
              { id: "Perlu Perhatian", label: `Perlu Perhatian (<${targetThreshold}%)`, count: warningCount },
              { id: "Belum Diisi", label: "Belum Diisi", count: emptyCount },
            ].map((st) => (
              <button
                key={st.id}
                id={`filter-status-${st.id.replace(" ", "-")}`}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 ${
                  statusFilter === st.id
                    ? "bg-teal-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {st.label} {st.count !== undefined ? `(${st.count})` : ""}
              </button>
            ))}
          </div>

          {/* Additional structural filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <UserSquare2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                id="filter-pj"
                value={pjFilter}
                onChange={(e) => setPjFilter(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="Semua">Departemen (PJ): Semua</option>
                {uniquePJs.map(pj => (
                  <option key={pj} value={pj}>{pj}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                id="filter-wadir"
                value={wadirFilter}
                onChange={(e) => setWadirFilter(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="Semua">PJ Wakil Direktur: Semua</option>
                {uniqueWadirs.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicators Graphic Bar List */}
          <div className="flex-1 max-h-[350px] overflow-y-auto space-y-3.5 pr-2 mt-4">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <HelpCircle className="w-10 h-10 stroke-1 mb-2" />
                <p className="text-sm font-bold">Tidak ada indikator yang cocok</p>
                <p className="text-xs">Silakan sesuaikan filter pencarian di luar.</p>
              </div>
            ) : (
              filteredData.map((ind) => (
                <div 
                  key={ind.kode}
                  id={`bar-container-${ind.kode.replace(".", "-").replace(/\s/g, "-")}`}
                  className="group hover:bg-teal-50/15 p-2 rounded-xl border border-transparent hover:border-teal-500/10 transition-all cursor-pointer"
                  onClick={() => onSelectIndicator(ind.kode)}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 bg-teal-50 border border-teal-100 rounded text-teal-800">
                        {ind.kode}
                      </span>
                      <span className="font-bold text-gray-800 line-clamp-1 max-w-[220px] sm:max-w-[360px] group-hover:text-teal-700 transition-colors">
                        {ind.indikatorKinerja}
                      </span>
                    </div>
                    <div className="font-mono font-bold flex items-center gap-1.5">
                      <span className="text-gray-400 text-[10px]">Real: {ind.liveRealisasiLabel}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        ind.liveStatus === "Tercapai" ? "bg-emerald-50 text-emerald-700 text-[11px]" :
                        ind.liveStatus === "On Track" ? "bg-lime-50 text-lime-700 text-[11px]" :
                        ind.liveStatus === "Perlu Perhatian" ? "bg-red-50 text-red-700 text-[11px]" :
                        "bg-gray-100 text-gray-500 text-[11px]"
                      }`}>
                        {ind.liveCapaian.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal visual bar */}
                  <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    {/* Evaluation milestone background marker line */}
                    <div 
                      className="absolute top-0 bottom-0 border-r-2 border-dashed border-teal-800/20 z-10"
                      style={{ left: `${targetThreshold}%` }}
                      title={`Target minimum ${selectedQuarter}: ${targetThreshold}%`}
                    ></div>

                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        ind.liveStatus === "Tercapai" ? "bg-emerald-500" :
                        ind.liveStatus === "On Track" ? "bg-lime-500" :
                        ind.liveStatus === "Perlu Perhatian" ? "bg-red-500 animate-pulse" :
                        "bg-gray-200"
                      }`}
                      style={{ width: `${Math.min(ind.liveCapaian, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leadership dynamic alert widget: "Indikator yang perlu perhatian pimpinan" */}
      <div id="alert-attention-card" className="bg-red-50/40 border border-red-250 border-s-4 border-s-red-500 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-red-200/50">
          <div className="p-2.5 bg-red-100 text-red-650 rounded">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-red-950 text-base">Alat Deteksi Dini: Indikator Perlu Perhatian Pimpinan ({selectedQuarter})</h3>
            <p className="text-xs text-red-850 font-semibold">Berdasarkan rumus Early Warning: Capaian &lt; {targetThreshold}% pada {selectedQuarter}, indikator berikut memerlukan intervensi taktis pimpinan.</p>
          </div>
        </div>

        <div className="mt-4">
          {filledCount === 0 ? (
            <div className="flex items-center justify-center p-6 text-slate-650 font-semibold gap-2 bg-slate-100/50 rounded border border-slate-200">
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Belum Ada Pelaporan: Penanggung Jawab belum memasukkan data capaian untuk {selectedQuarter}, sehingga Alat Deteksi Dini belum memiliki data untuk dianalisis.
            </div>
          ) : attentionIndicators.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-emerald-800 font-semibold gap-2 bg-emerald-50/40 rounded border border-emerald-150">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Sangat Baik! Semua indikator yang dilaporkan di Poltekkes Palembang telah memenuhi milestone target {selectedQuarter} (&gt;= {targetThreshold}%).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attentionIndicators.slice(0, 9).map((ind) => (
                <div 
                  key={ind.kode}
                  id={`attention-item-${ind.kode.replace(".", "-").replace(/\s/g, "-")}`}
                  onClick={() => onSelectIndicator(ind.kode)}
                  className="bg-white hover:bg-red-50/10 border border-slate-200 rounded-lg p-4 transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-red-800 bg-red-100 px-2 py-0.5 rounded">
                        {ind.kode}
                      </span>
                      <span className="text-red-700 font-mono font-extrabold text-xs">
                        Capaian: {ind.liveCapaian.toFixed(1)}% / {ind.target2026Label}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-xs mt-2 line-clamp-2">
                      {ind.indikatorKinerja}
                    </h4>
                    
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic font-medium">
                      "DO: {ind.definisiOperasional}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-150 line-clamp-2 font-medium">
                      <strong className="text-red-900 block font-bold mb-0.5">Justifikasi PJ:</strong> 
                      {ind.justifikasi || "Belum dimasukkan justifikasi hambatan."}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>PJ: <strong className="text-teal-900">{ind.pj}</strong></span>
                      <span className="flex items-center text-teal-700 font-extrabold gap-0.5 hover:underline">
                        Buka Detil <ChevronsRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {attentionIndicators.length > 9 && (
                <div className="bg-red-100/50 border border-dashed border-red-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-red-800 font-bold font-mono text-xl">+{attentionIndicators.length - 9} Indikator Lagi</span>
                  <p className="text-[11px] text-red-700 mt-1">Gunakan filter tabel atau pilih tab detail rincian untuk melihat keseluruhan data penelusuran.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
