/**
 * Data layer — models shared by every scanning/recognition service.
 * UI never invents these shapes; it only consumes them.
 */

export type ScanMode = "barcode" | "object";

export type ItemCategory = "camera" | "lens" | "flash" | "accessory" | "unknown";

export type ItemSource = "barcode" | "visual";

/** A single frame captured from the camera (one angle of the object). */
export interface CapturedFrame {
  id: string;
  /** base64 data URL (JPEG). Replaceable with a blob/remote reference later. */
  imageData: string;
  angleIndex: number;
  timestamp: number;
}

/** Structured description of a physical item, whatever produced it. */
export interface ItemInfo {
  itemName: string;
  brand: string;
  category: ItemCategory;
  model: string;
  description: string;
  imageUrl: string;
  source: ItemSource;
}

/** Normalized outcome of any scan, whatever the mode. */
export interface ScanResult {
  id: string;
  mode: ScanMode;
  /** Barcode payload (barcode mode only). */
  rawValue?: string;
  /** Barcode symbology, e.g. "EAN-13", "QR". */
  codeFormat?: string;
  itemName: string;
  brand?: string;
  category: ItemCategory;
  /** 0..1 */
  confidence: number;
  specs?: string[];
  /** Full structured info when the item could be identified. */
  item?: ItemInfo;
  /** True when a barcode was decoded but no product matched it. */
  itemNotFound?: boolean;
  timestamp: number;
}

export class ScanError extends Error {
  constructor(
    message: string,
    readonly code: "no-barcode" | "decode-failed" | "camera" | "low-confidence" | "lookup-failed",
  ) {
    super(message);
    this.name = "ScanError";
  }
}

export function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Minimum frames before object recognition is attempted. */
export const MIN_OBJECT_FRAMES = 2;
/** Maximum frames kept in memory for one object session. */
export const MAX_OBJECT_FRAMES = 6;
/** Below this confidence a visual result is considered uncertain. */
export const CONFIDENCE_THRESHOLD = 0.75;
