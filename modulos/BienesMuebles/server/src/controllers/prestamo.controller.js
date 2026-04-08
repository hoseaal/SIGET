/* eslint-disable camelcase */
import { PrestamoService } from '../services/prestamo.service.js'

export const createLoan = async (req, res) => {
  try {
    const newLoan = await PrestamoService.createLoan(req.body)
    res.status(201).json(newLoan)
  } catch (error) {
    console.error('Error al crear préstamo:', error)
    res.status(400).json({ error: error.message })
  }
}

export const getNormalLoans = async (req, res) => {
  try {
    const filters = req.query
    const loans = await PrestamoService.getNormalLoans(filters)
    res.json(loans)
  } catch (error) {
    console.error('Error al obtener préstamos normales:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getWarehouseItems = async (req, res) => {
  try {
    const filters = req.query
    const items = await PrestamoService.getWarehouseItems(filters)
    res.json(items)
  } catch (error) {
    console.error('Error al obtener bienes en almacén:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getNormalLoansPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const filters = {
      pre_ndo: req.query.pre_ndo,
      dep_origen_id: req.query.dep_origen_id,
      dep_destino_id: req.query.dep_destino_id
    }
    // Eliminar filtros vacíos
    Object.keys(filters).forEach(k => !filters[k] && delete filters[k])
    const result = await PrestamoService.getNormalLoansPaginated({ page, limit, filters })
    res.json(result)
  } catch (error) {
    console.error('Error al obtener préstamos normales paginados:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getWarehouseItemsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const filters = {
      pre_ndo: req.query.pre_ndo,
      dep_origen_id: req.query.dep_origen_id,
      dep_destino_id: req.query.dep_destino_id
    }
    Object.keys(filters).forEach(k => !filters[k] && delete filters[k])
    const result = await PrestamoService.getWarehouseItemsPaginated({ page, limit, filters })
    res.json(result)
  } catch (error) {
    console.error('Error al obtener almacén paginado:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params
    const loan = await PrestamoService.getLoanById(id)
    res.json(loan)
  } catch (error) {
    console.error('Error al obtener préstamo por ID:', error)
    res.status(404).json({ error: error.message }) // 404 si no encontrado, 500 para otros errores
  }
}

export const updateLoanStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { pre_est } = req.body
    const updated = await PrestamoService.updateLoanStatus(id, pre_est)
    res.json({ success: updated })
  } catch (error) {
    console.error('Error al actualizar estatus de préstamo:', error)
    res.status(400).json({ error: error.message })
  }
}

export const updateStatusBien = async (req, res) => {
  try {
    const { id } = req.params // Esto será bim_ide
    const { dpr_est, pre_ide } = req.body // pre_ide se espera en el body para el contexto del detalle
    if (!pre_ide) {
      return res.status(400).json({ success: false, error: 'pre_ide es requerido en el cuerpo de la solicitud.' })
    }
    const success = await PrestamoService.updateStatusBien(id, dpr_est, pre_ide)
    res.json({ success, message: 'Estado del bien en el detalle de préstamo actualizado.' })
  } catch (error) {
    console.error('Error al actualizar estado del bien en el detalle:', error)
    res.status(400).json({ success: false, error: error.message })
  }
}

export const checkBienActivelyInvolved = async (req, res) => {
  try {
    const { bim_ide } = req.params
    const status = await PrestamoService.checkBienActivelyInvolved(bim_ide)
    if (status) {
      res.json(status)
    } else {
      res.status(404).json({ error: 'El bien no está activamente involucrado en ningún préstamo/movimiento.' })
    }
  } catch (error) {
    console.error('Error al verificar estado de bien:', error)
    res.status(500).json({ error: error.message })
  }
}

export const addBienToPrestamo = async (req, res) => {
  try {
    const { id } = req.params // pre_ide
    const { bim_ide } = req.body
    if (!bim_ide) {
      return res.status(400).json({ error: 'bim_ide es requerido en el cuerpo de la solicitud.' })
    }
    const success = await PrestamoService.addBienToPrestamo(id, bim_ide)
    res.status(201).json({ success, message: `Bien '${bim_ide}' agregado al préstamo exitosamente.` })
  } catch (error) {
    console.error('Error al agregar bien al préstamo:', error)
    res.status(400).json({ error: error.message })
  }
}

export const getActiveBienesForLoan = async (req, res) => {
  try {
    const { id } = req.params // pre_ide
    const bienes = await PrestamoService.getActiveBienesForLoan(id)
    res.json({ bienes })
  } catch (error) {
    console.error('Error al obtener bienes activos del préstamo:', error)
    res.status(404).json({ error: error.message })
  }
}
