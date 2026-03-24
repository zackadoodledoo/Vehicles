export function showAdminPanel(req, res) {
  res.render("admin", { user: req.session.user });
}
