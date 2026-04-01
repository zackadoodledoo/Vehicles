import pool from "../db/index.js";
import bcrypt from "bcrypt";

export async function listUsers(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.render("admin/users", {
      title: "User Management",
      users: result.rows
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["user", "employee", "owner"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send("Invalid role");
    }

    await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2",
      [role, id]
    );

    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;

    const hashedPassword = await bcrypt.hash("P@$$w0rd!", 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hashedPassword, id]
    );

    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}
