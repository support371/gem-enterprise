/**
 * Facebook Automated Publishing Workflow
 * Orchestrates the complete publishing pipeline
 * Handles: content generation → approval → publishing → analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      connectorId,
      action = 'full-workflow', // full-workflow | generate-only | approve-only | publish-only
      contentType = 'PRODUCT_SHOWCASE',
      numberOfPosts = 3,
      autoApprove = true,
      scheduleStartTime = new Date(),
      scheduleIntervalHours = 24
    } = body;

    if (!workspaceId || !connectorId) {
      return NextResponse.json(
        { error: 'Missing workspaceId or connectorId' },
        { status: 400 }
      );
    }

    const workflow = {
      workspaceId,
      connectorId,
      startTime: new Date(),
      steps: [] as any[]
    };

    try {
      // Step 1: Generate Content
      if (action === 'full-workflow' || action === 'generate-only') {
        console.log('📝 Workflow: Step 1 - Generating content');
        const generateResult = await generateContent({
          workspaceId,
          connectorId,
          contentType,
          numberOfPosts,
          scheduleStartTime,
          scheduleIntervalHours
        });

        workflow.steps.push({
          name: 'Generate Content',
          status: generateResult.success ? 'COMPLETED' : 'FAILED',
          result: generateResult
        });

        if (!generateResult.success) {
          throw new Error('Content generation failed');
        }
      }

      // Step 2: Auto-Approve (if enabled)
      if ((action === 'full-workflow' || action === 'approve-only') && autoApprove) {
        console.log('✅ Workflow: Step 2 - Auto-approving content');
        const approveResult = await autoApproveContent({
          workspaceId,
          connectorId,
          contentType
        });

        workflow.steps.push({
          name: 'Auto-Approve Content',
          status: approveResult.success ? 'COMPLETED' : 'FAILED',
          result: approveResult
        });
      }

      // Step 3: Publish Content
      if (action === 'full-workflow' || action === 'publish-only') {
        console.log('🚀 Workflow: Step 3 - Publishing content');
        const publishResult = await publishContent({
          workspaceId,
          connectorId
        });

        workflow.steps.push({
          name: 'Publish Content',
          status: publishResult.success ? 'COMPLETED' : 'FAILED',
          result: publishResult
        });
      }

      // Step 4: Sync Analytics
      if (action === 'full-workflow') {
        console.log('📊 Workflow: Step 4 - Syncing analytics');
        const analyticsResult = await syncAnalytics({
          workspaceId,
          connectorId
        });

        workflow.steps.push({
          name: 'Sync Analytics',
          status: analyticsResult.success ? 'COMPLETED' : 'FAILED',
          result: analyticsResult
        });
      }

      // Log workflow completion
      await supabase.from('facebook_audit_logs').insert({
        workspace_id: workspaceId,
        action_type: 'WORKFLOW_COMPLETED',
        resource_type: 'WORKFLOW',
        resource_id: `workflow-${Date.now()}`,
        actor_email: 'system@workflow',
        details: {
          action,
          stepsCompleted: workflow.steps.length,
          totalTime: Date.now() - workflow.startTime.getTime()
        }
      });

      return NextResponse.json({
        status: 'SUCCESS',
        message: 'Publishing workflow completed',
        workflow,
        totalTime: `${(Date.now() - workflow.startTime.getTime()) / 1000}s`
      });
    } catch (error) {
      console.error('Workflow error:', error);

      await supabase.from('facebook_audit_logs').insert({
        workspace_id: workspaceId,
        action_type: 'WORKFLOW_FAILED',
        resource_type: 'WORKFLOW',
        resource_id: `workflow-${Date.now()}`,
        actor_email: 'system@workflow',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stepsCompleted: workflow.steps.length
        }
      });

      return NextResponse.json({
        status: 'ERROR',
        message: 'Publishing workflow failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        workflow
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateContent(options: any) {
  try {
    const {
      workspaceId,
      connectorId,
      contentType,
      numberOfPosts,
      scheduleStartTime,
      scheduleIntervalHours
    } = options;

    const generatedPosts = [];

    for (let i = 0; i < numberOfPosts; i++) {
      try {
        const post = await createContentPost({
          workspaceId,
          connectorId,
          contentType,
          scheduleTime: new Date(
            scheduleStartTime.getTime() + i * scheduleIntervalHours * 60 * 60 * 1000
          )
        });

        if (post) {
          generatedPosts.push(post);
        }
      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error);
      }
    }

    return {
      success: true,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function autoApproveContent(options: any) {
  try {
    const { workspaceId, connectorId, contentType } = options;

    const { data: draftPosts, error: fetchError } = await supabase
      .from('facebook_content_items')
      .select('id, status')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .eq('status', 'DRAFT')
      .eq('content_type', contentType)
      .limit(50);

    if (fetchError) throw fetchError;

    if (!draftPosts || draftPosts.length === 0) {
      return { success: true, approvedCount: 0 };
    }

    let approvedCount = 0;

    for (const post of draftPosts) {
      const { error: updateError } = await supabase
        .from('facebook_content_items')
        .update({
          status: 'APPROVED',
          approved_at: new Date(),
          approved_by: 'system@workflow'
        })
        .eq('id', post.id);

      if (!updateError) {
        approvedCount++;

        await supabase.from('facebook_audit_logs').insert({
          workspace_id: workspaceId,
          action_type: 'CONTENT_APPROVED',
          resource_type: 'CONTENT_ITEM',
          resource_id: post.id,
          actor_email: 'system@workflow',
          details: { contentType }
        });
      }
    }

    return {
      success: true,
      approvedCount,
      totalProcessed: draftPosts.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function publishContent(options: any) {
  try {
    const { workspaceId, connectorId } = options;

    const { data: approvedPosts, error: fetchError } = await supabase
      .from('facebook_content_items')
      .select('id, scheduled_publish_time')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .eq('status', 'APPROVED')
      .lte('scheduled_publish_time', new Date().toISOString())
      .limit(20);

    if (fetchError) throw fetchError;

    if (!approvedPosts || approvedPosts.length === 0) {
      return { success: true, publishedCount: 0 };
    }

    let publishedCount = 0;

    for (const post of approvedPosts) {
      const { error: jobError } = await supabase
        .from('facebook_publishing_jobs')
        .insert({
          workspace_id: workspaceId,
          content_item_id: post.id,
          idempotency_key: crypto.randomUUID(),
          status: 'PENDING',
          attempt_number: 1,
          max_retries: 3,
          next_retry_at: new Date()
        });

      if (!jobError) {
        publishedCount++;
      }
    }

    return {
      success: true,
      publishedCount,
      totalProcessed: approvedPosts.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function syncAnalytics(options: any) {
  try {
    const { workspaceId, connectorId } = options;

    const { data: connector, error: connectorError } = await supabase
      .from('meta_connectors')
      .select('*')
      .eq('id', connectorId)
      .eq('workspace_id', workspaceId)
      .single();

    if (connectorError || !connector) {
      throw new Error('Connector not found');
    }

    const { data: publishedPosts } = await supabase
      .from('facebook_content_items')
      .select('id, external_post_id')
      .eq('connector_id', connectorId)
      .eq('status', 'PUBLISHED')
      .not('external_post_id', 'is', null)
      .order('published_at', { ascending: false })
      .limit(10);

    if (!publishedPosts || publishedPosts.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    let syncedCount = 0;

    for (const post of publishedPosts) {
      try {
        // Placeholder for analytics sync
        // In real implementation, would fetch from Meta API
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing post ${post.external_post_id}:`, error);
      }
    }

    return {
      success: true,
      syncedCount,
      totalProcessed: publishedPosts.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createContentPost(options: any) {
  const { workspaceId, connectorId, contentType, scheduleTime } = options;

  // Generate content based on type
  const contentTemplates: Record<string, any> = {
    PRODUCT_SHOWCASE: {
      caption: '🎯 Discover Our Latest Cybersecurity Solutions\n\nProtect your business with enterprise-grade security. Advanced threat detection, real-time monitoring, and 24/7 support.',
      hashtags: ['#Cybersecurity', '#Security', '#Enterprise'],
      url: 'https://example.com/products'
    },
    EDUCATIONAL: {
      caption: '🔐 Security Tip: Enable Two-Factor Authentication\n\nTwo-factor authentication adds an extra layer of security to your accounts.',
      hashtags: ['#SecurityTip', '#2FA', '#Cybersecurity'],
      url: ''
    },
    UPDATE: {
      caption: '📢 New Feature Alert!\n\nWe\'ve just launched real-time threat intelligence dashboard.',
      hashtags: ['#NewFeature', '#Update', '#Security'],
      url: 'https://example.com/features'
    },
    PROMOTIONAL: {
      caption: '🎁 Limited Time Offer!\n\nGet 30% off our Enterprise Security Suite this month.',
      hashtags: ['#Promotion', '#Deal', '#Security'],
      url: 'https://example.com/promo'
    }
  };

  const template = contentTemplates[contentType] || contentTemplates.PRODUCT_SHOWCASE;

  try {
    const { data: contentItem, error: contentError } = await supabase
      .from('facebook_content_items')
      .insert({
        workspace_id: workspaceId,
        connector_id: connectorId,
        status: 'DRAFT',
        content_type: contentType,
        scheduled_publish_time: scheduleTime,
        created_by: 'system@workflow'
      })
      .select()
      .single();

    if (contentError || !contentItem) {
      throw new Error('Failed to create content item');
    }

    const { data: version } = await supabase
      .from('facebook_content_versions')
      .insert({
        content_item_id: contentItem.id,
        version_number: 1,
        caption: template.caption,
        hashtags: template.hashtags,
        destination_url: template.url,
        status: 'DRAFT',
        created_by: 'system@workflow'
      })
      .select()
      .single();

    return {
      id: contentItem.id,
      type: contentType,
      scheduledTime: scheduleTime,
      versionId: version?.id
    };
  } catch (error) {
    console.error('Error creating content post:', error);
    return null;
  }
}
