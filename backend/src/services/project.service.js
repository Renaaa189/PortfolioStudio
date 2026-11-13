import * as defaultRepo from '../repositories/project.repository.js';
import { AppError } from '../errors/AppError.js';
import { Validator, clean, parseBool } from '../utils/validators.js';

export const PROJECT_STATUSES = ['en_progreso', 'finalizado', 'pausado'];
export const MAX_TECHNOLOGIES = 20;
const MAX_LIMIT = 50;

/** Normaliza la lista de tecnologías: trim, sin vacíos y sin duplicados (ignora mayúsculas). */
export function normalizeTechnologies(input) {
  const list = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const name = String(raw ?? '').trim().replace(/\s+/g, ' ');
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}

function sanitize(input) {
  return {
    name: clean(input.name),
    description: clean(input.description),
    category: clean(input.category),
    technologies: normalizeTechnologies(input.technologies),
    image: clean(input.image),
    githubUrl: clean(input.githubUrl),
    demoUrl: clean(input.demoUrl),
    date: clean(input.date),
    status: clean(input.status) || 'en_progreso',
    featured: parseBool(input.featured) ?? false,
  };
}

function validate(p) {
  const v = new Validator();
  v.required('name', p.name, 'El nombre es obligatorio').maxLength('name', p.name, 120);
  v.required('description', p.description, 'La descripción es obligatoria').maxLength('description', p.description, 2000);
  v.maxLength('category', p.category, 60);
  v.check('technologies', p.technologies.length > 0, 'Agregá al menos una tecnología');
  v.check('technologies', p.technologies.length <= MAX_TECHNOLOGIES, `Máximo ${MAX_TECHNOLOGIES} tecnologías`);
  v.check('technologies', p.technologies.every((t) => t.length <= 60), 'Cada tecnología admite hasta 60 caracteres');
  v.url('image', p.image, { asset: true }).maxLength('image', p.image, 500);
  v.url('githubUrl', p.githubUrl).maxLength('githubUrl', p.githubUrl, 500);
  v.url('demoUrl', p.demoUrl).maxLength('demoUrl', p.demoUrl, 500);
  v.pastDate('date', p.date, { required: true });
  v.oneOf('status', p.status, PROJECT_STATUSES, 'El estado debe ser en_progreso, finalizado o pausado');
  v.throwIfAny();
}

/** Traduce los query params de GET /api/projects a filtros seguros. */
export function parseFilters(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || 9));
  const year = parseInt(query.year, 10);
  const status = clean(query.status);

  if (status && !PROJECT_STATUSES.includes(status)) {
    throw AppError.badRequest('Filtro de estado inválido');
  }

  return {
    q: clean(query.q)?.slice(0, 100) || null,
    technology: clean(query.technology),
    year: Number.isInteger(year) && year > 1900 ? year : null,
    status,
    featured: parseBool(query.featured),
    category: clean(query.category),
    sort: clean(query.sort) || 'recent',
    page,
    limit,
  };
}

export function createProjectService(repo = defaultRepo) {
  async function ensureUniqueName(userId, name, currentId) {
    const existing = await repo.findByName(userId, name);
    if (existing && existing.id !== currentId) {
      throw AppError.conflict('Ya tenés un proyecto con ese nombre', { name: 'Ya tenés un proyecto con ese nombre' });
    }
  }

  async function getById(userId, id) {
    const project = await repo.findById(userId, id);
    if (!project) throw AppError.notFound('El proyecto no existe');
    return project;
  }

  return {
    async list(userId, query) {
      const filters = parseFilters(query);
      const { items, total } = await repo.findAll(userId, filters);
      return {
        data: items,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / filters.limit)),
        },
      };
    },

    getById,

    async create(userId, input) {
      const project = sanitize(input);
      validate(project);
      await ensureUniqueName(userId, project.name);
      return repo.create(userId, project);
    },

    /** Sirve para PUT y PATCH: mezcla con lo existente y valida el resultado completo. */
    async update(userId, id, input) {
      const current = await getById(userId, id);
      const project = sanitize({ ...current, ...input });
      validate(project);
      await ensureUniqueName(userId, project.name, id);
      return repo.update(userId, id, project);
    },

    async remove(userId, id) {
      const deleted = await repo.remove(userId, id);
      if (!deleted) throw AppError.notFound('El proyecto no existe');
    },

    filterOptions: (userId) => repo.findFilterOptions(userId),
  };
}

export const projectService = createProjectService();
