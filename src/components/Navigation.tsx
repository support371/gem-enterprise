import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type NavItem = {
  title: string;
  description: string;
  href: string;
};

type NavGroup = {
  label: string;
  allLabel: string;
  href: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Home",
    allLabel: "All Home",
    href: "/",
    items: [
      { title: "Overview", description: "Platform overview and highlights", href: "/" },
      { title: "Platform Highlights", description: "What GEM Enterprise delivers", href: "/#platform-highlights" },
      { title: "Leadership", description: "Leadership and trust signals", href: "/#leadership" },
      { title: "Client Access", description: "Access your client account", href: "/auth" },
      { title: "Get Started", description: "Begin onboarding", href: "/register" },
    ],
  },
  {
    label: "Intel",
    allLabel: "All Intel",
    href: "/resources",
    items: [
      { title: "Threat Intelligence", description: "Global threat landscape and briefings", href: "/resources#threat-intelligence" },
      { title: "Reports", description: "Published intelligence reports", href: "/resources#reports" },
      { title: "Monitoring", description: "Continuous threat monitoring", href: "/solutions/cyber-defense" },
      { title: "Intel Briefs", description: "Concise intelligence summaries", href: "/blog" },
      { title: "Architecture Specs", description: "Platform architecture and specs", href: "/resources#architecture" },
    ],
  },
  {
    label: "Services",
    allLabel: "All Services",
    href: "/solutions",
    items: [
      { title: "Cybersecurity", description: "Enterprise threat protection and response", href: "/solutions/cyber-defense" },
      { title: "Financial", description: "Secure financial services and compliance", href: "/solutions#financial" },
      { title: "Real Estate", description: "Real estate security and asset protection", href: "/solutions/trust-security" },
      { title: "Assessments", description: "Security posture assessments", href: "/solutions#assessments" },
      { title: "Consultations", description: "Strategic security consultations", href: "/contact" },
      { title: "Alliance Trust Realty", description: "Real estate investment platform — ATR Division", href: "/portal/alliance-trust" },
      { title: "Properties", description: "ATR property portfolio and listings", href: "/portal/alliance-trust" },
      { title: "Investment Platform", description: "Fractional, full ownership, fund, and REIT vehicles", href: "/portal/alliance-trust" },
    ],
  },
  {
    label: "Community",
    allLabel: "All Community",
    href: "/portal/community",
    items: [
      { title: "Community Hub", description: "Flagship vetted community experience", href: "/portal/community" },
      { title: "Opportunities", description: "Deal flow, mandates, and introductions", href: "/portal/community#opportunities" },
      { title: "Members", description: "Directory of vetted members and advisors", href: "/portal/community#members" },
      { title: "Circles", description: "Private topical working groups", href: "/portal/community#circles" },
      { title: "Events", description: "Summits, salons, and working sessions", href: "/portal/community#events" },
      { title: "Knowledge", description: "Member-only research and playbooks", href: "/portal/community#knowledge" },
      { title: "Request Access", description: "Apply to join the GEM Community Hub", href: "/register" },
      { title: "Community Overview", description: "Community structure and operating model", href: "/portal/community" },
    ],
  },
  {
    label: "Hub",
    allLabel: "All Hub",
    href: "/portal",
    items: [
      { title: "Command Center", description: "Operational command and control", href: "/portal" },
      { title: "Documents", description: "Platform documents and agreements", href: "/portal/tasks" },
      { title: "Support Access", description: "Connect with enterprise support", href: "/support" },
      { title: "Requests", description: "Submit service requests", href: "/portal/tasks" },
      { title: "Client Portal", description: "Authenticated client access", href: "/auth" },
    ],
  },
  {
    label: "Resources",
    allLabel: "All Resources",
    href: "/resources",
    items: [
      { title: "Market Insights", description: "Intelligence and market analysis", href: "/resources#market-insights" },
      { title: "Templates", description: "Downloadable security templates", href: "/resources#templates" },
      { title: "Bots", description: "Automated intelligence tools", href: "/resources#bots" },
      { title: "News", description: "Latest industry news", href: "/blog" },
      { title: "FAQ", description: "Frequently asked questions", href: "/resources#faq" },
    ],
  },
  {
    label: "Company",
    allLabel: "All Company",
    href: "/trust-center",
    items: [
      { title: "About", description: "About GEM Enterprise", href: "/trust-center#about" },
      { title: "Leadership & Vision", description: "Executive leadership and mission", href: "/trust-center#leadership" },
      { title: "Executive Board", description: "Board of directors", href: "/trust-center#board" },
      { title: "Teams", description: "Expert teams and divisions", href: "/trust-center#teams" },
      { title: "Personnel Board", description: "GEM & ATR personnel directory with AI Overseer", href: "/trust-center#personnel" },
    ],
  },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenMobileGroup(null);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("#")[0]);
  };

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled || isMobileOpen ? "glass-panel border-b border-border/50 py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
            <Shield className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="leading-none">
            <span className="block text-xl font-bold tracking-[0.22em] text-primary">GEM</span>
            <span className="mt-1 block text-xs font-semibold tracking-[0.5em] text-muted-foreground">ENTERPRISE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navGroups.map((group) => (
                <NavigationMenuItem key={group.label}>
                  <NavigationMenuTrigger
                    className={cn(
                      "bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-transparent",
                      isActive(group.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {group.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[560px] rounded-xl border border-border bg-background p-5 shadow-lg">
                      <Link
                        to={group.href}
                        className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-primary hover:text-primary/80"
                      >
                        {group.allLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <NavigationMenuLink asChild key={`${group.label}-${item.title}`}>
                            <Link to={item.href} className="rounded-lg p-3 transition-colors hover:bg-secondary/40">
                              <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/portal">Client Portal</Link>
              </Button>
              <Button variant="hero" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Client Login</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-2xl bg-secondary/70 p-3 text-foreground lg:hidden"
          onClick={() => setIsMobileOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-x-0 top-[72px] z-40 max-h-[calc(100vh-72px)] overflow-y-auto border-t border-border bg-background/98 px-4 pb-10 pt-7 backdrop-blur-xl lg:hidden">
          <nav className="space-y-2">
            {navGroups.map((group) => {
              const isOpen = openMobileGroup === group.label;
              return (
                <div key={group.label}>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-2xl font-semibold transition-colors",
                      isOpen ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setOpenMobileGroup(isOpen ? null : group.label)}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180 text-primary")} />
                  </button>

                  {isOpen && (
                    <div className="ml-7 border-l border-border/80 px-6 pb-2 pt-2">
                      <Link
                        to={group.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.35em] text-primary"
                      >
                        {group.allLabel}
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                      <div className="space-y-6">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.label}-${item.title}`}
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block"
                          >
                            <span className="block text-xl font-semibold text-muted-foreground transition-colors hover:text-primary">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-base leading-snug text-muted-foreground/60">
                              {item.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-8 border-t border-border pt-6">
              <Link
                to="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="mb-5 block px-4 text-xl font-semibold text-muted-foreground"
              >
                Contact
              </Link>
              <Link
                to={user ? "/portal" : "/auth"}
                onClick={() => setIsMobileOpen(false)}
                className="mb-4 block rounded-2xl border border-border px-5 py-4 text-xl font-semibold text-muted-foreground"
              >
                {user ? "Client Portal" : "Client Login"}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileOpen(false)}
                className="block rounded-2xl bg-primary px-5 py-4 text-center text-xl font-bold text-primary-foreground shadow-[0_0_35px_hsl(var(--primary)/0.35)]"
              >
                Get Started
              </Link>
              <p className="px-2 pt-6 text-base leading-relaxed text-muted-foreground/50">
                GEM Enterprise is for qualified clients only. Access requires KYC verification and compliance approval.
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
