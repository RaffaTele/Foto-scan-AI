# LensLock — Photography Item Scanner (Fondamenta)

## Obiettivo
Home page mobile-first dell'app scanner per attrezzatura fotografica, nello stile "Diagonal Kinetic Scanner" (tema scuro, accento oro, font Anton + Space Grotesk). Nessun backend: riconoscimento simulato (mock).

## Struttura UI (mobile, max-width ~420px)

1. **Header** — logo "LensLock", sottotitolo "Gear scanner".
2. **ScannerViewport** (in alto) — visore con:
   - immagine di sfondo generata (lente macro scura)
   - griglia, angoli di messa a fuoco, linea di scansione animata, HUD (REC, f/2.8 · 1/125)
   - pulsante otturatore che avvia la scansione
3. **ScanModeToggle** — controllo segmentato "Visual scan" / "Barcode":
   - Visual scan → visore con focus-lock
   - Barcode → visore con cornice stile codice a barre (EAN/UPC/QR), etichetta "EAN · UPC · QR"
4. **ResultCard** (sotto lo scanner) — campo risultato che mostra:
   - badge "Recognized", % match, nome oggetto, categoria, chip specifiche, dati chiave (es. Mount), pulsante "Save to kit" (placeholder)
   - stato vuoto iniziale: "Inquadra un oggetto o un codice a barre"
5. **BottomNav** — Scan (attivo), Kit, History, Gear (placeholder per feature future).

## Comportamento
- Click sull'otturatore → animazione flash + focus-lock → dopo ~1,2s il mock restituisce un oggetto dalla lista (Canon EF 50mm f/1.8, Nikon Z6 II, Sigma 24-70mm, Fujifilm X-T4, Godox flash, ecc.) e la ResultCard scorre in vista.
- In modalità Barcode il mock restituisce un prodotto da scatola (es. "SanDisk Extreme Pro 128GB — EAN 0619659123456").
- Nessuna persistenza, nessuna chiamata di rete: tutto pronto per essere sostituito dalla logica reale.

## Componenti (nomi chiari, modulari)
```
src/components/scanner/
  ScannerViewport.tsx    → visore + HUD + otturatore
  ScanModeToggle.tsx     → selettore Visual / Barcode
  ResultCard.tsx         → campo risultato riconoscimento
  BottomNav.tsx          → navigazione inferiore
src/lib/recognition.ts   → mockRecognition(mode): Promise<RecognizedItem>
src/lib/recognition-types.ts → tipo RecognizedItem
```
`src/routes/index.tsx` compone la home.

## Dettagli tecnici
- Token colore in `src/styles.css` (oklch): ink #16150f, surface #1e1c16, raised #272419, coin #e6a200, cream #f1efe6, mute #948d75.
- Font Anton + Space Grotesk via `<link>` in `__root.tsx`.
- Animazioni CSS: scanLine, focusLock, slideUp, flash (keyframes in styles.css).
- 1 immagine generata (visore, 1080x1350) in `src/assets/`.
- head() su index: title/description/og dedicati "LensLock — Photography Gear Scanner".
