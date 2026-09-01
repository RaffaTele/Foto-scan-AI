/**
 * Static offline catalogue of popular photography gear.
 * Used to rescue fragmented Tesseract OCR output ("D850" → "Nikon D850", Camera).
 */

import type { KitCategory } from "./kit-db";

export interface CatalogEntry {
  brand: string;
  model: string;
  category: KitCategory;
  /** Lowercase keywords searched inside the raw OCR text. */
  keys: string[];
}

const e = (brand: string, model: string, category: KitCategory, ...keys: string[]): CatalogEntry => ({
  brand,
  model,
  category,
  keys: [model.toLowerCase(), ...keys.map((k) => k.toLowerCase())],
});

export const GEAR_CATALOG: CatalogEntry[] = [
  // Canon bodies
  e("Canon", "EOS 5D Mark IV", "Camera", "5d mark iv", "5d4"),
  e("Canon", "EOS 5D Mark III", "Camera", "5d mark iii"),
  e("Canon", "EOS 6D Mark II", "Camera", "6d mark ii"),
  e("Canon", "EOS R5", "Camera", "eos r5", "r5"),
  e("Canon", "EOS R6 Mark II", "Camera", "eos r6", "r6"),
  e("Canon", "EOS R8", "Camera", "eos r8"),
  e("Canon", "EOS R100", "Camera", "eos r100"),
  e("Canon", "EOS 90D", "Camera", "90d"),
  e("Canon", "EOS 250D", "Camera", "250d", "rebel sl3"),
  e("Canon", "EOS 2000D", "Camera", "2000d", "rebel t7"),
  e("Canon", "EOS M50 Mark II", "Camera", "m50"),
  e("Canon", "PowerShot G7 X Mark III", "Camera", "g7 x", "g7x"),
  // Canon lenses
  e("Canon", "RF 24-70mm f/2.8L IS USM", "Lens", "rf 24-70"),
  e("Canon", "RF 50mm f/1.8 STM", "Lens", "rf 50"),
  e("Canon", "RF 70-200mm f/2.8L", "Lens", "rf 70-200"),
  e("Canon", "EF 24-105mm f/4L IS USM", "Lens", "ef 24-105", "24-105"),
  e("Canon", "EF 50mm f/1.8 STM", "Lens", "ef 50", "nifty fifty"),
  e("Canon", "EF-S 18-55mm IS STM", "Lens", "18-55"),
  // Nikon
  e("Nikon", "D850", "Camera", "d850"),
  e("Nikon", "D780", "Camera", "d780"),
  e("Nikon", "D750", "Camera", "d750"),
  e("Nikon", "D7500", "Camera", "d7500"),
  e("Nikon", "D5600", "Camera", "d5600"),
  e("Nikon", "D3500", "Camera", "d3500"),
  e("Nikon", "Z9", "Camera", "z 9", "z9"),
  e("Nikon", "Z8", "Camera", "z 8", "z8"),
  e("Nikon", "Z6 III", "Camera", "z6", "z 6"),
  e("Nikon", "Z7 II", "Camera", "z7", "z 7"),
  e("Nikon", "Zf", "Camera", "zf"),
  e("Nikon", "Z fc", "Camera", "z fc", "zfc"),
  e("Nikon", "NIKKOR Z 24-70mm f/2.8 S", "Lens", "z 24-70"),
  e("Nikon", "NIKKOR Z 50mm f/1.8 S", "Lens", "z 50mm"),
  e("Nikon", "AF-S 70-200mm f/2.8E FL", "Lens", "70-200"),
  e("Nikon", "AF-S 35mm f/1.8G", "Lens", "35mm f/1.8g"),
  // Sony
  e("Sony", "Alpha A7 IV", "Camera", "a7 iv", "a7iv", "ilce-7m4"),
  e("Sony", "Alpha A7 III", "Camera", "a7 iii", "a7iii", "ilce-7m3"),
  e("Sony", "Alpha A7R V", "Camera", "a7r v", "a7rv"),
  e("Sony", "Alpha A7S III", "Camera", "a7s iii", "a7siii"),
  e("Sony", "Alpha A9 III", "Camera", "a9 iii", "a9iii"),
  e("Sony", "Alpha A6700", "Camera", "a6700"),
  e("Sony", "Alpha A6400", "Camera", "a6400"),
  e("Sony", "ZV-E10", "Camera", "zv-e10", "zve10"),
  e("Sony", "ZV-1", "Camera", "zv-1", "zv1"),
  e("Sony", "FX3", "Camera", "fx3"),
  e("Sony", "FE 24-70mm f/2.8 GM II", "Lens", "24-70 gm"),
  e("Sony", "FE 50mm f/1.8", "Lens", "fe 50"),
  e("Sony", "FE 85mm f/1.8", "Lens", "fe 85"),
  e("Sony", "FE 70-200mm f/2.8 GM", "Lens", "70-200 gm"),
  // Fujifilm
  e("Fujifilm", "X-T5", "Camera", "x-t5", "xt5"),
  e("Fujifilm", "X-T4", "Camera", "x-t4", "xt4"),
  e("Fujifilm", "X-T30 II", "Camera", "x-t30", "xt30"),
  e("Fujifilm", "X-S20", "Camera", "x-s20", "xs20"),
  e("Fujifilm", "X-Pro3", "Camera", "x-pro3", "xpro3"),
  e("Fujifilm", "X100VI", "Camera", "x100vi", "x100v", "x100"),
  e("Fujifilm", "GFX 100S", "Camera", "gfx 100", "gfx100"),
  e("Fujifilm", "XF 18-55mm f/2.8-4 R LM OIS", "Lens", "xf 18-55"),
  e("Fujifilm", "XF 35mm f/1.4 R", "Lens", "xf 35"),
  // Panasonic / OM / Pentax / Leica / Hasselblad
  e("Panasonic", "Lumix S5 II", "Camera", "s5 ii", "s5ii", "lumix s5"),
  e("Panasonic", "Lumix GH6", "Camera", "gh6"),
  e("Panasonic", "Lumix GH5", "Camera", "gh5"),
  e("Panasonic", "Lumix G9 II", "Camera", "g9"),
  e("OM System", "OM-1 Mark II", "Camera", "om-1", "om1"),
  e("Olympus", "OM-D E-M10 Mark IV", "Camera", "e-m10", "em10"),
  e("Olympus", "OM-D E-M5 Mark III", "Camera", "e-m5", "em5"),
  e("Pentax", "K-3 Mark III", "Camera", "k-3", "k3"),
  e("Leica", "Q3", "Camera", "leica q3"),
  e("Leica", "M11", "Camera", "m11"),
  e("Leica", "SL3", "Camera", "sl3"),
  e("Hasselblad", "X2D 100C", "Camera", "x2d"),
  // Third-party lenses
  e("Sigma", "24-70mm f/2.8 DG DN Art", "Lens", "24-70 art", "dg dn art"),
  e("Sigma", "35mm f/1.4 DG HSM Art", "Lens", "35mm art"),
  e("Sigma", "85mm f/1.4 DG DN Art", "Lens", "85mm art"),
  e("Sigma", "150-600mm Contemporary", "Lens", "150-600"),
  e("Sigma", "18-50mm f/2.8 DC DN", "Lens", "18-50 dc dn"),
  e("Tamron", "28-75mm f/2.8 Di III VXD G2", "Lens", "28-75"),
  e("Tamron", "70-180mm f/2.8 Di III VXD", "Lens", "70-180"),
  e("Tamron", "17-28mm f/2.8 Di III RXD", "Lens", "17-28"),
  e("Tokina", "AT-X 11-16mm f/2.8", "Lens", "11-16"),
  e("Samyang", "85mm f/1.4", "Lens", "samyang 85"),
  e("Viltrox", "56mm f/1.4", "Lens", "viltrox 56"),
  e("Zeiss", "Batis 25mm f/2", "Lens", "batis"),
  e("Laowa", "15mm f/4 Macro", "Lens", "laowa 15"),
  // Flashes & lighting
  e("Godox", "V1", "Flash", "godox v1"),
  e("Godox", "AD200 Pro", "Flash", "ad200"),
  e("Godox", "TT685 II", "Flash", "tt685"),
  e("Canon", "Speedlite 430EX III-RT", "Flash", "430ex"),
  e("Canon", "Speedlite 600EX II-RT", "Flash", "600ex"),
  e("Nikon", "Speedlight SB-700", "Flash", "sb-700", "sb700"),
  e("Sony", "HVL-F60RM2", "Flash", "hvl-f60"),
  e("Profoto", "A10", "Flash", "profoto a10"),
  e("Elinchrom", "ELB 500 TTL", "Flash", "elb 500"),
  // Accessories
  e("DJI", "Osmo Pocket 3", "Accessory", "pocket 3"),
  e("DJI", "RS 4", "Accessory", "rs 4", "ronin"),
  e("GoPro", "HERO12 Black", "Accessory", "hero12", "hero 12"),
  e("GoPro", "HERO11 Black", "Accessory", "hero11", "hero 11"),
  e("Manfrotto", "Befree Advanced Tripod", "Accessory", "befree"),
  e("Manfrotto", "MT055 Tripod", "Accessory", "055"),
  e("Gitzo", "GT2545T Traveler", "Accessory", "gt2545"),
  e("Peak Design", "Everyday Backpack", "Accessory", "everyday backpack"),
  e("Peak Design", "Capture Clip V3", "Accessory", "capture clip"),
  e("Lowepro", "ProTactic BP 450 AW", "Accessory", "protactic"),
  e("Think Tank", "Airport Advantage", "Accessory", "airport advantage"),
  e("SmallRig", "Camera Cage", "Accessory", "smallrig cage"),
  e("Rode", "VideoMic Pro+", "Accessory", "videomic"),
  e("SanDisk", "Extreme Pro SD Card", "Accessory", "extreme pro"),
  e("Hoya", "Pro1 UV Filter", "Accessory", "pro1"),
  e("B+W", "XS-Pro ND Filter", "Accessory", "xs-pro"),
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ");

/**
 * Cross-references raw OCR output with the static catalogue.
 * Returns the entry with the longest matching keyword, or null.
 */
export function matchCatalog(rawText: string): CatalogEntry | null {
  const text = normalize(rawText);
  if (text.trim().length < 2) return null;

  let best: { entry: CatalogEntry; score: number } | null = null;
  for (const entry of GEAR_CATALOG) {
    for (const key of entry.keys) {
      const k = normalize(key).trim();
      if (k.length < 2) continue;
      
      const regex = new RegExp(`\\b${k}\\b`);
      if (!regex.test(text)) continue;
      
      const brandRegex = new RegExp(`\\b${normalize(entry.brand).trim()}\\b`);
      const brandBonus = brandRegex.test(text) ? 4 : 0;
      const score = k.length + brandBonus;
      if (!best || score > best.score) best = { entry, score };
    }
  }
  return best?.entry ?? null;
}
