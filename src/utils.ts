import { QuarterName } from "./types";

export function calculateRealisasi(kode: string, variables: { [key: string]: number }): { realisasi: number | string; label: string } {
  const keys = Object.keys(variables);
  if (keys.length === 0) return { realisasi: 0, label: "0" };

  switch (kode) {
    case "IKM 17.3.1": {
      const a = variables["Jumlah lulusan Tahun T-1 yang bekerja maksimal 6 bulan dari tanggal ijazah"] || 0;
      const b = variables["Jumlah lulusan pada tahun T-1"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.2": {
      const a = variables["Jumlah lulusan tahun T-1 yang bekerja di Sektor Kesehatan"] || 0;
      const b = variables["Jumlah lulusan tahun T-1 yang mengisi tracer study, tidak termasuk lulusan melanjutkan pendidikan"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.3": {
      const a = variables["Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1 yang bekerja di LN"] || 0;
      const b = variables["Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.4": {
      const a = variables["Jumlah peserta lulus Uji Kompetensi Tahun T"] || 0;
      const b = variables["Jumlah total peserta Uji Kompetensi Tahun T"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.5": {
      const a = variables["Jumlah penelitian yang dipublikasikan pada Tahun T"] || 0;
      return { realisasi: a, label: `${a} Penelitian` };
    }
    case "IKM 17.3.6": {
      const a = variables["Jumlah Karya HaKI yang dihasilkan pada Tahun T"] || 0;
      return { realisasi: a, label: `${a} Inovasi` };
    }
    case "IKM 17.3.7": {
      const a = variables["Jumlah pengabdian kepada masyarakat sesuai dengan skema Tahun T"] || 0;
      return { realisasi: a, label: `${a} Pengabdian Masyarakat` };
    }
    case "IKM 17.3.8": {
      const a = variables["Jumlah Dosen Tetap Tahun T"] || 0;
      const b = variables["Jumlah Mahasiswa Tahun T"] || 0;
      if (a === 0) return { realisasi: "1:0", label: "1:0" };
      const ratioVal = Number((b / a).toFixed(0));
      return { realisasi: `1:${ratioVal}`, label: `1:${ratioVal}` };
    }
    case "IKM 17.3.9": {
      const a = variables["Jumlah Dosen dengan kualifikasi Lektor Kepala dan atau Guru Besar pada Tahun T"] || 0;
      const b = variables["Jumlah Dosen dengan kualifikasi Lektor, Lektor Kepala, dan Guru Besar pada awal Tahun T"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.10": {
      const a = variables["Jumlah dosen fungsional yang memiliki sertifikasi dosen pada Tahun T"] || 0;
      const b = variables["Jumlah seluruh dosen fungsional yang sudah menjabat selama 2 (dua) tahun pada Tahun T"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.11": {
      const a = variables["Jumlah dosen tetap yang memiliki sertifikat TOEFL >= 500 atau yang setara pada Tahun T"] || 0;
      const b = variables["Jumlah seluruh Dosen tetap pada Tahun T"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 17.3.12": {
      const a = variables["Jumlah prestasi dosen dalam lomba internasional, nasional, dan kompetisi internasional Tahun T"] || 0;
      return { realisasi: a, label: `${a} Prestasi` };
    }
    case "IKM 17.3.13": {
      const a = variables["Jumlah prestasi mahasiswa dalam lomba internasional, nasional, provinsi, Kota/Kab, dan kompetisi Tahun T"] || 0;
      return { realisasi: a, label: `${a} Prestasi` };
    }
    case "IKM 17.3.14": {
      const a = variables["Jumlah prodi Poltekkes Kemenkes yang memiliki akreditasi unggul/internasional Tahun T"] || 0;
      const b = variables["Jumlah prodi Poltekkes Kemenkes pada Tahun T"] || 0;
      if (b === 0) return { realisasi: 0, label: "0%" };
      const val = (a / b) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 33.1.1": {
      const a = variables["Nilai SAKIP Satuan Kerja"] || 0;
      return { realisasi: a, label: String(a) };
    }
    case "IKM 33.2.1": {
      const a = variables["Nilai Kinerja Anggaran Satuan Kerja"] || 0;
      return { realisasi: a, label: String(a) };
    }
    case "IKM 33.2.2": {
      const a = variables["Nilai EBITDA"] || 0;
      const b = variables["Pendapatan Alokasi APBN"] || 0;
      const c = variables["Pendapatan PNBP"] || 0;
      if (b + c === 0) return { realisasi: 0, label: "0%" };
      const val = (a / (b + c)) * 100;
      return { realisasi: Number(val.toFixed(2)), label: val.toFixed(2) + "%" };
    }
    case "IKM 33.2.3": {
      const a = variables["Pendapatan PNBP/BLU"] || 0;
      return { realisasi: a, label: `Rp ${a.toLocaleString("id-ID")}` };
    }
    case "IKM 33.2.4": {
      const a = variables["Pendapatan dari optimalisasi Aset Tetap dan Aset Lainnya"] || 0;
      const b = variables["Pendapatan Kerja Sama Non-Tridharma"] || 0;
      const c = variables["Pendapatan Unit Usaha"] || 0;
      const total = a + b + c;
      return { realisasi: total, label: `Rp ${total.toLocaleString("id-ID")}` };
    }
    case "IKM 33.3.1": {
      const a = variables["Indeks Kualitas SDM Satuan Kerja"] || 0;
      return { realisasi: a, label: String(a) };
    }
    case "IKM 33.4.1": {
      const a = variables["Nilai Maturitas Manajemen Risiko Satuan Kerja"] || 0;
      return { realisasi: a, label: String(a) };
    }
    case "IKD 33.2.1": {
      const a = variables["Persentase Realisasi Anggaran Satuan Kerja"] || 0;
      return { realisasi: a, label: a + "%" };
    }
    case "IKD 33.1.2": {
      const a = variables["Persentase Mutasi Pegawai antar Satuan Kerja"] || 0;
      return { realisasi: a, label: a + "%" };
    }
    default:
      return { realisasi: 0, label: "0" };
  }
}

export function calculateCapaian(kode: string, realisasi: number | string, target: number): number {
  if (typeof realisasi === "string") {
    if (kode === "IKM 17.3.8") {
      const realStr = String(realisasi).replace("Rasio ", "").replace("1:", "").trim();
      const realVal = parseFloat(realStr);
      if (isNaN(realVal) || realVal === 0) return 0;
      // Rentang ideal: 1:27 ke 1:30
      if (realVal <= target && realVal >= 27) return 100;
      if (realVal > target) {
        return Number(((target / realVal) * 100).toFixed(2));
      }
      return 100;
    }
    return 0;
  }

  if (isNaN(target) || target === 0) return 0;
  const cap = (realisasi / target) * 100;
  return Number(cap.toFixed(2));
}

export function getStatusTW(tw: QuarterName, capaian: number, isFilled: boolean): "Tercapai" | "On Track" | "Perlu Perhatian" | "Belum Diisi" {
  if (!isFilled) return "Belum Diisi";
  if (capaian >= 100) return "Tercapai";

  const thresholds = {
    "TW I": 25,
    "TW II": 50,
    "TW III": 75,
    "TW IV": 100
  };

  if (capaian >= thresholds[tw]) {
    return "On Track";
  } else {
    return "Perlu Perhatian";
  }
}

// Function to convert data into beautiful Indonesian-friendly CSV
export function convertToIndonesianCSV(indicators: any[]): string {
  // BOM for Excel UTF-8 compliance
  let csv = "\uFEFF";
  
  // Headers
  const headers = [
    "NO", "KODE", "INDIKATOR KINERJA", "DEFINISI OPERASIONAL", "FORMULA PERHITUNGAN REALISASI", 
    "PJ", "PJ WADIR", "TARGET 2026", "SATUAN",
    "REALISASI TW I", "CAPAIAN TW I", "STATUS TW I", "JUSTIFIKASI TW I", "LINK DOKUMEN TW I",
    "REALISASI TW II", "CAPAIAN TW II", "STATUS TW II", "JUSTIFIKASI TW II", "LINK DOKUMEN TW II",
    "REALISASI TW III", "CAPAIAN TW III", "STATUS TW III", "JUSTIFIKASI TW III", "LINK DOKUMEN TW III",
    "REALISASI TW IV", "CAPAIAN TW IV", "STATUS TW IV", "JUSTIFIKASI TW IV", "LINK DOKUMEN TW IV",
  ];
  
  csv += headers.join(";") + "\n";
  
  indicators.forEach(ind => {
    const row = [
      ind.no,
      escapeCSVValue(ind.kode),
      escapeCSVValue(ind.indikatorKinerja),
      escapeCSVValue(ind.definisiOperasional),
      escapeCSVValue(ind.formulaPerhitungan),
      escapeCSVValue(ind.pj),
      escapeCSVValue(ind.pjWadir),
      escapeCSVValue(ind.target2026Label),
      escapeCSVValue(ind.satuan),
      
      // Quarters data
      escapeCSVValue(ind.quarters["TW I"].realisasiLabel || ""),
      escapeCSVValue(ind.quarters["TW I"].isFilled ? `${ind.quarters["TW I"].capaian.toFixed(2)}%` : ""),
      escapeCSVValue(ind.quarters["TW I"].status || "Belum Diisi"),
      escapeCSVValue(ind.quarters["TW I"].justifikasi || ""),
      escapeCSVValue(ind.quarters["TW I"].linkDokumen || ""),

      escapeCSVValue(ind.quarters["TW II"].realisasiLabel || ""),
      escapeCSVValue(ind.quarters["TW II"].isFilled ? `${ind.quarters["TW II"].capaian.toFixed(2)}%` : ""),
      escapeCSVValue(ind.quarters["TW II"].status || "Belum Diisi"),
      escapeCSVValue(ind.quarters["TW II"].justifikasi || ""),
      escapeCSVValue(ind.quarters["TW II"].linkDokumen || ""),

      escapeCSVValue(ind.quarters["TW III"].realisasiLabel || ""),
      escapeCSVValue(ind.quarters["TW III"].isFilled ? `${ind.quarters["TW III"].capaian.toFixed(2)}%` : ""),
      escapeCSVValue(ind.quarters["TW III"].status || "Belum Diisi"),
      escapeCSVValue(ind.quarters["TW III"].justifikasi || ""),
      escapeCSVValue(ind.quarters["TW III"].linkDokumen || ""),

      escapeCSVValue(ind.quarters["TW IV"].realisasiLabel || ""),
      escapeCSVValue(ind.quarters["TW IV"].isFilled ? `${ind.quarters["TW IV"].capaian.toFixed(2)}%` : ""),
      escapeCSVValue(ind.quarters["TW IV"].status || "Belum Diisi"),
      escapeCSVValue(ind.quarters["TW IV"].justifikasi || ""),
      escapeCSVValue(ind.quarters["TW IV"].linkDokumen || "")
    ];
    csv += row.join(";") + "\n";
  });
  
  return csv;
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return "";
  let str = String(val);
  // replace newlines and carriage returns with spaces
  str = str.replace(/[\r\n]+/g, " ");
  // replace semicolons with comma or keep quotes
  if (str.includes(";") || str.includes("\"") || str.includes(",")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
