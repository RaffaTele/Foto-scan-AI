import { createFileRoute, Link } from "@tanstack/react-router";

import { ScannerViewport } from "@/components/scanner/ScannerViewport";
import { ScanModeToggle } from "@/components/scanner/ScanModeToggle";
import { ScanControls } from "@/components/scanner/ScanControls";
import { ResultCard } from "@/components/scanner/ResultCard";
import { ConfirmItemForm } from "@/components/kit/ConfirmItemForm";
import { BottomNav } from "@/components/scanner/BottomNav";
import { useScanner } from "@/hooks/useScanner";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Gear — LensLock Barcode & Photo Scanner" },
      {
        name: "description",
        content:
          "Scan a barcode or capture multiple angles of a camera, lens or flash. Offline AI plus a free product lookup fills the details for you.",
      },
      { property: "og:title", content: "Scan Gear — LensLock Barcode & Photo Scanner" },
      {
        property: "og:description",
        content:
          "Barcode decoding with public product lookup, plus on-device MobileNet and OCR recognition for photography gear.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const scanner = useScanner();

  return (
    <div className="min-h-dvh bg-background font-body text-foreground antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <header className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              aria-label="Back to home"
              className="grid size-9 place-items-center rounded-lg text-foreground/80 ring-1 ring-foreground/15"
            >
              <span className="text-sm">←</span>
            </Link>
            <div className="leading-tight">
              <h1 className="font-display text-lg uppercase leading-none tracking-wide">Scan gear</h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Barcode · multi-angle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={scanner.cameraOn ? scanner.stopCamera : () => void scanner.startCamera()}
            aria-label={scanner.cameraOn ? "Turn camera off" : "Turn camera on"}
            className="grid size-9 place-items-center rounded-lg text-foreground/80 ring-1 ring-foreground/15"
          >
            <span className="text-sm">{scanner.cameraOn ? "■" : "◷"}</span>
          </button>
        </header>

        <main className="mt-5 px-5">
          <ScanModeToggle mode={scanner.mode} onChange={scanner.setMode} disabled={scanner.busy} />
          <ScannerViewport
            mode={scanner.mode}
            videoRef={scanner.videoRef}
            cameraOn={scanner.cameraOn}
            busy={scanner.busy}
            frameCount={scanner.frameCount}
            maxFrames={scanner.maxFrames}
            onStartCamera={() => void scanner.startCamera()}
          />
          <ScanControls
            mode={scanner.mode}
            cameraOn={scanner.cameraOn}
            busy={scanner.busy}
            frames={scanner.frames}
            minFrames={scanner.minFrames}
            maxFrames={scanner.maxFrames}
            canRecognize={scanner.canRecognize}
            onScanBarcode={() => void scanner.scanBarcode()}
            onCaptureAngle={scanner.captureAngle}
            onRecognize={() => void scanner.recognizeObject()}
            onReset={scanner.resetFrames}
          />
          {scanner.mode === 'visual' && (
             <button
                type="button"
                onClick={scanner.testMagicOCR}
                disabled={scanner.busy}
                className="mt-4 w-full rounded-xl bg-purple-500 py-3 font-display text-white shadow-lg active:scale-95"
             >
                MAGIC TEST OCR (No Fotocamera)
             </button>
          )}
        </main>

        <section className="mt-4 flex-1 space-y-4 px-5">
          <ResultCard
            result={scanner.result}
            busy={scanner.busy}
            error={scanner.error}
            onSaveToKit={() => void scanner.saveToKit()}
          />

          {scanner.draft && (
            <ConfirmItemForm
              key={scanner.draft.barcode ?? scanner.draft.image.slice(-24)}
              image={scanner.draft.image || undefined}
              barcode={scanner.draft.barcode}
              analyzing={scanner.busy}
              status={scanner.status}
              saving={scanner.saving}
              initial={{
                category: scanner.draft.category,
                brand: scanner.draft.brand,
                model: scanner.draft.model,
                notes: scanner.draft.notes,
              }}
              retakeLabel="Discard"
              saveLabel="Save to my database"
              onRetake={scanner.resetFrames}
              onSave={(value) => void scanner.saveDraft(value)}
            />
          )}
        </section>

        <BottomNav />
      </div>
    </div>
  );
}
