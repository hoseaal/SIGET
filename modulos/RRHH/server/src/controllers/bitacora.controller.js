import { BitacoraModel } from '../models/bitacora.model.js'

export const obtenerBitacora = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const resultado = await BitacoraModel.getBitacora({ page, limit })
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const registrarBitacora = async (req, res) => {
  try {
    const bit_id = await BitacoraModel.registrar(req.body)
    res.status(201).json({ success: true, bit_id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
