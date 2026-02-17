// backend/src/app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import securityHeaders from "./middleware/securityHeaders.js";
import createRateLimiter from "./middleware/rateLimit.js";
import sanitizeRequest from "./middleware/sanitizeRequest.js";

import eventRoutes from "./routes/eventRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import heroArticleRoutes from "./routes/heroArticlesRoutes.js";
import worldnewsRoutes from "./routes/worldnewsRoutes.js";
import politicsRoutes from "./routes/politicsRoutes.js";
import latestNewsRoutes from "./routes/latestNewsRoutes.js";
import resourcesRoutes from "./routes/resourcesRoutes.js";
import subscribersRoutes from "./routes/subscribersRoutes.js";
import cultureRoutes from "./routes/cultureRoutes.js";
import healthNewsRoutes from "./routes/healthNewsRoutes.js";
import technologyRoutes from "./routes/technologyRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import podcastRoutes from "./routes/podcastRoutes.js";
import cookieConsentRoutes from "./routes/cookieConsentRoutes.js";
import sportsRoutes from "./routes/sportsRoutes.js";
import sportsCategoriesRoutes from "./routes/sportsCategoriesRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import invitesRoutes from "./routes/invitesRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canonical uploads folder at backend/uploads (one level above src)
const uploadsRoot = path.join(__dirname, "../uploads");
// Legacy uploads folder at backend/src/uploads (older routes wrote here)
const legacyUploadsRoot = path.join(__dirname, "./uploads");

const app = express();
const apiRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 400 });
const enableLocalUploads = process.env.ENABLE_LOCAL_UPLOADS !== "false";

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  ...(String(process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)),
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // ✅ ADD YOUR VERCEL FRONTEND ORIGIN HERE:
  "https://marginke.vercel.app",
  "https://marginkenya.vercel.app",
].filter(Boolean);

const VERCEL_PREVIEW_PATTERN = /^https:\/\/([a-z0-9-]+)\.vercel\.app$/i;
const isVercelPreviewOrigin = (origin) => VERCEL_PREVIEW_PATTERN.test(origin);
const isAllowedOrigin = (origin) => allowedOrigins.includes(origin) || isVercelPreviewOrigin(origin);

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(securityHeaders);

// Middleware
app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server / curl / same-origin requests without Origin header
      if (!origin) return cb(null, true);
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// Extra hard block (returns 403 JSON) if Origin is not allowed
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  return next();
});

app.use(express.json({ limit: "5mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(sanitizeRequest);

app.use("/api/invites", invitesRoutes);

app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});
app.use("/api", apiRateLimit);

// Serve local uploads by default in every environment.
// Set ENABLE_LOCAL_UPLOADS=false to disable this behavior.
if (enableLocalUploads) {
  app.use(
    "/uploads",
    express.static(uploadsRoot, {
      index: false,
      dotfiles: "deny",
      maxAge: "7d",
      fallthrough: true,
    })
  );
  app.use(
    "/uploads",
    express.static(legacyUploadsRoot, {
      index: false,
      dotfiles: "deny",
      maxAge: "7d",
      fallthrough: false,
    })
  );
}

// Routes
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/events", eventRoutes);

app.get("/api/test-hero-route", (req, res) => {
  res.json({ ok: true, from: "app.js" });
});

app.use("/api/hero", heroRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero-articles", heroArticleRoutes);
app.use("/api/worldnews", worldnewsRoutes);
app.use("/api/worldnews-admin", worldnewsRoutes);
app.use("/api/politics", politicsRoutes);
app.use("/api/latest-news", latestNewsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/resources-admin", resourcesRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/culture", cultureRoutes);
app.use("/api/health-news", healthNewsRoutes);
app.use("/api/technology", technologyRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/podcast", podcastRoutes);
app.use("/api/cookie-consent", cookieConsentRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/sports-categories", sportsCategoriesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/test-email", testEmailRoutes);

// SEO / robots / sitemap etc.
app.use("/", seoRoutes);

// 404 for API routes (JSON)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error handler (JSON)
app.use((err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode) || 500;
  const safeStatus = status >= 400 && status <= 599 ? status : 500;

  if (safeStatus >= 500) {
    console.error(err);
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large" });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (safeStatus === 500) {
    return res.status(500).json({ message: "Server error" });
  }

  return res.status(safeStatus).json({ message: err?.message || "Request failed" });
});

export default app;
