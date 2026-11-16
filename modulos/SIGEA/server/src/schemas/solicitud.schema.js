import { z } from 'zod';

const idSchema = z.number()
  .int('El identificador debe ser un número entero positivo.')
  .min(1, 'El identificador debe ser un número entero positivo.')
  .max(2_147_483_647, 'El identificador excede el valor permitido.');

export const createSolicitudSchema = z.object({
  auditId: idSchema,
  businessDays: z.number()
    .int('Los días hábiles deben ser un número entero entre 1 y 60.')
    .min(1, 'Los días hábiles deben ser un número entero entre 1 y 60.')
    .max(60, 'Los días hábiles deben ser un número entero entre 1 y 60.'),
  detalles: z.array(
    z.string()
      .trim()
      .min(1, 'Cada detalle debe tener texto.')
      .max(500, 'Cada detalle no puede superar 500 caracteres.'),
    { error: 'Los detalles deben ser un array de textos.' },
  )
    .min(1, 'Debe indicar al menos un detalle.')
    .max(100, 'No puede superar 100 detalles por solicitud.'),
}).strict();

export const answerDetailSchema = z.object({
  responseText: z.string()
    .trim()
    .min(1, 'La respuesta es obligatoria.')
    .max(5_000, 'La respuesta no puede superar 5000 caracteres.'),
}).strict();
