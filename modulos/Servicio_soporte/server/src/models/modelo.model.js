import pool from '../utils/database.js' // Tu archivo de conexión

export class ModeloModel {
    static async getAll() {
        // Hacemos un JOIN para traer el nombre de la marca de una vez
        const [rows] = await pool.query(`
            SELECT m.*, ma.nombre as marca_nombre 
            FROM modelo m
            JOIN marca ma ON m.marca_id = ma.id
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT m.*, ma.nombre as marca_nombre FROM modelo m JOIN marca ma ON m.marca_id = ma.id WHERE m.id=?', [id])
        return rows[0] || null
    }

    static async create({ nombre, marca_id }) {
        const [result] = await pool.query(
            'INSERT INTO modelo (nombre, marca_id) VALUES (?, ?)',
            [nombre, marca_id]
        )
        return { id: result.insertId, nombre, marca_id }
    }

    static async update(id, { nombre, marca_id }) {
        await pool.query(
            'UPDATE modelo SET nombre = ?, marca_id = ? WHERE id = ?',
            [nombre, marca_id, id]
        )
        return { id, nombre, marca_id }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM modelo WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}