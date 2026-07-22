/**
 * Facebook Emergency Controls API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * GET /api/facebook/emergency/status
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

    const { data: connector, error } = await supabase
      .from('meta_connectors')
      .select('emergency_locked, emergency_locked_at, emergency_lock_reason')
      .eq('id', connectorId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      emergencyStatus: {
        isLocked: connector?.emergency_locked || false,
        lockedAt: connector?.emergency_locked_at,
        lockReason: connector?.emergency_lock_reason
      }
    });
  } catch (error) {
    console.error('Emergency status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/emergency/lock
 * POST /api/facebook/emergency/unlock
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, connectorId, reason } = body;

    if (!workspaceId || !connectorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isLock = request.nextUrl.pathname.includes('lock') && !request.nextUrl.pathname.includes('unlock');

    if (isLock) {
      // Lock endpoint
      const { data: connector, error: updateError } = await supabase
        .from('meta_connectors')
        .update({
          emergency_locked: true,
          emergency_locked_at: new Date(),
          emergency_locked_by: 'system',
          emergency_lock_reason: reason || 'Manual emergency lock'
        })
        .eq('id', connectorId)
        .eq('workspace_id', workspaceId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        connector: {
          id: connector.id,
          emergencyLocked: connector.emergency_locked,
          emergencyLockedAt: connector.emergency_locked_at,
          emergencyLockReason: connector.emergency_lock_reason
        }
      });
    } else {
      // Unlock endpoint
      const { data: connector, error: updateError } = await supabase
        .from('meta_connectors')
        .update({
          emergency_locked: false,
          emergency_locked_at: null,
          emergency_locked_by: null,
          emergency_lock_reason: null
        })
        .eq('id', connectorId)
        .eq('workspace_id', workspaceId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        connector: {
          id: connector.id,
          emergencyLocked: connector.emergency_locked
        }
      });
    }
  } catch (error) {
    console.error('Emergency control error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency control' },
      { status: 500 }
    );
  }
}
