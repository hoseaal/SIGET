import { TransferenciaModel } from '../models/transferencia.model.js'
import { actividadesModel } from '../models/actividades.model.js'

export class TransferenciaService {
    static async getAll(user) {
        const data = await TransferenciaModel.getAll()
        return this._filterData(data, user)
    }

    static async getByOrigen(origen_id, user) {
        const data = await TransferenciaModel.getByOrigen(origen_id)
        return this._filterData(data, user)
    }

    static async create(data) {
        // Lógica de negocio: Generar número de caso y código de entrega
        const nro_caso = await this._generateCaseNumber()
        const codigo_entrega = Math.floor(100000 + Math.random() * 900000).toString()

        return await TransferenciaModel.create({
            ...data,
            nro_caso,
            codigo_entrega
        })
    }

    static async delete(id, user) {
        const transfer = await TransferenciaModel.getById(id)
        if (!transfer) throw new Error('Transferencia no encontrada')
        if (String(transfer.usuario_id) !== String(user.usuario_id)) throw new Error('Solo el usuario que creó el registro puede eliminarlo')
        if (parseInt(transfer.status) !== 2) throw new Error('Solo se pueden eliminar registros con estado Pendiente')
        return await TransferenciaModel.delete(id)
    }

    static async updateStatus(id, updateData, user) {
        const { status, codigo_validacion, clasificacion_id } = updateData

        const transfer = await TransferenciaModel.getById(id)
        if (!transfer) throw new Error('Transferencia no encontrada.')

        // Solo validar código si el nuevo estado es 7 (Entregado) y el anterior NO lo era
        if (parseInt(status) === 7 && transfer.status !== 7) {
            if (transfer.codigo_entrega !== codigo_validacion) {
                throw new Error('Código de validación incorrecto. El usuario debe proporcionar el código para completar la entrega.')
            }

            // Registrar en el historial de actividades SM
            // Consumimos los datos actuales y los nuevos para el registro
            const activityData = {
                ...transfer,
                ...updateData
            };
            await this._registerInActivities(activityData);
        }

        return await TransferenciaModel.updateStatus(id, updateData)
    }

    // Métodos privados de apoyo
    static async _registerInActivities(trans) {
        try {
            // Formatear el número de actividad (puedes usar el mismo contador que actividades o uno propio)
            // Aquí usaremos la lógica de generarNroActividad del servicio de actividades para mantener consistencia
            const year = new Date().getFullYear();
            const prefix = `ACT-${year}-`;
            const lastNumber = await actividadesModel.getLastActivityNumber(prefix);
            
            let nextSequence = 1;
            if (lastNumber) {
                const parts = lastNumber.split('-');
                const lastSeq = parseInt(parts[parts.length - 1]);
                if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
            }
            const nro_act = `${prefix}${String(nextSequence).padStart(4, '0')}`;

            // La solución técnica migra a observaciones en el historial
            const observaciones_act = trans.solucion_tecnica || `MANTENIMIENTO FINALIZADO (TRANSFERENCIA ${trans.nro_caso})`;

            await actividadesModel.create({
                nro_act,
                fecha: new Date(),
                direc_id: trans.origen_id,
                equipo_id: trans.equipo_id,
                tipo_act: trans.tipo_act || 1, // Usar el tipo seleccionado en el modal
                observaciones: observaciones_act.toUpperCase(),
                usuario_id: trans.usuario_tecnico_id || trans.usuario_id,
                clasificacion_id: trans.clasificacion_id || null
            });
            console.log(`Actividad ${nro_act} registrada automáticamente desde transferencia ${trans.nro_caso}`);
        } catch (error) {
            console.error('Error al registrar actividad automática desde transferencia:', error);
            // No lanzamos error para no bloquear el cambio de estado de la transferencia
        }
    }

    static _filterData(data, user) {
        if (!user) return data.map(({ codigo_entrega, ...rest }) => rest)

        return data.map(t => {
            const { codigo_entrega, ...rest } = t

            // Solo el dueño puede ver el código
            const esDueno = String(user.usuario_id) === String(t.usuario_id)

            // Devolvemos el código solo al dueño, el resto de campos (incluyendo prioridad) siempre
            return esDueno ? t : rest
        })
    }

    static async _generateCaseNumber() {
        const year = new Date().getFullYear()
        const prefix = `TRA-${year}-`
        const lastCase = await TransferenciaModel.getLastCaseNumber(prefix)

        let nextNumber = 1
        if (lastCase) {
            const lastNumber = parseInt(lastCase.split('-')[2])
            nextNumber = lastNumber + 1
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`
    }
}
