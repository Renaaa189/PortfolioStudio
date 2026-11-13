import multer from 'multer';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `No existe la ruta ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.';
  let details;

  if (err instanceof AppError) {
    ({ status, message, details } = err);
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado grande' : 'No se pudo subir el archivo';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la solicitud no es un JSON válido';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'La solicitud es demasiado grande';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Ya existe un registro con esos datos';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
    status = 503;
    message = 'No se pudo conectar con la base de datos';
  } else if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    status = err.status;
    message = status === 404 ? 'Recurso no encontrado' : 'Solicitud inválida';
  }

  if (status >= 500 && !env.isTest) console.error(err);

  res.status(status).json({ error: { message, ...(details ? { details } : {}) } });
}
