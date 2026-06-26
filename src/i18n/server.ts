import "server-only";

import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, isLocale, matchAcceptLanguage, type Locale } from "@/i18n/config";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  if (isLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  return matchAcceptLanguage(headerStore.get("accept-language"));
}
