import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAuditoriaSchema,
  statusAuditoriaSchema,
  updateAuditoriaSchema,
} from './auditoria.schema.js';

const validAuditoria = {
  auditNumber: 2026001,
  entityId: 1,
  typeId: 1,
};

test('accepts only statuses defined by the Prisma StatusAuditoria enum', () => {
  const prismaStatuses = ['EN_CURSO', 'CERRADA', 'SUSPENDIDA'];

  for (const status of prismaStatuses) {
    assert.equal(statusAuditoriaSchema.parse(status), status);
  }
  assert.equal(statusAuditoriaSchema.safeParse('EN_MULTA').success, false);
  assert.equal(statusAuditoriaSchema.safeParse('ABIERTA').success, false);
});

test('accepts a minimal auditoria and defaults nothing extra', () => {
  const result = createAuditoriaSchema.safeParse(validAuditoria);

  assert.equal(result.success, true);
  assert.deepEqual(result.data, validAuditoria);
});

test('accepts optional dates and status, coercing ISO strings', () => {
  const result = createAuditoriaSchema.safeParse({
    ...validAuditoria,
    startDate: '2026-11-09T00:00:00.000Z',
    endDate: '2026-12-09T00:00:00.000Z',
    status: 'EN_CURSO',
  });

  assert.equal(result.success, true);
  assert.ok(result.data.startDate instanceof Date);
  assert.ok(result.data.endDate instanceof Date);
  assert.equal(result.data.status, 'EN_CURSO');
});

test('rejects endDate before startDate', () => {
  const result = createAuditoriaSchema.safeParse({
    ...validAuditoria,
    startDate: '2026-12-09T00:00:00.000Z',
    endDate: '2026-11-09T00:00:00.000Z',
  });

  assert.equal(result.success, false);
});

test('rejects invalid ids, audit numbers, dates, status and extra fields', () => {
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, entityId: 0 }).success, false);
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, auditNumber: 1.5 }).success, false);
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, typeId: 'uno' }).success, false);
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, startDate: 'ayer' }).success, false);
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, status: 'CERRADA!' }).success, false);
  assert.equal(createAuditoriaSchema.safeParse({ ...validAuditoria, extra: true }).success, false);
});

test('update schema accepts any subset but rejects empty invalid values', () => {
  assert.equal(updateAuditoriaSchema.safeParse({ status: 'CERRADA' }).success, true);
  assert.equal(updateAuditoriaSchema.safeParse({ endDate: '2026-12-31T00:00:00.000Z' }).success, true);
  assert.equal(updateAuditoriaSchema.safeParse({}).success, true);
  assert.equal(updateAuditoriaSchema.safeParse({ status: 'EN_MULTA' }).success, false);
  assert.equal(updateAuditoriaSchema.safeParse({ auditNumber: -1 }).success, false);
  assert.equal(updateAuditoriaSchema.safeParse({ id: 1 }).success, false);
});
