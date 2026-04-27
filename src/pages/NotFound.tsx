import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Company", href: "/company" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background grid */}
        <div className="cyber-grid absolute inset-0 opacity-10" />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          {/* Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-12 h-12 text-primary opacity-60" />
            </div>
          </div>

          {/* Error code */}
          <p className="text-sm font-mono text-primary tracking-widest uppercase mb-4">
            Error 404
          </p>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-gradient-primary">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base">
            The page{" "}
            <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded text-foreground">
              {location.pathname}
            </code>{" "}
            doesn't exist or has been moved. Check the URL or use one of the links below.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Button variant="hero" size="lg" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Quick links */}
          <div className="glass-panel rounded-2xl border border-border/50 p-6 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Quick Links</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-border/40"
                >
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
