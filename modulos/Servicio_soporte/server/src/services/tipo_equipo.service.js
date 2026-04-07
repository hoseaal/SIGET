import { tipo_equipoModel } from "../models/tipo_equipo.model.js";

export class tipo_equipoService {
    static async obtenerTodas() { return await tipo_equipoModel.getAll() }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')
        const registro = await tipo_equipoModel.getById(id)
        if (!registro) throw new Error('Registro no encontrado')
        return registro
    }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre es requerido')
        return await tipo_equipoModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if (!datos.nombre) throw new Error('El nombre es requerido')
        return await tipo_equipoModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        return await tipo_equipoModel.delete(id)
    }
}
