/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadRegistroModel {
  
  /**
   * NUEVO: Método para validar la superposición de fechas
   * Devuelve TRUE si las fechas chocan con un registro existente.
   */
  static async verificarSuperposicion (empleado_id, fecha_inicio, fecha_fin, exclude_ant_ide = null) {
    // Si no hay fecha fin, lo tratamos como un rango infinito hacia el futuro para la validación
    const fechaFinComparacion = fecha_fin || '9999-12-31';
    
    let sql = `
      SELECT antiguedad_id 
      FROM registros_antiguedades 
      WHERE empleado_id = ? 
        AND fecha_inicio <= ? 
        AND ? <= COALESCE(fecha_fin, '9999-12-31')
    `;
    
    // Parámetros: ID, FechaFinNueva, FechaInicioNueva
    const params = [empleado_id, fechaFinComparacion, fecha_inicio];

    // Si es un UPDATE, debemos ignorar el registro que se está editando a sí mismo
    if (exclude_ant_ide) {
      sql += ' AND antiguedad_id != ?';
      params.push(exclude_ant_ide);
    }

    const [rows] = await pool.query(sql, params);
    
    // Si encuentra al menos una fila, significa que hay solapamiento
    return rows.length > 0; 
  }

  static async getByFuncionarioId (empleado_id) {
    // TIMESTAMPDIFF(YEAR, inicio, fin) calcula años completos.
    // Si fecha_fin es NULL, usa CURDATE() (Fecha actual).
    const sql = `
      SELECT ra.*, 
        ci.nombre AS institucion_nombre,
        ci.siglas AS institucion_siglas,
        COALESCE(ci.nombre, ra.institucion_alternativa) AS institucion,
        TIMESTAMPDIFF(YEAR, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) AS anios,
        TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) % 12 AS meses,
        DATEDIFF(
            COALESCE(ra.fecha_fin, CURDATE()), 
            ra.fecha_inicio + INTERVAL TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) MONTH
        ) AS dias
      FROM registros_antiguedades ra
      LEFT JOIN catalogo_instituciones ci ON ra.id_institucion = ci.id_institucion
      WHERE ra.empleado_id = ?
      ORDER BY ra.fecha_inicio ASC;
    `
    const [rows] = await pool.query(sql, [empleado_id])
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT ra.*, 
        ci.nombre AS institucion_nombre,
        ci.siglas AS institucion_siglas,
        COALESCE(ci.nombre, ra.institucion_alternativa) AS institucion,
        TIMESTAMPDIFF(YEAR, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) as anios
      FROM registros_antiguedades ra
      LEFT JOIN catalogo_instituciones ci ON ra.id_institucion = ci.id_institucion
      WHERE ra.antiguedad_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create ({ empleado_id, fecha_inicio, fecha_fin, id_institucion, institucion_alternativa }) {
    // Si fecha_fin es undefined o vacío, se guarda como NULL
    const fechaFin = fecha_fin || null;
    
    // VALIDACIÓN: Comprobar solapamiento ANTES de insertar
    const existeSolapamiento = await this.verificarSuperposicion(empleado_id, fecha_inicio, fechaFin);
    
    if (existeSolapamiento) {
      throw new Error('Las fechas ingresadas se superponen con un periodo de antigüedad ya registrado para este funcionario.');
    }

    const [result] = await pool.query(
      'INSERT INTO registros_antiguedades (empleado_id, fecha_inicio, fecha_fin, id_institucion, institucion_alternativa) VALUES (?, ?, ?, ?, ?)',
      [empleado_id, fecha_inicio, fechaFin, id_institucion || null, institucion_alternativa || null]
    );
    
    return { 
      antiguedad_id: result.insertId, 
      empleado_id, 
      fecha_inicio, 
      fecha_fin: fechaFin, 
      id_institucion: id_institucion || null, 
      institucion_alternativa: institucion_alternativa || null 
    };
  }

  static async update (id, data) {
    // VALIDACIÓN: Si se está editando alguna fecha, debemos validar que no choque con los demás
    if (data.fecha_inicio !== undefined || data.fecha_fin !== undefined) {
      // Necesitamos el registro actual para saber qué estamos modificando
      const current = await this.getById(id);
      if (!current) throw new Error('Registro de antigüedad no encontrado');

      const empleado_id = data.empleado_id || current.empleado_id;
      const fecha_inicio = data.fecha_inicio || current.fecha_inicio;
      const fecha_fin = data.fecha_fin !== undefined ? (data.fecha_fin || null) : current.fecha_fin;

      const existeSolapamiento = await this.verificarSuperposicion(empleado_id, fecha_inicio, fecha_fin, id);
      
      if (existeSolapamiento) {
        throw new Error('Las fechas actualizadas se superponen con otro periodo de antigüedad ya registrado.');
      }
    }

    const [result] = await pool.query('UPDATE registros_antiguedades SET ? WHERE antiguedad_id = ?', [data, id]);
    return result.affectedRows > 0;
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM registros_antiguedades WHERE antiguedad_id = ?', [id]);
    return result.affectedRows > 0;
  }
}