import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Github, Lock, Users, Newspaper, Mail, Radar, Building2 } from "lucide-react";
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

const navLinks = [
  { label: "Home", href: "/", icon: null },
  { label: "About", href: "/trust-center", icon: null },
  { label: "Leadership", href: "/resources", icon: Users },
  { label: "Pricing", href: "/pricing", icon: null },
  { label: "Community", href: "/blog", icon: null },
  { label: "News & Newsletter", href: "/blog", icon: Newspaper },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Access", href: "/dashboard", icon: Lock },
];

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

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-panel py-2 border-b border-border/50" : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors duration-200 relative group flex items-center gap-1",
                isActive(link.href) 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          {/* Services Dropdown */}
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
                  <div className="w-[500px] p-4 bg-background border border-border rounded-xl shadow-lg">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">Security Solutions</h4>
                        <Link 
                          to="/solutions" 
                          className="text-xs text-primary hover:underline"
                        >
                          View all →
                        </Link>
                      </div>
                      {serviceCategories.map((service) => (
                        <NavigationMenuLink key={service.href} asChild>
                          <Link
                            to={service.href}
                            className="group flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <service.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {service.title}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
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
            </NavigationMenuList>
          </NavigationMenu>

          {navLinks.slice(3, 6).map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors duration-200 relative group flex items-center gap-1",
                isActive(link.href) 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Access
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="hero" size="sm" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                Login with GitHub
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden glass-panel mt-2 mx-4 rounded-xl p-4 animate-scale-in border border-border/50">
          <nav className="flex flex-col gap-1">
            {navLinks.slice(0, 3).map((link) => (
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
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}

            {/* Mobile Services Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Services</p>
              <div className="space-y-1">
                {serviceCategories.map((service) => (
                  <Link
                    key={service.href}
                    to={service.href}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <service.icon className="w-4 h-4 text-primary" />
                    {service.title}
                  </Link>
                ))}
                <Link
                  to="/solutions"
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-primary hover:bg-secondary/30 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  View all services →
                </Link>
              </div>
            </div>

            {navLinks.slice(3).map((link) => (
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
                {link.icon && <link.icon className="w-4 h-4" />}
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
                    <Link to="/dashboard" onClick={() => setIsMobileOpen(false)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { signOut(); setIsMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="hero" asChild>
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    Login with GitHub
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
