/**
 * Facebook Daily Automation Agent
 * Scheduled to run daily at 8 AM
 * Handles: content generation, approval, publishing, analytics
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

interface AgentTask {
  name: string;
  execute: () => Promise<{ success: boolean; result?: any; error?: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentTasks: AgentTask[] = [
      {
        name: 'Fetch Pending Approvals',
        execute: fetchPendingApprovals
      },
      {
        name: 'Auto-Approve Low-Risk Content',
        execute: autoApproveLowRiskContent
      },
      {
        name: 'Process Publishing Queue',
        execute: processPublishingQueue
      },
      {
        name: 'Sync Analytics',
        execute: syncAnalytics
      },
      {
        name: 'Generate Daily Report',
        execute: generateDailyReport
      }
    ];

    const results = [];

    for (const task of agentTasks) {
      try {
        console.log(`🤖 Agent: Starting task - ${task.name}`);
        const result = await task.execute();
        results.push({
          task: task.name,
          status: result.success ? 'SUCCESS' : 'FAILED',
          result: result.result,
          error: result.error
        });
        console.log(`✅ Agent: Completed - ${task.name}`);
      } catch (error) {
        console.error(`❌ Agent: Failed - ${task.name}:`, error);
        results.push({
          task: task.name,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      tasksCompleted: results.length,
      results
    });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchPendingApprovals() {
  try {
    const { data: pendingItems, error } = await supabase
      .from('facebook_content_items')
      .select('id, workspace_id, connector_id, status, created_at')
      .eq('status', 'IN_REVIEW')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    return {
      success: true,
      result: {
        pendingCount: pendingItems?.length || 0,
        items: pendingItems
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function autoApproveLowRiskContent() {
  try {
    // Get low-risk content (educational, updates, not promotional)
    const { data: lowRiskItems, error: fetchError } = await supabase
      .from('facebook_content_items')
      .select('id, workspace_id, connector_id, category, status')
      .eq('status', 'IN_REVIEW')
      .in('category', ['EDUCATIONAL', 'UPDATE'])
      .limit(20);

    if (fetchError) throw fetchError;

    if (!lowRiskItems || lowRiskItems.length === 0) {
      return { success: true, result: { autoApprovedCount: 0 } };
    }

    let approvedCount = 0;

    for (const item of lowRiskItems) {
      try {
        // Update to APPROVED
        const { error: updateError } = await supabase
          .from('facebook_content_items')
          .update({
            status: 'APPROVED',
            approved_at: new Date(),
            approved_by: 'system@agent'
          })
          .eq('id', item.id);

        if (!updateError) {
          approvedCount++;

          // Log audit event
          await supabase.from('facebook_audit_logs').insert({
            workspace_id: item.workspace_id,
            action_type: 'CONTENT_AUTO_APPROVED',
            resource_type: 'CONTENT_ITEM',
            resource_id: item.id,
            actor_email: 'system@agent',
            details: { category: item.category }
          });
        }
      } catch (error) {
        console.error(`Error approving item ${item.id}:`, error);
      }
    }

    return {
      success: true,
      result: {
        autoApprovedCount: approvedCount,
        totalProcessed: lowRiskItems.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function processPublishingQueue() {
  try {
    // Get all approved content ready to publish
    const { data: readyToPublish, error: fetchError } = await supabase
      .from('facebook_content_items')
      .select(`
        id,
        workspace_id,
        connector_id,
        scheduled_publish_time,
        facebook_content_versions(
          id,
          caption,
          hashtags,
          destination_url
        )
      `)
      .eq('status', 'APPROVED')
      .lte('scheduled_publish_time', new Date().toISOString())
      .limit(10);

    if (fetchError) throw fetchError;

    if (!readyToPublish || readyToPublish.length === 0) {
      return { success: true, result: { publishedCount: 0 } };
    }

    let publishedCount = 0;

    for (const item of readyToPublish) {
      try {
        // Create publishing job
        const { error: jobError } = await supabase
          .from('facebook_publishing_jobs')
          .insert({
            workspace_id: item.workspace_id,
            content_item_id: item.id,
            idempotency_key: generateIdempotencyKey(),
            status: 'PENDING',
            attempt_number: 1,
            max_retries: 3,
            next_retry_at: new Date()
          });

        if (!jobError) {
          publishedCount++;
        }
      } catch (error) {
        console.error(`Error creating job for item ${item.id}:`, error);
      }
    }

    return {
      success: true,
      result: {
        publishedCount,
        totalProcessed: readyToPublish.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function syncAnalytics() {
  try {
    // Get all active connectors
    const { data: connectors, error: connectorsError } = await supabase
      .from('meta_connectors')
      .select('id, workspace_id, page_id, page_access_token_encrypted')
      .eq('status', 'ACTIVE')
      .limit(10);

    if (connectorsError) throw connectorsError;

    if (!connectors || connectors.length === 0) {
      return { success: true, result: { syncedCount: 0 } };
    }

    let syncedCount = 0;

    for (const connector of connectors) {
      try {
        // Get published posts
        const { data: posts } = await supabase
          .from('facebook_content_items')
          .select('id, external_post_id, published_at')
          .eq('connector_id', connector.id)
          .eq('status', 'PUBLISHED')
          .not('external_post_id', 'is', null)
          .order('published_at', { ascending: false })
          .limit(20);

        if (posts && posts.length > 0) {
          // Decrypt token
          const pageAccessToken = decryptToken(connector.page_access_token_encrypted);

          for (const post of posts) {
            try {
              // Fetch analytics
              const analytics = await fetchPostAnalytics(
                post.external_post_id,
                pageAccessToken
              );

              if (analytics) {
                await supabase
                  .from('facebook_analytics_snapshots')
                  .insert({
                    workspace_id: connector.workspace_id,
                    connector_id: connector.id,
                    content_item_id: post.id,
                    external_post_id: post.external_post_id,
                    reach: analytics.reach || 0,
                    impressions: analytics.impressions || 0,
                    clicks_all: analytics.clicks_all || 0,
                    engagement: analytics.engagement || 0,
                    snapshot_taken_at: new Date()
                  });

                syncedCount++;
              }
            } catch (error) {
              console.error(`Error syncing analytics for post ${post.external_post_id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing connector ${connector.id}:`, error);
      }
    }

    return {
      success: true,
      result: {
        syncedCount,
        connectorsProcessed: connectors.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function generateDailyReport() {
  try {
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayStats } = await supabase
      .from('facebook_audit_logs')
      .select('action_type')
      .gte('created_at', today.toISOString())
      .limit(1000);

    const stats = {
      contentCreated: todayStats?.filter(s => s.action_type === 'CONTENT_CREATED').length || 0,
      contentApproved: todayStats?.filter(s => s.action_type === 'CONTENT_APPROVED').length || 0,
      contentPublished: todayStats?.filter(s => s.action_type === 'CONTENT_PUBLISHED').length || 0,
      analyticsSynced: todayStats?.filter(s => s.action_type === 'ANALYTICS_SYNCED').length || 0
    };

    // Log report
    console.log('📊 Daily Report:', stats);

    return {
      success: true,
      result: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function fetchPostAnalytics(postId: string, accessToken: string) {
  try {
    const url = new URL(`https://graph.facebook.com/${META_API_VERSION}/${postId}`);
    url.searchParams.append('fields', 'reach,impressions,clicks_all,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares');
    url.searchParams.append('access_token', accessToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) return null;

    return {
      reach: data.reach || 0,
      impressions: data.impressions || 0,
      clicks_all: data.clicks_all || 0,
      engagement: (data.reactions?.summary?.total_count || 0) + 
                  (data.comments?.summary?.total_count || 0) + 
                  (data.shares?.length || 0)
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
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

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
