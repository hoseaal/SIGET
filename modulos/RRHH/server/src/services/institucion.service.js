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

  static generarSiglas(nombre) {
    const excluidos = ['de', 'la', 'el', 'las', 'los', 'y', 'para', 'en', 'un', 'una', 'del']
    const palabras = nombre.split(' ').filter(p => !excluidos.includes(p.toLowerCase()) && p.trim().length > 0)
    return palabras.map(p => p[0].toUpperCase()).join('')
  }

  static async getAll() {
    return await InstitucionModel.getAll()
  }

  static async create(data) {
    const siglas = this.generarSiglas(data.nombre)
    return await InstitucionModel.create({ nombre: data.nombre, siglas })
  }

  static async update(id, data) {
    const siglas = this.generarSiglas(data.nombre)
    return await InstitucionModel.update(id, { nombre: data.nombre, siglas })
  }

  static async delete(id) {
    return await InstitucionModel.delete(id)
  }
}
