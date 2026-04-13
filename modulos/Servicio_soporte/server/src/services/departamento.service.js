import { DepartamentoModel } from "../models/departamento.model.js";
import { validaciones } from "../utils/validaciones.js";

export class DepartamentoService {
    static async obtenerTodas() { 
        return await DepartamentoModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await DepartamentoModel.getById(id)
        if (!registro) throw new Error('Departamento no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nombre) throw new Error('El nombre del departamento es requerido')
        await validaciones.string(datos.nombre)
        
        const nombreMayus = datos.nombre.trim().replace(/\s+/g, ' ').toUpperCase()
        const registro = await DepartamentoModel.getByName(nombreMayus)

        if (registro) throw new Error('El departamento ya existe')

        if (!datos.piso_id) throw new Error('El ID del piso es requerido')
        await validaciones.number(datos.piso_id)    

        return await DepartamentoModel.create({
            ...datos, 
            nombre: nombreMayus
        })
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos existencia

        if (!datos.nombre) throw new Error('El nombre del departamento es requerido')
        await validaciones.string(datos.nombre)
        const nombreMayus = datos.nombre.trim().replace(/\s+/g, ' ').toUpperCase()
        const registro = await DepartamentoModel.getByName(nombreMayus)

        if (registro) throw new Error('El departamento ya existe')
            
        if (!datos.piso_id) throw new Error('El ID del piso es requerido')
        await validaciones.number(datos.piso_id)    

        return await DepartamentoModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos existencia antes de borrar
        return await DepartamentoModel.delete(id)
    }
}