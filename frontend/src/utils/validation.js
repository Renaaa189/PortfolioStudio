/**
 * Validaciones del cliente: dan feedback inmediato con las mismas reglas
 * que el backend (que sigue siendo la validación definitiva).
 */
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function isHttpUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const isAsset = (v) => isHttpUrl(v) || /^\/uploads\/[\w.-]+$/.test(v);
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v));

const URL_MSG = 'Ingresá una URL válida (http:// o https://)';

function rules() {
  const errors = {};
  const api = {
    errors,
    add(field, cond, msg) {
      if (!cond && !errors[field]) errors[field] = msg;
      return api;
    },
    required(field, v, msg) {
      return api.add(field, !blank(v), msg || 'Este campo es obligatorio');
    },
    max(field, v, n) {
      return api.add(field, blank(v) || String(v).trim().length <= n, `Máximo ${n} caracteres`);
    },
    url(field, v, asset = false) {
      return api.add(field, blank(v) || (asset ? isAsset(v.trim()) : isHttpUrl(v.trim())), URL_MSG);
    },
    pastDate(field, v) {
      api.required(field, v, 'La fecha es obligatoria');
      return api.add(field, blank(v) || v <= todayISO(), 'La fecha no puede ser futura');
    },
  };
  return api;
}

export function validateProject(p) {
  const r = rules();
  r.required('name', p.name, 'El nombre es obligatorio').max('name', p.name, 120);
  r.required('description', p.description, 'La descripción es obligatoria').max('description', p.description, 2000);
  r.max('category', p.category, 60);
  r.add('technologies', p.technologies?.length > 0, 'Agregá al menos una tecnología');
  r.add('technologies', (p.technologies?.length ?? 0) <= 20, 'Máximo 20 tecnologías');
  r.url('image', p.image, true).url('githubUrl', p.githubUrl).url('demoUrl', p.demoUrl);
  r.pastDate('date', p.date);
  return r.errors;
}

export function validateSkill(s) {
  const r = rules();
  r.required('name', s.name, 'El nombre es obligatorio').max('name', s.name, 80);
  r.required('category', s.category, 'La categoría es obligatoria').max('category', s.category, 60);
  r.required('level', s.level, 'Elegí un nivel');
  r.max('icon', s.icon, 500);
  return r.errors;
}

export function validateCertificate(c) {
  const r = rules();
  r.required('name', c.name, 'El nombre es obligatorio').max('name', c.name, 150);
  r.required('institution', c.institution, 'La institución es obligatoria').max('institution', c.institution, 150);
  r.pastDate('date', c.date);
  r.max('description', c.description, 2000);
  r.url('image', c.image, true).url('pdfFile', c.pdfFile, true);
  return r.errors;
}

const RESERVED = ['admin', 'api', 'app', 'login', 'registro', 'register', 'panel', 'p', 'uploads', 'static', 'assets',
  'portfolio', 'portfoliostudio', 'soporte', 'support', 'ayuda', 'help', 'root', 'null', 'undefined'];

/** Mismas reglas que el backend para el nombre de usuario (forma la URL /p/:usuario). */
export function usernameError(u) {
  if (!u) return 'Elegí un nombre de usuario';
  if (u.length < 3 || u.length > 30) return 'Entre 3 y 30 caracteres';
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(u)) return 'Solo minúsculas, números y guiones (sin guion al principio ni al final)';
  if (u.includes('--')) return 'No uses dos guiones seguidos';
  if (RESERVED.includes(u)) return 'Ese nombre está reservado';
  return undefined;
}

/** Sugiere un usuario a partir del nombre: "María José" → "maria-jose". */
export const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

export function validateRegister(d) {
  const r = rules();
  r.required('firstName', d.firstName, 'Ingresá tu nombre').max('firstName', d.firstName, 80);
  r.required('lastName', d.lastName, 'Ingresá tu apellido').max('lastName', d.lastName, 80);
  r.add('username', !usernameError(d.username), usernameError(d.username));
  r.required('email', d.email, 'Ingresá tu email').add('email', blank(d.email) || isEmail(d.email), 'El email no es válido');
  r.add('password', String(d.password).length >= 8, 'Mínimo 8 caracteres');
  r.add('password', /[A-Za-z]/.test(d.password) && /\d/.test(d.password), 'Usá letras y números');
  return r.errors;
}

export function validateProfile(p) {
  const r = rules();
  r.add('username', !usernameError(p.username), usernameError(p.username));
  r.required('firstName', p.firstName, 'El nombre es obligatorio').max('firstName', p.firstName, 80);
  r.required('lastName', p.lastName, 'El apellido es obligatorio').max('lastName', p.lastName, 80);
  r.required('email', p.email, 'El email es obligatorio').add('email', blank(p.email) || isEmail(p.email), 'El email no es válido');
  r.max('role', p.role, 120).max('location', p.location, 120).max('bio', p.bio, 3000);
  r.url('photo', p.photo, true).url('github', p.github).url('linkedin', p.linkedin).url('website', p.website);
  r.add('github', blank(p.github) || /github\.com/i.test(p.github), 'Tiene que ser un enlace de github.com');
  r.add('linkedin', blank(p.linkedin) || /linkedin\.com/i.test(p.linkedin), 'Tiene que ser un enlace de linkedin.com');
  return r.errors;
}

export function validatePassword({ currentPassword, newPassword, confirm }) {
  const r = rules();
  r.required('currentPassword', currentPassword, 'Ingresá tu contraseña actual');
  r.required('newPassword', newPassword, 'Ingresá la nueva contraseña');
  r.add('newPassword', String(newPassword).length >= 8, 'Mínimo 8 caracteres');
  r.add('newPassword', /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword), 'Usá letras y números');
  r.add('confirm', confirm === newPassword, 'Las contraseñas no coinciden');
  return r.errors;
}
