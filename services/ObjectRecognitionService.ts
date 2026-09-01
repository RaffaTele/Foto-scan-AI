import { scanBarcodeFromImage } from "./barcodeScanner";
import { detectObjects } from "./objectDetection";

export class ObjectRecognitionService {
  async analyze(base64Image: string) {
    const barcodes = await scanBarcodeFromImage(base64Image);
    const objects = await detectObjects(base64Image);

    return { barcodes, objects };
  }
}
