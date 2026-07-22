/**
 * Meta Account Verification Endpoint
 * Verifies Meta business account and page connection status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

const META_API_VERSION = 'v18.0';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const pageId = request.nextUrl.searchParams.get('pageId');

    if (!workspaceId || !pageId) {
      return NextResponse.json(
        { error: 'Missing workspaceId or pageId' },
        { status: 400 }
      );
    }

    // Check if connector exists for this workspace
    const { data: connector, error: connectorError } = await supabase
      .from('meta_connectors')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('page_id', pageId)
      .single();

    if (connectorError && connectorError.code !== 'PGRST116') {
      throw connectorError;
    }

    if (!connector) {
      return NextResponse.json({
        status: 'NOT_CONNECTED',
        message: 'Meta account not connected for this page',
        pageId,
        connectorStatus: 'MISSING',
        verificationSteps: [
          'Create Meta App at developers.facebook.com',
          'Configure OAuth redirect URI',
          'Generate encryption key',
          'Set environment variables',
          'Deploy database migrations',
          'Click "Connect Facebook Page" button',
          'Authorize with Facebook'
        ]
      });
    }

    // Verify connector is still active
    const isExpired = new Date(connector.token_expires_at) < new Date();

    return NextResponse.json({
      status: connector.emergency_locked ? 'LOCKED' : 'CONNECTED',
      message: connector.emergency_locked 
        ? 'Publishing is emergency locked' 
        : 'Meta account successfully connected',
      connector: {
        id: connector.id,
        pageId: connector.page_id,
        pageName: connector.page_name,
        pageType: connector.page_type,
        businessPortfolioId: connector.business_portfolio_id,
        businessPortfolioName: connector.business_portfolio_name,
        status: connector.status,
        emergencyLocked: connector.emergency_locked,
        tokenExpired: isExpired,
        tokenExpiresAt: connector.token_expires_at,
        grantedPermissions: connector.granted_permissions,
        lastVerifiedAt: connector.last_verified_at,
        createdAt: connector.created_at
      },
      verification: {
        tokenValid: !isExpired,
        pageConnected: true,
        permissionsGranted: connector.granted_permissions?.length > 0,
        readyToPublish: !connector.emergency_locked && !isExpired
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, action } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId' },
        { status: 400 }
      );
    }

    if (action === 'test-connection') {
      // Test the connector by fetching page info
      const { data: connector, error: connectorError } = await supabase
        .from('meta_connectors')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single();

      if (connectorError || !connector) {
        return NextResponse.json({
          status: 'FAILED',
          message: 'No connector found',
          error: 'Connector not configured'
        });
      }

      // Decrypt token and test API call
      const pageAccessToken = decryptToken(connector.page_access_token_encrypted);
      const pageId = connector.page_id;

      try {
        const url = new URL(`https://graph.facebook.com/${META_API_VERSION}/${pageId}`);
        url.searchParams.append('fields', 'id,name,category,followers_count');
        url.searchParams.append('access_token', pageAccessToken);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({
            status: 'FAILED',
            message: 'Token test failed',
            error: data.error.message,
            errorCode: data.error.code
          });
        }

        return NextResponse.json({
          status: 'SUCCESS',
          message: 'Connection test passed',
          pageInfo: {
            id: data.id,
            name: data.name,
            category: data.category,
            followersCount: data.followers_count
          }
        });
      } catch (error) {
        return NextResponse.json({
          status: 'FAILED',
          message: 'Connection test error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (action === 'refresh-token') {
      // Refresh the access token
      const { data: connector, error: connectorError } = await supabase
        .from('meta_connectors')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single();

      if (connectorError || !connector) {
        return NextResponse.json({
          status: 'FAILED',
          message: 'No connector found'
        });
      }

      // Note: Long-lived tokens don't need refresh
      // If token expires, user needs to reconnect via OAuth
      return NextResponse.json({
        status: 'INFO',
        message: 'Long-lived tokens do not require manual refresh',
        tokenExpiresAt: connector.token_expires_at,
        action: 'If token expires, reconnect via OAuth'
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verification POST error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function decryptToken(encryptedToken: string): string {
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
