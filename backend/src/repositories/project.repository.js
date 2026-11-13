import { pool, withTransaction } from '../config/db.js';
import { escapeLike } from '../utils/validators.js';
import * as techRepo from './technology.repository.js';

/** Único lugar con SQL sobre `projects`. Todas las consultas se filtran por el usuario dueño. */

const COLUMNS = `p.id, p.name, p.description, p.category, p.image, p.github_url, p.demo_url,
  p.project_date, p.status, p.featured, p.created_at, p.updated_at`;

const SORTS = {
  recent: 'p.project_date DESC, p.id DESC',
  oldest: 'p.project_date ASC, p.id ASC',
  name: 'p.name ASC',
  updated: 'p.updated_at DESC, p.id DESC',
};

const toProject = (row, technologies = []) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  technologies,
  image: row.image,
  githubUrl: row.github_url,
  demoUrl: row.demo_url,
  date: row.project_date,
  status: row.status,
  featured: Boolean(row.featured),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

function buildWhere(userId, { q, technology, year, status, featured, category }) {
  const where = ['p.user_id = ?'];
  const params = [userId];

  if (q) {
    const like = `%${escapeLike(q)}%`;
    where.push(`(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?
      OR REPLACE(p.status, '_', ' ') LIKE ?
      OR EXISTS (SELECT 1 FROM project_technologies pt
                   JOIN technologies t ON t.id = pt.technology_id
                  WHERE pt.project_id = p.id AND t.name LIKE ?))`);
    params.push(like, like, like, like, like);
  }
  if (technology) {
    where.push(`EXISTS (SELECT 1 FROM project_technologies pt
                          JOIN technologies t ON t.id = pt.technology_id
                         WHERE pt.project_id = p.id AND t.name = ?)`);
    params.push(technology);
  }
  if (year) {
    where.push('YEAR(p.project_date) = ?');
    params.push(year);
  }
  if (status) {
    where.push('p.status = ?');
    params.push(status);
  }
  if (featured !== undefined) {
    where.push('p.featured = ?');
    params.push(featured ? 1 : 0);
  }
  if (category) {
    where.push('p.category = ?');
    params.push(category);
  }

  return { sql: `WHERE ${where.join(' AND ')}`, params };
}

async function attachTechnologies(rows, conn) {
  const techs = await techRepo.findByProjectIds(rows.map((r) => r.id), conn);
  return rows.map((r) => toProject(r, techs.get(r.id) || []));
}

export async function findAll(userId, filters) {
  const { page, limit, sort } = filters;
  const { sql, params } = buildWhere(userId, filters);
  const orderBy = SORTS[sort] || SORTS.recent;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM projects p ${sql}`, params);
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM projects p ${sql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit],
  );

  return { items: await attachTechnologies(rows), total: Number(total) };
}

export async function findById(userId, id, conn = pool) {
  const [rows] = await conn.query(`SELECT ${COLUMNS} FROM projects p WHERE p.id = ? AND p.user_id = ?`, [id, userId]);
  if (!rows.length) return null;
  const [project] = await attachTechnologies(rows, conn);
  return project;
}

export async function findByName(userId, name) {
  const [rows] = await pool.query('SELECT id FROM projects WHERE user_id = ? AND name = ?', [userId, name]);
  return rows[0] || null;
}

const toRow = (p) => [
  p.name, p.description, p.category, p.image, p.githubUrl, p.demoUrl, p.date, p.status, p.featured ? 1 : 0,
];

export function create(userId, project) {
  return withTransaction(async (conn) => {
    const [res] = await conn.query(
      `INSERT INTO projects (user_id, name, description, category, image, github_url, demo_url, project_date, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, ...toRow(project)],
    );
    await techRepo.setProjectTechnologies(conn, res.insertId, project.technologies);
    return findById(userId, res.insertId, conn);
  });
}

export function update(userId, id, project) {
  return withTransaction(async (conn) => {
    await conn.query(
      `UPDATE projects SET name = ?, description = ?, category = ?, image = ?, github_url = ?,
              demo_url = ?, project_date = ?, status = ?, featured = ?
        WHERE id = ? AND user_id = ?`,
      [...toRow(project), id, userId],
    );
    await techRepo.setProjectTechnologies(conn, id, project.technologies);
    await techRepo.deleteOrphans(conn);
    return findById(userId, id, conn);
  });
}

export function remove(userId, id) {
  return withTransaction(async (conn) => {
    const [res] = await conn.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
    await techRepo.deleteOrphans(conn);
    return res.affectedRows > 0;
  });
}

/** Valores distintos para poblar los filtros del frontend. */
export async function findFilterOptions(userId) {
  const [categories] = await pool.query(
    "SELECT DISTINCT category FROM projects WHERE user_id = ? AND category IS NOT NULL AND category <> '' ORDER BY category",
    [userId],
  );
  const [years] = await pool.query(
    'SELECT DISTINCT YEAR(project_date) AS year FROM projects WHERE user_id = ? ORDER BY year DESC',
    [userId],
  );
  const technologies = await techRepo.findAllInUse(userId);
  return {
    categories: categories.map((r) => r.category),
    years: years.map((r) => Number(r.year)),
    technologies: technologies.map((t) => t.name),
  };
}
