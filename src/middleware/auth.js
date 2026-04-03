
console.log("auth middleware loaded");

// Require User to be logged in

export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Require user to have one or more specific roles
export function requireRole(allowed) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(403).render("errors/403");
    }

    let role = req.session.user.role;

    // Normalize role to lowercase string
    if (typeof role === "number") {
      role = String(role);
    }

    if (typeof role === "string") {
      role = role.toLowerCase().trim();
    }

    const allowedRoles = Array.isArray(allowed)
      ? allowed.map(r => r.toLowerCase())
      : [allowed.toLowerCase()];

    console.log("ROLE CHECK:", role, "ALLOWED:", allowedRoles);

    if (!allowedRoles.includes(role)) {
      return res.status(403).render("errors/403");
    }

    next();
  };
}

