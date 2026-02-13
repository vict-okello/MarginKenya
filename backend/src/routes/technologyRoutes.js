import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const technologyFile = path.join(dataDir, "technology.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeStories(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    author: item?.author || "",
    category: item?.category || "Technology",
    date: item?.date || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
    image: item?.image || "",
  }));
}

function readTechnology() {
  ensureDirs();
  if (!fs.existsSync(technologyFile)) return [];
  try {
    const raw = fs.readFileSync(technologyFile, "utf-8");
    return normalizeStories(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeTechnology(payload) {
  ensureDirs();
  fs.writeFileSync(technologyFile, JSON.stringify(normalizeStories(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readTechnology());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeStories(req.body);
  writeTechnology(next);
  res.json({ ok: true, data: next });
});

export default router;
