import { createApp } from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';
import { migrate } from '../database/migrate.js';

async function start() {
  try {
    // Aplica cambios de esquema pendientes (por ejemplo, columnas nuevas) sin borrar datos.
    await migrate(env);
    await pool.query('SELECT 1');
  } catch (err) {
    console.error(`\n✖ No se pudo conectar a MySQL (${env.db.host}:${env.db.port}/${env.db.database}): ${err.message}`);
    console.error('  Revisá el archivo backend/.env y ejecutá `npm run db:setup`.\n');
    process.exit(1);
  }

  const server = createApp().listen(env.port, () => {
    console.log(`✔ API de Portfolio Studio en http://localhost:${env.port}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n✖ El puerto ${env.port} ya está en uso por otro programa.`);
      console.error('  Cerralo o cambiá PORT en backend/.env (y VITE_API_PROXY si usás otro puerto).\n');
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
