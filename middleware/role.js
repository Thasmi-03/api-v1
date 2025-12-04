/**
 * Middleware to check user roles
 * Must be used after authentication middleware (req.user must exist)
 */

export const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
  }

  next();
};

// Aliases
export const verifyRole = requireRole;

// Individual role helpers
export const requireAdmin = requireRole("admin");
export const requireStyler = requireRole("styler");
export const requirePartner = requireRole("partner");
