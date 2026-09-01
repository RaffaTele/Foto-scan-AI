import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/googleVision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { base64Image } = await request.json();

        const apiKey = process.env["GOOGLE_API_KEY"]!;
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

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

        return Response.json({
          labels: data.responses?.[0]?.labelAnnotations || [],
          objects: data.responses?.[0]?.localizedObjectAnnotations || []
        });
      }
    }
  }
});
