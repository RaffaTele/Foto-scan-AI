import { useState } from "react";

import { BRANDS } from "@/lib/kit/brands";
import type { KitCategory } from "@/lib/kit/kit-db";

const CATEGORIES: KitCategory[] = ["Camera", "Lens", "Flash", "Accessory", "Other"];

export interface ConfirmDraft {
  category: KitCategory;
  brand: string;
  model: string;
  notes: string;
}

interface ConfirmItemFormProps {
  image?: string | undefined;
  analyzing: boolean;
  status: string;
  initial: ConfirmDraft;
  onRetake: () => void;
  onSave: (draft: ConfirmDraft) => void;
  saving: boolean;
  /** Shown when the item is being learned from an unknown barcode. */
  barcode?: string | undefined;
  saveLabel?: string | undefined;
  retakeLabel?: string | undefined;
}

/** UI layer — manual confirmation of the auto-filled recognition result. */
export function ConfirmItemForm({
  image,
  analyzing,
  status,
  initial,
  onRetake,
  onSave,
  saving,
  barcode,
  saveLabel,
  retakeLabel,
}: ConfirmItemFormProps) {
  const [draft, setDraft] = useState<ConfirmDraft>(initial);
  const [touched, setTouched] = useState(false);
  const value = touched ? draft : initial;

  const update = (patch: Partial<ConfirmDraft>) => {
    setTouched(true);
    setDraft({ ...value, ...patch });
  };

  const field =
    "mt-1 w-full rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground ring-1 ring-foreground/10 outline-none focus:ring-primary/60";
  const label = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      {image ? (
        <img
          src={image}
          alt="Captured photography item"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      ) : null}

      {barcode ? (
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          New barcode · <span className="text-primary">{barcode}</span> — add the details once, it will be
          remembered next time.
        </p>
      ) : null}

      {analyzing && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          {status || "Analyzing image…"}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <label className={label} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={value.category}
            onChange={(e) => update({ category: e.target.value as KitCategory })}
            className={field}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="brand">
            Brand
          </label>
          <input
            id="brand"
            list="kit-brands"
            value={value.brand}
            onChange={(e) => update({ brand: e.target.value })}
            placeholder="Canon, Nikon, Sigma…"
            className={field}
          />
          <datalist id="kit-brands">
            {BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={label} htmlFor="model">
            Model
          </label>
          <input
            id="model"
            value={value.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="EOS R6, 24-70mm f/2.8…"
            className={field}
          />
        </div>

        <div>
          <label className={label} htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={value.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Condition, serial, accessories included…"
            className={field}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-xl bg-secondary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-foreground ring-1 ring-foreground/10"
        >
          {retakeLabel ?? "Retake"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(value)}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving…" : (saveLabel ?? "Confirm & save to kit")}
        </button>
      </div>
    </div>
  );
}
