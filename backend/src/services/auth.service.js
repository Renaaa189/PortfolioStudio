import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/user.repository.js';
import { AppError } from '../errors/AppError.js';
import { Validator, clean, isValidEmail } from '../utils/validators.js';
import { normalizeUsername, usernameError } from '../utils/username.js';
import { env } from '../config/env.js';

// Hash de relleno para que un email inexistente tarde lo mismo que uno real.
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', 10);

export const hashPassword = (plain) => bcrypt.hash(plain, 10);

export function validateNewPassword(v, field, password) {
  v.required(field, password, 'La contraseña es obligatoria');
  v.check(field, String(password ?? '').length >= 8, 'La contraseña debe tener al menos 8 caracteres');
  v.check(field, /[A-Za-z]/.test(password) && /\d/.test(password), 'Usá letras y números');
  v.check(field, String(password ?? '').length <= 72, 'Máximo 72 caracteres');
}

export function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    throw AppError.unauthorized('La sesión expiró o no es válida. Volvé a iniciar sesión.');
  }
}

export const authService = {
  /** Crea una cuenta nueva y devuelve la sesión iniciada. */
  async register(input = {}) {
    const data = {
      firstName: clean(input.firstName),
      lastName: clean(input.lastName),
      username: normalizeUsername(input.username),
      email: clean(input.email)?.toLowerCase() ?? null,
      password: input.password ?? '',
    };

    const v = new Validator();
    v.required('firstName', data.firstName, 'Ingresá tu nombre').maxLength('firstName', data.firstName, 80);
    v.required('lastName', data.lastName, 'Ingresá tu apellido').maxLength('lastName', data.lastName, 80);
    const uErr = usernameError(data.username);
    v.check('username', !uErr, uErr);
    v.required('email', data.email, 'Ingresá tu email');
    v.check('email', !data.email || isValidEmail(data.email), 'El email no es válido').maxLength('email', data.email, 190);
    validateNewPassword(v, 'password', data.password);
    v.throwIfAny();

    const conflicts = {};
    if (await userRepo.findByEmail(data.email)) conflicts.email = 'Ya hay una cuenta con ese email';
    if (await userRepo.usernameTaken(data.username)) conflicts.username = 'Ese nombre de usuario ya está en uso';
    if (Object.keys(conflicts).length) throw AppError.conflict('No se pudo crear la cuenta', conflicts);

    const user = await userRepo.create({ ...data, passwordHash: await hashPassword(data.password) });
    return { token: signToken(user), user };
  },

  async login(input = {}) {
    const email = clean(input.email)?.toLowerCase();
    const password = input.password ?? '';

    const v = new Validator();
    v.required('email', email, 'Ingresá tu email').check('email', !email || isValidEmail(email), 'El email no es válido');
    v.required('password', password, 'Ingresá tu contraseña');
    v.throwIfAny();

    const user = await userRepo.findCredentialsByEmail(email);
    const ok = await bcrypt.compare(String(password), user?.password_hash || DUMMY_HASH);
    if (!user || !ok) throw AppError.unauthorized('Email o contraseña incorrectos');

    return { token: signToken(user), user: await userRepo.findById(user.id) };
  },

  async me(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw AppError.unauthorized('El usuario ya no existe');
    return user;
  },

  async changePassword(userId, { currentPassword, newPassword } = {}) {
    const v = new Validator();
    v.required('currentPassword', currentPassword, 'Ingresá tu contraseña actual');
    validateNewPassword(v, 'newPassword', newPassword);
    v.throwIfAny();

    const hash = await userRepo.findPasswordHashById(userId);
    if (!hash || !(await bcrypt.compare(String(currentPassword), hash))) {
      throw AppError.validation({ currentPassword: 'La contraseña actual no es correcta' });
    }
    await userRepo.updatePassword(userId, await hashPassword(newPassword));
  },
};
