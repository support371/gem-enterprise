"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  Star,
  CheckCircle,
  ArrowRight,
  Home,
  Building,
  Layers,
  Trees,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Mock property data (reflects DEVELOPER.md schema) ─────────────────────────

const PROPERTIES = [
  {
    id: 1, mlsNumber: "MLS-2026-001",
    propertyType: "multi_family", status: "available", listingStatus: "active",
    streetAddress: "1842 Cypress Creek Blvd", city: "Austin", state: "TX", zipCode: "78701",
    bedrooms: 8, bathrooms: 6, squareFeet: 6200, yearBuilt: 2019,
    listPrice: 3200000, currentValue: 3350000, estimatedMonthlyRent: 18500,
    capRate: 7.8, isFeatured: true,
    description: "Institutional-grade multi-family asset in Austin's premier growth corridor. Fully occupied with long-term tenants. Recently renovated common areas with advanced security integration.",
    emoji: "🏘️",
    tags: ["High Cap Rate", "Fully Leased", "Security Integrated"],
  },
  {
    id: 2, mlsNumber: "MLS-2026-002",
    propertyType: "commercial", status: "available", listingStatus: "active",
    streetAddress: "5500 Enterprise Parkway", city: "Dallas", state: "TX", zipCode: "75201",
    bedrooms: 0, bathrooms: 12, squareFeet: 18400, yearBuilt: 2021,
    listPrice: 8900000, currentValue: 9200000, estimatedMonthlyRent: 52000,
    capRate: 7.0, isFeatured: true,
    description: "Class-A commercial office complex in Dallas tech hub. Triple-net leased to Fortune 500 tenants. LEED Gold certified. Biometric access and 24/7 SOC integration.",
    emoji: "🏢",
    tags: ["Class-A", "NNN Lease", "LEED Gold"],
  },
  {
    id: 3, mlsNumber: "MLS-2026-003",
    propertyType: "single_family", status: "available", listingStatus: "active",
    streetAddress: "310 Meridian Ridge Dr", city: "Miami", state: "FL", zipCode: "33101",
    bedrooms: 5, bathrooms: 4, squareFeet: 4800, yearBuilt: 2022,
    listPrice: 2150000, currentValue: 2280000, estimatedMonthlyRent: 12000,
    capRate: 6.7, isFeatured: false,
    description: "Luxury single-family estate in Miami's Brickell corridor. Smart home technology with enterprise-grade cybersecurity. Title deed monitoring active.",
    emoji: "🏡",
    tags: ["Smart Home", "Deed Monitored", "Luxury"],
  },
  {
    id: 4, mlsNumber: "MLS-2026-004",
    propertyType: "condo", status: "available", listingStatus: "active",
    streetAddress: "2200 Skyline Tower #1802", city: "Chicago", state: "IL", zipCode: "60601",
    bedrooms: 3, bathrooms: 2, squareFeet: 2100, yearBuilt: 2020,
    listPrice: 875000, currentValue: 920000, estimatedMonthlyRent: 5800,
    capRate: 7.9, isFeatured: false,
    description: "High-floor luxury condo in iconic Chicago tower. Building includes concierge security, fire suppression, and compliance-certified building management system.",
    emoji: "🏙️",
    tags: ["High Floor", "Concierge Security", "High ROI"],
  },
  {
    id: 5, mlsNumber: "MLS-2026-005",
    propertyType: "multi_family", status: "available", listingStatus: "active",
    streetAddress: "901 Riverside Commons", city: "Nashville", state: "TN", zipCode: "37201",
    bedrooms: 12, bathrooms: 10, squareFeet: 9600, yearBuilt: 2018,
    listPrice: 4750000, currentValue: 4950000, estimatedMonthlyRent: 28000,
    capRate: 7.1, isFeatured: true,
    description: "Premier multi-family complex in Nashville's fastest-growing corridor. 8-unit building fully occupied. Integrated property management system and compliance monitoring.",
    emoji: "🏘️",
    tags: ["8 Units", "Property Mgmt", "Nashville Growth"],
  },
  {
    id: 6, mlsNumber: "MLS-2026-006",
    propertyType: "townhouse", status: "under_contract", listingStatus: "pending",
    streetAddress: "440 Heritage Walk", city: "Denver", state: "CO", zipCode: "80201",
    bedrooms: 4, bathrooms: 3, squareFeet: 2800, yearBuilt: 2023,
    listPrice: 1100000, currentValue: 1140000, estimatedMonthlyRent: 6500,
    capRate: 7.1, isFeatured: false,
    description: "Brand-new luxury townhouse in Denver's historic district. Energy Star certified, smart security, deed protection active. Under contract — inquire for backup offer.",
    emoji: "🏠",
    tags: ["New Build", "Energy Star", "Under Contract"],
  },
];

const TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  commercial: "Commercial",
  land: "Land",
};

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  single_family: Home,
  multi_family: Layers,
  condo: Building2,
  townhouse: Home,
  commercial: Building,
  land: Trees,
};

