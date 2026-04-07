import { PanelSoportModel } from "../models/panel_soport.model.js";

export class PanelSoportService {
    static async obtenerTodos() {
        return await PanelSoportModel.getAll()
    }

    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('ID de panel de soporte no válido')
        const panel = await PanelSoportModel.getById(id)
        if (!panel) throw new Error('El panel de soporte no existe en el rack')
        return panel
    }

    static async crear(datos) {
        if (!datos.nro_bien) throw new Error('El número de bien es obligatorio')
        // Validamos que sea "directo" o "escala" para mantener orden
        const desc = datos.descripcion?.toLowerCase()
        if (desc !== 'directo' && desc !== 'escala') {
            throw new Error('La descripción debe ser "directo" o "escala"')
        }
        return await PanelSoportModel.create(datos)
    }

    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos existencia antes de editar
        return await PanelSoportModel.update(id, datos)
    }

    static async eliminar(id) {
        // VALIDACIÓN CRÍTICA: Primero verificamos si existe
        await this.obtenerPorId(id) // Si no existe, lanzará un error
        return await PanelSoportModel.delete(id)
    }
}