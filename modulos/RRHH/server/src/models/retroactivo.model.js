import pool from '../utils/database.js'

export class RetroactivoModel {
  static async _getSchemaName() {
    const [rows] = await pool.query('SELECT DATABASE() AS db')
    return rows[0]?.db
  }

  static async _getExistingColumns(schemaName) {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'retroactivos'`,
      [schemaName]
    )
    return new Set(rows.map(r => r.COLUMN_NAME))
  }

  static async _addColumnIfMissing(existingCols, colName, ddlFragment) {
    if (existingCols.has(colName)) return false
    await pool.query(`ALTER TABLE retroactivos ADD COLUMN ${ddlFragment}`)
    existingCols.add(colName)
    return true
  }

  static async _migrateTable() {
    const schemaName = await this._getSchemaName()
    if (!schemaName) return

    const existingCols = await this._getExistingColumns(schemaName)

    // Ensure minimum required columns exist for current code paths.
    await this._addColumnIfMissing(existingCols, 'fecha_corte', 'fecha_corte DATE NOT NULL AFTER fecha_inicio')
    await this._addColumnIfMissing(existingCols, 'dias_diferencia', 'dias_diferencia INT NOT NULL DEFAULT 0 AFTER unidad_id')
    await this._addColumnIfMissing(existingCols, 'delta_sueldo', 'delta_sueldo DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER dias_diferencia')
    await this._addColumnIfMissing(existingCols, 'delta_antiguedad', 'delta_antiguedad DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER delta_sueldo')
    await this._addColumnIfMissing(existingCols, 'delta_profesionalizacion', 'delta_profesionalizacion DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER delta_antiguedad')
    await this._addColumnIfMissing(existingCols, 'delta_jerarquia', 'delta_jerarquia DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER delta_profesionalizacion')
    await this._addColumnIfMissing(existingCols, 'monto_retroactivo', 'monto_retroactivo DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER delta_jerarquia')
    await this._addColumnIfMissing(existingCols, 'estado', "estado ENUM('PENDIENTE', 'PAGADO') NOT NULL DEFAULT 'PENDIENTE' AFTER monto_retroactivo")
    await this._addColumnIfMissing(existingCols, 'periodo_pago_mes', 'periodo_pago_mes INT NULL AFTER estado')
    await this._addColumnIfMissing(existingCols, 'periodo_pago_anio', 'periodo_pago_anio INT NULL AFTER periodo_pago_mes')
    await this._addColumnIfMissing(existingCols, 'periodo_pago_quincena', 'periodo_pago_quincena VARCHAR(20) NULL AFTER periodo_pago_anio')
    await this._addColumnIfMissing(existingCols, 'fecha_pago', 'fecha_pago DATETIME NULL AFTER periodo_pago_quincena')
    await this._addColumnIfMissing(existingCols, 'observacion', 'observacion VARCHAR(255) NULL AFTER fecha_pago')
    await this._addColumnIfMissing(existingCols, 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER observacion')
    await this._addColumnIfMissing(existingCols, 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at')
  }

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS retroactivos (
        retroactivo_id INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_corte DATE NOT NULL,
        cargo_cet_id INT NOT NULL,
        cargo_onapre_id INT NOT NULL,
        nivel_salarial_id INT NOT NULL,
        direccion_id INT NOT NULL,
        division_id INT NULL,
        unidad_id INT NULL,
        dias_diferencia INT NOT NULL DEFAULT 0,
        delta_sueldo DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        delta_antiguedad DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        delta_profesionalizacion DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        delta_jerarquia DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        monto_retroactivo DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        estado ENUM('PENDIENTE', 'PAGADO') NOT NULL DEFAULT 'PENDIENTE',
        periodo_pago_mes INT NULL,
        periodo_pago_anio INT NULL,
        periodo_pago_quincena VARCHAR(20) NULL,
        fecha_pago DATETIME NULL,
        observacion VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_retro_empleado (empleado_id),
        INDEX idx_retro_nomina (estado, periodo_pago_mes, periodo_pago_anio, periodo_pago_quincena),
        CONSTRAINT fk_retro_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
      )
    `
    await pool.query(sql)

    // If the table already existed (older schema), ensure new columns exist.
    await this._migrateTable()
  }

  static async getEmpleadoLaboral(empleadoId) {
    await this.ensureTable()
    const sql = `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
        dl.cargo_cet_id, dl.cargo_onapre_id, dl.nivel_salarial_id, dl.prima_profesional_id,
        dl.direccion_id, dl.division_id, dl.unidad_id,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        ns.nombre AS nivel_salarial_nombre,
        COALESCE(ns.salario_base, 0) AS salario_base,
        COALESCE(nsa.salario_antiguo, ns.salario_base, 0) AS salario_historico,
        COALESCE(pp.porcentaje_actual, 0) AS porcentaje_profesionalizacion,
        FLOOR((
          COALESCE((
            SELECT SUM(DATEDIFF(COALESCE(ra.fecha_fin, CURDATE()), ra.fecha_inicio))
            FROM registros_antiguedades ra
            WHERE ra.empleado_id = e.empleado_id
          ), 0) + DATEDIFF(CURDATE(), e.fecha_ingreso)
        ) / 365) AS anios_antiguedad
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN niveles_salariales_antiguos nsa ON dl.nivel_salarial_antiguo_id = nsa.nivel_salarial_antiguo_id
      LEFT JOIN primas_profesionalizacion pp ON dl.prima_profesional_id = pp.prima_profesional_id
      WHERE e.empleado_id = ?
      LIMIT 1
    `
    const [rows] = await pool.query(sql, [empleadoId])
    return rows[0] || null
  }

