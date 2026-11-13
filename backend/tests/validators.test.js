import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidHttpUrl, isValidAssetUrl, isValidDate, isFutureDate, escapeLike, parseId, parseBool, Validator } from '../src/utils/validators.js';

test('isValidHttpUrl acepta http/https y rechaza otros protocolos', () => {
  assert.equal(isValidHttpUrl('https://github.com/x'), true);
  assert.equal(isValidHttpUrl('http://example.com'), true);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
  assert.equal(isValidHttpUrl('ftp://x.com'), false);
  assert.equal(isValidHttpUrl('no es url'), false);
});

test('isValidAssetUrl acepta archivos subidos pero no rutas con ../', () => {
  assert.equal(isValidAssetUrl('/uploads/abc-123.png'), true);
  assert.equal(isValidAssetUrl('/uploads/../etc/passwd'), false);
});

test('isValidDate valida formato y fechas reales', () => {
  assert.equal(isValidDate('2025-02-28'), true);
  assert.equal(isValidDate('2025-02-30'), false);
  assert.equal(isValidDate('28/02/2025'), false);
});

test('isFutureDate compara contra hoy', () => {
  const now = new Date('2026-01-10T12:00:00Z');
  assert.equal(isFutureDate('2026-01-10', now), false);
  assert.equal(isFutureDate('2026-01-11', now), true);
});

test('escapeLike neutraliza comodines', () => {
  assert.equal(escapeLike('100%_a\\b'), '100\\%\\_a\\\\b');
});

test('parseId rechaza ids inválidos', () => {
  assert.equal(parseId('5'), 5);
  assert.throws(() => parseId('abc'), { status: 400 });
  assert.throws(() => parseId('-1'), { status: 400 });
});

test('parseBool interpreta strings comunes', () => {
  assert.equal(parseBool('true'), true);
  assert.equal(parseBool('0'), false);
  assert.equal(parseBool('quizás'), undefined);
});

test('Validator acumula un error por campo y lanza 400', () => {
  const v = new Validator();
  v.required('name', '', 'obligatorio').maxLength('name', 'x'.repeat(5), 2);
  assert.deepEqual(v.errors, { name: 'obligatorio' });
  assert.throws(() => v.throwIfAny(), (err) => err.status === 400 && err.details.name === 'obligatorio');
});

import { usernameError } from '../src/utils/username.js';

test('usernameError valida el formato del nombre de usuario', () => {
  assert.equal(usernameError('ana-gomez'), null);
  assert.equal(usernameError('dev2024'), null);
  assert.ok(usernameError('ab'));
  assert.ok(usernameError('Ana'));
  assert.ok(usernameError('-ana'));
  assert.ok(usernameError('ana--g'));
  assert.ok(usernameError('admin'));
  assert.ok(usernameError('ana gomez'));
});
