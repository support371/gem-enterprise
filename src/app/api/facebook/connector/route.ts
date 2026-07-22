/**
 * Facebook Connector API Routes
 * Handles Meta OAuth, page discovery, and connection management
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/connector/callback`;
const META_API_VERSION = 'v18.0';

/**
 * GET /api/facebook/connector/status
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const { data: connector } = await supabase
      .from('meta_connectors')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    if (!connector) {
      return NextResponse.json({
        status: 'NOT_CONNECTED',
        connector: null
      });
    }

    const isExpired = connector.token_expires_at && new Date(connector.token_expires_at) < new Date();

    return NextResponse.json({
      status: connector.status,
      connector: {
        id: connector.id,
        businessPortfolioId: connector.business_portfolio_id,
        businessPortfolioName: connector.business_portfolio_name,
        pageId: connector.page_id,
        pageName: connector.page_name,
        pageType: connector.page_type,
        grantedPermissions: connector.granted_permissions,
        tokenExpiresAt: connector.token_expires_at,
        isTokenExpired: isExpired,
        lastVerifiedAt: connector.last_verified_at,
        emergencyLocked: connector.emergency_locked
      }
    });
  } catch (error) {
    console.error('Connector status error:', error);
    return NextResponse.json(
      { error: 'Failed to get connector status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/connector/authorize
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (!META_APP_ID) {
      return NextResponse.json(
        { error: 'Meta App ID not configured' },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(32).toString('hex');

    const stateData = {
      state,
      workspace_id: workspaceId,
      user_id: 'system',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    };

    await supabase
      .from('facebook_oauth_states')
      .insert([stateData]);

    const params = new URLSearchParams({
      client_id: META_APP_ID,
      redirect_uri: META_REDIRECT_URI,
      state,
      scope: 'pages_manage_posts,pages_read_engagement,pages_manage_metadata,pages_read_user_content',
      response_type: 'code'
    });

    const authUrl = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;

    return NextResponse.json({
      authUrl,
      state
    });
  } catch (error) {
    console.error('Authorization initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authorization' },
      { status: 500 }
    );
  }
}

function encryptToken(token: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}
