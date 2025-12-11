import { FuncionarioService } from '../services/funcionario.service.js'

/**
 * Obtiene la lista de funcionarios con paginación y filtros.
 * @param {string} [req.query.type] - Si es 'full', incluye datos del contrato.
 */
export const obtenerFuncionarios = async (req, res) => {
  try {
    const filtros = req.query
    const resultados = await FuncionarioService.obtenerConFiltros(filtros)
    res.json(resultados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Obtiene un funcionario específico.
 * @param {string} [req.query.type] - Si es 'full', incluye datos del contrato.
 */
export const obtenerFuncionario = async (req, res) => {
  try {
    const { id } = req.params
    const { type } = req.query // 'full' o undefined
    const incluirContrato = type === 'full'
    
    const funcionario = await FuncionarioService.obtenerPorId(id, incluirContrato)
    res.json(funcionario)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un funcionario (y opcionalmente su contrato) en una transacción.
 */
export const crearFuncionarioCompleto = async (req, res) => {
  try {
    const nuevo = await FuncionarioService.crearCompleto(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La Cédula o el RIF ya existen en el sistema.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza datos personales y/o contractuales.
 */
export const actualizarFuncionarioCompleto = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await FuncionarioService.actualizarCompleto(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un funcionario (y su contrato en cascada).
 */
export const eliminarFuncionario = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await FuncionarioService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}