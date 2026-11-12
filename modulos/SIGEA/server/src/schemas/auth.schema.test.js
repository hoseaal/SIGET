import assert from 'node:assert/strict';
import test from 'node:test';
import { loginSchema, registerSchema, userRolSchema } from './auth.schema.js';

test('accepts only roles defined by the Prisma UserRol enum', () => {
  const prismaRoles = [
    'DIRECTOR',
    'ABOGADO',
    'ANALISTA_ADMINISTRATIVO',
    'AUXILIAR_OFICINA',
    'JEFE_DIVISION_GENERAL',
    'SUPERVISOR',
    'AUDITOR',
    'ASISTENTE_ADMINISTRATIVO',
  ];

  for (const role of prismaRoles) {
    assert.equal(userRolSchema.parse(role), role);
  }
  assert.equal(userRolSchema.safeParse('ADMIN').success, false);
  assert.equal(userRolSchema.safeParse('USER').success, false);
});

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
    rol: 'ASISTENTE_ADMINISTRATIVO',
  });
});

test('defaults the register role and rejects privileged role escalation', () => {
  const defaultRole = registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
  });
  assert.equal(defaultRole.success, true);
  assert.equal(defaultRole.data.rol, 'ASISTENTE_ADMINISTRATIVO');

  const directorRole = registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
    rol: 'DIRECTOR',
  });
  assert.equal(directorRole.success, false);
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

test('validates login input with the shared CI rules', () => {
  const valid = loginSchema.safeParse({ ci: '123', password: 'old-password' });
  assert.equal(valid.success, true);
  assert.deepEqual(valid.data, { ci: 123, password: 'old-password' });

  assert.equal(loginSchema.safeParse({ ci: 'invalid', password: 'password' }).success, false);
  assert.equal(loginSchema.safeParse({ ci: 123, password: '' }).success, false);
  assert.equal(loginSchema.safeParse({ ci: 123, password: 'x'.repeat(73) }).success, false);
  assert.equal(loginSchema.safeParse({ ci: 123, password: 'password', rol: 'DIRECTOR' }).success, false);
});

test('rejects privileged role values from client and unrelated extra fields', () => {
  const result = registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
    rol: 'DIRECTOR',
  });

  assert.equal(result.success, false);
  assert.equal(registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
    rol: 'ASISTENTE_ADMINISTRATIVO',
  }).success, true);
  assert.equal(registerSchema.safeParse({
    name: 'Ana',
    ci: 123,
    password: 'secure-password',
    extra: true,
  }).success, false);
});
