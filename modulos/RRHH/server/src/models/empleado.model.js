import pool from '../utils/database.js'

export class EmpleadoModel {
  static async buscarSinUsuario(query) {
    const likeQuery = `%${query}%`;
    const sql = `
      SELECT empleado_id, cedula, nombres, apellidos
      FROM empleados
      WHERE (cedula LIKE ? OR nombres LIKE ? OR apellidos LIKE ?)
      AND empleado_id NOT IN (SELECT empleado_id FROM usuarios_empleados)
      LIMIT 10
    `;
    const [rows] = await pool.query(sql, [likeQuery, likeQuery, likeQuery]);
    return rows;
  }
}
