import express from 'express';
import { obtenerTodas, obtenerPorId, crear, actualizar, eliminar, generarProximoNumero } from '../controllers/actividades.controller.js';
import { authenticate, checkRole } from '../auth/auth.middleware.js';

const router = express.Router();

// Middleware de seguridad: Todas las rutas requieren sesión activa y rol 1 o 2
router.use(authenticate);
router.use(checkRole([1, 2]));

router.get('/', obtenerTodas);
router.get('/proximo-numero', generarProximoNumero);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.patch('/:id', actualizar);
router.delete('/:id', eliminar);

export default router;