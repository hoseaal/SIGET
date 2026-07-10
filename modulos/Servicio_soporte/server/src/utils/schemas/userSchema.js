import { z } from 'zod';

// Esquema para REGISTRO de usuario
export const createUserSchema = z.object({
  ced: z
    .string()
    .min(6, "La cédula debe tener al menos 6 dígitos")
    .max(15, "La cédula es muy larga")
    .regex(/^\d+$/, "La cédula debe contener solo números"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  ape: z.string().min(2, "El apellido debe tener al menos 2 caracteres").trim(),
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .trim(),
  password1: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  password2: z.string().min(6, "La confirmación debe tener al menos 6 caracteres"),
  rol_id: z.string().or(z.number()),
  direc_id: z.string().or(z.number())
}).refine((data) => data.password1 === data.password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"]
});

// Esquema para LOGIN
export const loginSchema = z.object({
  ci: z.string().min(1, "La cédula es requerida"),
  password: z.string().min(1, "La contraseña es requerida")
});

// Esquema para ACTUALIZAR datos de usuario
export const updateUserSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").trim(),
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  apellidos: z.string().min(2, "El apellido debe tener al menos 2 caracteres").trim(),
  rol_id: z.string().or(z.number()),
  direc_id: z.string().or(z.number()),
  cedula_referencia: z
    .string()
    .min(6, "La cédula debe tener al menos 6 dígitos")
    .max(15, "La cédula es muy larga")
    .regex(/^\d+$/, "La cédula debe contener solo números")
});

// Esquema para CAMBIAR contraseña
export const updatePasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});
