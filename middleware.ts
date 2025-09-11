import { NextRequest, NextResponse } from 'next/server';

// Edge-compatible in-memory rate limiter (no Node.js APIs)
type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
};

// Use a global store to persist counters across requests in the same region
declare global {
  // eslint-disable-next-line no-var
  var __edgeRateStore__: Map<string, number[]> | undefined;
}
const rateStore: Map<string, number[]> = (globalThis.__edgeRateStore__ ||=
  new Map<string, number[]>());

const getClientIp = (request: NextRequest): string => {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();
  return 'unknown';
};

const createRateLimitConfig = (
  windowMs: number,
  max: number
): RateLimitConfig => ({ windowMs, max });

const checkLimit = (
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult => {
  const now = Date.now();
  const ip = getClientIp(request);
  const windowStart = now - config.windowMs;

  const key = ip;
  const timestamps = rateStore.get(key) || [];

  // Remove timestamps outside the window
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= config.max) {
    const oldestRelevant = recent[0];
    const resetTime = oldestRelevant + config.windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    // Keep store trimmed
    rateStore.set(key, recent);
    return {
      success: false,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  // Allow and record this request
  recent.push(now);
  rateStore.set(key, recent);
  const remaining = Math.max(0, config.max - recent.length);
  const resetTime = recent[0] + config.windowMs;
  return {
    success: true,
    remaining,
    resetTime,
  };
};

// Create rate limit configuration for posts and comments
// 50 requests per 15 minutes (900,000 ms)
const postCommentRateLimit = createRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  50 // max requests
);

// Create rate limit configuration for general API endpoints
// 50 requests per minute
const generalRateLimit = createRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  50 // max requests
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    let rateLimitResult: RateLimitResult;

    // Apply stricter rate limiting for posts and comments
    // Comments are subcollections under posts (posts/{postId}/comments)
    if (pathname.includes('/posts') || pathname.includes('/comments')) {
      rateLimitResult = checkLimit(request, postCommentRateLimit);
    } else {
      // Apply general rate limiting for other routes
      rateLimitResult = checkLimit(request, generalRateLimit);
    }

    if (!rateLimitResult.success) {
      // Rate limit exceeded
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', '50');
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        rateLimitResult.resetTime.toString()
      );

      if (rateLimitResult.retryAfter) {
        response.headers.set(
          'Retry-After',
          rateLimitResult.retryAfter.toString()
        );
      }

      return response;
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '50');
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remaining.toString()
    );
    response.headers.set(
      'X-RateLimit-Reset',
      rateLimitResult.resetTime.toString()
    );

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
