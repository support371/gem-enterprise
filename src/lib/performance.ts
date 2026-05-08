/**
 * Performance Monitoring and Optimization Utilities
 * Implements tracking for link redirects, API response times, and system health
 */

export interface PerformanceMetric {
  timestamp: number;
  duration: number;
  path: string;
  method?: string;
  status?: number;
  cached?: boolean;
  metadata?: Record<string, any>;
}

export interface RouteLatencyAlert {
  threshold: number;
  severity: 'warning' | 'critical';
  notifyEmail?: string;
}

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  LINK_REDIRECT: 50, // Links should redirect in <50ms
  API_RESPONSE: 300, // API calls should respond in <300ms
  PAGE_LOAD: 3000, // Pages should load in <3s
  CRITICAL_THRESHOLD: 5000, // Critical alerts above 5s
} as const;

/**
 * Monitors and logs route performance metrics
 * Should be called in middleware or API route handlers
 */
export function recordPerformanceMetric(metric: PerformanceMetric): void {
  if (typeof window === 'undefined') {
    // Server-side: Log to monitoring system
    const level = metric.duration > PERFORMANCE_THRESHOLDS.CRITICAL_THRESHOLD ? 'error' : 'info';
    console.log(`[PERF] ${level.toUpperCase()}: ${metric.path} took ${metric.duration}ms`);
    
    // Send to monitoring service if duration exceeds threshold
    if (metric.duration > PERFORMANCE_THRESHOLDS.API_RESPONSE && metric.method) {
      queuePerformanceAlert(metric);
    }
  } else {
    // Client-side: Use Web Vitals
    if (window.performance && window.performance.mark) {
      window.performance.mark(`perf-${metric.path}-end`);
    }
  }
}

/**
 * Measures execution time of a function
 * Used for performance-critical operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    recordPerformanceMetric({
      timestamp: Date.now(),
      duration,
      path: name,
      metadata,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    recordPerformanceMetric({
      timestamp: Date.now(),
      duration,
      path: `${name}-ERROR`,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Measures synchronous function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>,
): T {
  const startTime = performance.now();
  
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    
    recordPerformanceMetric({
      timestamp: Date.now(),
      duration,
      path: name,
      metadata,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    recordPerformanceMetric({
      timestamp: Date.now(),
      duration,
      path: `${name}-ERROR`,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

/**
 * Queue performance alert for high-latency operations
 * In production, this would send to monitoring service (Sentry, DataDog, etc.)
 */
async function queuePerformanceAlert(metric: PerformanceMetric): Promise<void> {
  // This would typically call your monitoring service
  // For now, we log it and could integrate with external services
  const alertLevel = metric.duration > PERFORMANCE_THRESHOLDS.CRITICAL_THRESHOLD ? 'CRITICAL' : 'WARNING';
  
  try {
    await fetch('/api/health/performance-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: alertLevel,
        metric,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail if alert endpoint is down - don't block request
      console.error('[PERF] Failed to queue performance alert');
    });
  } catch (error) {
    // Ensure alerts don't crash the application
    console.error('[PERF] Error queueing performance alert:', error);
  }
}

/**
 * Creates a cache control header value
 * Optimizes caching for different content types
 */
export function getCacheControlHeader(contentType: 'static' | 'api' | 'html' | 'image'): string {
  const cacheHeaders = {
    static: 'public, max-age=31536000, immutable', // 1 year for static assets
    api: 'public, max-age=60, s-maxage=120', // 1 minute client, 2 minutes CDN
    html: 'public, max-age=3600, s-maxage=86400', // 1 hour client, 1 day CDN
    image: 'public, max-age=2592000, s-maxage=31536000', // 30 days client, 1 year CDN
  };
  
  return cacheHeaders[contentType];
}

/**
 * Validates link redirect performance
 * Ensures redirects complete within acceptable threshold
 */
export async function validateLinkRedirect(
  originalUrl: string,
  redirectUrl: string,
  maxDuration: number = PERFORMANCE_THRESHOLDS.LINK_REDIRECT,
): Promise<{ success: boolean; duration: number; withinThreshold: boolean }> {
  const startTime = performance.now();
  
  try {
    // Measure redirect time with fetch
    const response = await fetch(redirectUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    const duration = performance.now() - startTime;
    
    return {
      success: response.ok,
      duration,
      withinThreshold: duration <= maxDuration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    
    return {
      success: false,
      duration,
      withinThreshold: false,
    };
  }
}

/**
 * Preload critical resources to improve perceived performance
 */
export function preloadResource(href: string, type: 'script' | 'style' | 'font'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Implements connection-aware resource loading
 * Adapts loading strategy based on network conditions
 */
export async function loadResourceAdaptive(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection.saveData) {
      // User has enabled data saver - use lighter resources
      options = { ...options, headers: { ...options?.headers, 'X-Data-Saver': 'true' } };
    }
    
    if (connection.effectiveType === '4g') {
      // Fast connection - load additional resources
      options = { ...options, priority: 'high' as any };
    } else if (connection.effectiveType === '2g' || connection.effectiveType === '3g') {
      // Slow connection - defer non-critical resources
      options = { ...options, priority: 'low' as any };
    }
  }
  
  return fetch(url, options);
}
