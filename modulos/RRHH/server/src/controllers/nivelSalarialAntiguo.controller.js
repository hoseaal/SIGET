import { NivelSalarialAntiguoService } from '../services/nivelSalarialAntiguo.service.js'

/**
 * Obtiene el listado de niveles salariales antiguos (histórico).
 * @returns {Promise<object[]>} Array con los niveles y sus montos anteriores.
 */
export const obtenerNivelesAntiguos = async (req, res) => {
  try {
    const niveles = await NivelSalarialAntiguoService.obtenerTodas()
    res.json(niveles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un nivel salarial antiguo por su ID.
 * @param {number} req.params.id - Identificador único (nivant_ide).
 * @returns {Promise<object>} Objeto con los datos del nivel.
 */
export const obtenerNivelAntiguo = async (req, res) => {
  try {
    const { id } = req.params
    const nivel = await NivelSalarialAntiguoService.obtenerPorId(id)
    res.json(nivel)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra un nivel salarial histórico.
 * @param {object} req.body - Datos del nivel.
 * @param {string} req.body.nivant_nom - Nombre del nivel antiguo (Ej: "Nivel I - 2023").
 * @param {number} req.body.nivant_sal - Monto del salario base antiguo.
 * @param {number} req.body.ona_ide - ID del Cargo ONAPRE asociado (tmaona).
 * @returns {Promise<object>} El nivel creado.
 */
export const crearNivelAntiguo = async (req, res) => {
  try {
    const nuevoNivel = await NivelSalarialAntiguoService.crear(req.body)
    res.status(201).json(nuevoNivel)
  } catch (error) {
    // Manejo de error de llave foránea
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El Cargo ONAPRE indicado no existe' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los datos de un nivel salarial antiguo.
 * @param {number} req.params.id - ID del nivel a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.nivant_nom - Nuevo nombre.
 * @param {number} req.body.nivant_sal - Nuevo salario.
 * @param {number} req.body.ona_ide - Nuevo cargo ONAPRE asociado.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarNivelAntiguo = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await NivelSalarialAntiguoService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un registro de nivel salarial antiguo.
 * @param {number} req.params.id - ID del nivel a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarNivelAntiguo = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await NivelSalarialAntiguoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}