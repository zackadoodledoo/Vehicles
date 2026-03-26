// src/middleware/error-handler.js
export default function errorHandler(err, req, res, next) {
  // Log the full error for server-side debugging
  console.error('🔥 REAL ERROR:', err);

  // Avoid double responses
  if (res.headersSent || res.finished) {
    return next(err);
  }

  const status = err.status || 500;
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: isProd ? 'An error occurred' : err.message,
    stack: isProd ? null : err.stack,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // Try to render an error view, fall back to plain text
  try {
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
  } catch (renderErr) {
    if (!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><pre>${context.error}</pre>`);
    }
  }
}
