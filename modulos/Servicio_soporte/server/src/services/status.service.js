import { statusModel } from "../models/status.model.js";
import { validaciones } from "../utils/validaciones.js";
// 400 - Bad Request: El servidor no entiende la petición.
// 401 - Unauthorized: Requiere autenticación.
// 403 - Forbidden: Prohibido el acceso, sin permisos.
// 404 - Not Found: Página o recurso no encontrado.
// 500 - Internal Server Error: Error genérico del servidor.
// 503 - Service Unavailable: Servidor no disponible.

export class statusService {
    static async obtenerTodas() {
        return await statusModel.getAll()
    }
    static async crear(datos) {
        if (!datos.nombre) {
            throw new Error('El nombre de la descripcion es requerido')
        }
        await validaciones.string(datos.nombre)
        return await statusModel.create(datos)
    }
    static async obtenerPorId(id) {
        if (!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un numero entero')

        const status = await statusModel.getById(id)
        if (!status) throw new Error('No encontrada')

        return await statusModel.getById(id)
    }
    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if (!datos.nombre) {
            throw new Error('El nombre de la descripcion es requerido para actualizar')
        }
        await validaciones.string(datos.nombre)
        return await statusModel.update(id, datos)
    }
    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        return await statusModel.delete(id)
    }
}