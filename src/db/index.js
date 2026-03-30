import pkg from 'pg';
const { Pool } = pkg;

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

// Prefer a single DATABASE_URL (Render, Heroku, etc.)
const connectionString = process.env.DATABASE_URL || null;

const poolConfig = connectionString
  ? {
      connectionString,
      // Render/Postgres on many hosts require SSL; only enable in production
      ssl: isProd ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      database: process.env.PGDATABASE || 'vehicles',
    };

const pool = new Pool(poolConfig);

export default pool;
