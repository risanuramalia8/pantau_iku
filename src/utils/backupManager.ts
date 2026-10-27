import { writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Indicator, QuarterName } from "../types";
import { getLocalSignatureConfig, SignatureConfig } from "./signatureSettings";

export interface BackupSummary {
  quartersFilled: {
    "TW I": number;
    "TW II": number;
    "TW III": number;
    "TW IV": number;
  };
  totalQuartersFilled: number;
  tercapaiCount: number;
  ontrackCount: number;
  warningCount: number;
  totalIndicators: number;
}

export interface BackupPayload {
  app: "PANTAU_IKU_POLTEKKES_PALEMBANG";
  version: "2.0";
  backupDate: string;
  backupDateFormatted: string;
  year: number;
  totalIndicators: number;
  summary: BackupSummary;
  indicators: Indicator[];
  spiNotes?: { [key: string]: string };
  signatureConfig?: SignatureConfig;
}

export interface LocalSnapshot {
  id: string;
  timestamp: string;
  formattedDate: string;
  reason: string;
  year: number;
  summary: BackupSummary;
  data: BackupPayload;
}

const LOCAL_SNAPSHOTS_KEY = "PANTAU_IKU_LOCAL_SNAPSHOTS";
const MAX_LOCAL_SNAPSHOTS = 8;

/**
 * Calculates a summary of filled quarters and statuses across all indicators
 */
export function calculateBackupSummary(indicators: Indicator[], targetQuarter?: QuarterName): BackupSummary {
  const quartersFilled = {
    "TW I": 0,
    "TW II": 0,
    "TW III": 0,
    "TW IV": 0
  };

  let totalQuartersFilled = 0;
  let tercapaiCount = 0;
  let ontrackCount = 0;
  let warningCount = 0;

  indicators.forEach(ind => {
    (["TW I", "TW II", "TW III", "TW IV"] as const).forEach(tw => {
      const q = ind.quarters[tw];
      if (q && q.isFilled) {
        quartersFilled[tw]++;
        totalQuartersFilled++;
      }
    });

    // Check status on selected or latest filled quarter
    const checkQ = targetQuarter || "TW II";
    const currentQ = ind.quarters[checkQ];
    if (currentQ && currentQ.isFilled) {
      if (currentQ.status === "Tercapai") tercapaiCount++;
      else if (currentQ.status === "On Track") ontrackCount++;
      else if (currentQ.status === "Perlu Perhatian") warningCount++;
    }
  });

  return {
    quartersFilled,
    totalQuartersFilled,
    tercapaiCount,
    ontrackCount,
    warningCount,
    totalIndicators: indicators.length
  };
}

/**
 * Creates the complete lossless backup payload
 */
export function createBackupPayload(
  indicators: Indicator[],
  spiNotes: { [key: string]: string } = {},
  year: number = 2026
): BackupPayload {
  const now = new Date();
  const summary = calculateBackupSummary(indicators);

  return {
    app: "PANTAU_IKU_POLTEKKES_PALEMBANG",
    version: "2.0",
    backupDate: now.toISOString(),
    backupDateFormatted: now.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium"
    }),
    year,
    totalIndicators: indicators.length,
    summary,
    indicators: JSON.parse(JSON.stringify(indicators)),
    spiNotes: JSON.parse(JSON.stringify(spiNotes)),
    signatureConfig: getLocalSignatureConfig()
  };
}

/**
 * Trigger download of the JSON backup file
 */
