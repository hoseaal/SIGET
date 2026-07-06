import { Router } from 'express';
import { getMiNomina, getMisDatosLaborales, getMisAntiguedades, getMisEncargos, getMisVacaciones } from '../controllers/miPerfil.controller.js';
import { authenticate, requireEmployeeScope } from '../auth/auth.middleware.js';

const router = Router();

// Todos los endpoints bajo /api/mi-perfil requieren:
// 1. authenticate     → verifica el JWT y puebla req.user
// 2. requireEmployeeScope → si es Visualizador, fuerza req.query.empleado_id = req.user.empleado_id

/**
 * GET /api/mi-perfil/nomina
 * Devuelve el historial de recibos de nómina del empleado autenticado.
 * El Visualizador solo verá los suyos; el Admin puede pasar ?empleado_id=X.
 */
router.get('/nomina', authenticate, requireEmployeeScope, getMiNomina);

/**
 * GET /api/mi-perfil/datos-laborales
 * Devuelve los datos laborales del empleado autenticado.
 */
router.get('/datos-laborales', authenticate, requireEmployeeScope, getMisDatosLaborales);

router.get('/antiguedades', authenticate, requireEmployeeScope, getMisAntiguedades);
router.get('/encargos', authenticate, requireEmployeeScope, getMisEncargos);
router.get('/vacaciones', authenticate, requireEmployeeScope, getMisVacaciones);

/**
 * GET /api/mi-perfil/constancia
 * Genera y descarga la constancia de trabajo en PDF.
 * Importamos el controlador existente de constancias.
 */
// Este endpoint ya está en /api/constancias/trabajo, pero se puede duplicar
// aquí para seguir la convención de prefijo /mi-perfil si se prefiere.

export default router;
