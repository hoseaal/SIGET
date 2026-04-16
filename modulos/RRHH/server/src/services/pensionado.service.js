import pool from '../utils/database.js'

export class PensionadoService {

    // Construye la cláusula WHERE dinámicamente
    static _buildWhere(filters) {
        const where = []
        const params = []

        // Filtro para Pensionados (estatus_id = 4 según tu tabla estatus_funcionarios)
        where.push(`e.estatus_id = 4`)

        // Filtro global de búsqueda
        if (filters.search) {
            where.push('(e.nombres LIKE ? OR e.apellidos LIKE ? OR e.cedula LIKE ?)')
            const like = `%${filters.search}%`
            params.push(like, like, like)
        }

        // Filtros específicos
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
        if (filters.condicion_laboral_id) {
            where.push('dl.condicion_laboral_id = ?')
            params.push(filters.condicion_laboral_id)
        }

        // Rango de edad
        if (filters.edad_min) {
            where.push('TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) >= ?')
            params.push(filters.edad_min)
        }
        if (filters.edad_max) {
            where.push('TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) <= ?')
            params.push(filters.edad_max)
        }

        // Rango de fechas de ingreso
        if (filters.fecha_ingreso_desde) {
            where.push('e.fecha_ingreso >= ?')
            params.push(filters.fecha_ingreso_desde)
        }
        if (filters.fecha_ingreso_hasta) {
            where.push('e.fecha_ingreso <= ?')
            params.push(filters.fecha_ingreso_hasta)
        }

        return {
            whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
            params
        }
    }

    static async _vincularNivelesSalariales (datosContratoClean) {
        if (datosContratoClean && datosContratoClean.nivel_salarial_id) {
           const [oldLevelRows] = await pool.query(`
             SELECT nsa.nivel_salarial_antiguo_id
             FROM niveles_salariales_antiguos nsa
             INNER JOIN niveles_salariales ns ON ns.nombre = nsa.nombre
             WHERE ns.nivel_salarial_id = ?
           `, [datosContratoClean.nivel_salarial_id])
    
           if (oldLevelRows && oldLevelRows.length > 0) {
              datosContratoClean.nivel_salarial_antiguo_id = oldLevelRows[0].nivel_salarial_antiguo_id
           }
        }
    }

    // Obtener lista paginada de pensionados
    static async getFiltered({ limit, offset, ...filters }) {
        const { whereClause, params } = this._buildWhere(filters)

        let sql = `
      SELECT 
        e.*,
        e.empleado_id AS pensionado_id,
        TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) as edad,
        TIMESTAMPDIFF(YEAR, e.fecha_ingreso, CURDATE()) as años_servicio,
        dl.cargo_cet_id, 
        dl.cargo_onapre_id,
        dl.nivel_salarial_id, 
        dl.condicion_laboral_id,
        dl.unidad_id, 
        dl.division_id, 
        dl.direccion_id,
        dl.prima_profesional_id,
        cet.nombre AS cargo_cet_nombre,
        ns.salario_base,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre,
        prof.nombre AS profesion_nombre,
        ef.nombre AS estatus_nombre,
        pp.porcentaje_actual AS prima_profesional_porcentaje,
        pp.descripcion AS prima_profesional_descripcion
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      LEFT JOIN profesiones prof ON e.profesion_id = prof.profesion_id
      LEFT JOIN estatus_funcionarios ef ON e.estatus_id = ef.estatus_id
      LEFT JOIN primas_profesionalizacion pp ON dl.prima_profesional_id = pp.prima_profesional_id
      ${whereClause}
      ORDER BY e.apellidos ASC, e.nombres ASC
    `

        if (limit !== null && limit !== undefined) {
            sql += ' LIMIT ? OFFSET ?'
            params.push(limit, offset)
        }

        const [rows] = await pool.query(sql, params)
        return rows
    }

    // Contar total de pensionados (para paginación)
    static async countFiltered(filters) {
        const { whereClause, params } = this._buildWhere(filters)
        const sql = `
      SELECT COUNT(*) as total 
      FROM empleados e 
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      ${whereClause}
    `
        const [rows] = await pool.query(sql, params)
        return rows[0].total
    }

    // Obtener un pensionado por ID
    static async getById(id) {
        const sql = `
      SELECT 
        e.*,
        e.empleado_id AS pensionado_id,
        TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) as edad,
        TIMESTAMPDIFF(YEAR, e.fecha_ingreso, CURDATE()) as años_servicio,
        dl.cargo_cet_id, 
        dl.cargo_onapre_id,
        dl.nivel_salarial_id, 
        dl.nivel_salarial_antiguo_id,
        dl.condicion_laboral_id,
        dl.unidad_id, 
        dl.division_id, 
        dl.direccion_id,
        dl.prima_profesional_id,
        cet.nombre AS cargo_cet_nombre,
        ns.salario_base,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre,
        prof.nombre AS profesion_nombre,
        ef.nombre AS estatus_nombre,
        pp.porcentaje_actual AS prima_profesional_porcentaje,
        pp.descripcion AS prima_profesional_descripcion
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      LEFT JOIN profesiones prof ON e.profesion_id = prof.profesion_id
      LEFT JOIN estatus_funcionarios ef ON e.estatus_id = ef.estatus_id
      LEFT JOIN primas_profesionalizacion pp ON dl.prima_profesional_id = pp.prima_profesional_id
      WHERE e.empleado_id = ? AND e.estatus_id = 4
    `
        const [rows] = await pool.query(sql, [id])
        return rows[0] || null
    }

