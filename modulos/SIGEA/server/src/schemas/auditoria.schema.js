import { z } from 'zod';
import { StatusAuditoria } from '@prisma/client';

export const statusAuditoriaSchema = z.enum(StatusAuditoria, {
  error: 'El estado indicado no es válido.',
});

const idSchema = z.number()
  .int('El identificador debe ser un número entero positivo.')
  .min(1, 'El identificador debe ser un número entero positivo.')
  .max(2_147_483_647, 'El identificador excede el valor permitido.');

const auditNumberSchema = z.number()
  .int('El número de auditoría debe ser un número entero positivo.')
  .min(1, 'El número de auditoría debe ser un número entero positivo.')
  .max(2_147_483_647, 'El número de auditoría excede el valor permitido.');

const dateSchema = z.coerce.date({
  error: 'La fecha indicada no es válida.',
});

const auditoriaBaseSchema = z.object({
  auditNumber: auditNumberSchema,
  entityId: idSchema,
  typeId: idSchema,
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: statusAuditoriaSchema.optional(),
}).strict();

export const createAuditoriaSchema = auditoriaBaseSchema.refine(
  (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
  { path: ['endDate'], message: 'La fecha de cierre no puede ser anterior a la fecha de inicio.' },
);

export const updateAuditoriaSchema = auditoriaBaseSchema.partial();
