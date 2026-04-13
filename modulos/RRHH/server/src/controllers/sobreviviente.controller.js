import { SobrevivienteModel } from '../models/sobreviviente.model.js'

export const SobrevivienteController = {

    // Obtener lista paginada
    async getSobrevivientes(req, res) {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const offset = (page - 1) * limit

            const filters = {
                search: req.query.search,
                profesion_id: req.query.profesion_id,
                genero: req.query.genero,
                direccion_id: req.query.direccion_id,
            }

            // Limpiar filtros vacíos
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key]
                }
            })

            const [sobrevivientes, total] = await Promise.all([
                SobrevivienteModel.getFiltered({ limit, offset, ...filters }),
                SobrevivienteModel.countFiltered(filters)
            ])

            res.json({
                success: true,
                data: sobrevivientes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            })

        } catch (error) {
            console.error('Error en getSobrevivientes:', error)
            res.status(500).json({ success: false, error: 'Error al obtener sobrevivientes' })
        }
    },

    // Obtener un sobreviviente por ID
    async getSobrevivienteById(req, res) {
        try {
            const { id } = req.params
            const sobreviviente = await SobrevivienteModel.getById(id)

            if (!sobreviviente) {
                return res.status(404).json({ success: false, error: 'Sobreviviente no encontrado' })
            }

            res.json({ success: true, data: sobreviviente })

        } catch (error) {
            console.error('Error en getSobrevivienteById:', error)
            res.status(500).json({ success: false, error: 'Error al obtener el sobreviviente' })
        }
    },

    // Obtener familiares de un sobreviviente
    async getFamiliares(req, res) {
        try {
            const { id } = req.params
            const familiares = await SobrevivienteModel.getFamiliares(id)
            res.json({ success: true, data: familiares })
        } catch (error) {
            console.error('Error en getFamiliares:', error)
            res.status(500).json({ success: false, error: 'Error al obtener familiares' })
        }
    },

    // Registrar nuevo sobreviviente completo (Caso 2)
    async createSobreviviente(req, res) {
        try {
            const {
                // Datos personales
                cedula, nombres, apellidos, fecha_nacimiento, genero, direccion_habitacion,
                profesion_id,
                // Datos laborales
                cargo_cet_id, nivel_salarial_id, condicion_laboral_id,
                direccion_id, division_id, unidad_id,
                // Datos del familiar
                familiar_cedula, familiar_nombres, familiar_apellidos, familiar_fecha_nacimiento, familiar_parentesco,
                familiar_direccion, familiar_telefono, familiar_cuenta_bancaria
            } = req.body

            // Validaciones
            if (!cedula || !nombres || !apellidos) {
                return res.status(400).json({
                    success: false,
                    error: 'Cédula, nombres y apellidos son obligatorios'
                })
            }

            // Validar edad del familiar (mayor o igual a 18)
            if (familiar_fecha_nacimiento) {
                const birthDate = new Date(familiar_fecha_nacimiento);
                const current = new Date();
                let age = current.getFullYear() - birthDate.getFullYear();
                const m = current.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 18) {
                    return res.status(400).json({
                        success: false,
                        error: 'El familiar debe ser mayor o igual a 18 años.'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de nacimiento del familiar es obligatoria para verificar su mayoría de edad.'
                });
            }

            // Verificar cédula duplicada
            const existingEmpleado = await SobrevivienteModel.existsByCedula(cedula)
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
                fecha_nacimiento: fecha_nacimiento || null,
                genero: genero || null,
                direccion_habitacion: direccion_habitacion || null,
                profesion_id: profesion_id || null,
                // Default placeholders to satisfy NOT NULL constraints missing in the UI
                rif: 'N/A',
                lugar_nacimiento: 'No especificado',
                estado_civil: 'Soltero',
                tipo_sangre: 'N/A',
                correo_principal: 'N/A',
                correo_secundario: 'N/A',
                telefono_fijo: 'N/A',
                celular: 'N/A',
                estudios_actuales: 'N/A',
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
                prima_profesional_id: prima_profesional_id || null,
            }

            // Preparar datos del familiar
            const familiarData = {
                cedula: familiar_cedula || null,
                nombres: familiar_nombres || null,
                apellidos: familiar_apellidos || null,
                fecha_nacimiento: familiar_fecha_nacimiento || null,
                parentesco: familiar_parentesco || null,
                direccion: familiar_direccion || null,
                telefono: familiar_telefono || null,
                cuenta_bancaria: familiar_cuenta_bancaria || null,
            }

            const result = await SobrevivienteModel.createTransactional(personalData, laboralData, familiarData)

            res.status(201).json({
                success: true,
                message: 'Sobreviviente registrado exitosamente',
                data: result
            })

        } catch (error) {
            console.error('Error en createSobreviviente:', error)
            res.status(500).json({ success: false, error: 'Error al registrar sobreviviente: ' + error.message })
        }
    },

    // Agregar familiar a sobreviviente existente (Caso 1)
    async addFamiliar(req, res) {
        try {
            const { id } = req.params
            const { cedula, nombres, apellidos, fecha_nacimiento, parentesco, direccion, telefono, cuenta_bancaria } = req.body

            if (!nombres || !apellidos) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombres y apellidos del familiar son obligatorios'
                })
            }

            // Validar edad del familiar (mayor o igual a 18)
            if (fecha_nacimiento) {
                const birthDate = new Date(fecha_nacimiento);
                const current = new Date();
                let age = current.getFullYear() - birthDate.getFullYear();
                const m = current.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 18) {
                    return res.status(400).json({
                        success: false,
                        error: 'El familiar debe ser mayor o igual a 18 años.'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de nacimiento del familiar es obligatoria para verificar su mayoría de edad.'
                });
            }

            // Verificar que el empleado existe y es sobreviviente
            const sobreviviente = await SobrevivienteModel.getById(id)
            if (!sobreviviente) {
                return res.status(404).json({ success: false, error: 'Sobreviviente no encontrado' })
            }

            const familiaresActuales = await SobrevivienteModel.getFamiliares(id)
            if (familiaresActuales && familiaresActuales.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'El sobreviviente ya tiene un familiar asignado (Máximo 1).'
                })
            }

            const result = await SobrevivienteModel.addFamiliar(id, {
                cedula, nombres, apellidos, fecha_nacimiento, parentesco, direccion, telefono, cuenta_bancaria
            })

            res.status(201).json({
                success: true,
                message: 'Familiar registrado exitosamente',
                data: result
            })

        } catch (error) {
            console.error('Error en addFamiliar:', error)
            res.status(500).json({ success: false, error: 'Error al registrar familiar: ' + error.message })
        }
    },

    // Actualizar sobreviviente
    async updateSobreviviente(req, res) {
        try {
            const { id } = req.params

            const existing = await SobrevivienteModel.getById(id)
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Sobreviviente no encontrado' })
            }

            const personalData = {}
            const laboralData = {}

            const personalFields = [
                'nombres', 'apellidos', 'fecha_nacimiento', 'genero',
                'direccion_habitacion', 'profesion_id'
            ]

            personalFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] !== '') {
                    personalData[field] = req.body[field]
                }
            })

            const laboralFields = [
                'cargo_cet_id', 'nivel_salarial_id', 'nivel_salarial_antiguo_id',
                'condicion_laboral_id', 'direccion_id', 'division_id', 'unidad_id', 'prima_profesional_id'
            ]

            laboralFields.forEach(field => {
                if (req.body[field] !== undefined && req.body[field] !== '') {
                    laboralData[field] = req.body[field]
                }
            })

            await SobrevivienteModel.updateTransactional(id, personalData, laboralData)

            res.json({
                success: true,
                message: 'Sobreviviente actualizado exitosamente'
            })

        } catch (error) {
            console.error('Error en updateSobreviviente:', error)
            res.status(500).json({ success: false, error: 'Error al actualizar sobreviviente' })
        }
    },

    // Actualizar familiar
    async updateFamiliar(req, res) {
        try {
            const { familiarId } = req.params
            const { fecha_nacimiento } = req.body
            
            // Validar si actualizan fecha de nacimiento
            if (fecha_nacimiento) {
                const birthDate = new Date(fecha_nacimiento);
                const current = new Date();
                let age = current.getFullYear() - birthDate.getFullYear();
                const m = current.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 18) {
                    return res.status(400).json({
                        success: false,
                        error: 'El familiar debe ser mayor o igual a 18 años.'
                    });
                }
            }

            const updated = await SobrevivienteModel.updateFamiliar(familiarId, req.body)

            if (updated) {
                res.json({ success: true, message: 'Familiar actualizado exitosamente' })
            } else {
                res.status(404).json({ success: false, error: 'Familiar no encontrado o sin cambios' })
            }

        } catch (error) {
            console.error('Error en updateFamiliar:', error)
            res.status(500).json({ success: false, error: 'Error al actualizar familiar' })
        }
    },

    // Eliminar familiar
    async deleteFamiliar(req, res) {
        try {
            const { familiarId } = req.params
            const deleted = await SobrevivienteModel.deleteFamiliar(familiarId)

            if (deleted) {
                res.json({ success: true, message: 'Familiar eliminado exitosamente' })
            } else {
                res.status(404).json({ success: false, error: 'Familiar no encontrado' })
            }

        } catch (error) {
            console.error('Error en deleteFamiliar:', error)
            res.status(500).json({ success: false, error: 'Error al eliminar familiar' })
        }
    },

    // Eliminar sobreviviente
    async deleteSobreviviente(req, res) {
        try {
            const { id } = req.params

            const existing = await SobrevivienteModel.getById(id)
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Sobreviviente no encontrado' })
            }

            const deleted = await SobrevivienteModel.delete(id)

            if (deleted) {
                res.json({ success: true, message: 'Sobreviviente eliminado exitosamente' })
            } else {
                res.status(404).json({ success: false, error: 'No se pudo eliminar el sobreviviente' })
            }

        } catch (error) {
            console.error('Error en deleteSobreviviente:', error)
            res.status(500).json({ success: false, error: 'Error al eliminar sobreviviente' })
        }
    }
}
