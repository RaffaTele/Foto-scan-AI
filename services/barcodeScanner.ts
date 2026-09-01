/**
 * Offline barcode scanning — no API keys, no network.
 * NOTE: the npm package "ml-kit-barcode-scanner" does not exist in the registry
 * (ML Kit is a native Android/iOS SDK, not usable in a web app), so this uses
 * ZXing, which is already installed and runs fully offline in the browser.
 */

import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export interface ScannedBarcode {
  rawValue: string;
  format: string;
}

const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
];

let reader: BrowserMultiFormatReader | null = null;

function getReader(): BrowserMultiFormatReader {
  if (!reader) {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);
    hints.set(DecodeHintType.TRY_HARDER, true);
    reader = new BrowserMultiFormatReader(hints);
  }
  return reader;
}

/** Decodes every barcode found in a base64 image. Returns [] when none. */
export async function scanBarcodeFromImage(base64Image: string): Promise<ScannedBarcode[]> {
  if (typeof window === "undefined") return [];

  const img = new Image();
  img.src = base64Image;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  try {
    const result = await getReader().decodeFromImageElement(img);
    return [
      {
        rawValue: result.getText(),
        format: BarcodeFormat[result.getBarcodeFormat()],
      },
    ];
  } catch {
    return [];
  }
}
