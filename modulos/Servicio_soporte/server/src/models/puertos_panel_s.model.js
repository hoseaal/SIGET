import pool from '../utils/database.js'

export class PuertosPanelSModel {
    static async getAll() {
        // Hacemos un JOIN para que en la lista se vea la descripción del Panel (Directo/Escala)
        const [rows] = await pool.query(`
            SELECT pps.*, ps.id as panel_soport_id, ps.descripcion as panel_descripcion, ps.nro_bien as panel_nro_bien
            FROM puertos_panel_s pps
            JOIN panel_soport ps ON pps.panel_soport_id = ps.id
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM puertos_panel_s WHERE id = ?', [id])
        return rows[0] || null
    }

    static async getByPanel_id(panel_soport_id, nro_puerto) {
        const [rows] = await pool.query('SELECT * FROM puertos_panel_s WHERE panel_soport_id = ? AND nro_puerto = ?', [panel_soport_id, nro_puerto])
        return rows[0] || null
    }

    static async getByP_router(p_router) {
        const [rows] = await pool.query('SELECT * FROM puertos_panel_s WHERE p_router = ?', [p_router])
        return rows[0] || null
    }

    static async create({ nro_puerto, p_router, panel_soport_id }) {
        const [result] = await pool.query(
            'INSERT INTO puertos_panel_s (nro_puerto, p_router, panel_soport_id) VALUES (?, ?, ?)',
            [nro_puerto, p_router, panel_soport_id]
        )
        return { id: result.insertId, nro_puerto, p_router, panel_soport_id }
    }

    static async update(id, { nro_puerto, p_router, panel_soport_id }) {
        await pool.query(
            'UPDATE puertos_panel_s SET nro_puerto = ?, p_router = ?, panel_soport_id = ? WHERE id = ?',
            [nro_puerto, p_router, panel_soport_id, id]
        )
        return { id, nro_puerto, p_router, panel_soport_id }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM puertos_panel_s WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}