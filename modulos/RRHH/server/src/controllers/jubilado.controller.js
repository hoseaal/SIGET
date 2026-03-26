import { JubiladoService } from '../services/jubilado.service.js'

/**
 * Obtiene la lista de todos los jubilados activos en el sistema.
 */
export const obtenerJubilados = async (req, res) => {
  try {
    const jubilados = await JubiladoService.obtenerTodos()
    res.json(jubilados)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Obtiene un registro de jubilación específico.
 */
export const obtenerJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const jubilado = await JubiladoService.obtenerPorId(id)
    res.json(jubilado)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra a un funcionario como jubilado.
 * Automáticamente cambia su estatus (estatus_id) a 3 en empleados.
 */
export const crearJubilado = async (req, res) => {
  try {
    const nuevo = await JubiladoService.crear(req.body)
    res.status(201).json({
      success: true,
      message: 'Funcionario jubilado correctamente y estatus actualizado.',
      data: nuevo
    })
  } catch (error) {
    // Error de llave única (El funcionario ya está en la tabla jubilados)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Este funcionario ya se encuentra registrado como jubilado.' })
    }
    // Error si el funcionario no existe
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El funcionario indicado no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

export const actualizarJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await JubiladoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const eliminarJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await JubiladoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}