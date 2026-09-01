import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { BottomNav } from "@/components/scanner/BottomNav";
import { useI18n } from "@/lib/i18n/i18n";
import { deleteItem, getAllItems, type KitItem } from "@/lib/kit/kit-db";

export const Route = createFileRoute("/gear")({
  head: () => ({
    meta: [
      { title: "My Gear — LensLock Photography Inventory" },
      {
        name: "description",
        content:
          "Browse every camera, lens, flash and accessory you scanned. Stored privately on your own device.",
      },
      { property: "og:title", content: "My Gear — LensLock Photography Inventory" },
      {
        property: "og:description",
        content: "Your locally stored photography gear inventory, scanned and confirmed offline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GearPage,
});

function GearPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setItems(await getAllItems());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = async (id?: number) => {
    if (id === undefined) return;
    try {
      await deleteItem(id);
      toast.success("Item removed");
      await refresh();
    } catch {
      toast.error("Could not remove the item");
    }
  };

  return (
    <div className="min-h-dvh bg-background font-body text-foreground antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <header className="px-5 pt-6">
          <h1 className="font-display text-2xl uppercase tracking-wide">{t("gear.title")}</h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} · stored on this device
          </p>
        </header>

        <main className="mt-5 flex-1 space-y-3 px-5">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {!loading && items.length === 0 && (
            <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-foreground/10">
              <p className="text-sm text-muted-foreground">{t("gear.empty")}</p>
            </div>
          )}

          {items.map((item) => (
            <article
              key={item.id}
              className="flex gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/10"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={`${item.brand} ${item.model}`.trim() || item.category}
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  ◎
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {[item.brand, item.model].filter(Boolean).join(" ") || "Unnamed item"}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                  {item.category}
                </p>
                {item.notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.notes}</p>
                )}
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {new Date(item.dateAdded).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(item.id)}
                aria-label="Delete item"
                className="self-start rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
              >
                ✕
              </button>
            </article>
          ))}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
