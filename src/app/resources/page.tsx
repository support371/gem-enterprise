import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  FileText,
  Bot,
  Newspaper,
  HelpCircle,
  Download,
  ExternalLink,
  Calendar,
  Tag,
  Zap,
  BarChart3,
  Shield,
  AlertTriangle,
  Lock,
  Globe,
  FileCheck,
  Settings,
} from "lucide-react";

export const metadata: Metadata = { title: "Resources" };

const insights = [
  {
    title: "The State of Enterprise Ransomware Defense: 2026 Threat Landscape Report",
    date: "March 10, 2026",
    category: "Threat Intelligence",
    categoryColor: "text-red-400",
    description:
      "An in-depth analysis of ransomware actor evolution, double-extortion tactics, and the defensive frameworks that are proving most effective against modern ransomware-as-a-service operations targeting enterprise environments.",
    readTime: "12 min read",
  },
  {
    title: "Zero Trust Architecture: Practical Implementation for Mid-Market Enterprises",
    date: "February 24, 2026",
    category: "Architecture",
    categoryColor: "text-blue-400",
    description:
      "Zero trust is no longer aspirational — it is a regulatory and operational imperative. This report provides a phased implementation roadmap tailored to organizations without dedicated security engineering teams.",
    readTime: "9 min read",
  },
  {
    title: "SEC Cybersecurity Disclosure Rules: What CFOs and General Counsel Need to Know",
    date: "February 7, 2026",
    category: "Regulatory",
    categoryColor: "text-yellow-400",
    description:
      "A plain-language breakdown of the SEC's cybersecurity disclosure requirements, incident reporting timelines, and governance attestation obligations for public companies and their advisors.",
    readTime: "7 min read",
  },
  {
    title: "AI-Augmented Threat Detection: Capabilities, Limitations, and Deployment Realities",
    date: "January 18, 2026",
    category: "Technology",
    categoryColor: "text-primary",
    description:
      "As AI tools enter the security operations center, enterprises must understand both the accelerated detection capabilities and the new attack surfaces they introduce. This analysis separates vendor claims from operational realities.",
    readTime: "10 min read",
  },
];

const templates = [
  {
    icon: Shield,
    title: "Enterprise Security Policy Template",
    description:
      "A comprehensive, board-ready information security policy framework covering acceptable use, data classification, incident response, and governance roles.",
    format: "DOCX / PDF",
    version: "v3.2",
  },
  {
    icon: AlertTriangle,
    title: "Incident Response Plan",
    description:
      "A structured incident response playbook with roles, escalation paths, communication templates, and post-incident review procedures aligned to NIST SP 800-61.",
    format: "DOCX / PDF",
    version: "v2.8",
  },
  {
    icon: BarChart3,
    title: "Risk Assessment Framework",
    description:
      "A quantitative and qualitative risk assessment methodology including asset inventory templates, threat modeling worksheets, and risk scoring matrices.",
    format: "XLSX / PDF",
    version: "v4.1",
  },
  {
    icon: FileCheck,
    title: "Vendor Security Assessment Questionnaire",
    description:
      "A 120-question vendor security assessment covering data handling, access controls, incident history, compliance certifications, and business continuity.",
    format: "XLSX / PDF",
    version: "v2.5",
  },
  {
    icon: Lock,
    title: "Data Classification & Handling Guide",
    description:
      "Taxonomy and procedural guidance for classifying organizational data at four sensitivity levels, with corresponding handling, storage, and disposal requirements.",
    format: "DOCX / PDF",
    version: "v1.9",
  },
  {
    icon: Globe,
    title: "Business Continuity Plan Template",
    description:
      "A fully structured BCP template including BIA worksheet, recovery time objectives, alternate site procedures, and stakeholder communication protocols.",
    format: "DOCX / PDF",
    version: "v3.0",
  },
];

