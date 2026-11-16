import { Router } from 'express';
import {
  createAuditoria,
  deleteAuditoria,
  listAuditorias,
  updateAuditoria,
} from '../controllers/auditoria.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createAuditoria);
router.get('/', listAuditorias);
router.put('/:id', updateAuditoria);
router.delete('/:id', deleteAuditoria);

export default router;