import { RetroactivoModel } from '../models/retroactivo.model.js'
import { calcularPeriodoNominaObjetivo } from '../utils/periodoNomina.js'

export class RetroactivoService {
  static normalizeString(str) {
    if (!str) return ''
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  }

  static getPorcentajeJerarquia(cargo, jerarquias) {
    const normalizedCargo = this.normalizeString(cargo).replace(/\([a-z]\)/gi, '').replace(/\s+/g, ' ').trim()
    if (!normalizedCargo) return 0

    for (const item of jerarquias) {
      const key = this.normalizeString(item.cargo).replace(/\([a-z]\)/gi, '').replace(/\s+/g, ' ').trim()
      if (normalizedCargo === key || normalizedCargo.includes(key) || key.includes(normalizedCargo)) {
        return Number(item.porcentaje || 0) / 100
      }
    }

    return 0
  }

  static getPorcentajeAntiguedad(aniosAntiguedad, escalas) {
    let porcentaje = 0
    for (const escala of escalas) {
      if (Number(aniosAntiguedad || 0) >= Number(escala.anios_cumplidos || 0)) {
        porcentaje = Number(escala.porcentaje_actual || 0)
      }
    }
    return porcentaje / 100
  }

  static calcularFechaCorte(fechaInicio) {
    const [anio, mes] = fechaInicio.split('-').map(Number)
    const ultimoDia = new Date(anio, mes, 0).getDate()
    const diaCorte = Math.min(30, ultimoDia)
    return `${anio}-${String(mes).padStart(2, '0')}-${String(diaCorte).padStart(2, '0')}`
  }

  static contarDiasInclusive(fechaInicio, fechaCorte) {
    const inicio = new Date(`${fechaInicio}T00:00:00`)
    const corte = new Date(`${fechaCorte}T00:00:00`)

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(corte.getTime())) {
      throw new Error('Fechas invalidas para el calculo del retroactivo')
    }
    if (corte < inicio) {
      throw new Error('La fecha de corte no puede ser anterior a la fecha de inicio')
    }

