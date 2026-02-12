const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function stripDangerousKeys(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      stripDangerousKeys(item, seen);
    }
    return;
  }

  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.has(key)) {
      delete value[key];
      continue;
    }
    stripDangerousKeys(value[key], seen);
  }
}

export default function sanitizeRequest(req, res, next) {
  stripDangerousKeys(req.body);
  stripDangerousKeys(req.query);
  stripDangerousKeys(req.params);
  next();
}

