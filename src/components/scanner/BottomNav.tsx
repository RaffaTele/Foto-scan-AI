import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n/i18n";

const ITEMS = [
  { to: "/", key: "nav.home", icon: "⌂" },
  { to: "/scan", key: "nav.scan", icon: "◉" },
  { to: "/gear", key: "nav.gear", icon: "▤" },
  { to: "/settings", key: "nav.settings", icon: "⚙" },
] as const;

export function BottomNav() {
  const { t } = useI18n();

  return (
    <nav className="mt-4 flex items-center justify-around border-t border-foreground/10 px-5 py-3">
      {ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: true }}
          activeProps={{ className: "text-primary" }}
          inactiveProps={{ className: "text-foreground/50 hover:text-foreground/70" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  );
}
