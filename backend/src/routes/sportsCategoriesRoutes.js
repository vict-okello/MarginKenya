import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const sportsCategoriesFile = path.join(dataDir, "sports-categories.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeCategories(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `sports-category-${Date.now()}-${idx}`,
    name: item?.name || "",
    title: item?.title || "",
    summary: item?.summary || "",
    body: item?.body || "",
    image: item?.image || "",
  }));
}

function readSportsCategories() {
  ensureDirs();
  if (!fs.existsSync(sportsCategoriesFile)) return [];
  try {
    const raw = fs.readFileSync(sportsCategoriesFile, "utf-8");
    return normalizeCategories(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeSportsCategories(payload) {
  ensureDirs();
  fs.writeFileSync(sportsCategoriesFile, JSON.stringify(normalizeCategories(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readSportsCategories());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeCategories(req.body);
  writeSportsCategories(next);
  res.json({ ok: true, data: next });
});

export default router;
