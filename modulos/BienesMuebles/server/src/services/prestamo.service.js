/* eslint-disable camelcase */
import { PrestamoModel } from '../models/prestamo.model.js'
import { BienMuebleModel } from '../models/bienMueble.model.js' // Necesario para validar si el bien existe

// Constantes para IDs específicos
const DEP_ALMACEN_ID = 11
const CON_MAL_ESTADO_ID = 4

export class PrestamoService {
  /**
   * Crea un nuevo préstamo o movimiento a almacén.
   * Realiza validaciones previas a la inserción.
   * @param {object} data - Datos del préstamo.
   * @param {string} data.pre_fec - Fecha del préstamo (YYYY-MM-DD).
   * @param {string} data.pre_ndo - Número de oficio.
   * @param {number} data.dep_ide - ID del departamento de destino.
   * @param {number} data.dep_origen_ide - ID del departamento de origen (asumiendo que ttrpre lo tiene).
   * @param {string[]} data.bienes - Array de bim_ide de los bienes prestados.
   * @returns {Promise<object>} Objeto del préstamo creado.
   */
  static async createLoan (data) {
    const { pre_fec, pre_ndo, dep_ide, dep_origen_ide, bienes } = data

    if (!pre_fec || !pre_ndo || !dep_ide || !dep_origen_ide || !Array.isArray(bienes) || bienes.length === 0) {
      throw new Error('Datos de préstamo incompletos. Se requiere fecha, oficio, departamentos y al menos un bien.')
    }

    for (const bim_ide of bienes) {
      const bienExists = await BienMuebleModel.getById(bim_ide) // Asumiendo BienMuebleModel.getById existe
      if (!bienExists) {
        throw new Error(`El bien con ID '${bim_ide}' no existe.`)
      }

      const activeNormalLoan = await PrestamoModel.checkBienPrestadoActiveNormalLoan(bim_ide)
      if (activeNormalLoan) {
        throw new Error(`El bien con ID '${bim_ide}' ya está prestado activamente en un préstamo normal (Oficio: ${activeNormalLoan.pre_ndo}, Destino: ${activeNormalLoan.departamento_destino_nombre}).`)
      }

      const inWarehouseMalEstado = await PrestamoModel.checkBienEnAlmacenMalEstado(bim_ide)
      if (inWarehouseMalEstado) {
        throw new Error(`El bien con ID '${bim_ide}' ya está registrado como en almacén por mal estado (Oficio: ${inWarehouseMalEstado.pre_ndo}).`)
      }
      // Asegurarse de que el bien no se esté "prestando" a sí mismo (a su propio departamento de origen)
      if (bienExists.dep_ide === dep_ide) {
        throw new Error(`El bien con ID '${bim_ide}' ya se encuentra en el departamento de destino (${bienExists.departamento}).`)
      }

      // Validación para movimientos a almacén por mal estado (frontend también valida, pero doble check)
      if (dep_ide === DEP_ALMACEN_ID && bienExists.con_ide !== CON_MAL_ESTADO_ID) {
        throw new Error(`El bien con ID '${bim_ide}' no puede ser trasladado a almacén por mal estado, ya que su condición no es 'Mal Estado'.`)
      }
    }
    return await PrestamoModel.create(data)
  }

  /**
   * Obtiene préstamos "normales" con filtros.
   * @param {object} filters - Filtros (pre_ndo, dep_origen_id, dep_destino_id).
   * @returns {Promise<Array>}
   */
  static async getNormalLoans (filters) {
    return await PrestamoModel.getNormalLoans(filters)
  }

  /**
   * Obtiene bienes en almacén por mal estado con filtros.
   * @param {object} filters - Filtros (pre_ndo, dep_origen_id).
   * @returns {Promise<Array>}
   */
  static async getWarehouseItems (filters) {
    return await PrestamoModel.getWarehouseItems(filters)
  }

  /**
   * Obtiene un préstamo específico por su ID.
   * @param {number} id - pre_ide.
   * @returns {Promise<object|null>}
   */
  static async getLoanById (id) {
    const loan = await PrestamoModel.getById(id)
    if (!loan) throw new Error('Préstamo no encontrado')
    return loan
  }

  /**
   * Actualiza el estado de un préstamo.
   * @param {number} id - pre_ide.
   * @param {number} newStatus - Nuevo estado (0 o 1).
   * @returns {Promise<boolean>}
   */
  static async updateLoanStatus (id, newStatus) {
    if (newStatus === undefined || (newStatus !== 0 && newStatus !== 1)) {
      throw new Error('El estatus de préstamo es inválido. Debe ser 0 (inactivo) o 1 (activo).')
    }
    const loan = await PrestamoModel.getById(id)
    if (!loan) throw new Error('Préstamo no encontrado.')
    return await PrestamoModel.updateStatus(id, newStatus)
  }

  /**
   * Verifica si un bien está involucrado en un préstamo activo (normal o en almacén).
   * @param {string} bim_ide - ID del bien.
   * @returns {Promise<object|null>} Información del préstamo/movimiento activo si existe, o null.
   */
  static async checkBienActivelyInvolved (bim_ide) {
    const normalLoan = await PrestamoModel.checkBienPrestadoActiveNormalLoan(bim_ide)
    if (normalLoan) return { type: 'normal_loan', ...normalLoan }

    const warehouseItem = await PrestamoModel.checkBienEnAlmacenMalEstado(bim_ide)
    if (warehouseItem) return { type: 'warehouse_mal_estado', ...warehouseItem }

    return null
  }
}
