import mongoose from "mongoose";

const heroArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },

    title: { type: String, required: true, trim: true },
    category: { type: String, default: "World News", trim: true },
    author: { type: String, default: "", trim: true },
    date: { type: String, default: "", trim: true },
    readTime: { type: String, default: "", trim: true },
    summary: { type: String, default: "" },
    body: { type: String, required: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("HeroArticle", heroArticleSchema);