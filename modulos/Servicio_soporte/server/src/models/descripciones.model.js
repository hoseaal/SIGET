import pool from '../utils/database.js'

export class DescripcionesModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM descripciones')
        return rows
    }
    static async create({nombre}){
        const[result] = await pool.query('INSERT INTO descripciones (nombre) VALUES (?)', [nombre])
        return {descripcion_id: result.insertId, nombre}
    }
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM descripciones WHERE id = ?', [id])
        return rows[0] || null
    }
    static async update(id, {nombre}){
        const[_] = await pool.query('UPDATE descripciones SET nombre = ? WHERE id = ?', [nombre, id])
        return {id, nombre}
    }
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM descripciones WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}