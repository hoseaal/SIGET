import { MantenimientoModel } from '../models/mantenimiento.model.js'
import { actividadesModel } from '../models/actividades.model.js'

export class MantenimientoService {
    static async getAll(user) {
        const data = await MantenimientoModel.getAll()
        return this.filteredData(data, user)
    }

    static async getByDepto(direc_id, user) {
        if (user && user.rol_id === 1) {
            const data = await MantenimientoModel.getAll()
            return this.filteredData(data, user)
        }
        const data = await MantenimientoModel.getByDepto(direc_id)
        return this.filteredData(data, user)
    }

    static async create(data) {
        let { nro_caso } = data
        if (!nro_caso || !nro_caso.trim()) {
            nro_caso = await this._generateCaseNumber()
        } else {
            const existing = await MantenimientoModel.getByNroCaso(nro_caso.trim())
            if (existing) {
                throw new Error(`El Nro. de Oficio "${nro_caso}" ya está registrado.`)
            }
            nro_caso = nro_caso.trim()
        }

        return await MantenimientoModel.create({
            ...data,
            nro_caso
        })
    }

    static async updateStatus(id, updateData) {
        const {
            status, usuario_tecnico_id, diagnostico, solucion,
            clasificacion_id
        } = updateData

        // 1. Verificar si el mantenimiento existe
        const maintenance = await MantenimientoModel.getById(id)
        if (!maintenance) throw new Error('Mantenimiento no encontrado')

        // 2. Validar si ya está entregado (status 7)
        if (parseInt(maintenance.status) === 7) {
            throw new Error('Este mantenimiento ya ha sido entregado y no puede modificarse.')
        }

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
        if (success && parseInt(status) == 7) {
            const updatedMaint = await MantenimientoModel.getById(id)
            // Pasar la clasificación explícitamente si viene en updateData
            await this._registerInActivities({
                ...updatedMaint,
                clasificacion_id
            })
        }

        return success
    }
    static async filteredData(data, user) {
        if (!user) return data
        return data.map(t => {
            const { ...rest } = t

            // Solo el dueño puede ver el código (o si es necesario, el admin)
            const esDueno = String(user.usuario_id) === String(t.usuario_id)

            // Devolvemos todo el objeto siempre (en mantenimientos no hay código secreto como en transferencias)
            return t
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
        const observations_act = maint.solucion || `MANTENIMIENTO FINALIZADO (OFICIO ${maint.nro_caso})`;

        const activityData = {
            nro_act: maint.nro_caso,
            fecha: maint.fecha_fin || new Date(),
            direc_id: maint.direc_id,
            equipo_id: maint.equipo_id || null,
            tipo_act: maint.tipo_falla || 1, // Usar el tipo de falla del mantenimiento como tipo de actividad
            observaciones: observations_act.toUpperCase(),
            usuario_id: maint.usuario_tecnico_id || maint.usuario_id,
            // Nuevo campo de clasificación normalizado
            clasificacion_id: maint.clasificacion_id || null
        }

        try {
            await actividadesModel.create(activityData)
            console.log(`✅ Actividad registrada automáticamente para el caso ${maint.nro_caso}`)
        } catch (error) {
            console.error(`❌ Error al registrar actividad automática para el caso ${maint.nro_caso}:`, error.message)
        }
    }
}
