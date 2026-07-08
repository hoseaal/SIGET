import { Router } from 'express';
import { descargarConstancia } from '../controllers/constancia.controller.js';
import { authenticate, requireEmployeeScope } from '../auth/auth.middleware.js';

const router = Router();

// Endpoint para descargar constancia (restringido al scope del empleado si es Visualizador)
router.get('/trabajo', authenticate, requireEmployeeScope, descargarConstancia);

export default router;
