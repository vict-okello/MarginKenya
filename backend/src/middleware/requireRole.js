export default function requireRole(allowedRoles = []) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return function roleGuard(req, res, next) {
    const role = req.admin?.role;

    if (!role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (allowed.length === 0) return next();

    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}