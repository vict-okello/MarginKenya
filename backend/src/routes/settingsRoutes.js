// backend/src/routes/settingsRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save settings here: backend/src/data/settings.json
const dataDir = path.join(__dirname, "../data");
const settingsFile = path.join(dataDir, "settings.json");

// Uploads saved here: backend/uploads/* (served as /uploads/*)
const brandingUploadsDir = path.join(__dirname, "../../uploads/branding");
const dashboardUploadsDir = path.join(__dirname, "../../uploads/dashboard");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(brandingUploadsDir)) fs.mkdirSync(brandingUploadsDir, { recursive: true });
  if (!fs.existsSync(dashboardUploadsDir)) fs.mkdirSync(dashboardUploadsDir, { recursive: true });
}

function defaultSettings() {
  return {
    branding: {
      siteName: "MarginKenya",
      logo: "",
      favicon: "",
      defaultOgImage: "",
    },
    security: {
      maintenanceMode: false,
      maintenanceMessage: "We'll be back soon.",
    },
    adminDashboard: {
      title: "Editorial Command Center",
      subtitle: "Site-aligned dashboard with live metrics and quick editorial controls.",
      headerColorFrom: "#ffffff",
      headerColorTo: "#e4e4e7",
      profileImage: "",
    },
  };
}

function readSettings() {
  ensureDirs();
  if (!fs.existsSync(settingsFile)) return defaultSettings();

  try {
    const raw = fs.readFileSync(settingsFile, "utf-8");
    const parsed = raw ? JSON.parse(raw) : {};
    const d = defaultSettings();

    return {
      ...d,
      ...parsed,
      branding: { ...d.branding, ...(parsed.branding || {}) },
      security: { ...d.security, ...(parsed.security || {}) },
      adminDashboard: { ...d.adminDashboard, ...(parsed.adminDashboard || {}) },
    };
  } catch {
    return defaultSettings();
  }
}

function writeSettings(payload) {
  ensureDirs();
  fs.writeFileSync(settingsFile, JSON.stringify(payload, null, 2), "utf-8");
}

function isSuperAdmin(req) {
  return req.admin?.role === "super_admin";
}

function isTrue(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function normalizeHexColor(value, fallback) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  return fallback;
}

function hasCloudinaryConfig() {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
}

const filenameStorage = {
  filename: (req, file, cb) => {
    const safe = String(file.originalname || "file")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safe}`);
  },
};

// Multer storage for branding uploads
const brandingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirs();
    cb(null, brandingUploadsDir);
  },
  ...filenameStorage,
});

const uploadBranding = multer({
  storage: brandingStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// Multer storage for admin dashboard uploads
const dashboardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirs();
    cb(null, dashboardUploadsDir);
  },
  ...filenameStorage,
});

const uploadDashboard = multer({
  storage: dashboardStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// GET /api/settings  (any admin role can read)
router.get("/", requireAdmin, (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

// PATCH /api/settings/branding  (super_admin only)
router.patch(
  "/branding",
  requireAdmin,
  uploadBranding.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "defaultOgImage", maxCount: 1 },
  ]),
  (req, res) => {
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ message: "Super admin only" });
    }

    const settings = readSettings();

    const siteName = String(req.body?.siteName || "").trim();
    if (!siteName) return res.status(400).json({ message: "Site name is required" });
    if (siteName.length > 60) {
      return res.status(400).json({ message: "Site name must be 60 characters or less" });
    }

    settings.branding.siteName = siteName;
    const clearLogo = isTrue(req.body?.clearLogo);
    const clearFavicon = isTrue(req.body?.clearFavicon);
    const clearDefaultOgImage = isTrue(req.body?.clearDefaultOgImage);

    if (clearLogo) settings.branding.logo = "";
    if (clearFavicon) settings.branding.favicon = "";
    if (clearDefaultOgImage) settings.branding.defaultOgImage = "";

    if (req.files?.logo?.[0]) {
      settings.branding.logo = `/uploads/branding/${req.files.logo[0].filename}`;
    }
    if (req.files?.favicon?.[0]) {
      settings.branding.favicon = `/uploads/branding/${req.files.favicon[0].filename}`;
    }
    if (req.files?.defaultOgImage?.[0]) {
      settings.branding.defaultOgImage = `/uploads/branding/${req.files.defaultOgImage[0].filename}`;
    }

    writeSettings(settings);
    return res.json(settings.branding);
  }
);

// PATCH /api/settings/security (super_admin only)
router.patch("/security", requireAdmin, (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(403).json({ message: "Super admin only" });
  }

  const settings = readSettings();

  const maintenanceMode = Boolean(req.body?.maintenanceMode);
  const maintenanceMessage = String(req.body?.maintenanceMessage || "").trim();

  settings.security.maintenanceMode = maintenanceMode;
  if (maintenanceMessage && maintenanceMessage.length <= 180) {
    settings.security.maintenanceMessage = maintenanceMessage;
  }

  writeSettings(settings);
  return res.json(settings.security);
});

// PATCH /api/settings/dashboard (super_admin only)
router.patch(
  "/dashboard",
  requireAdmin,
  uploadDashboard.fields([
    { name: "profileImage", maxCount: 1 },
  ]),
  async (req, res) => {
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ message: "Super admin only" });
    }

    try {
      const settings = readSettings();

      const title = String(req.body?.title || "").trim();
      const subtitle = String(req.body?.subtitle || "").trim();

      if (!title) return res.status(400).json({ message: "Title is required" });
      if (title.length > 80) return res.status(400).json({ message: "Title must be 80 characters or less" });
      if (subtitle.length > 180) return res.status(400).json({ message: "Subtitle must be 180 characters or less" });

      settings.adminDashboard.title = title;
      settings.adminDashboard.subtitle = subtitle;
      settings.adminDashboard.headerColorFrom = normalizeHexColor(
        req.body?.headerColorFrom,
        settings.adminDashboard.headerColorFrom || "#ffffff"
      );
      settings.adminDashboard.headerColorTo = normalizeHexColor(
        req.body?.headerColorTo,
        settings.adminDashboard.headerColorTo || "#e4e4e7"
      );
      if (isTrue(req.body?.clearProfileImage)) settings.adminDashboard.profileImage = "";

      if (req.files?.profileImage?.[0]) {
        if (!hasCloudinaryConfig()) {
          return res.status(500).json({ message: "Cloudinary is not configured" });
        }

        const uploaded = await cloudinary.uploader.upload(req.files.profileImage[0].path, {
          folder: "marginkenya/dashboard",
          resource_type: "image",
        });

        settings.adminDashboard.profileImage = String(uploaded.secure_url || "");

        fs.unlink(req.files.profileImage[0].path, () => {});
      }

      writeSettings(settings);
      return res.json(settings.adminDashboard);
    } catch (err) {
      console.error("PATCH /api/settings/dashboard error:", err);
      return res.status(500).json({ message: "Failed to update dashboard settings" });
    }
  }
);

export default router;
