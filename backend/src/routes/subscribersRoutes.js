import express from "express";
import Subscriber from "../models/Subscriber.js";
import requireAdmin from "../middleware/requireAdmin.js";
import createRateLimiter from "../middleware/rateLimit.js";

const router = express.Router();
const subscribeRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30 });

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function escapeRegex(input = "") {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Public: subscribe email
// POST /api/subscribers/subscribe
router.post("/subscribe", subscribeRateLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const source = String(req.body?.source || "website")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 80);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existing = await Subscriber.findOne({ email }).lean();
    if (existing) {
      return res.json({ ok: true, subscribed: false, message: "Email is already subscribed." });
    }

    await Subscriber.create({ email, source: source || "website" });
    return res.status(201).json({ ok: true, subscribed: true, message: "Subscribed successfully." });
  } catch (err) {
    console.error("POST /api/subscribers/subscribe failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin list
// GET /api/subscribers/list?page=1&limit=25&q=gmail
router.get("/list", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query?.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query?.limit || 25)));
    const q = String(req.query?.q || "").trim().toLowerCase().slice(0, 100);

    const filter = q
      ? {
          email: { $regex: escapeRegex(q), $options: "i" },
        }
      : {};

    const [total, items] = await Promise.all([
      Subscriber.countDocuments(filter),
      Subscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("email source createdAt")
        .lean(),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      items,
    });
  } catch (err) {
    console.error("GET /api/subscribers/list failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin export (Excel-compatible CSV)
// GET /api/subscribers/export.csv?q=gmail
router.get("/export.csv", requireAdmin, async (req, res) => {
  try {
    const q = String(req.query?.q || "").trim().toLowerCase().slice(0, 100);
    const filter = q
      ? {
          email: { $regex: escapeRegex(q), $options: "i" },
        }
      : {};

    const rows = await Subscriber.find(filter)
      .sort({ createdAt: -1 })
      .select("email source createdAt")
      .lean();

    const escapeCell = (value = "") => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
      return text;
    };

    const header = "Email,Source,Subscribed At";
    const lines = rows.map((r) => {
      const subscribedAt = r.createdAt ? new Date(r.createdAt).toISOString() : "";
      return [
        escapeCell(r.email || ""),
        escapeCell(r.source || "website"),
        escapeCell(subscribedAt),
      ].join(",");
    });

    const csv = [header, ...lines].join("\n");
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `subscribers-${stamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("GET /api/subscribers/export.csv failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin stats
// GET /api/subscribers/stats?days=30
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const requestedDays = Number(req.query?.days || 30);
    const days = Number.isFinite(requestedDays) ? Math.max(7, Math.min(365, requestedDays)) : 30;

    const now = new Date();
    const startRange = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));

    const totalSubscribers = await Subscriber.countDocuments();
    const subscribersInRange = await Subscriber.find({
      createdAt: { $gte: startRange, $lte: now },
    })
      .select("createdAt")
      .lean();

    const perDay = new Map();
    for (let i = 0; i < days; i += 1) {
      const d = new Date(startRange.getTime() + i * 24 * 60 * 60 * 1000);
      perDay.set(ymd(d), 0);
    }

    for (const sub of subscribersInRange) {
      const key = ymd(new Date(sub.createdAt));
      if (perDay.has(key)) perDay.set(key, (perDay.get(key) || 0) + 1);
    }

    const series = [...perDay.entries()].map(([date, newSubs]) => ({ date, newSubs }));
    const newSubscribersInRange = series.reduce((sum, row) => sum + row.newSubs, 0);

    const this7Start = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const prev7Start = startOfDay(new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000));
    const prev7End = new Date(this7Start.getTime() - 1);

    const [last7, prev7] = await Promise.all([
      Subscriber.countDocuments({ createdAt: { $gte: this7Start, $lte: now } }),
      Subscriber.countDocuments({ createdAt: { $gte: prev7Start, $lte: prev7End } }),
    ]);

    const growthPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : last7 > 0 ? 100 : 0;

    return res.json({
      totalSubscribers,
      newSubscribersInRange,
      last7,
      prev7,
      growthPct: Number(growthPct.toFixed(1)),
      series,
    });
  } catch (err) {
    console.error("GET /api/subscribers/stats failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
