import "server-only";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/dictionaries/en.json").then((module) => module.default as Dictionary),
  es: () => import("@/i18n/dictionaries/es.json").then((module) => module.default as Dictionary),
  fr: () => import("@/i18n/dictionaries/fr.json").then((module) => module.default as Dictionary),
  de: () => import("@/i18n/dictionaries/de.json").then((module) => module.default as Dictionary),
  ar: () => import("@/i18n/dictionaries/ar.json").then((module) => module.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
