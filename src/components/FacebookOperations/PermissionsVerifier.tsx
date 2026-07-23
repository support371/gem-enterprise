'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Permission {
  name: string;
  description: string;
  required: boolean;
  granted?: boolean;
}

const REQUIRED_PERMISSIONS: Permission[] = [
  {
    name: 'pages_manage_posts',
    description: 'Publish approved content to an explicitly selected Facebook Page.',
    required: true,
  },
  {
    name: 'pages_read_engagement',
    description: 'Read Page engagement data for approved analytics workflows.',
    required: true,
  },
  {
    name: 'pages_show_list',
    description: 'Discover every Facebook Page the operator can manage.',
    required: true,
  },
  {
    name: 'instagram_basic',
    description: 'Discover linked Instagram professional accounts.',
    required: false,
  },
  {
    name: 'instagram_content_publish',
    description: 'Publish approved media to a selected Instagram professional account.',
    required: false,
  },
];

type ConnectorStatus = 'checking' | 'connected' | 'not-connected' | 'error';

export default function PermissionsVerifier() {
  const [permissions, setPermissions] = useState<Permission[]>(REQUIRED_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus>('checking');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [connectorId, setConnectorId] = useState<string | null>(null);

  const verifyPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const workspaceId = localStorage.getItem('workspaceId')?.trim();
      if (!workspaceId) {
        setConnectorStatus('not-connected');
        setVerificationMessage('Select a workspace before connecting Meta.');
        setConnectorId(null);
        return;
      }

      const response = await fetch(
        `/api/facebook/verify?workspaceId=${encodeURIComponent(workspaceId)}`,
        { cache: 'no-store' },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Unable to verify Meta connector.');
      }

      if (data.status === 'CONNECTED') {
        const grantedScopes: string[] = Array.isArray(data.connector?.grantedScopes)
          ? data.connector.grantedScopes
          : [];
        setConnectorId(data.connector?.id || null);
        setConnectorStatus('connected');
        setVerificationMessage('Meta account is connected to the shared provider hub.');
        setPermissions((current) =>
          current.map((permission) => ({
            ...permission,
            granted: grantedScopes.includes(permission.name),
          })),
        );
      } else if (data.status === 'NOT_CONNECTED') {
        setConnectorId(null);
        setConnectorStatus('not-connected');
        setVerificationMessage('Meta is not connected for this workspace.');
      } else {
        setConnectorId(data.connector?.id || null);
        setConnectorStatus('error');
        setVerificationMessage(
          `Meta connector requires attention: ${String(data.status || 'unknown state')}.`,
        );
      }
    } catch (error) {
      setConnectorStatus('error');
      setVerificationMessage(
        `Unable to verify Meta permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void verifyPermissions();
  }, [verifyPermissions]);

  const handleConnect = () => {
    const workspaceId = localStorage.getItem('workspaceId')?.trim();
    if (!workspaceId) {
      setConnectorStatus('error');
      setVerificationMessage('Select a workspace before connecting Meta.');
      return;
    }
    const params = new URLSearchParams({
      workspaceId,
      returnTo: '/app/command-center/tokmetric',
    });
    window.location.assign(`/api/social-media/oauth/META/start?${params.toString()}`);
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const workspaceId = localStorage.getItem('workspaceId')?.trim();
      if (!workspaceId || !connectorId) {
        throw new Error('Select a connected Meta destination first.');
      }
      const response = await fetch('/api/social-media/connectors/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, connectorId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Connector health check failed.');
      }
      setVerificationMessage('Meta connector health check passed.');
      await verifyPermissions();
    } catch (error) {
      setConnectorStatus('error');
      setVerificationMessage(
        `Connection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const allRequiredGranted = permissions
    .filter((permission) => permission.required)
    .every((permission) => permission.granted);

  const alertClass =
    connectorStatus === 'connected'
      ? 'border-green-200 bg-green-50'
      : connectorStatus === 'not-connected'
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-red-200 bg-red-50';
  const alertTextClass =
    connectorStatus === 'connected'
      ? 'text-green-800'
      : connectorStatus === 'not-connected'
        ? 'text-yellow-800'
        : 'text-red-800';

  return (
    <div className="space-y-6">
      <Alert className={alertClass}>
        <AlertCircle className={alertTextClass} />
        <AlertDescription className={alertTextClass}>
          {verificationMessage}
        </AlertDescription>
      </Alert>

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
            Meta permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.map((permission) => (
            <div
              key={permission.name}
              className="flex items-start gap-3 border-b pb-3 last:border-0"
            >
              <div className="mt-1">
                {permission.granted ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : permission.required ? (
                  <X className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {permission.name}
                  {permission.required && <span className="ml-1 text-red-600">*</span>}
                </p>
                <p className="text-sm text-gray-600">{permission.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {connectorStatus === 'not-connected' ? (
          <Button onClick={handleConnect} disabled={loading}>
            Connect Meta
          </Button>
        ) : (
          <>
            <Button onClick={handleTestConnection} disabled={loading || !connectorId} variant="outline">
              Test connection
            </Button>
            <Button onClick={() => void verifyPermissions()} disabled={loading} variant="outline">
              Refresh status
            </Button>
          </>
        )}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6 text-sm text-blue-900">
          Meta authorization is stored in the shared connector lifecycle. Publishing remains disabled until content, compliance, human approval, workspace locks, scopes, and both live gates pass.
        </CardContent>
      </Card>
    </div>
  );
}
