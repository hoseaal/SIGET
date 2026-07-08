import pool from '../utils/database.js'

export class marcaModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM marca')
        return rows
    }
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM marca WHERE id = ?', [id])
        return rows[0] || null
    }
    static async create({ nombre }) {
        const [result] = await pool.query('INSERT INTO marca (nombre) VALUES (?)', [nombre])
        return { id: result.insertId, nombre }
    }
    static async update(id, { nombre }) {
        await pool.query('UPDATE marca SET nombre = ? WHERE id = ?', [nombre, id])
        return { id, nombre }
    }
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM marca WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}