const bots = [
  {
    icon: Shield,
    title: "GEM ThreatWatch",
    description:
      "An automated threat intelligence aggregation tool that monitors curated intelligence feeds, extracts indicators of compromise (IOCs), and generates daily digest reports relevant to your industry sector.",
    capabilities: ["IOC Extraction", "Daily Digest Reports", "Sector-Specific Filtering", "MITRE ATT&CK Mapping"],
    status: "Available to Clients",
  },
  {
    icon: FileCheck,
    title: "GEM ComplianceTracker",
    description:
      "A compliance monitoring automation tool that maps organizational controls to applicable regulatory frameworks and alerts when control gaps or framework updates require attention.",
    capabilities: ["Multi-Framework Support", "Control Gap Detection", "Regulatory Change Alerts", "Audit-Ready Reports"],
    status: "Available to Clients",
  },
  {
    icon: Settings,
    title: "GEM VulnScan Orchestrator",
    description:
      "An orchestration layer for automated vulnerability scanning workflows, integrating with leading scanning platforms to schedule, prioritize, and escalate findings based on configurable risk thresholds.",
    capabilities: ["Scanner Integration", "Risk-Based Prioritization", "Automated Escalation", "Trend Analysis"],
    status: "Enterprise Tier",
  },
];

const newsItems = [
  {
    title: "GEM Enterprise Expands Incident Response Capacity with New Regional Rapid-Response Units",
    date: "March 12, 2026",
    source: "GEM Enterprise Press Release",
    description:
      "GEM Enterprise has expanded its incident response infrastructure with the establishment of three new regional IR units, reducing on-site response time for clients across North America.",
  },
  {
    title: "New SEC Cybersecurity Disclosure Rules Take Effect — What Enterprises Must Know",
    date: "March 4, 2026",
    source: "Cybersecurity & Finance Review",
    description:
      "The SEC's enhanced cybersecurity disclosure requirements are now in full effect, requiring material incident disclosure within four business days and annual governance reporting.",
  },
  {
    title: "CISA Issues Advisory on Critical Infrastructure Threat Campaign Targeting Financial Sector",
    date: "February 26, 2026",
    source: "CISA / Industry Briefing",
    description:
      "A coordinated threat campaign targeting financial sector infrastructure has been documented, with CISA issuing guidance on detection signatures and recommended mitigations.",
  },
  {
    title: "GEM Enterprise Publishes Annual Threat Intelligence Summary for Qualified Clients",
    date: "February 14, 2026",
    source: "GEM Enterprise Intelligence",
    description:
      "GEM's annual threat intelligence summary — covering threat actor activity, sector-specific targeting trends, and predictive indicators — is now available to active platform clients.",
  },
  {
    title: "NIST Releases Cybersecurity Framework 2.1 Update with Expanded Supply Chain Guidance",
    date: "January 30, 2026",
    source: "NIST / Standards Update",
    description:
      "NIST has released an update to the Cybersecurity Framework incorporating expanded supply chain risk management guidance and new implementation examples for financial services organizations.",
  },
];

