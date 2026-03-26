/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PermisoModel {

  static _baseQuery () {
    return `
      SELECT p.*, 
             -- Cálculo automático de días de duración
             DATEDIFF(COALESCE(p.fecha_fin, p.fecha_inicio), p.fecha_inicio) + 1 as dias_duracion
      FROM permisos_remunerados p
    `
  }

  static async getByFuncionarioId (empleado_id, estado) {
    let sql = `${this._baseQuery()} WHERE p.empleado_id = ?`
    const params = [empleado_id]

    // Si envían estado (0 o 1), filtramos también por eso
    if (estado !== undefined) {
      sql += ' AND p.esta_aprobado = ?'
      params.push(estado)
    }

    sql += ' ORDER BY p.fecha_solicitud DESC' // Lo más reciente primero

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getById (id) {
    // Aquí sí hacemos JOIN para ver el nombre del funcionario en el detalle individual si se requiere
    const sql = `
      SELECT p.*, f.nombres, f.apellidos, f.cedula,
             DATEDIFF(COALESCE(p.fecha_fin, p.fecha_inicio), p.fecha_inicio) + 1 as dias_duracion
      FROM permisos_remunerados p
      JOIN empleados f ON p.empleado_id = f.empleado_id
      WHERE p.permiso_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create (data) {
    const { empleado_id, motivo, requiere_justificativo, fecha_solicitud, fecha_inicio, fecha_fin, esta_aprobado } = data
    const aprobado = esta_aprobado !== undefined ? esta_aprobado : 0

    const [result] = await pool.query(
      'INSERT INTO permisos_remunerados (empleado_id, motivo, requiere_justificativo, fecha_solicitud, fecha_inicio, fecha_fin, esta_aprobado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [empleado_id, motivo, requiere_justificativo || 0, fecha_solicitud, fecha_inicio, fecha_fin || null, aprobado]
    )
    return { permiso_id: result.insertId, ...data }
  }

  static async update (id, data) {
    const [result] = await pool.query('UPDATE permisos_remunerados SET ? WHERE permiso_id = ?', [data, id])
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM permisos_remunerados WHERE permiso_id = ?', [id])
    return result.affectedRows > 0
  }
}