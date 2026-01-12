import { HistorialSalarioModel } from '../models/historialSalario.model.js'

export class HistorialSalarioService {
  
  // Método principal modificado para manejar filtros y paginación
  static async obtenerHistorial (fun_ide, query) {
    if (!fun_ide) throw new Error('ID de funcionario requerido')

    const { page = 1, limit = 20, all, fecha_inicio, fecha_fin } = query
    
    const filtros = {
      fun_ide,
      fecha_inicio,
      fecha_fin
    }

    // Opción para traer todo el histórico de una vez (ej: para imprimir reporte completo)
    if (all === 'true') {
      return await HistorialSalarioModel.getFiltered({ ...filtros, limit: null })
    }

    // Paginación estándar
    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      HistorialSalarioModel.getFiltered({ ...filtros, limit: Number(limit), offset: Number(offset) }),
      HistorialSalarioModel.countFiltered(filtros)
    ])

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        itemsPerPage: Number(limit)
      }
    }
  }

  // ... CRUD básico se mantiene ...
  
  static async obtenerPorId (id) {
    const registro = await HistorialSalarioModel.getById(id)
    if (!registro) throw new Error('Registro de salario no encontrado')
    return registro
  }

  static async crear (datos) {
    if (!datos.fun_ide || !datos.his_fpa) throw new Error('Funcionario y Fecha de pago requeridos')
    if (isNaN(datos.his_net) || isNaN(datos.his_bru)) throw new Error('Montos inválidos')

    return await HistorialSalarioModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await HistorialSalarioModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await HistorialSalarioModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await HistorialSalarioModel.getById(id)
    if (!existe) throw new Error('Registro no existe')
    return await HistorialSalarioModel.delete(id)
  }
}