export function downloadBackupJSON(
  indicators: Indicator[],
  spiNotes: { [key: string]: string } = {},
  year: number = 2026
): { filename: string; sizeKb: number } {
  const payload = createBackupPayload(indicators, spiNotes, year);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });

  const dateStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `BACKUP_PANTAU_IKU_POLTEKKES_PALEMBANG_${year}_${dateStr}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Also save an automatic local snapshot for safety
  saveLocalSnapshot(indicators, spiNotes, year, "Manual Download Backup JSON");

  return {
    filename,
    sizeKb: Math.round(blob.size / 1024)
  };
}

/**
 * Saves a local emergency snapshot into browser storage
 */
export function saveLocalSnapshot(
  indicators: Indicator[],
  spiNotes: { [key: string]: string } = {},
  year: number = 2026,
  reason: string = "Auto-save snapshot"
): void {
  try {
    if (!indicators || indicators.length === 0) return;

    const payload = createBackupPayload(indicators, spiNotes, year);
    const existingSnapshots = getLocalSnapshots();

    const newSnapshot: LocalSnapshot = {
      id: "snap_" + Date.now(),
      timestamp: payload.backupDate,
      formattedDate: payload.backupDateFormatted,
      reason,
      year,
      summary: payload.summary,
      data: payload
    };

    const updated = [newSnapshot, ...existingSnapshots].slice(0, MAX_LOCAL_SNAPSHOTS);
    localStorage.setItem(LOCAL_SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save local snapshot to localStorage:", err);
  }
}

/**
 * Retrieves all stored local snapshots
 */
export function getLocalSnapshots(): LocalSnapshot[] {
  try {
    const raw = localStorage.getItem(LOCAL_SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn("Could not load local snapshots:", e);
  }
  return [];
}

/**
 * Deletes a local snapshot
 */
export function deleteLocalSnapshot(snapshotId: string): LocalSnapshot[] {
  const current = getLocalSnapshots().filter(s => s.id !== snapshotId);
  try {
    localStorage.setItem(LOCAL_SNAPSHOTS_KEY, JSON.stringify(current));
  } catch (e) {}
  return current;
}

/**
 * Validates an uploaded JSON backup file
 */
export function validateBackupFile(fileContent: string): {
  valid: boolean;
  payload?: BackupPayload;
  error?: string;
} {
  try {
    const parsed = JSON.parse(fileContent);

    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "Format berkas tidak valid. Berkas bukan merupakan JSON yang sah." };
    }

    // Check if it has indicators array directly or wrapped in backup payload
    let indicators: Indicator[] | undefined;
    let spiNotes: { [key: string]: string } | undefined;
    let backupDate = parsed.backupDate || new Date().toISOString();
    let year = parsed.year || 2026;

    if (Array.isArray(parsed.indicators)) {
      indicators = parsed.indicators;
      spiNotes = parsed.spiNotes || {};
    } else if (Array.isArray(parsed)) {
      // Legacy or raw array of indicators
      indicators = parsed;
    }

    if (!indicators || indicators.length === 0) {
      return { valid: false, error: "Berkas tidak memuat data indikator (daftar indikator kosong)." };
    }

    // Verify indicator structure
    const sample = indicators[0];
    if (!sample.kode || !sample.quarters) {
      return { valid: false, error: "Struktur data indikator tidak sesuai dengan format PANTAU IKU." };
    }

    const summary = calculateBackupSummary(indicators);
    const payload: BackupPayload = {
      app: "PANTAU_IKU_POLTEKKES_PALEMBANG",
      version: parsed.version || "2.0",
      backupDate,
      backupDateFormatted: parsed.backupDateFormatted || new Date(backupDate).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "medium"
      }),
      year,
      totalIndicators: indicators.length,
      summary,
      indicators,
      spiNotes: spiNotes || {},
      signatureConfig: parsed.signatureConfig
    };

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: "Gagal memproses berkas JSON: " + (err.message || "Sintaks rusak") };
  }
}

/**
 * Restores indicators and SPI notes from a validated backup payload.
 * Mode:
 * - "full": replaces everything with backup content (ideal for disaster recovery)
 * - "merge": fills in missing/unfilled data without overwriting existing filled user data
 */
export async function executeRestore(
  payload: BackupPayload,
  mode: "full" | "merge",
  currentIndicators: Indicator[],
  currentSpiNotes: { [key: string]: string } = {}
): Promise<{
  restoredIndicators: Indicator[];
  restoredSpiNotes: { [key: string]: string };
  stats: {
    total: number;
    updatedQuartersCount: number;
    restoredIndicatorsCount: number;
  };
}> {
  let restoredIndicators: Indicator[] = [];
  let updatedQuartersCount = 0;
  let restoredIndicatorsCount = 0;

  if (mode === "full") {
    // Full replacement
    restoredIndicators = JSON.parse(JSON.stringify(payload.indicators));
    restoredIndicatorsCount = restoredIndicators.length;
    restoredIndicators.forEach(ind => {
      (["TW I", "TW II", "TW III", "TW IV"] as const).forEach(tw => {
        if (ind.quarters[tw]?.isFilled) updatedQuartersCount++;
      });
    });
  } else {
    // Smart merge: update each indicator
    const backupMap = new Map(payload.indicators.map(i => [i.kode, i]));

    restoredIndicators = currentIndicators.map(curr => {
      const backupInd = backupMap.get(curr.kode);
      if (!backupInd) return curr;

      let indModified = false;
      const mergedQuarters = { ...curr.quarters };

      (["TW I", "TW II", "TW III", "TW IV"] as const).forEach(tw => {
        const currQ = curr.quarters[tw];
        const backupQ = backupInd.quarters[tw];

        // If current is empty but backup has filled data, restore it!
        if (!currQ?.isFilled && backupQ?.isFilled) {
          mergedQuarters[tw] = JSON.parse(JSON.stringify(backupQ));
          updatedQuartersCount++;
          indModified = true;
        }
      });

      if (indModified) restoredIndicatorsCount++;
      return {
        ...curr,
        quarters: mergedQuarters
      };
    });
  }

  // Restore SPI Notes
  const restoredSpiNotes = mode === "full"
    ? (payload.spiNotes || {})
    : { ...(currentSpiNotes || {}), ...(payload.spiNotes || {}) };

  // 1. Commit to Cloud Firestore in batches
  try {
    const batch = writeBatch(db);
    restoredIndicators.forEach(ind => {
      const year = ind.tahun || payload.year || 2026;
      const docId = `${ind.kode}_${year}`;
      const docRef = doc(db, "indicators", docId);
      batch.set(docRef, { ...ind, tahun: year }, { merge: true });
    });

    if (payload.spiNotes) {
      Object.entries(payload.spiNotes).forEach(([key, note]) => {
        const docRef = doc(db, "spi_notes", key);
        const [y, q] = key.split("_");
        batch.set(docRef, {
          year: Number(y) || 2026,
          quarter: q || "TW II",
          note,
          updatedAt: new Date().toISOString(),
          restoredFromBackup: true
        }, { merge: true });
      });
    }

    await batch.commit();
  } catch (err) {
    console.error("Firestore batch commit failed during restore:", err);
    throw new Error("Gagal menyimpan data hasil restore ke Cloud Firestore. Silakan periksa koneksi internet.");
  }

  // 2. Commit to LocalStorage
  try {
    localStorage.setItem("PANTAU_IKU_DATA_2026", JSON.stringify(restoredIndicators));
    localStorage.setItem("PANTAU_IKU_SPI_NOTES_2026", JSON.stringify(restoredSpiNotes));
  } catch (err) {
    console.warn("Could not write restored data to localStorage:", err);
  }

  // 3. Save a post-restore local snapshot for safety audit
  saveLocalSnapshot(
    restoredIndicators,
    restoredSpiNotes,
    payload.year || 2026,
    `Post-Restore (${mode === "full" ? "Full Replace" : "Smart Merge"})`
  );

  return {
    restoredIndicators,
    restoredSpiNotes,
    stats: {
      total: restoredIndicators.length,
      updatedQuartersCount,
      restoredIndicatorsCount
    }
  };
}
