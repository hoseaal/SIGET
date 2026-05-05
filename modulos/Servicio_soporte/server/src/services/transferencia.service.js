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

        const transfer = await TransferenciaModel.getById(id)
        if (!transfer) throw new Error('Transferencia no encontrada.')

        // Solo validar código si el nuevo estado es 7 (Entregado) y el anterior NO lo era
        if (parseInt(status) === 7 && transfer.status !== 7) {
            if (transfer.codigo_entrega !== codigo_validacion) {
                throw new Error('Código de validación incorrecto. El usuario debe proporcionar el código para completar la entrega.')
            }
        }

        return await TransferenciaModel.updateStatus(id, updateData)
    }

    // Métodos privados de apoyo
    static _filterData(data, user) {
        if (!user) return data.map(({ codigo_entrega, ...rest }) => rest)

        return data.map(t => {
            const { codigo_entrega, prioridad, ...rest } = t

            // Solo el dueño puede ver el código (o si es necesario, el admin)
            const esDueno = String(user.usuario_id) === String(t.usuario_id)

            // Si es el dueño, devolvemos todo el objeto (incluyendo el código)
            // Si no, devolvemos el objeto sin el código
            return esDueno ? { codigo_entrega, ...rest } : { prioridad, ...rest }
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
