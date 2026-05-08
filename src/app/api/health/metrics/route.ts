import { NextRequest, NextResponse } from 'next/server';

/**
 * Collects and reports performance metrics
 * Aggregates data from Web Vitals and server-side tracking
 */

interface PerformanceMetricsReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    failureRate: number;
  };
  endpoints: Record<
    string,
    {
      method: string;
      calls: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
      errorCount: number;
    }
  >;
  alerts: Array<{
    timestamp: string;
    level: 'WARNING' | 'CRITICAL';
    message: string;
  }>;
}

// In-memory store for metrics (in production, use a database)
const metricsStore = {
  requests: [] as Array<{
    timestamp: number;
    path: string;
    method: string;
    duration: number;
    status: number;
  }>,
  alerts: [] as Array<{
    timestamp: string;
    level: 'WARNING' | 'CRITICAL';
    message: string;
  }>,
};

/**
 * GET - Retrieve current performance metrics
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const periodParam = searchParams.get('period') || '1h';

  // Calculate time range based on period
  const now = Date.now();
  const periodMs = getPeriodMs(periodParam);
  const startTime = now - periodMs;

  // Filter metrics for the period
  const recentRequests = metricsStore.requests.filter((r) => r.timestamp >= startTime);
  const recentAlerts = metricsStore.alerts.filter(
    (a) => new Date(a.timestamp).getTime() >= startTime,
  );

  // Calculate summary statistics
  const report: PerformanceMetricsReport = {
    period: {
      start: new Date(startTime).toISOString(),
      end: new Date(now).toISOString(),
    },
    summary: calculateSummary(recentRequests),
    endpoints: aggregateByEndpoint(recentRequests),
    alerts: recentAlerts,
  };

  const response = NextResponse.json(report);
  response.headers.set('Cache-Control', 'public, max-age=60');

  return response;
}

/**
 * POST - Record a new performance metric
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Validate metric structure
    if (!metric.path || typeof metric.duration !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric format' },
        { status: 400 },
      );
    }

    // Store metric (limit to last 10,000 to prevent memory issues)
    metricsStore.requests.push({
      timestamp: Date.now(),
      path: metric.path,
      method: metric.method || 'UNKNOWN',
      duration: metric.duration,
      status: metric.status || 200,
    });

    if (metricsStore.requests.length > 10000) {
      metricsStore.requests = metricsStore.requests.slice(-10000);
    }

    return NextResponse.json(
      { success: true, message: 'Metric recorded' },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to record metric',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}

/**
 * Calculate summary statistics from requests
 */
function calculateSummary(
  requests: Array<{ duration: number; status: number }>,
): PerformanceMetricsReport['summary'] {
  if (requests.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      failureRate: 0,
    };
  }

  const durations = requests.map((r) => r.duration).sort((a, b) => a - b);
  const failures = requests.filter((r) => r.status >= 400).length;

  return {
    totalRequests: requests.length,
    averageResponseTime: Math.round(
      durations.reduce((a, b) => a + b, 0) / requests.length,
    ),
    p95ResponseTime: durations[Math.floor(durations.length * 0.95)],
    p99ResponseTime: durations[Math.floor(durations.length * 0.99)],
    failureRate: (failures / requests.length) * 100,
  };
}

/**
 * Aggregate metrics by endpoint
 */
function aggregateByEndpoint(
  requests: Array<{ path: string; method: string; duration: number; status: number }>,
): PerformanceMetricsReport['endpoints'] {
  const endpoints: PerformanceMetricsReport['endpoints'] = {};

  for (const request of requests) {
    const key = `${request.method} ${request.path}`;

    if (!endpoints[key]) {
      endpoints[key] = {
        method: request.method,
        calls: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errorCount: 0,
      };
    }

    const endpoint = endpoints[key];
    endpoint.calls += 1;
    endpoint.avgDuration =
      (endpoint.avgDuration * (endpoint.calls - 1) + request.duration) / endpoint.calls;
    endpoint.minDuration = Math.min(endpoint.minDuration, request.duration);
    endpoint.maxDuration = Math.max(endpoint.maxDuration, request.duration);

    if (request.status >= 400) {
      endpoint.errorCount += 1;
    }
  }

  return endpoints;
}

/**
 * Convert period string to milliseconds
 */
function getPeriodMs(period: string): number {
  const match = period.match(/^(\d+)([mhd])$/);

  if (!match) {
    return 60 * 60 * 1000; // Default to 1 hour
  }

  const [, amount, unit] = match;
  const num = parseInt(amount, 10);

  switch (unit) {
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
}
