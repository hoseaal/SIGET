/* eslint-disable camelcase */
import { PrestamoService } from '../services/prestamo.service.js'

export const crearPrestamo = async (req, res) => {
  try {
    const nuevoPrestamo = await PrestamoService.crear(req.body)
    res.status(201).json(nuevoPrestamo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerPrestamos = async (req, res) => {
  try {
    // Puedes agregar filtros si necesitas, por ejemplo, para obtener solo préstamos activos
    const filters = req.query
    const prestamos = await PrestamoService.obtenerTodos(filters)
    res.json(prestamos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const obtenerPrestamoPorId = async (req, res) => {
  try {
    const { id } = req.params
    const prestamo = await PrestamoService.obtenerPorId(id)
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' })
    }
    res.json(prestamo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const actualizarPrestamo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await PrestamoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const cambiarEstatusPrestamo = async (req, res) => {
  try {
    const { id } = req.params
    const { pre_est } = req.body // Esperamos un pre_est (0 o 1) en el cuerpo de la solicitud
    if (pre_est === undefined || (pre_est !== 0 && pre_est !== 1)) {
      return res.status(400).json({ error: 'El estatus del préstamo es inválido. Debe ser 0 (inactivo) o 1 (activo).' })
    }
    const result = await PrestamoService.cambiarEstatus(id, pre_est)
    res.json({ success: result })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const obtenerBienesPrestadosPorDepartamento = async (req, res) => {
  try {
    const { dep_origen_id } = req.query // <--- ¡Nueva línea! Leer el query param
    const bienesPrestados = await PrestamoService.obtenerReporteBienesPrestados(dep_origen_id) // <--- ¡Modificado! Pasar el parámetro
    res.json(bienesPrestados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const checkBienPrestado = async (req, res) => {
  try {
    const { bim_ide } = req.params
    const prestamoInfo = await PrestamoService.checkBienPrestadoActivo(bim_ide)
    if (prestamoInfo) {
      res.json(prestamoInfo)
    } else {
      res.status(404).json({ error: 'El bien no se encuentra prestado activamente.' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
