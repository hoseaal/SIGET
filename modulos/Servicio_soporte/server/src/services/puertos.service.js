import { PuertosModel } from "../models/puertos.model.js";
import { validaciones } from "../utils/validaciones.js";

export class PuertosService {
    static async obtenerTodas() { 
        return await PuertosModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await PuertosModel.getById(id)
        if (!registro) throw new Error('Puerto no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nro_puerto) throw new Error('El número de puerto es requerido')
        await validaciones.number(datos.nro_puerto)

        if (!datos.panel_id) throw new Error('El ID del panel de pared es requerido')
        await validaciones.number(datos.panel_id)
        const nro = await PuertosModel.getByPuerto(datos.nro_puerto, datos.panel_id)
        if(nro) throw new Error('Ya existe un puerto con ese número en ese panel')
        return await PuertosModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos existencia

        if (!datos.nro_puerto || !datos.panel_id) {
            throw new Error('Todos los campos son obligatorios para actualizar')
        }

        await validaciones.number(datos.nro_puerto)
        await validaciones.number(datos.panel_id)

        return await PuertosModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos existencia antes de borrar
        
        return await PuertosModel.delete(id)
    }
}