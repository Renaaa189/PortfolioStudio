import { AppError } from '../errors/AppError.js';
import { verifyToken } from '../services/auth.service.js';

/** Exige un JWT válido en `Authorization: Bearer <token>` y deja el usuario en `req.user`. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw AppError.unauthorized();
  const payload = verifyToken(token);
  req.user = { id: Number(payload.sub) };
  next();
}
