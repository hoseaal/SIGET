import { NominaService } from '../services/nomina.service.js'
import { HistorialSalarioModel } from '../models/historialSalario.model.js'
import {
  calcularPeriodoNominaObjetivo,
  crearEncabezadoAuditoria,
  normalizarTipoNomina
} from '../utils/periodoNomina.js'

const TIPOS_PERSONAL_VALIDOS = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']

export class NominaController {

  static async obtenerPeriodoObjetivo(req, res) {
    try {
      const periodo = calcularPeriodoNominaObjetivo()
      res.status(200).json({
        ok: true,
        periodo,
        tiposNomina: [
          { value: '1', label: 'Primera Quincena (1)' },
          { value: '2', label: 'Segunda Quincena (2)' },
          { value: 'unificada', label: 'Nomina Unificada (Mensual)' }
        ]
      })
    } catch (error) {
      console.error('[NominaController] Error periodo:', error)
      res.status(500).json({ ok: false, message: 'Error interno al obtener el periodo de nomina' })
    }
  }

  static async calcularEnCaliente(req, res) {
    try {
      const { tipo_personal, quincena, mes, anio } = req.body

      if (!tipo_personal || !TIPOS_PERSONAL_VALIDOS.includes(tipo_personal)) {
        return res.status(400).json({
          ok: false,
          message: `tipo_personal inválido. Use: ${TIPOS_PERSONAL_VALIDOS.join(', ')}`
        })
      }

      const periodo = mes && anio
        ? { mes: Number(mes), anio: Number(anio) }
        : calcularPeriodoNominaObjetivo()

      const tipoNomina = normalizarTipoNomina(quincena ?? '1')
      const quincenas = tipoNomina === 'unificada' ? [1, 2] : [Number(tipoNomina)]

      const resultados = await Promise.all(
        quincenas.map(q => NominaService.calcular({
          tipo_personal,
          mes: periodo.mes,
          anio: periodo.anio,
          quincena: q
        }))
      )

      const datos = tipoNomina === 'unificada'
        ? { isUnificada: true, q1: resultados[0], q2: resultados[1] }
        : resultados[0]

      res.status(200).json({
        ok: true,
        tipo_personal,
        periodo: { ...periodo, tipoNomina },
        auditoria: {
          calculoEnCaliente: true,
          historicoPersistente: 'Los calculos no se guardan en base de datos; el Excel exportado es el respaldo historico.',
          encabezadoExcel: crearEncabezadoAuditoria(periodo)
        },
        total_registros: tipoNomina === 'unificada'
          ? resultados[0].length + resultados[1].length
          : datos.length,
        datos
      })
    } catch (error) {
      console.error('[NominaController] Error calcular en caliente:', error)
      res.status(error.statusCode || 500).json({
        ok: false,
        message: error.message || 'Error al calcular la nómina',
        error: error.message
      })
    }
  }

  static async guardarCierre(req, res) {
    try {
      const { tipo_personal, quincena, mes, anio } = req.body
      console.log('[guardarCierre] BODY:', { tipo_personal, quincena, mes, anio })

      if (!tipo_personal || !TIPOS_PERSONAL_VALIDOS.includes(tipo_personal)) {
        return res.status(400).json({
          ok: false,
          message: `tipo_personal inválido. Use: ${TIPOS_PERSONAL_VALIDOS.join(', ')}`
        })
      }

      const periodo = mes && anio
        ? { mes: Number(mes), anio: Number(anio) }
        : calcularPeriodoNominaObjetivo()

      const tipoNomina = normalizarTipoNomina(quincena ?? '1')
      const quincenas = tipoNomina === 'unificada' ? [1, 2] : [Number(tipoNomina)]
      console.log('[guardarCierre] quincenas a procesar:', quincenas, 'periodo:', periodo)

      const persistencia = await NominaService.cerrarYPersistir({
        tipo_personal,
        mes: periodo.mes,
        anio: periodo.anio,
        quincenas
      })

      res.status(200).json({
        ok: true,
        tipo_personal,
        periodo: { ...periodo, tipoNomina },
        auditoria: {
          persistenciaAutomatica: true,
          registrosPersistidos: persistencia,
          encabezadoExcel: crearEncabezadoAuditoria(periodo)
        }
      })
    } catch (error) {
      console.error('[NominaController] Error guardar cierre:', error)
      const status = error.isConflict ? 409 : (error.statusCode || 500)
      res.status(status).json({
        ok: false,
        message: error.isConflict
          ? error.message
          : (error.message || 'Error al cerrar y guardar la nómina'),
        error: error.message
      })
    }
  }

  static async verificarCierre(req, res) {
    try {
      const { mes, anio, quincena, tipo_personal } = req.query

      if (!mes || !anio || !quincena) {
        return res.status(400).json({
          ok: false,
          message: 'mes, anio y quincena son requeridos'
        })
      }

      const q = Number(quincena)
      if (![1, 2].includes(q)) {
        return res.status(400).json({
          ok: false,
          message: 'quincena debe ser 1 o 2'
        })
      }

      const total = await HistorialSalarioModel.countByPeriodo(
        Number(mes), Number(anio), q, tipo_personal || undefined
      )

      res.json({
        ok: true,
        data: {
          isClosed: total > 0,
          total
        }
      })
    } catch (error) {
      console.error('[NominaController] Error verificar cierre:', error)
      res.status(500).json({ ok: false, message: error.message })
    }
  }

  static async obtenerResumenQuincenal(req, res) {
    try {
      const { mes, anio, quincena, tipo_personal } = req.query
      if (!mes || !anio) {
        return res.status(400).json({ ok: false, error: 'mes y anio son requeridos' })
      }
      const resumen = await HistorialSalarioModel.getResumenByPeriodo(
        Number(mes), Number(anio), Number(quincena || 1), tipo_personal || 'Todos'
      )
      res.json({ ok: true, resumen })
    } catch (error) {
      console.error('[NominaController] Error resumen quincenal:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
}
