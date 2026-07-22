'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface FacebookDashboardProps {
  workspaceId: string;
  connectorId?: string;
}

export function FacebookDashboard({ workspaceId, connectorId }: FacebookDashboardProps) {
  const [connectorStatus, setConnectorStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectorStatus();
  }, [workspaceId, connectorId]);

  const fetchConnectorStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/facebook/connector/status?workspaceId=${workspaceId}${connectorId ? `&connectorId=${connectorId}` : ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch connector status');
      }

      const data = await response.json();
      setConnectorStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setConnectorStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectFacebook = async () => {
    try {
      const response = await fetch('/api/facebook/connector/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate authorization');
      }

      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Facebook Operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facebook Operations</h1>
          <p className="text-gray-600 mt-1">Manage your Facebook Page content and publishing</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      {connectorStatus?.status === 'NOT_CONNECTED' ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">No Facebook Page Connected</div>
              <p className="text-gray-600">
                Connect your Facebook Page to start managing content and publishing posts automatically.
              </p>
              <Button onClick={handleConnectFacebook} size="lg">
                Connect Facebook Page
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Connection Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Connected Facebook Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Page Name</p>
                  <p className="font-semibold">{connectorStatus?.connector?.pageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Page ID</p>
                  <p className="font-semibold font-mono text-sm">{connectorStatus?.connector?.pageId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="outline" className="mt-1">
                    {connectorStatus?.connector?.status || 'ACTIVE'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Token Status</p>
                  {connectorStatus?.connector?.isTokenExpired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50">
                      Valid
                    </Badge>
                  )}
                </div>
              </div>

              {connectorStatus?.connector?.grantedPermissions && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Granted Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {connectorStatus.connector.grantedPermissions.map((perm: string) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Content Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">View and manage your 30-day content calendar</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/facebook/content?workspace=${connectorStatus?.connector?.id}`}>
                    View Calendar
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Review and approve pending posts</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/facebook/approvals?workspace=${connectorStatus?.connector?.id}`}>
                    View Queue
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Monitor post performance and engagement</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/facebook/analytics?workspace=${connectorStatus?.connector?.id}`}>
                    View Analytics
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Supervised Launch (Days 1-30)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            All posts require manual approval before publishing. This ensures brand safety and compliance during the initial launch phase.
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-base">Controlled Automation (Day 31+)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            Low-risk content automatically publishes based on your schedule. High-risk content still requires approval.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
