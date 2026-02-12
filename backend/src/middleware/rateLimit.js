export default function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  keyGenerator = (req) => {
    const forwarded = String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      ?.trim()
      ?.replace(/^::ffff:/, "");
    return forwarded || req.ip || "unknown";
  },
} = {}) {
  const store = new Map();

  function cleanup(now) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.start >= windowMs) {
        store.delete(key);
      }
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    cleanup(now);
    const resetAt = now + windowMs;

    const key = String(keyGenerator(req) || "unknown");
    const existing = store.get(key);

    if (!existing || now - existing.start >= windowMs) {
      store.set(key, { count: 1, start: now });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - 1)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      return next();
    }

    existing.count += 1;
    const retryAfterSec = Math.ceil((windowMs - (now - existing.start)) / 1000);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - existing.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil((existing.start + windowMs) / 1000)));

    if (existing.count > max) {
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    return next();
  };
}
