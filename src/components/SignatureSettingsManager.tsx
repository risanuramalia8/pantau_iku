import React, { useState, useEffect } from "react";
import { 
  SignatureConfig, 
  DEFAULT_SIGNATURE_CONFIG, 
  fetchSignatureConfigFromFirestore, 
  saveSignatureConfig,
  getLocalSignatureConfig
} from "../utils/signatureSettings";
import { 
  FileCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  CreditCard, 
  Building, 
  MapPin, 
  Eye, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Eraser
} from "lucide-react";

export default function SignatureSettingsManager() {
  const [config, setConfig] = useState<SignatureConfig>(getLocalSignatureConfig());
  const [directorName, setDirectorName] = useState(config.directorName || "");
  const [directorNip, setDirectorNip] = useState(config.directorNip || "");
  const [directorTitle, setDirectorTitle] = useState(config.directorTitle || DEFAULT_SIGNATURE_CONFIG.directorTitle);
  const [city, setCity] = useState(config.city || DEFAULT_SIGNATURE_CONFIG.city);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  // Load from Cloud Firestore on mount
  useEffect(() => {
    setIsLoading(true);
    fetchSignatureConfigFromFirestore().then((remoteConfig) => {
      setConfig(remoteConfig);
      setDirectorName(remoteConfig.directorName || "");
      setDirectorNip(remoteConfig.directorNip || "");
      setDirectorTitle(remoteConfig.directorTitle || DEFAULT_SIGNATURE_CONFIG.directorTitle);
      setCity(remoteConfig.city || DEFAULT_SIGNATURE_CONFIG.city);
    }).catch(err => {
      console.warn("Error fetching remote signature config:", err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const newConfig: SignatureConfig = {
        directorName: directorName.trim(),
        directorNip: directorNip.trim(),
        directorTitle: directorTitle.trim() || DEFAULT_SIGNATURE_CONFIG.directorTitle,
        city: city.trim() || DEFAULT_SIGNATURE_CONFIG.city
      };

      await saveSignatureConfig(newConfig);
      setConfig(newConfig);

      const statusText = newConfig.directorName 
        ? `Nama (${newConfig.directorName}) dan NIP berhasil disimpan.` 
        : "Bagian Nama dan NIP berhasil dikosongkan (format blank/titik-titik).";
      
      showToast(`Pengaturan penandatangan laporan berhasil diperbarui! ${statusText}`);
    } catch (err) {
      console.error("Gagal menyimpan konfigurasi:", err);
      showToast("Gagal menyimpan pengaturan ke database.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSignature = async () => {
    setDirectorName("");
    setDirectorNip("");
    setIsSaving(true);
    try {
      const clearedConfig: SignatureConfig = {
        directorName: "",
        directorNip: "",
        directorTitle: directorTitle.trim() || DEFAULT_SIGNATURE_CONFIG.directorTitle,
        city: city.trim() || DEFAULT_SIGNATURE_CONFIG.city
      };

      await saveSignatureConfig(clearedConfig);
      setConfig(clearedConfig);
      showToast("Nama dan NIP resmi berhasil dikosongkan! Bagian tanda tangan pada dokumen kini berupa garis tanda tangan kosong (titik-titik).", "info");
    } catch (err) {
      console.error(err);
      showToast("Gagal mengosongkan pengaturan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("id-ID", {
    dateStyle: "long"
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : notification.type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : notification.type === "info" ? (
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-purple-50 text-purple-800 font-bold border border-purple-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-purple-700" /> Pengaturan Penandatangan Laporan
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">FIRESTORE: system_settings/signature_config</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 mt-1.5">Konfigurasi Nama, NIP & Pengesahan Direktur</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Atur identitas resmi penandatangan laporan kerja IKU Poltekkes Kemenkes Palembang. Anda dapat mengisinya dengan nama dan NIP pejabat definitif, atau mengosongkannya agar lembar pengesahan berupa garis titik-titik siap tanda tangan basah.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleClearSignature}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
            title="Kosongkan Nama dan NIP menjadi titik-titik"
          >
            <Eraser className="w-3.5 h-3.5 text-slate-500" />
            <span>Kosongkan Nama & NIP</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow border border-teal-950 transition cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-teal-200" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Inputs (Left: 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b pb-3">
            <User className="w-4 h-4 text-purple-700" />
            <span>Formulir Pejabat Penandatangan</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Nama Lengkap & Gelar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Lengkap Pejabat / Direktur</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">(Bisa Dikosongkan)</span>
              </div>
              <input
                id="input-director-name"
                type="text"
                placeholder="Contoh: Muhamad Taswin, S.Si, Apt, MM, M.Kes (atau kosongkan)"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 font-bold text-slate-800"
              />
              <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                Bila dikosongkan, dokumen cetak & laporan Word akan menampilkan garis tanda tangan kosong <code>( ............................................................ )</code>.
              </p>
            </div>

            {/* Nomor Induk Pegawai (NIP) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nomor Induk Pegawai (NIP)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">(Bisa Dikosongkan)</span>
              </div>
              <input
                id="input-director-nip"
                type="text"
                placeholder="Contoh: 196811201994031002 (atau kosongkan)"
                value={directorNip}
                onChange={(e) => setDirectorNip(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 font-mono font-bold text-slate-800"
              />
              <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                Bila dikosongkan, dokumen cetak akan menampilkan format NIP kosong <code>NIP. .......................................................</code>.
              </p>
            </div>

            {/* Jabatan Resmi */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Jabatan Penandatangan</span>
              </label>
              <input
                id="input-director-title"
                type="text"
                required
                placeholder="Direktur Poltekkes Kemenkes Palembang"
                value={directorTitle}
                onChange={(e) => setDirectorTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 font-medium text-slate-800"
              />
            </div>

            {/* Kota Lokasi Penandatanganan */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Kota Lokasi Penandatanganan Dokumen</span>
              </label>
              <input
                id="input-signature-city"
                type="text"
                required
                placeholder="Palembang"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 font-medium text-slate-800"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Reset & Kosongkan Nama/NIP</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow border border-teal-950 transition cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Terapkan Pengaturan</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Visual Preview (Right: 5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-700" />
                <span>Pratinjau Hasil Lembar Pengesahan</span>
              </h3>
              <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase ${
                directorName.trim() 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {directorName.trim() ? "Terisi Definitif" : "Dikosongkan (Blank)"}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Berikut adalah tampilan tanda tangan yang akan dicetak pada Laporan Kerja Panel Direktur, berkas Word (.docx), dan cetakan PDF:
            </p>

            {/* Document Signature Preview Box */}
            <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl shadow-inner text-center space-y-1 select-none">
              <p className="font-semibold text-slate-600 text-xs">
                {city.trim() || "Palembang"}, {currentDateFormatted}
              </p>
              <p className="font-bold text-slate-800 text-xs">
                {directorTitle.trim() || "Direktur Poltekkes Kemenkes Palembang"},
              </p>
              
              {/* Space for physical signature / seal */}
              <div className="h-16 flex items-center justify-center my-1 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <span className="text-[10px] text-slate-400 italic">
                  ( Ruang Tanda Tangan Basah &amp; Cap Stempel )
                </span>
              </div>

              {/* Name */}
              {directorName.trim() ? (
                <p className="font-black text-slate-900 underline uppercase tracking-wide text-xs">
                  {directorName.trim()}
                </p>
              ) : (
                <p className="font-bold text-slate-400 tracking-wider text-xs">
                  ( ............................................................ )
                </p>
              )}

              {/* NIP */}
              {directorNip.trim() ? (
                <p className="text-[11px] text-slate-600 font-mono font-bold">
                  NIP. {directorNip.trim()}
                </p>
              ) : (
                <p className="text-[10.5px] text-slate-400 font-mono">
                  NIP. .......................................................
                </p>
              )}
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-purple-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              Perubahan disimpan otomatis di database Firestore dan langsung diterapkan pada Panel Direktur secara *real-time* tanpa mengganggu jalannya pengisian online oleh para PJ.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
