import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";

import publicRoutes from "./src/routes/public.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";


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

/* -----------------------------
   View engine (EJS)
-------------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

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
      conString: process.env.DATABASE_URL,
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
   Static files
-------------------------------- */
app.use(express.static(path.join(__dirname, "src", "public")));

/* -----------------------------
   Routes
-------------------------------- */
app.use("/", publicRoutes);

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
