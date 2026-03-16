"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { navigationMenu } from "@/lib/siteRoutes";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenSection(null);
  };

  const toggleSection = (label: string) => {
    setOpenSection((prev) => (prev === label ? null : label));
  };

  const isActive = (path: string) => {
    const base = path.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
  };

  const isSectionActive = (sectionPath: string) => {
    const base = sectionPath.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#131a26]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          onClick={closeMobile}
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(185,100%,45%)]/10 ring-1 ring-[hsl(185,100%,45%)]/30 transition-all group-hover:bg-[hsl(185,100%,45%)]/20 group-hover:ring-[hsl(185,100%,45%)]/60">
            <Shield className="h-4.5 w-4.5 text-[hsl(185,100%,45%)]" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-widest text-[hsl(185,100%,45%)]">
              GEM
            </span>
            <span className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase">
              Enterprise
            </span>
          </div>
        </Link>

        {/* ── Desktop mega-menu ─────────────────────────────────── */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-0.5">
              {navigationMenu.map((section) => (
                <NavigationMenuItem key={section.group}>
                  <NavigationMenuTrigger
                    className={cn(
                      "h-9 rounded-md bg-transparent px-3 py-2 text-sm font-medium transition-all",
                      "text-white/60 hover:bg-white/5 hover:text-white",
                      "data-[state=open]:bg-[hsl(185,100%,45%)]/10 data-[state=open]:text-[hsl(185,100%,45%)]",
                      isSectionActive(section.path) &&
                        "text-[hsl(185,100%,45%)]"
                    )}
                  >
                    {section.label}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[540px] rounded-xl border border-white/10 bg-[#0e1420] p-5 shadow-2xl shadow-black/50">
                      {/* Dropdown header */}
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(185,100%,45%)]">
                            {section.label}
                          </p>
                        </div>
                        <Link
                          href={section.path}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-[hsl(185,100%,45%)]"
                        >
                          View all
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="mb-4 h-px bg-white/[0.07]" />

                      {/* 2-column grid of items */}
                      <ul className="grid grid-cols-2 gap-1.5">
                        {section.items.map((item) => (
                          <li key={item.path}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.path}
                                className={cn(
                                  "group/item block rounded-lg px-3 py-3 transition-all",
                                  "hover:bg-white/[0.04]",
                                  isActive(item.path)
                                    ? "bg-[hsl(185,100%,45%)]/[0.08] ring-1 ring-[hsl(185,100%,45%)]/20"
                                    : ""
                                )}
                              >
                                <span
                                  className={cn(
                                    "block text-sm font-semibold leading-none transition-colors",
                                    isActive(item.path)
                                      ? "text-[hsl(185,100%,45%)]"
                                      : "text-white/85 group-hover/item:text-white"
                                  )}
                                >
                                  {item.label}
                                </span>
                                <span className="mt-1.5 block text-xs leading-snug text-white/40 group-hover/item:text-white/55">
                                  {item.description}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Desktop utility actions ───────────────────────────── */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            Contact
          </Link>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            <Link href="/client-login">Client Login</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-[hsl(185,100%,45%)] font-semibold text-[#131a26] shadow-[0_0_20px_hsl(185,100%,45%,0.35)] transition-all hover:bg-[hsl(185,100%,50%)] hover:shadow-[0_0_28px_hsl(185,100%,45%,0.5)]"
          >
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────── */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="flex items-center justify-center rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* ── Mobile slide-down panel ───────────────────────────────── */}
      <div
        id="mobile-nav"
        aria-hidden={!mobileOpen}
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-in-out lg:hidden",
          mobileOpen ? "max-h-[calc(100dvh-4rem)]" : "max-h-0"
        )}
      >
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.07] bg-[#0e1420] px-4 py-4">
          {/* Nav sections */}
          <ul className="space-y-0.5" role="list">
            {navigationMenu.map((section) => (
              <li key={section.group}>
                <button
                  type="button"
                  aria-expanded={openSection === section.label}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5",
                    isSectionActive(section.path)
                      ? "text-[hsl(185,100%,45%)]"
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => toggleSection(section.label)}
                >
                  {section.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-white/30 transition-transform duration-200",
                      openSection === section.label && "rotate-180 text-[hsl(185,100%,45%)]"
                    )}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-250 ease-in-out",
                    openSection === section.label
                      ? "max-h-[30rem] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-white/[0.07] pl-3">
                    {/* Parent section link */}
                    <li>
                      <Link
                        href={section.path}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-[hsl(185,100%,45%)]/70 transition-colors hover:text-[hsl(185,100%,45%)]"
                        onClick={closeMobile}
                      >
                        All {section.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>

                    {section.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={cn(
                            "block rounded-md px-2 py-2 transition-colors hover:bg-white/5",
                            isActive(item.path)
                              ? "text-[hsl(185,100%,45%)]"
                              : "text-white/55 hover:text-white"
                          )}
                          onClick={closeMobile}
                        >
                          <span className="block text-sm font-medium leading-none">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-xs text-white/35">
                            {item.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>

          {/* Utility actions */}
          <div className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
            <Link
              href="/contact"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              onClick={closeMobile}
            >
              Contact
            </Link>

            <Button
              asChild
              variant="ghost"
              className="w-full justify-start border border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <Link href="/client-login" onClick={closeMobile}>
                Client Login
              </Link>
            </Button>

            <Button
              asChild
              className="w-full bg-[hsl(185,100%,45%)] font-semibold text-[#131a26] shadow-[0_0_20px_hsl(185,100%,45%,0.3)] hover:bg-[hsl(185,100%,50%)]"
            >
              <Link href="/get-started" onClick={closeMobile}>
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile bottom compliance note */}
          <p className="mt-5 px-1 text-[11px] leading-relaxed text-white/25">
            GEM Enterprise is for qualified clients only. Access requires KYC
            verification and compliance approval.
          </p>
        </nav>
      </div>
    </header>
  );
}
