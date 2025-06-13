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
