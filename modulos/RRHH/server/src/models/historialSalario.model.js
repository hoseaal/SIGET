import pool from '../utils/database.js'

export class HistorialSalarioModel {

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS historial_pagos (
        id_historial INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        quincena_no TINYINT(1) NOT NULL COMMENT '1=Primera quincena, 2=Segunda quincena',
        mes TINYINT(2) NOT NULL COMMENT '1-12',
        anio SMALLINT NOT NULL,
        total_asignaciones DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        total_deducciones DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        salario_neto DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_empleado_periodo (empleado_id, quincena_no, mes, anio),
        CONSTRAINT fk_historial_pago_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `
    await pool.query(sql)
  }

  /**
   * UPSERT atómico con soporte transaccional.
   * Si se pasa `connection`, la operación se ejecuta dentro de esa transacción;
   * si no, usa el pool directo.
   */
  static async upsert({ empleado_id, quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto }, connection) {
    const sql = `
      INSERT INTO historial_pagos (empleado_id, quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_asignaciones = VALUES(total_asignaciones),
        total_deducciones = VALUES(total_deducciones),
        salario_neto = VALUES(salario_neto),
        fecha_registro = CURRENT_TIMESTAMP
    `
    const params = [empleado_id, quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto]
    const connector = connection || pool
    const [result] = await connector.query(sql, params)
    return result
  }

  static async findByEmpleado(empleado_id) {
    const [rows] = await pool.query(
      `SELECT * FROM historial_pagos WHERE empleado_id = ? ORDER BY anio DESC, mes DESC, quincena_no DESC`,
      [empleado_id]
    )
    return rows
  }

  static async findByPeriodo(mes, anio, quincena_no) {
    const [rows] = await pool.query(
      `SELECT hs.*, e.cedula, e.nombres, e.apellidos
       FROM historial_pagos hs
       JOIN empleados e ON hs.empleado_id = e.empleado_id
       WHERE hs.mes = ? AND hs.anio = ? AND hs.quincena_no = ?
       ORDER BY e.apellidos, e.nombres`,
      [mes, anio, quincena_no]
    )
    return rows
  }

  static async getTotalByPeriodo(mes, anio, quincena_no) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total_empleados,
              SUM(total_asignaciones) AS total_asignaciones,
              SUM(total_deducciones) AS total_deducciones,
              SUM(salario_neto) AS total_salario_neto
       FROM historial_pagos
       WHERE mes = ? AND anio = ? AND quincena_no = ?`,
      [mes, anio, quincena_no]
    )
    return rows[0]
  }

  static async getById(id_historial) {
    const [rows] = await pool.query('SELECT * FROM historial_pagos WHERE id_historial = ?', [id_historial])
    return rows[0] || null
  }

  static async update(id_historial, data) {
    const [result] = await pool.query('UPDATE historial_pagos SET ? WHERE id_historial = ?', [data, id_historial])
    return result.affectedRows > 0
  }

  static async delete(id_historial) {
    const [result] = await pool.query('DELETE FROM historial_pagos WHERE id_historial = ?', [id_historial])
    return result.affectedRows > 0
  }
}
