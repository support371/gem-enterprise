"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FacebookDashboardProps {
  workspaceId: string;
  connectorId?: string;
}

interface MetaConnector {
  id: string;
  workspaceId: string;
  provider: "META";
  state: string;
  displayName: string;
  externalAccountId: string | null;
  grantedScopes: string[];
  safeMetadata: Record<string, unknown>;
  lastHealthAt: string | null;
  disabledAt: string | null;
}

interface ConnectorInventoryResponse {
  ok: boolean;
  connectors?: MetaConnector[];
  error?: { message?: string };
}

export function FacebookDashboard({ workspaceId, connectorId }: FacebookDashboardProps) {
  const [connectors, setConnectors] = useState<MetaConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConnectors() {
      if (!workspaceId) {
        setConnectors([]);
        setError("A workspace is required to manage Facebook Pages.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/social-media/connectors?workspaceId=${encodeURIComponent(workspaceId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as ConnectorInventoryResponse;
        if (!response.ok || !data.ok) {
          throw new Error(data.error?.message || "Failed to fetch connector status");
        }

        const metaConnectors = (data.connectors || []).filter(
          (connector) =>
            connector.provider === "META" &&
            !connector.disabledAt &&
            (!connectorId || connector.id === connectorId),
        );
        if (!cancelled) {
          setConnectors(metaConnectors);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "An error occurred");
          setConnectors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadConnectors();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, connectorId]);

  function handleConnectFacebook() {
    if (!workspaceId) {
      setError("A workspace is required to connect Meta Business.");
      return;
    }
    const redirectAfter = `/facebook/operations?workspace=${encodeURIComponent(workspaceId)}`;
    const params = new URLSearchParams({ workspaceId, redirectAfter });
    window.location.assign(`/api/social-media/oauth/META/start?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-gray-600">Loading Facebook Operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Facebook Operations</h1>
          <p className="mt-1 text-gray-600">
            Manage approved Facebook Page content through the shared Social Media Command Center.
          </p>
        </div>
        <Button onClick={handleConnectFacebook} disabled={!workspaceId}>
          Connect another Page
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {connectors.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="text-lg font-semibold">No Facebook Page connected</div>
              <p className="text-gray-600">
                Connect Meta Business to discover every authorized Facebook Page and linked Instagram professional account.
              </p>
              <Button onClick={handleConnectFacebook} size="lg" disabled={!workspaceId}>
                Connect Meta Business
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {connectors.map((connector) => (
            <Card key={connector.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {connector.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600">Page ID</p>
                    <p className="font-mono text-sm font-semibold">
                      {connector.externalAccountId || "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connector state</p>
                    <Badge variant="outline" className="mt-1">
                      {connector.state}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last health check</p>
                    <p className="text-sm font-semibold">
                      {connector.lastHealthAt
                        ? new Date(connector.lastHealthAt).toLocaleString()
                        : "Not checked"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-600">Granted permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {connector.grantedScopes.length > 0 ? (
                      connector.grantedScopes.map((scope) => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="destructive">No scopes recorded</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        Content Calendar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-gray-600">Create and schedule exact-version content.</p>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={`/facebook/content?workspace=${encodeURIComponent(workspaceId)}&connector=${encodeURIComponent(connector.id)}`}
                        >
                          View Calendar
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertCircle className="h-4 w-4" />
                        Approval Queue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-gray-600">Review policy, brand, and factual checks.</p>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={`/facebook/approvals?workspace=${encodeURIComponent(workspaceId)}&connector=${encodeURIComponent(connector.id)}`}
                        >
                          View Queue
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-gray-600">Monitor authorized Page performance.</p>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={`/facebook/analytics?workspace=${encodeURIComponent(workspaceId)}&connector=${encodeURIComponent(connector.id)}`}
                        >
                          View Analytics
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">Governed publishing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          Every external write remains blocked unless connector health, required scopes, compliance review,
          exact-version approval, idempotency, emergency locks, and both global and provider live gates pass.
        </CardContent>
      </Card>
    </div>
  );
}
