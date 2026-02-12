import express from "express";
import jwt from "jsonwebtoken";
import Event from "../models/Event.js";

const router = express.Router();

function signAdminToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

/**
 * Reads JWT from: Authorization: Bearer <token>
 * Confirms token + role=admin
 */
function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "JWT_SECRET missing" });

    const decoded = jwt.verify(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.admin = decoded; // { email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({
      message: "ADMIN_EMAIL or ADMIN_PASSWORD missing in backend .env",
    });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAdminToken({ email, role: "admin" });

  return res.json({
    token,
    admin: { email, role: "admin" },
  });
});

// GET /api/admin/stats (PROTECTED)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6); // last 7 days
    start.setHours(0, 0, 0, 0);

    const events = await Event.find({
      createdAt: { $gte: start, $lte: now },
    }).lean();

    const pageViews = events.filter((e) => e.type === "page_view");
    const totalViews = pageViews.length;
    const uniqueVisitors = new Set(events.map((e) => e.sessionId)).size;

    const reads = events.filter((e) => e.type === "read");
    const avgReadTimeSec = reads.length
      ? Math.round(reads.reduce((sum, r) => sum + (r.readTimeSec || 0), 0) / reads.length)
      : 0;

    // bounceRate: sessions with only 1 event
    const sessionCounts = new Map();
    for (const e of events) {
      sessionCounts.set(e.sessionId, (sessionCounts.get(e.sessionId) || 0) + 1);
    }
    const sessions = [...sessionCounts.values()];
    const bounceRate = sessions.length
      ? Number(((sessions.filter((c) => c === 1).length / sessions.length) * 100).toFixed(1))
      : 0;

    // viewsByDay (Mon..Sun)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const viewsByDayMap = new Map([
      ["Mon", 0],
      ["Tue", 0],
      ["Wed", 0],
      ["Thu", 0],
      ["Fri", 0],
      ["Sat", 0],
      ["Sun", 0],
    ]);

    for (const e of pageViews) {
      const d = days[new Date(e.createdAt).getDay()];
      viewsByDayMap.set(d, (viewsByDayMap.get(d) || 0) + 1);
    }

    const viewsByDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      day: d,
      views: viewsByDayMap.get(d) || 0,
    }));

    // derive category from URL path (and skip admin pages)
    function categoryFromPath(path = "") {
      const p = String(path).toLowerCase();

      if (p.startsWith("/admin")) return null;

      if (p === "/" || p.startsWith("/home")) return "Home";
      if (p.startsWith("/worldnews") || p.startsWith("/world")) return "World";
      if (p.startsWith("/tech") || p.startsWith("/technology") || p.startsWith("/technews")) return "Tech";
      if (p.startsWith("/health") || p.startsWith("/healthnews")) return "Health";
      if (p.startsWith("/politics") || p.startsWith("/politicsnews")) return "Politics";
      if (p.startsWith("/business") || p.startsWith("/businessnews")) return "Business";
      if (p.startsWith("/sports") || p.startsWith("/sportsnews")) return "Sports";
      if (p.startsWith("/culture") || p.startsWith("/culturenews")) return "Culture";
      if (p.startsWith("/podcast") || p.startsWith("/podcastnews")) return "Podcast";

      return "Other";
    }

    // categoryTraffic (% share)
    const catCounts = {};
    let countedViews = 0;

    for (const e of pageViews) {
      const cat = e.category || categoryFromPath(e.path);
      if (!cat) continue;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      countedViews += 1;
    }

    const totalCat = countedViews || 1;
    const categoryTraffic = Object.entries(catCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / totalCat) * 100),
    }));

    // topArticles
    const articleCounts = {};
    for (const e of pageViews) {
      const key = e.title || e.articleId || e.path || "Untitled";
      articleCounts[key] = (articleCounts[key] || 0) + 1;
    }
    const topArticles = Object.entries(articleCounts)
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    // sectionEdits
    const editEvents = events.filter((e) => e.type === "edit");
    const editsBySection = {};
    for (const e of editEvents) {
      const s = e.section || "Other";
      editsBySection[s] = (editsBySection[s] || 0) + 1;
    }
    const sectionEdits = Object.entries(editsBySection).map(([section, edits]) => ({
      section,
      edits,
    }));

    return res.json({
      kpis: { totalViews, uniqueVisitors, avgReadTimeSec, bounceRate },
      viewsByDay,
      categoryTraffic,
      topArticles,
      sectionEdits,
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;