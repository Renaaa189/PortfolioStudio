import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const SCHEMA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

function connect(db) {
  if (!/^\w+$/.test(db.database)) throw new Error('DB_NAME solo puede tener letras, números y _');
  return mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    multipleStatements: true,
  });
}

/** Crea la base (si no existe) y aplica el esquema. */
export async function migrate({ db }) {
  const conn = await connect(db);
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${db.database}\``);

    // Bases creadas con la versión de un solo usuario no tienen user_id.
    const [[old]] = await conn.query(
      `SELECT COUNT(*) AS n FROM information_schema.TABLES t
        WHERE t.TABLE_SCHEMA = ? AND t.TABLE_NAME = 'projects'
          AND NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS c
                           WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = 'projects' AND c.COLUMN_NAME = 'user_id')`,
      [db.database],
    );
    if (old.n > 0) {
      throw new Error('La base tiene el esquema anterior (un solo usuario). Ejecutá `npm run db:reset` (desde la carpeta principal) para recrearla.');
    }

    await conn.query(await fs.readFile(SCHEMA, 'utf8'));

    // Columnas agregadas en versiones posteriores (bases ya existentes).
    const [[design]] = await conn.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'design'`,
      [db.database],
    );
    if (design.n === 0) await conn.query('ALTER TABLE users ADD COLUMN design TEXT NULL AFTER is_published');
  } finally {
    await conn.end();
  }
}

/** Borra la base completa y la vuelve a crear vacía. */
export async function reset({ db }) {
  const conn = await connect(db);
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${db.database}\``);
  } finally {
    await conn.end();
  }
  await migrate({ db });
}
