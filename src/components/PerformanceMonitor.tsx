'use client';

import { useEffect, useState } from 'react';
import { PERFORMANCE_THRESHOLDS } from '@/lib/performance';

interface HealthStatus {
  status: string;
  timestamp: string;
  responseTime: number;
  performance: {
    status: string;
    threshold: number;
    withinThreshold: boolean;
  };
  services: {
    database: string;
  };
}

/**
 * Performance monitoring component
 * Displays system health and performance metrics in real-time
 */
export function PerformanceMonitor() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch health status
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Health check failed');

        const data: HealthStatus = await response.json();
        setHealth(data);
        setLastChecked(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[PERF] Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchHealth();

    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        <span className="animate-pulse">Checking system health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        <span>⚠ Health check unavailable</span>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const isHealthy = health.status === 'ok' && health.performance.withinThreshold;
  const responseTimeBadge = health.responseTime <= PERFORMANCE_THRESHOLDS.API_RESPONSE ? '✓' : '⚠';

  return (
    <div className="text-xs space-y-1 text-gray-400">
      {/* Overall status */}
      <div className="flex items-center gap-2">
        <span className={isHealthy ? 'text-green-400' : 'text-yellow-400'}>
          {isHealthy ? '●' : '●'}
        </span>
        <span>System: {health.status.toUpperCase()}</span>
      </div>

      {/* Response time */}
      <div className="flex items-center gap-2">
        <span className={health.performance.withinThreshold ? 'text-green-400' : 'text-yellow-400'}>
          {responseTimeBadge}
        </span>
        <span>
          Response: {health.responseTime.toFixed(0)}ms
          {health.performance.withinThreshold ? '' : ` (threshold: ${health.performance.threshold}ms)`}
        </span>
      </div>

      {/* Database status */}
      <div className="flex items-center gap-2">
        <span className={health.services.database === 'ok' ? 'text-green-400' : 'text-red-400'}>
          {health.services.database === 'ok' ? '✓' : '✗'}
        </span>
        <span>Database: {health.services.database}</span>
      </div>

      {/* Last checked */}
      {lastChecked && (
        <div className="text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;
