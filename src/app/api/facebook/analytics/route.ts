/**
 * Facebook Analytics API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/analytics/dashboard
 * GET /api/facebook/analytics/post/:id
 * POST /api/facebook/analytics/refresh
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const connectorId = request.nextUrl.searchParams.get('connectorId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId' },
        { status: 400 }
      );
    }

    if (request.nextUrl.pathname.includes('/post/')) {
      // Get specific post analytics
      const contentId = request.nextUrl.pathname.split('/').pop();

      if (!contentId) {
        return NextResponse.json(
          { error: 'Missing contentId' },
          { status: 400 }
        );
      }

      const { data: snapshots, error } = await supabase
        .from('facebook_analytics_snapshots')
        .select('*')
        .eq('content_item_id', contentId)
        .order('snapshot_taken_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        snapshots: snapshots || []
      });
    } else {
      // Get dashboard analytics
      if (!connectorId) {
        return NextResponse.json(
          { error: 'Missing connectorId' },
          { status: 400 }
        );
      }

      const { data: analytics, error } = await supabase
        .from('facebook_analytics_snapshots')
        .select(`
          id,
          content_item_id,
          reach,
          impressions,
          clicks_all,
          link_clicks,
          reactions,
          comments,
          shares,
          video_plays_3sec,
          snapshot_taken_at,
          facebook_content_items(
            id,
            category,
            external_post_url,
            scheduled_publish_time
          )
        `)
        .eq('facebook_content_items.connector_id', connectorId)
        .order('snapshot_taken_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      const totalReach = analytics?.reduce((sum, a) => sum + (a.reach || 0), 0) || 0;
      const totalImpressions = analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0;
      const totalEngagement = analytics?.reduce((sum, a) => sum + ((a.reactions || 0) + (a.comments || 0) + (a.shares || 0)), 0) || 0;

      return NextResponse.json({
        dashboard: {
          totalReach,
          totalImpressions,
          totalEngagement,
          averageEngagementRate: totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : '0',
          posts: analytics || []
        }
      });
    }
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (request.nextUrl.pathname.includes('refresh')) {
      const body = await request.json();
      const { workspaceId } = body;

      if (!workspaceId) {
        return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
      }

      return NextResponse.json({
        status: 'REFRESH_INITIATED',
        message: 'Analytics refresh initiated'
      }, { status: 202 });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh analytics' },
      { status: 500 }
    );
  }
}
