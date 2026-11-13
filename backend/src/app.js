import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes/index.js';
import { UPLOAD_DIR } from './routes/upload.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const FRONTEND_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));

  // CORS solo para los orígenes configurados (no abierto a cualquiera).
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
    }),
  );
  app.use(express.json({ limit: '200kb' }));

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: false }));

  app.use('/api', apiRoutes);
  app.use('/api', notFoundHandler);

  // En producción el mismo servidor entrega el frontend compilado.
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
