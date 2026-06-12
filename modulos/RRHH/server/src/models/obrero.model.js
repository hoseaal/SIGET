import pool from '../utils/database.js'

export class ObreroModel {

  // Construye la cláusula WHERE dinámicamente
  static _buildWhere(filters) {
    const where = []
    const params = []

    // Filtro estricto para Obreros Fijos (incluye Chofer)
    where.push(`c.condicion_laboral_id = 1`)
    where.push(`(
      cet.nombre LIKE '%OBRERO%' OR cet.nombre LIKE '%ASEADOR%' OR cet.nombre LIKE '%MENSAJERO%' OR cet.nombre LIKE '%VIGILANTE%' OR cet.nombre LIKE '%CHOFER%' OR
      ona.nombre LIKE '%OBRERO%' OR ona.nombre LIKE '%ASEADOR%' OR ona.nombre LIKE '%MENSAJERO%' OR ona.nombre LIKE '%VIGILANTE%' OR ona.nombre LIKE '%CHOFER%'
    )`)

    // Filtro global de búsqueda
    if (filters.search) {
      where.push('(t.nombres LIKE ? OR t.apellidos LIKE ? OR t.cedula LIKE ?)')
      const like = `%${filters.search}%`
      params.push(like, like, like)
    }

    // Filtros específicos de la tabla personal
    if (filters.profesion_id) { where.push('t.profesion_id = ?'); params.push(filters.profesion_id) }
    if (filters.estatus_id) {
      if (Number(filters.estatus_id) === 1) {
        where.push('t.estatus_id IN (1, 8, 9)')
      } else {
        where.push('t.estatus_id = ?')
        params.push(filters.estatus_id)
      }
    }
    if (filters.genero) { where.push('t.genero = ?'); params.push(filters.genero) }
    if (filters.dep) {
      where.push('c.direccion_id = ?')
      params.push(filters.dep)
    }

    // Rango de edad (calculado en SQL)
    if (filters.edad_min) {
      where.push('TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) >= ?')
      params.push(filters.edad_min)
    }
    if (filters.edad_max) {
      where.push('TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) <= ?')
      params.push(filters.edad_max)
    }

    return {
      whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
      params
    }
  }

  static async getFiltered({ limit, offset, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)

    // Siempre incluimos los joins porque necesitamos filtrar por cargo
    let sql = `
      SELECT t.*, 
             TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) as edad,
             c.cargo_cet_id, c.cargo_onapre_id, c.nivel_salarial_id, c.condicion_laboral_id, c.unidad_id, c.division_id, c.direccion_id,
             cet.nombre AS cargo_cet_nombre, ona.nombre AS cargo_onapre_nombre, niv.salario_base, dir.nombre AS direccion_nombre, divi.nombre AS division_nombre, uni.nombre AS unidad_nombre
      FROM empleados t
      INNER JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      INNER JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      INNER JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON c.division_id = divi.division_id
      LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id
      ${whereClause}
      ORDER BY t.apellidos ASC
    `

    // Aplicar Paginación si existe limit
    if (limit !== null && limit !== undefined) {
      sql += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async countFiltered(filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `
      SELECT COUNT(*) as total 
      FROM empleados t 
      INNER JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      INNER JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      INNER JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      ${whereClause}
    `
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  static async getById(id) {
    const sql = `
      SELECT t.*, 
             TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) as edad,
             c.*, 
             cet.nombre AS cargo_cet_nombre, ona.nombre AS cargo_onapre_nombre, niv.salario_base, dir.nombre AS direccion_nombre, divi.nombre AS division_nombre, uni.nombre AS unidad_nombre,
             
             -- Datos Encargo Activo si los tiene
             e.encargo_id as enc_id, e.fecha_inicio as enc_fecha_inicio,
             ecet.nombre as enc_cargo,
             eniv.salario_base as enc_salario,
             edir.nombre as enc_direccion,
             euni.nombre as enc_unidad

      FROM empleados t 
      INNER JOIN datos_laborales c ON t.empleado_id = c.empleado_id 
      INNER JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      INNER JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON c.division_id = divi.division_id
      LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id

      LEFT JOIN encargos_temporales e ON t.empleado_id = e.empleado_id AND e.estatus_encargo = 1
      LEFT JOIN cargos_cet ecet ON e.cargo_cet_id = ecet.cargo_cet_id
      LEFT JOIN niveles_salariales eniv ON e.nivel_salarial_id = eniv.nivel_salarial_id
      LEFT JOIN direcciones edir ON e.direccion_id = edir.direccion_id
      LEFT JOIN unidades euni ON e.unidad_id = euni.unidad_id

      WHERE t.empleado_id = ? AND c.condicion_laboral_id = 1 AND (
      cet.nombre LIKE '%OBRERO%' OR cet.nombre LIKE '%ASEADOR%' OR cet.nombre LIKE '%MENSAJERO%' OR cet.nombre LIKE '%VIGILANTE%' OR cet.nombre LIKE '%CHOFER%' OR
      ona.nombre LIKE '%OBRERO%' OR ona.nombre LIKE '%ASEADOR%' OR ona.nombre LIKE '%MENSAJERO%' OR ona.nombre LIKE '%VIGILANTE%' OR ona.nombre LIKE '%CHOFER%'
      )
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  // --- TRANSACCIÓN: CREATE ---
  static async createTransactional(personalData, contractData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [resFun] = await connection.query('INSERT INTO empleados SET ?', [personalData])
      const funId = resFun.insertId

      if (contractData && Object.keys(contractData).length > 0) {
        const contractPayload = { ...contractData, empleado_id: funId }
        await connection.query('INSERT INTO datos_laborales SET ?', [contractPayload])
      }

      await connection.commit()
      return { empleado_id: funId, ...personalData, contrato: contractData }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // --- TRANSACCIÓN: UPDATE ---
  static async updateTransactional(id, personalData, contractData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      if (personalData && Object.keys(personalData).length > 0) {
        await connection.query('UPDATE empleados SET ? WHERE empleado_id = ?', [personalData, id])
      }

      if (contractData && Object.keys(contractData).length > 0) {
        const [rows] = await connection.query('SELECT empleado_id FROM datos_laborales WHERE empleado_id = ?', [id])
        if (rows.length > 0) {
          await connection.query('UPDATE datos_laborales SET ? WHERE empleado_id = ?', [contractData, id])
        } else {
          await connection.query('INSERT INTO datos_laborales SET ?', [{ ...contractData, empleado_id: id }])
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

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM empleados WHERE empleado_id = ?', [id])
    return result.affectedRows > 0
  }
}