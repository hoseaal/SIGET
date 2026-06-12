import { PensionadoModel } from '../models/pensionado.model.js'
import pool from '../utils/database.js'

export class PensionadoService {

    /**
     * HELPER: Separa el body en datos personales, laborales y de pensión.
     * Datos personales → tabla `empleados`
     * Datos laborales  → tabla `datos_laborales`
     * Datos pensión    → tabla `pensionado`
     */
    static _separarDatos(datosSucios, isUpdate = false) {
        // Campos de tabla `empleados`
        const camposPersonal = [
            'cedula', 'nombres', 'apellidos', 'rif', 'fecha_nacimiento', 'lugar_nacimiento',
            'genero', 'estado_civil', 'tipo_sangre', 'deportes', 'actividades_culturales',
            'direccion_habitacion', 'telefono_fijo', 'celular',
            'correo_principal', 'correo_secundario', 'cuenta_bancaria',
            'fecha_ingreso', 'estudios_actuales', 'fecha_culminacion_estudios',
            'contacto_emergencia_1', 'contacto_emergencia_2',
            'telefono_emergencia_1', 'telefono_emergencia_2',
            'profesion_id', 'estatus_id'
        ]

        // Campos de tabla `datos_laborales`
        const camposContrato = [
            'cargo_cet_id', 'cargo_onapre_id', 'nivel_salarial_id',
            'nivel_salarial_antiguo_id', 'condicion_laboral_id', 'prima_profesional_id',
            'direccion_id', 'division_id', 'unidad_id'
        ]

        // Campos propios de la tabla `pensionado`
        // Mapeamos 'fecha_ingreso_pension' -> 'fecha_ingreso' (pension)
        const camposPension = [
            'fecha_ingreso_pension', 'motivo_pension', 'observacion'
        ]

        const datosPersonalClean = {}
        const datosContratoClean = {}
        const datosPensionClean = {}
        let hayDatosContrato = false
        let hayDatosPension = false

        // Campos que no deben ser NULL en la DB
        const evitarNull = [
            'celular', 'cuenta_bancaria', 'lugar_nacimiento', 'rif', 'tipo_sangre',
            'deportes', 'actividades_culturales', 'direccion_habitacion', 'telefono_fijo',
            'correo_principal', 'correo_secundario', 'estudios_actuales',
            'contacto_emergencia_1', 'telefono_emergencia_1',
            'contacto_emergencia_2', 'telefono_emergencia_2'
        ]

        const processField = (key, val, targetObj, isContrato, isPension) => {
            if (val === '' || val === ' ' || val === 'null' || val === undefined || val === null) {
                val = evitarNull.includes(key) ? '' : null
            }
            
            // Mapeo específico para pensión
            if (isPension) {
                if (key === 'fecha_ingreso_pension') {
                    targetObj['fecha_ingreso'] = val
                } else {
                    targetObj[key] = val
                }
            } else {
                targetObj[key] = val
            }

            if (val !== null && val !== '') {
                if (isContrato) hayDatosContrato = true
                if (isPension) hayDatosPension = true
            }
        }

        if (isUpdate) {
            Object.keys(datosSucios).forEach(key => {
                if (camposPersonal.includes(key)) {
                    processField(key, datosSucios[key], datosPersonalClean, false, false)
                } else if (camposContrato.includes(key)) {
                    processField(key, datosSucios[key], datosContratoClean, true, false)
                } else if (camposPension.includes(key)) {
                    processField(key, datosSucios[key], datosPensionClean, false, true)
                }
            })
        } else {
            camposPersonal.forEach(key => processField(key, datosSucios[key], datosPersonalClean, false, false))
            camposContrato.forEach(key => processField(key, datosSucios[key], datosContratoClean, true, false))
            camposPension.forEach(key => processField(key, datosSucios[key], datosPensionClean, false, true))
        }

        return {
            datosPersonalClean,
            datosContratoClean: hayDatosContrato || Object.keys(datosContratoClean).length > 0 ? datosContratoClean : null,
            datosPensionClean: hayDatosPension || Object.keys(datosPensionClean).length > 0 ? datosPensionClean : null
        }
    }

