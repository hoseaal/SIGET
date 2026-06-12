import { Router } from 'express';
import { NominaActivosController } from '../controllers/nominaActivos.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = Router();

// Endpoints de nomina
router.get('/periodo-objetivo', authenticate, NominaActivosController.obtenerPeriodoObjetivo);
router.get('/procesar', authenticate, NominaActivosController.calcularNominaActivos);
router.get('/resumen-mensual', authenticate, NominaActivosController.resumenMensual);
router.get('/firmantes', authenticate, NominaActivosController.firmantes);

export default router;
