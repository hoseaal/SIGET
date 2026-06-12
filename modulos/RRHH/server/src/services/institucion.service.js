import { InstitucionModel } from '../models/institucion.model.js'

export class InstitucionService {
  /**
   * Obtiene las coincidencias de búsqueda de instituciones.
   * @param {string} search - Término de búsqueda.
   * @returns {Promise<object[]>} Lista de instituciones filtradas.
   */
  static async buscar (search) {
    // Si no hay término, podemos devolver los primeros 10
    const searchTerm = search || ''
    return await InstitucionModel.search(searchTerm)
  }
}
