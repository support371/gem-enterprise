'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Terminal,
  Play,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronRight,
  Code2,
  Shield,
  Database,
  Users,
  BarChart3,
  Webhook,
  Key,
  Globe,
  FileJson,
  Send,
} from 'lucide-react'

const apiEndpoints = [
  {
    category: 'Threat Intelligence',
    icon: Shield,
    color: 'text-red-400',
    endpoints: [
      { method: 'GET', path: '/v1/threats', description: 'List all threats', auth: true },
      { method: 'GET', path: '/v1/threats/{id}', description: 'Get threat by ID', auth: true },
      { method: 'POST', path: '/v1/threats/search', description: 'Search threats with filters', auth: true },
      { method: 'GET', path: '/v1/threats/feed', description: 'Get real-time threat feed', auth: true },
      { method: 'GET', path: '/v1/iocs', description: 'List indicators of compromise', auth: true },
    ],
  },
  {
    category: 'Asset Management',
    icon: Database,
    color: 'text-blue-400',
    endpoints: [
      { method: 'GET', path: '/v1/assets', description: 'List protected assets', auth: true },
      { method: 'POST', path: '/v1/assets', description: 'Register new asset', auth: true },
      { method: 'GET', path: '/v1/assets/{id}', description: 'Get asset details', auth: true },
      { method: 'PATCH', path: '/v1/assets/{id}', description: 'Update asset', auth: true },
      { method: 'DELETE', path: '/v1/assets/{id}', description: 'Remove asset', auth: true },
      { method: 'GET', path: '/v1/assets/{id}/events', description: 'Get asset events', auth: true },
    ],
  },
  {
    category: 'Identity & Access',
    icon: Users,
    color: 'text-purple-400',
    endpoints: [
      { method: 'GET', path: '/v1/users', description: 'List users', auth: true },
      { method: 'POST', path: '/v1/users', description: 'Create user', auth: true },
      { method: 'GET', path: '/v1/users/{id}', description: 'Get user details', auth: true },
      { method: 'GET', path: '/v1/roles', description: 'List roles', auth: true },
      { method: 'POST', path: '/v1/permissions/check', description: 'Check permissions', auth: true },
    ],
  },
  {
    category: 'Analytics',
    icon: BarChart3,
    color: 'text-amber-400',
    endpoints: [
      { method: 'GET', path: '/v1/analytics/overview', description: 'Get analytics overview', auth: true },
      { method: 'POST', path: '/v1/analytics/query', description: 'Run custom query', auth: true },
      { method: 'GET', path: '/v1/reports', description: 'List reports', auth: true },
      { method: 'POST', path: '/v1/reports/generate', description: 'Generate report', auth: true },
    ],
  },
  {
    category: 'Webhooks',
    icon: Webhook,
    color: 'text-cyan-400',
    endpoints: [
      { method: 'GET', path: '/v1/webhooks', description: 'List webhook subscriptions', auth: true },
      { method: 'POST', path: '/v1/webhooks', description: 'Create webhook', auth: true },
      { method: 'DELETE', path: '/v1/webhooks/{id}', description: 'Delete webhook', auth: true },
      { method: 'POST', path: '/v1/webhooks/{id}/test', description: 'Test webhook delivery', auth: true },
    ],
  },
]

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PATCH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const sampleResponse = {
  success: true,
  data: {
    threats: [
      {
        id: 'thr_1a2b3c4d',
        title: 'APT29 Phishing Campaign',
        severity: 'critical',
        sector: 'financial',
        first_seen: '2026-04-15T08:30:00Z',
        iocs: ['185.234.72.14', 'malware.example.com'],
      },
      {
        id: 'thr_5e6f7g8h',
        title: 'Ransomware Variant Detection',
        severity: 'high',
        sector: 'healthcare',
        first_seen: '2026-04-14T14:22:00Z',
        iocs: ['45.67.89.12'],
      },
    ],
  },
  meta: {
    page: 1,
    per_page: 25,
    total: 156,
    request_id: 'req_9i0j1k2l',
  },
}

