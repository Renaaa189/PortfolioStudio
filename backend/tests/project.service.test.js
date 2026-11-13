import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProjectService, normalizeTechnologies, parseFilters } from '../src/services/project.service.js';

const valid = {
  name: 'Mi proyecto',
  description: 'Descripción',
  technologies: ['React'],
  date: '2024-05-01',
  status: 'finalizado',
};

function fakeRepo(overrides = {}) {
  const calls = [];
  return {
    calls,
    findByName: async () => null,
    findById: async (userId, id) => ({ id, ...valid, featured: false }),
    create: async (userId, p) => (calls.push(['create', userId, p]), { id: 1, ...p }),
    update: async (userId, id, p) => (calls.push(['update', userId, id, p]), { id, ...p }),
    remove: async () => true,
    findAll: async () => ({ items: [], total: 0 }),
    ...overrides,
  };
}

test('normalizeTechnologies limpia y deduplica ignorando mayúsculas', () => {
  assert.deepEqual(normalizeTechnologies([' React ', 'react', '', 'Node.js']), ['React', 'Node.js']);
  assert.deepEqual(normalizeTechnologies('Vite, CSS ,vite'), ['Vite', 'CSS']);
});

test('parseFilters aplica valores por defecto y tope de limit', () => {
  const f = parseFilters({ limit: '999', page: '-3', featured: 'true', year: '2024' });
  assert.equal(f.limit, 50);
  assert.equal(f.page, 1);
  assert.equal(f.featured, true);
  assert.equal(f.year, 2024);
});

test('parseFilters rechaza estados inválidos', () => {
  assert.throws(() => parseFilters({ status: 'borrado' }), { status: 400 });
});

test('create valida reglas de negocio', async () => {
  const service = createProjectService(fakeRepo());
  await assert.rejects(
    service.create(1, { ...valid, name: '', technologies: [], date: '2999-01-01', githubUrl: 'hola', status: 'x' }),
    (err) => {
      assert.equal(err.status, 400);
      assert.ok(err.details.name && err.details.technologies && err.details.date && err.details.githubUrl && err.details.status);
      return true;
    },
  );
});

test('create rechaza nombres duplicados con 409', async () => {
  const service = createProjectService(fakeRepo({ findByName: async () => ({ id: 99 }) }));
  await assert.rejects(service.create(1, valid), { status: 409 });
});

test('create guarda datos normalizados', async () => {
  const repo = fakeRepo();
  await createProjectService(repo).create(7, { ...valid, name: '  Espacios  ', featured: 'true', image: '' });
  const [, userId, saved] = repo.calls[0];
  assert.equal(userId, 7);
  assert.equal(saved.name, 'Espacios');
  assert.equal(saved.featured, true);
  assert.equal(saved.image, null);
});

test('update parcial mezcla con lo existente', async () => {
  const repo = fakeRepo();
  await createProjectService(repo).update(1, 3, { featured: true });
  const [, , id, saved] = repo.calls[0];
  assert.equal(id, 3);
  assert.equal(saved.name, valid.name);
  assert.equal(saved.featured, true);
});

test('update permite conservar el mismo nombre', async () => {
  const repo = fakeRepo({ findByName: async () => ({ id: 3 }) });
  await createProjectService(repo).update(1, 3, { description: 'nueva' });
  assert.equal(repo.calls.length, 1);
});

test('getById y remove devuelven 404 si no existe', async () => {
  const service = createProjectService(fakeRepo({ findById: async () => null, remove: async () => false }));
  await assert.rejects(service.getById(1, 1), { status: 404 });
  await assert.rejects(service.remove(1, 1), { status: 404 });
});

test('list arma la metadata de paginación', async () => {
  const service = createProjectService(fakeRepo({ findAll: async () => ({ items: [{}, {}], total: 20 }) }));
  const { meta } = await service.list(1, { limit: '6', page: '2' });
  assert.deepEqual(meta, { page: 2, limit: 6, total: 20, totalPages: 4 });
});
