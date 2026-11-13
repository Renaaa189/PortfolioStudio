import mysql from 'mysql2/promise';
import { env } from './env.js';

// Pool único para toda la app: reutiliza conexiones en vez de abrir una por pedido.
export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  // Las columnas DATE llegan como 'YYYY-MM-DD' (sin corrimientos por zona horaria)
  // y los TIMESTAMP como Date en UTC (se serializan a ISO 8601).
  dateStrings: ['DATE'],
  timezone: 'Z',
  charset: 'utf8mb4',
});

pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/** Ejecuta `fn` dentro de una transacción y hace rollback si algo falla. */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
