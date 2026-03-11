/**
 * Define los permisos para cada elemento del menú según el tipo de usuario.
 * La clave es el 'link' del elemento del menú y el valor es un array con los
 * 'usu_tip' que tienen permiso. Un array vacío [] significa que nadie tiene acceso,
 * mientras que si una ruta no está en esta lista, se asume que es pública o
 * se manejará con una lógica por defecto.
 * * Asumamos los siguientes tipos de usuario (usu_tip):
 * 1: Visualizador
 * 2: Temporal
 * 3: Trabajador
 * 4: Jefe de Area
 * 5: Administrador
 */
export const menuPermissions = {
    // Dashboard disponible para todos
    "/Dashboard": [1, 2, 3, 4, 5],

    // Formularios BM
    "/Personal/FuncionariosActivos": [1, 2, 3, 4, 5],
    "/Personal/RegistrarFuncionario": [2, 3, 4, 5],

    // Configuración General
    "/Configuracion/EstructuraOrganizacional": [3, 4, 5],
    "/Configuracion/TablaSalarios": [3, 4, 5],
    "/Configuracion/Cargos": [3, 4, 5],

    // Gestión de Usuarios
    "/Configuracion/NuevoUsuario": [5],
    "/Configuracion/Usuarios": [5],
    "/Configuracion/Bitacora": [4, 5],
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