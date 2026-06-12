/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class PensionadoModel {

    // --- HELPERS DE FILTRADO ---
    static _buildWhere(filters) {
        const where = []
        const params = []

        // Filtro para Pensionados (estatus_id = 4)
        where.push('e.estatus_id = 4')

        if (filters.search) {
            where.push('(e.nombres LIKE ? OR e.apellidos LIKE ? OR e.cedula LIKE ?)')
            const like = `%${filters.search}%`
            params.push(like, like, like)
        }

        if (filters.profesion_id) { where.push('e.profesion_id = ?'); params.push(filters.profesion_id) }
        if (filters.genero) { where.push('e.genero = ?'); params.push(filters.genero) }

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
             e.empleado_id AS pensionado_id,
             TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
             p_table.id_pensionado, p_table.fecha_ingreso AS fecha_ingreso_pension, p_table.motivo_pension, p_table.observacion,
              dl.cargo_cet_id, dl.cargo_onapre_id, dl.condicion_laboral_id,
              cet.nombre AS cargo_cet_nombre,
              ona.nombre AS cargo_onapre_nombre,
              niv.salario_base,
              cl.nombre AS condicion_nombre,
              p.nombre AS profesion_nombre,
              dir.nombre AS direccion_nombre,
              divi.nombre AS division_nombre,
              uni.nombre AS unidad_nombre
      FROM empleados e
      LEFT JOIN pensionado p_table ON e.empleado_id = p_table.empleado_id
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
             e.empleado_id AS pensionado_id,
             TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
             p_table.id_pensionado, p_table.fecha_ingreso AS fecha_ingreso_pension, p_table.motivo_pension, p_table.observacion,
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
      LEFT JOIN pensionado p_table ON e.empleado_id = p_table.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON dl.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN condiciones_laborales cl ON dl.condicion_laboral_id = cl.condicion_laboral_id
      LEFT JOIN profesiones p ON e.profesion_id = p.profesion_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      WHERE e.empleado_id = ? AND e.estatus_id = 4
    `
        const [rows] = await pool.query(sql, [id])
        return rows[0] || null
    }

    /**
     * TRANSACCIÓN DE REGISTRO COMPLETO DE PENSIONADO
     */
    static async createTransactional(personalData, contractData, pensionData) {
        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            // PASO 1: Crear empleado con estatus Pensionado (4)
            const personalPayload = { ...personalData, estatus_id: 4 }
            const [resEmp] = await connection.query('INSERT INTO empleados SET ?', [personalPayload])
            const empleadoId = resEmp.insertId

            // PASO 2: Crear datos laborales si existen
            if (contractData && Object.keys(contractData).length > 0) {
                const contractPayload = { ...contractData, empleado_id: empleadoId }
                await connection.query('INSERT INTO datos_laborales SET ?', [contractPayload])
            }

            // PASO 3: Crear datos de pensión (Se crea la relación siempre)
            const pensionPayload = { ...(pensionData || {}), empleado_id: empleadoId }
            await connection.query('INSERT INTO pensionado SET ?', [pensionPayload])

            await connection.commit()
            return { empleado_id: empleadoId }

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    /**
     * TRANSACCIÓN DE ACTUALIZACIÓN
     */
    static async updateTransactional(empleadoId, personalData, contractData, pensionData) {
        const connection = await pool.getConnection()

        try {
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

            // Actualizar/insertar datos de pensión
            if (pensionData && Object.keys(pensionData).length > 0) {
                const [pRows] = await connection.query('SELECT empleado_id FROM pensionado WHERE empleado_id = ?', [empleadoId])
                if (pRows.length > 0) {
                    await connection.query('UPDATE pensionado SET ? WHERE empleado_id = ?', [pensionData, empleadoId])
                } else {
                    await connection.query('INSERT INTO pensionado SET ?', [{ ...pensionData, empleado_id: empleadoId }])
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
        const [result] = await pool.query('DELETE FROM empleados WHERE empleado_id = ? AND estatus_id = 4', [id])
        return result.affectedRows > 0
    }
}