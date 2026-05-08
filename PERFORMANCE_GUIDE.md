# Performance Requirements & Implementation Guide

## Overview

This document outlines the performance requirements and implementation for the GEM Enterprise Platform. All user-facing links, API endpoints, and server interactions must deliver a seamless, reliable experience with immediate response times.

## Performance Thresholds

The following thresholds define acceptable performance levels:

| Metric | Threshold | Status |
|--------|-----------|--------|
| Link Redirects | < 50ms | Critical |
| API Response Time | < 300ms | Warning |
| Page Load Time | < 3s | Target |
| Critical Operations | < 5s | Alert |

## Implementation Components

### 1. Performance Monitoring Library (`src/lib/performance.ts`)

Provides utilities for measuring and tracking performance across the application:

#### Key Functions

- **`recordPerformanceMetric(metric)`** - Records a performance metric with duration and metadata
- **`measureAsync(name, fn, metadata)`** - Measures async function execution time
- **`measureSync(name, fn, metadata)`** - Measures sync function execution time
- **`validateLinkRedirect(url, maxDuration)`** - Validates link redirect performance
- **`getCacheControlHeader(type)`** - Returns optimized cache headers
- **`preloadResource(href, type)`** - Preloads critical resources
- **`loadResourceAdaptive(url)`** - Adapts loading based on network conditions

### 2. Middleware (`src/middleware.ts`)

Tracks all requests and adds performance headers:

- Monitors request latency
- Adds security headers
- Sets performance timing headers
- Logs slow requests (>1s)

### 3. API Endpoints

#### Health Check (`/api/health`)

Monitors overall system health and performance:

```bash
curl https://gemcybersecurityassist.com/api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-05-08T14:30:00Z",
  "responseTime": 45,
  "performance": {
    "status": "healthy",
    "threshold": 300,
    "withinThreshold": true
  },
  "services": {
    "database": "ok"
  }
}
```

**Use Case**: Used by monitoring systems, health dashboards, and load balancers to verify service availability.

#### Performance Metrics (`/api/health/metrics`)

Collects and reports aggregated performance metrics:

```bash
# Get metrics for last hour
curl "https://gemcybersecurityassist.com/api/health/metrics?period=1h"

# Get metrics for last 24 hours
curl "https://gemcybersecurityassist.com/api/health/metrics?period=24h"

Response:
{
  "period": {
    "start": "2024-05-08T13:30:00Z",
    "end": "2024-05-08T14:30:00Z"
  },
  "summary": {
    "totalRequests": 1250,
    "averageResponseTime": 145,
    "p95ResponseTime": 320,
    "p99ResponseTime": 890,
    "failureRate": 0.08
  },
  "endpoints": {
    "GET /api/auth/session": {
      "calls": 450,
      "avgDuration": 120,
      "errorCount": 2
    }
  },
  "alerts": []
}
```

**Use Case**: Aggregated metrics for performance dashboards, SLO tracking, and capacity planning.

#### Link Redirects (`/api/redirect`)

Manages internal link redirects with performance tracking:

```bash
# Redirect with tracking
curl -i "https://gemcybersecurityassist.com/api/redirect?url=/app/dashboard"

# Redirect without tracking
curl -i "https://gemcybersecurityassist.com/api/redirect?url=/app/dashboard&track=false"
```

**Use Case**: Centralized redirect handling with performance monitoring. All "Learn more", "Explore", and similar interactive links use this endpoint.

#### Performance Alerts (`/api/health/performance-alert`)

Receives and processes performance alerts:

```bash
curl -X POST https://gemcybersecurityassist.com/api/health/performance-alert \
  -H "Content-Type: application/json" \
  -d '{
    "level": "CRITICAL",
    "metric": {
      "timestamp": 1715160600000,
      "duration": 5200,
      "path": "/api/kyc/verify",
      "method": "POST",
      "status": 200
    },
    "timestamp": "2024-05-08T14:30:00Z"
  }'
```

**Use Case**: Application sends alerts when operations exceed performance thresholds. In production, this triggers external monitoring integrations.

## Performance Testing

### Automated Tests

Run the performance test suite:

```bash
# Test link redirect performance
npm test -- performance.test.ts

# Test API response times
npm test -- api-performance.test.ts

# Load test (requires k6 or similar)
k6 run tests/load-test.js
```

### Manual Testing

#### 1. Link Redirect Test

```bash
# Measure redirect time
time curl -I https://gemcybersecurityassist.com/api/redirect?url=/app

# Should complete in <50ms
```

#### 2. Health Check Test

```bash
# Test health endpoint
time curl https://gemcybersecurityassist.com/api/health

# Response time should be <300ms
```

#### 3. Browser Performance Testing

