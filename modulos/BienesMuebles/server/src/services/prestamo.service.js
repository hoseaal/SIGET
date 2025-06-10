// src/services/prestamo.service.js
/* eslint-disable camelcase */
import { PrestamoModel } from '../models/prestamo.model.js'
// import { Validaciones } from '../utils/validations.js' // Asumiendo que tienes un archivo de validaciones

export class PrestamoService {
  static async crear (datos) {
    // Validaciones básicas de entrada
    if (!datos.pre_fec || !datos.pre_ndo || !datos.dep_ide || !Array.isArray(datos.bienes)) {
      throw new Error('Datos de préstamo incompletos o incorrectos.')
    }
    // Validaciones.validarPrestamo(datos) // Si tienes validaciones más específicas

    // Validar que el oficio no exista ya
    const existeOficio = await PrestamoModel.getByOficio(datos.pre_ndo)
    if (existeOficio) {
      throw new Error(`El número de oficio '${datos.pre_ndo}' ya está registrado.`)
    }

    // Validar que los bienes no estén ya prestados activamente
    for (const bim_ide of datos.bienes) {
      const bienYaPrestado = await PrestamoModel.checkBienPrestadoActivo(bim_ide)
      if (bienYaPrestado) {
        throw new Error(`El bien con ID '${bim_ide}' ya se encuentra prestado activamente.`)
      }
    }

    return await PrestamoModel.create(datos)
  }

  static async obtenerTodos (filters = {}) {
    return await PrestamoModel.getAll(filters)
  }

  static async obtenerPorId (id) {
    const prestamo = await PrestamoModel.getById(id)
    if (!prestamo) throw new Error('Préstamo no encontrado')
    return prestamo
  }

  static async actualizar (id, datos) {
    const existe = await PrestamoModel.getById(id)
    if (!existe) throw new Error('Préstamo no existe')

    // Validar si el oficio se está cambiando y ya existe
    if (datos.pre_ndo && datos.pre_ndo !== existe.pre_ndo) {
      const existeOficio = await PrestamoModel.getByOficio(datos.pre_ndo)
      if (existeOficio) {
        throw new Error(`El número de oficio '${datos.pre_ndo}' ya está registrado en otro préstamo.`)
      }
    }
    return await PrestamoModel.update(id, datos)
  }

  static async cambiarEstatus (id, pre_est) {
    const existe = await PrestamoModel.getById(id)
    if (!existe) throw new Error('Préstamo no existe')
    return await PrestamoModel.update(id, { pre_est })
  }

  static async obtenerReporteBienesPrestados (depOrigenId = null) {
    return await PrestamoModel.getBienesPrestadosReport(depOrigenId)
  }

  static async checkBienPrestadoActivo (bim_ide) {
    return await PrestamoModel.checkBienPrestadoActivo(bim_ide)
  }
}
