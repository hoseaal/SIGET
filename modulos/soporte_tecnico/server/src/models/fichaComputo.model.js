import pool from '../utils/database.js'

const CAMPOS_DETALLE = [
  'nombre_equipo',
  'sistema_operativo',
  'version_office',
  'marca',
  'modelo',
  'serial',
  'ip',
  'mac_address',
  'anydesk',
  'elaborado_por',
  'observaciones'
]

function normalizarComponente (componente = {}) {
  return {
    tipo: componente.tipo || null,
    marca: componente.marca || null,
    modelo: componente.modelo || null,
    serial: componente.serial || null,
    capacidad: componente.capacidad || null,
    nro_bien: componente.nro_bien || null,
    observaciones: componente.observaciones || null
  }
}

export class FichaComputoModel {
  static async getByBimIde (bimIde) {
    const [detalles] = await pool.query(
      'SELECT * FROM bien_detalle_computo WHERE bim_ide = ? LIMIT 1',
      [bimIde]
    )

    const [componentes] = await pool.query(
      `SELECT id, bim_ide, tipo, marca, modelo, serial, capacidad, nro_bien,
              observaciones, created_at, updated_at
       FROM bien_componente
       WHERE bim_ide = ?
       ORDER BY id ASC`,
      [bimIde]
    )

    return {
      detalle: detalles[0] || null,
      componentes
    }
  }

  static async upsert (bimIde, datos = {}) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const valores = CAMPOS_DETALLE.map(campo => datos[campo] || null)

      await connection.query(
        `INSERT INTO bien_detalle_computo
          (bim_ide, ${CAMPOS_DETALLE.join(', ')})
         VALUES (?, ${CAMPOS_DETALLE.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE
           ${CAMPOS_DETALLE.map(campo => `${campo} = VALUES(${campo})`).join(', ')}`,
        [bimIde, ...valores]
      )

      await connection.query('DELETE FROM bien_componente WHERE bim_ide = ?', [bimIde])

      const componentes = Array.isArray(datos.componentes)
        ? datos.componentes.map(normalizarComponente)
        : []

      for (const componente of componentes) {
        await connection.query(
          `INSERT INTO bien_componente
            (bim_ide, tipo, marca, modelo, serial, capacidad, nro_bien, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bimIde,
            componente.tipo,
            componente.marca,
            componente.modelo,
            componente.serial,
            componente.capacidad,
            componente.nro_bien,
            componente.observaciones
          ]
        )
      }

      // Refresca la fecha de la ficha aunque solo hayan cambiado componentes.
      await connection.query(
        'UPDATE bien_detalle_computo SET updated_at = CURRENT_TIMESTAMP WHERE bim_ide = ?',
        [bimIde]
      )

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return await this.getByBimIde(bimIde)
  }

  static async delete (bimIde) {
    const [result] = await pool.query(
      'DELETE FROM bien_detalle_computo WHERE bim_ide = ?',
      [bimIde]
    )
    return result.affectedRows > 0
  }
}
