import { z } from 'zod';
import { UserRol } from '@prisma/client';

export const userRolSchema = z.enum(UserRol, {
  error: 'El rol indicado no es válido.',
});

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

const loginPasswordSchema = z.string()
  .min(1, 'La contraseña es obligatoria.')
  .refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'La contraseña no puede superar 72 bytes.',
  );

export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'El nombre debe tener entre 2 y 100 caracteres.')
    .max(100, 'El nombre debe tener entre 2 y 100 caracteres.'),
  ci: ciSchema,
  password: passwordSchema,
  rol: userRolSchema
    .optional()
    .default(UserRol.ASISTENTE_ADMINISTRATIVO)
    .refine(
      (role) => role === UserRol.ASISTENTE_ADMINISTRATIVO,
      'El registro solo permite el rol ASISTENTE_ADMINISTRATIVO.',
    ),
}).strict();

export const loginSchema = z.object({
  ci: ciSchema,
  password: loginPasswordSchema,
}).strict();
