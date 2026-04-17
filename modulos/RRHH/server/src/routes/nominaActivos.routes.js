import { Router } from 'express';
import { NominaActivosController } from '../controllers/nominaActivos.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = Router();

// Endpoints de nomina
router.get('/procesar', authenticate, NominaActivosController.calcularNominaActivos);

export default router;
