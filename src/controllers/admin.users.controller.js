import bcrypt from "bcrypt";
import {
  getAllUsers,
  getUserById,           // FIX: was missing — caused ReferenceError in deleteUser
  updateUserRoleById,
  resetUserPasswordById,
  deleteUserById
} from "../models/user.model.js";

const ROLE_TO_ID = { owner: 1, employee: 2, user: 3 };

/** GET /admin/users */
export async function listUsers(req, res, next) {
  try {
    const users = await getAllUsers();
    res.render("admin/users", { title: "User Management", users });
  } catch (err) {
    next(err);
  }
}

/** POST /admin/users/:id/role */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const roleId = ROLE_TO_ID[req.body.role];
    if (!roleId) return res.status(400).send("Invalid role");
    await updateUserRoleById(id, roleId);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

/** POST /admin/users/:id/reset-password */
export async function resetUserPassword(req, res, next) {
  try {
    const hashedPassword = await bcrypt.hash("P@$$w0rd!", 10);
    await resetUserPasswordById(req.params.id, hashedPassword);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

/** POST /admin/users/:id/delete */
export async function deleteUser(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const currentUser  = req.session.user;

    if (currentUser.id === targetUserId) {
      return res.status(403).send("You cannot delete your own account.");
    }

    // FIX: getUserById was called but not imported — now imported above
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) return res.status(404).send("User not found.");

    if (targetUser.role === 1) {
      return res.status(403).send("You cannot delete another owner.");
    }

    await deleteUserById(targetUserId);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}