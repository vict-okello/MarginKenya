import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const sportsFile = path.join(dataDir, "sports.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeStories(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
    date: item?.date || "",
    author: item?.author || "",
    category: item?.category || "Sports",
    image: item?.image || "",
  }));
}

function readSports() {
  ensureDirs();
  if (!fs.existsSync(sportsFile)) return [];
  try {
    const raw = fs.readFileSync(sportsFile, "utf-8");
    return normalizeStories(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeSports(payload) {
  ensureDirs();
  fs.writeFileSync(sportsFile, JSON.stringify(normalizeStories(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readSports());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeStories(req.body);
  writeSports(next);
  res.json({ ok: true, data: next });
});

export default router;
