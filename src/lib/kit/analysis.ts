/**
 * Recognition layer — REAL browser-side AI, 100% offline, zero cost.
 *
 *   Stage A — TensorFlow.js + MobileNet classification → category guess.
 *   Stage B — Tesseract.js OCR → brand / model guess via the photo vocabulary.
 *
 * Every stage fails soft: on error or timeout the user simply gets an empty
 * form and types the data manually. Nothing here can crash the app.
 */

import { matchBrand, matchModel } from "./brands";
import type { KitCategory } from "./kit-db";

export interface DetectionResult {
  suggestedCategory: KitCategory;
  confidence: number;
  labels: string[];
}

export interface OcrResult {
  brand: string;
  model: string;
  rawText: string;
}

export interface AiGuess {
  category: KitCategory;
  brand: string;
  model: string;
  confidence: number;
  labels: string[];
  rawText: string;
}

const CAMERA_LABELS = ["reflex camera", "polaroid camera", "digital watch"];
const LENS_LABELS = ["lens", "loupe"];

const MOBILENET_TIMEOUT_MS = 20_000;
const OCR_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), ms)),
  ]);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

function categoryFor(labels: string[]): KitCategory {
  const text = labels.join(" ").toLowerCase();
  if (CAMERA_LABELS.some((l) => text.includes(l))) return "Camera";
  if (LENS_LABELS.some((l) => new RegExp(`\\b${l}\\b`).test(text))) return "Lens";
  return "Accessory";
}

let mobilenetModel: { classify: (img: HTMLImageElement) => Promise<{ className: string; probability: number }[]> } | null =
  null;

async function getModel() {
  if (mobilenetModel) return mobilenetModel;
  const [mobilenet, tf] = await Promise.all([
    import("@tensorflow-models/mobilenet"),
    import("@tensorflow/tfjs"),
  ]);
  await tf.ready();
  mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
  return mobilenetModel;
}

/** Stage A — MobileNet classification mapped onto photography categories. */
export async function detectCategory(dataUrl: string): Promise<DetectionResult> {
  const fallback: DetectionResult = { suggestedCategory: "Accessory", confidence: 0, labels: [] };
  try {
    const model = await withTimeout(getModel(), MOBILENET_TIMEOUT_MS, "mobilenet");
    const img = await loadImage(dataUrl);
    const predictions = await withTimeout(model.classify(img), MOBILENET_TIMEOUT_MS, "mobilenet");
    if (!predictions.length) return fallback;
    const labels = predictions.map((p) => p.className.toLowerCase());
    return {
      suggestedCategory: categoryFor(labels),
      confidence: predictions[0]?.probability ?? 0,
      labels,
    };
  } catch {
    return fallback;
  }
}

/** Stage B — Tesseract.js OCR, filtered through the photography vocabulary. */
export async function readText(dataUrl: string): Promise<OcrResult> {
  const empty: OcrResult = { brand: "", model: "", rawText: "" };
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await withTimeout(createWorker(["eng", "ita"]), OCR_TIMEOUT_MS, "ocr");
    try {
      const { data } = await withTimeout(worker.recognize(dataUrl), OCR_TIMEOUT_MS, "ocr");
      const rawText = (data.text ?? "").replace(/\s+/g, " ").trim();
      const tokens = rawText.split(" ").filter((t) => t.length > 1);
      const brand = matchBrand(tokens);
      const model = matchModel(tokens, brand);
      return { brand: brand ?? "", model: model ?? "", rawText };
    } finally {
      void worker.terminate().catch(() => undefined);
    }
  } catch {
    return empty;
  }
}

/**
 * Runs both stages over every captured angle and merges the best guesses.
 * Always resolves — never throws.
 */
export async function analyzeFrames(dataUrls: string[]): Promise<AiGuess> {
  const frames = dataUrls.slice(0, 6);
  const empty: AiGuess = {
    category: "Accessory",
    brand: "",
    model: "",
    confidence: 0,
    labels: [],
    rawText: "",
  };
  if (frames.length === 0) return empty;

  const results = await Promise.all(
    frames.map(async (frame) => {
      const [detection, ocr] = await Promise.all([
        detectCategory(frame).catch(() => null),
        readText(frame).catch(() => null),
      ]);
      return { detection, ocr };
    }),
  );

  const best = results
    .map((r) => r.detection)
    .filter((d): d is DetectionResult => !!d)
    .reduce<DetectionResult | null>((a, b) => (!a || b.confidence > a.confidence ? b : a), null);

  const labels = results.flatMap((r) => r.detection?.labels ?? []);
  const brand = results.map((r) => r.ocr?.brand).find((b) => !!b) ?? "";
  const model = results.map((r) => r.ocr?.model).find((m) => !!m) ?? "";
  const rawText = results
    .map((r) => r.ocr?.rawText ?? "")
    .filter(Boolean)
    .join(" · ");

  return {
    category: labels.length ? categoryFor(labels) : (best?.suggestedCategory ?? "Accessory"),
    brand,
    model,
    confidence: best?.confidence ?? 0,
    labels,
    rawText,
  };
}
