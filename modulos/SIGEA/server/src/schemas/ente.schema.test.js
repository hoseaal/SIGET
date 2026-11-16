import assert from 'node:assert/strict';
import test from 'node:test';
import { createEnteSchema, updateEnteSchema } from './ente.schema.js';

test('accepts a minimal ente with only the required fields', () => {
  const result = createEnteSchema.safeParse({
    name: 'Contraloría General',
    rif: 'G-00001234-5',
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    name: 'Contraloría General',
    rif: 'G-00001234-5',
  });
});

test('accepts optional fields and trims whitespace', () => {
  const result = createEnteSchema.safeParse({
    name: '  Instituto Nacional  ',
    rif: ' J-12345678-9 ',
    siglas: '  IN  ',
    autoridad: 'María Pérez',
    telefono: '0212-5555555',
    direccion: 'Caracas',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.name, ' Instituto Nacional '.trim());
  assert.equal(result.data.rif, 'J-12345678-9');
  assert.equal(result.data.siglas, 'IN');
});

test('rejects missing or invalid required fields', () => {
  assert.equal(createEnteSchema.safeParse({ name: 'Sin RIF' }).success, false);
  assert.equal(createEnteSchema.safeParse({ rif: 'G-00001234-5' }).success, false);
  assert.equal(createEnteSchema.safeParse({ name: 'A', rif: 'G-1' }).success, false);
  assert.equal(createEnteSchema.safeParse({ name: '  ', rif: 'G-1' }).success, false);
  assert.equal(createEnteSchema.safeParse({ name: 'X'.repeat(101), rif: 'G-1' }).success, false);
});

test('rejects unrelated extra fields with strict mode', () => {
  const result = createEnteSchema.safeParse({
    name: 'Contraloría',
    rif: 'G-1',
    telefonoExtra: '123',
  });

  assert.equal(result.success, false);
});

test('update schema accepts any subset of fields', () => {
  assert.equal(updateEnteSchema.safeParse({ siglas: 'CG' }).success, true);
  assert.equal(updateEnteSchema.safeParse({ telefono: '0212-1111111' }).success, true);
  assert.equal(updateEnteSchema.safeParse({}).success, true);
  assert.equal(updateEnteSchema.safeParse({ name: 'A' }).success, false);
  assert.equal(updateEnteSchema.safeParse({ id: 1 }).success, false);
});
