import pool from '../utils/database.js'

export class BienMuebleModel {
  static async getAll (filters = {}) {
    let query = `
      SELECT 
        b.*,
        e.est_est AS estado,
        t.tip_tip AS tipo,
        f.foa_nom AS forma_adquisicion,
        c.con_con AS condicion,
        eu.esu_esu AS estado_uso,
        m.mod_mod AS modelo,
        ca.cae_cae AS categoria_especifica,
        co.com_com AS concepto,
        d.dep_nom AS departamento
      FROM tmab_m b
      LEFT JOIN tmaest e ON b.est_ide = e.est_ide
      LEFT JOIN tmatip t ON b.tip_ide = t.tip_ide
      LEFT JOIN tmafoa f ON b.foa_ide = f.foa_ide
      LEFT JOIN tmacon c ON b.con_ide = c.con_ide
      LEFT JOIN tmaesu eu ON b.esu_ide = eu.esu_ide
      LEFT JOIN tesmod m ON b.mod_ide = m.mod_ide
      LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide
      LEFT JOIN tmacom co ON b.com_ide = co.com_ide
      LEFT JOIN tesdep d ON b.dep_ide = d.dep_ide
    `

    const whereClauses = []
    const params = []

    if (filters.estado) {
      whereClauses.push('b.est_ide = ?')
      params.push(filters.estado)
    }
    // Añadir más filtros según necesidad...

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    const [rows] = await pool.query(query, params)
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(`
      SELECT * FROM tmab_m WHERE bim_ide = ?
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

  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM tmab_m WHERE bim_ide = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  static async getByCode (codigo) {
    const [rows] = await pool.query(
      'SELECT * FROM tmab_m WHERE bim_cod = ?',
      [codigo]
    )
    return rows[0] || null
  }
}
