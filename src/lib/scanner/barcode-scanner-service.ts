/**
 * Scanning layer — barcode detection & decoding (UPC / EAN / QR).
 *
 * Strategy: use the native BarcodeDetector when the browser exposes it
 * (fast, hardware accelerated); otherwise fall back to ZXing in JS.
 * A single frame is enough for a decode attempt.
 */

import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

import { CameraService } from "./camera-service";
import { ScanError, createId, type ScanResult } from "./types";

const ZXING_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
];

const NATIVE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128", "code_39", "itf"];

const FORMAT_LABELS: Record<string, string> = {
  ean_13: "EAN-13",
  ean_8: "EAN-8",
  upc_a: "UPC-A",
  upc_e: "UPC-E",
  qr_code: "QR",
  code_128: "Code 128",
  code_39: "Code 39",
  itf: "ITF",
};

function labelFor(format: string): string {
  return FORMAT_LABELS[format] ?? format.replace(/_/g, "-").toUpperCase();
}

type NativeDetector = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string; format: string }[]>;
};

export interface IBarcodeScannerService {
  decodeFrame(video: HTMLVideoElement): Promise<ScanResult>;
}

export class BarcodeScannerService implements IBarcodeScannerService {
  private zxing: BrowserMultiFormatReader | null = null;
  private native: NativeDetector | null = null;

  private getZxing(): BrowserMultiFormatReader {
    if (!this.zxing) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
      hints.set(DecodeHintType.TRY_HARDER, true);
      this.zxing = new BrowserMultiFormatReader(hints);
    }
    return this.zxing;
  }

  private getNative(): NativeDetector | null {
    if (this.native) return this.native;
    const Ctor = (globalThis as { BarcodeDetector?: new (o: unknown) => NativeDetector }).BarcodeDetector;
    if (!Ctor) return null;
    try {
      this.native = new Ctor({ formats: NATIVE_FORMATS });
    } catch {
      this.native = null;
    }
    return this.native;
  }

  /**
   * Attempts to detect and decode a barcode inside the current video frame.
   * Throws ScanError('no-barcode') when nothing is found,
   * ScanError('decode-failed') when a code is present but unreadable.
   */
  async decodeFrame(video: HTMLVideoElement): Promise<ScanResult> {
    const canvas = CameraService.grabCanvas(video);

    const native = this.getNative();
    if (native) {
      try {
        const [hit] = await native.detect(canvas);
        if (hit?.rawValue) return this.toResult(hit.rawValue, labelFor(hit.format));
      } catch {
        // fall through to ZXing
      }
    }

    try {
      const result = this.getZxing().decodeFromCanvas(canvas);
      const value = result.getText();
      if (!value) throw new ScanError("Unable to read barcode", "decode-failed");
      return this.toResult(value, labelFor(BarcodeFormat[result.getBarcodeFormat()].toLowerCase()));
    } catch (error) {
      if (error instanceof ScanError) throw error;
      if (error instanceof NotFoundException || (error as Error)?.name === "NotFoundException") {
        throw new ScanError("No barcode detected", "no-barcode");
      }
      throw new ScanError("Unable to read barcode", "decode-failed");
    }
  }

  private toResult(rawValue: string, codeFormat: string): ScanResult {
    return {
      id: createId(),
      mode: "barcode",
      rawValue,
      codeFormat,
      itemName: rawValue,
      category: "unknown",
      confidence: 1,
      timestamp: Date.now(),
    };
  }
}

export const barcodeScannerService = new BarcodeScannerService();
