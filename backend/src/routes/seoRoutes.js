import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import HeroArticle from "../models/HeroArticle.js";
import slugify from "../utils/slugify.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");

function getBaseUrl(req) {
  return String(process.env.CLIENT_ORIGIN || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function readJson(filename, fallback) {
  try {
    const raw = fs.readFileSync(path.join(dataDir, filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/robots.txt", (req, res) => {
  const base = getBaseUrl(req);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send(body);
});

router.get("/sitemap.xml", async (req, res) => {
  const base = getBaseUrl(req);
  const now = new Date().toISOString();
  const urls = new Set([
    "/",
    "/worldnews",
    "/resources",
    "/latest-news",
    "/politics",
    "/business",
    "/technology",
    "/health",
    "/sports",
    "/culture",
    "/podcast",
  ]);

  const add = (pathValue) => {
    if (!pathValue || typeof pathValue !== "string") return;
    urls.add(pathValue.startsWith("/") ? pathValue : `/${pathValue}`);
  };

  const addArticlePaths = (list, routeBuilder) => {
    for (const item of list || []) {
      const id = String(item?.id || item?.articleId || "").trim();
      const title = String(item?.title || id).trim();
      if (!id) continue;
      add(routeBuilder(id, slugify(title) || id));
    }
  };

  addArticlePaths(readJson("business.json", []), (id, slug) => `/business/article/${id}/${slug}`);
  addArticlePaths(readJson("technology.json", []), (id, slug) => `/technology/article/${id}/${slug}`);
  addArticlePaths(readJson("healthNews.json", []), (id, slug) => `/health/article/${id}/${slug}`);
  addArticlePaths(readJson("latestNews.json", []), (id, slug) => `/latest-news/${id}/${slug}`);
  addArticlePaths(readJson("culture.json", []), (id, slug) => `/culture/article/${id}/${slug}`);
  addArticlePaths(readJson("resources.json", []), (id, slug) => `/resources/article/${id}/${slug}`);

  const politics = readJson("politics.json", { local: [], international: [] });
  addArticlePaths(politics.local || [], (id, slug) => `/politics/article/${id}/${slug}`);
  addArticlePaths(politics.international || [], (id, slug) => `/politics/article/${id}/${slug}`);

  const worldnews = readJson("worldnews.json", { lead: null, stories: [] });
  if (worldnews?.lead?.articleId && worldnews?.lead?.title) {
    add(`/worldnews/article/${worldnews.lead.articleId}/${slugify(worldnews.lead.title)}`);
  }
  addArticlePaths(worldnews?.stories || [], (id, slug) => `/worldnews/article/${id}/${slug}`);

  addArticlePaths(readJson("sports.json", []), (id, slug) => `/sports/article/${id}/${slug}`);

  try {
    const heroArticles = await HeroArticle.find({}).select("_id title slug").lean();
    for (const article of heroArticles) {
      const id = String(article?._id || "").trim();
      if (!id) continue;
      const slug = String(article?.slug || slugify(article?.title || id)).trim() || id;
      add(`/hero/article/${id}/${slug}`);
    }
  } catch {
    // Keep sitemap working even when DB collection is unavailable.
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].map(
      (p) =>
        `<url><loc>${xmlEscape(`${base}${p}`)}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq></url>`
    ),
    "</urlset>",
  ].join("");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(body);
});

export default router;

