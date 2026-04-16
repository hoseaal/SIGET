import { EncargoTemporalModel } from '../models/encargoTemporal.model.js'
import pool from '../utils/database.js'

export class EncargoTemporalService {

  static async _vincularNivelesSalariales (datos) {
    if (datos && datos.nivel_salarial_id) {
       const [oldLevelRows] = await pool.query(`
         SELECT nsa.nivel_salarial_antiguo_id
         FROM niveles_salariales_antiguos nsa
         INNER JOIN niveles_salariales ns ON ns.nombre = nsa.nombre
         WHERE ns.nivel_salarial_id = ?
       `, [datos.nivel_salarial_id])

       if (oldLevelRows && oldLevelRows.length > 0) {
          datos.nivel_salarial_antiguo_id = oldLevelRows[0].nivel_salarial_antiguo_id
       }
    }
  }

  /**
   * Retorna todos los encargos (activos e históricos) de un funcionario.
   */
  static async obtenerPorFuncionario (empleado_id) {
    if (!empleado_id) throw new Error('ID del funcionario requerido.')
    const historial = await EncargoTemporalModel.getByFuncionarioId(empleado_id)
    const activo = historial.find(e => e.estatus_encargo === 1) || null
    return { funcionario_id: empleado_id, encargo_activo: activo, historial }
  }

  /**
   * Retorna el encargo activo de un funcionario (o null).
   */
  static async obtenerActivo (empleado_id) {
    if (!empleado_id) throw new Error('ID del funcionario requerido.')
    return await EncargoTemporalModel.getActivoByFuncionarioId(empleado_id)
  }

  /**
   * Retorna un encargo por su ID.
   */
  static async obtenerPorId (id) {
    const encargo = await EncargoTemporalModel.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')
    return encargo
  }

  /**
   * Crea un nuevo encargo temporal activo para el funcionario.
   * Valida que no tenga ya uno activo.
   */
  static async crear (datos) {
    const { empleado_id, fecha_inicio, cargo_cet_id, cargo_onapre_id, nivel_salarial_id, direccion_id, division_id, unidad_id } = datos

    if (!empleado_id)       throw new Error('El ID del funcionario es requerido.')
    if (!fecha_inicio)      throw new Error('La fecha de inicio es requerida.')
    if (!cargo_cet_id)      throw new Error('El cargo CET es requerido.')
    if (!cargo_onapre_id)   throw new Error('El cargo ONAPRE es requerido.')
    if (!nivel_salarial_id) throw new Error('El nivel salarial es requerido.')
    if (!direccion_id)      throw new Error('La dirección es requerida.')
    if (!division_id)       throw new Error('La división es requerida.')
    if (!unidad_id)         throw new Error('La unidad es requerida.')

    await this._vincularNivelesSalariales(datos)
    return await EncargoTemporalModel.create(datos)
  }

  /**
   * Finaliza un encargo activo: registra fecha_fin.
   */
  static async finalizar (id, fecha_fin) {
    if (!fecha_fin) throw new Error('La fecha de finalización es requerida.')
    const encargo = await EncargoTemporalModel.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')
    return await EncargoTemporalModel.finalizar(id, fecha_fin)
  }

  /**
   * Actualiza campos de un encargo temporal.
   */
  static async actualizar (id, datos) {
    const encargo = await EncargoTemporalModel.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')
    await this._vincularNivelesSalariales(datos)
    return await EncargoTemporalModel.update(id, datos)
  }

  /**
   * Elimina un encargo temporal.
   */
  static async eliminar (id) {
    const encargo = await EncargoTemporalModel.getById(id)
    if (!encargo) throw new Error('Encargo temporal no encontrado.')
    return await EncargoTemporalModel.delete(id)
  }
}
