/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class SobrevivienteModel {



    // --- HELPERS DE FILTRADO ---
    static _buildWhere(filters) {
        const where = []
        const params = []

        // Filtro para Sobrevivientes (estatus_id = 7) y status activo
        where.push('e.estatus_id = 7')
        where.push('s.status = 1')

        if (filters.search) {
            where.push('(e.nombres LIKE ? OR e.apellidos LIKE ? OR e.cedula LIKE ?)')
            const like = `%${filters.search}%`
            params.push(like, like, like)
        }

        if (filters.profesion_id) { where.push('e.profesion_id = ?'); params.push(filters.profesion_id) }
        if (filters.genero) { where.push('e.genero = ?'); params.push(filters.genero) }
        if (filters.direccion_id) { where.push('dl.direccion_id = ?'); params.push(filters.direccion_id) }

        return {
            whereClause: where.length > 0 ? 'WHERE ' + where.join(' AND ') : '',
            params
        }
    }

    // --- LISTA CON FILTROS Y PAGINACIÓN ---
    static async getFiltered({ limit, offset, ...filters }) {
        const { whereClause, params } = this._buildWhere(filters)

        let sql = `
      SELECT 
        e.*,
        e.empleado_id AS sobreviviente_id,
        TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) as edad,
        dl.cargo_cet_id, 
        dl.cargo_onapre_id,
        dl.condicion_laboral_id,
        dl.direccion_id, dl.division_id, dl.unidad_id,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        ns.salario_base,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre,
        prof.nombre AS profesion_nombre,
        ef.nombre AS estatus_nombre,
        fam.nombres AS familiar_nombres,
        fam.apellidos AS familiar_apellidos,
        s.fecha_ingreso AS fecha_ingreso_beneficio,
        s.observacion,
        (SELECT COUNT(*) FROM sobreviviente s2 WHERE s2.empleado_id = e.empleado_id) AS total_familiares
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      LEFT JOIN profesiones prof ON e.profesion_id = prof.profesion_id
      LEFT JOIN estatus_funcionarios ef ON e.estatus_id = ef.estatus_id
      INNER JOIN sobreviviente s ON e.empleado_id = s.empleado_id
      LEFT JOIN nucleo_familiar fam ON s.familiar_id = fam.familiar_id
      ${whereClause}
      GROUP BY e.empleado_id
      ORDER BY e.apellidos ASC, e.nombres ASC
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
      SELECT COUNT(*) as total 
      FROM empleados e 
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      INNER JOIN sobreviviente s ON e.empleado_id = s.empleado_id
      ${whereClause}
    `
        const [rows] = await pool.query(sql, params)
        return rows[0].total
    }

    // --- OBTENER POR ID ---
    static async getById(id) {
        const sql = `
      SELECT 
        e.*,
        e.empleado_id AS sobreviviente_id,
        TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) as edad,
        dl.cargo_cet_id, 
        dl.cargo_onapre_id,
        dl.nivel_salarial_id,
        dl.nivel_salarial_antiguo_id,
        dl.condicion_laboral_id,
        dl.prima_profesional_id,
        dl.direccion_id, dl.division_id, dl.unidad_id,
        cet.nombre AS cargo_cet_nombre,
        ona.nombre AS cargo_onapre_nombre,
        ns.salario_base,
        cl.nombre AS condicion_nombre,
        prof.nombre AS profesion_nombre,
        dir.nombre AS direccion_nombre,
        divi.nombre AS division_nombre,
        uni.nombre AS unidad_nombre
      FROM empleados e
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales ns ON dl.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN condiciones_laborales cl ON dl.condicion_laboral_id = cl.condicion_laboral_id
      LEFT JOIN profesiones prof ON e.profesion_id = prof.profesion_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
      LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
      WHERE e.empleado_id = ? AND e.estatus_id = 7
    `
        const [rows] = await pool.query(sql, [id])
        return rows[0] || null
    }

    // --- FAMILIARES DE UN SOBREVIVIENTE ---
    static async getFamiliares(empleado_id) {
        const sql = `
      SELECT 
        nf.familiar_id,
        nf.cedula,
        nf.nombres,
        nf.apellidos,
        nf.fecha_nacimiento,
        nf.estatus,
        nf.parentesco,
        nf.direccion,
        nf.telefono,
        nf.cuenta_bancaria,
        TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) as edad,
        s.id_sobreviviente,
        s.fecha_ingreso AS fecha_ingreso_beneficio,
        s.observacion
      FROM nucleo_familiar nf
      INNER JOIN sobreviviente s ON nf.familiar_id = s.familiar_id
      WHERE s.empleado_id = ?
      ORDER BY nf.fecha_nacimiento ASC
    `
        const [rows] = await pool.query(sql, [empleado_id])
        return rows
    }

    // --- VERIFICAR CÉDULA ---
    static async existsByCedula(cedula) {
        const [rows] = await pool.query(
            'SELECT empleado_id FROM empleados WHERE cedula = ?',
            [cedula]
        )
        return rows[0] || null
    }

    // --- TRANSACCIÓN: REGISTRO COMPLETO (Caso 2) ---
    static async createTransactional(personalData, laboralData, familiarData) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // PASO 1: Crear empleado con estatus Sobreviviente (7)
            const empleadoPayload = { ...personalData, estatus_id: 7 }
            Object.keys(empleadoPayload).forEach(key => {
                if (empleadoPayload[key] === undefined || empleadoPayload[key] === '') {
                    delete empleadoPayload[key]
                }
            })

            const [resEmp] = await connection.query('INSERT INTO empleados SET ?', [empleadoPayload])
            const empleadoId = resEmp.insertId

            // PASO 2: Crear datos laborales si existen
            if (laboralData && Object.keys(laboralData).length > 0) {

                const laboralPayload = { ...laboralData, empleado_id: empleadoId }
                await connection.query('INSERT INTO datos_laborales SET ?', [laboralPayload])
            }

            // PASO 3: Crear familiar y vinculación
            if (familiarData && familiarData.nombres && familiarData.apellidos) {
                const familiarPayload = {
                    cedula: familiarData.cedula || null,
                    nombres: familiarData.nombres,
                    apellidos: familiarData.apellidos,
                    fecha_nacimiento: familiarData.fecha_nacimiento || null,
                    parentesco: familiarData.parentesco || null,
                    direccion: familiarData.direccion || null,
                    telefono: familiarData.telefono || null,
                    cuenta_bancaria: familiarData.cuenta_bancaria || null,
                    estatus: 1
                }
                const [resFam] = await connection.query('INSERT INTO nucleo_familiar SET ?', [familiarPayload])
                const familiarId = resFam.insertId

                const status_val = familiarData.fecha_ingreso_beneficio ? 1 : 0;
                // Vincular en tabla sobreviviente
                await connection.query(
                    'INSERT INTO sobreviviente (empleado_id, familiar_id, fecha_ingreso, status, observacion) VALUES (?, ?, ?, ?, ?)',
                    [empleadoId, familiarId, familiarData.fecha_ingreso_beneficio || null, status_val, familiarData.observacion || null]
                )
            }

            await connection.commit()
            return { empleado_id: empleadoId }

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    // --- AGREGAR FAMILIAR A SOBREVIVIENTE EXISTENTE (Caso 1) ---
    static async addFamiliar(empleado_id, familiarData) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            const familiarPayload = {
                cedula: familiarData.cedula || null,
                nombres: familiarData.nombres,
                apellidos: familiarData.apellidos,
                fecha_nacimiento: familiarData.fecha_nacimiento || null,
                parentesco: familiarData.parentesco || null,
                direccion: familiarData.direccion || null,
                telefono: familiarData.telefono || null,
                cuenta_bancaria: familiarData.cuenta_bancaria || null,
                estatus: 1
            }
            const [resFam] = await connection.query('INSERT INTO nucleo_familiar SET ?', [familiarPayload])
            const familiarId = resFam.insertId

            const status_val = familiarData.fecha_ingreso_beneficio ? 1 : 0;
            await connection.query(
                'INSERT INTO sobreviviente (empleado_id, familiar_id, fecha_ingreso, status, observacion) VALUES (?, ?, ?, ?, ?)',
                [empleado_id, familiarId, familiarData.fecha_ingreso_beneficio || null, status_val, familiarData.observacion || null]
            )

            await connection.commit()
            return { familiar_id: familiarId }

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    // --- ACTUALIZAR EMPLEADO SOBREVIVIENTE ---
    static async updateTransactional(empleadoId, personalData, laboralData) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            if (personalData && Object.keys(personalData).length > 0) {
                await connection.query('UPDATE empleados SET ? WHERE empleado_id = ?', [personalData, empleadoId])
            }

            if (laboralData && Object.keys(laboralData).length > 0) {

                const [dlRows] = await connection.query('SELECT empleado_id FROM datos_laborales WHERE empleado_id = ?', [empleadoId])
                if (dlRows.length > 0) {
                    await connection.query('UPDATE datos_laborales SET ? WHERE empleado_id = ?', [laboralData, empleadoId])
                } else {
                    await connection.query('INSERT INTO datos_laborales SET ?', [{ ...laboralData, empleado_id: empleadoId }])
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

    // --- ACTUALIZAR FAMILIAR ---
    static async updateFamiliar(familiar_id, data) {
        const updateData = {}
        const allowedFields = ['cedula', 'nombres', 'apellidos', 'fecha_nacimiento', 'estatus', 'parentesco', 'direccion', 'telefono', 'cuenta_bancaria']

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field]
            }
        }

        if (Object.keys(updateData).length === 0) return false

        const [result] = await pool.query(
            'UPDATE nucleo_familiar SET ? WHERE familiar_id = ?',
            [updateData, familiar_id]
        )

        // Si se envió fecha_ingreso_beneficio u observacion, actualizar en la tabla sobreviviente
        if (data.fecha_ingreso_beneficio !== undefined || data.observacion !== undefined) {
            let updateQuery = 'UPDATE sobreviviente SET ';
            let params = [];
            if (data.fecha_ingreso_beneficio !== undefined) {
                updateQuery += 'fecha_ingreso = ?, status = ?';
                params.push(data.fecha_ingreso_beneficio || null, data.fecha_ingreso_beneficio ? 1 : 0);
            }
            if (data.observacion !== undefined) {
                if (params.length > 0) updateQuery += ', ';
                updateQuery += 'observacion = ?';
                params.push(data.observacion || null);
            }
            updateQuery += ' WHERE familiar_id = ?';
            params.push(familiar_id);
            await pool.query(updateQuery, params);
        }

        return result.affectedRows > 0
    }

    // --- ELIMINAR FAMILIAR ---
    static async deleteFamiliar(familiar_id) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            await connection.query('DELETE FROM sobreviviente WHERE familiar_id = ?', [familiar_id])
            const [result] = await connection.query('DELETE FROM nucleo_familiar WHERE familiar_id = ?', [familiar_id])

            await connection.commit()
            return result.affectedRows > 0
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    // --- ELIMINAR SOBREVIVIENTE ---
    static async delete(id) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            // Eliminar vinculaciones y familiares
            const [familiares] = await connection.query(
                'SELECT familiar_id FROM sobreviviente WHERE empleado_id = ?', [id]
            )
            for (const fam of familiares) {
                await connection.query('DELETE FROM sobreviviente WHERE familiar_id = ?', [fam.familiar_id])
                await connection.query('DELETE FROM nucleo_familiar WHERE familiar_id = ?', [fam.familiar_id])
            }

            // Eliminar datos laborales
            await connection.query('DELETE FROM datos_laborales WHERE empleado_id = ?', [id])

            // Eliminar empleado
            const [result] = await connection.query('DELETE FROM empleados WHERE empleado_id = ? AND estatus_id = 7', [id])

            await connection.commit()
            return result.affectedRows > 0
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }
}
