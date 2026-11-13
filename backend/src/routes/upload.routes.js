import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '../middlewares/auth.js';
import { AppError } from '../errors/AppError.js';

export const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const TYPES = {
  image: {
    mimes: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' },
    maxSize: 5 * 1024 * 1024,
  },
  pdf: { mimes: { 'application/pdf': '.pdf' }, maxSize: 10 * 1024 * 1024 },
};

function uploader(kind) {
  const { mimes, maxSize } = TYPES[kind];
  return multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      // Nombre aleatorio: nunca usamos el nombre que manda el cliente.
      filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${mimes[file.mimetype]}`),
    }),
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (req, file, cb) => {
      if (mimes[file.mimetype]) return cb(null, true);
      cb(AppError.badRequest(kind === 'pdf' ? 'Solo se aceptan archivos PDF' : 'Formato no soportado. Usá JPG, PNG, WEBP o GIF'));
    },
  }).single('file');
}

const router = Router();

router.post('/:kind', requireAuth, (req, res, next) => {
  const { kind } = req.params;
  if (!TYPES[kind]) throw AppError.badRequest('Tipo de archivo inválido (image o pdf)');
  uploader(kind)(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(AppError.badRequest('No se recibió ningún archivo'));
    res.status(201).json({ url: `/uploads/${req.file.filename}`, size: req.file.size });
  });
});

export default router;
