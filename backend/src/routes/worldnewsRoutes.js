import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save JSON to backend/src/data/worldnews.json
const dataDir = path.join(__dirname, "../data");
const worldFile = path.join(dataDir, "worldnews.json");

// Upload folder served by app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
const uploadsDir = path.join(__dirname, "../../uploads/worldnews");

const MAX_STORIES = 40;
const STATUS_VALUES = new Set(["draft", "published"]);
const SAFE_COLOR_CLASSES = new Set([
  "bg-[#6358e8]",
  "bg-[#f0503a]",
  "bg-[#ee5b45]",
  "bg-[#d8b73a]",
  "bg-[#2ec86b]",
  "bg-[#3da5d9]",
  "bg-[#4b5563]",
]);
const SAFE_REGION_VALUES = new Set(["all", "africa", "europe", "asia", "americas", "middle-east"]);

function cleanText(value, maxLen = 300) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLen);
}

function cleanMultilineText(value, maxLen = 20000) {
  if (typeof value !== "string") return "";
  // Preserve user-entered spacing/newlines while removing only unsafe control chars.
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLen);
}

function cleanPath(value) {
  const raw = cleanText(value, 300);
  if (!raw) return "/worldnews";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

function normalizeLead(lead) {
  if (!lead || typeof lead !== "object") return null;
  return {
    id: cleanText(lead.id, 120) || `lead-${Date.now()}`,
    type: "lead",
    label: cleanText(lead.label, 40) || "World News",
    date: cleanText(lead.date, 40) || new Date().toISOString().slice(0, 10),
    title: cleanText(lead.title, 220),
    summary: cleanMultilineText(lead.summary, 2500),
    content: cleanMultilineText(lead.content, 20000),
    image: cleanText(lead.image, 300),
    articleId: cleanText(lead.articleId, 120) || "lead-worldnews",
    status: STATUS_VALUES.has(lead.status) ? lead.status : "draft",
  };
}

function normalizeStory(story, idx = 0) {
  return {
    id: cleanText(story?.id, 120) || `story-${Date.now()}-${idx}`,
    type: "side",
    label: cleanText(story?.label, 40) || "World News",
    date: cleanText(story?.date, 40) || new Date().toISOString().slice(0, 10),
    title: cleanText(story?.title, 220),
    to: cleanPath(story?.to),
    color: SAFE_COLOR_CLASSES.has(story?.color) ? story.color : "bg-[#6358e8]",
    region: SAFE_REGION_VALUES.has(story?.region) ? story.region : "all",
    image: cleanText(story?.image, 300),
    status: STATUS_VALUES.has(story?.status) ? story.status : "draft",
  };
}

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function normalizeWorld(payload) {
  const lead = normalizeLead(payload?.lead);
  const storiesRaw = Array.isArray(payload?.stories) ? payload.stories : [];
  const stories = storiesRaw.slice(0, MAX_STORIES).map((item, idx) => normalizeStory(item, idx));
  return { lead, stories };
}

function readWorld() {
  ensureDirs();
  if (!fs.existsSync(worldFile)) return normalizeWorld(null);
  try {
    const raw = fs.readFileSync(worldFile, "utf-8");
    return normalizeWorld(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeWorld(null);
  }
}

function writeWorld(payload) {
  ensureDirs();
  const safe = normalizeWorld(payload);
  fs.writeFileSync(worldFile, JSON.stringify(safe, null, 2), "utf-8");
  return safe;
}

// ---------- uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirs();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : "";
    cb(null, `${crypto.randomBytes(16).toString("hex")}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter: (req, file, cb) => {
    const mimetypeOk = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    const ext = path.extname(file.originalname || "").toLowerCase();
    const extOk = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    const ok = mimetypeOk && extOk;
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// GET /api/worldnews
router.get("/", (req, res) => {
  res.json(readWorld());
});

function saveWorld(req, res) {
  const next = writeWorld(req.body);
  return res.json(next);
}

// Save whole payload from Admin
router.post("/", requireAdmin, saveWorld);
router.put("/", requireAdmin, saveWorld);

// POST /api/worldnews/upload  (Admin uploads image from computer)
router.post(
  "/upload",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    res.json({
      imageUrl: `/uploads/worldnews/${req.file.filename}`,
      url: `/uploads/worldnews/${req.file.filename}`,
    });
  }
);

export default router;
