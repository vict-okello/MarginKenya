const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const MAX_DEPTH = 20;
const MAX_VISITED_NODES = 5000;

function stripDangerousKeys(value, seen = new WeakSet(), state = { visited: 0 }, depth = 0) {
  if (!value || typeof value !== "object") return;
  if (depth > MAX_DEPTH) throw new Error("Request payload is too deeply nested");
  if (seen.has(value)) return;
  if (state.visited >= MAX_VISITED_NODES) throw new Error("Request payload is too large");

  state.visited += 1;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      stripDangerousKeys(item, seen, state, depth + 1);
    }
    return;
  }

  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.has(key)) {
      delete value[key];
      continue;
    }
    stripDangerousKeys(value[key], seen, state, depth + 1);
  }
}

export default function sanitizeRequest(req, res, next) {
  try {
    stripDangerousKeys(req.body);
    stripDangerousKeys(req.query);
    stripDangerousKeys(req.params);
    return next();
  } catch (err) {
    return res.status(400).json({ message: err?.message || "Invalid request payload" });
  }
}