    /**
     * HELPER: Valida la jerarquía Unidad → División → Dirección
     */
    static async _validarJerarquia(direccion_id, division_id, unidad_id) {
        if (!direccion_id) return { direccion_id: null, division_id: null, unidad_id: null }

        try {
            if (unidad_id) {
                const [uniRows] = await pool.query('SELECT division_id FROM unidades WHERE unidad_id = ?', [unidad_id])
                if (uniRows.length > 0) {
                    const realDiv = uniRows[0].division_id
                    const [divRows] = await pool.query('SELECT direccion_id FROM divisiones WHERE division_id = ?', [realDiv])
                    return {
                        direccion_id: divRows.length > 0 ? divRows[0].direccion_id : direccion_id,
                        division_id: realDiv,
                        unidad_id
                    }
                }
            }
            if (division_id) {
                const [divRows] = await pool.query('SELECT direccion_id FROM divisiones WHERE division_id = ?', [division_id])
                return {
                    direccion_id: divRows.length > 0 ? divRows[0].direccion_id : direccion_id,
                    division_id,
                    unidad_id: null
                }
            }
            return { direccion_id, division_id: null, unidad_id: null }
        } catch (error) {
            console.error('Error en _validarJerarquia:', error)
            return { direccion_id, division_id: null, unidad_id: null }
        }
    }

    static async _vincularNivelesSalariales(datosContratoClean) {
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

    // --- MÉTODOS PÚBLICOS ---

    static async obtenerConFiltros(query) {
        const { page = 1, limit = 20, all, ...filtros } = query
        const offset = (page - 1) * limit

        if (all === 'true') {
            return await PensionadoModel.getFiltered({ ...filtros, limit: null })
        }

        const [data, total] = await Promise.all([
            PensionadoModel.getFiltered({ ...filtros, limit: Number(limit), offset: Number(offset) }),
            PensionadoModel.countFiltered(filtros)
        ])

        return {
            data,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                itemsPerPage: Number(limit)
            }
        }
    }

    static async obtenerTodos() {
        return await PensionadoModel.getFiltered({ limit: null })
    }

    static async obtenerPorId(id) {
        const registro = await PensionadoModel.getById(id)
        if (!registro) throw new Error('Registro de pensionado no encontrado')
        return registro
    }

    static async crear(datos) {
        let { datosPersonalClean, datosContratoClean, datosPensionClean } = this._separarDatos(datos)

        // Validaciones mínimas obligatorias
        if (!datosPersonalClean.cedula || !datosPersonalClean.nombres || !datosPersonalClean.apellidos) {
            throw new Error('Cédula, Nombre y Apellido son obligatorios')
        }

        // Validar jerarquía organizativa si se envían datos laborales
        if (datosContratoClean) {
            if (!datosContratoClean.cargo_cet_id) {
                throw new Error('El Cargo Interno (CET) es obligatorio al registrar datos laborales')
            }
            const jerarquia = await this._validarJerarquia(
                datosContratoClean.direccion_id,
                datosContratoClean.division_id,
                datosContratoClean.unidad_id
            )
            datosContratoClean = { ...datosContratoClean, ...jerarquia }
            await this._vincularNivelesSalariales(datosContratoClean)
        }

        return await PensionadoModel.createTransactional(datosPersonalClean, datosContratoClean, datosPensionClean)
    }

    static async actualizar(id, datos) {
        const existe = await PensionadoModel.getById(id)
        if (!existe) throw new Error('Registro de pensionado no existe')

        let { datosPersonalClean, datosContratoClean, datosPensionClean } = this._separarDatos(datos, true)

        // Validar jerarquía si se modifican datos laborales
        if (datosContratoClean) {
            if (!datosContratoClean.cargo_cet_id) {
                throw new Error('El Cargo Interno (CET) es obligatorio en los datos laborales')
            }
            if (
                datosContratoClean.direccion_id !== undefined ||
                datosContratoClean.division_id !== undefined ||
                datosContratoClean.unidad_id !== undefined
            ) {
                const jerarquia = await this._validarJerarquia(
                    datosContratoClean.direccion_id,
                    datosContratoClean.division_id,
                    datosContratoClean.unidad_id
                )
                datosContratoClean = { ...datosContratoClean, ...jerarquia }
            }
            await this._vincularNivelesSalariales(datosContratoClean)
        }

        return await PensionadoModel.updateTransactional(id, datosPersonalClean, datosContratoClean, datosPensionClean)
    }

    static async eliminar(id) {
        const existe = await PensionadoModel.getById(id)
        if (!existe) throw new Error('Registro de pensionado no existe')
        return await PensionadoModel.delete(id)
    }

    static async getStats() {
        // Mantenemos la lógica de stats si es necesaria, pero idealmente debería estar en el modelo
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

    static async changeStatus(id, newStatusId) {
        const [result] = await pool.query(
            'UPDATE empleados SET estatus_id = ? WHERE empleado_id = ? AND estatus_id = 4',
            [newStatusId, id]
        )
        return result.affectedRows > 0
    }
}