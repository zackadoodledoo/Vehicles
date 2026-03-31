import pkg from "pg";
const { Pool } = pkg;

// Render and other cloud providers require SSL.
// When DATABASE_URL exists, always enable SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;
