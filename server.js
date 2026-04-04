import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.routes.js";
import publicRoutes from "./src/routes/public.routes.js";
import errorHandler from "./src/middleware/error-handler.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import pool from "./src/db/index.js";
import adminRoutes from "./src/routes/admin.routes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";
import serviceRequestRoutes from "./src/routes/serviceRequest.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import aboutRoutes from "./src/routes/about.routes.js";
import { connectionString } from "pg/lib/defaults";




/* -----------------------------
   Path setup for ESM
-------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -----------------------------
   App initialization
-------------------------------- */
const app = express();
const PgSession = pgSession(session);
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL });

app.use((req, res, next) => {
  console.log("TOP middleware hit:", req.path);
  next();
});



/* -----------------------------
   View engine (EJS)
-------------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

/* -----------------------------
   Dynamic CSS injection
-------------------------------- */
// Dynamic CSS injection - put helpers on res.locals and keep backward compatibility
app.use((req, res, next) => {
  res.locals.styles = [];

  // primary helpers available to templates via res.locals
  res.locals.addStyle = (styleTag) => {
    res.locals.styles.push(styleTag);
  };

  res.locals.renderStyles = () => {
    return res.locals.styles.join('\n');
  };

  // backward-compatible aliases so existing code using res.addStyle / res.renderStyles still works
  res.addStyle = (...args) => res.locals.addStyle(...args);
  res.renderStyles = (...args) => res.locals.renderStyles(...args);

  next();
});





/* -----------------------------
   Middleware
-------------------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));


/* -----------------------------
   Session configuration
-------------------------------- */
app.use(session({
  store: new PgSession({ pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

/* -----------------------------
   Make user available to all views - Globally
-------------------------------- */
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

/* -----------------------------
   Provide a default title for all views
-------------------------------- */
 
app.use((req, res, next) => {
  res.locals.title = 'Less New Cars - Vehicle Marketplace';
  next();
});



/* -----------------------------
   Static files
-------------------------------- */
app.use(express.static(path.join(__dirname, "src", "public")));


/* -----------------------------
   Routes
-------------------------------- */
app.use("/", publicRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
//app.use(adminRoutes);
app.use(vehicleRoutes);
app.use(serviceRequestRoutes);
app.use(reviewRoutes);
app.use(contactRoutes);
app.use(aboutRoutes);
app.use("/admin", adminRoutes); // Admin routes mounted at /admin for better URL structure



/* -----------------------------
   404 catch-all handler
------------------------------ */

app.use((req, res, next) => {
  if (
    req.path.startsWith("/images") ||
    req.path.startsWith("/css") ||
    req.path === "/favicon.ico"
  ) {
    return res.status(404).end();
  }

  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});


/* -----------------------------
   Global error handler
-------------------------------- */
app.use(errorHandler);

/* -----------------------------
   Server start
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
