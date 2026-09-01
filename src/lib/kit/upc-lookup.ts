/**
 * Free, no-account barcode lookup through the public UPCitemdb trial API.
 * Fails soft: any error, timeout or miss returns null so the UI can fall back
 * to the blank manual form.
 */

import type { KitCategory } from "./kit-db";

export interface UpcLookupResult {
  title: string;
  brand: string;
  category: KitCategory;
  description: string;
}

const ENDPOINT = "https://api.upcitemdb.com/prod/trial/lookup?upc=";
const TIMEOUT_MS = 8_000;

/** Very small keyword classifier over the product title/category text. */
export function guessCategory(text: string): KitCategory {
  const t = text.toLowerCase();
  if (/\b(lens|objektiv|obiettivo|objectif|zoom|prime|mm f\/?)\b/.test(t) || /\d{2,3}mm/.test(t))
    return "Lens";
  if (/\b(flash|speedlite|speedlight|strobe|blitz|lampeggiatore)\b/.test(t)) return "Flash";
  if (/\b(camera|dslr|mirrorless|body|fotocamera|kamera|appareil photo)\b/.test(t)) return "Camera";
  if (/\b(tripod|bag|filter|battery|card|strap|cage|microphone|charger|treppiede)\b/.test(t))
    return "Accessory";
  return "Accessory";
}

export async function lookupBarcode(upc: string): Promise<UpcLookupResult | null> {
  const code = upc.trim();
  if (!/^\d{6,14}$/.test(code)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}${encodeURIComponent(code)}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      items?: { title?: string; brand?: string; category?: string; description?: string }[];
    };
    const item = json.items?.[0];
    if (!item?.title) return null;

    const title = item.title.trim();
    const brand = (item.brand ?? "").trim();
    const haystack = `${title} ${item.category ?? ""} ${item.description ?? ""}`;
    return {
      title,
      brand,
      category: guessCategory(haystack),
      description: (item.description ?? "").trim().slice(0, 300),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Splits a marketplace title into brand + model when possible. */
export function splitTitle(title: string, brand: string): { brand: string; model: string } {
  if (brand && title.toLowerCase().startsWith(brand.toLowerCase())) {
    return { brand, model: title.slice(brand.length).trim().replace(/^[-–,]\s*/, "") };
  }
  if (brand) return { brand, model: title };
  const [first, ...rest] = title.split(" ");
  return { brand: first ?? "", model: rest.join(" ") };
}
