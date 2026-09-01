import type { CapturedFrame, ScanMode } from "@/lib/scanner/types";

interface ScanControlsProps {
  mode: ScanMode;
  cameraOn: boolean;
  busy: boolean;
  frames: CapturedFrame[];
  minFrames: number;
  maxFrames: number;
  canRecognize: boolean;
  onScanBarcode: () => void;
  onCaptureAngle: () => void;
  onRecognize: () => void;
  onReset: () => void;
}

/** UI layer — mode-specific capture actions + multi-angle indicator. */
export function ScanControls({
  mode,
  cameraOn,
  busy,
  frames,
  minFrames,
  maxFrames,
  canRecognize,
  onScanBarcode,
  onCaptureAngle,
  onRecognize,
  onReset,
}: ScanControlsProps) {
  const disabled = !cameraOn || busy;

  if (mode === "barcode") {
    return (
      <button
        type="button"
        onClick={onScanBarcode}
        disabled={disabled}
        className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Decoding…" : "Scan barcode"}
      </button>
    );
  }

  return (
    <div className="mt-3">
      {/* angle indicator */}
      <div className="mb-3 flex items-center gap-1.5">
        {Array.from({ length: maxFrames }).map((_, i) => {
          const frame = frames[i];
          return (
            <div
              key={frame?.id ?? `slot-${i}`}
              className={`h-11 flex-1 overflow-hidden rounded-lg ring-1 ${
                frame ? "ring-primary/60" : "ring-foreground/10"
              } bg-secondary`}
            >
              {frame ? (
                <img src={frame.imageData} alt={`Angle ${i + 1}`} className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCaptureAngle}
          disabled={disabled}
          className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold uppercase tracking-wide text-foreground ring-1 ring-foreground/10 transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {frames.length === 0 ? "Capture view" : "Add angle"}
        </button>
        <button
          type="button"
          onClick={onRecognize}
          disabled={!canRecognize || busy}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Analyzing…" : "Recognize"}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>
          {frames.length === 0
            ? `Capture ${minFrames}–${maxFrames} angles`
            : `Angle ${frames.length} captured · ${frames.length}/${maxFrames} · min ${minFrames}`}
        </span>
        {frames.length > 0 && (
          <button type="button" onClick={onReset} className="text-primary hover:underline">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
