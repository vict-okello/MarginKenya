import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["page_view", "click", "read", "edit"],
    },

    sessionId: {
      type: String,
      required: true,
    },

    //  tracks ANY page (/ , /worldnews, /tech, etc.)
    path: {
      type: String,
      default: "",
    },

    articleId: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "", // World, Tech, Health, Sports
    },

    section: {
      type: String,
      default: "", // Hero, World, Tech, etc
    },

    readTimeSec: {
      type: Number,
      default: 0,
    },

    userAgent: {
      type: String,
      default: "",
    },

    ip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);