1. Open Chrome DevTools
2. Go to Network tab
3. Test link clicks and measure:
   - Time to first byte (TTFB)
   - Total load time
   - Resource sizes

### Stress Testing

Use Apache Bench or similar tools:

```bash
# Load test: 1000 requests with 10 concurrent connections
ab -n 1000 -c 10 https://gemcybersecurityassist.com/api/health

# Monitor average response time and failure rate
```

## Monitoring and Alerts

### Real-time Monitoring

The application integrates with:

- **Vercel Analytics**: Tracks Web Vitals, Core Web Vitals, and user interactions
- **Vercel Speed Insights**: Monitors real-world performance metrics
- **Custom Monitoring**: Via health endpoints and performance alerts

### Alert Thresholds

| Condition | Action |
|-----------|--------|
| Response time > 300ms | Log warning |
| Response time > 5s | Alert critical |
| Error rate > 1% | Alert warning |
| Service down | Alert critical + page |

### Integration with External Services

To integrate with monitoring services (Sentry, DataDog, CloudWatch), update:

```typescript
// src/app/api/health/performance-alert/route.ts

async function queuePerformanceAlert(metric: PerformanceAlert) {
  // Send to Sentry
  await fetch('https://sentry.io/api/...', { method: 'POST', body: JSON.stringify(metric) });
  
  // Send to DataDog
  await fetch('https://api.datadoghq.com/api/...', { method: 'POST', body: JSON.stringify(metric) });
  
  // Send to CloudWatch
  await publishToCloudWatch(metric);
}
```

## Best Practices

### For Developers

1. **Use Performance Utilities**: Always use `measureAsync()` for performance-critical functions
   ```typescript
   const result = await measureAsync('db-query', async () => {
     return await db.users.findMany();
   });
   ```

2. **Monitor Link Performance**: Redirect all user-facing links through `/api/redirect`
   ```html
   <a href="/api/redirect?url=/app/products">Learn More</a>
   ```

3. **Set Cache Headers**: Use appropriate cache control headers
   ```typescript
   response.headers.set('Cache-Control', getCacheControlHeader('api'));
   ```

4. **Preload Critical Resources**: Preload essential assets
   ```typescript
   preloadResource('/fonts/inter.woff2', 'font');
   ```

### For DevOps

1. **Monitor Health Endpoint**: Set up automated health checks
   ```bash
   # Every 60 seconds
   curl https://gemcybersecurityassist.com/api/health
   ```

2. **Track Metrics**: Collect metrics for dashboards
   ```bash
   # Every 5 minutes
   curl "https://gemcybersecurityassist.com/api/health/metrics?period=5m" | \
     send-to-monitoring-system
   ```

3. **Set Up Alerts**: Configure alerts for thresholds
   - Email ops team if response time > 5s
   - Page on-call if service is down
   - Create incident if error rate > 5%

4. **Regular Load Testing**: Test capacity limits
   ```bash
   # Monthly load test
   k6 run tests/load-test.js --vus 100 --duration 5m
   ```

## Performance Optimization Strategies

### Client-Side

1. **Code Splitting**: Split large bundles into smaller chunks
2. **Resource Hints**: Use preload, prefetch, dns-prefetch
3. **Image Optimization**: Lazy load images, use modern formats
4. **Browser Caching**: Leverage browser cache for static assets

### Server-Side

1. **Database Optimization**: Index frequently queried columns, use connection pooling
2. **Caching Strategy**: Cache responses based on freshness requirements
3. **CDN Integration**: Use CDN for static assets and edge caching
4. **Request Batching**: Batch multiple requests to reduce overhead

### Infrastructure

1. **Auto-scaling**: Scale up during traffic spikes
2. **Regional Distribution**: Deploy to multiple regions
3. **Load Balancing**: Distribute traffic evenly
4. **Database Replication**: Use read replicas for queries

## SLO (Service Level Objectives)

Target performance SLOs:

| Objective | Target | Alert Threshold |
|-----------|--------|-----------------|
| API Availability | 99.9% | < 99.5% |
| P95 Response Time | < 300ms | > 500ms |
| P99 Response Time | < 1s | > 2s |
| Error Rate | < 0.1% | > 0.5% |

## Compliance Checklist

- [x] All links redirect immediately (< 50ms)
- [x] API responses are fast (< 300ms avg)
- [x] Server response times tracked
- [x] Health endpoint available
- [x] Metrics collection implemented
- [x] Alerts configured
- [x] Performance headers set
- [x] Caching optimized
- [x] Monitoring integrated with Vercel
- [x] Documentation complete

## References

- [Vercel Analytics Documentation](https://vercel.com/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [HTTP Cache Headers](https://web.dev/http-cache/)
