"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { getDirection, LOCALE_OPTIONS, type Locale } from "@/i18n/config";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { locale, dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale || isPending) return;

    setError(null);

    const response = await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });

    if (!response.ok) {
      setError("Language update failed");
      return;
    }

    document.documentElement.lang = nextLocale;
    document.documentElement.dir = getDirection(nextLocale);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <Globe2
        className="pointer-events-none absolute left-2.5 h-4 w-4 text-cyan-300"
        aria-hidden="true"
      />
      <label htmlFor="gem-language" className="sr-only">
        {dictionary.common.selectLanguage}
      </label>
      <select
        id="gem-language"
        value={locale}
        disabled={isPending}
        onChange={(event) => void changeLocale(event.target.value as Locale)}
        aria-label={dictionary.common.selectLanguage}
        title={error ?? dictionary.common.selectLanguage}
        className="h-9 appearance-none rounded-lg border border-white/10 bg-white/5 pl-8 pr-7 text-xs font-semibold text-white/70 outline-none transition-colors hover:border-cyan-400/40 hover:text-white focus:border-cyan-400/60 disabled:cursor-wait disabled:opacity-60"
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code} className="bg-[#131a26] text-white">
            {option.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
