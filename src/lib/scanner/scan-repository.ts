/**
 * Data layer — persistence boundary.
 * Today: in-memory + localStorage. Tomorrow: a real database or remote API,
 * by providing another IScanRepository implementation. No UI change required.
 */

import type { ScanResult } from "./types";

export interface IScanRepository {
  saveScanResult(result: ScanResult): Promise<void>;
  /** Future "History" page. */
  getScanHistory(): Promise<ScanResult[]>;
  /** Future "Kit" page — items the user marked as owned gear. */
  getUserGear(): Promise<ScanResult[]>;
  addToGear(result: ScanResult): Promise<void>;
  clear(): Promise<void>;
}

const HISTORY_KEY = "lenslock.history";
const GEAR_KEY = "lenslock.gear";
const LIMIT = 100;

function read(key: string): ScanResult[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as ScanResult[];
  } catch {
    return [];
  }
}

function write(key: string, value: ScanResult[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value.slice(0, LIMIT)));
  } catch {
    // storage full or unavailable — non fatal
  }
}

export class LocalScanRepository implements IScanRepository {
  async saveScanResult(result: ScanResult): Promise<void> {
    write(HISTORY_KEY, [result, ...read(HISTORY_KEY)]);
  }

  async getScanHistory(): Promise<ScanResult[]> {
    return read(HISTORY_KEY);
  }

  async getUserGear(): Promise<ScanResult[]> {
    return read(GEAR_KEY);
  }

  async addToGear(result: ScanResult): Promise<void> {
    write(GEAR_KEY, [result, ...read(GEAR_KEY).filter((r) => r.itemName !== result.itemName)]);
  }

  async clear(): Promise<void> {
    write(HISTORY_KEY, []);
    write(GEAR_KEY, []);
  }
}

export const scanRepository: IScanRepository = new LocalScanRepository();
