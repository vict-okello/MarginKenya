import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    role: {
      type: String,
      enum: ["super_admin", "editor", "writer"],
      default: "writer",
      required: true,
    },
    status: {
      type: String,
      enum: ["invited", "active", "disabled"],
      default: "invited",
      required: true,
    },
    passwordHash: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
