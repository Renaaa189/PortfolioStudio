import { pool } from '../config/db.js';
import { withDefaults } from '../utils/design.js';

function parseDesign(raw) {
  try {
    return withDefaults(raw ? JSON.parse(raw) : null);
  } catch {
    return withDefaults(null);
  }
}

const toProfile = (r) => ({
  id: r.id,
  username: r.username,
  firstName: r.first_name,
  lastName: r.last_name,
  photo: r.photo,
  role: r.role,
  bio: r.bio,
  location: r.location,
  email: r.email,
  github: r.github,
  linkedin: r.linkedin,
  website: r.website,
  isPublished: Boolean(r.is_published),
  design: parseDesign(r.design),
  updatedAt: r.updated_at,
});

/** Devuelve el usuario con el hash de contraseña (solo para autenticación). */
export async function findCredentialsByEmail(email) {
  const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findPasswordHashById(id) {
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [id]);
  return rows[0]?.password_hash ?? null;
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ? toProfile(rows[0]) : null;
}

export async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] ? toProfile(rows[0]) : null;
}

export async function usernameTaken(username) {
  const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function create({ username, email, passwordHash, firstName, lastName }) {
  const [res] = await pool.query(
    'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
    [username, email, passwordHash, firstName, lastName],
  );
  return findById(res.insertId);
}

export async function updateProfile(id, p) {
  await pool.query(
    `UPDATE users SET username = ?, first_name = ?, last_name = ?, photo = ?, role = ?, bio = ?, location = ?,
            email = ?, github = ?, linkedin = ?, website = ?
      WHERE id = ?`,
    [p.username, p.firstName, p.lastName, p.photo, p.role, p.bio, p.location, p.email, p.github, p.linkedin, p.website, id],
  );
  return findById(id);
}

export async function setPublished(id, published) {
  await pool.query('UPDATE users SET is_published = ? WHERE id = ?', [published ? 1 : 0, id]);
  return findById(id);
}

export async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

export async function updateDesign(id, design) {
  await pool.query('UPDATE users SET design = ? WHERE id = ?', [JSON.stringify(design), id]);
  return findById(id);
}
