import { NextRequest, NextResponse } from 'next/server';
import { validateLinkRedirect, PERFORMANCE_THRESHOLDS, recordPerformanceMetric } from '@/lib/performance';

/**
 * Handles all internal link redirects with performance tracking
 * Ensures links redirect immediately with no noticeable delay
 *
 * Query parameters:
 * - url: The URL to redirect to
 * - track: Whether to record performance metrics (default: true)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('url');
  const trackPerformance = searchParams.get('track') !== 'false';

  if (!redirectUrl) {
    return NextResponse.json(
      { error: 'Missing required parameter: url' },
      { status: 400 },
    );
  }

  // Validate URL to prevent open redirects
  if (!isValidRedirectUrl(redirectUrl)) {
    return NextResponse.json(
      { error: 'Invalid redirect URL' },
      { status: 400 },
    );
  }

  const startTime = performance.now();

  try {
    // Measure redirect validation
    const validation = await validateLinkRedirect(
      request.url,
      redirectUrl,
      PERFORMANCE_THRESHOLDS.LINK_REDIRECT,
    );

    const duration = performance.now() - startTime;

    // Record performance metric
    if (trackPerformance) {
      recordPerformanceMetric({
        timestamp: Date.now(),
        duration,
        path: '/api/redirect',
        method: 'GET',
        status: validation.success ? 302 : 400,
        metadata: {
          targetUrl: redirectUrl,
          withinThreshold: validation.withinThreshold,
        },
      });
    }

    // Log performance issues
    if (!validation.withinThreshold) {
      console.warn(
        `[REDIRECT] Slow redirect detected: ${redirectUrl} took ${validation.duration.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.LINK_REDIRECT}ms)`,
      );
    }

    // Perform the actual redirect
    const response = NextResponse.redirect(redirectUrl, {
      status: 302, // Temporary redirect
    });

    // Add performance headers
    response.headers.set(
      'Server-Timing',
      `redirect;dur=${duration.toFixed(2)}, validation;dur=${validation.duration.toFixed(2)}`,
    );

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    console.error('[REDIRECT] Error during redirect:', error);

    // Record the error
    recordPerformanceMetric({
      timestamp: Date.now(),
      duration,
      path: '/api/redirect-ERROR',
      method: 'GET',
      status: 500,
      metadata: {
        targetUrl: redirectUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Redirect failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Validates redirect URL to prevent open redirects
 * Only allows redirects to internal URLs or whitelisted external domains
 */
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url, 'http://localhost');

    // Allow internal relative URLs
    if (url.startsWith('/')) {
      return true;
    }

    // Whitelist of allowed external domains
    const allowedDomains = [
      'gemcybersecurityassist.com',
      'gem-enterprise.vercel.app',
      'www.gemcybersecurityassist.com',
    ];

    return allowedDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
}
