"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Star,
  Zap,
  CheckCircle,
  ArrowRight,
  Users,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tiers = [
  {
    name: "Partner Tier",
    commission: "1.0%",
    icon: Award,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    features: [
      "1.0% commission on referred investments",
      "Basic marketing kit",
      "Monthly performance reports",
      "Partner portal access",
      "Email support",
    ],
  },
  {
    name: "Elite Tier",
    commission: "1.5%",
    icon: Star,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    featured: true,
    features: [
      "1.5% commission on referred investments",
      "Dedicated account manager",
      "Weekly performance reports",
      "Co-marketing opportunities",
      "Priority phone & email support",
    ],
  },
  {
    name: "Premier Tier",
    commission: "2.0%",
    icon: Zap,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    features: [
      "2.0% commission on referred investments",
      "Co-branded marketing materials",
      "Real-time analytics dashboard",
      "Priority support & SLA guarantee",
      "Quarterly strategy sessions",
    ],
  },
];

const steps = [
  {
    step: "01",
    title: "Apply",
    description:
      "Complete the affiliate application form below. Our team reviews all applications within 2 business days.",
  },
  {
    step: "02",
    title: "Get Approved",
    description:
      "Once approved, you'll receive your unique referral link, marketing assets, and portal access.",
  },
  {
    step: "03",
    title: "Start Earning",
    description:
      "Share your link with your network. Earn commissions on every successful investment referral.",
  },
];

const volumeOptions = [
  "Less than 5 referrals/month",
  "5–20 referrals/month",
  "20–50 referrals/month",
  "50–100 referrals/month",
  "100+ referrals/month",
];

export default function AffiliatePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    volume: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[hsl(222,47%,11%)] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            PARTNER WITH US
          </p>
          <h1
            className="text-5xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Affiliate Program
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Earn industry-leading commissions by referring investors to Alliance
            Trust Realty. Choose the tier that fits your network and grow your
            revenue alongside ours.
          </p>
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">2.0%</p>
              <p className="text-slate-400 text-sm mt-1">Max Commission</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">500+</p>
              <p className="text-slate-400 text-sm mt-1">Active Affiliates</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">$4.2M+</p>
              <p className="text-slate-400 text-sm mt-1">Commissions Paid</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              COMMISSION TIERS
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Choose Your Partnership Level
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`relative border-2 ${tier.border} ${tier.featured ? "shadow-xl scale-105" : "shadow-sm"}`}
                >
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-indigo-600 text-white px-4 py-1 text-xs tracking-wide">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`${tier.bg} rounded-t-lg pb-6`}>
                    <div className={`${tier.color} mb-3`}>
                      <Icon size={28} />
                    </div>
                    <CardTitle
                      className="text-xl text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {tier.name}
                    </CardTitle>
                    <p className={`text-4xl font-bold ${tier.color} mt-2`}>
                      {tier.commission}
                    </p>
                    <p className="text-slate-500 text-sm">per referred investment</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle
                            size={16}
                            className="text-emerald-500 mt-0.5 shrink-0"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              PROCESS
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[hsl(222,47%,11%)] text-white flex items-center justify-center text-xl font-bold mb-4">
                  {s.step}
                </div>
                <h3
                  className="text-lg font-semibold text-slate-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {s.description}
                </p>
                {i < steps.length - 1 && (
                  <ChevronRight
                    size={24}
                    className="text-slate-300 mt-6 hidden md:block absolute"
                    style={{ transform: "translateX(140px)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              GET STARTED
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Apply to Become an Affiliate
            </h2>
            <p className="text-slate-500 mt-3 text-sm">
              Fill out the form below and our partnerships team will be in touch
              within 2 business days.
            </p>
          </div>

          {submitted ? (
            <Card className="border-emerald-200 bg-emerald-50 text-center py-12">
              <CardContent>
                <CheckCircle
                  size={48}
                  className="text-emerald-500 mx-auto mb-4"
                />
                <h3
                  className="text-2xl font-bold text-slate-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Application Received!
                </h3>
                <p className="text-slate-600 text-sm">
                  Thank you, {form.name}. We'll review your application and
                  contact you at {form.email} within 2 business days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border border-slate-200">
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                        Full Name
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        required
                        className="border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                        Email Address
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@example.com"
                        required
                        className="border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                        Company
                      </label>
                      <Input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Acme Advisors LLC"
                        className="border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                        Website
                      </label>
                      <Input
                        name="website"
                        type="url"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://yoursite.com"
                        className="border-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-amber-600 text-xs tracking-widest uppercase font-semibold block mb-1.5">
                      Expected Referral Volume
                    </label>
                    <select
                      name="volume"
                      value={form.volume}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Select monthly volume...</option>
                      {volumeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,16%)] text-white"
                  >
                    Submit Application
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-[hsl(222,47%,11%)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Users size={40} className="text-amber-400 mx-auto mb-4" />
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Questions About the Program?
          </h2>
          <p className="text-slate-300 mb-8">
            Our partnerships team is available to answer any questions and help
            you choose the right tier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900"
              asChild
            >
              <Link href="/atr">
                <TrendingUp size={16} className="mr-2" />
                Back to ATR
              </Link>
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <FileText size={16} className="mr-2" />
              Download Program Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
