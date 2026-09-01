/**
 * UI layer glue — binds camera, barcode decoding and the real AI pipeline
 * to React state. When nothing is recognized the hook exposes a manual
 * draft so the UI can always offer the ConfirmItemForm ("learning" flow).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { barcodeScannerService } from "@/lib/scanner/barcode-scanner-service";
import { CameraService } from "@/lib/scanner/camera-service";
import { ObjectScannerService } from "@/lib/scanner/object-scanner-service";
import { scanRepository } from "@/lib/scanner/scan-repository";
import {
  MAX_OBJECT_FRAMES,
  MIN_OBJECT_FRAMES,
  ScanError,
  type CapturedFrame,
  type ItemCategory,
  type ScanMode,
  type ScanResult,
} from "@/lib/scanner/types";
import { analyzeFrames } from "@/lib/kit/analysis";
import { matchCatalog } from "@/lib/kit/catalog";
import { lookupBarcode, splitTitle } from "@/lib/kit/upc-lookup";
import { addItem, getItemByBarcode, type KitCategory, type KitItem } from "@/lib/kit/kit-db";

export interface ManualDraft {
  category: KitCategory;
  brand: string;
  model: string;
  notes: string;
  image: string;
  barcode?: string;
  confidence: number;
}

const EMPTY_DRAFT: ManualDraft = {
  category: "Accessory",
  brand: "",
  model: "",
  notes: "",
  image: "",
  confidence: 0,
};

function toCategory(kit: KitCategory): ItemCategory {
  switch (kit) {
    case "Camera":
      return "camera";
    case "Lens":
      return "lens";
    case "Flash":
      return "flash";
    case "Accessory":
      return "accessory";
    default:
      return "unknown";
  }
}

function resultFromKitItem(item: KitItem, mode: ScanMode, rawValue?: string, codeFormat?: string): ScanResult {
  return {
    id: `kit-${item.id ?? Date.now()}`,
    mode,
    ...(rawValue ? { rawValue } : {}),
    ...(codeFormat ? { codeFormat } : {}),
    itemName: [item.brand, item.model].filter(Boolean).join(" ") || "Saved item",
    brand: item.brand,
    category: toCategory(item.category),
    confidence: 1,
    item: {
      itemName: [item.brand, item.model].filter(Boolean).join(" ") || "Saved item",
      brand: item.brand,
      category: toCategory(item.category),
      model: item.model,
      description: item.notes,
      imageUrl: item.image,
      source: mode === "barcode" ? "barcode" : "visual",
    },
    timestamp: Date.now(),
  };
}

export function useScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<CameraService | null>(null);
  const objectRef = useRef<ObjectScannerService | null>(null);

  const [mode, setModeState] = useState<ScanMode>("barcode");
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [draft, setDraft] = useState<ManualDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cameraRef.current) cameraRef.current = new CameraService();
  if (!objectRef.current) objectRef.current = new ObjectScannerService();

  const stopCamera = useCallback(() => {
    cameraRef.current?.stop();
    setCameraOn(false);
  }, []);

  useEffect(() => () => cameraRef.current?.stop(), []);

  const startCamera = useCallback(
    async (nextMode: ScanMode = mode) => {
      setError(null);
      const video = videoRef.current;
      if (!video) return;
      try {
        await cameraRef.current!.start({ mode: nextMode, video });
        setCameraOn(true);
      } catch (e) {
        setCameraOn(false);
        setError(e instanceof ScanError ? e.message : "Camera unavailable");
      }
    },
    [mode],
  );

  const clearDraft = useCallback(() => setDraft(null), []);

  const setMode = useCallback(
    (next: ScanMode) => {
      if (next === mode) return;
      setModeState(next);
      setError(null);
      setResult(null);
      setDraft(null);
      objectRef.current!.reset();
      setFrames([]);
      if (cameraOn) void startCamera(next);
    },
    [mode, cameraOn, startCamera],
  );

  /** Barcode mode: decode one frame, then look the code up in the local kit DB. */
  const scanBarcode = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !cameraOn || busy) return;
    setBusy(true);
    setError(null);
    setDraft(null);
    setStatus("Decoding barcode…");
    try {
      const decoded = await barcodeScannerService.decodeFrame(video);
      const code = decoded.rawValue ?? "";
      const snapshot = (() => {
        try {
          return CameraService.grabDataUrl(video);
        } catch {
          return "";
        }
      })();
      const known = await getItemByBarcode(code);
      if (known) {
        const scan = resultFromKitItem(known, "barcode", code, decoded.codeFormat);
        setResult(scan);
        await scanRepository.saveScanResult(scan);
      } else {
        // Not in the local DB: try the free public product lookup, then fall
        // back to a blank manual form. Never a dead end.
        setStatus("Looking up product…");
        const found = await lookupBarcode(code).catch(() => null);
        setResult({ ...decoded, itemNotFound: true });
        if (found) {
          const { brand, model } = splitTitle(found.title, found.brand);
          setDraft({
            ...EMPTY_DRAFT,
            category: found.category,
            brand,
            model,
            barcode: code,
            image: snapshot,
            notes: found.description || `Barcode: ${code}`,
            confidence: 0.6,
          });
        } else {
          setDraft({ ...EMPTY_DRAFT, barcode: code, image: snapshot, notes: `Barcode: ${code}` });
        }
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof ScanError ? e.message : "Unable to read barcode");
    } finally {
      setStatus("");
      setBusy(false);
    }
  }, [cameraOn, busy]);

  /** Object mode: capture one more angle. */
  const captureAngle = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraOn || busy) return;
    setError(null);
    objectRef.current!.captureAngle(video);
    setFrames(objectRef.current!.getFrames());
  }, [cameraOn, busy]);

  /** Object mode: real AI pipeline (MobileNet + Tesseract) over every angle. */
  const recognizeObject = useCallback(async () => {
    if (busy) return;
    const captured = objectRef.current!.getFrames();
    if (captured.length < MIN_OBJECT_FRAMES) {
      setError(`Capture at least ${MIN_OBJECT_FRAMES} angles`);
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    setStatus("Running on-device AI…");
    let guess: Awaited<ReturnType<typeof analyzeFrames>> | null = null;
    try {
      guess = await analyzeFrames(captured.map((f) => f.imageData));
    } catch {
      guess = null;
    }
    // Static-dictionary rescue: fragmented OCR like "D850" → "Nikon D850".
    const catalogHit = guess?.rawText
      ? (matchCatalog(guess.rawText) ??
        matchCatalog([guess.brand, guess.model].filter(Boolean).join(" ")))
      : null;

    // Whatever the AI produced (even nothing), the user confirms manually.
    setDraft({
      ...EMPTY_DRAFT,
      category: catalogHit?.category ?? guess?.category ?? "Accessory",
      brand: catalogHit?.brand ?? guess?.brand ?? "",
      model: catalogHit?.model ?? guess?.model ?? "",
      notes: "",
      image: captured[0]?.imageData ?? "",
      confidence: catalogHit ? Math.max(guess?.confidence ?? 0, 0.7) : (guess?.confidence ?? 0),
    });
    setStatus("");
    setBusy(false);
  }, [busy]);

  const resetFrames = useCallback(() => {
    objectRef.current!.reset();
    setFrames([]);
    setDraft(null);
    setResult(null);
    setError(null);
  }, []);

  /** Saves the manually confirmed item into IndexedDB — the learning database. */
  const saveDraft = useCallback(
    async (value: { category: KitCategory; brand: string; model: string; notes: string }) => {
      if (!draft) return false;
      setSaving(true);
      try {
        const item: KitItem = {
          image: draft.image,
          category: value.category,
          brand: value.brand.trim(),
          model: value.model.trim(),
          notes: value.notes.trim(),
          dateAdded: new Date().toISOString(),
          confidence: draft.confidence,
          ...(draft.barcode ? { barcode: draft.barcode } : {}),
        };
        const id = await addItem(item);
        setResult(resultFromKitItem({ ...item, id }, mode, draft.barcode));
        setDraft(null);
        objectRef.current!.reset();
        setFrames([]);
        return true;
      } catch {
        setError("Could not save locally — storage unavailable.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [draft, mode],
  );

  const saveToKit = useCallback(async () => {
    if (result) await scanRepository.addToGear(result);
  }, [result]);

  return {
    videoRef,
    mode,
    setMode,
    cameraOn,
    startCamera,
    stopCamera,
    busy,
    status,
    frames,
    frameCount: frames.length,
    minFrames: MIN_OBJECT_FRAMES,
    maxFrames: MAX_OBJECT_FRAMES,
    canRecognize: frames.length >= MIN_OBJECT_FRAMES,
    result,
    draft,
    clearDraft,
    saving,
    saveDraft,
    error,
    scanBarcode,
    captureAngle,
    recognizeObject,
    resetFrames,
    saveToKit,
  };
}
