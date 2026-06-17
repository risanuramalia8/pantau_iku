import React, { useState } from "react";
import { Indicator, QuarterName } from "../types";
import { getStatusTW } from "../utils";
import { 
  Building, 
  UserCircle2, 
  Target, 
  Activity, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  FileText,
  Workflow
} from "lucide-react";

interface IndicatorTabsProps {
  indicators: Indicator[];
  selectedQuarter: QuarterName;
  activeIndicatorKode: string;
  setActiveIndicatorKode: (kode: string) => void;
}

export default function IndicatorTabs({ 
  indicators, 
  selectedQuarter, 
  activeIndicatorKode, 
  setActiveIndicatorKode 
}: IndicatorTabsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentIdx = indicators.findIndex(ind => ind.kode === activeIndicatorKode);
  const activeInd = currentIdx !== -1 ? indicators[currentIdx] : indicators[0];

  // Search filter
  const filteredList = indicators.filter(ind => 
    ind.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.indikatorKinerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.pj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrev = () => {
    if (currentIdx > 0) {
      setActiveIndicatorKode(indicators[currentIdx - 1].kode);
    }
  };

  const handleNext = () => {
    if (currentIdx < indicators.length - 1) {
      setActiveIndicatorKode(indicators[currentIdx + 1].kode);
    }
  };

  const quarterNames: QuarterName[] = ["TW I", "TW II", "TW III", "TW IV"];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search & Tabs selector panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-805 text-slate-800 text-sm">Review Detail Indikator Kinerja Utama (IKU)</h3>
            <p className="text-xs text-slate-500 mt-1">Gunakan tab kode IKU atau tombol navigasi untuk beralih detail (1 indikator 1 tab)</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="search-indicator-tabs"
              type="text"
              placeholder="Cari Kode atau PJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Responsive grid of mini tabs */}
        <div id="tabs-grid" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-100 rounded-lg border border-slate-200">
          {filteredList.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-slate-400 font-bold">
              Tidak ada hasil pencarian
            </div>
          ) : (
            filteredList.map((ind) => {
              const isActive = ind.kode === activeInd.kode;
              const hasWarningsInActiveQuarter = 
                ind.quarters[selectedQuarter].isFilled && 
                getStatusTW(selectedQuarter, ind.quarters[selectedQuarter].capaian, true) === "Perlu Perhatian";
              
              return (
                <button
                  key={ind.kode}
                  id={`tab-btn-${ind.kode.replace(".", "-").replace(/\s/g, "-")}`}
                  onClick={() => setActiveIndicatorKode(ind.kode)}
                  className={`px-1 py-1.5 text-[11px] font-bold rounded border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? "bg-teal-800 text-white border-teal-850 shadow-md scale-105"
                      : "bg-white hover:bg-teal-50/50 text-slate-700 border-slate-200 hover:border-teal-600"
                  }`}
                >
                  <span className="font-mono">{ind.kode.replace("IKM ", "").replace("IKD ", "")}</span>
                  {hasWarningsInActiveQuarter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Primary Detail Tab Sheet */}
      <div id="active-tab-sheet" className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Navigation Head controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <button
            id="btn-prev-tab"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-3 py-1.5 border border-slate-200 rounded flex items-center gap-1 text-xs font-bold transition-all ${
              currentIdx === 0
                ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                : "text-teal-700 hover:bg-teal-55 hover:bg-teal-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>

          <div className="text-center">
            <span className="font-mono text-xs text-teal-700 font-bold tracking-widest uppercase">
              INDIKATOR {activeInd.no} DARI {indicators.length}
            </span>
          </div>

          <button
            id="btn-next-tab"
            onClick={handleNext}
            disabled={currentIdx === indicators.length - 1}
            className={`px-3 py-1.5 border border-slate-200 rounded flex items-center gap-1 text-xs font-bold transition-all ${
              currentIdx === indicators.length - 1
                ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                : "text-teal-700 hover:bg-teal-55 hover:bg-teal-50"
            }`}
          >
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Big Code and Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-xs bg-teal-55 bg-teal-50 border border-teal-100 text-teal-800 px-3 py-1 rounded uppercase tracking-wider">
              {activeInd.kode}
            </span>
            <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded font-bold">
              Satuan Target: {activeInd.satuan}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#0f766e] tracking-tight leading-snug">
            {activeInd.indikatorKinerja}
          </h2>
        </div>

        {/* Descriptive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Metadata items */}
          <div className="space-y-4">
            
            <div className="flex gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded h-9 w-9 flex items-center justify-center flex-shrink-0 border border-teal-100">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">DEFINISI OPERASIONAL</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-semibold">{activeInd.definisiOperasional}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded h-9 w-9 flex items-center justify-center flex-shrink-0 border border-teal-100">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">FORMULA PERHITUNGAN REALISASI</span>
                <p className="text-xs text-teal-900 bg-teal-50/50 p-2.5 rounded border border-teal-100 font-semibold mt-1 font-mono leading-relaxed">
                  {activeInd.formulaPerhitungan}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded h-9 w-9 flex items-center justify-center flex-shrink-0 border border-teal-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">DATA YANG DIBUTUHKAN (FORMULA)</span>
                <ul className="text-xs text-slate-600 space-y-1 mt-1.5 list-disc list-inside bg-slate-50 p-2 rounded border border-slate-200">
                  {activeInd.dataDibutuhkan.map((d, index) => (
                    <li key={index} className="font-semibold text-slate-700">{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Target and PICs */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">TARGET 2026</span>
                  <span className="text-sm font-bold text-slate-800">{activeInd.target2026Label}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-teal-700" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">PENANGGUNG JAWAB (PJ)</span>
                  <span className="text-xs font-bold text-teal-800 line-clamp-1">{activeInd.pj}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Building className="w-5 h-5 text-yellow-500" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">PJ WAKIL DIREKTUR (WADIR / UNIT)</span>
                <span className="text-xs font-bold text-slate-800">{activeInd.pjWadir}</span>
              </div>
            </div>

          </div>

          {/* Quarter Breakdown Tw I to IV */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Matriks Capaian Triwulan (TW I-IV)</h4>
                <span className="text-[10px] font-semibold text-slate-550-disabled text-slate-500">Evaluasi Berjalan</span>
              </div>

              <div className="space-y-3.5">
                {quarterNames.map((tw) => {
                  const qData = activeInd.quarters[tw];
                  const liveStatus = getStatusTW(tw, qData.capaian, qData.isFilled);
                  
                  return (
                    <div 
                      key={tw} 
                      className={`p-3 rounded border transition-all ${
                        qData.isFilled 
                          ? "bg-white border-slate-200 shadow-sm" 
                          : "bg-slate-100/50 border-dashed border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-800 font-sans">{tw}</span>
                        {qData.isFilled ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            liveStatus === "Tercapai" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            liveStatus === "On Track" ? "bg-yellow-50 text-yellow-700 border border-yellow-105-disabled border-yellow-101 border-yellow-100" :
                            "bg-red-50 text-red-700 border border-red-100 animate-pulse"
                          }`}>
                            {liveStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded tracking-wide">
                            Belum Dilaporkan
                          </span>
                        )}
                      </div>

                      {qData.isFilled ? (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-600">
                            <span>Realisasi: <strong className="text-teal-950">{qData.realisasiLabel}</strong></span>
                            <span>Capaian target: <strong className="text-teal-950 font-mono">{qData.capaian.toFixed(2)}%</strong></span>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                liveStatus === "Tercapai" ? "bg-emerald-500" :
                                liveStatus === "On Track" ? "bg-yellow-55 bg-yellow-500" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(qData.capaian, 100)}%` }}
                            ></div>
                          </div>

                          {qData.justifikasi && (
                            <div className="text-[10px] text-slate-500 mt-1 select-text bg-slate-50 p-1.5 rounded border border-slate-100 italic font-medium">
                              "{qData.justifikasi}"
                            </div>
                          )}

                          {qData.linkDokumen && (
                            <a
                              href={qData.linkDokumen}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 mt-1 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Link Bukti Pendukung
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Data belum dimasukkan oleh penanggung jawab {activeInd.pj}.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
              Capaian Triwulan dihitung otomatis dengan membandingkan nilai realisasi numerik dengan Target 2026.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
