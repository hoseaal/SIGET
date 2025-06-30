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
    "/BM/BM-1": [1, 2, 3, 4, 5],
    "/BM/BM-2": [2, 3, 4, 5],
    "/BM/BM-3": [1, 2, 3, 4, 5],
    "/BM/BM-4": [1, 2, 3, 4, 5],

    // Gestión de Movimientos
    "/Almacen": [1, 2, 3, 4, 5],
    "/Prestamos": [1, 2, 3, 4, 5],

    // Gestión de Archivos
    "/Reportes": [2, 3, 4, 5],

    // Configuración General
    "/Configuracion/Categorias": [3, 4, 5],
    "/Configuracion/ModelosyMarcas": [3, 4, 5],
    "/Configuracion/Tipos": [3, 4, 5],
    "/Configuracion/Estados de Uso": [3, 4, 5], 
    "/Configuracion/Condiciones Fisicas": [3, 4, 5], 

    // Gestión de Usuarios
    "/Configuracion/NuevoUsuario": [5],
    "/Configuracion/Usuarios": [4, 5],
    "/Configuracion/Bitacora": [4, 5],
};
