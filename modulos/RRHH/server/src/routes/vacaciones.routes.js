import express from 'express'
import {
  obtenerAlertas,
  obtenerConsolidado,
  buscarEmpleados,
  calcularSaldo,
  calcularVacaciones,
  registrarSolicitud,
  pagarVacaciones,
  reintegrarVacaciones,
  terminarVacaciones,
  obtenerPerfil,
  obtenerRecibo,
  obtenerDetalleNomina,
  exportarExcel,
  posponerVacacionesController
} from '../controllers/vacaciones.controller.js'

const router = express.Router()

// TAREA 1: Alertas
router.get('/alertas', obtenerAlertas)
router.get('/notificaciones-navbar', obtenerAlertas)
router.get('/navbar-alerts', obtenerAlertas)

// TAREA 2: CRUD
router.get('/consolidado', obtenerConsolidado)
router.get('/buscar-empleados', buscarEmpleados)
router.post('/calcular-saldo', calcularSaldo)
router.post('/calcular', calcularVacaciones)
router.post('/solicitud', registrarSolicitud)
router.post('/pagar', pagarVacaciones)
router.post('/reintegrar', reintegrarVacaciones)
router.post('/terminar', terminarVacaciones)
router.post('/posponer', posponerVacacionesController)
router.get('/exportar-excel', exportarExcel)

// TAREA 3: Perfil
router.get('/perfil/:empleadoId', obtenerPerfil)
router.get('/perfil/:empleadoId/nomina', obtenerDetalleNomina)
router.get('/recibo/:empleadoId', obtenerRecibo)

export default router
