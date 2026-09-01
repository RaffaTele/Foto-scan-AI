export interface WikidataResult {
  brand: string;
  model: string;
  category: "Camera" | "Lens" | "Flash" | "Accessory";
}

export async function searchByEAN(ean: string): Promise<WikidataResult | null> {
  const query = `
    SELECT ?item ?itemLabel ?brandLabel WHERE {
      ?item wdt:P3962 "${ean}" .
      OPTIONAL { ?item wdt:P176 ?brand }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } LIMIT 1
  `;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    const row = data.results.bindings[0];
    if (!row) return null;
    return {
      brand: row.brandLabel?.value ?? "Unknown",
      model: row.itemLabel?.value ?? "Unknown",
      category: "Camera",
    };
  } catch {
    return null;
  }
}

export async function searchByName(name: string): Promise<WikidataResult | null> {
  const query = `
    SELECT ?item ?itemLabel ?brandLabel WHERE {
      ?item rdfs:label "${name}"@en .
      ?item wdt:P31/wdt:P279* wd:Q15328 .
      OPTIONAL { ?item wdt:P176 ?brand }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } LIMIT 1
  `;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    const row = data.results.bindings[0];
    if (!row) return null;
    return {
      brand: row.brandLabel?.value ?? "Unknown",
      model: row.itemLabel?.value ?? "Unknown",
      category: "Camera",
    };
  } catch {
    return null;
  }
}
