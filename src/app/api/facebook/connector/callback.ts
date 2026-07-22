/**
 * Facebook OAuth Callback Handler
 * Exchanges authorization code for access tokens and stores them encrypted
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

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');
    const errorDescription = request.nextUrl.searchParams.get('error_description');

    // Handle Facebook errors
    if (error) {
      console.error('Facebook OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=${error}&description=${errorDescription}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=MISSING_PARAMS`
      );
    }

    // Verify state token
    const { data: stateRecord, error: stateError } = await supabase
      .from('facebook_oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !stateRecord) {
      console.error('Invalid state token');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=INVALID_STATE`
      );
    }

    // Check if state has expired
    if (new Date(stateRecord.expires_at) < new Date()) {
      console.error('State token expired');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=STATE_EXPIRED`
      );
    }

    const workspaceId = stateRecord.workspace_id;

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).then(res => res.json()).catch(err => {
      throw new Error(`Failed to exchange code: ${err.message}`);
    });

    // Build proper token exchange URL
    const tokenUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.append('client_id', META_APP_ID || '');
    tokenUrl.searchParams.append('client_secret', META_APP_SECRET || '');
    tokenUrl.searchParams.append('redirect_uri', META_REDIRECT_URI);
    tokenUrl.searchParams.append('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=TOKEN_EXCHANGE_FAILED`
      );
    }

    const userAccessToken = tokenData.access_token;
    const tokenExpiresIn = tokenData.expires_in || 5184000; // 60 days default

    // Get user's pages
    const pagesUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/me/accounts`);
    pagesUrl.searchParams.append('access_token', userAccessToken);
    pagesUrl.searchParams.append('fields', 'id,name,access_token,category');

    const pagesRes = await fetch(pagesUrl.toString());
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No pages found');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=NO_PAGES_FOUND`
      );
    }

    // Use the first page (or you could let user select)
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    const pageName = page.name;

    // Get business portfolio info
    const businessUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/me/businesses`);
    businessUrl.searchParams.append('access_token', userAccessToken);
    businessUrl.searchParams.append('fields', 'id,name');

    const businessRes = await fetch(businessUrl.toString());
    const businessData = await businessRes.json();

    const business = businessData.data?.[0] || { id: 'default', name: 'Default Portfolio' };

    // Encrypt tokens
    const encryptedUserToken = encryptToken(userAccessToken);
    const encryptedPageToken = encryptToken(pageAccessToken);

    // Store connector in database
    const { data: connector, error: connectorError } = await supabase
      .from('meta_connectors')
      .upsert(
        {
          workspace_id: workspaceId,
          business_portfolio_id: business.id,
          business_portfolio_name: business.name,
          page_id: pageId,
          page_name: pageName,
          page_type: page.category || 'BUSINESS',
          user_access_token_encrypted: encryptedUserToken,
          page_access_token_encrypted: encryptedPageToken,
          granted_permissions: [
            'pages_manage_posts',
            'pages_read_engagement',
            'pages_manage_metadata',
            'pages_read_user_content'
          ],
          token_expires_at: new Date(Date.now() + tokenExpiresIn * 1000),
          status: 'ACTIVE',
          last_verified_at: new Date(),
          created_by: 'system'
        },
        { onConflict: 'workspace_id' }
      )
      .select()
      .single();

    if (connectorError) {
      console.error('Failed to store connector:', connectorError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=STORAGE_FAILED`
      );
    }

    // Delete used state token
    await supabase.from('facebook_oauth_states').delete().eq('state', state);

    // Log audit event
    await supabase.from('facebook_audit_logs').insert({
      workspace_id: workspaceId,
      action_type: 'CONNECTOR_AUTHORIZED',
      resource_type: 'CONNECTOR',
      resource_id: connector.id,
      actor_email: 'system@facebook-oauth',
      details: {
        pageId,
        pageName,
        businessPortfolioId: business.id
      }
    });

    // Redirect to success page with connector info
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations`);
    successUrl.searchParams.append('connected', 'true');
    successUrl.searchParams.append('connectorId', connector.id);
    successUrl.searchParams.append('pageName', pageName);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/facebook/operations?error=CALLBACK_ERROR&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
  }
}

function encryptToken(token: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits)');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptToken(encryptedToken: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
