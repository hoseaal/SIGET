import pool from '../utils/database.js'

export class PuertosModel {
    static async getAll() {
        // Hacemos JOIN con panel_pared y piso para dar un contexto completo en la tabla
        const [rows] = await pool.query(`
            SELECT p.*, pp.is_patch_panel1, pi.nombre as nombre_piso
            FROM puertos p
            JOIN panel_pared pp ON p.panel_id = pp.id
            JOIN piso pi ON pp.piso = pi.id
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM puertos WHERE id = ?', [id])
        return rows[0] || null
    }

    static async getByPuerto(nro_puerto, panel_id) {
        const [rows] = await pool.query('SELECT * FROM puertos WHERE nro_puerto = ? AND panel_id = ?', [nro_puerto, panel_id])
        return rows[0] || null
    }

    static async create({ nro_puerto, panel_id }) {
        const [result] = await pool.query(
            'INSERT INTO puertos (nro_puerto, panel_id) VALUES (?, ?)',
            [nro_puerto, panel_id]
        )
        return { id: result.insertId, nro_puerto, panel_id }
    }

    static async update(id, { nro_puerto, panel_id }) {
        await pool.query(
            'UPDATE puertos SET nro_puerto = ?, panel_id = ? WHERE id = ?',
            [nro_puerto, panel_id, id]
        )
        return { id, nro_puerto, panel_id }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM puertos WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}