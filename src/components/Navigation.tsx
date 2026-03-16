import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// ─── Desktop nav sections ────────────────────────────────────────────────────
const desktopSections = [
  { label: "Home", href: "/" },
  {
    label: "Intel",
    children: [
      { label: "Threat Intelligence", href: "/solutions/threat-detection" },
      { label: "Reports", href: "/resources" },
      { label: "Monitoring", href: "/solutions/cyber-defense" },
      { label: "Intel Briefs", href: "/blog" },
      { label: "Architecture Specs", href: "/resources" },
    ],
  },
  {
    label: "Services",
    href: "/solutions",
    children: [
      { label: "Cybersecurity", href: "/solutions/cyber-defense" },
      { label: "Financial", href: "/solutions/trust-security" },
      { label: "Real Estate", href: "/solutions/asset-management" },
      { label: "Assessments", href: "/solutions/cyber-defense" },
      { label: "Consultations", href: "/contact" },
    ],
  },
  { label: "Community", href: "/blog" },
  {
    label: "Hub",
    children: [
      { label: "Command Center", href: "/dashboard" },
      { label: "Documents", href: "/resources" },
      { label: "Support Access", href: "/contact" },
      { label: "Requests", href: "/contact" },
      { label: "Client Portal", href: "/dashboard" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Market Insights", href: "/resources" },
      { label: "Templates", href: "/resources" },
      { label: "Bots", href: "/resources" },
      { label: "News", href: "/blog" },
      { label: "FAQ", href: "/pricing" },
    ],
  },
  {
    label: "Company",
    href: "/trust-center",
    children: [
      { label: "About", href: "/trust-center" },
      { label: "Leadership & Vision", href: "/trust-center" },
      { label: "Executive Board", href: "/trust-center" },
      { label: "Teams", href: "/trust-center" },
      { label: "Partners & Trustees", href: "/trust-center" },
      { label: "Compliance Notice", href: "/trust-center" },
    ],
  },
];

// ─── Mobile accordion sections (mirrors images exactly) ──────────────────────
const mobileSections = [
  { id: "home", label: "HOME", href: "/" },
  {
    id: "intel",
    label: "INTEL",
    children: [
      { label: "Threat Intelligence", href: "/solutions/threat-detection" },
      { label: "Reports", href: "/resources" },
      { label: "Monitoring", href: "/solutions/cyber-defense" },
      { label: "Intel Briefs", href: "/blog" },
      { label: "Architecture Specs", href: "/resources" },
    ],
  },
  {
    id: "services",
    label: "SERVICES",
    children: [
      { label: "Cybersecurity", href: "/solutions/cyber-defense" },
      { label: "Financial", href: "/solutions/trust-security" },
      { label: "Real Estate", href: "/solutions/asset-management" },
      { label: "Assessments", href: "/solutions/cyber-defense" },
      { label: "Consultations", href: "/contact" },
    ],
  },
  { id: "community", label: "COMMUNITY", href: "/blog" },
  {
    id: "hub",
    label: "HUB",
    children: [
      { label: "Command Center", href: "/dashboard" },
      { label: "Documents", href: "/resources" },
      { label: "Support Access", href: "/contact" },
      { label: "Requests", href: "/contact" },
      { label: "Client Portal", href: "/dashboard" },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    children: [
      { label: "Market Insights", href: "/resources" },
      { label: "Templates", href: "/resources" },
      { label: "Bots", href: "/resources" },
      { label: "News", href: "/blog" },
      { label: "FAQ", href: "/pricing" },
    ],
  },
  {
    id: "company",
    label: "COMPANY",
    children: [
      { label: "About", href: "/trust-center" },
      { label: "Leadership & Vision", href: "/trust-center" },
      { label: "Executive Board", href: "/trust-center" },
      { label: "Teams", href: "/trust-center" },
      { label: "Partners & Trustees", href: "/trust-center" },
      { label: "Compliance Notice", href: "/trust-center" },
    ],
  },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass-panel py-2 border-b border-border/50" : "py-4 bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Shield className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient-primary">GEM</span>
              <span className="text-foreground/80 ml-1 hidden sm:inline">ENTERPRISE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopSections.map((section) =>
              section.children ? (
                <NavigationMenu key={section.label}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        className={cn(
                          "px-3 py-2 text-sm font-medium bg-transparent hover:bg-transparent transition-colors",
                          section.href && isActive(section.href)
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {section.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-52 p-2 bg-background border border-border rounded-xl shadow-lg">
                          {section.children.map((child) => (
                            <NavigationMenuLink key={child.href + child.label} asChild>
                              <Link
                                to={child.href}
                                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                              >
                                {child.label}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ) : (
                <Link
                  key={section.label}
                  to={section.href!}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors duration-200 relative",
                    isActive(section.href!)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {section.label}
                  {isActive(section.href!) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">Hub</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/login">Client Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Full-screen mobile overlay ──────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-y-auto">
          {/* Overlay header */}
          <div className="flex items-center justify-between px-5 py-5 shrink-0">
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="text-xl font-bold tracking-tight"
            >
              <span className="text-gradient-primary">GEM</span>
              <span className="text-primary">.</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Accordion sections */}
          <nav className="flex-1">
            {mobileSections.map((section) => {
              const hasChildren = !!section.children;
              const isOpen = openSection === section.id;

              return (
                <div key={section.id}>
                  {hasChildren ? (
                    <>
                      {/* Collapsible header */}
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                        onClick={() => toggleSection(section.id)}
                      >
                        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                          {section.label}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Sub-items */}
                      {isOpen && (
                        <div className="pb-2">
                          {section.children!.map((child, i) => {
                            const isLast = i === section.children!.length - 1;
                            return (
                              <Link
                                key={child.href + child.label}
                                to={child.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                  "block px-5 py-3 text-base transition-colors hover:text-foreground",
                                  isLast
                                    ? "font-semibold text-foreground"
                                    : "font-normal text-muted-foreground"
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Simple top-level link */
                    <Link
                      to={section.href!}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-between w-full px-5 py-4"
                    >
                      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        {section.label}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground opacity-40" />
                    </Link>
                  )}
                  <div className="border-t border-border/40" />
                </div>
              );
            })}

            {/* Standalone bottom links */}
            <div className="px-5 pt-4 pb-2 space-y-4">
              <Link
                to="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="block text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/login"
                onClick={() => setIsMobileOpen(false)}
                className="block text-base text-primary font-medium hover:text-primary/80 transition-colors"
              >
                KYC Status
              </Link>
            </div>
          </nav>

          {/* Client Login button */}
          <div className="px-5 pb-8 pt-4 shrink-0">
            {user ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { signOut(); setIsMobileOpen(false); }}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold text-base h-14 rounded-xl"
                asChild
              >
                <Link to="/login" onClick={() => setIsMobileOpen(false)}>
                  Client Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
