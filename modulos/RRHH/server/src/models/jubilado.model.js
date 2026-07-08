/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class JubiladoModel {

  static async getAll () {
    // Traemos datos del funcionario para mostrar nombres en la lista
    const sql = `
      SELECT j.*, f.nombres, f.apellidos, f.cedula, f.estatus_id
      FROM jubilados j
      JOIN empleados f ON j.empleado_id = f.empleado_id
      ORDER BY j.fecha_efectiva DESC
    `
    const [rows] = await pool.query(sql)
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT j.*, f.nombres, f.apellidos, f.cedula
      FROM jubilados j
      JOIN empleados f ON j.empleado_id = f.empleado_id
      WHERE j.jubilado_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  /**
   * TRANSACCIÓN DE JUBILACIÓN
   * 1. Inserta en jubilados
   * 2. Actualiza empleados (estatus_id = 3)
   */
  static async createTransactional (data) {
    const { empleado_id, porcentaje_jubilacion, fecha_efectiva } = data
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // PASO 1: Insertar registro de jubilado
      const [resJub] = await connection.query(
        'INSERT INTO jubilados (empleado_id, porcentaje_jubilacion, fecha_efectiva) VALUES (?, ?, ?)',
        [empleado_id, porcentaje_jubilacion, fecha_efectiva]
      )

      // PASO 2: Actualizar estatus del funcionario a 3 (Jubilado)
      // Asumimos que 3 es el ID para "Jubilado" en estatus_funcionarios
      await connection.query(
        'UPDATE empleados SET estatus_id = 3 WHERE empleado_id = ?',
        [empleado_id]
      )

      await connection.commit()
      return { jubilado_id: resJub.insertId, ...data, estatus_nuevo: 3 }

    } catch (error) {
      await connection.rollback()
      throw error // Re-lanzamos para que el controller capture el error (ej: duplicado)
    } finally {
      connection.release()
    }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE jubilados SET ? WHERE jubilado_id = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM jubilados WHERE jubilado_id = ?', [id])
    return result.affectedRows > 0
  }
}