import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const cultureFile = path.join(dataDir, "culture.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeStories(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    date: item?.date || "",
    author: item?.author || item?.authorName || "",
    authorName: item?.authorName || item?.author || "",
    authorRole: item?.authorRole || "",
    authorBio: item?.authorBio || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
    image: item?.image || "",
  }));
}

function readCulture() {
  ensureDirs();
  if (!fs.existsSync(cultureFile)) return [];
  try {
    const raw = fs.readFileSync(cultureFile, "utf-8");
    return normalizeStories(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeCulture(payload) {
  ensureDirs();
  fs.writeFileSync(cultureFile, JSON.stringify(normalizeStories(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readCulture());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeStories(req.body);
  writeCulture(next);
  res.json({ ok: true, data: next });
});

export default router;
