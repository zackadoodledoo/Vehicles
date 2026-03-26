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
app.use((req, res, next) => {
  res.locals.styles = [];
  res.addStyle = (styleTag) => {
    res.locals.styles.push(styleTag);
  };

  res.renderStyles = () => {
    return res.locals.styles.join("\n");
  };

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
app.use(
  session({
      store: new PgSession({
         pool,
         tableName: "session",
         createTableIfMissing: true,
      }),

         secret: process.env.SESSION_SECRET,
         resave: false,
         saveUninitialized: false,
         cookie: {
            httpOnly: true,
            sameSite: "lax",
         },
   })
);

/* -----------------------------
   Make user available to all views - Globally
-------------------------------- */
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
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
app.use(adminRoutes);
app.use(vehicleRoutes);
app.use(serviceRequestRoutes);
app.use(reviewRoutes);


/* -----------------------------
   Global error handler
-------------------------------- */
app.use(errorHandler);

/* -----------------------------
   Server start
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
