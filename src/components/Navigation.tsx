"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  path: string;
  description: string;
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
      { label: "Overview", path: "/", description: "Platform overview and highlights" },
      { label: "Platform Highlights", path: "/#platform", description: "What GEM Enterprise delivers" },
      { label: "Trust Signals", path: "/#trust", description: "Compliance, controls, and standards" },
      { label: "Client Access", path: "/client-login", description: "Access your client account" },
      { label: "Get Started", path: "/get-started", description: "Begin eligibility and onboarding" },
    ],
  },
  {
    label: "Intel",
    path: "/intel",
    items: [
      { label: "Threat Intelligence", path: "/intel", description: "Global threat landscape and briefings" },
      { label: "Reports", path: "/intel#reports", description: "Published intelligence reports" },
      { label: "Monitoring", path: "/intel#monitoring", description: "Continuous threat monitoring" },
      { label: "Intel Briefs", path: "/intel#briefs", description: "Concise intelligence summaries" },
      { label: "News Feed", path: "/intel/news", description: "Cyber, markets, crypto, policy, and geopolitical feed" },
    ],
  },
  {
    label: "Services",
    path: "/services",
    items: [
      { label: "Cybersecurity", path: "/services#cyber", description: "Enterprise threat protection and response" },
      { label: "Financial", path: "/services#financial", description: "Secure financial services and compliance" },
      { label: "Real Estate", path: "/services#real-estate", description: "Real estate and asset protection" },
      { label: "Assessments", path: "/services#assessments", description: "Security posture assessments" },
      { label: "Alliance Trust Realty", path: "/atr", description: "ATR real estate investment platform" },
      { label: "Investment Platform", path: "/atr/invest", description: "Fractional, ownership, fund, and REIT vehicles" },
    ],
  },
  {
    label: "Community",
    path: "/community-hub",
    items: [
      { label: "Community Hub", path: "/community-hub", description: "Flagship vetted community experience" },
      { label: "Opportunities", path: "/community-hub/opportunities", description: "Deal flow, mandates, and introductions" },
      { label: "Members", path: "/community-hub/members", description: "Directory of vetted members and advisors" },
      { label: "Circles", path: "/community-hub/circles", description: "Private topical working groups" },
      { label: "Events", path: "/community-hub/events", description: "Summits, salons, and working sessions" },
      { label: "Request Access", path: "/request-access", description: "Apply to join the GEM Community Hub" },
    ],
  },
  {
    label: "Hub",
    path: "/hub",
    items: [
      { label: "Command Center", path: "/hub#command", description: "Operational command and control" },
      { label: "Documents", path: "/hub#documents", description: "Platform documents and agreements" },
      { label: "Support Access", path: "/hub#support", description: "Connect with enterprise support" },
      { label: "Requests", path: "/hub#requests", description: "Submit service requests" },
      { label: "Client Portal", path: "/client-login", description: "Authenticated client access" },
    ],
  },
  {
    label: "Resources",
    path: "/resources",
    items: [
      { label: "Market Insights", path: "/resources#insights", description: "Intelligence and market analysis" },
      { label: "Templates", path: "/resources#templates", description: "Downloadable security templates" },
      { label: "Bots", path: "/resources#bots", description: "Automated intelligence tools" },
      { label: "Documentation", path: "/docs", description: "Platform guides, SDK references, and API documentation" },
      { label: "Developer Dashboard", path: "/developers", description: "API keys, usage metrics, and integration tools" },
      { label: "API Explorer", path: "/api-explorer", description: "Interactive API testing console" },
      { label: "News", path: "/resources#news", description: "Latest industry news" },
      { label: "FAQ", path: "/resources#faq", description: "Frequently asked questions" },
    ],
  },
  {
    label: "Company",
    path: "/company",
    items: [
      { label: "About", path: "/about", description: "About GEM Enterprise" },
      { label: "Leadership & Vision", path: "/company#leadership", description: "Executive leadership and mission" },
      { label: "Executive Board", path: "/company#board", description: "Board and governance structure" },
      { label: "Teams", path: "/company#teams", description: "Expert teams and divisions" },
      { label: "Compliance Notice", path: "/compliance-notice", description: "Regulatory disclosures and compliance boundaries" },
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
  }, [pathname]);

  const isActive = (path: string) => {
    const base = path.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <header className="sticky top-0 z-[10000] w-full border-b border-white/[0.07] bg-[#131a26]/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" onClick={closeMobile}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(185,100%,45%)]/10 ring-1 ring-[hsl(185,100%,45%)]/30 transition-all group-hover:bg-[hsl(185,100%,45%)]/20 group-hover:ring-[hsl(185,100%,45%)]/60">
            <Shield className="h-5 w-5 text-[hsl(185,100%,45%)]" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-widest text-[hsl(185,100%,45%)]">GEM</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Enterprise</span>
          </div>
        </Link>

        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-0.5">
              {navSections.map((section) => (
                <NavigationMenuItem key={section.label}>
                  <NavigationMenuTrigger
                    className={cn(
                      "h-9 rounded-md bg-transparent px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white",
                      "data-[state=open]:bg-[hsl(185,100%,45%)]/10 data-[state=open]:text-[hsl(185,100%,45%)]",
                      isActive(section.path) && "text-[hsl(185,100%,45%)]",
                    )}
                  >
                    {section.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[560px] rounded-xl border border-white/10 bg-[#0e1420] p-5 shadow-2xl shadow-black/50">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(185,100%,45%)]">
                          {section.label}
                        </p>
                        <Link
                          href={section.path}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-[hsl(185,100%,45%)]"
                        >
                          View all
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="mb-4 h-px bg-white/[0.07]" />
                      <ul className="grid grid-cols-2 gap-1.5">
                        {section.items.map((item) => (
                          <li key={item.path}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.path}
                                className={cn(
                                  "group/item block rounded-lg px-3 py-3 transition-all hover:bg-white/[0.04]",
                                  isActive(item.path) && "bg-[hsl(185,100%,45%)]/[0.08] ring-1 ring-[hsl(185,100%,45%)]/20",
                                )}
                              >
                                <span
                                  className={cn(
                                    "block text-sm font-semibold leading-none transition-colors",
                                    isActive(item.path)
                                      ? "text-[hsl(185,100%,45%)]"
                                      : "text-white/85 group-hover/item:text-white",
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
          className="flex items-center justify-center rounded-xl bg-white/5 p-2.5 text-white/70 shadow-lg transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 z-[9999] max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.07] bg-[#0e1420] px-4 pb-32 pt-4 shadow-2xl lg:hidden">
          <nav className="space-y-1">
            {navSections.map((section) => {
              const isOpen = openSection === section.label;
              return (
                <div key={section.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xl font-semibold transition-colors hover:bg-white/5",
                      isActive(section.path) ? "text-[hsl(185,100%,45%)]" : "text-white/70 hover:text-white",
                    )}
                    onClick={() => setOpenSection(isOpen ? null : section.label)}
                  >
                    <span>{section.label}</span>
                    <ChevronDown className={cn("h-5 w-5 text-white/30 transition-transform", isOpen && "rotate-180 text-[hsl(185,100%,45%)]")} />
                  </button>

                  {isOpen && (
                    <div className="ml-4 border-l border-white/[0.07] px-5 pb-3 pt-2">
                      <Link
                        href={section.path}
                        className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[hsl(185,100%,45%)]/80"
                        onClick={closeMobile}
                      >
                        All {section.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <div className="space-y-5">
                        {section.items.map((item) => (
                          <Link key={item.path} href={item.path} className="block" onClick={closeMobile}>
                            <span className={cn("block text-lg font-semibold", isActive(item.path) ? "text-[hsl(185,100%,45%)]" : "text-white/65")}>{item.label}</span>
                            <span className="mt-1 block text-sm leading-snug text-white/35">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-6">
              <Link href="/contact" className="block rounded-xl px-3 py-3 text-lg font-semibold text-white/65 hover:bg-white/5 hover:text-white" onClick={closeMobile}>
                Contact
              </Link>
              <Button asChild variant="ghost" className="w-full justify-start border border-white/10 bg-transparent py-6 text-lg text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white">
                <Link href="/client-login" onClick={closeMobile}>Client Login</Link>
              </Button>
              <Button asChild className="w-full bg-[hsl(185,100%,45%)] py-6 text-lg font-bold text-[#131a26] shadow-[0_0_25px_hsl(185,100%,45%,0.35)] hover:bg-[hsl(185,100%,50%)]">
                <Link href="/get-started" onClick={closeMobile}>Get Started</Link>
              </Button>
              <p className="px-1 pt-3 text-xs leading-relaxed text-white/30">
                GEM Enterprise is for qualified clients only. Access requires KYC verification and compliance approval.
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
