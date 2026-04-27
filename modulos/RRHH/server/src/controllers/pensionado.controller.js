import { PensionadoService } from '../services/pensionado.service.js'

export const PensionadoController = {

    // Obtener lista paginada y filtrada
    async getPensionados(req, res) {
        try {
            const result = await PensionadoService.obtenerConFiltros(req.query)
            res.json({
                success: true,
                ...result
            })
        } catch (error) {
            console.error('Error en getPensionados:', error)
            res.status(500).json({ success: false, error: error.message })
        }
    },

    // Obtener un pensionado por ID
    async getPensionadoById(req, res) {
        try {
            const { id } = req.params
            const data = await PensionadoService.obtenerPorId(id)
            res.json({ success: true, data })
        } catch (error) {
            console.error('Error en getPensionadoById:', error)
            res.status(404).json({ success: false, error: error.message })
        }
    },

    // Registrar nuevo pensionado
    async createPensionado(req, res) {
        try {
            const result = await PensionadoService.crear(req.body)
            res.status(201).json({
                success: true,
                message: 'Pensionado registrado exitosamente',
                data: result
            })
        } catch (error) {
            console.error('Error en createPensionado:', error)
            res.status(400).json({ success: false, error: error.message })
        }
    },

    // Actualizar pensionado
    async updatePensionado(req, res) {
        try {
            const { id } = req.params
            const result = await PensionadoService.actualizar(id, req.body)
            res.json({
                success: true,
                message: 'Pensionado actualizado exitosamente',
                data: result
            })
        } catch (error) {
            console.error('Error en updatePensionado:', error)
            res.status(400).json({ success: false, error: error.message })
        }
    },

    // Eliminar pensionado (o marcar como inactivo si aplicara)
    async deletePensionado(req, res) {
        try {
            const { id } = req.params
            await PensionadoService.eliminar(id)
            res.json({
                success: true,
                message: 'Registro de pensionado eliminado exitosamente'
            })
        } catch (error) {
            console.error('Error en deletePensionado:', error)
            res.status(404).json({ success: false, error: error.message })
        }
    },

    // Estadísticas
    async getStats(req, res) {
        try {
            const stats = await PensionadoService.getStats()
            res.json({ success: true, data: stats })
        } catch (error) {
            console.error('Error en getStats:', error)
            res.status(500).json({ success: false, error: error.message })
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
            res.status(500).json({ success: false, error: error.message })
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

            const updated = await PensionadoService.changeStatus(id, newStatusId)
            if (updated) {
                res.json({
                    success: true,
                    message: 'Estatus del pensionado actualizado exitosamente'
                })
            } else {
                res.status(404).json({ success: false, error: 'No se pudo actualizar el estatus o el pensionado no existe' })
            }
        } catch (error) {
            console.error('Error en changeStatus:', error)
            res.status(500).json({ success: false, error: error.message })
        }
    }
}