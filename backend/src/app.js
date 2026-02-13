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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const apiRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 400 });
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  ...(String(process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(securityHeaders);

// Middleware
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  return next();
});

app.use(express.json({ limit: "5mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(sanitizeRequest);
app.use("/api", apiRateLimit);

// Serve uploads from backend/uploads (not backend/src/uploads)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    index: false,
    dotfiles: "deny",
    maxAge: "7d",
    fallthrough: false,
  })
);

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
