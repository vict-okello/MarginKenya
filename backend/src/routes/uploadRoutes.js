import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads root folder is: backend/src/uploads
const uploadsRoot = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

const SECTION_DIRS = {
  general: "",
  hero: "hero",
  "hero-featured": "hero/featured",
  "hero-stories": "hero/stories",
  "hero-article": "hero/article",
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
    const ext = path.extname(file.originalname || "");
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
router.post("/", requireAdmin, upload.single("image"), sendUploadResponse);

// POST /api/uploads/:section       -> organized folders (hero, hero-featured, ...)
router.post("/:section", requireAdmin, upload.single("image"), sendUploadResponse);

export default router;
