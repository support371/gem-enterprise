/**
 * Meta Permissions Verifier Component
 * Displays required permissions and verification status
 */

'use client';

import { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Permission {
  name: string;
  description: string;
  required: boolean;
  granted?: boolean;
}

const REQUIRED_PERMISSIONS: Permission[] = [
  {
    name: 'pages_manage_posts',
    description: 'Ability to publish posts to your page',
    required: true
  },
  {
    name: 'pages_read_engagement',
    description: 'Ability to read engagement metrics (likes, comments, shares)',
    required: true
  },
  {
    name: 'pages_manage_metadata',
    description: 'Ability to manage page settings and metadata',
    required: true
  },
  {
    name: 'pages_read_user_content',
    description: 'Ability to read user-generated content on your page',
    required: false
  },
  {
    name: 'instagram_basic',
    description: 'Ability to manage Instagram content (optional)',
    required: false
  }
];

export default function PermissionsVerifier() {
  const [permissions, setPermissions] = useState<Permission[]>(REQUIRED_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [connectorStatus, setConnectorStatus] = useState<'checking' | 'connected' | 'not-connected' | 'error'>('checking');
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    verifyPermissions();
  }, []);

  const verifyPermissions = async () => {
    try {
      setLoading(true);
      
      // Get workspace ID from localStorage or URL
      const workspaceId = localStorage.getItem('workspaceId') || 'default';
      const pageId = '61571065706716';

      const response = await fetch(
        `/api/facebook/verify?workspaceId=${workspaceId}&pageId=${pageId}`
      );
      const data = await response.json();

      if (data.status === 'CONNECTED') {
        setConnectorStatus('connected');
        setVerificationMessage('✅ Meta account successfully connected');
        
        // Update permissions based on response
        const grantedPerms = data.connector?.grantedPermissions || [];
        const updatedPermissions = permissions.map(perm => ({
          ...perm,
          granted: grantedPerms.includes(perm.name)
        }));
        setPermissions(updatedPermissions);
      } else if (data.status === 'NOT_CONNECTED') {
        setConnectorStatus('not-connected');
        setVerificationMessage('⚠️ Meta account not yet connected. Click "Connect" to authorize.');
      } else if (data.status === 'LOCKED') {
        setConnectorStatus('error');
        setVerificationMessage('🔒 Publishing is emergency locked. Contact administrator.');
      } else {
        setConnectorStatus('error');
        setVerificationMessage(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setConnectorStatus('error');
      setVerificationMessage(`Error verifying permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    const workspaceId = localStorage.getItem('workspaceId') || 'default';
    const redirectUri = `${window.location.origin}/api/facebook/connector/callback`;
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '';
    
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.append('client_id', appId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', REQUIRED_PERMISSIONS.map(p => p.name).join(','));
    authUrl.searchParams.append('state', workspaceId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('display', 'popup');

    window.location.href = authUrl.toString();
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const workspaceId = localStorage.getItem('workspaceId') || 'default';

      const response = await fetch('/api/facebook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          action: 'test-connection'
        })
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setVerificationMessage(`✅ Connection test passed! Page: ${data.pageInfo.name}`);
        verifyPermissions();
      } else {
        setVerificationMessage(`❌ Connection test failed: ${data.error}`);
      }
    } catch (error) {
      setVerificationMessage(`Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const allRequiredGranted = permissions
    .filter(p => p.required)
    .every(p => p.granted);

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      <Alert className={
        connectorStatus === 'connected' 
          ? 'border-green-200 bg-green-50' 
          : connectorStatus === 'not-connected'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-red-200 bg-red-50'
      }>
        <AlertCircle className={
          connectorStatus === 'connected'
            ? 'text-green-600'
            : connectorStatus === 'not-connected'
            ? 'text-yellow-600'
            : 'text-red-600'
        } />
        <AlertDescription className={
          connectorStatus === 'connected'
            ? 'text-green-800'
            : connectorStatus === 'not-connected'
            ? 'text-yellow-800'
            : 'text-red-800'
        }>
          {verificationMessage}
        </AlertDescription>
      </Alert>

      {/* Permissions Card */}
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
            Required Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.map((permission) => (
            <div key={permission.name} className="flex items-start gap-3 pb-3 border-b last:border-0">
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
                <p className="font-medium text-sm">
                  {permission.name}
                  {permission.required && <span className="text-red-600 ml-1">*</span>}
                </p>
                <p className="text-sm text-gray-600">{permission.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {connectorStatus === 'not-connected' ? (
          <Button 
            onClick={handleConnect}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Facebook Page'
            )}
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleTestConnection}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button 
              onClick={verifyPermissions}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Refresh Status'
              )}
            </Button>
          </>
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Page ID:</strong> 61571065706716
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>Status:</strong> {connectorStatus === 'connected' ? '✅ Connected' : '⏳ Pending'}
          </p>
          <p className="text-sm text-blue-900 mt-2">
            All required permissions must be granted to enable automated publishing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
