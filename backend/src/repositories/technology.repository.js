import { pool } from '../config/db.js';

/** Único lugar con SQL sobre `technologies` y `project_technologies`. */

export async function setProjectTechnologies(conn, projectId, names) {
  await conn.query('DELETE FROM project_technologies WHERE project_id = ?', [projectId]);
  if (!names.length) return;

  await conn.query(
    'INSERT INTO technologies (name) VALUES ? ON DUPLICATE KEY UPDATE name = name',
    [names.map((n) => [n])],
  );
  const [rows] = await conn.query('SELECT id FROM technologies WHERE name IN (?)', [names]);
  await conn.query('INSERT INTO project_technologies (project_id, technology_id) VALUES ?', [
    rows.map((r) => [projectId, r.id]),
  ]);
}

export async function findByProjectIds(ids, conn = pool) {
  if (!ids.length) return new Map();
  const [rows] = await conn.query(
    `SELECT pt.project_id, t.name
       FROM project_technologies pt
       JOIN technologies t ON t.id = pt.technology_id
      WHERE pt.project_id IN (?)
      ORDER BY t.name`,
    [ids],
  );
  const map = new Map(ids.map((id) => [id, []]));
  for (const r of rows) map.get(r.project_id).push(r.name);
  return map;
}

/** Borra tecnologías que ya no usa ningún proyecto. */
export async function deleteOrphans(conn = pool) {
  await conn.query(
    `DELETE t FROM technologies t
       LEFT JOIN project_technologies pt ON pt.technology_id = t.id
      WHERE pt.project_id IS NULL`,
  );
}

export async function findAllInUse(userId) {
  const [rows] = await pool.query(
    `SELECT t.name, COUNT(pt.project_id) AS total
       FROM technologies t
       JOIN project_technologies pt ON pt.technology_id = t.id
       JOIN projects p ON p.id = pt.project_id
      WHERE p.user_id = ?
      GROUP BY t.id, t.name
      ORDER BY total DESC, t.name`,
    [userId],
  );
  return rows.map((r) => ({ name: r.name, total: Number(r.total) }));
}
