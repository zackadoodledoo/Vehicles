import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail
} from "../models/auth.model.js";

const ROLE_MAP = {
  1: "owner",
  2: "employee",
  3: "user"
};

// GET /register
export function showRegister(req, res) {
  res.render("auth/register", { error: null });
}

// POST /register
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).render("auth/register", {
        error: "Email and password required"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, name);

    req.session.user = {
      id: user.id,
      email: user.email,
      role: ROLE_MAP[user.role],
      name: user.name
    };

    return res.redirect("/");
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).render("auth/register", {
        error: "Email already in use"
      });
    }
    return next(err);
  }
}

// GET /login
export function showLogin(req, res) {
  res.render("auth/login", { error: null });
}

// POST /login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("auth/login", {
        error: "Email and password required"
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).render("auth/login", {
        error: "Invalid credentials"
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).render("auth/login", {
        error: "Invalid credentials"
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: ROLE_MAP[user.role],
      name: user.name
    };

    return res.redirect("/");
  } catch (err) {
    return next(err);
  }
}

// GET /logout
export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}
