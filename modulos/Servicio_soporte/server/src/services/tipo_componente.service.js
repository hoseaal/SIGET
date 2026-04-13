import { tipo_componenteModel } from "../models/tipo_componente.model.js";
import { validaciones } from "../utils/validaciones.js";

export class tipo_componenteService {
    static async obtenerTodas() { return await tipo_componenteModel.getAll() }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await tipo_componenteModel.getById(id)
        if (!registro) throw new Error('Registro no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre es requerido')

        await validaciones.string(datos.nombre)

        return await tipo_componenteModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar

        if (!datos.nombre) throw new Error('El nombre es requerido')
        
        await validaciones.string(datos.nombre)        
            
        return await tipo_componenteModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        
        return await tipo_componenteModel.delete(id)
    }
}