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
const resourcesFile = path.join(dataDir, "resources.json");
const uploadsDir = path.join(__dirname, "../uploads/resources");
const ALLOWED_CATEGORIES = new Set(["Guide", "Research", "Toolkit", "Deep Dive"]);

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function cleanSingleLine(value, maxLen = 5000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r?\n+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function cleanMultiline(value, maxLen = 5000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function normalizeUrl(value) {
  const raw = cleanSingleLine(value, 400);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
}

function normalizeImage(value) {
  const raw = cleanSingleLine(value, 300);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/resources/")) return raw;
  return "";
}

function normalizeResources(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.resources)
      ? payload.resources
      : [];

  return list.map((item, idx) => ({
    id: cleanSingleLine(item?.id, 120) || `${Date.now()}-${idx}`,
    title: cleanSingleLine(item?.title, 220),
    summary: cleanMultiline(item?.summary, 3000),
    content: cleanMultiline(item?.content || item?.body, 20000),
    image: normalizeImage(item?.image),
    category: ALLOWED_CATEGORIES.has(item?.category) ? item.category : "Guide",
    source: cleanSingleLine(item?.source, 160),
    url: normalizeUrl(item?.url),
    publishedAt: cleanSingleLine(item?.publishedAt, 40) || new Date().toISOString().slice(0, 16),
    status: item?.status === "published" ? "published" : "draft",
  }));
}

function readResources() {
  ensureDirs();
  if (!fs.existsSync(resourcesFile)) return [];
  try {
    const raw = fs.readFileSync(resourcesFile, "utf-8");
    return normalizeResources(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeResources(payload) {
  ensureDirs();
  const next = normalizeResources(payload);
  fs.writeFileSync(resourcesFile, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

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
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimetypeOk = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    const ext = path.extname(file.originalname || "").toLowerCase();
    const extOk = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    const ok = mimetypeOk && extOk;
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

router.get("/", (req, res) => {
  res.json({ resources: readResources() });
});

router.put("/", requireAdmin, (req, res) => {
  const next = writeResources(req.body);
  res.json({ ok: true, resources: next });
});

router.post("/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  const url = `/uploads/resources/${req.file.filename}`;
  res.json({ ok: true, url, imageUrl: url });
});

export default router;
