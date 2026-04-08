import { PensionadoService } from '../services/pensionado.service.js'

export const PensionadoController = {

    // Obtener lista paginada
    async getPensionados(req, res) {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const offset = (page - 1) * limit

            const filters = {
                search: req.query.search,
                profesion_id: req.query.profesion_id,
                genero: req.query.genero,
                direccion_id: req.query.direccion_id,
                condicion_laboral_id: req.query.condicion_laboral_id,
                edad_min: req.query.edad_min,
                edad_max: req.query.edad_max,
                fecha_ingreso_desde: req.query.fecha_ingreso_desde,
                fecha_ingreso_hasta: req.query.fecha_ingreso_hasta
            }

            // Limpiar filtros vacíos
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key]
                }
            })

            const [pensionados, total] = await Promise.all([
                PensionadoService.getFiltered({ limit, offset, ...filters }),
                PensionadoService.countFiltered(filters)
            ])

            res.json({
                success: true,
                data: pensionados,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            })

        } catch (error) {
            console.error('Error en getPensionados:', error)
            res.status(500).json({ success: false, error: 'Error al obtener pensionados' })
        }
    },

    // Obtener un pensionado por ID
    async getPensionadoById(req, res) {
        try {
            const { id } = req.params
            const pensionado = await PensionadoService.getById(id)

            if (!pensionado) {
                return res.status(404).json({ success: false, error: 'Pensionado no encontrado' })
            }

            res.json({ success: true, data: pensionado })

        } catch (error) {
            console.error('Error en getPensionadoById:', error)
            res.status(500).json({ success: false, error: 'Error al obtener el pensionado' })
        }
    },

    // Registrar nuevo pensionado
    async createPensionado(req, res) {
        try {
            const {
                // Datos personales (tabla empleados)
                cedula, nombres, apellidos, rif, fecha_nacimiento, lugar_nacimiento,
                genero, estado_civil, tipo_sangre, deportes, actividades_culturales,
                direccion_habitacion, telefono_fijo, celular, correo_principal,
                correo_secundario, fecha_ingreso, estudios_actuales, fecha_culminacion_estudios,
                contacto_emergencia_1, telefono_emergencia_1, contacto_emergencia_2,
                telefono_emergencia_2, profesion_id, nro_cuenta_bancaria, cuenta_bancaria,
                // Datos laborales (tabla datos_laborales)
                cargo_cet_id, nivel_salarial_id, nivel_salarial_antiguo_id,
                condicion_laboral_id, direccion_id, division_id, unidad_id, prima_profesional_id
            } = req.body

            // Validaciones
            if (!cedula || !nombres || !apellidos) {
                return res.status(400).json({
                    success: false,
                    error: 'Cédula, nombres y apellidos son obligatorios'
                })
            }

            // Verificar si ya existe un empleado con esa cédula
            const existingEmpleado = await PensionadoService.existsByCedula(cedula)
            if (existingEmpleado) {
                return res.status(409).json({
                    success: false,
                    error: 'Ya existe un empleado registrado con esta cédula'
                })
            }

            // Preparar datos personales
            const personalData = {
                cedula,
                nombres,
                apellidos,
                rif,
                fecha_nacimiento,
                lugar_nacimiento,
                genero,
                estado_civil,
                tipo_sangre: tipo_sangre || null,
                deportes: deportes || null,
                actividades_culturales: actividades_culturales || null,
                direccion_habitacion: direccion_habitacion || null,
                telefono_fijo: telefono_fijo || null,
                celular: celular || null,
                correo_principal: correo_principal || null,
                correo_secundario: correo_secundario || null,
                fecha_ingreso,
                estudios_actuales: estudios_actuales || null,
                fecha_culminacion_estudios: fecha_culminacion_estudios || null,
                contacto_emergencia_1: contacto_emergencia_1 || null,
                telefono_emergencia_1: telefono_emergencia_1 || null,
                contacto_emergencia_2: contacto_emergencia_2 || null,
                telefono_emergencia_2: telefono_emergencia_2 || null,
                profesion_id: profesion_id || null,
                nro_cuenta_bancaria,
                cuenta_bancaria
            }

            // Preparar datos laborales
            const laboralData = {
                cargo_cet_id: cargo_cet_id || null,
                nivel_salarial_id: nivel_salarial_id || null,
                nivel_salarial_antiguo_id: nivel_salarial_antiguo_id || null,
                condicion_laboral_id: condicion_laboral_id || null,
                direccion_id: direccion_id || null,
                division_id: division_id || null,
                unidad_id: unidad_id || null,
                prima_profesional_id: prima_profesional_id || null
            }

            // Crear en transacción
            const result = await PensionadoService.createTransactional(personalData, laboralData)

            res.status(201).json({
                success: true,
                message: 'Pensionado registrado exitosamente',
                data: result
            })

        } catch (error) {
            console.error('Error en createPensionado:', error)
            res.status(500).json({ success: false, error: 'Error al registrar pensionado: ' + error.message })
        }
    },

    // Actualizar pensionado
    async updatePensionado(req, res) {
        try {
            const { id } = req.params
            const {
                // Datos personales
                nombres, apellidos, rif, fecha_nacimiento, lugar_nacimiento,
                genero, estado_civil, tipo_sangre, deportes, actividades_culturales,
                direccion_habitacion, telefono_fijo, celular, correo_principal,
                correo_secundario, fecha_ingreso, estudios_actuales, fecha_culminacion_estudios,
                contacto_emergencia_1, telefono_emergencia_1, contacto_emergencia_2,
                telefono_emergencia_2, profesion_id, nro_cuenta_bancaria, cuenta_bancaria,
                // Datos laborales
                cargo_cet_id, nivel_salarial_id, nivel_salarial_antiguo_id,
                condicion_laboral_id, direccion_id, division_id, unidad_id, prima_profesional_id
            } = req.body

            // Verificar si existe
            const existing = await PensionadoService.getById(id)
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Pensionado no encontrado' })
            }

            // Preparar datos para actualizar (solo los que vienen)
            const personalData = {}
            const laboralData = {}

            // Mapeo de campos personales
            const personalFields = [
                'nombres', 'apellidos', 'rif', 'fecha_nacimiento', 'lugar_nacimiento',
                'genero', 'estado_civil', 'tipo_sangre', 'deportes', 'actividades_culturales',
                'direccion_habitacion', 'telefono_fijo', 'celular', 'correo_principal',
                'correo_secundario', 'fecha_ingreso', 'estudios_actuales', 'fecha_culminacion_estudios',
                'contacto_emergencia_1', 'telefono_emergencia_1', 'contacto_emergencia_2',
                'telefono_emergencia_2', 'profesion_id', 'nro_cuenta_bancaria', 'cuenta_bancaria'
            ]

            personalFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] !== '') {
                    personalData[field] = req.body[field]
                }
            })

            // Datos laborales
            const laboralFields = [
                'cargo_cet_id', 'nivel_salarial_id', 'nivel_salarial_antiguo_id',
                'condicion_laboral_id', 'direccion_id', 'division_id', 'unidad_id', 'prima_profesional_id'
            ]

            laboralFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] !== '') {
                    laboralData[field] = req.body[field]
                }
            })

            await PensionadoService.updateTransactional(id, personalData, laboralData)

            res.json({
                success: true,
                message: 'Pensionado actualizado exitosamente'
            })

        } catch (error) {
            console.error('Error en updatePensionado:', error)
            res.status(500).json({ success: false, error: 'Error al actualizar pensionado' })
        }
    },

    // Eliminar pensionado
    async deletePensionado(req, res) {
        try {
            const { id } = req.params

            const existing = await PensionadoService.getById(id)
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Pensionado no encontrado' })
            }

            const deleted = await PensionadoService.delete(id)

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Pensionado eliminado exitosamente'
                })
            } else {
                res.status(404).json({ success: false, error: 'Pensionado no encontrado' })
            }

        } catch (error) {
            console.error('Error en deletePensionado:', error)
            res.status(500).json({ success: false, error: 'Error al eliminar pensionado' })
        }
    },

    // Obtener estadísticas
    async getStats(req, res) {
        try {
            const stats = await PensionadoService.getStats()
            res.json({ success: true, data: stats })
        } catch (error) {
            console.error('Error en getStats:', error)
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas' })
        }
    },

    // Obtener pensionados por dirección
    async getByDireccion(req, res) {
        try {
            const { direccionId } = req.params
            const pensionados = await PensionadoService.getByDireccion(direccionId)
            res.json({ success: true, data: pensionados })
        } catch (error) {
            console.error('Error en getByDireccion:', error)
            res.status(500).json({ success: false, error: 'Error al obtener pensionados por dirección' })
        }
    },

    // Cambiar estatus de pensionado
    async changeStatus(req, res) {
        try {
            const { id } = req.params
            const { newStatusId } = req.body

            if (!newStatusId) {
                return res.status(400).json({ success: false, error: 'Se requiere nuevo estatus' })
            }

            const existing = await PensionadoService.getById(id)
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Pensionado no encontrado' })
            }

            const updated = await PensionadoService.changeStatus(id, newStatusId)

            if (updated) {
                res.json({
                    success: true,
                    message: 'Estatus del pensionado actualizado exitosamente'
                })
            } else {
                res.status(404).json({ success: false, error: 'No se pudo actualizar el estatus' })
            }

        } catch (error) {
            console.error('Error en changeStatus:', error)
            res.status(500).json({ success: false, error: 'Error al cambiar estatus' })
        }
    }
}