export default function APIExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<{ method: string; path: string } | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<object | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const handleTryRequest = () => {
    setIsLoading(true)
    setResponse(null)
    
    // Simulate API call
    setTimeout(() => {
      setResponse(sampleResponse)
      setResponseTime(Math.floor(Math.random() * 200) + 80)
      setIsLoading(false)
    }, 800)
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-12 cyber-grid overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-6 w-6" />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase">
              Interactive
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            API <span className="text-gradient-primary">Explorer</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Test GEM Enterprise API endpoints directly in your browser. Explore request/response
            formats and integrate faster.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-panel border-border/50 sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Endpoints</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    {apiEndpoints.reduce((acc, cat) => acc + cat.endpoints.length, 0)} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" defaultValue={['Threat Intelligence']} className="w-full">
                  {apiEndpoints.map((category) => {
                    const Icon = category.icon
                    return (
                      <AccordionItem key={category.category} value={category.category} className="border-border/30">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${category.color}`} />
                            <span>{category.category}</span>
                            <Badge variant="secondary" className="ml-auto mr-2 font-mono text-xs">
                              {category.endpoints.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <div className="space-y-1 px-2 pb-2">
                            {category.endpoints.map((endpoint) => (
                              <button
                                key={endpoint.path}
                                onClick={() => setSelectedEndpoint(endpoint)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                                  selectedEndpoint?.path === endpoint.path
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover:bg-muted/50'
                                }`}
                              >
                                <Badge className={`font-mono text-[10px] px-1.5 ${methodColors[endpoint.method]}`}>
                                  {endpoint.method}
                                </Badge>
                                <span className="font-mono text-muted-foreground truncate">{endpoint.path}</span>
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Request/Response Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Endpoint */}
            {selectedEndpoint ? (
              <>
                <Card className="glass-panel border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`font-mono text-xs ${methodColors[selectedEndpoint.method]}`}>
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{selectedEndpoint.path}</code>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Key className="h-3 w-3 mr-1" />
                        Requires Auth
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* API Key */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                        API Key
                      </Label>
                      <Input
                        type="password"
                        placeholder="gem_live_sk_..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono text-sm bg-card/80 border-border/50"
                      />
                    </div>

                    {/* Base URL */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                        Base URL
                      </Label>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="production">
                          <SelectTrigger className="w-40 bg-card/80 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value="https://api.gemcybersecurityassist.com"
                          readOnly
                          className="font-mono text-sm bg-muted/30 border-border/50"
                        />
                      </div>
                    </div>

                    {/* Request Body (for POST/PATCH) */}
                    {['POST', 'PATCH', 'PUT'].includes(selectedEndpoint.method) && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                          Request Body (JSON)
                        </Label>
                        <Textarea
                          placeholder='{"key": "value"}'
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          className="font-mono text-sm bg-card/80 border-border/50 min-h-[120px]"
                        />
                      </div>
                    )}

                    {/* Try Request Button */}
                    <Button
                      onClick={handleTryRequest}
                      disabled={isLoading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Try Request
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Response */}
                {response && (
                  <Card className="glass-panel border-border/50 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            200 OK
                          </Badge>
                          {responseTime && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {responseTime}ms
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyResponse}>
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-card/60 p-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-foreground">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              /* No Endpoint Selected */
              <Card className="glass-panel border-border/50">
                <CardContent className="py-16 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-muted/30">
                      <Code2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select an Endpoint</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Choose an API endpoint from the sidebar to explore its parameters,
                    try requests, and view sample responses.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="glass-panel border-border/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <FileJson className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">OpenAPI Spec</p>
                      <p className="text-xs text-muted-foreground">Download the full API specification</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-panel border-border/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Postman Collection</p>
                      <p className="text-xs text-muted-foreground">Import into Postman or Insomnia</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help */}
            <Card className="glass-panel border-border/50">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm mb-1">Need Help?</p>
                    <p className="text-xs text-muted-foreground">
                      Read the full documentation or contact developer support.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/docs">View Docs</Link>
                    </Button>
                    <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/developers">
                        Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
