import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import InviteToken from "../models/InviteToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireRole from "../middleware/requireRole.js";
import { sendInviteEmail } from "../utils/mailer.js";

const router = express.Router();

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function isValidEmail(value = "") {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/admin/users (super_admin only)
router.get("/users", requireAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const dbUsers = await User.find({ role: { $in: ["editor", "writer"] } })
      .sort({ createdAt: -1 })
      .select("_id name email role status createdAt updatedAt")
      .lean();

    const users = dbUsers.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      source: "database",
      canManage: true,
    }));

    const envAccounts = [
      {
        role: "editor",
        email: String(process.env.EDITOR_EMAIL || "").trim().toLowerCase(),
      },
      {
        role: "writer",
        email: String(process.env.WRITER_EMAIL || "").trim().toLowerCase(),
      },
    ].filter((a) => a.email);

    const knownEmails = new Set(users.map((u) => String(u.email || "").trim().toLowerCase()));
    for (const acc of envAccounts) {
      if (knownEmails.has(acc.email)) continue;
      users.push({
        id: `env:${acc.role}:${acc.email}`,
        name: acc.role === "editor" ? "Editor Account (ENV)" : "Writer Account (ENV)",
        email: acc.email,
        role: acc.role,
        status: "active",
        createdAt: null,
        updatedAt: null,
        source: "env",
        canManage: false,
      });
    }

    users.sort((a, b) => {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return bt - at;
    });

    return res.json({
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load users" });
  }
});

// PATCH /api/admin/users/:id/access (super_admin only)
router.patch("/users/:id/access", requireAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const userId = String(req.params?.id || "").trim();
    const enabled = Boolean(req.body?.enabled);

    if (!userId) return res.status(400).json({ message: "User id is required" });
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!["editor", "writer"].includes(user.role)) {
      return res.status(400).json({ message: "Only editor or writer access can be managed here" });
    }

    if (enabled) {
      user.status = user.passwordHash ? "active" : "invited";
    } else {
      user.status = "disabled";
    }
    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update user access" });
  }
});

// DELETE /api/admin/users/:id (super_admin only)
router.delete("/users/:id", requireAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const userId = String(req.params?.id || "").trim();
    if (!userId) return res.status(400).json({ message: "User id is required" });
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!["editor", "writer"].includes(user.role)) {
      return res.status(400).json({ message: "Only editor or writer accounts can be deleted here" });
    }

    await InviteToken.deleteMany({ userId: user._id });
    await user.deleteOne();

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

// POST /api/admin/invites (super_admin only)
router.post("/invites", requireAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) return res.status(400).json({ message: "name and email are required" });
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120) {
      return res.status(400).json({ message: "name must be 2-120 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (role && !["editor", "writer"].includes(role)) {
      return res.status(400).json({ message: "role must be editor or writer" });
    }

    const lowerEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    let user = await User.findOne({ email: lowerEmail });

    if (user && user.status === "active") {
      return res.status(409).json({ message: "User already active" });
    }

    // create or refresh invited user
    if (!user) {
      user = await User.create({
        name: cleanName,
        email: lowerEmail,
        role: role || "writer",
        status: "invited",
        passwordHash: "",
      });
    } else {
      user.name = cleanName;
      user.role = role || user.role;
      user.status = "invited";
      user.passwordHash = user.passwordHash || "";
      await user.save();
    }

    // generate one-time token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await InviteToken.create({ userId: user._id, tokenHash, expiresAt });

    const baseUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const inviteUrl = `${baseUrl}/accept-invite?token=${rawToken}`;
    let emailSent = false;
    let emailError = "";

    try {
      const emailResult = await sendInviteEmail({
        to: lowerEmail,
        name: cleanName,
        inviteUrl,
        expiresAt,
      });
      emailSent = Boolean(emailResult?.sent);
      if (!emailSent && emailResult?.reason) {
        emailError = String(emailResult.reason);
      }
    } catch (mailErr) {
      console.error("Invite mail send failed:", mailErr);
      emailSent = false;
      emailError = String(mailErr?.message || "email_send_failed");
    }

    return res.status(201).json({
      inviteUrl,
      emailSent,
      emailError: emailError || null,
      expiresAt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create invite" });
  }
});

export default router;
