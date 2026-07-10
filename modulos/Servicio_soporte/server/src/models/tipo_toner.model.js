import pool from '../utils/database.js'

export class TipoTonerModel {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT t.*, ma.nombre as marca_nombre, mo.nombre as modelo_nombre 
            FROM tipo_toner t
            LEFT JOIN marca ma ON t.marca_id = ma.id
            LEFT JOIN modelo mo ON t.modelo_id = mo.id
        `)
        return rows
    }
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM tipo_toner WHERE id = ?', [id])
        return rows[0] || null
    }
    static async create({ nombre, descripcion, marca_id, modelo_id }) {
        const [result] = await pool.query(
            'INSERT INTO tipo_toner (nombre, descripcion, marca_id, modelo_id) VALUES (?, ?, ?, ?)', 
            [nombre, descripcion, marca_id, modelo_id]
        )
        return { id: result.insertId, nombre, descripcion, marca_id, modelo_id }
    }
    static async update(id, { nombre, descripcion, marca_id, modelo_id }) {
        await pool.query(
            'UPDATE tipo_toner SET nombre = ?, descripcion = ?, marca_id = ?, modelo_id = ? WHERE id = ?', 
            [nombre, descripcion, marca_id, modelo_id, id]
        )
        return { id, nombre, descripcion, marca_id, modelo_id }
    }
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM tipo_toner WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}