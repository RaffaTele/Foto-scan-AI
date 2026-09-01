import type { RefObject } from "react";

import type { ScanMode } from "@/lib/scanner/types";
import viewfinderImg from "@/assets/viewfinder.jpg";

interface ScannerViewportProps {
  mode: ScanMode;
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraOn: boolean;
  busy: boolean;
  frameCount: number;
  maxFrames: number;
  onStartCamera: () => void;
}

/** UI layer — live camera preview with mode-specific framing HUD. */
export function ScannerViewport({
  mode,
  videoRef,
  cameraOn,
  busy,
  frameCount,
  maxFrames,
  onStartCamera,
}: ScannerViewportProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-black/5">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`aspect-[4/5] w-full bg-black object-cover ${cameraOn ? "" : "invisible absolute"}`}
      />

      {!cameraOn && (
        <img
          src={viewfinderImg}
          alt="Viewfinder preview of photography gear"
          width={1080}
          height={1350}
          className="aspect-[4/5] w-full object-cover opacity-60"
        />
      )}

      {/* decorative layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(241,239,230,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(241,239,230,0.08)_1px,transparent_1px)] [background-size:22%_22%]" />

      {/* corner brackets */}
      <span className="pointer-events-none absolute left-4 top-4 size-6 border-l-2 border-t-2 border-primary" />
      <span className="pointer-events-none absolute right-4 top-4 size-6 border-r-2 border-t-2 border-primary" />
      <span className="pointer-events-none absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-primary" />
      <span className="pointer-events-none absolute bottom-4 right-4 size-6 border-b-2 border-r-2 border-primary" />

      {/* top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
        <span>{mode === "barcode" ? "● EAN · UPC · QR" : `● Angles ${frameCount}/${maxFrames}`}</span>
        <span>{busy ? "Working" : cameraOn ? "Live" : "Camera off"}</span>
      </div>

      {/* scan line while processing */}
      {busy && (
        <span className="anim-scan pointer-events-none absolute inset-x-6 h-px bg-primary/80 shadow-[0_0_12px_2px_rgba(230,162,0,0.5)]" />
      )}

      {/* framing guide */}
      {mode === "object" ? (
        <div
          key={`lock-${busy}`}
          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${busy ? "anim-lock" : ""}`}
        >
          <div className="relative grid size-28 place-items-center">
            <span className="absolute left-0 top-0 size-5 border-l-2 border-t-2 border-primary" />
            <span className="absolute right-0 top-0 size-5 border-r-2 border-t-2 border-primary" />
            <span className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-primary" />
            <span className="absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-primary" />
            <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-24 w-44">
            <span className="absolute left-0 top-0 size-5 border-l-2 border-t-2 border-primary" />
            <span className="absolute right-0 top-0 size-5 border-r-2 border-t-2 border-primary" />
            <span className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-primary" />
            <span className="absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-primary" />
            <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-primary/70" />
          </div>
        </div>
      )}

      {/* bottom HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em]">
        <span className="text-primary">{mode === "barcode" ? "Barcode mode" : "Multi-angle mode"}</span>
        <span className="text-foreground/60">f/2.8 · 1/125</span>
      </div>

      {/* camera enable overlay */}
      {!cameraOn && (
        <div className="absolute inset-0 grid place-items-center bg-background/55 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={onStartCamera}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-95"
          >
            Enable camera
          </button>
        </div>
      )}
    </div>
  );
}
