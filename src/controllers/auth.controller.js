import bcrypt from "bcryptjs";
import pool from "../db/index.js";

/**
 * GET /login
 * Show the login form
 */
export function showLogin(req, res) {
  res.render("login", { error: null });
}

/**
 * POST /login
 * Process login credentials
 */
export async function processLogin(req, res) {
  const { email, password } = req.body;

  // Look up the user by email
  const result = await pool.query(
    `
    SELECT users.id, users.name, users.password, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE email = $1
    `,
    [email]
  );

  // If no user found
  if (result.rows.length === 0) {
    return res.render("login", { error: "Invalid email or password" });
  }

  const user = result.rows[0];

  // Compare submitted password with hashed password
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.render("login", { error: "Invalid email or password" });
  }

  // Store minimal user info in session
  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  res.redirect("/dashboard");
}

/**
 * GET /logout
 * Destroy session and redirect
 */
export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}
