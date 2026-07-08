import pool from '../utils/database.js'
import { HistorialSalarioModel } from '../models/historialSalario.model.js'
import { CajaAhorroModel } from '../models/cajaAhorro.model.js'

export class NominaPersistenceService {

  static _validarRegistro(reg, index) {
    const errores = []

    if (!reg.empleado_id) {
      errores.push(`Registro #${index}: empleado_id es requerido`)
    }

    const q = Number(reg.quincena_no)
    if (![1, 2].includes(q)) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): quincena_no debe ser 1 o 2, se recibió ${reg.quincena_no}`)
    }

    const m = Number(reg.mes)
    if (m < 1 || m > 12) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): mes debe estar entre 1 y 12, se recibió ${reg.mes}`)
    }

    const a = Number(reg.anio)
    if (a < 2000 || a > 2100) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): anio debe estar entre 2000 y 2100, se recibió ${reg.anio}`)
    }

    if (Number(reg.total_asignaciones) < 0) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): total_asignaciones no puede ser negativo`)
    }
    if (Number(reg.total_deducciones) < 0) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): total_deducciones no puede ser negativo`)
    }
    if (Number(reg.salario_neto) < 0) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): salario_neto no puede ser negativo`)
    }

    if (reg.monto_caja !== undefined && reg.monto_caja !== null && Number(reg.monto_caja) < 0) {
      errores.push(`Registro #${index} (emp ${reg.empleado_id || '?'}): monto_caja no puede ser negativo`)
    }

    return errores
  }

  static async _resolverEmpleadoId(cedula) {
    if (!cedula) return null
    try {
      const [rows] = await pool.query(
        'SELECT empleado_id FROM empleados WHERE cedula = ? LIMIT 1',
        [String(cedula)]
      )
      return rows?.[0]?.empleado_id || null
    } catch {
      return null
    }
  }

  static async persistir({ registros, mes, anio, quincena_no, tipo_personal, normalizador }) {
    const q = Number(quincena_no)
    const m = Number(mes)
    const a = Number(anio)

    if (![1, 2].includes(q)) {
      throw new Error(`[Persistence] quincena_no inválido: ${quincena_no}. Debe ser 1 o 2`)
    }
    if (m < 1 || m > 12) {
      throw new Error(`[Persistence] mes inválido: ${mes}. Debe estar entre 1 y 12`)
    }
    if (a < 2000 || a > 2100) {
      throw new Error(`[Persistence] anio inválido: ${anio}. Debe estar entre 2000 y 2100`)
    }

    if (!registros || registros.length === 0) {
      return {
        historial: 0,
        caja_ahorro: 0,
        errores: 0,
        erroresDetalle: []
      }
    }

    const registrosNormalizados = []
    const erroresDetalle = []

    for (let i = 0; i < registros.length; i++) {
      const item = normalizador ? normalizador(registros[i]) : registros[i]
      const index = i + 1

      let empleado_id = item.empleado_id
      if (!empleado_id && item.cedula) {
        empleado_id = await this._resolverEmpleadoId(item.cedula)
      }

      const registro = {
        empleado_id,
        tipo_personal: tipo_personal || 'Funcionario',
        quincena_no: q,
        mes: m,
        anio: a,
        total_asignaciones: Number(item.total_asignaciones ?? 0),
        total_deducciones: Number(item.total_deducciones ?? 0),
        salario_neto: Number(item.salario_neto ?? 0),
        monto_caja: item.monto_caja !== undefined ? Number(item.monto_caja) : undefined,
        aporte_empleado: item.aporte_empleado !== undefined ? Number(item.aporte_empleado) : undefined,
        aporte_patrono: item.aporte_patrono !== undefined ? Number(item.aporte_patrono) : undefined
      }

      const errores = this._validarRegistro(registro, index)
      if (errores.length > 0) {
        console.log(`[Persistence] Registro #${index} (emp ${empleado_id}) errores:`, errores)
        erroresDetalle.push({ index, empleado_id, errores })
        continue
      }

      registrosNormalizados.push(registro)
    }

    if (registrosNormalizados.length === 0) {
      console.log(`[Persistence] 0 registros normalizados para Q${q}/${m}/${a} (${tipo_personal}), errores=${erroresDetalle.length}`)
      return {
        historial: 0,
        caja_ahorro: 0,
        errores: erroresDetalle.length,
        erroresDetalle
      }
    }

    const connection = await pool.getConnection()
    let historialCount = 0
    let cajaCount = 0

    try {
      await connection.beginTransaction()

      for (const reg of registrosNormalizados) {
        if (!reg.empleado_id) continue

        await HistorialSalarioModel.insert({
          empleado_id: reg.empleado_id,
          tipo_personal: reg.tipo_personal,
          quincena_no: reg.quincena_no,
          mes: reg.mes,
          anio: reg.anio,
          total_asignaciones: reg.total_asignaciones,
          total_deducciones: reg.total_deducciones,
          salario_neto: reg.salario_neto
        }, connection)
        historialCount++

        if (reg.monto_caja !== undefined && reg.monto_caja > 0) {
          await CajaAhorroModel.insert({
            empleado_id: reg.empleado_id,
            tipo_personal: reg.tipo_personal,
            quincena_no: reg.quincena_no,
            mes: reg.mes,
            anio: reg.anio,
            monto: reg.monto_caja,
            aporte_empleado: reg.aporte_empleado,
            aporte_patrono: reg.aporte_patrono
          }, connection)
          cajaCount++
        }
      }

      await connection.commit()
    } catch (err) {
      await connection.rollback()
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error(
          `El período de nómina solicitado ya ha sido procesado e historizado con anterioridad. ` +
          `(${tipo_personal || 'Nómina'} Q${q}/${m}/${a})`
        )
      }
      throw new Error(
        `[Persistence] Error en transacción global para ${tipo_personal || 'Nómina'} ` +
        `Q${q}/${m}/${a}: ${err.message}`
      )
    } finally {
      connection.release()
    }

    return {
      historial: historialCount,
      caja_ahorro: cajaCount,
      errores: erroresDetalle.length,
      erroresDetalle
    }
  }
}
