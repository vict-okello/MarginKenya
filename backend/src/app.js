// backend/src/app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import eventRoutes from "./routes/eventRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import heroArticleRoutes from "./routes/heroArticlesRoutes.js";
import worldnewsRoutes from "./routes/worldnewsRoutes.js";
import politicsRoutes from "./routes/politicsRoutes.js";
import latestNewsRoutes from "./routes/latestNewsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        process.env.CLIENT_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ].filter(Boolean);

      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

// Serve uploads from backend/uploads (not backend/src/uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/politics", politicsRoutes);
app.use("/api/latest-news", latestNewsRoutes);

// 404 for API routes (JSON)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error handler (JSON)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err?.message || "Server error" });
});

export default app;
