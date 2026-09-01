import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
}

/** UI layer — live camera preview with a shutter, plus gallery-upload fallback. */
export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;
        await video.play().catch(() => undefined);
      }
      setLive(true);
    } catch {
      stop();
      setError("Camera unavailable — upload a photo from your gallery instead.");
    }
  }, [stop]);

  const shoot = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stop();
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  }, [onCapture, stop]);

  const pickFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        stop();
        onCapture(String(reader.result));
      };
      reader.readAsDataURL(file);
    },
    [onCapture, stop],
  );

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-foreground/10">
        <video ref={videoRef} className={`size-full object-cover ${live ? "" : "hidden"}`} />
        {!live && (
          <div className="grid size-full place-items-center px-6 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15 text-2xl text-primary">
                ◉
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Point your camera at the item — everything is analyzed on your device.
              </p>
            </div>
          </div>
        )}
        {live && (
          <div className="pointer-events-none absolute inset-6 rounded-xl border border-primary/50" />
        )}
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <div className="mt-4 flex gap-2">
        {!live ? (
          <button
            type="button"
            onClick={() => void start()}
            className="flex-1 rounded-xl bg-primary py-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Take photo
          </button>
        ) : (
          <button
            type="button"
            onClick={shoot}
            className="flex-1 rounded-xl bg-primary py-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Shutter
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-secondary px-4 py-4 text-sm font-semibold uppercase tracking-wide text-foreground ring-1 ring-foreground/10"
        >
          Gallery
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />
    </div>
  );
}
