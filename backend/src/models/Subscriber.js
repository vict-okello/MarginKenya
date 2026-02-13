import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    source: {
      type: String,
      default: "website",
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

SubscriberSchema.index({ createdAt: 1 });

export default mongoose.model("Subscriber", SubscriberSchema);
