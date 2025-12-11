/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class FuncionarioModel {

  // Construye la cláusula WHERE dinámicamente
  static _buildWhere (filters) {
    const where = []
    const params = []

    // Filtro global de búsqueda
    if (filters.search) {
      where.push('(t.fun_nom LIKE ? OR t.fun_ape LIKE ? OR t.fun_ced LIKE ?)')
      const like = `%${filters.search}%`
      params.push(like, like, like)
    }

    // Filtros específicos (deben mapearse con alias 't.' o 'c.')
    if (filters.pro_ide) { where.push('t.pro_ide = ?'); params.push(filters.pro_ide) }
    if (filters.est_ide) { where.push('t.est_ide = ?'); params.push(filters.est_ide) }
    if (filters.fun_gen) { where.push('t.fun_gen = ?'); params.push(filters.fun_gen) }

    // Rango de edad (calculado en SQL)
    if (filters.edad_min) {
      where.push('TIMESTAMPDIFF(YEAR, t.fun_fna, CURDATE()) >= ?')
      params.push(filters.edad_min)
    }
    if (filters.edad_max) {
      where.push('TIMESTAMPDIFF(YEAR, t.fun_fna, CURDATE()) <= ?')
      params.push(filters.edad_max)
    }

    return {
      whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
      params
    }
  }

  static async getFiltered ({ limit, offset, includeContract, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)
    
    let sql = ''
    
    // Query condicional (FULL JOIN vs SIMPLE)
    if (includeContract) {
      sql = `
        SELECT t.*, 
               TIMESTAMPDIFF(YEAR, t.fun_fna, CURDATE()) as edad,
               c.cet_ide, c.ona_ide, c.niv_ide, c.col_ide, c.uni_ide, c.div_ide, c.dir_ide,
               cet.cet_nom, ona.ona_nom, niv.niv_sal, dir.dir_nom, uni.uni_nom, divi.div_nom
        FROM tmafun t
        LEFT JOIN tesfun c ON t.fun_ide = c.fun_ide
        LEFT JOIN tmacet cet ON c.cet_ide = cet.cet_ide
        LEFT JOIN tmaona ona ON c.ona_ide = ona.ona_ide
        LEFT JOIN tesniv niv ON c.niv_ide = niv.niv_ide
        LEFT JOIN tmadir dir ON c.dir_ide = dir.dir_ide
        LEFT JOIN tesdiv divi ON c.div_ide = divi.div_ide
        LEFT JOIN tesuni uni ON c.uni_ide = uni.uni_ide
        ${whereClause}
        ORDER BY t.fun_ape ASC
      `
    } else {
      // Solo tabla personal
      sql = `
        SELECT *, TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) as edad 
        FROM tmafun t 
        ${whereClause} 
        ORDER BY fun_ape ASC
      `
    }

    // Aplicar Paginación si existe limit
    if (limit !== null && limit !== undefined) {
      sql += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async countFiltered (filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `SELECT COUNT(*) as total FROM tmafun t ${whereClause}`
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  static async getById (id, includeContract) {
    let sql = ''
    if (includeContract) {
      sql = `
        SELECT t.*, 
               c.*, 
               cet.cet_nom, ona.ona_nom, niv.niv_sal, dir.dir_nom, uni.uni_nom
        FROM tmafun t 
        LEFT JOIN tesfun c ON t.fun_ide = c.fun_ide 
        LEFT JOIN tmacet cet ON c.cet_ide = cet.cet_ide
        LEFT JOIN tmaona ona ON c.ona_ide = ona.ona_ide
        LEFT JOIN tesniv niv ON c.niv_ide = niv.niv_ide
        LEFT JOIN tmadir dir ON c.dir_ide = dir.dir_ide
        LEFT JOIN tesuni uni ON c.uni_ide = uni.uni_ide
        WHERE t.fun_ide = ?
      `
    } else {
      sql = 'SELECT *, TIMESTAMPDIFF(YEAR, fun_fna, CURDATE()) as edad FROM tmafun WHERE fun_ide = ?'
    }
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  // --- TRANSACCIÓN: CREATE ---
  static async createTransactional (personalData, contractData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Insert tmafun
      // Al venir de _separarDatos, personalData está limpio
      const [resFun] = await connection.query('INSERT INTO tmafun SET ?', [personalData])
      const funId = resFun.insertId

      // 2. Insert tesfun (si existe)
      if (contractData && Object.keys(contractData).length > 0) {
        const contractPayload = { ...contractData, fun_ide: funId }
        await connection.query('INSERT INTO tesfun SET ?', [contractPayload])
      }

      await connection.commit()
      return { fun_ide: funId, ...personalData, contrato: contractData }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // --- TRANSACCIÓN: UPDATE ---
  static async updateTransactional (id, personalData, contractData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Update tmafun (Solo si hay campos personales)
      if (personalData && Object.keys(personalData).length > 0) {
        await connection.query('UPDATE tmafun SET ? WHERE fun_ide = ?', [personalData, id])
      }

      // 2. Upsert tesfun (Solo si hay campos contractuales)
      if (contractData && Object.keys(contractData).length > 0) {
        // Verificamos si ya tiene registro en tesfun
        const [rows] = await connection.query('SELECT fun_ide FROM tesfun WHERE fun_ide = ?', [id])
        
        if (rows.length > 0) {
          // Update existente
          await connection.query('UPDATE tesfun SET ? WHERE fun_ide = ?', [contractData, id])
        } else {
          // Insert nuevo (Upsert manual)
          await connection.query('INSERT INTO tesfun SET ?', [{ ...contractData, fun_ide: id }])
        }
      }

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete (id) {
    // Al eliminar de tmafun, la FK ON DELETE CASCADE elimina de tesfun automáticamente
    const [result] = await pool.query('DELETE FROM tmafun WHERE fun_ide = ?', [id])
    return result.affectedRows > 0
  }
}