const faqs = [
  {
    question: "Who can access GEM Enterprise resources?",
    answer:
      "Market insights, news, and FAQ content are publicly accessible. Templates and automation tools are available exclusively to active GEM Enterprise clients who have completed onboarding and KYC verification. Some resources are restricted to specific service tiers.",
  },
  {
    question: "How often are market insights and threat reports updated?",
    answer:
      "We publish market insights and threat intelligence reports on a rolling basis — typically two to four per month. Breaking threat advisories are issued on an as-needed basis in response to emerging incidents. Active clients receive email notifications when new intelligence relevant to their sector is published.",
  },
  {
    question: "Are the templates legally reviewed and jurisdiction-specific?",
    answer:
      "Templates are designed as starting frameworks and have been reviewed by GEM's legal and compliance team for general applicability. They are not a substitute for jurisdiction-specific legal counsel. We strongly recommend engaging your legal advisor before deploying any policy or procedural document in your organization.",
  },
  {
    question: "Can I request a custom template or resource for my organization?",
    answer:
      "Active clients may request customized policy templates, assessment frameworks, or procedural guides through their assigned account manager. Custom resource development is available under advisory engagement arrangements. Contact your advisor or reach us at contact@gem-enterprise.com.",
  },
  {
    question: "What intelligence feeds do the GEM automation tools use?",
    answer:
      "GEM's automation tools aggregate intelligence from a combination of commercial threat intelligence platforms, open-source intelligence sources, government advisories (CISA, FBI, sector-specific ISACs), and GEM's proprietary SOC telemetry. Specific feed sources are disclosed to clients under NDA.",
  },
  {
    question: "How do I get access to the GEM ComplianceTracker or other bot tools?",
    answer:
      "Bot tools are available to clients on applicable service tiers. To access these tools, log into the client portal, navigate to Tools & Automation, and follow the activation instructions. If your service tier does not include a specific tool, contact your account manager to discuss an upgrade or add-on arrangement.",
  },
  {
    question: "How does GEM ensure the accuracy of its threat intelligence?",
    answer:
      "GEM's intelligence analysts apply a structured validation methodology to all intelligence outputs, including source reliability assessment, corroboration from independent sources, and adversarial review. We do not publish unverified threat claims. All intelligence reports carry confidence ratings and sourcing disclosures.",
  },
  {
    question: "Are resources available in languages other than English?",
    answer:
      "Currently, all GEM Enterprise resources are published in English. For clients operating in multilingual environments, select resources are available in Spanish and French upon request. We are expanding our multilingual publishing capabilities and expect broader language support in 2026.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Intelligence & Resources
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Intelligence &{" "}
            <span className="text-gradient-primary">Resources</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Threat intelligence, operational templates, automation tools, and industry news —
            curated by GEM Enterprise analysts for the organizations we serve.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "Market Insights", href: "#insights" },
              { label: "Templates", href: "#templates" },
              { label: "Bots", href: "#bots" },
              { label: "News", href: "#news" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors border border-border/50 hover:border-primary/50 px-3 py-1 rounded-full"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Market Insights */}
      <section id="insights" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Market Insights</h2>
              <p className="text-muted-foreground">Analysis and intelligence from the GEM research team</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.title} className="glass-panel bento-card border-border/50 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={`text-xs font-mono font-medium ${insight.categoryColor}`}>
                        {insight.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {insight.date}
                    </div>
                  </div>
                  <CardTitle className="text-base leading-snug">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <CardDescription className="leading-relaxed mb-4">{insight.description}</CardDescription>
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <span className="text-xs text-muted-foreground font-mono">{insight.readTime}</span>
                    <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                      Read Article <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Downloadable Templates</h2>
              <p className="text-muted-foreground">Operational frameworks and policy documents for clients</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.title} className="glass-panel bento-card border-border/50 flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs font-mono mb-1">
                          {template.version}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-mono">{template.format}</p>
                      </div>
                    </div>
                    <CardTitle className="text-sm leading-snug">{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <CardDescription className="text-xs leading-relaxed mb-4">
                      {template.description}
                    </CardDescription>
                    <button className="flex items-center gap-2 text-xs text-primary hover:underline font-medium mt-auto">
                      <Download className="h-3.5 w-3.5" />
                      Download (Client Access Required)
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">
            Templates are available to active GEM Enterprise clients. Log in to the client portal to access downloads.
          </p>
        </div>
      </section>

      {/* Bots */}
      <section id="bots" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Automation Tools</h2>
              <p className="text-muted-foreground">Intelligent automation for security operations</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bots.map((bot) => {
              const Icon = bot.icon;
              return (
                <Card key={bot.title} className="glass-panel bento-card border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant={bot.status === "Enterprise Tier" ? "outline" : "secondary"}
                        className="text-xs font-mono"
                      >
                        {bot.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{bot.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{bot.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
                      Capabilities
                    </p>
                    <ul className="space-y-1.5">
                      {bot.capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                          {cap}
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

      {/* News */}
      <section id="news" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Industry News</h2>
              <p className="text-muted-foreground">Curated cybersecurity and regulatory developments</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="space-y-4">
            {newsItems.map((item) => (
              <Card key={item.title} className="glass-panel bento-card border-border/50">
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-primary">{item.source}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 leading-snug">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium flex-shrink-0">
                      Read More <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="flex items-center gap-4 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Common questions about GEM Enterprise resources</p>
            </div>
          </div>
          <Separator className="mb-12" />
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="glass-panel border border-border/50 rounded-lg px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
