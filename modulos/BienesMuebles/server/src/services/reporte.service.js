// services/reporteBM4.service.js
import { ReporteBM4Model } from '../models/reporte.model.js' // Asegúrate de la ruta correcta

export class ReporteBM4Service {
  /**
     * Procesa el cierre del mes, calcula la existencia anterior y la guarda.
     * Incluye validación para evitar cierres duplicados en el mismo mes.
     * @returns {Promise<Object>} Un objeto con el resultado del cierre.
     * @throws {Error} Si el mes ya ha sido cerrado o si hay un error en el proceso.
     */
  static async cerrarMes () {
    const currentDate = new Date()
    const anioActual = currentDate.getFullYear()
    const mesActual = currentDate.getMonth() + 1 // getMonth() es 0-indexado

    // Calcular año y mes del mes anterior
    const dateLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const anioAnterior = dateLastMonth.getFullYear()
    const mesAnterior = dateLastMonth.getMonth() + 1

    console.log(`[Service] Intentando cerrar mes para el reporte de: ${anioActual}-${mesActual}`)

    // --- VALIDACIÓN CRUCIAL: Evitar doble cierre para el mismo mes ---
    const cierreExistente = await ReporteBM4Model.getCierreMes(anioActual, mesActual)
    if (cierreExistente) {
      const error = new Error(`El mes ${mesActual} del año ${anioActual} ya ha sido cerrado. No se puede procesar de nuevo.`)
      error.statusCode = 409 // Conflict
      throw error
    }
    // --- FIN VALIDACIÓN ---

    const existenciaCalculada = await ReporteBM4Model.calcularExistenciaFinalMesAnterior(anioAnterior, mesAnterior)

    await ReporteBM4Model.guardarCierreMes(anioActual, mesActual, existenciaCalculada)

    return {
      message: `Mes ${mesActual}/${anioActual} cerrado exitosamente. Existencia anterior calculada: ${existenciaCalculada} Bs.`,
      anio: anioActual,
      mes: mesActual,
      valorExistenciaAnterior: existenciaCalculada
    }
  }

  /**
     * Obtiene el registro de cierre de mes de la tabla ReporteBM4_Mensual para el mes actual.
     * Esto representa la "existencia anterior" para el reporte de este mes.
     * @returns {Promise<Object|null>} El registro de cierre de mes o null si no se ha cerrado el mes actual.
     */
  static async getExistenciaAnteriorParaMostrar () {
    const currentDate = new Date()
    const anioActual = currentDate.getFullYear()
    const mesActual = currentDate.getMonth() + 1

    console.log(`[Service] Obteniendo existencia anterior para mostrar para ${anioActual}-${mesActual}.`)
    const cierreMes = await ReporteBM4Model.getCierreMes(anioActual, mesActual)

    if (!cierreMes) {
      return {
        message: `El cierre del mes ${mesActual}/${anioActual} aún no ha sido realizado.`,
        anio: anioActual,
        mes: mesActual,
        valorExistenciaAnterior: 0 // O null, dependiendo de cómo quieras manejarlo en el frontend
      }
    }

    return {
      anio: cierreMes.anio,
      mes: cierreMes.mes,
      valorExistenciaAnterior: cierreMes.valor_existencia_anterior,
      fechaCierre: cierreMes.fecha_cierre
    }
  }

  /**
     * Calcula y devuelve la existencia total de bienes activos en tiempo real desde tmab_m.
     * @returns {Promise<number>} El valor total de los bienes activos actualmente.
     */
  static async getExistenciaActualRealTime () {
    console.log('[Service] Obteniendo existencia actual en tiempo real.')
    const existencia = await ReporteBM4Model.getExistenciaActualRealTime()
    return {
      existenciaActualRealTime: existencia
    }
  }

  static async getCategorias () {
    console.log('[Service] Obteniendo data actual en tiempo real.')
    const existencia = await ReporteBM4Model.getCategorias()
    return {
      Categorias: existencia
    }
  }
}
