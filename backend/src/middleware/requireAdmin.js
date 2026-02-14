import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res.status(401).json({ message: "Missing admin token" });
    }
    if (token.length > 4096) {
      return res.status(401).json({ message: "Invalid admin token" });
    }
    // Basic structural check before JWT verification to reject malformed payloads early.
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Admin auth is not configured" });
    }

    const issuer = process.env.JWT_ISSUER || "marginkenya-admin";
    const audience = process.env.JWT_AUDIENCE || "marginkenya-dashboard";

    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer,
      audience,
    });

    // allow multiple roles (role-based admin system)
    const allowedRoles = ["super_admin", "editor", "writer"];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Forbidden: admin role required" });
    }

    req.admin = decoded; // { email, role, iat, exp, ... }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}