import express from 'express';
import { obtenerTodas, obtenerPorId, crear, actualizar, eliminar } from '../controllers/actividades.controller.js';

const router = express.Router();

router.get('/', obtenerTodas);
router.get('/:id', obtenerPorId);
router.post('/', crear);
router.patch('/:id', actualizar); // Usamos PATCH para actualizaciones parciales
router.delete('/:id', eliminar);

export default router;