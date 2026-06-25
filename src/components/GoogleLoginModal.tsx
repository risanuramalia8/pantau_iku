import React, { useState } from "react";
import { UserSession } from "../types";
import { KeyRound, ShieldAlert, X, User, LogIn, Eye, EyeOff, Info, ChevronDown, ChevronUp } from "lucide-react";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

const SYSTEM_ACCOUNTS = [
  {
    username: "admin",
    password: "admin123",
    name: "Admin Perencana Poltekkes",
    role: "admin" as const,
    email: "admin.perencanaan@poltekkes-palembang.ac.id"
  },
  {
    username: "alumni_kerjasama",
    password: "alumni123",
    name: "PJ Alumni dan Kerjasama",
    role: "pj" as const,
    pjName: "Alumni dan Kerjasama",
    email: "alumni.kerjasama@poltekkes-palembang.ac.id"
  },
  {
    username: "akademik",
    password: "akademik123",
    name: "PJ Akademik",
    role: "pj" as const,
    pjName: "Akademik",
    email: "akademik@poltekkes-palembang.ac.id"
  },
  {
    username: "p2m",
    password: "p2m123",
    name: "PJ P2M",
    role: "pj" as const,
    pjName: "P2M",
    email: "p2m@poltekkes-palembang.ac.id"
  },
  {
    username: "kepegawaian",
    password: "kepegawaian123",
    name: "PJ Kepegawaian",
    role: "pj" as const,
    pjName: "Kepegawaian",
    email: "kepegawaian@poltekkes-palembang.ac.id"
  },
  {
    username: "upm",
    password: "upm123",
    name: "PJ UPM",
    role: "pj" as const,
    pjName: "UPM",
    email: "upm@poltekkes-palembang.ac.id"
  },
  {
    username: "bahasa",
    password: "bahasa123",
    name: "PJ Pengembangan Bahasa",
    role: "pj" as const,
    pjName: "Pengembangan Bahasa",
    email: "bahasa@poltekkes-palembang.ac.id"
  },
  {
    username: "kemahasiswaan",
    password: "kemahasiswaan123",
    name: "PJ Kemahasiswaan",
    role: "pj" as const,
    pjName: "Kemahasiswaan",
    email: "kemahasiswaan@poltekkes-palembang.ac.id"
  },
  {
    username: "spi",
    password: "spi123",
    name: "PJ SPI",
    role: "pj" as const,
    pjName: "SPI",
    email: "spi@poltekkes-palembang.ac.id"
  },
  {
    username: "keuangan",
    password: "keuangan123",
    name: "PJ Keuangan",
    role: "pj" as const,
    pjName: "Keuangan",
    email: "keuangan@poltekkes-palembang.ac.id"
  },
  {
    username: "upr",
    password: "upr123",
    name: "PJ UPR",
    role: "pj" as const,
    pjName: "UPR",
    email: "upr@poltekkes-palembang.ac.id"
  }
];

export default function GoogleLoginModal({ isOpen, onClose, onLoginSuccess }: GoogleLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username dan password wajib diisi.");
      return;
    }

    // Attempt to match with system credentials
    const account = SYSTEM_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!account) {
      setErrorMsg("Nama pengguna (username) tidak terdaftar di sistem.");
      return;
    }

    if (account.password !== password) {
      setErrorMsg("Kata sandi (password) salah. Silakan coba lagi.");
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        email: account.email,
        name: account.name,
        role: account.role,
        pjName: account.role === "pj" ? account.pjName : undefined
      });
      onClose();
    }, 850);
  };

  const handleQuickFill = (acc: typeof SYSTEM_ACCOUNTS[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMsg("");
  };

  return (
    <div id="login-system-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header - Portal Masuk */}
        <div className="bg-teal-800 border-b-2 border-yellow-500 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-yellow-400" />
            <span className="font-extrabold text-sm tracking-wide uppercase">Masuk ke Sistem PANTAU IKU</span>
          </div>
          <button 
            id="close-login-modal"
            onClick={onClose} 
            className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isAuthenticating ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-800 rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-slate-800 font-extrabold text-sm">Memverifikasi Kredensial...</p>
                <p className="text-[11px] text-slate-500 mt-1">Mengautentikasi hak akses Penanggung Jawab</p>
              </div>
            </div>
          ) : (
            <>
              {/* Alert error */}
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-800 font-semibold flex items-start gap-2.5 rounded">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Central Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block mb-1.5">
                    Nama Pengguna (Username)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="input-login-username"
                      type="text"
                      required
                      placeholder="Contoh: admin atau pj_keuangan"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full text-xs px-3.5 pl-9 py-2.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-bold text-slate-800 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      id="input-login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi akun sistem"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-3.5 pl-9 pr-10 py-2.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-bold tracking-wide text-slate-800 transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-system-login"
                    type="submit"
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-[0.99] text-teal-950 font-black rounded transition duration-200 flex items-center justify-center gap-2 shadow border-b-2 border-yellow-600"
                  >
                    <LogIn className="w-4 h-4" />
                    MASUK SEBAGAI PJ / ADMIN
                  </button>
                </div>
              </form>

              {/* Expandable credential guides helpers for testing */}
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50 transition">
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 hover:text-teal-850 hover:bg-slate-100 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-teal-600" />
                    <span>Petunjuk Akun Sistem (Klik untuk Isi Otomatis)</span>
                  </div>
                  {showHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showHelp && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {SYSTEM_ACCOUNTS.map((acc) => (
                      <div 
                        key={acc.username} 
                        onClick={() => handleQuickFill(acc)}
                        className="pt-1.5 first:pt-0 flex items-center justify-between text-[11px] hover:bg-teal-50/50 p-1 rounded cursor-pointer transition group"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {acc.name} 
                            <span className="text-[9px] ml-1 bg-teal-100 text-teal-850 px-1 py-0.2 rounded font-sans uppercase">
                              {acc.role}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold font-mono">
                            Username: <span className="text-teal-700 bg-teal-50 px-1 rounded font-bold">{acc.username}</span>
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 font-bold group-hover:text-teal-700">isi otomatis →</span>
                          <span className="text-[9px] bg-amber-100 border border-amber-200 px-1 rounded font-bold font-mono text-amber-900">
                            pw: {acc.password}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Sistem PANTAU IKU Poltekkes Kemenkes Palembang 2026</span>
        </div>
      </div>
    </div>
  );
}
