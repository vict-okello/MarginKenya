import express from "express";
import { getMailerConfig, sendTestEmail } from "../utils/mailer.js";

const router = express.Router();

function isValidEmail(value = "") {
  const email = String(value || "").trim();
  if (!email || email.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/test-email
router.get("/", (req, res) => {
  const cfg = getMailerConfig();
  return res.json({
    ok: true,
    route: "/api/test-email",
    smtpConfigured: cfg.isConfigured,
    host: cfg.host || null,
    port: cfg.port || null,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS,
  });
});

// POST /api/test-email
router.post("/", async (req, res) => {
  try {
    const fallback = String(process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
    const to = String(req.body?.to || fallback).trim();

    if (!isValidEmail(to)) {
      return res.status(400).json({ message: "Valid recipient email is required." });
    }

    const result = await sendTestEmail({ to });
    if (!result?.sent) {
      if (result?.reason === "smtp_not_configured") {
        return res.status(503).json({ message: "SMTP is not configured." });
      }
      return res.status(500).json({ message: "Failed to send test email." });
    }

    return res.json({
      ok: true,
      message: "Test email sent.",
      to,
      messageId: result.messageId || null,
    });
  } catch (err) {
    console.error("POST /api/test-email failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
