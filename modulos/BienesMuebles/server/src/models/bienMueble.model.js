/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class BienMuebleModel {
  static async getAll (filters = {}) {
    let query = `
      SELECT b.*, d.dep_nom AS departamento FROM tmab_m b LEFT JOIN tesdep d ON b.dep_ide = d.dep_ide
    `

    const whereClauses = []
    const params = []

    if (filters.estado) {
      whereClauses.push('b.est_ide = ?')
      params.push(filters.estado)
    }

    if (filters.inc) {
      whereClauses.push('b.bim_inc = ?')
      params.push(filters.inc)
    }

    if (filters.dep) {
      whereClauses.push('b.dep_ide = ?')
      params.push(filters.dep)
    }

    if (filters.con) {
      whereClauses.push('b.con_ide = ?')
      params.push(filters.con)
    }

    if (filters.esu) {
      whereClauses.push('b.esu_ide = ?')
      params.push(filters.esu)
    }

    // Filtros para bim_fec (fecha de incorporación)
    if (filters.fechaIncorporacionDesde) {
      whereClauses.push('b.bim_fec >= ?')
      params.push(filters.fechaIncorporacionDesde)
    }
    if (filters.fechaIncorporacionHasta) {
      whereClauses.push('b.bim_fec <= ?')
      params.push(filters.fechaIncorporacionHasta)
    }

    // Filtros para bim_fed (fecha de desincorporación)
    if (filters.fechaDesincorporacionDesde) {
      whereClauses.push('b.bim_fed >= ?')
      params.push(filters.fechaDesincorporacionDesde)
    }
    if (filters.fechaDesincorporacionHasta) {
      whereClauses.push('b.bim_fed <= ?')
      params.push(filters.fechaDesincorporacionHasta)
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    const [rows] = await pool.query(query, params)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT 
    b.*,
    e.est_est AS estado,
    f.foa_nom AS forma_adquisicion,
    c.con_con AS condicion,
    eu.esu_esu AS estado_uso,
    m.mar_ide AS marcaid,       
    mar.mar_mar AS marca,      
    m.mod_mod AS modelo,  
    ca.cae_cae AS categoria_especifica,
    co.com_com AS concepto,
    d.dep_nom AS departamento
    FROM tmab_m b
    LEFT JOIN tmaest e ON b.est_ide = e.est_ide
    LEFT JOIN tmafoa f ON b.foa_ide = f.foa_ide
    LEFT JOIN tmacon c ON b.con_ide = c.con_ide
    LEFT JOIN tmaesu eu ON b.esu_ide = eu.esu_ide
    LEFT JOIN tesmod m ON b.mod_ide = m.mod_ide      
    LEFT JOIN tmamar mar ON m.mar_ide = mar.mar_ide  
    LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide
    LEFT JOIN tmacom co ON b.com_ide = co.com_ide
    LEFT JOIN tesdep d ON b.dep_ide = d.dep_ide
    WHERE b.bim_ide = ?
    `, [id])
    return rows[0] || null
  }

  static async create (bienData) {
    // eslint-disable-next-line no-unused-vars
    const [result] = await pool.query(
      'INSERT INTO tmab_m SET ?',
      [bienData]
    )
    return this.getById(bienData.bim_ide)
  }

  static async update (id, bienData) {
    const [result] = await pool.query(
      'UPDATE tmab_m SET ? WHERE bim_ide = ?',
      [bienData, id]
    )
    return result.affectedRows > 0
  }

  static async desincorporar (id, { bim_inc, com_ide, bim_fed }) {
    if (!id || com_ide === undefined || !bim_fed) {
      throw new Error('Faltan datos requeridos para la desincorporación.')
    }
    const [result] = await pool.query(
      `UPDATE tmab_m
      SET
        bim_inc = ?,
        com_ide = ?,
        bim_fed = ?
      WHERE
        bim_ide = ?;
    `,
      [id]
    )
    return result.affectedRows > 0
  }

  static async getAllPaginated ({ page = 1, limit = 20, filters = {} }) {
    const offset = (page - 1) * limit

    // Construcción de cláusulas WHERE dinámicas
    const whereClauses = []
    const queryParams = []

    // Filtros
    if (filters.estado) {
      whereClauses.push('b.est_ide = ?')
      queryParams.push(filters.estado)
    }

    if (filters.inc) {
      whereClauses.push('b.bim_inc = ?')
      queryParams.push(filters.inc)
    }

    if (filters.dep) {
      whereClauses.push('b.dep_ide = ?')
      queryParams.push(filters.dep)
    }

    if (filters.con) {
      whereClauses.push('b.con_ide = ?')
      queryParams.push(filters.con)
    }

    if (filters.esu) {
      whereClauses.push('b.esu_ide = ?')
      queryParams.push(filters.esu)
    }

    // Construcción de la consulta base
    let baseQuery = `SELECT b.*, d.dep_nom AS departamento FROM tmab_m b
    LEFT JOIN tesdep d ON b.dep_ide=d.dep_ide`

    // Agregar WHERE si hay filtros
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ')
    }

    // Consulta paginada
    const paginatedQuery = `${baseQuery} ORDER BY b.bim_ide ASC LIMIT ? OFFSET ?`
    const paginatedParams = [...queryParams, limit, offset]

    const [rows] = await pool.query(paginatedQuery, paginatedParams)

    // Consulta para el total (aplicando los mismos filtros)
    const countQuery = `SELECT COUNT(*) as total FROM tmab_m b${
        whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : ''
    }`
    const [[{ total }]] = await pool.query(countQuery, queryParams)
    return {
      data: rows,
      total
    }
  }

  static async getTotalCount ({ filters = {} }) {
    // Construcción de cláusulas WHERE dinámicas
    const whereClauses = []
    const queryParams = []

    // Filtros (los mismos que en tu ejemplo original)
    if (filters.estado) {
      whereClauses.push('b.est_ide = ?')
      queryParams.push(filters.estado)
    }

    if (filters.inc) {
      whereClauses.push('b.bim_inc = ?')
      queryParams.push(filters.inc)
    }

    if (filters.dep) {
      whereClauses.push('b.dep_ide = ?')
      queryParams.push(filters.dep)
    }

    if (filters.con) {
      whereClauses.push('b.con_ide = ?')
      queryParams.push(filters.con)
    }

    if (filters.esu) {
      whereClauses.push('b.esu_ide = ?')
      queryParams.push(filters.esu)
    }

    if (filters.fechaIncorporacionDesde) {
      whereClauses.push('b.bim_fec >= ?')
      queryParams.push(filters.fechaIncorporacionDesde)
    }
    if (filters.fechaIncorporacionHasta) {
      whereClauses.push('b.bim_fec <= ?')
      queryParams.push(filters.fechaIncorporacionHasta)
    }

    // Filtros para bim_fed (fecha de desincorporación)
    if (filters.fechaDesincorporacionDesde) {
      whereClauses.push('b.bim_fed >= ?')
      queryParams.push(filters.fechaDesincorporacionDesde)
    }
    if (filters.fechaDesincorporacionHasta) {
      whereClauses.push('b.bim_fed <= ?')
      queryParams.push(filters.fechaDesincorporacionHasta)
    }

    // Construcción de la consulta COUNT
    let countQuery = 'SELECT COUNT(*) as total FROM tmab_m b'

    // Agregar WHERE si hay filtros
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ')
    }

    // Ejecutar consulta y devolver solo el total
    const [[{ total }]] = await pool.query(countQuery, queryParams)
    return { total }
  }

  static async getByCode (codigo) {
    const [rows] = await pool.query(
      'SELECT * FROM tmab_m WHERE bim_cod = ?',
      [codigo]
    )
    return rows[0] || null
  }

  static async searchByNombre (searchTerm, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit
    const [rows] = await pool.query(`
      SELECT b.* 
      FROM tmab_m b
      WHERE (b.bim_des LIKE ? OR b.bim_ide LIKE ?)
      AND b.bim_inc = 1
      ORDER BY b.bim_ide ASC
      LIMIT ? OFFSET ?
      `, [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset])

    return rows
  }

  static async countByDepartamento (departamentoId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM tmab_m WHERE dep_ide = ? AND bim_inc = 1',
      [departamentoId]
    )
    return rows[0].count
  }
}
