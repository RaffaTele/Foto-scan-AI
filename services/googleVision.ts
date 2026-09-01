import { GOOGLE_VISION_API_KEY } from "../config/api_keys";

export async function analyzeImage(base64Image: string) {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [
          { type: "LABEL_DETECTION", maxResults: 10 },
          { type: "OBJECT_LOCALIZATION" }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return {
    labels: data.responses?.[0]?.labelAnnotations || [],
    objects: data.responses?.[0]?.localizedObjectAnnotations || []
  };
}
