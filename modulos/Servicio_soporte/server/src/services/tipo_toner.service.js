import { TipoTonerModel } from "../models/tipo_toner.model.js";

export class TipoTonerService {
    static async obtenerTodas() { return await TipoTonerModel.getAll() }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre del tóner es obligatorio')
        // La descripción es opcional según tu SQL (DEFAULT NULL), así que no la validamos
        return await TipoTonerModel.create(datos)
    }
    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('ID de tóner no válido')
        const toner = await TipoTonerModel.getById(id)
        if(!toner) throw new Error('registro no encontrado')
    
        return toner
    }
    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if (!datos.nombre) throw new Error('El nombre es obligatorio')
        return await TipoTonerModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        return await TipoTonerModel.delete(id)
    }
}