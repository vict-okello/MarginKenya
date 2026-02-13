import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const podcastFile = path.join(dataDir, "podcast.json");

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function normalizeEpisodes(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((item, idx) => ({
    id: item?.id || `${Date.now()}-${idx}`,
    title: item?.title || "",
    host: item?.host || "",
    duration: item?.duration || "",
    mood: item?.mood || "Analysis",
    channel: item?.channel || "",
    description: item?.description || "",
    color: item?.color || "from-[#1f2937] to-[#0f172a]",
    watchUrl: item?.watchUrl || "",
  }));
}

function readPodcast() {
  ensureDirs();
  if (!fs.existsSync(podcastFile)) return [];
  try {
    const raw = fs.readFileSync(podcastFile, "utf-8");
    return normalizeEpisodes(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writePodcast(payload) {
  ensureDirs();
  fs.writeFileSync(podcastFile, JSON.stringify(normalizeEpisodes(payload), null, 2), "utf-8");
}

router.get("/", (req, res) => {
  res.json(readPodcast());
});

router.put("/", requireAdmin, (req, res) => {
  const next = normalizeEpisodes(req.body);
  writePodcast(next);
  res.json({ ok: true, data: next });
});

export default router;
