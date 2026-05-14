type Bucket = { timestamps: number[] };

type RateLimiter = {
  limit: (key: string) => Promise<{
    success: boolean;
    limit: number;
    reset: number;
    remaining: number;
  }>;
};

const buckets = new Map<string, Bucket>();

const createRateLimiter = (requests: number, windowMs: number): RateLimiter => {
  return {
    async limit(key: string) {
      const now = Date.now();
      const cutoff = now - windowMs;
      const existing = buckets.get(key);
      const recent = existing ? existing.timestamps.filter((t) => t > cutoff) : [];
      const success = recent.length < requests;

      if (success) {
        recent.push(now);
      }

      if (recent.length === 0) {
        buckets.delete(key);
      } else {
        buckets.set(key, { timestamps: recent });
      }

      const oldest = recent[0] ?? now;
      return {
        success,
        limit: requests,
        reset: oldest + windowMs,
        remaining: Math.max(0, requests - recent.length),
      };
    },
  };
};

export const rateLimiters = {
  // 5 recalculations per 24h per portfolio
  recalculatePerformance: createRateLimiter(5, 24 * 60 * 60 * 1000),
};
