import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    console.warn("MongoDB URI missing. Starting without database connection.");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.warn("Continuing without MongoDB. DB-backed routes may fail until connection is restored.");
    return false;
  }
}
