import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { BottomNav } from "@/components/scanner/BottomNav";
import { LANGUAGES, useI18n, type LanguageCode } from "@/lib/i18n/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LensLock Language Preferences" },
      {
        name: "description",
        content:
          "Choose your preferred language for LensLock: English, Italian, German, French or Spanish. Saved on your device.",
      },
      { property: "og:title", content: "Settings — LensLock Language Preferences" },
      {
        property: "og:description",
        content: "Pick the interface language for your offline photography gear scanner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { language, setLanguage, t } = useI18n();
  const [theme, setTheme] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("lenslock-theme", next);
    setTheme(next);
  };

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    toast.success(t("settings.saved"));
  };

  return (
    <div className="min-h-dvh bg-background font-body text-foreground antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <header className="px-5 pt-6">
          <h1 className="font-display text-2xl uppercase tracking-wide">{t("settings.title")}</h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("settings.languageHint")}
          </p>
        </header>

        <main className="mt-6 flex-1 px-5">
          <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("settings.language")}
            </h2>
            <div className="mt-3 space-y-2">
              {LANGUAGES.map((item) => {
                const active = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => choose(item.code)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ring-1 transition-colors ${
                      active
                        ? "bg-primary/10 text-foreground ring-primary/60"
                        : "bg-secondary text-foreground/80 ring-foreground/10 hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg leading-none">{item.flag}</span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{item.native}</span>
                      <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </span>
                    </span>
                    {active && <span className="text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("settings.theme") ?? "Theme"}
            </h2>
            <div className="mt-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-4 text-sm font-semibold ring-1 ring-foreground/10 transition-colors hover:text-foreground"
              >
                <span>{theme === "dark" ? "Switch to Light Mode ☀️" : "Switch to Dark Mode 🌙"}</span>
              </button>
            </div>
          </section>

          <p className="mt-4 text-xs text-muted-foreground">
            LensLock runs fully on-device: recognition, OCR and your inventory never leave this
            browser.
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
