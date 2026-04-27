/**
 * Árbol jerárquico de la estructura organizacional.
 *
 * Cada nodo de dirección tiene:
 *   - nombre:      Nombre exacto tal como aparece en la BD (tabla direcciones).
 *   - divisiones:   Array de divisiones. Cada división tiene { nombre, unidades }.
 *   - unidades:     Array de unidades que dependen DIRECTAMENTE de la dirección
 *                   (sin pasar por ninguna división).
 *
 * Para agregar/modificar la estructura, editar solo este archivo.
 */
export const ORG_STRUCTURE = [
  {
    nombre: "Despacho Contralor",
    divisiones: [],
    unidades: []
  },
  {
    nombre: "Dirección Secretaría del Despacho Contralor",
    divisiones: [
      { nombre: [], unidades: "Sección de Control Posterior" }
    ],
    unidades: [
      "Unidad de Imagen Corporativa y Eventos Especiales",
      "Unidad de Auditoría Interna"
    ]
  },
  {
    nombre: "Dirección General",
    divisiones: [
      { nombre: "División General de Sistema, Servicio Técnico y Digitalización", unidades: [] }
    ],
    unidades: [
      "Unidad de Archivo"
    ]
  },
  {
    nombre: "Dirección de Planificación Organización y Métodos",
    divisiones: [
      { nombre: "División General de Control de Gestión y Organización", unidades: [] }
    ],
    unidades: [
      "Unidad de Planificación",
      "Unidad de Organización"
    ]
  },
  {
    nombre: "Dirección de Recursos Humanos",
    divisiones: [
      { nombre: "División General de Recursos Humanos", unidades: [] },
      { nombre: "División de Remuneraciones", unidades: [] },
      { nombre: "División de Talento Humano", unidades: [] },
      { nombre: "División de Seguridad y Salud Laboral", unidades: [] }
    ],
    unidades: []
  },
  {
    nombre: "Dirección de Administración",
    divisiones: [
      {
        nombre: "División General de Administración y Control de Presupuesto",
        unidades: [
          "Unidad de Servicios Administrativos",
          "Unidad de Control Presupuestario"
        ]
      },
      {
        nombre: "División General de Compras, Bienes e Inventarios",
        unidades: [
          "Unidad de Compras",
          "Unidad de Bienes, Inventarios y Almacén"
        ]
      }
    ],
    unidades: []
  },
  {
    nombre: "Dirección de Consultoría Jurídica",
    divisiones: [],
    unidades: []
  },
  {
    nombre: "Dirección de Control de la Administración Central y Poder Legislativo",
    divisiones: [
      { nombre: "División General de Control de la Administración Central y Poder Legislativo", unidades: [] }
    ],
    unidades: []
  },
  {
    nombre: "Dirección de Control de la Administración Descentralizada",
    divisiones: [
      { nombre: "División General del Sector Infraestructura", unidades: [] },
      { nombre: "División General del Sector Económico y Social", unidades: [] }
    ],
    unidades: []
  },
  {
    nombre: "Dirección de Investigaciones",
    divisiones: [
      { nombre: "División General de Investigaciones", unidades: [] }
    ],
    unidades: []
  },
  {
    nombre: "Dirección de Determinación de Responsabilidades",
    divisiones: [
      { nombre: "División de Determinación de Responsabilidades", unidades: [] }
    ],
    unidades: []
  },
  {
    nombre: "Oficina de Atención al Público y Participación Ciudadana",
    divisiones: [],
    unidades: [
      "Unidad de Participación Ciudadana y Capacitación",
      "Unidad de Atención al Público"
    ]
  },
  {
    nombre: "Dirección de Servicios Generales Seguridad y Transporte",
    divisiones: [],
    unidades: [
      "Unidad de Servicios Generales",
      "Unidad de Seguridad",
      "Unidad de Transporte",
      "Unidad de Mantenimiento y Limpieza"
    ]
  }
];

/**
 * Busca el nodo de dirección en ORG_STRUCTURE por nombre.
 * Retorna el nodo completo o null si no se encuentra.
 */
export function findDireccionNode(nombreDireccion) {
  if (!nombreDireccion) return null;
  return ORG_STRUCTURE.find(d => d.nombre === nombreDireccion) || null;
}

/**
 * Busca una división dentro de un nodo de dirección por nombre.
 * Retorna el objeto de la división o null.
 */
export function findDivisionNode(direccionNode, nombreDivision) {
  if (!direccionNode || !nombreDivision) return null;
  return direccionNode.divisiones.find(d => d.nombre === nombreDivision) || null;
}
