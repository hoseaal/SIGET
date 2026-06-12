import express from 'express'
import { DashboardModel } from '../models/dashboard.model.js'

const router = express.Router()

router.get('/stats', async (req, res) => {
  try {
    const now = new Date()
    const anio = req.query.anio || now.getFullYear()
    const mes = req.query.mes || (now.getMonth() + 1)

    const [empleados, nomina] = await Promise.all([
      DashboardModel.contarEmpleados(),
      DashboardModel.obtenerTotalesNominaMes(anio, mes)
    ])

    res.json({
      empleados,
      nomina: {
        anio: Number(anio),
        mes: Number(mes),
        total_bruto: Number(nomina.total_bruto),
        total_neto: Number(nomina.total_neto),
        total_deducciones: Number(nomina.total_deducciones),
        total_registros: Number(nomina.total_registros)
      }
    })
  } catch (error) {
    console.error('Error al obtener stats del dashboard:', error)
    res.status(500).json({ message: 'Error al obtener estadísticas del dashboard' })
  }
})

export default router
