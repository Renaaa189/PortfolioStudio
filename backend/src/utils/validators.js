import { AppError } from '../errors/AppError.js';

/**
 * Helpers de validación reutilizables por todos los services.
 * Cada regla devuelve un mensaje de error o null.
 */

export const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Acepta una URL http(s) o un archivo subido a /uploads. */
export const isValidAssetUrl = (value) =>
  isValidHttpUrl(value) || /^\/uploads\/[\w.-]+$/.test(String(value));

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isFutureDate(value, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return String(value) > today;
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v));

/** Normaliza strings: trim y '' → null. */
export function clean(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

/**
 * Pequeño acumulador de errores por campo.
 *   const v = new Validator();
 *   v.check('name', !isBlank(name), 'El nombre es obligatorio');
 *   v.throwIfAny();
 */
export class Validator {
  constructor() {
    this.errors = {};
  }

  check(field, condition, message) {
    if (!condition && !this.errors[field]) this.errors[field] = message;
    return this;
  }

  required(field, value, message) {
    return this.check(field, !isBlank(value), message || 'Este campo es obligatorio');
  }

  maxLength(field, value, max) {
    if (isBlank(value)) return this;
    return this.check(field, String(value).trim().length <= max, `Máximo ${max} caracteres`);
  }

  url(field, value, { asset = false } = {}) {
    if (isBlank(value)) return this;
    const ok = asset ? isValidAssetUrl(value) : isValidHttpUrl(value);
    return this.check(field, ok, 'Ingresá una URL válida que empiece con http:// o https://');
  }

  pastDate(field, value, { required = false } = {}) {
    if (isBlank(value)) {
      if (required) this.check(field, false, 'La fecha es obligatoria');
      return this;
    }
    if (!isValidDate(value)) return this.check(field, false, 'La fecha no es válida (AAAA-MM-DD)');
    return this.check(field, !isFutureDate(value), 'La fecha no puede ser futura');
  }

  oneOf(field, value, allowed, message) {
    return this.check(field, allowed.includes(value), message || `Valor inválido. Opciones: ${allowed.join(', ')}`);
  }

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  throwIfAny() {
    if (this.hasErrors) throw AppError.validation(this.errors);
  }
}

/** Convierte un id de la URL en entero positivo o lanza 400. */
export function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw AppError.badRequest('El id debe ser un número entero positivo');
  return id;
}

/** Parsea booleanos que llegan como query string o JSON. */
export function parseBool(value) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return undefined;
}

/** Escapa los comodines de LIKE para que el usuario no pueda inyectarlos. */
export const escapeLike = (s) => String(s).replace(/[\\%_]/g, (c) => `\\${c}`);
