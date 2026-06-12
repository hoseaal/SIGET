import {
  calcularPeriodoNominaObjetivo,
  crearEncabezadoAuditoria,
  normalizarTipoNomina
} from './periodoNomina.js'

export function obtenerPeriodoNominaPayload() {
  return {
    ok: true,
    periodo: calcularPeriodoNominaObjetivo(),
    tiposNomina: [
      { value: '1', label: 'Primera Quincena (1)' },
      { value: '2', label: 'Segunda Quincena (2)' },
      { value: 'unificada', label: 'Nomina Unificada (Mensual)' }
    ]
  }
}

export async function procesarNominaEnCaliente(req, service, totalKey = 'total_registros') {
  const periodo = calcularPeriodoNominaObjetivo()
  const tipoNomina = normalizarTipoNomina(req.query.tipoNomina ?? req.query.quincena)
  const quincenas = tipoNomina === 'unificada' ? [1, 2] : [Number(tipoNomina)]

  const resultados = await Promise.all(
    quincenas.map(quincena => service.generarNomina(periodo.mes, periodo.anio, quincena))
  )

  const datos = tipoNomina === 'unificada'
    ? { isUnificada: true, q1: resultados[0], q2: resultados[1] }
    : resultados[0]

  return {
    ok: true,
    periodo: { ...periodo, tipoNomina },
    auditoria: {
      calculoEnCaliente: true,
      historicoPersistente: 'Los calculos no se guardan en base de datos; el Excel exportado es el respaldo historico.',
      encabezadoExcel: crearEncabezadoAuditoria(periodo)
    },
    [totalKey]: tipoNomina === 'unificada' ? resultados[0].length + resultados[1].length : datos.length,
    datos
  }
}

export function responderErrorNomina(res, error, fallbackMessage) {
  const status = error.message?.includes('Tipo de nomina invalido') ? 400 : 500
  return res.status(status).json({
    ok: false,
    message: status === 400 ? error.message : fallbackMessage,
    error: error.message
  })
}
