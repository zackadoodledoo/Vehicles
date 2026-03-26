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

// ROUTE INSPECTION (paste right after app.use(reviewRoutes);)
console.log('DEBUG: per-router route listing (remove in production)');

const mountedRouters = [
  { name: 'publicRoutes', mount: '/', router: publicRoutes },
  { name: 'authRoutes', mount: '/', router: authRoutes },
  { name: 'dashboardRoutes', mount: '/', router: dashboardRoutes },
  { name: 'adminRoutes', mount: '/', router: adminRoutes },
  { name: 'vehicleRoutes', mount: '/', router: vehicleRoutes },
  { name: 'serviceRequestRoutes', mount: '/', router: serviceRequestRoutes },
  { name: 'reviewRoutes', mount: '/', router: reviewRoutes }
];

mountedRouters.forEach(({ name, mount, router }) => {
  if (!router) {
    console.log(`${name}: NOT IMPORTED`);
    return;
  }
  console.log(`\n${name} (mounted at "${mount}") - stack length: ${Array.isArray(router.stack) ? router.stack.length : 'N/A'}`);
  if (Array.isArray(router.stack)) {
    router.stack.forEach((layer, i) => {
      try {
        if (layer && layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
          console.log(`  ${i}: ${methods} ${mount}${layer.route.path}`);
        } else if (layer && layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
          layer.handle.stack.forEach((r) => {
            if (r && r.route && r.route.path) {
              const methods = Object.keys(r.route.methods).join(',').toUpperCase();
              console.log(`  ${i}: ${methods} ${mount}${r.route.path}`);
            }
          });
        } else {
          const info = `layer name=${layer && layer.name} regexp=${layer && layer.regexp && layer.regexp.source}`;
          console.log(`  ${i}: ${info}`);
        }
      } catch (e) {
        console.log(`  ${i}: error inspecting layer: ${e && e.message}`);
      }
    });
  }
});
console.log('\nEND ROUTE LISTING\n');


// DEBUG: check router registration (remove in production)
console.log('DEBUG: checking router registration...');

console.log('app._router exists:', !!app._router);
if (app._router) {
  console.log('app._router.stack length:', Array.isArray(app._router.stack) ? app._router.stack.length : 'no stack array');
} else {
  console.log('app._router is undefined or null');
}

const routersToCheck = {
  publicRoutes,
  authRoutes,
  dashboardRoutes,
  adminRoutes,
  vehicleRoutes,
  serviceRequestRoutes,
  reviewRoutes
};

Object.entries(routersToCheck).forEach(([name, r]) => {
  if (!r) {
    console.log(`${name}: NOT IMPORTED (undefined/null)`);
    return;
  }
  const isRouter = Array.isArray(r.stack);
  console.log(`${name}: type=${typeof r} ; isRouter=${isRouter} ; stackLength=${isRouter ? r.stack.length : 'N/A'}`);
});

if (app._router && Array.isArray(app._router.stack)) {
  console.log('--- Registered routes (app._router.stack) ---');
  app._router.stack.forEach((layer, i) => {
    try {
      if (layer && layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        console.log(`${i}: ${methods} ${layer.route.path}`);
        return;
      }
      if (layer && layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
        layer.handle.stack.forEach((r) => {
          if (r && r.route && r.route.path) {
            const methods = Object.keys(r.route.methods).join(',').toUpperCase();
            console.log(`${i}: ${methods} ${r.route.path}`);
          }
        });
        return;
      }
      console.log(`${i}: LAYER name=${layer && layer.name} ; regexp=${layer && layer.regexp && layer.regexp.source}`);
    } catch (e) {
      console.log(`${i}: error inspecting layer:`, e && e.message);
    }
  });
  console.log('--------------------------------------------');
}



/* -----------------------------
   404 catch-all handler
------------------------------ */

app.use((req, res, next) => {
  const err = new Error('Page Not Found');
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
  console.log(`Server running at http://localhost:${PORT}`);
});
