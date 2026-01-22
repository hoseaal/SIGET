/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class JubiladoModel {

  static async getAll () {
    // Traemos datos del funcionario para mostrar nombres en la lista
    const sql = `
      SELECT j.*, f.fun_nom, f.fun_ape, f.fun_ced, f.est_ide
      FROM tesjub j
      JOIN tmafun f ON j.fun_ide = f.fun_ide
      ORDER BY j.jub_fju DESC
    `
    const [rows] = await pool.query(sql)
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT j.*, f.fun_nom, f.fun_ape, f.fun_ced
      FROM tesjub j
      JOIN tmafun f ON j.fun_ide = f.fun_ide
      WHERE j.jub_ide = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  /**
   * TRANSACCIÓN DE JUBILACIÓN
   * 1. Inserta en tesjub
   * 2. Actualiza tmafun (est_ide = 3)
   */
  static async createTransactional (data) {
    const { fun_ide, jub_por, jub_fju } = data
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // PASO 1: Insertar registro de jubilado
      const [resJub] = await connection.query(
        'INSERT INTO tesjub (fun_ide, jub_por, jub_fju) VALUES (?, ?, ?)',
        [fun_ide, jub_por, jub_fju]
      )

      // PASO 2: Actualizar estatus del funcionario a 3 (Jubilado)
      // Asumimos que 3 es el ID para "Jubilado" en tmaest
      await connection.query(
        'UPDATE tmafun SET est_ide = 3 WHERE fun_ide = ?',
        [fun_ide]
      )

      await connection.commit()
      return { jub_ide: resJub.insertId, ...data, estatus_nuevo: 3 }

    } catch (error) {
      await connection.rollback()
      throw error // Re-lanzamos para que el controller capture el error (ej: duplicado)
    } finally {
      connection.release()
    }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE tesjub SET ? WHERE jub_ide = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesjub WHERE jub_ide = ?', [id])
    return result.affectedRows > 0
  }
}