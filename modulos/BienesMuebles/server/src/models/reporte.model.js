// models/reporteBM4.model.js
import pool from '../utils/database.js' // Asegúrate de que la ruta sea correcta

export class ReporteBM4Model {
  /**
     * Busca un registro de cierre de mes para un año y mes específicos.
     * Este se usa para la VALIDACIÓN en el servicio de cierre y ahora para OBTENER el dato.
     * @param {number} anio El año del registro.
     * @param {number} mes El mes del registro.
     * @returns {Promise<Object|null>} El registro de cierre de mes o null si no se encuentra.
     */
  static async getCierreMes (anio, mes) {
    try {
      const [rows] = await pool.query(
        'SELECT id, anio, mes, valor_existencia_anterior, fecha_cierre FROM rep_mensual WHERE anio = ? AND mes = ?',
        [anio, mes]
      )
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      throw new Error('No se pudo verificar el estado del cierre de mes.')
    }
  }

  /**
     * Calcula la suma de los valores de los bienes activos al final del mes anterior.
     * Este valor se guardará como la "existencia anterior" para el mes actual.
     * @param {number} anioAnterior El año del mes anterior.
     * @param {number} mesAnterior El mes del mes anterior.
     * @returns {Promise<number>} La suma total de los bienes activos.
     */
  static async calcularExistenciaFinalMesAnterior (anioAnterior, mesAnterior) {
    try {
      const [rows] = await pool.query(
                `SELECT IFNULL(SUM(bim_val), 0) AS existencia_total
                 FROM tmab_m
                 WHERE bim_inc = 1;`
      )

      const existenciaCalculada = parseFloat(rows[0].existencia_total)
      return existenciaCalculada
    } catch (error) {
      throw new Error('No se pudo calcular la existencia final del mes anterior.')
    }
  }

  /**
     * Calcula la suma de los valores de TODOS los bienes ACTIVOES actualmente en la tabla tmab_m.
     * @returns {Promise<number>} La suma total de los bienes actualmente activos.
     */
  static async getExistenciaActualRealTime () {
    try {
      const [rows] = await pool.query(
                `SELECT IFNULL(SUM(bim_val), 0) AS existencia_actual
                 FROM tmab_m
                 WHERE bim_inc = 1;` // Solo sumar los bienes que están marcados como activos
      )

      const existenciaActual = parseFloat(rows[0].existencia_actual)
      return existenciaActual
    } catch (error) {
      throw new Error('No se pudo calcular la existencia actual en tiempo real.')
    }
  }

  /**
     * Guarda el valor de la existencia anterior para el mes actual en la tabla ReporteBM4_Mensual.
     * @param {number} anio El año para el que se guarda la existencia_anterior (mes actual del reporte).
     * @param {number} mes El mes para el que se guarda la existencia_anterior (mes actual del reporte).
     * @param {number} valor Existencia total calculada del mes anterior.
     * @returns {Promise<Object>} Resultado de la operación de base de datos.
     */
  static async guardarCierreMes (anio, mes, valor) {
    try {
      const [result] = await pool.query(
                `INSERT INTO rep_mensual (anio, mes, valor_existencia_anterior)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     valor_existencia_anterior = VALUES(valor_existencia_anterior),
                     fecha_cierre = CURRENT_TIMESTAMP;`,
                [anio, mes, valor]
      )
      return result
    } catch (error) {
      console.error('Error al guardar cierre de mes:', error)
      throw new Error('No se pudo guardar el cierre de mes.')
    }
  }
}
