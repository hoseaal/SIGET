/* eslint-disable camelcase */
import pool from '../utils/database.js'

export class HijoModel {

  static async getByFuncionarioId(empleado_id) {
    // Desactivar automáticamente a los hijos que tienen 18 años o más
    await pool.query(`
      UPDATE nucleo_familiar nf
      INNER JOIN sobreviviente s ON nf.familiar_id = s.familiar_id
      SET nf.estatus = 0
      WHERE s.empleado_id = ? 
        AND TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) >= 18 
        AND nf.estatus = 1
    `, [empleado_id]);

    // Obtener los hijos del empleado con su edad calculada
    const sql = `
      SELECT 
        nf.familiar_id as hijo_id,
        nf.nombres,
        nf.apellidos,
        nf.fecha_nacimiento,
        nf.estatus,
        nf.parentesco,
        TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) as edad
      FROM nucleo_familiar nf
      INNER JOIN sobreviviente s ON nf.familiar_id = s.familiar_id
      WHERE s.empleado_id = ?
      ORDER BY nf.fecha_nacimiento ASC
    `
    const [rows] = await pool.query(sql, [empleado_id])
    return rows
  }

  static async getById(id) {
    const sql = `
      SELECT 
        nf.familiar_id as hijo_id,
        nf.nombres,
        nf.apellidos,
        nf.fecha_nacimiento,
        nf.estatus,
        nf.parentesco,
        TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) as edad
      FROM nucleo_familiar nf
      WHERE nf.familiar_id = ?
    `
    const [rows] = await pool.query(sql, [id])
    return rows[0] || null
  }

  static async create({ empleado_id, nombres, apellidos, fecha_nacimiento }) {
    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar en nucleo_familiar con parentesco por defecto 'hijo'
      const [result] = await connection.query(
        'INSERT INTO nucleo_familiar (nombres, apellidos, fecha_nacimiento, parentesco, estatus) VALUES (?, ?, ?, ?, ?)',
        [nombres, apellidos, fecha_nacimiento, 'hijo', 1]
      );

      const familiar_id = result.insertId;

      // Crear relación en sobreviviente
      const [relacionResult] = await connection.query(
        'INSERT INTO sobreviviente (empleado_id, familiar_id) VALUES (?, ?)',
        [empleado_id, familiar_id]
      );

      await connection.commit();
      connection.release();

      return {
        hijo_id: familiar_id,
        empleado_id,
        nombres,
        apellidos,
        fecha_nacimiento,
        parentesco: 'hijo',
        estatus: 1
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id, data) {
    // Verificar si el familiar existe
    const [familiar] = await pool.query(
      'SELECT * FROM nucleo_familiar WHERE familiar_id = ?',
      [id]
    );

    if (familiar.length === 0) {
      return false;
    }

    // Extraer SOLO los campos que pertenecen a nucleo_familiar
    // Excluir empleado_id ya que no pertenece a esta tabla
    const updateData = {};
    const allowedFields = ['nombres', 'apellidos', 'fecha_nacimiento', 'estatus', 'parentesco'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    // Actualizar solo en nucleo_familiar
    const [result] = await pool.query(
      'UPDATE nucleo_familiar SET ? WHERE familiar_id = ?',
      [updateData, id]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Primero eliminar la relación en sobreviviente
      await connection.query(
        'DELETE FROM sobreviviente WHERE familiar_id = ?',
        [id]
      );

      // Luego eliminar el registro de nucleo_familiar
      const [result] = await connection.query(
        'DELETE FROM nucleo_familiar WHERE familiar_id = ?',
        [id]
      );

      await connection.commit();
      connection.release();

      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error en delete:', error);
      throw error;
    }
  }
}