/**
 * Define los permisos para cada elemento del menú según el tipo de usuario.
 * La clave es el 'link' del elemento del menú y el valor es un array con los
 * 'rol_id' que tienen permiso. Un array vacío [] significa que nadie tiene acceso,
 * mientras que si una ruta no está en esta lista, se asume que es pública o
 * se manejará con una lógica por defecto.
 * * Asumamos los siguientes tipos de usuario (rol_id):
 * 1: Visualizador
 * 2: Temporal
 * 3: Trabajador
 * 4: Jefe de Area
 * 5: Administrador
 */

export const ROLES = {
  VISUALIZADOR: 1,
  TEMPORAL: 2,
  TRABAJADOR: 3,
  JEFE_AREA: 4,
  ADMINISTRADOR: 5,
};
export const menuPermissions = {
    // Dashboard disponible para todos excepto visualizador
    "/Dashboard": [2, 3, 4, 5],
    
    // Ruta exclusiva Visualizador
    "/visualizador": [1],

    // Formularios BM
    "/Personal/FuncionariosActivos": [2, 3, 4, 5],
    "/Personal/ObrerosFijos": [2, 3, 4, 5],
    "/Personal/Jubilados": [2, 3, 4, 5],
    "/Personal/Pensionados": [2, 3, 4, 5],

    "/Personal/Sobrevivientes": [2, 3, 4, 5],
    "/Personal/Vacaciones/Funcionarios": [2, 3, 4, 5],
    "/Personal/Vacaciones/Obreros": [2, 3, 4, 5],

    // Nomina
    "/Nomina/FuncionariosActivos": [2, 3, 4, 5],
    "/Nomina/ObrerosFijos": [2, 3, 4, 5],
    "/Nomina/Jubilados": [2, 3, 4, 5],
    "/Nomina/Pensionados": [2, 3, 4, 5],
    "/Nomina/Sobrevivientes": [2, 3, 4, 5],

    // Configuración General
    "/Configuracion/EstructuraOrganizacional": [3, 4, 5],
    "/Configuracion/Instituciones": [3, 4, 5],
    "/Configuracion/TablaSalarios": [3, 4, 5],
    "/Configuracion/Cargos": [3, 4, 5],
    "/Configuracion/Vacaciones": [3, 4, 5],

    // Gestión de Usuarios
    "/Configuracion/NuevoUsuario": [5],
    "/Configuracion/Usuarios": [5],
    "/Configuracion/Bitacora": [4, 5],

    // Reportes
    "/Reportes/CajaAhorro": [2, 3, 4, 5],
    "/Reportes/Pagos": [2, 3, 4, 5],
    "/Reportes/Primas": [2, 3, 4, 5],
    "/Reportes/Ingresos": [2, 3, 4, 5],
    "/Reportes/ResumenNomina": [2, 3, 4, 5],
    "/Reportes/Padres": [2, 3, 4, 5],
};

// src/data/permissions.js

// Definimos constantes para las acciones para evitar errores de tipeo.
export const ACTIONS = {
    VIEW_LOAN_DETAILS: 'viewLoanDetails',
    JEFE_AREA: 'jefeArea'
};

// Mapeamos cada acción a los tipos de usuario que tienen permiso.
const permissions = {

    [ACTIONS.VIEW_LOAN_DETAILS]: [2, 3, 4, 5],

    [ACTIONS.JEFE_AREA]: [4, 5]
};

/**
 * Comprueba si un tipo de usuario tiene permiso para una acción específica.
 * @param {number} userType - El tipo de usuario (ej: 1, 2, 3).
 * @param {string} action - La acción a verificar (ej: ACTIONS.VIEW_LOAN_DETAILS).
 * @returns {boolean} - Devuelve true si el usuario tiene permiso, de lo contrario false.
 */
export const hasPermission = (userType, action) => {
    if (!userType || !action) {
        return false;
    }

    return permissions[action]?.includes(userType) ?? false;
};