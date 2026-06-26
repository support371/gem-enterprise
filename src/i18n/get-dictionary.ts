import "server-only";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, () => Promise<Partial<Dictionary>>> = {
  en: () => import("@/i18n/dictionaries/en.json").then((module) => module.default as Dictionary),
  es: () => import("@/i18n/dictionaries/es.json").then((module) => module.default as Dictionary),
  fr: () => import("@/i18n/dictionaries/fr.json").then((module) => module.default as Partial<Dictionary>),
  de: () => import("@/i18n/dictionaries/de.json").then((module) => module.default as Partial<Dictionary>),
  ar: () => import("@/i18n/dictionaries/ar.json").then((module) => module.default as Partial<Dictionary>),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const source = (await dictionaries.en()) as Dictionary;
  if (locale === "en") return source;

  const target = await dictionaries[locale]();

  return {
    meta: { ...source.meta, ...target.meta, locale },
    common: { ...source.common, ...target.common },
    navigation: {
      labels: {
        ...source.navigation.labels,
        ...(target.navigation?.labels ?? {}),
      },
    },
    footer: { ...source.footer, ...target.footer },
  };
}
