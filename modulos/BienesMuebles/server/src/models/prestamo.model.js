/* eslint-disable camelcase */
// src/models/prestamo.model.js
import pool from '../utils/database.js' // Asegúrate de que la ruta sea correcta

export class PrestamoModel {
  static async create ({ pre_fec, pre_ndo, dep_ide, bienes }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Insertar el préstamo principal
      const [resultPrestamo] = await connection.query(
        'INSERT INTO ttrpre (pre_fec, pre_ndo, dep_ide) VALUES (?, ?, ?)',
        [pre_fec, pre_ndo, dep_ide]
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
      return { pre_ide, pre_fec, pre_ndo, dep_ide, bienes }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async getAll (filters = {}) {
    let query = `
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td.dep_nom AS departamento_destino,
        COUNT(tdd.dpr_ide) AS total_bienes_prestados
      FROM ttrpre tp
      LEFT JOIN tesdep td ON tp.dep_ide = td.dep_ide
      LEFT JOIN ttrdpr tdd ON tp.pre_ide = tdd.pre_ide
    `
    const whereClauses = []
    const params = []

    if (filters.pre_est !== undefined && (filters.pre_est === '0' || filters.pre_est === '1')) {
      whereClauses.push('tp.pre_est = ?')
      params.push(filters.pre_est)
    }
    if (filters.dep_ide) {
      whereClauses.push('tp.dep_ide = ?')
      params.push(filters.dep_ide)
    }
    if (filters.pre_ndo) {
      whereClauses.push('tp.pre_ndo LIKE ?')
      params.push(`%${filters.pre_ndo}%`)
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' GROUP BY tp.pre_ide ORDER BY tp.pre_fec DESC'

    const [rows] = await pool.query(query, params)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT
        tp.pre_ide,
        tp.pre_fec,
        tp.pre_ndo,
        tp.pre_est,
        td.dep_nom AS departamento_destino,
        GROUP_CONCAT(JSON_OBJECT('bim_ide', tdd.bim_ide, 'bim_cod', tm.bim_cod, 'bim_des', tm.bim_des, 'dpr_est', tdd.dpr_est)) AS bienes_detalles
      FROM ttrpre tp
      LEFT JOIN tesdep td ON tp.dep_ide = td.dep_ide
      LEFT JOIN ttrdpr tdd ON tp.pre_ide = tdd.pre_ide
      LEFT JOIN tmab_m tm ON tdd.bim_ide = tm.bim_ide
      WHERE tp.pre_ide = ?
      GROUP BY tp.pre_ide
    `, [id])

    if (rows[0] && rows[0].bienes_detalles) {
      rows[0].bienes_detalles = JSON.parse(`[${rows[0].bienes_detalles}]`)
    } else {
      rows[0].bienes_detalles = []
    }
    return rows[0] || null
  }

  static async update (id, datos) {
    const [result] = await pool.query(
      'UPDATE ttrpre SET ? WHERE pre_ide = ?',
      [datos, id]
    )
    return result.affectedRows > 0
  }

  static async getByOficio (pre_ndo) {
    const [rows] = await pool.query(
      'SELECT * FROM ttrpre WHERE pre_ndo = ?',
      [pre_ndo]
    )
    return rows[0] || null
  }

  static async checkBienPrestadoActivo (bim_ide) {
    // Verifica si un bien está prestado en un préstamo ACTIVO
    const [rows] = await pool.query(`
      SELECT
        td.dep_nom AS departamento_destino,
        tp.pre_ndo,
        tp.pre_ide
      FROM ttrdpr tdd
      JOIN ttrpre tp ON tdd.pre_ide = tp.pre_ide
      JOIN tesdep td ON tp.dep_ide = td.dep_ide
      WHERE tdd.bim_ide = ? AND tp.pre_est = 1
    `, [bim_ide])
    return rows[0] || null
  }

  static async getBienesPrestadosReport (depOrigenId = null) { // <--- ¡Modificado! Aceptar parámetro
    let query = `
      SELECT
        tdep_m_origen.dep_nom AS departamento_original,
        tdep_m_destino.dep_nom AS departamento_prestado_a,
        tprt_m.pre_ndo,
        tprt_m.pre_fec,
        tmab_m.bim_cod,
        tmab_m.bim_des,
        tmab_m.bim_ide
      FROM
        ttrdpr AS tprt_d
      INNER JOIN
        ttrpre AS tprt_m ON tprt_d.pre_ide = tprt_m.pre_ide
      INNER JOIN
        tmab_m ON tprt_d.bim_ide = tmab_m.bim_ide
      INNER JOIN
        tesdep AS tdep_m_destino ON tprt_m.dep_ide = tdep_m_destino.dep_ide
      INNER JOIN
        tesdep AS tdep_m_origen ON tmab_m.dep_ide = tdep_m_origen.dep_ide
      WHERE
        tprt_m.pre_est = 1 -- Solo préstamos activos
    `
    const params = []

    if (depOrigenId) {
      query += ' AND tdep_m_origen.dep_ide = ?'
      params.push(depOrigenId)
    }

    query += `
      ORDER BY
        tdep_m_origen.dep_nom,
        tdep_m_destino.dep_nom,
        tprt_m.pre_ndo,
        tmab_m.bim_cod;
    `
    const [rows] = await pool.query(query, params) // <--- ¡Modificado! Pasar los parámetros
    return rows
  }
}
