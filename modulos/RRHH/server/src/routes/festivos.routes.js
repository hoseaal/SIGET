import { Router } from 'express'
import { FestivosController } from '../controllers/festivos.controller.js'

const router = Router()

router.get('/', FestivosController.getAll)
router.post('/', FestivosController.create)
router.put('/:id', FestivosController.update)
router.delete('/:id', FestivosController.delete)

export default router
