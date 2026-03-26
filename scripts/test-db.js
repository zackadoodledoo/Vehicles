import pool from '../src/db/index.js';

async function test() {
  try {
    const res = await pool.query('SELECT NOW() as now');
    console.log('DB connected, now:', res.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
}

test();
