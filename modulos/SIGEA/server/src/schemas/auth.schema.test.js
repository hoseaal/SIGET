import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchema } from './auth.schema.js';

test('accepts valid registration data and normalizes name and CI', () => {
  const result = registerSchema.safeParse({
    name: '  Ana Pérez  ',
    ci: '12345678',
    password: 'secure-password',
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    name: 'Ana Pérez',
    ci: 12345678,
    password: 'secure-password',
  });
});

test('rejects invalid name, CI, and password lengths', () => {
  for (const data of [
    { name: 'A', ci: 123, password: 'secure-password' },
    { name: 'Ana', ci: 'not-a-number', password: 'secure-password' },
    { name: 'Ana', ci: 123, password: 'short' },
    { name: 'Ana', ci: 123, password: 'á'.repeat(37) },
  ]) {
    assert.equal(registerSchema.safeParse(data).success, false);
  }
});

test('rejects extra fields such as a client-supplied role', () => {
  const result = registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
    rol: 'DIRECTOR',
  });

  assert.equal(result.success, false);
});
