import pool from '../utils/database.js'

export class PanelSoportModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM panel_soport')
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM panel_soport WHERE id = ?', [id])
        return rows[0] || null
    }

    static async create({ nro_bien, descripcion }) {
        const [result] = await pool.query(
            'INSERT INTO panel_soport (nro_bien, descripcion) VALUES (?, ?)',
            [nro_bien, descripcion]
        )
        return { id: result.insertId, nro_bien, descripcion }
    }

    static async update(id, { nro_bien, descripcion }) {
        await pool.query(
            'UPDATE panel_soport SET nro_bien = ?, descripcion = ? WHERE id = ?',
            [nro_bien, descripcion, id]
        )
        return { id, nro_bien, descripcion }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM panel_soport WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}