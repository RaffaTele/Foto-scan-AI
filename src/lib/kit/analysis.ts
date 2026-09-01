import { matchCatalog, type CatalogEntry } from "./catalog";
import type { KitCategory } from "./kit-db";

export interface AiGuess {
  category: KitCategory;
  brand: string;
  model: string;
  confidence: number;
  labels: string[];
  rawText: string;
}

export async function runVisualScan(dataUrl: string): Promise<{ catalogHit: CatalogEntry | null, rawText: string }> {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128));
    data[i] = data[i + 1] = data[i + 2] = contrast;
  }
  ctx.putImageData(imageData, 0, 0);

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["eng"]);
  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./° ",
  });
  
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  const photographicPattern = /\b(canon|nikon|sony|fuji|fujifilm|olympus|panasonic|lumix|leica|sigma|tamron|tokina|pentax|hasselblad|phase\s?one)\b|\b\d{2,3}mm\b|\bf\/\d+\.?\d*\b|\b(mark\s?(i{1,3}|iv|v|\d))\b/gi;
  const matches = text.match(photographicPattern);
  
  if (!matches || matches.length === 0) {
    return { catalogHit: null, rawText: text };
  }

  const filteredText = matches.join(" ");
  return { catalogHit: matchCatalog(filteredText), rawText: text };
}
