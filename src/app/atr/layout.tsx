'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, X, MapPin, Phone, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/atr/buy", label: "Buy" },
  { href: "/atr/sell", label: "Sell" },
  { href: "/atr/invest", label: "Invest" },
  { href: "/atr/packages", label: "Packages" },
  { href: "/atr/qfs", label: "QFS" },
  { href: "/atr", label: "About" },
];

const CONTACT_INFO = {
  email: "invest@alliancetrustsealty.com",
  phone: "+1 (800) 555-0100",
  address: "123 Investment Blvd, Suite 400, Dallas, TX 75201",
};

function ATRHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-[hsl(214.3,31.8%,91.4%)] sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[hsl(222,47%,11%)] text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{CONTACT_INFO.email}</span>
          </div>
          <div className="hidden md:flex gap-4 opacity-80 text-xs uppercase tracking-wider">
            <span>Professional Real Estate Investment</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/atr" className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span
              className="text-lg font-black tracking-tight"
              style={{ color: "hsl(222,47%,11%)", fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
            >
              Alliance Trust
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(45,29%,47%)]">
              Realty
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[hsl(45,29%,47%)] uppercase tracking-wide",
                pathname === item.href
                  ? "text-[hsl(222,47%,11%)] font-bold border-b-2 border-[hsl(45,29%,47%)]"
                  : "text-[hsl(215.4,16.3%,46.9%)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/atr/login">
            <Button variant="ghost" className="font-semibold uppercase tracking-wide text-xs">
              Login
            </Button>
          </Link>
          <Link href="/atr/register">
            <Button className="bg-[hsl(45,29%,47%)] hover:bg-[hsl(45,29%,40%)] text-white font-bold uppercase tracking-wide text-xs px-6">
              Join Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-[hsl(222,47%,11%)] hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[32rem]" : "max-h-0"
        )}
      >
        <nav className="bg-white border-t border-[hsl(214.3,31.8%,91.4%)] px-4 py-6 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-lg font-medium transition-colors hover:text-[hsl(45,29%,47%)]",
                pathname === item.href
                  ? "text-[hsl(222,47%,11%)] font-bold"
                  : "text-[hsl(215.4,16.3%,46.9%)]"
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[hsl(214.3,31.8%,91.4%)]">
            <Link href="/atr/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full uppercase">Login</Button>
            </Link>
            <Link href="/atr/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-[hsl(45,29%,47%)] hover:bg-[hsl(45,29%,40%)] text-white uppercase font-bold">
                Join Now
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function ATRFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer
      className="pt-16 pb-8 border-t-4"
      style={{
        backgroundColor: "hsl(222,47%,11%)",
        borderTopColor: "hsl(45,29%,47%)",
        color: "white",
      }}
    >
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Contact Block */}
        <div className="space-y-6">
          <h3
            className="text-xl font-bold"
            style={{
              color: "hsl(45,29%,47%)",
              fontFamily: "var(--font-serif, 'Playfair Display', serif)",
            }}
          >
            Contact Us
          </h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0" style={{ color: "hsl(45,29%,47%)" }} />
              <span>{CONTACT_INFO.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0" style={{ color: "hsl(45,29%,47%)" }} />
              <span>{CONTACT_INFO.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0" style={{ color: "hsl(45,29%,47%)" }} />
              <span>{CONTACT_INFO.email}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Block */}
        <div className="space-y-6">
          <h3
            className="text-xl font-bold"
            style={{
              color: "hsl(45,29%,47%)",
              fontFamily: "var(--font-serif, 'Playfair Display', serif)",
            }}
          >
            Newsletter
          </h3>
          <p className="text-sm text-gray-300">
            Subscribe to receive the latest market intelligence and real estate opportunities.
          </p>
          <form className="space-y-3" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[hsl(45,29%,47%)] transition-colors rounded-sm"
              required
            />
            <button
              type="submit"
              className="w-full py-3 font-bold uppercase text-xs tracking-wider transition-colors rounded-sm disabled:opacity-50 text-white"
              style={{ backgroundColor: "hsl(45,29%,47%)" }}
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* About Block */}
        <div className="space-y-6">
          <h3
            className="text-xl font-bold"
            style={{
              color: "hsl(45,29%,47%)",
              fontFamily: "var(--font-serif, 'Playfair Display', serif)",
            }}
          >
            About Us
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Alliance Trust Realty is a premier real estate investment platform dedicated to providing
            institutional-grade opportunities to individual investors. We combine market intelligence
            with strategic asset allocation.
          </p>
          <Link
            href="/atr"
            className="inline-block text-sm font-bold uppercase tracking-wide border-b pb-1 transition-colors hover:text-white"
            style={{ color: "hsl(45,29%,47%)", borderBottomColor: "hsl(45,29%,47%)" }}
          >
            Read More
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Alliance Trust Realty. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default function ATRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "var(--font-sans-atr, 'Manrope', sans-serif)",
        backgroundColor: "hsl(220,15%,97%)",
        color: "hsl(222,47%,11%)",
      }}
    >
      <ATRHeader />
      <main className="flex-grow">{children}</main>
      <ATRFooter />
    </div>
  );
}
