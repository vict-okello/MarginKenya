import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const fallbackFile = path.join(dataDir, "events-fallback.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(fallbackFile)) fs.writeFileSync(fallbackFile, "[]", "utf-8");
}

export function readFallbackEvents() {
  ensureFile();
  try {
    const raw = fs.readFileSync(fallbackFile, "utf-8");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendFallbackEvent(event) {
  ensureFile();
  const list = readFallbackEvents();
  list.push({
    ...event,
    _source: "fallback",
    createdAt: event?.createdAt || new Date().toISOString(),
  });

  // Keep the file bounded to avoid unbounded growth.
  const bounded = list.slice(-10000);
  fs.writeFileSync(fallbackFile, JSON.stringify(bounded, null, 2), "utf-8");
}
