import { AppError } from '../errors/AppError.js';

/**
 * Rate limit en memoria, suficiente para un único servidor.
 * Protege el login contra fuerza bruta.
 */
export function rateLimit({ windowMs = 60_000, max = 10, message } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else if (++entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      throw new AppError(429, message || 'Demasiados intentos. Esperá un minuto y probá de nuevo.');
    }

    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    next();
  };
}
