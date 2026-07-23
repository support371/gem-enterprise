"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Permission {
  name: string;
  description: string;
  required: boolean;
}

interface MetaConnector {
  id: string;
  provider: "META";
  state: string;
  displayName: string;
  externalAccountId: string | null;
  grantedScopes: string[];
  safeMetadata: Record<string, unknown>;
  disabledAt: string | null;
}

interface ConnectorInventoryResponse {
  ok: boolean;
  connectors?: MetaConnector[];
  error?: { message?: string };
}

const FACEBOOK_PERMISSIONS: Permission[] = [
  {
    name: "pages_manage_posts",
    description: "Publish approved content to the selected Facebook Page.",
    required: true,
  },
  {
    name: "pages_read_engagement",
    description: "Read Page engagement data for approved analytics workflows.",
    required: true,
  },
  {
    name: "pages_show_list",
    description: "Discover every Facebook Page the operator can manage.",
    required: true,
  },
];

const INSTAGRAM_PERMISSIONS: Permission[] = [
  {
    name: "instagram_basic",
    description: "Identify the selected Instagram professional account.",
    required: true,
  },
  {
    name: "instagram_content_publish",
    description: "Publish approved media to the selected professional account.",
    required: true,
  },
];

function workspaceFromBrowser() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("workspace")?.trim() ||
    params.get("workspaceId")?.trim() ||
    localStorage.getItem("workspaceId")?.trim() ||
    ""
  );
}

function connectorFromBrowser() {
  return new URLSearchParams(window.location.search).get("connector")?.trim() || "";
}

export default function PermissionsVerifier() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [connectors, setConnectors] = useState<MetaConnector[]>([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadConnectors = useCallback(async () => {
    const resolvedWorkspaceId = workspaceFromBrowser();
    setWorkspaceId(resolvedWorkspaceId);
    if (!resolvedWorkspaceId) {
      setConnectors([]);
      setSelectedConnectorId("");
      setVerificationMessage("A workspace is required to verify Meta permissions.");
      setError("Open Facebook Operations from a workspace-scoped command center.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/social-media/connectors?workspaceId=${encodeURIComponent(resolvedWorkspaceId)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as ConnectorInventoryResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "Unable to load Meta connectors.");
      }

      const metaConnectors = (data.connectors || []).filter(
        (connector) => connector.provider === "META" && !connector.disabledAt,
      );
      const explicitConnectorId = connectorFromBrowser();
      setConnectors(metaConnectors);
      setSelectedConnectorId((current) => {
        if (current && metaConnectors.some((connector) => connector.id === current)) {
          return current;
        }
        return metaConnectors.some((connector) => connector.id === explicitConnectorId)
          ? explicitConnectorId
          : "";
      });
      setVerificationMessage(
        metaConnectors.length === 0
          ? "No authorized Meta destination is connected."
          : "Select an authorized Page or Instagram professional account to verify its scopes.",
      );
      setError(null);
    } catch (caught) {
      setConnectors([]);
      setSelectedConnectorId("");
      setVerificationMessage("Meta connector verification could not be completed.");
      setError(caught instanceof Error ? caught.message : "Unexpected verification error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnectors();
  }, [loadConnectors]);

  const selectedConnector = useMemo(
    () => connectors.find((connector) => connector.id === selectedConnectorId),
    [connectors, selectedConnectorId],
  );
  const accountType =
    typeof selectedConnector?.safeMetadata.accountType === "string"
      ? selectedConnector.safeMetadata.accountType
      : "";
  const permissions =
    accountType === "INSTAGRAM_PROFESSIONAL"
      ? [...FACEBOOK_PERMISSIONS, ...INSTAGRAM_PERMISSIONS]
      : FACEBOOK_PERMISSIONS;
  const granted = useMemo(
    () => new Set(selectedConnector?.grantedScopes || []),
    [selectedConnector],
  );
  const allRequiredGranted =
    Boolean(selectedConnector) &&
    selectedConnector?.state === "CONNECTED" &&
    permissions
      .filter((permission) => permission.required)
      .every((permission) => granted.has(permission.name));

  function handleConnect() {
    if (!workspaceId) {
      setError("A workspace is required before Meta authorization can begin.");
      return;
    }
    const redirectAfter = `/facebook/operations?workspace=${encodeURIComponent(workspaceId)}`;
    const params = new URLSearchParams({ workspaceId, redirectAfter });
    window.location.assign(`/api/social-media/oauth/META/start?${params.toString()}`);
  }

  async function handleTestConnection() {
    if (!workspaceId || !selectedConnector) {
      setError("Select an explicit Meta destination before running a health check.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/social-media/connectors/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          connectorId: selectedConnector.id,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        connector?: { state?: string };
        error?: { message?: string };
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "Connector health check failed.");
      }
      setVerificationMessage(
        `Credential health checked. Connector state: ${data.connector?.state || "UNKNOWN"}.`,
      );
      await loadConnectors();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Connector health check failed.");
    } finally {
      setLoading(false);
    }
  }

  const alertClass = error
    ? "border-red-200 bg-red-50"
    : allRequiredGranted
      ? "border-green-200 bg-green-50"
      : "border-yellow-200 bg-yellow-50";
  const alertTextClass = error
    ? "text-red-800"
    : allRequiredGranted
      ? "text-green-800"
      : "text-yellow-800";

  return (
    <div className="space-y-6">
      <Alert className={alertClass}>
        <AlertCircle className={alertTextClass} />
        <AlertDescription className={alertTextClass}>
          {error || verificationMessage}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Authorized Meta destination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor="meta-destination" className="text-sm font-medium">
            Select the Page or professional account to verify
          </label>
          <select
            id="meta-destination"
            value={selectedConnectorId}
            onChange={(event) => {
              setSelectedConnectorId(event.target.value);
              setError(null);
            }}
            disabled={loading || connectors.length === 0}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Choose a destination</option>
            {connectors.map((connector) => (
              <option key={connector.id} value={connector.id}>
                {connector.displayName} — {connector.state}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            The system never selects the first discovered account automatically.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : allRequiredGranted ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            Required permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.map((permission) => {
            const isGranted = granted.has(permission.name);
            return (
              <div
                key={permission.name}
                className="flex items-start gap-3 border-b pb-3 last:border-0"
              >
                <div className="mt-1">
                  {isGranted ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{permission.name}</p>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleConnect} disabled={loading || !workspaceId}>
          Connect another Meta destination
        </Button>
        <Button
          onClick={() => void handleTestConnection()}
          disabled={loading || !selectedConnector}
          variant="outline"
        >
          {loading ? "Checking..." : "Run credential health check"}
        </Button>
        <Button onClick={() => void loadConnectors()} disabled={loading} variant="outline">
          Refresh inventory
        </Button>
      </div>

      {selectedConnector && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="space-y-2 pt-6 text-sm text-blue-900">
            <p>
              <strong>Destination:</strong> {selectedConnector.displayName}
            </p>
            <p>
              <strong>External account ID:</strong>{" "}
              {selectedConnector.externalAccountId || "Unavailable"}
            </p>
            <p>
              <strong>Connector state:</strong> {selectedConnector.state}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
