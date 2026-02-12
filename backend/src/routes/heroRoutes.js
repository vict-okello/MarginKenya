import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save hero content to: backend/src/data/hero.json
const dataDir = path.join(__dirname, "../data");
const heroFile = path.join(dataDir, "hero.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readHero() {
  ensureDataDir();
  if (!fs.existsSync(heroFile)) return null;
  try {
    const raw = fs.readFileSync(heroFile, "utf-8");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeHero(payload) {
  ensureDataDir();
  fs.writeFileSync(heroFile, JSON.stringify(payload, null, 2), "utf-8");
}

// GET /api/hero
router.get("/", (req, res) => {
  const hero = readHero();
  if (!hero) return res.status(404).json({ message: "Hero not found" });
  return res.json(hero);
});

// PUT /api/hero (admin only)
router.put("/", requireAdmin, (req, res) => {
  const payload = req.body;

  // Minimal validation (matches AdminHero expectations)
  if (!payload?.featuredArticleId?.trim()) {
    return res.status(400).json({ message: "featuredArticleId is required" });
  }
  if (!payload?.featured?.headline?.trim()) {
    return res.status(400).json({ message: "featured.headline is required" });
  }
  if (!Array.isArray(payload?.topStories) || payload.topStories.length !== 4) {
    return res.status(400).json({ message: "topStories must be an array of exactly 4 items" });
  }

  writeHero(payload);
  return res.json({ ok: true });
});

export default router;