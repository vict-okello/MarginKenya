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

// Data file: backend/src/data/politics.json
const dataDir = path.join(__dirname, "../data");
const politicsFile = path.join(dataDir, "politics.json");

// Upload folder: backend/uploads/politics
const uploadsDir = path.join(__dirname, "../uploads/politics");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function normalizeDesk(payload) {
  return {
    local: Array.isArray(payload?.local) ? payload.local : [],
    international: Array.isArray(payload?.international) ? payload.international : [],
  };
}

function readPolitics() {
  ensureDirs();
  if (!fs.existsSync(politicsFile)) return normalizeDesk(null);
  try {
    const raw = fs.readFileSync(politicsFile, "utf-8");
    return normalizeDesk(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeDesk(null);
  }
}

function writePolitics(payload) {
  ensureDirs();
  fs.writeFileSync(politicsFile, JSON.stringify(normalizeDesk(payload), null, 2), "utf-8");
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

// GET /api/politics
router.get("/", (req, res) => {
  res.json(readPolitics());
});

// PUT /api/politics (admin only)
router.put("/", requireAdmin, (req, res) => {
  const next = normalizeDesk(req.body);
  writePolitics(next);
  res.json({ ok: true, data: next });
});

// POST /api/politics/upload (admin only)
router.post("/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ ok: true, url: `/uploads/politics/${req.file.filename}` });
});

export default router;