import { PuertosPanelSModel } from "../models/puertos_panel_s.model.js";
import {validaciones} from '../utils/validaciones.js'
export class PuertosPanelSService {
    static async obtenerTodas() {
        const registro = await PuertosPanelSModel.getAll() 

        return await PuertosPanelSModel.getAll() 
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un número entero')

        const registro = await PuertosPanelSModel.getById(id)
        if (!registro) throw new Error('Puerto del servidor no encontrado')

        return registro
    }

    static async crear(datos) {
        if (!datos.nro_puerto) throw new Error('El número de puerto es requerido')
        await validaciones.number(datos.nro_puerto) 

        if (!datos.p_router) throw new Error('El puerto del router es requerido')
        await validaciones.number(datos.p_router)

        const registroRouter = await PuertosPanelSModel.getByP_router(datos.p_router)
        if (registroRouter) throw new Error('Puerto de router ya asignado') 

        if (!datos.panel_soport_id) throw new Error('Panel Necesario para asignar el puerto')
        await validaciones.number(datos.panel_soport_id)

        const registroPanel = await PuertosPanelSModel.getByPanel_id(datos.panel_soport_id, datos.nro_puerto)
        if (registroPanel) throw new Error('Puerto ya registrado en el Panel')
            
        return await PuertosPanelSModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id)

        if (!datos.nro_puerto || !datos.p_router || !datos.panel_soport_id) throw new Error('Todos los campos son obligatorios para actualizar')

        await validaciones.number(datos.nro_puerto)

        await validaciones.number(datos.p_router)
        const registroRouter = await PuertosPanelSModel.getByRouterN(datos.p_router, datos.nro_puerto)
        if (registroRouter) throw new Error('Puerto de router ya asignado')

        await validaciones.number(datos.panel_soport_id)
        const registroPanel = await PuertosPanelSModel.getByPanel_id(datos.panel_soport_id, datos.nro_puerto)
        if (registroPanel) throw new Error('Puerto ya registrado en el Panel')
        return await PuertosPanelSModel.update(id, datos)
    }

    static async eliminar(id) {
        await this.obtenerPorId(id)
        
        return await PuertosPanelSModel.delete(id)
    }
}