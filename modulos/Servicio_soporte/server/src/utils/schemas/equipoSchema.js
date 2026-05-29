import { z } from 'zod';

// Regex IPv4 (ej. 192.168.1.50)
const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export const createEquipoSchema = z.object({
  general: z.object({
    nro_bien: z.string().min(1, "El número de bien es obligatorio").trim(),
    tipo_equipo: z.string().or(z.number()),
    direc_id: z.string().or(z.number()),
    marca_id: z.string().or(z.number()),
    pp_pared: z.string().or(z.number()),
    modelo_id: z.string().or(z.number()).optional().nullable(),
    ip: z.string()
      .regex(ipv4Regex, "La dirección IP debe tener un formato IPv4 válido (ej. 192.168.1.50)")
      .optional()
      .nullable()
      .or(z.literal("")) // Permite campo vacío
  }),
  detallesComputo: z.object({
    nombre_equipo: z.string().optional().nullable(),
    sistema_operativo: z.string().optional().nullable(),
    version_office: z.string().optional().nullable(),
    elaborado_por: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable()
  }).optional().nullable(),
  detallesImpresora: z.object({
    toner_id: z.string().or(z.number()).optional().nullable()
  }).optional().nullable(),
  componentes: z.array(z.object({
    tipo_id: z.string().or(z.number()),
    marca_id: z.string().or(z.number()).optional().nullable(),
    modelo_id: z.string().or(z.number()).optional().nullable(),
    serial: z.string(),
    capacidad: z.string().optional().nullable(),
    nro_bien: z.string().optional().nullable()
  })).optional()
});
