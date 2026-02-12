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

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
