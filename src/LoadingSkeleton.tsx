import React from "react";
import { LayoutGrid, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* Executive Counter Summary Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Indicators */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-teal-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Indikator</span>
            <div className="p-2 bg-slate-50 rounded text-slate-300">
              <LayoutGrid className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
            <div className="h-4 w-8 bg-slate-150 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-28 bg-slate-100 rounded mt-3"></div>
        </div>

        {/* Status Selesai */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-emerald-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Selesai / Melampaui</span>
            <div className="p-2 bg-slate-50 rounded text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-10 bg-slate-200 rounded"></div>
            <div className="h-4 w-14 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-32 bg-slate-100 rounded mt-3"></div>
        </div>

        {/* Status On Track */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-yellow-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">On Track</span>
            <div className="p-2 bg-slate-50 rounded text-slate-300">
              <TrendingUp className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-36 bg-slate-100 rounded mt-3"></div>
        </div>

        {/* Status Perlu Perhatian */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-rose-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Perlu Perhatian</span>
            <div className="p-2 bg-slate-50 rounded text-slate-300">
              <AlertTriangle className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
            <div className="h-4 w-12 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-28 bg-slate-100 rounded mt-3"></div>
        </div>

        {/* Rata-Rata Capaian */}
        <div className="bg-white rounded-xl border border-slate-200 border-s-4 border-s-sky-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">Rata-rata Capaian</span>
            <div className="p-2 bg-slate-50 rounded text-slate-300">
              <HelpCircle className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
            <div className="h-4 w-6 bg-slate-100 rounded"></div>
          </div>
          <div className="h-3 w-32 bg-slate-100 rounded mt-3"></div>
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-8 w-32 bg-slate-150 bg-slate-100 rounded-lg"></div>
            <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
            <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 w-44 bg-slate-200 rounded mb-3"></div>
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-slate-200 rounded"></div>
                    <div className="h-4 w-28 bg-slate-100 rounded"></div>
                    <div className="h-4 w-16 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-14 bg-slate-200 rounded ml-auto"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded ml-auto"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3.5 w-24 bg-slate-100 rounded"></div>
                  <div className="h-3.5 w-10 bg-slate-200 rounded"></div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leadership Warnings Area Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded mb-3"></div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="h-10 w-full bg-amber-50 rounded-lg border border-amber-100 p-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-200"></div>
              <div className="h-3.5 w-2/3 bg-amber-150 bg-amber-200/50 rounded"></div>
            </div>
            {[1, 2].map((w) => (
              <div key={w} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-3 w-14 bg-red-100 text-red-700 rounded px-1.5 py-0.5"></div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3.5 w-24 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
