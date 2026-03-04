/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class AntiguedadRegistroModel {
  
  /**
   * NUEVO: Método para validar la superposición de fechas
   * Devuelve TRUE si las fechas chocan con un registro existente.
   */
  static async verificarSuperposicion (fun_ide, ant_fin, ant_ffen, exclude_ant_ide = null) {
    // Si no hay fecha fin, lo tratamos como un rango infinito hacia el futuro para la validación
    const fechaFinComparacion = ant_ffen || '9999-12-31';
    
    let sql = `
      SELECT ant_ide 
      FROM tesant 
      WHERE fun_ide = ? 
        AND ant_fin <= ? 
        AND ? <= COALESCE(ant_ffen, '9999-12-31')
    `;
    
    // Parámetros: ID, FechaFinNueva, FechaInicioNueva
    const params = [fun_ide, fechaFinComparacion, ant_fin];

    // Si es un UPDATE, debemos ignorar el registro que se está editando a sí mismo
    if (exclude_ant_ide) {
      sql += ' AND ant_ide != ?';
      params.push(exclude_ant_ide);
    }

    const [rows] = await pool.query(sql, params);
    
    // Si encuentra al menos una fila, significa que hay solapamiento
    return rows.length > 0; 
  }

  static async getByFuncionarioId (fun_ide) {
    // TIMESTAMPDIFF(YEAR, inicio, fin) calcula años completos.
    // Si ant_ffen es NULL, usa CURDATE() (Fecha actual).
    const sql = `
      SELECT *, 
        TIMESTAMPDIFF(YEAR, ant_fin, COALESCE(ant_ffen, CURDATE())) AS anios,
        TIMESTAMPDIFF(MONTH, ant_fin, COALESCE(ant_ffen, CURDATE())) % 12 AS meses,
        DATEDIFF(
            COALESCE(ant_ffen, CURDATE()), 
            ant_fin + INTERVAL TIMESTAMPDIFF(MONTH, ant_fin, COALESCE(ant_ffen, CURDATE())) MONTH
        ) AS dias
      FROM tesant WHERE fun_ide = ?
      ORDER BY ant_fin ASC;
    `
    const [rows] = await pool.query(sql, [fun_ide])
    return rows
  }

  static async getById (id) {
    const sql = `
      SELECT *, TIMESTAMPDIFF(YEAR, ant_fin, COALESCE(ant_ffen, CURDATE())) as anios
      FROM tesant 
      WHERE ant_ide = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create ({ fun_ide, ant_fin, ant_ffen }) {
    // Si ant_ffen es undefined o vacío, se guarda como NULL
    const fechaFin = ant_ffen || null;
    
    // VALIDACIÓN: Comprobar solapamiento ANTES de insertar
    const existeSolapamiento = await this.verificarSuperposicion(fun_ide, ant_fin, fechaFin);
    
    if (existeSolapamiento) {
      throw new Error('Las fechas ingresadas se superponen con un periodo de antigüedad ya registrado para este funcionario.');
    }

    const [result] = await pool.query(
      'INSERT INTO tesant (fun_ide, ant_fin, ant_ffen) VALUES (?, ?, ?)',
      [fun_ide, ant_fin, fechaFin]
    );
    
    return { ant_ide: result.insertId, fun_ide, ant_fin, ant_ffen: fechaFin };
  }

  static async update (id, data) {
    // VALIDACIÓN: Si se está editando alguna fecha, debemos validar que no choque con los demás
    if (data.ant_fin !== undefined || data.ant_ffen !== undefined) {
      // Necesitamos el registro actual para saber qué estamos modificando
      const current = await this.getById(id);
      if (!current) throw new Error('Registro de antigüedad no encontrado');

      const fun_ide = data.fun_ide || current.fun_ide;
      const ant_fin = data.ant_fin || current.ant_fin;
      const ant_ffen = data.ant_ffen !== undefined ? (data.ant_ffen || null) : current.ant_ffen;

      const existeSolapamiento = await this.verificarSuperposicion(fun_ide, ant_fin, ant_ffen, id);
      
      if (existeSolapamiento) {
        throw new Error('Las fechas actualizadas se superponen con otro periodo de antigüedad ya registrado.');
      }
    }

    const [result] = await pool.query('UPDATE tesant SET ? WHERE ant_ide = ?', [data, id]);
    return result.affectedRows > 0;
  }

  static async delete (id) {
    const [result] = await pool.query('DELETE FROM tesant WHERE ant_ide = ?', [id]);
    return result.affectedRows > 0;
  }
}