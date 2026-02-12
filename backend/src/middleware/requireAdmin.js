import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing admin token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    }

    const decoded = jwt.verify(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}