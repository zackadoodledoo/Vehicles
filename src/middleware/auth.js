
console.log("auth middleware loaded");

// Require User to be logged in

export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Require user to have a specific role
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    if (req.session.user.role !== role) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
      });
    }

    next();
  };
}