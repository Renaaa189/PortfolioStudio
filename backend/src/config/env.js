import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENV_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');

// Carga backend/.env aunque el comando se ejecute desde otra carpeta.
export const envFileExists = fs.existsSync(ENV_FILE);
dotenv.config({ path: ENV_FILE, quiet: true });

if (!envFileExists && process.env.NODE_ENV !== 'test') {
  console.warn('⚠ No existe backend/.env: se usan valores por defecto (usuario root sin contraseña).');
  console.warn('  Copiá backend/.env.example a backend/.env y completá DB_USER y DB_PASSWORD.\n');
}

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en producción');
}

export const env = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT) || 3306,
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_NAME', 'portfolio_studio'),
  },
  jwt: {
    secret: required('JWT_SECRET', 'dev-only-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};
