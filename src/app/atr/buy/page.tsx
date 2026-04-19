"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Square,
  DollarSign,
  Search,
  Building2,
  Home,
  Factory,
  Layers,
  CheckCircle,
  ClipboardList,
  Key,
  ArrowRight,
} from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Riverfront Commercial Tower",
    type: "Commercial",
    price: "$2,400,000",
    sqft: "18,500 sqft",
    location: "Miami, FL",
    features: ["Class A Office Space", "River Views", "Parking Structure", "LEED Certified"],
  },
  {
    id: 2,
    name: "Oakwood Multifamily Complex",
    type: "Residential",
    price: "$1,800,000",
    sqft: "24 units",
    location: "Austin, TX",
    features: ["Full Occupancy", "Pool & Gym", "EV Charging", "On-Site Management"],
  },
  {
    id: 3,
    name: "Tech Park Office Suite",
    type: "Commercial",
    price: "$950,000",
    sqft: "8,200 sqft",
    location: "Denver, CO",
    features: ["Open Floor Plan", "Fiber Internet", "Rooftop Terrace", "Transit Access"],
  },
  {
    id: 4,
    name: "Harbor Industrial Unit",
    type: "Industrial",
    price: "$680,000",
    sqft: "12,000 sqft",
    location: "Houston, TX",
    features: ["Loading Docks", "32' Clear Height", "Rail Access", "Secured Yard"],
  },
  {
    id: 5,
    name: "Downtown Mixed-Use Center",
    type: "Mixed-Use",
    price: "$3,100,000",
    sqft: "32,000 sqft",
    location: "Chicago, IL",
    features: ["Retail Ground Floor", "Residential Upper", "Corner Location", "High Traffic"],
  },
  {
    id: 6,
    name: "Sunrise Residential Portfolio",
    type: "Residential",
    price: "$1,200,000",
    sqft: "16 units",
    location: "Phoenix, AZ",
    features: ["Turnkey Portfolio", "Strong Cash Flow", "Recent Renovations", "Low Vacancy"],
  },
];

const typeBadgeColors: Record<string, string> = {
  Commercial: "bg-blue-100 text-blue-800 border-blue-200",
  Residential: "bg-green-100 text-green-800 border-green-200",
  Industrial: "bg-orange-100 text-orange-800 border-orange-200",
  "Mixed-Use": "bg-purple-100 text-purple-800 border-purple-200",
};

const typeIcons: Record<string, React.ReactNode> = {
  Commercial: <Building2 className="w-4 h-4" />,
  Residential: <Home className="w-4 h-4" />,
  Industrial: <Factory className="w-4 h-4" />,
  "Mixed-Use": <Layers className="w-4 h-4" />,
};

const howToBuySteps = [
  {
    icon: <Search className="w-8 h-8 text-amber-600" />,
    step: "01",
    title: "Research",
    description:
      "Browse our curated listings, filter by type, location, and budget. Our team provides market analysis and investment projections for every property.",
  },
  {
    icon: <ClipboardList className="w-8 h-8 text-amber-600" />,
    step: "02",
    title: "Due Diligence",
    description:
      "Review financials, environmental reports, title history, and zoning. ATR coordinates all third-party inspections and legal reviews on your behalf.",
  },
  {
    icon: <Key className="w-8 h-8 text-amber-600" />,
    step: "03",
    title: "Close",
    description:
      "Execute with confidence. Our closing team handles title transfer, escrow coordination, and post-acquisition onboarding for a seamless experience.",
  },
];

export default function BuyPage() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [priceRange, setPriceRange] = useState("Any");

  const filteredProperties = properties.filter((p) => {
    const matchesLocation =
      location === "" || p.location.toLowerCase().includes(location.toLowerCase()) || p.name.toLowerCase().includes(location.toLowerCase());
    const matchesType = propertyType === "All" || p.type === propertyType;
    return matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-white text-[hsl(222,47%,11%)]">
      {/* Hero */}
      <section className="relative bg-[hsl(222,47%,11%)] py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">Buy</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Find Your Investment Property
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Access exclusive commercial, residential, and industrial properties curated for serious investors.
          </p>
        </div>
      </section>

      {/* Search Filters */}
      <section className="bg-[#f8fafc] border-b border-slate-200 py-8 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                Location or Property Name
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="City, state, or property name..."
                  className="pl-10 bg-white border-slate-200"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-52">
              <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                Property Type
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-[hsl(222,47%,11%)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed-Use">Mixed-Use</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                Price Range
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-[hsl(222,47%,11%)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="Any">Any Price</option>
                <option value="under1m">Under $1M</option>
                <option value="1m-2m">$1M – $2M</option>
                <option value="2m-5m">$2M – $5M</option>
                <option value="over5m">Over $5M</option>
              </select>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white h-10 px-6 shrink-0">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Property Listings */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Available Properties
            </h2>
            <p className="text-slate-500 text-sm">{filteredProperties.length} properties found</p>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">No properties match your search. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="border border-slate-200 hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden"
                >
                  <div className="h-3 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle
                        className="text-lg font-semibold text-[hsl(222,47%,11%)] leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {property.name}
                      </CardTitle>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${typeBadgeColors[property.type]}`}
                      >
                        {typeIcons[property.type]}
                        {property.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-amber-700 font-bold text-lg">
                        <DollarSign className="w-4 h-4" />
                        {property.price}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Square className="w-3.5 h-3.5" />
                        {property.sqft}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.location}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {property.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600 text-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,18%)] text-white text-xs">
                        Request Showing
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-200 text-xs">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Buy */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Process</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              How to Buy
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              From discovery to closing, ATR's expert team guides you through every step of your acquisition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howToBuySteps.map((step, idx) => (
              <div key={idx} className="relative">
                {idx < howToBuySteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-amber-300 to-transparent z-0" />
                )}
                <Card className="relative z-10 border border-slate-200 bg-white p-8 text-center hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mx-auto mb-4">
                    {step.icon}
                  </div>
                  <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">Step {step.step}</p>
                  <h3
                    className="text-xl font-bold text-[hsl(222,47%,11%)] mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/atr/invest">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 h-12">
                Start Your Search <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
