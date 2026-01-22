// routes/reporteBM4.routes.js
import { Router } from 'express'
import { ReporteBM4Controller } from '../controllers/reporte.controller.js' // Asegúrate de la ruta correcta

const router = Router()

// Ruta para procesar el cierre de mes (POST)
router.post('/cerrar-mes', ReporteBM4Controller.cerrarMes)

// Nueva ruta para obtener los datos del cierre del mes (existencia anterior)
router.get('/existencia-anterior', ReporteBM4Controller.getExistenciaAnterior)

// Nueva ruta para obtener la existencia total actual en tiempo real
router.get('/existencia-actual', ReporteBM4Controller.getExistenciaActual)

router.get('/reporte-categorias', ReporteBM4Controller.getCategorias)

export default router
