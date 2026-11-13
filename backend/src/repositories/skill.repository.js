import { pool } from '../config/db.js';

/** Único lugar con SQL sobre `skills`. Todas las consultas se filtran por el usuario dueño. */

const LEVEL_ORDER = "FIELD(level, 'experto', 'avanzado', 'intermedio', 'basico')";

const toSkill = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  level: r.level,
  icon: r.icon,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function findAll(userId, { category, q } = {}) {
  const where = ['user_id = ?'];
  const params = [userId];
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (q) {
    where.push('name LIKE ?');
    params.push(`%${q}%`);
  }
  const [rows] = await pool.query(
    `SELECT * FROM skills WHERE ${where.join(' AND ')} ORDER BY category, ${LEVEL_ORDER}, name LIMIT 500`,
    params,
  );
  return rows.map(toSkill);
}

export async function findById(userId, id) {
  const [rows] = await pool.query('SELECT * FROM skills WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] ? toSkill(rows[0]) : null;
}

export async function findByName(userId, name) {
  const [rows] = await pool.query('SELECT id FROM skills WHERE user_id = ? AND name = ?', [userId, name]);
  return rows[0] || null;
}

export async function create(userId, s) {
  const [res] = await pool.query('INSERT INTO skills (user_id, name, category, level, icon) VALUES (?, ?, ?, ?, ?)', [
    userId, s.name, s.category, s.level, s.icon,
  ]);
  return findById(userId, res.insertId);
}

export async function update(userId, id, s) {
  await pool.query('UPDATE skills SET name = ?, category = ?, level = ?, icon = ? WHERE id = ? AND user_id = ?', [
    s.name, s.category, s.level, s.icon, id, userId,
  ]);
  return findById(userId, id);
}

export async function remove(userId, id) {
  const [res] = await pool.query('DELETE FROM skills WHERE id = ? AND user_id = ?', [id, userId]);
  return res.affectedRows > 0;
}

export async function findCategories(userId) {
  const [rows] = await pool.query('SELECT DISTINCT category FROM skills WHERE user_id = ? ORDER BY category', [userId]);
  return rows.map((r) => r.category);
}
