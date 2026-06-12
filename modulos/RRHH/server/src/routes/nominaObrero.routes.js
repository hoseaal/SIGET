import { Router } from 'express';
import { NominaObreroController } from '../controllers/nominaObrero.controller.js';

const router = Router();

router.get('/periodo-objetivo', NominaObreroController.obtenerPeriodoObjetivo);
router.get('/procesar', NominaObreroController.procesar);

export default router;
