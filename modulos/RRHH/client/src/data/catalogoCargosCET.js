/**
 * Catálogo de equivalencias: Cargo ONAPRE → Cargos CET válidos.
 *
 * La clave es el nombre del cargo ONAPRE (se normaliza para la búsqueda).
 * El valor es un array con los nombres exactos de los cargos CET equivalentes.
 */
export const EQUIVALENCIAS_ONAPRE_CET = {
  "Contralor del Estado": [
    "CONTRALOR (A)",
    "CONTRALOR(A)",
    "Contralor del Estado"
  ],
  "Contralor de Estado": [
    "CONTRALOR (A)",
    "CONTRALOR(A)",
    "Contralor del Estado"
  ],
  "Director General": [
    "DIRECTOR (A)",
    "DIRECTOR(A)",
    "Director General"
  ],
  "Director en Linea": [
    "DIRECTOR (A)",
    "DIRECTOR(A)",
    "Director en Linea",
    "Director de Linea"
  ],
  "Director de Línea": [
    "DIRECTOR (A)",
    "DIRECTOR(A)",
    "Director de Línea",
    "Director de Linea"
  ],
  "Director de Linea": [
    "DIRECTOR (A)",
    "DIRECTOR(A)",
    "Director de Linea"
  ],

  "Auditor Interno": [
    "Auditor Interno"
  ],
  "Jefe de Oficina": [
    "JEFE DE OFICINA"
  ],
  "Jefe de Division": [
    "JEFE DE DIVISION GENERAL",
    "JEFE DE DIVISION",
    "Jefe de Division"
  ],
  "Jefe de División": [
    "JEFE DE DIVISION GENERAL",
    "JEFE DE DIVISION",
    "Jefe de División",
    "Jefe de Division"
  ],
  "Jefe de Division General": [
    "JEFE DE DIVISION GENERAL",
    "Jefe de Division General"
  ],
  "Jefe de División General": [
    "JEFE DE DIVISION GENERAL",
    "Jefe de División General"
  ],
  "Coordinador de Area": [
    "JEFE DE DIVISION",
    "Coordinador de Area"
  ],
  "Coordinador de Área": [
    "JEFE DE DIVISION",
    "Coordinador de Área",
    "Coordinador de Area"
  ],
  "Supervisor": [
    "SUPERVISOR"
  ],
  "Coordinador Control Posterior": [],
  "Profesional I": [
    "Analista Administrativo",
    "Analista de Sistema",
    "Analista Soporte Técnico",
    "Planificador",
    "Analista de Organización y Métodos",
    "Analista de Personal",
    "Analista de Presupuesto",
    "Analista de Compras",
    "Analista de Bienes e Inventarios",
    "Auditor",
    "Abogado",
    "Contador",
    "Trabajador Social",
    "Odontólogo",
    "Enfermera",
    "Promotor Social"
  ],
  "Profesional II": [
    "Auditor",
    "Abogado",
    "Médico",
    "Analista de Presupuesto",
    "Analista de Organización y Métodos",
    "Promotor Social"
  ],
  "Profesional III": [
    "Auditor"
  ],
  "Técnico I": [
    "Asistente Administrativo",
    "Asistente Técnico",
    "Asistente de Auditoría",
    "Asistente de Presupuesto",
    "Asistente de Seguridad",
    "Notificador"
  ],
  "Técnico II": [
    "Asistente Administrativo"
  ],
  "Técnico III": [
    "Asistente Administrativo"
  ],
  "Bachiller I": [
    "Auxiliar de Oficina",
    "Auxiliar de Servicios Generales"
  ],
  "Bachiller III": [
    "Auxiliar de Servicios Generales"
  ],
  "Obrero Grado (1)-MIN": [
    "Obrero",
    "Obrero mensajero",
    "Obrero aseador",
    "Obrero aseadora"
  ],
  "Obrero Grado (2)-MIN": [
    "Obrero",
    "Obrero mensajero",
    "Obrero aseador",
    "Obrero aseadora"
  ],
  "Obrero Grado (3)-MAX": [
    "Obrero",
    "Obrero mensajero",
    "Obrero aseador",
    "Obrero aseadora"
  ],
  "Obrero Grado (4)-MAX": [
    "Obrero",
    "Obrero mensajero",
    "Obrero aseador",
    "Obrero aseadora"
  ]
};

/**
 * Normaliza un string para comparaciones robustas (sin acentos, minúsculas, sin espacios extra).
 */
export const normalize = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " "); // Normalizar espacios múltiples
};

// Crear un mapa normalizado para búsquedas rápidas
const EQUIVALENCIAS_NORMALIZADAS = Object.keys(EQUIVALENCIAS_ONAPRE_CET).reduce((acc, key) => {
  acc[normalize(key)] = EQUIVALENCIAS_ONAPRE_CET[key];
  return acc;
}, {});

/**
 * Dado el nombre de un cargo ONAPRE, devuelve los nombres de cargos CET válidos.
 * Si no existe en el catálogo, retorna un array vacío.
 */
export function getCETEquivalentes(nombreOnapre) {
  if (!nombreOnapre) return [];
  const normalizedInput = normalize(nombreOnapre);
  return EQUIVALENCIAS_NORMALIZADAS[normalizedInput] || [];
}
