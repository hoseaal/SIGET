/**
 * Define los permisos para cada elemento del menú según el tipo de usuario.
 * La clave es el 'link' del elemento del menú y el valor es un array con los
 * 'rol_id' que tienen permiso. Un array vacío [] significa que nadie tiene acceso,
 * mientras que si una ruta no está en esta lista, se asume que es pública o
 * se manejará con una lógica por defecto.
 * * Asumamos los siguientes tipos de usuario (rol_id):
 * 1: Administrador
 * 2: Técnico
 * 3: Consulta (Visualizador)
 */
export const menuPermissions = {
    // Dashboard disponible para todos
    "/Dashboard": [1, 2, 3],

    // Mantenimiento
    "/Configuracion/Maestros": [1, 2],

    // Infraestructura
    "/Infraestructura/Red": [1, 2],

    // Inventario
    "/Equipos": [1, 2],

    // Transferencias
    "/Transferencias": [1, 2, 3],

    // Gestión de Soporte (Solo técnicos y admin)
    "/Transferencias/Tecnico": [1, 2],

    // Gestión de Usuarios (Solo admin)
    "/Seguridad/Usuarios": [1],

    // Mantenimientos
    "/Mantenimientos": [1, 2, 3],
    "/Mantenimientos/Gestion": [1, 2]
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