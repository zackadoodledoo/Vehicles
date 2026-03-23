import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vehicles",
  password: process.env.PG_PASSWORD,
  port: 5432,
});

export default pool;
