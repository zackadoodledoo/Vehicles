import bcrypt from "bcrypt";
import {
  getAllUsers,
  updateUserRoleById,
  resetUserPasswordById, 
  deleteUserById
} from "../models/user.model.js";

const ROLE_TO_ID = {
  owner: 1,
  employee: 2,
  user: 3
};


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

    const ROLE_TO_ID = {
      owner: 1,
      employee: 2,
      user: 3
    };

    const roleId = ROLE_TO_ID[role];

    if (!roleId) {
      return res.status(400).send("Invalid role");
    }

    await updateUserRoleById(id, roleId);
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

export async function deleteUser(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const currentUser = req.session.user;

    // Prevent self‑deletion
    if (currentUser.id === targetUserId) {
      return res.status(403).send("You cannot delete your own account.");
    }

    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
      return res.status(404).send("User not found.");
    }

    // Prevent deleting other owners
    if (targetUser.role === 1) {
      return res.status(403).send("You cannot delete another owner.");
    }

    await deleteUserById(targetUserId);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}
