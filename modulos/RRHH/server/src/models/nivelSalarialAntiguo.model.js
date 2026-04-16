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
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Insertar en niveles_salariales_antiguos
      const [resultAntiguo] = await connection.query(
        'INSERT INTO niveles_salariales_antiguos (nombre, salario_antiguo, cargo_onapre_id) VALUES (?, ?, ?)',
        [nombre, salario_antiguo, cargo_onapre_id]
      )

      // 2. Verificar si ya existe un registro espejo en niveles_salariales
      const [existeNuevo] = await connection.query(
        'SELECT nivel_salarial_id FROM niveles_salariales WHERE nombre = ? AND cargo_onapre_id = ?',
        [nombre, cargo_onapre_id]
      )

      // 3. Si no existe, insertar espejo en niveles_salariales
      if (existeNuevo.length === 0) {
        await connection.query(
          'INSERT INTO niveles_salariales (nombre, salario_base, cargo_onapre_id) VALUES (?, ?, ?)',
          [nombre, salario_antiguo, cargo_onapre_id]
        )
      }

      await connection.commit()
      return {
        nivel_salarial_antiguo_id: resultAntiguo.insertId,
        nombre, salario_antiguo, cargo_onapre_id
      }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async update (id, { nombre, salario_antiguo, cargo_onapre_id }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Obtener datos actuales antes de actualizar
      const [currentRows] = await connection.query(
        'SELECT nombre, cargo_onapre_id FROM niveles_salariales_antiguos WHERE nivel_salarial_antiguo_id = ?', [id]
      )
      const nombreAnterior = currentRows[0]?.nombre
      const cargoAnterior = currentRows[0]?.cargo_onapre_id

      // 2. Actualizar niveles_salariales_antiguos
      const [result] = await connection.query(
        'UPDATE niveles_salariales_antiguos SET nombre = ?, salario_antiguo = ?, cargo_onapre_id = ? WHERE nivel_salarial_antiguo_id = ?',
        [nombre, salario_antiguo, cargo_onapre_id, id]
      )

      // 3. Sincronizar nombre y cargo_onapre_id en niveles_salariales
      if (nombreAnterior) {
        const [espejoRows] = await connection.query(
          'SELECT nivel_salarial_id FROM niveles_salariales WHERE nombre = ? AND cargo_onapre_id = ?',
          [nombreAnterior, cargoAnterior]
        )
        if (espejoRows.length > 0) {
          await connection.query(
            'UPDATE niveles_salariales SET nombre = ?, cargo_onapre_id = ? WHERE nivel_salarial_id = ?',
            [nombre, cargo_onapre_id, espejoRows[0].nivel_salarial_id]
          )
        }
      }

      await connection.commit()
      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM niveles_salariales_antiguos WHERE nivel_salarial_antiguo_id = ?', [id])
    return result.affectedRows > 0
  }
}