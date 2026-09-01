/**
 * Minimal i18n context — language preference persisted in LocalStorage.
 * Ready to be extended with more strings without touching the components.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "it", label: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "lenslock.language";

type Dict = Record<string, string>;

const en: Dict = {
  "home.tagline": "Photography gear scanner",
  "home.subtitle": "Identify cameras, lenses and accessories offline — then keep them in your own private inventory.",
  "home.scan": "Scan Gear",
  "home.scanHint": "Barcode or multi-angle photo",
  "home.gear": "My Gear",
  "home.gearHint": "Your saved inventory",
  "home.settings": "Settings",
  "nav.home": "Home",
  "nav.scan": "Scan",
  "nav.gear": "Gear",
  "nav.settings": "Settings",
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.languageHint": "Saved on this device.",
  "settings.saved": "Language preference saved",
  "gear.title": "My gear",
  "gear.empty": "Nothing saved yet. Scan an item to build your kit.",
};

const it: Dict = {
  "home.tagline": "Scanner attrezzatura fotografica",
  "home.subtitle": "Identifica fotocamere, obiettivi e accessori offline — e conservali nel tuo inventario privato.",
  "home.scan": "Scansiona",
  "home.scanHint": "Codice a barre o foto multi-angolo",
  "home.gear": "La mia attrezzatura",
  "home.gearHint": "Il tuo inventario salvato",
  "home.settings": "Impostazioni",
  "nav.home": "Home",
  "nav.scan": "Scansiona",
  "nav.gear": "Kit",
  "nav.settings": "Opzioni",
  "settings.title": "Impostazioni",
  "settings.language": "Lingua",
  "settings.languageHint": "Salvata su questo dispositivo.",
  "settings.saved": "Preferenza lingua salvata",
  "gear.title": "La mia attrezzatura",
  "gear.empty": "Ancora nulla. Scansiona un oggetto per iniziare.",
};

const de: Dict = {
  "home.tagline": "Fotoausrüstungs-Scanner",
  "home.subtitle": "Kameras, Objektive und Zubehör offline erkennen — und im eigenen Inventar behalten.",
  "home.scan": "Ausrüstung scannen",
  "home.scanHint": "Barcode oder Multi-Winkel-Foto",
  "home.gear": "Meine Ausrüstung",
  "home.gearHint": "Dein gespeichertes Inventar",
  "home.settings": "Einstellungen",
  "nav.home": "Start",
  "nav.scan": "Scan",
  "nav.gear": "Kit",
  "nav.settings": "Optionen",
  "settings.title": "Einstellungen",
  "settings.language": "Sprache",
  "settings.languageHint": "Auf diesem Gerät gespeichert.",
  "settings.saved": "Spracheinstellung gespeichert",
  "gear.title": "Meine Ausrüstung",
  "gear.empty": "Noch nichts gespeichert. Scanne ein Objekt.",
};

const fr: Dict = {
  "home.tagline": "Scanner de matériel photo",
  "home.subtitle": "Identifiez appareils, objectifs et accessoires hors ligne — et gardez-les dans votre inventaire privé.",
  "home.scan": "Scanner",
  "home.scanHint": "Code-barres ou photo multi-angles",
  "home.gear": "Mon matériel",
  "home.gearHint": "Votre inventaire enregistré",
  "home.settings": "Paramètres",
  "nav.home": "Accueil",
  "nav.scan": "Scan",
  "nav.gear": "Kit",
  "nav.settings": "Options",
  "settings.title": "Paramètres",
  "settings.language": "Langue",
  "settings.languageHint": "Enregistrée sur cet appareil.",
  "settings.saved": "Préférence de langue enregistrée",
  "gear.title": "Mon matériel",
  "gear.empty": "Rien pour l'instant. Scannez un objet.",
};

const es: Dict = {
  "home.tagline": "Escáner de equipo fotográfico",
  "home.subtitle": "Identifica cámaras, objetivos y accesorios sin conexión — y guárdalos en tu inventario privado.",
  "home.scan": "Escanear equipo",
  "home.scanHint": "Código de barras o foto multiángulo",
  "home.gear": "Mi equipo",
  "home.gearHint": "Tu inventario guardado",
  "home.settings": "Ajustes",
  "nav.home": "Inicio",
  "nav.scan": "Escanear",
  "nav.gear": "Kit",
  "nav.settings": "Ajustes",
  "settings.title": "Ajustes",
  "settings.language": "Idioma",
  "settings.languageHint": "Guardado en este dispositivo.",
  "settings.saved": "Preferencia de idioma guardada",
  "gear.title": "Mi equipo",
  "gear.empty": "Nada guardado todavía. Escanea un objeto.",
};

const DICTS: Record<LanguageCode, Dict> = { en, it, de, fr, es };

interface I18nValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLanguage(value: string | null): value is LanguageCode {
  return !!value && LANGUAGES.some((l) => l.code === value);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Read after hydration to avoid SSR mismatches.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) setLanguageState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string) => DICTS[language][key] ?? en[key] ?? key,
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) return { language: "en", setLanguage: () => undefined, t: (key) => en[key] ?? key };
  return ctx;
}
