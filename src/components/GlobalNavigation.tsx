"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";

type NavItem = { label: string; path: string };
type NavSection = { label: string; path: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Home",
    path: "/",
    items: [
      { label: "Overview", path: "/" },
      { label: "Platform Highlights", path: "/#highlights" },
      { label: "Get Started", path: "/get-started" },
    ],
  },
  {
    label: "Intel",
    path: "/intel",
    items: [
      { label: "Threat Intelligence", path: "/intel" },
      { label: "Reports", path: "/intel#reports" },
      { label: "Monitoring", path: "/intel#monitoring" },
    ],
  },
  {
    label: "Services",
    path: "/services",
    items: [
      { label: "Cybersecurity", path: "/services#cyber" },
      { label: "Financial", path: "/services#financial" },
      { label: "Real Estate", path: "/services#real-estate" },
      { label: "Alliance Trust Realty", path: "/atr" },
    ],
  },
  {
    label: "Community",
    path: "/community-hub",
    items: [
      { label: "Community Hub", path: "/community-hub" },
      { label: "Events", path: "/community-hub/events" },
      { label: "Request Access", path: "/request-access" },
    ],
  },
  {
    label: "Hub",
    path: "/hub",
    items: [
      { label: "Command Center", path: "/hub" },
      { label: "Documents", path: "/app/documents" },
      { label: "Support Access", path: "/app/support" },
    ],
  },
  {
    label: "Resources",
    path: "/resources",
    items: [
      { label: "Documents", path: "/docs" },
      { label: "Architecture Specs", path: "/developers" },
      { label: "API Explorer", path: "/api-explorer" },
      { label: "Market Insights", path: "/resources#insights" },
      { label: "FAQ", path: "/resources#faq" },
    ],
  },
  {
    label: "Company",
    path: "/company",
    items: [
      { label: "About", path: "/about" },
      { label: "Leadership", path: "/company#leadership" },
      { label: "Contact", path: "/contact" },
    ],
  },
];

function GlobalNavigationContent() {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const translate = useCallback(
    (label: string) => dictionary.navigation.labels[label] ?? label,
    [dictionary.navigation.labels],
  );

  const close = useCallback(() => {
    setMobileOpen(false);
    setOpenSection(null);
  }, []);

  const isActive = useCallback(
    (path: string) => {
      const base = path.split("#")[0];
      return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
    },
    [pathname],
  );

  useEffect(() => close(), [pathname, close]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[10000] w-full border-b border-white/[0.07] bg-[#131a26]/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between px-5 sm:px-6 lg:h-16 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" onClick={close}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/30 lg:h-9 lg:w-9 lg:rounded-xl">
            <Shield className="h-7 w-7 text-cyan-300 lg:h-5 lg:w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-[0.18em] text-cyan-300 lg:text-base">GEM</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/40 lg:text-[10px]">Enterprise</span>
          </div>
        </Link>

        <nav aria-label={dictionary.common.primaryNavigation} className="hidden items-center gap-1 lg:flex">
          {sections.map((section) => (
            <Link
              key={section.path}
              href={section.path}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white",
                isActive(section.path) && "bg-cyan-400/10 text-cyan-300",
              )}
            >
              {translate(section.label)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Link href="/contact" className="rounded-md px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white">
            {translate("Contact")}
          </Link>
          <Button asChild variant="ghost" size="sm" className="border border-white/10 text-white/70 hover:bg-white/5 hover:text-white">
            <Link href="/client-login">{translate("Client Login")}</Link>
          </Button>
          <Button asChild size="sm" className="bg-cyan-300 font-semibold text-[#131a26] hover:bg-cyan-200">
            <Link href="/get-started">{translate("Get Started")}</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? dictionary.common.closeNavigationMenu : dictionary.common.openNavigationMenu}
          aria-expanded={mobileOpen}
          aria-controls="global-mobile-nav"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70 hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="global-mobile-nav" className="fixed inset-x-0 top-20 z-[9999] max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/[0.07] bg-[#0e1420] px-5 pb-28 pt-4 shadow-2xl lg:hidden">
          <nav aria-label={dictionary.common.mobileNavigation} className="space-y-2">
            <LanguageSwitcher className="mb-4 w-full [&_select]:w-full" />
            {sections.map((section) => {
              const isOpen = openSection === section.label;
              const sectionLabel = translate(section.label);
              return (
                <div key={section.path} className="rounded-2xl border border-white/[0.06] bg-white/[0.025]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-lg font-semibold text-white/75"
                    onClick={() => setOpenSection(isOpen ? null : section.label)}
                  >
                    <span>{sectionLabel}</span>
                    <ChevronDown className={cn("h-5 w-5 text-white/30 transition-transform", isOpen && "rotate-180 text-cyan-300")} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/[0.06] px-4 py-4">
                      <Link href={section.path} className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300" onClick={close}>
                        {dictionary.common.all} {sectionLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <div className="grid gap-2">
                        {section.items.map((item) => (
                          <Link key={item.path} href={item.path} onClick={close} className="rounded-xl px-3 py-3 font-semibold text-white/60 hover:bg-white/5 hover:text-white">
                            {translate(item.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-5 grid gap-3 border-t border-white/[0.07] pt-5">
              <Button asChild variant="ghost" className="h-14 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white">
                <Link href="/client-login" onClick={close}>{translate("Client Login")}</Link>
              </Button>
              <Button asChild className="h-14 bg-cyan-300 font-bold text-[#131a26] hover:bg-cyan-200">
                <Link href="/get-started" onClick={close}>{translate("Get Started")}</Link>
              </Button>
              <p className="px-1 pt-2 text-xs leading-relaxed text-white/30">{dictionary.common.qualifiedAccessNotice}</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export const GlobalNavigation = memo(GlobalNavigationContent);
