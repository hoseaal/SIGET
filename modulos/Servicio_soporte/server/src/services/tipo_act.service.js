import { tipo_actModel } from "../models/tipo_act.model.js";

// 400 - Bad Request: El servidor no entiende la petición.
// 401 - Unauthorized: Requiere autenticación.
// 403 - Forbidden: Prohibido el acceso, sin permisos.
// 404 - Not Found: Página o recurso no encontrado.
// 500 - Internal Server Error: Error genérico del servidor.
// 503 - Service Unavailable: Servidor no disponible.

export class tipo_actService {
    static async obtenerTodas() {
        return await tipo_actModel.getAll()
    }
    static async crear(datos) {
        if(!datos.nombre) {
            throw new Error('El nombre de la actividad es requerido')
        }
        return await tipo_actModel.create(datos)
    }
    static async obtenerPorId(id) {
        if(!/^[0-9]+$/.test(id)) {
            throw new Error('El ID debe ser un numero entero')
        }
        const descripcion = await tipo_actModel.getById(id)
        if (!descripcion) {
            throw new Error('Tipo de actividad no encontrado')
        }
        return await tipo_actModel.getById(id)
    }
    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if(!datos.nombre){
            throw new Error('El nombre de la actividad es requerido para actualizar')
        }
        return await tipo_actModel.update(id, datos)
    }
    static async eliminar(id) {
        await this.obtenerPorId(id)
        
        return await tipo_actModel.delete(id)
    }
}