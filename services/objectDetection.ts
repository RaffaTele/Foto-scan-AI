/**
 * Offline object detection with a local TFJS COCO-SSD MobileNet V2 model
 * served from public/models/object_detection/. No API keys, no cloud calls.
 */

import * as tf from "@tensorflow/tfjs";
import { loadGraphModel, type GraphModel } from "@tensorflow/tfjs-converter";

let model: GraphModel | null = null;
let loading: Promise<GraphModel> | null = null;

export async function loadModel(): Promise<GraphModel> {
  if (model) return model;
  if (!loading) {
    loading = loadGraphModel("/models/object_detection/model.json").then((m) => {
      model = m;
      return m;
    });
  }
  return loading;
}

export interface DetectedObject {
  classId: number;
  score: number;
  /** [y1, x1, y2, x2] normalized */
  box: number[];
}

export async function detectObjects(base64Image: string): Promise<DetectedObject[]> {
  const net = await loadModel();

  const img = new Image();
  img.src = base64Image;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const tensor = tf.tidy(() => tf.browser.fromPixels(img).expandDims(0).toInt());

  let outputs: tf.Tensor[] = [];
  try {
    const result = await net.executeAsync(tensor);
    outputs = Array.isArray(result) ? result : [result];

    // COCO-SSD graph outputs: boxes [1,N,4] and scores [1,N,numClasses].
    const boxesTensor = outputs.find((t) => t.shape.length === 3 && t.shape[2] === 4);
    const scoresTensor = outputs.find((t) => t.shape.length === 3 && t.shape[2] !== 4);
    if (!boxesTensor || !scoresTensor) return [];

    const boxes = (await boxesTensor.array()) as number[][][];
    const scores = (await scoresTensor.array()) as number[][][];

    const detections: DetectedObject[] = [];
    scores[0]!.forEach((classScores, i) => {
      let bestId = 0;
      let best = 0;
      classScores.forEach((s, id) => {
        if (s > best) {
          best = s;
          bestId = id;
        }
      });
      if (best > 0.3) detections.push({ classId: bestId, score: best, box: boxes[0]![i]! });
    });

    return detections.sort((a, b) => b.score - a.score).slice(0, 10);
  } finally {
    tensor.dispose();
    outputs.forEach((t) => t.dispose());
  }
}
