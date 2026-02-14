import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import InviteToken from "../models/InviteToken.js";
import User from "../models/User.js";
import createRateLimiter from "../middleware/rateLimit.js";

const router = express.Router();
const acceptInviteRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

router.post("/accept", acceptInviteRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }
    if (typeof token !== "string" || token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
      return res.status(400).json({ message: "Invalid invite token format" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (password.length > 200) {
      return res.status(400).json({ message: "Password is too long" });
    }

    const tokenHash = sha256(token);

    const invite = await InviteToken.findOne({ tokenHash });
    if (!invite) return res.status(400).json({ message: "Invalid invite token" });
    if (invite.usedAt) return res.status(400).json({ message: "Invite already used" });
    if (invite.expiresAt < new Date()) return res.status(400).json({ message: "Invite expired" });

    const user = await User.findById(invite.userId);
    if (!user) return res.status(400).json({ message: "Invite user not found" });
    if (user.status === "disabled") return res.status(403).json({ message: "Account disabled" });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.status = "active";
    await user.save();

    invite.usedAt = new Date();
    await invite.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Auth is not configured" });
    }

    const loginToken = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      secret,
      {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: process.env.JWT_ISSUER || "marginkenya-admin",
        audience: process.env.JWT_AUDIENCE || "marginkenya-dashboard",
      }
    );

    return res.json({
      message: "Invite accepted",
      token: loginToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to accept invite" });
  }
});

export default router;
