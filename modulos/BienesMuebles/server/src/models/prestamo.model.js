/* eslint-disable camelcase */
import pool from '../utils/database.js'

// Constantes para IDs específicos
const DEP_ALMACEN_ID = 11
const CON_MAL_ESTADO_ID = 4

export class PrestamoModel {
  /**
   * Crea un nuevo registro de préstamo (ttrpre) y sus detalles (ttrdpr).
   * @param {object} data - Datos del préstamo.
   * @param {string} data.pre_fec - Fecha del préstamo (YYYY-MM-DD).
   * @param {string} data.pre_ndo - Número de oficio.
   * @param {number} data.dep_ide - ID del departamento de destino.
   * @param {number} data.dep_origen_ide - ID del departamento de origen (asumiendo que ttrpre lo tiene).
   * @param {string[]} data.bienes - Array de bim_ide de los bienes prestados.
   * @returns {Promise<object>} Objeto del préstamo creado.
   */
  static async create ({ pre_fec, pre_ndo, dep_ide, dep_origen_ide, bienes }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Insertar el préstamo principal
      const [resultPrestamo] = await connection.query(
        'INSERT INTO ttrpre (pre_fec, pre_ndo, dep_ide, dep_origen_ide) VALUES (?, ?, ?, ?)',
        [pre_fec, pre_ndo, dep_ide, dep_origen_ide]
      )
      const pre_ide = resultPrestamo.insertId

      // Insertar los detalles de los bienes prestados
      if (bienes && bienes.length > 0) {
        const detalleValues = bienes.map(bim_ide => [pre_ide, bim_ide])
        await connection.query(
          'INSERT INTO ttrdpr (pre_ide, bim_ide) VALUES ?',
          [detalleValues]
        )
      }

      await connection.commit()
      return { pre_ide, pre_fec, pre_ndo, dep_ide, dep_origen_ide, bienes }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Obtiene una lista de préstamos "normales" (excluyendo bienes en almacén por mal estado).
   * @param {object} filters - Filtros para la consulta.
   * @param {string} [filters.pre_ndo] - Filtro por número de oficio.
   * @param {number} [filters.dep_origen_id] - Filtro por ID de departamento de origen.
   * @param {number} [filters.dep_destino_id] - Filtro por ID de departamento de destino.
   * @returns {Promise<Array>} Lista de préstamos normales.
   */
  static async getNormalLoans (filters = {}) {
    let query = `
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td_destino.dep_nom AS departamento_destino_nombre,
        td_origen.dep_nom AS departamento_origen_nombre,
        GROUP_CONCAT(JSON_OBJECT(
            'bim_ide', tdd.bim_ide,
            'bim_des', tm.bim_des,
            'dpr_est', tdd.dpr_est,
            'con_ide', tm.con_ide,
            'con_con', tc.con_con -- Descripción de la condición
        )) AS bienes_detalles
      FROM ttrpre tp
      LEFT JOIN tesdep td_destino ON tp.dep_ide = td_destino.dep_ide
      LEFT JOIN tesdep td_origen ON tp.dep_origen_ide = td_origen.dep_ide -- Usar dep_origen_ide de ttrpre
      LEFT JOIN ttrdpr tdd ON tp.pre_ide = tdd.pre_ide
      LEFT JOIN tmab_m tm ON tdd.bim_ide = tm.bim_ide
      LEFT JOIN tmacon AS tc ON tm.con_ide = tc.con_ide
    `
    const whereClauses = []
    const params = []

    // Parametro: El préstamo debe estar activo
    whereClauses.push('tp.pre_est = 1')

    // EXCLUSIÓN CLAVE para préstamos normales:
    // NO incluir si el destino es Almacén (11) Y la condición física de ALGUN BIEN es Mal Estado (4)
    // Esto requiere un subquery o JOIN adicional para verificar la condición de los bienes asociados.
    // Una forma simple es verificar si ALGÚN BIEN de este préstamo cumple la condición de exclusión.
    whereClauses.push(`
      NOT EXISTS (
        SELECT 1 FROM ttrdpr tdd_excl
        JOIN tmab_m tmab_excl ON tdd_excl.bim_ide = tmab_excl.bim_ide
        WHERE tdd_excl.pre_ide = tp.pre_ide
          AND tmab_excl.con_ide = ?
          AND tp.dep_ide = ?
      )
    `)
    params.push(CON_MAL_ESTADO_ID, DEP_ALMACEN_ID)

    // Filtros opcionales
    if (filters.pre_ndo) {
      whereClauses.push('tp.pre_ndo LIKE ?')
      params.push(`%${filters.pre_ndo}%`)
    }
    if (filters.dep_origen_id) { // Filtro por el nuevo campo dep_origen_ide en ttrpre
      whereClauses.push('tp.dep_origen_ide = ?')
      params.push(filters.dep_origen_id)
    }
    if (filters.dep_destino_id) { // Filtro por dep_ide de ttrpre
      whereClauses.push('tp.dep_ide = ?')
      params.push(filters.dep_destino_id)
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' GROUP BY tp.pre_ide'
    query += ' ORDER BY tp.pre_fec DESC, tp.pre_ndo ASC'

    const [rows] = await pool.query(query, params)
    return rows
  }

  /**
   * Obtiene una lista de bienes en almacén por mal estado.
   * @param {object} filters - Filtros para la consulta.
   * @param {string} [filters.pre_ndo] - Filtro por número de oficio.
   * @param {number} [filters.dep_origen_id] - Filtro por ID de departamento de origen del bien.
   * @returns {Promise<Array>} Lista de bienes en almacén por mal estado.
   */
  static async getWarehouseItems (filters = {}) {
    let query = `
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td_destino.dep_nom AS departamento_destino_nombre,
        td_origen.dep_nom AS departamento_origen_nombre,
        GROUP_CONCAT(JSON_OBJECT(
            'bim_ide', tdd.bim_ide,
            'bim_des', tm.bim_des,
            'dpr_est', tdd.dpr_est,
            'con_ide', tamb.con_ide,
            'con_con', tamb.con_con -- Descripción de la condición
        )) AS bienes_detalles
      FROM ttrpre tp
      LEFT JOIN tesdep td_destino ON tp.dep_ide = td_destino.dep_ide
      LEFT JOIN tesdep td_origen ON tp.dep_origen_ide = td_origen.dep_ide -- Usar dep_origen_ide de ttrpre
      LEFT JOIN ttrdpr tdd ON tp.pre_ide = tdd.pre_ide
      LEFT JOIN tmab_m tm ON tdd.bim_ide = tm.bim_ide
      LEFT JOIN tmacon AS tamb ON tm.con_ide = tamb.con_ide
    `
    const whereClauses = []
    const params = []

    // Inclusión CLAVE para bienes en almacén:
    // Que el préstamo esté activo
    whereClauses.push('tp.pre_est = 1')
    // Que el destino del préstamo sea el Almacén
    whereClauses.push('tp.dep_ide = ?')
    params.push(DEP_ALMACEN_ID)
    // Que la condición física del bien sea Mal Estado
    whereClauses.push('tamb.con_ide = ?')
    params.push(CON_MAL_ESTADO_ID)

    // Filtros opcionales
    if (filters.pre_ndo) {
      whereClauses.push('tp.pre_ndo LIKE ?')
      params.push(`%${filters.pre_ndo}%`)
    }
    if (filters.dep_origen_id) { // Filtro por el nuevo campo dep_origen_ide en ttrpre
      whereClauses.push('tp.dep_origen_ide = ?')
      params.push(filters.dep_origen_id)
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY tp.pre_fec DESC, tp.pre_ndo ASC, tm.bim_cod ASC'

    const [rows] = await pool.query(query, params)
    return rows
  }

  /**
   * Obtiene los detalles de un préstamo específico por su ID.
   * @param {number} id - ID del préstamo (pre_ide).
   * @returns {Promise<object|null>} Objeto del préstamo con detalles de bienes, o null si no se encuentra.
   */
  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td_destino.dep_nom AS departamento_destino_nombre,
        td_origen.dep_nom AS departamento_origen_nombre, -- Usar dep_origen_ide de ttrpre
        GROUP_CONCAT(JSON_OBJECT(
            'bim_ide', tdd.bim_ide,
            'bim_des', tm.bim_des,
            'dpr_est', tdd.dpr_est,
            'con_ide', tm.con_ide,
            'con_con', tc.con_con -- Descripción de la condición
        )) AS bienes_detalles
      FROM ttrpre tp
      LEFT JOIN tesdep td_destino ON tp.dep_ide = td_destino.dep_ide
      LEFT JOIN tesdep td_origen ON tp.dep_origen_ide = td_origen.dep_ide -- Usar dep_origen_ide de ttrpre
      LEFT JOIN ttrdpr tdd ON tp.pre_ide = tdd.pre_ide
      LEFT JOIN tmab_m tm ON tdd.bim_ide = tm.bim_ide
      LEFT JOIN tmacon AS tc ON tm.con_ide = tc.con_ide
      WHERE tp.pre_ide = ?
      GROUP BY tp.pre_ide
    `, [id])

    if (rows[0] && rows[0].bienes_detalles) {
      rows[0].bienes_detalles = JSON.parse(`[${rows[0].bienes_detalles}]`)
    } else {
      // Si no hay bienes asociados, asegurar que 'bienes_detalles' sea un array vacío
      rows[0].bienes_detalles = []
    }
    return rows[0] || null
  }

  /**
   * Actualiza el estado de un préstamo (pre_est).
   * @param {number} id - ID del préstamo (pre_ide).
   * @param {number} pre_est - Nuevo estado (0 para inactivo, 1 para activo).
   * @returns {Promise<boolean>} True si se actualizó, false en caso contrario.
   */
  static async updateStatusBien (bim_ide, dpr_est, pre_ide) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Actualizar el estado del bien en ttrdpr
      const [result] = await connection.query(
        'UPDATE ttrdpr SET dpr_est = ? WHERE bim_ide = ? AND pre_ide = ?',
        [dpr_est, bim_ide, pre_ide]
      )

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el estado del bien o el bien no está en este préstamo.')
      }

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async updateStatus (id, pre_est) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Actualizar el estado del préstamo principal (ttrpre.pre_est)
      const [result] = await connection.query(
        'UPDATE ttrpre SET pre_est = ? WHERE pre_ide = ?',
        [pre_est, id]
      )

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el estado del préstamo o el préstamo no existe.')
      }

      // Si el préstamo se está marcando como inactivo (devuelto),
      // actualizamos el estado de todos sus bienes asociados y los movemos a origen.
      if (pre_est === 0) {
        // 2. Actualizar dpr_est a 0 para todos los bienes de este préstamo en ttrdpr
        await connection.query(
          'UPDATE ttrdpr SET dpr_est = 0 WHERE pre_ide = ?',
          [id]
        )
      }

      await connection.commit()
      return true // Éxito en la actualización y operaciones relacionadas
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Verifica si un bien está prestado activamente en un préstamo que NO es de almacén por mal estado.
   * @param {string} bim_ide - ID del bien.
   * @returns {Promise<object|null>} Información del préstamo activo si existe y es un préstamo normal, o null.
   */
  static async checkBienPrestadoActiveNormalLoan (bim_ide) {
    const [rows] = await pool.query(`
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        tdd.dpr_est, -- ¡Importante! Estado del detalle del bien
        td_destino.dep_nom AS departamento_destino_nombre,
        td_origen.dep_nom AS departamento_origen_nombre,
        tmab.con_ide,
        tc.con_con AS condicion_descripcion
      FROM ttrdpr tdd
      JOIN ttrpre tp ON tdd.pre_ide = tp.pre_ide
      LEFT JOIN tesdep td_destino ON tp.dep_ide = td_destino.dep_ide
      LEFT JOIN tesdep td_origen ON tp.dep_origen_ide = td_origen.dep_ide
      JOIN tmab_m tmab ON tdd.bim_ide = tmab.bim_ide
      LEFT JOIN tmacon tc ON tmab.con_ide = tc.con_ide
      WHERE tdd.bim_ide = ?
        AND tdd.dpr_est = 1 -- El detalle del bien está activo (prestado)
        AND tp.pre_est = 1  -- El préstamo principal está activo
        AND NOT (tp.dep_ide = ? AND tmab.con_ide = ?) -- NO es un préstamo a almacén por mal estado
    `, [bim_ide, DEP_ALMACEN_ID, CON_MAL_ESTADO_ID])
    return rows[0] || null
  }

  /**
   * Verifica si un bien está prestado activamente como ITEM EN ALMACEN (mal estado).
   * @param {string} bim_ide - ID del bien.
   * @returns {Promise<object|null>} Información del item en almacén si existe, o null.
   */
  static async checkBienEnAlmacenMalEstado (bim_ide) {
    const [rows] = await pool.query(`
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td_destino.dep_nom AS departamento_destino_nombre,
        td_origen.dep_nom AS departamento_origen_nombre,
        tmab.con_ide,
        tc.con_con AS condicion_descripcion
      FROM ttrdpr tdd
      JOIN ttrpre tp ON tdd.pre_ide = tp.pre_ide
      LEFT JOIN tesdep td_destino ON tp.dep_ide = td_destino.dep_ide
      LEFT JOIN tesdep td_origen ON tp.dep_origen_ide = td_origen.dep_ide
      JOIN tmab_m tmab ON tdd.bim_ide = tmab.bim_ide
      LEFT JOIN tmacon tc ON tmab.con_ide = tc.con_ide
      WHERE tdd.bim_ide = ?
        AND tp.pre_est = 1
        AND tp.dep_ide = ?
        AND tmab.con_ide = ?
    `, [bim_ide, DEP_ALMACEN_ID, CON_MAL_ESTADO_ID])
    return rows[0] || null
  }
}
