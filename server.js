import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes           from "./src/routes/auth.routes.js";
import publicRoutes         from "./src/routes/public.routes.js";
import errorHandler         from "./src/middleware/error-handler.js";
import dashboardRoutes      from "./src/routes/dashboard.routes.js";
import pool                 from "./src/db/index.js";
import adminRoutes          from "./src/routes/admin.routes.js";
import vehicleRoutes        from "./src/routes/vehicle.routes.js";
import serviceRequestRoutes from "./src/routes/serviceRequest.routes.js";
import reviewRoutes         from "./src/routes/review.routes.js";
import contactRoutes        from "./src/routes/contact.routes.js";
import aboutRoutes          from "./src/routes/about.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app       = express();
const PgSession = pgSession(session);

/* --------------------------------
   View engine
-------------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

/* --------------------------------
   Dynamic CSS injection helpers
-------------------------------- */
app.use((req, res, next) => {
  res.locals.styles      = [];
  res.locals.addStyle    = (tag) => res.locals.styles.push(tag);
  res.locals.renderStyles = () => res.locals.styles.join('\n');
  res.addStyle           = (...a) => res.locals.addStyle(...a);
  res.renderStyles       = (...a) => res.locals.renderStyles(...a);
  next();
});

/* --------------------------------
   Body parsing & method override
-------------------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

/* --------------------------------
   Session
-------------------------------- */
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret:            process.env.SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // secure: true  ← uncomment when behind HTTPS in production
    },
  })
);

/* --------------------------------
   Global template locals
-------------------------------- */
app.use((req, res, next) => { res.locals.user    = req.session.user || null; next(); });
app.use((req, res, next) => { res.locals.session = req.session;               next(); });
app.use((req, res, next) => { res.locals.title   = 'Less New Cars';           next(); });

/* --------------------------------
   Static files
-------------------------------- */
app.use(express.static(path.join(__dirname, "src", "public")));

/* --------------------------------
   Routes
   FIX: removed duplicate app.use(adminRoutes) that was commented out
   but present — keeping only app.use("/admin", adminRoutes)
   FIX: /admin/* service-request routes removed from serviceRequest.routes.js
   to avoid double-registration
-------------------------------- */
app.use("/", publicRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(vehicleRoutes);
app.use(serviceRequestRoutes);
app.use(reviewRoutes);
app.use(contactRoutes);
app.use(aboutRoutes);
app.use("/admin", adminRoutes);

/* --------------------------------
   404 handler
-------------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/images") || req.path.startsWith("/css") || req.path === "/favicon.ico") {
    return res.status(404).end();
  }
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

/* --------------------------------
   Global error handler
-------------------------------- */
app.use(errorHandler);

/* --------------------------------
   Start server
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));