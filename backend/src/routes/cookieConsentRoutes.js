import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import createRateLimiter from "../middleware/rateLimit.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();
const consentRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 120 });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const consentFile = path.join(dataDir, "cookie-consent.json");
const MAX_EVENTS = 5000;

function ensureDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readPayload() {
  ensureDirs();
  if (!fs.existsSync(consentFile)) {
    return { events: [] };
  }
  try {
    const raw = fs.readFileSync(consentFile, "utf-8");
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      events: Array.isArray(parsed?.events) ? parsed.events : [],
    };
  } catch {
    return { events: [] };
  }
}

function writePayload(payload) {
  ensureDirs();
  fs.writeFileSync(consentFile, JSON.stringify(payload, null, 2), "utf-8");
}

function sanitizeChoice(choice) {
  const value = String(choice || "").trim().toLowerCase();
  return value === "accepted" || value === "rejected" ? value : "";
}

function sanitizeSource(source) {
  return String(source || "website")
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .slice(0, 80) || "website";
}

function sanitizePath(pathname) {
  return String(pathname || "/")
    .trim()
    .replace(/[\r\n\t]/g, "")
    .slice(0, 200) || "/";
}

router.post("/", consentRateLimiter, (req, res) => {
  const choice = sanitizeChoice(req.body?.choice);
  if (!choice) {
    return res.status(400).json({ message: "choice must be accepted or rejected" });
  }

  const payload = readPayload();
  const nextEvent = {
    choice,
    source: sanitizeSource(req.body?.source),
    path: sanitizePath(req.body?.path),
    at: new Date().toISOString(),
  };

  const events = [...payload.events, nextEvent].slice(-MAX_EVENTS);
  writePayload({ events });
  return res.status(201).json({ ok: true, choice });
});

router.get("/stats", requireAdmin, (req, res) => {
  const payload = readPayload();
  const events = Array.isArray(payload?.events) ? payload.events : [];

  let accepted = 0;
  let rejected = 0;
  for (const event of events) {
    if (event?.choice === "accepted") accepted += 1;
    if (event?.choice === "rejected") rejected += 1;
  }
  const total = accepted + rejected;
  const acceptanceRate = total > 0 ? Number(((accepted / total) * 100).toFixed(1)) : 0;

  return res.json({
    total,
    accepted,
    rejected,
    acceptanceRate,
  });
});

export default router;
