/**
 * Facebook Analytics Sync Worker
 * Fetches engagement metrics from Meta Graph API and stores in Supabase
 * Runs daily at 8 AM via cron job
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

const META_API_VERSION = 'v18.0';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active connectors
    const { data: connectors, error: connectorsError } = await supabase
      .from('meta_connectors')
      .select('*')
      .eq('status', 'ACTIVE');

    if (connectorsError) {
      throw connectorsError;
    }

    if (!connectors || connectors.length === 0) {
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'No active connectors',
        processed: 0
      });
    }

    let successCount = 0;
    let failureCount = 0;

    // Process analytics for each connector
    for (const connector of connectors) {
      try {
        const result = await syncConnectorAnalytics(connector);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error syncing analytics for connector ${connector.id}:`, error);
        failureCount++;
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Synced analytics for ${connectors.length} connectors`,
      processed: connectors.length,
      successful: successCount,
      failed: failureCount
    });
  } catch (error) {
    console.error('Analytics sync worker error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function syncConnectorAnalytics(connector: any) {
  const { id: connectorId, workspace_id: workspaceId, page_id: pageId } = connector;

  try {
    // Decrypt page access token
    const pageAccessToken = decryptToken(connector.page_access_token_encrypted);

    // Get all published posts for this connector
    const { data: publishedPosts, error: postsError } = await supabase
      .from('facebook_content_items')
      .select('id, external_post_id, published_at')
      .eq('connector_id', connectorId)
      .eq('status', 'PUBLISHED')
      .not('external_post_id', 'is', null)
      .order('published_at', { ascending: false })
      .limit(100);

    if (postsError) {
      throw postsError;
    }

    if (!publishedPosts || publishedPosts.length === 0) {
      return { success: true, postsProcessed: 0 };
    }

    let analyticsCount = 0;

    // Fetch analytics for each post
    for (const post of publishedPosts) {
      try {
        const analytics = await fetchPostAnalytics(
          post.external_post_id,
          pageAccessToken
        );

        if (analytics) {
          // Store analytics snapshot
          const { error: insertError } = await supabase
            .from('facebook_analytics_snapshots')
            .insert({
              workspace_id: workspaceId,
              connector_id: connectorId,
              content_item_id: post.id,
              external_post_id: post.external_post_id,
              reach: analytics.reach || 0,
              impressions: analytics.impressions || 0,
              clicks_all: analytics.clicks_all || 0,
              link_clicks: analytics.link_clicks || 0,
              reactions: analytics.reactions || 0,
              comments: analytics.comments || 0,
              shares: analytics.shares || 0,
              video_plays_3sec: analytics.video_plays_3sec || 0,
              snapshot_taken_at: new Date()
            });

          if (!insertError) {
            analyticsCount++;
          }
        }
      } catch (error) {
        console.error(`Error fetching analytics for post ${post.external_post_id}:`, error);
        // Continue with next post
      }
    }

    // Update connector's last verified time
    await supabase
      .from('meta_connectors')
      .update({ last_verified_at: new Date() })
      .eq('id', connectorId);

    // Log audit event
    await supabase.from('facebook_audit_logs').insert({
      workspace_id: workspaceId,
      action_type: 'ANALYTICS_SYNCED',
      resource_type: 'CONNECTOR',
      resource_id: connectorId,
      actor_email: 'system@analytics-worker',
      details: {
        postsProcessed: publishedPosts.length,
        analyticsStored: analyticsCount
      }
    });

    console.log(`✅ Synced analytics for ${analyticsCount} posts in connector ${connectorId}`);
    return { success: true, postsProcessed: publishedPosts.length, analyticsStored: analyticsCount };
  } catch (error) {
    console.error('Error syncing connector analytics:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function fetchPostAnalytics(postId: string, accessToken: string) {
  try {
    const fieldsToFetch = [
      'reach',
      'impressions',
      'clicks_all',
      'link_clicks',
      'reactions.summary(total_count).limit(0)',
      'comments.summary(total_count).limit(0)',
      'shares',
      'video_play_actions'
    ].join(',');

    const url = new URL(`https://graph.facebook.com/${META_API_VERSION}/${postId}`);
    url.searchParams.append('fields', fieldsToFetch);
    url.searchParams.append('access_token', accessToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      console.error('Meta API error:', data.error);
      return null;
    }

    return {
      reach: data.reach || 0,
      impressions: data.impressions || 0,
      clicks_all: data.clicks_all || 0,
      link_clicks: data.link_clicks || 0,
      reactions: data.reactions?.summary?.total_count || 0,
      comments: data.comments?.summary?.total_count || 0,
      shares: data.shares?.data?.length || 0,
      video_plays_3sec: data.video_play_actions || 0
    };
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return null;
  }
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
