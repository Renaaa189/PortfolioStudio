import { pool } from '../config/db.js';

/** Único lugar con SQL sobre `certificates`. Todas las consultas se filtran por el usuario dueño. */

const toCertificate = (r) => ({
  id: r.id,
  name: r.name,
  institution: r.institution,
  date: r.issue_date,
  description: r.description,
  image: r.image,
  pdfFile: r.pdf_file,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toRow = (c) => [c.name, c.institution, c.date, c.description, c.image, c.pdfFile];

export async function findAll(userId, { q } = {}) {
  const params = [userId];
  let where = 'WHERE user_id = ?';
  if (q) {
    where += ' AND (name LIKE ? OR institution LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  const [rows] = await pool.query(`SELECT * FROM certificates ${where} ORDER BY issue_date DESC, id DESC LIMIT 500`, params);
  return rows.map(toCertificate);
}

export async function findById(userId, id) {
  const [rows] = await pool.query('SELECT * FROM certificates WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] ? toCertificate(rows[0]) : null;
}

export async function create(userId, c) {
  const [res] = await pool.query(
    'INSERT INTO certificates (user_id, name, institution, issue_date, description, image, pdf_file) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, ...toRow(c)],
  );
  return findById(userId, res.insertId);
}

export async function update(userId, id, c) {
  await pool.query(
    `UPDATE certificates SET name = ?, institution = ?, issue_date = ?, description = ?, image = ?, pdf_file = ?
      WHERE id = ? AND user_id = ?`,
    [...toRow(c), id, userId],
  );
  return findById(userId, id);
}

export async function remove(userId, id) {
  const [res] = await pool.query('DELETE FROM certificates WHERE id = ? AND user_id = ?', [id, userId]);
  return res.affectedRows > 0;
}
