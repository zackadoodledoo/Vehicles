
console.log("auth middleware loaded");

// Require User to be logged in

export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Require user to have one or more specific roles
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userRole = req.session.user.role;

    // Normalize roles to an array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
      });
    }

    next();
  };
}
