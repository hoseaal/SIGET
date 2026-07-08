
import pool from '../utils/database.js'

export class FuncionarioModel {

  // Construye la cláusula WHERE dinámicamente
  static _buildWhere(filters) {
    const where = []
    const params = []

    // EXCLUSIÓN ESTRICTA: Nunca mostrar obreros en el listado de funcionarios
    // Verifica tanto cargo CET como cargo ONAPRE — basta que uno coincida para excluir
    where.push(`NOT EXISTS (
      SELECT 1 FROM datos_laborales dl_ob
      LEFT JOIN cargos_cet  cet_ob ON dl_ob.cargo_cet_id  = cet_ob.cargo_cet_id
      LEFT JOIN cargos_onapre ona_ob ON dl_ob.cargo_onapre_id = ona_ob.cargo_onapre_id
      WHERE dl_ob.empleado_id = t.empleado_id
      AND (
        cet_ob.nombre LIKE '%OBRERO%'    OR cet_ob.nombre LIKE '%ASEADOR%'   OR
        cet_ob.nombre LIKE '%MENSAJERO%' OR cet_ob.nombre LIKE '%VIGILANTE%' OR
        cet_ob.nombre LIKE '%CHOFER%'    OR
        ona_ob.nombre LIKE '%OBRERO%'    OR ona_ob.nombre LIKE '%ASEADOR%'   OR
        ona_ob.nombre LIKE '%MENSAJERO%' OR ona_ob.nombre LIKE '%VIGILANTE%' OR
        ona_ob.nombre LIKE '%CHOFER%'
      )
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
      where.push('EXISTS (SELECT 1 FROM datos_laborales contrato WHERE contrato.empleado_id = t.empleado_id AND contrato.direccion_id = ?)')
      params.push(filters.dep)
    }
    //Esto porque el departamento no está en la tabla personal, sino en datos_laborales (contrato), entonces hacemos un subquery para filtrar por ese campo específico de contrato.
    //De lo contrario si hubiéramos puesto un simple 't.direccion_id = ?' no funcionaría porque no existe ese campo en empleados, sino en datos_laborales, entonces con el EXISTS hacemos esa validación de que exista un contrato con ese departamento para ese funcionario.

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

  static async getFiltered({ limit, offset, includeContract, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)

    let sql = ''

    // Query condicional 
    if (includeContract) {
      sql = `
        SELECT t.*, 
               TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) as edad,
               c.cargo_cet_id, c.cargo_onapre_id, c.nivel_salarial_id, c.condicion_laboral_id, c.unidad_id, c.division_id, c.direccion_id,
               cet.nombre AS cargo_cet_nombre, ona.nombre AS cargo_onapre_nombre, niv.salario_base, dir.nombre AS direccion_nombre, divi.nombre AS division_nombre, uni.nombre AS unidad_nombre
        FROM empleados t
        LEFT JOIN datos_laborales c ON t.empleado_id = c.empleado_id
        LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
        LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
        LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
        LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
        LEFT JOIN divisiones divi ON c.division_id = divi.division_id
        LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id
        ${whereClause}
        ORDER BY 
          (c.direccion_id = (SELECT dl2.direccion_id FROM datos_laborales dl2 JOIN cargos_onapre ona2 ON dl2.cargo_onapre_id = ona2.cargo_onapre_id WHERE ona2.nombre = 'Contralor del Estado' LIMIT 1)) DESC,
          dir.nombre ASC, 
          (ona.nombre = 'Contralor del Estado') DESC,
          t.apellidos ASC
      `
    } else {
      // Solo tabla personal
      sql = `
        SELECT *, TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad 
        FROM empleados t 
        ${whereClause} 
        ORDER BY 
          (t.empleado_id = (SELECT dl2.empleado_id FROM datos_laborales dl2 JOIN cargos_onapre ona2 ON dl2.cargo_onapre_id = ona2.cargo_onapre_id WHERE ona2.nombre = 'Contralor del Estado' LIMIT 1)) DESC,
          apellidos ASC
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

  static async countFiltered(filters) {
    const { whereClause, params } = this._buildWhere(filters)
    const sql = `SELECT COUNT(*) as total FROM empleados t ${whereClause}`
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  static async getById(id, includeContract) {
    let sql = ''
    if (includeContract) {
      // AQUÍ AGREGAMOS LA LÓGICA DEL ENCARGO ACTIVO
      sql = `
        SELECT t.*, 
               TIMESTAMPDIFF(YEAR, t.fecha_nacimiento, CURDATE()) as edad,
               
               -- Datos Contrato Base (Alias normales)
               c.*, 
               cet.nombre AS cargo_cet_nombre, ona.nombre AS cargo_onapre_nombre, niv.salario_base, dir.nombre AS direccion_nombre, divi.nombre AS division_nombre, uni.nombre AS unidad_nombre,

               -- Datos Encargo Activo (Alias con prefijo 'enc_')
               e.encargo_id as enc_id, e.fecha_inicio as enc_fecha_inicio,
               ecet.nombre as enc_cargo,
               eniv.salario_base as enc_salario,
               edir.nombre as enc_direccion,
               euni.nombre as enc_unidad

        FROM empleados t 
        -- Joins Contrato Base
        LEFT JOIN datos_laborales c ON t.empleado_id = c.empleado_id 
        LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
        LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
        LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
        LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
        LEFT JOIN divisiones divi ON c.division_id = divi.division_id
        LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id
        
        -- Joins Encargo (Solo si es activo est=1)
        LEFT JOIN encargos_temporales e ON t.empleado_id = e.empleado_id AND e.estatus_encargo = 1
        LEFT JOIN cargos_cet ecet ON e.cargo_cet_id = ecet.cargo_cet_id
        LEFT JOIN niveles_salariales eniv ON e.nivel_salarial_id = eniv.nivel_salarial_id
        LEFT JOIN direcciones edir ON e.direccion_id = edir.direccion_id
        LEFT JOIN unidades euni ON e.unidad_id = euni.unidad_id

        WHERE t.empleado_id = ?
      `
    } else {
      sql = 'SELECT *, TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad FROM empleados WHERE empleado_id = ?'
    }
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  // --- TRANSACCIÓN: CREATE ---
  static async createTransactional(personalData, contractData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Insert empleados
      const [resFun] = await connection.query('INSERT INTO empleados SET ?', [personalData])
      const funId = resFun.insertId

      // 2. Insert datos_laborales (si existe)
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

      // 1. Update empleados
      if (personalData && Object.keys(personalData).length > 0) {
        await connection.query('UPDATE empleados SET ? WHERE empleado_id = ?', [personalData, id])
      }

      // 2. Upsert datos_laborales
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

  static async createEncargo(data) {
    // Validamos si ya tiene uno activo para evitar duplicidad lógica
    const [activos] = await pool.query('SELECT encargo_id FROM encargos_temporales WHERE empleado_id = ? AND estatus_encargo = 1', [data.empleado_id])
    if (activos.length > 0) {
      throw new Error('El funcionario ya tiene un encargo activo. Debe finalizarlo primero.')
    }

    const sql = `INSERT INTO encargos_temporales SET ?`
    const [result] = await pool.query(sql, data)
    return result.insertId
  }

  static async deactivateEncargo(empleado_id) {
    // Actualizamos el encargo activo, poniendo fecha fin HOY (CURDATE) y estatus 0
    const sql = `
      UPDATE encargos_temporales 
      SET estatus_encargo = 0, fecha_fin = CURDATE() 
      WHERE empleado_id = ? AND estatus_encargo = 1
    `
    const [result] = await pool.query(sql, [empleado_id])
    return result.affectedRows > 0
  }
}