import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSolicitudSchema,
  answerDetailSchema,
} from './solicitud.schema.js';

test('accepts a valid solicitud with audit, business days and details', () => {
  const result = createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 7,
    detalles: ['Presentar el libro de caja.', 'Adjuntar inventario.'],
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data.detalles, ['Presentar el libro de caja.', 'Adjuntar inventario.']);
});

test('trims each detail and rejects empty or oversized details', () => {
  const trimmed = createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 5,
    detalles: ['  detalle  '],
  });
  assert.equal(trimmed.success, true);
  assert.deepEqual(trimmed.data.detalles, ['detalle']);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 5,
    detalles: ['   '],
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 5,
    detalles: ['x'.repeat(501)],
  }).success, false);
});

test('rejects invalid auditId and out-of-range businessDays', () => {
  assert.equal(createSolicitudSchema.safeParse({
    auditId: 0,
    businessDays: 7,
    detalles: ['ok'],
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 0,
    detalles: ['ok'],
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 61,
    detalles: ['ok'],
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 7.5,
    detalles: ['ok'],
  }).success, false);
});

test('rejects empty details arrays, non-arrays and extra fields', () => {
  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 7,
    detalles: [],
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 7,
    detalles: 'detalle',
  }).success, false);

  assert.equal(createSolicitudSchema.safeParse({
    auditId: 1,
    businessDays: 7,
    detalles: ['ok'],
    dueDate: '2026-12-01',
  }).success, false);
});

test('validates answerDetail input', () => {
  assert.equal(answerDetailSchema.safeParse({ responseText: '  Respuesta  ' }).success, true);
  assert.equal(answerDetailSchema.safeParse({ responseText: 'Respuesta' }).data.responseText, 'Respuesta');
  assert.equal(answerDetailSchema.safeParse({ responseText: '' }).success, false);
  assert.equal(answerDetailSchema.safeParse({ responseText: '   ' }).success, false);
  assert.equal(answerDetailSchema.safeParse({}).success, false);
  assert.equal(answerDetailSchema.safeParse({ responseText: 'x'.repeat(5001) }).success, false);
  assert.equal(answerDetailSchema.safeParse({ responseText: 'ok', extra: 1 }).success, false);
});
