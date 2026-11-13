/** Reglas del nombre de usuario, que forma la URL pública /p/:username. */

// Palabras que chocarían con rutas de la app o que pueden confundir.
const RESERVED = new Set([
  'admin', 'api', 'app', 'login', 'registro', 'register', 'panel', 'p', 'uploads', 'static', 'assets',
  'portfolio', 'portfoliostudio', 'soporte', 'support', 'ayuda', 'help', 'root', 'null', 'undefined',
]);

export const normalizeUsername = (v) => String(v ?? '').trim().toLowerCase();

/** Devuelve un mensaje de error o null si es válido. */
export function usernameError(username) {
  if (!username) return 'Elegí un nombre de usuario';
  if (username.length < 3 || username.length > 30) return 'Entre 3 y 30 caracteres';
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(username)) {
    return 'Solo minúsculas, números y guiones (sin guion al principio ni al final)';
  }
  if (username.includes('--')) return 'No uses dos guiones seguidos';
  if (RESERVED.has(username)) return 'Ese nombre está reservado';
  return null;
}
