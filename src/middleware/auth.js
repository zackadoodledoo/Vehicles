
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

    let userRole = req.session.user.role;

    // Normalize numeric roles to strings
    const ROLE_MAP = {
      1: 'owner',
      2: 'employee',
      3: 'user'
    };

    if (typeof userRole === 'number') {
      userRole = ROLE_MAP[userRole];
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied'
      });
    }

    next();
  };
}
