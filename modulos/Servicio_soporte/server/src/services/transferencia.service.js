import { TransferenciaModel } from '../models/transferencia.model.js'

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

    static async updateStatus(id, updateData) {
        const { status, codigo_validacion } = updateData

        // Lógica de negocio: Validar código si se marca como Entregado (status 7)
        if (parseInt(status) === 7) {
            const transfer = await TransferenciaModel.getById(id)
            if (!transfer) throw new Error('Transferencia no encontrada.')
            
            if (transfer.codigo_entrega !== codigo_validacion) {
                throw new Error('Código de validación incorrecto. El usuario debe proporcionar el código para completar la entrega.')
            }
        }

        return await TransferenciaModel.updateStatus(id, updateData)
    }

    // Métodos privados de apoyo
    static _filterData(data, user) {
        return data.map(t => {
            const { codigo_entrega, ...rest } = t
            // Solo el dueño puede ver el código
            const esDueno = user?.usuario_id === t.usuario_id
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
