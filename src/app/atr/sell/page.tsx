"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  BarChart3,
  Handshake,
  CheckCircle,
  TrendingUp,
  Target,
  Users,
  HeadphonesIcon,
  ArrowRight,
  Building2,
  Calendar,
  DollarSign,
  Star,
  Send,
} from "lucide-react";

const sellSteps = [
  {
    icon: <BarChart3 className="w-8 h-8 text-amber-600" />,
    step: "01",
    title: "Valuation",
    description:
      "Our certified appraisers deliver a comprehensive market valuation report using comparable sales, income analysis, and current demand trends.",
  },
  {
    icon: <ClipboardList className="w-8 h-8 text-amber-600" />,
    step: "02",
    title: "List",
    description:
      "We create a professional property package — including photography, financial models, and targeted outreach to our qualified buyer network.",
  },
  {
    icon: <Handshake className="w-8 h-8 text-amber-600" />,
    step: "03",
    title: "Close",
    description:
      "ATR manages every aspect of negotiation, due diligence coordination, and closing to maximize your net proceeds and minimize friction.",
  },
];

const benefits = [
  {
    icon: <Star className="w-6 h-6 text-amber-600" />,
    title: "Expert Valuation",
    description: "Our appraisers have 20+ years of commercial and residential market experience to price your property precisely.",
  },
  {
    icon: <Target className="w-6 h-6 text-amber-600" />,
    title: "Targeted Marketing",
    description: "We promote your listing to pre-vetted investor networks, institutional buyers, and high-net-worth individuals.",
  },
  {
    icon: <Users className="w-6 h-6 text-amber-600" />,
    title: "Qualified Buyers",
    description: "Every buyer in our network is KYC-verified and financially pre-qualified — no time wasters, only serious offers.",
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6 text-amber-600" />,
    title: "Full Support",
    description: "From listing to closing, you have a dedicated ATR advisor handling every detail so you can focus on what's next.",
  },
];

interface FormState {
  address: string;
  propertyType: string;
  askingPrice: string;
  squareFootage: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const initialForm: FormState = {
  address: "",
  propertyType: "Residential",
  askingPrice: "",
  squareFootage: "",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

export default function SellPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

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
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">Sell</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Sell With Confidence
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Partner with ATR to achieve the best possible outcome for your commercial or residential property sale.
          </p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="bg-[#f8fafc] py-20 px-6 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">The Process</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              From Listing to Closing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sellSteps.map((step, idx) => (
              <Card key={idx} className="border border-slate-200 bg-white p-8 text-center hover:shadow-md transition-shadow">
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
            ))}
          </div>
        </div>
      </section>

      {/* Market Analysis Stats */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Market Data</p>
            <h2
              className="text-3xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ATR Market Analysis
            </h2>
          </div>
          <Card className="border border-slate-200 bg-[hsl(222,47%,11%)] text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold">Avg Days on Market</p>
                  </div>
                  <p
                    className="text-6xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    28
                  </p>
                  <p className="text-slate-400 text-sm">Days to close on average</p>
                </div>
                <div className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold">Avg Sale Price</p>
                  </div>
                  <p
                    className="text-6xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    $1.4M
                  </p>
                  <p className="text-slate-400 text-sm">Across all property types</p>
                </div>
                <div className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold">Success Rate</p>
                  </div>
                  <p
                    className="text-6xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    94%
                  </p>
                  <p className="text-slate-400 text-sm">Properties sold at or above ask</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Listing Submission Form */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Get Started</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Submit Your Listing
            </h2>
            <p className="text-slate-500 mt-4">
              Complete the form below and an ATR advisor will contact you within one business day.
            </p>
          </div>

          {submitted ? (
            <Card className="border border-green-200 bg-green-50 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3
                className="text-3xl font-bold text-[hsl(222,47%,11%)] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Listing Submitted!
              </h3>
              <p className="text-slate-600 mb-6 text-lg">
                Thank you, <strong>{form.contactName}</strong>. An ATR advisor will reach out to{" "}
                <strong>{form.contactEmail}</strong> within one business day to schedule your valuation.
              </p>
              <Button
                onClick={() => { setSubmitted(false); setForm(initialForm); }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                Submit Another Listing
              </Button>
            </Card>
          ) : (
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                      Property Address
                    </label>
                    <Input
                      placeholder="123 Main St, City, State ZIP"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                        Property Type
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-[hsl(222,47%,11%)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={form.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value)}
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Mixed-Use">Mixed-Use</option>
                        <option value="Industrial">Industrial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                        Asking Price
                      </label>
                      <Input
                        placeholder="e.g. $1,250,000"
                        value={form.askingPrice}
                        onChange={(e) => handleChange("askingPrice", e.target.value)}
                        required
                        className="border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                      Square Footage
                    </label>
                    <Input
                      placeholder="e.g. 12,500 sqft or 24 units"
                      value={form.squareFootage}
                      onChange={(e) => handleChange("squareFootage", e.target.value)}
                      className="border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-2">
                      Property Description
                    </label>
                    <textarea
                      placeholder="Describe your property, key features, current occupancy, income history, etc."
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[hsl(222,47%,11%)] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-4">
                      Contact Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-slate-600 text-xs font-semibold block mb-2">Full Name</label>
                        <Input
                          placeholder="Your full name"
                          value={form.contactName}
                          onChange={(e) => handleChange("contactName", e.target.value)}
                          required
                          className="border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs font-semibold block mb-2">Email Address</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={form.contactEmail}
                          onChange={(e) => handleChange("contactEmail", e.target.value)}
                          required
                          className="border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-slate-600 text-xs font-semibold block mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        className="border-slate-200"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-base font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Submit Listing
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Why Sell With ATR */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Advantages</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Why Sell With ATR
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border border-slate-200 bg-[#f8fafc] p-6 hover:shadow-md transition-shadow text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3
                  className="text-lg font-bold text-[hsl(222,47%,11%)] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {benefit.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(222,47%,11%)] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <Building2 className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Browse Active Listings
          </h2>
          <p className="text-slate-300 mb-8">
            See the properties ATR currently has on the market — and discover the caliber of buyers we attract.
          </p>
          <Link href="/atr/properties">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 text-base">
              View All Properties <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
