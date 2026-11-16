import { Router } from 'express';
import {
  answerDetail,
  createSolicitud,
  listSolicitudes,
  ratifyDetail,
} from '../controllers/solicitud.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createSolicitud);
router.get('/', listSolicitudes);
router.put('/detalles/:id/responder', answerDetail);
router.post('/detalles/:id/ratificar', ratifyDetail);

export default router;