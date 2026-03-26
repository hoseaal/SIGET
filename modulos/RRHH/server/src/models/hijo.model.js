/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class HijoModel {
  
  static async getByFuncionarioId (empleado_id) {
    // Calculamos la edad al vuelo
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
      FROM hijos_empleados
      WHERE empleado_id = ?
      ORDER BY fecha_nacimiento ASC
    `
    const [rows] = await pool.query(sql, [empleado_id])
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad
      FROM hijos_empleados 
      WHERE hijo_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create ({ empleado_id, nombres, apellidos, fecha_nacimiento }) {
    const [result] = await pool.query(
      'INSERT INTO hijos_empleados (empleado_id, nombres, apellidos, fecha_nacimiento) VALUES (?, ?, ?, ?)',
      [empleado_id, nombres, apellidos, fecha_nacimiento]
    )
    return { hijo_id: result.insertId, empleado_id, nombres, apellidos, fecha_nacimiento }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE hijos_empleados SET ? WHERE hijo_id = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM hijos_empleados WHERE hijo_id = ?', [id])
    return result.affectedRows > 0
  }
}