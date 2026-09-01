import type { ScanResult } from "@/lib/scanner/types";

interface ResultCardProps {
  result: ScanResult | null;
  busy: boolean;
  error: string | null;
  onSaveToKit: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  camera: "Camera",
  lens: "Lens",
  flash: "Flash",
  accessory: "Accessory",
  unknown: "Unknown",
};

/** UI layer — always reflects the latest scan (or the latest error). */
export function ResultCard({ result, busy, error, onSaveToKit }: ResultCardProps) {
  if (busy) {
    return (
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          Scanning…
        </span>
        <p className="mt-4 font-display text-xl uppercase leading-none tracking-tight text-foreground/50">
          Analyzing frames
        </p>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">Matching against the gear index</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-card p-5 ring-1 ring-destructive/30">
        <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-destructive">
          Scan failed
        </span>
        <p className="mt-4 font-display text-xl uppercase leading-none tracking-tight text-foreground/80">{error}</p>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          Adjust framing and light, then try again.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground ring-1 ring-foreground/10">
          No result
        </span>
        <p className="mt-4 font-display text-xl uppercase leading-none tracking-tight text-foreground/50">
          Nothing scanned yet
        </p>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          Frame an item or a barcode and start the scan.
        </p>
      </div>
    );
  }

  const isBarcode = result.mode === "barcode";
  const item = result.item;
  const sourceLabel = isBarcode ? "Barcode" : "Visual scan";

  // Unified structured display for both scan sources.
  const details = [
    { label: "Item", value: item?.itemName ?? result.itemName },
    { label: "Brand", value: item?.brand || result.brand || "—" },
    { label: "Category", value: CATEGORY_LABEL[item?.category ?? result.category] ?? "Unknown" },
    { label: "Model", value: item?.model || "—" },
    { label: "Confidence", value: result.confidence.toFixed(2) },
    { label: "Source", value: sourceLabel },
  ];
  if (isBarcode) {
    details.push({ label: "Code", value: `${result.codeFormat ?? "Barcode"} · ${result.rawValue ?? "—"}` });
  }

  return (
    <div
      key={result.id}
      className="anim-slide-up relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
    >
      <div className="pointer-events-none absolute -right-10 -top-16 size-40 rotate-12 bg-primary/10" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {isBarcode ? "Decoded" : "Recognized"}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Match {Math.round(result.confidence * 100)}%
          </span>
        </div>

        <p
          className="mt-4 break-words font-display text-3xl uppercase leading-none tracking-tight text-foreground"
          style={{ textWrap: "balance" }}
        >
          {item?.itemName ?? result.itemName}
        </p>

        {result.itemNotFound && (
          <p className="mt-2 text-sm font-medium text-destructive">
            Barcode recognized but item not found. You can assign it manually later.
          </p>
        )}

        {item?.description && (
          <p className="mt-1.5 text-sm font-medium text-foreground/70" style={{ textWrap: "pretty" }}>
            {item.description}
          </p>
        )}

        {item?.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            loading="lazy"
            className="mt-4 h-32 w-full rounded-xl object-contain ring-1 ring-foreground/10"
          />
        )}

        {result.specs && result.specs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {result.specs.map((spec) => (
              <span
                key={spec}
                className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground/70 ring-1 ring-foreground/10"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-foreground/10">
          {details.map((d) => (
            <div key={d.label} className="bg-card px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{d.label}</p>
              <p className="mt-0.5 break-all font-display text-base leading-tight text-foreground">{d.value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSaveToKit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 pl-2 pr-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <span className="shrink-0 text-base leading-none">+</span>
          Save to kit
        </button>
      </div>
    </div>
  );
}
