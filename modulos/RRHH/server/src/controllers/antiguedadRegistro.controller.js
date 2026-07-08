import { AntiguedadRegistroService } from '../services/antiguedadRegistro.service.js'

/**
 * Obtiene el historial de antigüedad de un funcionario.
 * Retorna un objeto con la lista y el total de años acumulados.
 * @param {number} req.params.empleado_id - ID del funcionario.
 */
export const obtenerPorFuncionario = async (req, res) => {
  try {
    const { empleado_id } = req.params
    const datos = await AntiguedadRegistroService.obtenerPorFuncionario(empleado_id)
    res.json(datos)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Obtiene un registro específico por ID.
 */
export const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params
    const registro = await AntiguedadRegistroService.obtenerPorId(id)
    res.json(registro)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra un periodo de antigüedad.
 * @param {object} req.body - Datos.
 * @param {number} req.body.empleado_id - Funcionario.
 * @param {string} req.body.fecha_inicio - Fecha Inicio.
 * @param {string} [req.body.fecha_fin] - Fecha Fin (Opcional, NULL si es vigente).
 */
export const crearRegistro = async (req, res) => {
  try {
    const nuevo = await AntiguedadRegistroService.crear(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El Funcionario indicado no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarRegistro = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await AntiguedadRegistroService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarRegistro = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await AntiguedadRegistroService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}