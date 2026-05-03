import Link from 'next/link'
import {
  Zap,
  UserPlus,
  ShieldCheck,
  Key,
  Terminal,
  Clock,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react'

export const metadata = { title: 'Quickstart Guide' }

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Register for a GEM Enterprise account at the client portal. During signup you will provide your organization name, primary contact email, and intended use case. Accounts are provisioned within one business day after identity verification.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Complete KYC Verification',
    description:
      'All API consumers must complete Know Your Customer (KYC) verification before accessing production endpoints. Navigate to your account settings and upload the required documents. Verification typically completes within 2–4 business hours.',
  },
  {
    number: '03',
    icon: Key,
    title: 'Generate an API Key',
    description:
      'Once KYC is approved, visit the Developer Security section at /developers/security. Click "Generate New Key", assign a descriptive label (e.g. "staging-integration"), set the desired permission scopes, and copy the key immediately — it is only shown once.',
  },
  {
    number: '04',
    icon: Terminal,
    title: 'Make Your First API Call',
    description:
      'Use your API key to authenticate requests via the Authorization header. The example below fetches the most recent threat intelligence feed. A 200 response confirms your integration is working.',
  },
]

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Zap className="h-3 w-3" /> Getting Started
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/50">
              <Clock className="h-3 w-3" /> 5 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Quickstart Guide
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            Get from zero to your first authenticated API call in four steps. This guide assumes no prior experience with the GEM Enterprise platform.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="mt-2 h-full w-px bg-white/10" />
                  )}
                </div>
                <div className="pb-8 space-y-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400/70">Step {step.number}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                  <p className="text-white/60 leading-relaxed">{step.description}</p>

                  {/* Step-specific content */}
                  {step.number === '01' && (
                    <div className="mt-3">
                      <Link
                        href="/get-started"
                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Create your account <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {step.number === '02' && (
                    <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 flex gap-3 mt-3">
                      <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-white/70">
                        KYC is required by financial regulation and cannot be waived. If your documents are under review for more than 24 hours, contact{' '}
                        <a href="mailto:compliance@gemcybersecurityassist.com" className="text-amber-400 hover:underline">
                          compliance@gemcybersecurityassist.com
                        </a>.
                      </p>
                    </div>
                  )}

                  {step.number === '03' && (
                    <div className="space-y-3 mt-3">
                      <p className="text-sm text-white/50">Available permission scopes:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          ['threats:read', 'Read threat intelligence feeds'],
                          ['threats:write', 'Submit threat reports'],
                          ['assets:read', 'List protected assets'],
                          ['assets:write', 'Register and modify assets'],
                          ['compliance:read', 'Access compliance reports'],
                          ['admin:*', 'Full administrative access'],
                        ].map(([scope, desc]) => (
                          <div key={scope} className="flex items-start gap-2 rounded-md bg-white/5 px-3 py-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-mono text-xs text-cyan-400">{scope}</span>
                              <p className="text-xs text-white/50">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.number === '04' && (
                    <div className="space-y-6 mt-3">
                      {/* cURL example */}
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-2">cURL</p>
                        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`curl -X GET https://api.gemcybersecurityassist.com/api/threats \\
  -H "Authorization: Bearer gem_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Accept: application/json" \\
  -H "X-Gem-Version: 2024-01"`}
                        </pre>
                      </div>

                      {/* Response example */}
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-2">Response</p>
                        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`{
  "data": [
    {
      "id": "thr_01HXK4M2P9YJZQR8VWNE3FBD7",
      "title": "Credential Stuffing Campaign Targeting FinServ",
      "severity": "critical",
      "category": "credential_attack",
      "first_seen": "2026-04-28T14:22:00Z",
      "last_seen": "2026-05-02T09:45:00Z",
      "confidence": 0.94,
      "ioc_count": 342,
      "sectors": ["financial", "insurance"]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "has_next": false
  }
}`}
                        </pre>
                      </div>

                      {/* TypeScript example */}
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-2">TypeScript (fetch)</p>
                        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`const GEM_API_KEY = process.env.GEM_API_KEY!;
const GEM_BASE_URL = "https://api.gemcybersecurityassist.com";

interface Threat {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  first_seen: string;
  last_seen: string;
  confidence: number;
  ioc_count: number;
  sectors: string[];
}

interface ThreatsResponse {
  data: Threat[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
  };
}

async function fetchThreats(
  severity?: Threat["severity"][]
): Promise<ThreatsResponse> {
  const url = new URL(\`\${GEM_BASE_URL}/api/threats\`);
  if (severity?.length) {
    url.searchParams.set("severity", severity.join(","));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: \`Bearer \${GEM_API_KEY}\`,
      Accept: "application/json",
      "X-Gem-Version": "2024-01",
    },
    // Next.js cache: revalidate every 5 minutes
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(\`GEM API error: \${res.status} \${res.statusText}\`);
  }

  return res.json() as Promise<ThreatsResponse>;
}

// Usage
const threats = await fetchThreats(["critical", "high"]);
console.log(\`Found \${threats.data.length} high-severity threats\`);`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Steps */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <h2 className="text-xl font-semibold">Next Steps</h2>
          <p className="text-white/60">
            You have made your first API call. Here is what to explore next:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Authentication deep-dive', href: '/docs/authentication', desc: 'Session JWTs, API keys, token rotation' },
              { label: 'Security best practices', href: '/docs/security', desc: 'TLS, encryption, key management' },
              { label: 'System architecture', href: '/docs/architecture', desc: 'How GEM Enterprise is built' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all group"
              >
                <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  {item.label} <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="text-xs text-white/50 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
