import pool from '../db/index.js';
import bcrypt from 'bcrypt';

// GET /register
export function showRegister(req, res) {
  // We will create this view file later: src/views/auth/register.ejs
  res.render('auth/register', { error: null });
}

// POST /register
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).render('auth/register', { error: 'Email and password required' });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Insert user into the database
    const sql = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, name
    `;
    const params = [email, hash, name || null];
    const result = await pool.query(sql, params);
    const user = result.rows[0];

    // Store user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Redirect to home (or dashboard)
    return res.redirect('/');
  } catch (err) {
    // Handle duplicate email (unique constraint)
    if (err.code === '23505') {
      return res.status(400).render('auth/register', { error: 'Email already in use' });
    }
    // Pass other errors to global error handler
    return next(err);
  }
}

// GET /login
export function showLogin(req, res) {
  // We will create this view file later: src/views/auth/login.ejs
  res.render('auth/login', { error: null });
}

// POST /login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('auth/login', { error: 'Email and password required' });
    }

    // Look up user by email
    const sql = `
      SELECT id, email, password_hash, role, name
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await pool.query(sql, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).render('auth/login', { error: 'Invalid credentials' });
    }

    // Compare password with hash
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).render('auth/login', { error: 'Invalid credentials' });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Redirect after successful login
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

// GET /logout
export function logout(req, res) {
  // Destroy session and redirect to home
  req.session.destroy(() => {
    res.redirect('/');
  });
}
