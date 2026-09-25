import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SystemAccount } from "../types";

export const DEFAULT_SYSTEM_ACCOUNTS: SystemAccount[] = [
  {
    username: "admin",
    password: "admin123",
    name: "Admin Perencana Poltekkes",
    role: "admin",
    email: "admin.perencanaan@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "direktur",
    password: "direktur123",
    name: "Direktur Poltekkes Kemenkes Palembang",
    role: "direktur",
    email: "direktur@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "alumni_kerjasama",
    password: "alumni123",
    name: "PJ Alumni dan Kerjasama",
    role: "pj",
    pjName: "Alumni dan Kerjasama",
    email: "alumni.kerjasama@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "akademik",
    password: "akademik123",
    name: "PJ Akademik",
    role: "pj",
    pjName: "Akademik",
    email: "akademik@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "p2m",
    password: "p2m123",
    name: "PJ P2M",
    role: "pj",
    pjName: "P2M",
    email: "p2m@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "kepegawaian",
    password: "kepegawaian123",
    name: "PJ Kepegawaian",
    role: "pj",
    pjName: "Kepegawaian",
    email: "kepegawaian@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "upm",
    password: "upm123",
    name: "PJ UPM",
    role: "pj",
    pjName: "UPM",
    email: "upm@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "bahasa",
    password: "bahasa123",
    name: "PJ Pengembangan Bahasa",
    role: "pj",
    pjName: "Pengembangan Bahasa",
    email: "bahasa@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "kemahasiswaan",
    password: "kemahasiswaan123",
    name: "PJ Kemahasiswaan",
    role: "pj",
    pjName: "Kemahasiswaan",
    email: "kemahasiswaan@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "spi",
    password: "spi123",
    name: "PJ SPI",
    role: "pj",
    pjName: "SPI",
    email: "spi@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "keuangan",
    password: "keuangan123",
    name: "PJ Keuangan",
    role: "pj",
    pjName: "Keuangan",
    email: "keuangan@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "upr",
    password: "upr123",
    name: "PJ UPR",
    role: "pj",
    pjName: "UPR",
    email: "upr@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "verifikator_spi",
    password: "spi123",
    name: "Verifikator SPI",
    role: "spi_verifier",
    email: "verifikator.spi@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "wadir1",
    password: "wadir123",
    name: "Wadir I (Wakil Direktur I)",
    role: "pj",
    pjName: "Wadir 1",
    email: "wadir1@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "wadir2",
    password: "wadir123",
    name: "Wadir II (Wakil Direktur II)",
    role: "pj",
    pjName: "Wadir 2",
    email: "wadir2@poltekkes-palembang.ac.id",
    isDefault: true
  },
  {
    username: "wadir3",
    password: "wadir123",
    name: "Wadir III (Wakil Direktur III)",
    role: "pj",
    pjName: "Wadir 3",
    email: "wadir3@poltekkes-palembang.ac.id",
    isDefault: true
  }
];

const LOCAL_STORAGE_KEY = "PANTAU_IKU_CUSTOM_ACCOUNTS";

export function getLocalCustomAccounts(): SystemAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to read local accounts:", e);
  }
  return [];
}

export function saveLocalCustomAccounts(accounts: SystemAccount[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save local accounts:", e);
  }
}

export async function fetchCustomAccountsFromFirestore(): Promise<SystemAccount[]> {
  try {
    const snapshot = await getDocs(collection(db, "system_accounts"));
    const accounts: SystemAccount[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as SystemAccount;
      if (data && data.username) {
        accounts.push({
          ...data,
          isDefault: false
        });
      }
    });
    // Sync to localstorage
    if (accounts.length > 0) {
      saveLocalCustomAccounts(accounts);
    }
    return accounts;
  } catch (error) {
    console.warn("Could not fetch accounts from Firestore, using LocalStorage cache:", error);
    return getLocalCustomAccounts();
  }
}

export async function getAllAccounts(): Promise<SystemAccount[]> {
  // Start with default accounts
  const defaults = [...DEFAULT_SYSTEM_ACCOUNTS];
  
  // Try to load custom accounts from Firestore, fall back to local
  let customs = getLocalCustomAccounts();
  try {
    const remoteCustoms = await fetchCustomAccountsFromFirestore();
    if (remoteCustoms.length > 0) {
      customs = remoteCustoms;
    }
  } catch (err) {
    console.warn("Error fetching remote accounts:", err);
  }

  // Merge (custom accounts can overwrite or add new ones)
  const map = new Map<string, SystemAccount>();
  defaults.forEach(a => map.set(a.username.toLowerCase(), a));
  customs.forEach(a => map.set(a.username.toLowerCase(), a));

  return Array.from(map.values());
}

export async function saveAccount(account: SystemAccount): Promise<void> {
  const normalizedUsername = account.username.trim().toLowerCase();
  const accountToSave: SystemAccount = {
    ...account,
    username: normalizedUsername,
    isDefault: false,
    updatedAt: new Date().toISOString(),
    createdAt: account.createdAt || new Date().toISOString()
  };

  // 1. Save to LocalStorage immediately
  const localList = getLocalCustomAccounts();
  const existingIdx = localList.findIndex(a => a.username.toLowerCase() === normalizedUsername);
  if (existingIdx >= 0) {
    localList[existingIdx] = accountToSave;
  } else {
    localList.push(accountToSave);
  }
  saveLocalCustomAccounts(localList);

  // 2. Save to Firestore collection `system_accounts` (docId = username)
  try {
    const docRef = doc(db, "system_accounts", normalizedUsername);
    await setDoc(docRef, accountToSave, { merge: true });
  } catch (e) {
    console.error("Failed to save account to Firestore:", e);
    // Even if Firestore fails, local storage keeps it intact
  }
}

export async function deleteAccount(username: string): Promise<void> {
  const normalizedUsername = username.trim().toLowerCase();

  // 1. Remove from LocalStorage
  const localList = getLocalCustomAccounts().filter(a => a.username.toLowerCase() !== normalizedUsername);
  saveLocalCustomAccounts(localList);

  // 2. Delete from Firestore
  try {
    const docRef = doc(db, "system_accounts", normalizedUsername);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Failed to delete account from Firestore:", e);
  }
}