    // Verificar si existe un empleado con la misma cédula
    static async existsByCedula(cedula) {
        const [rows] = await pool.query(
            'SELECT empleado_id FROM empleados WHERE cedula = ?',
            [cedula]
        )
        return rows[0] || null
    }

    // Verificar si un empleado ya es pensionado
    static async isPensionado(empleadoId) {
        const [rows] = await pool.query(
            'SELECT 1 FROM empleados WHERE empleado_id = ? AND estatus_id = 4',
            [empleadoId]
        )
        return rows.length > 0
    }

    // Cambiar estatus a Pensionado
    static async updateToPensionado(id) {
        const [result] = await pool.query(
            'UPDATE empleados SET estatus_id = 4 WHERE empleado_id = ?',
            [id]
        )
        return result.affectedRows > 0
    }

    // --- TRANSACCIÓN: CREATE (Registrar nuevo pensionado) ---
    static async createTransactional(personalData, laboralData) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // Insertar en empleados (estatus_id = 4 para Pensionado)
            const empleadoData = {
                ...personalData,
                estatus_id: 4  // Según tu tabla estatus_funcionarios, 4 = Pensionado
            }

            // Eliminar campos undefined
            Object.keys(empleadoData).forEach(key => {
                if (empleadoData[key] === undefined || empleadoData[key] === '') {
                    delete empleadoData[key]
                }
            })

            const [resEmpleado] = await connection.query('INSERT INTO empleados SET ?', [empleadoData])
            const empleadoId = resEmpleado.insertId

            // Insertar en datos_laborales si hay datos
            if (laboralData && Object.keys(laboralData).length > 0) {
                await this._vincularNivelesSalariales(laboralData)
                const laboralPayload = {
                    ...laboralData,
                    empleado_id: empleadoId
                }
                await connection.query('INSERT INTO datos_laborales SET ?', [laboralPayload])
            }

            await connection.commit()
            return { empleado_id: empleadoId, ...personalData, laboral: laboralData }

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    // --- TRANSACCIÓN: UPDATE (Actualizar pensionado existente) ---
    static async updateTransactional(id, personalData, laboralData) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // Actualizar datos personales
            if (personalData && Object.keys(personalData).length > 0) {
                await connection.query('UPDATE empleados SET ? WHERE empleado_id = ?', [personalData, id])
            }

            // Actualizar datos laborales
            if (laboralData && Object.keys(laboralData).length > 0) {
                await this._vincularNivelesSalariales(laboralData)
                const [rows] = await connection.query(
                    'SELECT empleado_id FROM datos_laborales WHERE empleado_id = ?',
                    [id]
                )
                if (rows.length > 0) {
                    await connection.query('UPDATE datos_laborales SET ? WHERE empleado_id = ?', [laboralData, id])
                } else {
                    await connection.query('INSERT INTO datos_laborales SET ?', [{ ...laboralData, empleado_id: id }])
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

    // --- DELETE (Eliminar pensionado) ---
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM empleados WHERE empleado_id = ? AND estatus_id = 4', [id])
        return result.affectedRows > 0
    }

    // Obtener estadísticas de pensionados
    static async getStats() {
        const sql = `
      SELECT 
        COUNT(*) as total_pensionados,
        SUM(CASE WHEN e.genero = 'M' THEN 1 ELSE 0 END) as total_hombres,
        SUM(CASE WHEN e.genero = 'F' THEN 1 ELSE 0 END) as total_mujeres,
        AVG(TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE())) as promedio_edad,
        AVG(TIMESTAMPDIFF(YEAR, e.fecha_ingreso, CURDATE())) as promedio_servicio,
        COUNT(DISTINCT dl.direccion_id) as direcciones_representadas,
        COUNT(DISTINCT e.profesion_id) as profesiones_representadas,
        (
          SELECT COUNT(*) 
          FROM empleados e2 
          WHERE e2.estatus_id = 4 
          AND YEAR(e2.fecha_ingreso) = YEAR(CURDATE())
        ) as ingresos_anio_actual
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      WHERE e.estatus_id = 4
    `
        const [rows] = await pool.query(sql)
        return rows[0]
    }

    // Obtener pensionados por dirección
    static async getByDireccion(direccionId) {
        const sql = `
      SELECT 
        e.empleado_id, e.cedula, e.nombres, e.apellidos,
        cet.nombre AS cargo,
        e.fecha_ingreso,
        TIMESTAMPDIFF(YEAR, e.fecha_ingreso, CURDATE()) as años_servicio
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      WHERE e.estatus_id = 4 AND dl.direccion_id = ?
      ORDER BY e.apellidos ASC
    `
        const [rows] = await pool.query(sql, [direccionId])
        return rows
    }

    // Cambiar estatus de pensionado a otro estado (ej: activo nuevamente)
    static async changeStatus(id, newStatusId) {
        const [result] = await pool.query(
            'UPDATE empleados SET estatus_id = ? WHERE empleado_id = ? AND estatus_id = 4',
            [newStatusId, id]
        )
        return result.affectedRows > 0
    }
}