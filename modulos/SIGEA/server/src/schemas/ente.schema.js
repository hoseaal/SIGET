import { z } from 'zod';

const nameSchema = z.string()
  .trim()
  .min(2, 'El nombre debe tener entre 2 y 100 caracteres.')
  .max(100, 'El nombre debe tener entre 2 y 100 caracteres.');

const rifSchema = z.string()
  .trim()
  .min(1, 'El RIF es obligatorio.')
  .max(50, 'El RIF no puede superar 50 caracteres.');

const optionalTextSchema = (max, label) => z.string()
  .trim()
  .max(max, `${label} no puede superar ${max} caracteres.`)
  .optional();

export const createEnteSchema = z.object({
  name: nameSchema,
  rif: rifSchema,
  siglas: optionalTextSchema(10, 'Las siglas'),
  autoridad: optionalTextSchema(100, 'La autoridad'),
  telefono: optionalTextSchema(10, 'El teléfono'),
  direccion: optionalTextSchema(500, 'La dirección'),
}).strict();

export const updateEnteSchema = createEnteSchema.partial().strict();
