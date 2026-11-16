import { Router } from 'express';
import { createEnte, deleteEnte, listEntes, updateEnte } from '../controllers/ente.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createEnte);
router.get('/', listEntes);
router.put('/:id', updateEnte);
router.delete('/:id', deleteEnte);

export default router;