import { VacacionesModel } from '../models/vacaciones.model.js'
import { FestivosModel } from '../models/festivos.model.js'
import pool from '../utils/database.js'

const STATUS = {
  PROGRAMADO: 1,
  DE_DISFRUTE: 2,
  FINALIZADO: 3,
  REINTEGRO: 4,
  EN_ESPERA: 5
}

export class VacacionesService {
  static ultimaEjecucionMantenimiento = null

  /* ─── Helpers ──────────────────────────────────────────── */

  static dateOnly(value) {
    if (!value) return null
    let d
    if (value instanceof Date) {
      d = new Date(value.getTime())
    } else if (typeof value === 'string') {
      const clean = value.trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const [year, month, day] = clean.split('-').map(Number)
        d = new Date(year, month - 1, day)
      } else {
        d = new Date(value)
      }
    } else {
      d = new Date(value)
    }
    if (isNaN(d.getTime())) return null
    d.setHours(0, 0, 0, 0)
    return d
  }

  static toISODate(value) {
    if (!value) return null
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return value.trim()
    }
    const d = this.dateOnly(value)
    if (!d) return null
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  static isFestivo(fecha, festivos = []) {
    return festivos.some(f => {
      const base = this.dateOnly(f.fecha)
      if (!base) return false
      if (f.recurrente) return base.getMonth() === fecha.getMonth() && base.getDate() === fecha.getDate()
      return base.getFullYear() === fecha.getFullYear() && base.getMonth() === fecha.getMonth() && base.getDate() === fecha.getDate()
    })
  }

  static esHabil(fecha, festivos = []) {
    if (!fecha) return false
    const day = fecha.getDay()
    if (day === 0 || day === 6) return false
    return !this.isFestivo(fecha, festivos)
  }

  static contarDiasHabiles(fechaInicio, fechaFin, festivos = []) {
    const start = this.dateOnly(fechaInicio)
    const end = this.dateOnly(fechaFin)
    if (!start || !end || start > end) return 0

    let count = 0
    const d = new Date(start)
    while (d <= end) {
      if (this.esHabil(d, festivos)) count++
      d.setDate(d.getDate() + 1)
    }
    return count
  }

  static mapStatusKey(statusId) {
    if (statusId === STATUS.PROGRAMADO) return 'programado'
    if (statusId === STATUS.DE_DISFRUTE) return 'de_disfrute'
    if (statusId === STATUS.FINALIZADO) return 'finalizado'
    if (statusId === STATUS.REINTEGRO) return 'reintegro'
    if (statusId === STATUS.EN_ESPERA) return 'en_espera'
    return 'sin_status'
  }

  static calcularFechaRetorno(fechaFin) {
    const date = this.dateOnly(fechaFin)
    if (!date) return null
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day === 6) date.setDate(date.getDate() + 2)
    else if (day === 0) date.setDate(date.getDate() + 1)
    return this.toISODate(date)
  }

  /**
   * Calcula el salario mensual total sumando todas las asignaciones del empleado.
   * salario_diario = totalSueldoMensual / 30
   */
  static calcularSalarioMensual(emp, aniosAntiguedad = 0) {
    const salarioBase = Number(emp.salario_base || 0)
    const pctProf = Number(emp.porcentaje_profesionalizacion || 0) / 100
    const pctAntiguedad = Math.min(aniosAntiguedad * 0.02, 0.3)

    const sueldoBasico = salarioBase
    const primaAntiguedad = Number((salarioBase * pctAntiguedad / 2).toFixed(2))
    const primaProfesionalizacion = Number((salarioBase / 2 * pctProf).toFixed(2))
    const primaTransporte = 150
    const primaHogares = 120

    // Primas fijas en cero (extensibles con los campos correspondientes)
    const primaJerarquia = 0
    const primaReconocimiento = 0
    const primaComplementoAlimentacion = 0
    const primaHijos = 0
    const difSueldoBasico = 0
    const difAntiguedad = 0
    const difProfesionalizacion = 0
    const difJerarquia = 0

    return Number((
      sueldoBasico + primaAntiguedad + primaProfesionalizacion + primaJerarquia +
      primaTransporte + primaReconocimiento + primaHogares + primaComplementoAlimentacion +
      primaHijos + difSueldoBasico + difAntiguedad + difProfesionalizacion + difJerarquia
    ).toFixed(2))
  }

  /* ─────────────────────────────────────────────────────────
   *  MÓDULO 1 — Cálculo de Antigüedad
   *
   *  Lee tipo_personal directamente de la tabla empleados
   *  ('FUNCIONARIO' | 'OBRERO') en vez de inferirlo por texto
   *  de cargo.  Devuelve el string en MAYÚSCULAS tal como
   *  está almacenado en la BD.
   * ─────────────────────────────────────────────────────────*/

  /**
   * Normaliza tipo_personal al formato interno del servicio.
   * La BD guarda 'FUNCIONARIO' o 'OBRERO' (mayúsculas).
   * Internamente usamos minúsculas para no romper el resto del código.
   *
   * @param {'FUNCIONARIO'|'OBRERO'} tipoPersonal
   * @returns {'funcionario'|'obrero'}
   */
  static normalizarTipo(tipoPersonal = '') {
    return tipoPersonal.toUpperCase() === 'OBRERO' ? 'obrero' : 'funcionario'
  }

  /* ─────────────────────────────────────────────────────────
   *  MÓDULO 2 — Asignación de Días de Disfrute
   *
   *  Bifurca la lógica según tipo_personal:
   *
   *  FUNCIONARIO:
   *    dias_base      → configuracion_vacaciones (rango mínimo/máximo)
   *    dias_adicionales → MAX(0, anios - 1)  ← 1 día por año desde el 2do
   *    total          → dias_base + dias_adicionales
   *
   *  OBRERO:
   *    dias_base      → configuracion_vacaciones_obreros (año exacto, CLAMP 1-16)
   *    dias_adicionales → SIEMPRE 0
   *    total          → solo dias_base
   * ─────────────────────────────────────────────────────────*/

  /**
   * Calcula los días de disfrute a partir de años de antigüedad y tipo de personal.
   *
   * @param {number}               aniosAntiguedad  Años completos (ya con FLOOR).
   * @param {'funcionario'|'obrero'} tipo           Tipo normalizado.
   * @returns {Promise<{ dias_base: number, dias_adicionales: number, total_dias_disfrute: number }>}
   */
  static async calcularDiasDisfrute(aniosAntiguedad, tipo) {
    // Para obreros: aplicar CLAMP entre año 1 (mínimo) y año 16 (tope de tabla)
    const anioConsulta = tipo === 'obrero'
      ? Math.min(Math.max(aniosAntiguedad, 1), 16)
      : aniosAntiguedad

    const config = await VacacionesModel.getConfiguracionVacaciones(anioConsulta, tipo)
    const diasBase = Number(config?.dias_disfrute || 15)

    // REGLA: Funcionarios acumulan 1 día adicional por cada año a partir del segundo.
    //        Obreros: días adicionales = 0 (el valor ya está en la tabla).
    const diasAdicionales = tipo === 'funcionario'
      ? Math.max(0, aniosAntiguedad - 1)
      : 0

    return {
      dias_base: diasBase,
      dias_adicionales: diasAdicionales,
      total_dias_disfrute: diasBase + diasAdicionales
    }
  }

  /* ─────────────────────────────────────────────────────────
   *  MÓDULO 3 — Proyección de Fechas (Calendario Dinámico)
   *
   *  Opera con un bucle día por día sobre el calendario real.
   *  Dos condiciones descartan un día sin consumir saldo:
   *    A) Es sábado o domingo.
   *    B) Está registrado en la tabla dias_festivos.
   *  Cuando el saldo llega a 0 ese día es la fecha_fin.
   *  La fecha_reincorporacion es el primer día hábil
   *  POSTERIOR a fecha_fin.
   * ─────────────────────────────────────────────────────────*/

  /**
   * Proyecta fecha_fin y fecha_reincorporacion contando sólo
   * días hábiles hacia adelante desde fecha_inicio.
   *
   * @param {string} fechaInicio         Fecha ISO 'YYYY-MM-DD'.
   * @param {number} totalDiasHabiles    Saldo de días hábiles a consumir.
   * @param {Array}  festivos            Array de objetos { fecha, recurrente } de FestivosModel.
   * @returns {{ fecha_inicio: string, fecha_fin: string, fecha_reincorporacion: string }}
   */
  static proyectarFechasCalendario(fechaInicio, totalDiasHabiles, festivos = []) {
    const inicio = this.dateOnly(fechaInicio)
    if (!inicio) throw new Error('Fecha de inicio inválida para proyección de calendario')
    if (!Number.isFinite(totalDiasHabiles) || totalDiasHabiles <= 0) {
      throw new Error('El total de días hábiles debe ser mayor a cero')
    }

    // ── Fase 1: proyectar fecha_fin ──────────────────────────
    // Avanzamos día por día; sólo descontamos saldo cuando el día es hábil.
    let saldo  = totalDiasHabiles
    let cursor = new Date(inicio)   // cursor mutable sobre el calendario
    let fechaFin = null

    while (saldo > 0) {
      // Condición A: fin de semana (0 = domingo, 6 = sábado)
      const esFinDeSemana = cursor.getDay() === 0 || cursor.getDay() === 6

      // Condición B: día registrado en dias_festivos
      const esFestivo = this.isFestivo(cursor, festivos)

      if (esFinDeSemana || esFestivo) {
        // Día no laborable → avanzamos SIN descontar saldo
        cursor.setDate(cursor.getDate() + 1)
        continue
      }

      // Día hábil confirmado → descontamos 1 del saldo
      saldo--

      if (saldo === 0) {
        // El saldo llegó a cero → este es el último día de vacaciones
        fechaFin = new Date(cursor)
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    // ── Fase 2: calcular fecha_reincorporacion ───────────────
    // Arrancamos el día SIGUIENTE a fecha_fin y avanzamos hasta
    // encontrar el primer día que no sea fin de semana ni festivo.
    const reincorp = new Date(fechaFin)
    reincorp.setDate(reincorp.getDate() + 1)

    while (true) {
      const esFinDeSemana = reincorp.getDay() === 0 || reincorp.getDay() === 6
      const esFestivo     = this.isFestivo(reincorp, festivos)

      if (!esFinDeSemana && !esFestivo) break  // ← primer día hábil encontrado

      reincorp.setDate(reincorp.getDate() + 1)
    }

    return {
      fecha_inicio:          this.toISODate(inicio),
      fecha_fin:             this.toISODate(fechaFin),
      fecha_reincorporacion: this.toISODate(reincorp)
    }
  }

  /* ─────────────────────────────────────────────────────────
   *  ENDPOINT PRINCIPAL — POST /api/vacaciones/calcular
   *
   *  Orquesta los tres módulos en secuencia:
   *    1. Obtiene tipo_personal desde empleados.
   *    2. Calcula años de antigüedad (Módulo 1).
   *    3. Obtiene días de disfrute (Módulo 2).
   *    4. Proyecta fechas con el calendario (Módulo 3).
   * ─────────────────────────────────────────────────────────*/

  /**
   * Calcula la proyección completa de vacaciones para un empleado.
   *
   * @param {number} empleadoId
   * @param {string} fechaInicioVacaciones  Fecha ISO 'YYYY-MM-DD'.
   * @returns {Promise<Object>}
   */
  static async calcularVacaciones(empleadoId, fechaInicioVacaciones) {
    if (!empleadoId) throw new Error('empleado_id es requerido')
    if (!fechaInicioVacaciones) throw new Error('fecha_inicio es requerida')

    const fechaInicio = this.toISODate(fechaInicioVacaciones)
    if (!fechaInicio) throw new Error('fecha_inicio no tiene un formato válido (YYYY-MM-DD)')

    // ── Paso 1: tipo_personal desde la BD (no por texto de cargo) ──
    const empBase = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    if (!empBase) throw new Error('Empleado no encontrado')
    const tipo = this.normalizarTipo(empBase.tipo_personal)

    // ── Paso 2: Antigüedad (Módulo 1) ──────────────────────────────
    // Pasa la fecha_inicio_vacaciones como tope de cálculo.
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId, fechaInicio)

    // ── Paso 3: Días de disfrute (Módulo 2) ────────────────────────
    const { dias_base, dias_adicionales, total_dias_disfrute } =
      await this.calcularDiasDisfrute(aniosAntiguedad, tipo)

    // ── Paso 4: Proyección de fechas (Módulo 3) ─────────────────────
    // Obtiene el calendario de festivos una sola vez.
    const festivos = await FestivosModel.getAll()
    const { fecha_fin, fecha_reincorporacion } =
      this.proyectarFechasCalendario(fechaInicio, total_dias_disfrute, festivos)

    return {
      tipo_personal:          empBase.tipo_personal,   // 'FUNCIONARIO' | 'OBRERO'
      antiguedad_anios:       aniosAntiguedad,
      dias_base,
      dias_adicionales,
      total_dias_disfrute,
      fecha_inicio,
      fecha_fin,
      fecha_reincorporacion
    }
  }

  static async calcularDerechosYLiquidacion(empleadoId, diasSolicitados = 0, fechaRef = null) {
    const emp = await VacacionesModel.getDatosSalariales(empleadoId)
    if (!emp) throw new Error('Empleado no encontrado')

    // Usa el Módulo 1 con la fecha de referencia correcta
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId, fechaRef)

    // Lee tipo_personal desde la BD (Módulo 2)
    const empBase  = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    const tipoEmp  = this.normalizarTipo(empBase?.tipo_personal || 'FUNCIONARIO')

    // Módulo 2: días de disfrute con la bifurcación correcta
    const { dias_base, dias_adicionales, total_dias_disfrute } =
      await this.calcularDiasDisfrute(aniosAntiguedad, tipoEmp)

    const festivos = await FestivosModel.getAll()
    const config   = await VacacionesModel.getConfiguracionVacaciones(
      tipoEmp === 'obrero' ? Math.min(Math.max(aniosAntiguedad, 1), 16) : aniosAntiguedad,
      tipoEmp
    )

    const diasDisfruteLey = total_dias_disfrute
    const diasPagoEscala  = Number(config?.pago || diasDisfruteLey)

    const historial = await VacacionesModel.getHistorialVacaciones(empleadoId)
    const anioActual = new Date().getFullYear()
    let totalUsadosAnio = 0

    for (const h of historial) {
      if (!h.fecha_inicio || !h.fecha_fin) continue
      const anioVac = new Date(h.fecha_inicio).getFullYear()
      if (anioVac !== anioActual) continue
      const diasHist = h.dias_habiles != null ? Number(h.dias_habiles) : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos)
      totalUsadosAnio += Number(diasHist || 0)
    }

    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    const diasAcumulados = Number(vacRecord?.dias_acumulados || 0)
    const totalDisponibles = Math.max(0, diasDisfruteLey + diasAcumulados - totalUsadosAnio)

    if (diasSolicitados > totalDisponibles) {
      throw new Error(`Saldo insuficiente. Disponible: ${totalDisponibles}, solicitado: ${diasSolicitados}`)
    }

    // Salario diario = (suma de todas las asignaciones mensuales) / 30
    const totalSueldoMensual = this.calcularSalarioMensual(emp, aniosAntiguedad)
    const salarioDiario = Number((totalSueldoMensual / 30).toFixed(2))
    const montoModalidadFija = Number((salarioDiario * 220).toFixed(2))
    const montoModalidadEscala = Number((salarioDiario * diasPagoEscala).toFixed(2))

    return {
      empleado: emp,
      tipo_empleado: tipoEmp,
      anios_antiguedad: aniosAntiguedad,
      dias_base,
      dias_adicionales,
      dias_disfrute_ley: diasDisfruteLey,
      dias_pago_escala: diasPagoEscala,
      dias_acumulados: diasAcumulados,
      dias_usados_anio: totalUsadosAnio,
      total_disponibles: totalDisponibles,
      dias_solicitados: Number(diasSolicitados || 0),
      nuevo_acumulado: Math.max(0, totalDisponibles - Number(diasSolicitados || 0)),
      salario_diario: salarioDiario,
      pago_modalidad_fija: {
        nombre: 'Modalidad A (Fija)',
        dias_base: 220,
        monto: montoModalidadFija
      },
      pago_modalidad_escala: {
        nombre: 'Modalidad B (Por Escala/Tabla)',
        dias_base: diasPagoEscala,
        monto: montoModalidadEscala
      },
      ya_pagado: Boolean(vacRecord?.pagado)
    }
  }

  static async calcularFechasDisfrute(fechaInicio, diasSolicitados) {
    const inicio = this.toISODate(fechaInicio)
    if (!inicio) throw new Error('Fecha de inicio inválida')
    if (!Number.isFinite(Number(diasSolicitados)) || Number(diasSolicitados) <= 0) {
      throw new Error('Los días solicitados deben ser mayores a cero')
    }

    // Usa el Módulo 3 en JavaScript puro (ya no delega la lógica a SQL)
    const festivos = await FestivosModel.getAll()
    return this.proyectarFechasCalendario(inicio, Number(diasSolicitados), festivos)
  }

  /* ─── Alertas + Mantenimiento Diario ───────────────────── */

  static async mantenimientoDiario(force = false) {
    const hoy = this.toISODate(new Date())
    if (!force && this.ultimaEjecucionMantenimiento === hoy) return { skipped: true, date: hoy }

    await pool.query(`
      UPDATE vacaciones v
      INNER JOIN fechas_vacaciones fv ON fv.id_fecha = (
        SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
      )
      SET v.id_status_vacaciones = ?
      WHERE v.id_status_vacaciones = ?
        AND fv.fecha_inicio <= CURDATE()
        AND (fv.fecha_fin IS NULL OR fv.fecha_fin >= CURDATE())
    `, [STATUS.DE_DISFRUTE, STATUS.PROGRAMADO])

    await pool.query(`
      UPDATE vacaciones v
      INNER JOIN fechas_vacaciones fv ON fv.id_fecha = (
        SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
      )
      SET v.id_status_vacaciones = ?
      WHERE v.id_status_vacaciones IN (?, ?)
        AND fv.fecha_fin < CURDATE()
    `, [STATUS.FINALIZADO, STATUS.PROGRAMADO, STATUS.DE_DISFRUTE])

    await pool.query(`
      UPDATE empleados e
      INNER JOIN vacaciones v ON v.id_empleado = e.empleado_id
      SET e.estatus_id = 8
      WHERE v.id_status_vacaciones = ?
        AND e.estatus_id <> 8
    `, [STATUS.DE_DISFRUTE])

    await pool.query(`
      UPDATE empleados e
      INNER JOIN vacaciones v ON v.id_empleado = e.empleado_id
      SET e.estatus_id = 1
      WHERE v.id_status_vacaciones IN (?, ?, ?)
        AND e.estatus_id IN (8, 9)
    `, [STATUS.FINALIZADO, STATUS.REINTEGRO, STATUS.EN_ESPERA])

    this.ultimaEjecucionMantenimiento = hoy
    return { skipped: false, date: hoy }
  }

  static async obtenerAlertas() {
    await this.mantenimientoDiario()
    const festivos = await FestivosModel.getAll()

    // 1. Alertas por derecho próximo (Módulo 1)
    const porDerechoRaw = await VacacionesModel.getProximosDerecho()
    const porDerecho = porDerechoRaw.map(a => ({
      ...a,
      fecha_derecho_proximo: this.toISODate(a.fecha_derecho_proximo)
    }))

    // 2. Alertas por caducidad (Módulo 3) - Personas con vacaciones a punto de vencer
    const caducidadRaw = await VacacionesModel.getVacacionesProximasRetornar()
    const caducidad = caducidadRaw.map(a => ({
      ...a,
      dias_restantes: this.contarDiasHabiles(new Date(), a.fecha_fin, festivos)
    }))

    // 3. Alertas por vacaciones finalizadas (estatus_id=1, status_vac=3)
    const finalizadasRaw = await VacacionesModel.getVacacionesFinalizadas(STATUS.FINALIZADO)

    const finalizadas = finalizadasRaw.map(a => ({
      ...a,
      dias_desde_finalizacion: this.contarDiasHabiles(a.fecha_fin, new Date(), festivos)
    }))

    return {
      resumen: {
        por_derecho: porDerecho.length,
        vacaciones_finalizadas: finalizadas.length,
        caducidad: caducidad.length
      },
      por_derecho: porDerecho,
      vacaciones_finalizadas: finalizadas,
      caducidad
    }
  }

  /* ─── CRUD ─────────────────────────────────────────────── */

  static async obtenerConsolidado(tipoEmpleado = null) {
    await this.mantenimientoDiario()
    const festivos = await FestivosModel.getAll()
    const rows = await VacacionesModel.getConsolidado(tipoEmpleado)
    const anioActual = new Date().getFullYear()

    for (const row of rows) {
      const derechos = await this.calcularDerechosYLiquidacion(row.empleado_id, 0)
      const historial = await VacacionesModel.getHistorialVacaciones(row.empleado_id)
      let usadosAnio = 0

      for (const h of historial) {
        if (!h.fecha_inicio || !h.fecha_fin) continue
        if (new Date(h.fecha_inicio).getFullYear() !== anioActual) continue
        usadosAnio += h.dias_habiles != null ? Number(h.dias_habiles) : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos)
      }

      row.dias_usados_anio = usadosAnio
      row.dias_pendientes_disfrute = Math.max(0, derechos.dias_disfrute_ley - usadosAnio)
      row.dias_pendientes = Math.max(0, derechos.dias_disfrute_ley + Number(row.dias_acumulados || 0) - usadosAnio)
      row.estado_vacaciones = this.mapStatusKey(Number(row.id_status_vacaciones))
      row.fecha_inicio = this.toISODate(row.fecha_inicio)
      row.fecha_fin = this.toISODate(row.fecha_fin)
      row.fecha_tope = this.toISODate(row.fecha_tope)
      row.fecha_derecho_proximo = this.toISODate(row.fecha_derecho_proximo)
      row.id_status_vacaciones = Number(row.id_status_vacaciones || 0)
    }

    return rows
  }

  static async buscarEmpleados(query, tipoEmpleado = null) {
    if (!query || query.trim().length < 2) return []
    return VacacionesModel.buscarEmpleados(query.trim(), tipoEmpleado)
  }

  static async calcularSaldo(empleadoId, diasSolicitados = 0, fechaInicio = null) {
    await this.mantenimientoDiario()
    const derechos = await this.calcularDerechosYLiquidacion(empleadoId, Number(diasSolicitados) || 0)
    const fechas = (fechaInicio && Number(diasSolicitados) > 0)
      ? await this.calcularFechasDisfrute(fechaInicio, diasSolicitados)
      : { fecha_inicio: this.toISODate(fechaInicio), fecha_fin: null, fecha_reincorporacion: null }

    return {
      empleado_id: empleadoId,
      cedula: derechos.empleado.cedula || '',
      nombres: derechos.empleado.nombres || '',
      apellidos: derechos.empleado.apellidos || '',
      cargo: derechos.empleado.cargo_cet_nombre || derechos.empleado.cargo_onapre_nombre || '',
      dependencia: derechos.empleado.direccion_nombre || derechos.empleado.division_nombre || derechos.empleado.unidad_nombre || '',
      tipo_empleado: derechos.tipo_empleado,
      anios_antiguedad: derechos.anios_antiguedad,
      dias_disfrute_ley: derechos.dias_disfrute_ley,
      dias_base: derechos.dias_disfrute_ley,
      dias_acumulados: derechos.dias_acumulados,
      total_disponibles: derechos.total_disponibles,
      dias_solicitados: derechos.dias_solicitados,
      ya_pagado: derechos.ya_pagado,
      nuevo_acumulado: derechos.nuevo_acumulado,
      salario_diario: derechos.salario_diario,
      pago_modalidad_fija: derechos.pago_modalidad_fija,
      pago_modalidad_escala: derechos.pago_modalidad_escala,
      fecha_inicio: fechas.fecha_inicio,
      fecha_fin: fechas.fecha_fin,
      fecha_reincorporacion: fechas.fecha_reincorporacion
    }
  }

  static async registrarSolicitud(data) {
    const { empleado_id, fecha_inicio, dias_solicitados } = data
    if (!empleado_id || !fecha_inicio || !dias_solicitados) {
      throw new Error('Faltan datos requeridos: empleado, fecha inicio y días solicitados')
    }

    await this.mantenimientoDiario()

    const simulacion = await this.calcularSaldo(empleado_id, Number(dias_solicitados), fecha_inicio)
    if (simulacion.total_disponibles < Number(dias_solicitados)) {
      throw new Error(`Saldo insuficiente. Disponible: ${simulacion.total_disponibles}, solicitado: ${dias_solicitados}`)
    }

    const emp = await VacacionesModel.getDatosSalariales(empleado_id)
    if (!emp) throw new Error('Empleado no encontrado')

    const fechaIng = this.dateOnly(emp.fecha_ingreso)
    const hoy = this.dateOnly(new Date())
    const thisYear = new Date(hoy.getFullYear(), fechaIng.getMonth(), fechaIng.getDate())
    thisYear.setMonth(thisYear.getMonth() + 4)
    const fechaTope = this.toISODate(thisYear)

    let vacRecord = await VacacionesModel.getVacacionesRecord(empleado_id)
    let idVacaciones

    if (vacRecord) {
      idVacaciones = vacRecord.id_vacaciones
      await VacacionesModel.actualizarVacacion(idVacaciones, {
        fecha_tope: fechaTope,
        id_status_vacaciones: STATUS.PROGRAMADO
      })
    } else {
      idVacaciones = await VacacionesModel.crearVacacion({
        id_empleado: empleado_id,
        id_status_vacaciones: STATUS.PROGRAMADO,
        dias_acumulados: 0,
        fecha_tope: fechaTope,
        pagado: 0
      })
    }

    await VacacionesModel.crearFechaVacacion({
      id_vacaciones: idVacaciones,
      fecha_inicio: simulacion.fecha_inicio,
      fecha_fin: simulacion.fecha_fin,
      dias_habiles: Number(dias_solicitados),
      observaciones: `Programación administrativa (${dias_solicitados} días hábiles). Reincorporación: ${simulacion.fecha_reincorporacion || 'por definir'}`
    })

    return {
      ok: true,
      id_vacaciones: idVacaciones,
      id_status_vacaciones: STATUS.PROGRAMADO,
      fecha_inicio: simulacion.fecha_inicio,
      fecha_fin: simulacion.fecha_fin,
      fecha_reincorporacion: simulacion.fecha_reincorporacion,
      dias_solicitados: Number(dias_solicitados),
      pagos: {
        modalidad_fija: simulacion.pago_modalidad_fija,
        modalidad_escala: simulacion.pago_modalidad_escala
      },
      nuevo_acumulado: simulacion.nuevo_acumulado
    }
  }

  static async pagarBonoVacacional(empleadoId, vacacionesId) {
    const emp = await VacacionesModel.getDatosSalariales(empleadoId)
    if (!emp) throw new Error('Empleado no encontrado')

    const vacRecord = vacacionesId
      ? (await VacacionesModel.getHistorialVacaciones(empleadoId)).find(h => h.id_vacaciones === vacacionesId)
      : await VacacionesModel.getVacacionesRecord(empleadoId)
    if (!vacRecord) throw new Error('Registro de vacaciones no encontrado')

    const derechos = await this.calcularDerechosYLiquidacion(empleadoId, 0)
    const montoBono = derechos.pago_modalidad_fija.monto

    await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, { pagado: 1 })

    await pool.query(
      `INSERT INTO historial_salarios (empleado_id, fecha_pago, monto_neto, monto_bruto)
       VALUES (?, CURDATE(), ?, ?)`,
      [empleadoId, montoBono, montoBono]
    )

    return {
      ok: true,
      empleado_id: empleadoId,
      monto_bono: montoBono,
      salario_diario: derechos.salario_diario,
      referencia_pago: {
        modalidad_fija: derechos.pago_modalidad_fija,
        modalidad_escala: derechos.pago_modalidad_escala
      }
    }
  }

  static async procesarReintegro(empleadoId, fechaReintegro = null, observaciones = '') {
    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    if (!vacRecord) throw new Error('No existe registro de vacaciones para el empleado')

    const finReal = this.toISODate(fechaReintegro || new Date())
    const inicio = vacRecord.fecha_inicio || finReal
    const festivos = await FestivosModel.getAll()
    const diasConsumidos = this.contarDiasHabiles(inicio, finReal, festivos)

    if (vacRecord.id_fecha) {
      await VacacionesModel.actualizarFechaVacacion(vacRecord.id_fecha, {
        fecha_fin: finReal,
        dias_habiles: diasConsumidos,
        observaciones: observaciones || `Interrupción administrativa el ${finReal}`
      })
    }

    await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, { id_status_vacaciones: STATUS.REINTEGRO })
    await VacacionesModel.updateEstatusEmpleado(empleadoId, 9)

    const saldoActual = await this.calcularSaldo(empleadoId, 0)

    return {
      ok: true,
      empleado_id: empleadoId,
      id_status_vacaciones: STATUS.REINTEGRO,
      fecha_fin_real: finReal,
      dias_consumidos: diasConsumidos,
      saldo_restante: saldoActual.total_disponibles,
      mensaje: saldoActual.total_disponibles > 0
        ? `Reintegro procesado. Quedan ${saldoActual.total_disponibles} días pendientes por disfrutar.`
        : 'Reintegro procesado. Todos los días de vacaciones fueron consumidos.'
    }
  }

  static async procesarTermino(empleadoId) {
    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    if (!vacRecord) throw new Error('No existe registro de vacaciones para el empleado')
    await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, { id_status_vacaciones: STATUS.EN_ESPERA })
    await VacacionesModel.updateEstatusEmpleado(empleadoId, 1)
    return {
      ok: true,
      empleado_id: empleadoId,
      id_status_vacaciones: STATUS.EN_ESPERA,
      mensaje: 'Cierre forzoso aplicado correctamente.'
    }
  }

  /* ─── Perfil ───────────────────────────────────────────── */

  static async obtenerPerfil(empleadoId) {
    const perfil = await VacacionesModel.getPerfilEmpleado(empleadoId)
    if (!perfil) throw new Error('Empleado no encontrado')

    const historialVacaciones = await VacacionesModel.getHistorialVacaciones(empleadoId)
    const festivos = await FestivosModel.getAll()
    const anioActual = new Date().getFullYear()
    let diasConsumidosAnio = 0

    for (const h of historialVacaciones) {
      if (!h.fecha_inicio || !h.fecha_fin) continue
      if (new Date(h.fecha_inicio).getFullYear() !== anioActual) continue
      diasConsumidosAnio += h.dias_habiles != null ? Number(h.dias_habiles) : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos)
    }

    const empBase = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    const tipoEmp = this.normalizarTipo(empBase?.tipo_personal || 'FUNCIONARIO')
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    const { total_dias_disfrute: diasBase } = await this.calcularDiasDisfrute(aniosAntiguedad, tipoEmp)

    return {
      datos_personales: {
        empleado_id: perfil.empleado_id,
        cedula: perfil.cedula,
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        rif: perfil.rif,
        fecha_nacimiento: perfil.fecha_nacimiento,
        genero: perfil.genero,
        estado_civil: perfil.estado_civil,
        direccion_habitacion: perfil.direccion_habitacion,
        telefono_fijo: perfil.telefono_fijo,
        celular: perfil.celular,
        correo_principal: perfil.correo_principal,
        fecha_ingreso: perfil.fecha_ingreso,
        profesion: perfil.profesion_nombre,
        estatus: perfil.estatus_nombre,
        nro_cuenta_bancaria: perfil.nro_cuenta_bancaria
      },
      datos_laborales: {
        cargo_cet: perfil.cargo_cet_nombre,
        cargo_onapre: perfil.cargo_onapre_nombre,
        nivel_salarial: perfil.nivel_salarial_nombre,
        salario_base: Number(perfil.salario_base || 0),
        condicion_laboral: perfil.condicion_laboral_nombre,
        direccion: perfil.direccion_nombre,
        division: perfil.division_nombre,
        unidad: perfil.unidad_nombre,
        porcentaje_profesionalizacion: perfil.porcentaje_profesionalizacion
      },
      vacaciones: {
        dias_base_anual: diasBase,
        dias_consumidos_anio: diasConsumidosAnio,
        dias_pendientes: Math.max(0, diasBase - diasConsumidosAnio),
        historial: historialVacaciones.map(h => ({
          id_vacaciones: h.id_vacaciones,
          id_status_vacaciones: h.id_status_vacaciones,
          status_vacaciones_nombre: h.status_vacaciones_nombre,
          fecha_inicio: h.fecha_inicio,
          fecha_fin: h.fecha_fin,
          dias: h.dias_habiles != null ? Number(h.dias_habiles) : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos),
          observaciones: h.observaciones,
          pagado: Boolean(h.pagado)
        }))
      }
    }
  }

  static async getRecibo(empleadoId) {
    const emp = await VacacionesModel.getReciboData(empleadoId)
    if (!emp) throw new Error('Empleado no encontrado')

    const salarioBase = Number(emp.salario_base || 0)
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    const pctProf = Number(emp.porcentaje_profesionalizacion || 0) / 100
    const pctAntiguedad = Math.min(aniosAntiguedad * 0.02, 0.3)

    // Asignaciones individuales (para desglosar en el recibo)
    const sueldoBasico = salarioBase
    const primaAntiguedad = Number((salarioBase * pctAntiguedad / 2).toFixed(2))
    const primaProfesionalizacion = Number((salarioBase / 2 * pctProf).toFixed(2))
    const primaJerarquia = 0
    const primaTransporte = 150
    const primaReconocimiento = 0
    const primaHogares = 120
    const primaComplementoAlimentacion = 0
    const primaHijos = 0
    const difSueldoBasico = 0
    const difAntiguedad = 0
    const difProfesionalizacion = 0
    const difJerarquia = 0

    // Usar el mismo helper centralizado para el total mensual
    const totalSueldoMensual = this.calcularSalarioMensual(emp, aniosAntiguedad)
    const sueldoDiario = Number((totalSueldoMensual / 30).toFixed(2))
    const diasBonoVacacional = 220
    const bonoVacacional = Number((sueldoDiario * diasBonoVacacional).toFixed(2))

    return {
      empleado: {
        cedula: emp.cedula,
        nombres: emp.nombres,
        apellidos: emp.apellidos,
        fecha_ingreso: emp.fecha_ingreso,
        nro_cuenta_bancaria: emp.nro_cuenta_bancaria,
        cargo_cet: emp.cargo_cet_nombre,
        cargo_onapre: emp.cargo_onapre_nombre,
        salario_base: salarioBase,
        porcentaje_profesionalizacion: Number(emp.porcentaje_profesionalizacion),
        anios_antiguedad: aniosAntiguedad
      },
      lineas_recibo: {
        sueldo_basico: sueldoBasico,
        prima_antiguedad: primaAntiguedad,
        prima_profesionalizacion: primaProfesionalizacion,
        prima_jerarquia: primaJerarquia,
        prima_transporte: primaTransporte,
        prima_reconocimiento: primaReconocimiento,
        prima_hogares: primaHogares,
        prima_complemento_alimentacion: primaComplementoAlimentacion,
        prima_hijos: primaHijos,
        diferencia_sueldo_basico: difSueldoBasico,
        diferencia_antiguedad: difAntiguedad,
        diferencia_profesionalizacion: difProfesionalizacion,
        diferencia_jerarquia: difJerarquia,
        total_sueldo_mensual: totalSueldoMensual,
        sueldo_diario: sueldoDiario,
        dias_bono_vacacional: diasBonoVacacional,
        bono_vacacional: bonoVacacional
      },
      ultima_nomina: emp.fecha_pago ? {
        fecha_pago: emp.fecha_pago,
        monto_bruto: Number(emp.monto_bruto || 0),
        monto_neto: Number(emp.monto_neto || 0)
      } : null
    }
  }


  static async getDetalleNomina(empleadoId) {
    const emp = await VacacionesModel.getDatosSalariales(empleadoId)
    if (!emp) throw new Error('Empleado no encontrado')

    const ultimaNomina = await VacacionesModel.getUltimaNomina(empleadoId)

    const salarioBase = Number(emp.salario_base || 0)
    const salarioQuincenal = Number((salarioBase / 2).toFixed(2))
    const pctProf = Number(emp.porcentaje_profesionalizacion || 0) / 100
    const profesionalizacion = Number((salarioQuincenal * pctProf).toFixed(2))

    // Usa el Módulo 1 centralizado en vez del cálculo local con 365.25
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    const pctAntiguedad = Math.min(aniosAntiguedad * 0.02, 0.3)
    const antiguedad = Number((salarioQuincenal * pctAntiguedad).toFixed(2))

    const primaTransporte = 150.00
    const primaHogares = 120.00

    const totalAsignaciones = salarioQuincenal + antiguedad + profesionalizacion + primaTransporte + primaHogares
    const ivss = Number((totalAsignaciones * 0.04).toFixed(2))
    const faov = Number((totalAsignaciones * 0.01).toFixed(2))
    const rpe = Number((totalAsignaciones * 0.005).toFixed(2))
    const cajaAhorro = Number((salarioQuincenal * 0.1).toFixed(2))
    const totalDeducciones = Number((ivss + faov + rpe + cajaAhorro).toFixed(2))
    const salarioNeto = Number((totalAsignaciones - totalDeducciones).toFixed(2))

    return {
      empleado: {
        cedula: emp.cedula,
        nombres: emp.nombres,
        apellidos: emp.apellidos,
        cargo_cet: emp.cargo_cet_nombre,
        cargo_onapre: emp.cargo_onapre_nombre,
        nivel_salarial: emp.nivel_nombre,
        direccion: emp.direccion_nombre,
        cuenta_bancaria: emp.nro_cuenta_bancaria
      },
      asignaciones: {
        sueldo_quincenal: salarioQuincenal,
        antiguedad,
        profesionalizacion,
        prima_transporte: primaTransporte,
        prima_hogares: primaHogares,
        total_asignaciones: totalAsignaciones
      },
      deducciones: {
        ivss,
        faov,
        rpe,
        caja_ahorro: cajaAhorro,
        total_deducciones: totalDeducciones
      },
      salario_neto: salarioNeto,
      salario_base_mensual: salarioBase,
      ultima_nomina_procesada: ultimaNomina ? {
        fecha_pago: ultimaNomina.fecha_pago,
        monto_neto: Number(ultimaNomina.monto_neto),
        monto_bruto: Number(ultimaNomina.monto_bruto)
      } : null
    }
  }

  static async posponerVacaciones(empleadoId) {
    const empBase = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    if (!empBase) throw new Error('Empleado no encontrado')

    const tipo = this.normalizarTipo(empBase.tipo_personal)
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    const { total_dias_disfrute } = await this.calcularDiasDisfrute(aniosAntiguedad, tipo)

    const fechaIng = this.dateOnly(empBase.fecha_ingreso)
    const hoy = new Date()
    const thisYear = new Date(hoy.getFullYear(), fechaIng.getMonth(), fechaIng.getDate())
    thisYear.setMonth(thisYear.getMonth() + 4)
    const fechaTope = this.toISODate(thisYear)

    let vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)

    if (vacRecord) {
      const nuevosAcumulados = Number(vacRecord.dias_acumulados || 0) + total_dias_disfrute
      await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, {
        dias_acumulados: nuevosAcumulados,
        fecha_tope: fechaTope,
        id_status_vacaciones: STATUS.EN_ESPERA
      })
    } else {
      await VacacionesModel.crearVacacion({
        id_empleado: empleadoId,
        id_status_vacaciones: STATUS.EN_ESPERA,
        dias_acumulados: total_dias_disfrute,
        fecha_tope: fechaTope,
        pagado: 0
      })
    }

    return {
      ok: true,
      empleado_id: empleadoId,
      dias_acumulados: total_dias_disfrute,
      mensaje: `Vacaciones pospuestas. ${total_dias_disfrute} días acumulados para próximo período.`
    }
  }
}
