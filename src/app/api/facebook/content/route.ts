/**
 * Facebook Content Management API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/content/calendar
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const connectorId = request.nextUrl.searchParams.get('connectorId');

    if (!workspaceId || !connectorId) {
      return NextResponse.json(
        { error: 'Missing workspaceId or connectorId' },
        { status: 400 }
      );
    }

    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: content, error } = await supabase
      .from('facebook_content_items')
      .select(`
        id,
        content_type,
        category,
        status,
        scheduled_publish_time,
        current_version_id
      `)
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .gte('scheduled_publish_time', today.toISOString())
      .lte('scheduled_publish_time', thirtyDaysLater.toISOString())
      .order('scheduled_publish_time', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      calendar: content || [],
      period: {
        start: today.toISOString(),
        end: thirtyDaysLater.toISOString()
      }
    });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/content/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      connectorId,
      contentType,
      category,
      caption,
      hashtags,
      destinationUrl,
      accessibilityText,
      videoCaptions,
      mediaIds,
      scheduledPublishTime,
      timezone
    } = body;

    if (!workspaceId || !connectorId || !contentType || !category || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(`${caption}${JSON.stringify(mediaIds)}${destinationUrl}`)
      .digest('hex');

    const { data: contentItem, error: itemError } = await supabase
      .from('facebook_content_items')
      .insert({
        workspace_id: workspaceId,
        connector_id: connectorId,
        content_type: contentType,
        category,
        status: 'DRAFT',
        scheduled_publish_time: scheduledPublishTime,
        timezone: timezone || 'America/New_York',
        created_by: 'system'
      })
      .select()
      .single();

    if (itemError) {
      throw itemError;
    }

    const { data: version, error: versionError } = await supabase
      .from('facebook_content_versions')
      .insert({
        content_item_id: contentItem.id,
        caption,
        hashtags: hashtags || [],
        destination_url: destinationUrl,
        accessibility_text: accessibilityText,
        video_captions: videoCaptions,
        media_ids: mediaIds || [],
        version_number: 1,
        content_hash: contentHash,
        approval_status: 'PENDING',
        approval_required_reason: 'Initial version - requires approval',
        created_by: 'system'
      })
      .select()
      .single();

    if (versionError) {
      throw versionError;
    }

    await supabase
      .from('facebook_content_items')
      .update({ current_version_id: version.id })
      .eq('id', contentItem.id);

    return NextResponse.json({
      contentItem: {
        id: contentItem.id,
        status: contentItem.status,
        category: contentItem.category,
        contentType: contentItem.content_type,
        version: {
          id: version.id,
          versionNumber: version.version_number,
          approvalStatus: version.approval_status
        }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
