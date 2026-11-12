import { z } from 'zod';

const ciSchema = z.union([
  z.number(),
  z.string()
    .regex(/^\d+$/, 'La cédula debe ser un número entero positivo.')
    .transform(Number),
]).pipe(
  z.number()
    .int('La cédula debe ser un número entero positivo.')
    .min(1, 'La cédula debe ser un número entero positivo.')
    .max(2_147_483_647, 'La cédula excede el valor permitido.'),
);

const passwordSchema = z.string().refine(
  (password) => {
    const length = Buffer.byteLength(password, 'utf8');
    return length >= 10 && length <= 72;
  },
  'La contraseña debe tener entre 10 y 72 bytes.',
);

export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'El nombre debe tener entre 2 y 100 caracteres.')
    .max(100, 'El nombre debe tener entre 2 y 100 caracteres.'),
  ci: ciSchema,
  password: passwordSchema,
}).strict();
