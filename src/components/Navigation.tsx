import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Menu,
  X,
  Lock,
  Newspaper,
  Mail,
  Radar,
  Building2,
  BookOpen,
  FileText,
  ChevronDown,
  ArrowRight,
  LayoutDashboard,
  Workflow,
} from "lucide-react";
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

const serviceCategories = [
  {
    title: "Cyber Defense & Monitoring",
    href: "/solutions/cyber-defense",
    icon: Shield,
    description: "Continuous protection for enterprise environments with 24/7 SOC coverage.",
  },
  {
    title: "Threat Detection & Response",
    href: "/solutions/threat-detection",
    icon: Radar,
    description: "Proactive threat hunting, incident response, and security readiness.",
  },
  {
    title: "Digital Asset Protection",
    href: "/solutions/digital-asset-protection",
    icon: Lock,
    description: "Security advisory for critical digital infrastructure and assets.",
  },
  {
    title: "Trust & Real-Asset Security",
    href: "/solutions/trust-security",
    icon: Building2,
    description: "Partner-backed enterprise security solutions for physical assets.",
  },
];

const resourceLinks = [
  {
    title: "Blog",
    href: "/blog",
    icon: Newspaper,
    description: "Insights, threat intelligence, and cybersecurity news from our experts.",
  },
  {
    title: "Resources",
    href: "/resources",
    icon: FileText,
    description: "Whitepapers, guides, and tools to strengthen your security posture.",
  },
  {
    title: "Trust Center",
    href: "/trust-center",
    icon: BookOpen,
    description: "Our security policies, compliance certifications, and transparency reports.",
  },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileLearnOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isResourceActive = () =>
    ["/blog", "/resources", "/trust-center"].some((p) => location.pathname.startsWith(p));

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-panel py-2 border-b border-border/50" : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Shield className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-gradient-primary">GEM</span>
            <span className="text-foreground/80 ml-1 hidden sm:inline">ENTERPRISE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent",
                    isActive("/solutions")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[520px] p-5 bg-background border border-border rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Security Solutions</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enterprise-grade protection tailored to your needs
                        </p>
                      </div>
                      <Link
                        to="/solutions"
                        className="text-xs text-primary hover:underline whitespace-nowrap"
                      >
                        View all →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceCategories.map((service) => (
                        <NavigationMenuLink key={service.href} asChild>
                          <Link
                            to={service.href}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <service.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                                {service.title}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors duration-200 bg-transparent hover:bg-transparent",
                    isResourceActive()
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[380px] p-5 bg-background border border-border rounded-xl shadow-lg">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Resources & Trust</h4>
                    <div className="space-y-1">
                      {resourceLinks.map((item) => (
                        <NavigationMenuLink key={item.href} asChild>
                          <Link
                            to={item.href}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <item.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {[
            { label: "Platform", href: "/portal", icon: LayoutDashboard },
            { label: "Workspace", href: "/portal/workspace", icon: Workflow },
            { label: "Contact", href: "/contact", icon: Mail },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors duration-200 relative flex items-center gap-1",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/portal" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Open Platform
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/portal" className="flex items-center gap-2">
                  Open Platform
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden glass-panel mt-2 mx-4 rounded-xl p-4 animate-scale-in border border-border/50">
          <nav className="flex flex-col gap-1">
            <Link
              to="/portal"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-foreground bg-secondary/50"
              onClick={() => setIsMobileOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Open Platform
            </Link>
            <Link
              to="/portal/workspace"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              onClick={() => setIsMobileOpen(false)}
            >
              <Workflow className="w-4 h-4 text-primary" />
              Enter Workspace
            </Link>

            <button
              className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/30 w-full text-left"
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            >
              <span>Services</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  mobileServicesOpen && "rotate-180"
                )}
              />
            </button>
            {mobileServicesOpen && (
              <div className="ml-4 space-y-1 mb-1">
                {serviceCategories.map((service) => (
                  <Link
                    key={service.href}
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <service.icon className="w-4 h-4 text-primary shrink-0" />
                    {service.title}
                  </Link>
                ))}
                <Link
                  to="/solutions"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-secondary/30 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  View all services →
                </Link>
              </div>
            )}

            <button
              className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/30 w-full text-left"
              onClick={() => setMobileLearnOpen(!mobileLearnOpen)}
            >
              <span>Learn</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  mobileLearnOpen && "rotate-180"
                )}
              />
            </button>
            {mobileLearnOpen && (
              <div className="ml-4 space-y-1 mb-1">
                {resourceLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            {[
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
                  isActive(link.href)
                    ? "text-foreground bg-secondary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/portal" onClick={() => setIsMobileOpen(false)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Open Platform
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { signOut(); setIsMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/auth" onClick={() => setIsMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/portal" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2">
                      Open Platform
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
