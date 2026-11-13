import * as defaultRepo from '../repositories/skill.repository.js';
import { AppError } from '../errors/AppError.js';
import { Validator, clean, escapeLike } from '../utils/validators.js';

export const SKILL_LEVELS = ['basico', 'intermedio', 'avanzado', 'experto'];

const sanitize = (i) => ({
  name: clean(i.name),
  category: clean(i.category),
  level: clean(i.level),
  icon: clean(i.icon),
});

function validate(s) {
  const v = new Validator();
  v.required('name', s.name, 'El nombre es obligatorio').maxLength('name', s.name, 80);
  v.required('category', s.category, 'La categoría es obligatoria').maxLength('category', s.category, 60);
  v.oneOf('level', s.level, SKILL_LEVELS, 'El nivel debe ser basico, intermedio, avanzado o experto');
  v.maxLength('icon', s.icon, 500);
  v.throwIfAny();
}

export function createSkillService(repo = defaultRepo) {
  async function ensureUnique(userId, name, currentId) {
    const existing = await repo.findByName(userId, name);
    if (existing && existing.id !== currentId) {
      throw AppError.conflict('Ya tenés una habilidad con ese nombre', { name: 'Ya tenés una habilidad con ese nombre' });
    }
  }

  async function getById(userId, id) {
    const skill = await repo.findById(userId, id);
    if (!skill) throw AppError.notFound('La habilidad no existe');
    return skill;
  }

  return {
    list: (userId, query = {}) =>
      repo.findAll(userId, { category: clean(query.category), q: clean(query.q) ? escapeLike(clean(query.q)) : null }),
    categories: (userId) => repo.findCategories(userId),
    getById,
    async create(userId, input) {
      const skill = sanitize(input);
      validate(skill);
      await ensureUnique(userId, skill.name);
      return repo.create(userId, skill);
    },
    async update(userId, id, input) {
      const current = await getById(userId, id);
      const skill = sanitize({ ...current, ...input });
      validate(skill);
      await ensureUnique(userId, skill.name, id);
      return repo.update(userId, id, skill);
    },
    async remove(userId, id) {
      if (!(await repo.remove(userId, id))) throw AppError.notFound('La habilidad no existe');
    },
  };
}

export const skillService = createSkillService();
