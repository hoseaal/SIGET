/* eslint-disable camelcase */
import { BienMuebleModel } from '../models/bienMueble.model.js'
import { PrestamoModel } from '../models/prestamo.model.js'
import { Validaciones } from '../utils/validations.js'

export class BienMuebleService {
  static async obtenerTodos (filters = {}) {
    return await BienMuebleModel.getAll(filters)
  }

  static async obtenerPorId (id) {
    const bien = await BienMuebleModel.getById(id)
    if (!bien) throw new Error('Bien mueble no encontrado')
    return bien
  }

  static async crear (datos, userId) {
    Validaciones.validarBienMueble(datos)
    const existe = await BienMuebleModel.getById(datos.bim_ide)
    if (existe) throw new Error('El ID ya está en uso')
    return await BienMuebleModel.create(datos, userId)
  }

  static async actualizar (id, datos, userId) {
    const existe = await BienMuebleModel.getById(id)
    if (!existe) throw new Error('Bien mueble no existe')

    // Validación de integridad referencial:
    // Si se intenta cambiar el departamento del bien, verificar que no tenga préstamo/almacén activo.
    if (datos.dep_ide !== undefined && Number(datos.dep_ide) !== Number(existe.dep_ide)) {
      const prestamoActivo = await PrestamoModel.checkBienPrestadoActiveNormalLoan(id)
      if (prestamoActivo) {
        throw new Error(
          `No se puede cambiar el departamento del bien '${id}' porque tiene un préstamo activo ` +
          `(Oficio: ${prestamoActivo.pre_ndo}, Destino: ${prestamoActivo.departamento_destino_nombre}). ` +
          `Devuélvalo primero.`
        )
      }
      const enAlmacen = await PrestamoModel.checkBienEnAlmacen(id)
      if (enAlmacen) {
        throw new Error(
          `No se puede cambiar el departamento del bien '${id}' porque está registrado en almacén ` +
          `(Oficio: ${enAlmacen.pre_ndo}). Devuélvalo primero.`
        )
      }
    }

    return await BienMuebleModel.update(id, datos, userId)
  }

  static async desincorporar (id, { com_ide, bim_fed }, userId) {
    return await BienMuebleModel.update(id, {
      bim_inc: 0,
      com_ide,
      bim_fed
    }, userId)
  }

  static async obtenerPagina ({ page = 1, limit = 20, filters = {} }) {
    if (page < 1 || limit < 1) {
      throw new Error('Parámetros de paginación inválidos')
    }

    const result = await BienMuebleModel.getAllPaginated({
      page,
      limit,
      filters
    })

    return {
      data: result.data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(result.total),
        totalPages: Math.ceil(result.total / limit),
        filtersApplied: Object.keys(filters).length > 0 ? filters : null
      }
    }
  }

  static async contarRegistros ({ filters = {} } = {}) {
    try {
    // Obtener el conteo directamente del modelo
      const { total } = await BienMuebleModel.getTotalCount({ filters })

      return {
        meta: {
          total: Number(total),
          filtersApplied: Object.keys(filters).length > 0 ? filters : null
        }
      }
    } catch (error) {
      console.error('Error en contarRegistros:', error)
      throw new Error('Error al contar registros')
    }
  }

  static async buscarAvanzado (filters) {
    return await BienMuebleModel.getAll(filters)
  }

  static async buscarPorNombre (searchTerm, { page, limit }) {
    if (!searchTerm.trim()) throw new Error('Término de búsqueda requerido')
    return await BienMuebleModel.searchByNombre(searchTerm, { page, limit })
  }

  static async contarPorDepartamento (departamentoId) {
    return await BienMuebleModel.countByDepartamento(departamentoId)
  }

  static async obtenerBitacora ({ page = 1, limit = 20 }) {
    if (page < 1 || limit < 1) {
      throw new Error('Parámetros de paginación inválidos para la bitácora')
    }

    const result = await BienMuebleModel.getBitacoraPaginated({ page, limit })

    return {
      data: result.data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(result.total),
        totalPages: Math.ceil(result.total / limit)
      }
    }
  }
}
