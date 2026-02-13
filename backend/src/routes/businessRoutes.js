import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const businessFile = path.join(dataDir, "business.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeStories(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    scope: item?.scope || "Local",
    tag: item?.tag || "Business",
    title: item?.title || "",
    summary: item?.summary || "",
    body: item?.body || item?.content || "",
    date: item?.date || "",
    image: item?.image || "",
  }));
}

function readBusiness() {
  ensureDirs();
  if (!fs.existsSync(businessFile)) return [];
  try {
    const raw = fs.readFileSync(businessFile, "utf-8");
    return normalizeStories(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeBusiness(payload) {
  ensureDirs();
  fs.writeFileSync(businessFile, JSON.stringify(normalizeStories(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readBusiness());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeStories(req.body);
  writeBusiness(next);
  res.json({ ok: true, data: next });
});

export default router;