  static async getNivelSalarial(nivelSalarialId) {
    const sql = `
      SELECT ns.nivel_salarial_id, ns.nombre, ns.salario_base, ns.cargo_onapre_id,
        COALESCE(nsa.salario_antiguo, ns.salario_base, 0) AS salario_historico,
        ona.nombre AS cargo_onapre_nombre
      FROM niveles_salariales ns
      LEFT JOIN cargos_onapre ona ON ns.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales_antiguos nsa
        ON nsa.nombre = ns.nombre AND nsa.cargo_onapre_id = ns.cargo_onapre_id
      WHERE ns.nivel_salarial_id = ?
      LIMIT 1
    `
    const [rows] = await pool.query(sql, [nivelSalarialId])
    return rows[0] || null
  }

  static async getCargoCet(cargoCetId) {
    const [rows] = await pool.query('SELECT cargo_cet_id, nombre FROM cargos_cet WHERE cargo_cet_id = ? LIMIT 1', [cargoCetId])
    return rows[0] || null
  }

  static async getCargoOnapre(cargoOnapreId) {
    const [rows] = await pool.query('SELECT cargo_onapre_id, nombre FROM cargos_onapre WHERE cargo_onapre_id = ? LIMIT 1', [cargoOnapreId])
    return rows[0] || null
  }

  static async getEscalasAntiguedad() {
    const [rows] = await pool.query('SELECT anios_cumplidos, porcentaje_actual FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC')
    return rows
  }

  static async getMinSalarialBase() {
    const [rows] = await pool.query('SELECT MIN(salario_base) AS salario_minimo FROM niveles_salariales')
    return Number(rows[0]?.salario_minimo) || 0
  }

  static async getJerarquias() {
    const [rows] = await pool.query('SELECT cargo, porcentaje FROM porcentajes_jerarquias')
    return rows
  }

  static async listByEmpleado(empleadoId) {
    await this.ensureTable()
    const sql = `
      SELECT r.*,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        ns.nombre AS nivel_salarial_nombre,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre
      FROM retroactivos r
      LEFT JOIN cargos_cet cet ON r.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON r.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales ns ON r.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones dir ON r.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON r.division_id = divi.division_id
      LEFT JOIN unidades uni ON r.unidad_id = uni.unidad_id
      WHERE r.empleado_id = ?
      ORDER BY r.fecha_inicio DESC, r.retroactivo_id DESC
    `
    const [rows] = await pool.query(sql, [empleadoId])
    return rows
  }

  static async create(data) {
    await this.ensureTable()
    const [result] = await pool.query('INSERT INTO retroactivos SET ?', [data])
    return result.insertId
  }

  static async update(id, data) {
    await this.ensureTable()
    const [result] = await pool.query('UPDATE retroactivos SET ? WHERE retroactivo_id = ? AND estado = "PENDIENTE"', [data, id])
    return result.affectedRows > 0
  }

  static async delete(id) {
    await this.ensureTable()
    const [result] = await pool.query('DELETE FROM retroactivos WHERE retroactivo_id = ? AND estado = "PENDIENTE"', [id])
    return result.affectedRows > 0
  }

  static async pagar(id, periodo) {
    await this.ensureTable()
    const [result] = await pool.query(
      `UPDATE retroactivos
       SET estado = 'PAGADO',
           periodo_pago_mes = ?,
           periodo_pago_anio = ?,
           periodo_pago_quincena = ?,
           fecha_pago = NOW()
       WHERE retroactivo_id = ? AND estado = 'PENDIENTE'`,
      [periodo.mes, periodo.anio, periodo.quincena, id]
    )
    return result.affectedRows > 0
  }

  static async getPagadosPorPeriodo(mes, anio, quincena) {
    await this.ensureTable()
    const [rows] = await pool.query(
      `SELECT empleado_id, SUM(monto_retroactivo) AS monto
       FROM retroactivos
       WHERE estado = 'PAGADO'
         AND periodo_pago_mes = ?
         AND periodo_pago_anio = ?
         AND (periodo_pago_quincena = ? OR periodo_pago_quincena = 'unificada')
       GROUP BY empleado_id`,
      [mes, anio, String(quincena)]
    )
    return rows
  }

  static async getPagadosDetallePorPeriodo(mes, anio, quincena) {
    await this.ensureTable()
    const [rows] = await pool.query(
      `SELECT retroactivo_id, empleado_id, fecha_inicio, fecha_corte,
              dias_diferencia, delta_sueldo, delta_antiguedad,
              delta_profesionalizacion, delta_jerarquia, monto_retroactivo
       FROM retroactivos
       WHERE estado = 'PAGADO'
         AND periodo_pago_mes = ?
         AND periodo_pago_anio = ?
         AND (periodo_pago_quincena = ? OR periodo_pago_quincena = 'unificada')
       ORDER BY empleado_id, fecha_inicio`,
      [mes, anio, String(quincena)]
    )
    return rows
  }
}
