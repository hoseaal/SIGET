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

  /* ─── STEP 1: Cálculo de Antigüedad Total (en caliente) ── */

  /**
   * Calcula la antigüedad total desglosada en años, meses y días
   * sumando la antigüedad interna (desde fecha_ingreso) y todas
   * las antigüedades externas (registros_antiguedades).
   *
   * Regla de carry-over: 30 días = 1 mes, 12 meses = 1 año.
   *
   * @param {string}   fechaIngreso       Fecha ISO 'YYYY-MM-DD' de ingreso del empleado.
   * @param {Array}    registrosExternos  Array de { fecha_inicio, fecha_fin }.
   * @param {string|null} fechaRef        Fecha de referencia ISO (opcional, por defecto hoy).
   * @returns {{ anios_total: number, meses_total: number, dias_total: number, total_dias: number }}
   */
  static calcularAntiguedadTotal(fechaIngreso, registrosExternos = [], fechaRef = null) {
    const ref = this.dateOnly(fechaRef || new Date())
    const ingreso = this.dateOnly(fechaIngreso)
    if (!ingreso) throw new Error('Fecha de ingreso inválida')

    let totalDias = 0

    // Antigüedad interna: días desde fecha_ingreso hasta fechaRef (inclusive)
    const diffInterna = Math.floor((ref - ingreso) / (1000 * 60 * 60 * 24)) + 1
    totalDias += diffInterna

    // Antigüedad externa: suma de días de cada registro (inclusive)
    for (const reg of registrosExternos) {
      const inicio = this.dateOnly(reg.fecha_inicio)
      const fin = this.dateOnly(reg.fecha_fin || fechaRef || new Date())
      if (inicio && fin && fin >= inicio) {
        const diff = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
        totalDias += diff
      }
    }

    // Carry-over: 30 días → 1 mes, 12 meses → 1 año
    const aniosTotal = Math.floor(totalDias / 360)
    const mesesTotal = Math.floor((totalDias % 360) / 30)
    const diasTotal = totalDias % 30

    return {
      anios_total: aniosTotal,
      meses_total: mesesTotal,
      dias_total: diasTotal,
      total_dias: totalDias
    }
  }

  /**
   * Obtiene los datos del empleado desde la BD y ejecuta el cálculo completo.
   *
   * @param {number}      empleadoId
   * @param {string|null} fechaRef   Fecha de referencia ISO (opcional).
   * @returns {Promise<{ anios_total: number, meses_total: number, dias_total: number, total_dias: number }>}
   */
  static async calcularAntiguedadTotalEmpleado(empleadoId, fechaRef = null) {
    const data = await VacacionesModel.getDatosAntiguedadTotal(empleadoId)
    if (!data) throw new Error('Empleado no encontrado')
    return this.calcularAntiguedadTotal(data.fecha_ingreso, data.registros_externos, fechaRef)
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
    const primaMejoramientoEconomico = 0
    const difSueldoBasico = 0
    const difAntiguedad = 0
    const difProfesionalizacion = 0
    const difJerarquia = 0

    return Number((
      sueldoBasico + primaAntiguedad + primaProfesionalizacion + primaJerarquia +
      primaTransporte + primaReconocimiento + primaHogares + primaComplementoAlimentacion +
      primaHijos + primaMejoramientoEconomico + difSueldoBasico + difAntiguedad + difProfesionalizacion + difJerarquia
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
   *  STEP 2 — Matriz de Días Base (Evaluación de Fracciones)
   *
   *  Asigna días base según escalones de antigüedad total
   *  (anios_total, meses_total, dias_total).
   *
   *  Regla: el salto al siguiente escalón requiere un excedente
   *  mínimo de 1 mes (Meses_Total >= 1). Si solo hay días
   *  excedentes (Meses_Total == 0, Dias_Total > 0), permanece
   *  en el escalón anterior.
   * ─────────────────────────────────────────────────────────*/

  /**
   * Determina los días base según la matriz de escalones.
   *
   * ESCALONES (Regla de Fracciones Estrictas):
   *   CUALQUIER fracción (meses > 0 O días > 0) más allá del año
   *   exacto es suficiente para saltar al escalón superior.
   *
   * Escalón 1 (21): anios < 5 | anios == 5 && meses == 0 && dias == 0
   * Escalón 2 (24): anios == 5 && (meses > 0 || dias > 0) | 6-9
   *                 | anios == 10 && meses == 0 && dias == 0
   * Escalón 3 (27): anios == 10 && (meses > 0 || dias > 0) | 11-14
   *                 | anios == 15 && meses == 0 && dias == 0
   * Escalón 4 (31): anios == 15 && (meses > 0 || dias > 0) | anios > 15
   *
   * @param {number} anios_total
   * @param {number} meses_total
   * @param {number} dias_total
   * @returns {number} Días base correspondientes (21 | 24 | 27 | 31)
   */
  static calcularDiasBaseMatriz(anios_total, meses_total, dias_total) {
    // ─── Escalón 4 (TOPE: 31 días base) ──────────────────────────────
    // Más de 15 años → tope automático.
    // 15 años exactos CON fracción (meses > 0 o días > 0) → sube al 4.
    if (anios_total > 15) return 31
    if (anios_total === 15 && (meses_total > 0 || dias_total > 0)) return 31

    // ─── Escalón 3 (27 días base) ────────────────────────────────────
    // 15 años exactos SIN fracción → escalón 3.
    if (anios_total === 15 && meses_total === 0 && dias_total === 0) return 27

    // 11 a 14 años → automático escalón 3.
    if (anios_total >= 11 && anios_total <= 14) return 27

    // 10 años exactos CON fracción → sube al 3.
    if (anios_total === 10 && (meses_total > 0 || dias_total > 0)) return 27

    // ─── Escalón 2 (24 días base) ────────────────────────────────────
    // 10 años exactos SIN fracción → escalón 2.
    if (anios_total === 10 && meses_total === 0 && dias_total === 0) return 24

    // 6 a 9 años → automático escalón 2.
    if (anios_total >= 6 && anios_total <= 9) return 24

    // 5 años exactos CON fracción → sube al 2.
    if (anios_total === 5 && (meses_total > 0 || dias_total > 0)) return 24

    // ─── Escalón 1 (21 días base - default) ─────────────────────────
    return 21
  }

  /* ─────────────────────────────────────────────────────────
   *  STEP 3 — Días Adicionales y Tope Máximo
   *
   *  Dias_Adicionales = Anios_Total - 1, tope 15.
   *  Dias_Totales_Disfrute = Dias_Base + Dias_Adicionales.
   *  Techo absoluto: 46 días (31 base + 15 adicionales).
   * ─────────────────────────────────────────────────────────*/

  /**
   * Calcula días adicionales, total de disfrute y aplica tope máximo.
   *
   * @param {number} anios_total
   * @param {number} meses_total
   * @param {number} dias_total
   * @returns {{ dias_base: number, dias_adicionales: number, total_dias_disfrute: number }}
   */
  static calcularDiasDisfruteTotal(anios_total, meses_total, dias_total) {
    // Paso 1: Determinar el escalón de días base según la matriz
    // de fracciones (STEP 2). Evalúa anios_total y meses_total
    // para asignar 21, 24, 27 o 31 días base.
    const diasBase = this.calcularDiasBaseMatriz(anios_total, meses_total, dias_total)

    // Paso 2: Calcular días adicionales por antigüedad.
    // Fórmula: Anios_Total - 1 (se empieza a contar desde el 2do año).
    // Se usa Math.max(..., 0) para evitar negativos en empleados
    // con menos de 1 año (Anios_Total = 0 → 0 - 1 = -1 → se lleva a 0).
    // Tope máximo de 15 días adicionales (se alcanza a los 16 años:
    // 16 - 1 = 15; a partir de allí no incrementa más).
    const diasAdicionales = Math.min(Math.max(anios_total - 1, 0), 15)

    // Paso 3: Sumar base + adicionales y aplicar techo absoluto
    // de 46 días (31 base + 15 adicionales = 46). Bajo ninguna
    // circunstancia se puede exceder este límite.
    const total = Math.min(diasBase + diasAdicionales, 46)

    return {
      dias_base: diasBase,
      dias_adicionales: diasAdicionales,
      total_dias_disfrute: total
    }
  }

  /* ─────────────────────────────────────────────────────────
   *  STEP 4 — Proyección Completa de Vacaciones
   *
   *  Orquesta STEP 1 → 2 → 3 → 4 en una sola llamada.
   *  1. Calcula antigüedad total (años, meses, días).
   *  2. Evalúa matriz de días base según fracciones.
   *  3. Suma días adicionales con tope.
   *  4. Proyecta en calendario hábil (sin sábados, domingos ni festivos).
   * ─────────────────────────────────────────────────────────*/

  /**
   * Cálculo completo y proyección de vacaciones para un funcionario.
   * Integra los 4 pasos del algoritmo en una única operación.
   *
   * @param {number} empleadoId
   * @param {string} fechaInicio  Fecha ISO 'YYYY-MM-DD' de inicio deseado.
   * @returns {Promise<Object>}
   */
  static async proyectarVacaciones(empleadoId, fechaInicio) {
    if (!empleadoId) throw new Error('empleado_id es requerido')
    if (!fechaInicio) throw new Error('fecha_inicio es requerida')

    // ── STEP 1: Antigüedad Total ──────────────────────────────
    const ant = await this.calcularAntiguedadTotalEmpleado(empleadoId, fechaInicio)

    // ── STEP 2 + 3: Días Base + Adicionales + Tope ────────────
    const { dias_base, dias_adicionales, total_dias_disfrute } =
      this.calcularDiasDisfruteTotal(ant.anios_total, ant.meses_total, ant.dias_total)

    // ── STEP 4: Proyección en Calendario Hábil ────────────────
    // Obtiene los días feriados registrados en el sistema.
    const festivos = await FestivosModel.getAll()

    // Proyecta los total_dias_disfrute en el calendario a partir
    // de fechaInicio, omitiendo sábados, domingos y feriados.
    // Retorna fecha_fin (último día de vacaciones) y
    // fecha_reincorporacion (primer día hábil posterior).
    const { fecha_fin, fecha_reincorporacion } =
      this.proyectarFechasCalendario(fechaInicio, total_dias_disfrute, festivos)

    return {
      empleado_id: empleadoId,
      antiguedad: {
        anios_total: ant.anios_total,
        meses_total: ant.meses_total,
        dias_total: ant.dias_total,
        total_dias: ant.total_dias
      },
      dias_base,
      dias_adicionales,
      total_dias_disfrute,
      fecha_inicio: fechaInicio,
      fecha_fin,
      fecha_reincorporacion
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
   *  ENDPOINT PRINCIPAL — POST /api/rrhh/vacaciones/calcular
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

    // ── Paso 2: Antigüedad Detallada (Módulo 1) ─────────────────────
    // Calcula antigüedad desglosada en años, meses y días con carry-over
    // (30 días → 1 mes, 12 meses → 1 año), usando la función centralizada.
    const ant = await this.calcularAntiguedadTotalEmpleado(empleadoId, fechaInicio)

    // ── Paso 3: Días de disfrute con Matriz de Escalones (Módulo 2) ─
    // Usa calcularDiasDisfruteTotal que evalúa la matriz de escalones
    // (STEP 2) y los adicionales (STEP 3) con manejo de fracciones.
    let dias_base, dias_adicionales, total_dias_disfrute

    if (tipo === 'funcionario') {
      const calc = this.calcularDiasDisfruteTotal(ant.anios_total, ant.meses_total, ant.dias_total)
      dias_base = calc.dias_base
      dias_adicionales = calc.dias_adicionales
      total_dias_disfrute = calc.total_dias_disfrute
    } else {
      // Obreros: tabla fija por año (no aplica matriz ni adicionales)
      const calc = await this.calcularDiasDisfrute(ant.anios_total, tipo)
      dias_base = calc.dias_base
      dias_adicionales = 0
      total_dias_disfrute = calc.total_dias_disfrute
    }

    // ── Paso 4: Proyección de fechas (Módulo 3) ─────────────────────
    const festivos = await FestivosModel.getAll()
    const { fecha_fin, fecha_reincorporacion } =
      this.proyectarFechasCalendario(fechaInicio, total_dias_disfrute, festivos)

    return {
      tipo_personal:          empBase.tipo_personal,
      antiguedad_anios:       ant.anios_total,
      antiguedad_meses:       ant.meses_total,
      antiguedad_dias:        ant.dias_total,
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

    // Obtener antigüedad detallada
    const ant = await this.calcularAntiguedadTotalEmpleado(empleadoId, fechaRef)
    const aniosAntiguedad = ant.anios_total

    // Lee tipo_personal desde la BD (Módulo 2)
    const empBase  = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    const tipoEmp  = this.normalizarTipo(empBase?.tipo_personal || 'FUNCIONARIO')

    // Calcular días de disfrute según el tipo de empleado
    let dias_base, dias_adicionales, total_dias_disfrute
    if (tipoEmp === 'funcionario') {
      const calc = this.calcularDiasDisfruteTotal(ant.anios_total, ant.meses_total, ant.dias_total)
      dias_base = calc.dias_base
      dias_adicionales = calc.dias_adicionales
      total_dias_disfrute = calc.total_dias_disfrute
    } else {
      const calc = await this.calcularDiasDisfrute(aniosAntiguedad, tipoEmp)
      dias_base = calc.dias_base
      dias_adicionales = calc.dias_adicionales
      total_dias_disfrute = calc.total_dias_disfrute
    }

    const festivos = await FestivosModel.getAll()
    const config   = await VacacionesModel.getConfiguracionVacaciones(
      tipoEmp === 'obrero' ? Math.min(Math.max(aniosAntiguedad, 1), 16) : aniosAntiguedad,
      tipoEmp
    )

    const diasDisfruteLey = total_dias_disfrute
    const diasPagoEscala  = Number(config?.pago || diasDisfruteLey)

    const historial = await VacacionesModel.getHistorialVacaciones(empleadoId)
    const anioActual = new Date().getFullYear()
    let diasConsumidos = 0
    let diasReintegrados = 0

    // ID del periodo actual de vacaciones si existe
    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    const currentVacId = vacRecord?.id_vacaciones

    for (const h of historial) {
      // Solo evaluar los tramos correspondientes al periodo actual de vacaciones
      if (currentVacId && h.id_vacaciones !== currentVacId) continue

      const diasHist = h.dias_habiles != null ? Number(h.dias_habiles) : (h.fecha_inicio && h.fecha_fin ? this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos) : 0)

      if (h.id_status_vacaciones === STATUS.PROGRAMADO || h.id_status_vacaciones === STATUS.DE_DISFRUTE || h.id_status_vacaciones === STATUS.FINALIZADO) {
        diasConsumidos += diasHist
      } else if (h.id_status_vacaciones === STATUS.REINTEGRO) {
        diasReintegrados += diasHist
      }
    }

    const diasAcumulados = Number(vacRecord?.dias_acumulados || 0)
    const diasTotalesPeriodo = diasDisfruteLey + diasAcumulados
    const saldoDisponibleReal = Math.max(0, diasTotalesPeriodo - diasConsumidos + diasReintegrados)

    // La validación de saldo se realiza en registrarSolicitud, no aquí,
    // para que calcular-saldo siempre pueda retornar el saldo real al frontend.

    // ── APLICAR ALGORITMO DE SACRIFICIO ─────────────────────────
    // consume primero acumulados; después toca el período actual.
    const {
      acumuladosConsumidosHistorial,
      acumuladosConsumidosSolicitud,
      periodoConsumidosSolicitud,
      nuevoAcumulado
    } = this._aplicarSacrificio(
      diasAcumulados,        // saldo arrastrado de periodos previos
      diasDisfruteLey,       // días base del período actual
      diasConsumidos,        // días ya consumidos en el historial
      diasReintegrados,      // días devueltos por reintegro
      diasSolicitados        // días de la nueva solicitud
    )
    // nuevoAcumulado será 0 si la solicitud agotó todos los acumulados

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
      dias_consumidos: diasConsumidos,
      dias_reintegrados: diasReintegrados,
      dias_totales_periodo: diasTotalesPeriodo,
      saldo_disponible_real: saldoDisponibleReal,
      total_disponibles: saldoDisponibleReal,
      dias_solicitados: Number(diasSolicitados || 0),
      // ── SACRIFICIO: desglose de consumo por bucket ──────────
      dias_acumulados_consumidos_historial: acumuladosConsumidosHistorial,
      dias_acumulados_consumidos_solicitud: acumuladosConsumidosSolicitud,
      dias_periodo_consumidos_solicitud: periodoConsumidosSolicitud,
      nuevo_acumulado: nuevoAcumulado,
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

  /* ─── Algoritmo de Sacrificio ──────────────────────────── */

  /**
   * APLICA LA PRIORIDAD DE CONSUMO ("SACRIFICIO") SOBRE LOS DÍAS DISPONIBLES.
   *
   * REGLA DE NEGOCIO:
   *   Los días acumulados de períodos anteriores se consumen SIEMPRE PRIMERO.
   *   Sólo cuando se agotan se empieza a descontar del período actual.
   *
   * ── ARGUMENTOS ─────────────────────────────────────────────────────────
   * @param {number}  diasAcumulados     Saldo de días arrastrados de periodos previos (vacaciones.dias_acumulados).
   * @param {number}  diasDisfruteLey    Días base del período actual (disfrute_ley).
   * @param {number}  diasConsumidos     Total de días ya consumidos en el historial del período actual.
   * @param {number}  diasReintegrados   Total de días reintegrados (devueltos) en el período actual.
   * @param {number}  diasSolicitados    Días que se solicitan en esta nueva petición.
   * @returns {{ acumuladosConsumidosHistorial: number,
   *             acumuladosConsumidosSolicitud: number,
   *             periodoConsumidosSolicitud: number,
   *             nuevoAcumulado: number }}
   *
   * ── ALGORITMO ──────────────────────────────────────────────────────────
   *
   *   FASE 1 — CÓMPUTO HISTÓRICO:
   *     Se calcula cuántos días del historial (solicitudes previas dentro del
   *     mismo período) excedieron los días de disfrute base. Ese excedente
   *     se considera consumido del bucket de acumulados.
   *
   *     excesoConsumoSobreLey = MAX(0, consumidos - reintegrados - disfrute_ley)
   *     acumuladosConsumidosHistorial = MIN(acumulados, exceso)
   *     acumuladosRestantes = acumulados - acumuladosConsumidosHistorial
   *
   *   FASE 2 — SOLICITUD ACTUAL:
   *     a) Si dias_solicitados <= acumulados_restantes:
   *          → Todo se descuenta de acumulados.
   *          → nuevo_acumulado = acumulados_restantes - solicitados (puede quedar > 0)
   *          → periodo_afectado = 0
   *
   *     b) Si dias_solicitados > acumulados_restantes:
   *          → Se consumen TODOS los acumulados restantes (nuevo_acumulado = 0)
   *          → El excedente se descuenta del período actual.
   *          → excedente = solicitados - acumulados_restantes
   *          → periodo_afectado = excedente
   *
   *   FASE 3 — PERSISTENCIA:
   *     nuevo_acumulado se persiste en vacaciones.dias_acumulados.
   *     Si se consumió todo, nuevo_acumulado = 0.
   *     Esto evita duplicidad de saldos en ciclos futuros.
   */
  static _aplicarSacrificio(diasAcumulados, diasDisfruteLey, diasConsumidos, diasReintegrados, diasSolicitados) {

    // ── FASE 1: Cómputo del consumo histórico sobre acumulados ──────────
    // El excedente del historial (consumido - reintegrado - ley) se cobra
    // de los acumulados primero.
    const excesoConsumoSobreLey = Math.max(0, diasConsumidos - diasReintegrados - diasDisfruteLey)
    const acumuladosConsumidosHistorial = Math.min(diasAcumulados, excesoConsumoSobreLey)
    const acumuladosRestantesPreSolicitud = diasAcumulados - acumuladosConsumidosHistorial

    // ── FASE 2: Sacrificio de la solicitud actual ──────────────────────
    // Se descuentan los días solicitados de los acumulados restantes.
    // Sólo el excedente (si lo hay) toca el período actual.
    const acumuladosConsumidosSolicitud = Math.min(acumuladosRestantesPreSolicitud, diasSolicitados)
    const periodoConsumidosSolicitud = diasSolicitados - acumuladosConsumidosSolicitud

    // ── FASE 3: Nuevo saldo de acumulados ──────────────────────────────
    // Si los solicitados superaron los acumulados → nuevo_acumulado = 0.
    // Si no → nuevo_acumulado = lo que sobre.
    const nuevoAcumulado = Math.max(0, acumuladosRestantesPreSolicitud - acumuladosConsumidosSolicitud)

    return {
      acumuladosConsumidosHistorial,
      acumuladosConsumidosSolicitud,
      periodoConsumidosSolicitud,
      nuevoAcumulado   // ← Puede ser 0 si se agotaron todos los acumulados
    }
  }

  /* ─── Alertas + Mantenimiento Diario ───────────────────── */

  static async mantenimientoDiario(force = false) {
    const hoy = this.toISODate(new Date())
    if (!force && this.ultimaEjecucionMantenimiento === hoy) return { skipped: true, date: hoy }

    // ── 1. PROGRAMADO → DE_DISFRUTE ──────────────────────────
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

    // ── 2. PROGRAMADO / DE_DISFRUTE → FINALIZADO ─────────────
    // Marca como finalizadas las vacaciones cuya fecha_fin ya pasó
    // y actualiza fecha_proximo_derecho del empleado = fecha_tope + 1 año.
    await pool.query(`
      UPDATE vacaciones v
      INNER JOIN fechas_vacaciones fv ON fv.id_fecha = (
        SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
      )
      INNER JOIN empleados e ON v.id_empleado = e.empleado_id
      SET v.id_status_vacaciones = ?,
          e.fecha_proximo_derecho = COALESCE(DATE_ADD(v.fecha_tope, INTERVAL 1 YEAR), e.fecha_proximo_derecho)
      WHERE v.id_status_vacaciones IN (?, ?)
        AND fv.fecha_fin < CURDATE()
    `, [STATUS.FINALIZADO, STATUS.PROGRAMADO, STATUS.DE_DISFRUTE])

    // ── 3. REACTIVACIÓN DE ALERTAS TRAS EL DISFRUTE ─────────
    // Por cada vacación recién finalizada, calcula el remanente de días
    // usando la lógica de sacrificio centralizada y lo persiste en
    // dias_acumulados. Esto asegura que el próximo ciclo parta con el
    // saldo correcto y las alertas se reactiven (el funcionario vuelve
    // a ser candidato para nuevo derecho en el período siguiente).
    //
    // Estrategia: se consultan los IDs de las vacaciones cuyo estatus
    // cambió hoy a FINALIZADO y se procesan individualmente con la
    // misma función calcularDerechosYLiquidacion que usa el resto del
    // sistema, garantizando consistencia.
    try {
      const [finalizadosHoy] = await pool.query(`
        SELECT v.id_vacaciones, v.id_empleado
        FROM vacaciones v
        INNER JOIN fechas_vacaciones fv ON fv.id_fecha = (
          SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
        )
        WHERE v.id_status_vacaciones = ?
          AND fv.fecha_fin < CURDATE()
          AND fv.fecha_fin >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
      `, [STATUS.FINALIZADO])

      for (const f of finalizadosHoy) {
        try {
          const derechos = await this.calcularDerechosYLiquidacion(f.id_empleado, 0)
          // Persiste el balance final de acumulados post-sacrificio.
          // Si el empleado consumió más días del período actual de los
          // que había disponibles (excedente), esos días se descontaron
          // de los acumulados. Si se agotaron todos, nuevo_acumulado = 0.
          // Esto evita arrastrar saldos fantasma al siguiente ciclo.
          await pool.query(
            'UPDATE vacaciones SET dias_acumulados = ? WHERE id_vacaciones = ?',
            [derechos.nuevo_acumulado, f.id_vacaciones]
          )
        } catch (errInner) {
          console.warn(`[MANTENIMIENTO] Error actualizando acumulados para empleado ${f.id_empleado}: ${errInner.message}`)
        }
      }
    } catch (err) {
      console.warn('[MANTENIMIENTO] Error en reactivación de alertas:', err.message)
    }

    // ── 4. Estatus empleado: DE_DISFRUTE → estatus 8 ────────
    await pool.query(`
      UPDATE empleados e
      INNER JOIN vacaciones v ON v.id_empleado = e.empleado_id
      SET e.estatus_id = 8
      WHERE v.id_status_vacaciones = ?
        AND e.estatus_id <> 8
    `, [STATUS.DE_DISFRUTE])

    // ── 5. FINALIZADO / REINTEGRO / EN_ESPERA → estatus 1 ──
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

      // Antigüedad desglosada (años, meses, días)
      const ant = await this.calcularAntiguedadTotalEmpleado(row.empleado_id)

      row.antiguedad_anios = ant.anios_total
      row.antiguedad_meses = ant.meses_total
      row.antiguedad_dias = ant.dias_total
      row.dias_usados_anio = usadosAnio
      row.dias_pendientes_disfrute = Math.max(0, derechos.dias_disfrute_ley - usadosAnio)
      row.dias_pendientes = Math.max(0, derechos.dias_disfrute_ley + Number(row.dias_acumulados || 0) - usadosAnio)
      row.dias_acumulados_consumidos_historial = derechos.dias_acumulados_consumidos_historial
      row.dias_acumulados_consumidos_solicitud = derechos.dias_acumulados_consumidos_solicitud
      row.dias_periodo_consumidos_solicitud = derechos.dias_periodo_consumidos_solicitud
      row.nuevo_acumulado = derechos.nuevo_acumulado
      if (row.estado_vacaciones !== 'por_derecho') {
        row.estado_vacaciones = this.mapStatusKey(Number(row.id_status_vacaciones))
      }
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
    let fechas = { fecha_inicio: this.toISODate(fechaInicio), fecha_fin: null, fecha_reincorporacion: null, fecha_finalizacion_real: null }
    if (fechaInicio && Number(diasSolicitados) > 0) {
      fechas = await this.calcularFechasDisfrute(fechaInicio, diasSolicitados)
      const proyeccionTotal = await this.calcularFechasDisfrute(fechaInicio, derechos.dias_totales_periodo)
      fechas.fecha_finalizacion_real = proyeccionTotal.fecha_fin
    } else if (fechaInicio) {
      const proyeccionTotal = await this.calcularFechasDisfrute(fechaInicio, derechos.dias_totales_periodo)
      fechas.fecha_finalizacion_real = proyeccionTotal.fecha_fin
    }

    const ant = await this.calcularAntiguedadTotalEmpleado(empleadoId)

    return {
      empleado_id: empleadoId,
      cedula: derechos.empleado.cedula || '',
      nombres: derechos.empleado.nombres || '',
      apellidos: derechos.empleado.apellidos || '',
      cargo: derechos.empleado.cargo_cet_nombre || derechos.empleado.cargo_onapre_nombre || '',
      dependencia: derechos.empleado.direccion_nombre || derechos.empleado.division_nombre || derechos.empleado.unidad_nombre || '',
      tipo_empleado: derechos.tipo_empleado,
      anios_antiguedad: derechos.anios_antiguedad,
      antiguedad_anios: ant.anios_total,
      antiguedad_meses: ant.meses_total,
      antiguedad_dias: ant.dias_total,
      dias_disfrute_ley: derechos.dias_disfrute_ley,
      dias_base: derechos.dias_disfrute_ley,
      dias_acumulados: derechos.dias_acumulados,
      dias_acumulados_consumidos_historial: derechos.dias_acumulados_consumidos_historial,
      dias_acumulados_consumidos_solicitud: derechos.dias_acumulados_consumidos_solicitud,
      dias_periodo_consumidos_solicitud: derechos.dias_periodo_consumidos_solicitud,
      dias_totales_periodo: derechos.dias_totales_periodo,
      saldo_disponible_real: derechos.saldo_disponible_real,
      total_disponibles: derechos.saldo_disponible_real,
      dias_solicitados: derechos.dias_solicitados,
      ya_pagado: derechos.ya_pagado,
      nuevo_acumulado: derechos.nuevo_acumulado,
      salario_diario: derechos.salario_diario,
      pago_modalidad_fija: derechos.pago_modalidad_fija,
      pago_modalidad_escala: derechos.pago_modalidad_escala,
      fecha_inicio: fechas.fecha_inicio,
      fecha_fin: fechas.fecha_fin,
      fecha_reincorporacion: fechas.fecha_reincorporacion,
      fecha_finalizacion_real: fechas.fecha_finalizacion_real
    }
  }

  static async registrarSolicitud(data) {
    const { empleado_id, fecha_inicio, dias_solicitados, observaciones } = data
    if (!empleado_id || !fecha_inicio || !dias_solicitados) {
      throw new Error('Faltan datos requeridos: empleado, fecha inicio y días solicitados')
    }

    await this.mantenimientoDiario()

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // BLOQUEO EXCLUSIVO (Previene Condiciones de Carrera en consultas concurrentes)
      await connection.query('SELECT empleado_id FROM empleados WHERE empleado_id = ? FOR UPDATE', [empleado_id])

      // Paso A, B, y C integrados: Calcular Saldo Dinámico
      const simulacion = await this.calcularSaldo(empleado_id, Number(dias_solicitados), fecha_inicio)
      
      // Paso D: Validación Crítica
      if (simulacion.total_disponibles < Number(dias_solicitados)) {
        throw new Error(`Acción denegada. Los días solicitados superan el saldo disponible actual (${simulacion.total_disponibles} días).`)
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

      const hoyStr = this.toISODate(hoy)
      const statusAsignar = simulacion.fecha_inicio <= hoyStr ? STATUS.DE_DISFRUTE : STATUS.PROGRAMADO

      if (vacRecord) {
        idVacaciones = vacRecord.id_vacaciones
        // PERSISTE EL NUEVO BALANCE POST-SACRIFICIO:
        //   - fecha_tope          = aniversario + 4 meses (inicio del nuevo período)
        //   - id_status_vacaciones = PROGRAMADO o DE_DISFRUTE
        //   - dias_acumulados     = nuevo_acumulado calculado por _aplicarSacrificio()
        //     → Si la solicitud agotó todos los acumulados, aquí se guarda 0
        //     → Garantiza que no haya duplicidad de saldos en ciclos futuros
        await connection.query(
          `UPDATE vacaciones SET fecha_tope = ?, id_status_vacaciones = ?, dias_acumulados = ? WHERE id_vacaciones = ?`,
          [fechaTope, statusAsignar, simulacion.nuevo_acumulado, idVacaciones]
        )
      } else {
        // Primer registro de vacaciones para este empleado:
        //   - dias_acumulados = nuevo_acumulado (0 si solicitó más de lo acumulado)
        const [result] = await connection.query(
          `INSERT INTO vacaciones (id_empleado, id_status_vacaciones, dias_acumulados, fecha_tope, pagado) VALUES (?, ?, ?, ?, ?)`,
          [empleado_id, statusAsignar, simulacion.nuevo_acumulado, fechaTope, 0]
        )
        idVacaciones = result.insertId
      }

      let obsFinal = observaciones ? observaciones.trim() : ''
      if (!obsFinal) {
        let base = simulacion.dias_base || 0
        let adicionales = simulacion.dias_adicionales || 0
        
        if (simulacion.tipo_empleado === 'funcionario') {
          const calc = this.calcularDiasDisfruteTotal(
            simulacion.antiguedad_anios, 
            simulacion.antiguedad_meses, 
            simulacion.antiguedad_dias
          )
          base = calc.dias_base
          adicionales = calc.dias_adicionales
        }

        const acumulados = simulacion.dias_acumulados || 0
        const totalDias = simulacion.dias_totales_periodo || 0

        // Helper para convertir numeros menores a 100 a letras
        const numeroALetras = (num) => {
          const unidades = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
          const decenas = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
          if (num < 30) return unidades[num] || num.toString()
          const d = Math.floor(num / 10)
          const u = num % 10
          if (u === 0) return decenas[d]
          return decenas[d] + ' y ' + unidades[u]
        }

        // Calcular periodo
        const dIngreso = emp.fecha_ingreso ? new Date(emp.fecha_ingreso) : new Date()
        const hoyDate = new Date()
        let pAnio = hoyDate.getFullYear()
        const mIngreso = dIngreso.getMonth()
        const mActual = hoyDate.getMonth()
        const mCumple = (mIngreso + 4) % 12
        if (mActual < mCumple) pAnio = hoyDate.getFullYear() - 1

        const baseStr = base.toString().padStart(2, '0')
        const adicStr = adicionales.toString().padStart(2, '0')
        const periodoStr = `${pAnio}-${pAnio + 1}`

        obsFinal = `${baseStr}+${adicStr} dias habiles del periodo vacacional ${periodoStr}`
        if (acumulados > 0) {
          const letrasAcu = numeroALetras(acumulados)
          const numAcu = acumulados.toString().padStart(2, '0')
          obsFinal += `, adicionalmente ${letrasAcu} (${numAcu}) dias habiles de periodos vacacionales`
        }
        const letrasTot = numeroALetras(totalDias)
        const numTot = totalDias.toString().padStart(2, '0')
        obsFinal += `, para un total de ${letrasTot}(${numTot}) dias habiles`
      }

      await connection.query(
        `INSERT INTO fechas_vacaciones
           (id_vacaciones, fecha_inicio, fecha_fin, dias_habiles, id_status_vacaciones, observaciones,
            fecha_finalizacion_real, fecha_reintegro_laboral)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idVacaciones,
          simulacion.fecha_inicio,
          simulacion.fecha_fin,
          Number(dias_solicitados),
          statusAsignar,
          obsFinal,
          simulacion.fecha_finalizacion_real, // ✔ Proyección de días totales (inmutable)
          simulacion.fecha_reincorporacion    // ✔ Primer día hábil tras la fracción actual
        ]
      )

      await connection.commit()
      return {
        ok: true,
        id_vacaciones: idVacaciones,
        id_status_vacaciones: statusAsignar,
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
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
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
      `INSERT INTO historial_salarios_legacy (empleado_id, fecha_pago, monto_neto, monto_bruto)
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

    const diasOriginales = vacRecord.dias_habiles != null
      ? Number(vacRecord.dias_habiles)
      : (vacRecord.fecha_fin ? this.contarDiasHabiles(inicio, vacRecord.fecha_fin, festivos) : diasConsumidos)

    const diasPendientes = Math.max(0, diasOriginales - diasConsumidos)

    const finalObs = observaciones ? observaciones.trim() : `[Reintegro automático del sistema]`

    // Insertar un nuevo registro de reintegro en vez de mutar la solicitud original
    await VacacionesModel.crearFechaVacacion({
      id_vacaciones: vacRecord.id_vacaciones,
      fecha_inicio: finReal,
      fecha_fin: vacRecord.fecha_fin || finReal,
      dias_habiles: diasPendientes,
      id_status_vacaciones: STATUS.REINTEGRO,
      observaciones: finalObs
    })

    // Actualizamos el estatus global de la vacación a REINTEGRO, pero NO alteramos dias_acumulados
    // ya que el nuevo endpoint suma los dias_habiles de los registros de reintegro dinámicamente.
    await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, {
      id_status_vacaciones: STATUS.REINTEGRO
    })
    
    await VacacionesModel.updateEstatusEmpleado(empleadoId, 9)

    // Reinicia el ciclo de alertas: fecha_proximo_derecho = fecha_tope + 1 año
    await VacacionesModel.updateFechaProximoDerecho(empleadoId, vacRecord.fecha_tope)

    const saldoActual = await this.calcularSaldo(empleadoId, 0)

    return {
      ok: true,
      empleado_id: empleadoId,
      id_status_vacaciones: STATUS.REINTEGRO,
      fecha_fin_real: finReal,
      dias_consumidos: diasConsumidos,
      saldo_restante: saldoActual.saldo_disponible_real,
      mensaje: saldoActual.saldo_disponible_real > 0
        ? `Reintegro procesado. Quedan ${saldoActual.saldo_disponible_real} días pendientes por disfrutar.`
        : 'Reintegro procesado. Todos los días de vacaciones fueron consumidos.'
    }
  }

  static async procesarTermino(empleadoId) {
    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    if (!vacRecord) throw new Error('No existe registro de vacaciones para el empleado')
    await VacacionesModel.actualizarVacacion(vacRecord.id_vacaciones, { id_status_vacaciones: STATUS.EN_ESPERA })
    await VacacionesModel.updateEstatusEmpleado(empleadoId, 1)

    // Reinicia el ciclo de alertas: fecha_proximo_derecho = fecha_tope + 1 año
    await VacacionesModel.updateFechaProximoDerecho(empleadoId, vacRecord.fecha_tope)

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
      const diasHist = h.dias_habiles != null ? Number(h.dias_habiles) : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos)
      
      if (Number(h.id_status_vacaciones) === STATUS.REINTEGRO) {
        diasConsumidosAnio -= diasHist
      } else if ([STATUS.PROGRAMADO, STATUS.DE_DISFRUTE, STATUS.FINALIZADO].includes(Number(h.id_status_vacaciones))) {
        diasConsumidosAnio += diasHist
      }
    }

    const empBase = await VacacionesModel.getEmpleadoTipoPersonal(empleadoId)
    const tipoEmp = this.normalizarTipo(empBase?.tipo_personal || 'FUNCIONARIO')
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    const ant = await this.calcularAntiguedadTotalEmpleado(empleadoId)
    const { total_dias_disfrute: diasBase } = await this.calcularDiasDisfrute(aniosAntiguedad, tipoEmp)

    return {
      antiguedad: {
        anios: ant.anios_total,
        meses: ant.meses_total,
        dias: ant.dias_total
      },
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
        historial: historialVacaciones.map(h => {
          const idStatus = Number(h.id_status_vacaciones)
          const diasHist = h.dias_habiles != null
            ? Number(h.dias_habiles)
            : this.contarDiasHabiles(h.fecha_inicio, h.fecha_fin, festivos)

          const obs = h.observaciones || ''
          const esReintegro = idStatus === STATUS.REINTEGRO ||
            obs.includes('Reintegro') || obs.includes('Interrupción')

          let diasPendientes = 0
          let diasConsumidos = diasHist

          if (esReintegro) {
            diasPendientes = diasHist
            diasConsumidos = 0
            
            const matchPend = obs.match(/Pendientes: (\d+)/)
            if (matchPend) diasPendientes = Number(matchPend[1])
          }

          return {
            id_vacaciones: h.id_vacaciones,
            id_status_vacaciones: idStatus,
            nombre_status: h.nombre_status || '',
            fecha_inicio: h.fecha_inicio,
            fecha_fin: h.fecha_fin,
            dias_consumidos: diasConsumidos,
            es_reintegro: esReintegro,
            dias_pendientes: diasPendientes,
            observaciones: obs
          }
        })
      }
    }
  }

  static async getRecibo(empleadoId) {
    const emp = await VacacionesModel.getReciboData(empleadoId)
    if (!emp) throw new Error('Empleado no encontrado')

    const salarioBase = Number(emp.salario_base || 0)
    const aniosAntiguedad = await VacacionesModel.getAntiguedadEmpleado(empleadoId)
    let ant
    let antExternal = { anios_total: 0, meses_total: 0, dias_total: 0 }
    try {
      ant = await this.calcularAntiguedadTotalEmpleado(empleadoId)
      // Calcular antigüedad SOLO de registros externos (otras instituciones)
      const datosAnt = await VacacionesModel.getDatosAntiguedadTotal(empleadoId)
      if (datosAnt && datosAnt.registros_externos && datosAnt.registros_externos.length > 0) {
        let totalDiasExt = 0
        for (const reg of datosAnt.registros_externos) {
          const inicio = this.dateOnly(reg.fecha_inicio)
          const fin = this.dateOnly(reg.fecha_fin || new Date())
          if (inicio && fin && fin >= inicio) {
            totalDiasExt += Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
          }
        }
        antExternal = {
          anios_total: Math.floor(totalDiasExt / 360),
          meses_total: Math.floor((totalDiasExt % 360) / 30),
          dias_total: totalDiasExt % 30
        }
      }
    } catch {
      ant = { anios_total: aniosAntiguedad, meses_total: 0, dias_total: 0 }
    }
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
    const primaMejoramientoEconomico = 0
    const difSueldoBasico = 0
    const difAntiguedad = 0
    const difProfesionalizacion = 0
    const difJerarquia = 0

    // Usar el mismo helper centralizado para el total mensual
    const totalSueldoMensual = this.calcularSalarioMensual(emp, aniosAntiguedad)
    const sueldoDiario = Number((totalSueldoMensual / 30).toFixed(2))
    const diasBonoVacacional = 220
    const bonoVacacional = Number((sueldoDiario * diasBonoVacacional).toFixed(2))

    // Firmantes dinamicos desde la BD
    const firmantesRows = await VacacionesModel.getFirmantes()

    // ── Datos de la solicitud vacacional ──────────────────────────────
    const vacRecord = await VacacionesModel.getVacacionesRecord(empleadoId)
    const historial = await VacacionesModel.getHistorialVacaciones(empleadoId)

    // Tomamos la última entrada que NO sea reintegro (status 4)
    const ultimaFecha = historial
      .filter(h => h.id_status_vacaciones !== 4)
      .pop()

    // ── Fecha de finalización REAL y fecha de reintegro laboral ──────────
    // Preferir los valores ya persistidos en BD (fecha_finalizacion_real /
    // fecha_reintegro_laboral). Para registros legacy (columnas aún NULL)
    // se proyecta en tiempo real con el mismo algoritmo de días hábiles.
    let fechaFinReal = ultimaFecha?.fecha_finalizacion_real || null
    let fechaReincorporacionReal = ultimaFecha?.fecha_reintegro_laboral || null

    if (!fechaFinReal && ultimaFecha?.fecha_inicio && derechos?.dias_totales_periodo) {
      // Registro legacy: proyectar en vivo usando el total de días del periodo
      try {
        const festivos = await FestivosModel.getAll()
        const proyeccion = this.proyectarFechasCalendario(
          ultimaFecha.fecha_inicio,
          Number(derechos.dias_totales_periodo),
          festivos
        )
        fechaFinReal = proyeccion.fecha_fin
        fechaReincorporacionReal = proyeccion.fecha_reincorporacion
      } catch {
        fechaFinReal = ultimaFecha?.fecha_fin || null
        fechaReincorporacionReal = ultimaFecha?.fecha_fin
          ? this.calcularFechaRetorno(ultimaFecha.fecha_fin)
          : null
      }
    } else if (!fechaReincorporacionReal && fechaFinReal) {
      fechaReincorporacionReal = this.calcularFechaRetorno(fechaFinReal)
    }

    // ── Derechos y saldos ─────────────────────────────────────────────
    let derechos = null
    try {
      derechos = await this.calcularDerechosYLiquidacion(empleadoId, 0)
    } catch {
      derechos = null
    }

    // ── Cálculo del período anual ─────────────────────────────────────
    const fechaIngreso = this.dateOnly(emp.fecha_ingreso)
    const hoy = new Date()
    let periodoAnio = hoy.getFullYear()
    if (fechaIngreso) {
      const mesIngreso = fechaIngreso.getMonth()
      const mesActual = hoy.getMonth()
      const mesCumple = (mesIngreso + 4) % 12
      if (mesActual < mesCumple) {
        periodoAnio = hoy.getFullYear() - 1
      }
    }

    return {
      empleado: {
        cedula: emp.cedula,
        nombres: emp.nombres,
        apellidos: emp.apellidos,
        fecha_ingreso: emp.fecha_ingreso,
        nro_cuenta_bancaria: emp.nro_cuenta_bancaria,
        cargo_cet: emp.cargo_cet_nombre,
        cargo_onapre: emp.cargo_onapre_nombre,
        direccion_nombre: emp.direccion_nombre,
        division_nombre: emp.division_nombre,
        unidad_nombre: emp.unidad_nombre,
        salario_base: salarioBase,
        porcentaje_profesionalizacion: Number(emp.porcentaje_profesionalizacion),
        anios_antiguedad: aniosAntiguedad,
        antiguedad_anios: ant.anios_total,
        antiguedad_meses: ant.meses_total,
        antiguedad_dias: ant.dias_total,
        otros_anios: antExternal.anios_total,
        otros_meses: antExternal.meses_total,
        otros_dias: antExternal.dias_total
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
        prima_mejoramiento_economico: primaMejoramientoEconomico,
        diferencia_sueldo_basico: difSueldoBasico,
        diferencia_antiguedad: difAntiguedad,
        diferencia_profesionalizacion: difProfesionalizacion,
        diferencia_jerarquia: difJerarquia,
        total_sueldo_mensual: totalSueldoMensual,
        sueldo_diario: sueldoDiario,
        dias_bono_vacacional: diasBonoVacacional,
        bono_vacacional: bonoVacacional
      },
      vacacion: {
        fecha_inicio: ultimaFecha?.fecha_inicio || null,
        fecha_fin: ultimaFecha?.fecha_fin || null,          // fecha en BD (puede ser de fracción/reintegro)
        fecha_fin_real: fechaFinReal,                       // último día real de disfrute (proyección pura)
        fecha_reincorporacion: fechaReincorporacionReal,    // primer día hábil posterior a fecha_fin_real
        fecha_reintegro: ultimaFecha?.fecha_fin || null,    // alias explícito de lo que está en BD
        dias_habiles: ultimaFecha?.dias_habiles || 0,
        saldo_anterior: derechos?.dias_acumulados || 0,
        dias_totales_periodo: derechos?.dias_totales_periodo || 0,
        saldo_restante: derechos?.saldo_disponible_real || 0,
        periodo: `${periodoAnio}-${periodoAnio + 1}`,
        fecha_solicitud: this.toISODate(new Date()),
        observaciones: ultimaFecha?.observaciones || ''
      },
      firmantes: firmantesRows,
      ultima_nomina: emp.fecha ? {
        fecha_pago: emp.fecha,
        monto_neto: Number(emp.monto_neto || 0)
      } : null
    }
  }

  static async actualizarFirmante(cargo_clave, nombre) {
    return VacacionesModel.updateFirmante(cargo_clave, nombre)
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
      // Reinicia el ciclo de alertas con la nueva fecha tope
      await VacacionesModel.updateFechaProximoDerecho(empleadoId, fechaTope)
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
