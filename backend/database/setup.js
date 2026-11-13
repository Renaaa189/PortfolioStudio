import { env } from '../src/config/env.js';
import { migrate, reset } from './migrate.js';

const doReset = process.argv.includes('--reset');

try {
  await (doReset ? reset(env) : migrate(env));
  console.log(`✔ Base de datos "${env.db.database}" ${doReset ? 'recreada' : 'lista'}.`);
} catch (err) {
  console.error(`✖ No se pudo preparar la base de datos: ${err.message}`);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('  → Revisá DB_USER y DB_PASSWORD en backend/.env (los mismos que usás para entrar a MySQL).');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('  → MySQL no está encendido o no escucha en DB_HOST/DB_PORT.');
  }
  process.exitCode = 1;
}
