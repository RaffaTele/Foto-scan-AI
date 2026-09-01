import type { ScanMode } from "@/lib/scanner/types";

interface ScanModeToggleProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
  disabled?: boolean;
}

const MODES: { id: ScanMode; label: string }[] = [
  { id: "barcode", label: "Barcode" },
  { id: "object", label: "Visual scan" },
];

export function ScanModeToggle({ mode, onChange, disabled }: ScanModeToggleProps) {
  return (
    <div className="mb-3 flex gap-1 rounded-xl bg-card p-1 ring-1 ring-foreground/10">
      {MODES.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={
              active
                ? "flex-1 rounded-lg bg-primary py-2 text-[13px] font-semibold uppercase tracking-wide text-primary-foreground transition-colors"
                : "flex-1 rounded-lg py-2 text-[13px] font-medium uppercase tracking-wide text-foreground/55 transition-colors hover:text-foreground/80 disabled:opacity-50"
            }
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
