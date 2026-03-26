import { AntiguedadService } from '../services/antiguedad.service.js'

/**
 * Obtiene el tabulador completo de antigüedad.
 * @returns {Promise<object[]>} Lista de años y sus porcentajes.
 */
export const obtenerAntiguedades = async (req, res) => {
  try {
    const lista = await AntiguedadService.obtenerTodas()
    res.json(lista)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Busca un registro de antigüedad por ID.
 * @param {number} req.params.id - Identificador único (antiguedad_id).
 * @returns {Promise<object>} Objeto con los datos.
 */
export const obtenerAntiguedad = async (req, res) => {
  try {
    const { id } = req.params
    const antiguedad = await AntiguedadService.obtenerPorId(id)
    res.json(antiguedad)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Crea un nuevo escalafón de antigüedad.
 * @param {object} req.body - Datos del registro.
 * @param {number} req.body.anios_cumplidos - Años de servicio (Debe ser único).
 * @param {number} req.body.ant_act - Porcentaje a aplicar.
 * @returns {Promise<object>} Registro creado.
 */
export const crearAntiguedad = async (req, res) => {
  try {
    const nueva = await AntiguedadService.crear(req.body)
    res.status(201).json(nueva)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un registro para esa cantidad de años.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza los porcentajes de un año específico.
 * @param {number} req.params.id - ID del registro a modificar.
 * @param {object} req.body - Datos nuevos.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const actualizarAntiguedad = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await AntiguedadService.actualizar(id, req.body)
    res.json({ success: actualizado })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe otro registro con esa cantidad de años.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina un registro de antigüedad.
 * @param {number} req.params.id - ID a eliminar.
 * @returns {Promise<object>} Confirmación de éxito.
 */
export const eliminarAntiguedad = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await AntiguedadService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}