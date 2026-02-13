export default function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  maxEntries = 50000,
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

  function normalizeKey(input) {
    const raw = String(input || "unknown").trim();
    if (!raw) return "unknown";
    return raw.slice(0, 120);
  }

  function enforceStoreLimit() {
    if (store.size <= maxEntries) return;
    const toRemove = store.size - maxEntries;
    let removed = 0;
    for (const key of store.keys()) {
      store.delete(key);
      removed += 1;
      if (removed >= toRemove) break;
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    cleanup(now);
    enforceStoreLimit();
    const resetAt = now + windowMs;

    const key = normalizeKey(keyGenerator(req));
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
