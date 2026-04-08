import { ModeloModel } from "../models/modelo.model.js";
import { validaciones } from "../utils/validaciones.js";

export class ModeloService {
    static async obtenerTodos() {
        return await ModeloModel.getAll()
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('ID de modelo no válido')
        const modelo = await ModeloModel.getById(id)
        if (!modelo) throw new Error('El registro no existe')
        return modelo
    }

    static async crear(datos) {
        if (!datos.nombre || !datos.marca_id) {
            throw new Error('El nombre y el ID de la marca son obligatorios')
        }
        await validaciones.number(datos.marca_id)
        await validaciones.string(datos.nombre)
        return await ModeloModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista
        await validaciones.number(datos.marca_id)
        await validaciones.string(datos.nombre)
        return await ModeloModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista
        return await ModeloModel.delete(id)
    }
}