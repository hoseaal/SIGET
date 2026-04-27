/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class NivelSalarialModel {
  static async getAll (cargo_onapre_id = null) {
    if (cargo_onapre_id) {
      const [rows] = await pool.query('SELECT * FROM niveles_salariales WHERE cargo_onapre_id = ?', [cargo_onapre_id])
      return rows
    }
    const [rows] = await pool.query('SELECT * FROM niveles_salariales')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query('SELECT * FROM niveles_salariales WHERE nivel_salarial_id = ?', [id])
    return rows[0] || null
  }

  static async create ({ nombre, salario_base, cargo_onapre_id }) {
    // Solo insertamos en niveles_salariales. El trigger after_insert_nivel
    // se encargará de crear el registro espejo en niveles_salariales_antiguos.
    const [resultNuevo] = await pool.query(
      'INSERT INTO niveles_salariales (nombre, salario_base, cargo_onapre_id) VALUES (?, ?, ?)',
      [nombre, salario_base, cargo_onapre_id]
    )

    return {
      nivel_salarial_id: resultNuevo.insertId,
      nombre, salario_base, cargo_onapre_id
    }
  }

  static async update (id, { nombre, salario_base, cargo_onapre_id }) {
    // Solo actualizamos niveles_salariales. Los triggers se encargarán
    // de sincronizar el nombre y cargo_onapre_id en la tabla antigua si cambian.
    const [result] = await pool.query(
      'UPDATE niveles_salariales SET nombre = ?, salario_base = ?, cargo_onapre_id = ? WHERE nivel_salarial_id = ?',
      [nombre, salario_base, cargo_onapre_id, id]
    )
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM niveles_salariales WHERE nivel_salarial_id = ?', [id])
    return result.affectedRows > 0
  }
}