import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}