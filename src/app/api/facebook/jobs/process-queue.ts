/**
 * Facebook Publishing Worker
 * Processes the publishing queue and posts approved content to Facebook
 * Runs every 5 minutes via cron job
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
    // Verify this is a legitimate cron request (optional - add your own verification)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all pending publishing jobs
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('facebook_publishing_jobs')
      .select(`
        id,
        workspace_id,
        content_item_id,
        idempotency_key,
        attempt_number,
        max_retries,
        facebook_content_items(
          id,
          connector_id,
          scheduled_publish_time,
          facebook_content_versions(
            id,
            caption,
            hashtags,
            destination_url,
            media_ids
          )
        )
      `)
      .eq('status', 'PENDING')
      .lte('next_retry_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10);

    if (jobsError) {
      throw jobsError;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'No pending jobs',
        processed: 0
      });
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each job
    for (const job of pendingJobs) {
      try {
        const result = await processPublishingJob(job);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        failureCount++;

        // Update job with error
        await supabase
          .from('facebook_publishing_jobs')
          .update({
            status: 'FAILED',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            error_code: 'PROCESSING_ERROR',
            completed_at: new Date()
          })
          .eq('id', job.id);
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Processed ${pendingJobs.length} jobs`,
      processed: pendingJobs.length,
      successful: successCount,
      failed: failureCount
    });
  } catch (error) {
    console.error('Publishing worker error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function processPublishingJob(job: any) {
  const {
    id: jobId,
    workspace_id: workspaceId,
    content_item_id: contentItemId,
    idempotency_key: idempotencyKey,
    attempt_number: attemptNumber,
    max_retries: maxRetries,
    facebook_content_items: contentItem
  } = job;

  // Check if content is ready to publish
  const now = new Date();
  const scheduledTime = new Date(contentItem.scheduled_publish_time);

  if (scheduledTime > now) {
    // Not ready yet, skip
    return { success: false, reason: 'NOT_READY_YET' };
  }

  // Get connector and decrypt tokens
  const { data: connector, error: connectorError } = await supabase
    .from('meta_connectors')
    .select('*')
    .eq('id', contentItem.connector_id)
    .eq('workspace_id', workspaceId)
    .single();

  if (connectorError || !connector) {
    throw new Error('Connector not found');
  }

  // Check if emergency locked
  if (connector.emergency_locked) {
    throw new Error('Publishing is emergency locked');
  }

  // Decrypt page access token
  const pageAccessToken = decryptToken(connector.page_access_token_encrypted);
  const pageId = connector.page_id;

  // Get content version
  const version = contentItem.facebook_content_versions?.[0];
  if (!version) {
    throw new Error('No content version found');
  }

  // Build post payload
  const postPayload: Record<string, any> = {
    message: version.caption,
    access_token: pageAccessToken
  };

  // Add hashtags to message if present
  if (version.hashtags && version.hashtags.length > 0) {
    postPayload.message += '\n\n' + version.hashtags.map((tag: string) => `#${tag}`).join(' ');
  }

  // Add link if present
  if (version.destination_url) {
    postPayload.link = version.destination_url;
  }

  try {
    // Post to Facebook
    const feedUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${pageId}/feed`);

    const response = await fetch(feedUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(postPayload).toString()
    });

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      const errorMsg = responseData.error?.message || 'Unknown error';
      const errorCode = responseData.error?.code || 'UNKNOWN';

      // Check if retryable
      const isRetryable = [
        17, // User request limit exceeded
        100, // Invalid parameter
        190 // Invalid OAuth token
      ].includes(errorCode);

      if (isRetryable && attemptNumber < maxRetries) {
        // Schedule retry
        const nextRetryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await supabase
          .from('facebook_publishing_jobs')
          .update({
            status: 'PENDING',
            attempt_number: attemptNumber + 1,
            next_retry_at: nextRetryTime,
            error_message: errorMsg,
            error_code: String(errorCode),
            meta_response_code: response.status,
            meta_response_body: responseData
          })
          .eq('id', jobId);

        return { success: false, reason: 'RETRYABLE_ERROR', retry: true };
      } else {
        // Non-retryable or max retries exceeded
        await supabase
          .from('facebook_publishing_jobs')
          .update({
            status: 'FAILED',
            error_message: errorMsg,
            error_code: String(errorCode),
            meta_response_code: response.status,
            meta_response_body: responseData,
            completed_at: new Date()
          })
          .eq('id', jobId);

        return { success: false, reason: 'FAILED' };
      }
    }

    // Success! Update job and content item
    const externalPostId = responseData.id;
    const externalPostUrl = `https://www.facebook.com/${pageId}/posts/${externalPostId}`;

    await supabase
      .from('facebook_publishing_jobs')
      .update({
        status: 'PUBLISHED',
        external_post_id: externalPostId,
        submitted_at: new Date(),
        completed_at: new Date(),
        meta_response_code: response.status,
        meta_response_body: responseData
      })
      .eq('id', jobId);

    await supabase
      .from('facebook_content_items')
      .update({
        status: 'PUBLISHED',
        external_post_id: externalPostId,
        external_post_url: externalPostUrl
      })
      .eq('id', contentItemId);

    // Log audit event
    await supabase.from('facebook_audit_logs').insert({
      workspace_id: workspaceId,
      action_type: 'CONTENT_PUBLISHED',
      resource_type: 'PUBLISHING_JOB',
      resource_id: jobId,
      actor_email: 'system@publishing-worker',
      details: {
        contentItemId,
        externalPostId,
        externalPostUrl,
        pageId
      }
    });

    console.log(`✅ Successfully published post ${externalPostId}`);
    return { success: true };
  } catch (error) {
    console.error('Error posting to Facebook:', error);

    // Check if retryable
    if (attemptNumber < maxRetries) {
      const nextRetryTime = new Date(Date.now() + 5 * 60 * 1000);

      await supabase
        .from('facebook_publishing_jobs')
        .update({
          status: 'PENDING',
          attempt_number: attemptNumber + 1,
          next_retry_at: nextRetryTime,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', jobId);

      return { success: false, reason: 'ERROR_RETRY', retry: true };
    } else {
      await supabase
        .from('facebook_publishing_jobs')
        .update({
          status: 'FAILED',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date()
        })
        .eq('id', jobId);

      return { success: false, reason: 'ERROR_FAILED' };
    }
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
