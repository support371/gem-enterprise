import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Building2,
  Warehouse,
  BookOpen,
  Mail,
  ArrowRight,
  Shield,
} from "lucide-react";

const qfsCards = [
  {
    id: "myfiv",
    icon: <Building2 className="w-8 h-8 text-emerald-500" />,
    name: "Multifamily Yield Fund IV",
    accentColor: "border-l-emerald-500",
    statusLabel: "Open",
    statusClass: "bg-green-100 text-green-800",
    metrics: [
      { label: "Target IRR", value: "16–19%" },
      { label: "Hold Period", value: "5–7 years" },
      { label: "Min. Investment", value: "$100,000" },
      { label: "Fund Size", value: "$250M" },
      { label: "Distributions", value: "Quarterly" },
      { label: "Structure", value: "SEC-Registered LP" },
    ],
  },
  {
    id: "uop",
    icon: <BarChart3 className="w-8 h-8 text-indigo-500" />,
    name: "Urban Office Portfolio",
    accentColor: "border-l-indigo-500",
    statusLabel: "Limited",
    statusClass: "bg-amber-100 text-amber-800",
    metrics: [
      { label: "Target IRR", value: "12–15%" },
      { label: "Hold Period", value: "7–10 years" },
      { label: "Min. Investment", value: "$250,000" },
      { label: "Fund Size", value: "$180M" },
      { label: "Distributions", value: "Annual" },
      { label: "Structure", value: "Private Equity Fund" },
    ],
  },
  {
    id: "ilr",
    icon: <Warehouse className="w-8 h-8 text-slate-500" />,
    name: "Industrial Logistics REIT",
    accentColor: "border-l-slate-400",
    statusLabel: "Waitlist",
    statusClass: "bg-slate-100 text-slate-600",
    metrics: [
      { label: "Target IRR", value: "14–18%" },
      { label: "Hold Period", value: "3–5 years" },
      { label: "Min. Investment", value: "$50,000" },
      { label: "Fund Size", value: "$320M" },
      { label: "Distributions", value: "Monthly" },
      { label: "Structure", value: "Non-Traded REIT" },
    ],
  },
];

const documentLibrary = [
  {
    icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    title: "Annual Report 2024",
    description: "Full-year financial results, portfolio highlights, and investor communications for fiscal year 2024.",
    type: "PDF",
    size: "4.2 MB",
  },
  {
    icon: <Mail className="w-5 h-5 text-amber-600" />,
    title: "Q4 2024 Investor Letter",
    description: "Quarterly performance update, market commentary, and outlook from the ATR Chief Investment Officer.",
    type: "PDF",
    size: "1.8 MB",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
    title: "Market Outlook 2025",
    description: "ATR's proprietary analysis of real estate macro trends, sector opportunities, and risk factors for 2025.",
    type: "PDF",
    size: "3.1 MB",
  },
  {
    icon: <Shield className="w-5 h-5 text-amber-600" />,
    title: "Compliance & Regulatory Summary",
    description: "Overview of ATR's regulatory framework, SEC registration status, and investor protection protocols.",
    type: "PDF",
    size: "2.4 MB",
  },
];

export default function QFSPage() {
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
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">QFS</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quick Facts Sheets
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            Access detailed fund summaries, performance data, and due diligence materials for all ATR investment vehicles.
          </p>
        </div>
      </section>

      {/* Compliance Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            <strong>Notice:</strong> All documents are for qualified investors only. KYC verification required prior to downloading or receiving fund materials. Unauthorized distribution is prohibited.
          </p>
        </div>
      </div>

      {/* QFS Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Fund Summaries</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Fund Quick Facts
            </h2>
          </div>

          <div className="space-y-8">
            {qfsCards.map((card) => (
              <Card
                key={card.id}
                className={`border border-slate-200 border-l-4 ${card.accentColor} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-4">
                    {/* Fund Identity */}
                    <div className="lg:col-span-1 p-8 bg-[#f8fafc] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="mb-4">{card.icon}</div>
                        <h3
                          className="text-xl font-bold text-[hsl(222,47%,11%)] mb-3 leading-snug"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {card.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${card.statusClass}`}>
                          {card.statusLabel}
                        </span>
                      </div>
                      <div className="mt-6 space-y-2">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-10 text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button variant="outline" className="w-full h-10 text-sm border-slate-200">
                          <FileText className="w-4 h-4 mr-2" />
                          Request Full PPM
                        </Button>
                      </div>
                    </div>

                    {/* Metrics Table */}
                    <div className="lg:col-span-3 p-8">
                      <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-5">Key Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {card.metrics.map((metric, mi) => (
                          <div key={mi} className="bg-white border border-slate-100 rounded-lg p-4">
                            <p className="text-slate-500 text-xs mb-1.5 font-medium">{metric.label}</p>
                            <p className="font-bold text-[hsl(222,47%,11%)] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                              {metric.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 p-4 bg-[#f8fafc] rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">
                          All projected returns are forward-looking statements. Past performance does not guarantee future results.
                          Fund documents available upon completion of investor qualification and KYC verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Document Library */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Resources</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Document Library
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Investor reports, market research, and compliance documents for qualified ATR investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentLibrary.map((doc, idx) => (
              <Card key={idx} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg shrink-0">{doc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3
                          className="font-bold text-[hsl(222,47%,11%)] text-lg leading-snug"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-slate-400">{doc.size}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">{doc.description}</p>
                      <Button size="sm" className="bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,18%)] text-white text-xs h-9 px-4">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* KYC CTA */}
      <section className="bg-[hsl(222,47%,11%)] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Complete Your KYC Verification
          </h2>
          <p className="text-slate-300 mb-8">
            Access all fund materials, full PPMs, and investment documents by completing your investor qualification. Takes less than 10 minutes.
          </p>
          <Link href="/atr/invest">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 text-base">
              Start KYC Verification <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
