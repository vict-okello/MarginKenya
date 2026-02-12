import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";
// import requireAdmin from "../middleware/requireAdmin.js"; // if you already use it

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save JSON to backend/src/data/worldnews.json
const dataDir = path.join(__dirname, "../data");
const worldFile = path.join(dataDir, "worldnews.json");

// Upload folder (served by server.js as /uploads)
const uploadsDir = path.join(__dirname, "../../uploads/worldnews");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function readWorld() {
  ensureDirs();
  if (!fs.existsSync(worldFile)) return { lead: null, stories: [] };
  try {
    const raw = fs.readFileSync(worldFile, "utf-8");
    return raw ? JSON.parse(raw) : { lead: null, stories: [] };
  } catch {
    return { lead: null, stories: [] };
  }
}

function writeWorld(payload) {
  ensureDirs();
  fs.writeFileSync(worldFile, JSON.stringify(payload, null, 2), "utf-8");
}

// ---------- uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirs();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// GET /api/worldnews
router.get("/", (req, res) => {
  res.json(readWorld());
});

// POST /api/worldnews  (save whole payload from Admin)
router.post(
  "/",
  // requireAdmin,
  (req, res) => {
    writeWorld(req.body);
    res.json({ ok: true });
  }
);

// POST /api/worldnews/upload  (Admin uploads image from computer)
router.post(
  "/upload",
  // requireAdmin,
  upload.single("image"),
  (req, res) => {
    // IMPORTANT: this URL must match how you serve uploads in server.js
    // e.g app.use("/uploads", express.static("uploads"))
    res.json({ imageUrl: `/uploads/worldnews/${req.file.filename}` });
  }
);

export default router;