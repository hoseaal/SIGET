import pool from '../utils/database.js'

export class DepartamentoModel {
    static async getAll() {
        // Hacemos JOIN con la tabla piso para mostrar el nombre del piso en la lista
        const [rows] = await pool.query(`
            SELECT d.*, p.nombre as nombre_piso 
            FROM departamentos d
            JOIN piso p ON d.piso_id = p.id
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM departamentos WHERE id = ?', [id])
        return rows[0] || null
    }

    static async getByName(nombre) {
        const [rows] = await pool.query('SELECT * FROM departamentos WHERE UPPER(TRIM(nombre)) = UPPER(TRIM(?))', [nombre])
        return rows[0] || null
    }

    static async create({ nombre, piso_id }) {
        const [result] = await pool.query(
            'INSERT INTO departamentos (nombre, piso_id) VALUES (?, ?)',
            [nombre, piso_id]
        )
        return { id: result.insertId, nombre, piso_id }
    }

    static async update(id, { nombre, piso_id }) {
        await pool.query(
            'UPDATE departamentos SET nombre = ?, piso_id = ? WHERE id = ?',
            [nombre, piso_id, id]
        )
        return { id, nombre, piso_id }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM departamentos WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}