import { MantenimientoModel } from '../models/mantenimiento.model.js'
import { actividadesModel } from '../models/actividades.model.js'

export class MantenimientoService {
    static async getAll(user) {
        const data = await MantenimientoModel.getAll()
        return this.filteredData(data, user)
    }

    static async getByDepto(direc_id, user) {
        const data = await MantenimientoModel.getByDepto(direc_id)
        return this.filteredData(data, user)
    }

    static async create(data) {
        const nro_caso = await this._generateCaseNumber()
        return await MantenimientoModel.create({ ...data, nro_caso })
    }

    static async updateStatus(id, updateData) {
        const { status, usuario_tecnico_id, diagnostico, solucion } = updateData

        // 1. Actualizar el mantenimiento
        const maintenance = await MantenimientoModel.getById(id)
        if (!maintenance) throw new Error('Mantenimiento no encontrado')

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

        const dataToUpdate = { ...updateData }
        if (parseInt(status) === 3) { // Asumamos 3 es "En Proceso"
            dataToUpdate.fecha_inicio = now
        }
        if (parseInt(status) === 7) { // 7 es "Finalizado" o "Entregado"
            dataToUpdate.fecha_fin = now
        }

        const success = await MantenimientoModel.update(id, dataToUpdate)

        // 2. Si se finaliza, registrar en atividades_sm
        if (success && parseInt(status) === 7) {
            const updatedMaint = await MantenimientoModel.getById(id)
            await this._registerInActivities(updatedMaint)
        }

        return success
    }
    static async filteredData(data, user) {
        if (!user) return data
        return data.map(t => {
            const { prioridad, ...rest } = t

            // Solo el dueño puede ver el código (o si es necesario, el admin)
            const esDueno = String(user.usuario_id) === String(t.usuario_id)

            // Si es el dueño, devolvemos todo el objeto (incluyendo el código)
            // Si no, devolvemos el objeto sin el código
            return esDueno ? { ...rest } : { prioridad, ...rest }
        })
    }
    // Métodos privados
    static async _generateCaseNumber() {
        const year = new Date().getFullYear()
        const prefix = `MAN-${year}-`
        const lastCase = await MantenimientoModel.getLastCaseNumber(prefix)

        let nextNumber = 1
        if (lastCase) {
            const lastNumber = parseInt(lastCase.split('-')[2])
            nextNumber = lastNumber + 1
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`
    }

    static async _registerInActivities(maint) {
        // Mapear los datos del mantenimiento al formato de actividades_sm
        const activityData = {
            nro_act: maint.nro_caso,
            fecha: maint.fecha_fin || new Date(),
            direc_id: maint.direc_id,
            descrip_id: 1, // ID genérico de descripción
            equipo_id: maint.equipo_id || 0,
            tipo_act: 1, // ID genérico para Mantenimiento
            observaciones: `MANTENIMIENTO FINALIZADO. DIAGNÓSTICO: ${maint.diagnostico || 'N/A'}. SOLUCIÓN: ${maint.solucion || 'N/A'}`.toUpperCase(),
            usuario_id: maint.usuario_tecnico_id || maint.usuario_id
        }

        try {
            await actividadesModel.create(activityData)
        } catch (error) {
            console.error('Error al registrar actividad automática:', error)
            // No lanzamos error para no romper el flujo del mantenimiento, 
            // pero lo logueamos
        }
    }
}