const STATUS_BADGE: Record<string, string> = {
  available: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
  under_contract: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  sold: "bg-muted/30 text-muted-foreground border-border",
  rented: "bg-blue-400/20 text-blue-400 border-blue-400/30",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const FILTERS = {
  types: ["all", "single_family", "multi_family", "condo", "townhouse", "commercial"],
  statuses: ["all", "available", "under_contract"],
  sortBy: ["price_asc", "price_desc", "cap_rate", "newest"],
};

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("cap_rate");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = PROPERTIES
    .filter((p) => {
      if (featuredOnly && !p.isFeatured) return false;
      if (typeFilter !== "all" && p.propertyType !== typeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.streetAddress.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.mlsNumber.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.listPrice - b.listPrice;
      if (sortBy === "price_desc") return b.listPrice - a.listPrice;
      if (sortBy === "cap_rate") return b.capRate - a.capRate;
      if (sortBy === "newest") return b.yearBuilt - a.yearBuilt;
      return 0;
    });

  const totalValue = PROPERTIES.reduce((s, p) => s + p.currentValue, 0);
  const avgCapRate = (PROPERTIES.reduce((s, p) => s + p.capRate, 0) / PROPERTIES.length).toFixed(1);
  const available = PROPERTIES.filter((p) => p.status === "available").length;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <section className="relative overflow-hidden border-b border-border/40 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-transparent to-[hsl(var(--night-plum)/0.15)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:py-20">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="font-mono text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
              ALLIANCE TRUST REALTY
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              {PROPERTIES.length} ACTIVE LISTINGS
            </Badge>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight lg:text-5xl">
            <span className="text-amber-400">Property</span>
            <span className="text-foreground"> Portfolio</span>
          </h1>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Institutional-grade real estate investment opportunities — each property vetted for cap rate,
            compliance standing, title security, and long-term value appreciation.
          </p>

          {/* Portfolio stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
            {[
              { label: "Total Listings", value: String(PROPERTIES.length), color: "text-foreground" },
              { label: "Available Now", value: String(available), color: "text-emerald-400" },
              { label: "Portfolio Value", value: fmt(totalValue), color: "text-amber-400" },
              { label: "Avg Cap Rate", value: `${avgCapRate}%`, color: "text-cyan-400" },
            ].map((s) => (
              <div key={s.label} className="glass-panel rounded-xl border border-border/40 p-4 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by address, city, MLS…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs bg-card border-border/40 h-9"
              />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none h-9 rounded-lg border border-border/40 bg-card px-3 pr-8 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Types</option>
                {FILTERS.types.slice(1).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-9 rounded-lg border border-border/40 bg-card px-3 pr-8 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="under_contract">Under Contract</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none h-9 rounded-lg border border-border/40 bg-card px-3 pr-8 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="cap_rate">Sort: Cap Rate</option>
                <option value="price_desc">Sort: Price ↓</option>
                <option value="price_asc">Sort: Price ↑</option>
                <option value="newest">Sort: Newest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>

            {/* Featured toggle */}
            <button
              onClick={() => setFeaturedOnly((f) => !f)}
              className={`h-9 px-3 rounded-lg border text-xs font-mono transition-colors ${
                featuredOnly
                  ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                  : "border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-3 w-3 inline mr-1" />
              Featured
            </button>

            <span className="ml-auto text-xs font-mono text-muted-foreground">{filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* ── Property Grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground font-mono text-sm">
            No properties match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const TypeIcon = TYPE_ICONS[p.propertyType] ?? Building2;
              return (
                <Card key={p.id} className="bento-card glass-panel border-border/40 overflow-hidden flex flex-col">
                  {/* Property image placeholder */}
                  <div className="relative h-44 flex items-center justify-center bg-gradient-to-br from-amber-400/5 to-cyan-400/5 border-b border-border/30 text-6xl select-none">
                    {p.emoji}
                    {p.isFeatured && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-mono font-bold text-black">
                        <Star className="h-2.5 w-2.5" /> FEATURED
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold ${STATUS_BADGE[p.status]}`}>
                      {p.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1 gap-3">
                    {/* Type + MLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                        <TypeIcon className="h-3 w-3" />
                        {TYPE_LABELS[p.propertyType]}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60">{p.mlsNumber}</span>
                    </div>

                    {/* Address */}
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-snug">{p.streetAddress}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {p.city}, {p.state} {p.zipCode}
                      </p>
                    </div>

                    {/* Specs row */}
                    {p.bedrooms > 0 && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.bedrooms} bd</span>
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms} ba</span>
                        <span className="flex items-center gap-1"><Square className="h-3 w-3" />{p.squareFeet.toLocaleString()} sqft</span>
                        <span>Built {p.yearBuilt}</span>
                      </div>
                    )}
                    {p.bedrooms === 0 && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Square className="h-3 w-3" />{p.squareFeet.toLocaleString()} sqft</span>
                        <span>Built {p.yearBuilt}</span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-[9px]">{t}</Badge>
                      ))}
                    </div>

                    {/* Financial data */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/30 bg-muted/20 p-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-amber-400">{fmt(p.listPrice)}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">List Price</p>
                      </div>
                      <div className="text-center border-x border-border/30">
                        <p className="text-sm font-bold text-emerald-400">{p.capRate}%</p>
                        <p className="text-[9px] font-mono text-muted-foreground">Cap Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-cyan-400">{fmt(p.estimatedMonthlyRent)}/mo</p>
                        <p className="text-[9px] font-mono text-muted-foreground">Est. Rent</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <Link href="/atr/invest" className="flex-1">
                        <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold">
                          Invest <TrendingUp className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button size="sm" variant="outline" className="text-xs border-border/40">
                          Inquire
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 glass-panel rounded-2xl border border-amber-400/20 p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Looking for Off-Market Opportunities?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Alliance Trust Realty members get first access to pre-market listings, fractional investment
            opportunities, and curated deal flow not available to the public.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/atr#community">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2">
                Join the Network <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/atr/invest">
              <Button variant="outline" className="border-border/60 gap-2">
                Investment Platform <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
