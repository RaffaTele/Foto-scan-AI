/** Static photography vocabulary used to filter raw OCR text. 100% offline. */

export const BRANDS = [
  "Canon",
  "Nikon",
  "Sony",
  "Fujifilm",
  "Fuji",
  "Olympus",
  "OM System",
  "Panasonic",
  "Lumix",
  "Pentax",
  "Ricoh",
  "Leica",
  "Hasselblad",
  "Yashica",
  "Minolta",
  "Kodak",
  "Polaroid",
  "GoPro",
  "DJI",
  "Godox",
  "Profoto",
  "Elinchrom",
  "Sigma",
  "Tamron",
  "Tokina",
  "Zeiss",
  "Voigtlander",
  "Voigtländer",
  "Samyang",
  "Rokinon",
  "Laowa",
  "Venus Optics",
  "Irix",
  "Viltrox",
  "TTArtisan",
  "7artisans",
  "Meike",
  "Yongnuo",
  "Neewer",
  "SmallRig",
  "Peak Design",
  "Manfrotto",
  "Gitzo",
  "Sirui",
  "Benro",
  "Think Tank",
  "Lowepro",
] as const;

export const MODEL_TOKENS = [
  "EOS",
  "Rebel",
  "PowerShot",
  "IXUS",
  "Cyber-shot",
  "Alpha",
  "A7",
  "A9",
  "A1",
  "ZV",
  "FX",
  "D850",
  "D750",
  "D500",
  "Z6",
  "Z7",
  "Z8",
  "Z9",
  "GFX",
  "X-T",
  "X-Pro",
  "X-E",
  "X100",
  "OM-D",
  "PEN",
  "M6",
  "M50",
  "M200",
  "RP",
  "R5",
  "R6",
  "R3",
  "R1",
  "5D",
  "6D",
  "1D",
  "7D",
  "80D",
  "90D",
  "200D",
  "850D",
  "2000D",
  "4000D",
  "Mark",
  "STM",
  "USM",
  "GM",
  "OSS",
  "WR",
  "OIS",
  "VC",
  "DG",
  "DC",
  "DN",
  "Art",
  "Contemporary",
  "Sport",
  "Macro",
  "Fisheye",
  "Tilt-Shift",
  "TS-E",
  "PC-E",
  "AF-S",
  "AF-P",
  "SWM",
  "HSM",
  "USD",
  "RF-S",
  "EF-S",
  "EF-M",
  "RF",
  "EF",
  "FE",
  "XF",
  "GF",
  "MFT",
  "L-Mount",
  "Four Thirds",
  "DX",
  "CX",
] as const;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Finds a known brand inside a list of OCR tokens. */
export function matchBrand(tokens: string[]): string | null {
  for (const token of tokens) {
    const t = norm(token);
    if (t.length < 2) continue;
    const hit = BRANDS.find((b) => norm(b) === t || (t.length > 3 && norm(b).includes(t)));
    if (hit) return hit;
  }
  return null;
}

/** Finds a plausible model string (known token, or alphanumeric code like "24-70mm"). */
export function matchModel(tokens: string[], brand: string | null): string | null {
  const known = tokens.find((token) =>
    MODEL_TOKENS.some((m) => norm(m) === norm(token) || norm(token).startsWith(norm(m))),
  );
  if (known) {
    const index = tokens.indexOf(known);
    return tokens
      .slice(index, index + 3)
      .join(" ")
      .trim();
  }
  const code = tokens.find(
    (token) =>
      token.length >= 2 &&
      token.length <= 14 &&
      /\d/.test(token) &&
      /[a-z]/i.test(token) &&
      (!brand || norm(token) !== norm(brand)),
  );
  return code ?? null;
}
