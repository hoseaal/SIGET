import pool from '../utils/database.js'

export class CajaAhorroModel {

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS caja_ahorro (
        id_caja INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        tipo_personal VARCHAR(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente',
        quincena_no TINYINT(1) NOT NULL COMMENT '1 = Primera quincena, 2 = Segunda quincena',
        mes TINYINT(2) NOT NULL COMMENT '1-12',
        anio SMALLINT NOT NULL,
        monto DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto total (aporte_empleado + aporte_patrono)',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_caja_empleado_periodo (empleado_id, quincena_no, mes, anio),
        CONSTRAINT fk_caja_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `
    await pool.query(sql)
    await this._migrateAddColumns()
  }

  static async _migrateAddColumns() {
    const migraciones = [
      `ALTER TABLE caja_ahorro ADD COLUMN aporte_empleado DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER monto`,
      `ALTER TABLE caja_ahorro ADD COLUMN aporte_patrono DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER aporte_empleado`,
      `ALTER TABLE caja_ahorro ADD COLUMN tipo_personal VARCHAR(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente' AFTER empleado_id`
    ]
    for (const sql of migraciones) {
      try {
        await pool.query(sql)
      } catch (e) {
        if (e.errno !== 1060) throw e
      }
    }
  }

  static async insert({ empleado_id, tipo_personal, quincena_no, mes, anio, monto, aporte_empleado, aporte_patrono }, connection) {
    if (aporte_empleado == null && aporte_patrono == null) {
      aporte_empleado = Math.round((monto / 3) * 100) / 100
      aporte_patrono = Math.round((monto * 2 / 3) * 100) / 100
    }
    const sql = `
      INSERT INTO caja_ahorro (empleado_id, tipo_personal, quincena_no, mes, anio, monto, aporte_empleado, aporte_patrono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [empleado_id, tipo_personal || 'Funcionario', quincena_no, mes, anio, monto, aporte_empleado, aporte_patrono]
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

  static async countByPeriodo(mes, anio, quincena_no, tipo_personal) {
    let sql = 'SELECT COUNT(*) AS total FROM caja_ahorro ca INNER JOIN empleados e ON ca.empleado_id = e.empleado_id WHERE ca.mes = ? AND ca.anio = ? AND ca.quincena_no = ?'
    const params = [mes, anio, quincena_no]
    if (tipo_personal) {
      sql += ' AND ca.tipo_personal = ?'
      params.push(tipo_personal)
    }
    const [rows] = await pool.query(sql, params)
    return rows[0].total
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

  static async getReporte({ mes, anio, quincena_no, tipo_personal }) {
    const params = [mes, anio]
    const joins = `
      FROM caja_ahorro ca
      JOIN empleados e ON ca.empleado_id = e.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE ca.mes = ? AND ca.anio = ?
    `

    let extraWhere = ''
    if (quincena_no) {
      extraWhere += ' AND ca.quincena_no = ?'
      params.push(quincena_no)
    }
    if (tipo_personal && tipo_personal !== 'Todos') {
      extraWhere += ' AND ca.tipo_personal = ?'
      params.push(tipo_personal)
    }

    let sql
    if (quincena_no) {
      sql = `
        SELECT
          ca.empleado_id,
          e.cedula,
          e.nombres,
          e.apellidos,
          ca.tipo_personal,
          COALESCE(dir.nombre, '') AS departamento,
          COALESCE(cet.nombre, '') AS cargo,
          ca.monto AS total,
          ca.aporte_empleado,
          ca.aporte_patrono
        ${joins}
          ${extraWhere}
        ORDER BY ca.monto DESC
      `
    } else {
      sql = `
        SELECT
          ca.empleado_id,
          e.cedula,
          e.nombres,
          e.apellidos,
          ca.tipo_personal,
          COALESCE(dir.nombre, '') AS departamento,
          COALESCE(cet.nombre, '') AS cargo,
          SUM(ca.monto) AS total,
          SUM(ca.aporte_empleado) AS aporte_empleado,
          SUM(ca.aporte_patrono) AS aporte_patrono
        ${joins}
          ${extraWhere}
        GROUP BY ca.empleado_id, e.cedula, e.nombres, e.apellidos, ca.tipo_personal, dir.nombre, cet.nombre
        ORDER BY total DESC
      `
    }

    const [rows] = await pool.query(sql, params)

    const resumen = {
      total_empleados: rows.length,
      total_general: rows.reduce((s, r) => s + Number(r.total), 0),
    }

    return { data: rows, resumen }
  }

  static async delete(id_caja) {
    const [result] = await pool.query('DELETE FROM caja_ahorro WHERE id_caja = ?', [id_caja])
    return result.affectedRows > 0
  }
}
