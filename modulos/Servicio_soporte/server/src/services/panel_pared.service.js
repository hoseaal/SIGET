import { PanelParedModel } from "../models/panel_pared.model.js";
import { validaciones } from "../utils/validaciones.js";

export class PanelParedService {
    static async obtenerTodas() { 
        return await PanelParedModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await PanelParedModel.getById(id)
        if (!registro) throw new Error('Panel de pared no encontrado')
            
        return registro
    }

    static async crear(datos) {
        if (!datos.piso) throw new Error('El ID del piso es requerido')
        await validaciones.number(datos.piso)    

        if (!datos.es_panel_principal) throw new Error('Debe especificar si es Panel 1 o 2')
        await validaciones.number(datos.es_panel_principal) // 0 o 1 

        if (!datos.pp_soporte_id) throw new Error('Especificar el Panel de soporte ')
        await validaciones.number(datos.pp_soporte_id)

        return await PanelParedModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos existencia
    
        if (!datos.piso) throw new Error('El ID del piso es requerido')
        await validaciones.number(datos.piso)

        if (!datos.es_panel_principal) throw new Error('Debe especificar si es Panel 1 o 2')
        await validaciones.number(datos.es_panel_principal) // 0 o 1

        return await PanelParedModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos existencia antes de eliminar

        return await PanelParedModel.delete(id)
    }
}