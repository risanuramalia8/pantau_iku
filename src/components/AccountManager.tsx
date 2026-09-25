import React, { useState, useEffect, useMemo } from "react";
import { Indicator, SystemAccount } from "../types";
import { 
  DEFAULT_SYSTEM_ACCOUNTS, 
  getAllAccounts, 
  saveAccount, 
  deleteAccount 
} from "../utils/accounts";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Copy, 
  Check, 
  X, 
  ShieldAlert,
  Sparkles,
  Lock,
  Filter
} from "lucide-react";

interface AccountManagerProps {
  indicators: Indicator[];
}

export default function AccountManager({ indicators }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<SystemAccount[]>(DEFAULT_SYSTEM_ACCOUNTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SystemAccount | null>(null);
  
  // Form fields
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<string>("pj");
  const [formCustomRoleName, setFormCustomRoleName] = useState("");
  const [formPjType, setFormPjType] = useState<"select" | "custom">("select");
  const [formPjSelect, setFormPjSelect] = useState("");
  const [formPjCustom, setFormPjCustom] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Row Password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<{ [username: string]: boolean }>({});
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<SystemAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success Notification banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Extract unique PJ names from indicators
  const availablePjList = useMemo(() => {
    const pjSet = new Set<string>();
    indicators.forEach(i => {
      if (i.pj && i.pj.trim()) pjSet.add(i.pj.trim());
      if (i.pjWadir && i.pjWadir.trim()) pjSet.add(i.pjWadir.trim());
    });
    // Add default common units if missing
    ["Alumni dan Kerjasama", "Akademik", "P2M", "Kepegawaian", "UPM", "Pengembangan Bahasa", "Kemahasiswaan", "SPI", "Keuangan", "UPR", "Wadir 1", "Wadir 2", "Wadir 3"].forEach(p => pjSet.add(p));
    return Array.from(pjSet).sort();
  }, [indicators]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAccounts();
      setAccounts(data);
    } catch (e) {
      console.error("Gagal memuat akun:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setFormUsername("");
    setFormPassword("poltekkes123");
    setFormName("");
    setFormRole("pj");
    setFormCustomRoleName("");
    setFormPjType("select");
    setFormPjSelect(availablePjList[0] || "");
    setFormPjCustom("");
    setFormEmail("");
    setFormError("");
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: SystemAccount) => {
    setEditingAccount(acc);
    setFormUsername(acc.username);
    setFormPassword(acc.password || "");
    setFormName(acc.name);
    
    if (["admin", "direktur", "pj", "spi_verifier"].includes(acc.role)) {
      setFormRole(acc.role);
      setFormCustomRoleName("");
    } else {
      setFormRole("custom");
      setFormCustomRoleName(acc.role);
    }

    if (acc.pjName) {
      if (availablePjList.includes(acc.pjName)) {
        setFormPjType("select");
        setFormPjSelect(acc.pjName);
        setFormPjCustom("");
      } else {
        setFormPjType("custom");
        setFormPjCustom(acc.pjName);
        setFormPjSelect("");
      }
    } else {
      setFormPjType("select");
      setFormPjSelect(availablePjList[0] || "");
      setFormPjCustom("");
    }

    setFormEmail(acc.email);
    setFormError("");
    setShowFormPassword(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const usernameClean = formUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!usernameClean) {
      setFormError("Username wajib diisi (hanya huruf kecil, angka, dan underscore).");
      return;
    }

    if (usernameClean.length < 3) {
      setFormError("Username minimal 3 karakter.");
      return;
    }

    if (!formName.trim()) {
      setFormError("Nama lengkap akun / unit wajib diisi.");
      return;
    }

    if (!formPassword.trim()) {
      setFormError("Password akun wajib diisi.");
      return;
    }

    // Determine final role
    let finalRole = formRole;
    if (formRole === "custom") {
      const customRoleClean = formCustomRoleName.trim().toLowerCase();
      if (!customRoleClean) {
        setFormError("Nama role kustom baru wajib diisi.");
        return;
      }
      finalRole = customRoleClean;
    }

    // Determine final PJ name
    let finalPjName: string | undefined = undefined;
    if (finalRole === "pj" || formRole === "custom") {
      finalPjName = formPjType === "select" ? formPjSelect.trim() : formPjCustom.trim();
      if (!finalPjName && finalRole === "pj") {
        setFormError("Unit Penanggung Jawab (PJ) wajib dipilih atau diisi.");
        return;
      }
    }

    // Determine final email
    const finalEmail = formEmail.trim() || `${usernameClean}@poltekkes-palembang.ac.id`;

    // Check duplicate username if creating new
    if (!editingAccount) {
      const isDuplicate = accounts.some(a => a.username.toLowerCase() === usernameClean);
      if (isDuplicate) {
        setFormError(`Username "${usernameClean}" sudah digunakan. Silakan pilih username lain.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const accountData: SystemAccount = {
        username: usernameClean,
        name: formName.trim(),
        password: formPassword.trim(),
        role: finalRole,
        pjName: finalPjName || undefined,
        email: finalEmail,
        isDefault: editingAccount ? editingAccount.isDefault : false
      };

      await saveAccount(accountData);

      // Update in local state
      setAccounts(prev => {
        const next = [...prev];
        const idx = next.findIndex(a => a.username.toLowerCase() === usernameClean);
        if (idx >= 0) {
          next[idx] = accountData;
        } else {
          next.push(accountData);
        }
        return next;
      });

      setIsModalOpen(false);
      showToast(
        editingAccount 
          ? `Akun @${usernameClean} berhasil diperbarui.` 
          : `Akun & Role baru @${usernameClean} berhasil ditambahkan dan siap digunakan!`
      );
    } catch (err) {
      console.error(err);
      setFormError("Terjadi kesalahan saat menyimpan akun. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.isDefault && deleteTarget.username === "admin") {
      showToast("Akun admin utama tidak boleh dihapus untuk mencegah kehilangan hak akses.", "error");
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deleteTarget.username);
      setAccounts(prev => prev.filter(a => a.username.toLowerCase() !== deleteTarget.username.toLowerCase()));
      showToast(`Akun @${deleteTarget.username} berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus akun.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const togglePasswordVisibility = (uname: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [uname]: !prev[uname]
    }));
  };

  const copyToClipboard = (text: string, uname: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUsername(uname);
    setTimeout(() => setCopiedUsername(null), 2000);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.pjName && acc.pjName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      acc.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === "Semua") return true;
    if (roleFilter === "admin") return acc.role === "admin";
    if (roleFilter === "direktur") return acc.role === "direktur";
    if (roleFilter === "pj") return acc.role === "pj";
    if (roleFilter === "spi_verifier") return acc.role === "spi_verifier";
    if (roleFilter === "custom") return !["admin", "direktur", "pj", "spi_verifier"].includes(acc.role);

    return true;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = accounts.length;
    const admin = accounts.filter(a => a.role === "admin").length;
    const direktur = accounts.filter(a => a.role === "direktur").length;
    const pj = accounts.filter(a => a.role === "pj").length;
    const spi = accounts.filter(a => a.role === "spi_verifier").length;
    const custom = accounts.filter(a => !["admin", "direktur", "pj", "spi_verifier"].includes(a.role)).length;
    return { total, admin, direktur, pj, spi, custom };
  }, [accounts]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">Administrator</span>;
      case "direktur":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">Direktur</span>;
      case "pj":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wide">Penanggung Jawab (PJ)</span>;
      case "spi_verifier":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">Verifikator SPI</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">Role: {role}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : "bg-rose-50 border-rose-200 text-rose-900"
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-bold">{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Manajemen Akun & Hak Akses
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">FIRESTORE: system_accounts</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 mt-1.5">Daftar Pengguna, Penugasan Sektor & Peran (Role)</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola akun penanggung jawab unit, tentukan hak akses peran, atur kata sandi login, atau buat role baru tanpa khawatir menimpa data isian IKU yang sedang berjalan online.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
            title="Muat ulang daftar akun dari Cloud Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-700" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            id="btn-add-new-account"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow border border-teal-950 transition duration-150 transform hover:scale-[1.01] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-teal-100" />
            <span>Tambah Akun & Role Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Security & Persistence Guarantee Box */}
      <div className="bg-gradient-to-r from-teal-50/70 to-emerald-50/70 border border-teal-200 rounded-xl p-4 flex items-start gap-3.5">
        <div className="p-2 bg-teal-800 text-white rounded-lg shadow-sm flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-teal-950 flex items-center gap-1.5">
            Jaminan Keamanan & Independensi Data Online
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full uppercase">Aman Digunakan</span>
          </h4>
          <p className="text-slate-600 leading-relaxed font-medium">
            Penambahan atau pengeditan akun pengguna disimpan di koleksi khusus <code className="bg-white/80 px-1 py-0.5 rounded text-teal-900 font-mono font-bold">system_accounts</code> dan terpisah secara mandiri dari koleksi dokumen IKU (<code className="bg-white/80 px-1 py-0.5 rounded text-teal-900 font-mono font-bold">indicators</code>). Seluruh unit PJ yang sedang melakukan pengisian realisasi online di Vercel atau VPS subdomain Anda <strong>TIDAK AKAN terganggu atau ter-reset</strong>.
          </p>
        </div>
      </div>

      {/* 3. Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Akun</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-slate-800 font-mono">{stats.total}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Tercatat di sistem</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Administrator</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-rose-700 font-mono">{stats.admin}</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Hak akses penuh</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">Penanggung Jawab (PJ)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-teal-700 font-mono">{stats.pj}</span>
            <Building className="w-4 h-4 text-teal-500" />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Pengisi realisasi unit</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Verifikator SPI</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-amber-700 font-mono">{stats.spi}</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Validasi & catatan SPI</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Role Kustom / Lainnya</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-indigo-700 font-mono">{stats.custom}</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Peran tambahan baru</span>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-accounts"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari username, nama pengguna, unit PJ, atau role..."
            className="w-full text-xs pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Filter Role:</span>
          <select
            id="select-filter-account-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
          >
            <option value="Semua">Semua Role ({accounts.length})</option>
            <option value="admin">Administrator ({stats.admin})</option>
            <option value="pj">Penanggung Jawab PJ ({stats.pj})</option>
            <option value="spi_verifier">Verifikator SPI ({stats.spi})</option>
            <option value="custom">Role Kustom ({stats.custom})</option>
          </select>
        </div>
      </div>

      {/* 5. Account Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5 min-w-[220px]">Nama Pengguna & Email</th>
                <th className="p-3.5 min-w-[140px]">Username</th>
                <th className="p-3.5 min-w-[150px]">Role / Hak Akses</th>
                <th className="p-3.5 min-w-[180px]">Penugasan Unit (PJ)</th>
                <th className="p-3.5 min-w-[150px]">Kata Sandi (Password)</th>
                <th className="p-3.5 min-w-[110px]">Tipe Akun</th>
                <th className="p-3.5 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-xs text-slate-600">Tidak ada akun yang sesuai dengan pencarian atau filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba kata kunci lain atau tambahkan akun baru.</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, index) => {
                  const isPwVisible = visiblePasswords[acc.username] || false;
                  return (
                    <tr key={acc.username} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 text-center font-mono font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            acc.role === "admin" 
                              ? "bg-rose-100 text-rose-800" 
                              : acc.role === "spi_verifier" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-teal-100 text-teal-800"
                          }`}>
                            {acc.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-snug">{acc.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{acc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          @{acc.username}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {getRoleBadge(acc.role)}
                      </td>
                      <td className="p-3.5">
                        {acc.pjName ? (
                          <div className="flex items-center gap-1.5 text-teal-900 font-bold bg-teal-50/70 border border-teal-200/60 px-2.5 py-1 rounded-lg w-fit">
                            <Building className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                            <span>{acc.pjName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">- (Bukan Unit PJ)</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 min-w-[80px] text-center font-bold text-slate-700 select-all">
                            {isPwVisible ? (acc.password || "••••••") : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.username)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition"
                            title={isPwVisible ? "Sembunyikan Password" : "Lihat Password"}
                          >
                            {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {acc.password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.password || "", acc.username)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-teal-700 transition"
                              title="Salin Password ke Clipboard"
                            >
                              {copiedUsername === acc.username ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {acc.isDefault ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Bawaan Sistem
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Kustom Admin
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(acc)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition cursor-pointer"
                            title="Edit Akun & Password"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete allowed for all custom accounts and non-primary admin */}
                          {acc.username !== "admin" && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(acc)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Menampilkan <strong>{filteredAccounts.length}</strong> dari <strong>{accounts.length}</strong> total akun terdaftar</span>
          <span className="text-[10.5px]">Kredensial disimpan secara terenkripsi / terlindungi di Cloud Firestore</span>
        </div>
      </div>

      {/* 6. Modal Tambah / Edit Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-800 rounded-lg border border-teal-100">
                  {editingAccount ? <Edit3 className="w-5 h-5 text-teal-700" /> : <UserPlus className="w-5 h-5 text-teal-700" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    {editingAccount ? `Edit Akun @${editingAccount.username}` : "Tambah Akun & Role Baru"}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-bold">
                    {editingAccount ? "Perbarui informasi akun, role, atau ubah kata sandi" : "Daftarkan akun baru ke sistem dengan role dan penugasan spesifik"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                  Nama Lengkap Pengguna / Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PJ Pusat Riset, Auditor Internal, Dr. Ahmad..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-medium"
                />
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingAccount}
                    placeholder="Contoh: puskarier, wadir4, auditor..."
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none font-mono font-bold ${
                      editingAccount 
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
                        : "border-slate-200 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
                    }`}
                  />
                  <p className="text-[9.5px] text-slate-400 mt-0.5">Huruf kecil, angka & underscore.</p>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                    Password Akun <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi..."
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full text-xs px-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Hak Akses / Peran (Role) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    formRole === "pj" 
                      ? "border-teal-700 bg-teal-50/50 text-teal-900 font-bold" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="account-role-select"
                      value="pj"
                      checked={formRole === "pj"}
                      onChange={() => setFormRole("pj")}
                      className="text-teal-700 focus:ring-teal-600"
                    />
                    <div className="text-left">
                      <span className="text-xs block font-bold">Penanggung Jawab (PJ)</span>
                      <span className="text-[9.5px] text-slate-500 block font-normal">Akses input realisasi unit</span>
                    </div>
                  </label>

                  <label className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    formRole === "admin" 
                      ? "border-rose-700 bg-rose-50/50 text-rose-900 font-bold" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="account-role-select"
                      value="admin"
                      checked={formRole === "admin"}
                      onChange={() => setFormRole("admin")}
                      className="text-rose-700 focus:ring-rose-600"
                    />
                    <div className="text-left">
                      <span className="text-xs block font-bold">Administrator</span>
                      <span className="text-[9.5px] text-slate-500 block font-normal">Akses penuh konsol admin</span>
                    </div>
                  </label>

                  <label className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    formRole === "direktur" 
                      ? "border-purple-700 bg-purple-50/50 text-purple-900 font-bold" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="account-role-select"
                      value="direktur"
                      checked={formRole === "direktur"}
                      onChange={() => setFormRole("direktur")}
                      className="text-purple-700 focus:ring-purple-600"
                    />
                    <div className="text-left">
                      <span className="text-xs block font-bold">Direktur</span>
                      <span className="text-[9.5px] text-slate-500 block font-normal">Tabel Induk Rekap & Laporan Kerja</span>
                    </div>
                  </label>

                  <label className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    formRole === "spi_verifier" 
                      ? "border-amber-700 bg-amber-50/50 text-amber-900 font-bold" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="account-role-select"
                      value="spi_verifier"
                      checked={formRole === "spi_verifier"}
                      onChange={() => setFormRole("spi_verifier")}
                      className="text-amber-700 focus:ring-amber-600"
                    />
                    <div className="text-left">
                      <span className="text-xs block font-bold">Verifikator SPI</span>
                      <span className="text-[9.5px] text-slate-500 block font-normal">Akses verifikasi catatan SPI</span>
                    </div>
                  </label>

                  <label className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    formRole === "custom" 
                      ? "border-indigo-700 bg-indigo-50/50 text-indigo-900 font-bold" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="account-role-select"
                      value="custom"
                      checked={formRole === "custom"}
                      onChange={() => setFormRole("custom")}
                      className="text-indigo-700 focus:ring-indigo-600"
                    />
                    <div className="text-left">
                      <span className="text-xs block font-bold">Role Kustom Baru</span>
                      <span className="text-[9.5px] text-slate-500 block font-normal">Buat peran khusus sendiri</span>
                    </div>
                  </label>
                </div>

                {/* Custom Role Name Input */}
                {formRole === "custom" && (
                  <div className="mt-2.5 p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1">
                    <label className="text-[10.5px] font-black text-indigo-950 uppercase tracking-wide block">
                      Nama Role Kustom Baru:
                    </label>
                    <input
                      type="text"
                      required={formRole === "custom"}
                      placeholder="Contoh: auditor, direktur, viewer, operator..."
                      value={formCustomRoleName}
                      onChange={(e) => setFormCustomRoleName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700/20 font-bold text-indigo-900"
                    />
                  </div>
                )}
              </div>

              {/* PJ Assignment (if role pj or custom) */}
              {(formRole === "pj" || formRole === "custom") && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Penugasan Unit Penanggung Jawab (PJ)
                    </label>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setFormPjType("select")}
                        className={`px-2 py-0.5 rounded transition ${formPjType === "select" ? "bg-teal-800 text-white" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Pilih Unit
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPjType("custom")}
                        className={`px-2 py-0.5 rounded transition ${formPjType === "custom" ? "bg-teal-800 text-white" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Ketik Unit Baru
                      </button>
                    </div>
                  </div>

                  {formPjType === "select" ? (
                    <select
                      value={formPjSelect}
                      onChange={(e) => setFormPjSelect(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 cursor-pointer"
                    >
                      {availablePjList.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Masukkan nama unit / sektor baru..."
                      value={formPjCustom}
                      onChange={(e) => setFormPjCustom(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                    />
                  )}
                  <p className="text-[10px] text-slate-500">
                    Akun ini akan otomatis diarahkan ke lembar kerja dan dapat mengelola indikator yang ditugaskan untuk unit ini.
                  </p>
                </div>
              )}

              {/* Email Pengguna */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1">
                  Email Resmi Pengguna (Opsional)
                </label>
                <input
                  type="email"
                  placeholder={formUsername ? `${formUsername}@poltekkes-palembang.ac.id` : "email@poltekkes-palembang.ac.id"}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 font-medium text-slate-800"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow border border-teal-950 transition cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{editingAccount ? "Simpan Perubahan" : "Buat Akun Sekarang"}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 7. Dialog Konfirmasi Hapus Akun */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Konfirmasi Hapus Akun</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong className="text-slate-800 font-mono">@{deleteTarget.username}</strong> ({deleteTarget.name})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Akun</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
