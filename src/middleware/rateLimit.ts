import { NextFunction, Request, Response } from "express";
import {
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "../env/system";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const defaultKeyGenerator = (req: Request): string =>
  (req.ip || req.socket.remoteAddress || "unknown").trim();

const toPositiveInt = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;

export const createRateLimit = (options: RateLimitOptions) => {
  const windowMs = toPositiveInt(options.windowMs, 60_000);
  const max = toPositiveInt(options.max, 60);
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;
  const buckets = new Map<string, Bucket>();
  let lastCleanupAt = Date.now();

  const cleanupExpiredBuckets = (now: number): void => {
    if (now - lastCleanupAt < windowMs) {
      return;
    }

    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }

    lastCleanupAt = now;
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    if (options.skip?.(req)) {
      next();

      return;
    }

    const now = Date.now();
    cleanupExpiredBuckets(now);

    const key = keyGenerator(req);
    const current = buckets.get(key);
    const bucket =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(max - bucket.count, 0);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(bucket.resetAt / 1000)),
    );

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(
        Math.ceil((bucket.resetAt - now) / 1000),
        1,
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ error: options.message });

      return;
    }

    next();
  };
};

export const globalRateLimit = createRateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests. Please try again shortly.",
  skip: (req) => req.path.startsWith("/v1/auth"),
});

export const authRateLimit = createRateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many authentication attempts. Please try again later.",
});
