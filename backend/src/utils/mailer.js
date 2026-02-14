import nodemailer from "nodemailer";

function asBool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function getMailerConfig() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const portRaw = String(process.env.SMTP_PORT || "").trim();
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const secure = asBool(process.env.SMTP_SECURE, false);
  const requireTLS = asBool(process.env.SMTP_REQUIRE_TLS, false);
  const port = Number(portRaw || (secure ? 465 : 587));

  const isConfigured = Boolean(host && Number.isFinite(port) && port > 0 && user && pass);

  return { host, port, user, pass, secure, requireTLS, isConfigured };
}

function createTransport(cfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendInviteEmail({ to, name, inviteUrl, expiresAt }) {
  const cfg = getMailerConfig();
  if (!cfg.isConfigured) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  const fromName = String(process.env.MAIL_FROM_NAME || "MarginKenya").trim();
  const fromEmail = String(process.env.MAIL_FROM || cfg.user).trim();
  const subject = "Your MarginKenya invite link";
  const safeName = String(name || "there").trim();
  const expires = new Date(expiresAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const transporter = createTransport(cfg);

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    text: `Hello ${safeName},\n\nYou were invited to MarginKenya.\n\nUse this link to accept your invite:\n${inviteUrl}\n\nThis link expires on ${expires}.\n`,
    html: `<p>Hello ${safeName},</p><p>You were invited to MarginKenya.</p><p><a href="${inviteUrl}">Accept your invite</a></p><p>If the button does not work, copy and paste this URL:<br/>${inviteUrl}</p><p>This link expires on ${expires}.</p>`,
  });

  return { sent: true };
}

export async function sendTestEmail({ to }) {
  const cfg = getMailerConfig();
  if (!cfg.isConfigured) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  const fromName = String(process.env.MAIL_FROM_NAME || "MarginKenya").trim();
  const fromEmail = String(process.env.MAIL_FROM || cfg.user).trim();
  const now = new Date().toISOString();
  const transporter = createTransport(cfg);

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: "MarginKenya API test email",
    text: `This is a test email from MarginKenya backend.\n\nTime: ${now}\n`,
    html: `<p>This is a test email from <strong>MarginKenya backend</strong>.</p><p>Time: ${now}</p>`,
  });

  return { sent: true, messageId: String(info?.messageId || "") };
}
