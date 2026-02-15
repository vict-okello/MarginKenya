import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Event from "../models/Event.js";
import createRateLimiter from "../middleware/rateLimit.js";
import requireAdmin from "../middleware/requireAdmin.js";
import adminInvitesRoutes from "./adminInvitesRoutes.js";


const router = express.Router();
const loginRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

function emptyStatsPayload() {
  return {
    kpis: { totalViews: 0, uniqueVisitors: 0, avgReadTimeSec: 0, bounceRate: 0 },
    viewsByDay: [
      { day: "Mon", views: 0 },
      { day: "Tue", views: 0 },
      { day: "Wed", views: 0 },
      { day: "Thu", views: 0 },
      { day: "Fri", views: 0 },
      { day: "Sat", views: 0 },
      { day: "Sun", views: 0 },
    ],
    categoryTraffic: [],
    topArticles: [],
    articleReadStats: [],
    sectionEdits: [],
  };
}

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

function buildStatsFromEvents(events = []) {
  const pageViews = events.filter((e) => e.type === "page_view");
  const articleViews = events.filter((e) => e.type === "article_view");
  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(events.map((e) => e.sessionId)).size;

  const reads = events.filter((e) => e.type === "read");
  const avgReadTimeSec = reads.length
    ? Math.round(reads.reduce((sum, r) => sum + (r.readTimeSec || 0), 0) / reads.length)
    : 0;

  const sessionCounts = new Map();
  for (const e of events) {
    sessionCounts.set(e.sessionId, (sessionCounts.get(e.sessionId) || 0) + 1);
  }
  const sessions = [...sessionCounts.values()];
  const bounceRate = sessions.length
    ? Number(((sessions.filter((c) => c === 1).length / sessions.length) * 100).toFixed(1))
    : 0;

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

  const catCounts = {};
  let countedViews = 0;
  const trafficEvents = [...pageViews, ...articleViews];
  for (const e of trafficEvents) {
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

  const articleCounts = {};
  const articleSource = articleViews.length ? articleViews : pageViews;
  for (const e of articleSource) {
    const key = e.title || e.articleId || e.path || "Untitled";
    articleCounts[key] = (articleCounts[key] || 0) + 1;
  }
  const topArticles = Object.entries(articleCounts)
    .map(([title, views]) => ({ title, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Per-article read-time stats from "read" events.
  const articleTitleById = new Map();
  for (const view of articleViews) {
    const id = String(view?.articleId || "").trim();
    const title = String(view?.title || "").trim();
    if (id && title) articleTitleById.set(id, title);
  }

  const readBuckets = new Map();
  for (const r of reads) {
    const key = r.articleId || r.title || r.path || "untitled";
    const articleId = String(r.articleId || "").trim();
    const resolvedTitleFromViews = articleId ? articleTitleById.get(articleId) : "";
    const fallbackTitle = String(r.title || "").trim();

    const current = readBuckets.get(key) || {
      articleId: articleId || "",
      title: resolvedTitleFromViews || fallbackTitle || r.path || "Untitled",
      reads: 0,
      totalReadTimeSec: 0,
    };

    current.reads += 1;
    current.totalReadTimeSec += Number(r.readTimeSec || 0);
    if (!current.articleId && articleId) current.articleId = articleId;
    if ((!current.title || current.title === "Untitled") && resolvedTitleFromViews) {
      current.title = resolvedTitleFromViews;
    } else if ((!current.title || current.title === "Untitled") && fallbackTitle) {
      current.title = fallbackTitle;
    }
    readBuckets.set(key, current);
  }

  const articleReadStats = [...readBuckets.values()]
    .map((item) => ({
      articleId: item.articleId || "",
      title: item.title,
      reads: item.reads,
      avgReadTimeSec: item.reads ? Math.round(item.totalReadTimeSec / item.reads) : 0,
    }))
    .sort((a, b) => b.avgReadTimeSec - a.avgReadTimeSec)
    .slice(0, 20);

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

  return {
    kpis: { totalViews, uniqueVisitors, avgReadTimeSec, bounceRate },
    viewsByDay,
    categoryTraffic,
    topArticles,
    articleReadStats,
    sectionEdits,
  };
}

function signAdminToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");
  const issuer = process.env.JWT_ISSUER || "marginkenya-admin";
  const audience = process.env.JWT_AUDIENCE || "marginkenya-dashboard";

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer,
    audience,
    subject: String(payload?.email || "admin"),
    jwtid: crypto.randomBytes(12).toString("hex"),
  });
}

function safeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a ?? "")).digest();
  const right = crypto.createHash("sha256").update(String(b ?? "")).digest();
  return crypto.timingSafeEqual(left, right);
}

// POST /api/admin/login   NOW RETURNS ROLE: super_admin/editor/writer
router.post("/login", loginRateLimiter, (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (email.length > 160 || password.length > 200) {
    return res.status(400).json({ message: "Invalid credentials format" });
  }

  const accounts = [
    {
      role: "super_admin",
      email: String(process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase(),
      password: process.env.SUPER_ADMIN_PASSWORD || "",
    },
    {
      role: "editor",
      email: String(process.env.EDITOR_EMAIL || "").trim().toLowerCase(),
      password: process.env.EDITOR_PASSWORD || "",
    },
    {
      role: "writer",
      email: String(process.env.WRITER_EMAIL || "").trim().toLowerCase(),
      password: process.env.WRITER_PASSWORD || "",
    },
  ].filter((a) => a.email && a.password);

  if (!accounts.length) {
    return res.status(500).json({ message: "Role-based admin auth is not configured" });
  }

  const match = accounts.find(
    (a) => safeEqual(email, a.email) && safeEqual(password, a.password)
  );

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAdminToken({ email, role: match.role });

  return res.json({
    token,
    admin: { email, role: match.role },
  });
});

// GET /api/admin/stats (PROTECTED)  Only editor + super_admin can view stats
router.get("/stats", requireAdmin, async (req, res) => {
  if (!["super_admin", "editor"].includes(req.admin?.role)) {
    return res.status(403).json({ message: "Role not allowed to view stats" });
  }

  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6); // last 7 days
    start.setHours(0, 0, 0, 0);

    const events = await Event.find({
      createdAt: { $gte: start, $lte: now },
    }).lean();
    return res.json(buildStatsFromEvents(events));
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return res.status(200).json(emptyStatsPayload());
  }
});

router.use(adminInvitesRoutes);

export default router;
