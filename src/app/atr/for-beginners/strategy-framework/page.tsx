"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Shield,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Answers = {
  timeline: string;
  risk: string;
  capital: string;
};

type Track = {
  name: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badgeColor: string;
  description: string;
  vehicles: string[];
  expectedReturn: string;
  liquidity: string;
  minInvestment: string;
};

const timelineOptions = [
  {
    id: "short",
    label: "Short-Term",
    sublabel: "Under 2 years",
    icon: Clock,
  },
  {
    id: "medium",
    label: "Medium-Term",
    sublabel: "2–5 years",
    icon: BarChart3,
  },
  {
    id: "long",
    label: "Long-Term",
    sublabel: "5+ years",
    icon: TrendingUp,
  },
];

const riskOptions = [
  {
    id: "conservative",
    label: "Conservative",
    sublabel: "Preserve capital, steady income",
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "moderate",
    label: "Moderate",
    sublabel: "Balanced growth and income",
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    sublabel: "Maximize growth, accept volatility",
    icon: Zap,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const capitalOptions = [
  {
    id: "starter",
    label: "$25K – $100K",
    sublabel: "Getting started",
  },
  {
    id: "mid",
    label: "$100K – $500K",
    sublabel: "Building momentum",
  },
  {
    id: "high",
    label: "$500K+",
    sublabel: "Institutional scale",
  },
];

const tracks: Record<string, Track> = {
  "Income Focus": {
    name: "Income Focus",
    tagline: "Steady income through quality REITs",
    icon: Shield,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    description:
      "Designed for investors who prioritize capital preservation and reliable income over aggressive growth. This track focuses on established REITs and stabilized income-producing properties with low volatility and consistent distributions.",
    vehicles: [
      "Diversified REIT portfolios",
      "Stabilized multifamily properties",
      "Net-lease commercial assets",
      "Mortgage-backed debt instruments",
    ],
    expectedReturn: "8–12% annually",
    liquidity: "Moderate (quarterly redemptions)",
    minInvestment: "$25,000",
  },
  "Balanced Growth": {
    name: "Balanced Growth",
    tagline: "Mixed residential & commercial for steady appreciation",
    icon: BarChart3,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
    description:
      "The Balanced Growth track blends income-producing properties with value-add opportunities. Investors benefit from a mix of current income and capital appreciation across residential and commercial real estate sectors.",
    vehicles: [
      "Value-add multifamily",
      "Mixed-use commercial/residential",
      "Office and retail repositioning",
      "Opportunistic residential acquisitions",
    ],
    expectedReturn: "14–18% annually",
    liquidity: "Limited (semi-annual redemptions)",
    minInvestment: "$50,000",
  },
  "Growth Maximizer": {
    name: "Growth Maximizer",
    tagline: "Development projects with highest return potential",
    icon: Zap,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description:
      "For sophisticated investors with higher risk tolerance, the Growth Maximizer track targets ground-up development projects and opportunistic acquisitions with the potential for market-beating returns. This track requires longer hold periods and acceptance of higher risk.",
    vehicles: [
      "Ground-up residential development",
      "Commercial development projects",
      "Land acquisition and entitlement",
      "Distressed asset repositioning",
    ],
    expectedReturn: "22–28% annually",
    liquidity: "Illiquid (3–7 year hold)",
    minInvestment: "$100,000",
  },
};

function getRecommendedTrack(answers: Answers): string {
  const riskScore =
    answers.risk === "conservative" ? 0 : answers.risk === "moderate" ? 1 : 2;
  const timelineScore =
    answers.timeline === "short" ? 0 : answers.timeline === "medium" ? 1 : 2;
  const totalScore = riskScore + timelineScore;

  if (totalScore <= 1) return "Income Focus";
  if (totalScore <= 3) return "Balanced Growth";
  return "Growth Maximizer";
}

export default function StrategyFrameworkPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    timeline: "",
    risk: "",
    capital: "",
  });
  const [showResult, setShowResult] = useState(false);

  function selectAnswer(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      setShowResult(true);
    }
  }

  function handleBack() {
    if (showResult) {
      setShowResult(false);
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  }

  function handleReset() {
    setStep(0);
    setAnswers({ timeline: "", risk: "", capital: "" });
    setShowResult(false);
  }

  const canProceed =
    (step === 0 && answers.timeline !== "") ||
    (step === 1 && answers.risk !== "") ||
    (step === 2 && answers.capital !== "");

  const recommendedTrack = getRecommendedTrack(answers);
  const track = tracks[recommendedTrack];
  const TrackIcon = track.icon;

  const steps = [
    { label: "Timeline", key: "timeline" as keyof Answers },
    { label: "Risk Tolerance", key: "risk" as keyof Answers },
    { label: "Capital", key: "capital" as keyof Answers },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[hsl(222,47%,11%)] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            STRATEGY FRAMEWORK
          </p>
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Find Your Investment Track
          </h1>
          <p className="text-slate-300 text-base">
            Answer 3 quick questions and we'll recommend the investment strategy
            best suited to your profile.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {!showResult ? (
          <>
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-10">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center flex-1">
                  <div
                    className={`flex items-center gap-2 flex-1 ${i <= step ? "opacity-100" : "opacity-40"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        i < step
                          ? "bg-amber-500 text-white"
                          : i === step
                            ? "bg-[hsl(222,47%,11%)] text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {i < step ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span
                      className={`text-sm font-medium ${i === step ? "text-slate-900" : "text-slate-400"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight size={16} className="text-slate-300 shrink-0 mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Timeline */}
            {step === 0 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-amber-600" />
                    <h2
                      className="text-2xl font-bold text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      What is your investment timeline?
                    </h2>
                  </div>
                  <p className="text-slate-500 text-sm">
                    How long do you plan to keep your capital invested in real
                    estate?
                  </p>
                </div>
                <div className="grid gap-4">
                  {timelineOptions.map((opt) => {
                    const Ico = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer("timeline", opt.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                          answers.timeline === opt.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            answers.timeline === opt.id
                              ? "bg-amber-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Ico size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {opt.label}
                          </p>
                          <p className="text-sm text-slate-500">{opt.sublabel}</p>
                        </div>
                        {answers.timeline === opt.id && (
                          <CheckCircle
                            size={20}
                            className="text-amber-500 ml-auto shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Risk Tolerance */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={20} className="text-amber-600" />
                    <h2
                      className="text-2xl font-bold text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      What is your risk tolerance?
                    </h2>
                  </div>
                  <p className="text-slate-500 text-sm">
                    How comfortable are you with potential fluctuations in your
                    investment value?
                  </p>
                </div>
                <div className="grid gap-4">
                  {riskOptions.map((opt) => {
                    const Ico = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer("risk", opt.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                          answers.risk === opt.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            answers.risk === opt.id
                              ? "bg-amber-500 text-white"
                              : `${opt.bg} ${opt.color}`
                          }`}
                        >
                          <Ico size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {opt.label}
                          </p>
                          <p className="text-sm text-slate-500">{opt.sublabel}</p>
                        </div>
                        {answers.risk === opt.id && (
                          <CheckCircle
                            size={20}
                            className="text-amber-500 ml-auto shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Capital */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-amber-600" />
                    <h2
                      className="text-2xl font-bold text-slate-900"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      How much capital are you deploying?
                    </h2>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Select the range that best describes your initial investment
                    capacity.
                  </p>
                </div>
                <div className="grid gap-4">
                  {capitalOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer("capital", opt.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                        answers.capital === opt.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          answers.capital === opt.id
                            ? "bg-amber-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {opt.label}
                        </p>
                        <p className="text-sm text-slate-500">{opt.sublabel}</p>
                      </div>
                      {answers.capital === opt.id && (
                        <CheckCircle
                          size={20}
                          className="text-amber-500 ml-auto shrink-0"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
                className="border-slate-200"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,16%)] text-white"
              >
                {step < 2 ? "Continue" : "See My Recommendation"}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </>
        ) : (
          /* Result */
          <div>
            <div className="text-center mb-8">
              <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-2">
                YOUR RECOMMENDED TRACK
              </p>
              <h2
                className="text-3xl font-bold text-slate-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Based on your answers, we recommend:
              </h2>
            </div>

            <Card
              className={`border-2 ${track.border} shadow-lg`}
            >
              <CardHeader className={`${track.bg} rounded-t-lg`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <TrackIcon size={28} className={track.color} />
                  </div>
                  <div>
                    <Badge className={`${track.badgeColor} mb-1 text-xs`}>
                      RECOMMENDED FOR YOU
                    </Badge>
                    <CardTitle
                      className={`text-2xl ${track.color}`}
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {track.name}
                    </CardTitle>
                    <p className="text-slate-600 text-sm mt-0.5">
                      {track.tagline}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 text-sm leading-relaxed mb-6">
                  {track.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Expected Return
                    </p>
                    <p className="font-bold text-slate-900 text-sm">
                      {track.expectedReturn}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Liquidity
                    </p>
                    <p className="font-bold text-slate-900 text-sm">
                      {track.liquidity}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Min Investment
                    </p>
                    <p className="font-bold text-slate-900 text-sm">
                      {track.minInvestment}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
                    Investment Vehicles
                  </p>
                  <ul className="space-y-2">
                    {track.vehicles.map((v) => (
                      <li key={v} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,16%)] text-white"
                    asChild
                  >
                    <Link href="/atr/invest">
                      Start Investing
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-200"
                    onClick={handleReset}
                  >
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700"
                asChild
              >
                <Link href="/atr/for-beginners">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Beginner Guide
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
