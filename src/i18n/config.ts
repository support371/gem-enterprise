export const SUPPORTED_LOCALES = ["en", "es", "fr", "de", "ar"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TextDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "gem-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_OPTIONS: ReadonlyArray<{
  code: Locale;
  name: string;
  nativeName: string;
  direction: TextDirection;
}> = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDirection(locale: Locale): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function matchAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) return DEFAULT_LOCALE;

  const requested = headerValue
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of requested) {
    const base = language?.split("-")[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}
