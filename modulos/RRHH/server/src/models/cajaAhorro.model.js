import pool from '../utils/database.js'

export class CajaAhorroModel {

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS caja_ahorro (
        id_caja INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        quincena_no TINYINT(1) NOT NULL COMMENT '1 = Primera quincena, 2 = Segunda quincena',
        mes TINYINT(2) NOT NULL COMMENT '1-12',
        anio SMALLINT NOT NULL,
        monto DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Aporte Empleado + Aporte Patrono',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_caja_empleado_periodo (empleado_id, quincena_no, mes, anio),
        CONSTRAINT fk_caja_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `
    await pool.query(sql)
  }

  /**
   * UPSERT atómico con soporte transaccional.
   * Si se pasa `connection` (de pool.getConnection()), la operación se ejecuta
   * dentro de esa transacción; si no, usa el pool directo.
   */
  static async upsert({ empleado_id, quincena_no, mes, anio, monto }, connection) {
    const sql = `
      INSERT INTO caja_ahorro (empleado_id, quincena_no, mes, anio, monto)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        monto = VALUES(monto),
        fecha_registro = CURRENT_TIMESTAMP
    `
    const params = [empleado_id, quincena_no, mes, anio, monto]
    const connector = connection || pool
    const [result] = await connector.query(sql, params)
    return result
  }

  static async findByEmpleado(empleado_id) {
    const [rows] = await pool.query(
      `SELECT * FROM caja_ahorro WHERE empleado_id = ? ORDER BY anio DESC, mes DESC, quincena_no DESC`,
      [empleado_id]
    )
    return rows
  }

  static async findByPeriodo(mes, anio, quincena_no) {
    const [rows] = await pool.query(
      `SELECT ca.*, e.cedula, e.nombres, e.apellidos
       FROM caja_ahorro ca
       JOIN empleados e ON ca.empleado_id = e.empleado_id
       WHERE ca.mes = ? AND ca.anio = ? AND ca.quincena_no = ?
       ORDER BY e.apellidos, e.nombres`,
      [mes, anio, quincena_no]
    )
    return rows
  }

  static async getTotalByPeriodo(mes, anio, quincena_no) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total_empleados, SUM(monto) AS total_monto
       FROM caja_ahorro
       WHERE mes = ? AND anio = ? AND quincena_no = ?`,
      [mes, anio, quincena_no]
    )
    return rows[0]
  }

  static async delete(id_caja) {
    const [result] = await pool.query('DELETE FROM caja_ahorro WHERE id_caja = ?', [id_caja])
    return result.affectedRows > 0
  }
}
