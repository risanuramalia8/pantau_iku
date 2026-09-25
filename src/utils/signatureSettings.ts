import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface SignatureConfig {
  directorName: string;
  directorNip: string;
  directorTitle: string;
  city: string;
}

export const DEFAULT_SIGNATURE_CONFIG: SignatureConfig = {
  directorName: "", // Dikosongkan sesuai permintaan jika belum diisi admin
  directorNip: "",  // Dikosongkan sesuai permintaan jika belum diisi admin
  directorTitle: "Direktur Poltekkes Kemenkes Palembang",
  city: "Palembang"
};

const LOCAL_STORAGE_KEY = "PANTAU_IKU_SIGNATURE_CONFIG";
const CUSTOM_EVENT_KEY = "pantau_iku_signature_updated";

export function getLocalSignatureConfig(): SignatureConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          directorName: parsed.directorName !== undefined ? parsed.directorName : "",
          directorNip: parsed.directorNip !== undefined ? parsed.directorNip : "",
          directorTitle: parsed.directorTitle || DEFAULT_SIGNATURE_CONFIG.directorTitle,
          city: parsed.city || DEFAULT_SIGNATURE_CONFIG.city
        };
      }
    }
  } catch (e) {
    console.error("Failed to load local signature config:", e);
  }
  return DEFAULT_SIGNATURE_CONFIG;
}

export function saveLocalSignatureConfig(config: SignatureConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_KEY, { detail: config }));
    }
  } catch (e) {
    console.error("Failed to save local signature config:", e);
  }
}

export async function fetchSignatureConfigFromFirestore(): Promise<SignatureConfig> {
  try {
    const docRef = doc(db, "system_settings", "signature_config");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SignatureConfig>;
      const config: SignatureConfig = {
        directorName: data.directorName !== undefined ? data.directorName : "",
        directorNip: data.directorNip !== undefined ? data.directorNip : "",
        directorTitle: data.directorTitle || DEFAULT_SIGNATURE_CONFIG.directorTitle,
        city: data.city || DEFAULT_SIGNATURE_CONFIG.city
      };
      saveLocalSignatureConfig(config);
      return config;
    }
  } catch (err) {
    console.warn("Could not fetch signature config from Firestore, fallback to local:", err);
  }
  return getLocalSignatureConfig();
}

export async function saveSignatureConfig(config: SignatureConfig): Promise<void> {
  saveLocalSignatureConfig(config);
  try {
    const docRef = doc(db, "system_settings", "signature_config");
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.error("Failed to save signature config to Firestore:", err);
  }
}

export function onSignatureConfigUpdated(callback: (config: SignatureConfig) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<SignatureConfig>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener(CUSTOM_EVENT_KEY, handler);
    return () => window.removeEventListener(CUSTOM_EVENT_KEY, handler);
  }
  return () => {};
}
