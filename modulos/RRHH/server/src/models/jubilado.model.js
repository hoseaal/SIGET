/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class JubiladoModel {

  // --- HELPERS DE FILTRADO ---
  static _buildWhere(filters) {
    const where = []
    const params = []

    // Filtro para Jubilados (estatus_id = 3 en estatus_funcionarios)
    where.push('e.estatus_id = 3')

    if (filters.search) {
      where.push('(e.nombres LIKE ? OR e.apellidos LIKE ? OR e.cedula LIKE ?)')
      const like = `%${filters.search}%`
      params.push(like, like, like)
    }

    if (filters.profesion_id) {
      where.push('e.profesion_id = ?');
      params.push(filters.profesion_id)
    }

    if (filters.genero) {
      where.push('e.genero = ?');
      params.push(filters.genero)
    }

    if (filters.direccion_id) {
      where.push('dl.direccion_id = ?')
      params.push(filters.direccion_id)
    }

    return {
      whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
      params
    }
  }

  // --- LISTA CON FILTROS Y PAGINACIÓN ---
  static async getFiltered({ limit, offset, ...filters }) {
    const { whereClause, params } = this._buildWhere(filters)

    let sql = `
      SELECT e.*,
             TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
             j.jubilado_id, j.porcentaje_jubilacion, j.fecha_efectiva,
             dl.cargo_cet_id, dl.cargo_onapre_id, dl.condicion_laboral_id,
             dl.direccion_id, dl.division_id, dl.unidad_id,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             niv.salario_base,
             cl.nombre AS condicion_nombre,
             p.nombre AS profesion_nombre,
             dir.nombre AS direccion_nombre,
             divi.nombre AS division_nombre,
             uni.nombre AS unidad_nombre
      FROM empleados e
      INNER JOIN jubilados j ON e.empleado_id = j.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON dl.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN condiciones_laborales cl ON dl.condicion_laboral_id = cl.condicion_laboral_id
      LEFT JOIN profesiones p ON e.profesion_id = p.profesion_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      ${whereClause}
      ORDER BY e.apellidos ASC
    `

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
      SELECT COUNT(*) AS total
      FROM empleados e
      INNER JOIN jubilados j ON e.empleado_id = j.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      ${whereClause}
    `
    const [rows] = await pool.query(sql, params)
    return rows[0].total
  }

  // --- OBTENER POR ID ---
  static async getById(id) {
    const sql = `
      SELECT e.*,
             TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
             j.jubilado_id, j.porcentaje_jubilacion, j.fecha_efectiva,
             dl.cargo_cet_id, dl.cargo_onapre_id, dl.nivel_salarial_id,
             dl.nivel_salarial_antiguo_id, dl.condicion_laboral_id,
             dl.prima_profesional_id, dl.direccion_id, dl.division_id, dl.unidad_id,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             niv.salario_base,
             cl.nombre AS condicion_nombre,
             p.nombre AS profesion_nombre,
             dir.nombre AS direccion_nombre,
             divi.nombre AS division_nombre,
             uni.nombre AS unidad_nombre
      FROM empleados e
      INNER JOIN jubilados j ON e.empleado_id = j.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON dl.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN condiciones_laborales cl ON dl.condicion_laboral_id = cl.condicion_laboral_id
      LEFT JOIN profesiones p ON e.profesion_id = p.profesion_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      WHERE j.jubilado_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  /**
   * TRANSACCIÓN DE REGISTRO COMPLETO DE JUBILADO
   * 1. Inserta datos personales en `empleados` (estatus_id = 3 = Jubilado)
   * 2. Inserta datos laborales en `datos_laborales` (si los hay)
   * 3. Inserta el registro de jubilación en `jubilados`
   */
  static async createTransactional(personalData, contractData, jubilacionData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // PASO 1: Crear empleado con estatus Jubilado (3)
      const personalPayload = { ...personalData, estatus_id: 3 }
      const [resEmp] = await connection.query('INSERT INTO empleados SET ?', [personalPayload])
      const empleadoId = resEmp.insertId

      // PASO 2: Crear datos laborales si existen
      if (contractData && Object.keys(contractData).length > 0) {
        const contractPayload = { ...contractData, empleado_id: empleadoId }
        await connection.query('INSERT INTO datos_laborales SET ?', [contractPayload])
      }

      // PASO 3: Crear registro de jubilación
      const jubPayload = { ...jubilacionData, empleado_id: empleadoId }
      const [resJub] = await connection.query('INSERT INTO jubilados SET ?', [jubPayload])

      await connection.commit()
      return { jubilado_id: resJub.insertId, empleado_id: empleadoId }

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * TRANSACCIÓN DE ACTUALIZACIÓN
   * Actualiza datos personales, laborales y de jubilación
   */
  static async updateTransactional(jubiladoId, personalData, contractData, jubilacionData) {
    const connection = await pool.getConnection()

    try {
      // Obtener empleado_id a partir de jubilado_id
      const [[jubRow]] = await connection.query('SELECT empleado_id FROM jubilados WHERE jubilado_id = ?', [jubiladoId])
      if (!jubRow) throw new Error('Registro de jubilado no encontrado')
      const empleadoId = jubRow.empleado_id

      await connection.beginTransaction()

      // Actualizar datos personales
      if (personalData && Object.keys(personalData).length > 0) {
        await connection.query('UPDATE empleados SET ? WHERE empleado_id = ?', [personalData, empleadoId])
      }

      // Actualizar/insertar datos laborales
      if (contractData && Object.keys(contractData).length > 0) {
        const [dlRows] = await connection.query('SELECT empleado_id FROM datos_laborales WHERE empleado_id = ?', [empleadoId])
        if (dlRows.length > 0) {
          await connection.query('UPDATE datos_laborales SET ? WHERE empleado_id = ?', [contractData, empleadoId])
        } else {
          await connection.query('INSERT INTO datos_laborales SET ?', [{ ...contractData, empleado_id: empleadoId }])
        }
      }

      // Actualizar datos de jubilación
      if (jubilacionData && Object.keys(jubilacionData).length > 0) {
        await connection.query('UPDATE jubilados SET ? WHERE jubilado_id = ?', [jubilacionData, jubiladoId])
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
    // Eliminar empleado en cascada (jubilados y datos_laborales deben tener FK con CASCADE)
    const [[jubRow]] = await pool.query('SELECT empleado_id FROM jubilados WHERE jubilado_id = ?', [id])
    if (!jubRow) return false
    const [result] = await pool.query('DELETE FROM empleados WHERE empleado_id = ?', [jubRow.empleado_id])
    return result.affectedRows > 0
  }
}