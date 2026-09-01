/**
 * Scanning layer — camera handling and frame capture.
 * Browser-only: never import this from a server function or module scope of an SSR route.
 */

import { ScanError, type ScanMode } from "./types";

export interface CameraStartOptions {
  mode: ScanMode;
  video: HTMLVideoElement;
}

export class CameraService {
  private stream: MediaStream | null = null;

  get active(): boolean {
    return this.stream !== null;
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  }

  /** Starts the rear camera and binds it to the given <video> element. */
  async start({ mode, video }: CameraStartOptions): Promise<void> {
    if (!CameraService.isSupported()) {
      throw new ScanError("Camera not available on this device", "camera");
    }
    this.stop();
    try {
      // Barcode mode benefits from a higher resolution to resolve thin bars.
      const ideal = mode === "barcode" ? 1920 : 1280;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal },
          height: { ideal: Math.round((ideal * 3) / 4) },
        },
        audio: false,
      });
    } catch {
      throw new ScanError("Camera access denied or unavailable", "camera");
    }
    video.srcObject = this.stream;
    video.setAttribute("playsinline", "true");
    video.muted = true;
    await video.play().catch(() => undefined);
  }

  stop(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  /** Grabs the current video frame into a canvas. */
  static grabCanvas(video: HTMLVideoElement): HTMLCanvasElement {
    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ScanError("Cannot read the video frame", "camera");
    ctx.drawImage(video, 0, 0, width, height);
    return canvas;
  }

  /** Grabs the current frame as a compressed JPEG data URL. */
  static grabDataUrl(video: HTMLVideoElement, quality = 0.7): string {
    return CameraService.grabCanvas(video).toDataURL("image/jpeg", quality);
  }
}
