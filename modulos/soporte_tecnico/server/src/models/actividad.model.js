import pool from '../utils/database.js'

const SELECT_BASE = `
  SELECT a.*,
         d.nombre AS departamento_nombre,
         t.nombre AS tipo_actividad_nombre,
         c.nombre AS clasificacion_nombre,
         c.codigo AS clasificacion_codigo,
         CONCAT(u.nombres, ' ', u.apellidos) AS usuario_nombre
  FROM actividades a
  LEFT JOIN departamentos d ON a.departamento_id = d.id
  LEFT JOIN tipo_actividad t ON a.tipo_actividad_id = t.id
  LEFT JOIN clasificacion c ON t.clasificacion_id = c.id
  LEFT JOIN usuarios u ON a.usuario_id = u.id
`

export class ActividadModel {
  static buildFilters ({ desde, hasta, departamento_id, clasificacion_id, tipo_actividad_id, search } = {}) {
    const conditions = []
    const params = []

    if (desde) {
      conditions.push('a.fecha >= ?')
      params.push(desde)
    }
    if (hasta) {
      conditions.push('a.fecha <= ?')
      params.push(hasta)
    }
    if (departamento_id) {
      conditions.push('a.departamento_id = ?')
      params.push(departamento_id)
    }
    if (clasificacion_id) {
      conditions.push('t.clasificacion_id = ?')
      params.push(clasificacion_id)
    }
    if (tipo_actividad_id) {
      conditions.push('a.tipo_actividad_id = ?')
      params.push(tipo_actividad_id)
    }
    if (search) {
      conditions.push(`(a.nro_act LIKE ? OR a.observaciones LIKE ?
        OR a.bim_ide LIKE ? OR t.nombre LIKE ? OR d.nombre LIKE ?)`)
      const like = `%${search}%`
      params.push(like, like, like, like, like)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return { where, params }
  }

  static async getAll (filters = {}) {
    const { where, params } = this.buildFilters(filters)
    const [rows] = await pool.query(
      `${SELECT_BASE} ${where} ORDER BY a.fecha DESC, a.id DESC`,
      params
    )
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`${SELECT_BASE} WHERE a.id = ?`, [id])
    return rows[0] || null
  }

  static async getLastActivityNumber (prefix) {
    const [rows] = await pool.query(
      `SELECT nro_act FROM actividades
       WHERE nro_act LIKE ?
       ORDER BY id DESC LIMIT 1`,
      [`${prefix}%`]
    )
    return rows.length ? rows[0].nro_act : null
  }

  static async create ({
    nro_act, fecha, departamento_id, clasificacion_id, tipo_actividad_id, bim_ide, usuario_id, observaciones
  }) {
    const [result] = await pool.query(
      `INSERT INTO actividades
        (nro_act, fecha, departamento_id, clasificacion_id, tipo_actividad_id, bim_ide, usuario_id, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nro_act, fecha, departamento_id, clasificacion_id || null, tipo_actividad_id, bim_ide || null, usuario_id, observaciones || null]
    )
    return this.getById(result.insertId)
  }

  static async update (id, {
    nro_act, fecha, departamento_id, clasificacion_id, tipo_actividad_id, bim_ide, usuario_id, observaciones
  }) {
    const [result] = await pool.query(
      `UPDATE actividades SET
        nro_act = ?, fecha = ?, departamento_id = ?, clasificacion_id = ?, tipo_actividad_id = ?,
        bim_ide = ?, usuario_id = ?, observaciones = ?
       WHERE id = ?`,
      [nro_act, fecha, departamento_id, clasificacion_id || null, tipo_actividad_id, bim_ide || null, usuario_id, observaciones || null, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM actividades WHERE id = ?', [id])
    return result.affectedRows > 0
  }

  /**
   * Consolidado mensual por departamento y clasificacion (para el Excel mensual).
   */
  static async getMonthlyConsolidated (mes, anio) {
    const [rows] = await pool.query(
      `SELECT d.id, d.nombre,
        SUM(CASE WHEN c.codigo = 'PREV_SW'   THEN 1 ELSE 0 END) AS prev_sw,
        SUM(CASE WHEN c.codigo = 'PREV_HW'   THEN 1 ELSE 0 END) AS prev_hw,
        SUM(CASE WHEN c.codigo = 'CORR_SW'   THEN 1 ELSE 0 END) AS corr_sw,
        SUM(CASE WHEN c.codigo = 'CORR_HW'   THEN 1 ELSE 0 END) AS corr_hw,
        SUM(CASE WHEN c.codigo = 'SERV_REDES' OR c.codigo = 'PLAT_SERV' THEN 1 ELSE 0 END) AS plat_serv,
        SUM(CASE WHEN c.codigo = 'INFORMES'   OR c.codigo = 'PLAT_INF'  THEN 1 ELSE 0 END) AS plat_inf
       FROM actividades a
       JOIN departamentos d ON a.departamento_id = d.id
       JOIN tipo_actividad t ON a.tipo_actividad_id = t.id
       JOIN clasificacion c ON t.clasificacion_id = c.id
       WHERE MONTH(a.fecha) = ? AND YEAR(a.fecha) = ?
       GROUP BY d.id, d.nombre
       ORDER BY d.nombre`,
      [mes, anio]
    )
    return rows
  }

  static async getStats () {
    const [[totales]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM actividades) AS total,
        (SELECT COUNT(*) FROM actividades
          WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())) AS mes_actual,
        (SELECT COUNT(*) FROM usuarios WHERE activo = 1) AS total_usuarios`
    )

    const [porClasificacion] = await pool.query(
      `SELECT c.nombre AS clasificacion_nombre, c.codigo AS clasificacion_codigo, c.id AS clasificacion_id, COUNT(*) AS total
       FROM actividades a
       JOIN tipo_actividad t ON a.tipo_actividad_id = t.id
       JOIN clasificacion c ON t.clasificacion_id = c.id
       WHERE MONTH(a.fecha) = MONTH(CURDATE()) AND YEAR(a.fecha) = YEAR(CURDATE())
       GROUP BY c.id, c.nombre, c.codigo
       ORDER BY c.id`
    )

    return { ...totales, porClasificacion }
  }
}
