import express from "express";
import Event from "../models/Event.js";
import requireAdmin from "../middleware/requireAdmin.js";
import createRateLimiter from "../middleware/rateLimit.js";

const router = express.Router();
const ingestRateLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 600 });
const debugRateLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 60 });

function cleanText(value = "", maxLen = 300) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function normalizePath(value = "") {
  const raw = cleanText(value, 260);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

/**
 * POST /api/events
 * Collect analytics events
 */
router.post("/", ingestRateLimiter, async (req, res) => {
  try {
    const {
      type,
      sessionId,
      path = "",
      articleId = "",
      title = "",
      category = "",
      section = "",
      readTimeSec = 0,
    } = req.body || {};
    const cleanSessionId = cleanText(sessionId, 120);

    if (!type || !cleanSessionId || !/^[a-zA-Z0-9._:-]{8,120}$/.test(cleanSessionId)) {
      return res.status(400).json({
        error: "type and a valid sessionId are required",
      });
    }

    const allowedTypes = ["page_view", "article_view", "click", "read", "edit"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid event type: ${type}`,
      });
    }

    const payload = {
      type,
      sessionId: cleanSessionId,
      path: normalizePath(path),
      articleId: cleanText(articleId, 120),
      title: cleanText(title, 220),
      category: cleanText(category, 60),
      section: cleanText(section, 60),
      readTimeSec: Math.max(0, Math.min(7200, Number(readTimeSec) || 0)),
      userAgent: cleanText(req.get("user-agent") || "", 500),
      ip:
        cleanText(req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "", 80) ||
        req.socket?.remoteAddress ||
        "",
      createdAt: new Date().toISOString(),
    };

    const event = await Event.create(payload);

    return res.json({
      ok: true,
      id: event?._id || "",
      source: "db",
    });
  } catch (err) {
    console.error("POST /api/events failed:", err);
    return res.status(500).json({ error: "Failed to store event" });
  }
});

/**
 * GET /api/events/recent
 * Debug: show latest tracked events (helps you see real paths)
 */
router.get("/recent", requireAdmin, debugRateLimiter, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.json(
      events.map((e) => ({
        type: e.type,
        path: e.path,
        category: e.category,
        title: e.title,
        createdAt: e.createdAt,
      }))
    );
  } catch (err) {
    console.error("GET /api/events/recent failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
