import { NextRequest, NextResponse } from 'next/server';

/**
 * Performance middleware for monitoring all requests
 * Tracks response times and adds performance headers
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestPath = request.nextUrl.pathname;
  
  // Create response clone to add headers
  let response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Track request for performance monitoring
  // In production, this would be sent to monitoring service
  const responseTime = Date.now() - startTime;
  
  // Add performance timing header (visible in browser DevTools)
  response.headers.set('Server-Timing', `total;dur=${responseTime}`);
  
  // Log slow requests (>1s)
  if (responseTime > 1000) {
    console.warn(`[MIDDLEWARE] Slow request detected: ${requestPath} took ${responseTime}ms`);
  }
  
  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Match all routes except static files and next internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
