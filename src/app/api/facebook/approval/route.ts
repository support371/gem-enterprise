/**
 * Facebook Approval Workflow API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/approval/queue
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const { data: pendingContent, error } = await supabase
      .from('facebook_content_items')
      .select(`
        id,
        content_type,
        category,
        status,
        scheduled_publish_time,
        facebook_content_versions(
          id,
          version_number,
          caption,
          hashtags,
          media_ids,
          approval_status
        )
      `)
      .eq('workspace_id', workspaceId)
      .eq('status', 'IN_REVIEW')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      queue: pendingContent || []
    });
  } catch (error) {
    console.error('Approval queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval queue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/approval/approve
 * POST /api/facebook/approval/reject
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, contentVersionId, decisionReason, complianceCheckPassed, brandCheckPassed, factualCheckPassed } = body;

    if (!workspaceId || !contentVersionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isApproval = request.nextUrl.pathname.includes('approve') && !request.nextUrl.pathname.includes('reject');
    const decision = isApproval ? 'APPROVED' : 'REJECTED';

    const { data: approval, error: approvalError } = await supabase
      .from('facebook_approvals')
      .insert({
        workspace_id: workspaceId,
        content_version_id: contentVersionId,
        decision,
        decision_reason: decisionReason,
        compliance_check_passed: complianceCheckPassed || false,
        brand_check_passed: brandCheckPassed || false,
        factual_check_passed: factualCheckPassed || false,
        approved_by: 'system',
        approved_at: new Date()
      })
      .select()
      .single();

    if (approvalError) {
      throw approvalError;
    }

    const { data: version } = await supabase
      .from('facebook_content_versions')
      .select('content_item_id')
      .eq('id', contentVersionId)
      .single();

    if (version) {
      const newStatus = isApproval ? 'APPROVED' : 'DRAFT';
      await supabase
        .from('facebook_content_items')
        .update({ status: newStatus })
        .eq('id', version.content_item_id);
    }

    return NextResponse.json({
      approval: {
        id: approval.id,
        decision: approval.decision
      }
    });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}
