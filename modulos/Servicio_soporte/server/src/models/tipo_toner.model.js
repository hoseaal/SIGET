import pool from '../utils/database.js'

export class TipoTonerModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM tipo_toner')
        return rows
    }
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM tipo_toner WHERE id = ?', [id])
        return rows[0] || null
    }
    static async create({ nombre, descripcion }) {
        const [result] = await pool.query(
            'INSERT INTO tipo_toner (nombre, descripcion) VALUES (?, ?)', 
            [nombre, descripcion]
        )
        return { id: result.insertId, nombre, descripcion }
    }
    static async update(id, { nombre, descripcion }) {
        await pool.query(
            'UPDATE tipo_toner SET nombre = ?, descripcion = ? WHERE id = ?', 
            [nombre, descripcion, id]
        )
        return { id, nombre, descripcion }
    }
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM tipo_toner WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}