import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv();

// Create rate limiter for performance recalculation
const createRateLimiter = (requests: number, window: string) => {
  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
  });
};

// Rate limiters for different actions
export const rateLimiters = {
  // Rate limiting for performance recalculation (heavy operation)
  recalculatePerformance: createRateLimiter(5, "86400 s"), // 1 request per 12 hours.
};

export const getClientIP = async () => {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "127.0.0.1";
};

export const checkRateLimit = async (limiter: Ratelimit, identifier?: string) => {
  const ip = await getClientIP();
  const key = identifier ? `${ip}:${identifier}` : ip;

  const { success, limit, reset, remaining } = await limiter.limit(key);

  return {
    success,
    limit,
    reset,
    remaining,
    retryAfter: success ? 0 : Math.ceil((reset - Date.now()) / 1000),
  };
};

// Higher-order function to wrap server actions with rate limiting
export const withRateLimit = <T extends any[], R>(
  action: (...args: T) => Promise<R>,
  limiter: Ratelimit,
  identifier?: string
) => {
  return async (...args: T): Promise<R> => {
    const rateLimitResult = await checkRateLimit(limiter, identifier);

    if (!rateLimitResult.success) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    return action(...args);
  };
};
