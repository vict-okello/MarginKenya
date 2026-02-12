import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";
import createRateLimiter from "../middleware/rateLimit.js";

const router = express.Router();
const uploadRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 40 });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads root folder is: backend/src/uploads
const uploadsRoot = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

const SECTION_DIRS = {
  general: "",
  culture: "culture",
  health: "health",
  hero: "hero",
  "hero-featured": "hero/featured",
  "hero-stories": "hero/stories",
  "hero-article": "hero/article",
};
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function resolveSection(rawSection) {
  const key = String(rawSection || "general").toLowerCase();
  return Object.prototype.hasOwnProperty.call(SECTION_DIRS, key) ? key : "general";
}

function getUploadTarget(req) {
  const sectionKey = resolveSection(req.params?.section || req.query?.section);
  const relativeDir = SECTION_DIRS[sectionKey];
  const absoluteDir = relativeDir ? path.join(uploadsRoot, relativeDir) : uploadsRoot;
  if (!fs.existsSync(absoluteDir)) fs.mkdirSync(absoluteDir, { recursive: true });
  return { sectionKey, relativeDir, absoluteDir };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const target = getUploadTarget(req);
    req._uploadTarget = target;
    cb(null, target.absoluteDir);
  },
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || ".bin";
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const ok = ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

function sendUploadResponse(req, res) {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const target = req._uploadTarget || getUploadTarget(req);
  const prefix = target.relativeDir ? `/uploads/${target.relativeDir.replace(/\\/g, "/")}` : "/uploads";
  return res.json({
    url: `${prefix}/${req.file.filename}`,
    section: target.sectionKey,
  });
}

// POST /api/uploads                -> general
router.post("/", requireAdmin, uploadRateLimiter, upload.single("image"), sendUploadResponse);

// POST /api/uploads/:section       -> organized folders (hero, hero-featured, ...)
router.post("/:section", requireAdmin, uploadRateLimiter, upload.single("image"), sendUploadResponse);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image is too large. Max allowed size is 5MB." });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  }
  if (err?.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

export default router;
