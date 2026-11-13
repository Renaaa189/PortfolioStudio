import { AppError } from '../errors/AppError.js';

/**
 * Opciones de personalización del portfolio. El frontend tiene la misma lista
 * (con nombres y descripciones) en src/utils/design.js.
 */
export const DESIGN_OPTIONS = {
  palette: ['aurora', 'atardecer', 'oceano', 'bosque', 'lavanda', 'fuego', 'neon', 'grafito'],
  background: ['aurora', 'destellos', 'degradado', 'grilla', 'puntos', 'liso'],
  font: ['moderna', 'elegante', 'tecnica', 'amigable', 'codigo'],
  layouts: {
    hero: ['dividida', 'centrada', 'minimal', 'tarjeta', 'banner'],
    technologies: ['cinta', 'doble', 'contorno', 'nube', 'contador'],
    featured: ['alternada', 'vitrina', 'carrusel', 'superpuesta', 'numerada'],
    projects: ['grilla', 'lista', 'galeria', 'compacta', 'linea'],
    skills: ['barras', 'chips', 'mosaico', 'anillos', 'niveles'],
    certificates: ['linea', 'grilla', 'lista', 'medallas', 'carrusel'],
    contact: ['degradado', 'dividida', 'minimal', 'tarjeta', 'franja'],
  },
};

/** Secciones que se pueden ordenar y ocultar (la portada siempre va primero). */
export const SECTIONS = ['technologies', 'featured', 'projects', 'skills', 'certificates', 'contact'];

export const DEFAULT_DESIGN = Object.freeze({
  palette: 'aurora',
  background: 'aurora',
  font: 'moderna',
  layouts: Object.fromEntries(Object.entries(DESIGN_OPTIONS.layouts).map(([k, v]) => [k, v[0]])),
  order: [...SECTIONS],
  hidden: [],
});

/** Combina un diseño guardado (posiblemente viejo o parcial) con los valores por defecto. */
export function withDefaults(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
  const layouts = Object.fromEntries(
    Object.entries(DESIGN_OPTIONS.layouts).map(([k, allowed]) => [k, pick(d.layouts?.[k], allowed, allowed[0])]),
  );
  const order = Array.isArray(d.order) ? d.order.filter((s) => SECTIONS.includes(s)) : [];
  for (const s of SECTIONS) if (!order.includes(s)) order.push(s);
  return {
    palette: pick(d.palette, DESIGN_OPTIONS.palette, DEFAULT_DESIGN.palette),
    background: pick(d.background, DESIGN_OPTIONS.background, DEFAULT_DESIGN.background),
    font: pick(d.font, DESIGN_OPTIONS.font, DEFAULT_DESIGN.font),
    layouts,
    order: [...new Set(order)],
    hidden: Array.isArray(d.hidden) ? [...new Set(d.hidden.filter((s) => SECTIONS.includes(s)))] : [],
  };
}

/** Valida un diseño enviado por el cliente: rechaza valores desconocidos con un mensaje por campo. */
export function validateDesign(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw AppError.badRequest('El diseño debe ser un objeto');
  }
  const errors = {};
  for (const key of ['palette', 'background', 'font']) {
    if (input[key] !== undefined && !DESIGN_OPTIONS[key].includes(input[key])) errors[key] = 'Opción inválida';
  }
  if (input.layouts !== undefined) {
    if (typeof input.layouts !== 'object' || input.layouts === null) errors.layouts = 'Formato inválido';
    else {
      for (const [section, value] of Object.entries(input.layouts)) {
        const allowed = DESIGN_OPTIONS.layouts[section];
        if (!allowed) errors[`layouts.${section}`] = 'Sección desconocida';
        else if (!allowed.includes(value)) errors[`layouts.${section}`] = 'Plantilla inválida';
      }
    }
  }
  if (input.order !== undefined) {
    const ok =
      Array.isArray(input.order) &&
      input.order.length === SECTIONS.length &&
      SECTIONS.every((s) => input.order.includes(s));
    if (!ok) errors.order = 'El orden debe incluir cada sección una sola vez';
  }
  if (input.hidden !== undefined) {
    if (!Array.isArray(input.hidden) || !input.hidden.every((s) => SECTIONS.includes(s))) errors.hidden = 'Secciones inválidas';
  }
  if (Object.keys(errors).length) throw AppError.validation(errors);
  return withDefaults(input);
}
