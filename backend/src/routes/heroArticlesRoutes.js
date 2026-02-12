// backend/src/routes/heroArticlesRoutes.js
import express from "express";
import mongoose from "mongoose";
import requireAdmin from "../middleware/requireAdmin.js";
import HeroArticle from "../models/HeroArticle.js";

const router = express.Router();

/**
 * GET /api/hero-articles
 * List all hero articles (newest first)
 */
router.get("/", async (req, res, next) => {
  try {
    const items = await HeroArticle.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/hero-articles/:id
 * Needed because AdminHero.jsx calls:
 * fetch(`${API}/api/hero-articles/${articleId}`)
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid article id" });
    }

    const item = await HeroArticle.findById(id);
    if (!item) return res.status(404).json({ message: "Article not found" });

    return res.json(item);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/hero-articles (admin only)
 * Create a new hero article
 */
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body || {};

    if (!payload.title?.trim()) return res.status(400).json({ message: "title is required" });
    if (!payload.body?.trim()) return res.status(400).json({ message: "body is required" });

    const created = await HeroArticle.create({
      title: payload.title.trim(),
      category: payload.category || "World News",
      author: payload.author || "",
      date: payload.date || "",
      readTime: payload.readTime || "",
      summary: payload.summary || "",
      body: payload.body,
      imageUrl: payload.imageUrl || "",
    });

    return res.status(201).json(created); // returns _id
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /api/hero-articles/:id (admin only)
 * Update hero article
 */
router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid article id" });
    }

    if (payload.title !== undefined && !String(payload.title).trim()) {
      return res.status(400).json({ message: "title cannot be empty" });
    }
    if (payload.body !== undefined && !String(payload.body).trim()) {
      return res.status(400).json({ message: "body cannot be empty" });
    }

    const updated = await HeroArticle.findByIdAndUpdate(
      id,
      {
        ...(payload.title !== undefined ? { title: String(payload.title).trim() } : {}),
        ...(payload.category !== undefined ? { category: payload.category } : {}),
        ...(payload.author !== undefined ? { author: payload.author } : {}),
        ...(payload.date !== undefined ? { date: payload.date } : {}),
        ...(payload.readTime !== undefined ? { readTime: payload.readTime } : {}),
        ...(payload.summary !== undefined ? { summary: payload.summary } : {}),
        ...(payload.body !== undefined ? { body: payload.body } : {}),
        ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Article not found" });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

export default router;