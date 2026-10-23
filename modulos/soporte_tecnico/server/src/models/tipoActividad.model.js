import pool from '../utils/database.js'

const SELECT_BASE = `
  SELECT t.id, t.nombre, t.clasificacion_id, t.departamento_id, t.activo,
         c.nombre AS clasificacion_nombre,
         c.codigo AS clasificacion_codigo,
         d.nombre AS departamento_nombre
  FROM tipo_actividad t
  INNER JOIN clasificacion c ON t.clasificacion_id = c.id
  LEFT JOIN departamentos d ON t.departamento_id = d.id
`

export class TipoActividadModel {
  static async getAll () {
    const [rows] = await pool.query(`${SELECT_BASE} ORDER BY c.orden, c.nombre, t.nombre`)
    return rows
  }

  static async getByClasificacion (clasificacion_id) {
    const [rows] = await pool.query(
      `${SELECT_BASE} WHERE t.clasificacion_id = ? AND t.activo = 1 AND c.activo = 1 ORDER BY t.nombre`,
      [clasificacion_id]
    )
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE t.id = ?`, [id])
    return rows[0] || null
  }

  static async create ({ nombre, clasificacion_id, departamento_id, activo }) {
    const [result] = await pool.query(
      `INSERT INTO tipo_actividad (nombre, clasificacion_id, departamento_id, activo)
       VALUES (?, ?, ?, ?)`,
      [nombre, clasificacion_id, departamento_id || null, activo ? 1 : 0]
    )
    return this.getById(result.insertId)
  }

  static async update (id, { nombre, clasificacion_id, departamento_id, activo }) {
    const [result] = await pool.query(
      `UPDATE tipo_actividad SET
        nombre = ?, clasificacion_id = ?, departamento_id = ?, activo = ?
       WHERE id = ?`,
      [nombre, clasificacion_id, departamento_id || null, activo ? 1 : 0, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tipo_actividad WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}
