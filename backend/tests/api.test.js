/**
 * Tests de integración: levantan la app real contra una base MySQL de test.
 * Usan DB_NAME_TEST (por defecto portfolio_studio_test). Si MySQL no está
 * disponible, se saltean en lugar de fallar.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'portfolio_studio_test';

const { env } = await import('../src/config/env.js');
const { reset } = await import('../database/migrate.js');

let dbReady = true;
try {
  await reset(env);
} catch (err) {
  dbReady = false;
  console.warn(`⚠ MySQL no disponible, se saltean los tests de integración: ${err.message}`);
}

const { pool } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');

let server;
let base;
const tokens = {};

const api = async (method, path, body, who = 'ana') => {
  const token = who && tokens[who];
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

before(() => {
  if (!dbReady) return;
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await pool.end();
});

const it = (name, fn) => test(name, { skip: !dbReady && 'MySQL no disponible' }, fn);

const ANA = { firstName: 'Ana', lastName: 'Gómez', username: 'ana', email: 'ana@test.dev', password: 'Clave1234' };
const LUIS = { firstName: 'Luis', lastName: 'Pérez', username: 'luis-dev', email: 'luis@test.dev', password: 'Clave1234' };

it('registro: crea cuentas, valida datos y evita duplicados', async () => {
  const bad = await api('POST', '/auth/register', { ...ANA, username: 'Admin', email: 'mal', password: '123' }, null);
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.details.username && bad.body.error.details.email && bad.body.error.details.password);

  const ana = await api('POST', '/auth/register', ANA, null);
  assert.equal(ana.status, 201);
  assert.equal(ana.body.user.username, 'ana');
  assert.equal(ana.body.user.isPublished, false);
  assert.equal(ana.body.user.passwordHash, undefined);
  tokens.ana = ana.body.token;

  const dup = await api('POST', '/auth/register', { ...LUIS, username: 'ana', email: 'ANA@test.dev' }, null);
  assert.equal(dup.status, 409);
  assert.ok(dup.body.error.details.username && dup.body.error.details.email);

  const luis = await api('POST', '/auth/register', LUIS, null);
  assert.equal(luis.status, 201);
  tokens.luis = luis.body.token;
});

it('login rechaza credenciales incorrectas y acepta las correctas', async () => {
  assert.equal((await api('POST', '/auth/login', { email: ANA.email, password: 'mala' }, null)).status, 401);
  const ok = await api('POST', '/auth/login', { email: ANA.email, password: ANA.password }, null);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.username, 'ana');
});

it('las rutas del panel exigen autenticación', async () => {
  for (const [m, p] of [['GET', '/projects'], ['POST', '/projects'], ['DELETE', '/projects/1'], ['PUT', '/profile'], ['GET', '/dashboard/stats']]) {
    const res = await api(m, p, m === 'GET' || m === 'DELETE' ? undefined : {}, null);
    assert.equal(res.status, 401, `${m} ${p}`);
  }
  const res = await fetch(`${base}/api/projects`, { headers: { Authorization: 'Bearer token-falso' } });
  assert.equal(res.status, 401);
});

it('CRUD de proyectos con tecnologías normalizadas', async () => {
  const created = await api('POST', '/projects', {
    name: 'Alpha',
    description: 'Primer proyecto',
    category: 'Frontend',
    technologies: ['React', 'react', 'Vite'],
    date: '2024-03-01',
    status: 'finalizado',
    featured: true,
  });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body.technologies, ['React', 'Vite']);

  assert.equal((await api('POST', '/projects', { ...created.body, name: 'alpha' })).status, 409);

  const upd = await api('PUT', `/projects/${created.body.id}`, { technologies: ['Node.js'] });
  assert.equal(upd.status, 200);
  assert.deepEqual(upd.body.technologies, ['Node.js']);

  assert.equal((await api('DELETE', `/projects/${created.body.id}`)).status, 204);
  assert.equal((await api('GET', `/projects/${created.body.id}`)).status, 404);
});

it('cada usuario solo ve y modifica sus propios datos', async () => {
  const p = await api('POST', '/projects', { name: 'Secreto', description: 'd', technologies: ['Go'], date: '2024-01-01' });
  const s = await api('POST', '/skills', { name: 'Go', category: 'Backend', level: 'experto' });
  const c = await api('POST', '/certificates', { name: 'Curso', institution: 'X', date: '2024-01-01' });

  // Luis no puede leer, editar ni borrar lo de Ana
  assert.equal((await api('GET', `/projects/${p.body.id}`, undefined, 'luis')).status, 404);
  assert.equal((await api('PUT', `/projects/${p.body.id}`, { name: 'Hackeado' }, 'luis')).status, 404);
  assert.equal((await api('DELETE', `/projects/${p.body.id}`, undefined, 'luis')).status, 404);
  assert.equal((await api('PATCH', `/skills/${s.body.id}`, { level: 'basico' }, 'luis')).status, 404);
  assert.equal((await api('DELETE', `/certificates/${c.body.id}`, undefined, 'luis')).status, 404);
  assert.equal((await api('GET', '/projects', undefined, 'luis')).body.meta.total, 0);
  assert.deepEqual((await api('GET', '/skills', undefined, 'luis')).body, []);
  assert.equal((await api('GET', '/dashboard/stats', undefined, 'luis')).body.totals.projects, 0);

  // Luis puede usar el mismo nombre de proyecto en su cuenta
  const own = await api('POST', '/projects', { name: 'Secreto', description: 'd', technologies: ['Go'], date: '2024-01-01' }, 'luis');
  assert.equal(own.status, 201);

  // Lo de Ana sigue intacto
  assert.equal((await api('GET', `/projects/${p.body.id}`)).body.name, 'Secreto');
  for (const [r, id] of [['projects', p.body.id], ['skills', s.body.id], ['certificates', c.body.id]]) {
    await api('DELETE', `/${r}/${id}`);
  }
});

it('validaciones devuelven 400 con detalle por campo', async () => {
  const res = await api('POST', '/projects', { name: '', technologies: [], date: '2999-01-01', demoUrl: 'nope' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.name && res.body.error.details.date && res.body.error.details.demoUrl);
});

it('búsqueda, filtros y paginación', async () => {
  const mk = (name, extra) =>
    api('POST', '/projects', { name, description: 'd', technologies: ['CSS'], date: '2025-01-01', status: 'en_progreso', ...extra });
  await mk('Bravo', { technologies: ['MySQL', 'Node.js'], category: 'Backend', date: '2023-05-05' });
  await mk('Charlie', { featured: true, status: 'pausado' });
  await mk('Delta 100%');
  await mk('Echo');

  const all = await api('GET', '/projects?limit=2&page=2&sort=name');
  assert.equal(all.body.meta.total, 4);
  assert.equal(all.body.meta.totalPages, 2);
  assert.deepEqual(all.body.data.map((p) => p.name), ['Delta 100%', 'Echo']);

  const names = async (qs) => (await api('GET', `/projects?${qs}`)).body.data.map((p) => p.name);
  assert.deepEqual(await names('technology=MySQL'), ['Bravo']);
  assert.deepEqual(await names('year=2023'), ['Bravo']);
  assert.deepEqual(await names('featured=true'), ['Charlie']);
  assert.deepEqual(await names('status=pausado'), ['Charlie']);
  assert.deepEqual(await names('category=Backend'), ['Bravo']);
  assert.deepEqual(await names('q=node'), ['Bravo']);
  assert.deepEqual(await names('q=%25'), ['Delta 100%']);
  assert.equal((await api('GET', '/projects?status=otro')).status, 400);
});

it('CRUD de habilidades y certificados', async () => {
  const s = await api('POST', '/skills', { name: 'React', category: 'Frontend', level: 'experto', icon: '⚛️' });
  assert.equal(s.status, 201);
  assert.equal((await api('POST', '/skills', { name: 'X', category: 'Y', level: 'dios' })).status, 400);
  assert.equal((await api('PATCH', `/skills/${s.body.id}`, { level: 'avanzado' })).body.level, 'avanzado');

  const c = await api('POST', '/certificates', { name: 'Curso', institution: 'Inst', date: '2024-01-01', pdfFile: '/uploads/a.pdf' });
  assert.equal(c.status, 201);
  assert.equal((await api('POST', '/certificates', { name: 'C', institution: 'I', date: '2024-01-01', pdfFile: '/uploads/a.png' })).status, 400);
});

it('perfil, publicación y portfolio público por usuario', async () => {
  assert.equal((await api('GET', '/public/portfolios/ana', undefined, null)).status, 404);
  assert.equal((await api('GET', '/public/portfolios/no-existe', undefined, null)).status, 404);

  const bad = await api('PUT', '/profile', { email: 'mal', github: 'https://gitlab.com/x', username: 'luis-dev' });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.details.email && bad.body.error.details.github);

  const taken = await api('PUT', '/profile', { username: 'luis-dev' });
  assert.equal(taken.status, 409);
  assert.ok(taken.body.error.details.username);

  const ok = await api('PUT', '/profile', { username: 'ana-gomez', role: 'Diseñadora', github: 'https://github.com/ana' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.username, 'ana-gomez');

  assert.equal((await api('GET', '/portfolio/preview')).body.profile.role, 'Diseñadora');

  await api('PATCH', '/profile/publish', { published: true });
  const pub = await api('GET', '/public/portfolios/ANA-GOMEZ', undefined, null);
  assert.equal(pub.status, 200);
  assert.equal(pub.body.profile.firstName, 'Ana');
  assert.equal(pub.body.projects.length, 4);
  assert.equal(pub.body.profile.id, undefined);

  // El portfolio de Luis sigue sin publicar
  assert.equal((await api('GET', '/public/portfolios/luis-dev', undefined, null)).status, 404);
});

it('diseño: se guarda por usuario y llega al portfolio público', async () => {
  const me = await api('GET', '/profile');
  assert.equal(me.body.design.palette, 'aurora');

  const bad = await api('PUT', '/profile/design', { palette: 'inexistente' });
  assert.equal(bad.status, 400);

  const ok = await api('PUT', '/profile/design', { palette: 'oceano', layouts: { skills: 'anillos' }, hidden: ['technologies'] });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.design.palette, 'oceano');
  assert.equal(ok.body.design.layouts.skills, 'anillos');
  assert.equal(ok.body.design.layouts.hero, 'dividida');

  // Un cambio parcial no pisa lo anterior
  const partial = await api('PUT', '/profile/design', { layouts: { hero: 'banner' } });
  assert.equal(partial.body.design.layouts.skills, 'anillos');
  assert.equal(partial.body.design.palette, 'oceano');

  const pub = await api('GET', '/public/portfolios/ana-gomez', undefined, null);
  assert.equal(pub.body.profile.design.layouts.hero, 'banner');
  assert.deepEqual(pub.body.profile.design.hidden, ['technologies']);

  // Luis sigue con el diseño por defecto
  assert.equal((await api('GET', '/profile', undefined, 'luis')).body.design.palette, 'aurora');
  assert.equal((await api('PUT', '/profile/design', { palette: 'fuego' }, null)).status, 401);
});

it('dashboard devuelve estadísticas del usuario', async () => {
  const { body } = await api('GET', '/dashboard/stats');
  assert.equal(body.totals.projects, 4);
  assert.equal(body.projectsByStatus.pausado, 1);
  assert.ok(body.topTechnologies.some((t) => t.name === 'CSS' && t.total === 3));
  assert.ok(!body.topTechnologies.some((t) => t.name === 'Go'));
});

it('cambio de contraseña valida la actual', async () => {
  assert.equal((await api('PUT', '/auth/password', { currentPassword: 'mala', newPassword: 'Nueva1234' })).status, 400);
  assert.equal((await api('PUT', '/auth/password', { currentPassword: 'Clave1234', newPassword: 'Nueva1234' })).status, 204);
  const login = await api('POST', '/auth/login', { email: ANA.email, password: 'Nueva1234' }, null);
  assert.equal(login.status, 200);
});

it('errores genéricos: JSON inválido, id inválido y ruta inexistente', async () => {
  const res = await fetch(`${base}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.ana}` },
    body: '{mal json',
  });
  assert.equal(res.status, 400);
  assert.equal((await api('GET', '/projects/abc')).status, 400);
  assert.equal((await api('GET', '/no-existe')).status, 404);
});
