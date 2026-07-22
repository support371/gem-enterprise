/**
 * Facebook Publishing API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/publishing/jobs
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const { data: jobs, error } = await supabase
      .from('facebook_publishing_jobs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publishing jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/publishing/publish-now
 * POST /api/facebook/publishing/schedule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, contentId, scheduledPublishTime, timezone } = body;

    if (!workspaceId || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isSchedule = request.nextUrl.pathname.includes('schedule');

    if (isSchedule) {
      // Schedule endpoint
      if (!scheduledPublishTime) {
        return NextResponse.json(
          { error: 'Missing scheduledPublishTime' },
          { status: 400 }
        );
      }

      const { data: updated, error } = await supabase
        .from('facebook_content_items')
        .update({
          scheduled_publish_time: scheduledPublishTime,
          timezone: timezone || 'America/New_York',
          status: 'SCHEDULED'
        })
        .eq('id', contentId)
        .eq('workspace_id', workspaceId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        contentItem: {
          id: updated.id,
          status: updated.status,
          scheduledPublishTime: updated.scheduled_publish_time
        }
      });
    } else {
      // Publish now endpoint
      const { data: content, error: contentError } = await supabase
        .from('facebook_content_items')
        .select('id, connector_id, status')
        .eq('id', contentId)
        .eq('workspace_id', workspaceId)
        .single();

      if (contentError || !content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      if (content.status !== 'APPROVED' && content.status !== 'SCHEDULED') {
        return NextResponse.json(
          { error: 'Content must be approved before publishing' },
          { status: 400 }
        );
      }

      const idempotencyKey = `${contentId}-${Date.now()}`;

      const { data: job, error: jobError } = await supabase
        .from('facebook_publishing_jobs')
        .insert({
          workspace_id: workspaceId,
          content_item_id: contentId,
          idempotency_key: idempotencyKey,
          status: 'PENDING',
          attempt_number: 1,
          max_retries: 3
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      return NextResponse.json({
        job: {
          id: job.id,
          status: job.status,
          idempotencyKey
        }
      }, { status: 202 });
    }
  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json(
      { error: 'Failed to process publishing request' },
      { status: 500 }
    );
  }
}
