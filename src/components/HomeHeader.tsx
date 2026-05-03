"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-background/80 border-b border-white/10 backdrop-blur"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-screen-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <ShieldCheck className="w-5 h-5 text-cyan-400" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-white">GEM</span>
            <span className="text-[10px] font-semibold text-cyan-400 tracking-widest uppercase">Enterprise</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Platform", "Intel", "Assets", "Community", "About"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <Button
          asChild
          className="hidden md:flex bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-6 text-sm"
        >
          <Link href="/get-started">Get Access</Link>
        </Button>

        {/* Mobile Menu */}
        <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Activity className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
