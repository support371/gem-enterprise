/**
 * Facebook Audit Logs API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/audit/logs
 * GET /api/facebook/audit/summary
 */
export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const actionType = request.nextUrl.searchParams.get('actionType');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (request.nextUrl.pathname.includes('summary')) {
      // Get audit summary
      const { data: logs, error } = await supabase
        .from('facebook_audit_logs')
        .select('action_type')
        .eq('workspace_id', workspaceId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw error;
      }

      const summary = (logs || []).reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        summary,
        period: '7_days'
      });
    } else {
      // Get audit logs
      let query = supabase
        .from('facebook_audit_logs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data: logs, error } = await query;

      if (error) {
        throw error;
      }

      return NextResponse.json({
        logs: logs || [],
        total: logs?.length || 0
      });
    }
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
