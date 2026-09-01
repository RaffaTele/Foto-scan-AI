/**
 * Scanning layer — multi-angle object capture session.
 * Pure capture: it holds frames in memory. Recognition is done by the
 * real AI pipeline in `@/lib/kit/analysis`.
 */

import { CameraService } from "./camera-service";
import { MAX_OBJECT_FRAMES, MIN_OBJECT_FRAMES, createId, type CapturedFrame } from "./types";

export class ObjectScannerService {
  private frames: CapturedFrame[] = [];

  getFrames(): CapturedFrame[] {
    return [...this.frames];
  }

  get frameCount(): number {
    return this.frames.length;
  }

  get canRecognize(): boolean {
    return this.frames.length >= MIN_OBJECT_FRAMES;
  }

  get isFull(): boolean {
    return this.frames.length >= MAX_OBJECT_FRAMES;
  }

  /** Captures the current video frame as one additional angle. */
  captureAngle(video: HTMLVideoElement): CapturedFrame {
    if (this.isFull) this.frames.shift();
    const frame: CapturedFrame = {
      id: createId(),
      imageData: CameraService.grabDataUrl(video),
      angleIndex: this.frames.length,
      timestamp: Date.now(),
    };
    this.frames = [...this.frames, frame].map((f, index) => ({ ...f, angleIndex: index }));
    return frame;
  }

  reset(): void {
    this.frames = [];
  }
}

export const objectScannerService = new ObjectScannerService();
