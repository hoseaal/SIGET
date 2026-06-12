/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class EncargoTemporalModel {

  /**
   * Verifica si el empleado ya tiene un encargo temporal ACTIVO (estatus_encargo = 1).
   * @returns {boolean} true si ya existe un encargo activo.
   */
  static async tieneEncargoActivo (empleado_id, exclude_id = null) {
    let sql = `
      SELECT encargo_id 
      FROM encargos_temporales 
      WHERE empleado_id = ? AND estatus_encargo = 1
    `
    const params = [empleado_id]

    if (exclude_id) {
      sql += ' AND encargo_id != ?'
      params.push(exclude_id)
    }

    const [rows] = await pool.query(sql, params)
    return rows.length > 0
  }

  /**
   * Obtiene todos los encargos de un funcionario (activos e históricos).
   */
  static async getByFuncionarioId (empleado_id) {
    const sql = `
      SELECT 
        et.*,
        cc.nombre AS cargo_cet_nombre,
        co.nombre AS cargo_onapre_nombre,
        ns.nombre AS nivel_salarial_nombre,
        d.nombre   AS direccion_nombre,
        dv.nombre  AS division_nombre,
        u.nombre   AS unidad_nombre
      FROM encargos_temporales et
      LEFT JOIN cargos_cet         cc  ON et.cargo_cet_id      = cc.cargo_cet_id
      LEFT JOIN cargos_onapre      co  ON et.cargo_onapre_id   = co.cargo_onapre_id
      LEFT JOIN niveles_salariales ns  ON et.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones        d   ON et.direccion_id      = d.direccion_id
      LEFT JOIN divisiones         dv  ON et.division_id       = dv.division_id
      LEFT JOIN unidades           u   ON et.unidad_id         = u.unidad_id
      WHERE et.empleado_id = ?
      ORDER BY et.fecha_inicio DESC
    `
    const [rows] = await pool.query(sql, [empleado_id])
    return rows
  }

  /**
   * Obtiene el encargo activo actual de un funcionario (si existe).
   */
  static async getActivoByFuncionarioId (empleado_id) {
    const sql = `
      SELECT 
        et.*,
        cc.nombre AS cargo_cet_nombre,
        co.nombre AS cargo_onapre_nombre,
        ns.nombre AS nivel_salarial_nombre,
        d.nombre   AS direccion_nombre,
        dv.nombre  AS division_nombre,
        u.nombre   AS unidad_nombre
      FROM encargos_temporales et
      LEFT JOIN cargos_cet         cc  ON et.cargo_cet_id      = cc.cargo_cet_id
      LEFT JOIN cargos_onapre      co  ON et.cargo_onapre_id   = co.cargo_onapre_id
      LEFT JOIN niveles_salariales ns  ON et.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones        d   ON et.direccion_id      = d.direccion_id
      LEFT JOIN divisiones         dv  ON et.division_id       = dv.division_id
      LEFT JOIN unidades           u   ON et.unidad_id         = u.unidad_id
      WHERE et.empleado_id = ? AND et.estatus_encargo = 1
      LIMIT 1
    `
    const [rows] = await pool.query(sql, [empleado_id])
    return rows[0] || null
  }

  /**
   * Obtiene un encargo por su ID.
   */
  static async getById (id) {
    const sql = `
      SELECT 
        et.*,
        cc.nombre AS cargo_cet_nombre,
        co.nombre AS cargo_onapre_nombre,
        ns.nombre AS nivel_salarial_nombre,
        d.nombre   AS direccion_nombre,
        dv.nombre  AS division_nombre,
        u.nombre   AS unidad_nombre
      FROM encargos_temporales et
      LEFT JOIN cargos_cet         cc  ON et.cargo_cet_id      = cc.cargo_cet_id
      LEFT JOIN cargos_onapre      co  ON et.cargo_onapre_id   = co.cargo_onapre_id
      LEFT JOIN niveles_salariales ns  ON et.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones        d   ON et.direccion_id      = d.direccion_id
      LEFT JOIN divisiones         dv  ON et.division_id       = dv.division_id
      LEFT JOIN unidades           u   ON et.unidad_id         = u.unidad_id
      WHERE et.encargo_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  /**
   * Crea un nuevo encargo temporal.
   * Regla: el empleado NO puede tener uno activo previo.
   */
  static async create ({
    empleado_id,
    fecha_inicio,
    cargo_cet_id,
    cargo_onapre_id,
    nivel_salarial_id,
    direccion_id,
    division_id,
    unidad_id,
    observacion
  }) {
    // Validar que no tenga un encargo activo
    const tieneActivo = await this.tieneEncargoActivo(empleado_id)
    if (tieneActivo) {
      throw new Error('El funcionario ya posee un encargo temporal activo. Debe finalizar o eliminar el actual antes de registrar uno nuevo.')
    }

    const [result] = await pool.query(
      `INSERT INTO encargos_temporales 
        (empleado_id, fecha_inicio, fecha_fin, estatus_encargo, cargo_cet_id, cargo_onapre_id, nivel_salarial_id, direccion_id, division_id, unidad_id, observacion)
       VALUES (?, ?, NULL, 1, ?, ?, ?, ?, ?, ?, ?)`,
      [empleado_id, fecha_inicio, cargo_cet_id, cargo_onapre_id, nivel_salarial_id, direccion_id, division_id, unidad_id, observacion]
    )

    return { encargo_id: result.insertId }
  }

  /**
   * Finaliza un encargo activo: registra fecha_fin y cambia estatus a 0.
   */
  static async finalizar (id, fecha_fin) {
    const encargo = await this.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')
    if (encargo.estatus_encargo === 0) throw new Error('El encargo ya se encuentra finalizado.')

    const [result] = await pool.query(
      'UPDATE encargos_temporales SET fecha_fin = ?, estatus_encargo = 0 WHERE encargo_id = ?',
      [fecha_fin, id]
    )
    return result.affectedRows > 0
  }

  /**
   * Actualiza datos de un encargo (sólo si está activo).
   */
  static async update (id, data) {
    const encargo = await this.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')

    const [result] = await pool.query(
      'UPDATE encargos_temporales SET ? WHERE encargo_id = ?',
      [data, id]
    )
    return result.affectedRows > 0
  }

  /**
   * Elimina un encargo temporal.
   */
  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM encargos_temporales WHERE encargo_id = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}
