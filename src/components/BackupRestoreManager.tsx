import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  History,
  Trash2,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Check
} from "lucide-react";
import { Indicator, QuarterName } from "../types";
import {
  downloadBackupJSON,
  validateBackupFile,
  executeRestore,
  getLocalSnapshots,
  deleteLocalSnapshot,
  LocalSnapshot,
  BackupPayload,
  calculateBackupSummary
} from "../utils/backupManager";
import { generateRekapIndukExcelWorkbook } from "../utils/formulaData";

interface BackupRestoreManagerProps {
  indicators: Indicator[];
  selectedYear: number;
  spiNotes: { [key: string]: string };
  onRestoreSuccess: (newIndicators: Indicator[], newSpiNotes: { [key: string]: string }) => void;
}

export default function BackupRestoreManager({
  indicators,
  selectedYear,
  spiNotes,
  onRestoreSuccess
}: BackupRestoreManagerProps) {
  // State for upload & restore
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzedPayload, setAnalyzedPayload] = useState<BackupPayload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [restoreMode, setRestoreMode] = useState<"full" | "merge">("full");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Download feedback
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Snapshots
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Summary of current active data
  const currentSummary = calculateBackupSummary(indicators);

  // Load snapshots on mount
  useEffect(() => {
    setSnapshots(getLocalSnapshots());
  }, []);

  // Handle Download JSON
  const handleDownloadJSON = () => {
    try {
      const res = downloadBackupJSON(indicators, spiNotes, selectedYear);
      setDownloadSuccessMsg(`Berkas backup '${res.filename}' (${res.sizeKb} KB) berhasil diunduh dan disimpan.`);
      setSnapshots(getLocalSnapshots());
      setTimeout(() => setDownloadSuccessMsg(null), 7000);
    } catch (err: any) {
      alert("Gagal mengunduh berkas backup: " + (err.message || "Kesalahan tidak diketahui"));
    }
  };

  // Handle Download Excel
  const handleDownloadExcel = () => {
    try {
      generateRekapIndukExcelWorkbook(indicators, "all", selectedYear);
    } catch (err: any) {
      alert("Gagal mengunduh Excel: " + (err.message || "Kesalahan tidak diketahui"));
    }
  };

  // Process File Selection
  const handleFileProcess = (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setAnalyzedPayload(null);
    setRestoreSuccessMsg(null);

    if (!file.name.endsWith(".json")) {
      setValidationError("Harap unggah berkas backup dengan format .json yang valid.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = validateBackupFile(text);

      if (!result.valid || !result.payload) {
        setValidationError(result.error || "Berkas tidak valid.");
      } else {
        setAnalyzedPayload(result.payload);
      }
    };
    reader.onerror = () => {
      setValidationError("Gagal membaca berkas dari perangkat Anda.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Execute Restore from Uploaded File
  const handleConfirmRestore = async () => {
    if (!analyzedPayload) return;

    const confirmText = restoreMode === "full"
      ? "Apakah Anda yakin ingin memulihkan (Restore Penuh) seluruh data dari berkas backup ini? Seluruh data indikator aktif akan diperbarui sesuai data backup."
      : "Apakah Anda yakin ingin menggabungkan (Smart Merge) data dari berkas backup ini? Triwulan yang kosong akan diisi oleh data backup.";

    if (!window.confirm(confirmText)) return;

    setIsRestoring(true);
    setValidationError(null);

    try {
      const res = await executeRestore(analyzedPayload, restoreMode, indicators, spiNotes);
      onRestoreSuccess(res.restoredIndicators, res.restoredSpiNotes);

      setRestoreSuccessMsg(
        `Berhasil memulihkan data! Sebanyak ${res.stats.restoredIndicatorsCount} indikator dan ${res.stats.updatedQuartersCount} triwulan telah disinkronkan ke Cloud Firestore dan LocalStorage.`
      );
      setSnapshots(getLocalSnapshots());
      setSelectedFile(null);
      setAnalyzedPayload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setValidationError(err.message || "Terjadi kesalahan saat memulihkan data.");
    } finally {
      setIsRestoring(false);
    }
  };

  // Restore from Local Snapshot
  const handleRestoreSnapshot = async (snap: LocalSnapshot) => {
    if (!window.confirm(`Pulihkan data dari snapshot tanggal "${snap.formattedDate}" (${snap.reason})?`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await executeRestore(snap.data, "full", indicators, spiNotes);
      onRestoreSuccess(res.restoredIndicators, res.restoredSpiNotes);
      setRestoreSuccessMsg(
        `Berhasil memulihkan dari snapshot ${snap.formattedDate}. Data ${res.stats.total} indikator telah kembali aktif.`
      );
      setSnapshots(getLocalSnapshots());
    } catch (err: any) {
      alert("Gagal memulihkan snapshot: " + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    if (window.confirm("Hapus snapshot lokal ini dari riwayat browser?")) {
      const updated = deleteLocalSnapshot(id);
      setSnapshots(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. Header Banner & Current Data Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-blue-50 text-blue-800 font-extrabold border border-blue-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                Pusat Keamanan &amp; Perlindungan Data
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Database Terhubung
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-2">
              Backup &amp; Restore Keseluruhan Data IKU
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Fasilitas pencadangan dan pemulihan data komprehensif. Unduh berkas backup berkala untuk mengamankan seluruh isian triwulan (termasuk TW I, TW II, TW III, dan TW IV), variabel mentah, justifikasi, dan bukti dukung. Anda dapat mengunggah berkas tersebut kapan saja jika data sewaktu-waktu hilang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              id="btn-quick-download-backup-json"
              onClick={handleDownloadJSON}
              className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow border border-blue-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>Download Backup (.JSON)</span>
            </button>
          </div>
        </div>

        {/* Current Active Data Metrics */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              Status Data Aktif Saat Ini ({indicators.length} IKU) - Tahun {selectedYear}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Total Pengisian Triwulan Aktif: <strong>{currentSummary.totalQuartersFilled}</strong> entri
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {(["TW I", "TW II", "TW III", "TW IV"] as const).map(tw => {
              const count = currentSummary.quartersFilled[tw];
              const pct = indicators.length > 0 ? Math.round((count / indicators.length) * 100) : 0;
              return (
                <div key={tw} className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">{tw}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                      count === indicators.length ? "bg-emerald-100 text-emerald-800" :
                      count > 0 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-400"
                    }`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">/ {indicators.length} IKU terisi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download success banner */}
        {downloadSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Dual Action Grid: Download vs Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ============================================================== */}
        {/* PANEL KIRI: DOWNLOAD BACKUP                                   */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <Download className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  1. Unduh Berkas Cadangan (Download Backup)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simpan seluruh snapshot database ke berkas lokal di komputer Anda.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option A: JSON (Recommended) */}
              <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-blue-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-blue-950">
                        Format JSON (Lossless &amp; Sangat Direkomendasikan)
                      </h4>
                      <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                        Menyimpan 100% struktur data mentah: variabel formula per indikator, seluruh triwulan (TW I - IV), catatan evaluasi SPI, link dokumen Google Drive, dan stempel waktu.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[9.5px] rounded-full uppercase tracking-wider shrink-0">
                    Resmi
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-blue-700 font-mono">
                    Ukuran: ~{Math.max(1, Math.round(JSON.stringify(indicators).length / 1024))} KB
                  </span>
                  <button
                    onClick={handleDownloadJSON}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup (.JSON)</span>
                  </button>
                </div>
              </div>

              {/* Option B: Excel Archive */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        Format Excel Multi-Sheet (.XLSX)
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Arsip pelaporan dalam bentuk spreadsheet berisikan Sheet Rekap Tabel Induk dan Sheet Data Mentah Formula untuk dibuka di Microsoft Excel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Format: Microsoft Excel (.xlsx)
                  </span>
                  <button
                    onClick={handleDownloadExcel}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Excel (.XLSX)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Tips Keamanan:</strong> Lakukan pengunduhan backup JSON setiap kali Penanggung Jawab selesai menginput data triwulan baru (misal: setelah TW II atau TW III lengkap diisi) agar Anda selalu memiliki salinan fisik di komputer Anda.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KANAN: UPLOAD & RESTORE BACKUP                          */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                <Upload className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  2. Unggah &amp; Pulihkan Cadangan (Upload &amp; Restore)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pulihkan data jika sewaktu-waktu data triwulan hilang atau kosong.
                </p>
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-purple-600 bg-purple-50/70"
                  : selectedFile
                  ? "border-teal-500 bg-teal-50/30"
                  : "border-slate-300 hover:border-purple-400 hover:bg-slate-50/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="p-3 bg-white rounded-full border border-slate-200 shadow-2xs">
                <Upload className="w-5 h-5 text-purple-700" />
              </div>

              {selectedFile ? (
                <div>
                  <span className="font-bold text-xs text-slate-800 block">{selectedFile.name}</span>
                  <span className="text-[10.5px] text-teal-700 font-semibold mt-0.5 block">
                    Berkas siap diverifikasi ({(selectedFile.size / 1024).toFixed(1)} KB) - Klik untuk ganti
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-extrabold text-xs text-slate-700 block">
                    Klik untuk memilih berkas backup JSON atau seret berkas ke sini
                  </span>
                  <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                    Hanya menerima berkas .json cadangan PANTAU IKU
                  </span>
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Gagal Membaca Berkas Backup:</span>
                  <span className="text-[11px]">{validationError}</span>
                </div>
              </div>
            )}

            {/* Analyzed Backup Card Preview */}
            {analyzedPayload && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-teal-700 text-white font-extrabold text-[9.5px] rounded-full uppercase">
                      Berkas Backup Terverifikasi
                    </span>
                    <h4 className="text-xs font-black text-teal-950 mt-1">
                      Snapshot Tanggal: {analyzedPayload.backupDateFormatted}
                    </h4>
                    <p className="text-[11px] text-teal-800">
                      Tahun Anggaran: <strong>{analyzedPayload.year}</strong> | Total: <strong>{analyzedPayload.totalIndicators} Indikator</strong>
                    </p>
                  </div>
                </div>

                {/* Quarter breakdown in backup */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                  {(["TW I", "TW II", "TW III", "TW IV"] as const).map(tw => {
                    const count = analyzedPayload.summary?.quartersFilled?.[tw] || 0;
                    return (
                      <div key={tw} className="bg-white p-2 rounded-lg border border-teal-200/80">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase block">{tw}</span>
                        <span className="text-xs font-black font-mono text-teal-900 block mt-0.5">
                          {count} IKU
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Restore Mode Choice */}
                <div className="pt-2 border-t border-teal-200/70 space-y-2">
                  <span className="text-[10.5px] font-black uppercase text-teal-900 tracking-wider block">
                    Pilih Metode Pemulihan:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2 ${
                      restoreMode === "full"
                        ? "bg-white border-teal-600 shadow-2xs"
                        : "bg-teal-100/50 border-teal-200 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === "full"}
                        onChange={() => setRestoreMode("full")}
                        className="mt-0.5 text-teal-800 focus:ring-teal-700"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-800 block">Restore Penuh (Full)</span>
                        <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                          Pulihkan &amp; timpa seluruh indikator sesuai kondisi persis pada backup.
                        </span>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2 ${
                      restoreMode === "merge"
                        ? "bg-white border-teal-600 shadow-2xs"
                        : "bg-teal-100/50 border-teal-200 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === "merge"}
                        onChange={() => setRestoreMode("merge")}
                        className="mt-0.5 text-teal-800 focus:ring-teal-700"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-800 block">Merge Cerdas</span>
                        <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                          Hanya pulihkan triwulan yang saat ini kosong tanpa menimpa data yang ada.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Execute Restore Button */}
                <div className="pt-2">
                  <button
                    id="btn-execute-restore-backup"
                    onClick={handleConfirmRestore}
                    disabled={isRestoring}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
                        <span>Sedang Memulihkan &amp; Menyinkronkan ke Cloud Firestore...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-teal-200" />
                        <span>Eksekusi Pemulihan Data Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Restore Success Banner */}
            {restoreSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2 text-xs text-emerald-900 font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="block">Pemulihan Sukses!</span>
                  <span className="text-[11px] font-normal">{restoreSuccessMsg}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Seluruh proses restore menyinkronkan data secara otomatis ke Cloud Firestore dan LocalStorage.
          </div>
        </div>

      </div>

      {/* 3. Snapshot Otomatis & Pemulihan Darurat (Emergency Auto-Recovery) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-700" />
            <h3 className="text-sm font-black text-slate-800">
              Riwayat Snapshot Otomatis Perangkat (Emergency Auto-Recovery)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Tersimpan lokal di browser: <strong>{snapshots.length} snapshot</strong>
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Sistem secara otomatis mengambil snapshot pencadangan lokal setiap kali ada operasi unduhan atau pembaruan penting. Jika data Anda tiba-tiba hilang dan Anda belum sempat mengunduh file JSON, Anda dapat memulihkan data dengan satu klik dari snapshot di bawah:
        </p>

        {snapshots.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            Belum ada snapshot otomatis yang tersimpan di browser ini. Snapshot otomatis akan dibuat saat Anda mengunduh backup atau memperbarui data.
          </div>
        ) : (
          <div className="divide-y divide-slate-150 border border-slate-200 rounded-xl overflow-hidden">
            {snapshots.map(snap => (
              <div
                key={snap.id}
                className="p-3.5 bg-white hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {snap.formattedDate}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                      {snap.reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Total: <strong>{snap.data.totalIndicators} IKU</strong></span>
                    <span>•</span>
                    <span>TW I: <strong>{snap.summary.quartersFilled["TW I"]}</strong></span>
                    <span>•</span>
                    <span>TW II: <strong>{snap.summary.quartersFilled["TW II"]}</strong></span>
                    <span>•</span>
                    <span>TW III: <strong>{snap.summary.quartersFilled["TW III"]}</strong></span>
                    <span>•</span>
                    <span>TW IV: <strong>{snap.summary.quartersFilled["TW IV"]}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleRestoreSnapshot(snap)}
                    disabled={isRestoring}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 transition cursor-pointer"
                    title="Pulihkan seluruh data dari snapshot tanggal ini"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Pulihkan Snapshot Ini</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus snapshot ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
