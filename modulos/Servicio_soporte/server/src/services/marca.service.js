import { marcaModel } from "../models/marca.model.js";
import { validaciones } from "../utils/validaciones.js";

export class marcaService {
    static async obtenerTodas() { return await marcaModel.getAll() }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')
        const registro = await marcaModel.getById(id)
        if (!registro) throw new Error('Registro no encontrado')
        return registro
    }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre es requerido')
        await validaciones.string(datos.nombre)
        return await marcaModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if (!datos.nombre) throw new Error('El nombre es requerido')
        await validaciones.string(datos.nombre)
        return await marcaModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        return await marcaModel.delete(id)
    }
}
