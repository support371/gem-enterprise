"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  path: string;
};

type NavSection = {
  label: string;
  path: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Home",
    path: "/",
    items: [
      { label: "Overview", path: "/" },
      { label: "Client Access", path: "/client-login" },
      { label: "Get Started", path: "/get-started" },
    ],
  },
  {
    label: "Intel",
    path: "/intel",
    items: [
      { label: "Threat Intelligence", path: "/intel" },
      { label: "News Feed", path: "/intel/news" },
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
      { label: "Opportunities", path: "/community-hub/opportunities" },
      { label: "Request Access", path: "/request-access" },
    ],
  },
  {
    label: "Hub",
    path: "/hub",
    items: [
      { label: "Command Center", path: "/hub" },
      { label: "Client Portal", path: "/client-login" },
    ],
  },
  {
    label: "Resources",
    path: "/resources",
    items: [
      { label: "Resources", path: "/resources" },
      { label: "Documentation", path: "/docs" },
      { label: "Developers", path: "/developers" },
    ],
  },
  {
    label: "Company",
    path: "/company",
    items: [
      { label: "About", path: "/about" },
      { label: "Compliance Notice", path: "/compliance-notice" },
      { label: "Contact", path: "/contact" },
    ],
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenSection(null);
  };

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (path: string) => {
    const base = path.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <header className="sticky top-0 z-[10000] w-full border-b border-white/[0.07] bg-[#131a26]/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between px-5 sm:px-6 lg:h-16 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" onClick={closeMobile}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(185,100%,45%)]/10 ring-1 ring-[hsl(185,100%,45%)]/30 transition-all group-hover:bg-[hsl(185,100%,45%)]/20 group-hover:ring-[hsl(185,100%,45%)]/60 lg:h-9 lg:w-9 lg:rounded-xl">
            <Shield className="h-7 w-7 text-[hsl(185,100%,45%)] lg:h-5 lg:w-5" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-[0.18em] text-[hsl(185,100%,45%)] lg:text-base">GEM</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/40 lg:text-[10px]">Enterprise</span>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navSections.map((section) => (
            <Link
              key={section.path}
              href={section.path}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white",
                isActive(section.path) && "bg-cyan-400/10 text-cyan-300",
              )}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/contact" className="rounded-md px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white">
            Contact
          </Link>
          <Button asChild variant="ghost" size="sm" className="border border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white">
            <Link href="/client-login">Client Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-[hsl(185,100%,45%)] font-semibold text-[#131a26] shadow-[0_0_20px_hsl(185,100%,45%,0.35)] transition-all hover:bg-[hsl(185,100%,50%)] hover:shadow-[0_0_28px_hsl(185,100%,45%,0.5)]">
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70 shadow-lg transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="fixed inset-x-0 top-20 z-[9999] max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/[0.07] bg-[#0e1420] px-5 pb-28 pt-4 shadow-2xl lg:hidden">
          <nav aria-label="Mobile navigation" className="space-y-2">
            {navSections.map((section) => {
              const isOpen = openSection === section.label;
              return (
                <div key={section.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-lg font-semibold transition-colors",
                      isActive(section.path) ? "text-cyan-300" : "text-white/75",
                    )}
                    onClick={() => setOpenSection(isOpen ? null : section.label)}
                  >
                    <span>{section.label}</span>
                    <ChevronDown className={cn("h-5 w-5 text-white/30 transition-transform", isOpen && "rotate-180 text-cyan-300")} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/[0.06] px-4 py-4">
                      <Link
                        href={section.path}
                        className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/90"
                        onClick={closeMobile}
                      >
                        All {section.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <div className="grid gap-3">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                              "rounded-xl px-3 py-3 text-base font-semibold transition-colors hover:bg-white/5",
                              isActive(item.path) ? "bg-cyan-400/10 text-cyan-300" : "text-white/60",
                            )}
                            onClick={closeMobile}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-5 grid gap-3 border-t border-white/[0.07] pt-5">
              <Button asChild variant="ghost" className="h-14 justify-center border border-white/10 bg-transparent text-base font-semibold text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white">
                <Link href="/client-login" onClick={closeMobile}>Client Login</Link>
              </Button>
              <Button asChild className="h-14 bg-[hsl(185,100%,45%)] text-base font-bold text-[#131a26] shadow-[0_0_25px_hsl(185,100%,45%,0.35)] hover:bg-[hsl(185,100%,50%)]">
                <Link href="/get-started" onClick={closeMobile}>Get Started</Link>
              </Button>
              <p className="px-1 pt-2 text-xs leading-relaxed text-white/30">
                Qualified client access only. KYC verification and compliance approval are required.
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
