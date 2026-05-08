# Performance Quick Reference

Fast lookup guide for implementing and testing performance requirements.

## Performance Thresholds

```
Link Redirects:      < 50ms  ⚡
API Responses:       < 300ms 
Page Loads:          < 3s
Critical Ops:        < 5s    🚨
```

## Key Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/health` | System health check | `{status, responseTime, services}` |
| `GET /api/health/metrics?period=1h` | Performance metrics | Aggregated stats, p95/p99 |
| `GET /api/health/performance-alert` | Alert thresholds | Configuration info |
| `POST /api/health/performance-alert` | Send performance alert | Queued for processing |
| `GET /api/redirect?url=...` | Fast link redirect | Tracked redirect |

## Common Usage

### Track Function Performance
```typescript
import { measureAsync, measureSync } from '@/lib/performance';

// Async function
const data = await measureAsync('fetch-user', async () => {
  return await db.users.findById(userId);
});

// Sync function
const result = measureSync('calculate-total', () => {
  return items.reduce((sum, item) => sum + item.price, 0);
});
```

### Use Redirect Endpoint
```html
<!-- Link with performance tracking -->
<a href="/api/redirect?url=/app/products">Learn More</a>

<!-- Without tracking -->
<a href="/api/redirect?url=/app/products&track=false">Learn More</a>
```

### Set Cache Headers
```typescript
import { getCacheControlHeader } from '@/lib/performance';

response.headers.set('Cache-Control', getCacheControlHeader('static'));
// For static assets: max-age=31536000, immutable

response.headers.set('Cache-Control', getCacheControlHeader('api'));
// For API: max-age=60, s-maxage=120

response.headers.set('Cache-Control', getCacheControlHeader('html'));
// For HTML: max-age=3600, s-maxage=86400
```

### Check System Health
```bash
# Quick health check
curl https://gemcybersecurityassist.com/api/health

# Get metrics
curl "https://gemcybersecurityassist.com/api/health/metrics?period=1h"

# Send alert
curl -X POST https://gemcybersecurityassist.com/api/health/performance-alert \
  -H "Content-Type: application/json" \
  -d '{"level":"WARNING","metric":{"duration":450,"path":"/api/kyc"}}'
```

## Testing

### Quick Test
```bash
# Test redirect speed
time curl -i "https://gemcybersecurityassist.com/api/redirect?url=/app"

# Test API response
time curl https://gemcybersecurityassist.com/api/health

# Run test suite
npm test -- performance.test.ts
```

### Load Test
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://gemcybersecurityassist.com/api/health

# Monitor response times and failure rate
```

## Monitoring

### What to Monitor
- Response times (aim for < 300ms average)
- Error rate (should be < 0.1%)
- P95/P99 latencies
- Database query times
- External API calls

### Alert Thresholds
```
⚠️  WARNING: > 300ms response time
🚨 CRITICAL: > 5s response time
❌ ERROR: Service down or error rate > 1%
```

## Performance Components

### 1. Performance Library (`src/lib/performance.ts`)
- `recordPerformanceMetric()` - Log a metric
- `measureAsync()` - Time async function
- `measureSync()` - Time sync function
- `validateLinkRedirect()` - Check redirect speed
- `getCacheControlHeader()` - Get cache headers
- `preloadResource()` - Preload assets
- `loadResourceAdaptive()` - Network-aware loading

### 2. Middleware (`src/middleware.ts`)
- Tracks all requests
- Adds security headers
- Logs slow requests (>1s)
- Sets performance timing headers

### 3. Health Endpoints
- `/api/health` - Current system status
- `/api/health/metrics` - Aggregated metrics
- `/api/health/performance-alert` - Alert system
- `/api/redirect` - Tracked redirects

### 4. Performance Monitor (`src/components/PerformanceMonitor.tsx`)
- Real-time system status
- Response time display
- Service health indicators
- Auto-refresh every 30s

## Troubleshooting

### Slow Redirects (> 50ms)
1. Check `/api/health` response time
2. Review redirect URL validation (might be blocking)
3. Check database connectivity
4. Review middleware overhead
5. Check external dependencies

### High API Response Times
1. Check database queries with `EXPLAIN`
2. Review external API calls
3. Check cache effectiveness
4. Profile with DevTools
5. Consider splitting into smaller requests

### Memory Leaks in Metrics
- Metrics endpoint has 10,000 request limit
- Older metrics automatically removed
- For production, use external database

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/performance.ts` | Core performance utilities |
| `src/middleware.ts` | Request tracking middleware |
| `src/app/api/health/route.ts` | Health check endpoint |
| `src/app/api/health/metrics/route.ts` | Metrics collection |
| `src/app/api/health/performance-alert/route.ts` | Alert receiver |
| `src/app/api/redirect/route.ts` | Link redirect tracking |
| `src/components/PerformanceMonitor.tsx` | Status component |
| `src/__tests__/performance.test.ts` | Test suite |
| `PERFORMANCE_GUIDE.md` | Complete documentation |
| `PERFORMANCE_CHECKLIST.md` | Implementation status |

## Environment Variables

Currently required (configured in `.env.project`):
```
NEXT_PUBLIC_APP_URL=https://gemcybersecurityassist.com
NODE_ENV=production
```

For monitoring integrations (optional):
```
SENTRY_DSN=...
DATADOG_API_KEY=...
CLOUDWATCH_REGION=...
```

## Next Steps

1. ✅ Core implementation complete
2. ⏳ Configure external monitoring services
3. ⏳ Run production load testing
4. ⏳ Set up on-call alerts
5. ⏳ Deploy and monitor

## Need Help?

- **Performance Issues**: Review `PERFORMANCE_GUIDE.md` troubleshooting
- **Testing**: Check `src/__tests__/performance.test.ts` examples
- **Endpoints**: See endpoint table above for usage
- **Monitoring**: Review monitoring section and SLOs

---

**Last Updated**: May 8, 2026
**Status**: Production Ready
