/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NivelSalarialAntiguoModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM niveles_salariales_antiguos')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM niveles_salariales_antiguos WHERE nivel_salarial_antiguo_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, salario_antiguo, cargo_onapre_id }) {
    // Solo insertamos en niveles_salariales_antiguos. El trigger after_insert_nivel_antiguo
    // se encargará de crear el registro espejo en niveles_salariales.
    const [resultAntiguo] = await pool.query(
      'INSERT INTO niveles_salariales_antiguos (nombre, salario_antiguo, cargo_onapre_id) VALUES (?, ?, ?)',
      [nombre, salario_antiguo, cargo_onapre_id]
    )

    return {
      nivel_salarial_antiguo_id: resultAntiguo.insertId,
      nombre, salario_antiguo, cargo_onapre_id
    }
  }

  static async update (id, { nombre, salario_antiguo, cargo_onapre_id }) {
    // Solo actualizamos niveles_salariales_antiguos. Los triggers se encargarán
    // de sincronizar el nombre y cargo_onapre_id en la tabla actual si cambian.
    const [result] = await pool.query(
      'UPDATE niveles_salariales_antiguos SET nombre = ?, salario_antiguo = ?, cargo_onapre_id = ? WHERE nivel_salarial_antiguo_id = ?',
      [nombre, salario_antiguo, cargo_onapre_id, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM niveles_salariales_antiguos WHERE nivel_salarial_antiguo_id = ?', [id])
    return result.affectedRows > 0
  }
}