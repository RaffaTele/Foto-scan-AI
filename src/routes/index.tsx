import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BottomNav } from "@/components/scanner/BottomNav";
import { useI18n } from "@/lib/i18n/i18n";
import { getAllItems } from "@/lib/kit/kit-db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LensLock — Offline Photography Gear Scanner" },
      {
        name: "description",
        content:
          "Scan barcodes or photograph cameras, lenses and flashes to identify gear offline, then keep everything in a private on-device inventory.",
      },
      { property: "og:title", content: "LensLock — Offline Photography Gear Scanner" },
      {
        property: "og:description",
        content:
          "Identify photography gear with on-device AI and build your private kit inventory — no account, no cloud.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function Aperture({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M50 12 L82 42 L50 50 Z"
          fill="currentColor"
          opacity="0.22"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HomePage() {
  const { t } = useI18n();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    void getAllItems()
      .then((items) => setCount(items.length))
      .catch(() => setCount(null));
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background font-body text-foreground antialiased">
      <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <header className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-lg leading-none">L</span>
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-lg uppercase leading-none tracking-wide">LensLock</h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t("home.tagline")}
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            aria-label={t("home.settings")}
            className="grid size-9 place-items-center rounded-lg text-foreground/70 ring-1 ring-foreground/15 transition-colors hover:text-primary"
          >
            <span className="text-base leading-none">⚙</span>
          </Link>
        </header>

        <main className="flex flex-1 flex-col px-5">
          <section className="mt-8 flex flex-col items-center text-center">
            <Aperture className="size-40 text-primary" />
            <h2 className="mt-6 font-display text-3xl uppercase leading-none tracking-wide">
              Know every piece
              <br />
              of your kit
            </h2>
            <p className="mt-3 max-w-[300px] text-sm text-muted-foreground">{t("home.subtitle")}</p>
          </section>

          <section className="mt-9 space-y-3">
            <Link
              to="/scan"
              className="flex items-center gap-4 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15 text-xl">
                ◉
              </span>
              <span className="flex-1 text-left">
                <span className="block font-display text-lg uppercase leading-none tracking-wide">
                  {t("home.scan")}
                </span>
                <span className="mt-1 block text-[11px] uppercase tracking-wide opacity-80">
                  {t("home.scanHint")}
                </span>
              </span>
              <span className="text-lg">→</span>
            </Link>

            <Link
              to="/gear"
              className="flex items-center gap-4 rounded-2xl bg-card/70 px-5 py-4 ring-1 ring-foreground/10 backdrop-blur transition-transform active:scale-[0.98]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-xl text-primary">
                ▤
              </span>
              <span className="flex-1 text-left">
                <span className="block font-display text-lg uppercase leading-none tracking-wide">
                  {t("home.gear")}
                </span>
                <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
                  {count === null ? t("home.gearHint") : `${count} item${count === 1 ? "" : "s"}`}
                </span>
              </span>
              <span className="text-lg text-muted-foreground">→</span>
            </Link>
          </section>

          <p className="mt-auto pb-2 pt-8 text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            On-device · no accounts · no cloud
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
