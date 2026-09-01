/** Data layer — local-only IndexedDB storage for the user's growing kit database. */

import { openDB, type IDBPDatabase } from "idb";

export type KitCategory = "Camera" | "Lens" | "Flash" | "Accessory" | "Other";

export interface KitItem {
  id?: number;
  image: string;
  category: KitCategory;
  brand: string;
  model: string;
  notes: string;
  dateAdded: string;
  confidence: number;
  /** Barcode payload when the item was learned from a barcode scan. */
  barcode?: string;
}

const DB_NAME = "lenslock";
const STORE = "kitItems";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable");
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db, _oldVersion, _newVersion, tx) {
        const store = db.objectStoreNames.contains(STORE)
          ? tx.objectStore(STORE)
          : db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        if (!store.indexNames.contains("barcode")) {
          store.createIndex("barcode", "barcode");
        }
      },
    });
  }
  return dbPromise;
}

export async function addItem(item: KitItem): Promise<number> {
  const db = await getDb();
  return (await db.add(STORE, item)) as number;
}

export async function getAllItems(): Promise<KitItem[]> {
  try {
    const db = await getDb();
    const items = (await db.getAll(STORE)) as KitItem[];
    return items.sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));
  } catch {
    return [];
  }
}

export async function getItemById(id: number): Promise<KitItem | undefined> {
  const db = await getDb();
  return (await db.get(STORE, id)) as KitItem | undefined;
}

/** "Learning" lookup — a barcode saved once is remembered forever. */
export async function getItemByBarcode(barcode: string): Promise<KitItem | undefined> {
  const code = barcode.trim();
  if (!code) return undefined;
  try {
    const db = await getDb();
    return (await db.getFromIndex(STORE, "barcode", code)) as KitItem | undefined;
  } catch {
    return undefined;
  }
}

export async function deleteItem(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}
