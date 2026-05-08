import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceAlert {
  level: 'WARNING' | 'CRITICAL';
  metric: {
    timestamp: number;
    duration: number;
    path: string;
    method?: string;
    status?: number;
  };
  timestamp: string;
}

/**
 * Receives and logs performance alerts from the application
 * In production, this would integrate with monitoring services like Sentry, DataDog, or CloudWatch
 */
export async function POST(request: NextRequest) {
  try {
    const alert: PerformanceAlert = await request.json();

    // Validate alert structure
    if (!alert.level || !alert.metric || !alert.metric.duration) {
      return NextResponse.json(
        { error: 'Invalid alert format' },
        { status: 400 },
      );
    }

    // Log alert with appropriate severity
    const logLevel = alert.level === 'CRITICAL' ? 'error' : 'warn';
    console[logLevel as 'error' | 'warn'](
      `[PERF-ALERT-${alert.level}] ${alert.metric.path} took ${alert.metric.duration.toFixed(2)}ms`,
      {
        method: alert.metric.method,
        status: alert.metric.status,
        timestamp: alert.timestamp,
      },
    );

    // In production, send to external monitoring service
    // Example: await sendToSentry(alert);
    // Example: await sendToDataDog(alert);
    // Example: await logToCloudWatch(alert);

    // Handle critical alerts
    if (alert.level === 'CRITICAL') {
      // Could trigger automated responses:
      // - Send alert email to ops team
      // - Create incident in PagerDuty
      // - Scale up infrastructure
      // - Enable fallback mechanisms

      // For now, just log it
      console.error('[CRITICAL-PERF] High latency detected - may require investigation');
    }

    return NextResponse.json(
      {
        success: true,
        message: `Performance alert received and logged (${alert.level})`,
        alertId: `perf-${Date.now()}`,
      },
      { status: 202 }, // 202 Accepted - alert queued for processing
    );
  } catch (error) {
    console.error('[PERF-ALERT] Failed to process performance alert:', error);

    return NextResponse.json(
      {
        error: 'Failed to process alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint returns current performance alert thresholds and configuration
 */
export async function GET() {
  return NextResponse.json({
    thresholds: {
      warningMs: 300,
      criticalMs: 5000,
    },
    monitoring: {
      enabled: true,
      alertingEnabled: true,
      environment: process.env.NODE_ENV,
    },
    lastUpdated: new Date().toISOString(),
  });
}
