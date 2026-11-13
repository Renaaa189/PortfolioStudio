import * as userRepo from '../repositories/user.repository.js';
import { AppError } from '../errors/AppError.js';
import { Validator, clean, isValidEmail, parseBool } from '../utils/validators.js';
import { normalizeUsername, usernameError } from '../utils/username.js';
import { validateDesign } from '../utils/design.js';

const sanitize = (i) => ({
  username: normalizeUsername(i.username),
  firstName: clean(i.firstName),
  lastName: clean(i.lastName),
  photo: clean(i.photo),
  role: clean(i.role),
  bio: clean(i.bio),
  location: clean(i.location),
  email: clean(i.email)?.toLowerCase() ?? null,
  github: clean(i.github),
  linkedin: clean(i.linkedin),
  website: clean(i.website),
});

function validate(p) {
  const v = new Validator();
  const uErr = usernameError(p.username);
  v.check('username', !uErr, uErr);
  v.required('firstName', p.firstName, 'El nombre es obligatorio').maxLength('firstName', p.firstName, 80);
  v.required('lastName', p.lastName, 'El apellido es obligatorio').maxLength('lastName', p.lastName, 80);
  v.required('email', p.email, 'El email es obligatorio');
  v.check('email', !p.email || isValidEmail(p.email), 'El email no es válido');
  v.maxLength('email', p.email, 190);
  v.maxLength('role', p.role, 120).maxLength('location', p.location, 120).maxLength('bio', p.bio, 3000);
  v.url('photo', p.photo, { asset: true });
  v.url('github', p.github).url('linkedin', p.linkedin).url('website', p.website);
  if (p.github) v.check('github', /github\.com/i.test(p.github), 'Tiene que ser un enlace de github.com');
  if (p.linkedin) v.check('linkedin', /linkedin\.com/i.test(p.linkedin), 'Tiene que ser un enlace de linkedin.com');
  v.throwIfAny();
}

export const profileService = {
  async get(userId) {
    const profile = await userRepo.findById(userId);
    if (!profile) throw AppError.notFound('Perfil no encontrado');
    return profile;
  },

  async update(userId, input = {}) {
    const current = await this.get(userId);
    const profile = sanitize({ ...current, ...input });
    validate(profile);
    const conflicts = {};
    const sameEmail = await userRepo.findByEmail(profile.email);
    if (sameEmail && sameEmail.id !== userId) conflicts.email = 'Ese email ya está en uso';
    const sameUsername = await userRepo.usernameTaken(profile.username);
    if (sameUsername && sameUsername.id !== userId) conflicts.username = 'Ese nombre de usuario ya está en uso';
    if (Object.keys(conflicts).length) throw AppError.conflict('No se pudo guardar el perfil', conflicts);
    return userRepo.updateProfile(userId, profile);
  },

  /** Guarda la personalización visual (paleta, fondo, tipografía, plantillas y estructura). */
  async updateDesign(userId, input) {
    const current = await this.get(userId);
    const merged = {
      ...current.design,
      ...(input || {}),
      layouts: { ...current.design.layouts, ...(input?.layouts || {}) },
    };
    return userRepo.updateDesign(userId, validateDesign(merged));
  },

  async setPublished(userId, input = {}) {
    const published = parseBool(input.published);
    if (published === undefined) throw AppError.validation({ published: 'Indicá true o false' });
    await this.get(userId);
    return userRepo.setPublished(userId, published);
  },
};
