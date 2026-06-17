import {
  calcularPeriodoNominaObjetivo,
  crearEncabezadoAuditoria,
  normalizarTipoNomina
} from './periodoNomina.js'
import { HistorialSalarioModel } from '../models/historialSalario.model.js'

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

/**
 * Verifica que ninguno de los períodos solicitados tenga registros previos
 * en historial_pagos para el tipo_personal específico (INNER JOIN con empleados).
 * Si encuentra datos, lanza un error que debe traducirse en HTTP 409 Conflict.
 */
export async function validarPeriodoDisponible(mes, anio, quincenas, tipoPersonal) {
  const conflictos = []
  for (const q of quincenas) {
    const count = await HistorialSalarioModel.countByPeriodo(
      Number(mes), Number(anio), Number(q), tipoPersonal
    )
    if (count > 0) {
      conflictos.push(`${tipoPersonal} Q${q}/${mes}/${anio}`)
    }
  }
  if (conflictos.length > 0) {
    const msg = `El período de nómina solicitado ya ha sido procesado e historizado con anterioridad. (${conflictos.join(', ')})`
    const err = new Error(msg)
    err.statusCode = 409
    err.isConflict = true
    throw err
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

export async function procesarNominaYPersistir(req, service, totalKey = 'total_registros') {
  const periodo = calcularPeriodoNominaObjetivo()
  const tipoNomina = normalizarTipoNomina(req.query.tipoNomina ?? req.query.quincena)
  const quincenas = tipoNomina === 'unificada' ? [1, 2] : [Number(tipoNomina)]

  console.log(`[procesarNominaYPersistir] tipoNomina=${tipoNomina}, quincenas=[${quincenas}], mes=${periodo.mes}, anio=${periodo.anio}, service=${service.constructor?.name || 'anon'}`)

  await validarPeriodoDisponible(periodo.mes, periodo.anio, quincenas, service.tipoPersonal)

  const resultados = await Promise.all(
    quincenas.map(quincena => service.generarNomina(periodo.mes, periodo.anio, quincena))
  )

  const datos = tipoNomina === 'unificada'
    ? { isUnificada: true, q1: resultados[0], q2: resultados[1] }
    : resultados[0]

  const persistencia = {}
  for (let i = 0; i < quincenas.length; i++) {
    const q = quincenas[i]
    const resultado = resultados[i]
    console.log(`[procesarNominaYPersistir] Persistiendo Q${q} (${resultado?.length ?? 0} registros)...`)
    const resPersist = await service.persistirNomina(resultado, periodo.mes, periodo.anio, q)
    console.log(`[procesarNominaYPersistir] Q${q} resultado:`, JSON.stringify(resPersist))
    persistencia[`q${q}`] = resPersist
  }

  return {
    ok: true,
    periodo: { ...periodo, tipoNomina },
    auditoria: {
      calculoEnCaliente: true,
      persistenciaAutomatica: true,
      registrosPersistidos: persistencia,
      encabezadoExcel: crearEncabezadoAuditoria(periodo)
    },
    [totalKey]: tipoNomina === 'unificada' ? resultados[0].length + resultados[1].length : datos.length,
    datos
  }
}

export function responderErrorNomina(res, error, fallbackMessage) {
  let status
  if (error.isConflict || error.message?.includes('ya ha sido procesado e historizado')) {
    status = 409
  } else if (error.message?.includes('Tipo de nomina invalido')) {
    status = 400
  } else {
    status = 500
  }
  return res.status(status).json({
    ok: false,
    message: error.message || fallbackMessage,
    error: error.message
  })
}
