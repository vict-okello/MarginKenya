import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const latestNewsFile = path.join(dataDir, "latestNews.json");
const uploadsDir = path.join(__dirname, "../uploads/latest-news");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function normalizeArticles(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    category: item?.category || "Latest News",
    date: item?.date || new Date().toISOString().slice(0, 10),
    image: item?.image || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
  }));
}

function readLatestNews() {
  ensureDirs();
  if (!fs.existsSync(latestNewsFile)) return [];
  try {
    const raw = fs.readFileSync(latestNewsFile, "utf-8");
    return normalizeArticles(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeLatestNews(payload) {
  ensureDirs();
  fs.writeFileSync(latestNewsFile, JSON.stringify(normalizeArticles(payload), null, 2), "utf-8");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirs();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : "";
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${name}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 },
});

router.get("/", (req, res) => {
  res.json(readLatestNews());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeArticles(req.body);
  writeLatestNews(next);
  res.json({ ok: true, data: next });
});

router.post("/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ ok: true, url: `/uploads/latest-news/${req.file.filename}` });
});

export default router;
