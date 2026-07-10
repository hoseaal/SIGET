import { PanelSoportModel } from "../models/panel_soport.model.js";
import { validaciones } from "../utils/validaciones.js";

export class PanelSoportService {
    static async obtenerTodas() { 
        return await PanelSoportModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await PanelSoportModel.getById(id)
        if (!registro) throw new Error('Rack de soporte no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nro_bien) throw new Error('El número de bien es requerido')

        await validaciones.string(datos.nro_bien)

        const registro = await PanelSoportModel.getByNroBien(datos.nro_bien)
        if (registro) throw new Error('El número de bien ya existe')
        
        if (!datos.descripcion) throw new Error('La descripción (directo/escala) es requerida')
        
        await validaciones.string(datos.descripcion)    

        return await PanelSoportModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de actualizar
        
        if (!datos.nro_bien || !datos.descripcion) throw new Error('El número de bien y la descripción son requeridos')
        
        await validaciones.string(datos.nro_bien)
        await validaciones.string(datos.descripcion)
        
        return await PanelSoportModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        
        return await PanelSoportModel.delete(id)
    }
}