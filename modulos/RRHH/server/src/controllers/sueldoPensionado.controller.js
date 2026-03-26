import { SueldoPensionadoService } from '../services/sueldoPensionado.service.js'

/**
 * Obtiene el sueldo base actual de los pensionados.
 * @returns {Promise<object>} Objeto con el monto (o mensaje si no está configurado).
 */
export const obtenerSueldoActual = async (req, res) => {
  try {
    const sueldo = await SueldoPensionadoService.obtenerActual()
    res.json(sueldo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Guarda (Sobrescribe) el sueldo base.
 * Elimina cualquier registro previo para garantizar que solo haya uno.
 * @param {number} req.body.salario_base - Monto del salario.
 */
export const guardarSueldo = async (req, res) => {
  try {
    const nuevo = await SueldoPensionadoService.guardar(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza el sueldo existente.
 */
export const actualizarSueldo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await SueldoPensionadoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}