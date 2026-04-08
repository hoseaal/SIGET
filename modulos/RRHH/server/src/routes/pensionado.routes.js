import express from 'express'
import { PensionadoController } from '../controllers/pensionado.controller.js'

const router = express.Router()

// Rutas principales
router.get('/', PensionadoController.getPensionados)
router.get('/stats', PensionadoController.getStats)
router.get('/direccion/:direccionId', PensionadoController.getByDireccion)
router.get('/:id', PensionadoController.getPensionadoById)
router.post('/', PensionadoController.createPensionado)
router.put('/:id', PensionadoController.updatePensionado)
router.patch('/:id/status', PensionadoController.changeStatus)
router.delete('/:id', PensionadoController.deletePensionado)

export default router