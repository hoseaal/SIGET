import { FuncionarioModel } from '../models/funcionario.model.js'

export class FuncionarioService {
  
  static async obtenerConFiltros (query) {
    const { page = 1, limit = 20, all, ...filtros } = query

    // Si 'all' es true, traemos todo sin paginar
    if (all === 'true') {
      return await FuncionarioModel.getFiltered({ ...filtros, limit: null, offset: null })
    }

    // Cálculo del offset para la paginación
    const offset = (page - 1) * limit
    
    // Obtenemos los datos y el conteo total para el frontend
    const [data, total] = await Promise.all([
      FuncionarioModel.getFiltered({ ...filtros, limit: Number(limit), offset: Number(offset) }),
      FuncionarioModel.countFiltered(filtros)
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

  static async obtenerPorId (id) {
    const funcionario = await FuncionarioModel.getById(id)
    if (!funcionario) throw new Error('Funcionario no encontrado')
    return funcionario
  }

  static async crear (datos) {
    // Validaciones básicas de campos NOT NULL obligatorios
    if (!datos.fun_ced || !datos.fun_nom || !datos.fun_ape || !datos.fun_fing) {
      throw new Error('Cédula, Nombre, Apellido y Fecha de Ingreso son obligatorios')
    }
    return await FuncionarioModel.create(datos)
  }

  static async actualizar (id, datos) {
    const existe = await FuncionarioModel.getById(id)
    if (!existe) throw new Error('Funcionario no existe')
    return await FuncionarioModel.update(id, datos)
  }

  static async eliminar (id) {
    const existe = await FuncionarioModel.getById(id)
    if (!existe) throw new Error('Funcionario no existe')
    return await FuncionarioModel.delete(id)
  }
}