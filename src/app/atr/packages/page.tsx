import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Leaf,
  FileText,
  Clock,
  Warehouse,
} from "lucide-react";

const funds = [
  {
    id: "myfiv",
    icon: <Building2 className="w-10 h-10 text-emerald-400" />,
    name: "Multifamily Yield Fund IV",
    strategy: "Class-A multifamily acquisitions in high-growth markets across the Sun Belt and Mountain West.",
    targetIRR: "16–19%",
    holdPeriod: "5–7 years",
    minInvestment: "$100,000",
    fundSize: "$250M",
    statusLabel: "Open — Accepting Investors",
    statusClass: "bg-green-100 text-green-800 border-green-200",
    headerBg: "from-emerald-900 to-emerald-700",
    accentColor: "text-emerald-300",
    features: [
      { icon: <Calendar className="w-4 h-4" />, text: "Quarterly distributions" },
      { icon: <FileText className="w-4 h-4" />, text: "SEC-registered fund" },
      { icon: <Leaf className="w-4 h-4" />, text: "ESG-focused strategy" },
    ],
    metrics: [
      { label: "Realized Deals", value: "14" },
      { label: "Avg Hold", value: "5.2 yrs" },
      { label: "Investor Count", value: "340+" },
    ],
  },
  {
    id: "uop",
    icon: <BarChart3 className="w-10 h-10 text-indigo-400" />,
    name: "Urban Office Portfolio",
    strategy: "Premier office assets in Tier-1 urban cores with long-term creditworthy tenants and value-add potential.",
    targetIRR: "12–15%",
    holdPeriod: "7–10 years",
    minInvestment: "$250,000",
    fundSize: "$180M",
    statusLabel: "Limited Availability",
    statusClass: "bg-amber-100 text-amber-800 border-amber-200",
    headerBg: "from-indigo-900 to-indigo-700",
    accentColor: "text-indigo-300",
    features: [
      { icon: <Calendar className="w-4 h-4" />, text: "Annual distributions" },
      { icon: <Building2 className="w-4 h-4" />, text: "Institutional-grade assets" },
      { icon: <FileText className="w-4 h-4" />, text: "Audited financials" },
    ],
    metrics: [
      { label: "Properties", value: "8" },
      { label: "Avg Occupancy", value: "94%" },
      { label: "Investor Count", value: "120+" },
    ],
  },
  {
    id: "ilr",
    icon: <Warehouse className="w-10 h-10 text-slate-400" />,
    name: "Industrial Logistics REIT",
    strategy: "Last-mile logistics and distribution centers serving the e-commerce supply chain in major metro markets.",
    targetIRR: "14–18%",
    holdPeriod: "3–5 years",
    minInvestment: "$50,000",
    fundSize: "$320M",
    statusLabel: "Closed — Waitlist",
    statusClass: "bg-slate-100 text-slate-600 border-slate-200",
    headerBg: "from-slate-800 to-slate-600",
    accentColor: "text-slate-300",
    features: [
      { icon: <Clock className="w-4 h-4" />, text: "Monthly distributions" },
      { icon: <TrendingUp className="w-4 h-4" />, text: "E-commerce driven demand" },
      { icon: <FileText className="w-4 h-4" />, text: "REIT structure" },
    ],
    metrics: [
      { label: "Properties", value: "22" },
      { label: "Avg Lease Term", value: "8.4 yrs" },
      { label: "Investor Count", value: "590+" },
    ],
  },
];

const historicalPerformance = [
  { fund: "Multifamily Yield Fund I", vintage: "2016", irr: "18.4%", equity: "2.1x", status: "Fully Realized" },
  { fund: "Multifamily Yield Fund II", vintage: "2018", irr: "16.9%", equity: "1.9x", status: "Fully Realized" },
  { fund: "Multifamily Yield Fund III", vintage: "2021", irr: "14.2%", equity: "1.6x", status: "Active" },
  { fund: "Urban Office Portfolio", vintage: "2020", irr: "13.1%", equity: "1.4x", status: "Active" },
  { fund: "Industrial Logistics REIT", vintage: "2019", irr: "17.6%", equity: "2.3x", status: "Closed" },
];

export default function PackagesPage() {
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
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">Packages</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Investment Funds
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto">
            Institutional-quality real estate funds structured for qualified investors seeking superior risk-adjusted returns.
          </p>
        </div>
      </section>

      {/* Fund Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          {funds.map((fund, idx) => (
            <Card key={fund.id} className="border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Left: Fund Header */}
                <div className={`lg:col-span-2 bg-gradient-to-br ${fund.headerBg} p-10 text-white flex flex-col justify-between`}>
                  <div>
                    <div className="p-3 bg-white/10 rounded-xl w-fit mb-6">{fund.icon}</div>
                    <p className={`text-xs tracking-widest uppercase font-semibold mb-2 ${fund.accentColor}`}>
                      Fund {idx + 1}
                    </p>
                    <h2
                      className="text-2xl font-bold text-white mb-4 leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {fund.name}
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">{fund.strategy}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${fund.statusClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${fund.statusClass.includes("green") ? "bg-green-500" : fund.statusClass.includes("amber") ? "bg-amber-500" : "bg-slate-400"}`} />
                      {fund.statusLabel}
                    </span>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
                    {fund.metrics.map((m, mi) => (
                      <div key={mi} className="text-center">
                        <p className={`text-lg font-bold ${fund.accentColor}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {m.value}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Fund Details */}
                <CardContent className="lg:col-span-3 p-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                      <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-1">Target IRR</p>
                      <p className="font-bold text-[hsl(222,47%,11%)]">{fund.targetIRR}</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                      <Calendar className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-1">Hold Period</p>
                      <p className="font-bold text-[hsl(222,47%,11%)]">{fund.holdPeriod}</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                      <DollarSign className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-1">Min. Investment</p>
                      <p className="font-bold text-[hsl(222,47%,11%)]">{fund.minInvestment}</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                      <BarChart3 className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-1">Fund Size</p>
                      <p className="font-bold text-[hsl(222,47%,11%)]">{fund.fundSize}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-4">Fund Features</p>
                    <div className="space-y-3">
                      {fund.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-3 text-slate-600 text-sm">
                          <div className="text-amber-500">{feature.icon}</div>
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/atr/invest" className="flex-1">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11">
                        Request Fund Documents <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/atr/qfs" className="flex-1">
                      <Button variant="outline" className="w-full h-11 border-slate-200">
                        View Quick Facts Sheet
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Historical Performance Table */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Track Record</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Historical Fund Performance
            </h2>
            <p className="text-slate-500 mt-4 text-sm">
              Past performance is not indicative of future results. All figures are net of fees.
            </p>
          </div>
          <Card className="border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(222,47%,11%)] text-white">
                    <th className="text-left px-6 py-4 text-sm font-semibold">Fund Name</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Vintage</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Net IRR</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Equity Multiple</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalPerformance.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[hsl(222,47%,11%)]">{row.fund}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">{row.vintage}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-emerald-700">{row.irr}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-[hsl(222,47%,11%)]">{row.equity}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.status === "Fully Realized"
                              ? "bg-green-100 text-green-800"
                              : row.status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(222,47%,11%)] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <FileText className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Request Fund Documents
          </h2>
          <p className="text-slate-300 mb-8">
            Access Private Placement Memoranda, subscription agreements, and audited financials. KYC verification required for all investors.
          </p>
          <Link href="/atr/invest">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 text-base">
              Request Documents <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
