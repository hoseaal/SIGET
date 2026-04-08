import { NivelSalarialService } from '../services/nivelSalarial.service.js'

/**
 * Obtiene el listado de niveles salariales.
 * @returns {Promise<object[]>} Array con los niveles y sus montos.
 */
export const obtenerNiveles = async (req, res) => {
  try {
    const niveles = await NivelSalarialService.obtenerTodos(req.query)
    res.json(niveles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un nivel salarial por su ID.
 * @param {number} req.params.id - Identificador único (nivel_salarial_id).
 * @returns {Promise<object>} Objeto con los datos del nivel.
 */
export const obtenerNivel = async (req, res) => {
  try {
    const { id } = req.params
    const nivel = await NivelSalarialService.obtenerPorId(id)
    res.json(nivel)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo nivel salarial asociado a un cargo ONAPRE.
 * @param {object} req.body - Datos del nivel.
 * @param {string} req.body.niv_nom - Nombre del nivel (Ej: "Nivel I").
 * @param {number} req.body.salario_base - Monto del salario base.
 * @param {number} req.body.cargo_onapre_id - ID del Cargo ONAPRE asociado (cargos_onapre).
 * @returns {Promise<object>} El nivel creado.
 */
export const crearNivel = async (req, res) => {
  try {
    const nuevoNivel = await NivelSalarialService.crear(req.body)
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
 * Actualiza los datos de un nivel salarial.
 * @param {number} req.params.id - ID del nivel a modificar.
 * @param {object} req.body - Datos nuevos.
 * @param {string} req.body.niv_nom - Nuevo nombre.
 * @param {number} req.body.salario_base - Nuevo salario.
 * @param {number} req.body.cargo_onapre_id - Nuevo cargo ONAPRE asociado.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarNivel = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await NivelSalarialService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un nivel salarial.
 * @param {number} req.params.id - ID del nivel a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarNivel = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await NivelSalarialService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}