import { pool } from '../config/db.js';

/** Consultas agregadas para el dashboard de un usuario. */
export async function getStats(userId) {
  const [[projects]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'finalizado'), 0)  AS finalizado,
            COALESCE(SUM(status = 'en_progreso'), 0) AS en_progreso,
            COALESCE(SUM(status = 'pausado'), 0)     AS pausado,
            COALESCE(SUM(featured = 1), 0)           AS featured
       FROM projects WHERE user_id = ?`,
    [userId],
  );
  const [[{ skills }]] = await pool.query('SELECT COUNT(*) AS skills FROM skills WHERE user_id = ?', [userId]);
  const [[{ certificates }]] = await pool.query('SELECT COUNT(*) AS certificates FROM certificates WHERE user_id = ?', [userId]);
  const [[{ technologies }]] = await pool.query(
    `SELECT COUNT(DISTINCT pt.technology_id) AS technologies
       FROM project_technologies pt JOIN projects p ON p.id = pt.project_id WHERE p.user_id = ?`,
    [userId],
  );

  const [topTechnologies] = await pool.query(
    `SELECT t.name, COUNT(*) AS total
       FROM project_technologies pt
       JOIN technologies t ON t.id = pt.technology_id
       JOIN projects p ON p.id = pt.project_id
      WHERE p.user_id = ?
      GROUP BY t.id, t.name ORDER BY total DESC, t.name LIMIT 8`,
    [userId],
  );
  const [byYear] = await pool.query(
    `SELECT YEAR(project_date) AS year, COUNT(*) AS total
       FROM projects WHERE user_id = ? GROUP BY YEAR(project_date) ORDER BY year`,
    [userId],
  );
  const [byCategory] = await pool.query(
    `SELECT COALESCE(NULLIF(category, ''), 'Sin categoría') AS name, COUNT(*) AS total
       FROM projects WHERE user_id = ? GROUP BY name ORDER BY total DESC`,
    [userId],
  );
  const [skillsByCategory] = await pool.query(
    'SELECT category AS name, COUNT(*) AS total FROM skills WHERE user_id = ? GROUP BY category ORDER BY total DESC',
    [userId],
  );
  const [skillsByLevel] = await pool.query(
    'SELECT level AS name, COUNT(*) AS total FROM skills WHERE user_id = ? GROUP BY level',
    [userId],
  );
  const [recentProjects] = await pool.query(
    'SELECT id, name, status, featured, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 5',
    [userId],
  );

  const num = (rows) => rows.map((r) => ({ ...r, total: Number(r.total) }));

  return {
    totals: {
      projects: Number(projects.total),
      featured: Number(projects.featured),
      skills: Number(skills),
      certificates: Number(certificates),
      technologies: Number(technologies),
    },
    projectsByStatus: {
      finalizado: Number(projects.finalizado),
      en_progreso: Number(projects.en_progreso),
      pausado: Number(projects.pausado),
    },
    topTechnologies: num(topTechnologies),
    projectsByYear: num(byYear).map((r) => ({ year: Number(r.year), total: r.total })),
    projectsByCategory: num(byCategory),
    skillsByCategory: num(skillsByCategory),
    skillsByLevel: num(skillsByLevel),
    recentProjects: recentProjects.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      featured: Boolean(r.featured),
      updatedAt: r.updated_at,
    })),
  };
}
