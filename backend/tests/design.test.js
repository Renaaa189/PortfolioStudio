import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DESIGN_OPTIONS, DEFAULT_DESIGN, SECTIONS, validateDesign, withDefaults } from '../src/utils/design.js';

test('cada sección tiene al menos 5 plantillas y hay al menos 5 paletas y fondos', () => {
  for (const [section, list] of Object.entries(DESIGN_OPTIONS.layouts)) {
    assert.ok(list.length >= 5, section);
  }
  assert.ok(DESIGN_OPTIONS.palette.length >= 5);
  assert.ok(DESIGN_OPTIONS.background.length >= 5);
});

test('withDefaults completa diseños vacíos, viejos o con valores desconocidos', () => {
  assert.deepEqual(withDefaults(null), { ...DEFAULT_DESIGN, layouts: { ...DEFAULT_DESIGN.layouts }, order: [...SECTIONS], hidden: [] });
  const d = withDefaults({ palette: 'oceano', layouts: { hero: 'banner', skills: 'inventado' }, order: ['contact', 'nada'] });
  assert.equal(d.palette, 'oceano');
  assert.equal(d.layouts.hero, 'banner');
  assert.equal(d.layouts.skills, 'barras');
  assert.equal(d.order[0], 'contact');
  assert.equal(d.order.length, SECTIONS.length);
});

test('validateDesign acepta opciones válidas', () => {
  const d = validateDesign({
    palette: 'fuego',
    background: 'puntos',
    font: 'elegante',
    layouts: { certificates: 'medallas' },
    order: [...SECTIONS].reverse(),
    hidden: ['featured'],
  });
  assert.equal(d.layouts.certificates, 'medallas');
  assert.deepEqual(d.order, [...SECTIONS].reverse());
  assert.deepEqual(d.hidden, ['featured']);
});

test('validateDesign rechaza valores desconocidos con detalle por campo', () => {
  assert.throws(
    () => validateDesign({ palette: 'rojo', layouts: { hero: 'x', inventada: 'y' }, order: ['contact'], hidden: ['hero'] }),
    (err) => {
      assert.equal(err.status, 400);
      for (const k of ['palette', 'layouts.hero', 'layouts.inventada', 'order', 'hidden']) assert.ok(err.details[k], k);
      return true;
    },
  );
  assert.throws(() => validateDesign('hola'), { status: 400 });
});
