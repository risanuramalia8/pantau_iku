import React, { useState, useEffect } from "react";
import { QuarterName } from "../types";
import { Clock, Calendar, ShieldAlert } from "lucide-react";

interface ClockWidgetProps {
  selectedQuarter: QuarterName;
  setSelectedQuarter: (q: QuarterName) => void;
}

export default function ClockWidget({ selectedQuarter, setSelectedQuarter }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = (date: Date) => {
    return date.toTimeString().split(" ")[0]; // "HH:MM:SS"
  };

  const getDayIndonesian = (date: Date) => {
    const mainDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return mainDays[date.getDay()];
  };

  const getMonthIndonesian = (date: Date) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[date.getMonth()];
  };

  // Determine current calendar quarter based on system month
  const currentMonth = time.getMonth(); // 0-11
  let currentSystemQuarter: QuarterName = "TW II";
  if (currentMonth >= 0 && currentMonth <= 2) currentSystemQuarter = "TW I";
  else if (currentMonth >= 3 && currentMonth <= 5) currentSystemQuarter = "TW II";
  else if (currentMonth >= 6 && currentMonth <= 8) currentSystemQuarter = "TW III";
  else currentSystemQuarter = "TW IV";

  return (
    <div id="clock-widget" className="bg-gradient-to-br from-teal-800 to-teal-950 border border-slate-200 border-s-4 border-s-yellow-500 rounded-xl shadow-md p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-teal-900/60 rounded-lg border border-teal-600/40 flex items-center justify-center">
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <div className="text-3xl font-mono font-bold tracking-wider tabular-nums text-yellow-400">
            {formatHours(time)}
          </div>
          <div className="text-xs text-teal-100 font-medium flex items-center gap-1 mt-1">
            <Calendar className="w-3.5 h-3.5 text-yellow-500" />
            <span>
              {getDayIndonesian(time)}, {time.getDate()} {getMonthIndonesian(time)} {time.getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-teal-900/50 p-3 rounded-lg border border-teal-700/50 w-full md:w-auto h-full">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
            Periode Penilaian Aktif
          </div>
          <div className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
            Kalender: <strong className="text-yellow-400 font-mono">{currentSystemQuarter}</strong>
          </div>
        </div>

        <div className="flex gap-1.5 bg-teal-950/60 p-1.5 rounded-md border border-teal-800 w-full sm:w-auto justify-center">
          {(["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map((q) => (
            <button
              key={q}
              id={`btn-quarter-${q.replace(" ", "-")}`}
              onClick={() => setSelectedQuarter(q)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 ${
                selectedQuarter === q
                  ? "bg-yellow-500 text-teal-900 shadow-sm scale-105"
                  : "text-teal-200 hover:bg-teal-800/80 hover:text-white"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
