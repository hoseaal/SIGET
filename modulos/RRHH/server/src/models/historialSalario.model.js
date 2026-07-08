import pool from '../utils/database.js'

export class HistorialSalarioModel {

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS historial_pagos (
        id_historial INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        tipo_personal VARCHAR(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente',
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
    await this._migrateAddTipoPersonalColumn()
  }

  static async _migrateAddTipoPersonalColumn() {
    const migraciones = [
      `ALTER TABLE historial_pagos ADD COLUMN tipo_personal VARCHAR(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente' AFTER empleado_id`
    ]
    for (const sql of migraciones) {
      try {
        await pool.query(sql)
      } catch (e) {
        if (e.errno !== 1060) throw e
      }
    }
  }

  /**
   * Inserta un registro en historial_pagos.
   * Rechaza con error de llave duplicada si ya existe un registro para el
   * mismo (empleado_id, quincena_no, mes, anio) — controlado por la unique key
   * uk_empleado_periodo.
   * Si se pasa `connection`, la operación se ejecuta dentro de esa transacción;
   * si no, usa el pool directo.
   */
  static async insert({ empleado_id, tipo_personal, quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto }, connection) {
    const sql = `
      INSERT INTO historial_pagos (empleado_id, tipo_personal, quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [empleado_id, tipo_personal || 'Funcionario', quincena_no, mes, anio, total_asignaciones, total_deducciones, salario_neto]
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

  static async countByPeriodo(mes, anio, quincena_no, tipo_personal) {
    let sql = 'SELECT COUNT(*) AS total FROM historial_pagos hp INNER JOIN empleados e ON hp.empleado_id = e.empleado_id WHERE hp.mes = ? AND hp.anio = ? AND hp.quincena_no = ?'
    const params = [mes, anio, quincena_no]
    if (tipo_personal) {
      sql += ' AND hp.tipo_personal = ?'
      params.push(tipo_personal)
    }
    const [rows] = await pool.query(sql, params)
    return rows[0].total
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

  static async getResumenByPeriodo(mes, anio, quincena_no, tipo_personal) {
    let sql = `SELECT
        COUNT(*) AS total_empleados,
        COALESCE(SUM(total_asignaciones), 0) AS total_asignaciones,
        COALESCE(SUM(total_deducciones), 0) AS total_deducciones,
        COALESCE(SUM(salario_neto), 0) AS total_salario_neto
      FROM historial_pagos
      WHERE mes = ? AND anio = ? AND quincena_no = ?`
    const params = [mes, anio, quincena_no]
    if (tipo_personal && tipo_personal !== 'Todos') {
      sql += ' AND tipo_personal = ?'
      params.push(tipo_personal)
    }
    const [rows] = await pool.query(sql, params)
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
