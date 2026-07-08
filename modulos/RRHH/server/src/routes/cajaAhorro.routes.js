import { Router } from 'express';
import { CajaAhorroController } from '../controllers/cajaAhorro.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = Router();

router.get('/empleado/:empleado_id', authenticate, CajaAhorroController.listarPorEmpleado);
router.get('/periodo', authenticate, CajaAhorroController.listarPorPeriodo);
router.get('/resumen', authenticate, CajaAhorroController.resumenPeriodo);
router.get('/reporte', authenticate, CajaAhorroController.reporteCajaAhorro);
router.delete('/:id_caja', authenticate, CajaAhorroController.eliminar);

export default router;
