import { DescripcionesModel } from "../models/descripciones.model.js";
import { validaciones} from "../utils/validaciones.js";
// 400 - Bad Request: El servidor no entiende la petición.
// 401 - Unauthorized: Requiere autenticación.
// 403 - Forbidden: Prohibido el acceso, sin permisos.
// 404 - Not Found: Página o recurso no encontrado.
// 500 - Internal Server Error: Error genérico del servidor.
// 503 - Service Unavailable: Servidor no disponible.

export class DescripcionesService {
    static async obtenerTodas() {
        return await DescripcionesModel.getAll()
    }
    static async crear(datos) {
        if(!datos.nombre) {
            throw new Error('El nombre de la descripcion es requerido')
        }
        await validaciones.string(datos.nombre)
        return await DescripcionesModel.create(datos)
    }
    static async obtenerPorId(id) {
        if(!/^[0-9]+$/.test(id)) throw new Error('El ID debe ser un numero entero')
        
        const descripcion = await DescripcionesModel.getById(id)
        if (!descripcion) throw new Error('Descripción no encontrada')
        
        return await DescripcionesModel.getById(id)
    }
    static async actualizar(id, datos) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        if(!datos.nombre){
            throw new Error('El nombre de la descripcion es requerido para actualizar')
        }
        await validaciones.string(datos.nombre)
        return await DescripcionesModel.update(id, datos)
    }
    static async eliminar(id) {
        await this.obtenerPorId(id) // Validamos que exista antes de eliminar
        return await DescripcionesModel.delete(id)
    }
}