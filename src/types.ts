export interface QuarterData {
  variables: { [varName: string]: number };
  realisasi: number | string;
  realisasiLabel: string;
  capaian: number; // calculated as percentage of target
  status: "Tercapai" | "On Track" | "Perlu Perhatian" | "Belum Diisi";
  justifikasi: string; // Used for "Permasalahan"
  rencanaTindakLanjut?: string;
  catatanSPI?: string;
  statusVerifikasiSPI?: "Sesuai" | "Perlu Perbaikan" | "Belum Diverifikasi";
  linkDokumen: string;
  updatedAt?: string;
  updatedBy?: string;
  isFilled: boolean;
  locked?: boolean;
}

export interface Indicator {
  no: number;
  kode: string;
  indikatorKinerja: string;
  definisiOperasional: string;
  formulaPerhitungan: string;
  dataDibutuhkan: string[];
  target2026: number;
  target2026Label: string;
  satuan: string;
  pj: string;
  pjWadir: string;
  quarters: {
    "TW I": QuarterData;
    "TW II": QuarterData;
    "TW III": QuarterData;
    "TW IV": QuarterData;
  };
  tahun?: number;
  target?: number;
  targetLabel?: string;
}

export interface UserSession {
  email: string;
  name: string;
  role: "admin" | "pj" | "spi_verifier";
  pjName?: string; // which PJ they are, e.g., "Keuangan", "UPM", "SPI", etc.
  avatar?: string;
}

export type QuarterName = "TW I" | "TW II" | "TW III" | "TW IV";
