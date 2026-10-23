import { ActividadModel } from '../models/actividad.model.js'
import { generarExcelSemanal, generarExcelMensual } from '../services/excel/actividades.excel.service.js'

export const exportarSemanal = async (req, res) => {
  try {
    const { desde, hasta, departamento_id } = req.query
    const actividades = await ActividadModel.getAll({ desde, hasta, departamento_id })
    const buffer = await generarExcelSemanal(actividades, { desde, hasta })

    const nombre = `Actividades_Semanal_${desde || 'inicio'}_${hasta || 'fin'}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`)
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Error al generar Excel semanal:', error)
    res.status(500).json({ error: 'Error al generar el archivo Excel.' })
  }
}

export const exportarMensual = async (req, res) => {
  try {
    const mes = Number(req.query.mes) || (new Date().getMonth() + 1)
    const anio = Number(req.query.anio) || new Date().getFullYear()
    const rows = await ActividadModel.getMonthlyConsolidated(mes, anio)
    const buffer = await generarExcelMensual(rows, { mes, anio })

    const nombre = `Actividades_Mensual_${anio}_${String(mes).padStart(2, '0')}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`)
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Error al generar Excel mensual:', error)
    res.status(500).json({ error: 'Error al generar el archivo Excel.' })
  }
}

export const obtenerConsolidadoMensual = async (req, res) => {
  try {
    const mes = Number(req.query.mes) || (new Date().getMonth() + 1)
    const anio = Number(req.query.anio) || new Date().getFullYear()
    const rows = await ActividadModel.getMonthlyConsolidated(mes, anio)
    res.json({ mes, anio, rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