    return Math.floor((corte - inicio) / 86400000) + 1
  }

  static async calcular(payload) {
    const empleado = await RetroactivoModel.getEmpleadoLaboral(payload.empleado_id)
    if (!empleado) throw new Error('Funcionario no encontrado')

    const nivelNuevo = await RetroactivoModel.getNivelSalarial(payload.nivel_salarial_id)
    if (!nivelNuevo) throw new Error('Nivel salarial no encontrado')

    const [cargoCetNuevo, cargoOnapreNuevo, salarioMinimo] = await Promise.all([
      RetroactivoModel.getCargoCet(payload.cargo_cet_id),
      RetroactivoModel.getCargoOnapre(payload.cargo_onapre_id),
      RetroactivoModel.getMinSalarialBase()
    ])
    const cargoNuevo = cargoOnapreNuevo?.nombre || cargoCetNuevo?.nombre || nivelNuevo.cargo_onapre_nombre || ''
    const [jerarquias, escalasAntiguedad] = await Promise.all([
      RetroactivoModel.getJerarquias(),
      RetroactivoModel.getEscalasAntiguedad()
    ])
    const fechaCorte = payload.fecha_corte || this.calcularFechaCorte(payload.fecha_inicio)
    const diasDiferencia = this.contarDiasInclusive(payload.fecha_inicio, fechaCorte)

    const salarioAnteriorRaw = Number(empleado.salario_base || 0)
    const salarioNuevoRaw = Number(nivelNuevo.salario_base || 0)
    const salarioAnterior = salarioMinimo > 0 && salarioAnteriorRaw < salarioMinimo ? salarioMinimo : salarioAnteriorRaw
    const salarioNuevo = salarioMinimo > 0 && salarioNuevoRaw < salarioMinimo ? salarioMinimo : salarioNuevoRaw
    const sueldoAnteriorQuincenal = salarioAnterior / 2
    const sueldoNuevoQuincenal = salarioNuevo / 2
    const pctProf = Number(empleado.porcentaje_profesionalizacion || 0) / 100

    const pctJerarquiaAnterior = this.getPorcentajeJerarquia(empleado.cargo_onapre_nombre || empleado.cargo_cet_nombre, jerarquias)
    const pctJerarquiaNueva = this.getPorcentajeJerarquia(cargoNuevo || empleado.cargo_onapre_nombre || empleado.cargo_cet_nombre, jerarquias)
    const pctAntiguedad = this.getPorcentajeAntiguedad(empleado.anios_antiguedad, escalasAntiguedad)

    const deltaSueldo = sueldoNuevoQuincenal - sueldoAnteriorQuincenal
    const deltaAntiguedad = (sueldoNuevoQuincenal * pctAntiguedad) - (sueldoAnteriorQuincenal * pctAntiguedad)
    const deltaProfesionalizacion = (sueldoNuevoQuincenal * pctProf) - (sueldoAnteriorQuincenal * pctProf)
    const deltaJerarquia = ((Number(nivelNuevo.salario_historico || salarioNuevo) * pctJerarquiaNueva) / 2) -
      ((Number(empleado.salario_historico || salarioAnterior) * pctJerarquiaAnterior) / 2)

    const baseRetroactivo = deltaSueldo + deltaAntiguedad + deltaProfesionalizacion + deltaJerarquia
    const montoRetroactivo = (baseRetroactivo / 15) * diasDiferencia

    return {
      fecha_corte: fechaCorte,
      dias_diferencia: diasDiferencia,
      delta_sueldo: Number(deltaSueldo.toFixed(2)),
      delta_antiguedad: Number(deltaAntiguedad.toFixed(2)),
      delta_profesionalizacion: Number(deltaProfesionalizacion.toFixed(2)),
      delta_jerarquia: Number(deltaJerarquia.toFixed(2)),
      monto_retroactivo: Number(montoRetroactivo.toFixed(2))
    }
  }

  static async listarPorEmpleado(empleadoId) {
    return RetroactivoModel.listByEmpleado(empleadoId)
  }

  static async crear(payload) {
    const calculo = await this.calcular(payload)
    const id = await RetroactivoModel.create({
      empleado_id: payload.empleado_id,
      fecha_inicio: payload.fecha_inicio,
      fecha_corte: calculo.fecha_corte,
      cargo_cet_id: payload.cargo_cet_id,
      cargo_onapre_id: payload.cargo_onapre_id,
      nivel_salarial_id: payload.nivel_salarial_id,
      direccion_id: payload.direccion_id,
      division_id: payload.division_id || null,
      unidad_id: payload.unidad_id || null,
      observacion: payload.observacion || null,
      ...calculo
    })
    return { retroactivo_id: id, ...calculo }
  }

  static async actualizar(id, payload) {
    const calculo = await this.calcular(payload)
    const updated = await RetroactivoModel.update(id, {
      fecha_inicio: payload.fecha_inicio,
      fecha_corte: calculo.fecha_corte,
      cargo_cet_id: payload.cargo_cet_id,
      cargo_onapre_id: payload.cargo_onapre_id,
      nivel_salarial_id: payload.nivel_salarial_id,
      direccion_id: payload.direccion_id,
      division_id: payload.division_id || null,
      unidad_id: payload.unidad_id || null,
      observacion: payload.observacion || null,
      ...calculo
    })
    if (!updated) throw new Error('Solo se pueden editar retroactivos pendientes')
    return { success: true, ...calculo }
  }

  static async eliminar(id) {
    const deleted = await RetroactivoModel.delete(id)
    if (!deleted) throw new Error('Solo se pueden eliminar retroactivos pendientes')
    return true
  }

  static async pagar(id, tipoNomina = '2') {
    const quincena = String(tipoNomina || '2')
    if (quincena !== '2' && quincena !== 'unificada') {
      throw new Error('Los retroactivos solo pueden pagarse en la segunda quincena o nómina unificada')
    }
    const periodo = calcularPeriodoNominaObjetivo()
    const paid = await RetroactivoModel.pagar(id, { ...periodo, quincena })
    if (!paid) throw new Error('El retroactivo no existe o ya fue pagado')
    return { success: true, periodo: { ...periodo, quincena } }
  }
}
