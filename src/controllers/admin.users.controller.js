import bcrypt from "bcrypt";
import {
  getAllUsers,
  updateUserRoleById,
  resetUserPasswordById
} from "../models/user.model.js";

/**
 * GET /admin/users
 * Render user management dashboard
 */
export async function listUsers(req, res, next) {
  try {
    const users = await getAllUsers();

    res.render("admin/users", {
      title: "User Management",
      users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/users/:id/role
 * Update a user's role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["user", "employee", "owner"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send("Invalid role");
    }

    await updateUserRoleById(id, role);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/users/:id/reset-password
 * Reset a user's password
 */
export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const hashedPassword = await bcrypt.hash("P@$$w0rd!", 10);

    await resetUserPasswordById(id, hashedPassword);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}
