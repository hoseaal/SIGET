import { PisoModel } from "../models/piso.model.js";
import { validaciones } from "../utils/validaciones.js";

export class PisoService {
    static async obtenerTodas() { 
        return await PisoModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await PisoModel.getById(id)
        if (!registro) throw new Error('Registro no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre es requerido')

        await validaciones.string(datos.nombre)

        return await PisoModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de actualizar

        if (!datos.nombre) throw new Error('El nombre es requerido')

        await validaciones.string(datos.nombre)

        return await PisoModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar

        return await PisoModel.delete(id)
    }
}