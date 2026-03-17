/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class EquipoModel {
  static async getAll () {
    const [rows] = await pool.query('SELECT * FROM equipos_computo ORDER BY id_registro DESC')
    return rows
  }

  static async getById (id) {
    const [rows] = await pool.query(
      'SELECT * FROM equipos_computo WHERE id_registro = ?',
      [id]
    )
    return rows[0] || null
  }

  static async create (data) {
    const {
      nro_bien, nombre_equipo, direccion_oficina, tipo_equipo, puerto_switch,
      mobo_marca, mobo_modelo, mobo_serial, disco_marca, disco_serial,
      disco_capacidad_gb, ram_marca, ram_tipo, ram_capacidad_gb, ram_serial,
      fuente_marca, fuente_vatios, fuente_serial, fuente_bien_mueble,
      unidad_optica_marca, unidad_optica_serial, sistema_operativo,
      version_office, elaborado_por, observaciones
    } = data

    const query = `
      INSERT INTO equipos_computo (
        nro_bien, nombre_equipo, direccion_oficina, tipo_equipo, puerto_switch,
        mobo_marca, mobo_modelo, mobo_serial, disco_marca, disco_serial,
        disco_capacidad_gb, ram_marca, ram_tipo, ram_capacidad_gb, ram_serial,
        fuente_marca, fuente_vatios, fuente_serial, fuente_bien_mueble,
        unidad_optica_marca, unidad_optica_serial, sistema_operativo,
        version_office, elaborado_por, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      nro_bien, nombre_equipo, direccion_oficina, tipo_equipo, puerto_switch,
      mobo_marca, mobo_modelo, mobo_serial, disco_marca, disco_serial,
      disco_capacidad_gb, ram_marca, ram_tipo, ram_capacidad_gb, ram_serial,
      fuente_marca, fuente_vatios, fuente_serial, fuente_bien_mueble,
      unidad_optica_marca, unidad_optica_serial, sistema_operativo,
      version_office, elaborado_por, observaciones
    ]

    const [result] = await pool.query(query, values)
    return { id_registro: result.insertId, ...data }
  }

  static async update (id, data) {
    const fields = []
    const values = []

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    }

    if (fields.length === 0) return false

    values.push(id)

    const query = `UPDATE equipos_computo SET ${fields.join(', ')} WHERE id_registro = ?`

    const [result] = await pool.query(query, values)
    return result.affectedRows > 0
  }

  static async delete (id) {
    const [result] = await pool.query(
      'DELETE FROM equipos_computo WHERE id_registro = ?',
      [id]
    )
    return result.affectedRows > 0
  }
}
