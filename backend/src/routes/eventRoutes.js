import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

/**
 * POST /api/events
 * Collect analytics events
 */
router.post("/", async (req, res) => {
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

    if (!type || !sessionId) {
      return res.status(400).json({
        error: "type and sessionId are required",
      });
    }

    const allowedTypes = ["page_view", "click", "read", "edit"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid event type: ${type}`,
      });
    }

    const event = await Event.create({
      type,
      sessionId,
      path,
      articleId,
      title,
      category,
      section,
      readTimeSec: Number(readTimeSec) || 0,
      userAgent: req.get("user-agent") || "",
      ip:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "",
    });

    return res.json({
      ok: true,
      id: event._id,
    });
  } catch (err) {
    console.error("POST /api/events failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/events/recent
 * Debug: show latest tracked events (helps you see real paths)
 */
router.get("/recent", async (req, res) => {
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