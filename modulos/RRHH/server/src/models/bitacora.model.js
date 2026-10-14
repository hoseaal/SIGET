import pool from '../utils/database.js'

// Máximo de caracteres que se guardan de un body JSON en la bitácora
const MAX_BODY_CHARS = 8000

export class BitacoraModel {

  static async ensureTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS bitacora (
        bit_id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        nombre_usuario VARCHAR(100) NULL,
        apellido_usuario VARCHAR(100) NULL,
        fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        registro_id_afectado VARCHAR(60) NULL COMMENT 'ID del registro afectado',
        tipo_cambio VARCHAR(40) NOT NULL DEFAULT 'ACTUALIZACION' COMMENT 'CREACION | ACTUALIZACION | ELIMINACION | OTRO',
        modulo VARCHAR(60) NULL,
        tabla VARCHAR(80) NULL COMMENT 'Recurso/tabla afectada, derivado de la URL',
        datos_antiguos LONGTEXT NULL COMMENT 'JSON con los valores previos',
        datos_nuevos LONGTEXT NULL COMMENT 'JSON con los valores nuevos',
        INDEX idx_bitacora_fecha (fecha_hora),
        INDEX idx_bitacora_usuario (usuario_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `
    await pool.query(sql)
  }

  static _serializar(valor) {
    if (valor == null) return null
    let texto
    try {
      texto = typeof valor === 'string' ? valor : JSON.stringify(valor)
    } catch {
      return null
    }
    if (texto.length > MAX_BODY_CHARS) {
      return texto.slice(0, MAX_BODY_CHARS) + '…[truncado]'
    }
    return texto
  }

  // Registra un evento. No lanza error para no afectar la operación original.
  static async registrar({
    usuario_id = null,
    nombre_usuario = null,
    apellido_usuario = null,
    registro_id_afectado = null,
    tipo_cambio = 'ACTUALIZACION',
    modulo = null,
    tabla = null,
    datos_antiguos = null,
    datos_nuevos = null
  } = {}) {
    const sql = `
      INSERT INTO bitacora
        (usuario_id, nombre_usuario, apellido_usuario, registro_id_afectado, tipo_cambio, modulo, tabla, datos_antiguos, datos_nuevos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      usuario_id,
      nombre_usuario,
      apellido_usuario,
      registro_id_afectado != null ? String(registro_id_afectado) : null,
      tipo_cambio,
      modulo,
      tabla,
      this._serializar(datos_antiguos),
      this._serializar(datos_nuevos)
    ]
    const [result] = await pool.query(sql, params)
    return result.insertId
  }

  static async getBitacora({ page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20))
    const offset = (pageNum - 1) * limitNum

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM bitacora')

    const [rows] = await pool.query(
      `SELECT bit_id, usuario_id, nombre_usuario, apellido_usuario, fecha_hora,
              registro_id_afectado, tipo_cambio, modulo, tabla, datos_antiguos, datos_nuevos
         FROM bitacora
        ORDER BY fecha_hora DESC, bit_id DESC
        LIMIT ? OFFSET ?`,
      [limitNum, offset]
    )

    return {
      data: rows,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0
      }
    }
  }
}
