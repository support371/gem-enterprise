import type { Locale, TextDirection } from "@/i18n/config";

export type TranslationLookup = Record<string, string>;

export interface Dictionary {
  meta: {
    locale: Locale;
    name: string;
    nativeName: string;
    direction: TextDirection;
  };
  common: {
    language: string;
    selectLanguage: string;
    primaryNavigation: string;
    mobileNavigation: string;
    openNavigationMenu: string;
    closeNavigationMenu: string;
    all: string;
    qualifiedAccessNotice: string;
  };
  navigation: {
    labels: TranslationLookup;
  };
  footer: {
    tagline: string;
    qualifiedClientsOnly: string;
    qualifiedClientsDescription: string;
    platform: string;
    company: string;
    legal: string;
    clientAccess: string;
  };
}
