import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  measureAsync,
  measureSync,
  validateLinkRedirect,
  getCacheControlHeader,
  PERFORMANCE_THRESHOLDS,
} from '@/lib/performance';

describe('Performance Utilities', () => {
  describe('measureAsync', () => {
    it('should measure async function execution time', async () => {
      const result = await measureAsync('test-async', async () => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should handle async errors', async () => {
      await expect(
        measureAsync('test-error', async () => {
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');
    });
  });

  describe('measureSync', () => {
    it('should measure sync function execution time', () => {
      const result = measureSync('test-sync', () => {
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should handle sync errors', () => {
      expect(() => {
        measureSync('test-error', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });
  });

  describe('getCacheControlHeader', () => {
    it('should return correct cache header for static assets', () => {
      const header = getCacheControlHeader('static');
      expect(header).toContain('max-age=31536000');
      expect(header).toContain('immutable');
    });

    it('should return correct cache header for API responses', () => {
      const header = getCacheControlHeader('api');
      expect(header).toContain('max-age=60');
      expect(header).toContain('s-maxage=120');
    });

    it('should return correct cache header for HTML', () => {
      const header = getCacheControlHeader('html');
      expect(header).toContain('max-age=3600');
      expect(header).toContain('s-maxage=86400');
    });

    it('should return correct cache header for images', () => {
      const header = getCacheControlHeader('image');
      expect(header).toContain('max-age=2592000');
      expect(header).toContain('s-maxage=31536000');
    });
  });

  describe('validateLinkRedirect', () => {
    it('should validate successful redirects', async () => {
      const result = await validateLinkRedirect('http://example.com', 'http://example.com/target');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('withinThreshold');
    });

    it('should check if redirect is within threshold', async () => {
      const result = await validateLinkRedirect(
        'http://example.com',
        'http://example.com/target',
        100, // 100ms threshold
      );

      expect(result.withinThreshold).toBeBoolean();
    });
  });

  describe('Performance Thresholds', () => {
    it('should have defined thresholds', () => {
      expect(PERFORMANCE_THRESHOLDS.LINK_REDIRECT).toBe(50);
      expect(PERFORMANCE_THRESHOLDS.API_RESPONSE).toBe(300);
      expect(PERFORMANCE_THRESHOLDS.PAGE_LOAD).toBe(3000);
      expect(PERFORMANCE_THRESHOLDS.CRITICAL_THRESHOLD).toBe(5000);
    });

    it('thresholds should be in ascending order', () => {
      const values = Object.values(PERFORMANCE_THRESHOLDS);
      const sorted = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sorted);
    });
  });
});

describe('Health Endpoint', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  it('should return 200 for healthy system', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('responseTime');
  });

  it('should respond within threshold', async () => {
    const startTime = performance.now();
    const response = await fetch(`${baseUrl}/api/health`);
    const duration = performance.now() - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE * 2); // Allow 2x threshold
  });

  it('should include performance metrics', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();

    expect(data).toHaveProperty('performance');
    expect(data.performance).toHaveProperty('status');
    expect(data.performance).toHaveProperty('threshold');
    expect(data.performance).toHaveProperty('withinThreshold');
  });
});

describe('Metrics Endpoint', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  it('should return metrics summary', async () => {
    const response = await fetch(`${baseUrl}/api/health/metrics?period=1h`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('period');
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('endpoints');
  });

  it('should calculate correct summary statistics', async () => {
    const response = await fetch(`${baseUrl}/api/health/metrics?period=1h`);
    const data = await response.json();

    expect(data.summary).toHaveProperty('totalRequests');
    expect(data.summary).toHaveProperty('averageResponseTime');
    expect(data.summary).toHaveProperty('p95ResponseTime');
    expect(data.summary).toHaveProperty('p99ResponseTime');
    expect(data.summary).toHaveProperty('failureRate');
  });
});

describe('Redirect Endpoint', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  it('should reject missing url parameter', async () => {
    const response = await fetch(`${baseUrl}/api/redirect`);
    expect(response.status).toBe(400);
  });

  it('should reject invalid URLs', async () => {
    const response = await fetch(`${baseUrl}/api/redirect?url=http://evil.com`);
    expect(response.status).toBe(400);
  });

  it('should allow internal redirects', async () => {
    const response = await fetch(`${baseUrl}/api/redirect?url=/app/dashboard`, {
      redirect: 'manual',
    });
    expect([302, 307]).toContain(response.status);
  });

  it('should redirect quickly', async () => {
    const startTime = performance.now();
    await fetch(`${baseUrl}/api/redirect?url=/app/dashboard`, {
      redirect: 'manual',
    });
    const duration = performance.now() - startTime;

    // Redirect should complete quickly (accounting for network latency)
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.LINK_REDIRECT * 2);
  });
});
