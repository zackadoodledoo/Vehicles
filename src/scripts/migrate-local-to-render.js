import dotenv from "dotenv";
dotenv.config({ path: ".env.migrate" });

import pg from "pg";
const { Pool } = pg;


const source = new Pool({
  connectionString: process.env.SOURCE_DATABASE_URL,
});

const target = new Pool({
  connectionString: process.env.TARGET_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

if (!process.env.SOURCE_DATABASE_URL || !process.env.TARGET_DATABASE_URL) {
  console.error("Missing SOURCE_DATABASE_URL or TARGET_DATABASE_URL");
  process.exit(1);
}
async function fetchAll(client, sql) {
  const { rows } = await client.query(sql);
  return rows;
}

async function insertMany(client, sql, rows, map) {
  for (const row of rows) {
    await client.query(sql, map(row));
  }
}

async function migrate() {
  const sourceClient = await source.connect();
  const targetClient = await target.connect();

  try {
    console.log("Connected to source and target databases.");

    await targetClient.query("BEGIN");

        const roles = await fetchAll(sourceClient, `
      SELECT id, name FROM roles ORDER BY id
    `);

    const roleMap = {};
    for (const r of roles) {
        roleMap[r.name] = r.id;
    }


    await insertMany(
      targetClient,
      `
      INSERT INTO roles (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `,
      roles,
      r => [r.id, r.name]
    );

        const users = await fetchAll(sourceClient, `
      SELECT id, name, email, password_hash, role, created_at
      FROM users ORDER BY id
    `);

    await insertMany(
      targetClient,
      `
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        created_at = EXCLUDED.created_at
      `,
      users,
      u => [u.id, u.name, u.email, u.password_hash, roleMap[u.role], u.created_at]
    );

        const categories = await fetchAll(sourceClient, `
      SELECT id, name FROM categories ORDER BY id
    `);

    await insertMany(
      targetClient,
      `
      INSERT INTO categories (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `,
      categories,
      c => [c.id, c.name]
    );

        const vehicles = await fetchAll(sourceClient, `
      SELECT id, title, description, price, year, mileage, category_id, created_at
      FROM vehicles ORDER BY id
    `);

    await insertMany(
      targetClient,
      `
      INSERT INTO vehicles (
        id, title, description, price, year, mileage, category_id, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        year = EXCLUDED.year,
        mileage = EXCLUDED.mileage,
        category_id = EXCLUDED.category_id,
        created_at = EXCLUDED.created_at
      `,
      vehicles,
      v => [
        v.id, v.title, v.description, v.price,
        v.year, v.mileage, v.category_id, v.created_at
      ]
    );

        const images = await fetchAll(sourceClient, `
      SELECT id, vehicle_id, image_url FROM vehicle_images ORDER BY id
    `);

    await insertMany(
      targetClient,
      `
      INSERT INTO vehicle_images (id, vehicle_id, image_url)
      VALUES ($1,$2,$3)
      ON CONFLICT (id) DO UPDATE SET
        vehicle_id = EXCLUDED.vehicle_id,
        image_url = EXCLUDED.image_url
      `,
      images,
      i => [i.id, i.vehicle_id, i.image_url]
    );

        const requests = await fetchAll(sourceClient, `
      SELECT id, user_id, vehicle_id, status, message, created_at
      FROM service_requests ORDER BY id
    `);

    await insertMany(
      targetClient,
      `
      INSERT INTO service_requests (
        id, user_id, vehicle_id, status, message, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        vehicle_id = EXCLUDED.vehicle_id,
        status = EXCLUDED.status,
        message = EXCLUDED.message,
        created_at = EXCLUDED.created_at
      `,
      requests,
      r => [
        r.id, r.user_id, r.vehicle_id,
        r.status, r.message, r.created_at
      ]
    );

        await targetClient.query(`
      SELECT setval(pg_get_serial_sequence('roles','id'), MAX(id)) FROM roles;
      SELECT setval(pg_get_serial_sequence('users','id'), MAX(id)) FROM users;
      SELECT setval(pg_get_serial_sequence('categories','id'), MAX(id)) FROM categories;
      SELECT setval(pg_get_serial_sequence('vehicles','id'), MAX(id)) FROM vehicles;
      SELECT setval(pg_get_serial_sequence('vehicle_images','id'), MAX(id)) FROM vehicle_images;
      SELECT setval(pg_get_serial_sequence('service_requests','id'), MAX(id)) FROM service_requests;
    `);

        await targetClient.query("COMMIT");
    console.log("Migration complete.");
  } catch (err) {
    await targetClient.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    sourceClient.release();
    targetClient.release();
    await source.end();
    await target.end();
  }
}

migrate();
